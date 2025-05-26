// Pricing Test Script
const testCases = [
  {
    name: "6-inch butter cake",
    data: {"layers":1,"servings":6,"decorations":[],"icingType":"butter","dietaryRestrictions":[],"flavors":["butter"],"shape":"round","photoUpload":false},
    expected: { basePrice: 8000, totalPrice: 8000 }
  },
  {
    name: "8-inch butter cake", 
    data: {"layers":1,"servings":8,"decorations":[],"icingType":"butter","dietaryRestrictions":[],"flavors":["butter"],"shape":"round","photoUpload":false},
    expected: { basePrice: 15500, totalPrice: 15500 }
  },
  {
    name: "6-inch chocolate cake",
    data: {"layers":1,"servings":6,"decorations":[],"icingType":"butter","dietaryRestrictions":[],"flavors":["chocolate"],"shape":"round","photoUpload":false},
    expected: { basePrice: 8000, flavorPrice: 2000, totalPrice: 10000 }
  },
  {
    name: "Father's Day special",
    data: {"layers":1,"servings":6,"decorations":[],"icingType":"butter","dietaryRestrictions":[],"flavors":["butter"],"shape":"round","photoUpload":false,"template":"fathers-day"},
    expected: { basePrice: 8000, totalPrice: 8000 }
  },
  {
    name: "2x 6-inch cakes (12 servings)",
    data: {"layers":1,"servings":12,"decorations":[],"icingType":"butter","dietaryRestrictions":[],"flavors":["butter"],"shape":"round","photoUpload":false},
    expected: { basePrice: 16000, totalPrice: 16000 }
  }
];

async function testPricing() {
  console.log("🧪 Testing Cake Pricing System");
  console.log("==============================");
  
  for (const test of testCases) {
    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      
      const result = await response.json();
      
      console.log(`\n✅ ${test.name}:`);
      console.log(`   Base Price: RM ${(result.basePrice / 100).toFixed(2)} (expected: RM ${(test.expected.basePrice / 100).toFixed(2)})`);
      
      if (test.expected.flavorPrice) {
        console.log(`   Flavor Price: RM ${(result.flavorPrice / 100).toFixed(2)} (expected: RM ${(test.expected.flavorPrice / 100).toFixed(2)})`);
      }
      
      console.log(`   Total Price: RM ${(result.totalPrice / 100).toFixed(2)} (expected: RM ${(test.expected.totalPrice / 100).toFixed(2)})`);
      
      // Verify expectations
      const basePriceMatch = result.basePrice === test.expected.basePrice;
      const totalPriceMatch = result.totalPrice === test.expected.totalPrice;
      const flavorPriceMatch = !test.expected.flavorPrice || result.flavorPrice === test.expected.flavorPrice;
      
      if (basePriceMatch && totalPriceMatch && flavorPriceMatch) {
        console.log(`   ✅ PASS`);
      } else {
        console.log(`   ❌ FAIL`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }
}

testPricing();