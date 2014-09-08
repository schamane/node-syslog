#ifndef syslog_h
#define syslog_h

#include <node.h>
#include <node_object_wrap.h>
#include <node_version.h>
#include <v8.h>
#include <syslog.h>
#include <stdlib.h>
#include <string.h>
#include <uv.h>

#include "compat.h"

namespace C = ::compat;

class Syslog {

    public:
	static void Initialize ( v8::Handle<v8::Object> target);
	    
    protected:
	static C::ReturnType init   (const C::ArgumentType& args);
	static C::ReturnType log (const C::ArgumentType& args);
	static C::ReturnType setMask (const C::ArgumentType& args);
	static C::ReturnType destroy (const C::ArgumentType& args);
	
    private:
	static void open(int, int);
	static void close();
	static bool connected_;
        static char name[1024];
};

#endif // syslog_h
