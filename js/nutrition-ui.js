// GlucoBalance - Nutrition UI Component
class NutritionUI {
    constructor() {
        this.nutritionService = window.nutritionService;
        this.currentMealPlan = null;
        this.isGenerating = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExistingMealPlan();
    }

    setupEventListeners() {
        // Generate meal plan button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'generate-meal-plan') {
                this.handleGenerateMealPlan();
            }
            
            // Meal adherence tracking
            if (e.target.classList.contains('adherence-btn')) {
                this.handleAdherenceUpdate(e.target);
            }
            
            // Regenerate meal plan
            if (e.target.id === 'regenerate-meal-plan') {
                this.handleRegenerateMealPlan();
            }
            
            // Save meal plan
            if (e.target.id === 'save-meal-plan') {
                this.handleSaveMealPlan();
            }
        });

        // Dietary restriction checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.dietary-restrictions')) {
                this.updateDietaryRestrictions();
            }
        });

        // Cuisine selection
        document.addEventListener('change', (e) => {
            if (e.target.id === 'cuisine-select') {
                this.updateCuisineInfo(e.target.value);
            }
        });
    }

    async handleGenerateMealPlan() {
        if (this.isGenerating) return;
        
        try {
            this.isGenerating = true;
            this.showGeneratingState();
            
            const preferences = this.collectUserPreferences();
            const result = await this.nutritionService.generateMealPlan(preferences);
            
            if (result.success) {
                this.currentMealPlan = result.mealPlan;
                this.displayMealPlan(result.mealPlan);
                this.showNotification('Meal plan generated successfully!', 'success');
            } else {
                this.displayFallbackMealPlan(result.fallbackPlan);
                this.showNotification('Using offline meal plan. AI service unavailable.', 'warning');
            }
        } catch (error) {
            console.error('Error generating meal plan:', error);
            this.showNotification('Failed to generate meal plan. Please try again.', 'error');
        } finally {
            this.isGenerating = false;
            this.hideGeneratingState();
        }
    }

    collectUserPreferences() {
        const cuisineSelect = document.getElementById('cuisine-select');
        const dietaryCheckboxes = document.querySelectorAll('.dietary-restrictions input[type="checkbox"]:checked');
        
        const preferences = {
            cuisine: cuisineSelect?.value || 'general',
            dietaryRestrictions: Array.from(dietaryCheckboxes).map(cb => cb.value),
            days: 3
        };

        return preferences;
    }

    showGeneratingState() {
        const generateBtn = document.getElementById('generate-meal-plan');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = `
                <div class="spinner"></div>
                Generating Meal Plan...
            `;
        }

        // Show loading in meal plan container
        const container = document.getElementById('meal-plan-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-meal-plan">
                    <div class="spinner large"></div>
                    <h3>Creating Your Personalized Meal Plan</h3>
                    <p>Our AI is crafting diabetic-friendly meals tailored to your preferences...</p>
                </div>
            `;
        }
    }

    hideGeneratingState() {
        const generateBtn = document.getElementById('generate-meal-plan');
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = 'Generate 3-Day Meal Plan';
        }
    }

    displayMealPlan(mealPlan) {
        const container = document.getElementById('meal-plan-container');
        if (!container) return;

        const mealPlanHTML = this.buildMealPlanHTML(mealPlan);
        container.innerHTML = mealPlanHTML;
        
        // Initialize adherence tracking
        this.initializeAdherenceTracking(mealPlan);
    }

    displayFallbackMealPlan(fallbackPlan) {
        this.currentMealPlan = fallbackPlan;
        this.displayMealPlan(fallbackPlan);
    }

    buildMealPlanHTML(mealPlan) {
        return `
            <div class="meal-plan-header">
                <h2>Your 3-Day ${mealPlan.culturalNotes?.cuisine || 'Personalized'} Meal Plan</h2>
                <div class="meal-plan-actions">
                    <button id="regenerate-meal-plan" class="btn-secondary">
                        <span class="icon">🔄</span> Generate New Plan
                    </button>
                    <button id="save-meal-plan" class="btn-primary">
                        <span class="icon">💾</span> Save Plan
                    </button>
                </div>
            </div>

            ${this.buildCulturalNotesHTML(mealPlan.culturalNotes)}
            
            <div class="meal-plan-days">
                ${mealPlan.days.map(day => this.buildDayHTML(day, mealPlan.id)).join('')}
            </div>

            ${this.buildNutritionalGuidelinesHTML(mealPlan.nutritionalGuidelines)}
            
            <div class="adherence-summary">
                <h3>Track Your Progress</h3>
                <div class="adherence-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="overall-adherence">0%</div>
                        <div class="stat-label">Overall Adherence</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="completed-meals">0/21</div>
                        <div class="stat-label">Meals Completed</div>
                    </div>
                </div>
            </div>
        `;
    }

    buildCulturalNotesHTML(culturalNotes) {
        if (!culturalNotes) return '';

        return `
            <div class="cultural-notes card">
                <h3><span class="icon">🌍</span> ${culturalNotes.cuisine} Cuisine Benefits</h3>
                <div class="cultural-content">
                    <div class="health-benefits">
                        <h4>Health Benefits:</h4>
                        <ul>
                            ${culturalNotes.healthBenefits?.map(benefit => `<li>${benefit}</li>`).join('') || ''}
                        </ul>
                    </div>
                    <div class="preparation-tips">
                        <h4>Preparation Tips:</h4>
                        <ul>
                            ${culturalNotes.preparationTips?.map(tip => `<li>${tip}</li>`).join('') || ''}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    buildDayHTML(day, planId) {
        return `
            <div class="meal-day card">
                <div class="day-header">
                    <h3>Day ${day.day}</h3>
                    <div class="day-adherence">
                        <span class="adherence-percentage" id="day${day.day}-adherence">0%</span>
                    </div>
                </div>
                
                <div class="meals-grid">
                    ${Object.entries(day.meals).map(([mealType, meals]) => 
                        this.buildMealHTML(mealType, meals, day.day, planId)
                    ).join('')}
                </div>
            </div>
        `;
    }

    buildMealHTML(mealType, meals, day, planId) {
        const mealDisplayNames = {
            breakfast: 'Breakfast',
            morningSnack: 'Morning Snack',
            lunch: 'Lunch',
            afternoonSnack: 'Afternoon Snack',
            dinner: 'Dinner',
            eveningSnack: 'Evening Snack',
            snack: 'Snack'
        };

        const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);

        return `
            <div class="meal-card">
                <div class="meal-header">
                    <h4>${mealDisplayNames[mealType] || mealType}</h4>
                    ${totalCarbs > 0 ? `<span class="carb-count">${totalCarbs}g carbs</span>` : ''}
                </div>
                
                <div class="meal-items">
                    ${meals.map(meal => `
                        <div class="meal-item">
                            <div class="item-name">${meal.name}</div>
                            ${meal.carbs ? `<div class="item-carbs">${meal.carbs}g carbs</div>` : ''}
                            ${meal.notes ? `<div class="item-notes"><span class="icon">💡</span> ${meal.notes}</div>` : ''}
                            ${meal.preparationTip ? `<div class="preparation-tip"><span class="icon">👨‍🍳</span> ${meal.preparationTip}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="meal-adherence">
                    <button class="adherence-btn" 
                            data-plan-id="${planId}" 
                            data-day="${day}" 
                            data-meal="${mealType}"
                            data-completed="false">
                        <span class="icon">☐</span> Mark as Completed
                    </button>
                </div>
            </div>
        `;
    }

    buildNutritionalGuidelinesHTML(guidelines) {
        if (!guidelines) return '';

        return `
            <div class="nutritional-guidelines card">
                <h3><span class="icon">📊</span> Nutritional Guidelines</h3>
                <div class="guidelines-grid">
                    <div class="guideline-item">
                        <strong>Daily Carbs:</strong> ${guidelines.dailyCarbs}
                    </div>
                    <div class="guideline-item">
                        <strong>Fiber Goal:</strong> ${guidelines.fiberGoal}
                    </div>
                    <div class="guideline-item">
                        <strong>Protein Target:</strong> ${guidelines.proteinTarget}
                    </div>
                    <div class="guideline-item">
                        <strong>Healthy Fats:</strong> ${guidelines.healthyFats}
                    </div>
                </div>
                
                <div class="diabetic-tips">
                    <h4>Diabetic Management Tips:</h4>
                    <ul>
                        ${guidelines.diabeticTips?.map(tip => `<li>${tip}</li>`).join('') || ''}
                    </ul>
                </div>
            </div>
        `;
    }

    async handleAdherenceUpdate(button) {
        try {
            const planId = button.dataset.planId;
            const day = parseInt(button.dataset.day);
            const mealType = button.dataset.mealType;
            const isCompleted = button.dataset.completed === 'true';
            
            // For enhanced adherence tracking, show percentage input for partial completion
            if (!isCompleted) {
                const adherencePercentage = await this.promptForAdherencePercentage(mealType);
                if (adherencePercentage === null) return; // User cancelled
                
                // Update button state with percentage
                this.updateAdherenceButtonWithPercentage(button, adherencePercentage);
                
                // Save enhanced adherence data with percentage
                await this.nutritionService.logMealAdherence(planId, day, mealType, adherencePercentage);
            } else {
                // Toggle to incomplete
                this.updateAdherenceButton(button, false);
                await this.nutritionService.logMealAdherence(planId, day, mealType, 0);
            }
            
            // Update adherence statistics
            this.updateAdherenceStats(planId);
            
        } catch (error) {
            console.error('Error updating adherence:', error);
            this.showNotification('Failed to update meal tracking', 'error');
        }
    }

    async promptForAdherencePercentage(mealType) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay adherence-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Track ${this.formatMealTypeName(mealType)} Adherence</h3>
                    </div>
                    <div class="modal-body">
                        <p>How much of your planned ${this.formatMealTypeName(mealType).toLowerCase()} did you complete?</p>
                        
                        <div class="adherence-options">
                            <button class="adherence-option" data-percentage="100">
                                <span class="option-icon">✅</span>
                                <span class="option-text">Completed (100%)</span>
                            </button>
                            <button class="adherence-option" data-percentage="75">
                                <span class="option-icon">🟢</span>
                                <span class="option-text">Mostly (75%)</span>
                            </button>
                            <button class="adherence-option" data-percentage="50">
                                <span class="option-icon">🟡</span>
                                <span class="option-text">Partially (50%)</span>
                            </button>
                            <button class="adherence-option" data-percentage="25">
                                <span class="option-icon">🟠</span>
                                <span class="option-text">Minimal (25%)</span>
                            </button>
                        </div>
                        
                        <div class="custom-percentage">
                            <label for="custom-adherence">Custom percentage:</label>
                            <input type="range" id="custom-adherence" min="0" max="100" value="100" class="adherence-slider">
                            <span class="slider-value">100%</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="cancel-adherence">Cancel</button>
                        <button class="btn-primary" id="save-adherence">Save Adherence</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const slider = modal.querySelector('#custom-adherence');
            const sliderValue = modal.querySelector('.slider-value');
            let selectedPercentage = 100;

            // Update slider display
            slider.addEventListener('input', (e) => {
                selectedPercentage = parseInt(e.target.value);
                sliderValue.textContent = `${selectedPercentage}%`;
                
                // Clear option selections
                modal.querySelectorAll('.adherence-option').forEach(opt => 
                    opt.classList.remove('selected')
                );
            });

            // Handle option buttons
            modal.querySelectorAll('.adherence-option').forEach(option => {
                option.addEventListener('click', () => {
                    selectedPercentage = parseInt(option.dataset.percentage);
                    slider.value = selectedPercentage;
                    sliderValue.textContent = `${selectedPercentage}%`;
                    
                    // Update visual selection
                    modal.querySelectorAll('.adherence-option').forEach(opt => 
                        opt.classList.remove('selected')
                    );
                    option.classList.add('selected');
                });
            });

            // Handle save
            modal.querySelector('#save-adherence').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(selectedPercentage);
            });

            // Handle cancel
            modal.querySelector('#cancel-adherence').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(null);
            });

            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                    resolve(null);
                }
            });
        });
    }

    updateAdherenceButtonWithPercentage(button, percentage) {
        button.dataset.completed = (percentage > 0).toString();
        button.dataset.percentage = percentage.toString();
        
        if (percentage === 100) {
            button.innerHTML = '<span class="icon">✅</span> Completed (100%)';
            button.classList.add('completed', 'full');
        } else if (percentage >= 75) {
            button.innerHTML = `<span class="icon">🟢</span> Mostly (${percentage}%)`;
            button.classList.add('completed', 'high');
        } else if (percentage >= 50) {
            button.innerHTML = `<span class="icon">🟡</span> Partially (${percentage}%)`;
            button.classList.add('completed', 'medium');
        } else if (percentage > 0) {
            button.innerHTML = `<span class="icon">🟠</span> Minimal (${percentage}%)`;
            button.classList.add('completed', 'low');
        } else {
            button.innerHTML = '<span class="icon">☐</span> Mark as Completed';
            button.classList.remove('completed', 'full', 'high', 'medium', 'low');
        }
    }

    updateAdherenceButton(button, isCompleted) {
        button.dataset.completed = isCompleted.toString();
        
        if (isCompleted) {
            button.innerHTML = '<span class="icon">☑</span> Completed';
            button.classList.add('completed');
        } else {
            button.innerHTML = '<span class="icon">☐</span> Mark as Completed';
            button.classList.remove('completed');
        }
    }

    async updateAdherenceStats(planId) {
        try {
            const adherenceData = await this.nutritionService.getMealAdherence(planId);
            const overallAdherence = this.nutritionService.calculateOverallAdherence(adherenceData);
            
            // Update overall adherence
            const overallElement = document.getElementById('overall-adherence');
            if (overallElement) {
                overallElement.textContent = `${overallAdherence}%`;
            }
            
            // Count completed meals
            let completedMeals = 0;
            let totalMeals = 0;
            
            Object.values(adherenceData).forEach(day => {
                Object.values(day).forEach(meal => {
                    totalMeals++;
                    if (meal.completed) {
                        completedMeals++;
                    }
                });
            });
            
            const completedElement = document.getElementById('completed-meals');
            if (completedElement) {
                completedElement.textContent = `${completedMeals}/${totalMeals}`;
            }
            
            // Update day-specific adherence
            this.updateDayAdherence(adherenceData);
            
            // Generate lifestyle recommendations and motivational support
            await this.updateLifestyleRecommendations(overallAdherence, adherenceData);
            
        } catch (error) {
            console.error('Error updating adherence stats:', error);
        }
    }

    async updateLifestyleRecommendations(adherencePercentage, adherenceData) {
        try {
            // Generate AI-powered lifestyle recommendations (Requirement 3.7)
            const userProfile = {
                preferredCuisine: this.currentMealPlan?.cuisine || 'general',
                dietaryRestrictions: this.currentMealPlan?.dietaryRestrictions || [],
                currentPlanId: this.currentMealPlan?.id,
                healthGoals: ['diabetes_prevention', 'heart_health']
            };

            const lifestyleRecs = await this.nutritionService.generatePersonalizedLifestyleTips(userProfile, adherenceData);
            this.displayLifestyleRecommendations(lifestyleRecs);

            // Generate enhanced motivational support for low adherence (Requirement 3.8)
            if (adherencePercentage < 70) {
                const motivationalSupport = await this.nutritionService.generateEnhancedMotivationalSupport(
                    adherenceData, 
                    { cuisine: userProfile.preferredCuisine },
                    userProfile
                );
                this.displayMotivationalSupport(motivationalSupport);
            }

            // Display nutrition analytics dashboard (Requirement 3.6)
            await this.displayNutritionAnalytics(this.currentMealPlan?.id);
        } catch (error) {
            console.error('Error updating lifestyle recommendations:', error);
        }
    }

    displayLifestyleRecommendations(recommendations) {
        let container = document.getElementById('lifestyle-recommendations');
        if (!container) {
            // Create container if it doesn't exist
            container = document.createElement('div');
            container.id = 'lifestyle-recommendations';
            container.className = 'lifestyle-recommendations card';
            
            const adherenceSummary = document.querySelector('.adherence-summary');
            if (adherenceSummary) {
                adherenceSummary.appendChild(container);
            }
        }

        // Group recommendations by category
        const categorizedRecs = this.categorizeRecommendations(recommendations.recommendations);

        container.innerHTML = `
            <h3><span class="icon">🌟</span> Personalized Lifestyle Tips</h3>
            <div class="recommendations-content">
                ${Object.entries(categorizedRecs).map(([category, recs]) => `
                    <div class="recommendation-category">
                        <h4 class="category-title">
                            <span class="category-icon">${this.getCategoryIcon(category)}</span>
                            ${this.getCategoryTitle(category)}
                        </h4>
                        <div class="category-recommendations">
                            ${recs.map(rec => `
                                <div class="recommendation-item">
                                    <span class="rec-bullet">•</span>
                                    <span class="rec-text">${typeof rec === 'string' ? rec : rec.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="ai-badge ${recommendations.aiGenerated ? 'ai-powered' : 'fallback'}">
                ${recommendations.aiGenerated ? '🤖 AI-Generated' : '📋 Standard'}
            </div>
        `;
    }

    categorizeRecommendations(recommendations) {
        const categories = {
            nutrition: [],
            physical_activity: [],
            stress_management: [],
            sleep_hygiene: [],
            general: []
        };

        recommendations.forEach(rec => {
            const category = (typeof rec === 'object' && rec.category) ? rec.category : 'general';
            if (categories[category]) {
                categories[category].push(rec);
            } else {
                categories.general.push(rec);
            }
        });

        // Remove empty categories
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });

        return categories;
    }

    getCategoryIcon(category) {
        const icons = {
            nutrition: '🥗',
            physical_activity: '🏃‍♂️',
            stress_management: '🧘‍♀️',
            sleep_hygiene: '😴',
            general: '💡'
        };
        return icons[category] || icons.general;
    }

    getCategoryTitle(category) {
        const titles = {
            nutrition: 'Nutrition',
            physical_activity: 'Physical Activity',
            stress_management: 'Stress Management',
            sleep_hygiene: 'Sleep & Rest',
            general: 'General Tips'
        };
        return titles[category] || 'Tips';
    }

    displayMotivationalSupport(support) {
        let container = document.getElementById('motivational-support');
        if (!container) {
            container = document.createElement('div');
            container.id = 'motivational-support';
            container.className = 'motivational-support card';
            
            const adherenceSummary = document.querySelector('.adherence-summary');
            if (adherenceSummary) {
                adherenceSummary.appendChild(container);
            }
        }

        container.innerHTML = `
            <h3><span class="icon">💪</span> Stay Motivated</h3>
            <div class="motivational-content">
                <div class="motivational-message">
                    ${support.message}
                </div>
                
                ${support.encouragement ? `
                    <div class="encouragement-section">
                        <div class="encouragement-text">
                            <span class="encouragement-icon">✨</span>
                            ${support.encouragement}
                        </div>
                    </div>
                ` : ''}

                ${support.actionableTips && support.actionableTips.length > 0 ? `
                    <div class="actionable-tips">
                        <h4><span class="icon">🎯</span> Quick Actions</h4>
                        ${support.actionableTips.map(tip => `
                            <div class="tip-item">
                                <span class="tip-bullet">→</span>
                                <span class="tip-text">${tip}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${support.alternatives && support.alternatives.length > 0 ? `
                    <div class="cultural-alternatives">
                        <h4><span class="icon">🌍</span> Cultural Alternatives</h4>
                        ${support.alternatives.map(alt => `
                            <div class="alternative-item">
                                <span class="alt-bullet">•</span>
                                <span class="alt-text">${alt}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="ai-badge ${support.aiGenerated ? 'ai-powered' : 'fallback'}">
                ${support.aiGenerated ? '🤖 AI-Generated' : '📋 Standard'}
            </div>
        `;
    }

    // Enhanced nutrition analytics dashboard (Requirement 3.6)
    async displayNutritionAnalytics(planId) {
        if (!planId) return;

        try {
            const analytics = await this.nutritionService.getAdherenceAnalytics(planId);
            
            let container = document.getElementById('nutrition-analytics');
            if (!container) {
                container = document.createElement('div');
                container.id = 'nutrition-analytics';
                container.className = 'nutrition-analytics card';
                
                const adherenceSummary = document.querySelector('.adherence-summary');
                if (adherenceSummary) {
                    adherenceSummary.appendChild(container);
                }
            }

            container.innerHTML = `
                <h3><span class="icon">📊</span> Nutrition Analytics Dashboard</h3>
                
                <div class="analytics-grid">
                    <div class="analytics-section daily-breakdown">
                        <h4>Daily Breakdown</h4>
                        <div class="daily-chart">
                            ${this.renderDailyBreakdownChart(analytics.dailyBreakdown)}
                        </div>
                    </div>
                    
                    <div class="analytics-section meal-type-breakdown">
                        <h4>Meal Type Performance</h4>
                        <div class="meal-type-chart">
                            ${this.renderMealTypeChart(analytics.mealTypeBreakdown)}
                        </div>
                    </div>
                    
                    ${analytics.weeklyTrend.length > 0 ? `
                        <div class="analytics-section weekly-trend">
                            <h4>Weekly Trend</h4>
                            <div class="trend-chart">
                                ${this.renderTrendChart(analytics.weeklyTrend)}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${analytics.insights.length > 0 ? `
                        <div class="analytics-section insights">
                            <h4>Insights</h4>
                            <div class="insights-list">
                                ${analytics.insights.map(insight => `
                                    <div class="insight-item ${insight.type}">
                                        <span class="insight-icon">${insight.icon}</span>
                                        <span class="insight-text">${insight.message}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (error) {
            console.error('Error displaying nutrition analytics:', error);
        }
    }

    renderDailyBreakdownChart(dailyBreakdown) {
        const days = Object.entries(dailyBreakdown);
        if (days.length === 0) return '<div class="no-data">No data available</div>';

        return `
            <div class="chart-container">
                ${days.map(([day, data]) => `
                    <div class="day-bar">
                        <div class="day-label">Day ${day}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.completionRate}%"></div>
                        </div>
                        <div class="day-stats">
                            <span class="completion-rate">${data.completionRate}%</span>
                            <span class="meal-count">${data.mealsCompleted}/${data.totalMeals}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMealTypeChart(mealTypeBreakdown) {
        const mealTypes = Object.entries(mealTypeBreakdown);
        if (mealTypes.length === 0) return '<div class="no-data">No data available</div>';

        return `
            <div class="meal-type-grid">
                ${mealTypes.map(([mealType, data]) => `
                    <div class="meal-type-card">
                        <div class="meal-type-header">
                            <span class="meal-icon">${this.getMealTypeIcon(mealType)}</span>
                            <span class="meal-name">${this.formatMealTypeName(mealType)}</span>
                        </div>
                        <div class="meal-type-stats">
                            <div class="stat-circle">
                                <div class="circle-progress" style="--progress: ${data.completionRate}%">
                                    <span class="percentage">${data.completionRate}%</span>
                                </div>
                            </div>
                            <div class="meal-details">
                                <div class="detail-item">
                                    <span class="detail-label">Completed:</span>
                                    <span class="detail-value">${data.completed}/${data.total}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Avg Adherence:</span>
                                    <span class="detail-value">${data.averageAdherence}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTrendChart(weeklyTrend) {
        if (weeklyTrend.length === 0) return '<div class="no-data">No trend data available</div>';

        const maxValue = Math.max(...weeklyTrend.map(d => d.adherence));
        const minValue = Math.min(...weeklyTrend.map(d => d.adherence));
        const range = maxValue - minValue || 1;

        return `
            <div class="trend-chart-container">
                <div class="trend-line">
                    ${weeklyTrend.map((point, index) => {
                        const height = ((point.adherence - minValue) / range) * 100;
                        const left = (index / (weeklyTrend.length - 1)) * 100;
                        return `
                            <div class="trend-point" 
                                 style="left: ${left}%; bottom: ${height}%"
                                 title="${point.date}: ${point.adherence}%">
                                <div class="point-dot"></div>
                                <div class="point-label">${point.adherence}%</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="trend-labels">
                    ${weeklyTrend.map(point => `
                        <div class="trend-date">${new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getMealTypeIcon(mealType) {
        const icons = {
            breakfast: '🌅',
            morningSnack: '🍎',
            lunch: '🥗',
            afternoonSnack: '🥜',
            dinner: '🍽️',
            eveningSnack: '🍓',
            snack: '🥨'
        };
        return icons[mealType] || '🍽️';
    }

    formatMealTypeName(mealType) {
        const names = {
            breakfast: 'Breakfast',
            morningSnack: 'Morning Snack',
            lunch: 'Lunch',
            afternoonSnack: 'Afternoon Snack',
            dinner: 'Dinner',
            eveningSnack: 'Evening Snack',
            snack: 'Snack'
        };
        return names[mealType] || mealType;
    }

    updateDayAdherence(adherenceData) {
        Object.keys(adherenceData).forEach(dayKey => {
            const dayNumber = dayKey.replace('day', '');
            const dayData = adherenceData[dayKey];
            
            let dayCompleted = 0;
            let dayTotal = 0;
            
            Object.values(dayData).forEach(meal => {
                dayTotal++;
                if (meal.completed) {
                    dayCompleted++;
                }
            });
            
            const dayPercentage = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
            const dayElement = document.getElementById(`day${dayNumber}-adherence`);
            
            if (dayElement) {
                dayElement.textContent = `${dayPercentage}%`;
                dayElement.className = `adherence-percentage ${this.getAdherenceClass(dayPercentage)}`;
            }
        });
    }

    getAdherenceClass(percentage) {
        if (percentage >= 80) return 'high';
        if (percentage >= 60) return 'medium';
        return 'low';
    }

    async initializeAdherenceTracking(mealPlan) {
        try {
            // Load existing adherence data
            const adherenceData = await this.nutritionService.getMealAdherence(mealPlan.id);
            
            // Update UI based on existing data
            Object.keys(adherenceData).forEach(dayKey => {
                const dayNumber = dayKey.replace('day', '');
                const dayData = adherenceData[dayKey];
                
                Object.keys(dayData).forEach(mealType => {
                    const mealData = dayData[mealType];
                    const button = document.querySelector(
                        `[data-plan-id="${mealPlan.id}"][data-day="${dayNumber}"][data-meal="${mealType}"]`
                    );
                    
                    if (button && mealData.completed) {
                        this.updateAdherenceButton(button, true);
                    }
                });
            });
            
            // Update statistics
            this.updateAdherenceStats(mealPlan.id);
            
        } catch (error) {
            console.error('Error initializing adherence tracking:', error);
        }
    }

    async loadExistingMealPlan() {
        try {
            const latestPlan = await this.nutritionService.getLatestMealPlan();
            if (latestPlan && latestPlan.mealPlan) {
                this.currentMealPlan = latestPlan.mealPlan;
                this.displayMealPlan(latestPlan.mealPlan);
            }
        } catch (error) {
            console.error('Error loading existing meal plan:', error);
        }
    }

    updateCuisineInfo(cuisine) {
        const cuisines = this.nutritionService.getSupportedCuisines();
        const selectedCuisine = cuisines.find(c => c.value === cuisine);
        
        if (selectedCuisine) {
            // Show cuisine characteristics
            let infoElement = document.getElementById('cuisine-info');
            if (!infoElement) {
                infoElement = document.createElement('div');
                infoElement.id = 'cuisine-info';
                infoElement.className = 'cuisine-info';
                document.getElementById('cuisine-select').parentNode.appendChild(infoElement);
            }
            
            infoElement.innerHTML = `
                <div class="cuisine-characteristics">
                    <strong>${selectedCuisine.label} characteristics:</strong>
                    ${selectedCuisine.characteristics.join(', ')}
                </div>
            `;
        }
    }

    updateDietaryRestrictions() {
        const checkedBoxes = document.querySelectorAll('.dietary-restrictions input[type="checkbox"]:checked');
        const restrictions = Array.from(checkedBoxes).map(cb => cb.value);
        
        // Show restriction info
        let infoElement = document.getElementById('restrictions-info');
        if (!infoElement && restrictions.length > 0) {
            infoElement = document.createElement('div');
            infoElement.id = 'restrictions-info';
            infoElement.className = 'restrictions-info';
            document.querySelector('.dietary-restrictions').appendChild(infoElement);
        }
        
        if (infoElement) {
            if (restrictions.length > 0) {
                const restrictionDetails = this.nutritionService.getSupportedDietaryRestrictions()
                    .filter(r => restrictions.includes(r.value));
                
                infoElement.innerHTML = `
                    <div class="active-restrictions">
                        <strong>Active restrictions:</strong>
                        ${restrictionDetails.map(r => `<span class="restriction-tag">${r.label}</span>`).join('')}
                    </div>
                `;
            } else {
                infoElement.innerHTML = '';
            }
        }
    }

    async handleRegenerateMealPlan() {
        const confirmed = confirm('Generate a new meal plan? This will replace your current plan.');
        if (confirmed) {
            await this.handleGenerateMealPlan();
        }
    }

    async handleSaveMealPlan() {
        if (!this.currentMealPlan) {
            this.showNotification('No meal plan to save', 'warning');
            return;
        }

        try {
            // The meal plan is already saved when generated, so this is just user feedback
            this.showNotification('Meal plan saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving meal plan:', error);
            this.showNotification('Failed to save meal plan', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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

// Initialize nutrition UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for nutrition service to be available
    if (window.nutritionService) {
        window.nutritionUI = new NutritionUI();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (window.nutritionService) {
                window.nutritionUI = new NutritionUI();
            }
        }, 1000);
    }
});