// Comprehensive Demo Data Generator for demo@glucobalance.com
class ComprehensiveDemoData {
    constructor() {
        this.demoEmail = 'demo@glucobalance.com';
        this.userId = 'demo-user-glucobalance';
        this.startDate = new Date();
        this.startDate.setDate(this.startDate.getDate() - 60); // 60 days of data
        
        // Demo user profile
        this.demoUser = {
            id: this.userId,
            email: this.demoEmail,
            name: 'Alex Demo',
            age: 42,
            createdAt: new Date(this.startDate).toISOString(),
            hasCompletedAssessment: true,
            riskScore: 12,
            riskCategory: 'Increased Risk',
            lastAssessmentDate: new Date().toISOString()
        };
    }

    generateAllDemoData() {
        console.log('🎯 Generating comprehensive demo data for demo@glucobalance.com...');
        
        // Create demo user profile
        this.createDemoUser();
        
        // Generate all data types
        this.generateRiskAssessments();
        this.generateMoodEntries();
        this.generateMentalHealthLogs();
        this.generateNutritionPlans();
        this.generateProgressData();
        this.generateAIInsights();
        this.generateDoctorReports();
        
        console.log('✅ Comprehensive demo data generation complete!');
        console.log('📧 Demo account: demo@glucobalance.com');
        console.log('🔑 Password: demo123');
        return true;
    }

    createDemoUser() {
        // Store demo user in users table
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        const existingUser = users.find(u => u.email === this.demoEmail);
        
        if (!existingUser) {
            users.push(this.demoUser);
            localStorage.setItem('glucobalance-users', JSON.stringify(users));
            console.log('✅ Created demo user profile');
        }
        
        // Store user-specific data
        localStorage.setItem(`glucobalance-user-${this.userId}`, JSON.stringify(this.demoUser));
    }

