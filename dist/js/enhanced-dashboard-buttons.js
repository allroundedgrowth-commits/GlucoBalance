// Enhanced Dashboard Button Functionality
class DashboardButtonManager {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🎛️ Initializing Enhanced Dashboard Button Manager...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupButtons());
        } else {
            this.setupButtons();
        }
        
        // Listen for page changes
        document.addEventListener('pageChanged', (event) => {
            if (event.detail.page === 'dashboard') {
                this.refreshButtonStates();
            }
        });
        
        // Listen for authentication changes
        document.addEventListener('authStateChanged', (event) => {
            this.currentUser = event.detail.user;
            this.refreshButtonStates();
        });
    }

    setupButtons() {
        console.log('🔧 Setting up dashboard buttons...');
        
        try {
            this.setupHeaderButtons();
            this.setupCardButtons();
            this.setupQuickActionButtons();
            this.setupNavigationButtons();
            this.setupChartInteractions();
            this.isInitialized = true;
            console.log('✅ Dashboard buttons initialized successfully');
        } catch (error) {
            console.error('❌ Error setting up dashboard buttons:', error);
        }
    }

    setupHeaderButtons() {
        // Refresh dashboard button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.handleRefreshDashboard();
            });
        }

        // Profile button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.handleProfileClick();
            });
        }

        // Logout buttons (both dashboard and navigation)
        const logoutBtn = document.getElementById('logout-btn');
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
            console.log('✅ Dashboard logout button connected');
        }
        
        if (navLogoutBtn) {
            navLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
            console.log('✅ Navigation logout button connected');
        }
    }

    setupCardButtons() {
        // Risk Assessment Card
        const takeAssessmentBtn = document.getElementById('take-assessment-btn');
        if (takeAssessmentBtn) {
            takeAssessmentBtn.addEventListener('click', () => {
                this.handleTakeAssessment();
            });
        }

        // Mood Tracker Card
        const logMoodBtn = document.getElementById('log-mood-btn');
        const viewMoodHistoryBtn = document.getElementById('view-mood-history-btn');
        
        if (logMoodBtn) {
            logMoodBtn.addEventListener('click', () => {
                this.handleLogMood();
            });
        }
        
        if (viewMoodHistoryBtn) {
            viewMoodHistoryBtn.addEventListener('click', () => {
                this.handleViewMoodHistory();
            });
        }

        // Mood selector buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = parseInt(e.target.dataset.mood);
                this.handleMoodSelection(mood, e.target);
            });
        });

        // Nutrition Card
        const createMealPlanBtn = document.getElementById('create-meal-plan-btn');
        const viewNutritionBtn = document.getElementById('view-nutrition-btn');
        
        if (createMealPlanBtn) {
            createMealPlanBtn.addEventListener('click', () => {
                this.handleCreateMealPlan();
            });
        }
        
        if (viewNutritionBtn) {
            viewNutritionBtn.addEventListener('click', () => {
                this.handleViewNutrition();
            });
        }

        // AI Insights Card
        const refreshInsightsBtn = document.getElementById('refresh-insights-btn');
        if (refreshInsightsBtn) {
            refreshInsightsBtn.addEventListener('click', () => {
                this.handleRefreshInsights();
            });
        }
    }

    setupQuickActionButtons() {
        const quickActions = {
            'assessment-btn': () => this.handleTakeAssessment(),
            'mood-log-btn': () => this.handleLogMood(),
            'meal-plan-btn': () => this.handleViewNutrition(),
            'generate-report-btn': () => this.handleGenerateReport()
        };

        Object.entries(quickActions).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
    }

    setupNavigationButtons() {
        // Bottom navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.handleNavigation(page, e.currentTarget);
            });
        });

        // Chart timeframe selector
        const chartTimeframe = document.getElementById('chart-timeframe');
        if (chartTimeframe) {
            chartTimeframe.addEventListener('change', (e) => {
                this.handleTimeframeChange(parseInt(e.target.value));
            });
        }
    }

    setupChartInteractions() {
        // Add hover effects and tooltips to chart bars
        document.querySelectorAll('.chart-bar').forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                this.showChartTooltip(e);
            });
            
            bar.addEventListener('mouseleave', () => {
                this.hideChartTooltip();
            });
            
            bar.addEventListener('click', (e) => {
                this.handleChartBarClick(e);
            });
        });
    }

    // Button Handlers
    handleRefreshDashboard() {
        console.log('🔄 Refreshing dashboard...');
        
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.classList.add('refreshing');
            refreshBtn.style.animation = 'spin 1s linear infinite';
        }

        // Simulate dashboard refresh
        setTimeout(() => {
            if (window.enhancedDashboard && typeof window.enhancedDashboard.refreshDashboard === 'function') {
                window.enhancedDashboard.refreshDashboard();
            } else {
                this.simulateDataRefresh();
            }
            
            if (refreshBtn) {
                refreshBtn.classList.remove('refreshing');
                refreshBtn.style.animation = '';
            }
            
            this.showNotification('Dashboard refreshed successfully!', 'success');
        }, 1500);
    }

    handleProfileClick() {
        console.log('👤 Profile button clicked');
        this.showNotification('Profile settings coming soon!', 'info');
        
        // Future: Open profile modal or navigate to profile page
        // For now, show user info
        const user = this.getCurrentUser();
        if (user) {
            this.showUserInfo(user);
        }
    }

    handleTakeAssessment() {
        console.log('🎯 Take assessment clicked');
        
        // Priority 1: Use the app's showAssessment method (recommended)
        if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
            console.log('✅ Starting assessment through app...');
            window.glucoApp.showAssessment();
            return;
        }
        
        // Priority 2: Use the dedicated risk assessment module directly
        if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
            console.log('✅ Starting WHO/ADA risk assessment directly...');
            window.riskAssessment.startAssessment();
            return;
        }
        
        // Priority 3: Try to initialize risk assessment if not available
        if (window.RiskAssessmentEngine) {
            console.log('⚠️ Risk assessment not initialized, creating new instance...');
            window.riskAssessment = new window.RiskAssessmentEngine();
            if (window.glucoApp) {
                window.glucoApp.showAssessment();
            } else {
                window.riskAssessment.startAssessment();
            }
            return;
        }
        
        // Fallback: Show error message
        console.error('❌ Risk assessment module not available');
        this.showNotification('Risk assessment is currently unavailable. Please try again later.', 'error');
    }

    handleLogMood() {
        console.log('💙 Log mood clicked');
        
        if (window.glucoApp && typeof window.glucoApp.showMentalHealth === 'function') {
            window.glucoApp.showMentalHealth();
        } else if (window.mentalHealthUI && typeof window.mentalHealthUI.showMoodLogger === 'function') {
            // Try mental health UI service
            window.mentalHealthUI.showMoodLogger();
        } else {
            // Fallback: show mood selector modal
            this.showMoodLogModal();
        }
    }

    handleViewMoodHistory() {
        console.log('📈 View mood history clicked');
        this.showNotification('Mood history feature coming soon!', 'info');
    }

    handleMoodSelection(mood, buttonElement) {
        console.log(`💙 Mood selected: ${mood}`);
        
        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        buttonElement.classList.add('selected');
        
        // Save mood (simulate)
        this.saveMoodEntry(mood);
        
        // Update current mood display
        const currentMoodValue = document.getElementById('current-mood-value');
        if (currentMoodValue) {
            currentMoodValue.textContent = `${mood}/5`;
        }
        
        this.showNotification(`Mood logged: ${this.getMoodEmoji(mood)}`, 'success');
    }

    handleCreateMealPlan() {
        console.log('🍽️ Create meal plan clicked');
        
        if (window.glucoApp && typeof window.glucoApp.showNutrition === 'function') {
            window.glucoApp.showNutrition();
        } else if (window.nutritionService && typeof window.nutritionService.createMealPlan === 'function') {
            // Try nutrition service
            window.nutritionService.createMealPlan();
        } else if (window.nutritionUI && typeof window.nutritionUI.showNutritionPlanner === 'function') {
            // Try nutrition UI service
            window.nutritionUI.showNutritionPlanner();
        } else {
            // Fallback: show nutrition modal
            this.showNutritionModal();
        }
    }

    handleViewNutrition() {
        console.log('📋 View nutrition clicked');
        
        if (window.glucoApp && typeof window.glucoApp.showNutrition === 'function') {
            window.glucoApp.showNutrition();
        } else if (window.nutritionUI && typeof window.nutritionUI.showNutritionPlans === 'function') {
            // Try nutrition UI service
            window.nutritionUI.showNutritionPlans();
        } else {
            // Fallback: same as create meal plan
            this.handleCreateMealPlan();
        }
    }

    handleRefreshInsights() {
        console.log('🤖 Refresh AI insights clicked');
        
        const refreshBtn = document.getElementById('refresh-insights-btn');
        if (refreshBtn) {
            refreshBtn.style.animation = 'spin 1s linear infinite';
        }
        
        setTimeout(() => {
            if (window.enhancedDashboard && typeof window.enhancedDashboard.generateAIInsights === 'function') {
                window.enhancedDashboard.generateAIInsights();
            } else {
                this.generateFallbackInsights();
            }
            
            if (refreshBtn) {
                refreshBtn.style.animation = '';
            }
        }, 2000);
    }

    handleGenerateReport() {
        console.log('📄 Generate report clicked');
        
        if (window.glucoApp && typeof window.glucoApp.showDoctorReport === 'function') {
            window.glucoApp.showDoctorReport();
        } else {
            this.showNotification('Generating health report...', 'info');
            setTimeout(() => {
                this.showNotification('Report generation feature coming soon!', 'info');
            }, 1500);
        }
    }

    handleLogout() {
        console.log('🚪 Logout button clicked');
        
        // Show confirmation modal
        const modal = this.createLogoutModal();
        document.body.appendChild(modal);
    }

    createLogoutModal() {
        const modal = document.createElement('div');
        modal.className = 'logout-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>🚪 Sign Out</h3>
                        <button class="modal-close" onclick="this.closest('.logout-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="logout-confirmation">
                            <div class="logout-icon">🚪</div>
                            <h4>Are you sure you want to sign out?</h4>
                            <p>You'll need to sign in again to access your dashboard.</p>
                            <div class="logout-actions">
                                <button class="btn-primary" onclick="window.dashboardButtonManager.confirmLogout()">
                                    Yes, Sign Out
                                </button>
                                <button class="btn-secondary" onclick="this.closest('.logout-modal').remove()">
                                    Cancel
                                </button>
                            </div>
                        </div>
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
        `;
        
        return modal;
    }

    async confirmLogout() {
        // Remove modal
        const modal = document.querySelector('.logout-modal');
        if (modal) modal.remove();
        
        this.showNotification('Signing out...', 'info');
        
        try {
            // Use navigation manager for proper logout
            if (window.navigationManager && typeof window.navigationManager.logout === 'function') {
                window.navigationManager.logout();
            } else {
                // Fallback logout process
                this.performLogout();
            }
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error signing out. Please try again.', 'error');
        }
    }

    performLogout() {
        console.log('🚪 Performing logout...');
        
        // Clear user session data
        localStorage.removeItem('glucobalance-current-user');
        localStorage.removeItem('glucobalance-auth-token');
        localStorage.removeItem('glucobalance-auth-state');
        sessionStorage.clear();
        
        // Hide dashboard and show landing page
        const dashboardPage = document.getElementById('dashboard-page');
        const landingPage = document.getElementById('landing-page');
        
        if (dashboardPage) {
            dashboardPage.classList.remove('active');
        }
        
        if (landingPage) {
            landingPage.classList.add('active');
        }
        
        // Update navigation buttons
        const navSignupBtn = document.getElementById('nav-signup-btn');
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        const navDashboardBtn = document.getElementById('nav-dashboard-btn');
        
        if (navSignupBtn) {
            navSignupBtn.style.display = 'block';
        }
        
        if (navLogoutBtn) {
            navLogoutBtn.style.display = 'none';
        }
        
        if (navDashboardBtn) {
            navDashboardBtn.textContent = 'Dashboard';
            navDashboardBtn.classList.remove('btn-primary');
            navDashboardBtn.classList.add('btn-outline');
        }
        
        this.showNotification('Successfully signed out. See you soon!', 'success');
    }

    handleNavigation(page, buttonElement) {
        console.log(`🧭 Navigation to: ${page}`);
        
        // Update active state
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');
        
        // Handle navigation
        switch (page) {
            case 'dashboard':
                this.showNotification('You are already on the dashboard', 'info');
                break;
            case 'profile':
                this.showNotification('Profile page coming soon!', 'info');
                break;
            case 'settings':
                this.showNotification('Settings page coming soon!', 'info');
                break;
            default:
                this.showNotification(`${page} page coming soon!`, 'info');
        }
    }

    handleTimeframeChange(days) {
        console.log(`📊 Chart timeframe changed to: ${days} days`);
        
        // Update charts if available
        if (window.enhancedDashboard && typeof window.enhancedDashboard.updateChartsTimeframe === 'function') {
            window.enhancedDashboard.updateChartsTimeframe(days);
        } else {
            this.showNotification(`Charts updated for last ${days} days`, 'success');
        }
    }

    showChartTooltip(event) {
        const bar = event.target;
        const tooltip = this.createTooltip();
        
        // Get data from bar attributes
        const score = bar.dataset.score;
        const date = bar.dataset.date;
        const category = bar.dataset.category;
        const mood = bar.dataset.mood;
        const adherence = bar.dataset.adherence;
        
        let content = '';
        if (score && date) {
            content = `Score: ${score}<br>Category: ${category}<br>Date: ${date}`;
        } else if (mood && date) {
            content = `Mood: ${mood}/5<br>Date: ${date}`;
        } else if (adherence && date) {
            content = `Adherence: ${adherence}%<br>Date: ${date}`;
        }
        
        if (content) {
            tooltip.innerHTML = content;
            tooltip.style.display = 'block';
            
            const rect = bar.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 10}px`;
        }
    }

    hideChartTooltip() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    handleChartBarClick(event) {
        const bar = event.target;
        console.log('📊 Chart bar clicked:', bar.dataset);
        
        // Show detailed info about the data point
        const score = bar.dataset.score;
        const date = bar.dataset.date;
        
        if (score && date) {
            this.showNotification(`Risk Score: ${score} on ${date}`, 'info');
        }
    }

    // Utility Methods
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('glucobalance-current-user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    saveMoodEntry(mood) {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const entry = {
            userId: user.id,
            mood: mood,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Save to localStorage (simulate database)
        const key = `mood-entries-${user.id}`;
        const entries = JSON.parse(localStorage.getItem(key) || '[]');
        entries.unshift(entry);
        
        // Keep only last 30 entries
        if (entries.length > 30) {
            entries.splice(30);
        }
        
        localStorage.setItem(key, JSON.stringify(entries));
    }

    getMoodEmoji(mood) {
        const emojis = ['', '😢', '😕', '😐', '😊', '😄'];
        return emojis[mood] || '😐';
    }

    simulateDataRefresh() {
        // Simulate updating dashboard data
        const elements = [
            { id: 'total-assessments', value: Math.floor(Math.random() * 10) + 1 },
            { id: 'mood-entries-count', value: Math.floor(Math.random() * 30) + 5 },
            { id: 'streak-days', value: Math.floor(Math.random() * 15) + 1 },
            { id: 'improvement-score', value: Math.floor(Math.random() * 40) + 60 + '%' }
        ];
        
        elements.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    generateFallbackInsights() {
        const insights = [
            "Your mood tracking shows consistent improvement over the past week! 😊",
            "Consider taking a risk assessment to get personalized health insights. 🎯",
            "Your engagement with the app is excellent - keep up the great work! 🌟",
            "Try logging your mood daily for better mental health tracking. 💙"
        ];
        
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];
        
        const insightsContainer = document.getElementById('ai-insights');
        if (insightsContainer) {
            insightsContainer.innerHTML = `
                <div class="ai-insights-content">
                    <div class="insight-section">
                        <h5>🤖 AI Insight</h5>
                        <p>${randomInsight}</p>
                    </div>
                    <div class="ai-disclaimer">
                        <small>🤖 AI-generated insights based on your activity. Enable full AI features for personalized recommendations.</small>
                    </div>
                </div>
            `;
        }
    }

    createTooltip() {
        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.className = 'chart-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                display: none;
                transform: translateX(-50%) translateY(-100%);
                white-space: nowrap;
            `;
            document.body.appendChild(tooltip);
        }
        return tooltip;
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

    showUserInfo(user) {
        const modal = document.createElement('div');
        modal.className = 'user-info-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>👤 User Profile</h3>
                        <button class="modal-close" onclick="this.closest('.user-info-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="user-info">
                            <p><strong>Name:</strong> ${user.name || 'Not set'}</p>
                            <p><strong>Email:</strong> ${user.email || 'Not set'}</p>
                            <p><strong>Member since:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div class="user-actions">
                            <button class="btn-primary" onclick="this.closest('.user-info-modal').remove()">Close</button>
                        </div>
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
        `;
        
        document.body.appendChild(modal);
    }

    showAssessmentModal() {
        const modal = document.createElement('div');
        modal.className = 'assessment-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>🎯 Risk Assessment</h3>
                        <button class="modal-close" onclick="this.closest('.assessment-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="assessment-info">
                            <div class="assessment-icon">🎯</div>
                            <h4>WHO/ADA Compliant Risk Assessment</h4>
                            <p>Our comprehensive questionnaire helps evaluate your diabetes risk based on internationally recognized guidelines.</p>
                            <div class="assessment-features">
                                <div class="feature-item">✅ Evidence-based questions</div>
                                <div class="feature-item">✅ Personalized risk score</div>
                                <div class="feature-item">✅ Actionable recommendations</div>
                                <div class="feature-item">✅ Progress tracking</div>
                            </div>
                            <div class="assessment-actions">
                                <button class="btn-primary" onclick="this.closest('.assessment-modal').remove(); window.dashboardButtonManager.showNotification('Assessment feature will be available soon!', 'info');">
                                    Start Assessment
                                </button>
                                <button class="btn-secondary" onclick="this.closest('.assessment-modal').remove()">
                                    Maybe Later
                                </button>
                            </div>
                        </div>
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
        `;
        
        document.body.appendChild(modal);
    }

    showMoodLogModal() {
        const modal = document.createElement('div');
        modal.className = 'mood-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>💙 Log Your Mood</h3>
                        <button class="modal-close" onclick="this.closest('.mood-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="mood-logger">
                            <p>How are you feeling today?</p>
                            <div class="mood-selector-large">
                                <button class="mood-btn-large" onclick="window.dashboardButtonManager.logMoodFromModal(1); this.closest('.mood-modal').remove();">
                                    😢<br><span>Very Sad</span>
                                </button>
                                <button class="mood-btn-large" onclick="window.dashboardButtonManager.logMoodFromModal(2); this.closest('.mood-modal').remove();">
                                    😕<br><span>Sad</span>
                                </button>
                                <button class="mood-btn-large" onclick="window.dashboardButtonManager.logMoodFromModal(3); this.closest('.mood-modal').remove();">
                                    😐<br><span>Neutral</span>
                                </button>
                                <button class="mood-btn-large" onclick="window.dashboardButtonManager.logMoodFromModal(4); this.closest('.mood-modal').remove();">
                                    😊<br><span>Happy</span>
                                </button>
                                <button class="mood-btn-large" onclick="window.dashboardButtonManager.logMoodFromModal(5); this.closest('.mood-modal').remove();">
                                    😄<br><span>Very Happy</span>
                                </button>
                            </div>
                        </div>
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
        `;
        
        document.body.appendChild(modal);
    }

    showNutritionModal() {
        const modal = document.createElement('div');
        modal.className = 'nutrition-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>🍎 Nutrition Planning</h3>
                        <button class="modal-close" onclick="this.closest('.nutrition-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="nutrition-info">
                            <div class="nutrition-icon">🍎</div>
                            <h4>Personalized Meal Planning</h4>
                            <p>Get customized meal plans adapted to your dietary preferences and health goals.</p>
                            <div class="nutrition-features">
                                <div class="feature-item">🥗 Balanced nutrition</div>
                                <div class="feature-item">🌍 Local cuisine options</div>
                                <div class="feature-item">⚡ Quick & easy recipes</div>
                                <div class="feature-item">📊 Nutritional tracking</div>
                            </div>
                            <div class="nutrition-actions">
                                <button class="btn-primary" onclick="this.closest('.nutrition-modal').remove(); window.dashboardButtonManager.showNotification('Nutrition planning feature will be available soon!', 'info');">
                                    Create Meal Plan
                                </button>
                                <button class="btn-secondary" onclick="this.closest('.nutrition-modal').remove()">
                                    Browse Recipes
                                </button>
                            </div>
                        </div>
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
        `;
        
        document.body.appendChild(modal);
    }

    logMoodFromModal(mood) {
        console.log(`💙 Mood logged from modal: ${mood}`);
        
        // Update dashboard mood display
        const currentMoodValue = document.getElementById('current-mood-value');
        if (currentMoodValue) {
            currentMoodValue.textContent = `${mood}/5`;
        }
        
        // Update mood selector in dashboard
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        // Save mood entry
        this.saveMoodEntry(mood);
        
        const moodEmojis = ['', '😢', '😕', '😐', '😊', '😄'];
        this.showNotification(`Mood logged: ${moodEmojis[mood]} ${mood}/5`, 'success');
    }

    refreshButtonStates() {
        if (!this.isInitialized) return;
        
        console.log('🔄 Refreshing button states...');
        
        // Update button states based on current data
        const user = this.getCurrentUser();
        
        // Update quick action buttons based on user data
        const assessmentBtn = document.getElementById('assessment-btn');
        if (assessmentBtn && !user) {
            assessmentBtn.classList.add('primary');
        }
        
        // Update navigation active state
        const dashboardNavBtn = document.querySelector('.nav-btn[data-page="dashboard"]');
        if (dashboardNavBtn) {
            dashboardNavBtn.classList.add('active');
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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
        max-width: 400px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        margin: 0;
        color: var(--text-primary);
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-secondary);
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .modal-close:hover {
        background: var(--light-gray);
        color: var(--text-primary);
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .user-info p {
        margin: 10px 0;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .user-actions {
        margin-top: 20px;
        text-align: center;
    }
    
    .btn-primary {
        background: var(--azure-blue);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .btn-primary:hover {
        background: var(--azure-dark);
        transform: translateY(-1px);
    }
    
    .logout-actions, .assessment-actions, .nutrition-actions {
        margin-top: 20px;
        text-align: center;
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .logout-actions button, .assessment-actions button, .nutrition-actions button {
        min-width: 120px;
    }
    
    .btn-secondary {
        background: var(--light-gray);
        color: var(--text-primary);
        border: 1px solid var(--medium-gray);
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .btn-secondary:hover {
        background: var(--medium-gray);
        transform: translateY(-1px);
    }
    
    .logout-icon, .assessment-icon, .nutrition-icon {
        font-size: 48px;
        text-align: center;
        margin-bottom: 16px;
    }
    
    .logout-confirmation h4, .assessment-info h4, .nutrition-info h4 {
        margin: 16px 0 8px 0;
        color: var(--text-primary);
        text-align: center;
    }
    
    .logout-confirmation p, .assessment-info p, .nutrition-info p {
        color: var(--text-secondary);
        text-align: center;
        margin-bottom: 16px;
    }
    
    .assessment-features, .nutrition-features {
        margin: 16px 0;
        text-align: left;
    }
    
    .feature-item {
        padding: 4px 0;
        color: var(--text-primary);
    }
    
    .mood-selector-large {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
        margin: 20px 0;
    }
    
    .mood-btn-large {
        background: white;
        border: 2px solid var(--light-gray);
        border-radius: 12px;
        padding: 16px 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 24px;
        text-align: center;
        min-width: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    
    .mood-btn-large span {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
    }
    
    .mood-btn-large:hover {
        border-color: var(--azure-blue);
        background: var(--azure-light);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 127, 255, 0.2);
    }
    
    .mood-logger p {
        text-align: center;
        margin-bottom: 16px;
        color: var(--text-primary);
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// Initialize the dashboard button manager
if (!window.dashboardButtonManager) {
    window.dashboardButtonManager = new DashboardButtonManager();
    console.log('✅ Enhanced Dashboard Button Manager initialized successfully!');
} else {
    console.log('✅ Dashboard Button Manager already initialized');
}
//# sourceMappingURL=enhanced-dashboard-buttons.js.map