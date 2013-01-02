#include "node-syslog.h"

using namespace v8;
using namespace node;

Persistent<FunctionTemplate> Syslog::constructor_template;
bool Syslog::connected_ = false;
char Syslog::name[1024];

void
Syslog::Initialize ( Handle<Object> target)
{
	Local<FunctionTemplate> t = FunctionTemplate::New();
	constructor_template = Persistent<FunctionTemplate>::New(t);
	constructor_template->InstanceTemplate()->SetInternalFieldCount(1);
	constructor_template->SetClassName(String::NewSymbol("Syslog"));
	
	
	NODE_SET_METHOD(constructor_template, "init", Syslog::init);
	NODE_SET_METHOD(constructor_template, "log", Syslog::log);
	NODE_SET_METHOD(constructor_template, "setMask", Syslog::setMask);
	NODE_SET_METHOD(constructor_template, "close", Syslog::destroy);
	
	target->Set(String::NewSymbol("Syslog"), constructor_template->GetFunction());
}

Handle<Value>
Syslog::init ( const Arguments& args)
{
	HandleScope scope;

	if (args.Length() == 0 || !args[0]->IsString()) {
		return ThrowException(Exception::Error(
			String::New("Must give daemonname string as argument")));
	}
	
	if (args.Length() < 3 ) {
		return ThrowException(Exception::Error(
			String::New("Must have atleast 3 params as argument")));
	}
	if(connected_)
		close();
	
	//open syslog
	args[0]->ToString()->WriteAscii((char*) &name);
	int options = args[1]->ToInt32()->Value();
	int facility = args[2]->ToInt32()->Value();
	open( options , facility );
	
	return scope.Close(Undefined());
}

struct log_request {
	Persistent<Function> cb;
	char *msg;
	uint32_t log_level;
};

static void UV_AfterLog(uv_work_t *req) {
	struct log_request *log_req = (struct log_request *)(req->data);

	log_req->cb.Dispose(); // is this necessary?
	free(log_req->msg);
	free(log_req);
	delete req;
}

static void UV_Log(uv_work_t *req) {
	struct log_request *log_req = (struct log_request *)(req->data);
	char *msg = log_req->msg;
	
	syslog(log_req->log_level, "%s", msg);
	return;
}

Handle<Value>
Syslog::log ( const Arguments& args)
{
	HandleScope scope;
	Local<Function> cb = Local<Function>::Cast(args[3]);
	
	struct log_request * log_req = (struct log_request *)
		calloc(1, sizeof(struct log_request));
	
	if(!log_req) {
		V8::LowMemoryNotification();
		return ThrowException(Exception::Error(
			String::New("Could not allocate enought memory")));
	}
	
	if(!connected_)
		return ThrowException(Exception::Error(
			String::New("init method has to be called befor syslog")));
	
	String::AsciiValue msg(args[1]);
	uint32_t log_level = args[0]->Int32Value();
	
	log_req->cb = Persistent<Function>::New(cb);
	log_req->msg = strdup(*msg);
	log_req->log_level = log_level;

	uv_work_t *work_req = new uv_work_t();
	work_req->data = log_req;
	int status = uv_queue_work(uv_default_loop(), work_req, UV_Log,(uv_after_work_cb) UV_AfterLog);
	assert(status == 0);

	return scope.Close(Undefined());
}

Handle<Value>
Syslog::destroy ( const Arguments& args)
{
	close();
	return Undefined();
}

void
Syslog::open ( int option, int facility)
{
	openlog( name, option, facility );
	connected_ = true;
}

Handle<Value>
Syslog::setMask ( const Arguments& args)
{
	bool upTo = false;
	int mask, value;
	HandleScope scope;
	
	if (args.Length() < 1) {
		return ThrowException(Exception::Error(String::New("You must provide an mask")));
	}
	
	if (!args[0]->IsNumber()) {
		return ThrowException(Exception::Error(String::New("First parameter (mask) should be numeric")));
	}
	
	if (args.Length() == 2 && !args[1]->IsBoolean()) {
		return ThrowException(Exception::Error(String::New("Second parameter (upTo) should be boolean")));
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
	
	return scope.Close(Integer::New( setlogmask(mask) ));
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
