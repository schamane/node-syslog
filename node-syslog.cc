#include "node-syslog.h"

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
    
    if(connected_)
	close();
    
    //open syslog
    args[0]->ToString()->WriteAscii((char*) &name);
    open();
    
    return Undefined();
}   

Handle<Value>
Syslog::log ( const Arguments& args)
{
    HandleScope scope;
    
    if(!connected_)
	return ThrowException(Exception::Error(                                                                                                   
	    String::New("init method has to be called befor syslog")));

    String::AsciiValue msg(args[0]);
    syslog(LOG_INFO, "%s", *msg);
    
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
Syslog::open ()
{
    openlog( name, LOG_PID, LOG_DAEMON);
    connected_ = true;
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
