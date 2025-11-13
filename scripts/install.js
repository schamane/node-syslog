#!/usr/bin/env node

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync, copyFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const napi = require('node-addon-api');
const npg = require('@mapbox/node-pre-gyp');

const binary = require(path.join(__dirname, '../package.json')).binary;

const package_json_path = path.join(__dirname, '../package.json');

console.log('🔧 Starting native addon installation...');

// Ensure lib directory structure exists
const libDir = path.join(__dirname, '../lib/binding');
try {
  mkdirSync(libDir, { recursive: true });
  console.log('✅ Created lib/binding directory structure');
} catch (error) {
  if (error.code !== 'EEXIST') {
    console.error('❌ Failed to create lib directory:', error.message);
    process.exit(1);
  }
}

try {
  console.log('🔍 Looking for pre-built binary...');
  const binding_path = npg.find(package_json_path);
  console.log('✅ Found pre-built binary path:', binding_path);
  
  // Check if the binary file actually exists before trying to load it
  if (existsSync(binding_path)) {
    // Verify the binary can be loaded (but don't assign to global)
    try {
      require(binding_path);
      console.log('✅ Pre-built binary verified successfully');
      process.exit(0); // Success, exit early
    } catch (loadError) {
      console.log('⚠️  Pre-built binary found but failed to load, rebuilding from source...');
      throw loadError; // This will trigger the fallback build
    }
  } else {
    console.log('⚠️  Pre-built binary path found but file does not exist, building from source...');
    throw new Error(`Pre-built binary not found at ${binding_path}`);
  }
} catch (error) {
  console.log('⚠️  Pre-built binary not available, building from source...');
  console.log('📝 Error details:', error.message);
  
  try {
    // Fallback to building from source using node-pre-gyp
    console.log('🔨 Building native addon from source...');
    const runner = new npg.Run({ package_json_path });
    runner.parseArgv(['rebuild']);
    
 // Use node-pre-gyp to install the binary to the correct location
    console.log('📦 Installing built binary to target location...');
    
    // Get the target path from node-pre-gyp
    const targetPath = npg.find(package_json_path);
    const targetDir = path.dirname(targetPath);
    
    // Ensure target directory exists
    mkdirSync(targetDir, { recursive: true });
    
    // Copy the binary from build directory
    const builtBinary = path.join(__dirname, '../build/Release/syslog_native.node');
    copyFileSync(builtBinary, targetPath);
    console.log('✅ Copied binary to:', targetPath);
    
    // After install, verify the binary was placed correctly
    const binding_path = npg.find(package_json_path);
    console.log('✅ Native addon built and available at:', binding_path);
    
    // Test that it can be loaded
    require(binding_path);
    console.log('✅ Native addon loaded successfully from source build');
    
  } catch (buildError) {
    console.error('❌ Failed to build native addon from source:');
    console.error('   Error:', buildError.message);
    if (buildError.stack) {
      console.error('   Stack:', buildError.stack);
    }
    
    // Provide helpful debugging information
    console.error('\n🔍 Debugging information:');
    console.error('   Node.js version:', process.version);
    console.error('   Platform:', process.platform);
    console.error('   Architecture:', process.arch);
    console.error('   Working directory:', process.cwd());
    
    // Check if build tools are available
    try {
      require('child_process').execSync('node-gyp --version', { stdio: 'pipe' });
      console.error('   node-gyp: Available');
    } catch (e) {
      console.error('   node-gyp: Not available');
    }
    
    // Check build directory
    const buildDir = path.join(__dirname, '../build/Release');
    if (existsSync(buildDir)) {
      console.error('   Build directory exists:', buildDir);
      const files = require('fs').readdirSync(buildDir);
      console.error('   Build directory contents:', files);
    } else {
      console.error('   Build directory does not exist:', buildDir);
    }
    
    console.error('\n💡 Possible solutions:');
    console.error('   1. Ensure you have the required build tools installed');
    console.error('   2. Check that Python, make, and a C++ compiler are available');
    console.error('   3. Try running: npm install -g node-gyp');
    console.error('   4. On Ubuntu/Debian: sudo apt-get install build-essential');
    console.error('   5. On CentOS/RHEL: sudo yum groupinstall "Development Tools"');
    
    process.exit(1);
  }
}