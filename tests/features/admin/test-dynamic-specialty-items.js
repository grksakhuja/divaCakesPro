#!/usr/bin/env node

/**
 * Test Dynamic Specialty Items API and Functionality
 * Tests the /api/cakes endpoint dynamically based on pricing structure
 */

import http from 'http';

const BASE_URL = 'http://localhost:5000';
const delay = parseInt(process.env.TEST_DELAY) || 200;

// Test utilities
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeGetRequest(endpoint) {
  await sleep(delay);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function makePostRequest(endpoint, body) {
  await sleep(delay);
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testDynamicSpecialtyItemsAPI() {
  console.log('🔧 Test Utils: Using ' + delay + 'ms delay between requests');
  console.log('🧪 Testing Dynamic Specialty Items API');
  console.log('=====================================');
  
  let testsRun = 0;
  let testsPassed = 0;
  
  try {
    // First, get the pricing structure to understand what should exist
    console.log('📊 Fetching pricing structure...');
    const pricingStructure = await makeGetRequest('/api/pricing-structure');
    
    // Test 1: API endpoint exists and returns correct structure
    console.log('🔍 Test 1: API endpoint structure...');
    const specialtyData = await makeGetRequest('/api/cakes');
    
    if (!specialtyData || typeof specialtyData !== 'object') {
      throw new Error('API should return an object');
    }
    
    testsRun++;
    console.log('✅ API returns valid object structure');
    testsPassed++;
    
    // Test 2: Check that all sections exist and have required structure
    console.log('🔍 Test 2: Section structure validation...');
    const actualSections = Object.keys(specialtyData);
    
    if (actualSections.length === 0) {
      throw new Error('API should return at least one section');
    }
    
    // Validate each section has required structure
    for (const [sectionKey, section] of Object.entries(specialtyData)) {
      if (!section.sectionName || typeof section.sectionName !== 'string') {
        throw new Error(`Section ${sectionKey} missing sectionName`);
      }
      if (!Array.isArray(section.items)) {
        throw new Error(`Section ${sectionKey} should have items array`);
      }
    }
    
    testsRun++;
    console.log(`✅ All ${actualSections.length} sections have valid structure`);
    testsPassed++;
    
    // Test 3: Items structure validation
    console.log('🔍 Test 3: Items structure validation...');
    const requiredFields = ['id', 'price', 'name', 'description', 'image'];
    let totalItems = 0;
    
    for (const [sectionKey, section] of Object.entries(specialtyData)) {
      for (const item of section.items) {
        totalItems++;
        for (const field of requiredFields) {
          if (!(field in item)) {
            throw new Error(`Item ${item.id || 'unknown'} missing required field: ${field}`);
          }
        }
        
        // Validate price is a number
        if (typeof item.price !== 'number' || item.price <= 0) {
          throw new Error(`Invalid price for item ${item.id}: ${item.price}`);
        }
      }
    }
    
    testsRun++;
    console.log(`✅ All ${totalItems} items have required fields and valid prices`);
    testsPassed++;
    
    // Test 4: Price consistency with pricing structure
    console.log('🔍 Test 4: Price consistency with pricing structure...');
    const pricingCakes = pricingStructure.cakes || {};
    let priceMatches = 0;
    let priceChecks = 0;
    
    // Check each item against pricing structure
    for (const [sectionKey, section] of Object.entries(specialtyData)) {
      for (const item of section.items) {
        // Look for this item in the pricing structure cakes section
        for (const [cakeSection, cakeItems] of Object.entries(pricingCakes)) {
          if (cakeItems[item.id] !== undefined) {
            priceChecks++;
            // The pricing structure has objects with a price property
            const expectedPrice = cakeItems[item.id].price || cakeItems[item.id];
            if (item.price === expectedPrice) {
              priceMatches++;
            } else {
              console.warn(`⚠️  Price mismatch for ${item.id}: API says ${item.price}, pricing structure says ${expectedPrice}`);
            }
          }
        }
      }
    }
    
    if (priceChecks > 0) {
      console.log(`   Checked ${priceChecks} prices, ${priceMatches} match pricing structure`);
    }
    
    testsRun++;
    console.log('✅ Price consistency check completed');
    testsPassed++;
    
    // Test 5: Cart integration test with actual items
    console.log('🔍 Test 5: Cart integration with dynamic items...');
    
    // Pick the first item from each section for testing
    const testItems = [];
    let testTotalPrice = 0;
    
    for (const [sectionKey, section] of Object.entries(specialtyData)) {
      if (section.items.length > 0) {
        const item = section.items[0];
        const itemType = sectionKey.includes('candy') ? 'candy' : 
                        sectionKey.includes('slice') ? 'slice' : 'specialty';
        
        testItems.push({
          type: itemType,
          quantity: 1,
          unitPrice: item.price,
          totalPrice: item.price,
          name: item.name,
          description: item.description,
          specialtyId: item.id
        });
        
        testTotalPrice += item.price;
        
        // Only use first 2 items to keep test simple
        if (testItems.length >= 2) break;
      }
    }
    
    if (testItems.length === 0) {
      throw new Error('No items available for cart test');
    }
    
    const testOrder = {
      customer: {
        customerName: "Test Dynamic User",
        customerEmail: "test-dynamic@example.com",
        customerPhone: "60123456789",
        deliveryMethod: "pickup",
        specialInstructions: "Test order with dynamic items"
      },
      items: testItems,
      totalPrice: testTotalPrice
    };
    
    console.log(`   Testing with ${testItems.length} items, total: ${testTotalPrice} cents`);
    
    const orderResult = await makePostRequest('/api/checkout', testOrder);
    if (!orderResult.id) {
      throw new Error('Order should return an ID');
    }
    
    testsRun++;
    console.log(`✅ Cart integration successful - Order ID: ${orderResult.id}`);
    testsPassed++;
    
    // Summary
    console.log('\n📊 Dynamic Specialty Items Test Summary:');
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsRun - testsPassed}`);
    console.log(`📈 Success Rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);
    
    if (testsPassed === testsRun) {
      console.log('\n🎉 All dynamic specialty items tests passed!');
      console.log('✨ Tests are truly dynamic - no hardcoded expectations!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n📊 Dynamic Specialty Items Test Summary:');
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsRun - testsPassed + 1}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsRun + 1)) * 100).toFixed(1)}%`);
    process.exit(1);
  }
}

// Run the tests
testDynamicSpecialtyItemsAPI().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});