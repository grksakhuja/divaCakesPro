import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '5SAoqv3xeQLX1AL';

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let sessionToken = null;
let originalPricing = null;
let testResults = [];

// Helper function to make authenticated API requests
async function authenticatedFetch(url, options = {}) {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${sessionToken}`,
  };
  
  return fetch(url, { ...options, headers });
}

// Test 1: Admin Authentication
async function testAdminAuthentication() {
  console.log(`\n${BLUE}Testing Admin Authentication...${RESET}`);
  
  try {
    // Test invalid credentials
    const invalidResponse = await fetch(`${API_BASE_URL}/api/admin-auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
    });
    
    if (invalidResponse.status !== 401 && invalidResponse.status !== 403) {
      throw new Error(`Expected 401 or 403 for invalid credentials, got ${invalidResponse.status}`);
    }
    
    // Test valid credentials
    const validResponse = await fetch(`${API_BASE_URL}/api/admin-auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
    });
    
    if (!validResponse.ok) {
      throw new Error(`Authentication failed: ${validResponse.status}`);
    }
    
    const authData = await validResponse.json();
    sessionToken = authData.sessionToken;
    
    console.log(`${GREEN}✓ Admin authentication successful${RESET}`);
    testResults.push({ test: 'Admin Authentication', status: 'PASSED' });
    return true;
  } catch (error) {
    console.error(`${RED}✗ Admin authentication failed: ${error.message}${RESET}`);
    testResults.push({ test: 'Admin Authentication', status: 'FAILED', error: error.message });
    return false;
  }
}

// Test 2: Fetch Current Pricing
async function testFetchPricing() {
  console.log(`\n${BLUE}Testing Fetch Pricing Structure...${RESET}`);
  
  try {
    // Test without authentication
    const unauthResponse = await fetch(`${API_BASE_URL}/api/admin/pricing`);
    if (unauthResponse.status !== 401) {
      throw new Error(`Expected 401 without auth, got ${unauthResponse.status}`);
    }
    
    // Test with authentication
    const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/pricing`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pricing: ${response.status}`);
    }
    
    originalPricing = await response.json();
    
    // Validate pricing structure
    const requiredFields = ['basePrices', 'layerPrice', 'flavorPrices', 
                          'icingTypes', 'decorationPrices', 'dietaryPrices', 'shapePrices'];
    
    for (const field of requiredFields) {
      if (!originalPricing[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    console.log(`${GREEN}✓ Pricing structure fetched successfully${RESET}`);
    console.log(`  - Base price (6-inch): RM ${(originalPricing.basePrices['6inch'] / 100).toFixed(2)}`);
    console.log(`  - Base price (8-inch): RM ${(originalPricing.basePrices['8inch'] / 100).toFixed(2)}`);
    
    testResults.push({ test: 'Fetch Pricing Structure', status: 'PASSED' });
    return true;
  } catch (error) {
    console.error(`${RED}✗ Fetch pricing failed: ${error.message}${RESET}`);
    testResults.push({ test: 'Fetch Pricing Structure', status: 'FAILED', error: error.message });
    return false;
  }
}

// Test 3: Update Pricing
async function testUpdatePricing() {
  console.log(`\n${BLUE}Testing Update Pricing...${RESET}`);
  
  try {
    // Create test pricing with increased values
    const testPricing = JSON.parse(JSON.stringify(originalPricing));
    testPricing.basePrices['6inch'] = 9500; // RM 95.00
    testPricing.basePrices['8inch'] = 16500; // RM 165.00
    testPricing.layerPrice = 1600; // RM 16.00
    
    // Test update without authentication
    const unauthResponse = await fetch(`${API_BASE_URL}/api/admin/pricing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPricing),
    });
    
    if (unauthResponse.status !== 401) {
      throw new Error(`Expected 401 without auth, got ${unauthResponse.status}`);
    }
    
    // Test valid update
    const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/pricing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPricing),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Update failed: ${error.message}`);
    }
    
    const result = await response.json();
    console.log(`${GREEN}✓ Pricing updated successfully${RESET}`);
    console.log(`  - Backup created: ${result.backup}`);
    
    // Verify the update
    const verifyResponse = await authenticatedFetch(`${API_BASE_URL}/api/admin/pricing`);
    const updatedPricing = await verifyResponse.json();
    
    if (updatedPricing.basePrices['6inch'] !== 9500) {
      throw new Error('Price update not reflected in fetched data');
    }
    
    console.log(`${GREEN}✓ Price update verified${RESET}`);
    testResults.push({ test: 'Update Pricing', status: 'PASSED' });
    return true;
  } catch (error) {
    console.error(`${RED}✗ Update pricing failed: ${error.message}${RESET}`);
    testResults.push({ test: 'Update Pricing', status: 'FAILED', error: error.message });
    return false;
  }
}

// Test 4: Invalid Pricing Update
async function testInvalidPricingUpdate() {
  console.log(`\n${BLUE}Testing Invalid Pricing Updates...${RESET}`);
  
  try {
    // Test with missing required field
    const missingFieldPricing = { basePrices: { '6inch': 9000 } };
    
    const response1 = await authenticatedFetch(`${API_BASE_URL}/api/admin/pricing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(missingFieldPricing),
    });
    
    if (response1.status !== 400) {
      throw new Error(`Expected 400 for missing fields, got ${response1.status}`);
    }
    
    // Test with negative price
    const negativePricing = JSON.parse(JSON.stringify(originalPricing));
    negativePricing.basePrices['6inch'] = -1000;
    
    const response2 = await authenticatedFetch(`${API_BASE_URL}/api/admin/pricing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(negativePricing),
    });
    
    if (response2.status !== 400) {
      throw new Error(`Expected 400 for negative price, got ${response2.status}`);
    }
    
    console.log(`${GREEN}✓ Invalid pricing updates properly rejected${RESET}`);
    testResults.push({ test: 'Invalid Pricing Update', status: 'PASSED' });
    return true;
  } catch (error) {
    console.error(`${RED}✗ Invalid pricing test failed: ${error.message}${RESET}`);
    testResults.push({ test: 'Invalid Pricing Update', status: 'FAILED', error: error.message });
    return false;
  }
}

// Test 5: Pricing Calculation with Updated Prices
async function testPricingCalculation() {
  console.log(`\n${BLUE}Testing Price Calculation with Updated Prices...${RESET}`);
  
  try {
    // Calculate price for a cake
    const cakeConfig = {
      sixInchCakes: 1,
      eightInchCakes: 0,
      layers: 2,
      shape: 'round',
      flavors: ['vanilla'],
      icingType: 'buttercream',
      decorations: ['sprinkles'],
      dietaryRestrictions: [],
    };
    
    const response = await fetch(`${API_BASE_URL}/api/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cakeConfig),
    });
    
    if (!response.ok) {
      throw new Error(`Price calculation failed: ${response.status}`);
    }
    
    const pricing = await response.json();
    
    // Verify prices reflect the update
    if (pricing.basePrice !== 9500) {
      throw new Error(`Expected base price 9500, got ${pricing.basePrice}`);
    }
    
    if (pricing.layerPrice !== 1600) {
      throw new Error(`Expected layer price 1600, got ${pricing.layerPrice}`);
    }
    
    console.log(`${GREEN}✓ Price calculation uses updated prices${RESET}`);
    console.log(`  - Base: RM ${(pricing.basePrice / 100).toFixed(2)}`);
    console.log(`  - Layers: RM ${(pricing.layerPrice / 100).toFixed(2)}`);
    console.log(`  - Total: RM ${(pricing.totalPrice / 100).toFixed(2)}`);
    
    testResults.push({ test: 'Pricing Calculation', status: 'PASSED' });
    return true;
  } catch (error) {
    console.error(`${RED}✗ Pricing calculation test failed: ${error.message}${RESET}`);
    testResults.push({ test: 'Pricing Calculation', status: 'FAILED', error: error.message });
    return false;
  }
}

