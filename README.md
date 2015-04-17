 [![Build Status](https://travis-ci.org/schamane/node-syslog.png)](https://travis-ci.org/schamane/node-syslog)

# Node-Syslog

v1.2.0

This is a node module (add-on) to work with syslog (system log) daemon on unix systems.
This module has been tested with:

* node.js v0.8.16
* version v0.9.3
* metalog
* syslog-ng 3.1.1

Read the [setMask wiki page](https://github.com/schamane/node-syslog/wiki/setMask) for using the `setMask` functionality.

The current version is compatible to node 0.8.x and higher. For older node.js versions, please use node-syslog v1.0.3

Node-syslog does not officially support Darwin OS and MS Windows but should work fine.

## Authors

*   Nazar Kulyk
*   Jeremy Childs
*   Sam Roberts
*   Ben Noordhuis

## Installation

### npm

      npm install node-syslog

### manual

      git clone
      node-gyp configure build

## Usage

For more information about how to use module check test.js

     var Syslog = require('node-syslog');

     Syslog.init("node-syslog", Syslog.LOG_PID | Syslog.LOG_ODELAY, Syslog.LOG_LOCAL0);
     Syslog.log(Syslog.LOG_INFO, "Node Syslog Module output " + new Date());
     Syslog.close();

Check your /var/log/messages (syslog, syslog-ng), or /var/log/everything/current (metalog) file for any test entry.
