// Quick pricing verification for core scenarios
const testCases = [
  { name: "Basic 6-inch", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 8000 },
  { name: "Basic 8-inch", config: {"sixInchCakes":0,"eightInchCakes":1,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 15500 },
  { name: "Two 6-inch", config: {"sixInchCakes":2,"eightInchCakes":0,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 16000 },
  { name: "1×6 + 1×8", config: {"sixInchCakes":1,"eightInchCakes":1,"layers":1,"shape":"round","flavors":[],"icingType":"butter","decorations":[],"dietaryRestrictions":[]}, expected: 23500 },
  { name: "6-inch + chocolate", config: {"sixInchCakes":1,"eightInchCakes":0,"layers":1,"shape":"round","flavors":["chocolate"],"icingType":"chocolate","decorations":[],"dietaryRestrictions":[]}, expected: 12000 }
];

async function quickPricingCheck() {
  console.log("🔧 QUICK PRICING VERIFICATION");
  console.log("=============================");
  
  for (const test of testCases) {
    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.config)
      });
      
      const result = await response.json();
      const actual = result.totalPrice;
      const expected = test.expected;
      const status = actual === expected ? '✅' : '❌';
      
      console.log(`${status} ${test.name}: Expected RM ${(expected/100).toFixed(2)}, got RM ${(actual/100).toFixed(2)}`);
      
      if (actual !== expected) {
        console.log(`   Base: ${result.basePrice}, Flavor: ${result.flavorPrice || 0}, Icing: ${result.icingPrice || 0}`);
      }
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR - ${error.message}`);
    }
  }
}

quickPricingCheck();