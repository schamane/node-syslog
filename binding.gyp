{
    "targets": [{
        "target_name": "syslog",
        "sources": [ "src/node-syslog.cc" ],
        "cflags": [
            "-fPIC"
        ],
        "include_dirs" : [
            "<!(node -e \"require('nan')\")"
        ]
    }]
}
