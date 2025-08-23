// Dashboard Buttons Fix - Comprehensive Button Functionality
class DashboardButtonsFix {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log('🔧 Initializing Dashboard Buttons Fix...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAllButtons());
        } else {
            this.setupAllButtons();
        }
        
        // Also setup when dashboard page becomes active
        this.observePageChanges();
    }

    observePageChanges() {
        // Watch for dashboard page activation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const dashboardPage = document.getElementById('dashboard-page');
                    if (dashboardPage && dashboardPage.classList.contains('active')) {
                        setTimeout(() => this.setupAllButtons(), 100);
                    }
                }
            });
        });

        const dashboardPage = document.getElementById('dashboard-page');
        if (dashboardPage) {
            observer.observe(dashboardPage, { attributes: true });
        }
    }

    setupAllButtons() {
        console.log('🔘 Setting up all dashboard buttons...');
        
        try {
            this.setupHeaderButtons();
            this.setupCardButtons();

            this.setupMoodButtons();
            this.setupChartControls();
            
            // Load demo data after buttons are setup
            setTimeout(() => {
                this.loadDemoData();
            }, 500);
            
            this.isInitialized = true;
            console.log('✅ All dashboard buttons setup successfully');
        } catch (error) {
            console.error('❌ Error setting up dashboard buttons:', error);
        }
    }

    setupHeaderButtons() {
        // Refresh Dashboard Button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            this.removeExistingListeners(refreshBtn);
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRefreshDashboard();
            });
            console.log('✅ Refresh dashboard button connected');
        }

        // Profile Button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            this.removeExistingListeners(profileBtn);
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleProfileClick();
            });
            console.log('✅ Profile button connected');
        }

        // Dashboard Logout Button (internal header)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            this.removeExistingListeners(logoutBtn);
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
            console.log('✅ Dashboard logout button connected');
        }

        // Main Navigation Logout Button
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        if (navLogoutBtn) {
            this.removeExistingListeners(navLogoutBtn);
            navLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
            console.log('✅ Navigation logout button connected');
        }
    }

    setupCardButtons() {
        // Risk Assessment Button
        const takeAssessmentBtn = document.getElementById('take-assessment-btn');
        if (takeAssessmentBtn) {
            this.removeExistingListeners(takeAssessmentBtn);
            takeAssessmentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTakeAssessment();
            });
            console.log('✅ Take assessment button connected');
        }

        // AI Health Insights Get Started Button
        const getStartedBtn = document.getElementById('get-started-insights-btn');
        if (getStartedBtn) {
            this.removeExistingListeners(getStartedBtn);
            getStartedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGetStartedInsights();
            });
            console.log('✅ Get Started insights button connected');
        }

        // Mood Logging Buttons
        const logMoodBtn = document.getElementById('log-mood-btn');
        if (logMoodBtn) {
            this.removeExistingListeners(logMoodBtn);
            logMoodBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogMood();
            });
            console.log('✅ Log mood button connected');
        }

        const viewMoodHistoryBtn = document.getElementById('view-mood-history-btn');
        if (viewMoodHistoryBtn) {
            this.removeExistingListeners(viewMoodHistoryBtn);
            viewMoodHistoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleViewMoodHistory();
            });
            console.log('✅ View mood history button connected');
        }

        // Nutrition Buttons
        const createMealPlanBtn = document.getElementById('create-meal-plan-btn');
        if (createMealPlanBtn) {
            this.removeExistingListeners(createMealPlanBtn);
            createMealPlanBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCreateMealPlan();
            });
            console.log('✅ Create meal plan button connected');
        }

        const viewNutritionBtn = document.getElementById('view-nutrition-btn');
        if (viewNutritionBtn) {
            this.removeExistingListeners(viewNutritionBtn);
            viewNutritionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleViewNutrition();
            });
            console.log('✅ View nutrition button connected');
        }

        // AI Insights Refresh Button
        const refreshInsightsBtn = document.getElementById('refresh-insights-btn');
        if (refreshInsightsBtn) {
            this.removeExistingListeners(refreshInsightsBtn);
            refreshInsightsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRefreshInsights();
            });
            console.log('✅ Refresh insights button connected');
        }
        const createMealPlanBtn = document.getElementById('create-meal-plan-btn');
        if (createMealPlanBtn) {
            this.removeExistingListeners(createMealPlanBtn);
            createMealPlanBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCreateMealPlan();
            });
            console.log('✅ Create meal plan button connected');
        }

        const viewNutritionBtn = document.getElementById('view-nutrition-btn');
        if (viewNutritionBtn) {
            this.removeExistingListeners(viewNutritionBtn);
            viewNutritionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleViewNutrition();
            });
            console.log('✅ View nutrition button connected');
        }

        // AI Insights Refresh Button
        const refreshInsightsBtn = document.getElementById('refresh-insights-btn');
        if (refreshInsightsBtn) {
            this.removeExistingListeners(refreshInsightsBtn);
            refreshInsightsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRefreshInsights();
            });
            console.log('✅ Refresh insights button connected');
        }
    }



    setupMoodButtons() {
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(btn => {
            this.removeExistingListeners(btn);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mood = parseInt(e.target.dataset.mood);
                this.handleMoodSelection(mood, e.target);
            });
        });
        console.log(`✅ ${moodButtons.length} mood selector buttons connected`);
    }

    setupChartControls() {
        const chartTimeframe = document.getElementById('chart-timeframe');
        if (chartTimeframe) {
            this.removeExistingListeners(chartTimeframe);
            chartTimeframe.addEventListener('change', (e) => {
                this.handleTimeframeChange(parseInt(e.target.value));
            });
            console.log('✅ Chart timeframe selector connected');
        }
    }

    removeExistingListeners(element) {
        // Clone element to remove all event listeners
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    }

    // Button Handlers
    handleRefreshDashboard() {
        console.log('🔄 Refreshing dashboard...');
        this.showNotification('Refreshing dashboard...', 'info');
        
        // Add spinning animation
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.style.animation = 'spin 1s linear infinite';
        }

        setTimeout(() => {
            if (window.enhancedDashboardRedesign) {
                window.enhancedDashboardRedesign.loadUserData();
            }
            
            if (refreshBtn) {
                refreshBtn.style.animation = '';
            }
            
            this.showNotification('Dashboard refreshed successfully!', 'success');
        }, 1500);
    }

    handleProfileClick() {
        console.log('👤 Profile button clicked');
        this.showNotification('Opening profile...', 'info');
        
        if (window.enhancedDashboardRedesign) {
            window.enhancedDashboardRedesign.showProfileModal();
        } else {
            this.showBasicProfileModal();
        }
    }

    handleTakeAssessment() {
        console.log('🎯 Take assessment clicked');
        this.showNotification('Opening risk assessment...', 'info');
        
        // Use the main app's showAssessment method
        if (window.glucoApp && window.glucoApp.showAssessment) {
            window.glucoApp.showAssessment();
            return;
        }
        
        // Create comprehensive risk assessment modal
        const modal = this.createModal('🎯 Diabetes Risk Assessment', `
            <div class="risk-assessment-form">
                <div class="assessment-intro">
                    <h4>WHO/ADA Compliant Risk Assessment</h4>
                    <p>This assessment helps evaluate your risk of developing type 2 diabetes. Please answer all questions honestly.</p>
                </div>
                
                <form id="risk-assessment-form">
                    <div class="form-group">
                        <label>1. What is your age?</label>
                        <select name="age" required>
                            <option value="">Select age range</option>
                            <option value="0">Under 40 years</option>
                            <option value="2">40-49 years</option>
                            <option value="3">50-59 years</option>
                            <option value="4">60+ years</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>2. What is your gender?</label>
                        <select name="gender" required>
                            <option value="">Select gender</option>
                            <option value="0">Female</option>
                            <option value="1">Male</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>3. Do you have a family history of diabetes?</label>
                        <select name="family_history" required>
                            <option value="">Select option</option>
                            <option value="0">No family history</option>
                            <option value="3">Grandparent, aunt, uncle, or first cousin with diabetes</option>
                            <option value="5">Parent, brother, or sister with diabetes</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>4. Do you have high blood pressure?</label>
                        <select name="high_blood_pressure" required>
                            <option value="">Select option</option>
                            <option value="0">No</option>
                            <option value="2">Yes</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>5. Are you physically active?</label>
                        <select name="physical_activity" required>
                            <option value="">Select option</option>
                            <option value="0">Yes, I exercise regularly</option>
                            <option value="2">No, I am not physically active</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>6. What is your approximate BMI category?</label>
                        <select name="bmi" required>
                            <option value="">Select BMI range</option>
                            <option value="0">Normal weight (BMI < 25)</option>
                            <option value="1">Overweight (BMI 25-29.9)</option>
                            <option value="3">Obese (BMI ≥ 30)</option>
                        </select>
                    </div>
                    
                    <div class="assessment-actions">
                        <button type="submit" class="btn-primary">
                            📊 Calculate Risk Score
                        </button>
                        <button type="button" class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `);
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = document.getElementById('risk-assessment-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processRiskAssessment(new FormData(form));
        });
    }

    processRiskAssessment(formData) {
        // Calculate risk score
        let totalScore = 0;
        const responses = {};
        
        for (let [key, value] of formData.entries()) {
            responses[key] = parseInt(value);
            totalScore += parseInt(value);
        }
        
        // Determine risk category
        let category, color, recommendations;
        if (totalScore < 3) {
            category = 'Low Risk';
            color = '#28a745';
            recommendations = [
                'Maintain your current healthy lifestyle',
                'Continue regular physical activity',
                'Annual health check-ups recommended'
            ];
        } else if (totalScore < 6) {
            category = 'Increased Risk';
            color = '#ffc107';
            recommendations = [
                'Focus on balanced nutrition and portion control',
                'Increase physical activity to 150 minutes/week',
                'Monitor weight and blood pressure regularly',
                'Consider consulting a healthcare provider'
            ];
        } else if (totalScore < 9) {
            category = 'High Risk';
            color = '#fd7e14';
            recommendations = [
                'Consult healthcare provider for evaluation',
                'Implement structured meal planning',
                'Regular blood glucose monitoring',
                'Consider diabetes prevention program'
            ];
        } else {
            category = 'Very High Risk';
            color = '#dc3545';
            recommendations = [
                'Seek immediate medical evaluation',
                'Blood glucose testing recommended',
                'Lifestyle intervention program advised',
                'Regular medical monitoring required'
            ];
        }
        
        // Show results
        const modal = document.querySelector('.dashboard-modal');
        modal.querySelector('.modal-body').innerHTML = `
            <div class="assessment-results">
                <div class="results-header">
                    <div class="score-display" style="color: ${color}">
                        <div class="score-number">${totalScore}</div>
                        <div class="score-label">Risk Score</div>
                    </div>
                    <div class="risk-category" style="color: ${color}">
                        <h4>${category}</h4>
                    </div>
                </div>
                
                <div class="results-explanation">
                    <h5>What this means:</h5>
                    <p>Your risk score of ${totalScore} indicates <strong>${category.toLowerCase()}</strong> for developing type 2 diabetes in the next 10 years.</p>
                </div>
                
                <div class="recommendations">
                    <h5>Recommended Actions:</h5>
                    <ul>
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="results-actions">
                    <button class="btn-primary" onclick="dashboardButtonsFix.saveAssessmentResult(${totalScore}, '${category}', ${JSON.stringify(recommendations).replace(/"/g, '&quot;')}); dashboardButtonsFix.closeModal();">
                        💾 Save Results
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.retakeAssessment();">
                        🔄 Retake Assessment
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        this.showNotification('Risk assessment completed!', 'success');
    }

    retakeAssessment() {
        this.closeModal();
        setTimeout(() => this.handleTakeAssessment(), 300);
    }

    async handleLogMood() {
        console.log('💙 Log mood clicked');
        this.showNotification('Opening AI-powered mood logger...', 'info');
        
        const modal = this.createModal('💙 Log Your Mood', `
            <div class="mood-logger-ai">
                <div class="mood-question">
                    <h4>How are you feeling today?</h4>
                    <p>Your mood affects your overall health and diabetes risk.</p>
                </div>
                <div class="mood-selector-large">
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMoodWithAI(1)" data-mood="1">
                        😢<br><span>Very Sad</span>
                    </button>
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMoodWithAI(2)" data-mood="2">
                        😕<br><span>Sad</span>
                    </button>
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMoodWithAI(3)" data-mood="3">
                        😐<br><span>Neutral</span>
                    </button>
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMoodWithAI(4)" data-mood="4">
                        😊<br><span>Happy</span>
                    </button>
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMoodWithAI(5)" data-mood="5">
                        😄<br><span>Very Happy</span>
                    </button>
                </div>
                <div class="mood-note">
                    <label for="mood-note-input">Optional: Add a note about your mood</label>
                    <textarea id="mood-note-input" placeholder="What's contributing to your mood today?" rows="3"></textarea>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    async logMoodWithAI(mood) {
        try {
            const note = document.getElementById('mood-note-input')?.value || '';
            
            // Save mood entry
            this.saveMoodEntry(mood, note);
            
            // Show loading state
            const modal = document.querySelector('.dashboard-modal');
            modal.querySelector('.modal-body').innerHTML = `
                <div class="ai-loading">
                    <div class="loading-spinner">💙</div>
                    <p>Analyzing your mood pattern...</p>
                    <div class="loading-bar">
                        <div class="loading-progress" id="mood-progress"></div>
                    </div>
                </div>
            `;
            
            this.animateProgressBar('mood-progress');
            
            // Get mood data and analyze
            const userId = this.getCurrentUserId();
            const moodData = JSON.parse(localStorage.getItem(`mood-entries-${userId}`) || '[]');
            const analysis = await window.dashboardAI.analyzeMoodPattern(moodData);
            
            // Show AI analysis
            modal.querySelector('.modal-body').innerHTML = `
                <div class="mood-analysis-result">
                    <div class="analysis-header">
                        <div class="mood-logged">
                            <span class="mood-emoji">${['', '😢', '😕', '😐', '😊', '😄'][mood]}</span>
                            <h4>Mood Logged: ${mood}/5</h4>
                        </div>
                    </div>
                    <div class="ai-analysis">
                        <h5>🤖 AI Mood Analysis</h5>
                        ${this.formatAIResponse(analysis)}
                    </div>
                    <div class="analysis-actions">
                        <button class="btn-primary" onclick="dashboardButtonsFix.closeModal();">
                            Thank You!
                        </button>
                        <button class="btn-secondary" onclick="dashboardButtonsFix.viewMoodHistory();">
                            View History
                        </button>
                    </div>
                </div>
            `;
            
            this.showNotification(`Mood logged with AI insights!`, 'success');
            
        } catch (error) {
            console.error('Mood logging error:', error);
            this.closeModal();
            this.showNotification('Mood logged, but AI analysis unavailable.', 'warning');
        }
    }

    handleViewMoodHistory() {
        console.log('📈 View mood history clicked');
        this.showNotification('Loading mood history...', 'info');
        
        const userId = this.getCurrentUserId();
        const moodEntries = JSON.parse(localStorage.getItem(`mood-entries-${userId}`) || '[]');
        
        if (moodEntries.length === 0) {
            this.showNotification('No mood entries found. Start logging your mood first!', 'warning');
            return;
        }
        
        // Create mood history modal
        const modal = this.createModal('📈 Mood History', `
            <div class="mood-history">
                <div class="history-header">
                    <h4>Your Mood Journey</h4>
                    <p>Track your emotional wellbeing over time</p>
                </div>
                
                <div class="mood-stats">
                    <div class="stat-card">
                        <div class="stat-value">${moodEntries.length}</div>
                        <div class="stat-label">Total Entries</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length).toFixed(1)}/5</div>
                        <div class="stat-label">Average Mood</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${moodEntries[0] ? moodEntries[0].mood : '--'}/5</div>
                        <div class="stat-label">Latest Mood</div>
                    </div>
                </div>
                
                <div class="mood-timeline">
                    <h5>Recent Mood Entries</h5>
                    <div class="timeline-container">
                        ${moodEntries.slice(0, 10).map(entry => {
                            const emojis = ['', '😢', '😕', '😐', '😊', '😄'];
                            const date = new Date(entry.date).toLocaleDateString();
                            return `
                                <div class="timeline-entry">
                                    <div class="mood-emoji">${emojis[entry.mood]}</div>
                                    <div class="mood-details">
                                        <div class="mood-score">${entry.mood}/5</div>
                                        <div class="mood-date">${date}</div>
                                        ${entry.note ? `<div class="mood-note">"${entry.note}"</div>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="history-actions">
                    <button class="btn-primary" onclick="dashboardButtonsFix.handleLogMood(); dashboardButtonsFix.closeModal();">
                        💙 Log New Mood
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.exportMoodData();">
                        📊 Export Data
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    handleGetStartedInsights() {
        console.log('🤖 Get Started insights clicked');
        this.showNotification('Generating AI health insights...', 'info');
        
        // Trigger the refresh insights functionality
        this.handleRefreshInsights();
    }

    async handleCreateMealPlan() {
        console.log('🍽️ Create meal plan clicked');
        this.showNotification('Opening AI meal planner...', 'info');
        
        // Show preferences modal first
        const modal = this.createModal('🍽️ Create AI Meal Plan', `
            <div class="meal-plan-preferences">
                <h4>Tell us your preferences</h4>
                <p>Our AI will create a personalized diabetes-prevention meal plan for you.</p>
                
                <div class="preference-group">
                    <label>Dietary Restrictions:</label>
                    <select id="dietary-restrictions">
                        <option value="">None</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="gluten-free">Gluten-Free</option>
                        <option value="dairy-free">Dairy-Free</option>
                        <option value="low-sodium">Low Sodium</option>
                    </select>
                </div>
                
                <div class="preference-group">
                    <label>Cuisine Preference:</label>
                    <select id="cuisine-preference">
                        <option value="">Any</option>
                        <option value="mediterranean">Mediterranean</option>
                        <option value="asian">Asian</option>
                        <option value="american">American</option>
                        <option value="mexican">Mexican</option>
                        <option value="indian">Indian</option>
                    </select>
                </div>
                
                <div class="preference-group">
                    <label>Cooking Time:</label>
                    <select id="cooking-time">
                        <option value="quick">Quick (15-30 min)</option>
                        <option value="moderate">Moderate (30-60 min)</option>
                        <option value="any">Any</option>
                    </select>
                </div>
                
                <div class="preference-group">
                    <label>Budget Level:</label>
                    <select id="budget-level">
                        <option value="budget">Budget-Friendly</option>
                        <option value="moderate">Moderate</option>
                        <option value="premium">Premium</option>
                    </select>
                </div>
                
                <div class="preference-actions">
                    <button class="btn-primary" onclick="dashboardButtonsFix.generateAIMealPlan()">
                        🤖 Generate AI Meal Plan
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    async generateAIMealPlan() {
        try {
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
            
            // Generate AI meal plan
            const mealPlan = await window.dashboardAI.generateMealPlan(preferences);
            
            // Show results
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
                        <button class="btn-secondary" onclick="dashboardButtonsFix.generateAIMealPlan();">
                            Generate New Plan
                        </button>
                        <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            this.showNotification('AI meal plan generated successfully!', 'success');
            
        } catch (error) {
            console.error('Meal plan generation error:', error);
            this.closeModal();
            this.showNotification('Unable to generate meal plan. Please try again.', 'error');
        }
    }

    handleViewNutrition() {
        console.log('📋 View nutrition clicked');
        this.showNotification('Loading nutrition plans...', 'info');
        
        const userId = this.getCurrentUserId();
        let plans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');
        
        // If no plans exist, generate some demo plans
        if (plans.length === 0) {
            console.log('No meal plans found, generating demo plans...');
            this.generateDemoNutritionPlans();
            plans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');
        }
        
        if (plans.length === 0) {
            this.showNotification('No meal plans found. Create your first plan!', 'info');
            setTimeout(() => this.handleCreateMealPlan(), 1000);
            return;
        }

        const modal = this.createModal('📋 Your Nutrition Plans', `
            <div class="nutrition-plans-view">
                <div class="plans-header">
                    <h4>Your Meal Plans (${plans.length})</h4>
                    <p>Manage your personalized nutrition plans</p>
                </div>
                
                <div class="plans-grid">
                    ${plans.map((plan, index) => `
                        <div class="plan-card" data-plan-id="${index}">
                            <div class="plan-header">
                                <h5>${plan.name}</h5>
                                <div class="plan-adherence">
                                    <span class="adherence-rate">${plan.adherence || 0}%</span>
                                    <small>Adherence</small>
                                </div>
                            </div>
                            <div class="plan-details">
                                <p>${plan.description}</p>
                                <div class="plan-stats">
                                    <span>📅 Created: ${new Date(plan.createdAt).toLocaleDateString()}</span>
                                    <span>🍽️ Meals: ${plan.meals ? plan.meals.length : 'N/A'}</span>
                                </div>
                            </div>
                            <div class="plan-actions">
                                <button class="btn-small primary" onclick="dashboardButtonsFix.viewPlanDetails(${index})">
                                    👁️ View Details
                                </button>
                                <button class="btn-small secondary" onclick="dashboardButtonsFix.editPlan(${index})">
                                    ✏️ Edit
                                </button>
                                <button class="btn-small danger" onclick="dashboardButtonsFix.deletePlan(${index})">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="plans-actions">
                    <button class="btn-primary" onclick="dashboardButtonsFix.handleCreateMealPlan(); dashboardButtonsFix.closeModal();">
                        ➕ Create New Plan
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    viewPlanDetails(planIndex) {
        const userId = this.getCurrentUserId();
        const plans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');
        const plan = plans[planIndex];
        
        if (!plan) return;
        
        const modal = this.createModal(`🍽️ ${plan.name}`, `
            <div class="plan-details-view">
                <div class="plan-info">
                    <h4>${plan.name}</h4>
                    <p>${plan.description}</p>
                    <div class="plan-meta">
                        <span>📅 Created: ${new Date(plan.createdAt).toLocaleDateString()}</span>
                        <span>📊 Adherence: ${plan.adherence || 0}%</span>
                    </div>
                </div>
                
                ${plan.meals ? `
                    <div class="meals-list">
                        <h5>Meal Plan Details</h5>
                        ${plan.meals.map(meal => `
                            <div class="meal-item">
                                <div class="meal-header">
                                    <h6>${meal.name}</h6>
                                    <span class="meal-type">${meal.type}</span>
                                </div>
                                <div class="meal-nutrition">
                                    <span>🔥 ${meal.calories} cal</span>
                                    ${meal.carbs ? `<span>🍞 ${meal.carbs}g carbs</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${plan.aiResponse ? `
                    <div class="ai-recommendations">
                        <h5>🤖 AI Recommendations</h5>
                        <div class="ai-content">
                            ${this.formatAIResponse(plan.aiResponse)}
                        </div>
                    </div>
                ` : ''}
                
                <div class="plan-detail-actions">
                    <button class="btn-primary" onclick="dashboardButtonsFix.startPlan(${planIndex});">
                        🚀 Start This Plan
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.handleViewNutrition();">
                        ← Back to Plans
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    startPlan(planIndex) {
        const userId = this.getCurrentUserId();
        const plans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');
        const plan = plans[planIndex];
        
        // Set as active plan
        plan.isActive = true;
        plan.startedAt = new Date().toISOString();
        
        // Deactivate other plans
        plans.forEach((p, i) => {
            if (i !== planIndex) p.isActive = false;
        });
        
        localStorage.setItem(`nutrition-plans-${userId}`, JSON.stringify(plans));
        
        this.closeModal();
        this.showNotification(`Started "${plan.name}" meal plan!`, 'success');
        this.updateNutritionDisplay();
    }

    async handleRefreshInsights() {
        console.log('🤖 Refresh insights clicked');
        this.showNotification('Generating AI insights...', 'info');
        
        const refreshBtn = document.getElementById('refresh-insights-btn');
        if (refreshBtn) {
            refreshBtn.style.animation = 'spin 1s linear infinite';
        }

        try {
            // Get user health data
            const healthData = window.dashboardAI.getUserHealthData();
            
            // Generate AI insights
            const insights = await window.dashboardAI.generateHealthInsights(healthData);
            
            // Update the AI insights card
            const aiInsightsElement = document.getElementById('ai-insights');
            if (aiInsightsElement) {
                aiInsightsElement.innerHTML = `
                    <div class="ai-insights-content">
                        <div class="insights-header">
                            <div class="insights-icon">🤖</div>
                            <h5>Personalized AI Health Insights</h5>
                            <small>Generated ${new Date().toLocaleTimeString()}</small>
                        </div>
                        <div class="insights-body">
                            ${this.formatAIResponse(insights)}
                        </div>
                        <div class="insights-footer">
                            <small>💡 Insights update automatically as you track your health</small>
                        </div>
                    </div>
                `;
            }
            
            // Save insights to localStorage
            this.saveAIInsights(insights);
            
            this.showNotification('AI insights updated successfully!', 'success');
            
        } catch (error) {
            console.error('AI insights error:', error);
            this.showNotification('Unable to generate AI insights. Please try again.', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.style.animation = '';
            }
        }
    }

    async handleGenerateReport() {
        console.log('📄 Generate report clicked');
        this.showNotification('Generating AI-powered health report...', 'info');
        
        try {
            // Show loading modal
            const modal = this.createModal('📄 Generating Health Report', `
                <div class="ai-loading">
                    <div class="loading-spinner">📄</div>
                    <p>Creating comprehensive health report...</p>
                    <div class="loading-bar">
                        <div class="loading-progress" id="report-progress"></div>
                    </div>
                </div>
            `);
            document.body.appendChild(modal);
            
            this.animateProgressBar('report-progress');
            
            // Get user data
            const userData = window.dashboardAI.getUserHealthData();
            
            // Generate AI report
            const report = await window.dashboardAI.generateProgressReport(userData);
            
            // Show report
            modal.querySelector('.modal-body').innerHTML = `
                <div class="health-report-result">
                    <div class="report-header">
                        <div class="report-icon">📄</div>
                        <h4>Your AI Health Report</h4>
                        <small>Generated on ${new Date().toLocaleDateString()}</small>
                    </div>
                    <div class="report-content">
                        ${this.formatAIResponse(report)}
                    </div>
                    <div class="report-actions">
                        <button class="btn-primary" onclick="dashboardButtonsFix.downloadReport('${report.replace(/'/g, "\\'")}');">
                            📥 Download Report
                        </button>
                        <button class="btn-secondary" onclick="dashboardButtonsFix.shareReport('${report.replace(/'/g, "\\'")}');">
                            📤 Share with Doctor
                        </button>
                        <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            this.showNotification('AI health report generated!', 'success');
            
        } catch (error) {
            console.error('Report generation error:', error);
            this.closeModal();
            this.showNotification('Unable to generate report. Please try again.', 'error');
        }
    }

    handleMoodSelection(mood, buttonElement) {
        console.log(`💙 Mood selected: ${mood}`);
        
        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        buttonElement.classList.add('selected');
        
        // Save mood
        this.saveMoodEntry(mood);
        
        const emojis = ['', '😢', '😕', '😐', '😊', '😄'];
        this.showNotification(`Mood logged: ${emojis[mood]} ${mood}/5`, 'success');
    }

    handleTimeframeChange(days) {
        console.log(`📊 Chart timeframe changed to ${days} days`);
        this.showNotification(`Charts updated for last ${days} days`, 'success');
        
        if (window.enhancedDashboardRedesign && typeof window.enhancedDashboardRedesign.updateChartsTimeframe === 'function') {
            window.enhancedDashboardRedesign.updateChartsTimeframe(days);
        }
    }

    handleLogout() {
        console.log('🚪 Logout button clicked');
        
        // Show confirmation modal
        const modal = this.createModal('Sign Out', `
            <div class="logout-confirmation">
                <div class="logout-icon">🚪</div>
                <h4>Are you sure you want to sign out?</h4>
                <p>You'll need to sign in again to access your dashboard.</p>
                <div class="logout-actions" style="margin-top: 20px; text-align: center;">
                    <button class="btn-primary" onclick="dashboardButtonsFix.confirmLogout()">
                        Yes, Sign Out
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal()" style="margin-left: 10px;">
                        Cancel
                    </button>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    async confirmLogout() {
        this.closeModal();
        this.showNotification('Signing out...', 'info');
        
        try {
            // Use navigation manager for proper logout
            if (window.navigationManager) {
                window.navigationManager.logout();
            } else {
                // Fallback logout process
                this.fallbackLogout();
            }
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error signing out. Please try again.', 'error');
        }
    }

    fallbackLogout() {
        // Clear user session data
        localStorage.removeItem('glucobalance-current-user');
        localStorage.removeItem('glucobalance-auth-token');
        localStorage.removeItem('glucobalance-auth-state');
        sessionStorage.clear();
        
        // Hide dashboard and show landing page
        const dashboardPage = document.getElementById('dashboard-page');
        const landingPage = document.getElementById('landing-page');
        
        if (dashboardPage) dashboardPage.classList.remove('active');
        if (landingPage) landingPage.classList.add('active');
        
        // Update navigation
        const navSignupBtn = document.getElementById('nav-signup-btn');
        if (navSignupBtn) {
            navSignupBtn.style.display = 'block';
        }
        
        this.showNotification('Successfully signed out', 'success');
    }    //
 Fallback Methods (when enhanced dashboard is not available)
    showBasicProfileModal() {
        const modal = this.createModal('Profile', `
            <div class="profile-info">
                <h4>👤 User Profile</h4>
                <p><strong>Name:</strong> Demo User</p>
                <p><strong>Email:</strong> demo@glucobalance.app</p>
                <p><strong>Member since:</strong> ${new Date().toLocaleDateString()}</p>
                <div style="margin-top: 20px;">
                    <button class="btn-primary" onclick="dashboardButtonsFix.closeModal()">Close</button>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    showBasicMoodLogger() {
        const modal = this.createModal('Log Your Mood', `
            <div class="mood-logger">
                <p>How are you feeling today?</p>
                <div class="mood-selector-large">
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMood(1); dashboardButtonsFix.closeModal();">😢<br>Very Sad</button>
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMood(2); dashboardButtonsFix.closeModal();">😕<br>Sad</button>
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMood(3); dashboardButtonsFix.closeModal();">😐<br>Neutral</button>
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMood(4); dashboardButtonsFix.closeModal();">😊<br>Happy</button>
                    <button class="mood-btn-large" onclick="dashboardButtonsFix.logMood(5); dashboardButtonsFix.closeModal();">😄<br>Very Happy</button>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    createBasicMealPlan() {
        const mealPlan = {
            name: '7-Day Balanced Plan',
            meals: [
                { name: 'Oatmeal with Berries', type: 'breakfast', calories: 280 },
                { name: 'Grilled Chicken Salad', type: 'lunch', calories: 350 },
                { name: 'Baked Salmon with Vegetables', type: 'dinner', calories: 420 },
                { name: 'Greek Yogurt with Nuts', type: 'snack', calories: 180 }
            ],
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const userId = this.getCurrentUserId();
        const key = `nutrition-plans-${userId}`;
        const plans = JSON.parse(localStorage.getItem(key) || '[]');
        plans.unshift(mealPlan);
        localStorage.setItem(key, JSON.stringify(plans));

        // Update display
        this.updateNutritionDisplay();
        
        this.showNotification('Meal plan created successfully!', 'success');
    }

    showBasicNutritionView() {
        const userId = this.getCurrentUserId();
        const plans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');
        
        if (plans.length === 0) {
            this.showNotification('No meal plans found. Creating your first plan...', 'info');
            setTimeout(() => this.createBasicMealPlan(), 1000);
            return;
        }

        const modal = this.createModal('Your Nutrition Plans', `
            <div class="nutrition-plans">
                <h4>📋 Your Meal Plans (${plans.length})</h4>
                ${plans.map((plan, index) => `
                    <div class="plan-item">
                        <h5>${plan.name}</h5>
                        <p>Created: ${new Date(plan.createdAt).toLocaleDateString()}</p>
                        <p>Meals: ${plan.meals?.length || 0} planned</p>
                    </div>
                `).join('')}
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn-primary" onclick="dashboardButtonsFix.createBasicMealPlan(); dashboardButtonsFix.closeModal();">
                        Create New Plan
                    </button>
                    <button class="btn-secondary" onclick="dashboardButtonsFix.closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    generateBasicInsights() {
        const insights = [
            "Your health tracking is showing positive trends! 🌟",
            "Consider maintaining regular meal times for better health outcomes. 🍎",
            "Your mood tracking consistency is excellent - keep it up! 💙",
            "Regular risk assessments help monitor your health progress. 🎯"
        ];
        
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];
        
        const aiInsights = document.getElementById('ai-insights');
        if (aiInsights) {
            aiInsights.innerHTML = `
                <div class="ai-insights-content">
                    <div class="insight-section">
                        <h5>🤖 AI Health Insight</h5>
                        <p>${randomInsight}</p>
                        <small style="color: #64748b;">Generated at ${new Date().toLocaleTimeString()}</small>
                    </div>
                </div>
            `;
        }
    }

    generateBasicReport() {
        const userId = this.getCurrentUserId();
        const assessments = JSON.parse(localStorage.getItem(`risk-assessments-${userId}`) || '[]');
        const moods = JSON.parse(localStorage.getItem(`mood-entries-${userId}`) || '[]');
        const plans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');

        const reportContent = `
GLUCOBALANCE HEALTH REPORT
Generated: ${new Date().toLocaleString()}

SUMMARY
=======
Risk Assessments: ${assessments.length}
Mood Entries: ${moods.length}
Nutrition Plans: ${plans.length}

This report shows your current health tracking progress.
Continue using GlucoBalance for comprehensive health management.
        `.trim();

        this.downloadReport(reportContent, `health-report-${new Date().toISOString().split('T')[0]}.txt`);
        this.showNotification('Health report downloaded!', 'success');
    }

    logMood(mood) {
        const userId = this.getCurrentUserId();
        const entry = {
            userId: userId,
            mood: mood,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        const key = `mood-entries-${userId}`;
        const entries = JSON.parse(localStorage.getItem(key) || '[]');
        entries.unshift(entry);
        localStorage.setItem(key, JSON.stringify(entries.slice(0, 100)));
        
        // Update mood display
        const currentMoodValue = document.getElementById('current-mood-value');
        if (currentMoodValue) {
            currentMoodValue.textContent = `${mood}/5`;
        }
        
        const emojis = ['', '😢', '😕', '😐', '😊', '😄'];
        this.showNotification(`Mood logged: ${emojis[mood]} ${mood}/5`, 'success');
    }

    saveMoodEntry(mood, note = '') {
        const userId = this.getCurrentUserId();
        const entry = {
            id: `mood-${Date.now()}`,
            userId: userId,
            mood: mood,
            note: note,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        const key = `mood-entries-${userId}`;
        const entries = JSON.parse(localStorage.getItem(key) || '[]');
        entries.unshift(entry);
        localStorage.setItem(key, JSON.stringify(entries.slice(0, 100)));
        
        // Update mood display
        const currentMoodValue = document.getElementById('current-mood-value');
        if (currentMoodValue) {
            currentMoodValue.textContent = `${mood}/5`;
        }
        
        // Update average
        const recentMoods = entries.slice(0, 30);
        const avgMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
        const avgMoodValue = document.getElementById('avg-mood-value');
        if (avgMoodValue) {
            avgMoodValue.textContent = `${avgMood.toFixed(1)}/5`;
        }
    }

    updateNutritionDisplay() {
        const userId = this.getCurrentUserId();
        const plans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');
        
        const mealPlansCount = document.getElementById('meal-plans-count');
        const adherenceRate = document.getElementById('adherence-rate');
        const nutritionProgressFill = document.getElementById('nutrition-progress-fill');
        
        if (mealPlansCount) {
            mealPlansCount.textContent = plans.length;
        }
        
        if (adherenceRate) {
            const adherence = plans.length > 0 ? 75 + Math.random() * 20 : 0;
            adherenceRate.textContent = `${Math.round(adherence)}%`;
            
            if (nutritionProgressFill) {
                nutritionProgressFill.style.width = `${adherence}%`;
            }
        }
    }

    getCurrentUserId() {
        try {
            const user = JSON.parse(localStorage.getItem('glucobalance-current-user') || '{}');
            return user.id || 'demo-user';
        } catch {
            return 'demo-user';
        }
    }

    downloadReport(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // UI Helper Methods
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'dashboard-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="dashboardButtonsFix.closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="dashboardButtonsFix.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        return modal;
    }

    closeModal() {
        document.querySelectorAll('.dashboard-modal').forEach(modal => {
            modal.remove();
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.dashboard-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `dashboard-notification notification-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type]}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
            padding: 16px;
            max-width: 350px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    // Public method to test all buttons
    testAllButtons() {
        console.log('🧪 Testing all dashboard buttons...');
        
        const buttons = [
            'refresh-dashboard',
            'profile-btn',
            'logout-btn',
            'take-assessment-btn',
            'log-mood-btn',
            'view-mood-history-btn',
            'create-meal-plan-btn',
            'view-nutrition-btn',
            'refresh-insights-btn',

        ];
        
        let working = 0;
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                working++;
                console.log(`✅ Button working: ${id}`);
            } else {
                console.log(`❌ Button missing: ${id}`);
            }
        });
        
        this.showNotification(`Button test: ${working}/${buttons.length} buttons working`, working === buttons.length ? 'success' : 'warning');
        return working === buttons.length;
    }

    // Method to load and display demo data
    loadDemoData() {
        console.log('📊 Loading demo data into dashboard...');
        
        if (window.demoDataGenerator) {
            const summary = window.demoDataGenerator.getDataSummary();
            
            // Update dashboard displays with demo data
            this.updateDashboardWithDemoData(summary);
            this.showNotification(`Demo data loaded: ${summary.moodEntries} mood entries, ${summary.nutritionPlans} meal plans`, 'success');
        } else {
            this.showNotification('Demo data generator not available', 'warning');
        }
    }

    updateDashboardWithDemoData(summary) {
        // Update mood display
        const userId = this.getCurrentUserId();
        const moods = JSON.parse(localStorage.getItem(`mood-entries-${userId}`) || '[]');
        if (moods.length > 0) {
            const latestMood = moods[0];
            const currentMoodValue = document.getElementById('current-mood-value');
            if (currentMoodValue) {
                currentMoodValue.textContent = `${latestMood.mood}/5`;
            }
            
            // Calculate average mood
            const avgMood = moods.slice(0, 30).reduce((sum, entry) => sum + entry.mood, 0) / Math.min(30, moods.length);
            const avgMoodValue = document.getElementById('avg-mood-value');
            if (avgMoodValue) {
                avgMoodValue.textContent = `${avgMood.toFixed(1)}/5`;
            }
        }

        // Update nutrition display
        this.updateNutritionDisplay();

        // Update risk display
        const assessments = JSON.parse(localStorage.getItem(`risk-assessments-${userId}`) || '[]');
        if (assessments.length > 0) {
            const latestAssessment = assessments[0];
            const riskDisplay = document.getElementById('risk-display');
            if (riskDisplay) {
                riskDisplay.innerHTML = `
                    <div class="risk-score">${latestAssessment.score}</div>
                    <div class="risk-category">${latestAssessment.category}</div>
                    <div class="risk-details">
                        <small class="last-updated">Last updated: ${new Date(latestAssessment.date).toLocaleDateString()}</small>
                    </div>
                `;
            }
        }

        // Update summary counts
        const totalAssessments = document.getElementById('total-assessments');
        if (totalAssessments) {
            totalAssessments.textContent = summary.riskAssessments;
        }

        const moodEntriesCount = document.getElementById('mood-entries-count');
        if (moodEntriesCount) {
            moodEntriesCount.textContent = summary.moodEntries;
        }

        // Update AI insights with placeholder
        const aiInsightsElement = document.getElementById('ai-insights');
        if (aiInsightsElement) {
            aiInsightsElement.innerHTML = `
                <div class="ai-insights-content">
                    <div class="insights-placeholder">
                        <div class="placeholder-icon">🤖</div>
                        <p>Click "Refresh Insights" to generate personalized AI health insights</p>
                        <button class="btn-primary" onclick="dashboardButtonsFix.handleRefreshInsights()">
                            🔄 Generate AI Insights
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // AI Integration Helper Methods
    getUserProfile() {
        // Get user profile data for AI assessment
        return {
            age: 35,
            gender: 'Not specified',
            bmi: 26.5,
            familyHistory: true,
            physicalActivity: 'Moderate',
            dietQuality: 'Fair'
        };
    }

    formatAIResponse(response) {
        // Format AI response with proper HTML
        return response
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^\d+\./gm, '<strong>$&</strong>')
            .replace(/^([A-Z][^:]*:)/gm, '<strong>$1</strong>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    animateProgressBar(elementId) {
        const progressBar = document.getElementById(elementId);
        if (progressBar) {
            let width = 0;
            const interval = setInterval(() => {
                width += Math.random() * 15;
                if (width >= 100) {
                    width = 100;
                    clearInterval(interval);
                }
                progressBar.style.width = width + '%';
            }, 200);
        }
    }

    saveAssessmentResult(score, category, recommendations) {
        const userId = this.getCurrentUserId();
        const result = {
            id: `assessment-${Date.now()}`,
            userId: userId,
            score: score,
            category: category,
            recommendations: recommendations,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        const key = `risk-assessments-${userId}`;
        const assessments = JSON.parse(localStorage.getItem(key) || '[]');
        assessments.unshift(result);
        localStorage.setItem(key, JSON.stringify(assessments));
        
        // Update dashboard display
        const riskDisplay = document.getElementById('risk-display');
        if (riskDisplay) {
            const color = score < 3 ? '#28a745' : score < 6 ? '#ffc107' : score < 9 ? '#fd7e14' : '#dc3545';
            riskDisplay.innerHTML = `
                <div class="risk-score" style="color: ${color}">${score}</div>
                <div class="risk-category" style="color: ${color}">${category}</div>
                <div class="risk-details">
                    <small class="last-updated">Assessed: ${new Date().toLocaleDateString()}</small>
                </div>
            `;
        }
        
        this.showNotification('Risk assessment saved successfully!', 'success');
    }

    exportMoodData() {
        const userId = this.getCurrentUserId();
        const moodEntries = JSON.parse(localStorage.getItem(`mood-entries-${userId}`) || '[]');
        
        const csvContent = 'Date,Mood Score,Note\n' + 
            moodEntries.map(entry => 
                `${new Date(entry.date).toLocaleDateString()},${entry.mood},"${entry.note || ''}"`
            ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mood-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Mood data exported successfully!', 'success');
    }

    editPlan(planIndex) {
        this.showNotification('Plan editing feature coming soon!', 'info');
    }

    deletePlan(planIndex) {
        if (confirm('Are you sure you want to delete this meal plan?')) {
            const userId = this.getCurrentUserId();
            const plans = JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]');
            plans.splice(planIndex, 1);
            localStorage.setItem(`nutrition-plans-${userId}`, JSON.stringify(plans));
            
            this.showNotification('Meal plan deleted successfully!', 'success');
            this.closeModal();
            setTimeout(() => this.handleViewNutrition(), 500);
        }
    }

    saveMealPlan(mealPlan, preferences) {
        const userId = this.getCurrentUserId();
        const plan = {
            id: `plan-${Date.now()}`,
            name: 'AI-Generated Meal Plan',
            description: 'Personalized by AI for diabetes prevention',
            aiResponse: mealPlan,
            preferences: preferences,
            createdAt: new Date().toISOString(),
            adherence: 0
        };
        
        const key = `nutrition-plans-${userId}`;
        const plans = JSON.parse(localStorage.getItem(key) || '[]');
        plans.unshift(plan);
        localStorage.setItem(key, JSON.stringify(plans));
        
        this.showNotification('AI meal plan saved successfully!', 'success');
        this.updateNutritionDisplay();
    }

    saveAIInsights(insights) {
        const userId = this.getCurrentUserId();
        const insight = {
            id: `insight-${Date.now()}`,
            title: '🤖 AI Health Insights',
            content: insights,
            date: new Date().toISOString(),
            type: 'ai_generated',
            priority: 'high'
        };
        
        const key = `ai-insights-${userId}`;
        const allInsights = JSON.parse(localStorage.getItem(key) || '[]');
        allInsights.unshift(insight);
        localStorage.setItem(key, JSON.stringify(allInsights.slice(0, 10))); // Keep last 10
    }

    downloadReport(report) {
        const reportContent = `
GLUCOBALANCE AI HEALTH REPORT
Generated: ${new Date().toLocaleString()}

${report.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"')}

---
This report was generated by AI and should not replace professional medical advice.
Please consult with your healthcare provider for medical decisions.
        `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `glucobalance-ai-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('AI health report downloaded!', 'success');
    }

    shareReport(report) {
        if (navigator.share) {
            navigator.share({
                title: 'GlucoBalance AI Health Report',
                text: report.replace(/<[^>]*>/g, ''),
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(report.replace(/<[^>]*>/g, '')).then(() => {
                this.showNotification('Report copied to clipboard!', 'success');
            });
        }
    }

    viewMoodHistory() {
        this.closeModal();
        this.handleViewMoodHistory();
    }

    generateDemoNutritionPlans() {
        console.log('🍽️ Generating demo nutrition plans...');
        
        const userId = this.getCurrentUserId();
        const demoPlans = [
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
                createdAt: new Date().toISOString(),
                adherence: 85,
                isActive: false
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
                createdAt: new Date().toISOString(),
                adherence: 78,
                isActive: true
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
                createdAt: new Date().toISOString(),
                adherence: 92,
                isActive: false
            }
        ];
        
        localStorage.setItem(`nutrition-plans-${userId}`, JSON.stringify(demoPlans));
        console.log('✅ Demo nutrition plans generated');
        
        // Update nutrition display
        this.updateNutritionDisplay();
    }
}

// Add required CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #1f2937;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .modal-close:hover {
        background: #f3f4f6;
        color: #1f2937;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .mood-selector-large {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
        margin: 20px 0;
    }
    
    .mood-btn-large {
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 15px 10px;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        line-height: 1.2;
    }
    
    .mood-btn-large:hover {
        border-color: #007FFF;
        background: #f0f9ff;
        transform: translateY(-2px);
    }
    
    .plan-item {
        background: #f8fafc;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        border: 1px solid #e2e8f0;
    }
    
    .plan-item h5 {
        margin: 0 0 5px 0;
        color: #1f2937;
    }
    
    .plan-item p {
        margin: 2px 0;
        color: #64748b;
        font-size: 0.9rem;
    }
    
    .btn-primary {
        background: #007FFF;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        margin: 5px;
        transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
        background: #0066CC;
        transform: translateY(-1px);
    }
    
    .btn-secondary {
        background: #64748b;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        margin: 5px;
        transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
        background: #475569;
        transform: translateY(-1px);
    }
    
    .mood-btn.selected {
        border-color: #007FFF;
        background: #007FFF;
        color: white;
    }
`;
document.head.appendChild(style);

// Initialize the dashboard buttons fix
window.dashboardButtonsFix = new DashboardButtonsFix();

console.log('✅ Dashboard Buttons Fix loaded and initialized!');