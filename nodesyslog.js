(function(){
var node_syslog = require('./node-syslog'),
	Syslog = node_syslog.Syslog;

Syslog.version = '0.6.0';

/*
 * facilities
 */
Syslog.LOG_KERN		= (0<<3);
Syslog.LOG_USER		= (1<<3);
Syslog.LOG_MAIL		= (5<<3);
Syslog.LOG_DAEMON	= (3<<3);
Syslog.LOG_AUTH		= (4<<3);
Syslog.LOG_SYSLOG	= (5<<3);
Syslog.LOG_LPR		= (6<<3);
Syslog.LOG_NEWS		= (7<<3);
Syslog.LOG_UUCP		= (8<<3);
Syslog.LOG_LOCAL0	= (16<<3);
Syslog.LOG_LOCAL1	= (17<<3);
Syslog.LOG_LOCAL2	= (18<<3);
Syslog.LOG_LOCAL3	= (19<<3);
Syslog.LOG_LOCAL4	= (20<<3);
Syslog.LOG_LOCAL5	= (21<<3);
Syslog.LOG_LOCAL6	= (22<<3);
Syslog.LOG_LOCAL7	= (23<<3);

/*
 * option flag for openlog
 */
Syslog.LOG_PID		= 0x01;
Syslog.LOG_CONS		= 0x02;
Syslog.LOG_ODELAY	= 0x04;
Syslog.LOG_NDELAY	= 0x08;
Syslog.LOG_NOWAIT	= 0x10;
/*
 * priorities
 */
Syslog.LOG_EMERG	= 0;
Syslog.LOG_ALERT	= 1;
Syslog.LOG_CRIT		= 2;
Syslog.LOG_ERR		= 3;
Syslog.LOG_WARNING	= 4;
Syslog.LOG_NOTICE	= 5;
Syslog.LOG_INFO		= 6;
Syslog.LOG_DEBUG	= 7;

/*
 * Attach destroy handling
 */
process.on('exit', function() {
	Syslog.close();
});

/*
 * export Syslog as module
 */
exports.Syslog = Syslog;

})();
