var Syslog = require('./node-syslog');

Syslog.init("node-syslog-test", Syslog.LOG_PID | Syslog.LOG_ODELAY, Syslog.LOG_LOCAL0);
Syslog.log(Syslog.LOG_INFO, "news info log test");
Syslog.log(Syslog.LOG_ERR, "news log error test");
Syslog.log(Syslog.LOG_DEBUG, "Last log message as debug: " + new Date());
Syslog.close();

