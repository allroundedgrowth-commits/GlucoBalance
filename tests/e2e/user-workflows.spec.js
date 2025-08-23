import { test, expect } from '@playwright/test';

test.describe('GlucoBalance User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Registration and Authentication', () => {
    test('should complete user registration flow', async ({ page }) => {
      // Navigate to registration
      await page.click('#login-btn');
      await page.waitForSelector('.auth-container', { timeout: 5000 });
      
      // Check if registration form is available
      const registerTab = page.locator('[data-tab="register"]');
      if (await registerTab.isVisible()) {
        await registerTab.click();
      }

      // Fill registration form
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="age"]', '30');
      await page.selectOption('select[name="gender"]', 'male');

      // Submit registration
      await page.click('button[type="submit"]');

      // Wait for successful registration
      await page.waitForSelector('.success-message', { timeout: 10000 });
      
      // Verify user is redirected to dashboard
      await expect(page.locator('#dashboard-page')).toBeVisible();
      await expect(page.locator('.welcome-message')).toContainText('Test User');
    });

    test('should handle registration validation errors', async ({ page }) => {
      await page.click('#login-btn');
      await page.waitForSelector('.auth-container');
      
      const registerTab = page.locator('[data-tab="register"]');
      if (await registerTab.isVisible()) {
        await registerTab.click();
      }

      // Submit empty form
      await page.click('button[type="submit"]');

      // Check for validation errors
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('required');
    });

    test('should login existing user', async ({ page }) => {
      // First register a user (setup)
      await page.evaluate(() => {
        localStorage.setItem('glucobalance-users', JSON.stringify({
          data: [{
            id: 1,
            name: 'Existing User',
            email: 'existing@example.com',
            age: 25,
            gender: 'female'
          }],
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
      });

      await page.click('#login-btn');
      await page.waitForSelector('.auth-container');

      // Fill login form
      await page.fill('input[name="email"]', 'existing@example.com');
      await page.click('button[type="submit"]');

      // Verify successful login
      await expect(page.locator('#dashboard-page')).toBeVisible();
      await expect(page.locator('.welcome-message')).toContainText('Existing User');
    });
  });

  test.describe('Risk Assessment Workflow', () => {
    test.beforeEach(async ({ page }) => {
      // Setup authenticated user
      await page.evaluate(() => {
        const user = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          age: 30,
          gender: 'male'
        };
        
        // Set up user session
        localStorage.setItem('glucobalance-users', JSON.stringify({
          data: [user],
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
        
        // Mock auth service
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    test('should complete diabetes risk assessment', async ({ page }) => {
      // Navigate to assessment
      await page.click('#assessment-btn');
      await page.waitForSelector('#assessment-page.active');

      // Start assessment
      await page.click('#start-assessment');
      await page.waitForSelector('.assessment-question');

      // Answer assessment questions
      const questions = [
        { selector: 'input[name="age"][value="2"]', label: 'Age 45-54' },
        { selector: 'input[name="gender"][value="1"]', label: 'Male' },
        { selector: 'input[name="family_history"][value="3"]', label: 'Parent with diabetes' },
        { selector: 'input[name="high_blood_pressure"][value="2"]', label: 'Yes to high blood pressure' },
        { selector: 'input[name="physical_activity"][value="0"]', label: 'Active' },
        { selector: 'input[name="bmi"][value="1"]', label: 'Normal BMI' },
        { selector: 'input[name="gestational_diabetes"][value="0"]', label: 'No gestational diabetes' },
        { selector: 'input[name="prediabetes"][value="0"]', label: 'No prediabetes' }
      ];

      for (const question of questions) {
        const element = page.locator(question.selector);
        if (await element.isVisible()) {
          await element.click();
          await page.click('.next-question');
          await page.waitForTimeout(500); // Wait for transition
        }
      }

      // Submit assessment
      await page.click('#submit-assessment');
      await page.waitForSelector('.assessment-results', { timeout: 10000 });

      // Verify results are displayed
      await expect(page.locator('.risk-score')).toBeVisible();
      await expect(page.locator('.risk-category')).toBeVisible();
      await expect(page.locator('.ai-explanation')).toBeVisible();

      // Check that results are saved
      const savedAssessment = await page.evaluate(() => {
        const assessments = JSON.parse(localStorage.getItem('glucobalance-assessments') || '{"data": []}');
        return assessments.data[0];
      });

      expect(savedAssessment).toBeTruthy();
      expect(savedAssessment.score).toBeGreaterThan(0);
    });

    test('should display appropriate risk category', async ({ page }) => {
      // Mock high-risk assessment
      await page.evaluate(() => {
        const assessment = {
          id: 1,
          userId: 1,
          score: 18,
          category: 'High',
          date: new Date().toISOString().split('T')[0],
          responses: { age: 4, bmi: 3, family_history: 5 },
          aiExplanation: 'Your assessment indicates high diabetes risk.',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('glucobalance-assessments', JSON.stringify({
          data: [assessment],
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
      });

      await page.click('#assessment-btn');
      await page.waitForSelector('#assessment-page.active');

      // Check that high risk is displayed with appropriate styling
      await expect(page.locator('.risk-category.risk-high')).toBeVisible();
      await expect(page.locator('.risk-score')).toContainText('18');
      await expect(page.locator('.ai-explanation')).toContainText('high diabetes risk');
    });
  });

  test.describe('Mood Tracking Workflow', () => {
    test.beforeEach(async ({ page }) => {
      // Setup authenticated user
      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };
      });
      await page.reload();
    });

    test('should record daily mood', async ({ page }) => {
      // Navigate to mental health page
      await page.click('[data-page="mental-health"]');
      await page.waitForSelector('#mental-health-page.active');

      // Select mood rating
      await page.click('[data-mood="4"]');
      await page.waitForTimeout(1000);

      // Verify mood is selected
      await expect(page.locator('[data-mood="4"].selected')).toBeVisible();

      // Add optional notes
      const notesInput = page.locator('#mood-notes');
      if (await notesInput.isVisible()) {
        await notesInput.fill('Feeling good today, made healthy choices');
      }

      // Save mood
      await page.click('#save-mood');
      await page.waitForSelector('.success-message');

      // Verify mood is saved
      const savedMood = await page.evaluate(() => {
        const moods = JSON.parse(localStorage.getItem('glucobalance-moods') || '{"data": []}');
        return moods.data[0];
      });

      expect(savedMood).toBeTruthy();
      expect(savedMood.mood).toBe(4);
    });

    test('should display mood history and trends', async ({ page }) => {
      // Setup mood history
      await page.evaluate(() => {
        const moods = Array.from({ length: 7 }, (_, i) => ({
          id: i + 1,
          userId: 1,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood: Math.floor(Math.random() * 3) + 3, // Moods 3-5
          createdAt: new Date().toISOString()
        }));
        
        localStorage.setItem('glucobalance-moods', JSON.stringify({
          data: moods,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
      });

      await page.click('[data-page="mental-health"]');
      await page.waitForSelector('#mental-health-page.active');

      // Check mood history is displayed
      await expect(page.locator('.mood-history')).toBeVisible();
      await expect(page.locator('.mood-chart')).toBeVisible();

      // Verify trend line is shown
      const chartCanvas = page.locator('.mood-chart canvas');
      if (await chartCanvas.isVisible()) {
        await expect(chartCanvas).toBeVisible();
      }
    });

    test('should provide AI affirmations for different moods', async ({ page }) => {
      await page.click('[data-page="mental-health"]');
      await page.waitForSelector('#mental-health-page.active');

      // Test low mood affirmation
      await page.click('[data-mood="2"]');
      await page.click('#save-mood');
      await page.waitForSelector('.ai-affirmation');

      const lowMoodAffirmation = await page.locator('.ai-affirmation').textContent();
      expect(lowMoodAffirmation).toContain('difficult');

      // Test high mood affirmation
      await page.click('[data-mood="5"]');
      await page.click('#save-mood');
      await page.waitForSelector('.ai-affirmation');

      const highMoodAffirmation = await page.locator('.ai-affirmation').textContent();
      expect(highMoodAffirmation).toContain('Wonderful');
    });
  });

  test.describe('Nutrition Planning Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };
      });
      await page.reload();
    });

    test('should generate personalized meal plan', async ({ page }) => {
      await page.click('[data-page="nutrition"]');
      await page.waitForSelector('#nutrition-page.active');

      // Open meal plan generator
      await page.click('#generate-meal-plan');
      await page.waitForSelector('.meal-plan-preferences');

      // Set preferences
      await page.selectOption('#cuisine-select', 'mediterranean');
      await page.check('input[value="vegetarian"]');
      await page.selectOption('#plan-duration', '3');

      // Generate plan
      await page.click('#create-plan');
      await page.waitForSelector('.meal-plan-display', { timeout: 15000 });

      // Verify meal plan is displayed
      await expect(page.locator('.day-1-meals')).toBeVisible();
      await expect(page.locator('.breakfast-meals')).toBeVisible();
      await expect(page.locator('.lunch-meals')).toBeVisible();
      await expect(page.locator('.dinner-meals')).toBeVisible();

      // Check that plan is saved
      const savedPlan = await page.evaluate(() => {
        const plans = JSON.parse(localStorage.getItem('glucobalance-nutritionPlans') || '{"data": []}');
        return plans.data[0];
      });

      expect(savedPlan).toBeTruthy();
      expect(savedPlan.cuisine).toBe('mediterranean');
    });

    test('should track meal adherence', async ({ page }) => {
      // Setup existing meal plan
      await page.evaluate(() => {
        const plan = {
          id: 1,
          userId: 1,
          planType: '3-day',
          cuisine: 'general',
          meals: [{
            day: 1,
            meals: {
              breakfast: ['Oatmeal with berries'],
              lunch: ['Grilled chicken salad'],
              dinner: ['Baked salmon']
            }
          }],
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('glucobalance-nutritionPlans', JSON.stringify({
          data: [plan],
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
      });

      await page.click('[data-page="nutrition"]');
      await page.waitForSelector('#nutrition-page.active');

      // Track meal adherence
      await page.click('.meal-checkbox[data-meal="breakfast"]');
      await page.click('.meal-checkbox[data-meal="lunch"]');
      // Skip dinner

      await page.click('#save-adherence');
      await page.waitForSelector('.adherence-summary');

      // Verify adherence calculation
      const adherenceText = await page.locator('.adherence-percentage').textContent();
      expect(adherenceText).toContain('67%'); // 2 out of 3 meals
    });
  });

  test.describe('Progress Dashboard Workflow', () => {
    test.beforeEach(async ({ page }) => {
      // Setup comprehensive test data
      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };

        // Setup assessment history
        const assessments = [
          { id: 1, userId: 1, score: 18, category: 'High', date: '2024-01-01' },
          { id: 2, userId: 1, score: 15, category: 'Increased', date: '2024-01-15' },
          { id: 3, userId: 1, score: 12, category: 'Increased', date: '2024-01-30' }
        ];
        localStorage.setItem('glucobalance-assessments', JSON.stringify({
          data: assessments,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));

        // Setup mood history
        const moods = Array.from({ length: 30 }, (_, i) => ({
          id: i + 1,
          userId: 1,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood: Math.floor(Math.random() * 3) + 3
        }));
        localStorage.setItem('glucobalance-moods', JSON.stringify({
          data: moods,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
      });

      await page.reload();
    });

    test('should display comprehensive progress dashboard', async ({ page }) => {
      await page.click('[data-page="progress"]');
      await page.waitForSelector('#progress-page.active');

      // Verify dashboard components
      await expect(page.locator('.risk-progress-card')).toBeVisible();
      await expect(page.locator('.mood-progress-card')).toBeVisible();
      await expect(page.locator('.nutrition-progress-card')).toBeVisible();

      // Check progress charts
      await expect(page.locator('.risk-trend-chart')).toBeVisible();
      await expect(page.locator('.mood-trend-chart')).toBeVisible();

      // Verify AI insights box
      await expect(page.locator('.ai-insights-box')).toBeVisible();
      await expect(page.locator('.ai-insights-content')).toContainText('progress');
    });

    test('should show improvement trends', async ({ page }) => {
      await page.click('[data-page="progress"]');
      await page.waitForSelector('#progress-page.active');

      // Check for improvement indicators
      await expect(page.locator('.improvement-indicator.positive')).toBeVisible();
      
      // Verify trend direction
      const trendText = await page.locator('.trend-summary').textContent();
      expect(trendText).toMatch(/(improving|better|progress)/i);
    });
  });

  test.describe('Doctor Report Generation', () => {
    test.beforeEach(async ({ page }) => {
      // Setup comprehensive health data
      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };

        // Setup 30 days of health data
        const assessments = [
          { id: 1, userId: 1, score: 20, category: 'High', date: '2024-01-01' },
          { id: 2, userId: 1, score: 15, category: 'Increased', date: '2024-01-15' },
          { id: 3, userId: 1, score: 10, category: 'Increased', date: '2024-01-30' }
        ];
        
        const moods = Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          userId: 1,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood: Math.floor(Math.random() * 2) + 4 // Mostly good moods
        }));

        localStorage.setItem('glucobalance-assessments', JSON.stringify({
          data: assessments,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
        
        localStorage.setItem('glucobalance-moods', JSON.stringify({
          data: moods,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
      });

      await page.reload();
    });

    test('should generate comprehensive doctor report', async ({ page }) => {
      await page.click('[data-page="doctor-report"]');
      await page.waitForSelector('#doctor-report-page.active');

      // Generate report
      await page.click('#generate-report');
      await page.waitForSelector('.report-content', { timeout: 15000 });

      // Verify report sections
      await expect(page.locator('.patient-summary')).toBeVisible();
      await expect(page.locator('.risk-assessment-summary')).toBeVisible();
      await expect(page.locator('.mood-tracking-summary')).toBeVisible();
      await expect(page.locator('.ai-clinical-insights')).toBeVisible();

      // Check key metrics
      await expect(page.locator('.latest-risk-score')).toContainText('10');
      await expect(page.locator('.risk-improvement')).toContainText('50%'); // 20 to 10
      await expect(page.locator('.mood-entries-count')).toContainText('25');
    });

    test('should export report as PDF', async ({ page }) => {
      await page.click('[data-page="doctor-report"]');
      await page.waitForSelector('#doctor-report-page.active');

      await page.click('#generate-report');
      await page.waitForSelector('.report-content');

      // Setup download promise
      const downloadPromise = page.waitForEvent('download');

      // Click export PDF
      await page.click('#export-pdf');

      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/glucobalance.*report.*\.pdf/i);
    });
  });

  test.describe('Offline Functionality', () => {
    test('should work offline with cached data', async ({ page }) => {
      // Setup user and data
      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Go offline
      await page.context().setOffline(true);

      // Verify offline indicator appears
      await expect(page.locator('.offline-indicator')).toBeVisible();

      // Test basic functionality still works
      await page.click('[data-page="mental-health"]');
      await page.waitForSelector('#mental-health-page.active');

      // Record mood offline
      await page.click('[data-mood="4"]');
      await page.click('#save-mood');

      // Should show queued for sync message
      await expect(page.locator('.offline-queued-message')).toBeVisible();
    });

    test('should sync data when coming back online', async ({ page }) => {
      // Setup offline data
      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };

        // Mock queued operations
        localStorage.setItem('glucobalance-offline-queue', JSON.stringify([
          {
            operation: 'create',
            table: 'moods',
            data: { userId: 1, mood: 4, date: '2024-01-01' },
            timestamp: new Date().toISOString()
          }
        ]));
      });

      await page.reload();

      // Go online
      await page.context().setOffline(false);

      // Wait for sync
      await page.waitForSelector('.sync-completed-message', { timeout: 10000 });

      // Verify offline indicator is hidden
      await expect(page.locator('.offline-indicator')).not.toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };
      });

      await page.reload();

      // Test mobile navigation
      await expect(page.locator('#bottom-nav')).toBeVisible();
      await expect(page.locator('.nav-btn')).toHaveCount(5);

      // Test swipe navigation (simulate touch events)
      await page.touchscreen.tap(200, 300);
      await page.mouse.move(200, 300);
      await page.mouse.down();
      await page.mouse.move(100, 300);
      await page.mouse.up();

      // Verify page navigation works
      await page.click('[data-page="assessment"]');
      await expect(page.locator('#assessment-page.active')).toBeVisible();
    });

    test('should handle touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };
      });

      await page.reload();

      // Test touch feedback on buttons
      const moodButton = page.locator('[data-mood="4"]');
      await moodButton.tap();

      // Verify touch feedback (button should have active state)
      await expect(moodButton).toHaveClass(/selected/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.evaluate(() => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };

        // Mock fetch to simulate network error
        window.fetch = () => Promise.reject(new Error('Network error'));
      });

      await page.reload();

      // Try to generate AI content (which would fail)
      await page.click('[data-page="assessment"]');
      await page.click('#start-assessment');

      // Should show fallback content instead of crashing
      await expect(page.locator('.assessment-question')).toBeVisible();
    });

    test('should recover from storage errors', async ({ page }) => {
      await page.evaluate(() => {
        // Mock localStorage to throw errors
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => {
          throw new Error('Storage quota exceeded');
        };

        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        window.authService = {
          isAuthenticated: () => true,
          getCurrentUser: () => user
        };
      });

      await page.reload();

      // Try to save data
      await page.click('[data-page="mental-health"]');
      await page.click('[data-mood="4"]');
      await page.click('#save-mood');

      // Should show error message but not crash
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('storage');
    });
  });
});