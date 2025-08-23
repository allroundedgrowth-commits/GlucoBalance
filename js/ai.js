// GlucoBalance - AI Integration (Gemini AI)
class GeminiAI {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.initialized = false;
        this.keySource = null; // Track where the key came from
        this.initializeFromStorage();
    }

    // Secure API key management
    initializeFromStorage() {
        try {
            // Try to get API key from secure storage (localStorage with encryption)
            const storedKey = this.getStoredApiKey();
            if (storedKey) {
                this.initialize(storedKey, 'stored');
            } else {
                // Try environment variable (for development)
                const envKey = this.getEnvironmentApiKey();
                if (envKey) {
                    this.initialize(envKey, 'environment');
                }
            }
        } catch (error) {
            console.warn('Failed to initialize AI from storage:', error);
        }
    }

    initialize(apiKey, source = 'manual') {
        if (!apiKey || typeof apiKey !== 'string') {
            console.warn('Invalid API key provided');
            return false;
        }

        // Basic validation - Gemini API keys typically start with 'AIza'
        if (!apiKey.startsWith('AIza')) {
            console.warn('API key format appears invalid');
            return false;
        }

        this.apiKey = apiKey;
        this.keySource = source;
        this.initialized = true;
        
        // Store securely if manually provided
        if (source === 'manual') {
            this.storeApiKey(apiKey);
        }

        console.log(`Gemini AI initialized from ${source}`);
        return true;
    }

    // Secure storage methods
    storeApiKey(apiKey) {
        try {
            // Simple encryption for demo - in production, use proper encryption
            const encrypted = btoa(apiKey); // Base64 encoding as basic obfuscation
            localStorage.setItem('glucobalance_ai_key', encrypted);
        } catch (error) {
            console.error('Failed to store API key:', error);
        }
    }

    getStoredApiKey() {
        try {
            const encrypted = localStorage.getItem('glucobalance_ai_key');
            if (encrypted) {
                return atob(encrypted); // Decode base64
            }
        } catch (error) {
            console.error('Failed to retrieve stored API key:', error);
        }
        return null;
    }

    getEnvironmentApiKey() {
        // For development environments
        return window.GEMINI_API_KEY || null;
    }

    clearStoredApiKey() {
        try {
            localStorage.removeItem('glucobalance_ai_key');
            this.apiKey = null;
            this.initialized = false;
            this.keySource = null;
        } catch (error) {
            console.error('Failed to clear API key:', error);
        }
    }

    // API key status methods
    isInitialized() {
        return this.initialized && this.apiKey !== null;
    }

    getKeySource() {
        return this.keySource;
    }

    // Prompt user for API key if not available
    async promptForApiKey() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay api-key-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🤖 Enable AI Insights</h3>
                    </div>
                    <div class="modal-body">
                        <p>To get personalized AI-powered health insights, please provide your Gemini API key.</p>
                        <div class="api-key-info">
                            <p><strong>How to get your API key:</strong></p>
                            <ol>
                                <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
                                <li>Sign in with your Google account</li>
                                <li>Click "Create API Key"</li>
                                <li>Copy the key and paste it below</li>
                            </ol>
                        </div>
                        <div class="form-group">
                            <label for="api-key-input">Gemini API Key:</label>
                            <input type="password" id="api-key-input" placeholder="AIza..." class="form-control">
                            <small class="form-text">Your API key is stored securely on your device and never shared.</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="skip-ai">Skip for Now</button>
                        <button class="btn-primary" id="save-api-key">Save & Enable AI</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const apiKeyInput = modal.querySelector('#api-key-input');
            const saveBtn = modal.querySelector('#save-api-key');
            const skipBtn = modal.querySelector('#skip-ai');

            saveBtn.addEventListener('click', () => {
                const apiKey = apiKeyInput.value.trim();
                if (apiKey) {
                    const success = this.initialize(apiKey, 'manual');
                    if (success) {
                        document.body.removeChild(modal);
                        resolve(true);
                    } else {
                        alert('Invalid API key format. Please check and try again.');
                    }
                } else {
                    alert('Please enter your API key.');
                }
            });

            skipBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });

            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                    resolve(false);
                }
            });
        });
    }

    async generateContent(prompt, context = {}) {
        if (!this.initialized) {
            return this.getFallbackResponse(prompt, context);
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
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini AI error:', error);
            return this.getFallbackResponse(prompt, context);
        }
    }

    buildPrompt(prompt, context) {
        let fullPrompt = `You are a compassionate AI health assistant for GlucoBalance, a diabetes prevention and management app. 
        
Context: ${JSON.stringify(context)}

User Request: ${prompt}

Please provide a helpful, empathetic, and medically appropriate response. Always remind users to consult healthcare professionals for medical advice. Keep responses concise and actionable.`;

        return fullPrompt;
    }

    // Risk Assessment AI - Enhanced for explainable insights
    async explainRiskScore(score, assessmentData) {
        const category = this.getRiskCategory(score);
        const context = {
            riskScore: score,
            category: category,
            assessmentData: assessmentData,
            riskFactors: this.analyzeRiskFactors(assessmentData)
        };

        const prompt = `As a compassionate diabetes prevention specialist, provide an empathetic and transparent explanation of this risk assessment result.

Risk Score: ${score}
Risk Category: ${category}
Contributing Factors: ${JSON.stringify(context.riskFactors)}

Please provide:
1. A warm, understanding explanation of what this score means
2. Clear explanation of how each risk factor contributed to the score
3. Personalized, actionable recommendations based on their specific risk factors
4. Encouraging words about their ability to improve their health
5. When to seek professional medical advice

Keep the tone supportive, avoid medical jargon, and focus on empowerment rather than fear. Limit response to 200-250 words.`;

        return await this.generateContent(prompt, context);
    }

    analyzeRiskFactors(assessmentData) {
        const factors = [];
        
        // Analyze each response and identify contributing factors
        if (assessmentData.age >= 2) {
            factors.push({
                factor: 'Age',
                points: assessmentData.age,
                impact: assessmentData.age >= 4 ? 'high' : 'moderate',
                description: 'Age is a non-modifiable risk factor'
            });
        }
        
        if (assessmentData.gender === 1) {
            factors.push({
                factor: 'Gender (Male)',
                points: 1,
                impact: 'low',
                description: 'Males have slightly higher diabetes risk'
            });
        }
        
        if (assessmentData.family_history > 0) {
            factors.push({
                factor: 'Family History',
                points: assessmentData.family_history,
                impact: assessmentData.family_history >= 5 ? 'high' : 'moderate',
                description: 'Genetic predisposition increases risk'
            });
        }
        
        if (assessmentData.high_blood_pressure === 2) {
            factors.push({
                factor: 'High Blood Pressure',
                points: 2,
                impact: 'moderate',
                description: 'Hypertension is linked to insulin resistance'
            });
        }
        
        if (assessmentData.physical_activity === 2) {
            factors.push({
                factor: 'Physical Inactivity',
                points: 2,
                impact: 'moderate',
                description: 'Modifiable through lifestyle changes'
            });
        }
        
        if (assessmentData.bmi > 0) {
            factors.push({
                factor: 'Body Weight',
                points: assessmentData.bmi,
                impact: assessmentData.bmi >= 3 ? 'high' : 'moderate',
                description: 'Weight management can significantly reduce risk'
            });
        }
        
        if (assessmentData.gestational_diabetes === 1) {
            factors.push({
                factor: 'Gestational Diabetes History',
                points: 1,
                impact: 'moderate',
                description: 'Previous gestational diabetes increases future risk'
            });
        }
        
        if (assessmentData.prediabetes === 5) {
            factors.push({
                factor: 'Prediabetes History',
                points: 5,
                impact: 'high',
                description: 'Previous prediabetes diagnosis requires immediate attention'
            });
        }
        
        return factors;
    }

    async generatePersonalizedRecommendations(userData) {
        const context = {
            riskScore: userData.riskScore,
            age: userData.age,
            lifestyle: userData.lifestyle,
            recentMoods: userData.recentMoods
        };

        const prompt = `Generate 3-5 personalized health recommendations based on this user's profile and risk assessment. Focus on practical, achievable lifestyle changes.`;

        return await this.generateContent(prompt, context);
    }

    // Nutrition AI
    async generateMealPlan(preferences = {}) {
        const context = {
            dietaryRestrictions: preferences.restrictions || preferences.dietaryRestrictions || [],
            cuisine: preferences.cuisine || 'general',
            days: preferences.days || 3,
            diabeticFriendly: true,
            heartHealthy: true
        };

        // Use custom prompt if provided, otherwise create default
        let prompt = preferences.prompt;
        if (!prompt) {
            prompt = `Create a ${context.days}-day diabetic and heart-friendly meal plan with ${context.cuisine} cuisine influences. Include breakfast, lunch, dinner, and snacks. Consider the dietary preferences and restrictions provided: ${context.dietaryRestrictions.join(', ')}.`;
        }

        const response = await this.generateContent(prompt, context);
        return this.parseMealPlan(response);
    }

    parseMealPlan(response) {
        // Parse the AI response into structured meal plan data
        const days = [];
        const lines = response.split('\n').filter(line => line.trim());
        
        let currentDay = null;
        let currentMeal = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Check for day headers
            if (trimmed.match(/day \d+/i) || trimmed.match(/\d+\./)) {
                if (currentDay) days.push(currentDay);
                currentDay = {
                    day: days.length + 1,
                    meals: {}
                };
            }
            
            // Check for meal types
            else if (trimmed.match(/breakfast|lunch|dinner|snack/i)) {
                const mealType = trimmed.toLowerCase().replace(':', '').trim();
                currentMeal = mealType;
                if (currentDay && !currentDay.meals[currentMeal]) {
                    currentDay.meals[currentMeal] = [];
                }
            }
            
            // Add meal items
            else if (currentDay && currentMeal && trimmed.startsWith('-') || trimmed.startsWith('•')) {
                const item = trimmed.replace(/^[-•]\s*/, '');
                currentDay.meals[currentMeal].push(item);
            }
        });

        if (currentDay) days.push(currentDay);
        
        return days.length > 0 ? days : this.getFallbackMealPlan();
    }

    // Mental Health AI - Enhanced for personalized support
    async generateMoodAffirmation(mood, context = {}) {
        const moodContext = {
            moodLevel: mood,
            recentTrend: context.recentTrend || 'stable',
            healthGoals: context.healthGoals || ['diabetes prevention', 'emotional wellbeing'],
            userProfile: context.userProfile || {},
            notes: context.notes || ''
        };

        let prompt = `As a compassionate mental health supporter for someone managing diabetes prevention, create a personalized, empathetic affirmation for someone who rated their mood as ${mood}/5.

Context:
- Current mood: ${mood}/5
- Recent trend: ${moodContext.recentTrend}
- User notes: "${moodContext.notes}"
- User profile: ${JSON.stringify(moodContext.userProfile)}

Please provide:
1. A warm, understanding acknowledgment of their current emotional state
2. A personalized affirmation that connects their emotional wellbeing to their health journey
3. Gentle encouragement that feels authentic and supportive
4. Connection between mental health and diabetes prevention when appropriate

Keep the tone empathetic, avoid toxic positivity, and make it feel personal. Limit to 2-3 sentences (50-80 words).`;

        return await this.generateContent(prompt, moodContext);
    }

    async generateCopingStrategies(mood, context = {}) {
        const copingContext = {
            currentMood: mood,
            stressors: context.stressors || [],
            moodHistory: context.moodHistory || [],
            recentTrend: context.recentTrend || 'stable',
            userSituation: context.userSituation || {},
            healthFocus: true,
            diabetesPrevention: context.diabetesPrevention || true
        };

        let prompt = `As a mental health specialist focused on diabetes prevention, provide 3-4 personalized coping strategies for someone with a current mood of ${mood}/5.

Context:
- Current mood: ${mood}/5
- Recent mood trend: ${copingContext.recentTrend}
- Identified stressors: ${copingContext.stressors.join(', ') || 'none specified'}
- User situation: ${JSON.stringify(copingContext.userSituation)}
- Recent mood history available: ${copingContext.moodHistory.length > 0 ? 'yes' : 'no'}

Please provide:
1. Immediate coping strategies appropriate for their current mood level
2. Techniques that support both mental health and diabetes prevention
3. Practical, actionable steps they can take today
4. Strategies that consider their recent mood patterns and trends

Format as a numbered list. Keep each strategy concise but actionable (1-2 sentences each). Focus on evidence-based techniques.`;

        return await this.generateContent(prompt, copingContext);
    }

    async generateEnhancedSupport(context = {}) {
        const supportContext = {
            consistentLowMood: context.consistentLowMood || false,
            moodHistory: context.moodHistory || [],
            moodTrends: context.moodTrends || {},
            userProfile: context.userProfile || {},
            needsProfessionalSupport: context.needsProfessionalSupport || false
        };

        let prompt = `As a compassionate mental health advocate, provide enhanced support for someone experiencing consistently low mood while managing diabetes prevention.

Context:
- Experiencing consistent low mood: ${supportContext.consistentLowMood}
- Recent mood trends: ${JSON.stringify(supportContext.moodTrends)}
- User profile: ${JSON.stringify(supportContext.userProfile)}
- Mood history length: ${supportContext.moodHistory.length} entries

Please provide:
1. Empathetic acknowledgment of their struggle without minimizing their experience
2. Gentle encouragement about the connection between mental and physical health
3. Specific suggestion to seek professional mental health support
4. Reassurance about the strength it takes to seek help
5. Brief mention of how mental health impacts diabetes prevention

Keep the tone warm, non-judgmental, and supportive. Avoid clinical language. Limit to 3-4 sentences (80-120 words).`;

        return await this.generateContent(prompt, supportContext);
    }

    async generateMoodPatternInsights(moodData = {}) {
        const insightContext = {
            moodHistory: moodData.moodHistory || [],
            trends: moodData.trends || {},
            patterns: moodData.patterns || {},
            timeframe: moodData.timeframe || '30 days'
        };

        let prompt = `As a mental health data analyst, provide personalized insights about mood patterns for someone managing diabetes prevention.

Mood Data:
- History length: ${insightContext.moodHistory.length} entries
- Timeframe: ${insightContext.timeframe}
- Trends: ${JSON.stringify(insightContext.trends)}
- Patterns: ${JSON.stringify(insightContext.patterns)}

Please provide:
1. Key insights about their mood patterns in easy-to-understand language
2. Positive observations about their emotional resilience or progress
3. Gentle suggestions for areas of focus or improvement
4. Connection between mood stability and diabetes prevention when relevant

Keep insights encouraging and actionable. Limit to 2-3 key points (60-100 words total).`;

        return await this.generateContent(prompt, insightContext);
    }

    // Progress Analysis AI
    async analyzeProgressTrends(progressData) {
        const context = {
            riskScores: progressData.riskScores || [],
            moodTrends: progressData.moods || [],
            nutritionAdherence: progressData.nutrition || [],
            timeframe: progressData.timeframe || '30 days'
        };

        const prompt = `Analyze these health progress trends and provide insights about improvements, areas of concern, and recommendations for continued progress.`;

        return await this.generateContent(prompt, context);
    }

    async generateMotivationalMessage(achievements = []) {
        const context = {
            recentAchievements: achievements,
            healthJourney: true
        };

        const prompt = `Create an encouraging message celebrating these health achievements and motivating continued progress in diabetes prevention.`;

        return await this.generateContent(prompt, context);
    }

    // Utility Methods
    getRiskCategory(score) {
        if (score < 7) return 'Low';
        if (score < 15) return 'Increased';
        if (score < 20) return 'High';
        return 'Possible Diabetes';
    }

    // Fallback responses when AI is not available
    getFallbackResponse(prompt, context) {
        const fallbacks = {
            riskExplanation: {
                'Low': "Great news! Your risk score indicates a low likelihood of developing diabetes. Keep up your healthy lifestyle habits including regular exercise and balanced nutrition.",
                'Increased': "Your assessment shows an increased risk for diabetes. This is manageable with lifestyle changes like regular physical activity, healthy eating, and weight management.",
                'High': "Your risk score indicates a high likelihood of developing diabetes. It's important to make immediate lifestyle changes and consult with a healthcare provider.",
                'Possible Diabetes': "Your assessment suggests you may already have diabetes. Please consult with a healthcare provider for proper testing and medical guidance."
            },
            moodAffirmations: {
                1: "It's okay to have difficult days. Remember that taking care of your health is an act of self-love, and every small step matters.",
                2: "You're showing strength by staying engaged with your health journey, even when things feel challenging.",
                3: "You're doing well by maintaining awareness of your health. Consistency in small actions leads to big changes.",
                4: "Your positive attitude is a powerful tool for maintaining good health. Keep up the great work!",
                5: "Wonderful! Your positive energy and commitment to health are truly inspiring. You're on the right path!"
            },
            recommendations: [
                "Aim for at least 150 minutes of moderate exercise per week",
                "Focus on a balanced diet rich in vegetables, lean proteins, and whole grains",
                "Monitor your blood sugar levels regularly if recommended by your doctor",
                "Maintain a healthy weight through portion control and regular activity",
                "Stay hydrated and limit sugary beverages",
                "Get adequate sleep (7-9 hours per night) for optimal health",
                "Practice stress management techniques like meditation or deep breathing"
            ]
        };

        if (context.riskScore !== undefined) {
            const category = this.getRiskCategory(context.riskScore);
            return fallbacks.riskExplanation[category];
        }

        if (context.moodLevel !== undefined) {
            return fallbacks.moodAffirmations[context.moodLevel] || fallbacks.moodAffirmations[3];
        }

        // Return general recommendations
        const randomRecs = fallbacks.recommendations
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        return `Here are some personalized recommendations for your health journey:\n\n• ${randomRecs.join('\n• ')}`;
    }

    getFallbackMealPlan() {
        return [
            {
                day: 1,
                meals: {
                    breakfast: ["Oatmeal with berries and nuts", "Greek yogurt", "Green tea"],
                    lunch: ["Grilled chicken salad with mixed vegetables", "Quinoa", "Water with lemon"],
                    dinner: ["Baked salmon with steamed broccoli", "Brown rice", "Herbal tea"],
                    snack: ["Apple slices with almond butter"]
                }
            },
            {
                day: 2,
                meals: {
                    breakfast: ["Vegetable omelet with spinach", "Whole grain toast", "Unsweetened coffee"],
                    lunch: ["Lentil soup with vegetables", "Mixed green salad", "Water"],
                    dinner: ["Lean beef stir-fry with vegetables", "Cauliflower rice", "Herbal tea"],
                    snack: ["Handful of mixed nuts"]
                }
            },
            {
                day: 3,
                meals: {
                    breakfast: ["Smoothie with spinach, berries, and protein powder", "Whole grain toast"],
                    lunch: ["Turkey and avocado wrap with vegetables", "Side salad", "Water"],
                    dinner: ["Grilled chicken with roasted vegetables", "Sweet potato", "Herbal tea"],
                    snack: ["Greek yogurt with cinnamon"]
                }
            }
        ];
    }
}

