// GlucoBalance - Main Application Logic
class GlucoBalanceApp {
    constructor() {
        this.currentPage = 'landing';
        this.userData = {};
        this.assessmentData = {};
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupErrorHandling();
        this.setupOfflineHandling();
        this.setupNotificationSystem();
        this.loadUserData();
        this.checkLoginStatus();
        this.performHealthCheck();
    }

    setupErrorHandling() {
        // Global error handling integration
        if (window.errorHandler) {
            // Override console.error to capture application errors
            const originalError = console.error;
            console.error = (...args) => {
                if (args[0] instanceof Error) {
                    window.errorHandler.handleError('APP_ERROR', args[0], { context: 'application' });
                }
                originalError.apply(console, args);
            };
        }
    }

    setupOfflineHandling() {
        // Online/offline status monitoring
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineIndicator();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
        });

        // Listen for offline operation events
        document.addEventListener('offlineOperationQueued', (event) => {
            this.handleOfflineOperationQueued(event.detail);
        });
    }

    setupNotificationSystem() {
        // Initialize notification system integration
        if (window.notificationService && window.notificationUI) {
            // Set up notification event listeners
            document.addEventListener('userLoggedIn', (event) => {
                this.initializeUserNotifications(event.detail.user);
            });

            document.addEventListener('userLoggedOut', () => {
                this.clearUserNotifications();
            });

            // Set up activity tracking for engagement
            this.setupActivityTracking();

            // Check for inactive users periodically
            setInterval(() => {
                if (window.notificationService) {
                    window.notificationService.checkForInactiveUsers();
                }
            }, 24 * 60 * 60 * 1000); // Check daily

            console.log('Notification system integrated successfully');
        } else {
            console.warn('Notification system not available');
        }
    }

    async initializeUserNotifications(user) {
        try {
            if (window.notificationService) {
                // Request notification permission if not already granted
                await window.notificationService.requestNotificationPermission();
                
                // Schedule daily notifications based on user preferences
                await window.notificationService.scheduleDailyNotifications();
                
                // Schedule weekly summaries
                await window.notificationService.scheduleWeeklySummaries();
                
                // Show welcome back notification if returning user
                if (window.notificationUI) {
                    await window.notificationUI.checkPendingNotifications();
                }
                
                console.log('User notifications initialized for:', user.name);
            }
        } catch (error) {
            console.error('Failed to initialize user notifications:', error);
        }
    }

    clearUserNotifications() {
        try {
            // Clear any scheduled notifications when user logs out
            if (window.notificationService) {
                window.notificationService.scheduledNotifications.clear();
            }
            console.log('User notifications cleared');
        } catch (error) {
            console.error('Failed to clear user notifications:', error);
        }
    }

    setupActivityTracking() {
        // Track user activity for engagement optimization
        const activityEvents = ['click', 'touchstart', 'scroll', 'keydown'];
        
        activityEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.recordUserActivity();
            }, { passive: true });
        });

        // Track page navigation
        window.addEventListener('hashchange', () => {
            this.recordUserActivity();
            this.trackPageView();
        });
    }

    recordUserActivity() {
        // Throttle activity recording to avoid excessive calls
        if (!this.lastActivityTime || Date.now() - this.lastActivityTime > 60000) { // 1 minute throttle
            this.lastActivityTime = Date.now();
            
            // Store last activity time
            try {
                localStorage.setItem('glucobalance_last_activity', this.lastActivityTime.toString());
            } catch (error) {
                console.error('Failed to record user activity:', error);
            }
        }
    }

    trackPageView() {
        // Track page views for engagement analysis
        const currentPage = window.location.hash.replace('#', '') || 'dashboard';
        
        try {
            if (window.notificationService && this.userData.id) {
                // This could be used for engagement analysis
                const pageView = {
                    page: currentPage,
                    timestamp: new Date().toISOString(),
                    userId: this.userData.id
                };
                
                // Store page view for analytics (simplified implementation)
                const pageViews = JSON.parse(localStorage.getItem('glucobalance_page_views') || '[]');
                pageViews.push(pageView);
                
                // Keep only last 100 page views
                if (pageViews.length > 100) {
                    pageViews.splice(0, pageViews.length - 100);
                }
                
                localStorage.setItem('glucobalance_page_views', JSON.stringify(pageViews));
            }
        } catch (error) {
            console.error('Failed to track page view:', error);
        }

        // Listen for sync events
        document.addEventListener('syncCompleted', (event) => {
            this.handleSyncCompleted(event.detail);
        });

        document.addEventListener('syncFailed', (event) => {
            this.handleSyncFailed(event.detail);
        });

        // Initial offline check
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }

    showOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator';
            indicator.textContent = 'Offline - Some features may be limited';
            document.body.appendChild(indicator);
        }
        indicator.classList.add('show');
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    async performHealthCheck() {
        if (window.errorHandler) {
            try {
                const healthStatus = await window.errorHandler.performHealthCheck();
                this.updateDatabaseStatus(healthStatus);
            } catch (error) {
                console.error('Health check failed:', error);
            }
        }
    }

    updateDatabaseStatus(healthStatus) {
        // Add database status indicator to the UI
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'db-status-container';
        statusIndicator.innerHTML = `
            <span class="db-status ${healthStatus.database ? 'connected' : 'disconnected'}"></span>
            <span class="status-text">${healthStatus.database ? 'Database Connected' : 'Using Offline Mode'}</span>
        `;
        
        // Add to header if it exists
        const header = document.querySelector('.app-header .container');
        if (header && !header.querySelector('.db-status-container')) {
            header.appendChild(statusIndicator);
        }
    }

    async syncOfflineData() {
        if (window.offlineManager && this.isOnline) {
            try {
                console.log('Syncing offline data...');
                await window.offlineManager.syncOfflineData();
            } catch (error) {
                if (window.errorHandler) {
                    await window.errorHandler.handleError('SYNC_ERROR', error);
                }
                console.error('Sync failed:', error);
            }
        }
    }

    handleOfflineOperationQueued(detail) {
        console.log('Offline operation queued:', detail);
        // Update UI to show pending operations
        if (window.offlineUI) {
            window.offlineUI.incrementQueuedOperations();
        }
    }

    handleSyncCompleted(detail) {
        console.log('Sync completed:', detail);
        this.showNotification(`Successfully synced ${detail.syncedCount} changes`, 'success');
    }

    handleSyncFailed(detail) {
        console.log('Sync failed:', detail);
        this.showNotification('Sync failed. Will retry when connection improves.', 'error');
    }

    setupTouchSupport() {
        // Add touch feedback for better mobile UX
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('button, .btn, .nav-btn, .action-btn, .card')) {
                e.target.style.transform = 'scale(0.98)';
                e.target.style.opacity = '0.8';
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (e.target.matches('button, .btn, .nav-btn, .action-btn, .card')) {
                setTimeout(() => {
                    e.target.style.transform = '';
                    e.target.style.opacity = '';
                }, 150);
            }
        }, { passive: true });

        // Prevent zoom on double tap for better PWA experience
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Handle swipe gestures for navigation
        this.setupSwipeNavigation();
    }

    setupSwipeNavigation() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 100;

        // Only handle horizontal swipes that are longer than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            const pages = ['dashboard', 'assessment', 'nutrition', 'mental-health', 'progress'];
            const currentIndex = pages.indexOf(this.currentPage);
            
            if (deltaX > 0 && currentIndex > 0) {
                // Swipe right - go to previous page
                this.navigateTo(pages[currentIndex - 1]);
            } else if (deltaX < 0 && currentIndex < pages.length - 1) {
                // Swipe left - go to next page
                this.navigateTo(pages[currentIndex + 1]);
            }
        }
    }

    setupPWAInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
            this.showNotification('GlucoBalance installed successfully!', 'success');
        });
    }

    showInstallButton(deferredPrompt) {
        // Create install button if it doesn't exist
        if (!document.getElementById('install-btn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'install-btn';
            installBtn.className = 'btn-secondary install-btn';
            installBtn.innerHTML = '📱 Install App';
            installBtn.style.cssText = `
                position: fixed;
                top: 1rem;
                right: 1rem;
                z-index: 1001;
                font-size: 0.9rem;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                box-shadow: var(--shadow-hover);
            `;

            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to install prompt: ${outcome}`);
                    deferredPrompt = null;
                    this.hideInstallButton();
                }
            });

            document.body.appendChild(installBtn);

            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hideInstallButton();
            }, 10000);
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    setupEventListeners() {
        // Mobile-first touch and gesture support
        this.setupTouchSupport();
        
        // PWA install prompt handling
        this.setupPWAInstallPrompt();
        
        // Authentication state change listener
        document.addEventListener('authStateChanged', (event) => {
            this.handleAuthStateChange(event.detail);
        });

        // Profile update listener
        document.addEventListener('profileUpdated', (event) => {
            this.handleProfileUpdate(event.detail);
        });

        // Landing page buttons
        document.getElementById('start-assessment-btn')?.addEventListener('click', () => {
            this.showAssessment();
        });

        document.getElementById('login-btn')?.addEventListener('click', () => {
            // Check if user is authenticated, if not show login form
            if (window.authService && window.authService.isAuthenticated()) {
                this.showDashboard();
            } else if (window.authUI) {
                window.authUI.showLoginForm();
            } else {
                this.showDashboard(); // Fallback
            }
        });

        // Initialize landing page manager
        if (!window.landingPageManager) {
            window.landingPageManager = new LandingPageManager();
        }

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.navigateTo(page);
            });
        });

        // Dashboard actions
        document.getElementById('take-assessment-btn')?.addEventListener('click', () => {
            this.showAssessment();
        });

        document.getElementById('nutrition-btn')?.addEventListener('click', () => {
            this.showNutrition();
        });

        document.getElementById('progress-btn')?.addEventListener('click', () => {
            this.showProgress();
        });

        document.getElementById('report-btn')?.addEventListener('click', () => {
            this.showDoctorReport();
        });

        // Mood selector
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.recordMood(e.target.dataset.mood);
            });
        });

        // Profile button
        document.getElementById('profile-btn')?.addEventListener('click', () => {
            this.showProfile();
        });
    }

    // Handle authentication state changes
    handleAuthStateChange(authState) {
        if (authState.isAuthenticated && authState.user) {
            // User logged in
            this.userData = { ...this.userData, ...authState.user };
            this.updateUIForAuthenticatedUser(authState.user);
        } else {
            // User logged out
            this.userData = {};
            this.updateUIForUnauthenticatedUser();
        }
    }

    // Handle profile updates
    handleProfileUpdate(profileData) {
        if (profileData.user) {
            this.userData = { ...this.userData, ...profileData.user };
            this.saveUserData();
        }
    }

    // Update UI for authenticated user
    updateUIForAuthenticatedUser(user) {
        // Update login button text
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.textContent = `Welcome, ${user.name || 'User'}`;
        }

        // Show bottom navigation
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }

        // Show profile button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.style.display = 'block';
        }
    }

    // Update UI for unauthenticated user
    updateUIForUnauthenticatedUser() {
        // Reset login button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.textContent = 'Login to Dashboard';
        }

        // Hide bottom navigation
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }

        // Hide profile button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.style.display = 'none';
        }

        // Navigate to landing page
        this.navigateTo('landing');
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            
            // Update active nav button
            const activeBtn = document.querySelector(`[data-page="${page}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            
            // Load page-specific content
            this.loadPageContent(page);
        }
    }

    loadPageContent(page) {
        switch(page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'assessment':
                this.loadAssessment();
                break;
            case 'nutrition':
                this.loadNutrition();
                break;
            case 'mental-health':
                this.loadMentalHealth();
                break;
            case 'progress':
                this.loadProgress();
                break;
            case 'doctor-report':
                this.loadDoctorReport();
                break;
        }
    }

    loadNutrition() {
        // Initialize nutrition service with current user
        if (window.nutritionService && this.userData.id) {
            window.nutritionService.setCurrentUser(this.userData.id);
        }
        
        // Update nutrition summary on dashboard if visible
        this.updateNutritionSummary();
    }

    loadMentalHealth() {
        // Initialize mental health service with current user
        if (window.mentalHealthService && this.userData.id) {
            window.mentalHealthService.setCurrentUser(this.userData.id);
        }
        
        // Initialize mental health UI with current user
        if (window.mentalHealthUI && this.userData.id) {
            window.mentalHealthUI.setCurrentUser(this.userData.id);
        }
    }

    showDashboard() {
        if (!document.getElementById('dashboard-page')) {
            this.createDashboardPage();
        }
        this.navigateTo('dashboard');
        document.getElementById('bottom-nav').style.display = 'flex';
    }

    showAssessment() {
        if (!document.getElementById('assessment-page')) {
            this.createAssessmentPage();
        }
        this.navigateTo('assessment');
        document.getElementById('bottom-nav').style.display = 'flex';
    }

    showNutrition() {
        if (!document.getElementById('nutrition-page')) {
            this.createNutritionPage();
        }
        this.navigateTo('nutrition');
        this.loadNutrition();
    }

    showMentalHealth() {
        if (!document.getElementById('mental-health-page')) {
            if (window.mentalHealthUI) {
                window.mentalHealthUI.createMentalHealthPage();
            }
        }
        this.navigateTo('mental-health');
        this.loadMentalHealth();
    }

    showProgress() {
        if (!document.getElementById('progress-page')) {
            this.createProgressPage();
        }
        this.navigateTo('progress');
    }

    showDoctorReport() {
        if (!document.getElementById('doctor-report-page')) {
            if (window.doctorReportUI) {
                window.doctorReportUI.createDoctorReportPage();
                // Set current user for the report UI
                if (this.userData.id) {
                    window.doctorReportUI.setCurrentUser(this.userData);
                }
            }
        }
        this.navigateTo('doctor-report');
    }

    showProfile() {
        if (!document.getElementById('profile-page')) {
            this.createProfilePage();
        }
        this.navigateTo('profile');
    }

    loadAssessment() {
        // Initialize risk assessment if not already done
        if (window.riskAssessment) {
            window.riskAssessment.startAssessment();
        }
    }

    loadDashboard() {
        // Initialize dashboard hero section
        if (window.dashboardHero && this.userData) {
            window.dashboardHero.setCurrentUser(this.userData);
        }

        // Use enhanced dashboard if available
        if (window.enhancedDashboard && this.userData.id) {
            window.enhancedDashboard.setCurrentUser(this.userData.id);
            window.enhancedDashboard.loadDashboard();
        } else {
            // Fallback to basic dashboard
            this.updateRiskDisplay();
            this.updateMoodDisplay();
            this.updateNutritionSummary();
            this.generateAIInsights();
        }
    }

    updateRiskDisplay() {
        const riskDisplay = document.getElementById('risk-display');
        if (this.userData.riskScore) {
            const score = this.userData.riskScore;
            const category = this.getRiskCategory(score);
            
            riskDisplay.innerHTML = `
                <div class="risk-score">${score}</div>
                <div class="risk-category risk-${category.toLowerCase()}">${category} Risk</div>
            `;
        }
    }

    getRiskCategory(score) {
        if (score < 7) return 'Low';
        if (score < 15) return 'Increased';
        if (score < 20) return 'High';
        return 'Possible Diabetes';
    }

    async recordMood(mood) {
        // Delegate to mental health UI if available
        if (window.mentalHealthUI && this.userData.id) {
            // Create a mock button element for the mental health UI
            const mockButton = { dataset: { mood: mood } };
            await window.mentalHealthUI.handleMoodSelection(mockButton);
        } else {
            // Fallback to original implementation
            try {
                const today = new Date().toISOString().split('T')[0];
                
                // Update UI
                document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
                const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
                if (selectedBtn) {
                    selectedBtn.classList.add('selected');
                }
                
                // Store mood data using database service if available
                if (window.kiroDb && this.userData.id) {
                    try {
                        await window.kiroDb.saveMood(this.userData.id, today, mood, '');
                    } catch (dbError) {
                        // Fallback to localStorage
                        if (!this.userData.moods) this.userData.moods = {};
                        this.userData.moods[today] = parseInt(mood);
                    }
                } else {
                    // Fallback to localStorage
                    if (!this.userData.moods) this.userData.moods = {};
                    this.userData.moods[today] = parseInt(mood);
                }
                
                await this.saveUserData();
                this.showNotification('Mood recorded successfully!', 'success');
                
                // Generate AI affirmation
                await this.generateMoodAffirmation(mood);
            } catch (error) {
                if (window.errorHandler) {
                    await window.errorHandler.handleError('MOOD_RECORD_ERROR', error);
                    window.errorHandler.showUserError('Unable to record mood. Please try again.');
                }
                console.error('Failed to record mood:', error);
            }
        }
    }

    async generateMoodAffirmation(mood) {
        const affirmations = {
            1: "It's okay to have difficult days. Remember that your feelings are valid, and tomorrow brings new possibilities.",
            2: "You're taking important steps for your health. Small progress is still progress.",
            3: "You're doing well by staying engaged with your health journey. Keep going!",
            4: "Great to see you're feeling positive! Your commitment to health is paying off.",
            5: "Wonderful! Your positive energy is a powerful tool for maintaining good health."
        };
        
        const message = affirmations[mood] || affirmations[3];
        setTimeout(() => {
            this.showNotification(message, 'success');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Use error handler's notification system if available
        if (window.errorHandler && (type === 'error' || type === 'warning')) {
            window.errorHandler.showUserError(message, type);
            return;
        }

        // Fallback to custom notification system
        const notification = document.createElement('div');
        notification.className = `error-notification ${type} show`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async loadUserData() {
        try {
            const stored = localStorage.getItem('glucobalance-user');
            if (stored) {
                this.userData = JSON.parse(stored);
            }
        } catch (error) {
            if (window.errorHandler) {
                await window.errorHandler.handleError('DATA_LOAD_ERROR', error);
            }
            console.error('Failed to load user data:', error);
            this.userData = {}; // Reset to empty object
        }
    }

    async saveUserData() {
        try {
            localStorage.setItem('glucobalance-user', JSON.stringify(this.userData));
        } catch (error) {
            if (window.errorHandler) {
                await window.errorHandler.handleError('DATA_SAVE_ERROR', error);
                window.errorHandler.showUserError('Unable to save your data. Please try again.');
            }
            console.error('Failed to save user data:', error);
        }
    }

    async checkLoginStatus() {
        // Check if auth service is available and user is authenticated
        if (window.authService) {
            const isAuthenticated = window.authService.isAuthenticated();
            
            if (isAuthenticated) {
                const currentUser = window.authService.getCurrentUser();
                if (currentUser) {
                    // Update local userData with auth service data
                    this.userData = { ...this.userData, ...currentUser };
                    
                    // Auto-navigate to dashboard
                    setTimeout(() => this.showDashboard(), 1000);
                    return;
                }
            }
        }
        
        // Fallback to local data check
        if (this.userData.hasCompletedAssessment) {
            // Auto-navigate to dashboard if user has data
            setTimeout(() => this.showDashboard(), 1000);
        }
    }

    generateAIInsights() {
        const insights = document.getElementById('ai-insights');
        if (!insights) return;

        // Check if enhanced dashboard is handling this
        if (window.enhancedDashboard && this.userData.id) {
            return; // Enhanced dashboard will handle AI insights
        }

        // Basic AI insights fallback
        if (!this.userData.riskScore && !this.userData.moods) {
            insights.innerHTML = `
                <div class="insights-placeholder">
                    <div class="placeholder-icon">🤖</div>
                    <p>Complete your risk assessment to receive personalized AI insights</p>
                    <button class="btn-primary" onclick="window.glucoApp.showAssessment()">
                        Get Started
                    </button>
                </div>
            `;
            return;
        }
        
        if (this.userData.riskScore) {
            const riskLevel = this.getRiskCategory(this.userData.riskScore);
            const recentMoods = this.getRecentMoods();
            
            let insight = this.getPersonalizedInsight(riskLevel, recentMoods);
            insights.innerHTML = `
                <div class="basic-insights">
                    <p>${insight}</p>
                    <div class="upgrade-prompt">
                        <small>🤖 Enable AI for enhanced personalized insights</small>
                    </div>
                </div>
            `;
        }
    }

    getRecentMoods() {
        if (!this.userData.moods) return [];
        
        const recent = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (this.userData.moods[dateStr]) {
                recent.push(this.userData.moods[dateStr]);
            }
        }
        
        return recent;
    }

    getPersonalizedInsight(riskLevel, moods) {
        const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 3;
        
        const insights = {
            'Low': [
                "Excellent! Your low risk status shows your healthy lifestyle is working. Keep up the great habits!",
                "Your consistent healthy choices are paying off. Consider sharing your success strategies with others.",
                "Maintaining your current lifestyle will help keep your diabetes risk low. Stay active and eat well!"
            ],
            'Increased': [
                "Your increased risk is manageable with the right lifestyle changes. Focus on regular exercise and balanced nutrition.",
                "Small changes can make a big difference. Consider adding a 30-minute walk to your daily routine.",
                "You're taking the right steps by monitoring your health. Consistency in healthy habits is key."
            ],
            'High': [
                "Your high risk score indicates the importance of immediate lifestyle changes. Consider consulting with a healthcare provider.",
                "Focus on reducing processed foods and increasing physical activity. Every healthy choice matters.",
                "Regular monitoring and professional guidance can help you manage and reduce your risk effectively."
            ],
            'Possible Diabetes': [
                "It's important to consult with a healthcare provider for proper testing and guidance.",
                "Early intervention can make a significant difference. Don't delay in seeking professional medical advice.",
                "You're taking an important step by monitoring your health. Professional support will help guide your next steps."
            ]
        };
        
        const riskInsights = insights[riskLevel] || insights['Increased'];
        let baseInsight = riskInsights[Math.floor(Math.random() * riskInsights.length)];
        
        // Add mood-based insight
        if (avgMood < 2.5) {
            baseInsight += " Remember, managing your mental health is just as important as physical health.";
        } else if (avgMood > 3.5) {
            baseInsight += " Your positive mood is a great asset in maintaining healthy habits!";
        }
        
        return baseInsight;
    }

    async generateReport() {
        this.showNotification('Generating your health report...', 'info');
        
        // Simulate report generation
        setTimeout(() => {
            const reportData = this.compileReportData();
            this.downloadReport(reportData);
            this.showNotification('Report generated successfully!', 'success');
        }, 2000);
    }

    compileReportData() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        return {
            patientName: this.userData.name || 'Patient',
            reportDate: today.toLocaleDateString(),
            period: `${thirtyDaysAgo.toLocaleDateString()} - ${today.toLocaleDateString()}`,
            riskScore: this.userData.riskScore || 'Not assessed',
            riskCategory: this.userData.riskScore ? this.getRiskCategory(this.userData.riskScore) : 'Not assessed',
            avgMood: this.calculateAverageMood(),
            moodTrend: this.getMoodTrend(),
            nutritionAdherence: this.calculateNutritionAdherence(),
            recommendations: this.generateRecommendations()
        };
    }

    calculateAverageMood() {
        const moods = this.getRecentMoods();
        return moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : 'No data';
    }

    getMoodTrend() {
        const moods = this.getRecentMoods();
        if (moods.length < 2) return 'Insufficient data';
        
        const recent = moods.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const older = moods.slice(-3).reduce((a, b) => a + b, 0) / 3;
        
        if (recent > older + 0.5) return 'Improving';
        if (recent < older - 0.5) return 'Declining';
        return 'Stable';
    }

    calculateNutritionAdherence() {
        // Placeholder - would integrate with actual nutrition tracking
        return this.userData.nutritionAdherence || 'Not tracked';
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.userData.riskScore > 15) {
            recommendations.push('Consult with healthcare provider for diabetes screening');
            recommendations.push('Implement structured meal planning');
            recommendations.push('Increase physical activity to 150 minutes per week');
        }
        
        const avgMood = parseFloat(this.calculateAverageMood());
        if (avgMood < 3) {
            recommendations.push('Consider stress management techniques');
            recommendations.push('Maintain social connections for emotional support');
        }
        
        return recommendations;
    }

    downloadReport(data) {
        const reportContent = `
GLUCOBALANCE HEALTH REPORT
Generated: ${data.reportDate}
Period: ${data.period}

PATIENT INFORMATION
Name: ${data.patientName}

DIABETES RISK ASSESSMENT
Risk Score: ${data.riskScore}
Risk Category: ${data.riskCategory}

MENTAL HEALTH SUMMARY
Average Mood (1-5 scale): ${data.avgMood}
Mood Trend: ${data.moodTrend}

LIFESTYLE TRACKING
Nutrition Adherence: ${data.nutritionAdherence}

RECOMMENDATIONS
${data.recommendations.map(rec => `• ${rec}`).join('\n')}

This report is generated by GlucoBalance for informational purposes.
Please consult with your healthcare provider for medical advice.
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `glucobalance-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.glucoApp = new GlucoBalanceApp();
    
    // Initialize PDF export service if available
    if (window.pdfExportService) {
        console.log('PDF Export Service initialized');
    }
});
    // Cr
eate Assessment Page
    createAssessmentPage() {
        const assessmentHTML = `
        <div id="assessment-page" class="page">
            <header class="app-header">
                <div class="container">
                    <h1>Risk Assessment</h1>
                    <div class="progress-bar">
                        <div class="progress-fill" id="assessment-progress" style="width: 0%"></div>
                    </div>
                </div>
            </header>
            
            <main class="container">
                <div class="assessment-form">
                    <div id="assessment-content">
                        <!-- Assessment questions will be loaded here -->
                    </div>
                    
                    <div class="form-actions">
                        <button id="prev-question" class="btn-secondary" style="display: none;">Previous</button>
                        <button id="next-question" class="btn-primary">Next</button>
                    </div>
                </div>
                
                <div id="assessment-result" class="card" style="display: none;">
                    <h3>Your Risk Assessment Result</h3>
                    <div id="risk-result-display"></div>
                    <div id="ai-explanation"></div>
                    <button id="save-assessment" class="btn-primary">Save & Continue to Dashboard</button>
                </div>
            </main>
        </div>`;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', assessmentHTML);
        this.initializeAssessment();
    }

    // Create Nutrition Page
    createNutritionPage() {
        const nutritionHTML = `
        <div id="nutrition-page" class="page">
            <header class="app-header">
                <div class="container">
                    <h1>🍽️ Nutrition & Meal Planning</h1>
                    <p class="page-subtitle">AI-powered diabetic-friendly meal plans tailored to your culture</p>
                </div>
            </header>
            
            <main class="container">
                <div class="card meal-plan-generator">
                    <div class="card-header">
                        <h3><span class="icon">🤖</span> Generate Personalized Meal Plan</h3>
                        <p>Create a 3-day diabetic and heart-friendly meal plan adapted to your preferences</p>
                    </div>
                    
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
                            <label class="checkbox-label">
                                <input type="checkbox" value="heart-healthy"> 
                                <span class="checkmark"></span>
                                Heart Healthy
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button id="generate-meal-plan" class="btn-primary">
                            <span class="icon">✨</span> Generate 3-Day Meal Plan
                        </button>
                    </div>
                </div>
                
                <div id="meal-plan-container" class="meal-plan-container">
                    <div class="empty-state">
                        <div class="empty-icon">🍽️</div>
                        <h3>No Meal Plan Yet</h3>
                        <p>Generate your first personalized meal plan using the form above</p>
                    </div>
                </div>
            </main>
        </div>`;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', nutritionHTML);
    }

    updateNutritionSummary() {
        const nutritionSummary = document.getElementById('nutrition-summary');
        if (!nutritionSummary) return;

        // Get latest meal plan adherence
        if (window.nutritionService && this.userData.id) {
            window.nutritionService.getLatestMealPlan().then(latestPlan => {
                if (latestPlan) {
                    window.nutritionService.getMealAdherence(latestPlan.mealPlan.id).then(adherenceData => {
                        const overallAdherence = window.nutritionService.calculateOverallAdherence(adherenceData);
                        
                        nutritionSummary.innerHTML = `
                            <div class="nutrition-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${overallAdherence}%</div>
                                    <div class="stat-label">Meal Plan Adherence</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${latestPlan.mealPlan.cuisine}</div>
                                    <div class="stat-label">Current Cuisine</div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    nutritionSummary.innerHTML = `
                        <div class="no-data">
                            <p>No meal plan generated yet</p>
                            <button onclick="window.glucoApp.showNutrition()" class="btn-secondary btn-sm">
                                Create Meal Plan
                            </button>
                        </div>
                    `;
                }
            });
        }
    }

    // Create Enhanced Progress Page with AI Insights
    createProgressPage() {
        const progressHTML = `
        <div id="progress-page" class="page">
            <header class="app-header">
                <div class="container">
                    <h1>📊 Progress Dashboard</h1>
                    <p class="page-subtitle">Track your health journey with AI-powered insights</p>
                </div>
            </header>
            
            <main class="container">
                <div id="progress-dashboard-content">
                    <!-- Dashboard Overview Cards -->
                    <div class="dashboard-overview">
                        <div id="dashboard-cards" class="dashboard-cards-grid">
                            <!-- Cards will be populated by progress dashboard -->
                        </div>
                    </div>
                    
                    <!-- Interactive Progress Charts -->
                    <div class="progress-charts-section">
                        <div class="section-header">
                            <h3>📈 Progress Trends</h3>
                            <div class="chart-controls">
                                <button class="chart-period-btn active" data-period="7">7 Days</button>
                                <button class="chart-period-btn" data-period="30">30 Days</button>
                                <button class="chart-period-btn" data-period="90">90 Days</button>
                            </div>
                        </div>
                        
                        <div class="charts-grid">
                            <div class="chart-container">
                                <div id="risk-trend-chart" class="interactive-chart-wrapper">
                                    <!-- Risk trend chart will be populated -->
                                </div>
                            </div>
                            
                            <div class="chart-container">
                                <div id="mood-trend-chart" class="interactive-chart-wrapper">
                                    <!-- Mood trend chart will be populated -->
                                </div>
                            </div>
                            
                            <div class="chart-container">
                                <div id="nutrition-chart" class="interactive-chart-wrapper">
                                    <!-- Nutrition chart will be populated -->
                                </div>
                            </div>
                            
                            <div class="chart-container">
                                <div id="streak-chart" class="interactive-chart-wrapper">
                                    <!-- Streak chart will be populated -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions Section -->
                    <div class="quick-actions-section">
                        <div id="quick-actions" class="quick-actions-container">
                            <!-- Quick actions will be populated -->
                        </div>
                    </div>
                </div>
            </main>
        </div>`;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', progressHTML);
        this.initializeProgress();
    }

    // Create Enhanced Profile Page
    createProfilePage() {
        const profileHTML = `
        <div id="profile-page" class="page">
            <header class="app-header">
                <div class="container">
                    <h1>Profile & Settings</h1>
                </div>
            </header>
            
            <main class="container">
                <div class="card">
                    <h3>Personal Information</h3>
                    <div class="form-group">
                        <label for="profile-name">Name *</label>
                        <input type="text" id="profile-name" name="name" required 
                               placeholder="Enter your full name" autocomplete="name">
                        <div class="field-error" id="profile-name-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-email">Email Address *</label>
                        <input type="email" id="profile-email" name="email" required 
                               placeholder="Enter your email address" autocomplete="email">
                        <div class="field-error" id="profile-email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-age">Age *</label>
                        <input type="number" id="profile-age" name="age" required 
                               min="13" max="120" placeholder="Enter your age">
                        <div class="field-error" id="profile-age-error"></div>
                    </div>
                    
                    <div class="form-actions">
                        <button id="save-profile" class="btn-primary">
                            <span class="btn-text">Save Profile</span>
                            <div class="btn-spinner" style="display: none;"></div>
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <h3>Notification Preferences</h3>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="daily-reminders" checked>
                                <span class="checkmark"></span>
                                Daily mood check-ins and reminders
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="weekly-nutrition" checked>
                                <span class="checkmark"></span>
                                Weekly nutrition summaries and tips
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="motivational-messages" checked>
                                <span class="checkmark"></span>
                                Personalized motivational messages
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button id="open-notification-settings" class="btn-secondary">
                            <span class="btn-text">Advanced Notification Settings</span>
                        </button>
                        <button id="test-notification" class="btn-secondary">
                            <span class="btn-text">Test Notifications</span>
                        </button>
                    </div>
                    
                    <div class="form-group">
                        <label for="ai-api-key">Gemini AI API Key (Optional)</label>
                        <input type="password" id="ai-api-key" 
                               placeholder="Enter your Gemini API key for enhanced AI features">
                        <small class="form-help">
                            This enables personalized AI insights, meal planning, and emotional support.
                            <a href="#" onclick="alert('Visit Google AI Studio to get your free API key')">Get API Key</a>
                        </small>
                    </div>
                    
                    <div class="form-actions">
                        <button id="save-preferences" class="btn-primary">
                            <span class="btn-text">Save Preferences</span>
                            <div class="btn-spinner" style="display: none;"></div>
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <h3>Account Management</h3>
                    <div class="account-actions">
                        <button id="logout-btn" class="btn-secondary logout-btn">
                            <span>🚪</span> Sign Out
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <h3>Data & Privacy</h3>
                    <div class="data-actions">
                        <button id="export-data" class="btn-secondary">
                            <span>📥</span> Export My Data
                        </button>
                        <button id="clear-data" class="btn-secondary danger-btn">
                            <span>🗑️</span> Clear All Data
                        </button>
                    </div>
                    <small class="privacy-note">
                        Your data is stored locally in your browser. We respect your privacy and don't share your information.
                    </small>
                </div>
            </main>
        </div>`;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', profileHTML);
        this.initializeProfile();
    }

    // Assessment Logic - Integrated with WHO/ADA Risk Assessment Engine
    initializeAssessment() {
        // Initialize the WHO/ADA Risk Assessment Engine
        console.log('Initializing WHO/ADA Risk Assessment...');
        
        // Wait for the risk assessment engine to be available
        if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
            // Start the WHO/ADA compliant assessment
            window.riskAssessment.startAssessment();
        } else {
            // Retry after a short delay if the engine isn't ready yet
            setTimeout(() => {
                if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
                    window.riskAssessment.startAssessment();
                } else {
                    console.error('Risk Assessment Engine not available');
                    this.showAssessmentError();
                }
            }, 500);
        }
    }

    showAssessmentError() {
        const assessmentContent = document.getElementById('assessment-content');
        if (assessmentContent) {
            assessmentContent.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Assessment Temporarily Unavailable</h3>
                    <p>The WHO/ADA Risk Assessment tool is currently loading. Please try again in a moment.</p>
                    <button class="btn-primary" onclick="window.glucoApp.initializeAssessment()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }



    // Nutrition Logic
    initializeNutrition() {
        document.getElementById('generate-meal-plan').addEventListener('click', () => this.generateMealPlan());
    }

    async generateMealPlan() {
        const preferences = {
            cuisine: document.getElementById('cuisine-select').value,
            restrictions: []
        };

        // Collect dietary restrictions
        if (document.getElementById('vegetarian').checked) preferences.restrictions.push('vegetarian');
        if (document.getElementById('vegan').checked) preferences.restrictions.push('vegan');
        if (document.getElementById('gluten-free').checked) preferences.restrictions.push('gluten-free');
        if (document.getElementById('dairy-free').checked) preferences.restrictions.push('dairy-free');

        const container = document.getElementById('meal-plan-container');
        container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating your personalized meal plan...</p></div>';

        try {
            const mealPlan = await window.aiService.generateMealPlan(preferences);
            this.displayMealPlan(mealPlan);
            
            // Save meal plan
            await window.kiroDb.saveNutritionPlan(1, {
                preferences,
                mealPlan,
                planType: 'diabetic-friendly'
            });
        } catch (error) {
            console.error('Error generating meal plan:', error);
            this.displayMealPlan(this.getFallbackMealPlan());
        }
    }

    displayMealPlan(mealPlan) {
        const container = document.getElementById('meal-plan-container');
        
        container.innerHTML = mealPlan.map(day => `
            <div class="meal-plan">
                <div class="meal-plan-header">
                    <div class="meal-plan-day">Day ${day.day}</div>
                </div>
                <div class="meal-plan-content">
                    ${Object.entries(day.meals).map(([mealType, items]) => `
                        <div class="meal">
                            <div class="meal-type">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</div>
                            <ul class="meal-items">
                                ${items.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getFallbackMealPlan() {
        return [
            {
                day: 1,
                meals: {
                    breakfast: ["Steel-cut oatmeal with berries", "Greek yogurt", "Green tea"],
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
                    breakfast: ["Smoothie with spinach and berries", "Chia seeds", "Water"],
                    lunch: ["Turkey and avocado wrap", "Side salad", "Herbal tea"],
                    dinner: ["Grilled chicken with roasted vegetables", "Sweet potato", "Water"],
                    snack: ["Greek yogurt with cinnamon"]
                }
            }
        ];
    }

    // Progress Logic
    loadProgress() {
        // Initialize the progress dashboard with current user
        if (window.progressDashboard && this.userData.id) {
            window.progressDashboard.setCurrentUser(this.userData.id);
            window.progressDashboard.loadDashboard();
        } else {
            // Fallback to basic progress loading
            this.initializeProgress();
        }
    }

    loadDoctorReport() {
        // Initialize doctor report with current user
        if (window.doctorReportUI && this.userData.id) {
            window.doctorReportUI.setCurrentUser(this.userData);
        }
    }

    initializeProgress() {
        this.loadProgressData();
    }

    async loadProgressData() {
        try {
            const progressData = await window.kiroDb.generateHealthReport(1, 30);
            this.displayProgressCharts(progressData);
            this.generateProgressInsights(progressData);
            this.displayAchievements(progressData);
        } catch (error) {
            console.error('Error loading progress data:', error);
            this.displayEmptyProgress();
        }
    }

    displayProgressCharts(data) {
        // Display mood chart
        const moodChart = document.getElementById('mood-chart');
        if (data.moods && data.moods.length > 0) {
            moodChart.innerHTML = data.moods.slice(0, 7).map(mood => `
                <div class="mood-day">
                    <div class="mood-emoji">${this.getMoodEmoji(mood.mood)}</div>
                    <div class="mood-date">${new Date(mood.date).getDate()}</div>
                </div>
            `).join('');
        } else {
            moodChart.innerHTML = '<p>No mood data available. Start tracking your daily mood!</p>';
        }

        // Display risk chart (simplified)
        const riskChart = document.getElementById('risk-chart');
        if (data.assessments && data.assessments.length > 0) {
            const maxScore = Math.max(...data.assessments.map(a => a.riskScore));
            riskChart.innerHTML = data.assessments.map(assessment => {
                const height = (assessment.riskScore / maxScore) * 100;
                return `<div class="chart-bar" style="height: ${height}%" title="Risk Score: ${assessment.riskScore}"></div>`;
            }).join('');
        } else {
            riskChart.innerHTML = '<p>Complete your first risk assessment to see trends!</p>';
        }
    }

    getMoodEmoji(mood) {
        const emojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
        return emojis[mood] || '😐';
    }

    async generateProgressInsights(data) {
        const insightsContainer = document.getElementById('progress-insights');
        
        try {
            const insights = await window.aiService.analyzeProgress(data);
            insightsContainer.innerHTML = `<p>${insights}</p>`;
        } catch (error) {
            const fallbackInsight = this.generateFallbackInsights(data);
            insightsContainer.innerHTML = `<p>${fallbackInsight}</p>`;
        }
    }

    generateFallbackInsights(data) {
        const insights = [];
        
        if (data.summary.totalMoodEntries > 0) {
            const avgMood = data.summary.averageMood;
            if (avgMood >= 4) {
                insights.push("Your mood has been consistently positive - great for overall health!");
            } else if (avgMood < 3) {
                insights.push("Consider stress management techniques to support your health journey.");
            }
        }

        if (data.summary.latestRiskScore) {
            insights.push(`Your current risk score is ${data.summary.latestRiskScore}. Keep up your healthy habits!`);
        }

        return insights.length > 0 ? insights.join(' ') : "Keep tracking your health metrics to see personalized insights here.";
    }

    displayAchievements(data) {
        const achievementsContainer = document.getElementById('achievements-list');
        const achievements = [];

        if (data.assessments.length > 0) {
            achievements.push("🎯 Completed first risk assessment");
        }

        if (data.summary.totalMoodEntries >= 7) {
            achievements.push("💙 Tracked mood for a week");
        }

        if (data.summary.totalMoodEntries >= 30) {
            achievements.push("🏆 Consistent mood tracking champion");
        }

        if (achievements.length > 0) {
            achievementsContainer.innerHTML = achievements.map(achievement => 
                `<div class="achievement">${achievement}</div>`
            ).join('');
        }
    }

    displayEmptyProgress() {
        document.getElementById('progress-insights').innerHTML = 
            '<p>Start using GlucoBalance to see your personalized health insights here!</p>';
    }

    // Enhanced Profile Logic with Authentication Integration
    initializeProfile() {
        this.loadProfileData();
        
        document.getElementById('save-profile').addEventListener('click', () => this.saveProfile());
        document.getElementById('save-preferences').addEventListener('click', () => this.savePreferences());
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('clear-data').addEventListener('click', () => this.clearData());
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());
        
        // Notification system event listeners
        document.getElementById('open-notification-settings')?.addEventListener('click', () => {
            if (window.notificationUI) {
                window.notificationUI.showNotificationPreferences();
            }
        });
        
        document.getElementById('test-notification')?.addEventListener('click', () => {
            if (window.notificationUI) {
                window.notificationUI.testNotification('motivational');
            }
        });
        
        // Setup real-time validation
        this.setupProfileValidation();
    }

    setupProfileValidation() {
        const profileInputs = ['profile-name', 'profile-email', 'profile-age'];
        
        profileInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => this.validateProfileField(input));
                input.addEventListener('input', () => this.clearProfileFieldError(input));
            }
        });
    }

    validateProfileField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.id) {
            case 'profile-name':
                if (!value) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters long';
                    isValid = false;
                } else if (value.length > 50) {
                    errorMessage = 'Name must be less than 50 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                    isValid = false;
                }
                break;
                
            case 'profile-email':
                if (!value) {
                    errorMessage = 'Email address is required';
                    isValid = false;
                } else if (!this.isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                } else if (value.length > 254) {
                    errorMessage = 'Email address is too long';
                    isValid = false;
                }
                break;
                
            case 'profile-age':
                if (!value) {
                    errorMessage = 'Age is required';
                    isValid = false;
                } else {
                    const age = parseInt(value);
                    if (isNaN(age)) {
                        errorMessage = 'Please enter a valid age';
                        isValid = false;
                    } else if (age < 13) {
                        errorMessage = 'Age must be at least 13';
                        isValid = false;
                    } else if (age > 120) {
                        errorMessage = 'Please enter a valid age';
                        isValid = false;
                    }
                }
                break;
        }

        this.setProfileFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    setProfileFieldError(field, message) {
        const errorId = field.id + '-error';
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
        
        if (message) {
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    }

    clearProfileFieldError(field) {
        this.setProfileFieldError(field, '');
    }

    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
    }

    loadProfileData() {
        // Load from auth service if available
        if (window.authService && window.authService.isAuthenticated()) {
            const currentUser = window.authService.getCurrentUser();
            if (currentUser) {
                document.getElementById('profile-name').value = currentUser.name || '';
                document.getElementById('profile-email').value = currentUser.email || '';
                document.getElementById('profile-age').value = currentUser.age || '';
                
                // Load preferences from user object
                if (currentUser.preferences) {
                    const prefs = currentUser.preferences;
                    if (prefs.notifications) {
                        document.getElementById('daily-reminders').checked = prefs.notifications.dailyReminders !== false;
                        document.getElementById('weekly-nutrition').checked = prefs.notifications.weeklyNutrition !== false;
                        document.getElementById('motivational-messages').checked = prefs.notifications.motivationalMessages !== false;
                    }
                }
                return;
            }
        }
        
        // Fallback to local userData
        document.getElementById('profile-name').value = this.userData.name || '';
        document.getElementById('profile-email').value = this.userData.email || '';
        document.getElementById('profile-age').value = this.userData.age || '';
        
        // Load preferences
        document.getElementById('daily-reminders').checked = this.userData.dailyReminders !== false;
        document.getElementById('weekly-nutrition').checked = this.userData.weeklyNutrition !== false;
        document.getElementById('motivational-messages').checked = this.userData.motivationalMessages !== false;
    }

    async saveProfile() {
        try {
            // Validate all fields first
            const nameField = document.getElementById('profile-name');
            const emailField = document.getElementById('profile-email');
            const ageField = document.getElementById('profile-age');
            
            const isNameValid = this.validateProfileField(nameField);
            const isEmailValid = this.validateProfileField(emailField);
            const isAgeValid = this.validateProfileField(ageField);
            
            if (!isNameValid || !isEmailValid || !isAgeValid) {
                this.showNotification('Please fix the errors before saving', 'error');
                return;
            }
            
            const updates = {
                name: nameField.value.trim(),
                email: emailField.value.trim(),
                age: parseInt(ageField.value)
            };
            
            // Use auth service if available
            if (window.authService && window.authService.isAuthenticated()) {
                const result = await window.authService.updateProfile(updates);
                
                if (result.success) {
                    this.showNotification('Profile updated successfully!', 'success');
                    
                    // Update local userData as well for compatibility
                    this.userData = { ...this.userData, ...updates };
                    await this.saveUserData();
                } else {
                    this.showNotification(result.error || 'Failed to update profile', 'error');
                }
            } else {
                // Fallback to local storage
                this.userData = { ...this.userData, ...updates };
                await this.saveUserData();
                this.showNotification('Profile saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Profile save error:', error);
            this.showNotification('Error saving profile. Please try again.', 'error');
        }
    }

    async handleLogout() {
        try {
            if (window.authService) {
                const result = await window.authService.logout();
                if (result.success) {
                    // Clear local data
                    this.userData = {};
                    
                    // Navigate to landing page
                    this.navigateTo('landing');
                    document.getElementById('bottom-nav').style.display = 'none';
                    
                    this.showNotification('Logged out successfully', 'success');
                } else {
                    this.showNotification('Error logging out', 'error');
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error logging out', 'error');
        }
    }

    async savePreferences() {
        this.userData.dailyReminders = document.getElementById('daily-reminders').checked;
        this.userData.weeklyNutrition = document.getElementById('weekly-nutrition').checked;
        this.userData.motivationalMessages = document.getElementById('motivational-messages').checked;
        
        const apiKey = document.getElementById('ai-api-key').value;
        if (apiKey) {
            await window.aiService.initializeAI(apiKey);
            this.userData.hasAIEnabled = true;
        }
        
        this.saveUserData();
        this.showNotification('Preferences saved successfully!', 'success');
    }

    async exportData() {
        try {
            this.showNotification('Preparing your data export...', 'info');
            
            let exportData = {};
            
            // Use auth service if available
            if (window.authService && window.authService.isAuthenticated()) {
                const result = await window.authService.exportUserData();
                if (result.success) {
                    exportData = result.data;
                } else {
                    throw new Error(result.error || 'Failed to export data from auth service');
                }
            } else {
                // Fallback to local data
                const healthReport = window.kiroDb ? 
                    await window.kiroDb.generateHealthReport(1, 365) : 
                    { message: 'Database not available' };
                    
                exportData = {
                    user: this.userData,
                    healthData: healthReport,
                    exportDate: new Date().toISOString(),
                    source: 'local_storage'
                };
            }
            
            // Create downloadable file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `glucobalance-data-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting data. Please try again.', 'error');
        }
    }

    async clearData() {
        const confirmMessage = 'Are you sure you want to permanently delete all your data?\n\n' +
                              'This will remove:\n' +
                              '• Your profile information\n' +
                              '• All health assessments\n' +
                              '• Mood tracking history\n' +
                              '• Nutrition plans\n' +
                              '• All preferences and settings\n\n' +
                              'This action cannot be undone.';
                              
        if (confirm(confirmMessage)) {
            try {
                // Use auth service if available
                if (window.authService && window.authService.isAuthenticated()) {
                    const result = await window.authService.clearAllUserData();
                    if (result.success) {
                        this.showNotification('All data cleared successfully.', 'success');
                    } else {
                        throw new Error(result.error || 'Failed to clear data');
                    }
                } else {
                    // Fallback to manual cleanup
                    localStorage.clear();
                    this.userData = {};
                    this.showNotification('All data cleared successfully.', 'success');
                }
                
                // Reload the page after a short delay
                setTimeout(() => {
                    location.reload();
                }, 1500);
                
            } catch (error) {
                console.error('Clear data error:', error);
                this.showNotification('Error clearing data. Please try again.', 'error');
            }
        }
    }

    updateNutritionSummary() {
        const nutritionSummary = document.getElementById('nutrition-summary');
        if (this.userData.lastMealPlan) {
            nutritionSummary.innerHTML = `
                <p>Last meal plan generated: ${new Date(this.userData.lastMealPlan).toLocaleDateString()}</p>
                <button class="btn-secondary" id="nutrition-btn">View Current Plan</button>
            `;
        }
    }

    async updateMoodDisplay() {
        if (window.mentalHealthUI) {
            await window.mentalHealthUI.updateMoodDisplay();
        } else {
            // Fallback to original implementation
            const today = new Date().toISOString().split('T')[0];
            if (this.userData.moods && this.userData.moods[today]) {
                const mood = this.userData.moods[today];
                document.querySelector(`[data-mood="${mood}"]`)?.classList.add('selected');
            }
        }
    }
}
//# sourceMappingURL=app.js.map