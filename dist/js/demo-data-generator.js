// Demo Data Generator - Comprehensive Health Data for Demo Account
class DemoDataGenerator {
    constructor() {
        this.demoEmail = 'demo@glucobalance.com';
        this.userId = 'demo-user-glucobalance';
        this.startDate = new Date();
        this.startDate.setDate(this.startDate.getDate() - 60); // Extended to 60 days for richer data
        
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
        this.generateHealthMetrics();
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
        // More realistic mood pattern with weekly cycles and gradual improvement over 60 days
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
                name: 'Mediterranean Diabetes Prevention',
                description: 'Heart-healthy Mediterranean diet focused on diabetes prevention',
                meals: [
                    { name: 'Greek Yogurt with Berries', type: 'breakfast', calories: 280, carbs: 25 },
                    { name: 'Quinoa Salad with Vegetables', type: 'lunch', calories: 350, carbs: 45 },
                    { name: 'Grilled Salmon with Asparagus', type: 'dinner', calories: 420, carbs: 15 },
                    { name: 'Handful of Almonds', type: 'snack', calories: 160, carbs: 6 }
                ],
                createdAt: new Date(this.startDate.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 85
            },
            {
                id: `plan-${Date.now()}-2`,
                name: 'Low-Carb Balanced Plan',
                description: 'Balanced nutrition with controlled carbohydrate intake',
                meals: [
                    { name: 'Vegetable Omelet', type: 'breakfast', calories: 320, carbs: 8 },
                    { name: 'Chicken Caesar Salad', type: 'lunch', calories: 380, carbs: 12 },
                    { name: 'Lean Beef with Broccoli', type: 'dinner', calories: 450, carbs: 20 },
                    { name: 'Greek Yogurt', type: 'snack', calories: 120, carbs: 9 }
                ],
                createdAt: new Date(this.startDate.getTime() + (15 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 78
            },
            {
                id: `plan-${Date.now()}-3`,
                name: 'Plant-Based Power Plan',
                description: 'Nutrient-rich plant-based meals for optimal health',
                meals: [
                    { name: 'Overnight Oats with Chia', type: 'breakfast', calories: 290, carbs: 35 },
                    { name: 'Lentil Buddha Bowl', type: 'lunch', calories: 400, carbs: 50 },
                    { name: 'Stuffed Bell Peppers', type: 'dinner', calories: 380, carbs: 45 },
                    { name: 'Apple with Almond Butter', type: 'snack', calories: 180, carbs: 20 }
                ],
                createdAt: new Date(this.startDate.getTime() + (25 * 24 * 60 * 60 * 1000)).toISOString(),
                adherence: 92
            }
        ];
        
        localStorage.setItem(`nutrition-plans-${this.userId}`, JSON.stringify(plans));
        console.log(`✅ Generated ${plans.length} nutrition plans`);
    }

    generateHealthMetrics() {
        const metrics = [];
        
        for (let i = 0; i < 40; i++) {
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + i);
            
            // Simulate improving health metrics
            const baseWeight = 180;
            const weight = baseWeight - (i * 0.1) + (Math.random() - 0.5) * 2;
            
            const baseBP = 140;
            const systolic = Math.max(110, baseBP - (i * 0.5) + (Math.random() - 0.5) * 10);
            const diastolic = Math.max(70, 90 - (i * 0.3) + (Math.random() - 0.5) * 5);
            
            metrics.push({
                id: `metric-${Date.now()}-${i}`,
                userId: this.userId,
                date: date.toISOString(),
                weight: Math.round(weight * 10) / 10,
                bloodPressure: {
                    systolic: Math.round(systolic),
                    diastolic: Math.round(diastolic)
                },
                steps: Math.round(5000 + Math.random() * 5000),
                sleepHours: Math.round((7 + Math.random() * 2) * 10) / 10,
                waterIntake: Math.round(6 + Math.random() * 4)
            });
        }
        
        localStorage.setItem(`health-metrics-${this.userId}`, JSON.stringify(metrics));
        console.log(`✅ Generated ${metrics.length} health metrics`);
    }

