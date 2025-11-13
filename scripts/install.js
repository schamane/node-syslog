#!/usr/bin/env node

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

console.log('🔧 Checking native addon availability...');

try {
  // Try to load the native addon using node-gyp-build
  // This will automatically find pre-built binaries or fallback to source builds
  const nativeBinding = require('node-gyp-build')(__dirname);
  
  // Test that the binding can be loaded
  if (nativeBinding && typeof nativeBinding === 'object') {
    console.log('✅ Native addon loaded successfully');
    process.exit(0);
  } else {
    console.log('⚠️  Native addon loaded but appears invalid');
    process.exit(1);
  }
} catch (error) {
  console.log('⚠️  Pre-built binary not found, attempting to build from source...');
  
  try {
    // Try to build from source using node-gyp
    const { execSync } = require('child_process');
    const baseDir = path.dirname(__dirname);
    
    console.log('🔨 Building native addon from source...');
    execSync('node-gyp rebuild', { 
      cwd: baseDir,
      stdio: 'inherit'
    });
    
    // Try loading the built binary directly
    const builtBinary = path.join(__dirname, '../build/Release/syslog_native.node');
    const nativeBinding = require(builtBinary);
    if (nativeBinding && typeof nativeBinding === 'object') {
      console.log('✅ Native addon built and loaded successfully');
      process.exit(0);
    } else {
      console.log('❌ Native addon built but failed to load');
      process.exit(1);
    }
  } catch (buildError) {
    console.log('❌ Failed to build native addon:', buildError.message);
    
    // Provide helpful debugging information
    console.log('\n🔍 Debugging information:');
    console.log('   Node.js version:', process.version);
    console.log('   Platform:', process.platform);
    console.log('   Architecture:', process.arch);
    console.log('   Working directory:', process.cwd());
    
    console.log('\n💡 Possible solutions:');
    console.log('   1. Use Docker/Podman for testing: docker compose run --rm test');
    console.log('   2. Ensure you have the required build tools installed');
    console.log('   3. Check that Python, make, and a C++ compiler are available');
    console.log('   4. Try running: npm install -g node-gyp');
    console.log('   5. On Ubuntu/Debian: sudo apt-get install build-essential');
    
    process.exit(1);
  }
}