import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Running Admin Styling Tests...\n');

const tests = [
  'test-admin-login-styling.js',
  'test-admin-layout.js', 
  'test-admin-orders-styling.js',
  'test-admin-pricing-styling.js',
  'test-admin-gallery-styling.js'
];

let completedTests = 0;
let failedTests = 0;

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running ${testFile}...`);
    
    const testPath = path.join(__dirname, testFile);
    const command = `npx playwright test ${testPath} --reporter=list`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ ${testFile} failed:`);
        console.error(stdout);
        if (stderr) console.error(stderr);
        failedTests++;
      } else {
        console.log(`✅ ${testFile} passed!`);
        if (stdout) console.log(stdout);
      }
      
      completedTests++;
      resolve();
    });
  });
}

async function runAllTests() {
  console.log(`Starting test suite with ${tests.length} test files...\n`);
  
  // Check if server is running
  console.log('⚠️  Make sure your development server is running on http://localhost:3456');
  console.log('⚠️  Admin credentials: username=admin, password=5SAoqv3xeQLX1AL\n');
  
  // Run tests sequentially to avoid conflicts
  for (const test of tests) {
    await runTest(test);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total tests: ${tests.length}`);
  console.log(`✅ Passed: ${completedTests - failedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log('='.repeat(50) + '\n');
  
  if (failedTests > 0) {
    console.log('💡 To debug failed tests, run them individually with:');
    console.log('   npx playwright test <test-file> --debug');
    console.log('\n💡 To see the browser while testing:');
    console.log('   npx playwright test <test-file> --headed');
    process.exit(1);
  } else {
    console.log('🎉 All admin styling tests passed!');
  }
}

// Run the tests
runAllTests().catch(console.error);