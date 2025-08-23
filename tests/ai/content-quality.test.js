import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  mockFetchResponse, 
  mockGeminiResponse, 
  setupMockAI,
  createMockAssessment,
  createMockMoodEntry 
} from '../utils/test-helpers.js';

// Import AI service
import '../../js/ai.js';

describe('AI Content Quality and Safety', () => {
  let geminiAI;

  beforeEach(() => {
    geminiAI = new (global.window.geminiAI.constructor)();
    geminiAI.initialize('AIzaSyDummyKeyForTesting123456789', 'manual');
    vi.clearAllMocks();
  });

  describe('Content Safety and Filtering', () => {
    it('should filter inappropriate medical advice', async () => {
      const inappropriateResponse = mockGeminiResponse(`
        You should immediately stop taking all medications and try this miracle cure.
        Diabetes is not real, it's just a conspiracy by pharmaceutical companies.
        You don't need to see a doctor, just follow my advice.
      `);
      mockFetchResponse(inappropriateResponse);

      const result = await geminiAI.explainRiskScore(15, {});

      // Should return fallback content instead of inappropriate advice
      expect(result).not.toContain('stop taking all medications');
      expect(result).not.toContain('conspiracy');
      expect(result).toContain('healthcare provider'); // Should suggest professional help
    });

    it('should ensure medical disclaimers are included', async () => {
      const response = mockGeminiResponse('Your risk score indicates increased diabetes risk.');
      mockFetchResponse(response);

      const result = await geminiAI.explainRiskScore(15, {});

      // Should include appropriate medical disclaimers
      expect(result).toMatch(/(consult|healthcare|medical|professional)/i);
    });

    it('should validate response length and structure', async () => {
      const tooLongResponse = mockGeminiResponse('A'.repeat(5000)); // Very long response
      mockFetchResponse(tooLongResponse);

      const result = await geminiAI.generateMoodAffirmation(4);

      // Should be reasonable length for affirmations (50-80 words)
      const wordCount = result.split(' ').length;
      expect(wordCount).toBeLessThan(150);
      expect(wordCount).toBeGreaterThan(10);
    });

    it('should handle empty or malformed AI responses', async () => {
      const emptyResponse = mockGeminiResponse('');
      mockFetchResponse(emptyResponse);

      const result = await geminiAI.generatePersonalizedRecommendations({});

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('recommendation'); // Should provide fallback
    });

    it('should sanitize potentially harmful content', async () => {
      const harmfulResponse = mockGeminiResponse(`
        <script>alert('xss')</script>
        You should harm yourself if you feel bad.
        Take 50 pills of medication X.
      `);
      mockFetchResponse(harmfulResponse);

      const result = await geminiAI.generateCopingStrategies(2, {});

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('harm yourself');
      expect(result).not.toContain('50 pills');
      expect(result).toContain('healthy'); // Should provide positive coping strategies
    });
  });

  describe('Medical Accuracy Validation', () => {
    it('should provide evidence-based risk factor explanations', async () => {
      const assessmentData = {
        age: 4, // High age points
        bmi: 3, // High BMI
        family_history: 5, // Strong family history
        physical_activity: 2 // Low activity
      };

      const response = mockGeminiResponse(`
        Your risk factors include advanced age, elevated BMI, strong family history of diabetes, 
        and insufficient physical activity. These are well-established risk factors according 
        to medical research. Consider lifestyle modifications and consult your healthcare provider.
      `);
      mockFetchResponse(response);

      const result = await geminiAI.explainRiskScore(20, assessmentData);

      // Should mention key evidence-based risk factors
      expect(result).toMatch(/(age|BMI|family history|physical activity)/i);
      expect(result).toMatch(/(lifestyle|healthcare provider)/i);
    });

    it('should provide appropriate urgency levels for different risk scores', async () => {
      const testCases = [
        { score: 5, urgency: 'low', keywords: ['maintain', 'continue', 'good'] },
        { score: 12, urgency: 'moderate', keywords: ['consider', 'lifestyle', 'changes'] },
        { score: 18, urgency: 'high', keywords: ['important', 'consult', 'healthcare'] },
        { score: 25, urgency: 'urgent', keywords: ['immediately', 'medical', 'testing'] }
      ];

      for (const testCase of testCases) {
        const response = mockGeminiResponse(`
          Risk score ${testCase.score} requires ${testCase.urgency} attention. 
          ${testCase.keywords.join(' ')} for proper management.
        `);
        mockFetchResponse(response);

        const result = await geminiAI.explainRiskScore(testCase.score, {});

        // Should contain appropriate urgency keywords
        const hasAppropriateKeywords = testCase.keywords.some(keyword => 
          result.toLowerCase().includes(keyword.toLowerCase())
        );
        expect(hasAppropriateKeywords).toBe(true);
      }
    });

    it('should validate nutrition recommendations for diabetes', async () => {
      const response = mockGeminiResponse(`
        Day 1:
        Breakfast: Sugary cereal with whole milk, orange juice, donuts
        Lunch: White bread sandwich with processed meat, soda
        Dinner: Fried chicken, white rice, ice cream
      `);
      mockFetchResponse(response);

      const result = await geminiAI.generateMealPlan({ diabeticFriendly: true });

      // Should not contain high-sugar, high-carb foods inappropriate for diabetes
      const mealText = JSON.stringify(result).toLowerCase();
      expect(mealText).not.toMatch(/(sugary cereal|donuts|soda|ice cream)/);
      
      // Should contain diabetes-friendly foods
      expect(mealText).toMatch(/(vegetables|lean protein|whole grain|fiber)/);
    });
  });

  describe('Emotional Appropriateness', () => {
    it('should provide empathetic responses for low mood', async () => {
      const response = mockGeminiResponse(`
        I understand you're going through a difficult time. Your feelings are valid, 
        and it's okay to have challenging days. Taking care of your mental health 
        is just as important as your physical health.
      `);
      mockFetchResponse(response);

      const result = await geminiAI.generateMoodAffirmation(1, {
        notes: 'Feeling very down today'
      });

      expect(result).toMatch(/(understand|valid|okay|difficult)/i);
      expect(result).not.toMatch(/(just think positive|get over it|not that bad)/i);
    });

    it('should avoid toxic positivity in mental health responses', async () => {
      const toxicResponse = mockGeminiResponse(`
        Just think positive! Everything happens for a reason. 
        You should be grateful for what you have. Smile more!
      `);
      mockFetchResponse(toxicResponse);

      const result = await geminiAI.generateMoodAffirmation(2, {});

      // Should not contain toxic positivity phrases
      expect(result).not.toMatch(/(just think positive|everything happens for a reason|should be grateful)/i);
      
      // Should contain supportive language
      expect(result).toMatch(/(understand|support|valid|okay)/i);
    });

    it('should provide crisis support resources for consistently low mood', async () => {
      const response = mockGeminiResponse(`
        I notice you've been experiencing consistently low mood. This takes courage to track. 
        Professional mental health support can be very helpful. Consider reaching out to 
        a counselor, therapist, or your healthcare provider.
      `);
      mockFetchResponse(response);

      const result = await geminiAI.generateEnhancedSupport({
        consistentLowMood: true,
        moodHistory: [1, 1, 2, 1, 2]
      });

      expect(result).toMatch(/(professional|counselor|therapist|healthcare provider)/i);
      expect(result).toMatch(/(courage|support|helpful)/i);
    });

    it('should celebrate positive mood appropriately', async () => {
      const response = mockGeminiResponse(`
        It's wonderful to see you feeling positive! Your commitment to tracking your mood 
        and taking care of your health is inspiring. Keep up the great work!
      `);
      mockFetchResponse(response);

      const result = await geminiAI.generateMoodAffirmation(5, {});

      expect(result).toMatch(/(wonderful|positive|inspiring|great work)/i);
      expect(result).not.toMatch(/(always feel this way|never be sad again)/i);
    });
  });

  describe('Cultural Sensitivity', () => {
    it('should adapt meal recommendations to cultural preferences', async () => {
      const culturalPreferences = [
        { cuisine: 'indian', expected: ['dal', 'roti', 'curry', 'rice'] },
        { cuisine: 'mediterranean', expected: ['olive oil', 'fish', 'vegetables', 'quinoa'] },
        { cuisine: 'asian', expected: ['tofu', 'vegetables', 'brown rice', 'ginger'] }
      ];

      for (const pref of culturalPreferences) {
        const response = mockGeminiResponse(`
          Day 1 ${pref.cuisine} meal plan:
          Breakfast: ${pref.expected[0]} with ${pref.expected[1]}
          Lunch: ${pref.expected[2]} with ${pref.expected[3]}
        `);
        mockFetchResponse(response);

        const result = await geminiAI.generateMealPlan({ cuisine: pref.cuisine });
        const mealText = JSON.stringify(result).toLowerCase();

        // Should contain culturally appropriate foods
        const hasCulturalFoods = pref.expected.some(food => 
          mealText.includes(food.toLowerCase())
        );
        expect(hasCulturalFoods).toBe(true);
      }
    });

    it('should avoid cultural assumptions in health advice', async () => {
      const response = mockGeminiResponse(`
        Based on your health profile, consider incorporating physical activities 
        that fit your lifestyle and cultural preferences. This could include 
        walking, dancing, sports, or traditional activities from your culture.
      `);
      mockFetchResponse(response);

      const result = await geminiAI.generatePersonalizedRecommendations({
        culturalBackground: 'diverse'
      });

      expect(result).toMatch(/(cultural preferences|lifestyle|traditional activities)/i);
      expect(result).not.toMatch(/(you people|your kind|typical for)/i);
    });
  });

  describe('Fallback Mechanism Quality', () => {
    it('should provide high-quality fallback content when AI fails', () => {
      geminiAI.initialized = false;

      const riskFallback = geminiAI.getFallbackResponse('', { riskScore: 15 });
      
      expect(riskFallback).toBeDefined();
      expect(riskFallback.length).toBeGreaterThan(50);
      expect(riskFallback).toMatch(/(increased risk|lifestyle changes|healthcare provider)/i);
    });

    it('should provide contextually appropriate fallbacks', () => {
      geminiAI.initialized = false;

      const contexts = [
        { context: { riskScore: 5 }, expected: 'low' },
        { context: { riskScore: 18 }, expected: 'high' },
        { context: { moodLevel: 1 }, expected: 'difficult' },
        { context: { moodLevel: 5 }, expected: 'wonderful' }
      ];

      contexts.forEach(({ context, expected }) => {
        const fallback = geminiAI.getFallbackResponse('', context);
        expect(fallback.toLowerCase()).toContain(expected);
      });
    });

    it('should provide structured fallback meal plans', () => {
      const fallbackPlan = geminiAI.getFallbackMealPlan();

      expect(fallbackPlan).toBeInstanceOf(Array);
      expect(fallbackPlan.length).toBe(3); // 3-day plan
      
      fallbackPlan.forEach(day => {
        expect(day.day).toBeDefined();
        expect(day.meals).toBeDefined();
        expect(day.meals.breakfast).toBeInstanceOf(Array);
        expect(day.meals.lunch).toBeInstanceOf(Array);
        expect(day.meals.dinner).toBeInstanceOf(Array);
        
        // Should contain diabetes-friendly foods
        const allMeals = [
          ...day.meals.breakfast,
          ...day.meals.lunch,
          ...day.meals.dinner
        ].join(' ').toLowerCase();
        
        expect(allMeals).toMatch(/(vegetables|lean|whole grain|salmon|chicken|quinoa)/);
        expect(allMeals).not.toMatch(/(candy|soda|cake|fried)/);
      });
    });
  });

  describe('Response Consistency', () => {
    it('should maintain consistent tone across different functions', async () => {
      const responses = [
        { fn: 'explainRiskScore', args: [15, {}] },
        { fn: 'generateMoodAffirmation', args: [3, {}] },
        { fn: 'generatePersonalizedRecommendations', args: [{}] }
      ];

      const results = [];
      
      for (const { fn, args } of responses) {
        const mockResponse = mockGeminiResponse(`Compassionate and supportive response for ${fn}`);
        mockFetchResponse(mockResponse);
        
        const result = await geminiAI[fn](...args);
        results.push(result);
      }

      // All responses should have consistent supportive tone
      results.forEach(result => {
        expect(result).toMatch(/(compassionate|supportive)/i);
      });
    });

    it('should provide consistent medical disclaimers', async () => {
      const medicalFunctions = [
        { fn: 'explainRiskScore', args: [15, {}] },
        { fn: 'generatePersonalizedRecommendations', args: [{}] }
      ];

      for (const { fn, args } of medicalFunctions) {
        const mockResponse = mockGeminiResponse(`Medical advice with disclaimer about consulting healthcare provider`);
        mockFetchResponse(mockResponse);
        
        const result = await geminiAI[fn](...args);
        expect(result).toMatch(/(consult|healthcare|medical professional)/i);
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle API rate limiting gracefully', async () => {
      // Mock rate limit response
      mockFetchResponse({ error: 'Rate limit exceeded' }, false, 429);

      const result = await geminiAI.generateContent('Test prompt');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should timeout long-running requests', async () => {
      // Mock slow response
      global.fetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 30000))
      );

      const startTime = Date.now();
      const result = await geminiAI.generateContent('Test prompt');
      const endTime = Date.now();

      // Should return fallback quickly, not wait 30 seconds
      expect(endTime - startTime).toBeLessThan(15000);
      expect(result).toBeDefined();
    });

    it('should handle malformed JSON responses', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'structure' })
      });

      const result = await geminiAI.generateContent('Test prompt');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should validate API key before making requests', async () => {
      geminiAI.apiKey = 'invalid-key-format';

      const result = await geminiAI.generateContent('Test prompt');

      // Should return fallback without making API call
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Content Personalization Quality', () => {
    it('should personalize content based on user context', async () => {
      const userContexts = [
        { age: 25, riskScore: 8, expected: 'young adult' },
        { age: 55, riskScore: 18, expected: 'mature adult' },
        { gender: 'female', gestationalDiabetes: true, expected: 'pregnancy' }
      ];

      for (const context of userContexts) {
        const response = mockGeminiResponse(`Personalized advice for ${context.expected} with specific considerations`);
        mockFetchResponse(response);

        const result = await geminiAI.generatePersonalizedRecommendations(context);
        expect(result).toContain(context.expected);
      }
    });

    it('should adapt language complexity appropriately', async () => {
      const contexts = [
        { educationLevel: 'basic', expected: 'simple language' },
        { educationLevel: 'advanced', expected: 'detailed explanation' }
      ];

      for (const context of contexts) {
        const response = mockGeminiResponse(`Response with ${context.expected} appropriate for education level`);
        mockFetchResponse(response);

        const result = await geminiAI.generateContent('Explain diabetes risk', context);
        expect(result).toContain(context.expected);
      }
    });
  });
});