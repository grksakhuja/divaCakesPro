// COMPREHENSIVE PRICING VERIFICATION
console.log("🧪 COMPREHENSIVE PRICING VERIFICATION");
console.log("====================================");

const testScenarios = [
  {
    name: "Basic 6-inch cake",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, totalPrice: 8000 }
  },
  {
    name: "Basic 8-inch cake", 
    data: {"sixInchCakes":0,"eightInchCakes":1,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 15500, totalPrice: 15500 }
  },
  {
    name: "6-inch + chocolate flavor",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":["chocolate"],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, flavorPrice: 2000, totalPrice: 10000 }
  },
  {
    name: "6-inch + chocolate icing",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"chocolate","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, icingPrice: 2000, totalPrice: 10000 }
  },
  {
    name: "6-inch + flowers decoration",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":["flowers"],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, decorationTotal: 2000, totalPrice: 10000 }
  },
  {
    name: "6-inch + vegan option",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":["vegan"]},
    expected: { basePrice: 8000, dietaryUpcharge: 3500, totalPrice: 11500 }
  },
  {
    name: "6-inch + eggless option",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":["eggless"]},
    expected: { basePrice: 8000, dietaryUpcharge: 1000, totalPrice: 9000 }
  },
  {
    name: "6-inch + heart shape",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"heart","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, shapePrice: 1800, totalPrice: 9800 }
  },
  {
    name: "6-inch + 2 layers",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":2,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, layerPrice: 1500, totalPrice: 9500 }
  },
  {
    name: "Two 6-inch cakes",
    data: {"sixInchCakes":2,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 16000, totalPrice: 16000 }
  },
  {
    name: "Two 8-inch cakes",
    data: {"sixInchCakes":0,"eightInchCakes":2,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 31000, totalPrice: 31000 }
  },
  {
    name: "Mixed: 1×6-inch + 1×8-inch",
    data: {"sixInchCakes":1,"eightInchCakes":1,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 23500, totalPrice: 23500 }
  },
  {
    name: "Premium combo: 6-inch + chocolate flavor + chocolate icing + flowers + vegan",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers"],"dietaryRestrictions":["vegan"]},
    expected: { basePrice: 8000, flavorPrice: 2000, icingPrice: 2000, decorationTotal: 2000, dietaryUpcharge: 3500, totalPrice: 17500 }
  },
  {
    name: "Father's Day special",
    data: {"template":"fathers-day","sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { basePrice: 8000, totalPrice: 8000 }
  }
];

async function runComprehensiveTests() {
  let allTestsPassed = true;
  
  for (const test of testScenarios) {
    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      
      const result = await response.json();
      
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
      }
      
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR - ${error.message}`);
      allTestsPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL PRICING TESTS PASSED! The pricing system is working correctly.');
  } else {
    console.log('❌ Some pricing tests failed. Please review the errors above.');
  }
}

runComprehensiveTests();