    generateProgressData() {
        const progressEntries = [];
        
        for (let i = 0; i < 60; i += 3) { // Every 3 days
            const date = new Date(this.startDate);
            date.setDate(date.getDate() + i);
            
            // Simulate various health metrics improving over time
            const baseWeight = 180;
            const weight = baseWeight - (i * 0.1) + (Math.random() - 0.5) * 1;
            
            const entry = {
                id: `progress-${Date.now()}-${i}`,
                userId: this.userId,
                date: date.toISOString().split('T')[0],
                weight: Math.round(weight * 10) / 10,
                bmi: Math.round((weight / (1.75 * 1.75)) * 10) / 10,
                steps: Math.round(6000 + (i * 50) + Math.random() * 2000),
                sleepHours: Math.round((7 + Math.random() * 2) * 10) / 10,
                waterIntake: Math.round(6 + Math.random() * 3),
                exerciseMinutes: Math.round(20 + (i * 0.5) + Math.random() * 30),
                stressLevel: Math.max(1, Math.min(5, Math.round(4 - (i * 0.02) + (Math.random() - 0.5)))),
                energyLevel: Math.max(1, Math.min(5, Math.round(3 + (i * 0.02) + (Math.random() - 0.5)))),
                createdAt: date.toISOString()
            };
            
            progressEntries.push(entry);
        }
        
        localStorage.setItem(`progress-data-${this.userId}`, JSON.stringify(progressEntries));
        localStorage.setItem(`glucobalance-progress-${this.userId}`, JSON.stringify(progressEntries));
        
        console.log(`✅ Generated ${progressEntries.length} progress entries`);
    }

