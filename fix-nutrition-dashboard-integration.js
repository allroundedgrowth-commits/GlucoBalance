// Fix Nutrition Dashboard Integration
// This script fixes the three main issues with the nutrition feature on the dashboard:
// 1. Create meal plan using Gemini AI
// 2. View recipes from the dashboard  
// 3. View plans from the dashboard

class NutritionDashboardFix {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Initializing Nutrition Dashboard Fix...');
        this.waitForServices().then(() => {
            this.fixNutritionButtons();
            this.setupNutritionIntegration();
            console.log('✅ Nutrition Dashboard Fix completed');
        });
    }

    async waitForServices() {
        let attempts = 0;
        while ((!window.nutritionService || !window.nutritionUI) && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (!window.nutritionService) {
            console.error('❌ Nutrition Service not available');
            throw new Error('Nutrition Service not available');
        }
        
        if (!window.nutritionUI) {
            console.error('❌ Nutrition UI not available');
            throw new Error('Nutrition UI not available');
        }
        
        // Set current user for nutrition service
        const currentUser = this.getCurrentUserId();
        if (currentUser) {
            window.nutritionService.setCurrentUser(currentUser);
        }
        
        console.log('✅ Nutrition services ready');
    }

    getCurrentUserId() {
        // Try to get user ID from various sources
        if (window.auth && window.auth.currentUser) {
            return window.auth.currentUser.id;
        }
        
        // Fallback to localStorage
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userData.id) {
            return userData.id;
        }
        
        // Generate a session user ID if none exists
        let sessionUserId = localStorage.getItem('sessionUserId');
        if (!sessionUserId) {
            sessionUserId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionUserId', sessionUserId);
        }
        
        return sessionUserId;
    }

    fixNutritionButtons() {
        console.log('🔧 Fixing nutrition buttons...');
        
        // Fix Create Meal Plan button
        const createMealPlanBtn = document.getElementById('create-meal-plan-btn');
        if (createMealPlanBtn) {
            // Remove existing event listeners
            createMealPlanBtn.replaceWith(createMealPlanBtn.cloneNode(true));
            const newCreateBtn = document.getElementById('create-meal-plan-btn');
            
            newCreateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCreateMealPlan();
            });
            console.log('✅ Create Meal Plan button fixed');
        }

        // Fix View Nutrition button
        const viewNutritionBtn = document.getElementById('view-nutrition-btn');
        if (viewNutritionBtn) {
            // Remove existing event listeners
            viewNutritionBtn.replaceWith(viewNutritionBtn.cloneNode(true));
            const newViewBtn = document.getElementById('view-nutrition-btn');
            
            newViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleViewPlans();
            });
            console.log('✅ View Nutrition button fixed');
        }

        // Add View Recipes button if it doesn't exist
        this.addViewRecipesButton();
    }

    addViewRecipesButton() {
        // Check if we need to add a View Recipes button
        const nutritionCard = document.querySelector('.card[data-feature="nutrition"]') || 
                             document.querySelector('.nutrition-card') ||
                             document.querySelector('#create-meal-plan-btn')?.closest('.card');
        
        if (nutritionCard && !document.getElementById('view-recipes-btn')) {
            const actionsContainer = nutritionCard.querySelector('.card-actions') || 
                                   nutritionCard.querySelector('.quick-actions') ||
                                   nutritionCard.querySelector('.nutrition-actions');
            
            if (actionsContainer) {
                const viewRecipesBtn = document.createElement('button');
                viewRecipesBtn.id = 'view-recipes-btn';
                viewRecipesBtn.className = 'btn-secondary';
                viewRecipesBtn.innerHTML = '<span class="icon">📖</span> View Recipes';
                
                viewRecipesBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleViewRecipes();
                });
                
                actionsContainer.appendChild(viewRecipesBtn);
                console.log('✅ View Recipes button added');
            }
        }
    }

    setupNutritionIntegration() {
        // Override dashboard button fix methods if they exist
        if (window.dashboardButtonsFix) {
            window.dashboardButtonsFix.handleCreateMealPlan = () => this.handleCreateMealPlan();
            window.dashboardButtonsFix.handleViewNutrition = () => this.handleViewPlans();
            console.log('✅ Dashboard button fix methods overridden');
        }

        // Override enhanced dashboard methods if they exist
        if (window.enhancedDashboardRedesign) {
            window.enhancedDashboardRedesign.createMealPlan = () => this.handleCreateMealPlan();
            window.enhancedDashboardRedesign.viewNutritionPlans = () => this.handleViewPlans();
            console.log('✅ Enhanced dashboard methods overridden');
        }
    }

    async handleCreateMealPlan() {
        console.log('🍽️ Creating meal plan with Gemini AI...');
        
        try {
            // Show preferences modal
            this.showMealPlanPreferencesModal();
        } catch (error) {
            console.error('Error showing meal plan preferences:', error);
            this.showNotification('Unable to open meal planner. Please try again.', 'error');
        }
    }

    showMealPlanPreferencesModal() {
        const modal = this.createModal('🤖 AI Meal Plan Generator', `
            <div class="meal-plan-preferences">
                <div class="preferences-header">
                    <h4>Create Your Personalized Meal Plan</h4>
                    <p>Our AI will generate a diabetes-friendly meal plan using Gemini AI, tailored to your preferences.</p>
                </div>
                
                <div class="preferences-form">
                    <div class="form-group">
                        <label for="cuisine-select">Cultural Cuisine Preference</label>
                        <select id="cuisine-select" class="form-control">
                            <option value="general">General/Western</option>
                            <option value="mediterranean">Mediterranean</option>
                            <option value="asian">Asian</option>
                            <option value="indian">Indian</option>
                            <option value="mexican">Mexican</option>
                            <option value="middle-eastern">Middle Eastern</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Dietary Restrictions</label>
                        <div class="dietary-restrictions checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" value="vegetarian"> 
                                <span class="checkmark"></span>
                                Vegetarian
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="vegan"> 
                                <span class="checkmark"></span>
                                Vegan
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="gluten-free"> 
                                <span class="checkmark"></span>
                                Gluten-Free
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="dairy-free"> 
                                <span class="checkmark"></span>
                                Dairy-Free
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="low-sodium"> 
                                <span class="checkmark"></span>
                                Low Sodium
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="days-select">Plan Duration</label>
                        <select id="days-select" class="form-control">
                            <option value="3">3 Days</option>
                            <option value="7">7 Days</option>
                        </select>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-primary" id="generate-ai-meal-plan">
                        <span class="icon">🤖</span> Generate with Gemini AI
                    </button>
                    <button class="btn-secondary" onclick="nutritionDashboardFix.closeModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
        
        // Add event listener for generate button
        document.getElementById('generate-ai-meal-plan').addEventListener('click', () => {
            this.generateAIMealPlan();
        });
    }

    async generateAIMealPlan() {
        const generateBtn = document.getElementById('generate-ai-meal-plan');
        const originalText = generateBtn.innerHTML;
        
        try {
            // Disable button and show loading
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<div class="spinner"></div> Generating with AI...';
            
            // Collect preferences
            const cuisineSelect = document.getElementById('cuisine-select');
            const dietaryCheckboxes = document.querySelectorAll('.dietary-restrictions input[type="checkbox"]:checked');
            const daysSelect = document.getElementById('days-select');
            
            const preferences = {
                cuisine: cuisineSelect.value,
                dietaryRestrictions: Array.from(dietaryCheckboxes).map(cb => cb.value),
                days: parseInt(daysSelect.value)
            };
            
            console.log('🤖 Generating meal plan with preferences:', preferences);
            
            // Use the nutrition service to generate the meal plan
            const result = await window.nutritionService.generateMealPlan(preferences);
            
            if (result.success || result.mealPlan) {
                const mealPlan = result.mealPlan || result.fallbackPlan;
                this.showMealPlanResult(mealPlan, preferences);
                this.showNotification('AI meal plan generated successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to generate meal plan');
            }
            
        } catch (error) {
            console.error('Error generating AI meal plan:', error);
            this.showNotification('Failed to generate meal plan. Please try again.', 'error');
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalText;
        }
    }

    showMealPlanResult(mealPlan, preferences) {
        const modal = document.querySelector('.modal-overlay');
        if (!modal) return;
        
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="meal-plan-result">
                <div class="result-header">
                    <div class="result-icon">🍽️</div>
                    <h4>Your AI-Generated Meal Plan</h4>
                    <p>Created with Gemini AI • ${mealPlan.days?.length || 3} days • ${mealPlan.cuisine || preferences.cuisine} cuisine</p>
                </div>
                
                <div class="meal-plan-preview">
                    ${this.renderMealPlanPreview(mealPlan)}
                </div>
                
                <div class="cultural-notes">
                    ${mealPlan.culturalNotes ? `
                        <h5><span class="icon">🌍</span> ${mealPlan.culturalNotes.cuisine} Cuisine Benefits</h5>
                        <div class="benefits-list">
                            ${mealPlan.culturalNotes.healthBenefits?.map(benefit => 
                                `<span class="benefit-tag">${benefit}</span>`
                            ).join('') || ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="result-actions">
                    <button class="btn-primary" onclick="nutritionDashboardFix.saveMealPlan(${JSON.stringify(mealPlan).replace(/"/g, '&quot;')}, ${JSON.stringify(preferences).replace(/"/g, '&quot;')})">
                        <span class="icon">💾</span> Save Meal Plan
                    </button>
                    <button class="btn-secondary" onclick="nutritionDashboardFix.viewFullMealPlan(${JSON.stringify(mealPlan).replace(/"/g, '&quot;')})">
                        <span class="icon">👁️</span> View Full Plan
                    </button>
                    <button class="btn-secondary" onclick="nutritionDashboardFix.generateAIMealPlan()">
                        <span class="icon">🔄</span> Generate New Plan
                    </button>
                </div>
            </div>
        `;
    }

    renderMealPlanPreview(mealPlan) {
        if (!mealPlan.days || mealPlan.days.length === 0) {
            return '<p>No meal plan data available</p>';
        }
        
        return mealPlan.days.slice(0, 2).map(day => `
            <div class="day-preview">
                <h6>Day ${day.day}</h6>
                <div class="meals-preview">
                    ${Object.entries(day.meals).slice(0, 3).map(([mealType, meals]) => `
                        <div class="meal-preview">
                            <strong>${this.formatMealType(mealType)}:</strong>
                            <span>${meals[0]?.name || meals[0] || 'Meal planned'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('') + (mealPlan.days.length > 2 ? `<p class="more-days">+ ${mealPlan.days.length - 2} more days...</p>` : '');
    }

    formatMealType(mealType) {
        const mealNames = {
            breakfast: 'Breakfast',
            morningSnack: 'Morning Snack',
            lunch: 'Lunch',
            afternoonSnack: 'Afternoon Snack',
            dinner: 'Dinner',
            eveningSnack: 'Evening Snack',
            snack: 'Snack'
        };
        return mealNames[mealType] || mealType;
    }

    async saveMealPlan(mealPlan, preferences) {
        try {
            // Save using nutrition service
            await window.nutritionService.storeMealPlan(mealPlan, preferences);
            this.showNotification('Meal plan saved successfully!', 'success');
            this.closeModal();
        } catch (error) {
            console.error('Error saving meal plan:', error);
            this.showNotification('Failed to save meal plan. Please try again.', 'error');
        }
    }

    viewFullMealPlan(mealPlan) {
        this.closeModal();
        
        // Use nutrition UI to display the full meal plan
        if (window.nutritionUI) {
            window.nutritionUI.displayMealPlan(mealPlan);
            
            // Create a dedicated container if needed
            let container = document.getElementById('meal-plan-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'meal-plan-container';
                container.className = 'meal-plan-container';
                document.body.appendChild(container);
            }
            
            // Show the container in a modal
            const modal = this.createModal('🍽️ Complete Meal Plan', `
                <div id="full-meal-plan-view"></div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="nutritionDashboardFix.closeModal()">Close</button>
                </div>
            `);
            
            document.body.appendChild(modal);
            
            // Move the meal plan content to the modal
            const fullPlanView = document.getElementById('full-meal-plan-view');
            fullPlanView.appendChild(container);
        }
    }

    async handleViewPlans() {
        console.log('📋 Viewing nutrition plans...');
        
        try {
            // Get user meal plans from nutrition service
            const plans = await window.nutritionService.getUserMealPlans(10);
            
            if (plans.length === 0) {
                this.showNotification('No meal plans found. Create your first plan!', 'info');
                setTimeout(() => this.handleCreateMealPlan(), 1000);
                return;
            }
            
            this.showPlansModal(plans);
            
        } catch (error) {
            console.error('Error loading meal plans:', error);
            this.showNotification('Unable to load meal plans. Please try again.', 'error');
        }
    }

    showPlansModal(plans) {
        const modal = this.createModal('📋 Your Nutrition Plans', `
            <div class="nutrition-plans-view">
                <div class="plans-header">
                    <h4>Your Meal Plans (${plans.length})</h4>
                    <p>Manage your personalized nutrition plans created with AI</p>
                </div>
                
                <div class="plans-grid">
                    ${plans.map((plan, index) => `
                        <div class="plan-card" data-plan-id="${plan.id || index}">
                            <div class="plan-header">
                                <h5>${plan.planType || '3-Day Plan'} - ${plan.cuisine || 'General'}</h5>
                                <div class="plan-meta">
                                    <span class="plan-date">📅 ${new Date(plan.createdAt).toLocaleDateString()}</span>
                                    ${plan.generationMethod === 'ai-powered' ? '<span class="ai-badge">🤖 AI Generated</span>' : ''}
                                </div>
                            </div>
                            <div class="plan-details">
                                <div class="plan-stats">
                                    <span>🍽️ ${plan.mealPlan?.days?.length || 0} days</span>
                                    <span>🌍 ${plan.mealPlan?.culturalNotes?.cuisine || plan.cuisine}</span>
                                    ${plan.dietaryRestrictions?.length > 0 ? 
                                        `<span>🥗 ${plan.dietaryRestrictions.join(', ')}</span>` : ''}
                                </div>
                            </div>
                            <div class="plan-actions">
                                <button class="btn-small primary" onclick="nutritionDashboardFix.viewPlanDetails('${plan.id || index}')">
                                    👁️ View Details
                                </button>
                                <button class="btn-small secondary" onclick="nutritionDashboardFix.startPlanTracking('${plan.id || index}')">
                                    📊 Track Progress
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="plans-actions">
                    <button class="btn-primary" onclick="nutritionDashboardFix.handleCreateMealPlan(); nutritionDashboardFix.closeModal();">
                        ➕ Create New Plan
                    </button>
                    <button class="btn-secondary" onclick="nutritionDashboardFix.closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    async viewPlanDetails(planId) {
        try {
            const plans = await window.nutritionService.getUserMealPlans(50);
            const plan = plans.find(p => (p.id || plans.indexOf(p)) == planId);
            
            if (!plan) {
                this.showNotification('Plan not found', 'error');
                return;
            }
            
            this.closeModal();
            this.viewFullMealPlan(plan.mealPlan);
            
        } catch (error) {
            console.error('Error viewing plan details:', error);
            this.showNotification('Unable to load plan details', 'error');
        }
    }

    async startPlanTracking(planId) {
        try {
            const plans = await window.nutritionService.getUserMealPlans(50);
            const plan = plans.find(p => (p.id || plans.indexOf(p)) == planId);
            
            if (!plan) {
                this.showNotification('Plan not found', 'error');
                return;
            }
            
            this.closeModal();
            
            // Initialize adherence tracking for this plan
            if (window.nutritionUI) {
                window.nutritionUI.currentMealPlan = plan.mealPlan;
                window.nutritionUI.initializeAdherenceTracking(plan.mealPlan);
            }
            
            this.showNotification('Plan tracking started! You can now track your meal adherence.', 'success');
            
        } catch (error) {
            console.error('Error starting plan tracking:', error);
            this.showNotification('Unable to start plan tracking', 'error');
        }
    }

    async handleViewRecipes() {
        console.log('📖 Viewing recipes...');
        
        try {
            // Get recipes from meal plans
            const plans = await window.nutritionService.getUserMealPlans(20);
            const recipes = this.extractRecipesFromPlans(plans);
            
            if (recipes.length === 0) {
                this.showNotification('No recipes found. Create some meal plans first!', 'info');
                setTimeout(() => this.handleCreateMealPlan(), 1000);
                return;
            }
            
            this.showRecipesModal(recipes);
            
        } catch (error) {
            console.error('Error loading recipes:', error);
            this.showNotification('Unable to load recipes. Please try again.', 'error');
        }
    }

    extractRecipesFromPlans(plans) {
        const recipes = [];
        
        plans.forEach(plan => {
            if (plan.mealPlan && plan.mealPlan.days) {
                plan.mealPlan.days.forEach(day => {
                    Object.entries(day.meals).forEach(([mealType, meals]) => {
                        meals.forEach(meal => {
                            if (meal.name && meal.name.length > 10) { // Filter out simple items
                                recipes.push({
                                    name: meal.name,
                                    type: mealType,
                                    carbs: meal.carbs,
                                    notes: meal.notes || meal.preparationTip,
                                    cuisine: plan.cuisine,
                                    planId: plan.id,
                                    source: 'meal_plan'
                                });
                            }
                        });
                    });
                });
            }
        });
        
        // Remove duplicates
        const uniqueRecipes = recipes.filter((recipe, index, self) => 
            index === self.findIndex(r => r.name === recipe.name)
        );
        
        return uniqueRecipes;
    }

    showRecipesModal(recipes) {
        const modal = this.createModal('📖 Your Recipe Collection', `
            <div class="recipes-view">
                <div class="recipes-header">
                    <h4>Your Recipe Collection (${recipes.length})</h4>
                    <p>Recipes from your AI-generated meal plans</p>
                </div>
                
                <div class="recipes-filter">
                    <select id="recipe-type-filter" onchange="nutritionDashboardFix.filterRecipes()">
                        <option value="">All Meal Types</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snacks</option>
                    </select>
                    
                    <select id="recipe-cuisine-filter" onchange="nutritionDashboardFix.filterRecipes()">
                        <option value="">All Cuisines</option>
                        <option value="general">General</option>
                        <option value="mediterranean">Mediterranean</option>
                        <option value="asian">Asian</option>
                        <option value="indian">Indian</option>
                        <option value="mexican">Mexican</option>
                    </select>
                </div>
                
                <div class="recipes-grid" id="recipes-grid">
                    ${recipes.map((recipe, index) => `
                        <div class="recipe-card" data-type="${recipe.type}" data-cuisine="${recipe.cuisine}">
                            <div class="recipe-header">
                                <h5>${recipe.name}</h5>
                                <div class="recipe-meta">
                                    <span class="meal-type">${this.formatMealType(recipe.type)}</span>
                                    ${recipe.cuisine ? `<span class="cuisine">${recipe.cuisine}</span>` : ''}
                                </div>
                            </div>
                            <div class="recipe-details">
                                ${recipe.carbs ? `<div class="nutrition-info">🍞 ${recipe.carbs}g carbs</div>` : ''}
                                ${recipe.notes ? `<div class="recipe-notes">💡 ${recipe.notes}</div>` : ''}
                            </div>
                            <div class="recipe-actions">
                                <button class="btn-small primary" onclick="nutritionDashboardFix.generateDetailedRecipe('${recipe.name.replace(/'/g, "\\'")}', '${recipe.type}')">
                                    🤖 Get Full Recipe
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="recipes-actions">
                    <button class="btn-primary" onclick="nutritionDashboardFix.handleCreateMealPlan(); nutritionDashboardFix.closeModal();">
                        ➕ Create More Recipes
                    </button>
                    <button class="btn-secondary" onclick="nutritionDashboardFix.closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    filterRecipes() {
        const typeFilter = document.getElementById('recipe-type-filter').value;
        const cuisineFilter = document.getElementById('recipe-cuisine-filter').value;
        const recipeCards = document.querySelectorAll('.recipe-card');
        
        recipeCards.forEach(card => {
            const cardType = card.dataset.type;
            const cardCuisine = card.dataset.cuisine;
            
            const typeMatch = !typeFilter || cardType === typeFilter || 
                            (typeFilter === 'snack' && cardType.includes('Snack'));
            const cuisineMatch = !cuisineFilter || cardCuisine === cuisineFilter;
            
            if (typeMatch && cuisineMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    async generateDetailedRecipe(recipeName, mealType) {
        try {
            // Use AI service to generate detailed recipe
            if (window.aiService && await window.aiService.isAvailable()) {
                const prompt = `Generate a detailed diabetes-friendly recipe for "${recipeName}" (${mealType}). Include:
                1. Complete ingredients list with measurements
                2. Step-by-step cooking instructions
                3. Cooking time and prep time
                4. Nutritional information (especially carbs)
                5. Tips for blood sugar management
                6. Serving suggestions
                
                Make it practical and delicious while keeping it diabetes-friendly.`;
                
                const detailedRecipe = await window.aiService.generateContent(prompt);
                this.showDetailedRecipeModal(recipeName, detailedRecipe);
            } else {
                this.showNotification('AI service not available for detailed recipes', 'warning');
            }
        } catch (error) {
            console.error('Error generating detailed recipe:', error);
            this.showNotification('Unable to generate detailed recipe', 'error');
        }
    }

    showDetailedRecipeModal(recipeName, recipeContent) {
        const modal = this.createModal(`📖 ${recipeName}`, `
            <div class="detailed-recipe">
                <div class="recipe-content">
                    ${this.formatRecipeContent(recipeContent)}
                </div>
                <div class="recipe-actions">
                    <button class="btn-primary" onclick="nutritionDashboardFix.saveRecipe('${recipeName.replace(/'/g, "\\'")}', '${recipeContent.replace(/'/g, "\\'")}')">
                        💾 Save Recipe
                    </button>
                    <button class="btn-secondary" onclick="nutritionDashboardFix.closeModal()">
                        Close
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    formatRecipeContent(content) {
        // Format the AI-generated recipe content for better display
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    saveRecipe(recipeName, recipeContent) {
        try {
            const userId = this.getCurrentUserId();
            let savedRecipes = JSON.parse(localStorage.getItem(`saved-recipes-${userId}`) || '[]');
            
            const recipe = {
                id: Date.now(),
                name: recipeName,
                content: recipeContent,
                savedAt: new Date().toISOString()
            };
            
            savedRecipes.unshift(recipe);
            localStorage.setItem(`saved-recipes-${userId}`, JSON.stringify(savedRecipes));
            
            this.showNotification('Recipe saved successfully!', 'success');
            this.closeModal();
        } catch (error) {
            console.error('Error saving recipe:', error);
            this.showNotification('Failed to save recipe', 'error');
        }
    }

    // Utility methods
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay nutrition-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="nutritionDashboardFix.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        return modal;
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
    }

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.notificationUI && typeof window.notificationUI.showNotification === 'function') {
            window.notificationUI.showNotification(message, type);
            return;
        }
        
        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Initialize the fix
window.nutritionDashboardFix = new NutritionDashboardFix();

// Add CSS styles for the nutrition modals
const nutritionStyles = document.createElement('style');
nutritionStyles.textContent = `
    .nutrition-modal .modal-content {
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .meal-plan-preferences {
        padding: 1rem;
    }
    
    .preferences-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .preferences-header h4 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }
    
    .preferences-form {
        margin-bottom: 2rem;
    }
    
    .form-group {
        margin-bottom: 1.5rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--medium-gray);
        border-radius: var(--border-radius);
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
    
    .form-control:focus {
        outline: none;
        border-color: var(--primary-color);
    }
    
    .dietary-restrictions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
        margin-top: 0.5rem;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        transition: background-color 0.3s ease;
    }
    
    .checkbox-label:hover {
        background-color: var(--light-gray);
    }
    
    .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid var(--medium-gray);
        border-radius: 4px;
        position: relative;
        transition: all 0.3s ease;
    }
    
    .checkbox-label input[type="checkbox"] {
        display: none;
    }
    
    .checkbox-label input[type="checkbox"]:checked + .checkmark {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
    }
    
    .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: bold;
        font-size: 14px;
    }
    
    .meal-plan-result {
        padding: 1rem;
    }
    
    .result-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .result-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .meal-plan-preview {
        background: var(--light-gray);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        margin-bottom: 1.5rem;
    }
    
    .day-preview {
        margin-bottom: 1rem;
    }
    
    .day-preview h6 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }
    
    .meals-preview {
        display: grid;
        gap: 0.5rem;
    }
    
    .meal-preview {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    
    .meal-preview strong {
        min-width: 100px;
        color: var(--text-primary);
    }
    
    .cultural-notes {
        margin-bottom: 1.5rem;
    }
    
    .cultural-notes h5 {
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .benefits-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .benefit-tag {
        background: var(--primary-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
    }
    
    .plans-grid, .recipes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
    }
    
    .plan-card, .recipe-card {
        background: var(--white);
        border: 2px solid var(--light-gray);
        border-radius: var(--border-radius);
        padding: 1rem;
        transition: all 0.3s ease;
    }
    
    .plan-card:hover, .recipe-card:hover {
        border-color: var(--primary-color);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
    }
    
    .plan-header, .recipe-header {
        margin-bottom: 1rem;
    }
    
    .plan-header h5, .recipe-header h5 {
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }
    
    .plan-meta, .recipe-meta {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .plan-date, .meal-type, .cuisine {
        background: var(--light-gray);
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .ai-badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
    }
    
    .plan-stats, .recipe-details {
        margin-bottom: 1rem;
    }
    
    .plan-stats span, .nutrition-info, .recipe-notes {
        display: inline-block;
        margin-right: 1rem;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .plan-actions, .recipe-actions, .result-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        border-radius: var(--border-radius);
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-small.primary {
        background: var(--primary-color);
        color: white;
    }
    
    .btn-small.secondary {
        background: var(--medium-gray);
        color: var(--text-primary);
    }
    
    .btn-small.danger {
        background: #dc3545;
        color: white;
    }
    
    .btn-small:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .recipes-filter {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .recipes-filter select {
        padding: 0.5rem;
        border: 2px solid var(--medium-gray);
        border-radius: var(--border-radius);
        background: white;
    }
    
    .detailed-recipe {
        padding: 1rem;
    }
    
    .recipe-content {
        background: var(--light-gray);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        margin-bottom: 1.5rem;
        line-height: 1.6;
    }
    
    .recipe-content strong {
        color: var(--primary-color);
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        color: white;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    }
    
    .notification.success {
        background: #28a745;
    }
    
    .notification.error {
        background: #dc3545;
    }
    
    .notification.warning {
        background: #ffc107;
        color: #333;
    }
    
    .notification.info {
        background: var(--primary-color);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 0.5rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .more-days {
        text-align: center;
        color: var(--text-secondary);
        font-style: italic;
        margin-top: 1rem;
    }
`;

document.head.appendChild(nutritionStyles);

console.log('🍽️ Nutrition Dashboard Integration Fix loaded successfully!');