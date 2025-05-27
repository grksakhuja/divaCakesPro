// Pricing Test Script - Dynamic pricing based on API
let pricingStructure = null;

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
    calculateExpected: (pricing) => ({ 
      basePrice: pricing.basePrices['6inch'], 
      totalPrice: pricing.basePrices['6inch'] 
    })
  },
  {
    name: "8-inch orange cake with buttercream icing",
    data: {
      layers: 2,
      servings: 10,
      decorations: [],
      icingType: "buttercream",
      dietaryRestrictions: [],
      flavors: ["orange"],
      shape: "round",
      photoUpload: false,
      sixInchCakes: 0,
      eightInchCakes: 1
    },
    calculateExpected: (pricing) => ({ 
      basePrice: pricing.basePrices['8inch'] + pricing.layerPrice, // 2 layers = base + 1 additional
      layerPrice: pricing.layerPrice,
      icingPrice: pricing.icingTypes.buttercream,
      totalPrice: pricing.basePrices['8inch'] + pricing.layerPrice + pricing.icingTypes.buttercream
    })
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
    calculateExpected: (pricing) => ({ 
      basePrice: pricing.basePrices['6inch'], 
      flavorPrice: 0, 
      decorationTotal: pricing.decorationPrices.flowers,
      totalPrice: pricing.basePrices['6inch'] + pricing.decorationPrices.flowers
    })
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
    calculateExpected: (pricing) => ({ 
      basePrice: pricing.basePrices['6inch'], 
      templatePrice: pricing.templatePrices['fathers-day'] || 0,
      totalPrice: pricing.basePrices['6inch'] + (pricing.templatePrices['fathers-day'] || 0)
    })
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
    calculateExpected: (pricing) => ({ 
      basePrice: pricing.basePrices['6inch'] * 2, 
      flavorPrice: pricing.flavorPrices['lemon-poppyseed'] * 2,
      decorationTotal: pricing.decorationPrices['gold-leaf'] * 2,
      dietaryUpcharge: pricing.dietaryPrices.halal * 2,
      totalPrice: (pricing.basePrices['6inch'] * 2) + (pricing.flavorPrices['lemon-poppyseed'] * 2) + (pricing.decorationPrices['gold-leaf'] * 2) + (pricing.dietaryPrices.halal * 2)
    })
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
    calculateExpected: (pricing) => ({ 
      basePrice: pricing.basePrices['8inch'] + (pricing.layerPrice * 2), // 3 layers = base + 2 additional
      layerPrice: pricing.layerPrice * 2,
      flavorPrice: pricing.flavorPrices['orange-poppyseed'],
      shapePrice: pricing.shapePrices.square,
      decorationTotal: pricing.decorationPrices['fresh-fruit'],
      icingPrice: pricing.icingTypes.fondant,
      dietaryUpcharge: 0,
      totalPrice: pricing.basePrices['8inch'] + (pricing.layerPrice * 2) + pricing.flavorPrices['orange-poppyseed'] + pricing.shapePrices.square + pricing.decorationPrices['fresh-fruit'] + pricing.icingTypes.fondant
    })
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
    calculateExpected: (pricing) => {
      const basePrice = pricing.basePrices['6inch'] + pricing.basePrices['8inch'];
      const layerPrice = pricing.layerPrice * 2;
      const shapePrice = pricing.shapePrices.heart * 2;
      const decorationTotal = pricing.decorationPrices['happy-birthday'] * 2;
      const icingPrice = pricing.icingTypes.whipped * 2;
      const dietaryUpcharge = pricing.dietaryPrices.vegan * 2;
      
      return {
        basePrice: basePrice + layerPrice,
        layerPrice: layerPrice,
        shapePrice: shapePrice,
        decorationTotal: decorationTotal,
        icingPrice: icingPrice,
        dietaryUpcharge: dietaryUpcharge,
        totalPrice: basePrice + layerPrice + shapePrice + decorationTotal + icingPrice + dietaryUpcharge
      };
    }
  },
  {
    name: "6-inch cake with decoration",
    data: {
      layers: 1,
      servings: 6,
      decorations: ["flowers"],
      icingType: "butter",
      dietaryRestrictions: [],
      flavors: ["butter"],
      shape: "round",
      photoUpload: false,
      sixInchCakes: 1,
      eightInchCakes: 0
    },
    calculateExpected: (pricing) => {
      const basePrice = pricing.basePrices['6inch'];
      const decorationPrice = pricing.decorationPrices['flowers'] || 1500;
      return { 
        basePrice: basePrice, 
        flavorPrice: 0, 
        decorationTotal: decorationPrice, 
        totalPrice: basePrice + decorationPrice 
      };
    }
  },
  {
    name: "8-inch cake basic",
    data: {
      layers: 1,
      servings: 8,
      decorations: [],
      icingType: "butter",
      dietaryRestrictions: [],
      flavors: ["butter"],
      shape: "round",
      photoUpload: false,
      sixInchCakes: 0,
      eightInchCakes: 1
    },
    calculateExpected: (pricing) => ({ 
      basePrice: pricing.basePrices['8inch'], 
      totalPrice: pricing.basePrices['8inch'] 
    })
  },
  {
    name: "Mixed order: 2x 6-inch lemon with dietary restrictions",
    data: {
      layers: 1,
      servings: 12,
      decorations: [],
      icingType: "buttercream",
      dietaryRestrictions: ["eggless"],
      flavors: ["lemon"],
      shape: "round",
      photoUpload: false,
      sixInchCakes: 2,
      eightInchCakes: 0
    },
    calculateExpected: (pricing) => {
      const basePrice = pricing.basePrices['6inch'] * 2;
      const flavorPrice = (pricing.flavorPrices['lemon'] || 0) * 2;
      const icingPrice = (pricing.icingTypes['buttercream'] || 0) * 2;
      const dietaryUpcharge = (pricing.dietaryPrices['eggless'] || 0) * 2;
      return { 
        basePrice: basePrice, 
        flavorPrice: flavorPrice, 
        icingPrice: icingPrice,
        decorationTotal: 0, 
        dietaryUpcharge: dietaryUpcharge, 
        totalPrice: basePrice + flavorPrice + icingPrice + dietaryUpcharge 
      };
    }
  },
  {
    name: "Complex order: 8-inch multi-layer heart with decorations",
    data: {
      layers: 2,
      servings: 10,
      decorations: ["gold-leaf"],
      icingType: "fondant",
      dietaryRestrictions: ["vegan"],
      flavors: ["chocolate"],
      shape: "heart",
      photoUpload: false,
      sixInchCakes: 0,
      eightInchCakes: 1
    },
    calculateExpected: (pricing) => {
      const basePrice = pricing.basePrices['8inch'];
      const layerPrice = pricing.layerPrice;
      const shapePrice = pricing.shapePrices['heart'];
      const decorationPrice = pricing.decorationPrices['gold-leaf'];
      const icingPrice = pricing.icingTypes['fondant'];
      const flavorPrice = pricing.flavorPrices['chocolate'];
      const veganUpcharge = pricing.dietaryPrices['vegan'];
      const dietaryUpcharge = veganUpcharge;
      return { 
        basePrice: basePrice, 
        layerPrice: layerPrice, 
        flavorPrice: flavorPrice,
        shapePrice: shapePrice, 
        decorationTotal: decorationPrice, 
        icingPrice: icingPrice, 
        dietaryUpcharge: dietaryUpcharge, 
        totalPrice: basePrice + layerPrice + flavorPrice + shapePrice + decorationPrice + icingPrice + dietaryUpcharge 
      };
    }
  }
];

