#!/usr/bin/env node

/**
 * Debug Container Test Runner
 * 
 * Enhanced container test runner with debugging support for VS Code integration.
 * Provides additional debugging information and container introspection.
 * 
 * Usage:
 *   node scripts/debug-container-test.js [test-command] [--debug]
 * 
 * Examples:
 *   node scripts/debug-container-test.js test --debug
 *   node scripts/debug-container-test.js test:coverage --debug
 */

import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';

const CONTAINER_ENGINE_PREFERENCE = ['podman', 'docker'];

class DebugContainerTestRunner {
  constructor() {
    this.containerEngine = null;
    this.composeCommand = null;
    this.projectRoot = process.cwd();
    this.debugMode = process.argv.includes('--debug');
  }

  /**
   * Detect available container engine (Podman first, Docker fallback)
   */
  detectContainerEngine() {
    for (const engine of CONTAINER_ENGINE_PREFERENCE) {
      try {
        const version = execSync(`${engine} --version`, { 
          encoding: 'utf8', 
          stdio: 'pipe' 
        }).trim();
        
        console.log(`✓ Found ${engine}: ${version}`);
        this.containerEngine = engine;
        
        // Set compose command based on engine
        this.composeCommand = engine === 'podman' ? 'podman-compose' : 'docker-compose';
        
        return engine;
      } catch (error) {
        console.log(`✗ ${engine} not available: ${error.message}`);
      }
    }
    
    throw new Error(
      'No container engine found. Please install Podman (recommended) or Docker.\n' +
      'Podman: https://podman.io/\n' +
      'Docker: https://www.docker.com/'
    );
  }

  /**
   * Validate project structure and dependencies
   */
  validateProject() {
    const requiredFiles = [
      'package.json',
      'pnpm-lock.yaml',
      'Dockerfile',
      'docker-compose.yml',
      'scripts/container-test.js'
    ];

    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        throw new Error(`Required file not found: ${file}`);
      }
    }

    // Check if we're already running in a container
    if (process.env.CONTAINERIZED === 'true') {
      console.log('⚠️  Already running in containerized environment');
      return false;
    }

    return true;
  }

  /**
   * Build Docker image with debug support
   */
  async buildImage() {
    console.log('🔨 Building debug test container image...');
    
    return new Promise((resolve, reject) => {
      const composeArgs = ['build'];
      
      if (this.debugMode) {
        console.log('🐛 Debug mode enabled - building with debug tools');
      }
      
      const child = spawn(this.composeCommand, composeArgs, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Debug container image built successfully');
          resolve();
        } else {
          reject(new Error(`Container build failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Run tests in container with debugging support
   */
  async runTestsInContainer(testCommand = 'test') {
    console.log(`🧪 Running debug tests in container: ${testCommand}`);
    
    if (this.debugMode) {
      console.log('🐛 Debug mode: Additional debugging enabled');
    }

    // Map test commands to actual npm scripts
    const scriptMap = {
      'test': 'vitest',
      'test:coverage': 'vitest --coverage',
      'test:watch': 'vitest --watch'
    };

    const actualCommand = scriptMap[testCommand] || testCommand;
    
    return new Promise((resolve, reject) => {
      // Set environment variables for container
      const env = {
        ...process.env,
        CONTAINERIZED: 'true',
        FORCE_COLOR: '1', // Preserve colors in container output
        NODE_ENV: 'development', // Ensure development mode for debugging
        DEBUG: '*' // Enable debug logging if in debug mode
      };

      const composeArgs = [
        'run',
        '--rm',
        ...(this.debugMode ? ['-e', 'DEBUG=*'] : []),
        'node-syslog-test',
        'pnpm',
        ...actualCommand.split(' ')
      ];

      if (this.debugMode) {
        console.log('🐛 Container args:', composeArgs.join(' '));
      }

      const child = spawn(this.composeCommand, composeArgs, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        env,
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Debug tests completed successfully in container');
          resolve();
        } else {
          console.error(`✗ Debug tests failed with code ${code}`);
          reject(new Error(`Debug tests failed with code ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error('❌ Container execution failed:', error.message);
        reject(error);
      });
    });
  }

  /**
   * Show container debugging information
   */
  showDebugInfo() {
    console.log('🐛 Debug Container Information:');
    console.log(`   Container Engine: ${this.containerEngine}`);
    console.log(`   Compose Command: ${this.composeCommand}`);
    console.log(`   Project Root: ${this.projectRoot}`);
    console.log(`   Debug Mode: ${this.debugMode}`);
    console.log(`   Node.js Version: ${process.version}`);
    console.log(`   Platform: ${process.platform}`);
    console.log('');
  }

  /**
   * Main execution method
   */
  async run(testCommand = 'test') {
    try {
      console.log('🚀 Starting debug containerized test runner...');
      
      // Show debug information
      this.showDebugInfo();
      
      // Detect container engine
      this.detectContainerEngine();
      
      // Validate project
      if (!this.validateProject()) {
        return;
      }
      
      // Build image
      await this.buildImage();
      
      // Run tests
      await this.runTestsInContainer(testCommand);
      
      console.log('🎉 Debug containerized testing completed successfully!');
      
    } catch (error) {
      console.error('❌ Debug containerized testing failed:', error.message);
      if (this.debugMode) {
        console.error('Stack trace:', error.stack);
      }
      process.exit(1);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const testCommand = args.find(arg => !arg.startsWith('--')) || 'test';

// Run the debug container test runner
const runner = new DebugContainerTestRunner();
runner.run(testCommand);