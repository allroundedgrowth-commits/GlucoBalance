// Enhanced Dashboard Redesign - Modern, Clean, and Fully Functional
class EnhancedDashboardRedesign {
    constructor() {
        this.currentUser = null;
        this.dashboardData = {};
        this.charts = {};
        this.refreshInterval = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        console.log('🎨 Initializing Enhanced Dashboard Redesign...');
        this.setupEventListeners();
        this.initializeDatabase();
        this.loadUserData();
        this.setupRealTimeUpdates();
        this.applyModernStyling();
        console.log('✅ Enhanced Dashboard Redesign initialized');
    }

    async initializeDatabase() {
        // Ensure database is properly initialized
        if (!window.kiroDb) {
            window.kiroDb = new KiroDatabase();
            await window.kiroDb.init();
        }
        
        // Generate sample data if none exists
        await this.generateSampleDataIfNeeded();
    }

    async generateSampleDataIfNeeded() {
        const user = this.getCurrentUser();
        if (!user) {
            // Create sample user
            const sampleUser = {
                id: 'sample-user-' + Date.now(),
                name: 'Demo User',
                email: 'demo@glucobalance.app',
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('glucobalance-current-user', JSON.stringify(sampleUser));
            this.currentUser = sampleUser.id;
        } else {
            this.currentUser = user.id;
        }

        // Generate comprehensive sample data
        await this.generateComprehensiveSampleData();
    }

    async generateComprehensiveSampleData() {
        const userId = this.currentUser;
        
        // Generate risk assessments
        const assessments = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7));
            
            assessments.push({
                userId: userId,
                score: Math.floor(Math.random() * 20) + 5,
                category: this.getRiskCategory(Math.floor(Math.random() * 20) + 5),
                responses: {},
                createdAt: date.toISOString(),
                date: date.toISOString()
            });
        }
        
        if (window.kiroDb) {
            for (const assessment of assessments) {
                await window.kiroDb.saveAssessment(assessment);
            }
        }
        
        // Generate mood entries
        const moods = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            moods.push({
                userId: userId,
                mood: Math.floor(Math.random() * 5) + 1,
                date: date.toISOString(),
                timestamp: date.getTime(),
                notes: `Mood entry for ${date.toDateString()}`
            });
        }
        
        if (window.kiroDb) {
            for (const mood of moods) {
                await window.kiroDb.saveMood(mood);
            }
        }
        
        console.log('✅ Sample data generated successfully');
    }    setup
