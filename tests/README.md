# GlucoBalance Testing Suite

This comprehensive testing suite ensures the quality, reliability, and safety of the GlucoBalance diabetes prevention and management application.

## 📋 Test Structure

```
tests/
├── unit/                   # Unit tests for individual components
│   ├── database.test.js    # Database service tests
│   ├── auth.test.js        # Authentication service tests
│   └── ai.test.js          # AI service tests
├── integration/            # Integration tests for service interactions
│   └── database-ai.test.js # Database and AI integration tests
├── e2e/                    # End-to-end user workflow tests
│   └── user-workflows.spec.js # Complete user journey tests
├── ai/                     # AI-specific quality and safety tests
│   └── content-quality.test.js # AI content validation tests
├── utils/                  # Test utilities and helpers
│   └── test-helpers.js     # Mock factories and utilities
├── setup.js               # Global test setup
├── run-tests.js           # Test runner script
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:ai

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Using the Test Runner

```bash
# Run all tests
node tests/run-tests.js

# Run fast tests only (skip E2E)
node tests/run-tests.js --fast

# Run with coverage report
node tests/run-tests.js --coverage

# Skip specific test suites
node tests/run-tests.js --skip-e2e --skip-ai

# Show help
node tests/run-tests.js --help
```

## 🧪 Test Categories

### 1. Unit Tests (`tests/unit/`)

Test individual components and services in isolation.

**Coverage:**
- ✅ Database operations (CRUD, validation, error handling)
- ✅ Authentication (registration, login, session management)
- ✅ AI service integration (API calls, fallbacks, content generation)
- ✅ Data validation and sanitization
- ✅ Error handling and recovery
- ✅ Offline functionality
- ✅ Security features (encryption, input validation)

**Key Features:**
- Mocked dependencies for isolation
- Comprehensive error scenario testing
- Data validation testing
- Security vulnerability testing

### 2. Integration Tests (`tests/integration/`)

Test interactions between different services and components.

**Coverage:**
- ✅ Database + AI integration workflows
- ✅ Risk assessment with AI explanations
- ✅ Mood tracking with AI affirmations
- ✅ Nutrition planning with AI generation
- ✅ Progress analysis with AI insights
- ✅ Doctor report generation
- ✅ Error handling across service boundaries

**Key Features:**
- Real service interaction testing
- Data flow validation
- Cross-service error handling
- Performance testing

### 3. End-to-End Tests (`tests/e2e/`)

Test complete user workflows from start to finish.

**Coverage:**
- ✅ User registration and authentication flows
- ✅ Complete risk assessment workflow
- ✅ Mood tracking and history viewing
- ✅ Nutrition plan generation and adherence tracking
- ✅ Progress dashboard interactions
- ✅ Doctor report generation and export
- ✅ Offline functionality and sync
- ✅ Mobile responsiveness
- ✅ Error handling and recovery

**Key Features:**
- Real browser testing with Playwright
- Cross-browser compatibility
- Mobile device simulation
- Network condition simulation
- Visual regression testing

### 4. AI Quality Tests (`tests/ai/`)

Specialized tests for AI-generated content quality and safety.

**Coverage:**
- ✅ Content safety and filtering
- ✅ Medical accuracy validation
- ✅ Emotional appropriateness
- ✅ Cultural sensitivity
- ✅ Fallback mechanism quality
- ✅ Response consistency
- ✅ Performance and reliability
- ✅ Content personalization quality

**Key Features:**
- Medical content validation
- Safety filter testing
- Bias detection
- Fallback quality assurance
- Performance benchmarking

## 🛠️ Test Utilities

### Mock Factories

```javascript
import { 
  createMockUser,
  createMockAssessment,
  createMockMoodEntry,
  createMockNutritionPlan
} from './utils/test-helpers.js';

// Create test data
const user = createMockUser({ name: 'Test User', age: 30 });
const assessment = createMockAssessment({ score: 15, category: 'Increased' });
```

### Service Mocking

```javascript
import { 
  setupMockDatabase,
  setupMockAI,
  setupMockAuth
} from './utils/test-helpers.js';

// Setup mocked services
const mockDb = setupMockDatabase();
const mockAI = setupMockAI();
const mockAuth = setupMockAuth();
```

### API Response Mocking

```javascript
import { mockFetchResponse, mockGeminiResponse } from './utils/test-helpers.js';

