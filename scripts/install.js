#!/usr/bin/env node

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const napi = require('node-addon-api');
const npg = require('@mapbox/node-pre-gyp');

const binary = require(path.join(__dirname, '../package.json')).binary;

try {
  const binding_path = npg.find(binary.package_name);
  module.exports = require(binding_path);
} catch (error) {
  // Fallback to building from source
  npg.run();
  const binding_path = npg.find(binary.package_name);
  module.exports = require(binding_path);
}