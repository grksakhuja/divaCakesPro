const { test, expect } = require('@playwright/test');

test.describe('Admin Orders Page Styling', () => {
  // Helper function to login
  async function loginAsAdmin(page) {
    await page.goto('http://localhost:3456/admin/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/orders');
  }

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display stats cards with gradients and icons', async ({ page }) => {
    // Check all 4 stats cards
    const statsCards = [
      { gradient: 'from-pink-50 to-pink-100', icon: 'ShoppingBag', label: 'Total Orders' },
      { gradient: 'from-yellow-50 to-orange-100', icon: 'Clock', label: 'Pending Orders' },
      { gradient: 'from-green-50 to-emerald-100', icon: 'TrendingUp', label: 'Total Revenue' },
      { gradient: 'from-purple-50 to-indigo-100', icon: 'Calendar', label: "Today's Orders" }
    ];

    for (const card of statsCards) {
      const cardElement = await page.locator('.bg-gradient-to-br').filter({ hasText: card.label }).first();
      await expect(cardElement).toBeVisible();
      
      // Check gradient classes
      await expect(cardElement).toHaveClass(new RegExp(card.gradient));
      
      // Check icon container
      const iconContainer = await cardElement.locator('.rounded-xl').first();
      await expect(iconContainer).toBeVisible();
    }
  });

  test('should display refresh button with gradient', async ({ page }) => {
    const refreshButton = await page.locator('button').filter({ hasText: 'Refresh Orders' }).first();
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toHaveClass(/bg-gradient-to-r from-pink-500 to-purple-500/);
    
    // Check icon
    const rotateIcon = await refreshButton.locator('.w-4.h-4').first();
    await expect(rotateIcon).toBeVisible();
  });

  test('should display order cards with gradient headers', async ({ page }) => {
    // Wait for orders to load
    await page.waitForSelector('.bg-gradient-to-r.from-pink-50.to-purple-50', { timeout: 10000 });
    
    const orderCards = await page.locator('.bg-white.shadow-lg').all();
    
    if (orderCards.length > 0) {
      const firstOrder = orderCards[0];
      
      // Check gradient header
      const header = await firstOrder.locator('.bg-gradient-to-r.from-pink-50.to-purple-50').first();
      await expect(header).toBeVisible();
      
      // Check cake icon in gradient container
      const iconContainer = await firstOrder.locator('.bg-gradient-to-br.from-pink-400.to-purple-500').first();
      await expect(iconContainer).toBeVisible();
      
      // Check border-left styling
      await expect(firstOrder).toHaveClass(/border-l-4 border-l-pink-400/);
    }
  });

  test('should display status badges with correct gradient styling', async ({ page }) => {
    await page.waitForSelector('.bg-gradient-to-r.from-pink-50.to-purple-50', { timeout: 10000 });
    
    // Check for various status badge styles
    const statusClasses = {
      'pending': 'from-yellow-100 to-orange-100 text-orange-800',
      'picked up': 'from-green-100 to-emerald-100 text-emerald-800',
      'confirmed': 'from-blue-100 to-indigo-100 text-indigo-800'
    };

    for (const [status, classes] of Object.entries(statusClasses)) {
      const badge = await page.locator('.bg-gradient-to-r').filter({ hasText: status }).first();
      if (await badge.isVisible()) {
        await expect(badge).toHaveClass(new RegExp(classes));
      }
    }
  });

  test('should display customer info section with gradient background', async ({ page }) => {
    await page.waitForSelector('.bg-gradient-to-r.from-pink-50.to-purple-50', { timeout: 10000 });
    
    const customerSection = await page.locator('.bg-gradient-to-br.from-blue-50.to-indigo-50').first();
    if (await customerSection.isVisible()) {
      await expect(customerSection).toHaveClass(/border-blue-100/);
      
      // Check icon
      const userIcon = await customerSection.locator('.bg-blue-200').first();
      await expect(userIcon).toBeVisible();
      
      // Check email and phone icons
      const mailIcon = await customerSection.locator('.text-blue-500').first();
      await expect(mailIcon).toBeVisible();
    }
  });

  test('should display order details sections with different gradient backgrounds', async ({ page }) => {
    await page.waitForSelector('.bg-gradient-to-r.from-pink-50.to-purple-50', { timeout: 10000 });
    
    // Check various section gradients
    const sections = [
      { gradient: 'from-pink-50 to-rose-50', icon: 'bg-pink-200' },
      { gradient: 'from-purple-50 to-indigo-50', icon: 'bg-purple-200' },
      { gradient: 'from-emerald-50 to-green-50', icon: 'bg-emerald-200' }
    ];

    for (const section of sections) {
      const sectionElement = await page.locator(`.bg-gradient-to-br.${section.gradient}`).first();
      if (await sectionElement.isVisible()) {
        // Check icon container
        const iconContainer = await sectionElement.locator(`.${section.icon}`).first();
        await expect(iconContainer).toBeVisible();
      }
    }
  });

  test('should display empty state with friendly styling', async ({ page }) => {
    // Check if there's an empty state
    const emptyState = await page.locator('.bg-gradient-to-br.from-pink-50.to-purple-50').filter({ hasText: 'No orders yet!' }).first();
    
    if (await emptyState.isVisible()) {
      // Check icon container
      const iconContainer = await emptyState.locator('.bg-gradient-to-br.from-pink-100.to-purple-100').first();
      await expect(iconContainer).toBeVisible();
      
      // Check package icon
      const packageIcon = await iconContainer.locator('.w-12.h-12.text-purple-600');
      await expect(packageIcon).toBeVisible();
      
      // Check sparkle decorations
      const sparkles = await emptyState.locator('.text-pink-500, .text-purple-500').all();
      expect(sparkles.length).toBeGreaterThan(0);
    }
  });

  test('should display action buttons with proper styling', async ({ page }) => {
    await page.waitForSelector('.bg-gradient-to-r.from-pink-50.to-purple-50', { timeout: 10000 });
    
    const orderCard = await page.locator('.bg-white.shadow-lg').first();
    
    if (await orderCard.isVisible()) {
      // Check status toggle button
      const toggleButton = await orderCard.locator('button').filter({ has: page.locator('.w-4.h-4') }).first();
      if (await toggleButton.isVisible()) {
        // Hover to check tooltip
        await toggleButton.hover();
        const tooltip = await page.locator('[role="tooltip"]').first();
        await expect(tooltip).toBeVisible({ timeout: 5000 });
      }
      
      // Check delete button
      const deleteButton = await orderCard.locator('button.text-red-600').first();
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toHaveClass(/hover:text-red-700 hover:bg-red-50/);
      }
    }
  });

  test('should display total amount with gradient background', async ({ page }) => {
    await page.waitForSelector('.bg-gradient-to-r.from-pink-50.to-purple-50', { timeout: 10000 });
    
    const totalSection = await page.locator('.bg-gradient-to-r.from-emerald-50.to-green-50').first();
    if (await totalSection.isVisible()) {
      await expect(totalSection).toHaveClass(/border-emerald-200/);
      
      // Check dollar sign icon
      const dollarIcon = await totalSection.locator('.bg-emerald-200').first();
      await expect(dollarIcon).toBeVisible();
      
      // Check amount styling
      const amount = await totalSection.locator('.text-2xl.font-bold.text-emerald-700').first();
      await expect(amount).toBeVisible();
    }
  });

  test('should handle delete confirmation dialog styling', async ({ page }) => {
    await page.waitForSelector('.bg-gradient-to-r.from-pink-50.to-purple-50', { timeout: 10000 });
    
    const deleteButton = await page.locator('button.text-red-600').first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Check dialog styling
      const dialog = await page.locator('[role="alertdialog"]').first();
      await expect(dialog).toBeVisible();
      
      // Check warning icon
      const warningIcon = await dialog.locator('.text-red-500').first();
      await expect(warningIcon).toBeVisible();
      
      // Check delete button in dialog
      const confirmDeleteButton = await dialog.locator('button').filter({ hasText: 'Delete Order' }).first();
      await expect(confirmDeleteButton).toHaveClass(/bg-red-600 hover:bg-red-700/);
      
      // Close dialog
      await dialog.locator('button').filter({ hasText: 'Cancel' }).click();
    }
  });
});