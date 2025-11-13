#!/usr/bin/env node

/**
 * Simple Test Runner for Distroless Environment
 * 
 * This script bypasses shell dependencies and runs tests directly
 * using Node.js modules available in distroless containers.
 */

// Simple test execution for distroless environment
async function runTests() {
  console.log('🧪 Running tests in distroless environment...');
  
  try {
    // Import and run vitest directly
    const { run } = await import('vitest/node');
    
    // Run vitest with default configuration
    await run({
      // Use vitest config from project
      config: './vitest.config.ts',
      // Run in test mode
      mode: 'test',
      // Enable color output
      color: true
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