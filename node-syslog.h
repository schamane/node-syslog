#ifndef syslog_h
#define syslog_h

#include <node.h>
#include <nan.h>
#include <node_object_wrap.h>
#include <node_version.h>
#include <v8.h>
#include <syslog.h>
#include <stdlib.h>
#include <string.h>
#include <uv.h>

class Syslog {
	public:
		static void Initialize(v8::Handle<v8::Object> target);

	protected:
		static NAN_METHOD(init);
		static NAN_METHOD(log);
		static NAN_METHOD(setMask);
		static NAN_METHOD(destroy);

	private:
		static void open(int, int);
		static void close();
		static bool connected_;
		static char name[1024];
};

#endif // syslog_h
