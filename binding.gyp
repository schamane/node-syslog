{
  "targets": [
    {
      "target_name": "syslog_native",
      "sources": [
        "src/native/syslog.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<!@(node -p \"require('node-addon-api').include_dir\")"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "conditions": [
        ["OS=='linux'", {
          "cflags": ["-D_GNU_SOURCE"],
          "cflags_cc": ["-D_GNU_SOURCE"]
        }],
        ["target_arch!='ia32' and target_arch!='x64' and target_arch!='arm64' and target_arch!='arm'", {
          "defines": ["OPENSSL_NO_ASM"]
        }]
      ]
    }
  ]
}