// Pricing Test Script
const testCases = [
  {
    name: "6-inch butter cake",
    data: {
      layers: 1,
      servings: 6,
      decorations: [],
      icingType: "butter",
      dietaryRestrictions: [],
      flavors: ["butter"],
      shape: "round",
      photoUpload: false,
      sixInchCakes: 1,
      eightInchCakes: 0
    },
    expected: { basePrice: 8000, totalPrice: 8000 }
  },
  {
    name: "8-inch orange cake with buttercream icing", 
    data: {
      layers: 1,
      servings: 8,
      decorations: [],
      icingType: "buttercream",
      dietaryRestrictions: [],
      flavors: ["orange"],
      shape: "round",
      photoUpload: false,
      sixInchCakes: 0,
      eightInchCakes: 1
    },
    expected: { basePrice: 15500, icingPrice: 1000, totalPrice: 16500 }
  },
  {
    name: "6-inch chocolate cake with flowers decoration",
    data: {
      layers: 1,
      servings: 6,
      decorations: ["flowers"],
      icingType: "butter",
      dietaryRestrictions: [],
      flavors: ["chocolate"],
      shape: "round",
      photoUpload: false,
      sixInchCakes: 1,
      eightInchCakes: 0
    },
    expected: { basePrice: 8000, flavorPrice: 0, decorationTotal: 1500, totalPrice: 9500 }
  },
  {
    name: "Father's Day special",
    data: {
      layers: 1,
      servings: 6,
      decorations: [],
      icingType: "butter",
      dietaryRestrictions: [],
      flavors: ["butter"],
      shape: "round",
      photoUpload: false,
      template: "fathers-day",
      sixInchCakes: 1,
      eightInchCakes: 0
    },
    expected: { basePrice: 8000, totalPrice: 8000 }
  },
  {
    name: "2x 6-inch lemon-poppyseed cakes with halal option",
    data: {
      layers: 1,
      servings: 12,
      decorations: ["gold-leaf"],
      icingType: "butter",
      dietaryRestrictions: ["halal"],
      flavors: ["lemon-poppyseed"],
      shape: "round",
      photoUpload: false,
      sixInchCakes: 2,
      eightInchCakes: 0
    },
    expected: { basePrice: 16000, flavorPrice: 1000, decorationTotal: 3000, dietaryUpcharge: 1000, totalPrice: 21000 }
  },
  {
    name: "8-inch orange-poppyseed cake with multi-layers and square shape",
    data: {
      layers: 3,
      servings: 8,
      decorations: ["fresh-fruit"],
      icingType: "fondant",
      dietaryRestrictions: [],
      flavors: ["orange-poppyseed"],
      shape: "square",
      photoUpload: false,
      sixInchCakes: 0,
      eightInchCakes: 1
    },
    expected: { basePrice: 15500, layerPrice: 3000, flavorPrice: 500, decorationTotal: 1200, icingPrice: 1000, totalPrice: 21200 }
  },
  {
    name: "Mixed order: 1x 6-inch + 1x 8-inch with vegan option",
    data: {
      layers: 2,
      servings: 14,
      decorations: ["happy-birthday"],
      icingType: "whipped",
      dietaryRestrictions: ["vegan"],
      flavors: ["chocolate", "lemon"],
      shape: "heart",
      photoUpload: false,
      sixInchCakes: 1,
      eightInchCakes: 1
    },
    expected: { basePrice: 23500, layerPrice: 3000, shapePrice: 3600, decorationTotal: 1400, icingPrice: 2000, dietaryUpcharge: 7000, totalPrice: 40500 }
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
      console.log(`   Request: ${JSON.stringify(test.data)}`);
      
      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}: ${result.message || 'Unknown error'}`);
        continue;
      }
      
      console.log(`   Base Price: RM ${(result.basePrice / 100).toFixed(2)} (expected: RM ${(test.expected.basePrice / 100).toFixed(2)})`);
      
      if (test.expected.layerPrice) {
        console.log(`   Layer Price: RM ${(result.layerPrice / 100).toFixed(2)} (expected: RM ${(test.expected.layerPrice / 100).toFixed(2)})`);
      }
      
      if (test.expected.flavorPrice) {
        console.log(`   Flavor Price: RM ${(result.flavorPrice / 100).toFixed(2)} (expected: RM ${(test.expected.flavorPrice / 100).toFixed(2)})`);
      }
      
      if (test.expected.shapePrice) {
        console.log(`   Shape Price: RM ${(result.shapePrice / 100).toFixed(2)} (expected: RM ${(test.expected.shapePrice / 100).toFixed(2)})`);
      }
      
      if (test.expected.decorationTotal) {
        console.log(`   Decoration Total: RM ${(result.decorationTotal / 100).toFixed(2)} (expected: RM ${(test.expected.decorationTotal / 100).toFixed(2)})`);
      }
      
      if (test.expected.icingPrice) {
        console.log(`   Icing Price: RM ${(result.icingPrice / 100).toFixed(2)} (expected: RM ${(test.expected.icingPrice / 100).toFixed(2)})`);
      }
      
      if (test.expected.dietaryUpcharge) {
        console.log(`   Dietary Upcharge: RM ${(result.dietaryUpcharge / 100).toFixed(2)} (expected: RM ${(test.expected.dietaryUpcharge / 100).toFixed(2)})`);
      }
      
      console.log(`   Total Price: RM ${(result.totalPrice / 100).toFixed(2)} (expected: RM ${(test.expected.totalPrice / 100).toFixed(2)})`);
      
      // Verify expectations
      const basePriceMatch = result.basePrice === test.expected.basePrice;
      const totalPriceMatch = result.totalPrice === test.expected.totalPrice;
      const layerPriceMatch = !test.expected.layerPrice || result.layerPrice === test.expected.layerPrice;
      const flavorPriceMatch = !test.expected.flavorPrice || result.flavorPrice === test.expected.flavorPrice;
      const shapePriceMatch = !test.expected.shapePrice || result.shapePrice === test.expected.shapePrice;
      const decorationMatch = !test.expected.decorationTotal || result.decorationTotal === test.expected.decorationTotal;
      const icingMatch = !test.expected.icingPrice || result.icingPrice === test.expected.icingPrice;
      const dietaryMatch = !test.expected.dietaryUpcharge || result.dietaryUpcharge === test.expected.dietaryUpcharge;
      
      if (basePriceMatch && totalPriceMatch && layerPriceMatch && flavorPriceMatch && shapePriceMatch && decorationMatch && icingMatch && dietaryMatch) {
        console.log(`   ✅ PASS`);
      } else {
        console.log(`   ❌ FAIL - Mismatched values:`);
        if (!basePriceMatch) console.log(`     - Base price: got ${result.basePrice}, expected ${test.expected.basePrice}`);
        if (!layerPriceMatch) console.log(`     - Layer price: got ${result.layerPrice}, expected ${test.expected.layerPrice}`);
        if (!flavorPriceMatch) console.log(`     - Flavor price: got ${result.flavorPrice}, expected ${test.expected.flavorPrice}`);
        if (!shapePriceMatch) console.log(`     - Shape price: got ${result.shapePrice}, expected ${test.expected.shapePrice}`);
        if (!decorationMatch) console.log(`     - Decoration total: got ${result.decorationTotal}, expected ${test.expected.decorationTotal}`);
        if (!icingMatch) console.log(`     - Icing price: got ${result.icingPrice}, expected ${test.expected.icingPrice}`);
        if (!dietaryMatch) console.log(`     - Dietary upcharge: got ${result.dietaryUpcharge}, expected ${test.expected.dietaryUpcharge}`);
        if (!totalPriceMatch) console.log(`     - Total price: got ${result.totalPrice}, expected ${test.expected.totalPrice}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }
}

testPricing();