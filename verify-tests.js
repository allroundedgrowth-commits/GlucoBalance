// Simple test verification script
console.log('🧪 Verifying GlucoBalance Test Suite Setup...\n');

// Check if test files exist
import { existsSync } from 'fs';
import { readFileSync } from 'fs';

const testFiles = [
  'tests/setup.js',
  'tests/unit/database.test.js',
  'tests/unit/auth.test.js',
  'tests/unit/ai.test.js',
  'tests/integration/database-ai.test.js',
  'tests/e2e/user-workflows.spec.js',
  'tests/ai/content-quality.test.js',
  'tests/utils/test-helpers.js',
  'vitest.config.js',
  'playwright.config.js',
  'package.json'
];

let allFilesExist = true;

console.log('📁 Checking test files...');
testFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json for test scripts
console.log('\n📦 Checking package.json test configuration...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['test', 'test:watch', 'test:coverage', 'test:e2e'];
  const requiredDevDeps = ['vitest', '@playwright/test', 'jsdom'];
  
  console.log('Scripts:');
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ ${script} - MISSING`);
      allFilesExist = false;
    }
  });
  
  console.log('\nDev Dependencies:');
  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
  
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allFilesExist = false;
}

// Check test structure
console.log('\n🏗️  Checking test structure...');

try {
  // Check if test files have proper imports and structure
  const testFileChecks = [
    {
      file: 'tests/unit/database.test.js',
      checks: ['describe', 'it', 'expect', 'beforeEach']
    },
    {
      file: 'tests/utils/test-helpers.js',
      checks: ['createMockUser', 'setupMockDatabase', 'mockFetchResponse']
    }
  ];
  
  testFileChecks.forEach(({ file, checks }) => {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf8');
      const hasAllChecks = checks.every(check => content.includes(check));
      
      if (hasAllChecks) {
        console.log(`✅ ${file} - Structure OK`);
      } else {
        console.log(`⚠️  ${file} - Structure incomplete`);
        const missingChecks = checks.filter(check => !content.includes(check));
        console.log(`   Missing: ${missingChecks.join(', ')}`);
      }
    }
  });
  
} catch (error) {
  console.log('❌ Error checking test structure:', error.message);
}

// Summary
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Test suite setup verification PASSED!');
  console.log('\n📋 Next steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Run unit tests: npm run test');
  console.log('3. Run all tests: node tests/run-tests.js');
  console.log('4. Generate coverage: npm run test:coverage');
} else {
  console.log('❌ Test suite setup verification FAILED!');
  console.log('\n🔧 Please check the missing files and configuration.');
}
console.log('='.repeat(50));