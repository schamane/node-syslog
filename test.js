var sys = require('sys'),
    Syslog = require('./nodesyslog').Syslog;
    
    
    Syslog.init("node-syslog-test");
    Syslog.log("Hi World!!!");
    Syslog.log("Second test:"+new Date());
    //now log under other name
    Syslog.init("node-syslog-default");
    Syslog.log("new log test");
    

