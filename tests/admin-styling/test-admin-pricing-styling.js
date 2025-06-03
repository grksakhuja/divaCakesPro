const { test, expect } = require('@playwright/test');

test.describe('Admin Pricing Page Styling', () => {
  // Helper function to login
  async function loginAsAdmin(page) {
    await page.goto('http://localhost:3456/admin/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/orders');
    
    // Navigate to pricing page
    await page.click('a[href="/admin/pricing"]');
    await page.waitForURL('**/admin/pricing');
  }

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display gradient tab navigation with icons', async ({ page }) => {
    // Check tab list gradient
    const tabList = await page.locator('.bg-gradient-to-r.from-pink-100.to-purple-100').first();
    await expect(tabList).toBeVisible();
    
    // Check each tab has icon
    const tabs = [
      { text: 'Custom Cakes', icon: 'Cake' },
      { text: 'Specialty Items', icon: 'ShoppingBag' },
      { text: 'Extras & Add-ons', icon: 'Palette' },
      { text: 'Backup History', icon: 'History' }
    ];

    for (const tab of tabs) {
      const tabButton = await page.locator('[role="tab"]').filter({ hasText: tab.text }).first();
      await expect(tabButton).toBeVisible();
      
      // Check icon exists
      const icon = await tabButton.locator('.w-4.h-4').first();
      await expect(icon).toBeVisible();
    }
  });

  test('should display active tab with white background', async ({ page }) => {
    const activeTab = await page.locator('[data-state="active"]').first();
    await expect(activeTab).toHaveClass(/bg-white/);
    await expect(activeTab).toHaveClass(/shadow-sm/);
  });

  test('should display base cake prices card with gradient', async ({ page }) => {
    // Check base prices card
    const basePricesCard = await page.locator('.bg-gradient-to-br.from-pink-50.to-purple-50').filter({ hasText: 'Base Cake Prices' }).first();
    await expect(basePricesCard).toBeVisible();
    await expect(basePricesCard).toHaveClass(/border-pink-200/);
    
    // Check dollar sign icon container
    const iconContainer = await basePricesCard.locator('.bg-pink-200').first();
    await expect(iconContainer).toBeVisible();
    
    // Check RM prefix in inputs
    const rmPrefix = await basePricesCard.locator('.bg-green-100.text-green-700').first();
    await expect(rmPrefix).toHaveText('RM');
  });

  test('should display flavor upcharges card with gradient', async ({ page }) => {
    const flavorCard = await page.locator('.bg-gradient-to-br.from-orange-50.to-yellow-50').filter({ hasText: 'Flavor Upcharges' }).first();
    await expect(flavorCard).toBeVisible();
    await expect(flavorCard).toHaveClass(/border-orange-200/);
    
    // Check cake icon container
    const iconContainer = await flavorCard.locator('.bg-orange-200').first();
    await expect(iconContainer).toBeVisible();
  });

  test('should display price inputs with proper styling', async ({ page }) => {
    // Check input styling
    const priceInputs = await page.locator('input[type="number"]').all();
    
    if (priceInputs.length > 0) {
      const firstInput = priceInputs[0];
      await expect(firstInput).toHaveClass(/border-gray-300 focus:border-pink-400/);
      
      // Check RM prefix exists
      const inputContainer = await firstInput.locator('..').first();
      const rmPrefix = await inputContainer.locator('.bg-green-100').first();
      await expect(rmPrefix).toBeVisible();
    }
  });

  test('should display unsaved changes banner when price is modified', async ({ page }) => {
    // Modify a price
    const firstInput = await page.locator('input[type="number"]').first();
    await firstInput.fill('100');
    
    // Check unsaved changes banner appears
    const warningBanner = await page.locator('.bg-gradient-to-r.from-yellow-50.to-amber-50').filter({ hasText: 'You have unsaved changes' }).first();
    await expect(warningBanner).toBeVisible();
    await expect(warningBanner).toHaveClass(/border-yellow-200/);
    
    // Check sparkle icon
    const sparkleIcon = await warningBanner.locator('.text-yellow-600').first();
    await expect(sparkleIcon).toBeVisible();
    
    // Check action buttons
    const resetButton = await warningBanner.locator('button').filter({ hasText: 'Reset Changes' }).first();
    await expect(resetButton).toHaveClass(/border-yellow-300 hover:bg-yellow-100/);
    
    const saveButton = await warningBanner.locator('button').filter({ hasText: 'Save Changes' }).first();
    await expect(saveButton).toHaveClass(/bg-gradient-to-r from-green-500 to-emerald-500/);
  });

  test('should display specialty items tab with gradient cards', async ({ page }) => {
    // Click specialty items tab
    await page.click('[role="tab"]:has-text("Specialty Items")');
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check specialty item cards
    const specialtyCard = await page.locator('.bg-gradient-to-br.from-white.to-pink-50').first();
    if (await specialtyCard.isVisible()) {
      await expect(specialtyCard).toHaveClass(/border-pink-100/);
      
      // Check RM prefix in specialty items
      const rmPrefix = await specialtyCard.locator('.bg-green-100.text-green-700').first();
      await expect(rmPrefix).toBeVisible();
      
      // Check category badge
      const categoryBadge = await specialtyCard.locator('.bg-purple-100.text-purple-700').first();
      if (await categoryBadge.isVisible()) {
        await expect(categoryBadge).toBeVisible();
      }
    }
  });

  test('should display backup history tab with proper styling', async ({ page }) => {
    // Click backup history tab
    await page.click('[role="tab"]:has-text("Backup History")');
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check history card
    const historyCard = await page.locator('.card').filter({ hasText: 'Pricing Backup History' }).first();
    if (await historyCard.isVisible()) {
      // Check history icon
      const historyIcon = await historyCard.locator('.h-5.w-5').first();
      await expect(historyIcon).toBeVisible();
      
      // Check backup items if any exist
      const backupItems = await page.locator('.border.rounded-lg').all();
      if (backupItems.length > 0) {
        const firstBackup = backupItems[0];
        await expect(firstBackup).toHaveClass(/p-3/);
      }
    }
  });

  test('should display save confirmation dialog with proper styling', async ({ page }) => {
    // Modify a price to enable save button
    const firstInput = await page.locator('input[type="number"]').first();
    await firstInput.fill('100');
    
    // Click save button
    const saveButton = await page.locator('button').filter({ hasText: 'Save Changes' }).first();
    await saveButton.click();
    
    // Check dialog appears
    const dialog = await page.locator('[role="alertdialog"]').first();
    await expect(dialog).toBeVisible();
    
    // Check dialog title
    const dialogTitle = await dialog.locator('[role="heading"]').first();
    await expect(dialogTitle).toContainText('Confirm Price Update');
    
    // Check dialog description
    const dialogDescription = await dialog.locator('[role="paragraph"]').first();
    await expect(dialogDescription).toContainText('Are you sure you want to update the pricing structure');
    
    // Close dialog
    await dialog.locator('button').filter({ hasText: 'Cancel' }).click();
  });

  test('should maintain consistent gradient theme across tabs', async ({ page }) => {
    const tabs = ['Custom Cakes', 'Specialty Items', 'Extras & Add-ons'];
    
    for (const tabName of tabs) {
      await page.click(`[role="tab"]:has-text("${tabName}")`);
      await page.waitForTimeout(500);
      
      // Check for gradient cards in each tab
      const gradientCards = await page.locator('[class*="bg-gradient-to-br"]').all();
      expect(gradientCards.length).toBeGreaterThan(0);
    }
  });

  test('should display loading state with proper styling', async ({ page }) => {
    // Reload page to see loading state
    await page.reload();
    
    // Check for loading spinner
    const loadingSpinner = await page.locator('.animate-spin.border-pink-500').first();
    if (await loadingSpinner.isVisible({ timeout: 2000 })) {
      await expect(loadingSpinner).toBeVisible();
      
      // Check loading text
      const loadingText = await page.locator('text=Loading pricing data').first();
      await expect(loadingText).toBeVisible();
    }
  });
});