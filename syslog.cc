#include "syslog.h"

using namespace v8;
using namespace node;

Persistent<FunctionTemplate> Syslog::constructor_template;
bool Syslog::connected_ = false;
char Syslog::name[1024];

void
Syslog::Initialize ( Handle<Object> target)
{
	HandleScope scope;
	
	Local<FunctionTemplate> t = FunctionTemplate::New();
	constructor_template = Persistent<FunctionTemplate>::New(t);
	constructor_template->InstanceTemplate()->SetInternalFieldCount(1);
	constructor_template->SetClassName(String::NewSymbol("Syslog"));
	
	
	NODE_SET_METHOD(constructor_template, "init", Syslog::init);
	NODE_SET_METHOD(constructor_template, "log", Syslog::log);
	NODE_SET_METHOD(constructor_template, "setmask", Syslog::setmask);
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
	
	return Undefined();
}

struct log_request {
	Persistent<Function> cb;
	char *msg;
	uint32_t log_level;
};

static int EIO_AfterLog( eio_req *req) {
	ev_unref(EV_DEFAULT_UC);
	HandleScope scope;
	
	struct log_request *log_req = (struct log_request *)(req->data);
	
	free(log_req);
	return 0;
}

static int EIO_Log(eio_req *req) {
	struct log_request *log_req = (struct log_request *)(req->data);
	char *msg = log_req->msg;
	
	syslog(log_req->log_level, "%s", msg);
	
	req->result = 0;
	return 0;
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
	
	eio_custom(EIO_Log, EIO_PRI_DEFAULT, EIO_AfterLog, log_req);
	
	ev_ref(EV_DEFAULT_UC);
	
	return Undefined();
}

Handle<Value>
Syslog::destroy ( const Arguments& args)
{
	HandleScope scope;
	
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
Syslog::setmask ( const Arguments& args)
{
  if (args.Length() < 1) {
      return ThrowException(Exception::Error(String::New("You must provide an mask")));
  }
  if (!args[0]->IsNumber()) {
      return ThrowException(Exception::Error(String::New("Mask must be numeric")));
  }

  setlogmask(args[0]->Int32Value());
}

void
Syslog::close ()
{
	if(connected_) {
		closelog();
		connected_ = false;
	}
}


extern "C" void
init (Handle<Object> target)
{
	HandleScope scope;
	Syslog::Initialize(target);
}
