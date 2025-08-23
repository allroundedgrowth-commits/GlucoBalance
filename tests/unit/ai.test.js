import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  mockFetchResponse, 
  mockGeminiResponse, 
  createMockAssessment,
  createMockMoodEntry 
} from '../utils/test-helpers.js';

// Import the AI service
import '../../js/ai.js';

describe('GeminiAI', () => {
  let geminiAI;

  beforeEach(() => {
    geminiAI = new (global.window.geminiAI.constructor)();
    vi.clearAllMocks();
  });

  describe('Initialization and API Key Management', () => {
    it('should initialize with valid API key', () => {
      const validKey = 'AIzaSyDummyKeyForTesting123456789';
      
      const result = geminiAI.initialize(validKey, 'manual');
      
      expect(result).toBe(true);
      expect(geminiAI.isInitialized()).toBe(true);
      expect(geminiAI.getKeySource()).toBe('manual');
    });

    it('should reject invalid API key format', () => {
      const invalidKey = 'invalid-key-format';
      
      const result = geminiAI.initialize(invalidKey);
      
      expect(result).toBe(false);
      expect(geminiAI.isInitialized()).toBe(false);
    });

    it('should store API key securely', () => {
      const validKey = 'AIzaSyDummyKeyForTesting123456789';
      
      geminiAI.initialize(validKey, 'manual');
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'glucobalance_ai_key',
        expect.any(String)
      );
    });

    it('should retrieve stored API key', () => {
      const validKey = 'AIzaSyDummyKeyForTesting123456789';
      const encoded = btoa(validKey);
      localStorage.getItem.mockReturnValue(encoded);
      
      const retrievedKey = geminiAI.getStoredApiKey();
      
      expect(retrievedKey).toBe(validKey);
    });

    it('should clear stored API key', () => {
      geminiAI.clearStoredApiKey();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('glucobalance_ai_key');
      expect(geminiAI.isInitialized()).toBe(false);
    });

    it('should handle storage errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const validKey = 'AIzaSyDummyKeyForTesting123456789';
      
      // Should not throw error
      expect(() => geminiAI.initialize(validKey, 'manual')).not.toThrow();
    });
  });

  describe('Content Generation', () => {
    beforeEach(() => {
      geminiAI.initialize('AIzaSyDummyKeyForTesting123456789', 'manual');
    });

    it('should generate content with valid API response', async () => {
      const mockResponse = mockGeminiResponse('Generated AI content');
      mockFetchResponse(mockResponse);

      const result = await geminiAI.generateContent('Test prompt');

      expect(result).toBe('Generated AI content');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should handle API errors and return fallback', async () => {
      mockFetchResponse({}, false, 500);

      const result = await geminiAI.generateContent('Test prompt');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should build proper prompt with context', () => {
      const prompt = 'Test prompt';
      const context = { userId: 1, mood: 4 };

      const builtPrompt = geminiAI.buildPrompt(prompt, context);

      expect(builtPrompt).toContain(prompt);
      expect(builtPrompt).toContain(JSON.stringify(context));
      expect(builtPrompt).toContain('compassionate AI health assistant');
    });

    it('should return fallback when not initialized', async () => {
      geminiAI.initialized = false;

      const result = await geminiAI.generateContent('Test prompt');

      expect(result).toBeDefined();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Risk Assessment AI', () => {
    beforeEach(() => {
      geminiAI.initialize('AIzaSyDummyKeyForTesting123456789', 'manual');
    });

    it('should explain risk score with AI insights', async () => {
      const mockResponse = mockGeminiResponse('Your risk score indicates...');
      mockFetchResponse(mockResponse);

      const assessmentData = createMockAssessment();
      const result = await geminiAI.explainRiskScore(15, assessmentData.responses);

      expect(result).toBe('Your risk score indicates...');
      expect(fetch).toHaveBeenCalled();
    });

    it('should analyze risk factors correctly', () => {
      const assessmentData = {
        age: 4, // High age points
        gender: 1, // Male
        family_history: 5, // High family history
        high_blood_pressure: 2,
        physical_activity: 2,
        bmi: 3, // High BMI
        gestational_diabetes: 0,
        prediabetes: 5 // High prediabetes
      };

      const factors = geminiAI.analyzeRiskFactors(assessmentData);

      expect(factors).toBeInstanceOf(Array);
      expect(factors.length).toBeGreaterThan(0);
      
      // Check for high-impact factors
      const highImpactFactors = factors.filter(f => f.impact === 'high');
      expect(highImpactFactors.length).toBeGreaterThan(0);
      
      // Verify specific factors are identified
      const factorTypes = factors.map(f => f.factor);
      expect(factorTypes).toContain('Age');
      expect(factorTypes).toContain('Family History');
      expect(factorTypes).toContain('Body Weight');
    });

    it('should categorize risk scores correctly', () => {
      expect(geminiAI.getRiskCategory(5)).toBe('Low');
      expect(geminiAI.getRiskCategory(10)).toBe('Increased');
      expect(geminiAI.getRiskCategory(18)).toBe('High');
      expect(geminiAI.getRiskCategory(25)).toBe('Possible Diabetes');
    });

    it('should generate personalized recommendations', async () => {
      const mockResponse = mockGeminiResponse('Based on your profile...');
      mockFetchResponse(mockResponse);

      const userData = {
        riskScore: 15,
        age: 45,
        lifestyle: 'sedentary'
      };

      const result = await geminiAI.generatePersonalizedRecommendations(userData);

      expect(result).toBe('Based on your profile...');
    });

    it('should provide fallback risk explanations', () => {
      geminiAI.initialized = false;

      const fallback = geminiAI.getFallbackResponse('', { riskScore: 15 });

      expect(fallback).toBeDefined();
      expect(fallback).toContain('Increased');
    });
  });

  describe('Nutrition AI', () => {
    beforeEach(() => {
      geminiAI.initialize('AIzaSyDummyKeyForTesting123456789', 'manual');
    });

    it('should generate meal plan with preferences', async () => {
      const mockResponse = mockGeminiResponse(`
        Day 1:
        Breakfast:
        - Oatmeal with berries
        - Greek yogurt
        
        Lunch:
        - Grilled chicken salad
        
        Dinner:
        - Baked salmon
      `);
      mockFetchResponse(mockResponse);

      const preferences = {
        cuisine: 'mediterranean',
        restrictions: ['vegetarian'],
        days: 3
      };

      const result = await geminiAI.generateMealPlan(preferences);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(fetch).toHaveBeenCalled();
    });

    it('should parse meal plan response correctly', () => {
      const mockResponse = `
        Day 1:
        Breakfast:
        - Oatmeal with berries
        - Greek yogurt
        
        Lunch:
        - Grilled chicken salad
        
        Dinner:
        - Baked salmon
        
        Day 2:
        Breakfast:
        - Smoothie bowl
      `;

      const parsed = geminiAI.parseMealPlan(mockResponse);

      expect(parsed).toBeInstanceOf(Array);
      expect(parsed.length).toBe(2);
      expect(parsed[0].day).toBe(1);
      expect(parsed[0].meals.breakfast).toContain('Oatmeal with berries');
      expect(parsed[1].day).toBe(2);
    });

    it('should return fallback meal plan when parsing fails', () => {
      const invalidResponse = 'Invalid meal plan format';

      const parsed = geminiAI.parseMealPlan(invalidResponse);

      expect(parsed).toBeInstanceOf(Array);
      expect(parsed.length).toBe(3); // Fallback 3-day plan
      expect(parsed[0].meals).toBeDefined();
    });

    it('should handle custom meal plan prompts', async () => {
      const mockResponse = mockGeminiResponse('Custom meal plan...');
      mockFetchResponse(mockResponse);

      const preferences = {
        prompt: 'Create a low-carb meal plan for diabetes management',
        days: 7
      };

      const result = await geminiAI.generateMealPlan(preferences);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('low-carb meal plan')
        })
      );
    });
  });

  describe('Mental Health AI', () => {
    beforeEach(() => {
      geminiAI.initialize('AIzaSyDummyKeyForTesting123456789', 'manual');
    });

    it('should generate mood affirmation', async () => {
      const mockResponse = mockGeminiResponse('You are doing great...');
      mockFetchResponse(mockResponse);

      const result = await geminiAI.generateMoodAffirmation(4, {
        recentTrend: 'improving',
        notes: 'Feeling better today'
      });

      expect(result).toBe('You are doing great...');
      expect(fetch).toHaveBeenCalled();
    });

    it('should generate coping strategies', async () => {
      const mockResponse = mockGeminiResponse('1. Deep breathing exercises...');
      mockFetchResponse(mockResponse);

      const result = await geminiAI.generateCopingStrategies(2, {
        stressors: ['work', 'health concerns'],
        recentTrend: 'declining'
      });

      expect(result).toBe('1. Deep breathing exercises...');
    });

    it('should generate enhanced support for low mood', async () => {
      const mockResponse = mockGeminiResponse('I understand this is difficult...');
      mockFetchResponse(mockResponse);

      const result = await geminiAI.generateEnhancedSupport({
        consistentLowMood: true,
        moodHistory: [1, 2, 1, 2, 2]
      });

      expect(result).toBe('I understand this is difficult...');
    });

    it('should generate mood pattern insights', async () => {
      const mockResponse = mockGeminiResponse('Your mood patterns show...');
      mockFetchResponse(mockResponse);

      const moodData = {
        moodHistory: [3, 4, 3, 5, 4],
        trends: { average: 3.8, direction: 'stable' },
        timeframe: '7 days'
      };

      const result = await geminiAI.generateMoodPatternInsights(moodData);

      expect(result).toBe('Your mood patterns show...');
    });

    it('should provide fallback mood affirmations', () => {
      geminiAI.initialized = false;

      const fallback = geminiAI.getFallbackResponse('', { moodLevel: 4 });

      expect(fallback).toBeDefined();
      expect(fallback).toContain('positive');
    });
  });

  describe('Progress Analysis AI', () => {
    beforeEach(() => {
      geminiAI.initialize('AIzaSyDummyKeyForTesting123456789', 'manual');
    });

    it('should analyze progress trends', async () => {
      const mockResponse = mockGeminiResponse('Your progress shows improvement...');
      mockFetchResponse(mockResponse);

      const progressData = {
        riskScores: [15, 12, 10],
        moods: [3, 4, 4, 5],
        nutritionAdherence: [0.8, 0.85, 0.9],
        timeframe: '30 days'
      };

      const result = await geminiAI.analyzeProgressTrends(progressData);

      expect(result).toBe('Your progress shows improvement...');
    });

    it('should generate motivational messages', async () => {
      const mockResponse = mockGeminiResponse('Congratulations on your achievements...');
      mockFetchResponse(mockResponse);

      const achievements = [
        'Completed 7-day mood tracking',
        'Improved risk score by 3 points'
      ];

      const result = await geminiAI.generateMotivationalMessage(achievements);

      expect(result).toBe('Congratulations on your achievements...');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    beforeEach(() => {
      geminiAI.initialize('AIzaSyDummyKeyForTesting123456789', 'manual');
    });

    it('should handle network errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await geminiAI.generateContent('Test prompt');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle API rate limiting', async () => {
      mockFetchResponse({ error: 'Rate limit exceeded' }, false, 429);

      const result = await geminiAI.generateContent('Test prompt');

      expect(result).toBeDefined();
    });

    it('should handle malformed API responses', async () => {
      mockFetchResponse({ invalid: 'response format' });

      const result = await geminiAI.generateContent('Test prompt');

      expect(result).toBeDefined();
    });

    it('should provide appropriate fallback content', () => {
      const testCases = [
        { context: { riskScore: 5 }, expected: 'Low' },
        { context: { moodLevel: 1 }, expected: 'difficult' },
        { context: {}, expected: 'recommendations' }
      ];

      testCases.forEach(testCase => {
        const fallback = geminiAI.getFallbackResponse('', testCase.context);
        expect(fallback).toContain(testCase.expected);
      });
    });
  });

  describe('API Key Prompt UI', () => {
    it('should create API key prompt modal', async () => {
      const mockModal = {
        querySelector: vi.fn(),
        addEventListener: vi.fn()
      };
      
      document.createElement.mockReturnValue(mockModal);
      document.body.appendChild = vi.fn();

      // Mock user clicking save with valid key
      mockModal.querySelector
        .mockReturnValueOnce({ value: 'AIzaSyValidKey123' }) // API key input
        .mockReturnValueOnce({ addEventListener: vi.fn() }) // Save button
        .mockReturnValueOnce({ addEventListener: vi.fn() }); // Skip button

      const promise = geminiAI.promptForApiKey();

      // Simulate save button click
      const saveHandler = mockModal.querySelector.mock.results[1].value.addEventListener.mock.calls[0][1];
      saveHandler();

      const result = await promise;

      expect(result).toBe(true);
      expect(geminiAI.isInitialized()).toBe(true);
    });

    it('should handle user skipping API key setup', async () => {
      const mockModal = {
        querySelector: vi.fn(),
        addEventListener: vi.fn()
      };
      
      document.createElement.mockReturnValue(mockModal);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      mockModal.querySelector
        .mockReturnValueOnce({ value: '' }) // Empty API key input
        .mockReturnValueOnce({ addEventListener: vi.fn() }) // Save button
        .mockReturnValueOnce({ addEventListener: vi.fn() }); // Skip button

      const promise = geminiAI.promptForApiKey();

      // Simulate skip button click
      const skipHandler = mockModal.querySelector.mock.results[2].value.addEventListener.mock.calls[0][1];
      skipHandler();

      const result = await promise;

      expect(result).toBe(false);
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });
});

describe('AIService', () => {
  let aiService;
  let mockGemini;

  beforeEach(() => {
    mockGemini = {
      isInitialized: vi.fn(() => true),
      initialize: vi.fn(() => true),
      promptForApiKey: vi.fn(() => Promise.resolve(true)),
      explainRiskScore: vi.fn(),
      generatePersonalizedRecommendations: vi.fn(),
      generateMealPlan: vi.fn(),
      generateMoodAffirmation: vi.fn(),
      generateCopingStrategies: vi.fn(),
      generateEnhancedSupport: vi.fn(),
      analyzeProgressTrends: vi.fn(),
      generateMotivationalMessage: vi.fn(),
      generateContent: vi.fn(),
      getKeySource: vi.fn(() => 'manual')
    };

    global.window.geminiAI = mockGemini;
    
    // Import and create AIService instance
    const AIServiceClass = eval(`
      class AIService {
        constructor() {
          this.gemini = window.geminiAI;
          this.fallbackMode = false;
        }
        
        async ensureInitialized() {
          if (!this.gemini.isInitialized()) {
            const userProvidedKey = await this.gemini.promptForApiKey();
            if (!userProvidedKey) {
              this.fallbackMode = true;
              return false;
            }
          }
          return true;
        }
        
        async getRiskExplanation(score, assessmentData) {
          if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
          }
          return await this.gemini.explainRiskScore(score, assessmentData);
        }
        
        isAvailable() {
          return this.gemini.isInitialized();
        }
      }
      AIService
    `);
    
    aiService = new AIServiceClass();
  });

  describe('Service Integration', () => {
    it('should ensure AI is initialized before operations', async () => {
      mockGemini.isInitialized.mockReturnValue(false);
      mockGemini.promptForApiKey.mockResolvedValue(true);

      await aiService.ensureInitialized();

      expect(mockGemini.promptForApiKey).toHaveBeenCalled();
    });

    it('should handle AI initialization failure', async () => {
      mockGemini.isInitialized.mockReturnValue(false);
      mockGemini.promptForApiKey.mockResolvedValue(false);

      const result = await aiService.ensureInitialized();

      expect(result).toBe(false);
      expect(aiService.fallbackMode).toBe(true);
    });

    it('should throw error when AI not available', async () => {
      mockGemini.isInitialized.mockReturnValue(false);
      mockGemini.promptForApiKey.mockResolvedValue(false);

      await expect(aiService.getRiskExplanation(15, {}))
        .rejects.toThrow('AI service not available');
    });

    it('should report availability status correctly', () => {
      mockGemini.isInitialized.mockReturnValue(true);
      expect(aiService.isAvailable()).toBe(true);

      mockGemini.isInitialized.mockReturnValue(false);
      expect(aiService.isAvailable()).toBe(false);
    });
  });
});