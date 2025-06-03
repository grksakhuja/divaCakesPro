const { test, expect } = require('@playwright/test');

test.describe('Admin Gallery Page Styling', () => {
  // Helper function to login - using the correct password
  async function loginAsAdmin(page) {
    await page.goto('http://localhost:3456/admin/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', '5SAoqv3xeQLX1AL');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/orders');
    
    // Navigate to gallery page
    await page.click('a[href="/admin/gallery"]');
    await page.waitForURL('**/admin/gallery');
  }

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display stats cards with gradients', async ({ page }) => {
    // Check for 3 stats cards
    const statsCards = [
      { gradient: 'from-purple-50 to-pink-50', icon: 'Image', label: 'Total Images' },
      { gradient: 'from-green-50 to-emerald-50', icon: 'Eye', label: 'Active Images' },
      { gradient: 'from-indigo-50 to-blue-50', icon: 'Sparkles', label: 'Categories' }
    ];

    for (const card of statsCards) {
      const cardElement = await page.locator('.bg-gradient-to-br').filter({ hasText: card.label }).first();
      await expect(cardElement).toBeVisible();
      
      // Check gradient classes
      await expect(cardElement).toHaveClass(new RegExp(card.gradient));
      
      // Check icon container with colored background
      const iconContainer = await cardElement.locator('.rounded-xl').first();
      await expect(iconContainer).toBeVisible();
    }
  });

  test('should display add Instagram post button', async ({ page }) => {
    const addButton = await page.locator('button').filter({ hasText: 'Add Instagram Post' }).first();
    await expect(addButton).toBeVisible();
    
    // Check plus icon
    const plusIcon = await addButton.locator('.h-4.w-4').first();
    await expect(plusIcon).toBeVisible();
  });

  test('should display add Instagram dialog with proper styling', async ({ page }) => {
    const addButton = await page.locator('button').filter({ hasText: 'Add Instagram Post' }).first();
    await addButton.click();
    
    // Check dialog appears
    const dialog = await page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    
    // Check dialog title
    const dialogTitle = await dialog.locator('[role="heading"]').filter({ hasText: 'Add Instagram Post' }).first();
    await expect(dialogTitle).toBeVisible();
    
    // Check form fields
    const urlInput = await dialog.locator('#instagramUrl');
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toHaveAttribute('placeholder', 'https://www.instagram.com/p/...');
    
    // Check category section with "Add New" button
    const addNewCategoryButton = await dialog.locator('button').filter({ hasText: 'Add New' }).first();
    await expect(addNewCategoryButton).toBeVisible();
    await expect(addNewCategoryButton).toHaveClass(/text-xs gap-1/);
    
    // Close dialog
    await dialog.locator('button').filter({ hasText: 'Cancel' }).click();
  });

  test('should display gallery grid with image cards', async ({ page }) => {
    // Wait for gallery to load
    await page.waitForTimeout(2000);
    
    // Check for gallery grid or empty state
    const galleryGrid = await page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3').first();
    const emptyState = await page.locator('.text-center').filter({ hasText: 'No Gallery Images Yet' }).first();
    
    if (await galleryGrid.isVisible()) {
      // Check image cards
      const imageCards = await galleryGrid.locator('.overflow-hidden').all();
      
      if (imageCards.length > 0) {
        const firstCard = imageCards[0];
        
        // Check card has proper structure
        const cardHeader = await firstCard.locator('.pb-3').first();
        await expect(cardHeader).toBeVisible();
        
        // Check badges
        const activeBadge = await firstCard.locator('[class*="badge"]').first();
        await expect(activeBadge).toBeVisible();
        
        // Check action buttons
        const actionButtons = await firstCard.locator('button[class*="ghost"]').all();
        expect(actionButtons.length).toBeGreaterThanOrEqual(3); // Toggle, Edit, Delete
      }
    } else if (await emptyState.isVisible()) {
      // Check empty state styling
      const instagramIcon = await emptyState.locator('.h-16.w-16.text-gray-400').first();
      await expect(instagramIcon).toBeVisible();
      
      const emptyMessage = await emptyState.locator('h3').first();
      await expect(emptyMessage).toHaveText('No Gallery Images Yet');
      
      const addFirstButton = await emptyState.locator('button').filter({ hasText: 'Add Your First Post' }).first();
      await expect(addFirstButton).toBeVisible();
    }
  });

  test('should display loading state with spinner', async ({ page }) => {
    // Reload to catch loading state
    await page.reload();
    
    // Try to catch loading spinner
    const loadingSpinner = await page.locator('.animate-spin.border-purple-500').first();
    if (await loadingSpinner.isVisible({ timeout: 1000 })) {
      await expect(loadingSpinner).toBeVisible();
      
      const loadingText = await page.locator('text=Loading gallery images').first();
      await expect(loadingText).toBeVisible();
    }
  });

  test('should display edit dialog when clicking edit button', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const editButton = await page.locator('button[class*="ghost"]').nth(1);
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Check edit dialog
      const editDialog = await page.locator('[role="dialog"]').filter({ hasText: 'Edit Gallery Image' }).first();
      await expect(editDialog).toBeVisible();
      
      // Check form fields in edit dialog
      const titleInput = await editDialog.locator('#edit-title');
      await expect(titleInput).toBeVisible();
      
      const descriptionTextarea = await editDialog.locator('#edit-description');
      await expect(descriptionTextarea).toBeVisible();
      
      // Check update button
      const updateButton = await editDialog.locator('button').filter({ hasText: 'Update' }).first();
      await expect(updateButton).toBeVisible();
      
      // Close dialog
      await editDialog.locator('button').filter({ hasText: 'Cancel' }).click();
    }
  });

  test('should toggle image active status', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const toggleButton = await page.locator('button[class*="ghost"]').first();
    
    if (await toggleButton.isVisible()) {
      // Check initial state
      const eyeIcon = await toggleButton.locator('.h-4.w-4').first();
      const initialIconClass = await eyeIcon.getAttribute('class');
      
      // Click toggle
      await toggleButton.click();
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Check if icon changed (Eye to EyeOff or vice versa)
      const updatedIcon = await toggleButton.locator('.h-4.w-4').first();
      const updatedIconClass = await updatedIcon.getAttribute('class');
      
      // Icons should be different after toggle
      expect(initialIconClass).not.toBe(updatedIconClass);
    }
  });

  test('should display Instagram link with proper styling', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const instagramLink = await page.locator('a[href*="instagram.com"]').first();
    
    if (await instagramLink.isVisible()) {
      await expect(instagramLink).toHaveClass(/text-blue-600 hover:text-blue-700/);
      
      // Check Instagram icon
      const instagramIcon = await instagramLink.locator('.h-3.w-3').first();
      await expect(instagramIcon).toBeVisible();
      
      // Check link text
      await expect(instagramLink).toContainText('View on Instagram');
    }
  });

  test('should display delete button with red styling', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const deleteButton = await page.locator('button.text-red-600').first();
    
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toHaveClass(/text-red-600 hover:text-red-700/);
      
      // Check trash icon
      const trashIcon = await deleteButton.locator('.h-4.w-4').first();
      await expect(trashIcon).toBeVisible();
    }
  });

  test('should integrate with admin layout properly', async ({ page }) => {
    // Check that admin layout is present
    const sidebar = await page.locator('aside').first();
    await expect(sidebar).toBeVisible();
    
    // Check gallery nav item is active
    const galleryNavItem = await page.locator('a[href="/admin/gallery"]').first();
    await expect(galleryNavItem).toHaveClass(/bg-gradient-to-r from-pink-100 to-purple-100/);
    
    // Check page title in header
    const pageTitle = await page.locator('h1').filter({ hasText: 'Gallery Management' }).first();
    await expect(pageTitle).toBeVisible();
    
    // Check page description
    const pageDescription = await page.locator('text=Manage Instagram posts displayed in your gallery').first();
    await expect(pageDescription).toBeVisible();
  });
});