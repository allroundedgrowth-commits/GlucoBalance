// GlucoBalance - Nutrition Planning Service
class NutritionService {
    constructor() {
        this.aiService = window.aiService;
        this.database = window.kiroDb;
        this.currentUserId = null;
        this.culturalCuisines = this.initializeCulturalCuisines();
        this.dietaryRestrictions = this.initializeDietaryRestrictions();
    }

    initializeCulturalCuisines() {
        return {
            'general': {
                name: 'General/Western',
                characteristics: ['balanced portions', 'lean proteins', 'whole grains', 'vegetables'],
                commonIngredients: ['chicken', 'fish', 'quinoa', 'brown rice', 'broccoli', 'spinach']
            },
            'mediterranean': {
                name: 'Mediterranean',
                characteristics: ['olive oil', 'fish', 'legumes', 'fresh vegetables', 'herbs'],
                commonIngredients: ['olive oil', 'salmon', 'chickpeas', 'tomatoes', 'feta cheese', 'oregano']
            },
            'asian': {
                name: 'Asian',
                characteristics: ['steamed preparations', 'tofu', 'vegetables', 'minimal oil', 'ginger'],
                commonIngredients: ['tofu', 'bok choy', 'shiitake mushrooms', 'ginger', 'sesame oil', 'green tea']
            },
            'indian': {
                name: 'Indian',
                characteristics: ['spices', 'lentils', 'vegetables', 'yogurt', 'turmeric'],
                commonIngredients: ['lentils', 'turmeric', 'cumin', 'yogurt', 'spinach', 'cauliflower']
            },
            'mexican': {
                name: 'Mexican',
                characteristics: ['beans', 'peppers', 'lime', 'cilantro', 'avocado'],
                commonIngredients: ['black beans', 'bell peppers', 'lime', 'cilantro', 'avocado', 'tomatoes']
            },
            'middle-eastern': {
                name: 'Middle Eastern',
                characteristics: ['hummus', 'tahini', 'vegetables', 'herbs', 'lean meats'],
                commonIngredients: ['chickpeas', 'tahini', 'parsley', 'cucumber', 'lean lamb', 'olive oil']
            }
        };
    }

    initializeDietaryRestrictions() {
        return {
            'vegetarian': {
                name: 'Vegetarian',
                excludes: ['meat', 'poultry', 'fish', 'seafood'],
                includes: ['vegetables', 'fruits', 'grains', 'legumes', 'dairy', 'eggs']
            },
            'vegan': {
                name: 'Vegan',
                excludes: ['meat', 'poultry', 'fish', 'seafood', 'dairy', 'eggs', 'honey'],
                includes: ['vegetables', 'fruits', 'grains', 'legumes', 'nuts', 'seeds']
            },
            'gluten-free': {
                name: 'Gluten-Free',
                excludes: ['wheat', 'barley', 'rye', 'bread', 'pasta'],
                includes: ['rice', 'quinoa', 'corn', 'potatoes', 'gluten-free grains']
            },
            'dairy-free': {
                name: 'Dairy-Free',
                excludes: ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
                includes: ['plant-based milk', 'dairy alternatives', 'coconut products']
            },
            'low-sodium': {
                name: 'Low Sodium',
                excludes: ['processed foods', 'canned soups', 'deli meats'],
                includes: ['fresh herbs', 'spices', 'fresh vegetables', 'lean proteins']
            },
            'heart-healthy': {
                name: 'Heart Healthy',
                excludes: ['saturated fats', 'trans fats', 'high cholesterol foods'],
                includes: ['omega-3 rich foods', 'fiber-rich foods', 'antioxidant-rich foods']
            }
        };
    }

    setCurrentUser(userId) {
        this.currentUserId = userId;
    }

