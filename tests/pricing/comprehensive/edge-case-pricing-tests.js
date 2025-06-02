// EDGE CASE AND STRESS TESTING FOR PRICING SYSTEM
console.log("🔬 EDGE CASE & STRESS TESTING");
console.log("============================");

const edgeCaseTests = [
  {
    name: "Edge: Zero cakes (should return error)",
    data: {"sixInchCakes":0,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expectError: true,
    expectedMessage: "Must select at least one cake"
  },
  {
    name: "Edge: Maximum layers (5 layers)",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":5,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, layerPrice: 6000, totalPrice: 14000 } // 4 extra layers × RM 15 × 1 cake
  },
  {
    name: "Edge: Multiple decorations",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":["flowers","gold","sprinkles"],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, decorationTotal: 4000, totalPrice: 12000 } // flowers(20) + gold(15) + sprinkles(5) = 40
  },
  {
    name: "Edge: Multiple flavors",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":["chocolate","vanilla-poppyseed"],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, flavorPrice: 2500, totalPrice: 10500 } // chocolate(20) + poppyseed(5) = 25
  },
  {
    name: "Edge: Large order (5 six-inch cakes)",
    data: {"sixInchCakes":5,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 40000, totalPrice: 40000 } // 5 × RM 80 = RM 400
  },
  {
    name: "Edge: Large order (3 eight-inch cakes)",
    data: {"sixInchCakes":0,"eightInchCakes":3,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 46500, totalPrice: 46500 } // 3 × RM 155 = RM 465
  },
  {
    name: "Edge: Mixed large order (3×6-inch + 2×8-inch)",
    data: {"sixInchCakes":3,"eightInchCakes":2,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 55000, totalPrice: 55000 } // (3×80) + (2×155) = 240 + 310 = RM 550
  },
  {
    name: "Edge: Ultimate premium cake (everything maxed)",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":3,"shape":"heart","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers","gold"],"dietaryRestrictions":["vegan"]},
    expected: { 
      basePrice: 8000, 
      layerPrice: 3000, 
      flavorPrice: 2000, 
      shapePrice: 1800, 
      decorationTotal: 3500, 
      icingPrice: 2000, 
      dietaryUpcharge: 3500,
      totalPrice: 23800 
    }
  },
  {
    name: "Edge: Multiple cakes with all premiums",
    data: {"sixInchCakes":2,"eightInchCakes":1,"layers":2,"shape":"heart","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers"],"dietaryRestrictions":["eggless"]},
    expected: { 
      basePrice: 31500, // (2×80) + (1×155) = 160 + 155 = RM 315
      layerPrice: 4500,  // 1 extra layer × RM 15 × 3 cakes = RM 45
      flavorPrice: 6000, // chocolate RM 20 × 3 cakes = RM 60
      shapePrice: 5400,  // heart RM 18 × 3 cakes = RM 54
      decorationTotal: 6000, // flowers RM 20 × 3 cakes = RM 60
      icingPrice: 6000,  // chocolate icing RM 20 × 3 cakes = RM 60
      dietaryUpcharge: 3000, // eggless RM 10 × 3 cakes = RM 30
      totalPrice: 62400  // Total: RM 624
    }
  },
  {
    name: "Edge: Invalid string inputs (should handle gracefully)",
    data: {"sixInchCakes":"1","eightInchCakes":"0","layers":"1","shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, totalPrice: 8000 }
  },
  {
    name: "Edge: Negative numbers (should default to 0)",
    data: {"sixInchCakes":-1,"eightInchCakes":1,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 15500, totalPrice: 15500 } // Should ignore negative sixInch, use 1 eightInch
  },
  {
    name: "Edge: Unknown decoration (should ignore)",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":["flowers","unknown-decoration"],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, decorationTotal: 2000, totalPrice: 10000 } // Only flowers counted
  },
  {
    name: "Edge: Unknown icing type (should default to 0 cost)",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"unknown-icing","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, icingPrice: 0, totalPrice: 8000 }
  }
];

async function runEdgeCaseTests() {
  let allTestsPassed = true;
  let testCount = 0;
  let passedCount = 0;
  
  for (const test of edgeCaseTests) {
    testCount++;
    
    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      
      const result = await response.json();
      
      // Handle error cases
      if (test.expectError) {
        if (response.status === 400 && result.message === test.expectedMessage) {
          console.log(`✅ ${test.name}`);
          console.log(`   Correctly returned error: "${result.message}"`);
          passedCount++;
        } else {
          console.log(`❌ ${test.name}`);
          console.log(`   Expected error "${test.expectedMessage}", got:`, result);
          allTestsPassed = false;
        }
        continue;
      }
      
      // Handle success cases
      if (response.status !== 200) {
        console.log(`❌ ${test.name}`);
        console.log(`   Unexpected error:`, result);
        allTestsPassed = false;
        continue;
      }
      
      let testPassed = true;
      const errors = [];
      
      // Check all expected values
      for (const [key, expectedValue] of Object.entries(test.expected)) {
        const actualValue = result[key] || 0;
        if (actualValue !== expectedValue) {
          testPassed = false;
          errors.push(`${key}: expected ${expectedValue}, got ${actualValue}`);
        }
      }
      
      const status = testPassed ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      
      if (!testPassed) {
        allTestsPassed = false;
        console.log(`   Errors: ${errors.join(', ')}`);
        console.log(`   Full result:`, result);
      } else {
        console.log(`   Total: RM ${(result.totalPrice / 100).toFixed(2)}`);
        passedCount++;
      }
      
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR - ${error.message}`);
      allTestsPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 EDGE CASE TEST RESULTS: ${passedCount}/${testCount} tests passed`);
  
  if (allTestsPassed) {
    console.log('🎉 ALL EDGE CASE TESTS PASSED! The pricing system is robust and handles all edge cases correctly.');
  } else {
    console.log('❌ Some edge case tests failed. Please review the errors above.');
  }
}

runEdgeCaseTests();