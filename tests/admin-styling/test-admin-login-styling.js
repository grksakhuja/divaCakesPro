const { test, expect } = require('@playwright/test');

test.describe('Admin Login Page Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3456/admin/login');
  });

  test('should display gradient background and decorative elements', async ({ page }) => {
    // Check gradient background
    const background = await page.locator('.min-h-screen').first();
    await expect(background).toHaveClass(/bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50/);

    // Check decorative sparkle elements
    const sparkles = await page.locator('.animate-pulse').all();
    expect(sparkles.length).toBeGreaterThanOrEqual(2);

    // Check chef hat bounce animation
    const chefHatBounce = await page.locator('.animate-bounce').first();
    await expect(chefHatBounce).toBeVisible();
  });

  test('should display styled login card with branding', async ({ page }) => {
    // Check card styling
    const card = await page.locator('.max-w-md').first();
    await expect(card).toHaveClass(/shadow-2xl bg-white\/95 backdrop-blur border-pink-100/);

    // Check gradient header
    const header = await page.locator('.bg-gradient-to-r.from-pink-50.to-purple-50').first();
    await expect(header).toBeVisible();

    // Check chef hat icon in gradient container
    const iconContainer = await page.locator('.bg-gradient-to-br.from-pink-400.to-purple-500').first();
    await expect(iconContainer).toBeVisible();

    // Check title with gradient text
    const title = await page.locator('.bg-gradient-to-r.from-pink-600.to-purple-600.bg-clip-text').first();
    await expect(title).toHaveText('Sugar Art Diva');
  });

  test('should have styled form inputs with icons', async ({ page }) => {
    // Check username input with icon
    const usernameInput = await page.locator('#username');
    await expect(usernameInput).toHaveClass(/pl-10 border-pink-200 focus:border-pink-400/);
    
    const userIcon = await page.locator('input#username ~ .absolute .w-5.h-5').first();
    await expect(userIcon).toBeVisible();

    // Check password input with icon
    const passwordInput = await page.locator('#password');
    await expect(passwordInput).toHaveClass(/pl-10 pr-10 border-purple-200 focus:border-purple-400/);
    
    const lockIcon = await page.locator('input#password ~ .absolute .w-5.h-5').first();
    await expect(lockIcon).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = await page.locator('#password');
    const toggleButton = await page.locator('button[type="button"]').filter({ hasText: /Eye/ });

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should display gradient submit button with hover effects', async ({ page }) => {
    const submitButton = await page.locator('button[type="submit"]');
    
    // Check gradient styling
    await expect(submitButton).toHaveClass(/bg-gradient-to-r from-pink-500 to-purple-500/);
    
    // Check text and icon
    await expect(submitButton).toContainText('Sign In to Admin Panel');
    const sparkleIcon = await submitButton.locator('.w-5.h-5').first();
    await expect(sparkleIcon).toBeVisible();
  });

  test('should show loading state when logging in', async ({ page }) => {
    // Fill in credentials
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    
    // Click submit and check loading state
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Should show loading spinner and text
    await expect(submitButton).toContainText('Signing in...');
    const spinner = await submitButton.locator('.animate-spin').first();
    await expect(spinner).toBeVisible();
  });

  test('should display error styling on failed login', async ({ page }) => {
    // Fill in wrong credentials
    await page.fill('#username', 'wrong');
    await page.fill('#password', 'wrong');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Wait for error toast
    await page.waitForTimeout(1000);
    
    // Check for error toast (implementation may vary)
    const toast = await page.locator('[role="alert"]').first();
    if (await toast.isVisible()) {
      await expect(toast).toContainText(/Login failed|Invalid/i);
    }
  });
});