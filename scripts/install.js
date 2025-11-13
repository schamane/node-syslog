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
    // Fallback to building from source using node-gyp directly
    console.log('🔨 Building native addon from source...');
    
    // Clean any existing build to ensure fresh state
    const buildDir = path.join(__dirname, '../build');
    if (existsSync(buildDir)) {
      console.log('🧹 Cleaning existing build directory...');
      const { execSync } = require('child_process');
      execSync('rm -rf build', { 
        cwd: path.dirname(__dirname),
        stdio: 'inherit'
      });
    }
    
    // Use node-gyp directly to build with verbose output for debugging
    const { execSync } = require('child_process');
    const baseDir = path.dirname(__dirname);
    
    try {
      console.log('🔨 Running node-gyp rebuild with verbose output...');
      execSync('npx node-gyp rebuild --verbose', { 
        cwd: baseDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          // Ensure make creates directories as needed
          MAKEFLAGS: '--no-builtin-rules'
        }
      });
      console.log('✅ node-gyp rebuild completed successfully');
    } catch (gypError) {
      console.error('❌ node-gyp rebuild failed:', gypError.message);
      
      // Try alternative approach with make directory creation
      console.log('🔄 Trying alternative build approach...');
      try {
        execSync('npx node-gyp configure && npx node-gyp build', { 
          cwd: baseDir,
          stdio: 'inherit'
        });
        console.log('✅ Alternative build approach completed successfully');
      } catch (altError) {
        console.error('❌ Alternative build approach also failed:', altError.message);
        throw gypError; // Throw original error
      }
    }
    
    // Get the target path from node-pre-gyp
    const targetPath = npg.find(package_json_path);
    const targetDir = path.dirname(targetPath);
    
    // Ensure target directory exists
    mkdirSync(targetDir, { recursive: true });
    
    // Copy the binary from build directory
    const builtBinary = path.join(__dirname, '../build/Release/syslog_native.node');
    
    if (!existsSync(builtBinary)) {
      throw new Error(`Built binary not found at ${builtBinary}`);
    }
    
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