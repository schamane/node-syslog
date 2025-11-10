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

const package_json_path = path.join(__dirname, '../package.json');

try {
  const binding_path = npg.find(package_json_path);
  global.binding = require(binding_path);
} catch (error) {
  // Fallback to building from source
  const runner = new npg.Run({ package_json_path });
  runner.parseArgv(['rebuild']);
  const binding_path = npg.find(package_json_path);
  global.binding = require(binding_path);
}