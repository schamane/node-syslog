{
  "targets": [
    {
      "target_name": "syslog_native",
      "sources": [
        "src/native/syslog.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "conditions": [
        ["OS=='linux'", {
          "cflags": ["-D_GNU_SOURCE"],
          "cflags_cc": ["-D_GNU_SOURCE"]
        }]
      ]
    }
  ]
}