# Admin Styling Tests

This directory contains comprehensive Playwright tests for all the admin interface styling changes implemented in CakeCraftPro.

## Test Coverage

### 1. **test-admin-login-styling.js**
Tests the styled admin login page including:
- Gradient backgrounds and animations
- Password visibility toggle
- Form input styling with icons
- Loading states
- Error handling

### 2. **test-admin-layout.js**
Tests the AdminLayout component including:
- Sidebar navigation with active states
- Mobile hamburger menu
- User welcome message
- Navigation between pages
- Logout functionality
- Gradient backgrounds

### 3. **test-admin-orders-styling.js**
Tests the admin orders page styling including:
- Stats cards with gradients and icons
- Order cards with gradient headers
- Status badges with dynamic colors
- Customer info sections
- Empty state with friendly messaging
- Action buttons and tooltips

### 4. **test-admin-pricing-styling.js**
Tests the admin pricing page styling including:
- Tab navigation with icons
- Gradient cards for pricing sections
- Unsaved changes warning banner
- Price inputs with RM prefix
- Save/Reset button styling
- Backup history display

### 5. **test-admin-gallery-styling.js**
Tests the admin gallery page styling including:
- Stats cards display
- Add Instagram post dialog
- Image cards with action buttons
- Active/Inactive toggle
- Edit dialog styling
- Integration with AdminLayout

## Running the Tests

### Prerequisites
1. Ensure your development server is running:
   ```bash
   npm run dev
   ```

2. Make sure Playwright is installed:
   ```bash
   npm install --save-dev @playwright/test
   ```

### Run All Tests
```bash
node tests/admin-styling/run-all-styling-tests.js
```

### Run Individual Tests
```bash
# Run a specific test file
npx playwright test tests/admin-styling/test-admin-login-styling.js

# Run with browser visible
npx playwright test tests/admin-styling/test-admin-login-styling.js --headed

# Run in debug mode
npx playwright test tests/admin-styling/test-admin-login-styling.js --debug
```

### Test Configuration
- **Server URL**: http://localhost:3456
- **Admin Username**: admin
- **Admin Password**: 5SAoqv3xeQLX1AL

## Test Structure

Each test file follows this pattern:
1. Setup authentication (login as admin)
2. Navigate to the specific page
3. Test visual elements (gradients, icons, animations)
4. Test interactive elements (buttons, forms, toggles)
5. Test responsive behavior
6. Test error states and edge cases

## Debugging Failed Tests

If tests fail:

1. **Check server is running**: Ensure `npm run dev` is active
2. **Check credentials**: Verify admin password hasn't changed
3. **Run in headed mode**: See what's happening in the browser
4. **Use debug mode**: Step through the test execution
5. **Check selectors**: UI changes may have affected element selectors

## Visual Regression Testing

For more comprehensive visual testing, consider adding:
- Screenshot comparisons
- Percy.io integration
- Chromatic visual testing

## Continuous Integration

To run these tests in CI:
1. Start the dev server in the background
2. Wait for server to be ready
3. Run the test suite
4. Capture screenshots on failure

Example CI configuration:
```yaml
- name: Start dev server
  run: npm run dev &
  
- name: Wait for server
  run: npx wait-on http://localhost:3456
  
- name: Run styling tests
  run: node tests/admin-styling/run-all-styling-tests.js
```

## Maintenance

When updating the admin UI:
1. Run tests to ensure nothing breaks
2. Update selectors if HTML structure changes
3. Add new tests for new features
4. Update this README with new test coverage

## Known Issues

- Tests may be flaky if animations are still running
- Mobile menu tests require viewport resizing
- Some gradients may not be testable with current Playwright APIs

---

Last Updated: 2025-01-19
Admin Password: 5SAoqv3xeQLX1AL