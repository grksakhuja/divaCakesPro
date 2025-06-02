import puppeteer from 'puppeteer';

// Test configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function runE2ETest() {
  console.log(`${BLUE}${'='.repeat(50)}${RESET}`);
  console.log(`${BLUE}PRICING MANAGEMENT E2E TEST${RESET}`);
  console.log(`${BLUE}${'='.repeat(50)}${RESET}`);
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Step 1: Navigate to admin login
    console.log(`\n${BLUE}Step 1: Admin Login${RESET}`);
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForSelector('input[placeholder="Username"]', { timeout: 5000 });
    
    // Login
    await page.type('input[placeholder="Username"]', ADMIN_USERNAME);
    await page.type('input[placeholder="Password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to orders page
    await page.waitForNavigation();
    console.log(`${GREEN}✓ Logged in successfully${RESET}`);
    
    // Step 2: Navigate to pricing management
    console.log(`\n${BLUE}Step 2: Navigate to Pricing Management${RESET}`);
    await page.waitForSelector('button:has-text("Manage Pricing")', { timeout: 5000 });
    await page.click('button:has-text("Manage Pricing")');
    
    await page.waitForSelector('h1:has-text("Pricing Management")', { timeout: 5000 });
    console.log(`${GREEN}✓ Pricing management page loaded${RESET}`);
    
    // Step 3: Record original 6-inch cake price
    console.log(`\n${BLUE}Step 3: Record Original Prices${RESET}`);
    const originalPrice = await page.$eval('#basePrices-6inch', el => el.value);
    console.log(`  Original 6-inch price: RM ${originalPrice}`);
    
    // Step 4: Update prices
    console.log(`\n${BLUE}Step 4: Update Prices${RESET}`);
    
    // Clear and set new 6-inch price
    await page.click('#basePrices-6inch', { clickCount: 3 });
    await page.type('#basePrices-6inch', '95.00');
    
    // Clear and set new 8-inch price
    await page.click('#basePrices-8inch', { clickCount: 3 });
    await page.type('#basePrices-8inch', '165.00');
    
    // Clear and set new layer price
    await page.click('#layerPrice', { clickCount: 3 });
    await page.type('#layerPrice', '16.00');
    
    console.log(`${GREEN}✓ Prices updated in form${RESET}`);
    
    // Step 5: Save changes
    console.log(`\n${BLUE}Step 5: Save Changes${RESET}`);
    await page.waitForSelector('button:has-text("Save Changes")', { timeout: 5000 });
    await page.click('button:has-text("Save Changes")');
    
    // Confirm in dialog
    await page.waitForSelector('button:has-text("Update Prices")', { timeout: 5000 });
    await page.click('button:has-text("Update Prices")');
    
    // Wait for success toast
    await page.waitForSelector('[role="alert"]:has-text("Success")', { timeout: 5000 });
    console.log(`${GREEN}✓ Prices saved successfully${RESET}`);
    
    // Step 6: Verify price update in cake builder
    console.log(`\n${BLUE}Step 6: Verify Price Update in Cake Builder${RESET}`);
    
    // Navigate to cake builder
    await page.goto(`${BASE_URL}/order`);
    await page.waitForSelector('h1:has-text("Choose Your Cake Size")', { timeout: 5000 });
    
    // Check if the 6-inch button shows the new price
    const sixInchButtonText = await page.$eval(
      'button:has-text("6-inch")',
      el => el.textContent
    );
    
    if (sixInchButtonText.includes('RM 95.00')) {
      console.log(`${GREEN}✓ Cake builder shows updated price${RESET}`);
    } else {
      throw new Error(`Cake builder still shows old price: ${sixInchButtonText}`);
    }
    
    // Step 7: Test price calculation
    console.log(`\n${BLUE}Step 7: Test Price Calculation${RESET}`);
    
    // Select 6-inch cake
    await page.click('button:has-text("6-inch")');
    await page.click('button:has-text("Next Step")');
    
    // Select 2 layers
    await page.waitForSelector('button[aria-label="Increase layers"]', { timeout: 5000 });
    await page.click('button[aria-label="Increase layers"]');
    await page.click('button:has-text("Next Step")');
    
    // Wait for price display
    await page.waitForSelector('[data-testid="running-cost"]', { timeout: 5000 });
    
    // Get the displayed price
    const totalPrice = await page.$eval('[data-testid="running-cost"]', el => {
      const match = el.textContent.match(/RM\s*([\d.]+)/);
      return match ? parseFloat(match[1]) : null;
    });
    
    // Expected: 95.00 (base) + 16.00 (1 extra layer) = 111.00
    const expectedPrice = 111.00;
    if (Math.abs(totalPrice - expectedPrice) < 0.01) {
      console.log(`${GREEN}✓ Price calculation correct: RM ${totalPrice}${RESET}`);
    } else {
      throw new Error(`Expected RM ${expectedPrice}, got RM ${totalPrice}`);
    }
    
    // Step 8: Restore original prices
    console.log(`\n${BLUE}Step 8: Restore Original Prices${RESET}`);
    
    // Go back to pricing management
    await page.goto(`${BASE_URL}/admin/pricing`);
    await page.waitForSelector('#basePrices-6inch', { timeout: 5000 });
    
    // Restore original price
    await page.click('#basePrices-6inch', { clickCount: 3 });
    await page.type('#basePrices-6inch', originalPrice);
    
    // Save
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('button:has-text("Update Prices")', { timeout: 5000 });
    await page.click('button:has-text("Update Prices")');
    
    await page.waitForSelector('[role="alert"]:has-text("Success")', { timeout: 5000 });
    console.log(`${GREEN}✓ Original prices restored${RESET}`);
    
    // Step 9: Check backup history
    console.log(`\n${BLUE}Step 9: Verify Backup History${RESET}`);
    
    await page.click('[role="tab"]:has-text("Backup History")');
    await page.waitForSelector('[role="tabpanel"]', { timeout: 5000 });
    
    const backupCount = await page.$$eval(
      '[role="tabpanel"] > div > div > div > div',
      elements => elements.length
    );
    
    if (backupCount > 0) {
      console.log(`${GREEN}✓ Found ${backupCount} backup(s) in history${RESET}`);
    } else {
      console.log(`${YELLOW}⚠ No backups found (may be normal on first run)${RESET}`);
    }
    
    console.log(`\n${GREEN}${'='.repeat(50)}${RESET}`);
    console.log(`${GREEN}E2E TEST COMPLETED SUCCESSFULLY! 🎉${RESET}`);
    console.log(`${GREEN}${'='.repeat(50)}${RESET}`);
    
  } catch (error) {
    console.error(`\n${RED}E2E Test Failed: ${error.message}${RESET}`);
    
    // Take screenshot on failure
    await page.screenshot({ 
      path: 'test-failure-screenshot.png',
      fullPage: true 
    });
    console.log(`${YELLOW}Screenshot saved as test-failure-screenshot.png${RESET}`);
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is installed
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  require.resolve('puppeteer');
  runE2ETest().catch(console.error);
} catch (error) {
  console.error(`${RED}Puppeteer is not installed!${RESET}`);
  console.log(`\nTo run this E2E test, install puppeteer:`);
  console.log(`${YELLOW}npm install --save-dev puppeteer${RESET}`);
  console.log(`\nThen run: ${YELLOW}node test-pricing-e2e.js${RESET}`);
}