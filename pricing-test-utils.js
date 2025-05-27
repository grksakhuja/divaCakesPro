import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load pricing structure from the authoritative source
const pricingStructurePath = path.join(__dirname, 'server', 'pricing-structure.json');
export const pricingStructure = JSON.parse(fs.readFileSync(pricingStructurePath, 'utf-8'));

// Server configuration
const SERVER_URL = 'http://localhost:5000';

// Test timing configuration (can be overridden by environment)
const TEST_DELAY = parseInt(process.env.TEST_DELAY) || 300; // 300ms default delay between requests

console.log(`🔧 Test Utils: Using ${TEST_DELAY}ms delay between requests`);

// Helper to add delays between requests
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate expected pricing based on the authoritative pricing-structure.json
 * This mirrors the server's pricing calculation logic exactly
 */
function calculateExpectedPricing(requestData) {
  const {
    layers = 1,
    decorations = [],
    icingType = "butter",
    dietaryRestrictions = [],
    flavors = [],
    shape = "round",
    template,
    sixInchCakes = 0,
    eightInchCakes = 0
  } = requestData;

  // Special pricing for Father's Day template
  if (template === "fathers-day" || template === "fathers day") {
    const totalCakes = sixInchCakes + eightInchCakes;
    
    // Calculate base price for each size
    const basePrice = (sixInchCakes * pricingStructure.basePrices["6inch"]) + 
                      (eightInchCakes * pricingStructure.basePrices["8inch"]);
    
    // Template price per cake
    const templatePrice = totalCakes * (pricingStructure.templatePrices["fathers-day"] || 0);
    
    const totalPrice = basePrice + templatePrice;
    
    return {
      basePrice: basePrice,
      templatePrice: templatePrice,
      layerPrice: 0,
      flavorPrice: 0,
      shapePrice: 0,
      icingPrice: 0,
      decorationTotal: 0,
      dietaryUpcharge: 0,
      totalPrice: totalPrice
    };
  }

  const totalCakes = sixInchCakes + eightInchCakes;
  
  // Base price calculation
  const basePrice = (sixInchCakes * pricingStructure.basePrices['6inch']) + 
                    (eightInchCakes * pricingStructure.basePrices['8inch']);

  // Layer price (additional layers beyond 1)
  const layerPrice = totalCakes * Math.max(0, layers - 1) * pricingStructure.layerPrice;

  // Flavor pricing
  let flavorPrice = 0;
  flavors.forEach(flavor => {
    const price = pricingStructure.flavorPrices[flavor] || 0;
    flavorPrice += price * totalCakes;
  });

  // Shape pricing
  const shapePrice = (pricingStructure.shapePrices[shape] || 0) * totalCakes;

  // Icing pricing (use icingTypes from pricing structure)
  const icingPrice = (pricingStructure.icingTypes[icingType] || 0) * totalCakes;

  // Decoration pricing
  let decorationTotal = 0;
  decorations.forEach(decoration => {
    const price = pricingStructure.decorationPrices[decoration] || 0;
    decorationTotal += price * totalCakes;
  });

  // Dietary restrictions pricing
  let dietaryUpcharge = 0;
  dietaryRestrictions.forEach(dietary => {
    const price = pricingStructure.dietaryPrices[dietary] || 0;
    dietaryUpcharge += price * totalCakes;
  });

  const totalPrice = basePrice + layerPrice + flavorPrice + shapePrice + 
                     icingPrice + decorationTotal + dietaryUpcharge;

  return {
    basePrice,
    layerPrice,
    flavorPrice,
    shapePrice,
    icingPrice,
    decorationTotal,
    dietaryUpcharge,
    totalPrice
  };
}

// Test a pricing scenario against the server with delay
export async function testPricingScenario(orderData, testName = '') {
  const expectedPricing = calculateExpectedPricing(orderData);
  const expectedPrice = expectedPricing.totalPrice; // Extract the totalPrice number
  
  try {
    // Add delay before making request
    await sleep(TEST_DELAY);
    
    // Ensure clean JSON serialization
    const requestBody = JSON.stringify(orderData, null, 0); // No formatting to avoid issues
    
    const response = await fetch(`${SERVER_URL}/api/calculate-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }
    
    const actualPrice = result.totalPrice;
    const passed = actualPrice === expectedPrice;
    
    return {
      testName,
      orderData,
      expectedPrice,
      actualPrice,
      passed,
      serverResponse: result,
      expectedPricing // Include the full breakdown for debugging
    };
    
  } catch (error) {
    return {
      testName,
      orderData,
      expectedPrice,
      actualPrice: null,
      passed: false,
      error: error.message,
      serverResponse: null,
      expectedPricing
    };
  }
}

// Print test results with nice formatting
export function printTestResults(result) {
  const status = result.passed ? '✅' : '❌';
  const testName = result.testName || 'Pricing Test';
  
  console.log(`${status} ${testName}`);
  
  if (result.passed) {
    console.log(`   Expected: ${result.expectedPrice} cents`);
    console.log(`   Actual:   ${result.actualPrice} cents ✓`);
  } else {
    console.log(`   Expected: ${result.expectedPrice} cents`);
    console.log(`   Actual:   ${result.actualPrice !== null ? result.actualPrice + ' cents' : 'ERROR'} ❌`);
    
    if (result.error) {
      console.log(`   Error:    ${result.error}`);
    }
    
    if (result.expectedPricing && result.serverResponse) {
      console.log(`   Expected breakdown:`, result.expectedPricing);
      console.log(`   Server response:`, result.serverResponse);
    }
  }
  
  console.log(''); // Empty line for readability
}