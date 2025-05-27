#!/usr/bin/env node

/**
 * Comprehensive Father's Day Pricing Test
 * Tests all combinations and edge cases for Father's Day special pricing
 * Uses dynamic calculation from pricing-structure.json like other tests
 */

import { testPricingScenario, printTestResults, pricingStructure } from './pricing-test-utils.js';

console.log('🎂 Father\'s Day Pricing Tests - Auto-calculated from pricing-structure.json');
console.log('📋 Pricing structure loaded:');
console.log(`   Base 6-inch price: ₹${(pricingStructure.basePrices['6inch'] / 100).toFixed(2)}`);
console.log(`   Base 8-inch price: ₹${(pricingStructure.basePrices['8inch'] / 100).toFixed(2)}`);
console.log(`   Father's Day template price: ₹${(pricingStructure.templatePrices['fathers-day'] / 100).toFixed(2)}`);

const testCases = [
  // Test Case 1: Only 6-inch cakes
  {
    name: "1 x 6-inch Father's Day cake",
    data: {
      template: "fathers-day",
      sixInchCakes: 1,
      eightInchCakes: 0,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    }
  },
  
  // Test Case 2: Only 8-inch cakes
  {
    name: "1 x 8-inch Father's Day cake",
    data: {
      template: "fathers-day",
      sixInchCakes: 0,
      eightInchCakes: 1,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    }
  },
  
  // Test Case 3: Multiple 6-inch cakes
  {
    name: "3 x 6-inch Father's Day cakes",
    data: {
      template: "fathers-day",
      sixInchCakes: 3,
      eightInchCakes: 0,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    }
  },
  
  // Test Case 4: Multiple 8-inch cakes
  {
    name: "2 x 8-inch Father's Day cakes",
    data: {
      template: "fathers-day",
      sixInchCakes: 0,
      eightInchCakes: 2,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    }
  },
  
  // Test Case 5: Mixed sizes
  {
    name: "2 x 6-inch + 1 x 8-inch Father's Day cakes",
    data: {
      template: "fathers-day",
      sixInchCakes: 2,
      eightInchCakes: 1,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    }
  },
  
  // Test Case 6: Edge case - 0 cakes (should fail)
  {
    name: "0 cakes (should return error)",
    data: {
      template: "fathers-day",
      sixInchCakes: 0,
      eightInchCakes: 0,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    },
    expectError: true
  },
  
  // Test Case 7: Large order
  {
    name: "5 x 6-inch + 3 x 8-inch Father's Day cakes",
    data: {
      template: "fathers-day",
      sixInchCakes: 5,
      eightInchCakes: 3,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    }
  },
  
  // Test Case 8: Father's Day with different shapes
  {
    name: "1 x 6-inch Father's Day heart cake",
    data: {
      template: "fathers-day",
      sixInchCakes: 1,
      eightInchCakes: 0,
      layers: 1,
      shape: "heart",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    }
  },
  
  // Test Case 9: Father's Day with multiple layers
  {
    name: "1 x 8-inch Father's Day cake with 3 layers",
    data: {
      template: "fathers-day",
      sixInchCakes: 0,
      eightInchCakes: 1,
      layers: 3,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    }
  },
  
  // Test Case 10: Father's Day with flavors and decorations
  {
    name: "1 x 6-inch Father's Day chocolate cake with decorations",
    data: {
      template: "fathers-day",
      sixInchCakes: 1,
      eightInchCakes: 0,
      layers: 1,
      shape: "round",
      flavors: ["chocolate"],
      icingType: "chocolate",
      decorations: ["happy-birthday"],
      dietaryRestrictions: []
    }
  }
];

async function runSpecialErrorTest(testCase) {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📊 Data:`, JSON.stringify(testCase.data, null, 2));
    
    const response = await fetch('http://localhost:5000/api/calculate-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.data)
    });
    
    const result = await response.json();
    
    if (testCase.expectError) {
      // Expecting an error
      if (!response.ok) {
        console.log(`✅ Expected error received: ${result.message}`);
        return true;
      } else {
        console.log(`❌ Expected error but got success:`, result);
        return false;
      }
    }
    
    return false; // Should not reach here for error tests
  } catch (error) {
    if (testCase.expectError) {
      console.log(`✅ Expected error received: ${error.message}`);
      return true;
    } else {
      console.log(`❌ Test failed with error:`, error.message);
      return false;
    }
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting Father\'s Day Pricing Tests');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    let result;
    
    if (testCase.expectError) {
      // Handle error test cases specially
      result = { passed: await runSpecialErrorTest(testCase) };
    } else {
      // Use the standard pricing test utility
      result = await testPricingScenario(testCase.data, testCase.name);
      printTestResults(result);
    }
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Father\'s Day pricing is working correctly.');
    console.log('🎯 Self-maintaining tests - expectations automatically calculated from pricing-structure.json!');
  } else {
    console.log('⚠️  Some tests failed. Please check the pricing logic.');
  }
  
  return failed === 0;
}

// Run the tests
runAllTests().catch(console.error); 