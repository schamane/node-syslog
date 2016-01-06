#include <nan.h>
#include "node-syslog.h"

bool Syslog::connected_ = false;
char Syslog::name[1024];

void
Syslog::Initialize (v8::Local<v8::Object> exports)
{
	exports->Set(Nan::New("init").ToLocalChecked(),
		Nan::New<v8::FunctionTemplate>(Syslog::init)->GetFunction());
	exports->Set(Nan::New("log").ToLocalChecked(),
		Nan::New<v8::FunctionTemplate>(Syslog::log)->GetFunction());
	exports->Set(Nan::New("setMask").ToLocalChecked(),
		Nan::New<v8::FunctionTemplate>(Syslog::setMask)->GetFunction());
	exports->Set(Nan::New("close").ToLocalChecked(),
		Nan::New<v8::FunctionTemplate>(Syslog::destroy)->GetFunction());
}

void
Syslog::init (const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	Nan::HandleScope scope;

	if (info.Length() == 0 || !info[0]->IsString()) {
		return Nan::ThrowError("Must give daemonname string as argument");
	}

	if (info.Length() < 3 ) {
		return Nan::ThrowError("Must have at least 3 params as argument");
	}
	if(connected_)
		close();

	//open syslog
				info[0]->ToString()->WriteUtf8(name);
	int options = info[1]->ToInt32()->Value();
	int facility = info[2]->ToInt32()->Value();
	open( options , facility );
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

void
Syslog::log (const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	Nan::HandleScope scope;

	uint32_t log_level = info[0]->Int32Value();
	Nan::Utf8String msg(info[1]);

	if(!connected_)
		return Nan::ThrowError("Init method has to be called before syslog");

	if(!info[1]->IsString()) {
		return Nan::ThrowTypeError("Log message must be a string");
	}

	struct log_request * log_req = (struct log_request *) malloc(
		sizeof(*log_req) + msg.length());

	if(!log_req) {
		return Nan::ThrowError("Could not allocate enough memory");
	}

	log_req->work.data = log_req;
	log_req->log_level = log_level;
	strcpy(&log_req->msg[0], *msg);

	int status = uv_queue_work(uv_default_loop(), &log_req->work,
		UV_Log, UV_AfterLog);
	assert(status == 0);
}

void
Syslog::destroy (const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	Nan::HandleScope scope;
	close();
}

void
Syslog::open ( int option, int facility)
{
	openlog( name, option, facility );
	connected_ = true;
}

void
Syslog::setMask (const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	bool upTo = false;
	int mask, value;
	Nan::HandleScope scope;

	if (info.Length() < 1) {
		return Nan::ThrowError("You must provide an mask");
	}

	if (!info[0]->IsNumber()) {
		return Nan::ThrowTypeError("First parameter (mask) should be numeric");
	}

	if (info.Length() == 2 && !info[1]->IsBoolean()) {
		return Nan::ThrowTypeError("Second parameter (upTo) should be boolean");
	}

	if (info.Length() == 2 && info[1]->IsBoolean()) {
		upTo = true;
	}

	value = info[0]->Int32Value();
	if(upTo) {
		mask = LOG_UPTO(value);
	} else {
		mask = LOG_MASK(value);
	}

	info.GetReturnValue().Set(setlogmask(mask));
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
