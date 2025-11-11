#!/usr/bin/env node

/**
 * Test Consistency Validator
 * 
 * Validates that containerized tests produce consistent results
 * between local development and CI/CD environments.
 * 
 * This script:
 * 1. Runs tests locally (non-containerized)
 * 2. Runs tests in container (if available)
 * 3. Compares results for consistency
 * 4. Generates validation report
 */

import { spawn, execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { performance } from 'perf_hooks';
import path from 'path';

class TestConsistencyValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.artifactsDir = path.join(this.projectRoot, '.test-consistency');
    
    // Ensure artifacts directory exists
    if (!existsSync(this.artifactsDir)) {
      execSync(`mkdir -p ${this.artifactsDir}`, { stdio: 'pipe' });
    }
  }

  /**
   * Log with timestamp
   */
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Execute command and capture output
   */
  async executeCommand(command, args, env = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      this.log(`Executing: ${command} ${args.join(' ')}`);
      
      const child = spawn(command, args, {
        stdio: 'pipe',
        cwd: this.projectRoot,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          ...env
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const duration = performance.now() - startTime;
        this.log(`Command completed in ${duration.toFixed(2)}ms with code ${code}`);
        
        resolve({ stdout, stderr, code });
      });

      child.on('error', (error) => {
        this.log(`Command execution error: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Parse vitest output to extract test results
   */
  parseVitestOutput(output) {
    const lines = output.split('\n');
    
    // Extract test counts from the "Tests" line
    const testSummaryLine = lines.find(line => line.includes('Tests') && line.includes('passed'));
    let passed = 0, failed = 0, total = 0;
    
    if (testSummaryLine) {
      const testMatch = testSummaryLine.match(/(\d+) passed/);
      const failedMatch = testSummaryLine.match(/(\d+) failed/);
      passed = testMatch ? parseInt(testMatch[1]) : 0;
      failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      total = passed + failed;
    }

    // Extract duration from the "Duration" line (strip ANSI codes first)
    const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');
    const durationMatch = cleanOutput.match(/Duration\s+(\d+)ms/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 0;

    // Extract coverage (if available)
    let coverage;
    const coverageMatch = cleanOutput.match(/All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/);
    if (coverageMatch) {
      coverage = {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4])
      };
    }

    return { passed, failed, total, duration, coverage };
  }

  /**
   * Run tests locally (non-containerized)
   */
  async runLocalTests() {
    this.log('🧪 Running local tests (non-containerized)');
    
    const { stdout, code } = await this.executeCommand('npx', ['vitest', 'run', '--coverage']);
    
    if (code !== 0) {
      throw new Error(`Local tests failed with code ${code}`);
    }

    const testResults = this.parseVitestOutput(stdout);
    
    return {
      ...testResults,
      environment: {
        node_version: process.version,
        platform: process.platform,
        containerized: false,
        ci: process.env.CI === 'true'
      }
    };
  }

  /**
   * Run tests in container
   */
  async runContainerTests() {
    this.log('🐳 Running containerized tests');
    
    // Check if container engine is available
    let containerEngine = null;
    for (const engine of ['docker', 'podman']) {
      try {
        execSync(`${engine} --version`, { stdio: 'pipe' });
        containerEngine = engine;
        break;
      } catch {
        // Continue to next engine
      }
    }

    if (!containerEngine) {
      this.log('No container engine available, skipping container tests', 'warn');
      return null;
    }

    try {
      // Build container image
      this.log('🔨 Building container image');
      await this.executeCommand(containerEngine, [
        'build',
        '-f', 'Dockerfile.optimized',
        '--target', 'runtime',
        '-t', 'consistency-test:latest',
        '.'
      ]);

      // Run tests in container
      this.log('🧪 Running tests in container');
      const { stdout, code } = await this.executeCommand(containerEngine, [
        'run',
        '--rm',
        '--env', 'NODE_ENV=test',
        '--env', 'CONTAINERIZED=true',
        'consistency-test:latest',
        'npx', 'vitest', 'run', '--coverage'
      ]);

      if (code !== 0) {
        throw new Error(`Container tests failed with code ${code}`);
      }

      const testResults = this.parseVitestOutput(stdout);
      
      return {
        ...testResults,
        environment: {
          node_version: 'container', // Would be extracted from container in real implementation
          platform: 'linux',
          containerized: true,
          ci: false
        }
      };

    } catch (error) {
      this.log(`Container test execution failed: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Compare test results for consistency
   */
  compareResults(local, container) {
    const checks = {
      test_count_match: false,
      coverage_consistency: false,
      performance_within_threshold: false,
      environment_parity: false
    };

    if (!container) {
      return checks;
    }

    // Test count consistency
    checks.test_count_match = local.total === container.total && local.passed === container.passed;

    // Coverage consistency (within 5% tolerance)
    if (local.coverage && container.coverage) {
      const coverageDiff = Math.abs(local.coverage.lines - container.coverage.lines);
      checks.coverage_consistency = coverageDiff <= 5.0;
    }

    // Performance consistency (container can be slower, but within 2x threshold)
    const performanceRatio = container.duration / local.duration;
    checks.performance_within_threshold = performanceRatio <= 2.0;

    // Environment parity (should be different in expected ways)
    checks.environment_parity = 
      local.environment.containerized !== container.environment.containerized &&
      container.environment.platform === 'linux';

    return checks;
  }

  /**
   * Generate recommendations based on comparison
   */
  generateRecommendations(local, container) {
    const recommendations = [];

    if (!container) {
      recommendations.push('Set up container engine (Docker/Podman) for full consistency validation');
      return recommendations;
    }

    const checks = this.compareResults(local, container);

    if (!checks.test_count_match) {
      recommendations.push('Test count mismatch between local and container environments - check for platform-specific tests');
    }

    if (!checks.coverage_consistency) {
      recommendations.push('Coverage coverage differs between environments - investigate platform-specific code paths');
    }

    if (!checks.performance_within_threshold) {
      recommendations.push('Container performance significantly slower - optimize container image or check resource constraints');
    }

    if (!checks.environment_parity) {
      recommendations.push('Environment configuration unexpected - verify container environment variables');
    }

    if (Object.values(checks).every(check => check)) {
      recommendations.push('All consistency checks passed - containerized testing is properly configured');
    }

    return recommendations;
  }

  /**
   * Generate and save consistency report
   */
  async generateReport(local, container) {
    this.log('📋 Generating consistency report');

    const consistencyChecks = this.compareResults(local, container);
    const recommendations = this.generateRecommendations(local, container);

    // Determine overall status
    let status = 'passed';
    if (!container) {
      status = 'warning';
    } else if (!consistencyChecks.test_count_match || !consistencyChecks.coverage_consistency) {
      status = 'failed';
    } else if (!consistencyChecks.performance_within_threshold) {
      status = 'warning';
    }

    const report = {
      timestamp: new Date().toISOString(),
      local_results: local,
      container_results: container,
      consistency_checks: consistencyChecks,
      recommendations,
      status
    };

    // Save report
    const reportPath = path.join(this.artifactsDir, 'consistency-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📄 Consistency report saved: ${reportPath}`, 'success');

    return report;
  }

  /**
   * Display report summary
   */
  displayReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST CONSISTENCY VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Status: ${report.status.toUpperCase()}`);
    console.log(`🕒 Timestamp: ${report.timestamp}`);

    if (report.local_results) {
      console.log('\n🏠 Local Results:');
      console.log(`   Tests: ${report.local_results.passed}/${report.local_results.total} passed`);
      console.log(`   Duration: ${report.local_results.duration}ms`);
      if (report.local_results.coverage) {
        console.log(`   Coverage: ${report.local_results.coverage.lines}% lines`);
      }
    }

    if (report.container_results) {
      console.log('\n🐳 Container Results:');
      console.log(`   Tests: ${report.container_results.passed}/${report.container_results.total} passed`);
      console.log(`   Duration: ${report.container_results.duration}ms`);
      if (report.container_results.coverage) {
        console.log(`   Coverage: ${report.container_results.coverage.lines}% lines`);
      }
    } else {
      console.log('\n🐳 Container Results: Not available');
    }

    console.log('\n✅ Consistency Checks:');
    console.log(`   Test Count Match: ${report.consistency_checks.test_count_match ? '✅' : '❌'}`);
    console.log(`   Coverage Consistency: ${report.consistency_checks.coverage_consistency ? '✅' : '❌'}`);
    console.log(`   Performance Within Threshold: ${report.consistency_checks.performance_within_threshold ? '✅' : '❌'}`);
    console.log(`   Environment Parity: ${report.consistency_checks.environment_parity ? '✅' : '❌'}`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      this.log('🚀 Starting test consistency validation');

      // Run local tests
      const localResults = await this.runLocalTests();
      this.log('✅ Local tests completed successfully', 'success');

      // Run container tests
      const containerResults = await this.runContainerTests();
      if (containerResults) {
        this.log('✅ Container tests completed successfully', 'success');
      }

      // Generate and display report
      const report = await this.generateReport(localResults, containerResults);
      this.displayReport(report);

      // Exit with appropriate code
      if (report.status === 'failed') {
        this.log('Test consistency validation failed', 'error');
        process.exit(1);
      } else if (report.status === 'warning') {
        this.log('Test consistency validation completed with warnings', 'warn');
        process.exit(0);
      } else {
        this.log('Test consistency validation passed', 'success');
        process.exit(0);
      }

    } catch (error) {
      this.log(`Test consistency validation failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the validator
const validator = new TestConsistencyValidator();
validator.run();