{
  "targets": [
    {
      "target_name": "syslog",
      "sources": [
        "syslog.cc"
      ],
      "cflags": [
        "-fPIC"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