async function fetchPricingStructure() {
  try {
    const response = await fetch('http://localhost:5000/api/pricing-structure');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('ISSUE: Failed to fetch pricing structure:', error.message);
    return null;
  }
}

async function testPricing() {
  try {
    console.log('🔄 Fetching current pricing structure...');
    pricingStructure = await fetchPricingStructure();
    console.log('✅ Pricing structure loaded:');
    console.log(`   6-inch base: ${pricingStructure.basePrices['6inch']} cents (RM ${(pricingStructure.basePrices['6inch'] / 100).toFixed(0)})`);
    console.log(`   8-inch base: ${pricingStructure.basePrices['8inch']} cents (RM ${(pricingStructure.basePrices['8inch'] / 100).toFixed(0)})`);
    console.log('');

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      try {
        const response = await fetch('http://localhost:5000/api/calculate-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase.data)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const expected = testCase.calculateExpected(pricingStructure);
        
        const actualTotal = result.totalPrice;
        const expectedTotal = expected.totalPrice;
        
        if (actualTotal === expectedTotal) {
          console.log(`✅ ${testCase.name}: RM ${(actualTotal / 100).toFixed(2)}`);
          passed++;
        } else {
          console.log(`[FAIL] ${testCase.name}:`);
          console.log(`   Expected: RM ${(expectedTotal / 100).toFixed(2)} (${expectedTotal} cents)`);
          console.log(`   Actual: RM ${(actualTotal / 100).toFixed(2)} (${actualTotal} cents)`);
          console.log('   Expected breakdown:', expected);
          console.log('   Actual result:', result);
          failed++;
        }
      } catch (error) {
        console.log(`[ERROR] ${testCase.name}: Error - ${error.message}`);
        failed++;
      }
    }

    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('[ERROR] Test execution failed:', error.message);
    process.exit(1);
  }
}

// Check if running directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  testPricing();
}