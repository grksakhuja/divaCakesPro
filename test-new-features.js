#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${description}`);
    console.log(`  ${colors.red}${error.message}${colors.reset}`);
    failedTests++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Function to make HTTP requests
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log(`\n${colors.blue}Running New Features Tests...${colors.reset}\n`);

  // Test 1: Check if pricing-structure.json has new items
  test('Pricing structure contains specialty items', () => {
    const pricingStructure = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'server', 'pricing-structure.json'), 'utf8')
    );
    
    assert(pricingStructure.specialtyItems, 'specialtyItems section should exist');
    assert(pricingStructure.specialtyItems['cheesecake-whole'] === 8500, 'Cheesecake price should be 8500 cents');
    assert(pricingStructure.specialtyItems['pavlova'] === 2100, 'Pavlova price should be 2100 cents');
    assert(pricingStructure.specialtyItems['matcha-pavlova'] === 2100, 'Matcha pavlova price should be 2100 cents');
    assert(pricingStructure.specialtyItems['coconut-candy-og'] === 4200, 'Coconut candy OG price should be 4200 cents');
  });

  test('Pricing structure contains sliced cakes', () => {
    const pricingStructure = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'server', 'pricing-structure.json'), 'utf8')
    );
    
    assert(pricingStructure.slicedCakes, 'slicedCakes section should exist');
    assert(pricingStructure.slicedCakes['orange-poppyseed'] === 700, 'Orange poppyseed slice should be 700 cents');
    assert(pricingStructure.slicedCakes['butter-cake'] === 700, 'Butter cake slice should be 700 cents');
    assert(pricingStructure.slicedCakes['chocolate-fudge'] === 700, 'Chocolate fudge slice should be 700 cents');
  });

  test('Pricing structure has new flavors from Sugar Art Diva', () => {
    const pricingStructure = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'server', 'pricing-structure.json'), 'utf8')
    );
    
    assert(pricingStructure.flavorPrices['chocolate-fudge'] === 800, 'Chocolate fudge flavor should exist');
    assert(pricingStructure.flavorPrices['red-velvet'] === 1000, 'Red velvet flavor should exist');
    assert(pricingStructure.flavorPrices['pandan'] === 800, 'Pandan flavor should exist');
    assert(pricingStructure.flavorPrices['durian'] === 1500, 'Durian flavor should exist');
  });

  // Test 2: Test API endpoints
  console.log(`\n${colors.yellow}Testing API endpoints...${colors.reset}\n`);

  try {
    // Test pricing structure API
    const pricingResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/pricing-structure',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    test('GET /api/pricing-structure returns correct data', () => {
      assert(pricingResponse.status === 200, 'Should return 200 status');
      assert(pricingResponse.data.specialtyItems, 'Should contain specialtyItems');
      assert(pricingResponse.data.slicedCakes, 'Should contain slicedCakes');
      assert(pricingResponse.data.basePrices['6inch'] === 9000, 'Should have correct 6inch base price');
      assert(pricingResponse.data.basePrices['8inch'] === 16000, 'Should have correct 8inch base price');
    });

    // Test price calculation with new items
    const priceCalcResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/calculate-price',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        layers: 2,
        servings: 20,
        decorations: ['sprinkles'],
        icingType: 'buttercream',
        dietaryRestrictions: ['halal'],
        flavors: ['chocolate-fudge', 'vanilla'],
        shape: 'round',
        sixInchCakes: 1,
        eightInchCakes: 0
      }
    });

    test('POST /api/calculate-price handles new flavors correctly', () => {
      assert(priceCalcResponse.status === 200, 'Should return 200 status');
      assert(priceCalcResponse.data.totalPrice > 0, 'Should calculate a total price');
      assert(priceCalcResponse.data.breakdown, 'Should include price breakdown');
      assert(priceCalcResponse.data.breakdown.flavors > 0, 'Should charge for chocolate-fudge flavor');
    });

  } catch (error) {
    console.log(`${colors.red}Error: Could not connect to server. Make sure the server is running on port 3000.${colors.reset}`);
    console.log(`Run: ${colors.yellow}npm run dev${colors.reset} in another terminal first.\n`);
  }

  // Test 3: Check new page files exist
  console.log(`\n${colors.yellow}Testing new page files...${colors.reset}\n`);

  test('Gallery page exists', () => {
    const filePath = path.join(__dirname, 'client', 'src', 'pages', 'gallery.tsx');
    assert(fs.existsSync(filePath), 'Gallery page file should exist');
  });

  test('About page exists', () => {
    const filePath = path.join(__dirname, 'client', 'src', 'pages', 'about.tsx');
    assert(fs.existsSync(filePath), 'About page file should exist');
  });

  test('Cakes page exists', () => {
    const filePath = path.join(__dirname, 'client', 'src', 'pages', 'cakes.tsx');
    assert(fs.existsSync(filePath), 'Cakes page file should exist');
  });

  test('Navigation includes new pages', () => {
    const navPath = path.join(__dirname, 'client', 'src', 'components', 'layout', 'navigation.tsx');
    const navContent = fs.readFileSync(navPath, 'utf8');
    
    assert(navContent.includes('"/cakes"'), 'Navigation should include /cakes route');
    assert(navContent.includes('"/gallery"'), 'Navigation should include /gallery route');
    assert(navContent.includes('"/about"'), 'Navigation should include /about route');
    assert(navContent.includes('"Our Cakes"'), 'Navigation should include "Our Cakes" label');
  });

  test('App router includes new routes', () => {
    const appPath = path.join(__dirname, 'client', 'src', 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    assert(appContent.includes('path="/cakes"'), 'App should have /cakes route');
    assert(appContent.includes('path="/gallery"'), 'App should have /gallery route');
    assert(appContent.includes('path="/about"'), 'App should have /about route');
    assert(appContent.includes('import Cakes from "@/pages/cakes"'), 'App should import Cakes page');
    assert(appContent.includes('import Gallery from "@/pages/gallery"'), 'App should import Gallery page');
    assert(appContent.includes('import About from "@/pages/about"'), 'App should import About page');
  });

  test('Pages use wouter for routing', () => {
    const pages = ['gallery.tsx', 'about.tsx', 'cakes.tsx'];
    pages.forEach(page => {
      const pagePath = path.join(__dirname, 'client', 'src', 'pages', page);
      const pageContent = fs.readFileSync(pagePath, 'utf8');
      assert(pageContent.includes('from "wouter"'), `${page} should import from wouter, not react-router-dom`);
      assert(!pageContent.includes('react-router-dom'), `${page} should not use react-router-dom`);
    });
  });

  // Summary
  console.log(`\n${colors.blue}Test Summary:${colors.reset}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  if (failedTests > 0) {
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  }
  console.log();

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runTests();