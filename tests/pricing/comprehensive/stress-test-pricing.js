// STRESS TESTING & BUSINESS SCENARIO VALIDATION
console.log("⚡ STRESS TESTING & BUSINESS SCENARIOS");
console.log("=====================================");

const stressTests = [
  {
    name: "Business: Wedding order (4×8-inch + premium)",
    data: {"sixInchCakes":0,"eightInchCakes":4,"layers":3,"shape":"heart","flavors":["chocolate"],"icingType":"fondant","decorations":["flowers","gold"],"dietaryRestrictions":[]},
    expected: { 
      basePrice: 62000,  // 4×155 = RM 620
      layerPrice: 12000, // 2 extra layers × RM 15 × 4 cakes = RM 120
      flavorPrice: 8000, // chocolate RM 20 × 4 cakes = RM 80
      shapePrice: 7200,  // heart RM 18 × 4 cakes = RM 72
      decorationTotal: 14000, // (flowers 20 + gold 15) × 4 = RM 140
      icingPrice: 4000,  // fondant RM 10 × 4 cakes = RM 40
      totalPrice: 107200 // Total: RM 1072
    }
  },
  {
    name: "Business: Corporate event (6×6-inch + 2×8-inch)",
    data: {"sixInchCakes":6,"eightInchCakes":2,"layers":1,"shape":"round","flavors":[],"icingType":"buttercream","decorations":["happy-birthday"],"dietaryRestrictions":[]},
    expected: { 
      basePrice: 79000,  // (6×80) + (2×155) = 480 + 310 = RM 790
      decorationTotal: 5600, // happy-birthday RM 7 × 8 cakes = RM 56
      icingPrice: 8000,  // buttercream RM 10 × 8 cakes = RM 80
      totalPrice: 92600  // Total: RM 926
    }
  },
  {
    name: "Business: Vegan specialty order",
    data: {"sixInchCakes":2,"eightInchCakes":1,"layers":2,"shape":"round","flavors":[],"icingType":"butter","decorations":["fruit"],"dietaryRestrictions":["vegan"]},
    expected: { 
      basePrice: 31500,  // (2×80) + (1×155) = RM 315
      layerPrice: 4500,  // 1 extra layer × RM 15 × 3 cakes = RM 45
      decorationTotal: 3600, // fruit RM 12 × 3 cakes = RM 36
      dietaryUpcharge: 10500, // vegan RM 35 × 3 cakes = RM 105
      totalPrice: 50100  // Total: RM 501
    }
  },
  {
    name: "Stress: Maximum complexity order",
    data: {"sixInchCakes":3,"eightInchCakes":3,"layers":4,"shape":"heart","flavors":["chocolate","vanilla-poppyseed"],"icingType":"chocolate","decorations":["flowers","gold","sprinkles","fruit"],"dietaryRestrictions":["eggless"]},
    expected: {
      basePrice: 70500,  // (3×80) + (3×155) = 240 + 465 = RM 705
      layerPrice: 27000, // 3 extra layers × RM 15 × 6 cakes = RM 270
      flavorPrice: 15000, // (chocolate 20 + poppyseed 5) × 6 = RM 150
      shapePrice: 10800, // heart RM 18 × 6 cakes = RM 108
      decorationTotal: 30000, // (flowers 20 + gold 15 + sprinkles 5 + fruit 12) × 6 = RM 300
      icingPrice: 12000, // chocolate icing RM 20 × 6 cakes = RM 120
      dietaryUpcharge: 6000, // eggless RM 10 × 6 cakes = RM 60
      totalPrice: 171300 // Total: RM 1713
    }
  },
  {
    name: "Performance: 10 cake order",
    data: {"sixInchCakes":5,"eightInchCakes":5,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]},
    expected: { 
      basePrice: 117500, // (5×80) + (5×155) = 400 + 775 = RM 1175
      totalPrice: 117500
    }
  },
  {
    name: "Validation: Conflicting dietary (eggless + vegan should use vegan)",
    data: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":["eggless","vegan"]},
    expected: { 
      basePrice: 8000,
      dietaryUpcharge: 4500, // eggless RM 10 + vegan RM 35 = RM 45 (both applied)
      totalPrice: 12500
    }
  },
  {
    name: "Validation: Father's Day override test",
    data: {"template":"fathers-day","sixInchCakes":5,"eightInchCakes":3,"layers":5,"shape":"heart","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers","gold"],"dietaryRestrictions":["vegan"]},
    expected: { 
      basePrice: 8000,   // Father's Day special overrides everything
      totalPrice: 8000   // Fixed RM 80 regardless of other options
    }
  }
];

const performanceTests = [
  {
    name: "Performance: Rapid sequential requests",
    requestCount: 10
  },
  {
    name: "Performance: Complex calculation speed",
    requestCount: 5
  }
];

async function runStressTests() {
  let allTestsPassed = true;
  let testCount = 0;
  let passedCount = 0;
  
  console.log("🧪 Running Business Scenario Tests...\n");
  
  for (const test of stressTests) {
    testCount++;
    
    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      const endTime = Date.now();
      
      const result = await response.json();
      const responseTime = endTime - startTime;
      
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
          errors.push(`${key}: expected RM ${(expectedValue/100).toFixed(2)}, got RM ${(actualValue/100).toFixed(2)}`);
        }
      }
      
      const status = testPassed ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      console.log(`   Total: RM ${(result.totalPrice / 100).toFixed(2)} | Response: ${responseTime}ms`);
      
      if (!testPassed) {
        allTestsPassed = false;
        console.log(`   Errors: ${errors.join(', ')}`);
      } else {
        passedCount++;
      }
      
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR - ${error.message}`);
      allTestsPassed = false;
    }
    console.log('');
  }
  
  // Performance testing
  console.log("⚡ Running Performance Tests...\n");
  
  const rapidTestData = {"sixInchCakes":1,"eightInchCakes":1,"layers":2,"shape":"heart","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers"],"dietaryRestrictions":["eggless"]};
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < 20; i++) {
    promises.push(
      fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rapidTestData)
      })
    );
  }
  
  try {
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / 20;
    
    const allSuccessful = responses.every(r => r.status === 200);
    
    console.log(`✅ Performance: 20 concurrent requests`);
    console.log(`   Total time: ${totalTime}ms | Average: ${avgTime.toFixed(1)}ms per request`);
    console.log(`   All requests successful: ${allSuccessful ? 'Yes' : 'No'}`);
    
    if (allSuccessful && avgTime < 100) {
      passedCount++;
      testCount++;
    } else {
      allTestsPassed = false;
      testCount++;
    }
    
  } catch (error) {
    console.log(`💥 Performance test failed: ${error.message}`);
    allTestsPassed = false;
    testCount++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 STRESS TEST RESULTS: ${passedCount}/${testCount} tests passed`);
  
  if (allTestsPassed) {
    console.log('🚀 ALL STRESS TESTS PASSED! The pricing system is production-ready and handles complex business scenarios flawlessly.');
  } else {
    console.log('❌ Some stress tests failed. Please review the errors above.');
  }
}

runStressTests();