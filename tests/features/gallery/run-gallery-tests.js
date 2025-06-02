#!/usr/bin/env node

/**
 * Gallery Test Runner
 * Runs all gallery-related tests in the correct order:
 * 1. Database schema tests
 * 2. Instagram service tests  
 * 3. API integration tests
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Gallery Test Suite Runner\n');

const tests = [
  {
    name: 'Database Schema Tests',
    path: path.join(__dirname, '../../database/test-gallery-schema.js'),
    description: 'Validates gallery_images table structure and constraints'
  },
  {
    name: 'Instagram Service Tests',
    path: path.join(__dirname, 'test-instagram-service.js'),
    description: 'Tests Instagram URL processing and embed generation'
  },
  {
    name: 'Gallery API Tests',
    path: path.join(__dirname, 'test-gallery-api.js'),
    description: 'Tests all gallery API endpoints and authentication'
  }
];

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Running: ${test.name}`);
    console.log(`📋 ${test.description}`);
    console.log(`📁 ${test.path}\n`);

    const startTime = Date.now();
    const child = spawn('node', [test.path], {
      stdio: 'pipe',
      cwd: path.resolve(__dirname, '../../../')
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const result = {
        name: test.name,
        success: code === 0,
        duration,
        output,
        errorOutput
      };

      if (code === 0) {
        console.log(`\n✅ ${test.name} completed successfully (${duration}ms)\n`);
      } else {
        console.log(`\n❌ ${test.name} failed with exit code ${code} (${duration}ms)\n`);
      }

      console.log('─'.repeat(80));
      resolve(result);
    });

    child.on('error', (error) => {
      console.log(`\n❌ ${test.name} failed to start: ${error.message}\n`);
      console.log('─'.repeat(80));
      resolve({
        name: test.name,
        success: false,
        duration: Date.now() - startTime,
        output: '',
        errorOutput: error.message
      });
    });
  });
}

async function runAllTests() {
  console.log('🚀 Starting Gallery Test Suite...\n');
  console.log(`📊 Running ${tests.length} test suites:\n`);

  tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}`);
    console.log(`   ${test.description}`);
  });

  console.log('\n' + '═'.repeat(80));

  const results = [];
  let totalDuration = 0;

  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
    totalDuration += result.duration;

    // If a test fails, ask if we should continue
    if (!result.success) {
      console.log(`\n⚠️ ${test.name} failed. Continuing with remaining tests...\n`);
    }
  }

  // Final Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 GALLERY TEST SUITE SUMMARY');
  console.log('═'.repeat(80));

  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.length - passedTests;

  console.log(`\n📈 Overall Results:`);
  console.log(`   Total Test Suites: ${results.length}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${failedTests}`);
  console.log(`   Success Rate: ${((passedTests/results.length) * 100).toFixed(1)}%`);
  console.log(`   Total Duration: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);

  console.log(`\n📋 Detailed Results:`);
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const duration = `${result.duration}ms`;
    console.log(`   ${index + 1}. ${status} ${result.name} (${duration})`);
  });

  if (failedTests > 0) {
    console.log(`\n❌ Some tests failed. Check the detailed output above.`);
    console.log(`\n🔧 Debugging Tips:`);
    console.log(`   - Ensure the server is running (npm run dev)`);
    console.log(`   - Check database connection and schema`);
    console.log(`   - Verify admin credentials in .env file`);
    console.log(`   - Check server logs for detailed error information`);
  } else {
    console.log(`\n🎉 All gallery tests passed! Gallery system is fully functional.`);
  }

  console.log('\n' + '═'.repeat(80));

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️ Test suite interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️ Test suite terminated');
  process.exit(1);
});

runAllTests().catch((error) => {
  console.error('\n❌ Test runner failed:', error.message);
  process.exit(1);
});