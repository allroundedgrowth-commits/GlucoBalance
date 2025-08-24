// Enhanced Demo Data Generator for demo@glucobalance.com
// Comprehensive data for all dashboard cards and sections

class EnhancedDemoDataGenerator {
    constructor() {
        this.demoEmail = 'demo@glucobalance.com';
        this.userId = 'demo-user-glucobalance';
        this.startDate = new Date();
        this.startDate.setDate(this.startDate.getDate() - 90); // 90 days of comprehensive data
        
        // Demo user profile with enhanced details
        this.demoUser = {
            id: this.userId,
            email: this.demoEmail,
            name: 'Alex Demo',
            firstName: 'Alex',
            lastName: 'Demo',
            age: 42,
            gender: 'non-binary',
            height: 175, // cm
            initialWeight: 185, // lbs
            createdAt: new Date(this.startDate).toISOString(),
            hasCompletedAssessment: true,
            riskScore: 10, // Improved from initial 18
            riskCategory: 'Increased Risk',
            lastAssessmentDate: new Date().toISOString(),
            profileComplete: true,
            preferences: {
                units: 'imperial',
                notifications: true,
                dataSharing: true
            }
        };
    }

    async generateAllEnhancedData() {
        console.log('🚀 Generating enhanced demo data for demo@glucobalance.com...');
        
        try {
            // Create comprehensive demo user profile
            await this.createEnhancedDemoUser();
            
            // Generate all data types with enhanced details
            await this.generateRiskStatusData();
            await this.generateMoodTrackerData();
            await this.generateNutritionSnapshotData();
            await this.generateAIHealthInsightsData();
            await this.generateHealthTrendsData();
            await this.generateHealthSummaryData();
            
            // Generate supporting data
            await this.generateProgressTrackingData();
            await this.generateDoctorReportsData();
            await this.generateNotificationsData();
            
            console.log('✅ Enhanced demo data generation complete!');
            console.log('📧 Demo account: demo@glucobalance.com');
            console.log('🔑 Password: demo123');
            console.log('📊 Data includes: Risk Status, Mood Tracker, Nutrition, AI Insights, Health Trends & Summary');
            
            return true;
        } catch (error) {
            console.error('❌ Error generating enhanced demo data:', error);
            return false;
        }
    }

    async createEnhancedDemoUser() {
        // Store demo user in multiple formats for compatibility
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        const existingUserIndex = users.findIndex(u => u.email === this.demoEmail);
        
        if (existingUserIndex !== -1) {
            users[existingUserIndex] = { ...users[existingUserIndex], ...this.demoUser };
        } else {
            users.push(this.demoUser);
        }
        
        localStorage.setItem('glucobalance-users', JSON.stringify(users));
        localStorage.setItem(`glucobalance-user-${this.userId}`, JSON.stringify(this.demoUser));
        localStorage.setItem(`user-profile-${this.userId}`, JSON.stringify(this.demoUser));
        
        console.log('✅ Enhanced demo user profile created');
    }    async ge
nerateRiskStatusData() {
        const assessments = [];
        const baseScore = 18; // Starting risk score
        
        // Generate assessments over 90 days showing improvement
        const assessmentDates = [0, 15, 30, 45, 60, 75, 90]; // Every 2 weeks
        
        assessmentDates.forEach((dayOffset, i) => {
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + dayOffset);
            
            // Simulate gradual improvement over time
            const score = Math.max(8, baseScore - (i * 1.5) + (Math.random() - 0.5) * 2);
            const category = this.getRiskCategory(Math.round(score));
            
            const assessment = {
                id: `assessment-${Date.now()}-${i}`,
                user_id: this.userId,
                userId: this.userId,
                score: Math.round(score),
                category: category,
                date: date.toISOString().split('T')[0],
                createdAt: date.toISOString(),
                timestamp: date.getTime(),
                responses: this.generateDetailedAssessmentResponses(i),
                recommendations: this.generateRecommendations(category),
                aiExplanation: this.generateAIExplanation(Math.round(score), category),
                questionResponses: this.generateWHOADAResponses(i),
                improvementTrend: i > 0 ? 'improving' : 'baseline',
                confidenceLevel: 0.85 + (i * 0.02),
                nextAssessmentDate: new Date(date.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
            };
            
            assessments.push(assessment);
        });
        
        // Store in multiple formats for compatibility
        localStorage.setItem(`risk-assessments-${this.userId}`, JSON.stringify(assessments));
        localStorage.setItem(`glucobalance-assessments-${this.userId}`, JSON.stringify(assessments));
        localStorage.setItem(`RiskAssessments-${this.userId}`, JSON.stringify(assessments));
        
        // Store latest assessment for quick access
        const latestAssessment = assessments[assessments.length - 1];
        localStorage.setItem(`latest-assessment-${this.userId}`, JSON.stringify(latestAssessment));
        localStorage.setItem(`current-risk-status-${this.userId}`, JSON.stringify({
            score: latestAssessment.score,
            category: latestAssessment.category,
            trend: 'improving',
            lastUpdated: latestAssessment.date,
            improvement: '44% reduction from baseline',
            nextAction: 'Continue current lifestyle plan'
        }));
        
        console.log(`✅ Generated ${assessments.length} risk status assessments with improvement trend`);
    }

