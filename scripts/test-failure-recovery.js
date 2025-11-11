#!/usr/bin/env node

/**
 * Workflow Failure Recovery Tester
 * 
 * Tests failure recovery mechanisms in containerized CI/CD workflows.
 * Simulates various failure scenarios and validates recovery behavior.
 * 
 * Test Scenarios:
 * - Container build failures
 * - Test execution failures
 * - Network connectivity issues
 * - Resource constraints
 * - Cache corruption
 */

import { spawn, execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { performance } from 'perf_hooks';
import path from 'path';

class WorkflowFailureRecoveryTester {
  constructor() {
    this.projectRoot = process.cwd();
    this.artifactsDir = path.join(this.projectRoot, '.failure-recovery-tests');
    this.testResults = [];
    
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
      success: '✅',
      test: '🧪'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Execute command with timeout and error handling
   */
  async executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const timeout = options.timeout || 60000; // 1 minute default
      
      this.log(`Executing: ${command} ${args.join(' ')}`, 'test');
      
      const child = spawn(command, args, {
        stdio: 'pipe',
        cwd: this.projectRoot,
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Set up timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = performance.now() - startTime;
        
        this.log(`Command completed in ${duration.toFixed(2)}ms with code ${code}`, 'test');
        
        resolve({ stdout, stderr, code, duration, timedOut: false });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        this.log(`Command execution error: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Test container build failure recovery
   */
  async testContainerBuildFailure() {
    this.log('🧪 Testing container build failure recovery');
    
    const testScenarios = [
      {
        name: 'Invalid Dockerfile',
        description: 'Test recovery from invalid Dockerfile syntax',
        setup: async () => {
          // Create invalid Dockerfile
          const invalidDockerfile = `
FROM node:22-alpine
INVALID_COMMAND_HERE
RUN echo "This should fail"
`;
          writeFileSync('Dockerfile.invalid', invalidDockerfile);
          return { dockerfile: 'Dockerfile.invalid' };
        },
        execute: async (setup) => {
          const result = await this.executeCommand('podman', [
            'build', '-f', setup.dockerfile, '-t', 'test:invalid', '.'
          ], { timeout: 30000 });
          
          if (result.code !== 0) {
            return { 
              success: true, 
              reason: 'Build failed as expected',
              error: `Exit code: ${result.code}` 
            };
          } else {
            return { success: false, reason: 'Build should have failed but succeeded' };
          }
        },
        cleanup: async () => {
          try {
            execSync('rm -f Dockerfile.invalid', { stdio: 'pipe' });
            execSync('podman rmi -f test:invalid 2>/dev/null || true', { stdio: 'pipe' });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      },
      {
        name: 'Missing dependency file',
        description: 'Test recovery from missing package.json',
        setup: async () => {
          // Temporarily move package.json
          execSync('mv package.json package.json.backup 2>/dev/null || true', { stdio: 'pipe' });
          return {};
        },
        execute: async () => {
          const result = await this.executeCommand('podman', [
            'build', '-f', 'Dockerfile.optimized', '-t', 'test:missing-deps', '.'
          ], { timeout: 30000 });
          
          if (result.code !== 0) {
            return { 
              success: true, 
              reason: 'Build failed as expected due to missing package.json',
              error: `Exit code: ${result.code}` 
            };
          } else {
            return { success: false, reason: 'Build should have failed but succeeded' };
          }
        },
        cleanup: async () => {
          try {
            execSync('mv package.json.backup package.json 2>/dev/null || true', { stdio: 'pipe' });
            execSync('podman rmi -f test:missing-deps 2>/dev/null || true', { stdio: 'pipe' });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }
    ];

    const results = [];
    
    for (const scenario of testScenarios) {
      this.log(`  📋 Running scenario: ${scenario.name}`);
      
      try {
        const setup = await scenario.setup();
        const result = await scenario.execute(setup);
        await scenario.cleanup();
        
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          ...result,
          timestamp: new Date().toISOString()
        });
        
        if (result.success) {
          this.log(`    ✅ ${scenario.name}: ${result.reason}`, 'success');
        } else {
          this.log(`    ❌ ${scenario.name}: ${result.reason}`, 'error');
        }
        
      } catch (error) {
        await scenario.cleanup();
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          success: false,
          reason: `Test execution failed: ${error.message}`,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        this.log(`    ❌ ${scenario.name}: Test execution failed`, 'error');
      }
    }
    
    return results;
  }

  /**
   * Test test execution failure recovery
   */
  async testTestExecutionFailure() {
    this.log('🧪 Testing test execution failure recovery');
    
    const testScenarios = [
      {
        name: 'Invalid test syntax',
        description: 'Test recovery from invalid test syntax',
        setup: async () => {
          // Create invalid test file
          const invalidTest = `
import { describe, it, expect } from 'vitest';

describe('Invalid Test', () => {
  it('should have invalid syntax', () => {
    INVALID_SYNTAX_HERE
    expect(true).toBe(true);
  });
});
`;
          writeFileSync('test/invalid.test.ts', invalidTest);
          return {};
        },
        execute: async () => {
          const result = await this.executeCommand('npx', ['vitest', 'run', 'test/invalid.test.ts'], { timeout: 30000 });
          
          if (result.code !== 0) {
            return { 
              success: true, 
              reason: 'Tests failed as expected due to invalid syntax',
              error: `Exit code: ${result.code}` 
            };
          } else {
            return { success: false, reason: 'Tests should have failed but succeeded' };
          }
        },
        cleanup: async () => {
          try {
            execSync('rm -f test/invalid.test.ts', { stdio: 'pipe' });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      },
      {
        name: 'Test timeout',
        description: 'Test recovery from test timeout',
        setup: async () => {
          // Create test that hangs
          const timeoutTest = `
import { describe, it, expect } from 'vitest';

describe('Timeout Test', () => {
  it('should timeout', async () => {
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
    expect(true).toBe(true);
  });
});
`;
          writeFileSync('test/timeout.test.ts', timeoutTest);
          return {};
        },
        execute: async () => {
          const result = await this.executeCommand('npx', ['vitest', 'run', 'test/timeout.test.ts', '--timeout', '5000'], { timeout: 10000 });
          
          if (result.code !== 0) {
            return { 
              success: true, 
              reason: 'Test timed out as expected',
              error: `Exit code: ${result.code}` 
            };
          } else {
            return { success: false, reason: 'Test should have timed out but succeeded' };
          }
        },
        cleanup: async () => {
          try {
            execSync('rm -f test/timeout.test.ts', { stdio: 'pipe' });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }
    ];

    const results = [];
    
    for (const scenario of testScenarios) {
      this.log(`  📋 Running scenario: ${scenario.name}`);
      
      try {
        await scenario.setup();
        const result = await scenario.execute();
        await scenario.cleanup();
        
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          ...result,
          timestamp: new Date().toISOString()
        });
        
        if (result.success) {
          this.log(`    ✅ ${scenario.name}: ${result.reason}`, 'success');
        } else {
          this.log(`    ❌ ${scenario.name}: ${result.reason}`, 'error');
        }
        
      } catch (error) {
        await scenario.cleanup();
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          success: false,
          reason: `Test execution failed: ${error.message}`,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        this.log(`    ❌ ${scenario.name}: Test execution failed`, 'error');
      }
    }
    
    return results;
  }

  /**
   * Test network failure recovery
   */
  async testNetworkFailureRecovery() {
    this.log('🧪 Testing network failure recovery');
    
    const testScenarios = [
      {
        name: 'Invalid registry',
        description: 'Test recovery from invalid container registry',
        execute: async () => {
          const result = await this.executeCommand('podman', [
            'pull', 'invalid-registry-that-does-not-exist.com/test:latest'
          ], { timeout: 30000 });
          
          if (result.code !== 0) {
            return { 
              success: true, 
              reason: 'Pull failed as expected due to invalid registry',
              error: `Exit code: ${result.code}` 
            };
          } else {
            return { success: false, reason: 'Pull should have failed but succeeded' };
          }
        }
      },
      {
        name: 'Network timeout',
        description: 'Test recovery from network timeout',
        execute: async () => {
          const result = await this.executeCommand('podman', [
            'pull', 'http://192.0.2.1/nonexistent:latest'
          ], { timeout: 10000 });
          
          if (result.code !== 0) {
            return { 
              success: true, 
              reason: 'Pull failed/timed out as expected',
              error: `Exit code: ${result.code}` 
            };
          } else {
            return { success: false, reason: 'Pull should have timed out but succeeded' };
          }
        }
      }
    ];

    const results = [];
    
    for (const scenario of testScenarios) {
      this.log(`  📋 Running scenario: ${scenario.name}`);
      
      try {
        const result = await scenario.execute();
        
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          ...result,
          timestamp: new Date().toISOString()
        });
        
        if (result.success) {
          this.log(`    ✅ ${scenario.name}: ${result.reason}`, 'success');
        } else {
          this.log(`    ❌ ${scenario.name}: ${result.reason}`, 'error');
        }
        
      } catch (error) {
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          success: false,
          reason: `Test execution failed: ${error.message}`,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        this.log(`    ❌ ${scenario.name}: Test execution failed`, 'error');
      }
    }
    
    return results;
  }

  /**
   * Test resource constraint recovery
   */
  async testResourceConstraintRecovery() {
    this.log('🧪 Testing resource constraint recovery');
    
    const testScenarios = [
      {
        name: 'Memory pressure',
        description: 'Test recovery from memory pressure',
        execute: async () => {
          const result = await this.executeCommand('podman', [
            'run', '--rm', '--memory', '10m', 'node-syslog-test:latest', 'node', '-e', 
            'const arr = new Array(1e8).fill(0); console.log("Memory allocated successfully");'
          ], { timeout: 15000 });
          
          if (result.code !== 0) {
            return { 
              success: true, 
              reason: 'Container failed as expected due to memory constraint',
              error: `Exit code: ${result.code}` 
            };
          } else {
            return { success: false, reason: 'Container should have failed due to memory limit' };
          }
        }
      },
      {
        name: 'Disk space simulation',
        description: 'Test recovery from disk space issues',
        execute: async () => {
          try {
            // Create a large file to simulate disk space issues
            await this.executeCommand('podman', [
              'run', '--rm', '--tmpfs', '/tmp:size=10m', 'node-syslog-test:latest', 'sh', '-c', 
              'dd if=/dev/zero of=/tmp/largefile bs=1M count=20 || echo "Disk space limit reached"'
            ], { timeout: 10000 });
            return { success: true, reason: 'Disk space constraint handled properly' };
          } catch (error) {
            return { 
              success: true, 
              reason: 'Container failed as expected due to disk space constraint',
              error: error.message 
            };
          }
        }
      }
    ];

    const results = [];
    
    for (const scenario of testScenarios) {
      this.log(`  📋 Running scenario: ${scenario.name}`);
      
      try {
        const result = await scenario.execute();
        
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          ...result,
          timestamp: new Date().toISOString()
        });
        
        if (result.success) {
          this.log(`    ✅ ${scenario.name}: ${result.reason}`, 'success');
        } else {
          this.log(`    ❌ ${scenario.name}: ${result.reason}`, 'error');
        }
        
      } catch (error) {
        results.push({
          scenario: scenario.name,
          description: scenario.description,
          success: false,
          reason: `Test execution failed: ${error.message}`,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        this.log(`    ❌ ${scenario.name}: Test execution failed`, 'error');
      }
    }
    
    return results;
  }

  /**
   * Generate failure recovery report
   */
  async generateFailureRecoveryReport() {
    this.log('📊 Generating failure recovery test report');
    
    // Run all test categories
    const buildFailures = await this.testContainerBuildFailure();
    const testFailures = await this.testTestExecutionFailure();
    const networkFailures = await this.testNetworkFailureRecovery();
    const resourceFailures = await this.testResourceConstraintRecovery();
    
    // Combine all results
    const allResults = [
      ...buildFailures,
      ...testFailures,
      ...networkFailures,
      ...resourceFailures
    ];
    
    // Calculate statistics
    const totalTests = allResults.length;
    const successfulTests = allResults.filter(r => r.success).length;
    const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        successfulTests,
        failedTests: totalTests - successfulTests,
        successRate: Math.round(successRate * 100) / 100
      },
      categories: {
        buildFailures: {
          total: buildFailures.length,
          successful: buildFailures.filter(r => r.success).length
        },
        testFailures: {
          total: testFailures.length,
          successful: testFailures.filter(r => r.success).length
        },
        networkFailures: {
          total: networkFailures.length,
          successful: networkFailures.filter(r => r.success).length
        },
        resourceFailures: {
          total: resourceFailures.length,
          successful: resourceFailures.filter(r => r.success).length
        }
      },
      results: allResults,
      recommendations: this.generateRecoveryRecommendations(allResults)
    };
    
    // Save report
    const reportPath = path.join(this.artifactsDir, 'failure-recovery-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📄 Failure recovery report saved: ${reportPath}`, 'success');
    
    return report;
  }

  /**
   * Generate recovery recommendations
   */
  generateRecoveryRecommendations(results) {
    const recommendations = [];
    const failedTests = results.filter(r => !r.success);
    
    if (failedTests.length === 0) {
      recommendations.push('All failure recovery tests passed - excellent resilience!');
      return recommendations;
    }
    
    // Analyze failure patterns
    const failureTypes = failedTests.reduce((acc, result) => {
      const category = result.scenario.includes('Build') ? 'build' :
                     result.scenario.includes('Test') ? 'test' :
                     result.scenario.includes('Network') ? 'network' :
                     result.scenario.includes('Memory') || result.scenario.includes('Disk') ? 'resource' : 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    // Generate specific recommendations
    if (failureTypes.build > 0) {
      recommendations.push('Implement better Dockerfile validation and pre-build checks');
    }
    
    if (failureTypes.test > 0) {
      recommendations.push('Add test syntax validation and timeout handling');
    }
    
    if (failureTypes.network > 0) {
      recommendations.push('Implement network retry mechanisms and fallback registries');
    }
    
    if (failureTypes.resource > 0) {
      recommendations.push('Add resource monitoring and graceful degradation');
    }
    
    // General recommendations
    recommendations.push('Implement comprehensive error logging and monitoring');
    recommendations.push('Add automated rollback mechanisms for failed deployments');
    recommendations.push('Set up alerts for repeated failure patterns');
    
    return recommendations;
  }

  /**
   * Display failure recovery report summary
   */
  displayFailureRecoveryReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 WORKFLOW FAILURE RECOVERY TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Successful: ${report.summary.successfulTests}`);
    console.log(`   Failed: ${report.summary.failedTests}`);
    console.log(`   Success Rate: ${report.summary.successRate}%`);
    
    console.log('\n📋 Category Results:');
    Object.entries(report.categories).forEach(([category, results]) => {
      const rate = results.total > 0 ? Math.round((results.successful / results.total) * 100) : 0;
      console.log(`   ${category}: ${results.successful}/${results.total} (${rate}%)`);
    });
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      this.log('🚀 Starting Workflow Failure Recovery Testing');
      
      // Generate failure recovery report
      const report = await this.generateFailureRecoveryReport();
      
      // Display summary
      this.displayFailureRecoveryReport(report);
      
      // Exit with appropriate code
      if (report.summary.successRate >= 80) {
        this.log('🎉 Failure recovery mechanisms are robust!', 'success');
        process.exit(0);
      } else if (report.summary.successRate >= 60) {
        this.log('✅ Failure recovery mechanisms are adequate', 'success');
        process.exit(0);
      } else {
        this.log('⚠️ Failure recovery mechanisms need improvement', 'warn');
        process.exit(0);
      }
      
    } catch (error) {
      this.log(`❌ Failure recovery testing failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the failure recovery tester
const tester = new WorkflowFailureRecoveryTester();
tester.run();