EventListeners() {
        // Dashboard refresh
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.refreshDashboard();
        });

        // Profile button
        document.getElementById('profile-btn')?.addEventListener('click', () => {
            this.showProfileModal();
        });

        // Card action buttons
        document.getElementById('take-assessment-btn')?.addEventListener('click', () => {
            this.launchRiskAssessment();
        });

        document.getElementById('log-mood-btn')?.addEventListener('click', () => {
            this.showMoodLogger();
        });

        document.getElementById('view-mood-history-btn')?.addEventListener('click', () => {
            this.showMoodHistory();
        });

        document.getElementById('create-meal-plan-btn')?.addEventListener('click', () => {
            this.createMealPlan();
        });

        document.getElementById('view-nutrition-btn')?.addEventListener('click', () => {
            this.viewNutritionPlans();
        });

        document.getElementById('refresh-insights-btn')?.addEventListener('click', () => {
            this.generateAIInsights();
        });



        // Mood selector buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.recordMood(parseInt(e.target.dataset.mood), e.target);
            });
        });

        // Chart timeframe selector
        document.getElementById('chart-timeframe')?.addEventListener('change', (e) => {
            this.updateChartsTimeframe(parseInt(e.target.value));
        });
    }

    async loadUserData() {
        if (!this.currentUser) return;

        this.showLoadingState();
        
        try {
            await this.loadDashboardData();
            await this.renderDashboard();
            this.hideLoadingState();
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showErrorState('Failed to load dashboard data');
        }
    }

    async loadDashboardData() {
        const userId = this.currentUser;
        
        try {
            // Load data from database
            const [assessments, moods, nutritionPlans] = await Promise.all([
                window.kiroDb?.getUserAssessments(userId, 10) || [],
                window.kiroDb?.getUserMoods(userId, 30) || [],
                window.kiroDb?.getUserNutritionPlans(userId, 5) || []
            ]);

            this.dashboardData = {
                assessments: assessments,
                moods: moods,
                nutritionPlans: nutritionPlans,
                summary: this.calculateSummaryMetrics(assessments, moods, nutritionPlans)
            };

            console.log('✅ Dashboard data loaded:', this.dashboardData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to localStorage
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        const userId = this.currentUser;
        
        this.dashboardData = {
            assessments: JSON.parse(localStorage.getItem(`risk-assessments-${userId}`) || '[]'),
            moods: JSON.parse(localStorage.getItem(`mood-entries-${userId}`) || '[]'),
            nutritionPlans: JSON.parse(localStorage.getItem(`nutrition-plans-${userId}`) || '[]'),
            summary: {}
        };
        
        this.dashboardData.summary = this.calculateSummaryMetrics(
            this.dashboardData.assessments,
            this.dashboardData.moods,
            this.dashboardData.nutritionPlans
        );
    }

    calculateSummaryMetrics(assessments, moods, nutritionPlans) {
        const latestAssessment = assessments[0];
        const todaysMood = this.getTodaysMood(moods);
        const averageMood = this.calculateAverageMood(moods);
        
        return {
            latestRiskScore: latestAssessment?.score || null,
            latestRiskCategory: latestAssessment ? this.getRiskCategory(latestAssessment.score) : null,
            currentMood: todaysMood,
            averageMood: averageMood,
            totalAssessments: assessments.length,
            totalMoodEntries: moods.length,
            nutritionPlansCount: nutritionPlans.length,
            streakDays: this.calculateStreakDays(moods),
            improvementScore: this.calculateImprovementScore(assessments, moods),
            lastAssessmentDate: latestAssessment?.createdAt || null
        };
    }  
  async renderDashboard() {
        await Promise.all([
            this.renderRiskStatusCard(),
            this.renderMoodTrackerCard(),
            this.renderNutritionCard(),
            this.renderAIInsightsCard(),
            this.renderChartsSection(),
            this.renderHealthSummary()
        ]);
    }

    async renderRiskStatusCard() {
        const { summary } = this.dashboardData;
        const riskDisplay = document.getElementById('risk-display');
        const riskTrend = document.getElementById('risk-trend');
        
        if (!riskDisplay) return;

        if (summary.latestRiskScore !== null) {
            const category = summary.latestRiskCategory;
            const lastDate = new Date(summary.lastAssessmentDate).toLocaleDateString();
            
            riskDisplay.innerHTML = `
                <div class="risk-score risk-${category.toLowerCase().replace(' ', '-')}">${summary.latestRiskScore}</div>
                <div class="risk-category">${category} Risk</div>
                <div class="risk-details">
                    <small class="last-updated">Last assessed: ${lastDate}</small>
                </div>
            `;

            // Update trend
            const trend = this.calculateRiskTrend();
            riskTrend.innerHTML = `
                <span class="trend-icon ${trend.direction}">${trend.icon}</span>
                <span class="trend-text">${trend.text}</span>
            `;
        } else {
            riskDisplay.innerHTML = `
                <div class="risk-score">--</div>
                <div class="risk-category">Take Assessment</div>
                <div class="risk-details">
                    <small class="last-updated">Never assessed</small>
                </div>
            `;
        }
    }

    async renderMoodTrackerCard() {
        const { summary } = this.dashboardData;
        const currentMoodValue = document.getElementById('current-mood-value');
        const avgMoodValue = document.getElementById('avg-mood-value');
        const moodTrend = document.getElementById('mood-trend');

        if (currentMoodValue) {
            currentMoodValue.textContent = summary.currentMood ? `${summary.currentMood}/5` : '--';
        }
        
        if (avgMoodValue) {
            avgMoodValue.textContent = summary.averageMood ? summary.averageMood.toFixed(1) : '--';
        }

        // Update mood selector
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (summary.currentMood && btn.dataset.mood === summary.currentMood.toString()) {
                btn.classList.add('selected');
            }
        });

        // Update trend
        const trend = this.getMoodTrendData();
        if (moodTrend) {
            moodTrend.innerHTML = `
                <span class="trend-icon ${trend.direction}">${trend.icon}</span>
                <span class="trend-text">${trend.text}</span>
            `;
        }
    }

    async renderNutritionCard() {
        const { summary } = this.dashboardData;
        const mealPlansCount = document.getElementById('meal-plans-count');
        const adherenceRate = document.getElementById('adherence-rate');
        const nutritionProgressFill = document.getElementById('nutrition-progress-fill');

        if (mealPlansCount) {
            mealPlansCount.textContent = summary.nutritionPlansCount || 0;
        }
        
        if (adherenceRate) {
            const adherence = this.calculateNutritionAdherence();
            adherenceRate.textContent = adherence ? `${Math.round(adherence)}%` : '--%';
        }
        
        if (nutritionProgressFill) {
            const progressWidth = this.calculateNutritionAdherence() || 0;
            nutritionProgressFill.style.width = `${progressWidth}%`;
        }
    }

    async renderAIInsightsCard() {
        const aiInsights = document.getElementById('ai-insights');
        if (!aiInsights) return;

        const insights = await this.generatePersonalizedInsights();
        
        aiInsights.innerHTML = `
            <div class="ai-insights-content">
                <div class="insight-section">
                    <h5>📊 Your Progress</h5>
                    <p>${insights.progressSummary}</p>
                </div>
                
                <div class="insight-section">
                    <h5>💡 Recommendations</h5>
                    <ul class="recommendations-list">
                        ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="insight-section">
                    <h5>🎯 Focus Area</h5>
                    <p>${insights.focusArea}</p>
                </div>
            </div>
        `;
    }

    async renderChartsSection() {
        await Promise.all([
            this.renderRiskTrendChart(),
            this.renderMoodTrendChart(),
            this.renderNutritionChart()
        ]);
    }

    async renderRiskTrendChart() {
        const chartContainer = document.getElementById('risk-trend-chart');
        if (!chartContainer) return;

        const assessments = this.dashboardData.assessments.slice(0, 10).reverse();
        
        if (assessments.length === 0) {
            chartContainer.innerHTML = `
                <div class="no-data-state">
                    <div class="no-data-icon">📊</div>
                    <p>No risk assessments yet</p>
                    <button class="btn-primary" onclick="enhancedDashboardRedesign.launchRiskAssessment()">
                        Take First Assessment
                    </button>
                </div>
            `;
            return;
        }

        const maxScore = Math.max(...assessments.map(a => a.score), 25);
        const chartHTML = assessments.map((assessment, index) => {
            const height = (assessment.score / maxScore) * 100;
            const category = this.getRiskCategory(assessment.score);
            const date = new Date(assessment.createdAt).toLocaleDateString();
            
            return `
                <div class="chart-bar risk-${category.toLowerCase().replace(' ', '-')}" 
                     style="height: ${height}%" 
                     data-score="${assessment.score}"
                     data-date="${date}"
                     data-category="${category}"
                     title="Score: ${assessment.score} (${category}) - ${date}">
                    <div class="bar-value">${assessment.score}</div>
                </div>
            `;
        }).join('');

        chartContainer.innerHTML = `
            <div class="chart-content">
                ${chartHTML}
            </div>
            <div class="chart-footer">
                <small>Last ${assessments.length} assessments</small>
            </div>
        `;
    }    