    generateRiskAssessments() {
        const assessments = [];
        const baseScore = 18; // Starting with increased risk
        
        // Generate assessments every 2 weeks (more realistic)
        const assessmentDates = [0, 14, 28, 42, 56]; // Days from start
        
        assessmentDates.forEach((dayOffset, i) => {
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + dayOffset);
            
            // Simulate gradual improvement over time
            const score = Math.max(8, baseScore - (i * 2) + (Math.random() - 0.5) * 3);
            const category = this.getRiskCategory(score);
            
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
                questionResponses: this.generateWHOADAResponses(i)
            };
            
            assessments.push(assessment);
        });
        
        // Store in multiple formats for compatibility
        localStorage.setItem(`risk-assessments-${this.userId}`, JSON.stringify(assessments));
        localStorage.setItem(`glucobalance-assessments-${this.userId}`, JSON.stringify(assessments));
        
        // Store latest assessment for quick access
        const latestAssessment = assessments[assessments.length - 1];
        localStorage.setItem(`latest-assessment-${this.userId}`, JSON.stringify(latestAssessment));
        
        console.log(`✅ Generated ${assessments.length} comprehensive risk assessments`);
    }

    generateMoodEntries() {
        const moods = [];
        // More realistic mood pattern with weekly cycles and gradual improvement
        const weeklyPattern = [3, 4, 4, 3, 4, 5, 4]; // Mon-Sun pattern
        const improvementFactor = 0.02; // Gradual improvement over time
        
        for (let i = 0; i < 60; i++) {
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + i);
            
            // Skip some days randomly (not everyone logs daily)
            if (Math.random() < 0.15) continue; // 15% chance to skip a day
            
            const dayOfWeek = date.getDay();
            const baseMood = weeklyPattern[dayOfWeek];
            const improvement = i * improvementFactor;
            const randomVariation = (Math.random() - 0.5) * 0.8;
            
            const mood = Math.max(1, Math.min(5, Math.round(baseMood + improvement + randomVariation)));
            
            const moodEntry = {
                id: `mood-${Date.now()}-${i}`,
                userId: this.userId,
                mood: mood,
                date: date.toISOString().split('T')[0],
                createdAt: date.toISOString(),
                timestamp: date.getTime(),
                notes: this.generateDetailedMoodNote(mood, dayOfWeek),
                affirmation: this.generateMoodAffirmation(mood),
                copingStrategies: this.generateCopingStrategies(mood)
            };
            
            moods.push(moodEntry);
        }
        
        // Store in multiple formats for compatibility
        localStorage.setItem(`mood-entries-${this.userId}`, JSON.stringify(moods));
        localStorage.setItem(`glucobalance-moods-${this.userId}`, JSON.stringify(moods));
        
        console.log(`✅ Generated ${moods.length} realistic mood entries`);
    }

    generateMentalHealthLogs() {
        // Generate the same mood data for MentalHealthLogs table
        const moods = JSON.parse(localStorage.getItem(`glucobalance-moods-${this.userId}`) || '[]');
        
        // Store in MentalHealthLogs format
        localStorage.setItem(`MentalHealthLogs-${this.userId}`, JSON.stringify(moods));
        localStorage.setItem(`mental-health-logs-${this.userId}`, JSON.stringify(moods));
        
        console.log(`✅ Generated ${moods.length} mental health log entries`);
    }

    generateNutritionPlans() {
        const plans = [
            {
                id: `plan-${Date.now()}-1`,
                userId: this.userId,
                name: 'Mediterranean Diabetes Prevention Plan',
                description: 'Heart-healthy Mediterranean diet focused on diabetes prevention with emphasis on whole grains, lean proteins, and healthy fats',
                planType: 'Mediterranean',
                duration: '4 weeks',
                meals: [
                    { 
                        name: 'Greek Yogurt Parfait with Berries and Nuts', 
                        type: 'breakfast', 
                        calories: 320, 
                        carbs: 28, 
                        protein: 18, 
                        fat: 16,
                        fiber: 6,
                        ingredients: ['Greek yogurt', 'Mixed berries', 'Walnuts', 'Honey', 'Chia seeds']
                    },
                    { 
                        name: 'Quinoa Tabbouleh with Grilled Chicken', 
                        type: 'lunch', 
                        calories: 420, 
                        carbs: 45, 
                        protein: 32, 
                        fat: 14,
                        fiber: 8,
                        ingredients: ['Quinoa', 'Chicken breast', 'Cucumber', 'Tomatoes', 'Parsley', 'Olive oil']
                    },
                    { 
                        name: 'Baked Salmon with Roasted Vegetables', 
                        type: 'dinner', 
                        calories: 480, 
                        carbs: 22, 
                        protein: 38, 
                        fat: 26,
                        fiber: 7,
                        ingredients: ['Salmon fillet', 'Asparagus', 'Bell peppers', 'Zucchini', 'Olive oil', 'Herbs']
                    },
                    { 
                        name: 'Hummus with Vegetable Sticks', 
                        type: 'snack', 
                        calories: 180, 
                        carbs: 16, 
                        protein: 8, 
                        fat: 10,
                        fiber: 6,
                        ingredients: ['Hummus', 'Carrots', 'Celery', 'Bell peppers']
                    }
                ],
                createdAt: new Date(this.startDate.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 92,
                weeklyAdherence: [88, 94, 90, 96],
                nutritionalGoals: {
                    dailyCalories: 1400,
                    carbPercentage: 45,
                    proteinPercentage: 25,
                    fatPercentage: 30,
                    fiberGoal: 25
                }
            },
            {
                id: `plan-${Date.now()}-2`,
                userId: this.userId,
                name: 'Balanced Low-Glycemic Plan',
                description: 'Carefully balanced nutrition with controlled carbohydrate intake and low glycemic index foods',
                planType: 'Low-Glycemic',
                duration: '3 weeks',
                meals: [
                    { 
                        name: 'Vegetable Omelet with Avocado', 
                        type: 'breakfast', 
                        calories: 340, 
                        carbs: 12, 
                        protein: 22, 
                        fat: 24,
                        fiber: 8,
                        ingredients: ['Eggs', 'Spinach', 'Mushrooms', 'Avocado', 'Cheese']
                    },
                    { 
                        name: 'Grilled Chicken Salad with Mixed Greens', 
                        type: 'lunch', 
                        calories: 380, 
                        carbs: 18, 
                        protein: 35, 
                        fat: 20,
                        fiber: 9,
                        ingredients: ['Chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil vinaigrette']
                    },
                    { 
                        name: 'Lean Beef Stir-fry with Broccoli', 
                        type: 'dinner', 
                        calories: 450, 
                        carbs: 25, 
                        protein: 40, 
                        fat: 22,
                        fiber: 6,
                        ingredients: ['Lean beef', 'Broccoli', 'Bell peppers', 'Brown rice', 'Ginger', 'Garlic']
                    },
                    { 
                        name: 'Greek Yogurt with Almonds', 
                        type: 'snack', 
                        calories: 160, 
                        carbs: 8, 
                        protein: 12, 
                        fat: 10,
                        fiber: 3,
                        ingredients: ['Greek yogurt', 'Almonds', 'Cinnamon']
                    }
                ],
                createdAt: new Date(this.startDate.getTime() + (25 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 86,
                weeklyAdherence: [82, 88, 88],
                nutritionalGoals: {
                    dailyCalories: 1330,
                    carbPercentage: 35,
                    proteinPercentage: 35,
                    fatPercentage: 30,
                    fiberGoal: 28
                }
            },
            {
                id: `plan-${Date.now()}-3`,
                userId: this.userId,
                name: 'Plant-Forward Wellness Plan',
                description: 'Nutrient-dense plant-based meals with lean proteins for optimal health and diabetes prevention',
                planType: 'Plant-Forward',
                duration: '4 weeks',
                meals: [
                    { 
                        name: 'Overnight Oats with Chia and Berries', 
                        type: 'breakfast', 
                        calories: 310, 
                        carbs: 42, 
                        protein: 12, 
                        fat: 12,
                        fiber: 12,
                        ingredients: ['Rolled oats', 'Chia seeds', 'Almond milk', 'Blueberries', 'Maple syrup']
                    },
                    { 
                        name: 'Lentil and Vegetable Buddha Bowl', 
                        type: 'lunch', 
                        calories: 420, 
                        carbs: 58, 
                        protein: 18, 
                        fat: 14,
                        fiber: 16,
                        ingredients: ['Red lentils', 'Quinoa', 'Roasted vegetables', 'Tahini dressing', 'Pumpkin seeds']
                    },
                    { 
                        name: 'Stuffed Bell Peppers with Turkey', 
                        type: 'dinner', 
                        calories: 390, 
                        carbs: 35, 
                        protein: 28, 
                        fat: 16,
                        fiber: 10,
                        ingredients: ['Bell peppers', 'Ground turkey', 'Brown rice', 'Black beans', 'Vegetables']
                    },
                    { 
                        name: 'Apple Slices with Almond Butter', 
                        type: 'snack', 
                        calories: 190, 
                        carbs: 22, 
                        protein: 6, 
                        fat: 12,
                        fiber: 6,
                        ingredients: ['Apple', 'Almond butter', 'Cinnamon']
                    }
                ],
                createdAt: new Date(this.startDate.getTime() + (45 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 89,
                weeklyAdherence: [85, 91, 88, 92],
                nutritionalGoals: {
                    dailyCalories: 1310,
                    carbPercentage: 50,
                    proteinPercentage: 20,
                    fatPercentage: 30,
                    fiberGoal: 35
                }
            }
        ];
        
        localStorage.setItem(`nutrition-plans-${this.userId}`, JSON.stringify(plans));
        localStorage.setItem(`glucobalance-nutrition-${this.userId}`, JSON.stringify(plans));
        
        console.log(`✅ Generated ${plans.length} comprehensive nutrition plans`);
    }

    generateProgressData() {
        const progressEntries = [];
        
        for (let i = 0; i < 60; i += 3) { // Every 3 days
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + i);
            
            // Simulate various health metrics improving over time
            const baseWeight = 185;
            const weight = baseWeight - (i * 0.05) + (Math.random() - 0.5) * 1;
            
            const entry = {
                id: `progress-${Date.now()}-${i}`,
                userId: this.userId,
                date: date.toISOString().split('T')[0],
                metricType: 'comprehensive',
                weight: Math.round(weight * 10) / 10,
                bmi: Math.round((weight / (1.75 * 1.75)) * 10) / 10,
                steps: Math.round(6000 + (i * 50) + Math.random() * 2000),
                sleepHours: Math.round((7.2 + Math.random() * 1.5) * 10) / 10,
                waterIntake: Math.round(6 + Math.random() * 3),
                exerciseMinutes: Math.round(20 + (i * 0.5) + Math.random() * 30),
                stressLevel: Math.max(1, Math.min(5, 4 - (i * 0.02) + (Math.random() - 0.5))),
                energyLevel: Math.max(1, Math.min(5, 3 + (i * 0.02) + (Math.random() - 0.5))),
                bloodPressure: {
                    systolic: Math.round(135 - (i * 0.3) + (Math.random() - 0.5) * 8),
                    diastolic: Math.round(85 - (i * 0.2) + (Math.random() - 0.5) * 5)
                },
                createdAt: date.toISOString()
            };
            
            progressEntries.push(entry);
        }
        
        localStorage.setItem(`progress-data-${this.userId}`, JSON.stringify(progressEntries));
        localStorage.setItem(`glucobalance-progress-${this.userId}`, JSON.stringify(progressEntries));
        
        console.log(`✅ Generated ${progressEntries.length} progress tracking entries`);
    }

    generateAIInsights() {
        const insights = [
            {
                id: `insight-${Date.now()}-1`,
                userId: this.userId,
                date: new Date().toISOString(),
                type: 'risk_improvement',
                title: 'Outstanding Risk Reduction Progress! 🎯',
                content: 'Your diabetes risk score has improved from 18 to 12 over the past 8 weeks - a 33% reduction! This significant improvement is directly linked to your consistent meal planning (92% adherence), regular mood tracking, and increased physical activity. Your dedication to the Mediterranean diet and stress management techniques is paying off remarkably.',
                priority: 'high',
                actionable: true,
                confidence: 0.95,
                dataPoints: ['risk_assessments', 'nutrition_plans', 'mood_tracking', 'progress_metrics'],
                recommendations: [
                    'Continue with your current Mediterranean nutrition plan - it\'s working excellently',
                    'Maintain your mood logging streak - mental health directly impacts diabetes risk',
                    'Consider increasing daily steps to 8,000+ for additional cardiovascular benefits',
                    'Schedule a follow-up assessment in 4 weeks to track continued progress'
                ],
                metrics: {
                    riskReduction: '33%',
                    nutritionAdherence: '92%',
                    moodImprovement: '28%',
                    weightLoss: '3.2 lbs'
                }
            },
            {
                id: `insight-${Date.now()}-2`,
                userId: this.userId,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'mood_pattern',
                title: 'Remarkable Mood Stability Achievement 💙',
                content: 'Your mood tracking reveals a beautiful transformation over the past 2 months. Your average mood has increased from 3.2 to 4.1, with significantly reduced volatility. The correlation between your nutrition adherence and mood stability is particularly strong - on days with 90%+ meal plan adherence, your mood averages 4.3/5.',
                priority: 'high',
                actionable: true,
                confidence: 0.88,
                dataPoints: ['mood_tracking', 'nutrition_plans'],
                recommendations: [
                    'Your mood-nutrition connection is strong - keep prioritizing meal timing',
                    'Consider adding 10 minutes of morning meditation to enhance mood stability',
                    'Weekend mood dips suggest need for structured weekend meal planning',
                    'Share your success story - you\'re an inspiration!'
                ],
                metrics: {
                    moodImprovement: '28%',
                    stabilityIncrease: '45%',
                    nutritionCorrelation: '0.73'
                }
            },
            {
                id: `insight-${Date.now()}-3`,
                userId: this.userId,
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'nutrition_mastery',
                title: 'Nutrition Plan Mastery Achieved! 🍎',
                content: 'Your 92% adherence to the Mediterranean diet plan is exceptional and places you in the top 5% of users. The variety in your meal choices, consistent portion control, and creative recipe adaptations show true lifestyle integration. Your HbA1c equivalent improvement suggests excellent blood sugar management.',
                priority: 'high',
                actionable: false,
                confidence: 0.92,
                dataPoints: ['nutrition_plans', 'progress_metrics'],
                recommendations: [
                    'You\'ve mastered the Mediterranean approach - consider becoming a peer mentor',
                    'Experiment with new Mediterranean recipes to maintain engagement',
                    'Document your favorite meal combinations for future reference',
                    'Consider sharing your meal prep strategies with the community'
                ],
                metrics: {
                    adherenceRate: '92%',
                    mealVariety: '87%',
                    bloodSugarStability: 'Excellent'
                }
            }
        ];
        
        localStorage.setItem(`ai-insights-${this.userId}`, JSON.stringify(insights));
        localStorage.setItem(`glucobalance-insights-${this.userId}`, JSON.stringify(insights));
        
        console.log(`✅ Generated ${insights.length} comprehensive AI insights`);
    }

    generateDoctorReports() {
        const reports = [
            {
                id: `report-${Date.now()}-1`,
                userId: this.userId,
                generatedDate: new Date().toISOString(),
                reportPeriod: '60 days',
                patientInfo: {
                    name: 'Alex Demo',
                    email: 'demo@glucobalance.com',
                    age: 42,
                    reportDate: new Date().toLocaleDateString()
                },
                executiveSummary: 'Patient demonstrates exceptional engagement with digital health monitoring over the 60-day period. Current diabetes risk score: 12 (Increased Risk, improved from 18). Mental health status shows average mood rating of 4.1/5 with excellent stability. Nutrition adherence at 92% indicates outstanding commitment to Mediterranean dietary recommendations. Continued monitoring and current lifestyle interventions recommended.',
                riskAssessment: {
                    currentScore: 12,
                    previousScore: 18,
                    improvement: '33% reduction',
                    category: 'Increased Risk',
                    trend: 'Significantly Improving'
                },
                mentalHealthAssessment: {
                    averageMood: 4.1,
                    moodStability: 'Excellent',
                    totalEntries: 51,
                    improvementTrend: '28% improvement'
                },
                nutritionAssessment: {
                    adherenceRate: '92%',
                    planType: 'Mediterranean Diet',
                    mealPlansCompleted: 3,
                    weightChange: '-3.2 lbs'
                },
                keyFindings: [
                    'Diabetes risk score improved by 33% through lifestyle modifications',
                    'Mental health monitoring shows consistent engagement with 51 mood entries',
                    'Nutrition adherence excellent at 92% across Mediterranean diet plan',
                    'Weight loss of 3.2 lbs achieved through sustainable dietary changes',
                    'Sleep quality improved to 7.8 hours average with better consistency',
                    'Physical activity increased by 35% with average 7,200 daily steps'
                ],
                recommendations: [
                    'Continue current Mediterranean nutrition plan - showing excellent results',
                    'Maintain mood tracking consistency for continued mental health benefits',
                    'Consider increasing daily physical activity target to 8,000+ steps',
                    'Schedule follow-up diabetes risk assessment in 4-6 weeks',
                    'Monitor blood pressure regularly given family history',
                    'Consider HbA1c testing to validate digital health improvements'
                ]
            }
        ];
        
        localStorage.setItem(`doctor-reports-${this.userId}`, JSON.stringify(reports));
        localStorage.setItem(`glucobalance-reports-${this.userId}`, JSON.stringify(reports));
        
        console.log(`✅ Generated ${reports.length} comprehensive doctor reports`);
    }

    // Helper methods
    getRiskCategory(score) {
        if (score < 10) return 'Low Risk';
        if (score < 15) return 'Increased Risk';
        if (score < 20) return 'High Risk';
        return 'Possible Diabetes';
    }

    generateDetailedAssessmentResponses(assessmentIndex) {
        const baseResponses = {
            age: 42,
            bmi: 26.8 - (assessmentIndex * 0.2),
            familyHistory: true,
            physicalActivity: assessmentIndex >= 2,
            diet: assessmentIndex >= 1,
            smoking: false,
            bloodPressure: assessmentIndex < 3,
            waistCircumference: 38 - (assessmentIndex * 0.5),
            gestationalDiabetes: false,
            medications: false
        };
        
        return baseResponses;
    }

    generateWHOADAResponses(assessmentIndex) {
        return [
            { questionId: 'age', response: 42, points: 4 },
            { questionId: 'bmi', response: 26.8 - (assessmentIndex * 0.2), points: Math.max(0, 3 - assessmentIndex) },
            { questionId: 'family_history', response: 2, points: 2 },
            { questionId: 'physical_activity', response: assessmentIndex >= 2 ? 0 : 2, points: assessmentIndex >= 2 ? 0 : 2 },
            { questionId: 'diet', response: assessmentIndex >= 1 ? 0 : 1, points: assessmentIndex >= 1 ? 0 : 1 },
            { questionId: 'blood_pressure', response: assessmentIndex < 3 ? 2 : 0, points: assessmentIndex < 3 ? 2 : 0 }
        ];
    }

    generateAIExplanation(score, category) {
        const explanations = {
            'Low Risk': `Your risk score of ${score} indicates excellent diabetes prevention progress. Continue your current healthy lifestyle choices.`,
            'Increased Risk': `Your risk score of ${score} shows ${score > 15 ? 'significant improvement' : 'good progress'} in diabetes prevention. Your lifestyle modifications are working effectively.`,
            'High Risk': `Your risk score of ${score} indicates the need for continued focus on lifestyle interventions. Your progress shows positive trends.`,
            'Possible Diabetes': `Your risk score of ${score} suggests the importance of medical evaluation alongside your lifestyle improvements.`
        };
        
        return explanations[category] || explanations['Increased Risk'];
    }

    generateRecommendations(category) {
        const recommendations = {
            'Low Risk': [
                'Maintain current healthy lifestyle patterns',
                'Continue regular physical activity routine',
                'Annual health screenings recommended'
            ],
            'Increased Risk': [
                'Continue with structured meal planning',
                'Maintain 150+ minutes of weekly physical activity',
                'Regular monitoring of weight and blood pressure'
            ],
            'High Risk': [
                'Intensify lifestyle intervention strategies',
                'Consider consultation with healthcare provider',
                'Implement comprehensive diabetes prevention program'
            ]
        };
        
        return recommendations[category] || recommendations['Increased Risk'];
    }

    generateDetailedMoodNote(mood, dayOfWeek) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const moodNotes = {
            1: [
                'Feeling overwhelmed with work stress today',
                'Low energy, need to focus on self-care',
                'Challenging day, but staying committed to health goals'
            ],
            2: [
                'Not my best day, but staying positive',
                'Feeling a bit down, grateful for support system',
                'Rough start but improving as day goes on'
            ],
            3: [
                'Steady day, maintaining healthy routines',
                'Feeling balanced and focused on goals',
                'Good day for meal prep and planning'
            ],
            4: [
                'Great energy today, feeling motivated!',
                'Positive mindset helping with healthy choices',
                'Feeling strong and confident in my progress'
            ],
            5: [
                'Excellent day! Everything clicking together',
                'Feeling amazing - nutrition and exercise on point',
                'Incredible energy and motivation today!'
            ]
        };
        
        const notes = moodNotes[mood] || moodNotes[3];
        const baseNote = notes[Math.floor(Math.random() * notes.length)];
        
        // Add day-specific context
        if (dayOfWeek === 1) return baseNote + ' - Monday motivation!';
        if (dayOfWeek === 5) return baseNote + ' - TGIF feeling!';
        if (dayOfWeek === 0 || dayOfWeek === 6) return baseNote + ' - Weekend vibes';
        
        return baseNote;
    }

    generateMoodAffirmation(mood) {
        const affirmations = {
            1: 'It\'s okay to have difficult days. You\'re taking important steps for your health, and that shows real strength.',
            2: 'You\'re doing well by staying engaged with your health journey, even on challenging days.',
            3: 'Your consistency in tracking your health is admirable. Every day of self-care matters.',
            4: 'Your positive energy is wonderful! This mindset supports all your healthy choices.',
            5: 'Fantastic! Your joy and motivation are powerful tools for maintaining excellent health habits.'
        };
        
        return affirmations[mood] || affirmations[3];
    }

    generateCopingStrategies(mood) {
        const strategies = {
            1: [
                'Try deep breathing: inhale for 4, hold for 4, exhale for 6',
                'Take a gentle 10-minute walk outside',
                'Practice self-compassion - treat yourself kindly',
                'Reach out to a trusted friend or family member'
            ],
            2: [
                'Engage in 5 minutes of mindfulness or meditation',
                'Write down three things you\'re grateful for',
                'Listen to calming music or nature sounds',
                'Do some gentle stretching or yoga'
            ],
            3: [
                'Maintain your regular healthy routine',
                'Take breaks to check in with yourself',
                'Engage in a hobby you enjoy',
                'Stay hydrated and eat nourishing meals'
            ],
            4: [
                'Channel your positive energy into physical activity',
                'Share your good mood through acts of kindness',
                'Use this time to plan healthy activities',
                'Practice gratitude journaling'
            ],
            5: [
                'Celebrate your positive mood and use it for motivation',
                'Share your joy with others - it\'s contagious!',
                'Take on a new healthy challenge or goal',
                'Use this energy to prepare nutritious meals'
            ]
        };
        
        return strategies[mood] || strategies[3];
    }

    // Utility methods
    clearAllDemoData() {
        const keys = [
            `risk-assessments-${this.userId}`,
            `glucobalance-assessments-${this.userId}`,
            `mood-entries-${this.userId}`,
            `glucobalance-moods-${this.userId}`,
            `MentalHealthLogs-${this.userId}`,
            `nutrition-plans-${this.userId}`,
            `glucobalance-nutrition-${this.userId}`,
            `progress-data-${this.userId}`,
            `glucobalance-progress-${this.userId}`,
            `ai-insights-${this.userId}`,
            `glucobalance-insights-${this.userId}`,
            `doctor-reports-${this.userId}`,
            `glucobalance-reports-${this.userId}`,
            `latest-assessment-${this.userId}`,
            `glucobalance-user-${this.userId}`
        ];
        
        keys.forEach(key => localStorage.removeItem(key));
        
        // Remove from users array
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        const filteredUsers = users.filter(u => u.email !== this.demoEmail);
        localStorage.setItem('glucobalance-users', JSON.stringify(filteredUsers));
        
        console.log('🗑️ All demo data cleared');
    }

    getDataSummary() {
        const summary = {
            user: this.demoUser,
            riskAssessments: JSON.parse(localStorage.getItem(`glucobalance-assessments-${this.userId}`) || '[]').length,
            moodEntries: JSON.parse(localStorage.getItem(`glucobalance-moods-${this.userId}`) || '[]').length,
            mentalHealthLogs: JSON.parse(localStorage.getItem(`MentalHealthLogs-${this.userId}`) || '[]').length,
            nutritionPlans: JSON.parse(localStorage.getItem(`glucobalance-nutrition-${this.userId}`) || '[]').length,
            progressEntries: JSON.parse(localStorage.getItem(`glucobalance-progress-${this.userId}`) || '[]').length,
            aiInsights: JSON.parse(localStorage.getItem(`glucobalance-insights-${this.userId}`) || '[]').length,
            doctorReports: JSON.parse(localStorage.getItem(`glucobalance-reports-${this.userId}`) || '[]').length
        };
        
        console.log('📊 Comprehensive Demo Data Summary:', summary);
        return summary;
    }
}

// Initialize comprehensive demo data generator
window.comprehensiveDemoData = new ComprehensiveDemoData();

// Auto-generate demo data if demo user logs in
document.addEventListener('DOMContentLoaded', () => {
    // Check if we should generate demo data
    const currentUser = JSON.parse(localStorage.getItem('current-user') || '{}');
    if (currentUser.email === 'demo@glucobalance.com') {
        const existingData = JSON.parse(localStorage.getItem('glucobalance-moods-demo-user-glucobalance') || '[]');
        if (existingData.length === 0) {
            console.log('🎯 Demo user detected, generating comprehensive data...');
            window.comprehensiveDemoData.generateAllDemoData();
        } else {
            console.log('✅ Demo data already exists for demo@glucobalance.com');
        }
    }
});