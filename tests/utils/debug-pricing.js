// CRITICAL PRICING BUG INVESTIGATION
console.log("🔧 DEBUGGING CRITICAL PRICING BUG");
console.log("=================================");

const testCases = [
  {
    name: "Basic 6-inch cake (should be RM 80)",
    config: {
      sixInchCakes: 1,
      eightInchCakes: 0,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    },
    expected: 8000
  },
  {
    name: "Basic 8-inch cake (should be RM 155)",
    config: {
      sixInchCakes: 0,
      eightInchCakes: 1,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    },
    expected: 15500
  },
  {
    name: "Two 6-inch cakes (should be RM 160)",
    config: {
      sixInchCakes: 2,
      eightInchCakes: 0,
      layers: 1,
      shape: "round",
      flavors: [],
      icingType: "butter",
      decorations: [],
      dietaryRestrictions: []
    },
    expected: 16000
  }
];

async function debugPricing() {
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
      
      console.log(`${status} ${test.name}`);
      console.log(`   Expected: RM ${(expected/100).toFixed(2)}`);
      console.log(`   Actual:   RM ${(actual/100).toFixed(2)}`);
      console.log(`   Base:     RM ${(result.basePrice/100).toFixed(2)}`);
      console.log(`   Data sent:`, JSON.stringify(test.config));
      console.log('');
      
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR - ${error.message}`);
    }
  }
}

debugPricing();