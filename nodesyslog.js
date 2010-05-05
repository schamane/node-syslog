(function(){
var node_syslog = require('./node-syslog'),
    Syslog = node_syslog.Syslog;;

process.addListener('exit', function() {
    Syslog.close();
});

exports.Syslog = Syslog;

})();
