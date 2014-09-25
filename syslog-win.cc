// Stub module on Windows, so dependency builds, and syslog can be detected at
// run-time as unsupported

#include <node.h>

static void Initialize ( v8::Handle<v8::Object> target)
{
}

NODE_MODULE(syslog, Initialize);