async renderMoodTrendChart() {
        const chartContainer = document.getElementById('mood-trend-chart');
        if (!chartContainer) return;

        const moods = this.dashboardData.moods.slice(0, 14).reverse();
        
        if (moods.length === 0) {
            chartContainer.innerHTML = `
                <div class="no-data-state">
                    <div class="no-data-icon">💙</div>
                    <p>No mood entries yet</p>
                    <button class="btn-primary" onclick="enhancedDashboardRedesign.showMoodLogger()">
                        Log Your Mood
                    </button>
                </div>
            `;
            return;
        }

        const chartHTML = moods.map((mood, index) => {
            const height = (mood.mood / 5) * 100;
            const date = new Date(mood.date).toLocaleDateString();
            const emoji = this.getMoodEmoji(mood.mood);
            
            return `
                <div class="chart-bar mood-level-${mood.mood}" 
                     style="height: ${height}%" 
                     data-mood="${mood.mood}"
                     data-date="${date}"
                     title="Mood: ${mood.mood}/5 ${emoji} - ${date}">
                    <div class="bar-emoji">${emoji}</div>
                </div>
            `;
        }).join('');

        chartContainer.innerHTML = `
            <div class="chart-content">
                ${chartHTML}
            </div>
            <div class="chart-footer">
                <small>Last 14 days • Avg: ${this.dashboardData.summary.averageMood?.toFixed(1) || '--'}/5</small>
            </div>
        `;
    }

    async renderNutritionChart() {
        const chartContainer = document.getElementById('nutrition-chart');
        if (!chartContainer) return;

        const plans = this.dashboardData.nutritionPlans;
        
        if (plans.length === 0) {
            chartContainer.innerHTML = `
                <div class="no-data-state">
                    <div class="no-data-icon">🍎</div>
                    <p>No nutrition plans yet</p>
                    <button class="btn-primary" onclick="enhancedDashboardRedesign.createMealPlan()">
                        Create Meal Plan
                    </button>
                </div>
            `;
            return;
        }

        // Generate adherence data
        const adherenceData = plans.map((plan, index) => ({
            date: new Date(plan.createdAt).toLocaleDateString(),
            adherence: 70 + Math.random() * 30,
            planType: plan.planType || '3-day'
        }));

        const chartHTML = adherenceData.map((data, index) => {
            const height = data.adherence;
            const level = this.getNutritionLevel(data.adherence);
            
            return `
                <div class="chart-bar nutrition-${level}" 
                     style="height: ${height}%" 
                     data-adherence="${Math.round(data.adherence)}"
                     data-date="${data.date}"
                     title="Adherence: ${Math.round(data.adherence)}% - ${data.date}">
                    <div class="bar-value">${Math.round(data.adherence)}%</div>
                </div>
            `;
        }).join('');

        chartContainer.innerHTML = `
            <div class="chart-content">
                ${chartHTML}
            </div>
            <div class="chart-footer">
                <small>${plans.length} meal plans • Avg: ${Math.round(this.calculateNutritionAdherence() || 0)}%</small>
            </div>
        `;
    }

    async renderHealthSummary() {
        const { summary } = this.dashboardData;
        
        // Update summary values
        document.getElementById('total-assessments').textContent = summary.totalAssessments || 0;
        document.getElementById('mood-entries-count').textContent = summary.totalMoodEntries || 0;
        document.getElementById('streak-days').textContent = summary.streakDays || 0;
        document.getElementById('improvement-score').textContent = 
            summary.improvementScore ? `${Math.round(summary.improvementScore)}%` : '--%';
    }

    // Action Methods
    async launchRiskAssessment() {
        this.showNotification('Launching risk assessment...', 'info');
        
        // Use the main app's showAssessment method
        if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
            window.glucoApp.showAssessment();
        } else if (window.enhancedLandingPageManager && typeof window.enhancedLandingPageManager.startRiskAssessment === 'function') {
            window.enhancedLandingPageManager.startRiskAssessment();
        } else {
            this.showNotification('Risk assessment feature is loading...', 'info');
        }
    }

    async showMoodLogger() {
        const modal = this.createModal('Log Your Mood', `
            <div class="mood-logger-modal">
                <p>How are you feeling today?</p>
                <div class="mood-selector-large">
                    <button class="mood-btn-large" data-mood="1" onclick="enhancedDashboardRedesign.logMoodFromModal(1)">😢<br>Very Sad</button>
                    <button class="mood-btn-large" data-mood="2" onclick="enhancedDashboardRedesign.logMoodFromModal(2)">😕<br>Sad</button>
                    <button class="mood-btn-large" data-mood="3" onclick="enhancedDashboardRedesign.logMoodFromModal(3)">😐<br>Neutral</button>
                    <button class="mood-btn-large" data-mood="4" onclick="enhancedDashboardRedesign.logMoodFromModal(4)">😊<br>Happy</button>
                    <button class="mood-btn-large" data-mood="5" onclick="enhancedDashboardRedesign.logMoodFromModal(5)">😄<br>Very Happy</button>
                </div>
                <textarea placeholder="Add a note about your mood (optional)" id="mood-note" rows="3"></textarea>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    async logMoodFromModal(mood) {
        const note = document.getElementById('mood-note')?.value || '';
        await this.saveMoodEntry(mood, note);
        this.closeModal();
        await this.loadUserData(); // Refresh dashboard
        this.showNotification(`Mood logged: ${this.getMoodEmoji(mood)} ${mood}/5`, 'success');
    }

    async recordMood(mood, buttonElement) {
        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        buttonElement.classList.add('selected');
        
        await this.saveMoodEntry(mood);
        await this.loadUserData(); // Refresh dashboard
        this.showNotification(`Mood logged: ${this.getMoodEmoji(mood)} ${mood}/5`, 'success');
    }    async
 saveMoodEntry(mood, note = '') {
        const entry = {
            userId: this.currentUser,
            mood: mood,
            date: new Date().toISOString(),
            timestamp: Date.now(),
            notes: note
        };
        
        try {
            if (window.kiroDb) {
                await window.kiroDb.saveMood(entry);
            } else {
                // Fallback to localStorage
                const key = `mood-entries-${this.currentUser}`;
                const entries = JSON.parse(localStorage.getItem(key) || '[]');
                entries.unshift(entry);
                localStorage.setItem(key, JSON.stringify(entries.slice(0, 100))); // Keep last 100
            }
        } catch (error) {
            console.error('Error saving mood entry:', error);
            this.showNotification('Failed to save mood entry', 'error');
        }
    }

    async createMealPlan() {
        this.showNotification('Creating personalized meal plan...', 'info');
        
        const mealPlan = {
            userId: this.currentUser,
            planType: '7-day',
            meals: this.generateSampleMeals(),
            createdAt: new Date().toISOString(),
            preferences: ['balanced', 'diabetic-friendly']
        };
        
        try {
            if (window.kiroDb) {
                await window.kiroDb.saveNutritionPlan(mealPlan);
            } else {
                const key = `nutrition-plans-${this.currentUser}`;
                const plans = JSON.parse(localStorage.getItem(key) || '[]');
                plans.unshift(mealPlan);
                localStorage.setItem(key, JSON.stringify(plans));
            }
            
            await this.loadUserData(); // Refresh dashboard
            this.showNotification('Meal plan created successfully!', 'success');
            
            // Show the created meal plan
            this.showMealPlanModal(mealPlan);
        } catch (error) {
            console.error('Error creating meal plan:', error);
            this.showNotification('Failed to create meal plan', 'error');
        }
    }

    showMealPlanModal(mealPlan) {
        const modal = this.createModal('New Meal Plan Created', `
            <div class="meal-plan-modal">
                <div class="plan-header">
                    <h4>🍽️ ${mealPlan.planType} Meal Plan</h4>
                    <p>Created: ${new Date(mealPlan.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div class="meals-list">
                    <h5>Your Personalized Meals:</h5>
                    ${mealPlan.meals.map(meal => `
                        <div class="meal-item">
                            <div class="meal-name">${meal.name}</div>
                            <div class="meal-details">
                                <span class="meal-type">${meal.type}</span>
                                <span class="meal-calories">${meal.calories} cal</span>
                                <span class="meal-carbs">${meal.carbs}g carbs</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="plan-actions">
                    <button class="btn-primary" onclick="enhancedDashboardRedesign.closeModal()">
                        Got it!
                    </button>
                    <button class="btn-secondary" onclick="enhancedDashboardRedesign.viewNutritionPlans(); enhancedDashboardRedesign.closeModal();">
                        View All Plans
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    async viewNutritionPlans() {
        const plans = this.dashboardData.nutritionPlans;
        
        if (plans.length === 0) {
            this.showNotification('No meal plans found. Create your first plan!', 'info');
            setTimeout(() => {
                this.createMealPlan();
            }, 1000);
            return;
        }
        
        const modal = this.createModal('Your Nutrition Plans', `
            <div class="nutrition-plans-modal">
                <div class="plans-header">
                    <h4>📋 Your Meal Plans (${plans.length})</h4>
                    <p>Manage your personalized nutrition plans</p>
                </div>
                
                <div class="plans-list">
                    ${plans.map((plan, index) => `
                        <div class="plan-item">
                            <div class="plan-header">
                                <h5>🍽️ ${plan.planType} Plan</h5>
                                <span class="plan-date">${new Date(plan.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div class="plan-details">
                                <p><strong>Meals:</strong> ${plan.meals?.length || 0} planned</p>
                                <p><strong>Preferences:</strong> ${plan.preferences?.join(', ') || 'Standard'}</p>
                                <div class="plan-adherence">
                                    <span>Adherence: ${Math.round(70 + Math.random() * 30)}%</span>
                                    <div class="adherence-bar">
                                        <div class="adherence-fill" style="width: ${70 + Math.random() * 30}%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="plan-actions">
                                <button class="btn-small" onclick="enhancedDashboardRedesign.viewPlanDetails(${index})">
                                    View Details
                                </button>
                                <button class="btn-small secondary" onclick="enhancedDashboardRedesign.duplicatePlan(${index})">
                                    Duplicate
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-actions">
                    <button class="btn-primary" onclick="enhancedDashboardRedesign.createMealPlan(); enhancedDashboardRedesign.closeModal();">
                        🍽️ Create New Plan
                    </button>
                    <button class="btn-secondary" onclick="enhancedDashboardRedesign.closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    viewPlanDetails(planIndex) {
        const plan = this.dashboardData.nutritionPlans[planIndex];
        if (!plan) return;
        
        this.closeModal();
        
        const modal = this.createModal(`${plan.planType} Plan Details`, `
            <div class="plan-details-modal">
                <div class="plan-info">
                    <h4>🍽️ ${plan.planType} Meal Plan</h4>
                    <p><strong>Created:</strong> ${new Date(plan.createdAt).toLocaleDateString()}</p>
                    <p><strong>Preferences:</strong> ${plan.preferences?.join(', ') || 'Standard'}</p>
                </div>
                
                <div class="meals-detailed">
                    <h5>Meal Schedule:</h5>
                    ${plan.meals?.map(meal => `
                        <div class="meal-detail-item">
                            <div class="meal-header">
                                <span class="meal-name">${meal.name}</span>
                                <span class="meal-type-badge ${meal.type}">${meal.type}</span>
                            </div>
                            <div class="meal-nutrition">
                                <span>🔥 ${meal.calories} calories</span>
                                <span>🍞 ${meal.carbs}g carbs</span>
                            </div>
                        </div>
                    `).join('') || '<p>No meals planned yet.</p>'}
                </div>
                
                <div class="plan-stats">
                    <h5>Nutritional Summary:</h5>
                    <div class="stats-grid">
                        <div class="stat">
                            <span class="stat-value">${plan.meals?.reduce((sum, meal) => sum + meal.calories, 0) || 0}</span>
                            <span class="stat-label">Total Calories</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${plan.meals?.reduce((sum, meal) => sum + meal.carbs, 0) || 0}g</span>
                            <span class="stat-label">Total Carbs</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${plan.meals?.length || 0}</span>
                            <span class="stat-label">Meals</span>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    duplicatePlan(planIndex) {
        const originalPlan = this.dashboardData.nutritionPlans[planIndex];
        if (!originalPlan) return;
        
        const newPlan = {
            ...originalPlan,
            createdAt: new Date().toISOString(),
            planType: `${originalPlan.planType} (Copy)`
        };
        
        this.savePlanToStorage(newPlan);
        this.loadUserData();
        this.closeModal();
        this.showNotification('Meal plan duplicated successfully!', 'success');
    }

    async savePlanToStorage(plan) {
        try {
            if (window.kiroDb) {
                await window.kiroDb.saveNutritionPlan(plan);
            } else {
                const key = `nutrition-plans-${this.currentUser}`;
                const plans = JSON.parse(localStorage.getItem(key) || '[]');
                plans.unshift(plan);
                localStorage.setItem(key, JSON.stringify(plans));
            }
        } catch (error) {
            console.error('Error saving plan:', error);
        }
    }

    async generateHealthReport() {
        this.showNotification('Generating comprehensive health report...', 'info');
        
        const report = {
            userId: this.currentUser,
            generatedAt: new Date().toISOString(),
            summary: this.dashboardData.summary,
            assessments: this.dashboardData.assessments.slice(0, 5),
            moods: this.dashboardData.moods.slice(0, 30),
            nutritionPlans: this.dashboardData.nutritionPlans
        };
        
        // Create downloadable report
        const reportContent = this.formatHealthReport(report);
        this.downloadReport(reportContent, `health-report-${new Date().toISOString().split('T')[0]}.txt`);
        
        this.showNotification('Health report generated and downloaded!', 'success');
    }

    formatHealthReport(report) {
        return `
GLUCOBALANCE HEALTH REPORT
Generated: ${new Date(report.generatedAt).toLocaleString()}

SUMMARY
=======
Risk Assessments: ${report.summary.totalAssessments}
Latest Risk Score: ${report.summary.latestRiskScore || 'Not assessed'}
Risk Category: ${report.summary.latestRiskCategory || 'Unknown'}

Mood Tracking: ${report.summary.totalMoodEntries} entries
Average Mood: ${report.summary.averageMood?.toFixed(1) || 'N/A'}/5
Current Streak: ${report.summary.streakDays} days

Nutrition Plans: ${report.summary.nutritionPlansCount}
Improvement Score: ${report.summary.improvementScore || 'N/A'}%

RECENT ASSESSMENTS
==================
${report.assessments.map(a => `${new Date(a.createdAt).toLocaleDateString()}: Score ${a.score} (${this.getRiskCategory(a.score)})`).join('\n')}

MOOD TRENDS (Last 7 days)
=========================
${report.moods.slice(0, 7).map(m => `${new Date(m.date).toLocaleDateString()}: ${m.mood}/5 ${this.getMoodEmoji(m.mood)}`).join('\n')}

This report is for informational purposes only. Please consult with healthcare professionals for medical advice.
        `.trim();
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

    // Utility Methods
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('glucobalance-current-user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            return null;
        }
    }

    getRiskCategory(score) {
        if (score < 7) return 'Low';
        if (score < 15) return 'Increased';
        if (score < 20) return 'High';
        return 'Possible Diabetes';
    }

    getMoodEmoji(mood) {
        const emojis = ['', '😢', '😕', '😐', '😊', '😄'];
        return emojis[mood] || '😐';
    }

    getTodaysMood(moods) {
        const today = new Date().toDateString();
        const todayMood = moods.find(m => new Date(m.date).toDateString() === today);
        return todayMood?.mood || null;
    }

    calculateAverageMood(moods) {
        if (moods.length === 0) return null;
        const sum = moods.reduce((acc, mood) => acc + mood.mood, 0);
        return sum / moods.length;
    }

    calculateStreakDays(moods) {
        if (moods.length === 0) return 0;
        
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toDateString();
            
            const hasMood = moods.some(m => new Date(m.date).toDateString() === dateStr);
            if (hasMood) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateImprovementScore(assessments, moods) {
        if (assessments.length < 2) return null;
        
        const latest = assessments[0];
        const previous = assessments[1];
        
        const riskImprovement = previous.score > latest.score ? 20 : -10;
        const moodConsistency = moods.length > 7 ? 15 : 0;
        const engagementBonus = assessments.length > 3 ? 10 : 0;
        
        return Math.max(0, Math.min(100, 50 + riskImprovement + moodConsistency + engagementBonus));
    }    calcu
lateNutritionAdherence() {
        const plans = this.dashboardData.nutritionPlans;
        if (plans.length === 0) return 0;
        
        // Simulate adherence based on plan age and user engagement
        const latestPlan = plans[0];
        const daysSinceCreated = Math.floor((Date.now() - new Date(latestPlan.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const baseAdherence = Math.max(50, 90 - (daysSinceCreated * 2));
        
        return Math.min(100, baseAdherence + (this.dashboardData.moods.length > 10 ? 10 : 0));
    }

    getNutritionLevel(adherence) {
        if (adherence >= 80) return 'excellent';
        if (adherence >= 60) return 'good';
        if (adherence >= 40) return 'fair';
        return 'poor';
    }

    calculateRiskTrend() {
        const assessments = this.dashboardData.assessments;
        if (assessments.length < 2) {
            return { direction: 'stable', icon: '➡️', text: 'No trend data' };
        }
        
        const latest = assessments[0].score;
        const previous = assessments[1].score;
        
        if (latest < previous) {
            return { direction: 'improving', icon: '📉', text: 'Improving' };
        } else if (latest > previous) {
            return { direction: 'worsening', icon: '📈', text: 'Needs attention' };
        } else {
            return { direction: 'stable', icon: '➡️', text: 'Stable' };
        }
    }

    getMoodTrendData() {
        const moods = this.dashboardData.moods.slice(0, 7);
        if (moods.length < 3) {
            return { direction: 'stable', icon: '➡️', text: 'Not enough data' };
        }
        
        const recent = moods.slice(0, 3).reduce((sum, m) => sum + m.mood, 0) / 3;
        const older = moods.slice(3, 6).reduce((sum, m) => sum + m.mood, 0) / 3;
        
        if (recent > older + 0.5) {
            return { direction: 'improving', icon: '📈', text: 'Improving' };
        } else if (recent < older - 0.5) {
            return { direction: 'declining', icon: '📉', text: 'Declining' };
        } else {
            return { direction: 'stable', icon: '➡️', text: 'Stable' };
        }
    }

    generateSampleMeals() {
        return [
            { name: 'Grilled Chicken Salad', type: 'lunch', calories: 350, carbs: 15 },
            { name: 'Oatmeal with Berries', type: 'breakfast', calories: 280, carbs: 45 },
            { name: 'Baked Salmon with Vegetables', type: 'dinner', calories: 420, carbs: 20 },
            { name: 'Greek Yogurt with Nuts', type: 'snack', calories: 180, carbs: 12 },
            { name: 'Quinoa Bowl', type: 'lunch', calories: 380, carbs: 55 },
            { name: 'Vegetable Stir-fry', type: 'dinner', calories: 320, carbs: 35 },
            { name: 'Apple with Almond Butter', type: 'snack', calories: 200, carbs: 25 }
        ];
    }

    async generatePersonalizedInsights() {
        const { summary } = this.dashboardData;
        
        const insights = {
            progressSummary: this.generateProgressSummary(summary),
            recommendations: this.generateRecommendations(summary),
            focusArea: this.generateFocusArea(summary)
        };
        
        return insights;
    }

    generateProgressSummary(summary) {
        if (summary.totalAssessments === 0) {
            return "Welcome to GlucoBalance! Start by taking your first risk assessment to get personalized insights.";
        }
        
        const riskText = summary.latestRiskCategory ? `Your current risk level is ${summary.latestRiskCategory.toLowerCase()}` : '';
        const moodText = summary.averageMood ? `with an average mood of ${summary.averageMood.toFixed(1)}/5` : '';
        const streakText = summary.streakDays > 0 ? `You're on a ${summary.streakDays}-day tracking streak!` : '';
        
        return `${riskText} ${moodText}. ${streakText} Keep up the great work with your health journey.`;
    }

    generateRecommendations(summary) {
        const recommendations = [];
        
        if (summary.totalAssessments === 0) {
            recommendations.push("Take your first risk assessment to get started");
        } else if (summary.totalAssessments < 3) {
            recommendations.push("Continue regular risk assessments to track progress");
        }
        
        if (summary.totalMoodEntries < 7) {
            recommendations.push("Log your mood daily for better mental health insights");
        } else if (summary.averageMood && summary.averageMood < 3) {
            recommendations.push("Consider stress management techniques to improve mood");
        }
        
        if (summary.nutritionPlansCount === 0) {
            recommendations.push("Create a personalized meal plan for better nutrition");
        }
        
        if (summary.streakDays === 0) {
            recommendations.push("Start building a daily health tracking habit");
        }
        
        if (recommendations.length === 0) {
            recommendations.push("You're doing great! Keep maintaining your healthy habits");
            recommendations.push("Consider sharing your progress with your healthcare provider");
        }
        
        return recommendations.slice(0, 3);
    }

    generateFocusArea(summary) {
        if (summary.latestRiskCategory === 'High' || summary.latestRiskCategory === 'Possible Diabetes') {
            return "Focus on diabetes prevention through diet, exercise, and regular monitoring.";
        }
        
        if (summary.averageMood && summary.averageMood < 3) {
            return "Prioritize mental health and stress management for overall wellbeing.";
        }
        
        if (summary.nutritionPlansCount === 0) {
            return "Establish a consistent nutrition plan to support your health goals.";
        }
        
        if (summary.streakDays < 7) {
            return "Build consistency in health tracking to maximize insights and progress.";
        }
        
        return "Continue your excellent health management routine and consider setting new goals.";
    }

    // UI Helper Methods
    showLoadingState() {
        const dashboard = document.querySelector('.dashboard-grid');
        if (dashboard) {
            dashboard.style.opacity = '0.6';
            dashboard.style.pointerEvents = 'none';
        }
    }

    hideLoadingState() {
        const dashboard = document.querySelector('.dashboard-grid');
        if (dashboard) {
            dashboard.style.opacity = '1';
            dashboard.style.pointerEvents = 'auto';
        }
    }

    showErrorState(message) {
        this.showNotification(message, 'error');
    }

    async refreshDashboard() {
        this.showNotification('Refreshing dashboard...', 'info');
        await this.loadUserData();
        this.showNotification('Dashboard refreshed!', 'success');
    }

    setupRealTimeUpdates() {
        // Refresh dashboard every 5 minutes
        this.refreshInterval = setInterval(() => {
            if (document.getElementById('dashboard-page')?.classList.contains('active')) {
                this.loadUserData();
            }
        }, 5 * 60 * 1000);
    }

    updateChartsTimeframe(days) {
        this.showNotification(`Charts updated for last ${days} days`, 'info');
        // Re-render charts with new timeframe
        this.renderChartsSection();
    }    // 
Modal and UI Methods
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="enhancedDashboardRedesign.closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="enhancedDashboardRedesign.closeModal()">×</button>
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
        document.querySelectorAll('.custom-modal').forEach(modal => {
            modal.remove();
        });
    }

    showProfileModal() {
        const user = this.getCurrentUser();
        const modal = this.createModal('Profile', `
            <div class="profile-modal">
                <div class="profile-info">
                    <h4>User Information</h4>
                    <p><strong>Name:</strong> ${user?.name || 'Demo User'}</p>
                    <p><strong>Email:</strong> ${user?.email || 'demo@glucobalance.app'}</p>
                    <p><strong>Member since:</strong> ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</p>
                </div>
                <div class="profile-stats">
                    <h4>Your Stats</h4>
                    <p><strong>Risk Assessments:</strong> ${this.dashboardData.summary.totalAssessments}</p>
                    <p><strong>Mood Entries:</strong> ${this.dashboardData.summary.totalMoodEntries}</p>
                    <p><strong>Streak Days:</strong> ${this.dashboardData.summary.streakDays}</p>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    showMoodHistory() {
        const moods = this.dashboardData.moods.slice(0, 10);
        const modal = this.createModal('Mood History', `
            <div class="mood-history-modal">
                ${moods.length === 0 ? 
                    '<p>No mood entries yet. Start logging your mood to see history!</p>' :
                    moods.map(mood => `
                        <div class="mood-history-item">
                            <span class="mood-emoji">${this.getMoodEmoji(mood.mood)}</span>
                            <span class="mood-score">${mood.mood}/5</span>
                            <span class="mood-date">${new Date(mood.date).toLocaleDateString()}</span>
                            ${mood.notes ? `<span class="mood-note">${mood.notes}</span>` : ''}
                        </div>
                    `).join('')
                }
            </div>
        `);
        
        document.body.appendChild(modal);
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

    applyModernStyling() {
        // Add modern dashboard styles
        const style = document.createElement('style');
        style.id = 'enhanced-dashboard-redesign-styles';
        style.textContent = `
            /* Enhanced Dashboard Redesign Styles */
            .dashboard-main {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                min-height: calc(100vh - 80px);
                padding: 2rem 0;
            }

            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
                padding: 0 1rem;
            }

            .card {
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
            }

            .card-header {
                padding: 1.5rem 1.5rem 1rem;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .card-header h3 {
                margin: 0;
                color: #1e293b;
                font-size: 1.1rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .card-content {
                padding: 1.5rem;
            }

            .card-actions {
                padding: 1rem 1.5rem 1.5rem;
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }

            .btn-card-action {
                background: linear-gradient(135deg, #007FFF, #0066CC);
                color: white;
                border: none;
                padding: 0.75rem 1.25rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .btn-card-action:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 127, 255, 0.3);
            }

            .btn-card-action.secondary {
                background: linear-gradient(135deg, #64748b, #475569);
            }

            .risk-score {
                font-size: 3rem;
                font-weight: 700;
                text-align: center;
                margin-bottom: 0.5rem;
                color: #1e293b;
            }

            .risk-score.risk-low { color: #10b981; }
            .risk-score.risk-increased { color: #f59e0b; }
            .risk-score.risk-high { color: #ef4444; }
            .risk-score.risk-possible-diabetes { color: #dc2626; }

            .risk-category {
                text-align: center;
                font-weight: 600;
                font-size: 1.1rem;
                color: #64748b;
                margin-bottom: 0.5rem;
            }

            .mood-selector {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                margin: 1rem 0;
            }

            .mood-btn {
                background: none;
                border: 2px solid #e2e8f0;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .mood-btn:hover {
                border-color: #007FFF;
                transform: scale(1.1);
            }

            .mood-btn.selected {
                border-color: #007FFF;
                background: #007FFF;
                color: white;
            }

            .mood-selector-large {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 1rem;
                margin: 2rem 0;
            }

            .mood-btn-large {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 1.5rem 1rem;
                font-size: 2rem;
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

            .charts-section, .quick-actions-section, .health-summary-section {
                background: white;
                border-radius: 16px;
                padding: 2rem;
                margin: 2rem 1rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #f1f5f9;
            }

            .section-header h2 {
                margin: 0;
                color: #1e293b;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
            }

            .chart-container {
                background: #f8fafc;
                border-radius: 12px;
                padding: 1.5rem;
                border: 1px solid #e2e8f0;
            }

            .interactive-chart {
                height: 200px;
                display: flex;
                align-items: end;
                justify-content: center;
                gap: 8px;
                padding: 1rem 0;
            }

            .chart-content {
                display: flex;
                align-items: end;
                justify-content: center;
                gap: 8px;
                height: 150px;
                padding: 1rem 0;
            }

            .chart-bar {
                min-width: 20px;
                background: linear-gradient(135deg, #007FFF, #0066CC);
                border-radius: 4px 4px 0 0;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                display: flex;
                align-items: end;
                justify-content: center;
                color: white;
                font-size: 0.8rem;
                font-weight: 600;
            }

            .chart-bar:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(0, 127, 255, 0.3);
            }

            .no-data-state {
                text-align: center;
                padding: 3rem 1rem;
                color: #64748b;
            }

            .no-data-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .quick-actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }

            .action-btn {
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 1rem;
                text-align: left;
            }

            .action-btn:hover {
                border-color: #007FFF;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 127, 255, 0.15);
            }

            .action-btn.primary {
                background: linear-gradient(135deg, #007FFF, #0066CC);
                color: white;
                border-color: transparent;
            }

            .action-icon {
                font-size: 2rem;
                flex-shrink: 0;
            }

            .action-title {
                font-weight: 600;
                font-size: 1.1rem;
                margin-bottom: 0.25rem;
            }

            .action-description {
                color: #64748b;
                font-size: 0.9rem;
            }

            .action-btn.primary .action-description {
                color: rgba(255, 255, 255, 0.8);
            }

            .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
            }

            .summary-card {
                background: #f8fafc;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                border: 1px solid #e2e8f0;
                transition: all 0.3s ease;
            }

            .summary-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            }

            .summary-icon {
                font-size: 2rem;
                margin-bottom: 1rem;
            }

            .summary-value {
                font-size: 2rem;
                font-weight: 700;
                color: #007FFF;
                margin-bottom: 0.5rem;
            }

            .summary-label {
                color: #64748b;
                font-weight: 500;
            }

            @media (max-width: 768px) {
                .dashboard-grid {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    padding: 0 0.5rem;
                }

                .charts-grid {
                    grid-template-columns: 1fr;
                }

                .quick-actions-grid {
                    grid-template-columns: 1fr;
                }

                .summary-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            /* Nutrition Modal Styles */
            .meal-plan-modal, .nutrition-plans-modal, .plan-details-modal {
                max-width: 600px;
                width: 100%;
            }

            .plan-header, .plans-header {
                text-align: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e2e8f0;
            }

            .plan-header h4, .plans-header h4 {
                margin: 0 0 0.5rem 0;
                color: #1e293b;
                font-size: 1.3rem;
            }

            .meals-list, .plans-list {
                max-height: 400px;
                overflow-y: auto;
                margin-bottom: 1.5rem;
            }

            .meal-item, .plan-item {
                background: #f8fafc;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 0.75rem;
                border: 1px solid #e2e8f0;
            }

            .meal-name {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 0.5rem;
            }

            .meal-details {
                display: flex;
                gap: 1rem;
                font-size: 0.9rem;
                color: #64748b;
            }

            .meal-type {
                background: #007FFF;
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                text-transform: capitalize;
            }

            .plan-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
            }

            .plan-header h5 {
                margin: 0;
                color: #1e293b;
            }

            .plan-date {
                font-size: 0.8rem;
                color: #64748b;
            }

            .plan-details p {
                margin: 0.25rem 0;
                font-size: 0.9rem;
                color: #64748b;
            }

            .plan-adherence {
                margin-top: 0.75rem;
            }

            .adherence-bar {
                background: #e2e8f0;
                height: 6px;
                border-radius: 3px;
                overflow: hidden;
                margin-top: 0.25rem;
            }

            .adherence-fill {
                background: linear-gradient(90deg, #10b981, #059669);
                height: 100%;
                border-radius: 3px;
                transition: width 0.3s ease;
            }

            .plan-actions, .modal-actions {
                display: flex;
                gap: 0.75rem;
                justify-content: center;
                margin-top: 1rem;
                flex-wrap: wrap;
            }

            .btn-small {
                background: #007FFF;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8rem;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .btn-small:hover {
                background: #0066CC;
                transform: translateY(-1px);
            }

            .btn-small.secondary {
                background: #64748b;
            }

            .btn-small.secondary:hover {
                background: #475569;
            }

            .meal-detail-item {
                background: #f8fafc;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 0.75rem;
                border: 1px solid #e2e8f0;
            }

            .meal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .meal-type-badge {
                background: #007FFF;
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.7rem;
                text-transform: capitalize;
                font-weight: 600;
            }

            .meal-type-badge.breakfast { background: #f59e0b; }
            .meal-type-badge.lunch { background: #10b981; }
            .meal-type-badge.dinner { background: #8b5cf6; }
            .meal-type-badge.snack { background: #ef4444; }

            .meal-nutrition {
                display: flex;
                gap: 1rem;
                font-size: 0.9rem;
                color: #64748b;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-top: 1rem;
            }

            .stat {
                text-align: center;
                background: #f8fafc;
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .stat-value {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: #007FFF;
                margin-bottom: 0.25rem;
            }

            .stat-label {
                font-size: 0.8rem;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        `;
        
        // Remove existing styles
        const existingStyle = document.getElementById('enhanced-dashboard-redesign-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
    }
}

// Initialize the enhanced dashboard redesign
window.enhancedDashboardRedesign = new EnhancedDashboardRedesign();

console.log('✅ Enhanced Dashboard Redesign loaded and initialized!');