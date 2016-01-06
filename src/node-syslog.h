#ifndef syslog_h
#define syslog_h

#include <nan.h>
#include <syslog.h>

class Syslog {

    public:
	static void Initialize ( v8::Handle<v8::Object> target);

    protected:
	static void init (const Nan::FunctionCallbackInfo<v8::Value>& info);
	static void log (const Nan::FunctionCallbackInfo<v8::Value>& info);
	static void setMask (const Nan::FunctionCallbackInfo<v8::Value>& info);
	static void destroy (const Nan::FunctionCallbackInfo<v8::Value>& info);

    private:
	static void open(int, int);
	static void close();
	static bool connected_;
        static char name[1024];
};

#endif // syslog_h
