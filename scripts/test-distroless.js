#!/usr/bin/env node

/**
 * Simple Test Runner for Distroless Environment
 * 
 * This script bypasses shell dependencies and runs tests directly
 * using Node.js modules available in distroless containers.
 */

import { spawn } from 'child_process';

// Simple test execution for distroless environment
async function runTests() {
  console.log('🧪 Running tests in distroless environment...');
  
  try {
    // Try to run vitest directly from node_modules
    const child = spawn('node', ['./node_modules/.bin/vitest'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Tests completed successfully');
        process.exit(0);
      } else {
        console.log(`✗ Tests failed with code ${code}`);
        process.exit(code);
      }
    });

    child.on('error', (error) => {
      console.error('❌ Failed to start tests:', error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();