    generateAIInsights() {
        const insights = [
            {
                id: `insight-${Date.now()}-1`,
                userId: this.userId,
                date: new Date().toISOString(),
                type: 'risk_improvement',
                title: 'Excellent Risk Reduction Progress! 🎯',
                content: 'Your diabetes risk score has improved significantly from 18 to 12 over the past 60 days, representing a 33% reduction. This places you in the "Increased Risk" category with strong momentum toward "Low Risk".',
                priority: 'high',
                actionable: true,
                confidence: 0.95,
                dataPoints: ['risk_assessments', 'nutrition_plans', 'mood_tracking'],
                recommendations: [
                    'Continue current Mediterranean diet plan - it\'s working excellently',
                    'Maintain your mood logging consistency for mental health benefits',
                    'Consider increasing daily steps to 8,000+ for additional cardiovascular benefits',
                    'Schedule a follow-up assessment in 4-6 weeks'
                ],
                metrics: {
                    riskImprovement: '33% reduction',
                    nutritionAdherence: '92%',
                    moodStability: 'Excellent',
                    weightLoss: '3.2 lbs'
                }
            },
            {
                id: `insight-${Date.now()}-2`,
                userId: this.userId,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'mood_pattern',
                title: 'Remarkable Mood Stability Achievement 💙',
                content: 'Your mood tracking reveals beautiful transformation. Average mood has increased from 3.2 to 4.1 over the past 2 months. The correlation between your nutrition adherence and mood stability is significant at 0.67, with reduced volatility.',
                priority: 'medium',
                actionable: true,
                confidence: 0.88,
                dataPoints: ['mood_tracking', 'nutrition_plans'],
                recommendations: [
                    'Your mood-nutrition connection is strong - particularly on days with 90%+ meal plan adherence',
                    'Consider adding 10 minutes of morning meditation to enhance mood consistency',
                    'Weekend meal prep is showing cascading benefits - keep prioritizing this',
                    'Share your success story - it\'s an inspiration!'
                ],
                metrics: {
                    moodImprovement: '28%',
                    moodTrend: '28% improvement',
                    nutritionCorrelation: '0.67'
                }
            },
            {
                id: `insight-${Date.now()}-3`,
                userId: this.userId,
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'nutrition_mastery',
                title: 'Nutrition Plan Mastery Achievement 🍎',
                content: 'Your 92% adherence to the Mediterranean diet plan is outstanding! This level of consistency places you in the top 5% of users. The variety in your meal choices, portion control, and recipe adaptations show true lifestyle integration.',
                priority: 'high',
                actionable: true,
                confidence: 0.92,
                dataPoints: ['nutrition_plans', 'progress_metrics'],
                recommendations: [
                    'Continue current Mediterranean approach - results are exceptional',
                    'Experiment with new recipes to maintain engagement',
                    'Document your favorite meal combinations for future reference',
                    'Consider sharing your meal prep strategies with the community'
                ],
                metrics: {
                    adherenceRate: '92%',
                    mealVariety: '87%',
                    bloodSugarStability: 'Excellent'
                }
            },
            {
                id: `insight-${Date.now()}-4`,
                userId: this.userId,
                date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'holistic_progress',
                title: 'Comprehensive Health Transformation 🌟',
                content: 'Your holistic approach to health is yielding remarkable results across all metrics. Weight loss of 3.2 lbs, improved sleep quality (7.8 hours average), increased physical activity by 35%, and stress level reduction create a powerful synergy for diabetes prevention.',
                priority: 'medium',
                actionable: true,
                confidence: 0.89,
                dataPoints: ['progress_metrics', 'health_assessments'],
                recommendations: [
                    'Leverage your morning routine strength - it drives success across all areas',
                    'Your integrated approach is perfect - maintain this balance',
                    'Celebrate your achievements - you\'ve created sustainable lifestyle changes',
                    'Plan for long-term maintenance strategies'
                ],
                metrics: {
                    weightLoss: '3.2 lbs',
                    sleepImprovement: '12%',
                    activityIncrease: '35%',
                    stressReduction: '22%'
                }
            },
            {
                id: `insight-${Date.now()}-5`,
                userId: this.userId,
                date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'behavioral_pattern',
                title: 'Powerful Behavioral Patterns Identified 🧠',
                content: 'Analysis of your data reveals strong positive behavioral patterns. Morning consistency correlates with better daily choices, weekend meal prep predicts weekly success, and your mood logging consistently relates to next-day energy levels and sleep quality.',
                priority: 'medium',
                actionable: true,
                confidence: 0.84,
                dataPoints: ['mood_tracking', 'nutrition_plans', 'progress_metrics'],
                recommendations: [
                    'Leverage your morning routine strength - it drives success across all areas',
                    'Protect your weekend meal prep time - it creates cascading benefits',
                    'Continue stress management practices - they directly impact sleep quality',
                    'Consider tracking energy levels to optimize daily scheduling'
                ],
                metrics: {
                    morningConsistency: '94%',
                    weekendPrepSuccess: '89%',
                    stressSleepCorrelation: '0.67'
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
                reportDate: new Date().toISOString(),
                reportPeriod: '60 days',
                patientInfo: {
                    name: 'Alex Demo',
                    email: 'demo@glucobalance.com',
                    age: 42
                },
                executiveSummary: 'Patient demonstrates exceptional engagement with digital health monitoring over the 60-day period. Current diabetes risk score: 12 (Increased Risk, improved from 18). Mental health shows statistical improvement with average mood of 4.1/5 rating. Nutrition adherence at 92% indicates outstanding commitment to Mediterranean dietary recommendations.',
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
                    moodTrend: '28% improvement'
                },
                nutritionAssessment: {
                    adherenceRate: '92%',
                    planType: 'Mediterranean Diet',
                    mealPlanCompleted: 3,
                    weightChange: '-3.2 lbs'
                },
                keyFindings: [
                    'Diabetes risk score improved by 33% through lifestyle modifications',
                    'Mental health monitoring shows consistent engagement with 51 mood entries',
                    'Nutrition adherence at 92% across Mediterranean diet plan - excellent',
                    'Weight loss of 3.2 lbs achieved through sustainable dietary changes',
                    'Sleep quality improved - average 7.8 hours with better consistency',
                    'Physical activity increased by 35% with average 7,200 daily steps'
                ],
                recommendations: [
                    'Continue current Mediterranean diet plan - showing excellent results',
                    'Maintain mood tracking consistency for mental health benefits',
                    'Consider increasing daily physical activity to 8,000+ steps target',
                    'Schedule follow-up diabetes risk assessment in 4-6 weeks',
                    'Monitor blood pressure regularly given family history',
                    'Consider HbA1c testing to validate digital health improvements'
                ],
                clinicalMetrics: {
                    weightLoss: '3.2 lbs',
                    bmiReduction: '0.8 points',
                    sleepImprovement: '12%',
                    activityIncrease: '35%',
                    stressReduction: '22%'
                }
            }
        ];
        
        localStorage.setItem(`doctor-reports-${this.userId}`, JSON.stringify(reports));
        localStorage.setItem(`glucobalance-doctor-reports-${this.userId}`, JSON.stringify(reports));
        
        console.log(`✅ Generated ${reports.length} comprehensive doctor reports`);
    }

    
 );s`insightive AI  comprehenshts.length}ed ${insigenerat(`✅ Gole.logons 
        c
       );s)(insightN.stringifyd}`, JSO${this.userIe-insights-cobalanctItem(`glutorage.se     localS  s));
 ify(insightON.stringerId}`, JS-${this.usi-insights`atItem(orage.se localSt 
            ];
           }
              : ccesseekendPrepSu        wits'cading benefcasave ces - they hiuccess',y sives weekl - it drep timedatiess founur succ- it\'s yoe strength outinorning rge your m'Levera                    s_metrics']', 'progresplanstion_tricking', 'nud_tra0.84,fidence:        con         ble: tona acti              'med:   priority         ls.'nergy leve e next-day quality andcts sleeppaectly imement dirress manag, and stccessy sueeklp predicts wd meal preweekenchoices,  daily ith betterrelates wg corood loggint morning mconsistenns: oral patteravive behrong positireveals stur data sis of yonaly: 'Aentified 🧠'dvioral_pat'beha    type:     ISOString()* 1000).to* 60 24 * 60 () - 28 * nowate(Date. D date: new     e:Increasitymprovement:pIee3.2 lbs{metrics:                   ],         gies'ateenance strges',festyle chane linablai susteated crinsights',iovascular tional carde for addiurd pressking blooer trac   'Consid         this balancein ct - maintaach is perfeed approatYour integr         ' _assessriskracking', 'cs', 'mood_tevebetes prdiay for l synergpowerfu a creates elstress lev reduced verage), and00 a,2ly steps (7ased daincrege), irs avera hou(7.8y alitved sleep qupro imof 3.2 lbs,loss ght s. Weiic metracross allresults remarkable ing yieldis  to health tic approachis holur 'Yot:mationransfore Health Tsivhen'Compre: ress',tr).toISOS * 60 * 1000 60 ** 24- 21 Date.now() e: new Date(        dat        w()}-4${Date.noinsight-   id: `            ility: 'ExceoodSugarStab          bl refereurefor futombinations rite meal c favoyourt cumenengagemenmaintain to  recipes aneannew Mediterrent with r mentor peebecoming aonsider oach - crranean appr the Mediteasterede mu\'v'Yo                    iomendatrecom           ,.92fidence: 0       con e: falseactionabl      y: 'h   prioritagement.',manlood sugar excellent bnt suggests emeimprovvalent HbA1c equiur Yoration. tyle integrue lifestions show tecipe adaptave rd creatitrol, anportion content s, consisl choiceur meaty in yorievars. The  useofhe top 5% ces you in tl and placeptionan is exiet plaranean dterved! 🍎oISOString()60 * 1000).t0 *  14 * 24 * 6w() -noe.now(${Date.`insight-id:   73'ation: '0.onCorreli45%: 'easetabilityIncr   s   ioirat an insp- you\'reccess story  sul planning'weekend meastructured ed for gest nedips sugmood kend      'Wee ilitod stabce moto enhanion editatrning miming'al toritizing me- keep pris strong on_plans'iting', 'nutrod_trackimos: ['highrity: '    prio            .3/5.',rages 4aveyour mood adherence, l plan  mea%+with 90ays  - on drongy st particularly isstabilitnd mood  adherence a nutritionyourbetween correlation . The volatilityuced ntly redificaign.1, with s to 4 from 3.2 increasedod hasr average mo. Youths past 2 monn over theioormatnsfiful traeaut bs aealacking revur mood trYo: 'content           Achievement bility ood Starkable Mle: 'Rema      titSOString(),0).toI60 * 100*  60  24 * - 7 *w()ment: '28%vemoodImpro     '92%'nce:: '33%ctionriskRedu                    trics        me    progressk continuedks to tract in 4 weessessmenscular ben cardiovationaldi+ for ad to 8,000epstetes impacts diabctly lth direheatal entreak - mgging srking excels woplan - it\'ition  nutrranean Mediter currentth youre wiendations:ommec    r            s'],tric'progress_meacking', 'mood_trplans', ion_utritments', 'nsssse['risk_aaPoints:        dat    

    getRiskCategory(score) {
        if (score < 30) return 'Low Risk';
        if (score < 50) return 'Increased Risk';
        if (score < 70) return 'High Risk';
        return 'Possible Diabetes';
    }

    generateAssessmentResponses() {
        return {
            age: 35 + Math.floor(Math.random() * 20),
            bmi: 25 + Math.random() * 10,
            familyHistory: Math.random() > 0.5,
            physicalActivity: Math.random() > 0.3,
            diet: Math.random() > 0.4,
            smoking: Math.random() > 0.8,
            bloodPressure: Math.random() > 0.6
        };
    }

    generateRecommendations(category) {
        const recommendations = {
            'Low Risk': [
                'Maintain current healthy lifestyle',
                'Continue regular physical activity',
                'Annual health check-ups recommended'
            ],
            'Increased Risk': [
                'Focus on balanced nutrition',
                'Increase physical activity to 150 minutes/week',
                'Monitor weight and blood pressure regularly'
            ],
            'High Risk': [
                'Consult healthcare provider',
                'Implement structured meal planning',
                'Consider diabetes prevention program'
            ],
            'Possible Diabetes': [
                'Seek immediate medical evaluation',
                'Blood glucose testing recommended',
                'Lifestyle intervention program advised'
            ]
        };
        
        return recommendations[category] || recommendations['Increased Risk'];
    }

    generateDetailedMoodNote(mood, dayOfWeek) {
        const notes = {
            1: ['Feeling overwhelmed today', 'Struggling with energy', 'Need some self-care', 'Having a tough day'],
            2: ['Not my best day', 'Feeling a bit down', 'Could use some support', 'Feeling stressed'],
            3: ['Okay day overall', 'Feeling neutral', 'Getting through the day', 'Average mood today'],
            4: ['Good day today', 'Feeling positive', 'Making progress', 'Productive and happy'],
            5: ['Excellent day!', 'Feeling great', 'Very motivated and happy', 'Amazing energy today']
        };
        
        const dayNotes = {
            0: ' - Sunday relaxation',
            1: ' - Monday motivation',
            2: ' - Tuesday focus',
            3: ' - Wednesday energy',
            4: ' - Thursday progress',
            5: ' - Friday celebration',
            6: ' - Saturday balance'
        };
        
        const moodNotes = notes[mood] || notes[3];
        const baseNote = moodNotes[Math.floor(Math.random() * moodNotes.length)];
        const dayNote = dayNotes[dayOfWeek] || '';
        
        return baseNote + dayNote;
    }

    generateMoodAffirmation(mood) {
        const affirmations = {
            1: ['Tomorrow is a new day', 'I am stronger than I think', 'This feeling will pass'],
            2: ['I am taking care of myself', 'Small steps count', 'I deserve kindness'],
            3: ['I am making progress', 'Every day matters', 'I am on my journey'],
            4: ['I am grateful for today', 'I am growing stronger', 'I celebrate small wins'],
            5: ['I am thriving', 'I radiate positive energy', 'I am achieving my goals']
        };
        
        const moodAffirmations = affirmations[mood] || affirmations[3];
        return moodAffirmations[Math.floor(Math.random() * moodAffirmations.length)];
    }

    generateCopingStrategies(mood) {
        const strategies = {
            1: ['Deep breathing', 'Call a friend', 'Take a warm bath', 'Listen to music'],
            2: ['Go for a walk', 'Practice gratitude', 'Do gentle stretching', 'Read something uplifting'],
            3: ['Stay hydrated', 'Take breaks', 'Practice mindfulness', 'Connect with nature'],
            4: ['Share positivity', 'Try something new', 'Help someone else', 'Celebrate progress'],
            5: ['Spread joy', 'Plan future goals', 'Inspire others', 'Document this feeling']
        };
        
        const moodStrategies = strategies[mood] || strategies[3];
        return moodStrategies.slice(0, 2); // Return 2 strategies
    }

    generateDetailedAssessmentResponses(assessmentIndex) {
        // Generate realistic WHO/ADA assessment responses
        return {
            age: 42,
            gender: 'male',
            familyHistory: true,
            physicalActivity: assessmentIndex > 2, // Improves over time
            fruitVegetableIntake: assessmentIndex > 1,
            bloodPressureMedication: false,
            highBloodGlucose: false,
            bmi: Math.max(24, 28 - (assessmentIndex * 0.5)),
            waistCircumference: Math.max(90, 95 - (assessmentIndex * 1))
        };
    }

    generateWHOADAResponses(assessmentIndex) {
        // Detailed WHO/ADA questionnaire responses
        return {
            q1_age: 42,
            q2_bmi: Math.max(24, 28 - (assessmentIndex * 0.5)),
            q3_waist: Math.max(90, 95 - (assessmentIndex * 1)),
            q4_physical_activity: assessmentIndex > 2 ? 'yes' : 'no',
            q5_fruit_vegetables: assessmentIndex > 1 ? 'yes' : 'no',
            q6_blood_pressure_medication: 'no',
            q7_high_blood_glucose: 'no',
            q8_family_history: 'yes'
        };
    }

    generateAIExplanation(score, category) {
        const explanations = {
            'Low Risk': 'Your lifestyle choices are excellent for diabetes prevention. Continue your current healthy habits.',
            'Increased Risk': 'You have some risk factors that can be improved with lifestyle changes. Focus on diet and exercise.',
            'High Risk': 'Several risk factors need attention. Consider consulting with a healthcare provider for a comprehensive plan.',
            'Possible Diabetes': 'Your risk factors suggest possible diabetes. Please consult with a healthcare provider immediately.'
        };
        
        return explanations[category] || explanations['Increased Risk'];
    }

    generateMoodNote(mood) {
        const notes = {
            1: ['Feeling overwhelmed today', 'Struggling with energy', 'Need some self-care'],
            2: ['Not my best day', 'Feeling a bit down', 'Could use some support'],
            3: ['Okay day overall', 'Feeling neutral', 'Getting through the day'],
            4: ['Good day today', 'Feeling positive', 'Making progress'],
            5: ['Excellent day!', 'Feeling great', 'Very motivated and happy']
        };
        
        const moodNotes = notes[mood] || notes[3];
        return moodNotes[Math.floor(Math.random() * moodNotes.length)];
    }

    // Method to clear all demo data
    clearDemoData() {
        const keys = [
            `risk-assessments-${this.userId}`,
            `mood-entries-${this.userId}`,
            `nutrition-plans-${this.userId}`,
            `health-metrics-${this.userId}`,
            `ai-insights-${this.userId}`
        ];
        
        keys.forEach(key => localStorage.removeItem(key));
        console.log('🗑️ Demo data cleared');
    }

    // Method to get data summary
    getDataSummary() {
        const summary = {
            riskAssessments: JSON.parse(localStorage.getItem(`risk-assessments-${this.userId}`) || '[]').length,
            moodEntries: JSON.parse(localStorage.getItem(`mood-entries-${this.userId}`) || '[]').length,
            nutritionPlans: JSON.parse(localStorage.getItem(`nutrition-plans-${this.userId}`) || '[]').length,
            healthMetrics: JSON.parse(localStorage.getItem(`health-metrics-${this.userId}`) || '[]').length,
            aiInsights: JSON.parse(localStorage.getItem(`ai-insights-${this.userId}`) || '[]').length
        };
        
        console.log('📊 Demo Data Summary:', summary);
        return summary;
    }
}

// Initialize demo data generator
window.demoDataGenerator = new DemoDataGenerator();

// Auto-generate demo data if not already present
document.addEventListener('DOMContentLoaded', () => {
    const existingData = JSON.parse(localStorage.getItem('mood-entries-demo-user') || '[]');
    if (existingData.length === 0) {
        console.log('🎯 No demo data found, generating...');
        window.demoDataGenerator.generateAllDemoData();
    } else {
        console.log('✅ Demo data already exists');
    }
});
//# sourceMappingURL=demo-data-generator.js.map