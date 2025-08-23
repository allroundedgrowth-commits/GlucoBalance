#!/usr/bin/env node

/**
 * GlucoBalance Test Runner
 * Comprehensive test execution script for all test suites
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      ai: null,
      e2e: null
    };
    this.startTime = Date.now();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        ...options
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async checkDependencies() {
    this.log('\n🔍 Checking dependencies...', 'cyan');
    
    const requiredFiles = [
      'package.json',
      'vitest.config.js',
      'playwright.config.js'
    ];

    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        throw new Error(`Required file ${file} not found`);
      }
    }

    // Check if node_modules exists
    if (!existsSync('node_modules')) {
      this.log('📦 Installing dependencies...', 'yellow');
      await this.runCommand('npm', ['install']);
    }

    this.log('✅ Dependencies check passed', 'green');
  }

  async runUnitTests() {
    this.log('\n🧪 Running Unit Tests...', 'blue');
    try {
      await this.runCommand('npx', ['vitest', 'run', 'tests/unit/', '--reporter=verbose']);
      this.results.unit = 'passed';
      this.log('✅ Unit tests passed', 'green');
    } catch (error) {
      this.results.unit = 'failed';
      this.log('❌ Unit tests failed', 'red');
      throw error;
    }
  }

  async runIntegrationTests() {
    this.log('\n🔗 Running Integration Tests...', 'blue');
    try {
      await this.runCommand('npx', ['vitest', 'run', 'tests/integration/', '--reporter=verbose']);
      this.results.integration = 'passed';
      this.log('✅ Integration tests passed', 'green');
    } catch (error) {
      this.results.integration = 'failed';
      this.log('❌ Integration tests failed', 'red');
      throw error;
    }
  }

  async runAITests() {
    this.log('\n🤖 Running AI Content Quality Tests...', 'blue');
    try {
      await this.runCommand('npx', ['vitest', 'run', 'tests/ai/', '--reporter=verbose']);
      this.results.ai = 'passed';
      this.log('✅ AI tests passed', 'green');
    } catch (error) {
      this.results.ai = 'failed';
      this.log('❌ AI tests failed', 'red');
      throw error;
    }
  }

  async runE2ETests() {
    this.log('\n🌐 Running End-to-End Tests...', 'blue');
    try {
      // Check if Playwright browsers are installed
      try {
        await this.runCommand('npx', ['playwright', 'install', '--with-deps']);
      } catch (installError) {
        this.log('⚠️  Playwright browser installation failed, continuing...', 'yellow');
      }

      await this.runCommand('npx', ['playwright', 'test', '--reporter=html']);
      this.results.e2e = 'passed';
      this.log('✅ E2E tests passed', 'green');
    } catch (error) {
      this.results.e2e = 'failed';
      this.log('❌ E2E tests failed', 'red');
      throw error;
    }
  }

  async runCoverageReport() {
    this.log('\n📊 Generating Coverage Report...', 'cyan');
    try {
      await this.runCommand('npx', ['vitest', 'run', '--coverage', 'tests/unit/', 'tests/integration/', 'tests/ai/']);
      this.log('✅ Coverage report generated', 'green');
    } catch (error) {
      this.log('⚠️  Coverage report failed', 'yellow');
    }
  }

  printSummary() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);

    this.log('\n' + '='.repeat(60), 'bright');
    this.log('📋 TEST SUMMARY', 'bright');
    this.log('='.repeat(60), 'bright');

    const testSuites = [
      { name: 'Unit Tests', result: this.results.unit },
      { name: 'Integration Tests', result: this.results.integration },
      { name: 'AI Quality Tests', result: this.results.ai },
      { name: 'E2E Tests', result: this.results.e2e }
    ];

    testSuites.forEach(suite => {
      const status = suite.result === 'passed' ? '✅ PASSED' : 
                    suite.result === 'failed' ? '❌ FAILED' : 
                    '⏭️  SKIPPED';
      const color = suite.result === 'passed' ? 'green' : 
                   suite.result === 'failed' ? 'red' : 'yellow';
      
      this.log(`${suite.name.padEnd(20)} ${status}`, color);
    });

    this.log('='.repeat(60), 'bright');
    this.log(`⏱️  Total Duration: ${duration}s`, 'cyan');

    const passedCount = Object.values(this.results).filter(r => r === 'passed').length;
    const totalCount = Object.values(this.results).filter(r => r !== null).length;
    
    if (passedCount === totalCount && totalCount > 0) {
      this.log('🎉 ALL TESTS PASSED!', 'green');
      return true;
    } else {
      this.log(`⚠️  ${passedCount}/${totalCount} test suites passed`, 'yellow');
      return false;
    }
  }

  async run(options = {}) {
    try {
      this.log('🚀 Starting GlucoBalance Test Suite', 'bright');
      
      await this.checkDependencies();

      if (!options.skipUnit) {
        await this.runUnitTests();
      }

      if (!options.skipIntegration) {
        await this.runIntegrationTests();
      }

      if (!options.skipAI) {
        await this.runAITests();
      }

      if (!options.skipE2E && !options.fast) {
        await this.runE2ETests();
      }

      if (options.coverage) {
        await this.runCoverageReport();
      }

      const allPassed = this.printSummary();
      process.exit(allPassed ? 0 : 1);

    } catch (error) {
      this.log(`\n💥 Test execution failed: ${error.message}`, 'red');
      this.printSummary();
      process.exit(1);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  skipUnit: args.includes('--skip-unit'),
  skipIntegration: args.includes('--skip-integration'),
  skipAI: args.includes('--skip-ai'),
  skipE2E: args.includes('--skip-e2e'),
  fast: args.includes('--fast'),
  coverage: args.includes('--coverage')
};

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
GlucoBalance Test Runner

Usage: node tests/run-tests.js [options]

Options:
  --skip-unit         Skip unit tests
  --skip-integration  Skip integration tests
  --skip-ai          Skip AI quality tests
  --skip-e2e         Skip end-to-end tests
  --fast             Skip slow tests (E2E)
  --coverage         Generate coverage report
  --help, -h         Show this help message

Examples:
  node tests/run-tests.js                    # Run all tests
  node tests/run-tests.js --fast             # Run fast tests only
  node tests/run-tests.js --coverage         # Run with coverage
  node tests/run-tests.js --skip-e2e         # Skip E2E tests
`);
  process.exit(0);
}

// Run tests
const runner = new TestRunner();
runner.run(options);