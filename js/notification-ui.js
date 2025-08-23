// GlucoBalance - Notification UI Management
class NotificationUI {
    constructor() {
        this.notificationService = window.notificationService;
        this.container = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for notification service to initialize
            if (!this.notificationService.initialized) {
                setTimeout(() => this.init(), 100);
                return;
            }

            this.createNotificationContainer();
            this.setupEventListeners();
            this.initialized = true;
            console.log('Notification UI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize notification UI:', error);
        }
    }

    createNotificationContainer() {
        // Create in-app notification container
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);

        // Add CSS styles
        this.addNotificationStyles();
    }

    addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 350px;
                pointer-events: none;
            }

            .in-app-notification {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                padding: 16px;
                pointer-events: auto;
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
                position: relative;
            }

            .in-app-notification.show {
                transform: translateX(0);
            }

            .in-app-notification.hide {
                transform: translateX(100%);
            }

            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: 600;
                color: #007FFF;
                font-size: 14px;
                margin: 0;
            }

            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .notification-close:hover {
                color: #333;
            }

            .notification-body {
                color: #333;
                font-size: 13px;
                line-height: 1.4;
                margin-bottom: 12px;
            }

            .notification-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }

            .notification-btn {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .notification-btn.primary {
                background: #007FFF;
                color: white;
            }

            .notification-btn.primary:hover {
                background: #0066CC;
            }

            .notification-btn.secondary {
                background: #f5f5f5;
                color: #333;
            }

            .notification-btn.secondary:hover {
                background: #e0e0e0;
            }

            .notification-preferences-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .notification-preferences-content {
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }

            .notification-preferences-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e0e0e0;
            }

            .notification-preferences-title {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                margin: 0;
            }

            .notification-setting {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #f0f0f0;
            }

            .notification-setting:last-child {
                border-bottom: none;
            }

            .notification-setting-info {
                flex: 1;
            }

            .notification-setting-label {
                font-weight: 500;
                color: #333;
                margin-bottom: 4px;
            }

            .notification-setting-description {
                font-size: 13px;
                color: #666;
                line-height: 1.4;
            }

            .notification-toggle {
                position: relative;
                width: 44px;
                height: 24px;
                background: #ccc;
                border-radius: 12px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .notification-toggle.active {
                background: #007FFF;
            }

            .notification-toggle::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.2s;
            }

            .notification-toggle.active::after {
                transform: translateX(20px);
            }

            .time-input-group {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
            }

            .time-input {
                padding: 6px 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
                width: 80px;
            }

            .frequency-select {
                padding: 6px 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
                background: white;
            }

            .notification-optimization-banner {
                background: linear-gradient(135deg, #007FFF, #0066CC);
                color: white;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .notification-optimization-banner h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
            }

            .optimization-suggestion {
                background: rgba(255, 255, 255, 0.1);
                padding: 8px 12px;
                border-radius: 4px;
                margin-bottom: 8px;
                font-size: 13px;
            }

            .optimization-suggestion.high {
                border-left: 4px solid #FFD700;
            }

            .optimization-suggestion.medium {
                border-left: 4px solid #FFA500;
            }

            .optimization-suggestion.low {
                border-left: 4px solid #90EE90;
            }

            .ai-recommendations-body {
                max-height: 60vh;
                overflow-y: auto;
            }

            .recommendation-section {
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px solid #f0f0f0;
            }

            .recommendation-section:last-child {
                border-bottom: none;
            }

            .recommendation-section h4 {
                color: #007FFF;
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
            }

            .current-settings, .recommended-settings {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 6px;
                font-size: 13px;
            }

            .current-settings div, .recommended-settings div {
                margin-bottom: 6px;
            }

            .current-settings div:last-child, .recommended-settings div:last-child {
                margin-bottom: 0;
            }

            .recommendation-item {
                background: #e8f4fd;
                padding: 8px 12px;
                border-radius: 4px;
                margin-bottom: 8px;
                border-left: 3px solid #007FFF;
            }

            .recommendation-item:last-child {
                margin-bottom: 0;
            }

            .ai-reasoning {
                background: #f0f8ff;
                padding: 12px;
                border-radius: 6px;
                font-size: 13px;
                line-height: 1.4;
                font-style: italic;
                color: #555;
            }

            @media (max-width: 768px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .notification-preferences-content {
                    margin: 20px;
                    width: calc(100% - 40px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Listen for notification events
        document.addEventListener('showInAppNotification', (event) => {
            this.showInAppNotification(event.detail);
        });

        // Listen for notification permission changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkPendingNotifications();
            }
        });
    }

    // Show in-app notification
    showInAppNotification(notificationData) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${notificationData.title}</h4>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
            <div class="notification-body">${notificationData.body}</div>
            <div class="notification-actions">
                ${notificationData.actions ? this.renderNotificationActions(notificationData.actions) : ''}
                <button class="notification-btn secondary">Dismiss</button>
            </div>
        `;

        // Add event listeners
        const closeBtn = notification.querySelector('.notification-close');
        const dismissBtn = notification.querySelector('.notification-btn.secondary');
        
        const closeNotification = () => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
            
            // Track engagement
            if (this.notificationService) {
                this.notificationService.trackNotificationEngagement(
                    notificationData.id, 
                    'dismissed'
                );
            }
        };

        closeBtn.addEventListener('click', closeNotification);
        dismissBtn.addEventListener('click', closeNotification);

        // Handle action buttons
        const actionBtns = notification.querySelectorAll('.notification-btn.primary');
        actionBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (notificationData.actions && notificationData.actions[index]) {
                    this.handleNotificationAction(notificationData.actions[index], notificationData);
                }
                closeNotification();
            });
        });

        // Add to container and show
        this.container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                closeNotification();
            }
        }, 8000);

        // Track that notification was shown
        if (this.notificationService) {
            this.notificationService.trackNotificationEngagement(
                notificationData.id, 
                'delivered'
            );
        }
    }

    renderNotificationActions(actions) {
        return actions.map(action => 
            `<button class="notification-btn primary">${action.label}</button>`
        ).join('');
    }

    handleNotificationAction(action, notificationData) {
        // Track engagement
        if (this.notificationService) {
            this.notificationService.trackNotificationEngagement(
                notificationData.id, 
                'clicked'
            );
        }

        // Handle different action types
        switch (action.type) {
            case 'navigate':
                window.location.hash = action.target;
                break;
            case 'function':
                if (typeof action.handler === 'function') {
                    action.handler();
                }
                break;
            case 'external':
                window.open(action.url, '_blank');
                break;
            default:
                console.warn('Unknown notification action type:', action.type);
        }
    }

    // Show notification preferences modal
    showNotificationPreferences() {
        const modal = document.createElement('div');
        modal.className = 'notification-preferences-modal';
        modal.innerHTML = `
            <div class="notification-preferences-content">
                <div class="notification-preferences-header">
                    <h3 class="notification-preferences-title">Notification Preferences</h3>
                    <button class="notification-close" aria-label="Close preferences">&times;</button>
                </div>
                <div id="notification-preferences-body">
                    <div class="loading">Loading preferences...</div>
                </div>
                <div class="notification-actions" style="margin-top: 20px; justify-content: flex-end;">
                    <button class="notification-btn secondary" id="cancel-preferences">Cancel</button>
                    <button class="notification-btn primary" id="save-preferences">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Load and render preferences
        this.loadAndRenderPreferences(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.notification-close');
        const cancelBtn = modal.querySelector('#cancel-preferences');
        const saveBtn = modal.querySelector('#save-preferences');

        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        saveBtn.addEventListener('click', () => {
            this.saveNotificationPreferences(modal);
            closeModal();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    async loadAndRenderPreferences(modal) {
        try {
            const user = await this.notificationService.getCurrentUser();
            const preferences = await this.notificationService.preferenceManager.getUserPreferences(user.id);
            const analytics = await this.notificationService.preferenceManager.getPreferenceAnalytics(user.id);
            const body = modal.querySelector('#notification-preferences-body');
            
            body.innerHTML = `
                ${analytics.optimizationOpportunities?.length > 0 ? `
                <div class="notification-optimization-banner">
                    <h4>💡 Optimization Suggestions</h4>
                    ${analytics.optimizationOpportunities.map(opp => `
                        <div class="optimization-suggestion ${opp.priority}">
                            <strong>${opp.type.replace('_', ' ').toUpperCase()}:</strong> ${opp.suggestion}
                        </div>
                    `).join('')}
                    <button class="notification-btn primary" id="apply-ai-recommendations">Apply AI Recommendations</button>
                </div>
                ` : ''}
                
                <div class="notification-setting">
                    <div class="notification-setting-info">
                        <div class="notification-setting-label">Daily Reminders</div>
                        <div class="notification-setting-description">
                            Get daily reminders for health assessments and mood check-ins
                            ${analytics.engagement?.clickRate ? `<br><small>Current engagement: ${Math.round(analytics.engagement.clickRate)}% click rate</small>` : ''}
                        </div>
                        <div class="time-input-group" style="display: ${preferences.dailyReminders ? 'flex' : 'none'};">
                            <label>Assessment time:</label>
                            <input type="time" class="time-input" id="assessment-time" value="${preferences.assessmentReminderTime || '09:00'}">
                            <label>Mood time:</label>
                            <input type="time" class="time-input" id="mood-time" value="${preferences.moodReminderTime || '20:00'}">
                        </div>
                    </div>
                    <div class="notification-toggle ${preferences.dailyReminders ? 'active' : ''}" data-setting="dailyReminders"></div>
                </div>

                <div class="notification-setting">
                    <div class="notification-setting-info">
                        <div class="notification-setting-label">Weekly Summaries</div>
                        <div class="notification-setting-description">
                            Receive weekly nutrition adherence summaries and progress updates
                        </div>
                        <div class="time-input-group" style="display: ${preferences.weeklySummaries ? 'flex' : 'none'};">
                            <label>Summary time:</label>
                            <input type="text" class="time-input" id="weekly-time" value="${preferences.weeklySummaryTime || 'Sunday 18:00'}" placeholder="Day HH:MM">
                        </div>
                    </div>
                    <div class="notification-toggle ${preferences.weeklySummaries ? 'active' : ''}" data-setting="weeklySummaries"></div>
                </div>

                <div class="notification-setting">
                    <div class="notification-setting-info">
                        <div class="notification-setting-label">Motivational Messages</div>
                        <div class="notification-setting-description">
                            Get AI-powered personalized motivational messages based on your progress
                        </div>
                    </div>
                    <div class="notification-toggle ${preferences.motivationalMessages ? 'active' : ''}" data-setting="motivationalMessages"></div>
                </div>

                <div class="notification-setting">
                    <div class="notification-setting-info">
                        <div class="notification-setting-label">Re-engagement Reminders</div>
                        <div class="notification-setting-description">
                            Gentle reminders to return to the app if you haven't used it recently
                        </div>
                    </div>
                    <div class="notification-toggle ${preferences.reEngagement ? 'active' : ''}" data-setting="reEngagement"></div>
                </div>

                <div class="notification-setting">
                    <div class="notification-setting-info">
                        <div class="notification-setting-label">Notification Frequency</div>
                        <div class="notification-setting-description">
                            Control how often you receive notifications
                        </div>
                        <select class="frequency-select" id="notification-frequency">
                            <option value="low" ${preferences.frequency === 'low' ? 'selected' : ''}>Low (Essential only)</option>
                            <option value="normal" ${preferences.frequency === 'normal' ? 'selected' : ''}>Normal (Recommended)</option>
                            <option value="high" ${preferences.frequency === 'high' ? 'selected' : ''}>High (All notifications)</option>
                        </select>
                    </div>
                </div>

                <div class="notification-setting">
                    <div class="notification-setting-info">
                        <div class="notification-setting-label">Browser Notifications</div>
                        <div class="notification-setting-description">
                            Enable browser notifications (requires permission)
                        </div>
                        <button class="notification-btn primary" id="request-permission" style="margin-top: 8px;">
                            ${Notification.permission === 'granted' ? 'Enabled' : 'Enable Notifications'}
                        </button>
                    </div>
                </div>

                <div class="notification-setting">
                    <div class="notification-setting-info">
                        <div class="notification-setting-label">AI-Powered Optimization</div>
                        <div class="notification-setting-description">
                            Let AI analyze your engagement patterns and optimize notification timing and content
                            ${analytics.engagement ? `<br><small>Last optimization: ${preferences.lastOptimization ? new Date(preferences.lastOptimization).toLocaleDateString() : 'Never'}</small>` : ''}
                        </div>
                        <button class="notification-btn primary" id="generate-ai-recommendations" style="margin-top: 8px;">
                            Generate AI Recommendations
                        </button>
                    </div>
                </div>
            `;

            // Add toggle event listeners
            const toggles = body.querySelectorAll('.notification-toggle');
            toggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    toggle.classList.toggle('active');
                    
                    // Show/hide time inputs
                    const setting = toggle.dataset.setting;
                    const timeGroup = toggle.parentNode.querySelector('.time-input-group');
                    if (timeGroup) {
                        timeGroup.style.display = toggle.classList.contains('active') ? 'flex' : 'none';
                    }
                });
            });

            // Permission request button
            const permissionBtn = body.querySelector('#request-permission');
            if (permissionBtn && Notification.permission !== 'granted') {
                permissionBtn.addEventListener('click', async () => {
                    const granted = await this.notificationService.requestNotificationPermission();
                    if (granted) {
                        permissionBtn.textContent = 'Enabled';
                        permissionBtn.disabled = true;
                    }
                });
            }

            // AI recommendations button
            const aiRecommendationsBtn = body.querySelector('#generate-ai-recommendations');
            if (aiRecommendationsBtn) {
                aiRecommendationsBtn.addEventListener('click', async () => {
                    aiRecommendationsBtn.textContent = 'Generating...';
                    aiRecommendationsBtn.disabled = true;
                    
                    try {
                        const recommendations = await this.notificationService.preferenceManager.generatePersonalizedPreferences(user.id);
                        this.showAIRecommendations(recommendations);
                    } catch (error) {
                        console.error('Failed to generate AI recommendations:', error);
                        this.showInAppNotification({
                            id: 'ai_recommendations_error',
                            title: 'Error Generating Recommendations ❌',
                            body: 'Failed to generate AI recommendations. Please try again.'
                        });
                    } finally {
                        aiRecommendationsBtn.textContent = 'Generate AI Recommendations';
                        aiRecommendationsBtn.disabled = false;
                    }
                });
            }

            // Apply AI recommendations button
            const applyAIBtn = body.querySelector('#apply-ai-recommendations');
            if (applyAIBtn) {
                applyAIBtn.addEventListener('click', async () => {
                    try {
                        const recommendations = await this.notificationService.preferenceManager.generatePersonalizedPreferences(user.id);
                        await this.notificationService.preferenceManager.applyRecommendedPreferences(user.id, recommendations.recommended);
                        
                        this.showInAppNotification({
                            id: 'ai_recommendations_applied',
                            title: 'AI Recommendations Applied! ✅',
                            body: 'Your notification preferences have been optimized based on your engagement patterns.'
                        });
                        
                        // Reload the preferences modal
                        setTimeout(() => {
                            modal.querySelector('.notification-close').click();
                            this.showNotificationPreferences();
                        }, 2000);
                        
                    } catch (error) {
                        console.error('Failed to apply AI recommendations:', error);
                        this.showInAppNotification({
                            id: 'ai_recommendations_error',
                            title: 'Error Applying Recommendations ❌',
                            body: 'Failed to apply AI recommendations. Please try again.'
                        });
                    }
                });
            }

        } catch (error) {
            console.error('Failed to load notification preferences:', error);
            modal.querySelector('#notification-preferences-body').innerHTML = 
                '<div class="error">Failed to load preferences. Please try again.</div>';
        }
    }

    async saveNotificationPreferences(modal) {
        try {
            const body = modal.querySelector('#notification-preferences-body');
            const toggles = body.querySelectorAll('.notification-toggle');
            const preferences = {};

            // Get toggle states
            toggles.forEach(toggle => {
                const setting = toggle.dataset.setting;
                preferences[setting] = toggle.classList.contains('active');
            });

            // Get time inputs
            const assessmentTime = body.querySelector('#assessment-time')?.value;
            const moodTime = body.querySelector('#mood-time')?.value;
            const weeklyTime = body.querySelector('#weekly-time')?.value;
            const frequency = body.querySelector('#notification-frequency')?.value;

            if (assessmentTime) preferences.assessmentReminderTime = assessmentTime;
            if (moodTime) preferences.moodReminderTime = moodTime;
            if (weeklyTime) preferences.weeklySummaryTime = weeklyTime;
            if (frequency) preferences.frequency = frequency;

            // Save preferences using the preference manager
            const user = await this.notificationService.getCurrentUser();
            if (user) {
                await this.notificationService.preferenceManager.updateUserPreferences(user.id, preferences);

                // Show success message
                this.showInAppNotification({
                    id: 'preferences_saved',
                    title: 'Preferences Saved! ✅',
                    body: 'Your notification preferences have been updated successfully.'
                });
            }

        } catch (error) {
            console.error('Failed to save notification preferences:', error);
            this.showInAppNotification({
                id: 'preferences_error',
                title: 'Error Saving Preferences ❌',
                body: 'Failed to save your preferences. Please try again.'
            });
        }
    }

    // Test notification functionality
    async testNotification(type = 'motivational') {
        try {
            const testNotification = await this.notificationService.generatePersonalizedNotification(type, {
                test: true,
                userName: 'Test User'
            });

            this.showInAppNotification({
                id: 'test_notification',
                title: testNotification.title,
                body: testNotification.body,
                actions: [{
                    label: 'Go to Dashboard',
                    type: 'navigate',
                    target: '#dashboard'
                }]
            });

        } catch (error) {
            console.error('Failed to test notification:', error);
            this.showInAppNotification({
                id: 'test_error',
                title: 'Test Failed ❌',
                body: 'Unable to generate test notification. Please check your AI configuration.'
            });
        }
    }

    // Check for pending notifications when app becomes visible
    async checkPendingNotifications() {
        // This would check for any notifications that should be shown
        // when the user returns to the app
        try {
            const user = await this.notificationService.getCurrentUser();
            if (!user) return;

            const lastActivity = await this.notificationService.getLastUserActivity(user.id);
            const daysSinceActivity = this.notificationService.calculateDaysSince(lastActivity);

            // Show re-engagement notification if user has been inactive
            if (daysSinceActivity >= 1 && daysSinceActivity <= 7) {
                const reEngagementNotification = await this.notificationService.generatePersonalizedNotification('re_engagement', {
                    daysInactive: daysSinceActivity,
                    lastActivity: lastActivity
                });

                this.showInAppNotification({
                    id: 'welcome_back',
                    title: reEngagementNotification.title,
                    body: reEngagementNotification.body,
                    actions: [{
                        label: 'Continue Journey',
                        type: 'navigate',
                        target: '#dashboard'
                    }]
                });
            }

        } catch (error) {
            console.error('Failed to check pending notifications:', error);
        }
    }

    // Public methods for integration with other components
    async sendDailyAssessmentReminder() {
        const notification = await this.notificationService.generatePersonalizedNotification('daily_assessment');
        await this.notificationService.sendNotification({
            ...notification,
            type: 'daily_assessment'
        });
    }

    async sendDailyMoodReminder() {
        const notification = await this.notificationService.generatePersonalizedNotification('daily_mood');
        await this.notificationService.sendNotification({
            ...notification,
            type: 'daily_mood'
        });
    }

    async sendWeeklyNutritionSummary() {
        const notification = await this.notificationService.generatePersonalizedNotification('weekly_nutrition_summary');
        await this.notificationService.sendNotification({
            ...notification,
            type: 'weekly_nutrition_summary'
        });
    }

    async sendMotivationalMessage(context = {}) {
        const notification = await this.notificationService.generatePersonalizedNotification('motivational', context);
        this.showInAppNotification({
            id: 'motivational_' + Date.now(),
            title: notification.title,
            body: notification.body
        });
    }

    showAIRecommendations(recommendations) {
        const modal = document.createElement('div');
        modal.className = 'notification-preferences-modal';
        modal.innerHTML = `
            <div class="notification-preferences-content">
                <div class="notification-preferences-header">
                    <h3 class="notification-preferences-title">AI-Powered Recommendations</h3>
                    <button class="notification-close" aria-label="Close recommendations">&times;</button>
                </div>
                <div class="ai-recommendations-body">
                    <div class="recommendation-section">
                        <h4>Current Settings</h4>
                        <div class="current-settings">
                            <div>Daily Reminders: ${recommendations.current.dailyReminders ? 'Enabled' : 'Disabled'}</div>
                            <div>Assessment Time: ${recommendations.current.assessmentReminderTime || 'Not set'}</div>
                            <div>Mood Time: ${recommendations.current.moodReminderTime || 'Not set'}</div>
                            <div>Frequency: ${recommendations.current.frequency || 'Normal'}</div>
                        </div>
                    </div>
                    
                    <div class="recommendation-section">
                        <h4>AI Recommendations</h4>
                        <div class="recommended-settings">
                            ${Object.keys(recommendations.recommended).length > 0 ? 
                                Object.entries(recommendations.recommended).map(([key, value]) => 
                                    `<div class="recommendation-item">
                                        <strong>${key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> ${value}
                                    </div>`
                                ).join('') : 
                                '<div>No specific recommendations at this time. Your current settings appear optimal!</div>'
                            }
                        </div>
                    </div>
                    
                    <div class="recommendation-section">
                        <h4>Reasoning</h4>
                        <div class="ai-reasoning">
                            ${recommendations.reasoning || 'Based on your engagement patterns and usage history.'}
                        </div>
                    </div>
                </div>
                <div class="notification-actions" style="margin-top: 20px; justify-content: flex-end;">
                    <button class="notification-btn secondary" id="close-recommendations">Close</button>
                    ${Object.keys(recommendations.recommended).length > 0 ? 
                        '<button class="notification-btn primary" id="apply-recommendations">Apply Recommendations</button>' : 
                        ''
                    }
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.notification-close');
        const closeBtn2 = modal.querySelector('#close-recommendations');
        const applyBtn = modal.querySelector('#apply-recommendations');

        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', closeModal);
        closeBtn2.addEventListener('click', closeModal);
        
        if (applyBtn) {
            applyBtn.addEventListener('click', async () => {
                try {
                    const user = await this.notificationService.getCurrentUser();
                    await this.notificationService.preferenceManager.applyRecommendedPreferences(user.id, recommendations.recommended);
                    
                    this.showInAppNotification({
                        id: 'recommendations_applied',
                        title: 'Recommendations Applied! ✅',
                        body: 'Your notification preferences have been updated with AI recommendations.'
                    });
                    
                    closeModal();
                } catch (error) {
                    console.error('Failed to apply recommendations:', error);
                    this.showInAppNotification({
                        id: 'recommendations_error',
                        title: 'Error Applying Recommendations ❌',
                        body: 'Failed to apply recommendations. Please try again.'
                    });
                }
            });
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Initialize notification UI
window.notificationUI = new NotificationUI();