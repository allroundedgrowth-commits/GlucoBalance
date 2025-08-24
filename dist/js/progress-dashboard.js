// GlucoBalance - Progress Dashboard with AI Insights
class ProgressDashboard {
    constructor() {
        this.currentUser = null;
        this.dashboardData = {};
        this.chartInstances = {};
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for user authentication changes
        document.addEventListener('authStateChanged', (event) => {
            if (event.detail.isAuthenticated && event.detail.user) {
                this.setCurrentUser(event.detail.user.id);
            } else {
                this.currentUser = null;
                this.clearDashboard();
            }
        });

        // Listen for data updates
        document.addEventListener('dataUpdated', (event) => {
            if (this.currentUser && event.detail.userId === this.currentUser) {
                this.refreshDashboard();
            }
        });
    }

    setCurrentUser(userId) {
        this.currentUser = userId;
        if (document.getElementById('progress-page')?.classList.contains('active')) {
            this.loadDashboard();
        }
    }

    async loadDashboard() {
        if (!this.currentUser) {
            this.showLoginPrompt();
            return;
        }

        try {
            // Show loading state
            this.showLoadingState();

            // Aggregate data from all sources
            await this.aggregateHealthData();

            // Render dashboard components
            await this.renderDashboardCards();
            await this.renderProgressCharts();
            await this.renderQuickActions();
            await this.generateAIInsights();

            // Start real-time updates
            this.startRealTimeUpdates();

        } catch (error) {
            console.error('Failed to load progress dashboard:', error);
            this.showErrorState('Failed to load dashboard data. Please try again.');
        }
    }

    async aggregateHealthData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            // Get data from database
            const [assessments, moods, nutritionPlans, progressData] = await Promise.all([
                window.kiroDb?.getUserAssessments(this.currentUser, 10) || [],
                window.kiroDb?.getUserMoods(this.currentUser, 30) || [],
                window.kiroDb?.getUserNutritionPlans(this.currentUser, 5) || [],
                window.kiroDb?.getUserProgress(this.currentUser, null, 30) || []
            ]);

