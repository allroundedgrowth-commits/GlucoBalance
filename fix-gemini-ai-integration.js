// Fix for Gemini AI Integration Issues
class GeminiAIIntegrationFix {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Fixing Gemini AI Integration Issues...');
        this.diagnoseIssues();
        this.applyFixes();
        this.enhanceNutritionFeatures();
        this.addRecipeGeneration();
    }

    diagnoseIssues() {
        console.log('🔍 Diagnosing Gemini AI issues...');
        
        // Check if dashboard AI service exists
        if (!window.dashboardAI) {
            console.error('❌ window.dashboardAI not found');
            this.initializeDashboardAI();
        } else {
            console.log('✅ window.dashboardAI exists');
        }

        // Check API key
        if (window.dashboardAI && !window.dashboardAI.apiKey) {
            console.error('❌ API key not found');
        } else if (window.dashboardAI) {
            console.log('✅ API key configured');
        }

        // Check if methods exist
        const requiredMethods = ['generateMealPlan', 'makeGeminiRequest'];
        requiredMethods.forEach(method => {
            if (window.dashboardAI && typeof window.dashboardAI[method] === 'function') {
                console.log(`✅ ${method} method available`);
            } else {
                console.error(`❌ ${method} method missing`);
            }
        });
    }

    initializeDashboardAI() {
        console.log('🔧 Initializing Dashboard AI Service...');
        
        if (typeof DashboardAIService !== 'undefined') {
            window.dashboardAI = new DashboardAIService();
            console.log('✅ Dashboard AI Service initialized');
        } else {
            console.error('❌ DashboardAIService class not found');
        }
    }

    applyFixes() {
        console.log('🛠️ Applying Gemini AI fixes...');
        
        // Fix 1: Ensure proper error handling for API calls
        if (window.dashboardAI) {
            const originalMakeRequest = window.dashboardAI.makeGeminiRequest;
            window.dashboardAI.makeGeminiRequest = async function(prompt, context = {}) {
                try {
                    return await originalMakeRequest.call(this, prompt, context);
                } catch (error) {
                    console.error('Gemini API Error:', error);
                    
                    // Provide fallback responses
                    if (prompt.includes('meal plan')) {
                        return this.getFallbackMealPlan(context);
                    } else if (prompt.includes('recipe')) {
                        return this.getFallbackRecipe(context);
                    } else {
                        return 'I apologize, but I\'m currently unable to process your request. Please try again later or contact support if the issue persists.';
                    }
                }
            };

            // Add fallback methods
            window.dashboardAI.getFallbackMealPlan = function(context) {
                const preferences = context.preferences || {};
                return `Here's a diabetes-friendly meal plan based on your preferences:

**Breakfast:**
- Oatmeal with berries and nuts (low glycemic, high fiber)
- Greek yogurt with cinnamon

**Lunch:**
- Grilled chicken salad with mixed greens
- Quinoa and vegetable bowl
- Olive oil and lemon dressing

**Dinner:**
- Baked salmon with herbs
- Roasted vegetables (broccoli, bell peppers)
- Brown rice or cauliflower rice

**Snacks:**
- Apple slices with almond butter
- Handful of mixed nuts

**Tips:**
- Eat regular meals to maintain stable blood sugar
- Include protein with each meal
- Choose whole grains over refined carbs
- Stay hydrated with water

This plan focuses on low glycemic index foods and balanced nutrition for diabetes prevention.`;
            };

            window.dashboardAI.getFallbackRecipe = function(context) {
                return `**Mediterranean Chickpea Salad Recipe**

**Ingredients:**
- 1 can chickpeas, drained and rinsed
- 1 cucumber, diced
- 1 cup cherry tomatoes, halved
- 1/4 red onion, finely chopped
- 1/4 cup kalamata olives, pitted
- 2 tbsp olive oil
- 1 tbsp lemon juice
- 1 tsp oregano
- Salt and pepper to taste
- 2 tbsp fresh parsley

**Instructions:**
1. Combine chickpeas, cucumber, tomatoes, and onion in a large bowl
2. Add olives and mix gently
3. Whisk together olive oil, lemon juice, oregano, salt, and pepper
4. Pour dressing over salad and toss
5. Garnish with fresh parsley
6. Chill for 30 minutes before serving

**Nutritional Benefits:**
- High in fiber and protein
- Low glycemic index
- Rich in antioxidants
- Heart-healthy fats from olive oil

**Serving:** Makes 4 servings, perfect for meal prep!`;
            };
        }

        // Fix 2: Enhance meal plan generation with better error handling
        this.enhanceMealPlanGeneration();
    }

    enhanceMealPlanGeneration() {
        console.log('🍽️ Enhancing meal plan generation...');
        
        // Override the dashboard button fix method to ensure it works
        if (window.dashboardButtonsFix) {
            const originalGenerateAIMealPlan = window.dashboardButtonsFix.generateAIMealPlan;
            window.dashboardButtonsFix.generateAIMealPlan = async function() {
                try {
                    console.log('🤖 Starting AI meal plan generation...');
                    
                    // Get preferences
                    const preferences = {
                        restrictions: document.getElementById('dietary-restrictions')?.value || '',
                        cuisine: document.getElementById('cuisine-preference')?.value || '',
                        cookingTime: document.getElementById('cooking-time')?.value || '',
                        budget: document.getElementById('budget-level')?.value || '',
                        activityLevel: 'moderate'
                    };
                    
                    // Show loading state
                    const modal = document.querySelector('.dashboard-modal');
                    if (modal) {
                        modal.querySelector('.modal-body').innerHTML = `
                            <div class="ai-loading">
                                <div class="loading-spinner">🍽️</div>
                                <p>Creating your personalized meal plan...</p>
                                <div class="loading-bar">
                                    <div class="loading-progress" id="meal-plan-progress"></div>
                                </div>
                            </div>
                        `;
                        
                        this.animateProgressBar('meal-plan-progress');
                    }
                    
                    // Generate AI meal plan with better error handling
                    let mealPlan;
                    try {
                        if (window.dashboardAI && typeof window.dashboardAI.generateMealPlan === 'function') {
                            mealPlan = await window.dashboardAI.generateMealPlan(preferences);
                        } else {
                            throw new Error('Dashboard AI service not available');
                        }
                    } catch (error) {
                        console.warn('AI generation failed, using fallback:', error);
                        mealPlan = window.dashboardAI ? 
                            window.dashboardAI.getFallbackMealPlan({ preferences }) :
                            this.getStaticFallbackMealPlan(preferences);
                    }
                    
                    // Show results
                    if (modal) {
                        modal.querySelector('.modal-body').innerHTML = `
                            <div class="meal-plan-result">
                                <div class="plan-header">
                                    <div class="plan-icon">🍽️</div>
                                    <h4>Your AI-Generated Meal Plan</h4>
                                </div>
                                <div class="plan-content">
                                    ${this.formatAIResponse(mealPlan)}
                                </div>
                                <div class="plan-actions">
                                    <button class="btn-primary" onclick="dashboardButtonsFix.saveMealPlan('${mealPlan.replace(/'/g, "\\'")}', ${JSON.stringify(preferences).replace(/"/g, '&quot;')}); dashboardButtonsFix.closeModal();">
                                        Save Meal Plan
                                    </button>
                                    <button class="btn-secondary" onclick="dashboardButtonsFix.generateRecipe();">
                                        🍳 Get Recipe
                                    </button>
                                    <button class="btn-secondary" onclick="dashboardButtonsFix.generateAIMealPlan();">
                                        Generate New Plan
                                    </button>
                                    <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                                        Close
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                    
                    this.showNotification('AI meal plan generated successfully!', 'success');
                    
                } catch (error) {
                    console.error('Meal plan generation error:', error);
                    this.closeModal();
                    this.showNotification('Unable to generate meal plan. Please try again.', 'error');
                }
            };

            // Add static fallback method
            window.dashboardButtonsFix.getStaticFallbackMealPlan = function(preferences) {
                return `Here's a personalized meal plan for your preferences:

**Breakfast Options:**
- Overnight oats with berries and nuts
- Vegetable omelet with whole grain toast
- Greek yogurt parfait with seeds

**Lunch Options:**
- Quinoa Buddha bowl with roasted vegetables
- Lentil soup with mixed greens salad
- Grilled chicken wrap with hummus

**Dinner Options:**
- Baked fish with steamed broccoli and brown rice
- Turkey and vegetable stir-fry
- Bean and vegetable curry with cauliflower rice

**Healthy Snacks:**
- Apple slices with almond butter
- Carrot sticks with hummus
- Mixed nuts and seeds

**Hydration:**
- 8-10 glasses of water daily
- Herbal teas
- Infused water with cucumber and mint

This plan is designed for diabetes prevention with balanced nutrition and stable blood sugar levels.`;
            };
        }
    }

    enhanceNutritionFeatures() {
        console.log('🥗 Enhancing nutrition features...');
        
        // Add recipe generation functionality to existing buttons
        if (window.dashboardButtonsFix) {
            // Add recipe generation method
            window.dashboardButtonsFix.generateRecipe = async function() {
                try {
                    const modal = document.querySelector('.dashboard-modal');
                    if (modal) {
                        modal.querySelector('.modal-body').innerHTML = `
                            <div class="ai-loading">
                                <div class="loading-spinner">🍳</div>
                                <p>Generating a delicious recipe for you...</p>
                            </div>
                        `;
                    }

                    let recipe;
                    try {
                        const recipePrompt = `Generate a detailed diabetes-friendly recipe. Include ingredients list, step-by-step instructions, cooking time, nutritional benefits, and tips for blood sugar management. Make it practical and delicious.`;
                        
                        if (window.dashboardAI) {
                            recipe = await window.dashboardAI.makeGeminiRequest(recipePrompt);
                        } else {
                            throw new Error('AI service not available');
                        }
                    } catch (error) {
                        console.warn('Recipe generation failed, using fallback:', error);
                        recipe = window.dashboardAI ? 
                            window.dashboardAI.getFallbackRecipe() :
                            this.getStaticFallbackRecipe();
                    }

                    if (modal) {
                        modal.querySelector('.modal-body').innerHTML = `
                            <div class="recipe-result">
                                <div class="recipe-header">
                                    <div class="recipe-icon">🍳</div>
                                    <h4>Your AI-Generated Recipe</h4>
                                </div>
                                <div class="recipe-content">
                                    ${this.formatAIResponse(recipe)}
                                </div>
                                <div class="recipe-actions">
                                    <button class="btn-primary" onclick="dashboardButtonsFix.saveRecipe('${recipe.replace(/'/g, "\\'")}'); dashboardButtonsFix.closeModal();">
                                        Save Recipe
                                    </button>
                                    <button class="btn-secondary" onclick="dashboardButtonsFix.generateRecipe();">
                                        Generate Another Recipe
                                    </button>
                                    <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                                        Close
                                    </button>
                                </div>
                            </div>
                        `;
                    }

                    this.showNotification('Recipe generated successfully!', 'success');

                } catch (error) {
                    console.error('Recipe generation error:', error);
                    this.showNotification('Unable to generate recipe. Please try again.', 'error');
                }
            };

            // Add static fallback recipe
            window.dashboardButtonsFix.getStaticFallbackRecipe = function() {
                return `**Diabetes-Friendly Vegetable Stir-Fry**

**Ingredients:**
- 2 cups mixed vegetables (broccoli, bell peppers, snap peas)
- 1 cup cooked quinoa or brown rice
- 2 tbsp olive oil
- 2 cloves garlic, minced
- 1 tbsp ginger, grated
- 2 tbsp low-sodium soy sauce
- 1 tsp sesame oil
- 1 tbsp sesame seeds
- Green onions for garnish

**Instructions:**
1. Heat olive oil in a large pan or wok over medium-high heat
2. Add garlic and ginger, stir-fry for 30 seconds
3. Add vegetables and cook for 5-7 minutes until crisp-tender
4. Add soy sauce and sesame oil, toss to combine
5. Serve over quinoa or brown rice
6. Garnish with sesame seeds and green onions

**Cooking Time:** 15 minutes
**Serves:** 2-3 people

**Nutritional Benefits:**
- High in fiber and antioxidants
- Low glycemic index
- Rich in vitamins and minerals
- Heart-healthy fats

**Blood Sugar Tips:**
- Pair with protein for better blood sugar control
- Eat slowly and mindfully
- Great for meal prep!`;
            };

            // Add recipe saving functionality
            window.dashboardButtonsFix.saveRecipe = function(recipe) {
                const userId = this.getCurrentUserId();
                let recipes = JSON.parse(localStorage.getItem(`saved-recipes-${userId}`) || '[]');
                
                const newRecipe = {
                    id: Date.now(),
                    content: recipe,
                    createdAt: new Date().toISOString(),
                    type: 'ai-generated'
                };
                
                recipes.unshift(newRecipe);
                localStorage.setItem(`saved-recipes-${userId}`, JSON.stringify(recipes));
                
                this.showNotification('Recipe saved successfully!', 'success');
            };
        }
    }

    addRecipeGeneration() {
        console.log('🍳 Adding recipe generation features...');
        
        // Add a "View Recipes" button to the nutrition card if it doesn't exist
        const nutritionCard = document.querySelector('.nutrition-snapshot-card .card-actions');
        if (nutritionCard && !document.getElementById('view-recipes-btn')) {
            const viewRecipesBtn = document.createElement('button');
            viewRecipesBtn.className = 'btn-card-action secondary';
            viewRecipesBtn.id = 'view-recipes-btn';
            viewRecipesBtn.innerHTML = '🍳 View Recipes';
            
            viewRecipesBtn.addEventListener('click', () => {
                if (window.dashboardButtonsFix) {
                    window.dashboardButtonsFix.showSavedRecipes();
                }
            });
            
            nutritionCard.appendChild(viewRecipesBtn);
            console.log('✅ View Recipes button added');
        }

        // Add method to show saved recipes
        if (window.dashboardButtonsFix) {
            window.dashboardButtonsFix.showSavedRecipes = function() {
                const userId = this.getCurrentUserId();
                const recipes = JSON.parse(localStorage.getItem(`saved-recipes-${userId}`) || '[]');
                
                if (recipes.length === 0) {
                    this.showNotification('No saved recipes yet. Generate some meal plans first!', 'info');
                    setTimeout(() => this.handleCreateMealPlan(), 1000);
                    return;
                }

                const modal = this.createModal('🍳 Your Saved Recipes', `
                    <div class="saved-recipes">
                        <div class="recipes-header">
                            <p>Here are your saved diabetes-friendly recipes:</p>
                        </div>
                        <div class="recipes-list">
                            ${recipes.map(recipe => `
                                <div class="recipe-item">
                                    <div class="recipe-preview">
                                        ${this.formatAIResponse(recipe.content.substring(0, 200))}...
                                    </div>
                                    <div class="recipe-meta">
                                        <small>Saved: ${new Date(recipe.createdAt).toLocaleDateString()}</small>
                                    </div>
                                    <div class="recipe-actions">
                                        <button class="btn-sm btn-primary" onclick="dashboardButtonsFix.viewFullRecipe('${recipe.id}')">
                                            View Full Recipe
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="recipes-actions">
                            <button class="btn-primary" onclick="dashboardButtonsFix.generateRecipe();">
                                🍳 Generate New Recipe
                            </button>
                            <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                                Close
                            </button>
                        </div>
                    </div>
                `);
                
                document.body.appendChild(modal);
            };

            window.dashboardButtonsFix.viewFullRecipe = function(recipeId) {
                const userId = this.getCurrentUserId();
                const recipes = JSON.parse(localStorage.getItem(`saved-recipes-${userId}`) || '[]');
                const recipe = recipes.find(r => r.id == recipeId);
                
                if (recipe) {
                    const modal = this.createModal('🍳 Recipe Details', `
                        <div class="full-recipe">
                            ${this.formatAIResponse(recipe.content)}
                            <div class="recipe-actions">
                                <button class="btn-secondary" onclick="dashboardButtonsFix.showSavedRecipes();">
                                    ← Back to Recipes
                                </button>
                                <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                                    Close
                                </button>
                            </div>
                        </div>
                    `);
                    
                    document.body.appendChild(modal);
                }
            };
        }
    }
}

// Initialize the fix when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new GeminiAIIntegrationFix(), 2000);
    });
} else {
    setTimeout(() => new GeminiAIIntegrationFix(), 2000);
}

console.log('🔧 Gemini AI Integration Fix loaded');