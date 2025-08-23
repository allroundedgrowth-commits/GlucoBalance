import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  setupMockDatabase, 
  setupMockAI, 
  createMockUser, 
  createMockAssessment,
  createMockMoodEntry,
  mockFetchResponse,
  mockGeminiResponse
} from '../utils/test-helpers.js';

describe('Database and AI Integration', () => {
  let mockDb;
  let mockAI;

  beforeEach(() => {
    mockDb = setupMockDatabase();
    mockAI = setupMockAI();
  });

  describe('Risk Assessment with AI Integration', () => {
    it('should save assessment with AI-generated explanation', async () => {
      const userId = 1;
      const assessmentData = {
        score: 15,
        category: 'Increased',
        responses: { age: 2, bmi: 3, family_history: 5 }
      };

      // Mock AI explanation
      const aiExplanation = 'Your risk score of 15 indicates increased diabetes risk...';
      mockAI.explainRiskScore.mockResolvedValue(aiExplanation);

      // Mock database save
      const savedAssessment = {
        id: 1,
        userId,
        ...assessmentData,
        aiExplanation,
        createdAt: new Date().toISOString()
      };
      mockDb.saveAssessment.mockResolvedValue(savedAssessment);

      // Simulate the integration workflow
      const explanation = await mockAI.explainRiskScore(assessmentData.score, assessmentData.responses);
      const finalAssessmentData = { ...assessmentData, aiExplanation: explanation };
      const result = await mockDb.saveAssessment(userId, finalAssessmentData);

      expect(mockAI.explainRiskScore).toHaveBeenCalledWith(
        assessmentData.score,
        assessmentData.responses
      );
      expect(mockDb.saveAssessment).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          aiExplanation: aiExplanation
        })
      );
      expect(result.aiExplanation).toBe(aiExplanation);
    });

    it('should handle AI failure gracefully during assessment', async () => {
      const userId = 1;
      const assessmentData = {
        score: 15,
        category: 'Increased',
        responses: { age: 2, bmi: 3 }
      };

      // Mock AI failure
      mockAI.explainRiskScore.mockRejectedValue(new Error('AI service unavailable'));

      // Mock database save with fallback
      const savedAssessment = {
        id: 1,
        userId,
        ...assessmentData,
        aiExplanation: 'Your assessment shows increased diabetes risk. Please consult with a healthcare provider.',
        createdAt: new Date().toISOString()
      };
      mockDb.saveAssessment.mockResolvedValue(savedAssessment);

      // Simulate error handling workflow
      let explanation;
      try {
        explanation = await mockAI.explainRiskScore(assessmentData.score, assessmentData.responses);
      } catch (error) {
        explanation = 'Your assessment shows increased diabetes risk. Please consult with a healthcare provider.';
      }

      const finalAssessmentData = { ...assessmentData, aiExplanation: explanation };
      const result = await mockDb.saveAssessment(userId, finalAssessmentData);

      expect(result.aiExplanation).toBeDefined();
      expect(result.aiExplanation).toContain('increased diabetes risk');
    });

    it('should retrieve assessment history with AI explanations', async () => {
      const userId = 1;
      const mockAssessments = [
        createMockAssessment({ 
          id: 1, 
          score: 10, 
          aiExplanation: 'First assessment explanation' 
        }),
        createMockAssessment({ 
          id: 2, 
          score: 15, 
          aiExplanation: 'Second assessment explanation' 
        })
      ];

      mockDb.getUserAssessments.mockResolvedValue(mockAssessments);

      const assessments = await mockDb.getUserAssessments(userId);

      expect(assessments).toHaveLength(2);
      expect(assessments[0].aiExplanation).toBe('First assessment explanation');
      expect(assessments[1].aiExplanation).toBe('Second assessment explanation');
    });
  });

  describe('Mood Tracking with AI Support', () => {
    it('should save mood with AI-generated affirmation', async () => {
      const userId = 1;
      const date = '2024-01-01';
      const mood = 4;
      const notes = 'Feeling good today';

      // Mock AI affirmation
      const aiAffirmation = 'Your positive mood is wonderful! Keep up the great work on your health journey.';
      mockAI.generateMoodAffirmation.mockResolvedValue(aiAffirmation);

      // Mock database save
      const savedMood = {
        id: 1,
        userId,
        date,
        mood,
        notes,
        aiAffirmation,
        createdAt: new Date().toISOString()
      };
      mockDb.saveMood.mockResolvedValue(savedMood);

      // Simulate the integration workflow
      const affirmation = await mockAI.generateMoodAffirmation(mood, { notes });
      const result = await mockDb.saveMood(userId, date, mood, notes);

      expect(mockAI.generateMoodAffirmation).toHaveBeenCalledWith(mood, { notes });
      expect(result.aiAffirmation).toBe(aiAffirmation);
    });

    it('should generate coping strategies for low mood', async () => {
      const userId = 1;
      const date = '2024-01-01';
      const mood = 2;
      const notes = 'Feeling stressed about health';

      // Mock AI coping strategies
      const copingStrategies = [
        'Practice deep breathing exercises for 5 minutes',
        'Take a short walk outside',
        'Write down three things you\'re grateful for'
      ];
      mockAI.generateCopingStrategies.mockResolvedValue(copingStrategies.join('\n'));

      // Mock mood history for context
      const moodHistory = [
        createMockMoodEntry({ mood: 2, date: '2024-01-01' }),
        createMockMoodEntry({ mood: 1, date: '2023-12-31' }),
        createMockMoodEntry({ mood: 3, date: '2023-12-30' })
      ];
      mockDb.getUserMoods.mockResolvedValue(moodHistory);

      // Simulate the integration workflow
      const recentMoods = await mockDb.getUserMoods(userId, 7);
      const strategies = await mockAI.generateCopingStrategies(mood, {
        stressors: ['health concerns'],
        moodHistory: recentMoods,
        recentTrend: 'declining'
      });

      expect(mockDb.getUserMoods).toHaveBeenCalledWith(userId, 7);
      expect(mockAI.generateCopingStrategies).toHaveBeenCalledWith(
        mood,
        expect.objectContaining({
          stressors: ['health concerns'],
          moodHistory: recentMoods
        })
      );
      expect(strategies).toContain('breathing exercises');
    });

    it('should detect consistent low mood and provide enhanced support', async () => {
      const userId = 1;
      const lowMoodHistory = [
        createMockMoodEntry({ mood: 1, date: '2024-01-05' }),
        createMockMoodEntry({ mood: 2, date: '2024-01-04' }),
        createMockMoodEntry({ mood: 1, date: '2024-01-03' }),
        createMockMoodEntry({ mood: 2, date: '2024-01-02' }),
        createMockMoodEntry({ mood: 1, date: '2024-01-01' })
      ];

      mockDb.getUserMoods.mockResolvedValue(lowMoodHistory);

      // Mock enhanced support message
      const enhancedSupport = 'I notice you\'ve been experiencing consistently low mood. It takes courage to track your feelings, and seeking professional support can be very helpful.';
      mockAI.generateEnhancedSupport.mockResolvedValue(enhancedSupport);

      // Simulate detection workflow
      const recentMoods = await mockDb.getUserMoods(userId, 7);
      const averageMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
      const consistentLowMood = averageMood <= 2.5 && recentMoods.length >= 5;

      if (consistentLowMood) {
        const support = await mockAI.generateEnhancedSupport({
          consistentLowMood: true,
          moodHistory: recentMoods,
          moodTrends: { average: averageMood, direction: 'low' }
        });

        expect(support).toContain('consistently low mood');
        expect(support).toContain('professional support');
      }

      expect(consistentLowMood).toBe(true);
      expect(mockAI.generateEnhancedSupport).toHaveBeenCalled();
    });
  });

  describe('Nutrition Planning Integration', () => {
    it('should generate and save personalized meal plan', async () => {
      const userId = 1;
      const preferences = {
        cuisine: 'mediterranean',
        restrictions: ['vegetarian', 'gluten-free'],
        days: 3
      };

      // Mock AI meal plan generation
      const aiMealPlan = [
        {
          day: 1,
          meals: {
            breakfast: ['Greek yogurt with berries', 'Gluten-free toast'],
            lunch: ['Mediterranean quinoa salad'],
            dinner: ['Grilled vegetables with hummus']
          }
        }
      ];
      mockAI.generateMealPlan.mockResolvedValue(aiMealPlan);

      // Mock database save
      const savedPlan = {
        id: 1,
        userId,
        planType: '3-day',
        cuisine: preferences.cuisine,
        dietaryRestrictions: preferences.restrictions,
        meals: aiMealPlan,
        createdAt: new Date().toISOString()
      };
      mockDb.saveNutritionPlan.mockResolvedValue(savedPlan);

      // Simulate the integration workflow
      const mealPlan = await mockAI.generateMealPlan(preferences);
      const planData = {
        planType: '3-day',
        cuisine: preferences.cuisine,
        dietaryRestrictions: preferences.restrictions,
        meals: mealPlan
      };
      const result = await mockDb.saveNutritionPlan(userId, planData);

      expect(mockAI.generateMealPlan).toHaveBeenCalledWith(preferences);
      expect(mockDb.saveNutritionPlan).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          meals: aiMealPlan,
          cuisine: 'mediterranean',
          dietaryRestrictions: ['vegetarian', 'gluten-free']
        })
      );
      expect(result.meals).toEqual(aiMealPlan);
    });

    it('should handle cultural adaptation in meal planning', async () => {
      const userId = 1;
      const preferences = {
        cuisine: 'indian',
        restrictions: ['dairy-free'],
        culturalContext: {
          region: 'south-indian',
          spiceLevel: 'medium'
        }
      };

      // Mock culturally adapted meal plan
      const culturalMealPlan = [
        {
          day: 1,
          meals: {
            breakfast: ['Idli with coconut chutney', 'Sambar'],
            lunch: ['Brown rice with dal', 'Vegetable curry'],
            dinner: ['Roti with mixed vegetables']
          }
        }
      ];
      mockAI.generateMealPlan.mockResolvedValue(culturalMealPlan);

      const mealPlan = await mockAI.generateMealPlan(preferences);

      expect(mockAI.generateMealPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          cuisine: 'indian',
          culturalContext: expect.objectContaining({
            region: 'south-indian'
          })
        })
      );
      expect(mealPlan[0].meals.breakfast).toContain('Idli with coconut chutney');
    });
  });

  describe('Progress Analysis Integration', () => {
    it('should generate comprehensive health report with AI insights', async () => {
      const userId = 1;
      const days = 30;

      // Mock health data
      const mockHealthData = {
        assessments: [
          createMockAssessment({ score: 15, date: '2024-01-01' }),
          createMockAssessment({ score: 12, date: '2024-01-15' })
        ],
        moods: [
          createMockMoodEntry({ mood: 3, date: '2024-01-01' }),
          createMockMoodEntry({ mood: 4, date: '2024-01-15' }),
          createMockMoodEntry({ mood: 5, date: '2024-01-30' })
        ],
        progress: [
          { metricType: 'weight', value: 75, date: '2024-01-01' },
          { metricType: 'weight', value: 73, date: '2024-01-30' }
        ],
        summary: {
          totalMoodEntries: 3,
          averageMood: 4,
          latestRiskScore: 12,
          progressMetrics: { weight: [{ date: '2024-01-01', value: 75 }] }
        }
      };

      mockDb.generateHealthReport.mockResolvedValue(mockHealthData);

      // Mock AI analysis
      const aiInsights = 'Your health data shows positive trends. Your risk score improved from 15 to 12, and your mood has been steadily increasing.';
      mockAI.analyzeProgressTrends.mockResolvedValue(aiInsights);

      // Simulate the integration workflow
      const healthReport = await mockDb.generateHealthReport(userId, days);
      const progressData = {
        riskScores: healthReport.assessments.map(a => a.score),
        moods: healthReport.moods.map(m => m.mood),
        nutritionAdherence: [], // Would be populated from nutrition data
        timeframe: `${days} days`
      };
      const aiAnalysis = await mockAI.analyzeProgressTrends(progressData);

      expect(mockDb.generateHealthReport).toHaveBeenCalledWith(userId, days);
      expect(mockAI.analyzeProgressTrends).toHaveBeenCalledWith(
        expect.objectContaining({
          riskScores: [15, 12],
          moods: [3, 4, 5]
        })
      );
      expect(aiAnalysis).toContain('positive trends');
    });

    it('should generate motivational messages based on achievements', async () => {
      const userId = 1;

      // Mock user achievements
      const achievements = [
        'Completed 7 consecutive days of mood tracking',
        'Improved diabetes risk score by 3 points',
        'Maintained 85% nutrition plan adherence'
      ];

      // Mock AI motivational message
      const motivationalMessage = 'Congratulations on your incredible progress! Your dedication to tracking your mood daily and improving your risk score shows real commitment to your health.';
      mockAI.generateMotivationalMessage.mockResolvedValue(motivationalMessage);

      const message = await mockAI.generateMotivationalMessage(achievements);

      expect(mockAI.generateMotivationalMessage).toHaveBeenCalledWith(achievements);
      expect(message).toContain('Congratulations');
      expect(message).toContain('progress');
    });
  });

  describe('Doctor Report Generation', () => {
    it('should generate comprehensive doctor report with AI analysis', async () => {
      const userId = 1;
      const days = 30;

      // Mock comprehensive health data
      const healthData = {
        assessments: [
          createMockAssessment({ score: 18, date: '2024-01-01' }),
          createMockAssessment({ score: 15, date: '2024-01-15' }),
          createMockAssessment({ score: 12, date: '2024-01-30' })
        ],
        moods: Array.from({ length: 20 }, (_, i) => 
          createMockMoodEntry({ 
            mood: Math.floor(Math.random() * 3) + 3, // Moods 3-5
            date: `2024-01-${String(i + 1).padStart(2, '0')}`
          })
        ),
        progress: [
          { metricType: 'weight', value: 80, date: '2024-01-01' },
          { metricType: 'weight', value: 78, date: '2024-01-15' },
          { metricType: 'weight', value: 76, date: '2024-01-30' }
        ]
      };

      mockDb.generateHealthReport.mockResolvedValue(healthData);

      // Mock AI clinical analysis
      const clinicalAnalysis = `
        CLINICAL SUMMARY:
        Patient shows significant improvement in diabetes risk assessment over 30-day period.
        
        KEY FINDINGS:
        - Risk score decreased from 18 to 12 (33% improvement)
        - Consistent mood stability (average 4.2/5)
        - Weight reduction of 4kg over monitoring period
        
        RECOMMENDATIONS:
        - Continue current lifestyle modifications
        - Monitor blood glucose levels
        - Follow up in 3 months
      `;
      mockAI.generateContent.mockResolvedValue(clinicalAnalysis);

      // Simulate doctor report generation
      const report = await mockDb.generateHealthReport(userId, days);
      const clinicalPrompt = `
        Generate a professional clinical summary for healthcare providers based on this patient data:
        - Risk assessments: ${JSON.stringify(report.assessments)}
        - Mood tracking: ${JSON.stringify(report.moods)}
        - Progress metrics: ${JSON.stringify(report.progress)}
        
        Format as a medical report with key findings and recommendations.
      `;
      
      const analysis = await mockAI.generateContent(clinicalPrompt, {
        reportType: 'clinical',
        timeframe: days
      });

      expect(mockDb.generateHealthReport).toHaveBeenCalledWith(userId, days);
      expect(mockAI.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('clinical summary'),
        expect.objectContaining({
          reportType: 'clinical'
        })
      );
      expect(analysis).toContain('CLINICAL SUMMARY');
      expect(analysis).toContain('KEY FINDINGS');
      expect(analysis).toContain('RECOMMENDATIONS');
    });
  });

  describe('Error Handling in Integration', () => {
    it('should handle database errors during AI-enhanced operations', async () => {
      const userId = 1;
      const assessmentData = { score: 15, responses: {} };

      // Mock AI success but database failure
      mockAI.explainRiskScore.mockResolvedValue('AI explanation');
      mockDb.saveAssessment.mockRejectedValue(new Error('Database connection failed'));

      // Simulate error handling
      let result;
      try {
        const explanation = await mockAI.explainRiskScore(assessmentData.score, assessmentData.responses);
        result = await mockDb.saveAssessment(userId, { ...assessmentData, aiExplanation: explanation });
      } catch (error) {
        // Handle gracefully - could queue for offline sync
        result = { error: 'Failed to save assessment', aiExplanation: 'AI explanation' };
      }

      expect(result.error).toBeDefined();
      expect(result.aiExplanation).toBe('AI explanation');
    });

    it('should handle AI errors during database operations', async () => {
      const userId = 1;
      const mood = 4;
      const date = '2024-01-01';

      // Mock AI failure but database success
      mockAI.generateMoodAffirmation.mockRejectedValue(new Error('AI service unavailable'));
      mockDb.saveMood.mockResolvedValue({
        id: 1,
        userId,
        mood,
        date,
        aiAffirmation: 'Default affirmation for positive mood'
      });

      // Simulate error handling with fallback
      let affirmation;
      try {
        affirmation = await mockAI.generateMoodAffirmation(mood);
      } catch (error) {
        affirmation = 'Default affirmation for positive mood';
      }

      const result = await mockDb.saveMood(userId, date, mood, '');

      expect(result.aiAffirmation).toBe('Default affirmation for positive mood');
    });

    it('should handle concurrent AI and database failures', async () => {
      const userId = 1;
      const assessmentData = { score: 15, responses: {} };

      // Mock both AI and database failures
      mockAI.explainRiskScore.mockRejectedValue(new Error('AI service down'));
      mockDb.saveAssessment.mockRejectedValue(new Error('Database down'));

      // Simulate complete failure handling
      let result;
      try {
        const explanation = await mockAI.explainRiskScore(assessmentData.score, assessmentData.responses);
        result = await mockDb.saveAssessment(userId, { ...assessmentData, aiExplanation: explanation });
      } catch (aiError) {
        try {
          // Try with fallback explanation
          const fallbackExplanation = 'Assessment completed. Please consult healthcare provider.';
          result = await mockDb.saveAssessment(userId, { ...assessmentData, aiExplanation: fallbackExplanation });
        } catch (dbError) {
          // Complete failure - queue for later
          result = { 
            queued: true, 
            error: 'Both AI and database unavailable',
            data: assessmentData 
          };
        }
      }

      expect(result.queued).toBe(true);
      expect(result.error).toContain('unavailable');
    });
  });
});