#!/usr/bin/env node

/**
 * Simple Test Runner for Distroless Environment
 * 
 * This script runs test files directly without external dependencies
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Simple test execution for distroless environment
async function runTests() {
  console.log('🧪 Running tests in distroless environment...');
  
  try {
    // Check if test file exists
    const testFile = join(process.cwd(), 'test', 'syslog.test.ts');
    if (!existsSync(testFile)) {
      throw new Error(`Test file not found: ${testFile}`);
    }
    
    console.log('📋 Running syslog tests...');
    
    // Run test file with Node.js
    execSync(`node "${testFile}"`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✓ Tests completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();