import { testPricingScenario, printTestResults, pricingStructure } from './pricing-test-utils.js';

console.log('🧠 Smart Pricing Tests - Auto-calculated from pricing-structure.json');
console.log('📋 Pricing structure loaded:', {
  basePrices: pricingStructure.basePrices,
  layerPrice: pricingStructure.layerPrice,
  sampleFlavors: Object.keys(pricingStructure.flavorPrices).slice(0, 3),
  sampleIcingTypes: Object.keys(pricingStructure.icingTypes).slice(0, 3),
  sampleDecorations: Object.keys(pricingStructure.decorationPrices).slice(0, 3)
});

console.log('\n🧪 Testing various pricing scenarios automatically...\n');

async function runSmartPricingTests() {
  const tests = [
    {
      name: "Basic 6-inch butter cake",
      data: {
        sixInchCakes: 1,
        eightInchCakes: 0,
        flavors: ["butter"],
        decorations: [],
        icingType: "butter",
        dietaryRestrictions: [],
        shape: "round",
        layers: 1
      }
    },
    {
      name: "Premium cake with decorations",
      data: {
        sixInchCakes: 1,
        eightInchCakes: 0,
        flavors: ["lemon-poppyseed"],
        decorations: ["happy-birthday", "gold-leaf"],
        icingType: "fondant",
        dietaryRestrictions: ["halal"],
        shape: "heart",
        layers: 1
      }
    },
    {
      name: "Multi-layer 8-inch cake",
      data: {
        sixInchCakes: 0,
        eightInchCakes: 1,
        flavors: ["chocolate"],
        decorations: ["fresh-fruit"],
        icingType: "chocolate",
        dietaryRestrictions: ["vegan"],
        shape: "round",
        layers: 3
      }
    },
    {
      name: "Multiple cakes mix",
      data: {
        sixInchCakes: 2,
        eightInchCakes: 1,
        flavors: ["orange-poppyseed"],
        decorations: ["sprinkles", "flowers"],
        icingType: "whipped",
        dietaryRestrictions: ["eggless"],
        shape: "square",
        layers: 1
      }
    },
    {
      name: "Father's Day template (should be base + template price)",
      data: {
        template: "fathers-day",
        sixInchCakes: 1,
        eightInchCakes: 0,
        flavors: ["chocolate"],
        decorations: ["happy-birthday"],
        icingType: "chocolate",
        dietaryRestrictions: [],
        shape: "round",
        layers: 2
      }
    }
  ];

  let allPassed = true;
  
  for (const test of tests) {
    const result = await testPricingScenario(test.data, test.name);
    printTestResults(result);
    if (!result.passed) allPassed = false;
  }

  console.log(`\n${allPassed ? '✅' : '❌'} Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  console.log('🎯 Self-maintaining tests - expectations automatically calculated from pricing-structure.json!');
}

runSmartPricingTests().catch(console.error); 