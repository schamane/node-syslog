#include "node-syslog.h"
#include "compat-inl.h"

using namespace v8;
using compat::ReturnType;
using compat::ArgumentType;
using compat::ReturnableHandleScope;

#if COMPAT_NODE_VERSION < 12
static ReturnType ThrowException(const ArgumentType& args, const char* m) {
    return v8::ThrowException(v8::Exception::Error(
		v8::String::New(m)
		));
}
#else
static ReturnType ThrowException(const ArgumentType& args, const char* m) {
    args.GetIsolate()->ThrowException(v8::Exception::Error(
		v8::String::NewFromUtf8(args.GetIsolate(), m)
		));
}
#endif

bool Syslog::connected_ = false;
char Syslog::name[1024];

void
Syslog::Initialize ( Handle<Object> target)
{
	NODE_SET_METHOD(target, "init", Syslog::init);
	NODE_SET_METHOD(target, "log", Syslog::log);
	NODE_SET_METHOD(target, "setMask", Syslog::setMask);
	NODE_SET_METHOD(target, "close", Syslog::destroy);
}

ReturnType
Syslog::init ( const ArgumentType& args)
{
	ReturnableHandleScope scope(args);

	if (args.Length() == 0 || !args[0]->IsString()) {
		return ThrowException(args, "Must give daemonname string as argument");
	}
	
	if (args.Length() < 3 ) {
		return ThrowException(args, "Must have at least 3 params as argument");
	}
	if(connected_)
		close();
	
	//open syslog
        args[0]->ToString()->WriteUtf8(name);
	int options = args[1]->ToInt32()->Value();
	int facility = args[2]->ToInt32()->Value();
	open( options , facility );

	return scope.Return();
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

ReturnType
Syslog::log ( const ArgumentType& args)
{
	ReturnableHandleScope scope(args);
	uint32_t log_level = args[0]->Int32Value();
	String::Utf8Value msg(args[1]);

	if(!connected_)
		return ThrowException(args, "Init method has to be called before syslog");
	
	if(!args[1]->IsString()) {
		return ThrowException(args, "Log message must be a string");
	}

	struct log_request * log_req = (struct log_request *) malloc(
		sizeof(*log_req) + msg.length());

	if(!log_req) {
		return ThrowException(args, "Could not allocate enough memory");
	}

	log_req->work.data = log_req;
	log_req->log_level = log_level;
	strcpy(&log_req->msg[0], *msg);

	int status = uv_queue_work(uv_default_loop(), &log_req->work,
		UV_Log, UV_AfterLog);
	assert(status == 0);

	return scope.Return();
}

ReturnType
Syslog::destroy ( const ArgumentType& args)
{
	ReturnableHandleScope scope(args);
	close();
	return scope.Return();
}

void
Syslog::open ( int option, int facility)
{
	openlog( name, option, facility );
	connected_ = true;
}

ReturnType
Syslog::setMask ( const ArgumentType& args)
{
	bool upTo = false;
	int mask, value;
	ReturnableHandleScope scope(args);
	
	if (args.Length() < 1) {
		return ThrowException(args, "You must provide an mask");
	}
	
	if (!args[0]->IsNumber()) {
		return ThrowException(args, "First parameter (mask) should be numeric");
	}
	
	if (args.Length() == 2 && !args[1]->IsBoolean()) {
		return ThrowException(args, "Second parameter (upTo) should be boolean");
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

	return scope.Return(setlogmask(mask));
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