    // Generate AI-powered meal plan with cultural adaptation
    async generateMealPlan(preferences = {}) {
        try {
            const mealPlanPreferences = this.buildMealPlanPreferences(preferences);
            
            // Generate meal plan using AI service
            let mealPlan;
            if (this.aiService && await this.aiService.isAvailable()) {
                mealPlan = await this.generateAIMealPlan(mealPlanPreferences);
            } else {
                mealPlan = this.generateFallbackMealPlan(mealPlanPreferences);
            }

            // Store the meal plan
            if (this.currentUserId && this.database) {
                await this.storeMealPlan(mealPlan, mealPlanPreferences);
            }

            return {
                success: true,
                mealPlan: mealPlan,
                preferences: mealPlanPreferences,
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error generating meal plan:', error);
            return {
                success: false,
                error: error.message,
                fallbackPlan: this.generateFallbackMealPlan(preferences)
            };
        }
    }

    buildMealPlanPreferences(preferences) {
        return {
            cuisine: preferences.cuisine || 'general',
            dietaryRestrictions: preferences.dietaryRestrictions || [],
            days: preferences.days || 3,
            diabeticFriendly: true,
            heartHealthy: true,
            culturalAdaptation: this.culturalCuisines[preferences.cuisine || 'general'],
            restrictionDetails: preferences.dietaryRestrictions?.map(r => this.dietaryRestrictions[r]).filter(Boolean) || []
        };
    }

    async generateAIMealPlan(preferences) {
        const prompt = this.buildAIMealPlanPrompt(preferences);
        
        try {
            // Use the AI service's generateMealPlan method with proper parameters
            const aiResponse = await this.aiService.generateMealPlan({
                prompt: prompt,
                cuisine: preferences.cuisine,
                restrictions: preferences.dietaryRestrictions,
                dietaryRestrictions: preferences.dietaryRestrictions, // Ensure compatibility
                days: preferences.days
            });

            return this.parseAIMealPlanResponse(aiResponse, preferences);
        } catch (error) {
            console.error('AI meal plan generation failed:', error);
            throw new Error('AI service unavailable, using fallback meal plan');
        }
    }

    buildAIMealPlanPrompt(preferences) {
        const { cuisine, dietaryRestrictions, culturalAdaptation, restrictionDetails } = preferences;
        
        let prompt = `Create a 3-day diabetic-friendly and heart-healthy meal plan with the following specifications:

CUISINE STYLE: ${culturalAdaptation.name}
- Emphasize: ${culturalAdaptation.characteristics.join(', ')}
- Common ingredients to include: ${culturalAdaptation.commonIngredients.join(', ')}

DIETARY REQUIREMENTS:
- Diabetic-friendly (low glycemic index, balanced carbohydrates)
- Heart-healthy (low saturated fat, high fiber)
- Portion-controlled for blood sugar management`;

        if (dietaryRestrictions.length > 0) {
            prompt += `\n\nDIETARY RESTRICTIONS:`;
            restrictionDetails.forEach(restriction => {
                prompt += `\n- ${restriction.name}: Avoid ${restriction.excludes.join(', ')}. Focus on ${restriction.includes.join(', ')}.`;
            });
        }

        prompt += `\n\nFORMAT REQUIREMENTS:
For each day, provide:
- Breakfast (with estimated carbs)
- Mid-morning snack
- Lunch (with estimated carbs)  
- Afternoon snack
- Dinner (with estimated carbs)
- Evening snack (if needed)

Include:
- Specific portion sizes
- Preparation tips for diabetes management
- Cultural authenticity while maintaining health focus
- Estimated carbohydrate content for main meals
- Nutritional benefits of key ingredients

Keep meals practical, affordable, and culturally appropriate while prioritizing blood sugar management.`;

        return prompt;
    }

    parseAIMealPlanResponse(aiResponse, preferences) {
        // Parse AI response into structured meal plan
        const days = [];
        
        if (typeof aiResponse === 'string') {
            // Parse text response
            days.push(...this.parseTextMealPlan(aiResponse));
        } else if (Array.isArray(aiResponse)) {
            // Already structured response
            days.push(...aiResponse);
        } else {
            throw new Error('Invalid AI response format');
        }

        // Ensure we have 3 days
        while (days.length < 3) {
            days.push(this.generateFallbackDay(days.length + 1, preferences));
        }

        return {
            id: this.generateMealPlanId(),
            type: '3-day',
            cuisine: preferences.cuisine,
            dietaryRestrictions: preferences.dietaryRestrictions,
            days: days.slice(0, 3),
            culturalNotes: this.generateCulturalNotes(preferences.culturalAdaptation),
            nutritionalGuidelines: this.generateNutritionalGuidelines(preferences)
        };
    }

    parseTextMealPlan(text) {
        const days = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        let currentDay = null;
        let currentMeal = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Check for day headers
            if (trimmed.match(/day\s*[1-3]/i) || trimmed.match(/^[1-3][\.\)]/)) {
                if (currentDay) days.push(currentDay);
                currentDay = {
                    day: days.length + 1,
                    meals: {}
                };
            }
            // Check for meal types
            else if (trimmed.match(/breakfast|lunch|dinner|snack/i)) {
                const mealMatch = trimmed.toLowerCase().match(/(breakfast|lunch|dinner|snack|mid-morning|afternoon|evening)/);
                if (mealMatch) {
                    currentMeal = this.normalizeMealType(mealMatch[1]);
                    if (currentDay && !currentDay.meals[currentMeal]) {
                        currentDay.meals[currentMeal] = [];
                    }
                }
            }
            // Add meal items
            else if (currentDay && currentMeal && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*'))) {
                const item = trimmed.replace(/^[-•*]\s*/, '').trim();
                if (item) {
                    currentDay.meals[currentMeal].push(this.parseMealItem(item));
                }
            }
        });

        if (currentDay) days.push(currentDay);
        return days;
    }

    normalizeMealType(mealType) {
        const mealMap = {
            'breakfast': 'breakfast',
            'lunch': 'lunch', 
            'dinner': 'dinner',
            'snack': 'snack',
            'mid-morning': 'morningSnack',
            'afternoon': 'afternoonSnack',
            'evening': 'eveningSnack'
        };
        return mealMap[mealType] || 'snack';
    }

    parseMealItem(item) {
        // Extract carb information if present
        const carbMatch = item.match(/\((\d+)g?\s*carbs?\)/i);
        const carbs = carbMatch ? parseInt(carbMatch[1]) : null;
        
        // Extract preparation tips
        const preparationTip = this.extractPreparationNotes(item);
        
        // Clean the item text
        let cleanItem = item.replace(/\(\d+g?\s*carbs?\)/i, '').trim();
        if (preparationTip) {
            // Remove the preparation tip from the main name if it was extracted
            cleanItem = cleanItem.replace(new RegExp(`\\(${preparationTip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'i'), '').trim();
        }
        
        return {
            name: cleanItem,
            carbs: carbs,
            notes: preparationTip,
            preparationTip: preparationTip // Gemini-generated preparation tips
        };
    }

    extractPreparationNotes(item) {
        // Extract preparation tips or notes
        const notePatterns = [
            /\(([^)]*(?:steamed|grilled|baked|roasted|fresh)[^)]*)\)/i,
            /\(([^)]*(?:tip|note|prepare)[^)]*)\)/i
        ];
        
        for (const pattern of notePatterns) {
            const match = item.match(pattern);
            if (match && !match[1].match(/\d+g?\s*carbs?/i)) {
                return match[1];
            }
        }
        return null;
    }

    generateFallbackMealPlan(preferences) {
        const cuisine = preferences.cuisine || 'general';
        const restrictions = preferences.dietaryRestrictions || [];
        
        return {
            id: this.generateMealPlanId(),
            type: '3-day',
            cuisine: cuisine,
            dietaryRestrictions: restrictions,
            days: [
                this.generateFallbackDay(1, preferences),
                this.generateFallbackDay(2, preferences),
                this.generateFallbackDay(3, preferences)
            ],
            culturalNotes: this.generateCulturalNotes(this.culturalCuisines[cuisine]),
            nutritionalGuidelines: this.generateNutritionalGuidelines(preferences)
        };
    }

    generateFallbackDay(dayNumber, preferences) {
        const cuisine = preferences.cuisine || 'general';
        const isVegetarian = preferences.dietaryRestrictions?.includes('vegetarian');
        const isVegan = preferences.dietaryRestrictions?.includes('vegan');
        const isGlutenFree = preferences.dietaryRestrictions?.includes('gluten-free');
        
        const fallbackMeals = this.getFallbackMealsByDay(dayNumber, cuisine, {
            vegetarian: isVegetarian,
            vegan: isVegan,
            glutenFree: isGlutenFree
        });

        return {
            day: dayNumber,
            meals: fallbackMeals
        };
    }

    getFallbackMealsByDay(day, cuisine, restrictions) {
        const mealTemplates = {
            general: {
                1: {
                    breakfast: [
                        { name: 'Steel-cut oatmeal with berries and almonds', carbs: 30, notes: 'Use unsweetened almond milk' },
                        { name: 'Greek yogurt (plain, low-fat)', carbs: 12, notes: 'Add cinnamon for flavor' }
                    ],
                    morningSnack: [
                        { name: 'Apple slices with 1 tbsp almond butter', carbs: 20, notes: 'Choose small apple' }
                    ],
                    lunch: [
                        { name: 'Grilled chicken salad with mixed vegetables', carbs: 15, notes: 'Use olive oil vinaigrette' },
                        { name: 'Quinoa (1/2 cup cooked)', carbs: 22, notes: 'High protein grain' }
                    ],
                    afternoonSnack: [
                        { name: 'Handful of mixed nuts (unsalted)', carbs: 5, notes: '1 oz portion' }
                    ],
                    dinner: [
                        { name: 'Baked salmon with herbs', carbs: 0, notes: 'Rich in omega-3' },
                        { name: 'Steamed broccoli', carbs: 8, notes: 'High in fiber' },
                        { name: 'Brown rice (1/3 cup cooked)', carbs: 15, notes: 'Portion controlled' }
                    ]
                }
            }
        };

        // Apply dietary restrictions
        let meals = mealTemplates[cuisine]?.[day] || mealTemplates.general[1];
        
        if (restrictions.vegetarian || restrictions.vegan) {
            meals = this.adaptMealsForVegetarian(meals, restrictions.vegan);
        }
        
        if (restrictions.glutenFree) {
            meals = this.adaptMealsForGlutenFree(meals);
        }

        return meals;
    }

    adaptMealsForVegetarian(meals, isVegan) {
        const adapted = JSON.parse(JSON.stringify(meals)); // Deep copy
        
        // Replace meat/fish with plant-based alternatives
        Object.keys(adapted).forEach(mealType => {
            adapted[mealType] = adapted[mealType].map(item => {
                if (item.name.toLowerCase().includes('chicken')) {
                    return { ...item, name: item.name.replace(/chicken/i, 'tofu'), notes: 'Marinated and grilled' };
                }
                if (item.name.toLowerCase().includes('salmon')) {
                    return { ...item, name: 'Baked tempeh with herbs', carbs: 8, notes: 'High protein plant option' };
                }
                if (isVegan && item.name.toLowerCase().includes('yogurt')) {
                    return { ...item, name: 'Coconut yogurt (unsweetened)', notes: 'Plant-based alternative' };
                }
                return item;
            });
        });

        return adapted;
    }

    adaptMealsForGlutenFree(meals) {
        const adapted = JSON.parse(JSON.stringify(meals)); // Deep copy
        
        Object.keys(adapted).forEach(mealType => {
            adapted[mealType] = adapted[mealType].map(item => {
                if (item.name.toLowerCase().includes('oatmeal')) {
                    return { ...item, name: 'Gluten-free oatmeal with berries and almonds', notes: 'Certified gluten-free oats' };
                }
                return item;
            });
        });

        return adapted;
    }

    generateCulturalNotes(culturalAdaptation) {
        return {
            cuisine: culturalAdaptation.name,
            keyPrinciples: culturalAdaptation.characteristics,
            healthBenefits: this.getCulturalHealthBenefits(culturalAdaptation),
            preparationTips: this.getCulturalPreparationTips(culturalAdaptation),
            culturalContext: this.getCulturalContext(culturalAdaptation),
            localIngredients: culturalAdaptation.commonIngredients
        };
    }

    getCulturalHealthBenefits(cultural) {
        const benefits = {
            'General/Western': ['Balanced macronutrients', 'Portion control focus', 'Variety of food groups'],
            'Mediterranean': ['Heart-healthy fats', 'Anti-inflammatory foods', 'Rich in antioxidants'],
            'Asian': ['Low in saturated fat', 'High vegetable content', 'Mindful eating practices'],
            'Indian': ['Anti-inflammatory spices', 'High fiber from legumes', 'Probiotic benefits'],
            'Mexican': ['High fiber from beans', 'Antioxidant-rich peppers', 'Healthy fats from avocado']
        };
        return benefits[cultural.name] || benefits['General/Western'];
    }

    getCulturalPreparationTips(cultural) {
        const tips = {
            'General/Western': ['Grill or bake instead of frying', 'Use herbs for flavor', 'Control portion sizes'],
            'Mediterranean': ['Use olive oil in moderation', 'Include fresh herbs', 'Emphasize fish over meat'],
            'Asian': ['Steam vegetables to retain nutrients', 'Use minimal oil', 'Include green tea'],
            'Indian': ['Use spices for flavor without salt', 'Include turmeric for anti-inflammatory benefits', 'Balance spices with cooling foods'],
            'Mexican': ['Use lime for flavor enhancement', 'Include cilantro for freshness', 'Choose lean proteins'],
            'Middle Eastern': ['Use tahini for healthy fats', 'Include fresh herbs like parsley', 'Emphasize legumes and vegetables']
        };
        return tips[cultural.name] || tips['General/Western'];
    }

    getCulturalContext(cultural) {
        const contexts = {
            'General/Western': 'Focuses on balanced nutrition with familiar ingredients and cooking methods',
            'Mediterranean': 'Emphasizes heart-healthy fats, fresh vegetables, and traditional cooking methods proven to reduce diabetes risk',
            'Asian': 'Incorporates traditional steaming and stir-frying techniques with emphasis on vegetables and minimal processing',
            'Indian': 'Utilizes traditional spices with proven anti-inflammatory and blood sugar benefits',
            'Mexican': 'Features traditional ingredients like beans and peppers that provide fiber and antioxidants',
            'Middle Eastern': 'Incorporates traditional ingredients like tahini and legumes that support stable blood sugar'
        };
        return contexts[cultural.name] || contexts['General/Western'];
    }

    generateNutritionalGuidelines(preferences) {
        return {
            dailyCarbs: '45-60g per meal',
            fiberGoal: '25-35g daily',
            proteinTarget: '0.8-1g per kg body weight',
            healthyFats: 'Focus on omega-3 and monounsaturated fats',
            sodiumLimit: 'Less than 2300mg daily',
            diabeticTips: [
                'Eat meals at consistent times',
                'Pair carbohydrates with protein or healthy fats',
                'Choose whole grains over refined grains',
                'Monitor portion sizes',
                'Stay hydrated with water'
            ]
        };
    }

    // Storage and retrieval functionality
    async storeMealPlan(mealPlan, preferences) {
        try {
            const planData = {
                planType: '3-day',
                cuisine: preferences.cuisine,
                dietaryRestrictions: preferences.dietaryRestrictions,
                mealPlan: mealPlan,
                adherenceTracking: this.initializeAdherenceTracking(mealPlan),
                culturalAdaptabilityMetadata: {
                    selectedCuisine: preferences.cuisine,
                    culturalCharacteristics: preferences.culturalAdaptation?.characteristics || [],
                    commonIngredients: preferences.culturalAdaptation?.commonIngredients || [],
                    adaptationLevel: 'high', // AI-powered cultural adaptation
                    restrictionAdaptations: preferences.restrictionDetails?.map(r => r.name) || []
                },
                generationMethod: 'ai-powered', // Track that this was AI-generated
                createdAt: new Date().toISOString()
            };

            const savedPlan = await this.database.saveNutritionPlan(this.currentUserId, planData);
            return savedPlan;
        } catch (error) {
            console.error('Error storing meal plan:', error);
            throw error;
        }
    }

    async getUserMealPlans(limit = 5) {
        try {
            if (!this.currentUserId) {
                throw new Error('No user ID set');
            }
            return await this.database.getUserNutritionPlans(this.currentUserId, limit);
        } catch (error) {
            console.error('Error retrieving meal plans:', error);
            return [];
        }
    }

    async getLatestMealPlan() {
        try {
            const plans = await this.getUserMealPlans(1);
            return plans.length > 0 ? plans[0] : null;
        } catch (error) {
            console.error('Error getting latest meal plan:', error);
            return null;
        }
    }

    // Adherence tracking functionality
    initializeAdherenceTracking(mealPlan) {
        const tracking = {};
        mealPlan.days.forEach(day => {
            tracking[`day${day.day}`] = {};
            Object.keys(day.meals).forEach(mealType => {
                tracking[`day${day.day}`][mealType] = {
                    completed: false,
                    adherencePercentage: 0,
                    notes: ''
                };
            });
        });
        return tracking;
    }

    async updateMealAdherence(planId, day, mealType, adherenceData) {
        try {
            // This would update the adherence tracking in the database
            // For now, we'll store it locally
            const adherenceKey = `meal-adherence-${planId}`;
            let adherenceData_stored = JSON.parse(localStorage.getItem(adherenceKey) || '{}');
            
            if (!adherenceData_stored[`day${day}`]) {
                adherenceData_stored[`day${day}`] = {};
            }
            
            adherenceData_stored[`day${day}`][mealType] = {
                ...adherenceData,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(adherenceKey, JSON.stringify(adherenceData_stored));
            return adherenceData_stored;
        } catch (error) {
            console.error('Error updating meal adherence:', error);
            throw error;
        }
    }

    async getMealAdherence(planId) {
        try {
            const adherenceKey = `meal-adherence-${planId}`;
            return JSON.parse(localStorage.getItem(adherenceKey) || '{}');
        } catch (error) {
            console.error('Error getting meal adherence:', error);
            return {};
        }
    }

    calculateOverallAdherence(adherenceData) {
        let totalMeals = 0;
        let completedMeals = 0;
        
        Object.values(adherenceData).forEach(day => {
            Object.values(day).forEach(meal => {
                totalMeals++;
                if (meal.completed) {
                    completedMeals++;
                }
            });
        });
        
        return totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;
    }

    // AI-powered lifestyle recommendations (Requirement 3.7)
    async generateLifestyleRecommendations(userProfile, adherenceData) {
        try {
            if (this.aiService && await this.aiService.isAvailable()) {
                const context = {
                    adherencePercentage: this.calculateOverallAdherence(adherenceData),
                    cuisine: userProfile.preferredCuisine,
                    dietaryRestrictions: userProfile.dietaryRestrictions,
                    recentActivity: userProfile.recentActivity
                };

                const recommendations = await this.aiService.getPersonalizedRecommendations({
                    ...userProfile,
                    nutritionAdherence: context.adherencePercentage,
                    focus: 'lifestyle'
                });

                return {
                    aiGenerated: true,
                    recommendations: recommendations,
                    categories: ['physical_activity', 'stress_management', 'sleep_hygiene'],
                    generatedAt: new Date().toISOString()
                };
            } else {
                return this.getFallbackLifestyleRecommendations();
            }
        } catch (error) {
            console.error('Error generating lifestyle recommendations:', error);
            return this.getFallbackLifestyleRecommendations();
        }
    }

    getFallbackLifestyleRecommendations() {
        return {
            aiGenerated: false,
            recommendations: [
                "Aim for 30 minutes of moderate exercise daily, such as brisk walking or swimming",
                "Practice stress-reduction techniques like deep breathing or meditation for 10 minutes daily",
                "Maintain a consistent sleep schedule with 7-9 hours of quality sleep each night",
                "Stay hydrated by drinking at least 8 glasses of water throughout the day",
                "Include fiber-rich foods in each meal to help stabilize blood sugar levels"
            ],
            categories: ['physical_activity', 'stress_management', 'sleep_hygiene'],
            generatedAt: new Date().toISOString()
        };
    }

    // Motivational support for low adherence (Requirement 3.8)
    async generateMotivationalSupport(adherenceData, culturalPreferences) {
        try {
            const adherencePercentage = this.calculateOverallAdherence(adherenceData);
            
            if (adherencePercentage < 60 && this.aiService && await this.aiService.isAvailable()) {
                const motivationalMessage = await this.aiService.getMotivationalMessage([
                    { type: 'nutrition_challenge', value: adherencePercentage },
                    { type: 'cultural_preference', value: culturalPreferences.cuisine }
                ]);

                return {
                    message: motivationalMessage,
                    alternatives: await this.generateCulturalAlternatives(culturalPreferences),
                    aiGenerated: true
                };
            } else {
                return this.getFallbackMotivationalSupport(adherencePercentage);
            }
        } catch (error) {
            console.error('Error generating motivational support:', error);
            return this.getFallbackMotivationalSupport(adherencePercentage);
        }
    }

    getFallbackMotivationalSupport(adherencePercentage) {
        const messages = {
            low: "Every small step counts! Remember that building healthy habits takes time. Focus on one meal at a time.",
            medium: "You're making good progress! Keep up the momentum and remember that consistency is key.",
            high: "Excellent work! Your dedication to healthy eating is paying off. Keep up the great habits!"
        };

        const level = adherencePercentage < 40 ? 'low' : adherencePercentage < 70 ? 'medium' : 'high';
        
        return {
            message: messages[level],
            alternatives: [],
            aiGenerated: false
        };
    }

    async generateCulturalAlternatives(culturalPreferences) {
        // Generate culturally appropriate alternative meal suggestions
        const cuisine = culturalPreferences.cuisine || 'general';
        const alternatives = this.culturalCuisines[cuisine]?.commonIngredients || [];
        
        return alternatives.slice(0, 3).map(ingredient => 
            `Try incorporating ${ingredient} into your meals for authentic ${this.culturalCuisines[cuisine]?.name} flavors`
        );
    }

    // Enhanced adherence tracking with percentage calculations (Requirement 3.5)
    async logMealAdherence(planId, day, mealType, adherencePercentage, notes = '') {
        try {
            const adherenceData = {
                completed: adherencePercentage > 0,
                adherencePercentage: Math.max(0, Math.min(100, adherencePercentage)),
                notes: notes,
                loggedAt: new Date().toISOString()
            };

            await this.updateMealAdherence(planId, day, mealType, adherenceData);
            
            // Update overall plan adherence
            const allAdherence = await this.getMealAdherence(planId);
            const overallAdherence = this.calculateOverallAdherence(allAdherence);
            
            // Store adherence progress for analytics
            if (this.currentUserId && this.database) {
                await this.database.saveProgress(
                    this.currentUserId, 
                    'nutrition_adherence', 
                    overallAdherence,
                    new Date().toISOString().split('T')[0]
                );
            }

            return {
                success: true,
                adherenceData: adherenceData,
                overallAdherence: overallAdherence
            };
        } catch (error) {
            console.error('Error logging meal adherence:', error);
            throw error;
        }
    }

    // Enhanced adherence analytics with trend visualization (Requirement 3.6)
    async getAdherenceAnalytics(planId, days = 7) {
        try {
            const adherenceData = await this.getMealAdherence(planId);
            const progressData = this.currentUserId && this.database ? 
                await this.database.getUserProgress(this.currentUserId, 'nutrition_adherence', days) : [];

            const analytics = {
                currentAdherence: this.calculateOverallAdherence(adherenceData),
                dailyBreakdown: this.calculateDailyAdherence(adherenceData),
                weeklyTrend: this.calculateWeeklyTrend(progressData),
                mealTypeBreakdown: this.calculateMealTypeAdherence(adherenceData),
                insights: this.generateAdherenceInsights(adherenceData, progressData)
            };

            return analytics;
        } catch (error) {
            console.error('Error getting adherence analytics:', error);
            return {
                currentAdherence: 0,
                dailyBreakdown: {},
                weeklyTrend: [],
                mealTypeBreakdown: {},
                insights: []
            };
        }
    }

    calculateDailyAdherence(adherenceData) {
        const dailyBreakdown = {};
        
        Object.keys(adherenceData).forEach(dayKey => {
            const dayNumber = dayKey.replace('day', '');
            const dayData = adherenceData[dayKey];
            
            let dayCompleted = 0;
            let dayTotal = 0;
            let totalPercentage = 0;
            
            Object.values(dayData).forEach(meal => {
                dayTotal++;
                totalPercentage += meal.adherencePercentage || 0;
                if (meal.completed) {
                    dayCompleted++;
                }
            });
            
            dailyBreakdown[dayNumber] = {
                completionRate: dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0,
                averageAdherence: dayTotal > 0 ? Math.round(totalPercentage / dayTotal) : 0,
                mealsCompleted: dayCompleted,
                totalMeals: dayTotal
            };
        });
        
        return dailyBreakdown;
    }

    calculateWeeklyTrend(progressData) {
        return progressData.map(entry => ({
            date: entry.date,
            adherence: entry.value,
            timestamp: new Date(entry.date).getTime()
        })).sort((a, b) => a.timestamp - b.timestamp);
    }

    calculateMealTypeAdherence(adherenceData) {
        const mealTypes = {};
        
        Object.values(adherenceData).forEach(day => {
            Object.entries(day).forEach(([mealType, mealData]) => {
                if (!mealTypes[mealType]) {
                    mealTypes[mealType] = {
                        completed: 0,
                        total: 0,
                        totalPercentage: 0
                    };
                }
                
                mealTypes[mealType].total++;
                mealTypes[mealType].totalPercentage += mealData.adherencePercentage || 0;
                
                if (mealData.completed) {
                    mealTypes[mealType].completed++;
                }
            });
        });
        
        Object.keys(mealTypes).forEach(mealType => {
            const data = mealTypes[mealType];
            mealTypes[mealType] = {
                ...data,
                completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
                averageAdherence: data.total > 0 ? Math.round(data.totalPercentage / data.total) : 0
            };
        });
        
        return mealTypes;
    }

    generateAdherenceInsights(adherenceData, progressData) {
        const insights = [];
        const overallAdherence = this.calculateOverallAdherence(adherenceData);
        const dailyBreakdown = this.calculateDailyAdherence(adherenceData);
        
        // Overall performance insight
        if (overallAdherence >= 80) {
            insights.push({
                type: 'success',
                message: 'Excellent adherence! You\'re consistently following your meal plan.',
                icon: '🌟'
            });
        } else if (overallAdherence >= 60) {
            insights.push({
                type: 'warning',
                message: 'Good progress! Try to improve consistency for better results.',
                icon: '📈'
            });
        } else {
            insights.push({
                type: 'info',
                message: 'Focus on small improvements. Every meal counts towards your health goals.',
                icon: '💪'
            });
        }
        
        // Daily pattern insights
        const dailyValues = Object.values(dailyBreakdown);
        if (dailyValues.length > 0) {
            const bestDay = dailyValues.reduce((best, current) => 
                current.completionRate > best.completionRate ? current : best
            );
            const worstDay = dailyValues.reduce((worst, current) => 
                current.completionRate < worst.completionRate ? current : worst
            );
            
            if (bestDay.completionRate - worstDay.completionRate > 30) {
                insights.push({
                    type: 'tip',
                    message: 'Your adherence varies significantly between days. Try to maintain consistency.',
                    icon: '📅'
                });
            }
        }
        
        // Trend insights
        if (progressData.length >= 3) {
            const recent = progressData.slice(-3);
            const isImproving = recent[2].value > recent[0].value;
            
            if (isImproving) {
                insights.push({
                    type: 'success',
                    message: 'Great trend! Your adherence is improving over time.',
                    icon: '📊'
                });
            }
        }
        
        return insights;
    }

    // Enhanced AI-powered lifestyle recommendations (Requirement 3.7)
    async generatePersonalizedLifestyleTips(userProfile, adherenceData, healthMetrics = {}) {
        try {
            const adherencePercentage = this.calculateOverallAdherence(adherenceData);
            const analytics = await this.getAdherenceAnalytics(userProfile.currentPlanId || 'current');
            
            const context = {
                adherencePercentage,
                cuisine: userProfile.preferredCuisine || 'general',
                dietaryRestrictions: userProfile.dietaryRestrictions || [],
                mealTypeBreakdown: analytics.mealTypeBreakdown,
                recentTrend: analytics.weeklyTrend.slice(-7),
                healthGoals: userProfile.healthGoals || ['diabetes_prevention'],
                currentChallenges: this.identifyAdherenceChallenges(analytics)
            };

            if (this.aiService && await this.aiService.isAvailable()) {
                const aiRecommendations = await this.aiService.getPersonalizedRecommendations({
                    ...userProfile,
                    nutritionAdherence: adherencePercentage,
                    adherenceAnalytics: analytics,
                    focus: 'lifestyle_nutrition'
                });

                return {
                    aiGenerated: true,
                    recommendations: this.parseAILifestyleRecommendations(aiRecommendations),
                    categories: ['nutrition', 'physical_activity', 'stress_management', 'sleep_hygiene'],
                    personalizedFor: context,
                    generatedAt: new Date().toISOString()
                };
            } else {
                return this.getFallbackPersonalizedLifestyleTips(context);
            }
        } catch (error) {
            console.error('Error generating personalized lifestyle tips:', error);
            return this.getFallbackPersonalizedLifestyleTips({});
        }
    }

    parseAILifestyleRecommendations(aiResponse) {
        if (typeof aiResponse === 'string') {
            // Parse string response into structured recommendations
            const lines = aiResponse.split('\n').filter(line => line.trim());
            const recommendations = [];
            
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                    recommendations.push({
                        text: trimmed.replace(/^[-•*]\s*/, ''),
                        category: this.categorizeRecommendation(trimmed)
                    });
                } else if (trimmed.length > 20 && !trimmed.includes(':')) {
                    recommendations.push({
                        text: trimmed,
                        category: this.categorizeRecommendation(trimmed)
                    });
                }
            });
            
            return recommendations.length > 0 ? recommendations : [{ text: aiResponse, category: 'general' }];
        }
        
        return Array.isArray(aiResponse) ? aiResponse : [{ text: aiResponse, category: 'general' }];
    }

    categorizeRecommendation(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('exercise') || lowerText.includes('activity') || lowerText.includes('walk')) {
            return 'physical_activity';
        }
        if (lowerText.includes('stress') || lowerText.includes('relax') || lowerText.includes('meditation')) {
            return 'stress_management';
        }
        if (lowerText.includes('sleep') || lowerText.includes('rest') || lowerText.includes('bedtime')) {
            return 'sleep_hygiene';
        }
        if (lowerText.includes('meal') || lowerText.includes('food') || lowerText.includes('nutrition')) {
            return 'nutrition';
        }
        
        return 'general';
    }

    identifyAdherenceChallenges(analytics) {
        const challenges = [];
        
        // Identify meal type challenges
        Object.entries(analytics.mealTypeBreakdown).forEach(([mealType, data]) => {
            if (data.completionRate < 50) {
                challenges.push(`low_${mealType}_adherence`);
            }
        });
        
        // Identify consistency challenges
        const dailyValues = Object.values(analytics.dailyBreakdown);
        if (dailyValues.length > 0) {
            const variance = this.calculateVariance(dailyValues.map(d => d.completionRate));
            if (variance > 400) { // High variance in daily adherence
                challenges.push('inconsistent_daily_adherence');
            }
        }
        
        // Identify trend challenges
        if (analytics.weeklyTrend.length >= 3) {
            const recent = analytics.weeklyTrend.slice(-3);
            const isDecreasing = recent[2].adherence < recent[0].adherence;
            if (isDecreasing) {
                challenges.push('declining_adherence_trend');
            }
        }
        
        return challenges;
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }

    getFallbackPersonalizedLifestyleTips(context) {
        const tips = [];
        
        // Adherence-based tips
        if (context.adherencePercentage < 60) {
            tips.push({
                text: "Start with small changes - focus on completing just one meal per day consistently",
                category: 'nutrition'
            });
            tips.push({
                text: "Prepare meals in advance to reduce daily decision fatigue",
                category: 'nutrition'
            });
        } else if (context.adherencePercentage < 80) {
            tips.push({
                text: "You're doing well! Try meal prepping on weekends to maintain consistency",
                category: 'nutrition'
            });
        } else {
            tips.push({
                text: "Excellent adherence! Consider exploring new recipes within your dietary preferences",
                category: 'nutrition'
            });
        }
        
        // General lifestyle tips
        tips.push({
            text: "Aim for 30 minutes of moderate exercise daily, such as brisk walking",
            category: 'physical_activity'
        });
        tips.push({
            text: "Practice stress-reduction techniques like deep breathing for 10 minutes daily",
            category: 'stress_management'
        });
        tips.push({
            text: "Maintain a consistent sleep schedule with 7-9 hours of quality sleep",
            category: 'sleep_hygiene'
        });
        
        return {
            aiGenerated: false,
            recommendations: tips,
            categories: ['nutrition', 'physical_activity', 'stress_management', 'sleep_hygiene'],
            personalizedFor: context,
            generatedAt: new Date().toISOString()
        };
    }

    // Enhanced motivational support for low adherence (Requirement 3.8)
    async generateEnhancedMotivationalSupport(adherenceData, culturalPreferences, userProfile = {}) {
        try {
            const adherencePercentage = this.calculateOverallAdherence(adherenceData);
            const analytics = await this.getAdherenceAnalytics(userProfile.currentPlanId || 'current');
            
            const context = {
                adherencePercentage,
                challenges: this.identifyAdherenceChallenges(analytics),
                cuisine: culturalPreferences.cuisine || 'general',
                recentProgress: analytics.weeklyTrend.slice(-3),
                personalGoals: userProfile.healthGoals || ['diabetes_prevention']
            };

            if (adherencePercentage < 70 && this.aiService && await this.aiService.isAvailable()) {
                const motivationalContent = await this.aiService.getMotivationalMessage([
                    { type: 'nutrition_challenge', value: adherencePercentage },
                    { type: 'cultural_preference', value: culturalPreferences.cuisine },
                    { type: 'health_goals', value: context.personalGoals },
                    { type: 'specific_challenges', value: context.challenges }
                ]);

                return {
                    message: motivationalContent,
                    alternatives: await this.generateCulturalAlternatives(culturalPreferences),
                    actionableTips: this.generateActionableTips(context),
                    encouragement: this.generateEncouragement(adherencePercentage),
                    aiGenerated: true,
                    personalizedFor: context
                };
            } else {
                return this.getFallbackEnhancedMotivationalSupport(adherencePercentage, context);
            }
        } catch (error) {
            console.error('Error generating enhanced motivational support:', error);
            return this.getFallbackEnhancedMotivationalSupport(adherencePercentage, {});
        }
    }

    generateActionableTips(context) {
        const tips = [];
        
        // Challenge-specific tips
        if (context.challenges.includes('low_breakfast_adherence')) {
            tips.push("Try preparing overnight oats or smoothie ingredients the night before");
        }
        if (context.challenges.includes('low_dinner_adherence')) {
            tips.push("Use a slow cooker or meal prep on weekends for easy dinner solutions");
        }
        if (context.challenges.includes('inconsistent_daily_adherence')) {
            tips.push("Set daily reminders and track your meals in a food diary");
        }
        if (context.challenges.includes('declining_adherence_trend')) {
            tips.push("Identify what changed recently and adjust your meal planning approach");
        }
        
        // General actionable tips
        if (tips.length === 0) {
            tips.push("Start with one meal per day and gradually build the habit");
            tips.push("Keep healthy snacks readily available for busy days");
        }
        
        return tips;
    }

    generateEncouragement(adherencePercentage) {
        if (adherencePercentage < 30) {
            return "Every journey starts with a single step. You're taking control of your health, and that's what matters most.";
        } else if (adherencePercentage < 50) {
            return "You're building momentum! Each healthy choice you make is an investment in your future well-being.";
        } else if (adherencePercentage < 70) {
            return "You're doing great! You've already established some healthy patterns - now let's build on that success.";
        } else {
            return "Excellent work! Your commitment to healthy eating is truly paying off. Keep up the fantastic progress!";
        }
    }

    getFallbackEnhancedMotivationalSupport(adherencePercentage, context) {
        const messages = {
            low: "Remember, building healthy habits takes time. Focus on progress, not perfection. Every healthy meal choice matters!",
            medium: "You're making steady progress! Your dedication to better health is showing. Keep building on these positive changes.",
            high: "Outstanding commitment! Your consistent healthy eating habits are setting you up for long-term success."
        };

        const level = adherencePercentage < 40 ? 'low' : adherencePercentage < 70 ? 'medium' : 'high';
        
        return {
            message: messages[level],
            alternatives: [],
            actionableTips: this.generateActionableTips(context),
            encouragement: this.generateEncouragement(adherencePercentage),
            aiGenerated: false,
            personalizedFor: context
        };
    }

    // Utility methods for enhanced functionality
    getSupportedCuisines() {
        return Object.entries(this.culturalCuisines).map(([key, cuisine]) => ({
            value: key,
            label: cuisine.name,
            characteristics: cuisine.characteristics
        }));
    }

    getSupportedDietaryRestrictions() {
        return Object.entries(this.dietaryRestrictions).map(([key, restriction]) => ({
            value: key,
            label: restriction.name,
            excludes: restriction.excludes,
            includes: restriction.includes
        }));
    }lternatives.slice(0, 3).map(ingredient => 
            `Try incorporating ${ingredient} into your meals for authentic ${this.culturalCuisines[cuisine]?.name} flavors`
        );
    }

    // Utility methods
    generateMealPlanId() {
        return 'mp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }

    getSupportedCuisines() {
        return Object.keys(this.culturalCuisines).map(key => ({
            value: key,
            label: this.culturalCuisines[key].name,
            characteristics: this.culturalCuisines[key].characteristics
        }));
    }

    getSupportedDietaryRestrictions() {
        return Object.keys(this.dietaryRestrictions).map(key => ({
            value: key,
            label: this.dietaryRestrictions[key].name,
            description: `Excludes: ${this.dietaryRestrictions[key].excludes.join(', ')}`
        }));
    }
}

// Initialize nutrition service
window.nutritionService = new NutritionService();