// Test 6: Backup History
async function testBackupHistory() {
  console.log(`\n${BLUE}Testing Backup History...${RESET}`);
  
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/pricing/backups`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch backups: ${response.status}`);
    }
    
    const backups = await response.json();
    
    if (!Array.isArray(backups)) {
      throw new Error('Backups response is not an array');
    }
    
    if (backups.length === 0) {
      console.log(`${YELLOW}⚠ No backups found (this may be normal on first run)${RESET}`);
    } else {
      console.log(`${GREEN}✓ Found ${backups.length} backup(s)${RESET}`);
      backups.slice(0, 3).forEach(backup => {
        console.log(`  - ${backup.filename} (${(backup.size / 1024).toFixed(2)} KB)`);
      });
    }
    
    testResults.push({ test: 'Backup History', status: 'PASSED' });
    return true;
  } catch (error) {
    console.error(`${RED}✗ Backup history test failed: ${error.message}${RESET}`);
    testResults.push({ test: 'Backup History', status: 'FAILED', error: error.message });
    return false;
  }
}

// Test 7: Frontend Cache Invalidation
async function testCacheInvalidation() {
  console.log(`\n${BLUE}Testing Cache Invalidation...${RESET}`);
  
  try {
    // Make two requests to pricing structure
    const response1 = await fetch(`${API_BASE_URL}/api/pricing-structure`);
    const pricing1 = await response1.json();
    
    // Update a price
    const updatedPricing = JSON.parse(JSON.stringify(pricing1));
    updatedPricing.basePrices['6inch'] = 9800; // RM 98.00
    
    await authenticatedFetch(`${API_BASE_URL}/api/admin/pricing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPricing),
    });
    
    // Fetch pricing structure again
    const response2 = await fetch(`${API_BASE_URL}/api/pricing-structure`);
    const pricing2 = await response2.json();
    
    if (pricing2.basePrices['6inch'] !== 9800) {
      throw new Error('Updated price not reflected in public API');
    }
    
    console.log(`${GREEN}✓ Pricing updates are immediately reflected${RESET}`);
    testResults.push({ test: 'Cache Invalidation', status: 'PASSED' });
    return true;
  } catch (error) {
    console.error(`${RED}✗ Cache invalidation test failed: ${error.message}${RESET}`);
    testResults.push({ test: 'Cache Invalidation', status: 'FAILED', error: error.message });
    return false;
  }
}

// Restore original pricing
async function restoreOriginalPricing() {
  if (!originalPricing || !sessionToken) return;
  
  console.log(`\n${BLUE}Restoring original pricing...${RESET}`);
  
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/pricing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(originalPricing),
    });
    
    if (response.ok) {
      console.log(`${GREEN}✓ Original pricing restored${RESET}`);
    } else {
      console.log(`${YELLOW}⚠ Failed to restore original pricing${RESET}`);
    }
  } catch (error) {
    console.log(`${YELLOW}⚠ Error restoring pricing: ${error.message}${RESET}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log(`${BLUE}${'='.repeat(50)}${RESET}`);
  console.log(`${BLUE}PRICING MANAGEMENT SYSTEM TESTS${RESET}`);
  console.log(`${BLUE}${'='.repeat(50)}${RESET}`);
  
  // Check if server is running
  try {
    await fetch(`${API_BASE_URL}/api/feature-flags`);
  } catch (error) {
    console.error(`${RED}Error: Server is not running at ${API_BASE_URL}${RESET}`);
    console.log(`\nPlease start the server with: npm run dev`);
    return;
  }
  
  // Run tests in sequence
  if (await testAdminAuthentication()) {
    if (await testFetchPricing()) {
      await testUpdatePricing();
      await testInvalidPricingUpdate();
      await testPricingCalculation();
      await testBackupHistory();
      await testCacheInvalidation();
      
      // Always restore original pricing
      await restoreOriginalPricing();
    }
  }
  
  // Print summary
  console.log(`\n${BLUE}${'='.repeat(50)}${RESET}`);
  console.log(`${BLUE}TEST SUMMARY${RESET}`);
  console.log(`${BLUE}${'='.repeat(50)}${RESET}`);
  
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;
  
  testResults.forEach(result => {
    const icon = result.status === 'PASSED' ? `${GREEN}✓` : `${RED}✗`;
    console.log(`${icon} ${result.test}${RESET}`);
    if (result.error) {
      console.log(`  ${RED}Error: ${result.error}${RESET}`);
    }
  });
  
  console.log(`\n${BLUE}Total: ${testResults.length} | ${GREEN}Passed: ${passed}${RESET} | ${RED}Failed: ${failed}${RESET}`);
  
  if (failed === 0) {
    console.log(`\n${GREEN}All tests passed! 🎉${RESET}`);
  } else {
    console.log(`\n${RED}Some tests failed. Please check the errors above.${RESET}`);
  }
}

// Run the tests
runAllTests().catch(console.error);