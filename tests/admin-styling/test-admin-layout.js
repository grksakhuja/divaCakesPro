const { test, expect } = require('@playwright/test');

test.describe('Admin Layout Component', () => {
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

  test('should display sidebar with correct styling', async ({ page }) => {
    // Check sidebar container
    const sidebar = await page.locator('aside').first();
    await expect(sidebar).toHaveClass(/fixed top-0 left-0 z-40 h-screen w-64 bg-white shadow-xl/);

    // Check logo section
    const logoSection = await page.locator('.border-b.border-pink-100').first();
    await expect(logoSection).toBeVisible();
    
    const chefHatIcon = await page.locator('.bg-gradient-to-br.from-pink-400.to-purple-500').first();
    await expect(chefHatIcon).toBeVisible();
    
    const brandName = await page.locator('.bg-gradient-to-r.from-pink-600.to-purple-600.bg-clip-text').first();
    await expect(brandName).toHaveText('Sugar Art Diva');
  });

  test('should display user welcome message', async ({ page }) => {
    const welcomeSection = await page.locator('.border-b.border-pink-100').nth(1);
    await expect(welcomeSection).toContainText('Welcome back');
    
    // Should show admin username
    const adminName = await welcomeSection.locator('.font-semibold.text-gray-800');
    await expect(adminName).toHaveText('admin');
  });

  test('should highlight active navigation item', async ({ page }) => {
    // On orders page by default
    const ordersLink = await page.locator('a[href="/admin/orders"]').first();
    await expect(ordersLink).toHaveClass(/bg-gradient-to-r from-pink-100 to-purple-100/);
    
    // Check for active indicator dot
    const activeDot = await ordersLink.locator('.bg-pink-500.rounded-full');
    await expect(activeDot).toBeVisible();

    // Navigate to pricing
    await page.click('a[href="/admin/pricing"]');
    await page.waitForURL('**/admin/pricing');
    
    // Check pricing is now active
    const pricingLink = await page.locator('a[href="/admin/pricing"]').first();
    await expect(pricingLink).toHaveClass(/bg-gradient-to-r from-pink-100 to-purple-100/);
  });

  test('should display navigation icons with correct colors', async ({ page }) => {
    const navItems = [
      { href: '/admin/orders', color: 'text-pink-600' },
      { href: '/admin/pricing', color: 'text-green-600' },
      { href: '/admin/gallery', color: 'text-purple-600' },
      { href: '/admin/about-content', color: 'text-blue-600' },
      { href: '/admin/contact-content', color: 'text-orange-600' }
    ];

    for (const item of navItems) {
      const link = await page.locator(`a[href="${item.href}"]`).first();
      const icon = await link.locator(`.${item.color}`).first();
      await expect(icon).toBeVisible();
    }
  });

  test('should navigate between pages correctly', async ({ page }) => {
    // Test navigation to each page
    const pages = [
      { href: '/admin/pricing', title: 'Pricing Management' },
      { href: '/admin/gallery', title: 'Gallery Management' },
      { href: '/admin/orders', title: 'Order Management' }
    ];

    for (const pageInfo of pages) {
      await page.click(`a[href="${pageInfo.href}"]`);
      await page.waitForURL(`**${pageInfo.href}`);
      
      // Check page title
      const pageTitle = await page.locator('h1').first();
      await expect(pageTitle).toContainText(pageInfo.title);
    }
  });

  test('should display logout button and function correctly', async ({ page }) => {
    const logoutButton = await page.locator('button').filter({ hasText: 'Logout' }).first();
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toHaveClass(/text-gray-600 hover:text-red-600/);

    // Click logout
    await logoutButton.click();
    
    // Should redirect to login
    await page.waitForURL('**/admin/login');
    await expect(page).toHaveURL(/admin\/login/);
  });

  test('should display page header with gradient background', async ({ page }) => {
    const header = await page.locator('header').first();
    await expect(header).toHaveClass(/bg-white\/80 backdrop-blur-sm shadow-sm/);
    
    // Check title
    const title = await header.locator('h1');
    await expect(title).toHaveText('Order Management');
    
    // Check admin mode indicator
    const adminMode = await page.locator('.bg-pink-100.text-pink-700').filter({ hasText: 'Admin Mode' });
    await expect(adminMode).toBeVisible();
  });

  test('should display footer with cake emoji', async ({ page }) => {
    const footer = await page.locator('footer').first();
    await expect(footer).toContainText('© 2024 Sugar Art Diva. Made with 🎂 and ❤️');
  });

  test('should toggle mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sidebar should be hidden initially
    const sidebar = await page.locator('aside').first();
    await expect(sidebar).toHaveClass(/-translate-x-full/);
    
    // Click hamburger menu
    const menuButton = await page.locator('button').filter({ has: page.locator('.w-6.h-6') }).first();
    await menuButton.click();
    
    // Sidebar should be visible
    await expect(sidebar).toHaveClass(/translate-x-0/);
    
    // Click overlay to close
    const overlay = await page.locator('.fixed.inset-0.bg-black\\/20').first();
    await overlay.click();
    
    // Sidebar should be hidden again
    await expect(sidebar).toHaveClass(/-translate-x-full/);
  });

  test('should maintain gradient background across all pages', async ({ page }) => {
    const mainContainer = await page.locator('.min-h-screen').first();
    await expect(mainContainer).toHaveClass(/bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50/);
    
    // Check on different pages
    await page.click('a[href="/admin/pricing"]');
    await page.waitForURL('**/admin/pricing');
    await expect(mainContainer).toHaveClass(/bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50/);
  });
});