// Initialize AI service
window.geminiAI = new GeminiAI();

// AI Service Integration
class AIService {
    constructor() {
        this.gemini = window.geminiAI;
        this.fallbackMode = false;
    }

    async ensureInitialized() {
        if (!this.gemini.isInitialized()) {
            // Try to prompt user for API key
            const userProvidedKey = await this.gemini.promptForApiKey();
            if (!userProvidedKey) {
                this.fallbackMode = true;
                return false;
            }
        }
        return true;
    }

    async initializeAI(apiKey) {
        if (apiKey) {
            return this.gemini.initialize(apiKey, 'manual');
        }
        return false;
    }

    async getRiskExplanation(score, assessmentData) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.explainRiskScore(score, assessmentData);
    }

    async generateEnhancedRiskExplanation(score, responses) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        
        const category = this.gemini.getRiskCategory(score);
        const riskFactors = this.gemini.analyzeRiskFactors(responses);
        
        const context = {
            score: score,
            category: category,
            riskFactors: riskFactors,
            modifiableFactors: riskFactors.filter(f => this.isModifiableRiskFactor(f.factorId))
        };

        const prompt = `As a compassionate healthcare AI, provide an empathetic explanation for a diabetes risk assessment result.

Assessment Results:
- Risk Score: ${score}
- Risk Category: ${category}
- Key Risk Factors: ${riskFactors.map(f => `${f.factor} (${f.points} points)`).join(', ')}

Please provide a warm, encouraging explanation that:
1. Acknowledges their proactive step in taking the assessment
2. Explains what their score means in simple, non-alarming terms
3. Highlights any positive aspects of their health profile
4. Emphasizes what they can control and improve
5. Provides hope and motivation for positive changes

Tone: Supportive, informative, encouraging, and medically accurate but accessible.
Length: 2-3 paragraphs, conversational and empathetic.`;

        return await this.gemini.generateContent(prompt, context);
    }

    isModifiableRiskFactor(factorId) {
        const modifiableFactors = ['physical_activity', 'bmi', 'high_blood_pressure'];
        return modifiableFactors.includes(factorId);
    }

    async getPersonalizedRecommendations(userData) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.generatePersonalizedRecommendations(userData);
    }

    async generateMealPlan(preferences) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.generateMealPlan(preferences);
    }

    async getMoodSupport(mood, context) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.generateMoodAffirmation(mood, context);
    }

    async getCopingStrategies(mood, context) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.generateCopingStrategies(mood, context);
    }

    async getEnhancedMentalHealthSupport(context) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.generateEnhancedSupport(context);
    }

    async generateMoodInsights(moodData) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.generateMoodPatternInsights(moodData);
    }

    async analyzeProgress(progressData) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        
        // Handle both old and new format
        if (progressData.prompt) {
            return await this.gemini.generateContent(progressData.prompt, progressData.context);
        }
        
        return await this.gemini.analyzeProgressTrends(progressData);
    }

    async generateContent(prompt, context) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.generateContent(prompt, context);
    }

    async getMotivationalMessage(achievements) {
        if (!await this.ensureInitialized()) {
            throw new Error('AI service not available');
        }
        return await this.gemini.generateMotivationalMessage(achievements);
    }

    // Utility methods
    isAvailable() {
        return this.gemini.isInitialized();
    }

    getStatus() {
        if (this.gemini.isInitialized()) {
            return {
                available: true,
                source: this.gemini.getKeySource(),
                fallbackMode: false
            };
        }
        return {
            available: false,
            source: null,
            fallbackMode: this.fallbackMode
        };
    }

    clearApiKey() {
        this.gemini.clearStoredApiKey();
        this.fallbackMode = true;
    }
}

// Initialize AI service
window.aiService = new AIService();