#!/usr/bin/env node

const napi = require('node-addon-api');
const npg = require('@mapbox/node-pre-gyp');
const path = require('path');

const binary = require(path.join(__dirname, 'package.json')).binary;
const binding_path = npg.find(binary.package_name);

try {
  module.exports = require(binding_path);
} catch (error) {
  // Fallback to building from source
  npg.run();
  module.exports = require(binding_path);
}