// Comprehensive Pricing Test Script
const testScenarios = [
  {
    name: "Basic 6-inch + chocolate icing",
    data: {"layers":1,"servings":6,"decorations":[],"icingType":"chocolate","dietaryRestrictions":[],"flavors":[],"shape":"round","sixInchCakes":1,"eightInchCakes":0},
    expected: { basePrice: 8000, icingPrice: 2000, totalPrice: 10000 }
  },
  {
    name: "8-inch + chocolate flavor + chocolate icing",
    data: {"layers":1,"servings":8,"decorations":[],"icingType":"chocolate","dietaryRestrictions":[],"flavors":["chocolate"],"shape":"round","sixInchCakes":0,"eightInchCakes":1},
    expected: { basePrice: 15500, flavorPrice: 2000, icingPrice: 2000, totalPrice: 19500 }
  },
  {
    name: "Two 6-inch + flowers + vegan",
    data: {"layers":1,"servings":12,"decorations":["flowers"],"icingType":"butter","dietaryRestrictions":["vegan"],"flavors":[],"shape":"round","sixInchCakes":2,"eightInchCakes":0},
    expected: { basePrice: 16000, decorationTotal: 4000, dietaryUpcharge: 7000, totalPrice: 27000 }
  },
  {
    name: "Mixed cakes + all premiums",
    data: {"layers":2,"servings":14,"decorations":["flowers","gold"],"icingType":"chocolate","dietaryRestrictions":["eggless"],"flavors":["chocolate"],"shape":"heart","sixInchCakes":1,"eightInchCakes":1},
    expected: { basePrice: 23500, layerPrice: 3000, flavorPrice: 4000, shapePrice: 3600, decorationTotal: 7000, icingPrice: 4000, dietaryUpcharge: 2000, totalPrice: 47100 }
  },
  {
    name: "Father's Day special",
    data: {"layers":1,"servings":6,"decorations":[],"icingType":"butter","dietaryRestrictions":[],"flavors":["butter"],"shape":"round","template":"fathers-day"},
    expected: { basePrice: 8000, totalPrice: 8000 }
  }
];

async function testPricingAccuracy() {
  console.log("🧪 COMPREHENSIVE PRICING VERIFICATION");
  console.log("====================================");
  
  let allTestsPassed = true;
  
  for (const test of testScenarios) {
    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      
      const result = await response.json();
      
      console.log(`\n✅ ${test.name}:`);
      console.log(`   Base: RM ${(result.basePrice / 100).toFixed(2)} (expected: RM ${(test.expected.basePrice / 100).toFixed(2)})`);
      
      // Check individual components
      const checks = [
        { key: 'basePrice', label: 'Base' },
        { key: 'layerPrice', label: 'Layers' },
        { key: 'flavorPrice', label: 'Flavors' },
        { key: 'shapePrice', label: 'Shape' },
        { key: 'decorationTotal', label: 'Decorations' },
        { key: 'icingPrice', label: 'Icing' },
        { key: 'dietaryUpcharge', label: 'Dietary' },
      ];
      
      let testPassed = true;
      
      for (const check of checks) {
        if (test.expected[check.key] !== undefined) {
          const actual = result[check.key] || 0;
          const expected = test.expected[check.key];
          
          if (actual !== expected) {
            console.log(`   ❌ ${check.label}: RM ${(actual / 100).toFixed(2)} (expected: RM ${(expected / 100).toFixed(2)})`);
            testPassed = false;
            allTestsPassed = false;
          } else if (actual > 0) {
            console.log(`   ✅ ${check.label}: RM ${(actual / 100).toFixed(2)}`);
          }
        }
      }
      
      // Check total
      const totalMatch = result.totalPrice === test.expected.totalPrice;
      console.log(`   TOTAL: RM ${(result.totalPrice / 100).toFixed(2)} (expected: RM ${(test.expected.totalPrice / 100).toFixed(2)}) ${totalMatch ? '✅' : '❌'}`);
      
      if (!totalMatch) {
        testPassed = false;
        allTestsPassed = false;
      }
      
      console.log(`   ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      allTestsPassed = false;
    }
  }
  
  console.log(`\n${allTestsPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED - PRICING ISSUES DETECTED'}`);
  
  return allTestsPassed;
}

testPricingAccuracy();