    async generateMoodTrackerData() {
        const moods = [];
        const weeklyPattern = [3.2, 3.8, 4.1, 3.9, 4.2, 4.5, 4.0]; // Mon-Sun pattern showing improvement
        const improvementFactor = 0.015; // Gradual improvement over 90 days
        
        for (let i = 0; i < 90; i++) {
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + i);
            
            // Skip some days randomly (realistic usage pattern)
            if (Math.random() < 0.12) continue; // 12% chance to skip a day
            
            const dayOfWeek = date.getDay();
            const baseMood = weeklyPattern[dayOfWeek];
            const improvement = i * improvementFactor;
            const randomVariation = (Math.random() - 0.5) * 0.6;
            
            const mood = Math.max(1, Math.min(5, Math.round((baseMood + improvement + randomVariation) * 10) / 10));
            
            const moodEntry = {
                id: `mood-${Date.now()}-${i}`,
                userId: this.userId,
                mood: mood,
                date: date.toISOString().split('T')[0],
                createdAt: date.toISOString(),
                timestamp: date.getTime(),
                notes: this.generateDetailedMoodNote(mood, dayOfWeek, i),
                affirmation: this.generateMoodAffirmation(mood),
                copingStrategies: this.generateCopingStrategies(mood),
                energyLevel: Math.max(1, Math.min(5, mood + (Math.random() - 0.5) * 0.8)),
                stressLevel: Math.max(1, Math.min(5, 6 - mood + (Math.random() - 0.5) * 0.6)),
                sleepQuality: Math.max(1, Math.min(5, mood + (Math.random() - 0.5) * 1.0)),
                socialConnection: Math.max(1, Math.min(5, mood + (Math.random() - 0.5) * 0.7)),
                tags: this.generateMoodTags(mood, dayOfWeek)
            };
            
            moods.push(moodEntry);
        }
        
        // Store in multiple formats for compatibility
        localStorage.setItem(`mood-entries-${this.userId}`, JSON.stringify(moods));
        localStorage.setItem(`glucobalance-moods-${this.userId}`, JSON.stringify(moods));
        localStorage.setItem(`MentalHealthLogs-${this.userId}`, JSON.stringify(moods));
        localStorage.setItem(`mental-health-logs-${this.userId}`, JSON.stringify(moods));
        
        // Generate mood summary for dashboard card
        const recentMoods = moods.slice(-30); // Last 30 entries
        const averageMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
        const moodTrend = this.calculateMoodTrend(moods);
        
        const moodSummary = {
            currentMood: moods[moods.length - 1]?.mood || 4.2,
            averageMood: Math.round(averageMood * 10) / 10,
            trend: moodTrend,
            totalEntries: moods.length,
            streakDays: this.calculateMoodStreak(moods),
            lastEntry: moods[moods.length - 1]?.date,
            improvement: '32% improvement over 90 days',
            insights: [
                'Mood stability has significantly improved',
                'Strong correlation with nutrition adherence',
                'Weekend patterns show consistent positivity'
            ]
        };
        
        localStorage.setItem(`mood-tracker-summary-${this.userId}`, JSON.stringify(moodSummary));
        
