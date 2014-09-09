{
    "targets": [
	{
	    "target_name": "syslog",
            "conditions": [
                ['OS=="win"', {
                    "sources": ["syslog-win.cc"],
                }, {
                    "sources": ["syslog.cc"],
                }]
            ],
	    "cflags": [
		"-fPIC"
	    ]
	}
    ]
}
