// GlucoBalance - Enhanced Dashboard with Real-time Data and AI Insights
class EnhancedDashboard {
    constructor() {
        this.currentUser = null;
        this.dashboardData = {};
        this.refreshInterval = null;
        this.chartInstances = {};
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRealTimeUpdates();
    }

    setupEventListeners() {
        // Dashboard refresh button removed - now handled by auto-refresh

        // Risk assessment button
        document.getElementById('take-assessment-btn')?.addEventListener('click', () => {
            this.handleTakeAssessmentClick();
        });

        // Mood logging
        document.getElementById('log-mood-btn')?.addEventListener('click', () => {
            window.glucoApp?.showMentalHealth();
        });

        document.getElementById('view-mood-history-btn')?.addEventListener('click', () => {
            this.showMoodHistory();
        });

        // Nutrition actions
        document.getElementById('create-meal-plan-btn')?.addEventListener('click', () => {
            window.glucoApp?.showNutrition();
        });

        document.getElementById('view-nutrition-btn')?.addEventListener('click', () => {
            window.glucoApp?.showNutrition();
        });

        // AI insights refresh
        document.getElementById('refresh-insights-btn')?.addEventListener('click', () => {
            this.generateAIInsights();
        });

        // Quick actions
        document.getElementById('assessment-btn')?.addEventListener('click', () => {
            this.handleTakeAssessmentClick();
        });

        document.getElementById('mood-log-btn')?.addEventListener('click', () => {
            window.glucoApp?.showMentalHealth();
        });

        document.getElementById('meal-plan-btn')?.addEventListener('click', () => {
            window.glucoApp?.showNutrition();
        });

        document.getElementById('generate-report-btn')?.addEventListener('click', () => {
            window.glucoApp?.showDoctorReport();
        });

        // Mood selector buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.recordMood(e.target.dataset.mood);
            });
        });

        // Chart timeframe selector
        document.getElementById('chart-timeframe')?.addEventListener('change', (e) => {
            this.updateChartsTimeframe(parseInt(e.target.value));
        });

        // Listen for data updates
        document.addEventListener('dataUpdated', (event) => {
            if (this.currentUser && event.detail.userId === this.currentUser) {
                this.refreshDashboard();
            }
        });

        // Listen for authentication changes
        document.addEventListener('authStateChanged', (event) => {
            if (event.detail.isAuthenticated && event.detail.user) {
                this.setCurrentUser(event.detail.user.id);
            } else {
                this.currentUser = null;
                this.clearDashboard();
            }
        });

        // Listen for assessment completion
        document.addEventListener('assessmentCompleted', (event) => {
            console.log('Assessment completed, refreshing dashboard');
            if (this.currentUser && event.detail.userId === this.currentUser) {
                // Refresh dashboard to show new assessment data
                setTimeout(() => {
                    this.refreshDashboard();
                }, 500);
            }
        });
    }

    setupRealTimeUpdates() {
        // Update dashboard every 5 minutes
        this.refreshInterval = setInterval(() => {
            if (this.currentUser && document.getElementById('dashboard-page')?.classList.contains('active')) {
                this.refreshDashboard(true); // Silent refresh
            }
        }, 5 * 60 * 1000);
    }

    setCurrentUser(userId) {
        this.currentUser = userId;
        if (document.getElementById('dashboard-page')?.classList.contains('active')) {
            this.loadDashboard();
        }
    }

    async loadDashboard() {
        if (!this.currentUser) {
            this.showLoginPrompt();
            return;
        }

        try {
            this.showLoadingState();
            await this.aggregateHealthData();
            await this.renderDashboardCards();
            await this.renderInteractiveCharts();
            await this.updateQuickActions();
            await this.updateHealthSummary();
            await this.generateAIInsights();
            this.hideLoadingState();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showErrorState('Failed to load dashboard data. Please try again.');
        }
    }

    async refreshDashboard(silent = false) {
        if (this.isLoading) return;
        
        if (!silent) {
            this.showRefreshingState();
        }
        
        try {
            await this.aggregateHealthData();
            await this.renderDashboardCards();
            await this.renderInteractiveCharts();
            await this.updateQuickActions();
            await this.updateHealthSummary();
            
            if (!silent) {
                this.showNotification('Dashboard updated successfully', 'success');
            }
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            if (!silent) {
                this.showNotification('Failed to refresh dashboard', 'error');
            }
        } finally {
            this.hideLoadingState();
        }
    }

    async aggregateHealthData() {
        if (!this.currentUser) return;

        try {
            // Get data from database
            const [assessments, moods, nutritionPlans, progressData] = await Promise.all([
                window.kiroDb?.getUserAssessments(this.currentUser, 10) || [],
                window.kiroDb?.getUserMoods(this.currentUser, 30) || [],
                window.kiroDb?.getUserNutritionPlans(this.currentUser, 5) || [],
                window.kiroDb?.getUserProgress(this.currentUser, null, 30) || []
            ]);

            // Calculate comprehensive metrics
            this.dashboardData = {
                riskAssessments: assessments,
                moodEntries: moods,
                nutritionPlans: nutritionPlans,
                progressMetrics: progressData,
                summary: {
                    latestRiskScore: assessments.length > 0 ? assessments[0].riskScore : null,
                    latestRiskCategory: assessments.length > 0 ? this.getRiskCategory(assessments[0].riskScore) : null,
                    currentMood: this.getTodaysMood(moods),
                    averageMood: this.calculateAverageMood(moods),
                    moodTrend: this.calculateMoodTrend(moods),
                    totalAssessments: assessments.length,
                    totalMoodEntries: moods.length,
                    nutritionAdherence: this.calculateNutritionAdherence(nutritionPlans),
                    streakDays: this.calculateStreakDays(moods),
                    improvementScore: this.calculateImprovementScore(assessments, moods),
                    lastAssessmentDate: assessments.length > 0 ? assessments[0].createdAt : null,
                    achievements: this.identifyAchievements(assessments, moods, nutritionPlans)
                }
            };

        } catch (error) {
            console.error('Error aggregating health data:', error);
            this.dashboardData = this.getFallbackData();
        }
    }

    async renderDashboardCards() {
        await Promise.all([
            this.renderRiskStatusCard(),
            this.renderMoodTrackerCard(),
            this.renderNutritionSnapshotCard(),
            this.renderAIInsightsCard()
        ]);
    }

    async renderRiskStatusCard() {
        const { summary } = this.dashboardData;
        const riskDisplay = document.getElementById('risk-display');
        const riskTrend = document.getElementById('risk-trend');
        const riskChartMini = document.getElementById('risk-chart-mini');

        if (!riskDisplay) return;

        // Update risk display
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

            // Update trend indicator
            const trend = this.calculateRiskTrend();
            riskTrend.innerHTML = `
                <span class="trend-icon ${trend.direction}">${trend.icon}</span>
                <span class="trend-text">${trend.text}</span>
            `;

            // Render mini chart
            this.renderRiskMiniChart(riskChartMini);
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
        const moodChartMini = document.getElementById('mood-chart-mini');

        if (!currentMoodValue) return;

        // Update mood values
        currentMoodValue.textContent = summary.currentMood ? `${summary.currentMood}/5` : '--';
        avgMoodValue.textContent = summary.averageMood ? summary.averageMood.toFixed(1) : '--';

        // Update mood selector to show today's mood
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (summary.currentMood && btn.dataset.mood === summary.currentMood.toString()) {
                btn.classList.add('selected');
            }
        });

        // Update trend
        const trend = this.getMoodTrendData();
        moodTrend.innerHTML = `
            <span class="trend-icon ${trend.direction}">${trend.icon}</span>
            <span class="trend-text">${trend.text}</span>
        `;

        // Render mini chart
        this.renderMoodMiniChart(moodChartMini);
    }

    async renderNutritionSnapshotCard() {
        const { summary } = this.dashboardData;
        const mealPlansCount = document.getElementById('meal-plans-count');
        const adherenceRate = document.getElementById('adherence-rate');
        const nutritionProgressFill = document.getElementById('nutrition-progress-fill');
        const nutritionTrend = document.getElementById('nutrition-trend');

        if (!mealPlansCount) return;

        // Update nutrition stats
        mealPlansCount.textContent = this.dashboardData.nutritionPlans.length;
        adherenceRate.textContent = summary.nutritionAdherence ? 
            `${Math.round(summary.nutritionAdherence)}%` : '--%';

        // Update progress bar
        const progressWidth = summary.nutritionAdherence || 0;
        nutritionProgressFill.style.width = `${progressWidth}%`;

        // Update trend
        const trend = this.getNutritionTrendData();
        nutritionTrend.innerHTML = `
            <span class="trend-icon ${trend.direction}">${trend.icon}</span>
            <span class="trend-text">${trend.text}</span>
        `;
    }

    async renderAIInsightsCard() {
        // This will be handled by generateAIInsights method
    }

    async renderInteractiveCharts() {
        await Promise.all([
            this.renderRiskTrendChart(),
            this.renderMoodTrendChart(),
            this.renderNutritionChart()
        ]);
    }

    async renderRiskTrendChart() {
        const chartContainer = document.getElementById('risk-trend-chart');
        if (!chartContainer) return;

        const assessments = this.dashboardData.riskAssessments.slice(0, 10).reverse();
        
        if (assessments.length === 0) {
            chartContainer.innerHTML = `
                <div class="no-data-state">
                    <div class="no-data-icon">📊</div>
                    <p>No risk assessments yet</p>
                    <button class="btn-primary" onclick="window.glucoApp.showAssessment()">
                        Take First Assessment
                    </button>
                </div>
            `;
            return;
        }

        const maxScore = Math.max(...assessments.map(a => a.riskScore), 25);
        const chartHTML = assessments.map((assessment, index) => {
            const height = (assessment.riskScore / maxScore) * 100;
            const category = this.getRiskCategory(assessment.riskScore);
            const date = new Date(assessment.createdAt).toLocaleDateString();
            
            return `
                <div class="chart-bar risk-${category.toLowerCase().replace(' ', '-')}" 
                     style="height: ${height}%" 
                     data-score="${assessment.riskScore}"
                     data-date="${date}"
                     data-category="${category}"
                     title="Score: ${assessment.riskScore} (${category}) - ${date}">
                    <div class="bar-value">${assessment.riskScore}</div>
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

        this.addChartInteractivity(chartContainer);
    }

    async renderMoodTrendChart() {
        const chartContainer = document.getElementById('mood-trend-chart');
        if (!chartContainer) return;

        const moods = this.dashboardData.moodEntries.slice(0, 14).reverse();
        
        if (moods.length === 0) {
            chartContainer.innerHTML = `
                <div class="no-data-state">
                    <div class="no-data-icon">💙</div>
                    <p>No mood entries yet</p>
                    <button class="btn-primary" onclick="window.glucoApp.showMentalHealth()">
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
                     data-emoji="${emoji}"
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

        this.addChartInteractivity(chartContainer);
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
                    <button class="btn-primary" onclick="window.glucoApp.showNutrition()">
                        Create Meal Plan
                    </button>
                </div>
            `;
            return;
        }

        // Simulate adherence data for demo
        const adherenceData = plans.map((plan, index) => ({
            date: new Date(plan.createdAt).toLocaleDateString(),
            adherence: 70 + Math.random() * 30, // Demo data
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
                     data-plan="${data.planType}"
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
                <small>${plans.length} meal plans • Avg: ${Math.round(this.dashboardData.summary.nutritionAdherence || 0)}%</small>
            </div>
        `;

        this.addChartInteractivity(chartContainer);
    }

    async updateQuickActions() {
        const { summary } = this.dashboardData;
        const quickActions = document.getElementById('quick-actions');
        if (!quickActions) return;

        // Update action button states based on user data
        const assessmentBtn = document.getElementById('assessment-btn');
        const moodLogBtn = document.getElementById('mood-log-btn');
        const mealPlanBtn = document.getElementById('meal-plan-btn');

        // Update assessment button
        if (assessmentBtn) {
            if (!summary.latestRiskScore) {
                assessmentBtn.classList.add('primary');
                assessmentBtn.querySelector('.action-title').textContent = 'Start Risk Assessment';
                assessmentBtn.querySelector('.action-description').textContent = 'Evaluate your diabetes risk';
            } else if (this.daysSinceLastAssessment() > 30) {
                assessmentBtn.classList.add('recommended');
                assessmentBtn.querySelector('.action-title').textContent = 'Update Assessment';
                assessmentBtn.querySelector('.action-description').textContent = 'Reassess your risk factors';
            }
        }

        // Update mood log button
        if (moodLogBtn && !summary.currentMood) {
            moodLogBtn.classList.add('recommended');
            moodLogBtn.querySelector('.action-description').textContent = 'Log today\'s mood';
        }

        // Update meal plan button
        if (mealPlanBtn) {
            if (this.dashboardData.nutritionPlans.length === 0) {
                mealPlanBtn.classList.add('recommended');
                mealPlanBtn.querySelector('.action-title').textContent = 'Create Meal Plan';
                mealPlanBtn.querySelector('.action-description').textContent = 'Get personalized nutrition';
            }
        }
    }

    async updateHealthSummary() {
        const { summary } = this.dashboardData;
        
        // Update summary values
        document.getElementById('total-assessments').textContent = summary.totalAssessments;
        document.getElementById('mood-entries-count').textContent = summary.totalMoodEntries;
        document.getElementById('streak-days').textContent = summary.streakDays;
        document.getElementById('improvement-score').textContent = 
            summary.improvementScore ? `${Math.round(summary.improvementScore)}%` : '--%';
    }

    async handleTakeAssessmentClick() {
        try {
            console.log('Take Assessment button clicked');
            
            // Show loading state on the button
            const button = document.getElementById('take-assessment-btn');
            let originalText = '';
            if (button) {
                originalText = button.innerHTML;
                button.innerHTML = '⏳ Loading...';
                button.disabled = true;
            }
            
            // Restore button function
            const restoreButton = () => {
                if (button) {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            };
            
            // Ensure risk assessment engine is available
            if (!window.riskAssessment) {
                console.error('Risk assessment engine not available');
                restoreButton();
                this.showAssessmentError('Risk assessment engine is not loaded. Please refresh the page and try again.');
                return;
            }
            
            // Try multiple approaches to start the assessment
            let assessmentStarted = false;
            
            // Approach 1: Use main app if available
            if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
                try {
                    console.log('Attempting to use main app showAssessment method');
                    await window.glucoApp.showAssessment();
                    assessmentStarted = true;
                    console.log('Assessment started via main app');
                } catch (error) {
                    console.warn('Main app showAssessment failed:', error);
                }
            }
            
            // Approach 2: Create assessment page directly if main app failed
            if (!assessmentStarted) {
                try {
                    console.log('Creating assessment page directly');
                    await this.createAndShowAssessment();
                    assessmentStarted = true;
                    console.log('Assessment started via direct creation');
                } catch (error) {
                    console.error('Direct assessment creation failed:', error);
                }
            }
            
            // Approach 3: Fallback - start assessment in current page
            if (!assessmentStarted) {
                try {
                    console.log('Using fallback approach - starting assessment in current page');
                    await this.startAssessmentInline();
                    assessmentStarted = true;
                    console.log('Assessment started inline');
                } catch (error) {
                    console.error('Inline assessment failed:', error);
                }
            }
            
            if (assessmentStarted) {
                restoreButton();
            } else {
                restoreButton();
                this.showAssessmentError('Unable to start assessment. Please try refreshing the page.');
            }
            
        } catch (error) {
            console.error('Error handling take assessment click:', error);
            this.showAssessmentError(`Failed to start assessment: ${error.message}`);
        }
    }

    async startAssessmentInline() {
        // Create a modal-style assessment overlay
        const assessmentOverlay = document.createElement('div');
        assessmentOverlay.id = 'assessment-overlay';
        assessmentOverlay.className = 'assessment-overlay';
        assessmentOverlay.innerHTML = `
            <div class="assessment-modal">
                <div class="assessment-header">
                    <h2>WHO/ADA Risk Assessment</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="assessment-progress" style="width: 0%"></div>
                    </div>
                </div>
                <div id="assessment-content">
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Loading assessment questions...</p>
                    </div>
                </div>
                <div class="form-actions">
                    <button id="prev-question" class="btn-secondary" style="display: none;">← Previous</button>
                    <button id="next-question" class="btn-primary" disabled>Next →</button>
                </div>
                <div id="assessment-result" style="display: none;">
                    <div id="risk-result-display"></div>
                    <div id="ai-explanation"></div>
                    <div class="result-actions">
                        <button id="save-assessment" class="btn-primary">Save Results</button>
                        <button id="retake-assessment" class="btn-secondary">Retake</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add overlay styles
        const style = document.createElement('style');
        style.textContent = `
            .assessment-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            .assessment-modal {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                padding: 2rem;
                position: relative;
            }
            .assessment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e0e0e0;
            }
            .close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                padding: 0.5rem;
                border-radius: 4px;
            }
            .close-btn:hover {
                background: #f0f0f0;
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(assessmentOverlay);
        
        // Set up event listeners
        document.getElementById('save-assessment')?.addEventListener('click', async () => {
            await this.saveAssessmentAndReturn();
            assessmentOverlay.remove();
        });
        
        document.getElementById('retake-assessment')?.addEventListener('click', () => {
            if (window.riskAssessment) {
                window.riskAssessment.startAssessment();
            }
        });
        
        // Start the assessment
        if (window.riskAssessment) {
            window.riskAssessment.startAssessment();
        }
    }

    async createAndShowAssessment() {
        try {
            // Create assessment page if it doesn't exist
            if (!document.getElementById('assessment-page')) {
                console.log('Creating assessment page');
                this.createAssessmentPage();
            }
            
            // Navigate to assessment page
            this.navigateToAssessment();
            
            // Initialize the assessment
            if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
                console.log('Starting risk assessment');
                window.riskAssessment.startAssessment();
            } else {
                throw new Error('Risk assessment engine startAssessment method not available');
            }
            
        } catch (error) {
            console.error('Error creating and showing assessment:', error);
            this.showAssessmentError(`Failed to create assessment: ${error.message}`);
        }
    }

    createAssessmentPage() {
        const assessmentHTML = `
        <div id="assessment-page" class="page">
            <header class="app-header">
                <div class="container">
                    <div class="header-content">
                        <button class="back-btn" onclick="enhancedDashboard.navigateBackToDashboard()">
                            ← Back to Dashboard
                        </button>
                        <h1>WHO/ADA Risk Assessment</h1>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="assessment-progress" style="width: 0%"></div>
                        </div>
                        <div class="progress-text">
                            <span id="progress-text">Getting started...</span>
                        </div>
                    </div>
                </div>
            </header>
            
            <main class="container">
                <div class="assessment-form">
                    <div id="assessment-content">
                        <div class="loading-state">
                            <div class="loading-spinner"></div>
                            <p>Loading assessment questions...</p>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button id="prev-question" class="btn-secondary" style="display: none;">
                            ← Previous
                        </button>
                        <button id="next-question" class="btn-primary" disabled>
                            Next →
                        </button>
                    </div>
                </div>
                
                <div id="assessment-result" class="assessment-result-card" style="display: none;">
                    <div class="result-header">
                        <h3>Your Risk Assessment Result</h3>
                    </div>
                    <div id="risk-result-display"></div>
                    <div id="ai-explanation"></div>
                    <div class="result-actions">
                        <button id="save-assessment" class="btn-primary">
                            Save Results & Return to Dashboard
                        </button>
                        <button id="retake-assessment" class="btn-secondary">
                            Retake Assessment
                        </button>
                    </div>
                </div>
            </main>
        </div>`;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', assessmentHTML);
        
        // Set up event listeners for the assessment page
        this.setupAssessmentEventListeners();
    }

    setupAssessmentEventListeners() {
        // Save assessment button
        document.getElementById('save-assessment')?.addEventListener('click', async () => {
            await this.saveAssessmentAndReturn();
        });
        
        // Retake assessment button
        document.getElementById('retake-assessment')?.addEventListener('click', () => {
            if (window.riskAssessment) {
                window.riskAssessment.startAssessment();
            }
        });
    }

    navigateToAssessment() {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show assessment page
        const assessmentPage = document.getElementById('assessment-page');
        if (assessmentPage) {
            assessmentPage.classList.add('active');
            console.log('Navigated to assessment page');
        }
    }

    navigateBackToDashboard() {
        // Hide assessment page
        const assessmentPage = document.getElementById('assessment-page');
        if (assessmentPage) {
            assessmentPage.classList.remove('active');
        }
        
        // Show dashboard page
        const dashboardPage = document.getElementById('dashboard-page');
        if (dashboardPage) {
            dashboardPage.classList.add('active');
            console.log('Navigated back to dashboard');
        }
    }

    async saveAssessmentAndReturn() {
        try {
            console.log('Saving assessment and returning to dashboard');
            
            // Get assessment data from risk assessment engine
            if (window.riskAssessment && window.riskAssessment.assessmentData) {
                const assessmentData = window.riskAssessment.assessmentData;
                
                // Save to database if available
                if (window.kiroDb && this.currentUser) {
                    try {
                        await window.kiroDb.saveAssessment(this.currentUser, {
                            riskScore: assessmentData.score,
                            riskCategory: assessmentData.category,
                            responses: assessmentData.responses,
                            questionResponses: assessmentData.questionResponses,
                            date: assessmentData.date,
                            aiExplanation: assessmentData.aiExplanation,
                            aiRecommendations: assessmentData.aiRecommendations
                        });
                        console.log('Assessment saved to database');
                    } catch (dbError) {
                        console.error('Failed to save to database:', dbError);
                        // Continue anyway - we'll save to localStorage as fallback
                    }
                }
                
                // Update user data in localStorage as fallback
                try {
                    const userData = JSON.parse(localStorage.getItem('glucobalance-user') || '{}');
                    userData.riskScore = assessmentData.score;
                    userData.riskCategory = assessmentData.category;
                    userData.lastAssessmentDate = assessmentData.date;
                    localStorage.setItem('glucobalance-user', JSON.stringify(userData));
                    console.log('Assessment saved to localStorage');
                } catch (storageError) {
                    console.error('Failed to save to localStorage:', storageError);
                }
                
                // Show success notification
                this.showNotification('Assessment saved successfully!', 'success');
                
                // Navigate back to dashboard
                this.navigateBackToDashboard();
                
                // Refresh dashboard data to show new assessment
                await this.refreshDashboard();
                
            } else {
                throw new Error('No assessment data available to save');
            }
            
        } catch (error) {
            console.error('Error saving assessment:', error);
            this.showNotification('Failed to save assessment. Please try again.', 'error');
        }
    }

    showAssessmentError(message) {
        // Show error notification
        this.showNotification(message, 'error');
        
        // Also show error in assessment content if available
        const assessmentContent = document.getElementById('assessment-content');
        if (assessmentContent) {
            assessmentContent.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Assessment Unavailable</h3>
                    <p>${message}</p>
                    <div class="error-actions">
                        <button class="btn-primary" onclick="location.reload()">
                            Refresh Page
                        </button>
                        <button class="btn-secondary" onclick="enhancedDashboard.navigateBackToDashboard()">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    async generateAIInsights() {
        const insightsContainer = document.getElementById('ai-insights');
        if (!insightsContainer) return;

        try {
            // Show loading state
            insightsContainer.innerHTML = `
                <div class="insights-loading">
                    <div class="loading-spinner"></div>
                    <p>Generating personalized insights...</p>
                </div>
            `;

            // Check if we have enough data
            const dataQuality = this.assessDataQuality();
            if (dataQuality.score < 20) {
                this.showInsufficientDataInsights();
                return;
            }

            // Check AI availability - use aiService if available, otherwise use geminiAI directly
            let aiAvailable = false;
            if (window.aiService?.isAvailable()) {
                aiAvailable = true;
            } else if (window.geminiAI?.isInitialized()) {
                aiAvailable = true;
            } else {
                // Try to initialize AI
                const enableAI = await this.showAIEnablePrompt();
                if (!enableAI) {
                    this.showFallbackInsights();
                    return;
                }
                aiAvailable = window.geminiAI?.isInitialized() || false;
            }

            if (!aiAvailable) {
                this.showFallbackInsights();
                return;
            }

            // Generate AI insights
            const insights = await this.generatePersonalizedInsights();
            this.renderAIInsights(insights);

        } catch (error) {
            console.error('Failed to generate AI insights:', error);
            this.showFallbackInsights();
        }
    }

    async generatePersonalizedInsights() {
        const { summary } = this.dashboardData;
        
        const context = {
            riskScore: summary.latestRiskScore,
            riskCategory: summary.latestRiskCategory,
            averageMood: summary.averageMood,
            moodTrend: summary.moodTrend,
            nutritionAdherence: summary.nutritionAdherence,
            streakDays: summary.streakDays,
            totalAssessments: summary.totalAssessments,
            achievements: summary.achievements,
            improvementScore: summary.improvementScore
        };

        const prompt = `As a compassionate AI health assistant, analyze this user's health dashboard data and provide personalized insights:

Risk Status: ${context.riskScore ? `${context.riskScore} (${context.riskCategory})` : 'Not assessed'}
Mood: Average ${context.averageMood?.toFixed(1) || 'N/A'}/5, Trend: ${context.moodTrend || 'Unknown'}
Nutrition: ${context.nutritionAdherence ? Math.round(context.nutritionAdherence) + '% adherence' : 'No plans yet'}
Streak: ${context.streakDays} consecutive days
Assessments: ${context.totalAssessments} completed
Achievements: ${context.achievements?.join(', ') || 'None yet'}

Provide:
1. A warm, encouraging progress summary (2-3 sentences)
2. 3 specific, actionable recommendations based on their data
3. One area to focus on for maximum health impact
4. A motivational message that acknowledges their efforts

Keep the tone supportive and personalized. Limit to 150-200 words total.`;

        let response;
        try {
            // Try aiService first, then fallback to geminiAI directly
            if (window.aiService?.isAvailable()) {
                response = await window.aiService.generateContent(prompt, context);
            } else if (window.geminiAI?.isInitialized()) {
                response = await window.geminiAI.generateContent(prompt, context);
            } else {
                throw new Error('No AI service available');
            }
        } catch (error) {
            console.error('AI insight generation failed:', error);
            return this.generateFallbackInsights(context);
        }
        
        return {
            progressSummary: this.extractProgressSummary(response),
            recommendations: this.extractRecommendations(response),
            focusArea: this.extractFocusArea(response),
            motivationalMessage: this.extractMotivationalMessage(response),
            dataQuality: this.assessDataQuality()
        };
    }

    renderAIInsights(insights) {
        const insightsContainer = document.getElementById('ai-insights');
        if (!insightsContainer) return;

        insightsContainer.innerHTML = `
            <div class="ai-insights-content">
                <div class="insight-section progress-summary">
                    <h5>📊 Your Progress</h5>
                    <p>${insights.progressSummary}</p>
                </div>
                
                <div class="insight-section recommendations">
                    <h5>💡 Personalized Recommendations</h5>
                    <ul class="recommendations-list">
                        ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="insight-section focus-area">
                    <h5>🎯 Focus Area</h5>
                    <p>${insights.focusArea}</p>
                </div>
                
                <div class="insight-section motivational">
                    <h5>💪 Keep Going!</h5>
                    <p class="motivational-message">${insights.motivationalMessage}</p>
                </div>
                
                <div class="data-quality-indicator">
                    <div class="quality-bar">
                        <div class="quality-fill" style="width: ${insights.dataQuality.score}%"></div>
                    </div>
                    <small>Data completeness: ${insights.dataQuality.score}%</small>
                </div>
                
                <div class="ai-disclaimer">
                    <small>🤖 AI-generated insights based on your health data. Always consult healthcare professionals for medical advice.</small>
                </div>
            </div>
        `;
    }

    showFallbackInsights() {
        const insightsContainer = document.getElementById('ai-insights');
        if (!insightsContainer) return;

        const { summary } = this.dashboardData;
        
        insightsContainer.innerHTML = `
            <div class="ai-insights-content fallback-insights">
                <div class="insight-section">
                    <h5>📊 Your Health Overview</h5>
                    <p>${this.generateBasicProgressSummary()}</p>
                </div>
                
                <div class="insight-section">
                    <h5>💡 Recommendations</h5>
                    <ul class="recommendations-list">
                        ${this.generateBasicRecommendations().map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="insight-section">
                    <h5>🎯 Next Steps</h5>
                    <p>${this.generateBasicNextSteps()}</p>
                </div>
                
                <div class="upgrade-prompt">
                    <button class="btn-link" onclick="enhancedDashboard.generateAIInsights()">
                        🤖 Enable AI for Enhanced Insights
                    </button>
                </div>
            </div>
        `;
    }

    // Utility Methods
    getRiskCategory(score) {
        if (score < 7) return 'Low';
        if (score < 15) return 'Increased';
        if (score < 20) return 'High';
        return 'Possible Diabetes';
    }

    assessDataQuality() {
        const { summary } = this.dashboardData;
        let score = 0;
        let maxScore = 100;

        // Risk assessment data (30 points)
        if (summary.latestRiskScore !== null) score += 30;

        // Mood data (25 points)
        if (summary.totalMoodEntries > 0) {
            score += Math.min(25, (summary.totalMoodEntries / 7) * 25);
        }

        // Nutrition data (25 points)
        if (this.dashboardData.nutritionPlans.length > 0) {
            score += Math.min(25, (this.dashboardData.nutritionPlans.length / 3) * 25);
        }

        // Consistency/streak data (20 points)
        if (summary.streakDays > 0) {
            score += Math.min(20, (summary.streakDays / 7) * 20);
        }

        return {
            score: Math.round(score),
            maxScore: maxScore,
            level: score >= 70 ? 'excellent' : score >= 40 ? 'good' : score >= 20 ? 'fair' : 'insufficient'
        };
    }

    generateFallbackInsights(context) {
        const insights = {
            progressSummary: this.generateBasicProgressSummary(),
            recommendations: this.generateBasicRecommendations(),
            focusArea: this.generateBasicFocusArea(),
            motivationalMessage: this.generateBasicMotivationalMessage(),
            dataQuality: this.assessDataQuality()
        };
        return insights;
    }

    extractProgressSummary(response) {
        // Extract progress summary from AI response
        const lines = response.split('\n').filter(line => line.trim());
        const summaryStart = lines.findIndex(line => 
            line.toLowerCase().includes('progress') || 
            line.toLowerCase().includes('summary') ||
            line.includes('1.')
        );
        
        if (summaryStart >= 0) {
            const summaryLines = lines.slice(summaryStart, summaryStart + 3);
            return summaryLines.join(' ').replace(/^\d+\.\s*/, '').trim();
        }
        
        return lines.slice(0, 2).join(' ').trim() || this.generateBasicProgressSummary();
    }

    extractRecommendations(response) {
        const lines = response.split('\n').filter(line => line.trim());
        const recommendations = [];
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.match(/^\d+\.\s/) || trimmed.startsWith('•') || trimmed.startsWith('-')) {
                const rec = trimmed.replace(/^\d+\.\s*/, '').replace(/^[•-]\s*/, '').trim();
                if (rec && !rec.toLowerCase().includes('progress') && !rec.toLowerCase().includes('summary')) {
                    recommendations.push(rec);
                }
            }
        });
        
        return recommendations.length > 0 ? recommendations.slice(0, 3) : this.generateBasicRecommendations();
    }

    extractFocusArea(response) {
        const lines = response.split('\n').filter(line => line.trim());
        const focusLine = lines.find(line => 
            line.toLowerCase().includes('focus') || 
            line.toLowerCase().includes('priority') ||
            line.toLowerCase().includes('area')
        );
        
        if (focusLine) {
            return focusLine.replace(/^\d+\.\s*/, '').trim();
        }
        
        return this.generateBasicFocusArea();
    }

    extractMotivationalMessage(response) {
        const lines = response.split('\n').filter(line => line.trim());
        const motivationalLine = lines.find(line => 
            line.toLowerCase().includes('keep') || 
            line.toLowerCase().includes('great') ||
            line.toLowerCase().includes('continue') ||
            line.toLowerCase().includes('proud')
        );
        
        if (motivationalLine) {
            return motivationalLine.replace(/^\d+\.\s*/, '').trim();
        }
        
        return this.generateBasicMotivationalMessage();
    }

    generateBasicProgressSummary() {
        const { summary } = this.dashboardData;
        
        if (summary.totalAssessments === 0) {
            return "Welcome to your health journey! You're taking the first important step by using GlucoBalance to monitor your health.";
        }
        
        if (summary.improvementScore && summary.improvementScore > 60) {
            return "Excellent progress! Your consistent efforts in tracking your health metrics are showing positive results.";
        }
        
        if (summary.streakDays > 7) {
            return `Great consistency! You've maintained a ${summary.streakDays}-day streak of health tracking, which shows real commitment to your wellbeing.`;
        }
        
        return "You're building healthy habits by staying engaged with your health tracking. Every entry brings valuable insights.";
    }

    generateBasicRecommendations() {
        const { summary } = this.dashboardData;
        const recommendations = [];
        
        if (!summary.latestRiskScore) {
            recommendations.push("Complete your first risk assessment to get personalized health insights");
        }
        
        if (summary.totalMoodEntries < 7) {
            recommendations.push("Track your mood daily to identify patterns and improve emotional wellbeing");
        }
        
        if (this.dashboardData.nutritionPlans.length === 0) {
            recommendations.push("Create a personalized meal plan to support your diabetes prevention goals");
        }
        
        if (recommendations.length === 0) {
            recommendations.push(
                "Continue your regular health assessments to monitor progress",
                "Maintain consistent mood tracking for better mental health awareness",
                "Stay active with regular physical exercise and balanced nutrition"
            );
        }
        
        return recommendations.slice(0, 3);
    }

    generateBasicFocusArea() {
        const { summary } = this.dashboardData;
        
        if (!summary.latestRiskScore) {
            return "Start with completing your risk assessment to establish a baseline for your health journey.";
        }
        
        if (summary.averageMood && summary.averageMood < 3) {
            return "Focus on mental health and stress management, as emotional wellbeing directly impacts physical health.";
        }
        
        if (summary.nutritionAdherence && summary.nutritionAdherence < 60) {
            return "Prioritize nutrition consistency, as dietary habits are fundamental to diabetes prevention.";
        }
        
        return "Maintain your current healthy habits while gradually building new ones for long-term success.";
    }

    generateBasicMotivationalMessage() {
        const { summary } = this.dashboardData;
        
        if (summary.streakDays > 14) {
            return "Your dedication is inspiring! You're building lifelong healthy habits that will serve you well.";
        }
        
        if (summary.totalAssessments > 1) {
            return "You're taking control of your health journey with consistent monitoring. Keep up the excellent work!";
        }
        
        return "Every step you take towards better health matters. You're investing in your future wellbeing!";
    }

    getTodaysMood(moods) {
        const today = new Date().toISOString().split('T')[0];
        const todayMood = moods.find(m => m.date === today);
        return todayMood ? todayMood.mood : null;
    }

    calculateAverageMood(moods) {
        if (moods.length === 0) return null;
        const sum = moods.reduce((acc, mood) => acc + mood.mood, 0);
        return sum / moods.length;
    }

    calculateMoodTrend(moods) {
        if (moods.length < 2) return 'Insufficient data';
        
        const recent = moods.slice(0, 7);
        const older = moods.slice(7, 14);
        
        if (older.length === 0) return 'Getting started';
        
        const recentAvg = recent.reduce((sum, m) => sum + m.mood, 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + m.mood, 0) / older.length;
        
        const diff = recentAvg - olderAvg;
        
        if (diff > 0.3) return 'Improving';
        if (diff < -0.3) return 'Declining';
        return 'Stable';
    }

    calculateNutritionAdherence(plans) {
        if (plans.length === 0) return null;
        // Simulate adherence calculation
        return 75 + Math.random() * 20;
    }

    calculateStreakDays(moods) {
        if (moods.length === 0) return 0;
        
        const sortedMoods = moods.sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < sortedMoods.length; i++) {
            const moodDate = new Date(sortedMoods[i].date);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            
            if (moodDate.toDateString() === expectedDate.toDateString()) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateImprovementScore(assessments, moods) {
        if (assessments.length < 2 && moods.length < 7) return null;
        
        let score = 0;
        let factors = 0;
        
        // Risk improvement
        if (assessments.length >= 2) {
            const latest = assessments[0].riskScore;
            const previous = assessments[1].riskScore;
            if (latest < previous) {
                score += 40;
            } else if (latest === previous) {
                score += 20;
            }
            factors++;
        }
        
        // Mood stability
        if (moods.length >= 7) {
            const avgMood = this.calculateAverageMood(moods);
            if (avgMood >= 4) {
                score += 30;
            } else if (avgMood >= 3) {
                score += 15;
            }
            factors++;
        }
        
        // Consistency
        const streakDays = this.calculateStreakDays(moods);
        if (streakDays >= 7) {
            score += 30;
        } else if (streakDays >= 3) {
            score += 15;
        }
        factors++;
        
        return factors > 0 ? score / factors : 0;
    }

    identifyAchievements(assessments, moods, nutritionPlans) {
        const achievements = [];
        
        if (assessments.length >= 1) achievements.push('Completed risk assessment');
        if (moods.length >= 7) achievements.push('7-day mood tracking');
        if (this.calculateStreakDays(moods) >= 14) achievements.push('2-week consistency');
        if (nutritionPlans.length >= 1) achievements.push('Created meal plan');
        if (assessments.length >= 2) achievements.push('Progress tracking');
        
        return achievements;
    }

    getMoodEmoji(mood) {
        const emojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
        return emojis[mood] || '😐';
    }

    getNutritionLevel(adherence) {
        if (adherence >= 80) return 'excellent';
        if (adherence >= 60) return 'good';
        if (adherence >= 40) return 'fair';
        return 'needs-improvement';
    }

    daysSinceLastAssessment() {
        if (!this.dashboardData.summary.lastAssessmentDate) return Infinity;
        const lastDate = new Date(this.dashboardData.summary.lastAssessmentDate);
        const today = new Date();
        return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    }

    assessDataQuality() {
        const { summary } = this.dashboardData;
        let score = 0;
        
        if (summary.latestRiskScore !== null) score += 30;
        if (summary.totalMoodEntries >= 7) score += 25;
        if (this.dashboardData.nutritionPlans.length > 0) score += 20;
        if (summary.streakDays >= 3) score += 15;
        if (summary.totalAssessments >= 2) score += 10;
        
        return { score, level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low' };
    }

    async recordMood(mood) {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Update UI immediately
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
            const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
            if (selectedBtn) selectedBtn.classList.add('selected');
            
            // Save to database
            if (window.kiroDb && this.currentUser) {
                await window.kiroDb.saveMood(this.currentUser, today, mood, '');
                
                // Refresh dashboard data
                await this.aggregateHealthData();
                await this.renderMoodTrackerCard();
                await this.updateHealthSummary();
                
                this.showNotification('Mood recorded successfully!', 'success');
            }
        } catch (error) {
            console.error('Failed to record mood:', error);
            this.showNotification('Failed to record mood. Please try again.', 'error');
        }
    }

    // UI State Methods
    showLoadingState() {
        this.isLoading = true;
        const dashboard = document.querySelector('.dashboard-main');
        if (dashboard) {
            dashboard.classList.add('loading');
        }
    }

    hideLoadingState() {
        this.isLoading = false;
        const dashboard = document.querySelector('.dashboard-main');
        if (dashboard) {
            dashboard.classList.remove('loading');
        }
    }

    showRefreshingState() {
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.classList.add('refreshing');
            refreshBtn.innerHTML = '⟳';
        }
    }

    showNotification(message, type = 'info') {
        // Use existing notification system
        if (window.glucoApp?.showNotification) {
            window.glucoApp.showNotification(message, type);
        }
    }

    addChartInteractivity(chartContainer) {
        const bars = chartContainer.querySelectorAll('.chart-bar');
        bars.forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                this.showChartTooltip(e.target);
            });
            
            bar.addEventListener('mouseleave', () => {
                this.hideChartTooltip();
            });
        });
    }

    showChartTooltip(element) {
        // Implementation for chart tooltips
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.textContent = element.title;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
    }

    hideChartTooltip() {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    clearDashboard() {
        this.dashboardData = {};
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    getFallbackData() {
        return {
            riskAssessments: [],
            moodEntries: [],
            nutritionPlans: [],
            progressMetrics: [],
            summary: {
                latestRiskScore: null,
                latestRiskCategory: null,
                currentMood: null,
                averageMood: null,
                moodTrend: 'No data',
                totalAssessments: 0,
                totalMoodEntries: 0,
                nutritionAdherence: null,
                streakDays: 0,
                improvementScore: null,
                achievements: []
            }
        };
    }

    // Helper methods for AI insight extraction
    extractProgressSummary(response) {
        // Extract progress summary from AI response
        const lines = response.split('\n');
        return lines.find(line => line.includes('progress') || line.includes('summary')) || 
               'You\'re making progress on your health journey. Keep up the great work!';
    }

    extractRecommendations(response) {
        // Extract recommendations from AI response
        const recommendations = [];
        const lines = response.split('\n');
        
        lines.forEach(line => {
            if (line.match(/^\d+\./) || line.startsWith('•') || line.startsWith('-')) {
                recommendations.push(line.replace(/^\d+\.\s*|^[•-]\s*/, ''));
            }
        });
        
        return recommendations.length > 0 ? recommendations.slice(0, 3) : [
            'Continue tracking your daily mood',
            'Maintain regular health assessments',
            'Focus on consistent healthy habits'
        ];
    }

    extractFocusArea(response) {
        // Extract focus area from AI response
        const focusMatch = response.match(/focus[^.]*\.?/i);
        return focusMatch ? focusMatch[0] : 'Continue building healthy daily habits for long-term success.';
    }

    extractMotivationalMessage(response) {
        // Extract motivational message from AI response
        const motivationalMatch = response.match(/motivat[^.]*\.?|keep[^.]*\.?|great[^.]*\.?/i);
        return motivationalMatch ? motivationalMatch[0] : 'You\'re doing great! Every step counts in your health journey.';
    }

    generateBasicProgressSummary() {
        const { summary } = this.dashboardData;
        
        if (summary.totalAssessments === 0 && summary.totalMoodEntries === 0) {
            return 'Welcome to your health dashboard! Start by taking a risk assessment or logging your mood to begin tracking your progress.';
        }
        
        let summary_text = 'You\'re actively engaged in your health journey. ';
        
        if (summary.totalAssessments > 0) {
            summary_text += `You've completed ${summary.totalAssessments} risk assessment${summary.totalAssessments > 1 ? 's' : ''}. `;
        }
        
        if (summary.totalMoodEntries > 0) {
            summary_text += `You've logged ${summary.totalMoodEntries} mood entries with a ${summary.streakDays}-day streak. `;
        }
        
        return summary_text + 'Keep up the consistent effort!';
    }

    generateBasicRecommendations() {
        const { summary } = this.dashboardData;
        const recommendations = [];
        
        if (!summary.latestRiskScore) {
            recommendations.push('Take your first risk assessment to understand your diabetes risk');
        } else if (this.daysSinceLastAssessment() > 30) {
            recommendations.push('Update your risk assessment to track changes');
        }
        
        if (!summary.currentMood) {
            recommendations.push('Log today\'s mood to maintain your tracking streak');
        }
        
        if (this.dashboardData.nutritionPlans.length === 0) {
            recommendations.push('Create a personalized meal plan for better nutrition');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Continue your consistent health tracking habits');
            recommendations.push('Consider sharing your progress with a healthcare provider');
        }
        
        return recommendations.slice(0, 3);
    }

    generateBasicNextSteps() {
        const { summary } = this.dashboardData;
        
        if (summary.totalAssessments === 0) {
            return 'Start with a risk assessment to establish your baseline health metrics.';
        }
        
        if (summary.streakDays < 7) {
            return 'Focus on building a consistent daily mood tracking habit.';
        }
        
        if (this.dashboardData.nutritionPlans.length === 0) {
            return 'Consider creating a meal plan to support your health goals.';
        }
        
        return 'You\'re doing well! Continue your current habits and consider scheduling a check-in with your healthcare provider.';
    }
}

// Initialize enhanced dashboard
window.enhancedDashboard = new EnhancedDashboard();   
 // Additional utility methods for enhanced dashboard functionality
    
    calculateRiskTrend() {
        const assessments = this.dashboardData.riskAssessments;
        if (assessments.length < 2) {
            return { direction: 'stable', icon: '📊', text: 'Baseline' };
        }
        
        const latest = assessments[0].riskScore;
        const previous = assessments[1].riskScore;
        const diff = latest - previous;
        
        if (diff < -2) {
            return { direction: 'down', icon: '📉', text: 'Improving' };
        } else if (diff > 2) {
            return { direction: 'up', icon: '📈', text: 'Increasing' };
        } else {
            return { direction: 'stable', icon: '📊', text: 'Stable' };
        }
    }
    
    getMoodTrendData() {
        const trend = this.dashboardData.summary.moodTrend;
        switch (trend) {
            case 'Improving':
                return { direction: 'up', icon: '📈', text: 'Improving' };
            case 'Declining':
                return { direction: 'down', icon: '📉', text: 'Needs attention' };
            case 'Stable':
                return { direction: 'stable', icon: '📊', text: 'Stable' };
            default:
                return { direction: 'stable', icon: '📊', text: 'Getting started' };
        }
    }
    
    getNutritionTrendData() {
        const adherence = this.dashboardData.summary.nutritionAdherence;
        if (!adherence) {
            return { direction: 'stable', icon: '🍎', text: 'Getting started' };
        }
        
        if (adherence >= 80) {
            return { direction: 'up', icon: '📈', text: 'Excellent' };
        } else if (adherence >= 60) {
            return { direction: 'stable', icon: '📊', text: 'Good progress' };
        } else {
            return { direction: 'down', icon: '📉', text: 'Needs improvement' };
        }
    }
    
    getMoodEmoji(mood) {
        const emojis = {
            1: '😢',
            2: '😕', 
            3: '😐',
            4: '😊',
            5: '😄'
        };
        return emojis[mood] || '😐';
    }
    
    getNutritionLevel(adherence) {
        if (adherence >= 85) return 'excellent';
        if (adherence >= 70) return 'good';
        if (adherence >= 50) return 'fair';
        return 'needs-improvement';
    }
    
    daysSinceLastAssessment() {
        const { summary } = this.dashboardData;
        if (!summary.lastAssessmentDate) return Infinity;
        
        const lastDate = new Date(summary.lastAssessmentDate);
        const today = new Date();
        const diffTime = Math.abs(today - lastDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    renderRiskMiniChart(container) {
        if (!container) return;
        
        const assessments = this.dashboardData.riskAssessments.slice(0, 5).reverse();
        if (assessments.length === 0) {
            container.innerHTML = '<div class="no-data">No data</div>';
            return;
        }
        
        const maxScore = Math.max(...assessments.map(a => a.riskScore), 25);
        const barsHTML = assessments.map(assessment => {
            const height = (assessment.riskScore / maxScore) * 100;
            const category = this.getRiskCategory(assessment.riskScore);
            return `<div class="mini-bar risk-${category.toLowerCase().replace(' ', '-')}" style="height: ${height}%"></div>`;
        }).join('');
        
        container.innerHTML = barsHTML;
    }
    
    renderMoodMiniChart(container) {
        if (!container) return;
        
        const moods = this.dashboardData.moodEntries.slice(0, 7).reverse();
        if (moods.length === 0) {
            container.innerHTML = '<div class="no-data">No data</div>';
            return;
        }
        
        const barsHTML = moods.map(mood => {
            const height = (mood.mood / 5) * 100;
            return `<div class="mini-bar" style="height: ${height}%"></div>`;
        }).join('');
        
        container.innerHTML = barsHTML;
    }
    
    addChartInteractivity(chartContainer) {
        const bars = chartContainer.querySelectorAll('.chart-bar');
        let tooltip = null;
        
        bars.forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                // Create tooltip
                tooltip = document.createElement('div');
                tooltip.className = 'chart-tooltip';
                
                const score = e.target.dataset.score;
                const date = e.target.dataset.date;
                const category = e.target.dataset.category;
                const mood = e.target.dataset.mood;
                const adherence = e.target.dataset.adherence;
                
                if (score) {
                    tooltip.textContent = `Score: ${score} (${category}) - ${date}`;
                } else if (mood) {
                    const emoji = e.target.dataset.emoji;
                    tooltip.textContent = `Mood: ${mood}/5 ${emoji} - ${date}`;
                } else if (adherence) {
                    tooltip.textContent = `Adherence: ${adherence}% - ${date}`;
                }
                
                document.body.appendChild(tooltip);
                
                // Position tooltip
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            });
            
            bar.addEventListener('mouseleave', () => {
                if (tooltip) {
                    document.body.removeChild(tooltip);
                    tooltip = null;
                }
            });
        });
    }
    
    updateChartsTimeframe(days) {
        // Update charts based on selected timeframe
        this.renderInteractiveCharts();
    }
    
    async recordMood(moodValue) {
        if (!this.currentUser) return;
        
        try {
            const moodData = {
                userId: this.currentUser,
                mood: parseInt(moodValue),
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                notes: ''
            };
            
            // Save to database
            await window.kiroDb?.saveMood(moodData);
            
            // Update UI immediately
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.mood === moodValue) {
                    btn.classList.add('selected');
                }
            });
            
            // Refresh dashboard data
            await this.refreshDashboard(true);
            
            this.showNotification('Mood logged successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to record mood:', error);
            this.showNotification('Failed to log mood. Please try again.', 'error');
        }
    }
    
    showMoodHistory() {
        // Navigate to detailed mood history view
        if (window.glucoApp?.showMentalHealth) {
            window.glucoApp.showMentalHealth();
        }
    }
    
    getFallbackData() {
        return {
            riskAssessments: [],
            moodEntries: [],
            nutritionPlans: [],
            progressMetrics: [],
            summary: {
                latestRiskScore: null,
                latestRiskCategory: null,
                currentMood: null,
                averageMood: null,
                moodTrend: 'Unknown',
                totalAssessments: 0,
                totalMoodEntries: 0,
                nutritionAdherence: null,
                streakDays: 0,
                improvementScore: null,
                lastAssessmentDate: null,
                achievements: []
            }
        };
    }
    
    identifyAchievements(assessments, moods, nutritionPlans) {
        const achievements = [];
        
        // Assessment achievements
        if (assessments.length >= 1) achievements.push('First Assessment Complete');
        if (assessments.length >= 5) achievements.push('Health Monitoring Pro');
        
        // Mood tracking achievements
        if (moods.length >= 7) achievements.push('Week of Mood Tracking');
        if (moods.length >= 30) achievements.push('Month of Self-Awareness');
        
        // Streak achievements
        const streakDays = this.calculateStreakDays(moods);
        if (streakDays >= 7) achievements.push('7-Day Streak');
        if (streakDays >= 30) achievements.push('30-Day Champion');
        
        // Nutrition achievements
        if (nutritionPlans.length >= 1) achievements.push('Nutrition Planning Started');
        if (nutritionPlans.length >= 5) achievements.push('Meal Planning Expert');
        
        return achievements;
    }
    
    showInsufficientDataInsights() {
        const insightsContainer = document.getElementById('ai-insights');
        if (!insightsContainer) return;
        
        insightsContainer.innerHTML = `
            <div class="ai-insights-content insufficient-data">
                <div class="insight-section">
                    <h5>📊 Getting Started</h5>
                    <p>Complete more health activities to unlock personalized AI insights!</p>
                </div>
                
                <div class="data-requirements">
                    <h6>To get AI insights, try:</h6>
                    <ul class="requirements-list">
                        <li>✅ Complete your risk assessment</li>
                        <li>📝 Log your mood for a few days</li>
                        <li>🍎 Create a nutrition plan</li>
                    </ul>
                </div>
                
                <div class="quick-start-actions">
                    <button class="btn-primary" onclick="window.glucoApp?.showAssessment()">
                        Start Risk Assessment
                    </button>
                </div>
            </div>
        `;
    }
    
    async showAIEnablePrompt() {
        if (window.geminiAI?.promptForApiKey) {
            return await window.geminiAI.promptForApiKey();
        }
        return false;
    }
    
    showLoadingState() {
        this.isLoading = true;
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.classList.add('loading');
        }
    }
    
    hideLoadingState() {
        this.isLoading = false;
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.classList.remove('loading');
        }
    }
    
    showRefreshingState() {
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.classList.add('refreshing');
        }
    }
    
    showErrorState(message) {
        this.showNotification(message, 'error');
    }
    
    showLoginPrompt() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.innerHTML = `
                <div class="login-prompt">
                    <div class="prompt-content">
                        <h2>Welcome to GlucoBalance</h2>
                        <p>Please sign in to access your personalized health dashboard.</p>
                        <button class="btn-primary" onclick="window.glucoApp?.showAuth?.()">
                            Sign In
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    clearDashboard() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.innerHTML = '';
        }
        this.dashboardData = this.getFallbackData();
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
    
    // Cleanup method
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Remove event listeners
        document.removeEventListener('dataUpdated', this.handleDataUpdate);
        document.removeEventListener('authStateChanged', this.handleAuthChange);
    }
}

// Initialize enhanced dashboard
window.enhancedDashboard = new EnhancedDashboard();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedDashboard;
}    // Mi
ssing utility methods to complete the dashboard functionality
    
    extractProgressSummary(response) {
        // Extract progress summary from AI response
        const lines = response.split('\n');
        const summaryLines = lines.slice(0, 3);
        return summaryLines.join(' ').trim() || this.generateBasicProgressSummary();
    }

    extractRecommendations(response) {
        // Extract recommendations from AI response
        const lines = response.split('\n');
        const recommendations = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.match(/^\d+\./)) {
                recommendations.push(line.replace(/^\d+\.\s*/, ''));
            }
        }
        
        return recommendations.length > 0 ? recommendations : this.generateBasicRecommendations();
    }

    extractFocusArea(response) {
        // Extract focus area from AI response
        const focusMatch = response.match(/focus\s+(?:on|area)[:\s]*([^.!?]+)/i);
        return focusMatch ? focusMatch[1].trim() : this.generateBasicFocusArea();
    }

    extractMotivationalMessage(response) {
        // Extract motivational message from AI response
        const lines = response.split('\n');
        const lastLines = lines.slice(-3);
        return lastLines.join(' ').trim() || this.generateBasicMotivationalMessage();
    }

    generateBasicProgressSummary() {
        const { summary } = this.dashboardData;
        
        if (summary.totalAssessments === 0) {
            return "Welcome to GlucoBalance! You're taking the first step toward better health management by joining our platform.";
        }
        
        const riskText = summary.latestRiskScore ? 
            `Your current risk score is ${summary.latestRiskScore} (${summary.latestRiskCategory})` :
            "Complete your first risk assessment to get started";
            
        const moodText = summary.totalMoodEntries > 0 ?
            `You've logged ${summary.totalMoodEntries} mood entries with an average of ${summary.averageMood?.toFixed(1)}/5` :
            "Start tracking your daily mood for better insights";
            
        return `${riskText}. ${moodText}. Keep up the great work on your health journey!`;
    }

    generateBasicRecommendations() {
        const { summary } = this.dashboardData;
        const recommendations = [];
        
        if (summary.totalAssessments === 0) {
            recommendations.push("Complete your first diabetes risk assessment to understand your baseline health status");
        } else if (this.daysSinceLastAssessment() > 30) {
            recommendations.push("Consider retaking your risk assessment to track changes in your health profile");
        }
        
        if (summary.totalMoodEntries < 7) {
            recommendations.push("Log your daily mood for at least a week to identify patterns and trends");
        }
        
        if (this.dashboardData.nutritionPlans.length === 0) {
            recommendations.push("Create your first personalized meal plan to support your health goals");
        }
        
        if (recommendations.length === 0) {
            recommendations.push("Continue your consistent health tracking - you're doing great!");
            recommendations.push("Consider sharing your progress with a healthcare provider");
            recommendations.push("Explore new features like the doctor report generator");
        }
        
        return recommendations.slice(0, 3);
    }

    generateBasicFocusArea() {
        const { summary } = this.dashboardData;
        
        if (summary.totalAssessments === 0) {
            return "Complete your initial health assessment to establish your baseline and get personalized recommendations";
        }
        
        if (summary.averageMood && summary.averageMood < 3) {
            return "Focus on mental health support and stress management techniques to improve overall wellbeing";
        }
        
        if (summary.nutritionAdherence && summary.nutritionAdherence < 70) {
            return "Improve nutrition plan adherence by setting realistic goals and tracking daily meals";
        }
        
        return "Maintain consistent health tracking and celebrate your progress milestones";
    }

    generateBasicMotivationalMessage() {
        const { summary } = this.dashboardData;
        
        const messages = [
            "Every step you take toward better health matters. Keep going!",
            "Your commitment to health tracking shows real dedication. Well done!",
            "Small consistent actions lead to big health improvements over time.",
            "You're building healthy habits that will benefit you for years to come.",
            "Your health journey is unique and valuable. Stay motivated!"
        ];
        
        if (summary.streakDays > 7) {
            return `Amazing! You've maintained a ${summary.streakDays}-day tracking streak. Your consistency is inspiring!`;
        }
        
        if (summary.improvementScore && summary.improvementScore > 80) {
            return "Your health metrics show excellent improvement. You should be proud of your progress!";
        }
        
        return messages[Math.floor(Math.random() * messages.length)];
    }

    showInsufficientDataInsights() {
        const insightsContainer = document.getElementById('ai-insights');
        if (!insightsContainer) return;

        insightsContainer.innerHTML = `
            <div class="ai-insights-content insufficient-data">
                <div class="insight-section">
                    <h5>📊 Get Started with AI Insights</h5>
                    <p>Complete a few health activities to unlock personalized AI-powered insights and recommendations.</p>
                </div>
                
                <div class="data-requirements">
                    <h6>To unlock AI insights, try:</h6>
                    <ul class="requirements-list">
                        <li>Complete your diabetes risk assessment</li>
                        <li>Log your mood for a few days</li>
                        <li>Create a personalized meal plan</li>
                        <li>Track your progress consistently</li>
                    </ul>
                </div>
                
                <div class="quick-start-actions">
                    <button class="btn-primary" onclick="window.glucoApp?.showAssessment()">
                        📋 Start Risk Assessment
                    </button>
                </div>
            </div>
        `;
    }

    async showAIEnablePrompt() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>🤖 Enable AI Insights</h3>
                    <p>Get personalized health insights powered by AI. This feature analyzes your health data to provide tailored recommendations and support.</p>
                    <div class="modal-actions">
                        <button class="btn-primary" id="enable-ai-btn">Enable AI Insights</button>
                        <button class="btn-secondary" id="skip-ai-btn">Maybe Later</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('enable-ai-btn').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
            
            document.getElementById('skip-ai-btn').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    }

    // Additional utility methods for dashboard functionality
    
    getTodaysMood(moods) {
        const today = new Date().toISOString().split('T')[0];
        const todayMood = moods.find(mood => mood.date === today);
        return todayMood ? todayMood.mood : null;
    }

    calculateAverageMood(moods) {
        if (moods.length === 0) return null;
        const sum = moods.reduce((acc, mood) => acc + mood.mood, 0);
        return sum / moods.length;
    }

    calculateMoodTrend(moods) {
        if (moods.length < 2) return 'stable';
        
        const recent = moods.slice(0, 7);
        const older = moods.slice(7, 14);
        
        if (recent.length === 0 || older.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((acc, mood) => acc + mood.mood, 0) / recent.length;
        const olderAvg = older.reduce((acc, mood) => acc + mood.mood, 0) / older.length;
        
        const difference = recentAvg - olderAvg;
        
        if (difference > 0.3) return 'improving';
        if (difference < -0.3) return 'declining';
        return 'stable';
    }

    calculateNutritionAdherence(nutritionPlans) {
        if (nutritionPlans.length === 0) return null;
        
        // Simulate adherence calculation
        const totalPlans = nutritionPlans.length;
        const adherenceSum = nutritionPlans.reduce((sum, plan) => {
            // Simulate adherence based on plan age and type
            const daysOld = Math.floor((Date.now() - new Date(plan.createdAt)) / (1000 * 60 * 60 * 24));
            const baseAdherence = plan.planType === '3-day' ? 85 : 75;
            const ageDecay = Math.max(0, daysOld * 2);
            return sum + Math.max(30, baseAdherence - ageDecay);
        }, 0);
        
        return adherenceSum / totalPlans;
    }

    calculateStreakDays(moods) {
        if (moods.length === 0) return 0;
        
        const sortedMoods = moods.sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();
        
        for (const mood of sortedMoods) {
            const moodDate = new Date(mood.date);
            const daysDiff = Math.floor((currentDate - moodDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
                currentDate = moodDate;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateImprovementScore(assessments, moods) {
        let score = 0;
        let factors = 0;
        
        // Risk improvement
        if (assessments.length >= 2) {
            const latest = assessments[0].riskScore;
            const previous = assessments[1].riskScore;
            if (latest < previous) {
                score += 40;
            } else if (latest === previous) {
                score += 20;
            }
            factors++;
        }
        
        // Mood consistency
        if (moods.length >= 7) {
            const avgMood = this.calculateAverageMood(moods);
            if (avgMood >= 4) {
                score += 30;
            } else if (avgMood >= 3) {
                score += 15;
            }
            factors++;
        }
        
        // Tracking consistency
        const streakDays = this.calculateStreakDays(moods);
        if (streakDays >= 7) {
            score += 30;
        } else if (streakDays >= 3) {
            score += 15;
        }
        factors++;
        
        return factors > 0 ? score / factors : null;
    }

    identifyAchievements(assessments, moods, nutritionPlans) {
        const achievements = [];
        
        if (assessments.length >= 1) {
            achievements.push('First Assessment Complete');
        }
        
        if (moods.length >= 7) {
            achievements.push('Week of Mood Tracking');
        }
        
        if (moods.length >= 30) {
            achievements.push('Month of Mood Tracking');
        }
        
        if (nutritionPlans.length >= 1) {
            achievements.push('First Meal Plan Created');
        }
        
        const streakDays = this.calculateStreakDays(moods);
        if (streakDays >= 7) {
            achievements.push('7-Day Tracking Streak');
        }
        
        if (streakDays >= 30) {
            achievements.push('30-Day Tracking Streak');
        }
        
        return achievements;
    }

    calculateRiskTrend() {
        const assessments = this.dashboardData.riskAssessments;
        
        if (assessments.length < 2) {
            return { direction: 'stable', icon: '➡️', text: 'Baseline established' };
        }
        
        const latest = assessments[0].riskScore;
        const previous = assessments[1].riskScore;
        
        if (latest < previous) {
            return { direction: 'down', icon: '⬇️', text: 'Risk decreasing' };
        } else if (latest > previous) {
            return { direction: 'up', icon: '⬆️', text: 'Risk increasing' };
        } else {
            return { direction: 'stable', icon: '➡️', text: 'Risk stable' };
        }
    }

    getMoodTrendData() {
        const trend = this.calculateMoodTrend(this.dashboardData.moodEntries);
        
        switch (trend) {
            case 'improving':
                return { direction: 'up', icon: '📈', text: 'Mood improving' };
            case 'declining':
                return { direction: 'down', icon: '📉', text: 'Mood declining' };
            default:
                return { direction: 'stable', icon: '➡️', text: 'Mood stable' };
        }
    }

    getNutritionTrendData() {
        const adherence = this.dashboardData.summary.nutritionAdherence;
        
        if (!adherence) {
            return { direction: 'stable', icon: '🍎', text: 'Getting started' };
        }
        
        if (adherence >= 80) {
            return { direction: 'up', icon: '📈', text: 'Excellent adherence' };
        } else if (adherence >= 60) {
            return { direction: 'stable', icon: '➡️', text: 'Good progress' };
        } else {
            return { direction: 'down', icon: '📉', text: 'Needs improvement' };
        }
    }

    renderRiskMiniChart(container) {
        if (!container) return;
        
        const assessments = this.dashboardData.riskAssessments.slice(0, 5).reverse();
        
        if (assessments.length === 0) {
            container.innerHTML = '<div class="no-data">No data</div>';
            return;
        }
        
        const maxScore = Math.max(...assessments.map(a => a.riskScore), 25);
        const barsHTML = assessments.map(assessment => {
            const height = (assessment.riskScore / maxScore) * 100;
            const category = this.getRiskCategory(assessment.riskScore);
            
            return `<div class="mini-bar risk-${category.toLowerCase().replace(' ', '-')}" 
                         style="height: ${height}%" 
                         title="Score: ${assessment.riskScore}"></div>`;
        }).join('');
        
        container.innerHTML = barsHTML;
    }

    renderMoodMiniChart(container) {
        if (!container) return;
        
        const moods = this.dashboardData.moodEntries.slice(0, 7).reverse();
        
        if (moods.length === 0) {
            container.innerHTML = '<div class="no-data">No data</div>';
            return;
        }
        
        const barsHTML = moods.map(mood => {
            const height = (mood.mood / 5) * 100;
            
            return `<div class="mini-bar mood-level-${mood.mood}" 
                         style="height: ${height}%" 
                         title="Mood: ${mood.mood}/5"></div>`;
        }).join('');
        
        container.innerHTML = barsHTML;
    }

    getMoodEmoji(mood) {
        const emojis = {
            1: '😢',
            2: '😕',
            3: '😐',
            4: '😊',
            5: '😄'
        };
        return emojis[mood] || '😐';
    }

    getNutritionLevel(adherence) {
        if (adherence >= 80) return 'excellent';
        if (adherence >= 60) return 'good';
        if (adherence >= 40) return 'fair';
        return 'needs-improvement';
    }

    addChartInteractivity(chartContainer) {
        const bars = chartContainer.querySelectorAll('.chart-bar');
        
        bars.forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                this.showChartTooltip(e);
            });
            
            bar.addEventListener('mouseleave', () => {
                this.hideChartTooltip();
            });
        });
    }

    showChartTooltip(event) {
        const bar = event.target;
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        
        // Get tooltip content based on data attributes
        const score = bar.dataset.score;
        const mood = bar.dataset.mood;
        const adherence = bar.dataset.adherence;
        const date = bar.dataset.date;
        
        let content = '';
        if (score) {
            content = `Risk Score: ${score}<br>Category: ${bar.dataset.category}<br>Date: ${date}`;
        } else if (mood) {
            content = `Mood: ${mood}/5 ${bar.dataset.emoji}<br>Date: ${date}`;
        } else if (adherence) {
            content = `Adherence: ${adherence}%<br>Plan: ${bar.dataset.plan}<br>Date: ${date}`;
        }
        
        tooltip.innerHTML = content;
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = bar.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        
        this.currentTooltip = tooltip;
    }

    hideChartTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    updateChartsTimeframe(days) {
        // Update charts based on selected timeframe
        this.renderInteractiveCharts();
    }

    showMoodHistory() {
        // Navigate to mental health page to show mood history
        if (window.glucoApp) {
            window.glucoApp.showMentalHealth();
        }
    }

    daysSinceLastAssessment() {
        const { summary } = this.dashboardData;
        if (!summary.lastAssessmentDate) return Infinity;
        
        const lastDate = new Date(summary.lastAssessmentDate);
        const today = new Date();
        return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    }

    getFallbackData() {
        return {
            riskAssessments: [],
            moodEntries: [],
            nutritionPlans: [],
            progressMetrics: [],
            summary: {
                latestRiskScore: null,
                latestRiskCategory: null,
                currentMood: null,
                averageMood: null,
                moodTrend: 'stable',
                totalAssessments: 0,
                totalMoodEntries: 0,
                nutritionAdherence: null,
                streakDays: 0,
                improvementScore: null,
                lastAssessmentDate: null,
                achievements: []
            }
        };
    }

    showLoadingState() {
        this.isLoading = true;
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.classList.add('loading');
        }
    }

    hideLoadingState() {
        this.isLoading = false;
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.classList.remove('loading');
        }
    }

    showRefreshingState() {
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.classList.add('refreshing');
        }
    }

    showErrorState(message) {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Unable to Load Dashboard</h3>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="location.reload()">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    }

    showLoginPrompt() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.innerHTML = `
                <div class="login-prompt">
                    <div class="prompt-content">
                        <h2>Welcome to GlucoBalance</h2>
                        <p>Please log in to access your personalized health dashboard and track your progress.</p>
                        <button class="btn-primary" onclick="window.glucoApp?.showAuth?.() || window.authUI?.showLoginForm?.()">
                            🔐 Login to Continue
                        </button>
                    </div>
                </div>
            `;
        }
    }

    clearDashboard() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.innerHTML = '';
        }
        
        // Clear any running intervals
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}
//# sourceMappingURL=enhanced-dashboard.js.map