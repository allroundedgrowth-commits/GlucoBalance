import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createMockUser, 
  createMockAssessment, 
  createMockMoodEntry,
  setupMockOfflineManager 
} from '../utils/test-helpers.js';

// Import the database class
import '../../js/database.js';

describe('KiroDatabase', () => {
  let db;
  let mockOfflineManager;

  beforeEach(async () => {
    // Reset IndexedDB
    global.indexedDB = require('fake-indexeddb');
    
    // Setup mock offline manager
    mockOfflineManager = setupMockOfflineManager();
    
    // Create new database instance
    db = new (global.window.kiroDb.constructor)();
    await db.init();
  });

  describe('User Management', () => {
    it('should create a new user successfully', async () => {
      const userData = createMockUser();
      delete userData.id; // Remove ID as it should be auto-generated
      
      const result = await db.createUser(userData);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should retrieve a user by ID', async () => {
      const userData = createMockUser();
      delete userData.id;
      
      const createdUser = await db.createUser(userData);
      const retrievedUser = await db.getUser(createdUser.id);
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.id).toBe(createdUser.id);
      expect(retrievedUser.name).toBe(userData.name);
    });

    it('should update user information', async () => {
      const userData = createMockUser();
      delete userData.id;
      
      const createdUser = await db.createUser(userData);
      const updates = { name: 'Updated Name', age: 35 };
      
      const updatedUser = await db.updateUser(createdUser.id, updates);
      
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.age).toBe(35);
      expect(updatedUser.updatedAt).not.toBe(createdUser.updatedAt);
    });

    it('should handle user creation when offline', async () => {
      global.navigator.onLine = false;
      const userData = createMockUser();
      delete userData.id;
      
      const result = await db.createUser(userData);
      
      expect(result).toBeDefined();
      expect(mockOfflineManager.queueOperation).toHaveBeenCalledWith(
        'create', 
        'users', 
        expect.objectContaining(userData)
      );
    });
  });

  describe('Risk Assessment Management', () => {
    it('should save risk assessment data', async () => {
      const userId = 1;
      const assessmentData = {
        date: '2024-01-01',
        score: 15,
        category: 'Increased',
        responses: { age: 2, bmi: 3 },
        explanation: 'Test explanation'
      };
      
      const result = await db.saveAssessment(userId, assessmentData);
      
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.score).toBe(15);
      expect(result.category).toBe('Increased');
    });

    it('should retrieve user assessments', async () => {
      const userId = 1;
      const assessmentData = createMockAssessment();
      
      await db.saveAssessment(userId, assessmentData);
      const assessments = await db.getUserAssessments(userId);
      
      expect(assessments).toBeInstanceOf(Array);
      expect(assessments.length).toBeGreaterThan(0);
      expect(assessments[0].userId).toBe(userId);
    });

    it('should get latest assessment', async () => {
      const userId = 1;
      
      // Create multiple assessments
      await db.saveAssessment(userId, { ...createMockAssessment(), date: '2024-01-01' });
      await db.saveAssessment(userId, { ...createMockAssessment(), date: '2024-01-02' });
      
      const latest = await db.getLatestAssessment(userId);
      
      expect(latest).toBeDefined();
      expect(latest.userId).toBe(userId);
    });
  });

  describe('Mood Tracking', () => {
    it('should save mood entry', async () => {
      const userId = 1;
      const date = '2024-01-01';
      const mood = 4;
      const notes = 'Feeling good today';
      
      const result = await db.saveMood(userId, date, mood, notes);
      
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.date).toBe(date);
      expect(result.mood).toBe(mood);
      expect(result.notes).toBe(notes);
    });

    it('should update existing mood for same date', async () => {
      const userId = 1;
      const date = '2024-01-01';
      
      // Save initial mood
      await db.saveMood(userId, date, 3, 'Initial mood');
      
      // Update mood for same date
      const updated = await db.saveMood(userId, date, 5, 'Updated mood');
      
      expect(updated.mood).toBe(5);
      expect(updated.notes).toBe('Updated mood');
    });

    it('should retrieve mood by date', async () => {
      const userId = 1;
      const date = '2024-01-01';
      const mood = 4;
      
      await db.saveMood(userId, date, mood);
      const retrieved = await db.getMoodByDate(userId, date);
      
      expect(retrieved).toBeDefined();
      expect(retrieved.mood).toBe(mood);
      expect(retrieved.date).toBe(date);
    });

    it('should get user moods within date range', async () => {
      const userId = 1;
      
      // Create moods for different dates
      await db.saveMood(userId, '2024-01-01', 3);
      await db.saveMood(userId, '2024-01-02', 4);
      await db.saveMood(userId, '2024-01-03', 5);
      
      const moods = await db.getUserMoods(userId, 30);
      
      expect(moods).toBeInstanceOf(Array);
      expect(moods.length).toBe(3);
      expect(moods.every(m => m.userId === userId)).toBe(true);
    });

    it('should handle mood saving when offline', async () => {
      global.navigator.onLine = false;
      const userId = 1;
      const date = '2024-01-01';
      const mood = 4;
      
      const result = await db.saveMood(userId, date, mood);
      
      expect(result).toBeDefined();
      expect(mockOfflineManager.queueOperation).toHaveBeenCalled();
    });
  });

  describe('Nutrition Plan Management', () => {
    it('should save nutrition plan', async () => {
      const userId = 1;
      const planData = {
        planType: '3-day',
        cuisine: 'mediterranean',
        dietaryRestrictions: ['vegetarian'],
        meals: [{ day: 1, breakfast: ['Oatmeal'] }]
      };
      
      const result = await db.saveNutritionPlan(userId, planData);
      
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.planType).toBe('3-day');
      expect(result.cuisine).toBe('mediterranean');
    });

    it('should retrieve user nutrition plans', async () => {
      const userId = 1;
      const planData = createMockNutritionPlan();
      
      await db.saveNutritionPlan(userId, planData);
      const plans = await db.getUserNutritionPlans(userId);
      
      expect(plans).toBeInstanceOf(Array);
      expect(plans.length).toBeGreaterThan(0);
      expect(plans[0].userId).toBe(userId);
    });
  });

  describe('Progress Tracking', () => {
    it('should save progress data', async () => {
      const userId = 1;
      const metricType = 'weight';
      const value = 70.5;
      const date = '2024-01-01';
      
      const result = await db.saveProgress(userId, metricType, value, date);
      
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.metricType).toBe(metricType);
      expect(result.value).toBe(value);
      expect(result.date).toBe(date);
    });

    it('should retrieve user progress data', async () => {
      const userId = 1;
      
      await db.saveProgress(userId, 'weight', 70.5, '2024-01-01');
      await db.saveProgress(userId, 'weight', 70.0, '2024-01-02');
      
      const progress = await db.getUserProgress(userId, 'weight', 30);
      
      expect(progress).toBeInstanceOf(Array);
      expect(progress.length).toBe(2);
      expect(progress.every(p => p.metricType === 'weight')).toBe(true);
    });
  });

  describe('Health Report Generation', () => {
    it('should generate comprehensive health report', async () => {
      const userId = 1;
      
      // Create test data
      await db.saveAssessment(userId, createMockAssessment());
      await db.saveMood(userId, '2024-01-01', 4);
      await db.saveProgress(userId, 'weight', 70.5);
      
      const report = await db.generateHealthReport(userId, 30);
      
      expect(report).toBeDefined();
      expect(report.assessments).toBeInstanceOf(Array);
      expect(report.moods).toBeInstanceOf(Array);
      expect(report.progress).toBeInstanceOf(Array);
      expect(report.summary).toBeDefined();
      expect(report.summary.totalMoodEntries).toBeDefined();
      expect(report.summary.averageMood).toBeDefined();
    });
  });

  describe('LocalStorage Fallback', () => {
    beforeEach(() => {
      // Force localStorage mode
      db.useLocalStorage = true;
    });

    it('should create user in localStorage when database unavailable', async () => {
      const userData = createMockUser();
      delete userData.id;
      
      const result = await db.createUser(userData);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should retrieve user from localStorage', async () => {
      const userData = createMockUser();
      localStorage.getItem.mockReturnValue(JSON.stringify({
        data: [userData],
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
      
      const result = await db.getUser(userData.id);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(userData.id);
    });

    it('should handle localStorage quota exceeded', async () => {
      const userData = createMockUser();
      delete userData.id;
      
      // Mock quota exceeded error
      localStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      // Should not throw error, should handle gracefully
      await expect(db.createUser(userData)).resolves.toBeDefined();
    });
  });

  describe('Data Validation and Security', () => {
    it('should validate data structure when reading from localStorage', () => {
      const invalidData = { invalid: 'structure' };
      localStorage.getItem.mockReturnValue(JSON.stringify(invalidData));
      
      const result = db.getFromLocalStorage('users');
      
      expect(result).toBeNull();
    });

    it('should verify data checksum', () => {
      const testData = [{ id: 1, name: 'Test' }];
      const checksum = db.calculateChecksum(testData);
      
      expect(db.verifyChecksum(testData, checksum)).toBe(true);
      expect(db.verifyChecksum([{ id: 2, name: 'Different' }], checksum)).toBe(false);
    });

    it('should cleanup old data when storage is full', () => {
      // Mock localStorage with old data
      const oldKeys = ['glucobalance-old1', 'glucobalance-old2'];
      Object.defineProperty(localStorage, 'length', { value: oldKeys.length });
      Object.keys = vi.fn(() => oldKeys);
      
      oldKeys.forEach(key => {
        localStorage.getItem.mockReturnValueOnce(JSON.stringify({
          data: {},
          timestamp: '2023-01-01T00:00:00.000Z'
        }));
      });
      
      db.cleanupOldData();
      
      expect(localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      db.db = null;
      
      await expect(db.performTransaction('users', 'readonly', () => {}))
        .rejects.toThrow('Database not initialized');
    });

    it('should handle transaction errors', async () => {
      // Mock transaction error
      const mockTransaction = {
        objectStore: vi.fn(() => {
          throw new Error('Transaction failed');
        })
      };
      
      db.db = {
        transaction: vi.fn(() => mockTransaction)
      };
      
      await expect(db.performTransaction('users', 'readonly', () => {}))
        .rejects.toThrow();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const result = db.getFromLocalStorage('users');
      
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalled();
    });
  });
});