            // Calculate summary metrics
            this.dashboardData = {
                riskAssessments: assessments,
                moodEntries: moods,
                nutritionPlans: nutritionPlans,
                progressMetrics: progressData,
                summary: {
                    latestRiskScore: assessments.length > 0 ? assessments[0].riskScore : null,
                    latestRiskCategory: assessments.length > 0 ? this.getRiskCategory(assessments[0].riskScore) : null,
                    averageMood: this.calculateAverageMood(moods),
                    moodTrend: this.calculateMoodTrend(moods),
                    totalAssessments: assessments.length,
                    totalMoodEntries: moods.length,
                    nutritionAdherence: this.calculateNutritionAdherence(nutritionPlans),
                    streakDays: this.calculateStreakDays(moods),
                    improvementAreas: this.identifyImprovementAreas(assessments, moods)
                }
            };

        } catch (error) {
            console.error('Error aggregating health data:', error);
            // Fallback to localStorage data
            this.dashboardData = this.getFallbackData();
        }
    }

    async renderDashboardCards() {
        const cardsContainer = document.getElementById('dashboard-cards');
        if (!cardsContainer) return;

        const { summary } = this.dashboardData;

        cardsContainer.innerHTML = `
            <div class="dashboard-card risk-status-card">
                <div class="card-header">
                    <h3><span class="card-icon">🎯</span> Risk Status</h3>
                    <div class="card-trend ${this.getRiskTrendClass()}">
                        ${this.getRiskTrendIcon()}
                    </div>
                </div>
                <div class="card-content">
                    <div class="metric-display">
                        <div class="metric-value risk-score-${summary.latestRiskCategory?.toLowerCase() || 'unknown'}">
                            ${summary.latestRiskScore || '--'}
                        </div>
                        <div class="metric-label">
                            ${summary.latestRiskCategory || 'Take Assessment'}
                        </div>
                    </div>
                    <div class="card-footer">
                        <small>Last updated: ${this.getLastAssessmentDate()}</small>
                    </div>
                </div>
            </div>

            <div class="dashboard-card mood-tracker-card">
                <div class="card-header">
                    <h3><span class="card-icon">💙</span> Mood Tracker</h3>
                    <div class="card-trend ${this.getMoodTrendClass()}">
                        ${this.getMoodTrendIcon()}
                    </div>
                </div>
                <div class="card-content">
                    <div class="metric-display">
                        <div class="metric-value mood-${this.getMoodLevel(summary.averageMood)}">
                            ${summary.averageMood ? summary.averageMood.toFixed(1) : '--'}
                        </div>
                        <div class="metric-label">
                            Average Mood (30 days)
                        </div>
                    </div>
                    <div class="mood-mini-chart">
                        ${this.renderMiniMoodChart()}
                    </div>
                </div>
            </div>

            <div class="dashboard-card nutrition-snapshot-card">
                <div class="card-header">
                    <h3><span class="card-icon">🍎</span> Nutrition Snapshot</h3>
                    <div class="card-action">
                        <button class="btn-link" onclick="window.glucoApp.showNutrition()">View Plans</button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="metric-display">
                        <div class="metric-value nutrition-${this.getNutritionLevel(summary.nutritionAdherence)}">
                            ${summary.nutritionAdherence ? Math.round(summary.nutritionAdherence) + '%' : '--'}
                        </div>
                        <div class="metric-label">
                            Adherence Rate
                        </div>
                    </div>
                    <div class="card-footer">
                        <small>${this.dashboardData.nutritionPlans.length} meal plans created</small>
                    </div>
                </div>
            </div>

            <div class="dashboard-card ai-insights-card">
                <div class="card-header">
                    <h3><span class="card-icon">🤖</span> AI Health Insights</h3>
                    <div class="card-action">
                        <button class="btn-link refresh-insights" onclick="progressDashboard.generateAIInsights()">
                            <span class="refresh-icon">🔄</span>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <div id="ai-insights-content" class="ai-insights-content">
                        <div class="loading-insights">
                            <div class="spinner"></div>
                            <p>Generating personalized insights...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderProgressCharts() {
        await Promise.all([
            this.renderRiskTrendChart(),
            this.renderMoodTrendChart(),
            this.renderNutritionChart(),
            this.renderStreakChart()
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
                <div class="chart-bar risk-${category.toLowerCase()}" 
                     style="height: ${height}%" 
                     data-score="${assessment.riskScore}"
                     data-date="${date}"
                     data-category="${category}"
                     title="Score: ${assessment.riskScore} (${category}) - ${date}">
                </div>
            `;
        }).join('');

        chartContainer.innerHTML = `
            <div class="chart-header">
                <h4>Risk Score Trend</h4>
                <div class="chart-legend">
                    <span class="legend-item risk-low">Low</span>
                    <span class="legend-item risk-increased">Increased</span>
                    <span class="legend-item risk-high">High</span>
                    <span class="legend-item risk-possible-diabetes">Possible Diabetes</span>
                </div>
            </div>
            <div class="interactive-chart risk-chart">
                ${chartHTML}
            </div>
            <div class="chart-footer">
                <small>Last ${assessments.length} assessments</small>
            </div>
        `;

        this.addChartInteractivity('risk-chart');
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
                </div>
            `;
        }).join('');

        chartContainer.innerHTML = `
            <div class="chart-header">
                <h4>Mood Trend (14 days)</h4>
                <div class="mood-average">
                    Avg: ${this.dashboardData.summary.averageMood?.toFixed(1) || '--'}/5
                </div>
            </div>
            <div class="interactive-chart mood-chart">
                ${chartHTML}
            </div>
            <div class="chart-footer">
                <small>Trend: ${this.dashboardData.summary.moodTrend}</small>
            </div>
        `;

        this.addChartInteractivity('mood-chart');
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

        // Calculate adherence over time
        const adherenceData = plans.map(plan => ({
            date: new Date(plan.createdAt).toLocaleDateString(),
            adherence: plan.adherence || Math.random() * 100, // Fallback for demo
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
                </div>
            `;
        }).join('');

        chartContainer.innerHTML = `
            <div class="chart-header">
                <h4>Nutrition Adherence</h4>
                <div class="adherence-average">
                    Avg: ${Math.round(this.dashboardData.summary.nutritionAdherence || 0)}%
                </div>
            </div>
            <div class="interactive-chart nutrition-chart">
                ${chartHTML}
            </div>
            <div class="chart-footer">
                <small>${plans.length} meal plans created</small>
            </div>
        `;

        this.addChartInteractivity('nutrition-chart');
    }

    async renderStreakChart() {
        const chartContainer = document.getElementById('streak-chart');
        if (!chartContainer) return;

        const streakDays = this.dashboardData.summary.streakDays;
        const streakData = this.calculateStreakHistory();

        chartContainer.innerHTML = `
            <div class="streak-display">
                <div class="streak-number">${streakDays}</div>
                <div class="streak-label">Day Streak</div>
                <div class="streak-description">Consecutive days with mood logging</div>
            </div>
            <div class="streak-calendar">
                ${this.renderStreakCalendar()}
            </div>
        `;
    }

    renderStreakCalendar() {
        const today = new Date();
        const days = [];
        
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const hasMood = this.dashboardData.moodEntries.some(m => m.date === dateStr);
            const dayName = date.toLocaleDateString('en', { weekday: 'short' });
            const dayNum = date.getDate();
            
            days.push(`
                <div class="streak-day ${hasMood ? 'has-data' : 'no-data'}" 
                     title="${dayName}, ${date.toLocaleDateString()}">
                    <div class="day-name">${dayName}</div>
                    <div class="day-number">${dayNum}</div>
                    <div class="day-indicator ${hasMood ? 'active' : ''}"></div>
                </div>
            `);
        }
        
        return days.join('');
    }

    async renderQuickActions() {
        const actionsContainer = document.getElementById('quick-actions');
        if (!actionsContainer) return;

        const { summary } = this.dashboardData;
        const actions = [];

        // Dynamic actions based on user data
        if (!summary.latestRiskScore) {
            actions.push({
                icon: '🎯',
                title: 'Take Risk Assessment',
                description: 'Get your diabetes risk score',
                action: 'window.glucoApp.showAssessment()',
                priority: 'high'
            });
        } else if (this.daysSinceLastAssessment() > 30) {
            actions.push({
                icon: '🔄',
                title: 'Update Risk Assessment',
                description: 'Reassess your risk factors',
                action: 'window.glucoApp.showAssessment()',
                priority: 'medium'
            });
        }

        if (!this.hasTodaysMood()) {
            actions.push({
                icon: '💙',
                title: 'Log Today\'s Mood',
                description: 'Track your emotional wellbeing',
                action: 'window.glucoApp.showMentalHealth()',
                priority: 'high'
            });
        }

        if (this.dashboardData.nutritionPlans.length === 0) {
            actions.push({
                icon: '🍎',
                title: 'Create Meal Plan',
                description: 'Get personalized nutrition guidance',
                action: 'window.glucoApp.showNutrition()',
                priority: 'medium'
            });
        }

        actions.push({
            icon: '📄',
            title: 'Generate Report',
            description: 'Create health summary for doctor',
            action: 'window.glucoApp.generateReport()',
            priority: 'low'
        });

        const actionsHTML = actions.map(action => `
            <button class="quick-action-btn priority-${action.priority}" onclick="${action.action}">
                <div class="action-icon">${action.icon}</div>
                <div class="action-content">
                    <div class="action-title">${action.title}</div>
                    <div class="action-description">${action.description}</div>
                </div>
            </button>
        `).join('');

        actionsContainer.innerHTML = `
            <div class="quick-actions-header">
                <h4>Recommended Actions</h4>
            </div>
            <div class="actions-grid">
                ${actionsHTML}
            </div>
        `;
    }

    async generateAIInsights() {
        const insightsContainer = document.getElementById('ai-insights-content');
        if (!insightsContainer) return;

        try {
            // Show loading state
            insightsContainer.innerHTML = `
                <div class="loading-insights">
                    <div class="spinner"></div>
                    <p>Generating personalized insights...</p>
                </div>
            `;

            // Check data quality first
            const dataQuality = this.assessDataQuality();
            if (dataQuality.score < 20) {
                await this.handleInsufficientData();
                return;
            }

            // Check if AI service is available
            if (!window.aiService?.isAvailable()) {
                const enableAI = await this.showAIEnablePrompt();
                if (!enableAI) {
                    // Show fallback insights without AI
                    const fallbackInsights = this.generateFallbackInsights({
                        ...this.dashboardData.summary,
                        patterns: this.analyzeHealthPatterns(),
                        achievements: this.identifyUserAchievements(),
                        dataQuality: dataQuality
                    });
                    
                    this.renderFallbackInsights(fallbackInsights);
                    return;
                }
            }

            // Generate enhanced AI insights
            const insights = await this.generatePersonalizedInsights();
            
            insightsContainer.innerHTML = `
                <div class="ai-insights-content">
                    ${this.renderDataQualityIndicator(insights.dataQuality)}
                    
                    <div class="insight-section">
                        <h5>📊 Progress Analysis</h5>
                        <p>${insights.progressAnalysis}</p>
                    </div>
                    
                    ${insights.achievements.length > 0 ? `
                    <div class="insight-section achievements-section">
                        <h5>🏆 Your Achievements</h5>
                        <div class="achievements-grid">
                            ${insights.achievements.slice(0, 3).map(achievement => `
                                <div class="achievement-badge">
                                    <span class="achievement-icon">🎯</span>
                                    <span class="achievement-text">${achievement}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="insight-section">
                        <h5>💡 Personalized Recommendations</h5>
                        <ul class="recommendations-list">
                            ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="insight-section">
                        <h5>🎯 Focus Areas</h5>
                        <p>${insights.focusAreas}</p>
                    </div>
                    
                    ${insights.motivationalMessage ? `
                    <div class="insight-section motivational-section">
                        <h5>💪 Keep Going!</h5>
                        <p class="motivational-message">${insights.motivationalMessage}</p>
                    </div>
                    ` : ''}
                    
                    ${this.renderPatternInsights(insights.patterns)}
                    
                    <div class="ai-disclaimer">
                        <small>💡 AI-generated insights based on your health data. Always consult healthcare professionals for medical advice.</small>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Failed to generate AI insights:', error);
            
            // Show fallback insights on error
            const fallbackInsights = this.generateFallbackInsights({
                ...this.dashboardData.summary,
                patterns: this.analyzeHealthPatterns(),
                achievements: this.identifyUserAchievements(),
                dataQuality: this.assessDataQuality()
            });
            
            this.renderFallbackInsights(fallbackInsights, true);
        }
    }

    async showAIEnablePrompt() {
        const insightsContainer = document.getElementById('ai-insights-content');
        
        return new Promise((resolve) => {
            insightsContainer.innerHTML = `
                <div class="ai-enable-prompt">
                    <div class="ai-icon">🤖</div>
                    <h5>Unlock AI-Powered Insights</h5>
                    <p>Get personalized health analysis, pattern recognition, and tailored recommendations powered by AI.</p>
                    
                    <div class="ai-benefits">
                        <div class="benefit-item">
                            <span class="benefit-icon">📊</span>
                            <span>Advanced progress analysis</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">🎯</span>
                            <span>Personalized recommendations</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">🔍</span>
                            <span>Pattern recognition</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">💪</span>
                            <span>Motivational insights</span>
                        </div>
                    </div>
                    
                    <div class="ai-actions">
                        <button class="btn-primary enable-ai-btn">Enable AI Insights</button>
                        <button class="btn-secondary skip-ai-btn">Continue Without AI</button>
                    </div>
                </div>
            `;

            const enableBtn = insightsContainer.querySelector('.enable-ai-btn');
            const skipBtn = insightsContainer.querySelector('.skip-ai-btn');

            enableBtn.addEventListener('click', async () => {
                const enabled = await window.aiService.ensureInitialized();
                resolve(enabled);
            });

            skipBtn.addEventListener('click', () => {
                resolve(false);
            });
        });
    }

    renderFallbackInsights(insights, isError = false) {
        const insightsContainer = document.getElementById('ai-insights-content');
        if (!insightsContainer) return;

        insightsContainer.innerHTML = `
            <div class="ai-insights-content fallback-insights">
                ${isError ? `
                <div class="fallback-notice">
                    <span class="notice-icon">⚠️</span>
                    <span>AI insights temporarily unavailable - showing basic analysis</span>
                </div>
                ` : ''}
                
                ${this.renderDataQualityIndicator(insights.dataQuality)}
                
                <div class="insight-section">
                    <h5>📊 Progress Analysis</h5>
                    <p>${insights.progressAnalysis}</p>
                </div>
                
                ${insights.achievements.length > 0 ? `
                <div class="insight-section achievements-section">
                    <h5>🏆 Your Achievements</h5>
                    <div class="achievements-grid">
                        ${insights.achievements.slice(0, 3).map(achievement => `
                            <div class="achievement-badge">
                                <span class="achievement-icon">🎯</span>
                                <span class="achievement-text">${achievement}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="insight-section">
                    <h5>💡 Recommendations</h5>
                    <ul class="recommendations-list">
                        ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="insight-section">
                    <h5>🎯 Focus Areas</h5>
                    <p>${insights.focusAreas}</p>
                </div>
                
                ${insights.motivationalMessage ? `
                <div class="insight-section motivational-section">
                    <h5>💪 Keep Going!</h5>
                    <p class="motivational-message">${insights.motivationalMessage}</p>
                </div>
                ` : ''}
                
                ${this.renderPatternInsights(insights.patterns)}
                
                <div class="ai-disclaimer">
                    <small>💡 ${isError ? 'Basic insights based on your health data.' : 'Insights based on your health data.'} Always consult healthcare professionals for medical advice.</small>
                </div>
                
                ${!window.aiService?.isAvailable() ? `
                <div class="upgrade-prompt">
                    <button class="btn-link" onclick="progressDashboard.generateAIInsights()">
                        🤖 Enable AI for Enhanced Insights
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }

    async generatePersonalizedInsights() {
        const { summary } = this.dashboardData;
        
        // Enhanced context with pattern recognition and achievements
        const context = {
            riskScore: summary.latestRiskScore,
            riskCategory: summary.latestRiskCategory,
            averageMood: summary.averageMood,
            moodTrend: summary.moodTrend,
            nutritionAdherence: summary.nutritionAdherence,
            streakDays: summary.streakDays,
            totalAssessments: summary.totalAssessments,
            totalMoodEntries: summary.totalMoodEntries,
            improvementAreas: summary.improvementAreas,
            timeframe: '30 days',
            // Enhanced pattern recognition data
            patterns: this.analyzeHealthPatterns(),
            achievements: this.identifyUserAchievements(),
            dataQuality: this.assessDataQuality(),
            riskTrend: this.calculateRiskTrend(),
            moodPatterns: this.analyzeMoodPatterns(),
            nutritionTrends: this.analyzeNutritionTrends()
        };

        try {
            // Generate AI-powered insights with enhanced analysis
            const [progressAnalysis, recommendations, focusAreas, motivationalMessage] = await Promise.all([
                this.generateAIProgressAnalysis(context),
                this.generateAIRecommendations(context),
                this.generateAIFocusAreas(context),
                this.generateMotivationalMessage(context)
            ]);

            return {
                progressAnalysis,
                recommendations,
                focusAreas,
                motivationalMessage,
                patterns: context.patterns,
                achievements: context.achievements,
                dataQuality: context.dataQuality
            };
        } catch (error) {
            console.error('AI insights generation failed, using fallback:', error);
            return this.generateFallbackInsights(context);
        }
    }

    // Enhanced AI-powered analysis methods
    async generateAIProgressAnalysis(context) {
        if (!window.aiService?.isAvailable()) {
            return this.getFallbackProgressAnalysis(context);
        }

        try {
            // Create comprehensive progress analysis prompt
            const progressPrompt = `As a compassionate health analytics specialist, analyze this user's 30-day health journey and provide personalized insights.

Health Data Summary:
- Risk Score: ${context.riskScore || 'Not assessed'} (${context.riskCategory || 'Unknown'})
- Risk Trend: ${context.riskTrend}
- Average Mood: ${context.averageMood ? context.averageMood.toFixed(1) : 'No data'}/5 (${context.moodTrend})
- Nutrition Adherence: ${context.nutritionAdherence ? Math.round(context.nutritionAdherence) : 'No data'}%
- Tracking Streak: ${context.streakDays} days
- Total Assessments: ${context.totalAssessments}
- Total Mood Entries: ${context.totalMoodEntries}

Patterns Identified:
${JSON.stringify(context.patterns, null, 2)}

Achievements:
${context.achievements.map(a => `- ${a}`).join('\n')}

Data Quality: ${context.dataQuality.score}/100 (${context.dataQuality.level})

Please provide:
1. A warm, encouraging analysis of their overall progress
2. Key insights about positive trends and improvements
3. Recognition of their consistency and effort
4. Gentle observations about areas showing progress

Keep the tone supportive and focus on their journey rather than just numbers. Limit to 80-120 words.`;

            return await window.aiService.analyzeProgress({
                prompt: progressPrompt,
                context: context
            });
        } catch (error) {
            console.error('AI progress analysis failed:', error);
            return this.getFallbackProgressAnalysis(context);
        }
    }

    async generateAIRecommendations(context) {
        if (!window.aiService?.isAvailable()) {
            return this.getFallbackRecommendations(context);
        }

        try {
            const recommendationsPrompt = `As a personalized health coach specializing in diabetes prevention, provide 3-4 specific, actionable recommendations based on this user's health data and patterns.

Current Status:
- Risk Level: ${context.riskCategory || 'Unknown'} (Score: ${context.riskScore || 'N/A'})
- Mood Stability: ${context.moodTrend} (Avg: ${context.averageMood ? context.averageMood.toFixed(1) : 'N/A'}/5)
- Nutrition Consistency: ${context.nutritionAdherence ? Math.round(context.nutritionAdherence) : 'N/A'}%
- Tracking Habits: ${context.streakDays} day streak

Identified Patterns:
${JSON.stringify(context.patterns, null, 2)}

User Achievements:
${context.achievements.join(', ')}

Data Completeness: ${context.dataQuality.level}

Please provide personalized recommendations that:
1. Build on their existing strengths and achievements
2. Address specific patterns you observe in their data
3. Are practical and achievable given their current habits
4. Support both physical and mental health aspects of diabetes prevention

Format as a simple list. Each recommendation should be 1-2 sentences and actionable.`;

            const aiResponse = await window.aiService.getPersonalizedRecommendations({
                prompt: recommendationsPrompt,
                context: context
            });

            // Parse AI response into array format
            return this.parseAIRecommendations(aiResponse);
        } catch (error) {
            console.error('AI recommendations failed:', error);
            return this.getFallbackRecommendations(context);
        }
    }

    async generateAIFocusAreas(context) {
        if (!window.aiService?.isAvailable()) {
            return this.getFallbackFocusAreas(context);
        }

        try {
            const focusPrompt = `As a health journey strategist, identify the most impactful focus areas for this user's diabetes prevention journey.

Health Profile:
- Risk Status: ${context.riskCategory || 'Unknown'} (${context.riskScore || 'N/A'})
- Emotional Wellbeing: ${context.moodTrend} mood trend
- Nutrition Habits: ${context.nutritionAdherence ? Math.round(context.nutritionAdherence) : 'N/A'}% adherence
- Consistency: ${context.streakDays} day tracking streak

Key Patterns:
${JSON.stringify(context.patterns, null, 2)}

Current Achievements:
${context.achievements.join(', ')}

Areas Needing Attention:
${context.improvementAreas.join(', ')}

Based on their data patterns and achievements, identify 1-2 key focus areas that would have the biggest positive impact on their health journey. Explain why these areas are priorities and how focusing on them connects to their diabetes prevention goals.

Keep response encouraging and specific. Limit to 60-80 words.`;

            return await window.aiService.generateContent(focusPrompt, context);
        } catch (error) {
            console.error('AI focus areas failed:', error);
            return this.getFallbackFocusAreas(context);
        }
    }

    async generateMotivationalMessage(context) {
        if (!window.aiService?.isAvailable()) {
            return this.getFallbackMotivationalMessage(context);
        }

        try {
            const motivationPrompt = `As an encouraging health coach, create a personalized motivational message celebrating this user's health journey achievements.

Recent Achievements:
${context.achievements.map(a => `- ${a}`).join('\n')}

Progress Highlights:
- ${context.streakDays} day tracking streak
- ${context.totalMoodEntries} mood entries logged
- ${context.totalAssessments} risk assessments completed
- Data quality: ${context.dataQuality.level}

Health Status:
- Risk trend: ${context.riskTrend}
- Mood trend: ${context.moodTrend}
- Overall engagement: ${context.dataQuality.score}/100

Create a warm, personalized message that:
1. Celebrates their specific achievements and consistency
2. Acknowledges their commitment to their health journey
3. Encourages continued progress
4. Feels genuine and personal (not generic)

Keep it uplifting and specific to their accomplishments. Limit to 40-60 words.`;

            return await window.aiService.getMotivationalMessage({
                prompt: motivationPrompt,
                achievements: context.achievements,
                context: context
            });
        } catch (error) {
            console.error('AI motivational message failed:', error);
            return this.getFallbackMotivationalMessage(context);
        }
    }

    // Pattern recognition and analysis methods
    analyzeHealthPatterns() {
        const patterns = {
            riskTrend: this.calculateRiskTrend(),
            moodStability: this.analyzeMoodStability(),
            nutritionConsistency: this.analyzeNutritionConsistency(),
            engagementPattern: this.analyzeEngagementPattern(),
            weeklyPatterns: this.analyzeWeeklyPatterns(),
            improvementVelocity: this.calculateImprovementVelocity()
        };

        return patterns;
    }

    calculateRiskTrend() {
        const assessments = this.dashboardData.riskAssessments;
        if (assessments.length < 2) {
            return 'insufficient_data';
        }

        const recent = assessments.slice(0, Math.ceil(assessments.length / 2));
        const older = assessments.slice(Math.ceil(assessments.length / 2));

        const recentAvg = recent.reduce((sum, a) => sum + a.riskScore, 0) / recent.length;
        const olderAvg = older.reduce((sum, a) => sum + a.riskScore, 0) / older.length;

        const change = recentAvg - olderAvg;
        if (change < -2) return 'significantly_improving';
        if (change < -0.5) return 'improving';
        if (change > 2) return 'concerning_increase';
        if (change > 0.5) return 'slight_increase';
        return 'stable';
    }

    analyzeMoodStability() {
        const moods = this.dashboardData.moodEntries;
        if (moods.length < 7) return 'insufficient_data';

        const moodValues = moods.slice(0, 14).map(m => m.mood);
        const average = moodValues.reduce((sum, m) => sum + m, 0) / moodValues.length;
        const variance = moodValues.reduce((sum, m) => sum + Math.pow(m - average, 2), 0) / moodValues.length;
        const standardDeviation = Math.sqrt(variance);

        if (standardDeviation < 0.5) return 'very_stable';
        if (standardDeviation < 1.0) return 'stable';
        if (standardDeviation < 1.5) return 'moderate_variation';
        return 'high_variation';
    }

    analyzeNutritionConsistency() {
        const plans = this.dashboardData.nutritionPlans;
        if (plans.length < 2) return 'insufficient_data';

        const adherenceValues = plans.map(p => p.adherence || 0);
        const average = adherenceValues.reduce((sum, a) => sum + a, 0) / adherenceValues.length;
        const variance = adherenceValues.reduce((sum, a) => sum + Math.pow(a - average, 2), 0) / adherenceValues.length;

        if (average > 80 && variance < 100) return 'consistently_high';
        if (average > 60 && variance < 200) return 'moderately_consistent';
        if (variance > 400) return 'highly_variable';
        return 'needs_improvement';
    }

    analyzeEngagementPattern() {
        const { summary } = this.dashboardData;
        const engagementScore = (
            (summary.totalMoodEntries > 0 ? 25 : 0) +
            (summary.totalAssessments > 0 ? 25 : 0) +
            (summary.streakDays > 7 ? 25 : 0) +
            (this.dashboardData.nutritionPlans.length > 0 ? 25 : 0)
        );

        if (engagementScore >= 75) return 'highly_engaged';
        if (engagementScore >= 50) return 'moderately_engaged';
        if (engagementScore >= 25) return 'partially_engaged';
        return 'low_engagement';
    }

    analyzeWeeklyPatterns() {
        const moods = this.dashboardData.moodEntries;
        if (moods.length < 14) return 'insufficient_data';

        const weekdayMoods = {};
        moods.forEach(mood => {
            const date = new Date(mood.date);
            const dayOfWeek = date.getDay();
            if (!weekdayMoods[dayOfWeek]) weekdayMoods[dayOfWeek] = [];
            weekdayMoods[dayOfWeek].push(mood.mood);
        });

        const weekdayAverages = {};
        Object.keys(weekdayMoods).forEach(day => {
            const moods = weekdayMoods[day];
            weekdayAverages[day] = moods.reduce((sum, m) => sum + m, 0) / moods.length;
        });

        // Find best and worst days
        const sortedDays = Object.entries(weekdayAverages).sort((a, b) => b[1] - a[1]);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return {
            bestDay: dayNames[sortedDays[0]?.[0]] || 'unknown',
            worstDay: dayNames[sortedDays[sortedDays.length - 1]?.[0]] || 'unknown',
            weekendVsWeekday: this.compareWeekendVsWeekday(weekdayAverages)
        };
    }

    compareWeekendVsWeekday(weekdayAverages) {
        const weekendDays = [0, 6]; // Sunday, Saturday
        const weekdayDays = [1, 2, 3, 4, 5]; // Monday-Friday

        const weekendMoods = weekendDays.filter(day => weekdayAverages[day]).map(day => weekdayAverages[day]);
        const weekdayMoods = weekdayDays.filter(day => weekdayAverages[day]).map(day => weekdayAverages[day]);

        if (weekendMoods.length === 0 || weekdayMoods.length === 0) return 'insufficient_data';

        const weekendAvg = weekendMoods.reduce((sum, m) => sum + m, 0) / weekendMoods.length;
        const weekdayAvg = weekdayMoods.reduce((sum, m) => sum + m, 0) / weekdayMoods.length;

        const difference = weekendAvg - weekdayAvg;
        if (difference > 0.5) return 'better_weekends';
        if (difference < -0.5) return 'better_weekdays';
        return 'similar';
    }

    calculateImprovementVelocity() {
        const assessments = this.dashboardData.riskAssessments;
        const moods = this.dashboardData.moodEntries;

        let velocity = 0;
        let factors = 0;

        // Risk improvement velocity
        if (assessments.length >= 2) {
            const riskTrend = this.calculateRiskTrend();
            if (riskTrend === 'significantly_improving') velocity += 2;
            else if (riskTrend === 'improving') velocity += 1;
            else if (riskTrend === 'concerning_increase') velocity -= 2;
            else if (riskTrend === 'slight_increase') velocity -= 1;
            factors++;
        }

        // Mood improvement velocity
        if (moods.length >= 7) {
            const moodTrend = this.dashboardData.summary.moodTrend;
            if (moodTrend === 'Improving') velocity += 1;
            else if (moodTrend === 'Declining') velocity -= 1;
            factors++;
        }

        // Engagement velocity
        const streakDays = this.dashboardData.summary.streakDays;
        if (streakDays > 14) velocity += 1;
        else if (streakDays > 7) velocity += 0.5;
        factors++;

        if (factors === 0) return 'no_data';
        
        const avgVelocity = velocity / factors;
        if (avgVelocity > 1) return 'accelerating';
        if (avgVelocity > 0.3) return 'steady_progress';
        if (avgVelocity > -0.3) return 'maintaining';
        if (avgVelocity > -1) return 'slowing';
        return 'declining';
    }

    identifyUserAchievements() {
        const achievements = [];
        const { summary } = this.dashboardData;

        // Streak achievements
        if (summary.streakDays >= 30) achievements.push('30-day tracking champion');
        else if (summary.streakDays >= 14) achievements.push('2-week consistency streak');
        else if (summary.streakDays >= 7) achievements.push('1-week tracking habit');

        // Assessment achievements
        if (summary.totalAssessments >= 5) achievements.push('Dedicated health monitor');
        else if (summary.totalAssessments >= 3) achievements.push('Regular health checker');
        else if (summary.totalAssessments >= 1) achievements.push('Health awareness starter');

        // Mood tracking achievements
        if (summary.totalMoodEntries >= 30) achievements.push('Emotional wellness advocate');
        else if (summary.totalMoodEntries >= 14) achievements.push('Mood tracking enthusiast');
        else if (summary.totalMoodEntries >= 7) achievements.push('Self-awareness builder');

        // Risk improvement achievements
        const riskTrend = this.calculateRiskTrend();
        if (riskTrend === 'significantly_improving') achievements.push('Risk reduction champion');
        else if (riskTrend === 'improving') achievements.push('Health improvement warrior');

        // Nutrition achievements
        if (summary.nutritionAdherence >= 90) achievements.push('Nutrition excellence');
        else if (summary.nutritionAdherence >= 80) achievements.push('Consistent healthy eater');
        else if (summary.nutritionAdherence >= 70) achievements.push('Nutrition commitment');

        // Mood stability achievements
        const moodStability = this.analyzeMoodStability();
        if (moodStability === 'very_stable' && summary.averageMood >= 4) {
            achievements.push('Emotional balance master');
        } else if (moodStability === 'stable') {
            achievements.push('Emotional stability builder');
        }

        // Engagement achievements
        const engagement = this.analyzeEngagementPattern();
        if (engagement === 'highly_engaged') achievements.push('Health journey champion');
        else if (engagement === 'moderately_engaged') achievements.push('Committed health tracker');

        return achievements.length > 0 ? achievements : ['Health journey beginner'];
    }

    assessDataQuality() {
        const { summary } = this.dashboardData;
        let score = 0;
        const maxScore = 100;

        // Mood tracking quality (30 points)
        if (summary.totalMoodEntries >= 30) score += 30;
        else if (summary.totalMoodEntries >= 14) score += 20;
        else if (summary.totalMoodEntries >= 7) score += 15;
        else if (summary.totalMoodEntries >= 3) score += 10;
        else if (summary.totalMoodEntries >= 1) score += 5;

        // Risk assessment quality (25 points)
        if (summary.totalAssessments >= 3) score += 25;
        else if (summary.totalAssessments >= 2) score += 20;
        else if (summary.totalAssessments >= 1) score += 15;

        // Nutrition tracking quality (25 points)
        const nutritionPlans = this.dashboardData.nutritionPlans.length;
        if (nutritionPlans >= 3) score += 25;
        else if (nutritionPlans >= 2) score += 20;
        else if (nutritionPlans >= 1) score += 15;

        // Consistency quality (20 points)
        if (summary.streakDays >= 21) score += 20;
        else if (summary.streakDays >= 14) score += 15;
        else if (summary.streakDays >= 7) score += 10;
        else if (summary.streakDays >= 3) score += 5;

        let level;
        if (score >= 80) level = 'excellent';
        else if (score >= 60) level = 'good';
        else if (score >= 40) level = 'fair';
        else if (score >= 20) level = 'limited';
        else level = 'insufficient';

        return { score, level, maxScore };
    }

    // Fallback methods for when AI is not available
    getFallbackProgressAnalysis(context) {
        const { achievements, patterns, dataQuality } = context;
        
        let analysis = "Your health journey shows dedication and progress. ";
        
        if (achievements.length > 2) {
            analysis += `You've earned ${achievements.length} achievements, demonstrating consistent commitment to your health. `;
        }
        
        if (context.streakDays >= 7) {
            analysis += `Your ${context.streakDays}-day tracking streak shows excellent consistency. `;
        }
        
        if (patterns.riskTrend === 'improving' || patterns.riskTrend === 'significantly_improving') {
            analysis += "Your risk factors are trending in a positive direction. ";
        }
        
        if (context.averageMood && context.averageMood >= 3.5) {
            analysis += "Your mood stability supports your overall health goals. ";
        }
        
        analysis += "Keep up the great work on your wellness journey!";
        
        return analysis;
    }

    getFallbackRecommendations(context) {
        const recommendations = [];
        
        // Risk-based recommendations
        if (context.riskScore > 15) {
            recommendations.push("Schedule a consultation with your healthcare provider for diabetes screening");
            recommendations.push("Focus on reducing processed foods and increasing fiber-rich vegetables");
        } else if (context.riskScore > 7) {
            recommendations.push("Maintain regular physical activity - aim for 150 minutes per week");
            recommendations.push("Continue monitoring your health metrics consistently");
        } else if (context.riskScore) {
            recommendations.push("Great job maintaining low risk! Keep up your healthy lifestyle habits");
        }
        
        // Pattern-based recommendations
        if (context.patterns.moodStability === 'high_variation') {
            recommendations.push("Consider stress management techniques to support mood stability");
        }
        
        if (context.patterns.nutritionConsistency === 'needs_improvement') {
            recommendations.push("Try meal prepping to improve nutrition plan adherence");
        }
        
        // Achievement-based recommendations
        if (context.streakDays >= 14) {
            recommendations.push("Your tracking consistency is excellent - consider adding weekly progress reviews");
        } else if (context.streakDays < 7) {
            recommendations.push("Build a daily habit of logging your mood for better health awareness");
        }
        
        // Data quality recommendations
        if (context.dataQuality.level === 'limited' || context.dataQuality.level === 'insufficient') {
            recommendations.push("Complete more health assessments to get personalized insights");
        }

        return recommendations.slice(0, 4);
    }

    getFallbackFocusAreas(context) {
        const areas = [];
        
        if (context.riskScore > 15) areas.push("diabetes prevention");
        if (context.averageMood < 3) areas.push("mental health support");
        if (context.nutritionAdherence < 70) areas.push("nutrition consistency");
        if (context.streakDays < 14) areas.push("daily health tracking");
        if (context.patterns.engagementPattern === 'low_engagement') areas.push("app engagement");

        if (areas.length === 0) {
            return "Continue your excellent progress across all health areas. You're doing great!";
        }
        
        return `Focus on improving: ${areas.join(', ')}. Small, consistent changes in these areas will have the biggest impact on your health journey.`;
    }

    getFallbackMotivationalMessage(context) {
        const { achievements, streakDays } = context;
        
        if (achievements.length > 3) {
            return `Amazing work! You've achieved ${achievements.length} milestones and maintained a ${streakDays}-day streak. Your dedication to health is truly inspiring!`;
        } else if (streakDays >= 7) {
            return `Fantastic ${streakDays}-day tracking streak! Your consistency is building healthy habits that will benefit you long-term.`;
        } else if (achievements.length > 0) {
            return `Great progress! You've earned the "${achievements[0]}" achievement. Every step forward matters on your health journey.`;
        }
        
        return "You're taking important steps for your health. Every day of tracking and every assessment completed brings you closer to your wellness goals!";
    }

    generateFallbackInsights(context) {
        return {
            progressAnalysis: this.getFallbackProgressAnalysis(context),
            recommendations: this.getFallbackRecommendations(context),
            focusAreas: this.getFallbackFocusAreas(context),
            motivationalMessage: this.getFallbackMotivationalMessage(context),
            patterns: context.patterns,
            achievements: context.achievements,
            dataQuality: context.dataQuality
        };
    }

    parseAIRecommendations(aiResponse) {
        if (!aiResponse || typeof aiResponse !== 'string') {
            return this.getFallbackRecommendations({});
        }

        // Parse AI response into array format
        const lines = aiResponse.split('\n').filter(line => line.trim());
        const recommendations = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            // Look for numbered lists, bullet points, or dashes
            if (trimmed.match(/^\d+\./) || trimmed.startsWith('-') || trimmed.startsWith('•')) {
                const cleaned = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '');
                if (cleaned.length > 10) { // Ensure it's substantial
                    recommendations.push(cleaned);
                }
            } else if (trimmed.length > 20 && !trimmed.includes(':')) {
                // Standalone recommendation without formatting
                recommendations.push(trimmed);
            }
        });

        return recommendations.slice(0, 4); // Limit to 4 recommendations
    }

    // Utility methods for calculations
    calculateAverageMood(moods) {
        if (moods.length === 0) return null;
        return moods.reduce((sum, mood) => sum + mood.mood, 0) / moods.length;
    }

    calculateMoodTrend(moods) {
        if (moods.length < 2) return 'Insufficient data';
        
        const recent = moods.slice(0, Math.ceil(moods.length / 2));
        const older = moods.slice(Math.ceil(moods.length / 2));
        
        const recentAvg = recent.reduce((sum, m) => sum + m.mood, 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + m.mood, 0) / older.length;
        
        if (recentAvg > olderAvg + 0.5) return 'Improving';
        if (recentAvg < olderAvg - 0.5) return 'Declining';
        return 'Stable';
    }

    calculateNutritionAdherence(plans) {
        if (plans.length === 0) return null;
        
        // Calculate average adherence from nutrition plans
        const totalAdherence = plans.reduce((sum, plan) => {
            return sum + (plan.adherence || Math.random() * 100); // Fallback for demo
        }, 0);
        
        return totalAdherence / plans.length;
    }

    calculateStreakDays(moods) {
        if (moods.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            const hasMood = moods.some(m => m.date === dateStr);
            if (hasMood) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateStreakHistory() {
        // Calculate streak data for visualization
        const today = new Date();
        const streakData = [];
        
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const hasMood = this.dashboardData.moodEntries.some(m => m.date === dateStr);
            streakData.push({
                date: dateStr,
                hasData: hasMood
            });
        }
        
        return streakData;
    }

    identifyImprovementAreas(assessments, moods) {
        const areas = [];
        
        if (assessments.length > 1) {
            const latest = assessments[0].riskScore;
            const previous = assessments[1].riskScore;
            if (latest > previous) {
                areas.push('risk_management');
            }
        }
        
        const avgMood = this.calculateAverageMood(moods);
        if (avgMood && avgMood < 3) {
            areas.push('mental_health');
        }
        
        return areas;
    }

    // UI Helper methods
    getRiskCategory(score) {
        if (score < 7) return 'Low';
        if (score < 15) return 'Increased';
        if (score < 20) return 'High';
        return 'Possible Diabetes';
    }

    getRiskTrendClass() {
        const assessments = this.dashboardData.riskAssessments;
        if (assessments.length < 2) return 'neutral';
        
        const latest = assessments[0].riskScore;
        const previous = assessments[1].riskScore;
        
        if (latest < previous) return 'improving';
        if (latest > previous) return 'declining';
        return 'stable';
    }

    getRiskTrendIcon() {
        const trendClass = this.getRiskTrendClass();
        const icons = {
            improving: '📈',
            declining: '📉',
            stable: '➡️',
            neutral: '📊'
        };
        return icons[trendClass] || '📊';
    }

    getMoodTrendClass() {
        const trend = this.dashboardData.summary.moodTrend;
        if (trend === 'Improving') return 'improving';
        if (trend === 'Declining') return 'declining';
        return 'stable';
    }

    getMoodTrendIcon() {
        const trendClass = this.getMoodTrendClass();
        const icons = {
            improving: '😊',
            declining: '😔',
            stable: '😐'
        };
        return icons[trendClass] || '😐';
    }

    getMoodLevel(mood) {
        if (!mood) return 'unknown';
        if (mood >= 4) return 'high';
        if (mood >= 3) return 'medium';
        return 'low';
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
        if (!adherence) return 'unknown';
        if (adherence >= 80) return 'high';
        if (adherence >= 60) return 'medium';
        return 'low';
    }

    renderMiniMoodChart() {
        const recentMoods = this.dashboardData.moodEntries.slice(0, 7);
        if (recentMoods.length === 0) return '<div class="no-data">No recent data</div>';
        
        return recentMoods.map(mood => {
            const emoji = this.getMoodEmoji(mood.mood);
            return `<span class="mini-mood-point" title="${mood.date}: ${mood.mood}/5">${emoji}</span>`;
        }).join('');
    }

    getLastAssessmentDate() {
        const assessments = this.dashboardData.riskAssessments;
        if (assessments.length === 0) return 'Never';
        
        const lastDate = new Date(assessments[0].createdAt);
        return lastDate.toLocaleDateString();
    }

    daysSinceLastAssessment() {
        const assessments = this.dashboardData.riskAssessments;
        if (assessments.length === 0) return Infinity;
        
        const lastDate = new Date(assessments[0].createdAt);
        const today = new Date();
        return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    }

    hasTodaysMood() {
        const today = new Date().toISOString().split('T')[0];
        return this.dashboardData.moodEntries.some(m => m.date === today);
    }

    // Chart interactivity
    addChartInteractivity(chartClass) {
        const chart = document.querySelector(`.${chartClass}`);
        if (!chart) return;

        const bars = chart.querySelectorAll('.chart-bar');
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
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.innerHTML = element.getAttribute('title');
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    }

    hideChartTooltip() {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Real-time updates
    startRealTimeUpdates() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Update every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.refreshDashboard();
        }, 5 * 60 * 1000);
    }

    async refreshDashboard() {
        if (!this.currentUser) return;
        
        try {
            await this.aggregateHealthData();
            await this.renderDashboardCards();
            await this.renderProgressCharts();
            await this.renderQuickActions();
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    }

    // State management
    showLoadingState() {
        const container = document.getElementById('progress-dashboard-content');
        if (container) {
            container.innerHTML = `
                <div class="dashboard-loading">
                    <div class="spinner"></div>
                    <p>Loading your health dashboard...</p>
                </div>
            `;
        }
    }

    showErrorState(message) {
        const container = document.getElementById('progress-dashboard-content');
        if (container) {
            container.innerHTML = `
                <div class="dashboard-error">
                    <div class="error-icon">⚠️</div>
                    <h3>Unable to Load Dashboard</h3>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="progressDashboard.loadDashboard()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    showLoginPrompt() {
        const container = document.getElementById('progress-dashboard-content');
        if (container) {
            container.innerHTML = `
                <div class="login-prompt">
                    <div class="prompt-icon">🔒</div>
                    <h3>Login Required</h3>
                    <p>Please log in to view your personalized health dashboard.</p>
                    <button class="btn-primary" onclick="window.authUI?.showLoginForm()">
                        Login
                    </button>
                </div>
            `;
        }
    }

    clearDashboard() {
        this.dashboardData = {};
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    getFallbackData() {
        // Return empty data structure for fallback
        return {
            riskAssessments: [],
            moodEntries: [],
            nutritionPlans: [],
            progressMetrics: [],
            summary: {
                latestRiskScore: null,
                latestRiskCategory: null,
                averageMood: null,
                moodTrend: 'No data',
                totalAssessments: 0,
                totalMoodEntries: 0,
                nutritionAdherence: null,
                streakDays: 0,
                improvementAreas: []
            }
        };
    }

    // Enhanced UI rendering methods
    renderDataQualityIndicator(dataQuality) {
        if (!dataQuality) return '';
        
        const { score, level } = dataQuality;
        const percentage = Math.round(score);
        
        let statusColor = 'low';
        if (percentage >= 80) statusColor = 'high';
        else if (percentage >= 60) statusColor = 'medium';
        
        return `
            <div class="data-quality-indicator">
                <div class="quality-header">
                    <span class="quality-icon">📈</span>
                    <span class="quality-label">Data Completeness</span>
                    <span class="quality-score quality-${statusColor}">${percentage}%</span>
                </div>
                <div class="quality-bar">
                    <div class="quality-fill quality-${statusColor}" style="width: ${percentage}%"></div>
                </div>
                <div class="quality-description">
                    ${this.getDataQualityDescription(level, percentage)}
                </div>
            </div>
        `;
    }

    getDataQualityDescription(level, percentage) {
        switch (level) {
            case 'excellent':
                return 'Excellent data coverage! Your comprehensive tracking enables highly personalized insights.';
            case 'good':
                return 'Good data quality. Continue tracking consistently for even better insights.';
            case 'fair':
                return 'Fair data coverage. More regular tracking will improve your personalized recommendations.';
            case 'limited':
                return 'Limited data available. Try logging your mood daily and completing assessments regularly.';
            case 'insufficient':
                return 'More data needed for personalized insights. Start with daily mood tracking and risk assessments.';
            default:
                return `${percentage}% data completeness - keep tracking for better insights!`;
        }
    }

    renderPatternInsights(patterns) {
        if (!patterns) return '';
        
        const insights = [];
        
        // Risk trend insight
        if (patterns.riskTrend === 'significantly_improving') {
            insights.push({ icon: '📉', text: 'Risk factors significantly improving', type: 'positive' });
        } else if (patterns.riskTrend === 'improving') {
            insights.push({ icon: '📈', text: 'Risk factors trending positively', type: 'positive' });
        } else if (patterns.riskTrend === 'concerning_increase') {
            insights.push({ icon: '⚠️', text: 'Risk factors need attention', type: 'warning' });
        }
        
        // Mood stability insight
        if (patterns.moodStability === 'very_stable') {
            insights.push({ icon: '😌', text: 'Excellent mood stability', type: 'positive' });
        } else if (patterns.moodStability === 'high_variation') {
            insights.push({ icon: '🎭', text: 'Mood varies - consider stress management', type: 'neutral' });
        }
        
        // Nutrition consistency insight
        if (patterns.nutritionConsistency === 'consistently_high') {
            insights.push({ icon: '🍎', text: 'Outstanding nutrition consistency', type: 'positive' });
        } else if (patterns.nutritionConsistency === 'needs_improvement') {
            insights.push({ icon: '🥗', text: 'Nutrition adherence could improve', type: 'neutral' });
        }
        
        // Engagement pattern insight
        if (patterns.engagementPattern === 'highly_engaged') {
            insights.push({ icon: '🎯', text: 'Highly engaged with health tracking', type: 'positive' });
        }
        
        // Weekly pattern insight
        if (patterns.weeklyPatterns && patterns.weeklyPatterns !== 'insufficient_data') {
            const { bestDay, worstDay, weekendVsWeekday } = patterns.weeklyPatterns;
            if (bestDay && worstDay && bestDay !== worstDay) {
                insights.push({ 
                    icon: '📅', 
                    text: `Best mood days: ${bestDay}s`, 
                    type: 'neutral' 
                });
            }
        }
        
        // Improvement velocity insight
        if (patterns.improvementVelocity === 'accelerating') {
            insights.push({ icon: '🚀', text: 'Health improvements accelerating', type: 'positive' });
        } else if (patterns.improvementVelocity === 'steady_progress') {
            insights.push({ icon: '📈', text: 'Steady progress on health goals', type: 'positive' });
        }
        
        if (insights.length === 0) return '';
        
        return `
            <div class="insight-section pattern-insights">
                <h5>🔍 Pattern Recognition</h5>
                <div class="pattern-insights-grid">
                    ${insights.slice(0, 4).map(insight => `
                        <div class="pattern-insight pattern-${insight.type}">
                            <span class="pattern-icon">${insight.icon}</span>
                            <span class="pattern-text">${insight.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Handle insufficient data scenarios with AI guidance
    async handleInsufficientData() {
        const insightsContainer = document.getElementById('ai-insights-content');
        if (!insightsContainer) return;

        const { summary } = this.dashboardData;
        const dataGaps = this.identifyDataGaps();
        
        try {
            let guidanceMessage = '';
            
            if (window.aiService?.isAvailable()) {
                const guidancePrompt = `As a helpful health coach, provide encouraging guidance for a user who has limited health data. 

Current data:
- Risk assessments: ${summary.totalAssessments}
- Mood entries: ${summary.totalMoodEntries}
- Nutrition plans: ${this.dashboardData.nutritionPlans.length}
- Tracking streak: ${summary.streakDays} days

Missing data areas: ${dataGaps.join(', ')}

Provide:
1. Encouraging acknowledgment of what they have done
2. Gentle guidance on which data to focus on first
3. Explanation of how more data will help them
4. Motivational message about starting their health journey

Keep it warm, supportive, and actionable. Limit to 80-100 words.`;

                guidanceMessage = await window.aiService.generateContent(guidancePrompt, { dataGaps, summary });
            } else {
                guidanceMessage = this.getFallbackInsufficientDataGuidance(dataGaps);
            }

            insightsContainer.innerHTML = `
                <div class="insufficient-data-guidance">
                    <div class="guidance-header">
                        <span class="guidance-icon">🌱</span>
                        <h5>Let's Build Your Health Profile</h5>
                    </div>
                    
                    <div class="guidance-message">
                        <p>${guidanceMessage}</p>
                    </div>
                    
                    <div class="next-steps">
                        <h6>Recommended Next Steps:</h6>
                        <div class="next-steps-grid">
                            ${this.renderNextSteps(dataGaps)}
                        </div>
                    </div>
                    
                    <div class="ai-disclaimer">
                        <small>💡 Complete more health tracking to unlock personalized AI insights!</small>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to generate insufficient data guidance:', error);
            insightsContainer.innerHTML = `
                <div class="insufficient-data-guidance">
                    <div class="guidance-header">
                        <span class="guidance-icon">🌱</span>
                        <h5>Start Your Health Journey</h5>
                    </div>
                    <div class="guidance-message">
                        <p>${this.getFallbackInsufficientDataGuidance(dataGaps)}</p>
                    </div>
                </div>
            `;
        }
    }

    identifyDataGaps() {
        const gaps = [];
        const { summary } = this.dashboardData;
        
        if (summary.totalAssessments === 0) gaps.push('risk assessment');
        if (summary.totalMoodEntries < 7) gaps.push('mood tracking');
        if (this.dashboardData.nutritionPlans.length === 0) gaps.push('nutrition planning');
        if (summary.streakDays < 3) gaps.push('consistent tracking');
        
        return gaps;
    }

    getFallbackInsufficientDataGuidance(dataGaps) {
        if (dataGaps.length === 0) {
            return "You're off to a great start! Continue tracking consistently to unlock deeper insights about your health patterns and receive more personalized recommendations.";
        }
        
        return `Welcome to your health journey! To get personalized insights, try ${dataGaps[0]} first. Each piece of data helps us understand your unique health patterns better and provide more tailored recommendations for your diabetes prevention goals.`;
    }

    renderNextSteps(dataGaps) {
        const steps = [];
        
        if (dataGaps.includes('risk assessment')) {
            steps.push({
                icon: '🎯',
                title: 'Take Risk Assessment',
                description: 'Get your diabetes risk score',
                action: 'window.glucoApp.showAssessment()'
            });
        }
        
        if (dataGaps.includes('mood tracking')) {
            steps.push({
                icon: '💙',
                title: 'Log Your Mood',
                description: 'Track daily emotional wellbeing',
                action: 'window.glucoApp.showMentalHealth()'
            });
        }
        
        if (dataGaps.includes('nutrition planning')) {
            steps.push({
                icon: '🍎',
                title: 'Create Meal Plan',
                description: 'Get personalized nutrition guidance',
                action: 'window.glucoApp.showNutrition()'
            });
        }
        
        return steps.slice(0, 3).map(step => `
            <button class="next-step-btn" onclick="${step.action}">
                <div class="step-icon">${step.icon}</div>
                <div class="step-content">
                    <div class="step-title">${step.title}</div>
                    <div class="step-description">${step.description}</div>
                </div>
            </button>
        `).join('');
    }

    // Cleanup
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.clearDashboard();
    }
}

// Initialize progress dashboard
window.progressDashboard = new ProgressDashboard();
//# sourceMappingURL=progress-dashboard.js.map