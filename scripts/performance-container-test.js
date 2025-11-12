#!/usr/bin/env node

/**
 * Performance-Optimized Container Test Runner
 * 
 * Enhanced container test runner with performance optimizations,
 * monitoring, and benchmarking capabilities.
 * 
 * Features:
 * - Optimized container startup (<3s target)
 * - Resource consumption monitoring
 * - Performance benchmarking
 * - Efficient volume mounting
 * - Build cache optimization
 */

import { spawn, execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { performance } from 'perf_hooks';

const CONTAINER_ENGINE_PREFERENCE = ['podman', 'docker'];

class PerformanceContainerTestRunner {
  constructor() {
    this.containerEngine = null;
    this.composeCommand = null;
    this.projectRoot = process.cwd();
    this.useOptimized = process.argv.includes('--optimized');
    this.monitoring = process.argv.includes('--monitor');
    this.benchmark = process.argv.includes('--benchmark');
    this.startTime = performance.now();
  }

  /**
   * Detect available container engine with performance metrics
   */
  detectContainerEngine() {
    const engineStartTime = performance.now();
    
    for (const engine of CONTAINER_ENGINE_PREFERENCE) {
      try {
        const version = execSync(`${engine} --version`, { 
          encoding: 'utf8', 
          stdio: 'pipe' 
        }).trim();
        
        const detectionTime = performance.now() - engineStartTime;
        console.log(`✓ Found ${engine}: ${version} (${detectionTime.toFixed(2)}ms)`);
        this.containerEngine = engine;
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
   * Setup performance monitoring directories
   */
  setupPerformanceDirectories() {
    const dirs = ['.docker/node_modules', '.docker/pnpm-store', '.docker/cache'];
    
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 Created performance cache directory: ${dir}`);
      }
    }
  }

  /**
   * Pre-build optimization checks
   */
  async preBuildOptimization() {
    console.log('⚡ Running pre-build optimizations...');
    
    // Check for BuildKit support
    try {
      execSync(`${this.containerEngine} buildx version`, { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
      console.log('✓ BuildKit available for optimized builds');
    } catch (error) {
      console.log('⚠️  BuildKit not available, using legacy build');
    }

    // Setup cache directories
    this.setupPerformanceDirectories();
    
    // Clean up old containers for performance
    try {
      execSync(`${this.containerEngine} container prune -f`, { stdio: 'pipe' });
      console.log('🧹 Cleaned up old containers');
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Build optimized container image
   */
  async buildOptimizedImage() {
    const buildStartTime = performance.now();
    console.log('🔨 Building optimized container image...');
    
    const composeFile = 'compose.yaml';
    
    // Use composeFile in environment
    
    const buildArgs = [
      'build',
      ...(this.useOptimized ? ['--build-arg', 'BUILDKIT_INLINE_CACHE=1'] : [])
    ];

    return new Promise((resolve, reject) => {
      const child = spawn(this.composeCommand, buildArgs, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        env: {
          ...process.env,
          COMPOSE_FILE: composeFile,
          DOCKER_BUILDKIT: '1',
          COMPOSE_DOCKER_CLI_BUILD: '1'
        }
      });

      child.on('close', (code) => {
        const buildTime = performance.now() - buildStartTime;
        if (code === 0) {
          console.log(`✓ Optimized container image built successfully (${buildTime.toFixed(2)}ms)`);
          resolve();
        } else {
          reject(new Error(`Container build failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Run tests with performance monitoring
   */
  async runTestsWithMonitoring(testCommand = 'test') {
    const testStartTime = performance.now();
    console.log(`🧪 Running tests with performance monitoring: ${testCommand}`);

    const scriptMap = {
      'test': 'vitest',
      'test:coverage': 'vitest --coverage',
      'test:watch': 'vitest --watch'
    };

    const actualCommand = scriptMap[testCommand] || testCommand;
    
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        CONTAINERIZED: 'true',
        FORCE_COLOR: '1',
        NODE_ENV: 'test',
        CONTAINER_START_TIME: testStartTime.toString()
      };

      const composeFile = 'compose.yaml';

      const composeArgs = [
        'run',
        '--rm',
        ...(this.monitoring ? ['--profile', 'monitoring'] : []),
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
        const testTime = performance.now() - testStartTime;
        if (code === 0) {
          console.log(`✓ Tests completed successfully in container (${testTime.toFixed(2)}ms)`);
          resolve({ testTime, code: 0 });
        } else {
          console.error(`✗ Tests failed with code ${code} (${testTime.toFixed(2)}ms)`);
          reject(new Error(`Tests failed with code ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error('❌ Container execution failed:', error.message);
        reject(error);
      });
    });
  }

  /**
   * Performance benchmarking
   */
  async runBenchmark() {
    console.log('📊 Running performance benchmark...');
    
    const benchmarks = [];
    
    // Test 1: Cold start
    console.log('🥶 Testing cold start performance...');
    const coldStart = performance.now();
    await this.buildOptimizedImage();
    const coldStartTime = performance.now() - coldStart;
    benchmarks.push({ test: 'Cold Start', time: coldStartTime });

    // Test 2: Warm start
    console.log('🔥 Testing warm start performance...');
    const warmStart = performance.now();
    await this.runTestsWithMonitoring('test');
    const warmStartTime = performance.now() - warmStart;
    benchmarks.push({ test: 'Warm Start', time: warmStartTime });

    // Test 3: Test execution
    console.log('⚡ Testing test execution performance...');
    const testExec = performance.now();
    await this.runTestsWithMonitoring('test');
    const testExecTime = performance.now() - testExec;
    benchmarks.push({ test: 'Test Execution', time: testExecTime });

    // Generate benchmark report
    this.generateBenchmarkReport(benchmarks);
  }

  /**
   * Generate performance benchmark report
   */
  generateBenchmarkReport(benchmarks) {
    console.log('\n📈 Performance Benchmark Report');
    console.log('================================');
    
    benchmarks.forEach(benchmark => {
      const status = benchmark.time < 3000 ? '✅' : benchmark.time < 5000 ? '⚠️' : '❌';
      console.log(`${status} ${benchmark.test}: ${benchmark.time.toFixed(2)}ms`);
    });

    const totalTime = benchmarks.reduce((sum, b) => sum + b.time, 0);
    const avgTime = totalTime / benchmarks.length;
    
    console.log('\n📊 Summary:');
    console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`   Average Time: ${avgTime.toFixed(2)}ms`);
    console.log(`   Performance Score: ${this.calculatePerformanceScore(avgTime)}/100`);

    // Save benchmark data
    const benchmarkData = {
      timestamp: new Date().toISOString(),
      benchmarks,
      summary: { totalTime, avgTime }
    };
    
    writeFileSync('.docker/benchmark.json', JSON.stringify(benchmarkData, null, 2));
    console.log('💾 Benchmark data saved to .docker/benchmark.json');
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(avgTime) {
    // Score based on average time (lower is better)
    if (avgTime < 2000) return 100;
    if (avgTime < 3000) return 90;
    if (avgTime < 5000) return 70;
    if (avgTime < 10000) return 50;
    return 25;
  }

  /**
   * Show performance metrics
   */
  showPerformanceMetrics() {
    const totalTime = performance.now() - this.startTime;
    console.log('\n⚡ Performance Metrics:');
    console.log(`   Total Runtime: ${totalTime.toFixed(2)}ms`);
    console.log(`   Container Engine: ${this.containerEngine}`);
    console.log(`   Optimized Mode: ${this.useOptimized ? 'Yes' : 'No'}`);
    console.log(`   Monitoring: ${this.monitoring ? 'Yes' : 'No'}`);
    console.log(`   Benchmarking: ${this.benchmark ? 'Yes' : 'No'}`);
    console.log('');
  }

  /**
   * Main execution method
   */
  async run(testCommand = 'test') {
    try {
      console.log('🚀 Starting performance-optimized containerized test runner...');
      
      this.showPerformanceMetrics();
      
      // Detect container engine
      this.detectContainerEngine();
      
      // Pre-build optimizations
      await this.preBuildOptimization();
      
      if (this.benchmark) {
        await this.runBenchmark();
      } else {
        // Build optimized image
        await this.buildOptimizedImage();
        
        // Run tests with monitoring
        await this.runTestsWithMonitoring(testCommand);
      }
      
      const totalTime = performance.now() - this.startTime;
      console.log(`🎉 Performance-optimized containerized testing completed in ${totalTime.toFixed(2)}ms!`);
      
    } catch (error) {
      console.error('❌ Performance-optimized containerized testing failed:', error.message);
      process.exit(1);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const testCommand = args.find(arg => !arg.startsWith('--')) || 'test';

// Run the performance-optimized container test runner
const runner = new PerformanceContainerTestRunner();
runner.run(testCommand);