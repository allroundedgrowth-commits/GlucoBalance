// Dashboard AI Service - Gemini API Integration for Dashboard Cards
class DashboardAIService {
    constructor() {
        this.apiKey = 'AIzaSyDvMbUBFIrZFQjOOFih5ck_yEwHlXia2Js';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.initialized = true;
        this.requestQueue = [];
        this.isProcessing = false;
    }

    // Core API call method
    async makeGeminiRequest(prompt, context = {}) {
        if (!this.initialized) {
            throw new Error('AI service not initialized');
        }

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: this.buildPrompt(prompt, context)
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    buildPrompt(prompt, context) {
        return `You are a compassionate AI health assistant for GlucoBalance, a diabetes prevention and management app.

Context: ${JSON.stringify(context)}

User Request: ${prompt}

Please provide a helpful, empathetic, and medically appropriate response. Always remind users to consult healthcare professionals for medical advice. Keep responses concise and actionable.`;
    }

    // Risk Assessment AI Integration
    async generateRiskAssessment(userProfile = {}) {
        const context = {
            feature: 'risk_assessment',
            userProfile: userProfile,
            timestamp: new Date().toISOString()
        };

        const prompt = `Generate a comprehensive diabetes risk assessment for a user with the following profile:
        
Age: ${userProfile.age || 'Not specified'}
Gender: ${userProfile.gender || 'Not specified'}
BMI: ${userProfile.bmi || 'Not specified'}
Family History: ${userProfile.familyHistory ? 'Yes' : 'No'}
Physical Activity: ${userProfile.physicalActivity || 'Not specified'}
Diet Quality: ${userProfile.dietQuality || 'Not specified'}

Please provide:
1. A risk score explanation (0-100 scale)
2. Key risk factors identified
3. Personalized recommendations
4. Encouragement and next steps

Keep response under 300 words and maintain a supportive tone.`;

        return await this.makeGeminiRequest(prompt, context);
    }

    // Mood Analysis AI Integration
    async analyzeMoodPattern(moodData = []) {
        const context = {
            feature: 'mood_analysis',
            moodData: moodData,
            timestamp: new Date().toISOString()
        };

        // Calculate mood statistics
        const recentMoods = moodData.slice(0, 7); // Last 7 days
        const avgMood = recentMoods.length > 0 ? 
            recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length : 0;
        
        const moodTrend = this.calculateMoodTrend(moodData);

        const prompt = `Analyze this user's mood pattern and provide supportive insights:

Recent Mood Data (last 7 days): ${JSON.stringify(recentMoods)}
Average Mood: ${avgMood.toFixed(1)}/5
Trend: ${moodTrend}
Total Entries: ${moodData.length}

Please provide:
1. Encouraging analysis of their mood patterns
2. Recognition of positive trends or stability
3. Gentle suggestions for mood improvement if needed
4. Connection between mood and diabetes prevention
5. Actionable wellness tips

Keep response supportive, under 250 words, and focus on mental health's role in overall wellness.`;

        return await this.makeGeminiRequest(prompt, context);
    }

    // Nutrition Planning AI Integration
    async generateMealPlan(preferences = {}) {
        const context = {
            feature: 'nutrition_planning',
            preferences: preferences,
            timestamp: new Date().toISOString()
        };

        const prompt = `Create a personalized diabetes-prevention meal plan with these preferences:

Dietary Restrictions: ${preferences.restrictions || 'None specified'}
Cuisine Preference: ${preferences.cuisine || 'Any'}
Cooking Time: ${preferences.cookingTime || 'Any'}
Budget Level: ${preferences.budget || 'Moderate'}
Health Goals: Diabetes prevention, blood sugar stability
Activity Level: ${preferences.activityLevel || 'Moderate'}

Please provide:
1. 3 balanced meal ideas (breakfast, lunch, dinner)
2. 2 healthy snack options
3. Portion guidance and timing tips
4. Blood sugar impact explanation
5. Shopping tips for ingredients

Focus on low glycemic index foods, balanced macronutrients, and practical preparation. Keep under 400 words.`;

        return await this.makeGeminiRequest(prompt, context);
    }

    // AI Health Insights Generation
    async generateHealthInsights(healthData = {}) {
        const context = {
            feature: 'health_insights',
            healthData: healthData,
            timestamp: new Date().toISOString()
        };

        const prompt = `Generate personalized health insights based on this user's data:

Risk Assessments: ${healthData.riskAssessments || 0} completed
Recent Risk Score: ${healthData.latestRiskScore || 'Not available'}
Mood Entries: ${healthData.moodEntries || 0} logged
Average Mood: ${healthData.avgMood || 'Not available'}/5
Nutrition Plans: ${healthData.nutritionPlans || 0} created
Plan Adherence: ${healthData.adherence || 'Not available'}%
Days Active: ${healthData.daysActive || 0}

Please provide:
1. Celebration of their progress and engagement
2. Key insights from their health patterns
3. Personalized recommendations for improvement
4. Motivation for continued engagement
5. One specific action they can take this week

Keep response encouraging, under 300 words, and focus on empowerment and progress.`;

        return await this.makeGeminiRequest(prompt, context);
    }

    // Progress Report Generation
    async generateProgressReport(userData = {}) {
        const context = {
            feature: 'progress_report',
            userData: userData,
            timestamp: new Date().toISOString()
        };

        const prompt = `Create a comprehensive progress report for this user's diabetes prevention journey:

Time Period: ${userData.timePeriod || 'Last 30 days'}
Risk Score Change: ${userData.riskScoreChange || 'Not available'}
Mood Stability: ${userData.moodStability || 'Not available'}
Nutrition Adherence: ${userData.nutritionAdherence || 'Not available'}%
Feature Usage: ${userData.featureUsage || 'Not available'}
Goals Achieved: ${userData.goalsAchieved || 0}

Please provide:
1. Executive summary of progress
2. Key achievements and milestones
3. Areas of improvement identified
4. Specific recommendations for next month
5. Encouragement and motivation
6. Professional consultation recommendations if needed

Format as a structured report, keep under 500 words, maintain professional yet encouraging tone.`;

        return await this.makeGeminiRequest(prompt, context);
    }

    // Utility Methods
    calculateMoodTrend(moodData) {
        if (moodData.length < 2) return 'Insufficient data';
        
        const recent = moodData.slice(0, 7);
        const older = moodData.slice(7, 14);
        
        if (older.length === 0) return 'Stable';
        
        const recentAvg = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length;
        const olderAvg = older.reduce((sum, entry) => sum + entry.mood, 0) / older.length;
        
        const difference = recentAvg - olderAvg;
        
        if (difference > 0.5) return 'Improving';
        if (difference < -0.5) return 'Declining';
        return 'Stable';
    }

    getUserHealthData() {
        const userId = this.getCurrentUserId();
        
        // Get data from localStorage
        const riskAssessments = JSON.parse(localStorage.getItem(`risk-assessments-${userId}`) || '[]');
        const moodEntries = JSON.parse(localStorage.getItem(`mood-entries-${userId}`) || '[]');
        const nutritionPlans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');
        
        // Calculate metrics
        const latestRisk = riskAssessments[0];
        const recentMoods = moodEntries.slice(0, 30);
        const avgMood = recentMoods.length > 0 ? 
            recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length : 0;
        
        const adherence = nutritionPlans.length > 0 ? 
            nutritionPlans.reduce((sum, plan) => sum + (plan.adherence || 0), 0) / nutritionPlans.length : 0;

        return {
            riskAssessments: riskAssessments.length,
            latestRiskScore: latestRisk ? latestRisk.score : null,
            moodEntries: moodEntries.length,
            avgMood: avgMood.toFixed(1),
            nutritionPlans: nutritionPlans.length,
            adherence: Math.round(adherence),
            daysActive: Math.min(moodEntries.length, 40),
            moodData: moodEntries,
            timePeriod: 'Last 30 days'
        };
    }

    getCurrentUserId() {
        try {
            const user = JSON.parse(localStorage.getItem('glucobalance-current-user') || '{}');
            return user.id || 'demo-user';
        } catch {
            return 'demo-user';
        }
    }

    // Error handling with user-friendly messages
    getErrorMessage(error) {
        if (error.message.includes('API request failed')) {
            return 'Unable to connect to AI service. Please check your internet connection and try again.';
        }
        if (error.message.includes('Invalid response format')) {
            return 'Received unexpected response from AI service. Please try again.';
        }
        return 'An error occurred while generating AI insights. Please try again later.';
    }

    // Queue management for multiple requests
    async queueRequest(requestFunction) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFunction, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.requestQueue.length > 0) {
            const { requestFunction, resolve, reject } = this.requestQueue.shift();
            
            try {
                const result = await requestFunction();
                resolve(result);
            } catch (error) {
                reject(error);
            }

            // Add small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.isProcessing = false;
    }
}

// Initialize the service
window.dashboardAI = new DashboardAIService();
console.log('🤖 Dashboard AI Service initialized with Gemini API');
//# sourceMappingURL=dashboard-ai-service.js.map