# Node-Syslog

v1.1.3

This is an node module (add-on) to work with system log daemon on unix systems.
Module is tested with node.js v0.3.3 and metalog, syslog-ng 3.1.1.

Read Wiki "setMask" page for more information about how to use "setMask" functionality.


Current version is compatible to node 0.4.x and higher versions. For older nodejs versions please use node-syslog v1.0.2

Node-syslog doesn't support Darwin OS and MS Windows, but should work fine with this OSes.

## Authors

*   Nazar Kulyk
*   Jeremy Childs

## Installation

### npm

      npm install node-syslog

### manual

      git clone
      node-waf configure build

## Usage

For more inforamtion about how to use module check test.js

     #!/usr/bin/env node
     
     var Syslog = require('node-syslog');
     
     Syslog.init("node-syslog", Syslog.LOG_PID | Syslog.LOG_ODELAY, Syslog.LOG_LOCAL0);
     Syslog.log(Syslog.LOG_INFO, "Node Syslog Module output " + new Date());
     
Check your /var/log/messages (syslog, syslog-ng), or /var/log/everything/current (metalog) file for any test entry.
