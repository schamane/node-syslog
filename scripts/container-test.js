#!/usr/bin/env node

/**
 * Container Test Runner
 * 
 * Enforces container-only testing by detecting container runtime
 * and executing tests through Docker Compose with Podman priority.
 * 
 * Usage:
 *   node scripts/container-test.js [test-command]
 * 
 * Examples:
 *   node scripts/container-test.js test
 *   node scripts/container-test.js test:coverage
 *   node scripts/container-test.js test:watch
 */

import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';

const CONTAINER_ENGINE_PREFERENCE = ['podman', 'docker'];

class ContainerTestRunner {
  constructor() {
    this.containerEngine = null;
    this.composeCommand = null;
    this.projectRoot = process.cwd();
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
        return engine;
      } catch (error) {
        console.log(`✗ ${engine} not available: ${error.message}`);
      }
    }
    
    throw new Error(
      'No container engine found. Please install Podman (recommended) or Docker.\n' +
      'Podman: https://podman.io/getting-started\n' +
      'Docker: https://docs.docker.com/get-docker/'
    );
  }

  /**
   * Detect Docker Compose or equivalent
   */
  detectComposeCommand() {
    const composeCommands = [
      `${this.containerEngine}-compose`,
      'docker-compose',
      `${this.containerEngine} compose`
    ];

    for (const cmd of composeCommands) {
      try {
        // Handle both "docker compose" (space) and "docker-compose" (dash)
        const args = cmd.split(' ');
        const fullCmd = args.length > 1 ? cmd : `${cmd} version`;
        
        const version = execSync(fullCmd, { 
          encoding: 'utf8', 
          stdio: 'pipe' 
        }).trim();
        
        console.log(`✓ Found compose: ${cmd} (${version})`);
        this.composeCommand = cmd;
        return cmd;
      } catch (error) {
        console.log(`✗ ${cmd} not available: ${error.message}`);
      }
    }
    
    throw new Error(
      'Docker Compose not found. Please install Docker Compose or use Podman Compose.\n' +
      'Podman Compose: https://github.com/containers/podman-compose\n' +
      'Docker Compose: https://docs.docker.com/compose/install/'
    );
  }

  /**
   * Validate container environment setup
   */
  validateEnvironment() {
    const requiredFiles = [
      'Dockerfile',
      'compose.yaml',
      'package.json'
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
   * Build Docker image if needed
   */
  async buildImage() {
    console.log('🔨 Building test container image...');
    
    return new Promise((resolve, reject) => {
      const composeArgs = ['-f', 'compose.yaml', 'build'];
      
      const child = spawn(this.composeCommand, composeArgs, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Container image built successfully');
          resolve();
        } else {
          reject(new Error(`Container build failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Run tests in container
   */
  async runTestsInContainer(testCommand = 'test') {
    console.log(`🧪 Running tests in container: ${testCommand}`);
    
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
        FORCE_COLOR: '1' // Preserve colors in container output
      };

      const composeArgs = [
        '-f', 'compose.yaml',
        'run',
        '--rm',
        'node-syslog-test',
        'pnpm',
        ...actualCommand.split(' ')
      ];

      const child = spawn(this.composeCommand, composeArgs, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        env,
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Tests completed successfully in container');
          resolve(code);
        } else {
          console.log(`✗ Tests failed with code ${code}`);
          reject(new Error(`Tests failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Run tests directly in CI environment
   */
  async runTestsDirectly(testCommand = 'test') {
    console.log(`🧪 Running tests directly in CI environment: ${testCommand}`);
    
    // Map test commands to actual npm scripts
    const scriptMap = {
      'test': 'vitest',
      'test:coverage': 'vitest --coverage',
      'test:watch': 'vitest --watch'
    };

    const actualCommand = scriptMap[testCommand] || testCommand;
    
    return new Promise((resolve, reject) => {
      // Use npm in distroless runtime, pnpm in dev
      const packageManager = process.env.CONTAINERIZED === 'true' ? 'npm' : 'pnpm';
      const child = spawn(packageManager, actualCommand.split(' '), {
        stdio: 'inherit',
        cwd: this.projectRoot,
        env: {
          ...process.env,
          FORCE_COLOR: '1'
        }
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Tests completed successfully');
          resolve(code);
        } else {
          console.log(`✗ Tests failed with code ${code}`);
          reject(new Error(`Tests failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Main execution method
   */
  async run(testCommand = 'test') {
    try {
      // Check if we're in CI environment (GitHub Actions, GitLab CI, etc.)
      const isCI = process.env.GITHUB_ACTIONS === 'true' || 
                   process.env.GITLAB_CI === 'true' || 
                   process.env.CI === 'true';
      
      if (isCI) {
        console.log('🤖 CI environment detected, running tests directly...');
        await this.runTestsDirectly(testCommand);
        console.log('🎉 CI testing completed successfully!');
        return;
      }

      console.log('🚀 Starting containerized test runner...');
      
      // Validate environment
      if (!this.validateEnvironment()) {
        return;
      }

      // Detect container runtime
      this.detectContainerEngine();
      this.detectComposeCommand();

      // Build image (always build to ensure latest changes)
      await this.buildImage();

      // Run tests
      await this.runTestsInContainer(testCommand);
      
      console.log('🎉 Containerized testing completed successfully!');
      
    } catch (error) {
      console.error('❌ Testing failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const testCommand = process.argv[2] || 'test';
  const runner = new ContainerTestRunner();
  runner.run(testCommand);
}

export default ContainerTestRunner;