        console.log(`✅ Generated ${moods.length} mood tracker entries with trend analysis`);
    }  
  async generateNutritionSnapshotData() {
        const nutritionPlans = [
            {
                id: `plan-${Date.now()}-1`,
                userId: this.userId,
                name: 'Mediterranean Diabetes Prevention Plan',
                description: 'Heart-healthy Mediterranean diet focused on diabetes prevention with emphasis on whole grains, lean proteins, and healthy fats',
                planType: 'Mediterranean',
                duration: '4 weeks',
                startDate: new Date(this.startDate.getTime() + (10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                endDate: new Date(this.startDate.getTime() + (38 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                status: 'completed',
                meals: this.generateMediterraneanMeals(),
                createdAt: new Date(this.startDate.getTime() + (10 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 94,
                weeklyAdherence: [89, 96, 92, 98],
                nutritionalGoals: {
                    dailyCalories: 1450,
                    carbPercentage: 45,
                    proteinPercentage: 25,
                    fatPercentage: 30,
                    fiberGoal: 28,
                    sodiumLimit: 2000
                },
                achievements: ['Completed full 4-week plan', '94% adherence rate', 'Lost 2.1 lbs']
            },
            {
                id: `plan-${Date.now()}-2`,
                userId: this.userId,
                name: 'Balanced Low-Glycemic Plan',
                description: 'Carefully balanced nutrition with controlled carbohydrate intake and low glycemic index foods',
                planType: 'Low-Glycemic',
                duration: '3 weeks',
                startDate: new Date(this.startDate.getTime() + (45 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                endDate: new Date(this.startDate.getTime() + (66 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                status: 'completed',
                meals: this.generateLowGlycemicMeals(),
                createdAt: new Date(this.startDate.getTime() + (45 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 88,
                weeklyAdherence: [85, 89, 90],
                nutritionalGoals: {
                    dailyCalories: 1380,
                    carbPercentage: 35,
                    proteinPercentage: 35,
                    fatPercentage: 30,
                    fiberGoal: 30,
                    sodiumLimit: 1800
                },
                achievements: ['Improved blood sugar stability', '88% adherence rate', 'Lost 1.8 lbs']
            },
            {
                id: `plan-${Date.now()}-3`,
                userId: this.userId,
                name: 'Plant-Forward Wellness Plan',
                description: 'Nutrient-dense plant-based meals with lean proteins for optimal health and diabetes prevention',
                planType: 'Plant-Forward',
                duration: '4 weeks',
                startDate: new Date(this.startDate.getTime() + (70 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                status: 'active',
                meals: this.generatePlantForwardMeals(),
                createdAt: new Date(this.startDate.getTime() + (70 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 91,
                weeklyAdherence: [87, 93, 89, 95],
                nutritionalGoals: {
                    dailyCalories: 1420,
                    carbPercentage: 50,
                    proteinPercentage: 20,
                    fatPercentage: 30,
                    fiberGoal: 35,
                    sodiumLimit: 1900
                },
                achievements: ['Highest fiber intake achieved', '91% adherence rate', 'Energy levels improved']
            }
        ];
        
        // Store nutrition plans
        localStorage.setItem(`nutrition-plans-${this.userId}`, JSON.stringify(nutritionPlans));
        localStorage.setItem(`glucobalance-nutrition-${this.userId}`, JSON.stringify(nutritionPlans));
        
        // Generate nutrition snapshot summary
        const currentPlan = nutritionPlans.find(p => p.status === 'active') || nutritionPlans[nutritionPlans.length - 1];
        const nutritionSnapshot = {
            currentPlan: currentPlan.name,
            adherenceRate: currentPlan.adherence,
            plansCompleted: nutritionPlans.filter(p => p.status === 'completed').length,
            totalPlans: nutritionPlans.length,
            averageAdherence: Math.round(nutritionPlans.reduce((sum, p) => sum + p.adherence, 0) / nutritionPlans.length),
            weightLoss: '4.2 lbs total',
            currentStreak: '12 days',
            favoriteFood: 'Mediterranean Quinoa Bowl',
            nextMeal: 'Grilled Salmon with Asparagus',
            caloriesConsumed: 1285,
            caloriesRemaining: 135,
            macros: {
                carbs: { consumed: 142, target: 180, percentage: 79 },
                protein: { consumed: 98, target: 110, percentage: 89 },
                fat: { consumed: 52, target: 60, percentage: 87 },
                fiber: { consumed: 28, target: 35, percentage: 80 }
            },
            hydration: {
                glasses: 6,
                target: 8,
                percentage: 75
            },
            insights: [
                'Excellent protein intake today',
                'Consider adding more fiber-rich vegetables',
                'Hydration goal almost reached'
            ]
        };
        
        localStorage.setItem(`nutrition-snapshot-${this.userId}`, JSON.stringify(nutritionSnapshot));
        
        console.log(`✅ Generated ${nutritionPlans.length} nutrition plans with comprehensive snapshot data`);
    }    
async generateAIHealthInsightsData() {
        const insights = [
            {
                id: `insight-${Date.now()}-1`,
                userId: this.userId,
                date: new Date().toISOString(),
                type: 'comprehensive_progress',
                title: 'Outstanding Health Transformation! 🌟',
                content: 'Your 90-day journey shows remarkable progress across all health metrics. Diabetes risk reduced by 44% (from 18 to 10), mood stability improved by 32%, and nutrition adherence averaging 91%. This integrated approach is delivering exceptional results.',
                priority: 'high',
                actionable: true,
                confidence: 0.96,
                dataPoints: ['risk_assessments', 'mood_tracking', 'nutrition_plans', 'progress_metrics'],
                recommendations: [
                    'Continue your current integrated approach - it\'s working exceptionally well',
                    'Consider sharing your success story to inspire others',
                    'Schedule a comprehensive health check-up to validate improvements',
                    'Plan for long-term maintenance strategies'
                ],
                metrics: {
                    riskReduction: '44%',
                    moodImprovement: '32%',
                    nutritionAdherence: '91%',
                    weightLoss: '4.2 lbs',
                    overallProgress: '92%'
                },
                category: 'achievement',
                readStatus: false,
                createdAt: new Date().toISOString()
            },
            {
                id: `insight-${Date.now()}-2`,
                userId: this.userId,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'behavioral_pattern',
                title: 'Powerful Success Patterns Identified 🧠',
                content: 'Analysis reveals strong behavioral patterns driving your success. Morning routine consistency (96%) correlates with better daily choices. Weekend meal prep predicts 89% weekly adherence success. Your mood-nutrition connection shows 0.74 correlation.',
                priority: 'medium',
                actionable: true,
                confidence: 0.89,
                dataPoints: ['mood_tracking', 'nutrition_plans', 'behavioral_data'],
                recommendations: [
                    'Protect your morning routine - it\'s your success foundation',
                    'Continue weekend meal prep - it creates cascading benefits',
                    'Leverage your mood-nutrition awareness for continued success',
                    'Consider tracking energy levels to optimize daily scheduling'
                ],
                metrics: {
                    morningConsistency: '96%',
                    weekendPrepSuccess: '89%',
                    moodNutritionCorrelation: '0.74',
                    behavioralStability: '91%'
                },
                category: 'insight',
                readStatus: false,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: `insight-${Date.now()}-3`,
                userId: this.userId,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'nutrition_mastery',
                title: 'Nutrition Excellence Achievement 🍎',
                content: 'Your 91% average adherence across three different nutrition plans demonstrates exceptional adaptability and commitment. The variety in your approach - Mediterranean, Low-Glycemic, and Plant-Forward - shows sophisticated nutritional understanding.',
                priority: 'high',
                actionable: false,
                confidence: 0.94,
                dataPoints: ['nutrition_plans', 'meal_tracking'],
                recommendations: [
                    'You\'ve mastered nutritional flexibility - maintain this approach',
                    'Consider becoming a peer mentor for nutrition planning',
                    'Document your favorite recipes and meal combinations',
                    'Explore advanced nutrition topics like nutrient timing'
                ],
                metrics: {
                    averageAdherence: '91%',
                    planVariety: '3 types',
                    mealCreativity: '87%',
                    nutritionalBalance: 'Excellent'
                },
                category: 'achievement',
                readStatus: true,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: `insight-${Date.now()}-4`,
                userId: this.userId,
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'mood_stability',
                title: 'Mental Health Milestone Reached 💙',
                content: 'Your mood tracking reveals beautiful transformation. Average mood increased from 3.4 to 4.3 over 90 days. Mood volatility decreased by 45%, indicating excellent emotional regulation and stress management skills.',
                priority: 'medium',
                actionable: true,
                confidence: 0.91,
                dataPoints: ['mood_tracking', 'stress_management'],
                recommendations: [
                    'Your emotional regulation skills are excellent - keep practicing',
                    'Consider mindfulness or meditation to enhance stability further',
                    'Share your mood management strategies with others',
                    'Track sleep patterns to optimize mood consistency'
                ],
                metrics: {
                    moodImprovement: '26%',
                    volatilityReduction: '45%',
                    consistencyScore: '88%',
                    emotionalResilience: 'High'
                },
                category: 'insight',
                readStatus: true,
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: `insight-${Date.now()}-5`,
                userId: this.userId,
                date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'risk_prediction',
                title: 'Diabetes Risk Trajectory Excellent 📈',
                content: 'Based on current trends, you\'re on track to reach "Low Risk" category within 6-8 weeks. Your consistent lifestyle modifications are creating sustainable, long-term health improvements with 96% confidence.',
                priority: 'high',
                actionable: true,
                confidence: 0.96,
                dataPoints: ['risk_assessments', 'trend_analysis'],
                recommendations: [
                    'Maintain current lifestyle approach - trajectory is excellent',
                    'Schedule follow-up assessment in 4 weeks to confirm progress',
                    'Consider HbA1c testing to validate risk reduction',
                    'Plan celebration for reaching Low Risk milestone'
                ],
                metrics: {
                    currentRisk: '10 points',
                    projectedRisk: '7 points',
                    timeToLowRisk: '6-8 weeks',
                    confidenceLevel: '96%'
                },
                category: 'prediction',
                readStatus: true,
                createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        // Store AI insights
        localStorage.setItem(`ai-insights-${this.userId}`, JSON.stringify(insights));
        localStorage.setItem(`glucobalance-insights-${this.userId}`, JSON.stringify(insights));
        localStorage.setItem(`ai-health-insights-${this.userId}`, JSON.stringify(insights));
        
        // Generate AI insights summary for dashboard card
        const unreadInsights = insights.filter(i => !i.readStatus);
        const highPriorityInsights = insights.filter(i => i.priority === 'high');
        
        const aiInsightsSummary = {
            totalInsights: insights.length,
            unreadCount: unreadInsights.length,
            highPriorityCount: highPriorityInsights.length,
            latestInsight: insights[0],
            categories: {
                achievement: insights.filter(i => i.category === 'achievement').length,
                insight: insights.filter(i => i.category === 'insight').length,
                prediction: insights.filter(i => i.category === 'prediction').length
            },
            overallProgress: '92%',
            nextInsightDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            keyMetrics: {
                riskReduction: '44%',
                moodImprovement: '32%',
                nutritionMastery: '91%',
                behavioralStability: '91%'
            }
        };
        
        localStorage.setItem(`ai-insights-summary-${this.userId}`, JSON.stringify(aiInsightsSummary));
        
        console.log(`✅ Generated ${insights.length} comprehensive AI health insights`);
    }    asy
nc generateHealthTrendsData() {
        const healthTrends = {
            userId: this.userId,
            dateRange: {
                start: this.startDate.toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
                days: 90
            },
            trends: {
                riskScore: {
                    data: this.generateTrendData(18, 10, 90, 'decreasing'),
                    trend: 'decreasing',
                    improvement: '44%',
                    status: 'excellent'
                },
                mood: {
                    data: this.generateTrendData(3.4, 4.3, 90, 'increasing'),
                    trend: 'increasing',
                    improvement: '26%',
                    status: 'excellent'
                },
                weight: {
                    data: this.generateTrendData(185, 180.8, 90, 'decreasing'),
                    trend: 'decreasing',
                    improvement: '2.3%',
                    status: 'good'
                },
                nutrition: {
                    data: this.generateTrendData(75, 91, 90, 'increasing'),
                    trend: 'increasing',
                    improvement: '21%',
                    status: 'excellent'
                },
                sleep: {
                    data: this.generateTrendData(6.8, 7.6, 90, 'increasing'),
                    trend: 'increasing',
                    improvement: '12%',
                    status: 'good'
                },
                activity: {
                    data: this.generateTrendData(4200, 7800, 90, 'increasing'),
                    trend: 'increasing',
                    improvement: '86%',
                    status: 'excellent'
                }
            },
            correlations: {
                moodNutrition: 0.74,
                sleepMood: 0.68,
                activityWeight: 0.82,
                nutritionRisk: -0.79
            },
            insights: [
                'Strong correlation between nutrition adherence and mood stability',
                'Physical activity shows excellent upward trend',
                'Sleep quality improvements supporting overall health',
                'Risk score reduction accelerating in recent weeks'
            ],
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(`health-trends-${this.userId}`, JSON.stringify(healthTrends));
        localStorage.setItem(`glucobalance-trends-${this.userId}`, JSON.stringify(healthTrends));
        
        console.log('✅ Generated comprehensive health trends data with correlations');
    }

    async generateHealthSummaryData() {
        const healthSummary = {
            userId: this.userId,
            generatedDate: new Date().toISOString(),
            period: '90 days',
            overallScore: 92, // Out of 100
            status: 'Excellent Progress',
            keyAchievements: [
                'Diabetes risk reduced by 44%',
                'Mood stability improved by 32%',
                'Nutrition adherence averaging 91%',
                'Weight loss of 4.2 lbs achieved',
                'Physical activity increased by 86%',
                'Sleep quality improved by 12%'
            ],
            currentMetrics: {
                riskScore: 10,
                riskCategory: 'Increased Risk',
                averageMood: 4.3,
                currentWeight: 180.8,
                nutritionAdherence: 91,
                averageSleep: 7.6,
                dailySteps: 7800
            },
            improvements: {
                riskScore: { from: 18, to: 10, change: -44 },
                mood: { from: 3.4, to: 4.3, change: 26 },
                weight: { from: 185, to: 180.8, change: -2.3 },
                nutrition: { from: 75, to: 91, change: 21 },
                sleep: { from: 6.8, to: 7.6, change: 12 },
                activity: { from: 4200, to: 7800, change: 86 }
            },
            riskFactors: {
                improved: ['Physical Activity', 'Diet Quality', 'Weight Management', 'Stress Levels'],
                stable: ['Age', 'Family History'],
                needsAttention: []
            },
            recommendations: [
                'Continue current integrated health approach',
                'Schedule comprehensive health check-up',
                'Consider HbA1c testing to validate improvements',
                'Plan for long-term maintenance strategies',
                'Explore advanced nutrition topics'
            ],
            nextMilestones: [
                'Reach Low Risk category (6-8 weeks)',
                'Complete 100 days of mood tracking',
                'Achieve 95% nutrition adherence',
                'Reach target weight of 175 lbs'
            ],
            badges: [
                'Risk Reduction Champion',
                'Mood Tracking Streak Master',
                'Nutrition Excellence',
                'Consistency King/Queen',
                'Health Transformation Hero'
            ],
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(`health-summary-${this.userId}`, JSON.stringify(healthSummary));
        localStorage.setItem(`glucobalance-summary-${this.userId}`, JSON.stringify(healthSummary));
        
        console.log('✅ Generated comprehensive health summary with achievements and milestones');
    }    
// Helper methods for generating realistic data
    generateTrendData(startValue, endValue, days, trendType) {
        const data = [];
        const totalChange = endValue - startValue;
        
        for (let i = 0; i <= days; i++) {
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + i);
            
            // Calculate progress with some realistic variation
            const progress = i / days;
            const baseValue = startValue + (totalChange * progress);
            const variation = (Math.random() - 0.5) * (Math.abs(totalChange) * 0.1);
            const value = baseValue + variation;
            
            data.push({
                date: date.toISOString().split('T')[0],
                value: Math.round(value * 100) / 100,
                trend: trendType
            });
        }
        
        return data;
    }

    getRiskCategory(score) {
        if (score < 10) return 'Low Risk';
        if (score < 15) return 'Increased Risk';
        if (score < 20) return 'High Risk';
        return 'Possible Diabetes';
    }

    generateDetailedAssessmentResponses(assessmentIndex) {
        return {
            age: 42,
            bmi: 26.8 - (assessmentIndex * 0.3),
            familyHistory: true,
            physicalActivity: assessmentIndex >= 2,
            diet: assessmentIndex >= 1,
            smoking: false,
            bloodPressure: assessmentIndex < 4,
            waistCircumference: 38 - (assessmentIndex * 0.7),
            gestationalDiabetes: false,
            medications: false,
            stressLevel: Math.max(1, 4 - (assessmentIndex * 0.3)),
            sleepQuality: Math.min(5, 3 + (assessmentIndex * 0.3))
        };
    }

    generateWHOADAResponses(assessmentIndex) {
        return [
            { questionId: 'age', response: 42, points: 4 },
            { questionId: 'bmi', response: 26.8 - (assessmentIndex * 0.3), points: Math.max(0, 3 - assessmentIndex) },
            { questionId: 'family_history', response: 2, points: 2 },
            { questionId: 'physical_activity', response: assessmentIndex >= 2 ? 0 : 2, points: assessmentIndex >= 2 ? 0 : 2 },
            { questionId: 'diet', response: assessmentIndex >= 1 ? 0 : 1, points: assessmentIndex >= 1 ? 0 : 1 },
            { questionId: 'blood_pressure', response: assessmentIndex < 4 ? 2 : 0, points: assessmentIndex < 4 ? 2 : 0 }
        ];
    }

    generateAIExplanation(score, category) {
        const explanations = {
            'Low Risk': `Excellent! Your risk score of ${score} indicates outstanding diabetes prevention progress. Your lifestyle modifications are highly effective.`,
            'Increased Risk': `Great progress! Your risk score of ${score} shows significant improvement. Continue your current approach for continued success.`,
            'High Risk': `Your risk score of ${score} indicates good progress. Maintain focus on lifestyle interventions for continued improvement.`,
            'Possible Diabetes': `Your risk score of ${score} suggests continued medical monitoring alongside lifestyle improvements.`
        };
        
        return explanations[category] || explanations['Increased Risk'];
    }

    generateRecommendations(category) {
        const recommendations = {
            'Low Risk': [
                'Maintain current excellent lifestyle patterns',
                'Continue regular physical activity routine',
                'Annual health screenings recommended',
                'Consider becoming a peer mentor'
            ],
            'Increased Risk': [
                'Continue with structured meal planning',
                'Maintain 150+ minutes of weekly physical activity',
                'Regular monitoring of weight and blood pressure',
                'Schedule follow-up assessment in 4-6 weeks'
            ],
            'High Risk': [
                'Intensify lifestyle intervention strategies',
                'Consider consultation with healthcare provider',
                'Implement comprehensive diabetes prevention program',
                'Monitor blood glucose levels'
            ]
        };
        
        return recommendations[category] || recommendations['Increased Risk'];
    }

    generateDetailedMoodNote(mood, dayOfWeek, dayIndex) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const progressNotes = {
            early: 'Starting my health journey with determination',
            middle: 'Feeling the positive changes in my routine',
            recent: 'Amazed by how much better I feel overall'
        };
        
        const phase = dayIndex < 30 ? 'early' : dayIndex < 60 ? 'middle' : 'recent';
        const moodDescriptions = {
            1: ['Challenging day, but staying committed', 'Tough moments, focusing on self-care'],
            2: ['Not my best day, but making progress', 'Feeling down but grateful for support'],
            3: ['Steady day, maintaining healthy habits', 'Balanced mood, staying consistent'],
            4: ['Good energy today, feeling positive!', 'Great day for healthy choices'],
            5: ['Excellent day! Everything flowing well', 'Amazing energy and motivation!']
        };
        
        const moodLevel = Math.round(mood);
        const descriptions = moodDescriptions[moodLevel] || moodDescriptions[3];
        const baseNote = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        return `${baseNote} - ${dayNames[dayOfWeek]} ${progressNotes[phase]}`;
    }    gene
rateMoodAffirmation(mood) {
        const affirmations = {
            1: ['Tomorrow brings new possibilities', 'I am stronger than I think', 'This feeling will pass'],
            2: ['I am taking care of myself', 'Small steps lead to big changes', 'I deserve kindness'],
            3: ['I am making steady progress', 'Every day I grow stronger', 'I choose healthy habits'],
            4: ['I feel energized and positive', 'My healthy choices are paying off', 'I am proud of my progress'],
            5: ['I am thriving and full of energy', 'My transformation is inspiring', 'I radiate health and happiness']
        };
        
        const moodLevel = Math.round(mood);
        const moodAffirmations = affirmations[moodLevel] || affirmations[3];
        return moodAffirmations[Math.floor(Math.random() * moodAffirmations.length)];
    }

    generateCopingStrategies(mood) {
        const strategies = {
            1: ['Deep breathing exercises', 'Call a supportive friend', 'Take a warm bath', 'Practice self-compassion'],
            2: ['Go for a gentle walk', 'Listen to calming music', 'Write in journal', 'Practice gratitude'],
            3: ['Maintain daily routine', 'Prepare healthy meals', 'Light exercise', 'Connect with nature'],
            4: ['Share positivity with others', 'Try new healthy recipe', 'Plan future goals', 'Celebrate progress'],
            5: ['Inspire others with energy', 'Take on new challenges', 'Document success', 'Pay it forward']
        };
        
        const moodLevel = Math.round(mood);
        return strategies[moodLevel] || strategies[3];
    }

    generateMoodTags(mood, dayOfWeek) {
        const baseTags = ['health-journey', 'self-care'];
        const moodTags = {
            1: ['challenging', 'resilience', 'support-needed'],
            2: ['improving', 'hopeful', 'progress'],
            3: ['balanced', 'consistent', 'steady'],
            4: ['positive', 'energetic', 'motivated'],
            5: ['excellent', 'thriving', 'inspiring']
        };
        
        const dayTags = {
            0: ['sunday', 'rest-day'],
            1: ['monday', 'fresh-start'],
            5: ['friday', 'week-end'],
            6: ['saturday', 'weekend']
        };
        
        const moodLevel = Math.round(mood);
        const tags = [...baseTags, ...moodTags[moodLevel] || [], ...dayTags[dayOfWeek] || []];
        return tags;
    }

    calculateMoodTrend(moods) {
        if (moods.length < 14) return 'stable';
        
        const recent = moods.slice(-14);
        const earlier = moods.slice(-28, -14);
        
        const recentAvg = recent.reduce((sum, m) => sum + m.mood, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, m) => sum + m.mood, 0) / earlier.length;
        
        const difference = recentAvg - earlierAvg;
        
        if (difference > 0.3) return 'improving';
        if (difference < -0.3) return 'declining';
        return 'stable';
    }

    calculateMoodStreak(moods) {
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            const hasEntry = moods.some(m => m.date === dateStr);
            if (hasEntry) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    generateMediterraneanMeals() {
        return [
            { name: 'Greek Yogurt Parfait with Berries and Nuts', type: 'breakfast', calories: 320, carbs: 28, protein: 18, fat: 16, fiber: 6 },
            { name: 'Quinoa Tabbouleh with Grilled Chicken', type: 'lunch', calories: 420, carbs: 45, protein: 32, fat: 14, fiber: 8 },
            { name: 'Baked Salmon with Roasted Vegetables', type: 'dinner', calories: 480, carbs: 22, protein: 38, fat: 26, fiber: 7 },
            { name: 'Hummus with Vegetable Sticks', type: 'snack', calories: 180, carbs: 16, protein: 8, fat: 10, fiber: 6 }
        ];
    }

    generateLowGlycemicMeals() {
        return [
            { name: 'Vegetable Omelet with Avocado', type: 'breakfast', calories: 340, carbs: 12, protein: 22, fat: 24, fiber: 8 },
            { name: 'Grilled Chicken Salad with Mixed Greens', type: 'lunch', calories: 380, carbs: 18, protein: 35, fat: 20, fiber: 9 },
            { name: 'Lean Beef Stir-fry with Broccoli', type: 'dinner', calories: 450, carbs: 25, protein: 40, fat: 22, fiber: 6 },
            { name: 'Greek Yogurt with Almonds', type: 'snack', calories: 160, carbs: 8, protein: 12, fat: 10, fiber: 3 }
        ];
    }

    generatePlantForwardMeals() {
        return [
            { name: 'Overnight Oats with Chia and Berries', type: 'breakfast', calories: 310, carbs: 42, protein: 12, fat: 12, fiber: 12 },
            { name: 'Lentil and Vegetable Buddha Bowl', type: 'lunch', calories: 420, carbs: 58, protein: 18, fat: 14, fiber: 16 },
            { name: 'Stuffed Bell Peppers with Turkey', type: 'dinner', calories: 390, carbs: 35, protein: 28, fat: 16, fiber: 10 },
            { name: 'Apple Slices with Almond Butter', type: 'snack', calories: 190, carbs: 22, protein: 6, fat: 12, fiber: 6 }
        ];
    }    //
 Additional supporting data generation methods
    async generateProgressTrackingData() {
        const progressEntries = [];
        
        for (let i = 0; i < 90; i += 2) { // Every 2 days
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + i);
            
            const entry = {
                id: `progress-${Date.now()}-${i}`,
                userId: this.userId,
                date: date.toISOString().split('T')[0],
                weight: 185 - (i * 0.05) + (Math.random() - 0.5) * 0.8,
                bmi: this.calculateBMI(185 - (i * 0.05), 175),
                steps: Math.round(4200 + (i * 40) + Math.random() * 1500),
                sleepHours: Math.round((6.8 + (i * 0.01) + Math.random() * 1.2) * 10) / 10,
                waterIntake: Math.round(6 + Math.random() * 3),
                exerciseMinutes: Math.round(15 + (i * 0.8) + Math.random() * 25),
                stressLevel: Math.max(1, Math.min(5, 4.2 - (i * 0.015) + (Math.random() - 0.5) * 0.6)),
                energyLevel: Math.max(1, Math.min(5, 3.2 + (i * 0.012) + (Math.random() - 0.5) * 0.5)),
                createdAt: date.toISOString()
            };
            
            progressEntries.push(entry);
        }
        
        localStorage.setItem(`progress-data-${this.userId}`, JSON.stringify(progressEntries));
        localStorage.setItem(`glucobalance-progress-${this.userId}`, JSON.stringify(progressEntries));
        
        console.log(`✅ Generated ${progressEntries.length} progress tracking entries`);
    }

    async generateDoctorReportsData() {
        const reports = [
            {
                id: `report-${Date.now()}-1`,
                userId: this.userId,
                generatedDate: new Date().toISOString(),
                reportPeriod: '90 days',
                patientInfo: {
                    name: 'Alex Demo',
                    email: 'demo@glucobalance.com',
                    age: 42,
                    reportDate: new Date().toLocaleDateString()
                },
                executiveSummary: 'Patient demonstrates exceptional engagement with comprehensive digital health monitoring over 90 days. Diabetes risk score improved dramatically from 18 to 10 (44% reduction). Mental health shows significant improvement with mood stability increase of 32%. Nutrition adherence averaging 91% across multiple dietary approaches indicates outstanding commitment and adaptability.',
                riskAssessment: {
                    currentScore: 10,
                    previousScore: 18,
                    improvement: '44% reduction',
                    category: 'Increased Risk',
                    trend: 'Significantly Improving',
                    projectedCategory: 'Low Risk (6-8 weeks)'
                },
                mentalHealthAssessment: {
                    averageMood: 4.3,
                    moodStability: 'Excellent',
                    totalEntries: 79,
                    improvementTrend: '32% improvement',
                    volatilityReduction: '45%'
                },
                nutritionAssessment: {
                    averageAdherence: '91%',
                    plansCompleted: 2,
                    currentPlan: 'Plant-Forward Wellness Plan',
                    weightChange: '-4.2 lbs',
                    nutritionalVariety: 'Excellent'
                },
                keyFindings: [
                    'Diabetes risk score improved by 44% through integrated lifestyle approach',
                    'Mental health monitoring shows exceptional consistency with 79 mood entries',
                    'Nutrition adherence excellent at 91% across three different dietary approaches',
                    'Sustainable weight loss of 4.2 lbs achieved over 90 days',
                    'Sleep quality improved by 12% with better consistency patterns',
                    'Physical activity increased by 86% with average 7,800 daily steps',
                    'Strong behavioral patterns identified supporting long-term success'
                ],
                recommendations: [
                    'Continue current integrated health approach - results are exceptional',
                    'Schedule comprehensive medical evaluation to validate digital improvements',
                    'Consider HbA1c testing to confirm diabetes risk reduction',
                    'Maintain current nutrition plan flexibility and adherence',
                    'Plan for long-term maintenance strategies and goal setting',
                    'Consider peer mentoring role given outstanding success patterns'
                ],
                clinicalMetrics: {
                    weightLoss: '4.2 lbs',
                    bmiReduction: '1.2 points',
                    sleepImprovement: '12%',
                    activityIncrease: '86%',
                    stressReduction: '28%',
                    overallHealthScore: '92/100'
                }
            }
        ];
        
        localStorage.setItem(`doctor-reports-${this.userId}`, JSON.stringify(reports));
        localStorage.setItem(`glucobalance-reports-${this.userId}`, JSON.stringify(reports));
        
        console.log(`✅ Generated comprehensive doctor report with 90-day analysis`);
    }

    async generateNotificationsData() {
        const notifications = [
            {
                id: `notif-${Date.now()}-1`,
                userId: this.userId,
                type: 'achievement',
                title: 'Congratulations! 🎉',
                message: 'You\'ve completed 90 days of health tracking with outstanding results!',
                date: new Date().toISOString(),
                read: false,
                priority: 'high'
            },
            {
                id: `notif-${Date.now()}-2`,
                userId: this.userId,
                type: 'insight',
                title: 'New AI Insight Available',
                message: 'Your health transformation analysis is ready to view.',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                read: false,
                priority: 'medium'
            },
            {
                id: `notif-${Date.now()}-3`,
                userId: this.userId,
                type: 'reminder',
                title: 'Assessment Due Soon',
                message: 'Your next risk assessment is recommended within 2 weeks.',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                read: true,
                priority: 'medium'
            }
        ];
        
        localStorage.setItem(`notifications-${this.userId}`, JSON.stringify(notifications));
        
        console.log(`✅ Generated ${notifications.length} notification entries`);
    }

    calculateBMI(weight, height) {
        const heightInMeters = height / 100;
        return Math.round((weight * 0.453592) / (heightInMeters * heightInMeters) * 10) / 10;
    }
}

// Initialize and run enhanced demo data generation
window.enhancedDemoDataGenerator = new EnhancedDemoDataGenerator();

// Auto-generate data when script loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 Starting enhanced demo data generation...');
    const success = await window.enhancedDemoDataGenerator.generateAllEnhancedData();
    
    if (success) {
        console.log('✅ Enhanced demo data generation completed successfully!');
        
        // Dispatch event to notify other components
        document.dispatchEvent(new CustomEvent('demoDataGenerated', {
            detail: {
                userId: 'demo-user-glucobalance',
                email: 'demo@glucobalance.com',
                dataTypes: ['risk-status', 'mood-tracker', 'nutrition-snapshot', 'ai-insights', 'health-trends', 'health-summary']
            }
        }));
    } else {
        console.error('❌ Enhanced demo data generation failed');
    }
});

// Export for manual triggering
window.generateEnhancedDemoData = () => {
    return window.enhancedDemoDataGenerator.generateAllEnhancedData();
};
//# sourceMappingURL=enhanced-demo-data.js.map