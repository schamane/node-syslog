#!/usr/bin/env node

/**
 * CI Container Performance Optimizer
 * 
 * Optimizes container caching and performance for CI/CD environments.
 * Analyzes container build times, cache hit rates, and performance metrics.
 * 
 * Features:
 * - Container build performance analysis
 * - Cache optimization recommendations
 * - Layer optimization suggestions
 * - Performance benchmarking
 */

import { spawn, execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { performance } from 'perf_hooks';
import path from 'path';

class CIPerformanceOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.artifactsDir = path.join(this.projectRoot, '.ci-performance');
    this.metrics = {
      buildTimes: [],
      cacheHitRates: [],
      layerSizes: [],
      performanceScores: []
    };
    
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
      performance: '⚡'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Execute command and measure performance
   */
  async executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      this.log(`Executing: ${command} ${args.join(' ')}`, 'performance');
      
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

      child.on('close', (code) => {
        const duration = performance.now() - startTime;
        this.log(`Command completed in ${duration.toFixed(2)}ms with code ${code}`, 'performance');
        
        resolve({ stdout, stderr, code, duration });
      });

      child.on('error', (error) => {
        this.log(`Command execution error: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  /**
   * Analyze current Dockerfile for optimization opportunities
   */
  analyzeDockerfile() {
    this.log('🔍 Analyzing Dockerfile for optimization opportunities');
    
    const dockerfilePath = path.join(this.projectRoot, 'Dockerfile.optimized');
    if (!existsSync(dockerfilePath)) {
      this.log('Dockerfile.optimized not found', 'error');
      return null;
    }

    const content = readFileSync(dockerfilePath, 'utf8');
    const lines = content.split('\n');
    
    const analysis = {
      totalLines: lines.length,
      fromStatements: 0,
      runCommands: 0,
      copyCommands: 0,
      layerOptimizations: [],
      cacheOptimizations: [],
      sizeOptimizations: []
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim().toUpperCase();
      
      if (trimmed.startsWith('FROM')) {
        analysis.fromStatements++;
      } else if (trimmed.startsWith('RUN')) {
        analysis.runCommands++;
        
        // Check for optimization opportunities
        if (trimmed.includes('RM -RF') || trimmed.includes('DEL')) {
          analysis.layerOptimizations.push({
            line: index + 1,
            type: 'cleanup',
            suggestion: 'Combine cleanup with installation in same layer'
          });
        }
        
        if (trimmed.includes('NPM INSTALL') || trimmed.includes('PNPM INSTALL')) {
          if (!trimmed.includes('--NO-AUDIT') || !trimmed.includes('--NO-FUND')) {
            analysis.cacheOptimizations.push({
              line: index + 1,
              type: 'npm_flags',
              suggestion: 'Add --no-audit --no-fund flags for faster installs'
            });
          }
        }
      } else if (trimmed.startsWith('COPY')) {
        analysis.copyCommands++;
        
        // Check if copy follows package.json
        if (index > 0 && !lines.slice(0, index).some(l => l.trim().toUpperCase().includes('PACKAGE.JSON'))) {
          analysis.layerOptimizations.push({
            line: index + 1,
            type: 'dependency_order',
            suggestion: 'Copy package.json first to leverage layer caching'
          });
        }
      }
    });

    // Calculate optimization score
    const optimizationScore = this.calculateOptimizationScore(analysis);
    
    return {
      ...analysis,
      optimizationScore,
      recommendations: this.generateDockerfileRecommendations(analysis)
    };
  }

  /**
   * Calculate optimization score based on analysis
   */
  calculateOptimizationScore(analysis) {
    let score = 100;
    
    // Deduct points for optimization opportunities
    score -= analysis.layerOptimizations.length * 10;
    score -= analysis.cacheOptimizations.length * 5;
    score -= analysis.sizeOptimizations.length * 8;
    
    // Bonus points for good practices
    if (analysis.fromStatements <= 3) score += 5;
    if (analysis.runCommands <= 5) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate Dockerfile optimization recommendations
   */
  generateDockerfileRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.layerOptimizations.length > 0) {
      recommendations.push(`${analysis.layerOptimizations.length} layer optimization opportunities found`);
    }
    
    if (analysis.cacheOptimizations.length > 0) {
      recommendations.push(`${analysis.cacheOptimizations.length} cache optimization opportunities found`);
    }
    
    if (analysis.runCommands > 8) {
      recommendations.push('Consider combining RUN commands to reduce layers');
    }
    
    if (analysis.copyCommands > 4) {
      recommendations.push('Consider combining COPY commands where possible');
    }
    
    if (analysis.fromStatements > 3) {
      recommendations.push('Multi-stage build detected - ensure proper stage usage');
    }
    
    return recommendations;
  }

  /**
   * Benchmark container build performance
   */
  async benchmarkBuildPerformance() {
    this.log('⚡ Benchmarking container build performance');
    
    const scenarios = [
      {
        name: 'Cold Build (no cache)',
        args: ['build', '--no-cache', '-f', 'Dockerfile.optimized', '--target', 'runtime', '-t', 'perf-test:cold', '.'],
        expectedTime: 120000 // 2 minutes
      },
      {
        name: 'Warm Build (with cache)',
        args: ['build', '-f', 'Dockerfile.optimized', '--target', 'runtime', '-t', 'perf-test:warm', '.'],
        expectedTime: 30000 // 30 seconds
      },
      {
        name: 'Layer Cache Build',
        args: ['build', '--cache-from', 'type=local,src=/tmp/.buildx-cache', '-f', 'Dockerfile.optimized', '--target', 'runtime', '-t', 'perf-test:cached', '.'],
        expectedTime: 20000 // 20 seconds
      }
    ];

    const results = [];
    
    for (const scenario of scenarios) {
      this.log(`🏃 Running ${scenario.name}...`);
      
      try {
        const { duration, code } = await this.executeCommand('podman', scenario.args);
        
        const result = {
          name: scenario.name,
          duration,
          success: code === 0,
          expectedTime: scenario.expectedTime,
          performanceRatio: duration / scenario.expectedTime,
          withinTarget: duration <= scenario.expectedTime
        };
        
        results.push(result);
        
        if (result.withinTarget) {
          this.log(`✅ ${scenario.name}: ${duration.toFixed(0)}ms (within target)`, 'success');
        } else {
          this.log(`⚠️ ${scenario.name}: ${duration.toFixed(0)}ms (exceeded target of ${scenario.expectedTime}ms)`, 'warn');
        }
        
      } catch (error) {
        this.log(`❌ ${scenario.name} failed: ${error.message}`, 'error');
        results.push({
          name: scenario.name,
          duration: 0,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Analyze container image size
   */
  async analyzeImageSize() {
    this.log('📏 Analyzing container image size');
    
    try {
      const { stdout } = await this.executeCommand('podman', ['images', 'node-syslog-test:latest', '--format', '{{.Size}}']);
      const sizeStr = stdout.trim();
      
      // Parse size (e.g., "1.2GB" or "450MB" or "548 MB")
      const sizeMatch = sizeStr.match(/^([\d.]+)\s*([KMGT]?B)$/);
      if (!sizeMatch) {
        throw new Error(`Unable to parse size: ${sizeStr}`);
      }
      
      const size = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2];
      
      // Convert to MB
      let sizeMB = size;
      if (unit === 'GB') sizeMB *= 1024;
      else if (unit === 'KB') sizeMB /= 1024;
      
      const analysis = {
        size: sizeMB,
        unit: 'MB',
        sizeStr,
        efficient: sizeMB < 500, // Under 500MB is considered efficient
        recommendations: []
      };
      
      if (sizeMB > 1000) {
        analysis.recommendations.push('Image is large (>1GB) - consider multi-stage builds or alpine base');
      } else if (sizeMB > 500) {
        analysis.recommendations.push('Image size could be optimized - review dependencies and cleanup');
      }
      
      if (analysis.efficient) {
        this.log(`✅ Image size: ${sizeStr} (efficient)`, 'success');
      } else {
        this.log(`⚠️ Image size: ${sizeStr} (could be optimized)`, 'warn');
      }
      
      return analysis;
      
    } catch (error) {
      this.log(`❌ Image size analysis failed: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Generate cache optimization recommendations
   */
  generateCacheRecommendations(buildResults, dockerfileAnalysis) {
    const recommendations = [];
    
    // Build performance recommendations
    const coldBuild = buildResults.find(r => r.name.includes('Cold'));
    const warmBuild = buildResults.find(r => r.name.includes('Warm'));
    
    if (coldBuild && warmBuild) {
      const cacheEffectiveness = (coldBuild.duration - warmBuild.duration) / coldBuild.duration;
      
      if (cacheEffectiveness < 0.5) {
        recommendations.push('Cache effectiveness is low - review Dockerfile layer ordering');
      } else if (cacheEffectiveness > 0.8) {
        recommendations.push('Excellent cache effectiveness - layer ordering is optimal');
      }
    }
    
    // Dockerfile-specific recommendations
    if (dockerfileAnalysis) {
      recommendations.push(...dockerfileAnalysis.recommendations);
    }
    
    // General recommendations
    recommendations.push('Use .dockerignore to exclude unnecessary files');
    recommendations.push('Consider using BuildKit for advanced caching features');
    recommendations.push('Implement multi-stage builds for production images');
    
    return recommendations;
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport() {
    this.log('📊 Generating CI performance report');
    
    // Run all analyses
    const dockerfileAnalysis = this.analyzeDockerfile();
    const buildResults = await this.benchmarkBuildPerformance();
    const imageAnalysis = await this.analyzeImageSize();
    
    // Generate recommendations
    const recommendations = this.generateCacheRecommendations(buildResults, dockerfileAnalysis);
    
    // Calculate overall performance score
    const performanceScore = this.calculateOverallPerformanceScore(
      buildResults,
      dockerfileAnalysis,
      imageAnalysis
    );
    
    const report = {
      timestamp: new Date().toISOString(),
      performanceScore,
      dockerfile: dockerfileAnalysis,
      buildPerformance: buildResults,
      imageAnalysis,
      recommendations,
      summary: {
        totalBuilds: buildResults.length,
        successfulBuilds: buildResults.filter(r => r.success).length,
        averageBuildTime: buildResults.filter(r => r.success).reduce((sum, r) => sum + r.duration, 0) / buildResults.filter(r => r.success).length || 0,
        cacheEffective: buildResults.length >= 2 && buildResults[0].duration > buildResults[1].duration
      }
    };
    
    // Save report
    const reportPath = path.join(this.artifactsDir, 'performance-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📄 Performance report saved: ${reportPath}`, 'success');
    
    return report;
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallPerformanceScore(buildResults, dockerfileAnalysis, imageAnalysis) {
    let score = 0;
    let factors = 0;
    
    // Build performance (40% weight)
    if (buildResults.length > 0) {
      const successfulBuilds = buildResults.filter(r => r.success);
      if (successfulBuilds.length > 0) {
        const avgPerformanceRatio = successfulBuilds.reduce((sum, r) => sum + (r.performanceRatio || 1), 0) / successfulBuilds.length;
        score += Math.max(0, 100 - (avgPerformanceRatio - 1) * 50) * 0.4;
        factors += 0.4;
      }
    }
    
    // Dockerfile optimization (30% weight)
    if (dockerfileAnalysis) {
      score += dockerfileAnalysis.optimizationScore * 0.3;
      factors += 0.3;
    }
    
    // Image size efficiency (30% weight)
    if (imageAnalysis) {
      const sizeScore = imageAnalysis.efficient ? 100 : Math.max(0, 100 - (imageAnalysis.size - 500) / 10);
      score += sizeScore * 0.3;
      factors += 0.3;
    }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  }

  /**
   * Display performance report summary
   */
  displayPerformanceReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('⚡ CI CONTAINER PERFORMANCE REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Overall Performance Score: ${report.performanceScore}/100`);
    console.log(`🕒 Timestamp: ${report.timestamp}`);
    
    if (report.dockerfile) {
      console.log('\n📝 Dockerfile Analysis:');
      console.log(`   Optimization Score: ${report.dockerfile.optimizationScore}/100`);
      console.log(`   Total Lines: ${report.dockerfile.totalLines}`);
      console.log(`   RUN Commands: ${report.dockerfile.runCommands}`);
      console.log(`   COPY Commands: ${report.dockerfile.copyCommands}`);
    }
    
    if (report.buildPerformance.length > 0) {
      console.log('\n🏗️ Build Performance:');
      report.buildPerformance.forEach(result => {
        const status = result.success ? (result.withinTarget ? '✅' : '⚠️') : '❌';
        console.log(`   ${status} ${result.name}: ${result.duration.toFixed(0)}ms`);
      });
    }
    
    if (report.imageAnalysis) {
      console.log('\n📏 Image Analysis:');
      console.log(`   Size: ${report.imageAnalysis.sizeStr}`);
      console.log(`   Efficiency: ${report.imageAnalysis.efficient ? '✅ Efficient' : '⚠️ Could be optimized'}`);
    }
    
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
      this.log('🚀 Starting CI Container Performance Optimization');
      
      // Generate performance report
      const report = await this.generatePerformanceReport();
      
      // Display summary
      this.displayPerformanceReport(report);
      
      // Exit with appropriate code
      if (report.performanceScore >= 80) {
        this.log('🎉 CI performance is excellent!', 'success');
        process.exit(0);
      } else if (report.performanceScore >= 60) {
        this.log('✅ CI performance is good with room for improvement', 'success');
        process.exit(0);
      } else {
        this.log('⚠️ CI performance needs optimization', 'warn');
        process.exit(0);
      }
      
    } catch (error) {
      this.log(`❌ Performance optimization failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the optimizer
const optimizer = new CIPerformanceOptimizer();
optimizer.run();