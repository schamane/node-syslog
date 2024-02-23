use napi::bindgen_prelude::*;
use napi_derive::napi;

extern crate syslog;
use syslog::{Facility, Formatter3164};
use std::process;


#[napi]
fn log(msg: String, process_name: String)-> Result<String> {
    let formatter = Formatter3164 {
        facility: Facility::LOG_USER,
        hostname: None,
        process: process_name.to_owned(),
        pid: 0,
      };



    match syslog::unix(formatter){
        Err(e)  => {
            println!("impossible to connect to syslog: {:?}", e);
            Ok("not ok".to_string())
        },
        Ok(mut writer) => {
          writer.debug(msg.to_owned()).expect("could not write log message");
          println!("send message to syslog: {:?}", msg.to_owned());
          Ok("ok".to_string())
        }
    }
}

#[napi]
fn init()-> Result<String> {
    let formatter = Formatter3164 {
        facility: Facility::LOG_USER,
        hostname: None,
        process: "node".to_owned(),
        pid: process::id(),
      };

    let msg = "hallo-world".to_string();

    match syslog::unix(formatter){
        Err(e)  => {
            println!("impossible to connect to syslog: {:?}", e);
            Ok("not ok".to_string())
        },
        Ok(mut writer) => {
          writer.err(msg.to_owned()).expect("could not write log message");
          println!("send message to syslog: {:?}", msg.to_owned());
          Ok("ok".to_string())
        }
    }
    // Ok(msg.to_owned().to_string())
}

#[napi(js_name = "setMask")]
fn set_mask()-> Result<String> {
  Ok("setMask".to_string())
}

#[napi]
fn close()-> Result<String> {
  Ok("close".to_string())
}
