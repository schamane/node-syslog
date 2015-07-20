#include "node-syslog.h"

using namespace v8;

bool Syslog::connected_ = false;
char Syslog::name[1024];

void
Syslog::Initialize (Handle<Object> target)
{
	target->Set(NanNew<String>("init"),
		NanNew<FunctionTemplate>(Syslog::init)->GetFunction());
	target->Set(NanNew<String>("log"),
		NanNew<FunctionTemplate>(Syslog::log)->GetFunction());
	target->Set(NanNew<String>("setMask"),
		NanNew<FunctionTemplate>(Syslog::setMask)->GetFunction());
	target->Set(NanNew<String>("close"),
		NanNew<FunctionTemplate>(Syslog::destroy)->GetFunction());
}

NAN_METHOD(Syslog::init)
{
	NanScope();

	if (args.Length() == 0 || !args[0]->IsString()) {
		return NanThrowError("Must give daemonname string as argument");
	}

	if (args.Length() < 3 ) {
		return NanThrowError("Must have at least 3 params as argument");
	}
	if(connected_)
		close();

	//open syslog
	args[0]->ToString()->WriteUtf8(name);
	int options = args[1]->ToInt32()->Value();
	int facility = args[2]->ToInt32()->Value();
	open(options, facility);

	NanReturnUndefined();
}

struct log_request {
	uv_work_t work;
	uint32_t log_level;
	char msg[1]; // variable length msg buffer
};

static void UV_AfterLog(uv_work_t *req, int) {
	free(req->data);
}

static void UV_Log(uv_work_t *req) {
	struct log_request *log_req = (struct log_request *)(req->data);
	syslog(log_req->log_level, "%s", log_req->msg);
	return;
}

NAN_METHOD(Syslog::log)
{
	NanScope();

	uint32_t log_level = args[0]->Int32Value();
	String::Utf8Value msg(args[1]);

	if(!connected_)
		return NanThrowError("Init method has to be called before syslog");

	if(!args[1]->IsString()) {
		return NanThrowError("Log message must be a string");
	}

	struct log_request * log_req = (struct log_request *) malloc(
		sizeof(*log_req) + msg.length());

	if(!log_req) {
		return NanThrowError("Could not allocate enough memory");
	}

	log_req->work.data = log_req;
	log_req->log_level = log_level;
	strcpy(&log_req->msg[0], *msg);

	int status = uv_queue_work(uv_default_loop(), &log_req->work,
		UV_Log, UV_AfterLog);
	assert(status == 0);

	NanReturnUndefined();
}

NAN_METHOD(Syslog::destroy)
{
	NanScope();
	close();
	NanReturnUndefined();
}

void
Syslog::open ( int option, int facility)
{
	openlog( name, option, facility );
	connected_ = true;
}

NAN_METHOD(Syslog::setMask)
{
	NanScope();

	bool upTo = false;
	int mask, value;

	if (args.Length() < 1) {
		return NanThrowError("You must provide an mask");
	}

	if (!args[0]->IsNumber()) {
		return NanThrowError("First parameter (mask) should be numeric");
	}

	if (args.Length() == 2 && !args[1]->IsBoolean()) {
		return NanThrowError("Second parameter (upTo) should be boolean");
	}

	if (args.Length() == 2 && args[1]->IsBoolean()) {
		upTo = true;
	}

	value = args[0]->Int32Value();
	if(upTo) {
		mask = LOG_UPTO(value);
	} else {
		mask = LOG_MASK(value);
	}

	NanReturnValue(NanNew<Number>(setlogmask(mask)));
}

void
Syslog::close ()
{
	if(connected_) {
		closelog();
		connected_ = false;
	}
}

NODE_MODULE(syslog, Syslog::Initialize);
