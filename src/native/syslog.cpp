#include <napi.h>
#include <syslog.h>
#include <string.h>
#include <stdlib.h>

class SyslogNative : public Napi::ObjectWrap<SyslogNative> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    SyslogNative(const Napi::CallbackInfo& info);

private:
    static Napi::FunctionReference constructor;
    
    Napi::Value Openlog(const Napi::CallbackInfo& info);
    Napi::Value Syslog(const Napi::CallbackInfo& info);
    Napi::Value Closelog(const Napi::CallbackInfo& info);
    Napi::Value GetFacilities(const Napi::CallbackInfo& info);
    Napi::Value GetLevels(const Napi::CallbackInfo& info);
    Napi::Value GetOptions(const Napi::CallbackInfo& info);
};

Napi::FunctionReference SyslogNative::constructor;

Napi::Object SyslogNative::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "SyslogNative", {
        InstanceMethod("openlog", &SyslogNative::Openlog),
        InstanceMethod("syslog", &SyslogNative::Syslog),
        InstanceMethod("closelog", &SyslogNative::Closelog),
        StaticMethod("getFacilities", &SyslogNative::GetFacilities),
        StaticMethod("getLevels", &SyslogNative::GetLevels),
        StaticMethod("getOptions", &SyslogNative::GetOptions),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("SyslogNative", func);
    return exports;
}

SyslogNative::SyslogNative(const Napi::CallbackInfo& info) : Napi::ObjectWrap<SyslogNative>(info) {
    // Constructor logic if needed
}

Napi::Value SyslogNative::Openlog(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 3) {
        Napi::TypeError::New(env, "Expected 3 arguments: ident, option, facility")
            .ThrowAsJavaScriptException();
        return env.Null();
    }
    
    if (!info[0].IsString() || !info[1].IsNumber() || !info[2].IsNumber()) {
        Napi::TypeError::New(env, "Wrong argument types").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    std::string ident = info[0].As<Napi::String>().Utf8Value();
    int32_t option = info[1].As<Napi::Number>().Int32Value();
    int32_t facility = info[2].As<Napi::Number>().Int32Value();
    
    openlog(ident.c_str(), option, facility);
    
    return env.Null();
}

Napi::Value SyslogNative::Syslog(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected 2 arguments: priority, message")
            .ThrowAsJavaScriptException();
        return env.Null();
    }
    
    if (!info[0].IsNumber() || !info[1].IsString()) {
        Napi::TypeError::New(env, "Wrong argument types").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    int32_t priority = info[0].As<Napi::Number>().Int32Value();
    std::string message = info[1].As<Napi::String>().Utf8Value();
    
    syslog(priority, "%s", message.c_str());
    
    return env.Null();
}

Napi::Value SyslogNative::Closelog(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    closelog();
    return env.Null();
}

Napi::Value SyslogNative::GetFacilities(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Object facilities = Napi::Object::New(env);
    
    facilities.Set("LOG_KERN", Napi::Number::New(env, LOG_KERN));
    facilities.Set("LOG_USER", Napi::Number::New(env, LOG_USER));
    facilities.Set("LOG_MAIL", Napi::Number::New(env, LOG_MAIL));
    facilities.Set("LOG_DAEMON", Napi::Number::New(env, LOG_DAEMON));
    facilities.Set("LOG_AUTH", Napi::Number::New(env, LOG_AUTH));
    facilities.Set("LOG_SYSLOG", Napi::Number::New(env, LOG_SYSLOG));
    facilities.Set("LOG_LPR", Napi::Number::New(env, LOG_LPR));
    facilities.Set("LOG_NEWS", Napi::Number::New(env, LOG_NEWS));
    facilities.Set("LOG_UUCP", Napi::Number::New(env, LOG_UUCP));
    facilities.Set("LOG_CRON", Napi::Number::New(env, LOG_CRON));
    facilities.Set("LOG_AUTHPRIV", Napi::Number::New(env, LOG_AUTHPRIV));
    facilities.Set("LOG_FTP", Napi::Number::New(env, LOG_FTP));
    facilities.Set("LOG_LOCAL0", Napi::Number::New(env, LOG_LOCAL0));
    facilities.Set("LOG_LOCAL1", Napi::Number::New(env, LOG_LOCAL1));
    facilities.Set("LOG_LOCAL2", Napi::Number::New(env, LOG_LOCAL2));
    facilities.Set("LOG_LOCAL3", Napi::Number::New(env, LOG_LOCAL3));
    facilities.Set("LOG_LOCAL4", Napi::Number::New(env, LOG_LOCAL4));
    facilities.Set("LOG_LOCAL5", Napi::Number::New(env, LOG_LOCAL5));
    facilities.Set("LOG_LOCAL6", Napi::Number::New(env, LOG_LOCAL6));
    facilities.Set("LOG_LOCAL7", Napi::Number::New(env, LOG_LOCAL7));
    
    return facilities;
}

Napi::Value SyslogNative::GetLevels(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Object levels = Napi::Object::New(env);
    
    levels.Set("LOG_EMERG", Napi::Number::New(env, LOG_EMERG));
    levels.Set("LOG_ALERT", Napi::Number::New(env, LOG_ALERT));
    levels.Set("LOG_CRIT", Napi::Number::New(env, LOG_CRIT));
    levels.Set("LOG_ERR", Napi::Number::New(env, LOG_ERR));
    levels.Set("LOG_WARNING", Napi::Number::New(env, LOG_WARNING));
    levels.Set("LOG_NOTICE", Napi::Number::New(env, LOG_NOTICE));
    levels.Set("LOG_INFO", Napi::Number::New(env, LOG_INFO));
    levels.Set("LOG_DEBUG", Napi::Number::New(env, LOG_DEBUG));
    
    return levels;
}

Napi::Value SyslogNative::GetOptions(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Object options = Napi::Object::New(env);
    
    options.Set("LOG_PID", Napi::Number::New(env, LOG_PID));
    options.Set("LOG_CONS", Napi::Number::New(env, LOG_CONS));
    options.Set("LOG_ODELAY", Napi::Number::New(env, LOG_ODELAY));
    options.Set("LOG_NDELAY", Napi::Number::New(env, LOG_NDELAY));
    options.Set("LOG_NOWAIT", Napi::Number::New(env, LOG_NOWAIT));
    options.Set("LOG_PERROR", Napi::Number::New(env, LOG_PERROR));
    
    return options;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return SyslogNative::Init(env, exports);
}

NODE_API_MODULE(syslog_native, Init)