// Mock AI API response
const aiResponse = mockGeminiResponse('AI generated content');
mockFetchResponse(aiResponse);
```

## 📊 Coverage Requirements

### Minimum Coverage Targets

- **Unit Tests:** 90% line coverage
- **Integration Tests:** 80% feature coverage
- **E2E Tests:** 100% critical user path coverage
- **AI Tests:** 95% AI function coverage

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## 🔧 Configuration

### Vitest Configuration (`vitest.config.js`)

```javascript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'coverage/']
    }
  }
});
```

### Playwright Configuration (`playwright.config.js`)

```javascript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } }
  ]
});
```

## 🚨 Quality Gates

### Pre-commit Checks

All tests must pass before code can be committed:

```bash
# Run pre-commit checks
npm run test:fast
```

### CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

## 🐛 Debugging Tests

### Debug Individual Tests

```bash
# Debug specific test file
npx vitest run tests/unit/database.test.js --reporter=verbose

# Debug with browser DevTools (E2E)
npx playwright test --debug

# Run tests in headed mode
npx playwright test --headed
```

### Debug Test Failures

```bash
# Run failed tests only
npx vitest run --reporter=verbose --bail=1

# Generate test artifacts
npx playwright test --trace=on
```

## 📝 Writing New Tests

### Unit Test Template

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupMockDatabase } from '../utils/test-helpers.js';

describe('ComponentName', () => {
  let component;
  let mockDb;

  beforeEach(() => {
    mockDb = setupMockDatabase();
    component = new ComponentName();
  });

  describe('methodName', () => {
    it('should handle normal case', async () => {
      // Arrange
      const input = 'test input';
      mockDb.someMethod.mockResolvedValue('expected result');

      // Act
      const result = await component.methodName(input);

      // Assert
      expect(result).toBe('expected result');
      expect(mockDb.someMethod).toHaveBeenCalledWith(input);
    });

    it('should handle error case', async () => {
      // Arrange
      mockDb.someMethod.mockRejectedValue(new Error('Test error'));

      // Act & Assert
      await expect(component.methodName('input')).rejects.toThrow('Test error');
    });
  });
});
```

### E2E Test Template

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup test data
  });

  test('should complete user workflow', async ({ page }) => {
    // Navigate to feature
    await page.click('#feature-button');
    
    // Interact with UI
    await page.fill('#input-field', 'test value');
    await page.click('#submit-button');
    
    // Verify results
    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('#result')).toContainText('expected text');
  });
});
```

## 🔍 Test Data Management

### Test Database

Tests use a combination of:
- **In-memory IndexedDB** (fake-indexeddb)
- **LocalStorage mocking**
- **Mock data factories**

### Test Data Cleanup

```javascript
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();
  
  // Clear storage
  localStorage.clear();
  
  // Reset IndexedDB
  global.indexedDB = require('fake-indexeddb');
});
```

## 🚀 Performance Testing

### Load Testing

```javascript
test('should handle concurrent users', async () => {
  const promises = Array.from({ length: 100 }, () => 
    simulateUserWorkflow()
  );
  
  const results = await Promise.all(promises);
  expect(results.every(r => r.success)).toBe(true);
});
```

### Memory Leak Testing

```javascript
test('should not leak memory', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  // Perform operations
  for (let i = 0; i < 1000; i++) {
    await performOperation();
  }
  
  // Force garbage collection
  if (global.gc) global.gc();
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  
  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB limit
});
```

## 📚 Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the scenario
3. **Follow AAA pattern** (Arrange, Act, Assert)
4. **Keep tests independent** and isolated
5. **Use meaningful assertions** with clear error messages

### Mock Strategy

1. **Mock external dependencies** (APIs, databases)
2. **Use real implementations** for internal logic
3. **Verify mock interactions** when important
4. **Reset mocks** between tests

### Error Testing

1. **Test error scenarios** explicitly
2. **Verify error messages** and types
3. **Test error recovery** mechanisms
4. **Test edge cases** and boundary conditions

### Performance

1. **Keep tests fast** (< 100ms for unit tests)
2. **Use parallel execution** when possible
3. **Minimize setup/teardown** overhead
4. **Profile slow tests** and optimize

## 🤝 Contributing

### Adding New Tests

1. **Identify test category** (unit/integration/e2e/ai)
2. **Create test file** in appropriate directory
3. **Follow naming conventions** (`*.test.js` or `*.spec.js`)
4. **Add to test runner** if needed
5. **Update documentation**

### Test Review Checklist

- [ ] Tests cover happy path and error cases
- [ ] Tests are independent and isolated
- [ ] Mocks are appropriate and verified
- [ ] Test names are descriptive
- [ ] Coverage meets requirements
- [ ] Performance is acceptable
- [ ] Documentation is updated

## 📞 Support

For questions about testing:

1. **Check existing tests** for examples
2. **Review test utilities** in `utils/test-helpers.js`
3. **Run tests locally** to understand behavior
4. **Check CI/CD logs** for failure details

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mock Service Worker](https://mswjs.io/) (for API mocking)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)