#!/usr/bin/env node

/**
 * Test Dynamic Specialty Items API and Functionality
 * Tests the new /api/specialty-items endpoint and cart integration with dynamic items
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
    // Test 1: API endpoint exists and returns correct structure
    console.log('🔍 Test 1: API endpoint structure...');
    const specialtyData = await makeGetRequest('/api/specialty-items');
    
    if (!specialtyData || typeof specialtyData !== 'object') {
      throw new Error('API should return an object');
    }
    
    testsRun++;
    console.log('✅ API returns valid object structure');
    testsPassed++;
    
    // Test 2: Check expected sections exist
    console.log('🔍 Test 2: Expected sections exist...');
    const expectedSections = ['whole-cakes', 'coconut-candy', 'seasonal-specials'];
    const actualSections = Object.keys(specialtyData);
    
    for (const section of expectedSections) {
      if (!actualSections.includes(section)) {
        throw new Error(`Missing expected section: ${section}`);
      }
    }
    
    testsRun++;
    console.log(`✅ All expected sections found: ${expectedSections.join(', ')}`);
    testsPassed++;
    
    // Test 3: Section name formatting
    console.log('🔍 Test 3: Section name formatting...');
    const expectedNames = {
      'whole-cakes': 'Whole Cakes',
      'coconut-candy': 'Coconut Candy', 
      'seasonal-specials': 'Seasonal Specials'
    };
    
    for (const [key, expectedName] of Object.entries(expectedNames)) {
      if (specialtyData[key].sectionName !== expectedName) {
        throw new Error(`Expected section name "${expectedName}" but got "${specialtyData[key].sectionName}"`);
      }
    }
    
    testsRun++;
    console.log('✅ Section name formatting correct');
    testsPassed++;
    
    // Test 4: Items structure validation
    console.log('🔍 Test 4: Items structure validation...');
    const requiredFields = ['id', 'price', 'name', 'description', 'image', 'category'];
    
    for (const [sectionKey, section] of Object.entries(specialtyData)) {
      if (!Array.isArray(section.items)) {
        throw new Error(`Section ${sectionKey} should have items array`);
      }
      
      for (const item of section.items) {
        for (const field of requiredFields) {
          if (!(field in item)) {
            throw new Error(`Item missing required field: ${field}`);
          }
        }
        
        // Validate price is a number
        if (typeof item.price !== 'number' || item.price <= 0) {
          throw new Error(`Invalid price for item ${item.id}: ${item.price}`);
        }
      }
    }
    
    testsRun++;
    console.log('✅ All items have required fields and valid prices');
    testsPassed++;
    
    // Test 5: Check for new dynamic items
    console.log('🔍 Test 5: Verify new dynamic items...');
    const coconutCandy = specialtyData['coconut-candy'];
    const seasonalSpecials = specialtyData['seasonal-specials'];
    
    // Check we have the expected new coconut candy items
    const expectedCoconutItems = ['coconut-candy-mango', 'coconut-candy-chocolate'];
    const coconutItemIds = coconutCandy.items.map(item => item.id);
    
    for (const expectedId of expectedCoconutItems) {
      if (!coconutItemIds.includes(expectedId)) {
        throw new Error(`Missing expected coconut candy item: ${expectedId}`);
      }
    }
    
    // Check seasonal specials exist
    const expectedSeasonalItems = ['mothers-day-cupcakes', 'valentine-heart-cookies'];
    const seasonalItemIds = seasonalSpecials.items.map(item => item.id);
    
    for (const expectedId of expectedSeasonalItems) {
      if (!seasonalItemIds.includes(expectedId)) {
        throw new Error(`Missing expected seasonal item: ${expectedId}`);
      }
    }
    
    testsRun++;
    console.log('✅ New dynamic items verified');
    testsPassed++;
    
    // Test 6: Pricing accuracy for new items
    console.log('🔍 Test 6: Pricing accuracy for new items...');
    const expectedPrices = {
      'coconut-candy-mango': 4500,
      'coconut-candy-chocolate': 4800,
      'mothers-day-cupcakes': 3600,
      'valentine-heart-cookies': 2800
    };
    
    for (const section of Object.values(specialtyData)) {
      for (const item of section.items) {
        if (expectedPrices[item.id]) {
          if (item.price !== expectedPrices[item.id]) {
            throw new Error(`Price mismatch for ${item.id}: expected ${expectedPrices[item.id]}, got ${item.price}`);
          }
        }
      }
    }
    
    testsRun++;
    console.log('✅ Pricing accuracy verified for new items');
    testsPassed++;
    
    // Test 7: Cart integration test
    console.log('🔍 Test 7: Cart integration with dynamic items...');
    
    const testOrder = {
      customer: {
        customerName: "Test Dynamic User",
        customerEmail: "test-dynamic@example.com",
        customerPhone: "60123456789",
        deliveryMethod: "pickup",
        specialInstructions: "Test order with dynamic items"
      },
      items: [
        {
          type: "candy",
          quantity: 1,
          unitPrice: 4800, // Chocolate coconut candy
          totalPrice: 4800,
          name: "Chocolate Coconut Delight",
          description: "Rich chocolate-infused coconut candy for chocolate lovers",
          specialtyId: "coconut-candy-chocolate"
        },
        {
          type: "specialty",
          quantity: 1, 
          unitPrice: 3600, // Mother's Day cupcakes
          totalPrice: 3600,
          name: "Mother's Day Cupcake Set",
          description: "Beautiful set of 6 decorated cupcakes perfect for Mother's Day",
          specialtyId: "mothers-day-cupcakes"
        }
      ],
      totalPrice: 8400
    };
    
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