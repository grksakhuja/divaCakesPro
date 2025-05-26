// Extensive Pricing Test - All Possible Combinations
const testCases = [
  // Single 6-inch cakes with various options
  { name: "Basic 6-inch", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 8000 },
  { name: "6-inch + chocolate flavor", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":["chocolate"],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 10000 },
  { name: "6-inch + chocolate icing", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"chocolate","decorations":[],"dietaryRestrictions":[]}, expected: 10000 },
  { name: "6-inch + both chocolate", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":["chocolate"],"icingType":"chocolate","decorations":[],"dietaryRestrictions":[]}, expected: 12000 },
  { name: "6-inch + heart shape", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"heart","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 9800 },
  { name: "6-inch + flowers", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":["flowers"],"dietaryRestrictions":[]}, expected: 10000 },
  { name: "6-inch + gold", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":["gold"],"dietaryRestrictions":[]}, expected: 9500 },
  { name: "6-inch + eggless", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":["eggless"]}, expected: 9000 },
  { name: "6-inch + vegan", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":["vegan"]}, expected: 11500 },
  { name: "6-inch + 2 layers", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":2,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 9500 },
  
  // Single 8-inch cakes
  { name: "Basic 8-inch", config: {"sixInchCakes":0,"eightInchCakes":1,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 15500 },
  { name: "8-inch + chocolate flavor", config: {"sixInchCakes":0,"eightInchCakes":1,"layers":1,"shape":"round","flavors":["chocolate"],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 17500 },
  { name: "8-inch + all premiums", config: {"sixInchCakes":0,"eightInchCakes":1,"layers":2,"shape":"heart","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers","gold"],"dietaryRestrictions":["eggless"]}, expected: 26300 },
  
  // Multiple 6-inch cakes
  { name: "Two 6-inch basic", config: {"sixInchCakes":2,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 16000 },
  { name: "Two 6-inch + chocolate", config: {"sixInchCakes":2,"eightInchCakes":0,"layers":1,"shape":"round","flavors":["chocolate"],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 20000 },
  { name: "Three 6-inch + heart", config: {"sixInchCakes":3,"eightInchCakes":0,"layers":1,"shape":"heart","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 29400 },
  
  // Multiple 8-inch cakes
  { name: "Two 8-inch basic", config: {"sixInchCakes":0,"eightInchCakes":2,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 31000 },
  { name: "Two 8-inch + decorations", config: {"sixInchCakes":0,"eightInchCakes":2,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":["flowers"],"dietaryRestrictions":[]}, expected: 35000 },
  
  // Mixed cake combinations
  { name: "1×6 + 1×8 basic", config: {"sixInchCakes":1,"eightInchCakes":1,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 23500 },
  { name: "1×6 + 1×8 + chocolate", config: {"sixInchCakes":1,"eightInchCakes":1,"layers":1,"shape":"round","flavors":["chocolate"],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 27500 },
  { name: "2×6 + 1×8 premium", config: {"sixInchCakes":2,"eightInchCakes":1,"layers":2,"shape":"heart","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers","gold"],"dietaryRestrictions":["vegan"]}, expected: 58900 },
  
  // Premium combinations
  { name: "Max premium 6-inch", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":3,"shape":"heart","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers","gold"],"dietaryRestrictions":["vegan"]}, expected: 18800 },
  { name: "Max premium 8-inch", config: {"sixInchCakes":0,"eightInchCakes":1,"layers":3,"shape":"heart","flavors":["chocolate"],"icingType":"chocolate","decorations":["flowers","gold"],"dietaryRestrictions":["vegan"]}, expected: 29300 },
  
  // Edge cases
  { name: "5×6-inch cakes", config: {"sixInchCakes":5,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 40000 },
  { name: "3×8-inch cakes", config: {"sixInchCakes":0,"eightInchCakes":3,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 46500 },
  { name: "Mixed max: 5×6 + 3×8", config: {"sixInchCakes":5,"eightInchCakes":3,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 86500 },
];

async function runExtensivePricingTests() {
  console.log("🧪 EXTENSIVE PRICING VERIFICATION");
  console.log("==================================");
  console.log(`Testing ${testCases.length} different combinations...\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.config)
      });
      
      const result = await response.json();
      const actualTotal = result.totalPrice;
      const expectedTotal = test.expected;
      
      if (actualTotal === expectedTotal) {
        console.log(`✅ ${test.name}: RM ${(actualTotal/100).toFixed(2)}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: Expected RM ${(expectedTotal/100).toFixed(2)}, got RM ${(actualTotal/100).toFixed(2)}`);
        console.log(`   Config: ${JSON.stringify(test.config)}`);
        failed++;
      }
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`${failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}`);
  
  return failed === 0;
}

runExtensivePricingTests();