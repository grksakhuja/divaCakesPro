# CakeCraftPro Test Suite

## Directory Structure

### 📁 `/core/`
Core testing infrastructure and utilities:
- `run-all-tests.js` - Main test suite runner with categorized test execution
- `pricing-test-utils.js` - Shared utilities for pricing calculations and test scenarios

### 📁 `/pricing/`
All pricing-related tests organized by complexity:

#### `/pricing/basic/`
Working, stable pricing tests:
- `test-pricing.js` - Basic pricing functionality tests
- `smart-pricing-test.js` - Self-maintaining tests with dynamic calculations
- `fixed-comprehensive-pricing-test.js` - Fixed comprehensive tests with correct expectations

#### `/pricing/comprehensive/`
Extensive pricing tests (some may have hardcoded expectations):
- `comprehensive-pricing-test.js` - Full pricing coverage (may need expectation updates)
- `stress-test-pricing.js` - High-load pricing tests
- `edge-case-pricing-tests.js` - Edge case scenario testing
- `extensive-pricing-test.js` - Broad test coverage
- `fathers-day-pricing-test.js` - Special event pricing tests

#### `/pricing/validation/`
Validation and verification utilities:
- `comprehensive-pricing-verification.js` - Pricing validation checks
- `currency-format-verification.js` - Currency formatting validation
- `quick-pricing-check.js` - Fast pricing verification

### 📁 `/features/`
Feature-specific test suites:

#### `/features/cart/`
Shopping cart functionality:
- `test-cart-functionality.js` - Core cart operations
- `test-cart-ui.js` - Cart user interface tests
- `test-complete-cart-system.js` - End-to-end cart testing

#### `/features/orders/`
Order processing and management:
- `test-complete-checkout-flow.js` - Full checkout process
- `test-multi-item-order-system.js` - Multiple item order handling
- `test-order-integration.js` - Order system integration tests

#### `/features/admin/`
Admin panel and management features:
- `test-pricing-management.js` - Admin pricing management interface
- `test-pricing-e2e.js` - End-to-end admin pricing tests
- `test-dynamic-specialty-items.js` - Dynamic specialty items system

### 📁 `/database/`
Database connectivity and operations:
- `test-db-connection.js` - Database connection testing
- `test-db-direct.js` - Direct database operation tests

### 📁 `/utils/`
Testing utilities and debugging tools:
- `debug-pricing.js` - Pricing debugging utilities
- `test-summary.js` - Test result summary generator
- `test-new-features.js` - New feature validation tests

## Running Tests

### Via NPM Scripts
```bash
# Run all working tests
npm test
npm run test:all

# Run specific test categories
npm run test:basic      # Basic pricing tests
npm run test:smart      # Smart pricing tests
npm run test:dynamic    # Dynamic specialty items

# Run individual test files
node tests/pricing/basic/test-pricing.js
node tests/features/cart/test-cart-functionality.js
```

### Via Test Runner
```bash
# Run from project root
node tests/core/run-all-tests.js

# Options:
node tests/core/run-all-tests.js --fast          # Faster execution
node tests/core/run-all-tests.js --verbose       # Detailed output
node tests/core/run-all-tests.js --include-broken # Include tests with known issues
```

## Test Categories

### ✅ Working Tests
Tests that are stable and should pass consistently:
- Basic pricing tests
- Smart pricing tests
- Fixed comprehensive tests
- Dynamic specialty items tests

### 🔴 Tests with Issues
Tests that may fail due to hardcoded expectations:
- Some comprehensive pricing tests
- Stress tests with outdated expectations
- Edge case tests requiring updates

## Development Guidelines

### Adding New Tests
1. Place tests in the appropriate category directory
2. Import utilities from `../../core/pricing-test-utils.js`
3. Update `run-all-tests.js` if the test should be included in the main suite
4. Add npm script if it's a commonly used test

### Updating Test Paths
When moving or renaming test files:
1. Update `tests/core/run-all-tests.js` test arrays
2. Update `package.json` npm scripts
3. Update any documentation references
4. Test that all references work correctly

### Import Paths
From test files to utilities:
- From `/pricing/basic/`: `import from '../../core/pricing-test-utils.js'`
- From `/pricing/comprehensive/`: `import from '../../core/pricing-test-utils.js'`
- From `/features/admin/`: `import from '../../core/pricing-test-utils.js'`

## Troubleshooting

### Test Runner Issues
- Ensure you're running from the project root directory
- Check that all import paths are correct relative to the test file location
- Verify the server is not already running on the test port

### Path Issues
- All test imports should be relative to their current directory
- The test runner expects relative paths from its location in `/tests/core/`
- NPM scripts run from project root, so use full paths from root

## Maintenance

This organized structure makes it easier to:
- Find relevant tests for specific features
- Maintain and update test expectations
- Add new tests in logical categories
- Run targeted test suites for specific functionality