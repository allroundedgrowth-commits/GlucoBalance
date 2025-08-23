// GlucoBalance - Enhanced AI-Powered Notification and Engagement System
// Task 16: Build adaptive notification system with engagement tracking

class NotificationService {
    constructor() {
        this.db = window.kiroDatabase;
        this.ai = window.aiService;
        this.initialized = false;
        this.notificationPermission = 'default';
        this.scheduledNotifications = new Map();
        this.engagementTracker = new EngagementTracker();
        this.reEngagementChecker = new ReEngagementChecker(this);
        this.preferenceManager = new NotificationPreferenceManager(this);
        this.init();
    }

    async init() {
        try {
            // Check notification permission
            if ('Notification' in window) {
                this.notificationPermission = Notification.permission;
            }

            // Initialize notification storage in database
            await this.initializeNotificationStorage();
            
            // Load user preferences
            await this.loadUserPreferences();
            
            // Schedule daily notifications
            await this.scheduleDailyNotifications();
            
            // Schedule weekly summaries
            await this.scheduleWeeklySummaries();
            
            this.initialized = true;
            console.log('Enhanced Notification Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize notification service:', error);
        }
    }

    // Requirement 8.4: Track engagement and use AI to optimize message timing and content
    async trackNotificationEngagement(notificationId, action, metadata = {}) {
        const engagement = {
            notificationId,
            action, // 'sent', 'delivered', 'clicked', 'dismissed'
            timestamp: new Date().toISOString(),
            userId: (await this.getCurrentUser())?.id,
            ...metadata
        };

        await this.engagementTracker.recordEngagement(engagement);
        
        // Trigger real-time optimization for user interactions
        if (action === 'clicked' || action === 'dismissed') {
            await this.optimizeNotificationTiming(engagement);
        }
    }

    // Requirement 8.5: Intelligent notification timing and frequency optimization
    async optimizeNotificationTiming(engagement) {
        const user = await this.getCurrentUser();
        if (!user) return;

        const analytics = await this.engagementTracker.getEngagementAnalytics(user.id);
        
        // Only optimize if we have sufficient engagement data
        if (analytics.totalNotifications < 5) return;

        try {
            // Generate AI-powered optimization recommendations
            const optimizationPrompt = `
                Analyze this user's notification engagement patterns and provide specific optimization recommendations:
                
                Current Performance:
                - Click Rate: ${analytics.clickRate}%
                - Dismiss Rate: ${analytics.dismissRate}%
                - Engagement Trend: ${analytics.engagementTrend}
                - Best Times: ${analytics.bestTimeOfDay.map(t => t.hour + ':00').join(', ')}
                - Best Days: ${analytics.bestDayOfWeek.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.day]).join(', ')}
                
                Recent Action: ${engagement.action} at ${new Date(engagement.timestamp).getHours()}:00
                
                Provide specific recommendations for:
                1. Optimal notification timing adjustments
                2. Frequency modifications (increase/decrease/maintain)
                3. Content personalization improvements
                4. Notification type preferences
                
                Format as actionable suggestions.
            `;

            const aiRecommendations = await this.ai.generateContent(optimizationPrompt, {
                userId: user.id,
                analytics,
                recentEngagement: engagement,
                optimizationType: 'real_time'
            });

            // Apply AI recommendations
            await this.applyOptimizationRecommendations(user.id, aiRecommendations, analytics);
            
        } catch (error) {
            console.error('Failed to generate AI optimization:', error);
            // Apply basic rule-based optimizations as fallback
            this.applyBasicOptimizations(user.id, analytics);
        }
    }

    async applyOptimizationRecommendations(userId, aiRecommendations, analytics) {
        try {
            const optimizations = this.parseAIOptimizations(aiRecommendations);
            
            // Get current user preferences
            const user = await this.db.getUser(userId);
            const currentPrefs = user.notificationPreferences || this.getDefaultPreferences();
            
            // Apply optimizations while respecting user preferences (Requirement 8.6)
            const updatedPrefs = {
                ...currentPrefs,
                ...optimizations,
                aiOptimized: true,
                lastOptimization: new Date().toISOString(),
                optimizationSource: 'ai_powered',
                optimizationData: {
                    clickRate: analytics.clickRate,
                    engagementTrend: analytics.engagementTrend,
                    recommendations: aiRecommendations.substring(0, 500) // Store summary
                }
            };

            // Update user preferences
            await this.db.updateUser(userId, {
                notificationPreferences: updatedPrefs
            });

            // Reschedule notifications with new preferences
            await this.rescheduleNotifications(updatedPrefs);

            console.log('Applied AI-powered optimizations for user:', userId);
            
        } catch (error) {
            console.error('Failed to apply optimization recommendations:', error);
        }
    }

    parseAIOptimizations(aiRecommendations) {
        const optimizations = {};
        const text = aiRecommendations.toLowerCase();
        
        try {
            // Extract timing recommendations
            const timeMatches = aiRecommendations.match(/(\d{1,2}):(\d{2})/g);
            if (timeMatches && timeMatches.length > 0) {
                optimizations.assessmentReminderTime = timeMatches[0];
                if (timeMatches.length > 1) {
                    optimizations.moodReminderTime = timeMatches[1];
                }
            }

            // Extract frequency recommendations
            if (text.includes('reduce frequency') || text.includes('less frequent') || text.includes('decrease')) {
                optimizations.frequency = 'low';
            } else if (text.includes('increase frequency') || text.includes('more frequent') || text.includes('increase')) {
                optimizations.frequency = 'high';
            }

            // Extract content personalization flags
            if (text.includes('more motivational') || text.includes('increase motivation')) {
                optimizations.motivationalMessages = true;
            }
            
            if (text.includes('disable weekly') || text.includes('skip weekly') || text.includes('reduce weekly')) {
                optimizations.weeklySummaries = false;
            }

            // Extract timing adjustments based on best performance times
            if (text.includes('morning') && text.includes('better')) {
                optimizations.assessmentReminderTime = '09:00';
            }
            if (text.includes('evening') && text.includes('better')) {
                optimizations.moodReminderTime = '19:00';
            }

            return optimizations;
            
        } catch (error) {
            console.error('Failed to parse AI optimizations:', error);
            return {};
        }
    }

    applyBasicOptimizations(userId, analytics) {
        const optimizations = {};

        // Basic rule-based optimizations
        if (analytics.clickRate < 10) {
            optimizations.frequency = 'low'; // Reduce frequency for low engagement
        } else if (analytics.clickRate > 30) {
            optimizations.frequency = 'normal'; // Maintain for good engagement
        }

        // Optimize timing based on best hours
        if (analytics.bestTimeOfDay.length > 0) {
            const bestHour = analytics.bestTimeOfDay[0].hour;
            optimizations.assessmentReminderTime = `${bestHour}:00`;
            optimizations.moodReminderTime = `${(bestHour + 12) % 24}:00`;
        }

        this.applyOptimizationRecommendations(userId, JSON.stringify(optimizations), analytics);
    }

    // Requirement 8.2: Gemini AI integration for personalized motivational messages
    async generatePersonalizedNotification(type, context = {}) {
        try {
            const user = await this.getCurrentUser();
            const userContext = await this.buildUserContext(user);
            
            let prompt, aiContext;

            switch (type) {
                case 'daily_assessment':
                    prompt = `Create a warm, encouraging daily reminder for a diabetes prevention app user to complete their health assessment. Make it personal and motivating based on their recent activity. Keep it under 50 characters for title and 100 characters for body.`;
                    aiContext = {
                        ...userContext,
                        notificationType: 'assessment_reminder',
                        timeOfDay: 'morning'
                    };
                    break;

                case 'daily_mood':
                    prompt = `Create a gentle, caring evening reminder for someone to check in with their mood and emotional wellbeing. Connect it to their overall health journey. Keep it under 50 characters for title and 100 characters for body.`;
                    aiContext = {
                        ...userContext,
                        notificationType: 'mood_reminder',
                        timeOfDay: 'evening'
                    };
                    break;

                case 'weekly_nutrition_summary':
                    const nutritionData = await this.getNutritionSummaryData(user.id);
                    prompt = `Create an encouraging weekly nutrition summary notification that celebrates progress and motivates continued healthy eating habits. Include specific metrics if available. Keep it under 50 characters for title and 120 characters for body.`;
                    aiContext = {
                        ...userContext,
                        nutritionData,
                        notificationType: 'weekly_summary'
                    };
                    break;

                case 'motivational':
                    prompt = `Create a personalized motivational message for someone on their diabetes prevention journey. Make it uplifting and specific to their recent progress. Keep it under 50 characters for title and 100 characters for body.`;
                    aiContext = {
                        ...userContext,
                        ...context,
                        notificationType: 'motivational'
                    };
                    break;

                case 're_engagement':
                    prompt = `Create a caring, non-judgmental re-engagement message for someone who hasn't used the diabetes prevention app recently. Focus on support and gentle encouragement to return. Keep it under 50 characters for title and 120 characters for body.`;
                    aiContext = {
                        ...userContext,
                        ...context,
                        notificationType: 're_engagement',
                        daysInactive: context.daysInactive || 7
                    };
                    break;

                default:
                    return this.getFallbackNotification(type);
            }

            // Generate AI-powered content with behavioral personalization
            const behaviorData = await this.engagementTracker.getBehaviorPatterns(user.id);
            aiContext.behaviorPatterns = behaviorData;

            const aiResponse = await this.ai.generateContent(prompt, aiContext);
            
            return {
                title: this.extractTitle(aiResponse) || this.getFallbackTitle(type),
                body: this.extractBody(aiResponse) || this.getFallbackBody(type),
                generated: true,
                timestamp: new Date().toISOString(),
                personalizationLevel: 'ai_powered'
            };

        } catch (error) {
            console.error('Failed to generate AI notification:', error);
            return this.getFallbackNotification(type);
        }
    }

    // Core notification methods
    async sendNotification(notificationData) {
        const hasPermission = await this.requestNotificationPermission();
        if (!hasPermission) {
            console.warn('Notification permission not granted');
            return false;
        }

        // Generate personalized content if not provided
        if (!notificationData.body || !notificationData.generated) {
            const personalizedContent = await this.generatePersonalizedNotification(
                notificationData.type, 
                notificationData.context || {}
            );
            notificationData = { ...notificationData, ...personalizedContent };
        }

        // Create and show notification
        const notification = new Notification(notificationData.title, {
            body: notificationData.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: notificationData.type,
            requireInteraction: notificationData.priority === 'high',
            data: {
                id: notificationData.id || this.generateNotificationId(),
                type: notificationData.type,
                userId: notificationData.userId
            }
        });

        // Track engagement
        await this.trackNotificationEngagement(notification.data.id, 'sent', {
            notificationType: notificationData.type,
            personalizationLevel: notificationData.personalizationLevel || 'basic'
        });

        // Set up event listeners
        notification.onclick = () => {
            this.trackNotificationEngagement(notification.data.id, 'clicked');
            window.focus();
            notification.close();
            this.handleNotificationClick(notificationData.type);
        };

        notification.onclose = () => {
            this.trackNotificationEngagement(notification.data.id, 'dismissed');
        };

        // Auto-close after delay
        setTimeout(() => {
            notification.close();
        }, 10000);

        return true;
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            return permission === 'granted';
        }

        return false;
    }

    handleNotificationClick(type) {
        switch (type) {
            case 'daily_assessment':
                window.location.hash = '#risk-assessment';
                break;
            case 'daily_mood':
                window.location.hash = '#mental-health';
                break;
            case 'weekly_nutrition_summary':
                window.location.hash = '#nutrition';
                break;
            case 're_engagement':
                window.location.hash = '#dashboard';
                break;
            default:
                window.location.hash = '#dashboard';
        }
    }

    // Helper methods
    async buildUserContext(user) {
        if (!user) return {};

        const recentAssessments = await this.getRecentAssessments(user.id, 7);
        const recentMoods = await this.getRecentMoods(user.id, 7);
        const nutritionData = await this.getNutritionSummaryData(user.id);

        return {
            userId: user.id,
            userName: user.name,
            age: user.age,
            recentAssessments,
            recentMoods,
            nutritionData,
            lastActivity: await this.getLastUserActivity(user.id)
        };
    }

    async getNutritionSummaryData(userId) {
        try {
            const nutritionPlans = await this.db.getNutritionPlans(userId, 7);
            const adherenceData = nutritionPlans.map(plan => ({
                date: plan.createdAt,
                adherence: plan.adherence || 0
            }));

            const averageAdherence = adherenceData.length > 0 
                ? adherenceData.reduce((sum, data) => sum + data.adherence, 0) / adherenceData.length
                : 0;

            return {
                weeklyAdherence: adherenceData,
                averageAdherence: Math.round(averageAdherence),
                totalPlans: nutritionPlans.length,
                trend: this.calculateAdherenceTrend(adherenceData)
            };
        } catch (error) {
            console.error('Failed to get nutrition summary:', error);
            return { averageAdherence: 0, totalPlans: 0, trend: 'stable' };
        }
    }

    calculateAdherenceTrend(adherenceData) {
        if (adherenceData.length < 2) return 'stable';
        
        const recent = adherenceData.slice(-3);
        const earlier = adherenceData.slice(0, -3);
        
        if (recent.length === 0 || earlier.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((sum, data) => sum + data.adherence, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, data) => sum + data.adherence, 0) / earlier.length;
        
        const difference = recentAvg - earlierAvg;
        
        if (difference > 5) return 'improving';
        if (difference < -5) return 'declining';
        return 'stable';
    }

    extractTitle(aiResponse) {
        const lines = aiResponse.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
            let title = lines[0].replace(/^(Title:|Subject:)/i, '').trim();
            title = title.replace(/^["']|["']$/g, '');
            return title.length > 50 ? title.substring(0, 47) + '...' : title;
        }
        return null;
    }

    extractBody(aiResponse) {
        const lines = aiResponse.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
            let body = lines.slice(1).join(' ').trim();
            body = body.replace(/^(Body:|Message:)/i, '').trim();
            return body.length > 150 ? body.substring(0, 147) + '...' : body;
        }
        return aiResponse.length > 150 ? aiResponse.substring(0, 147) + '...' : aiResponse;
    }

    getFallbackNotification(type) {
        const fallbacks = {
            daily_assessment: {
                title: 'Health Check-In Time! 🩺',
                body: 'Take a moment to complete your daily health assessment and track your progress.'
            },
            daily_mood: {
                title: 'How are you feeling today? 😊',
                body: 'Your emotional wellbeing matters. Take a moment to check in with yourself.'
            },
            weekly_nutrition_summary: {
                title: 'Your Weekly Health Summary 📊',
                body: 'See how you did this week with your nutrition goals and celebrate your progress!'
            },
            motivational: {
                title: 'You\'re doing great! 🌟',
                body: 'Every healthy choice you make is an investment in your future wellbeing.'
            },
            re_engagement: {
                title: 'We miss you! 💙',
                body: 'Your health journey is important. Come back and see your progress!'
            }
        };

        return fallbacks[type] || fallbacks.motivational;
    }

    getFallbackTitle(type) {
        return this.getFallbackNotification(type).title;
    }

    getFallbackBody(type) {
        return this.getFallbackNotification(type).body;
    }

    getDefaultPreferences() {
        return {
            dailyReminders: true,
            weeklySummaries: true,
            motivationalMessages: true,
            reEngagement: true,
            assessmentReminderTime: '09:00',
            moodReminderTime: '20:00',
            weeklySummaryTime: 'Sunday 18:00',
            frequency: 'normal' // low, normal, high
        };
    }

    generateNotificationId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Database interaction methods
    async getCurrentUser() {
        try {
            return await this.db.getCurrentUser();
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    async getAllUsers() {
        try {
            return await this.db.getAllUsers();
        } catch (error) {
            console.error('Failed to get all users:', error);
            return [];
        }
    }

    async getRecentAssessments(userId, days = 7) {
        try {
            return await this.db.getRecentAssessments(userId, days);
        } catch (error) {
            console.error('Failed to get recent assessments:', error);
            return [];
        }
    }

    async getRecentMoods(userId, days = 7) {
        try {
            return await this.db.getRecentMoods(userId, days);
        } catch (error) {
            console.error('Failed to get recent moods:', error);
            return [];
        }
    }

    async getLastUserActivity(userId) {
        try {
            const recentAssessment = await this.db.getLatestAssessment(userId);
            const recentMood = await this.db.getLatestMood(userId);
            const recentNutrition = await this.db.getLatestNutritionPlan(userId);

            const activities = [
                recentAssessment?.createdAt,
                recentMood?.createdAt,
                recentNutrition?.createdAt
            ].filter(Boolean);

            if (activities.length === 0) return null;

            return new Date(Math.max(...activities.map(date => new Date(date).getTime())));
        } catch (error) {
            console.error('Failed to get last user activity:', error);
            return null;
        }
    }

    calculateDaysSince(date) {
        if (!date) return Infinity;
        const now = new Date();
        const diffTime = Math.abs(now - new Date(date));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Placeholder methods for scheduling
    async initializeNotificationStorage() {
        // Initialize notification storage
    }

    async loadUserPreferences() {
        try {
            const user = await this.getCurrentUser();
            if (user && user.notificationPreferences) {
                return user.notificationPreferences;
            }
            return this.getDefaultPreferences();
        } catch (error) {
            console.error('Failed to load user preferences:', error);
            return this.getDefaultPreferences();
        }
    }

    async scheduleDailyNotifications() {
        const user = await this.getCurrentUser();
        if (!user) return;

        const preferences = user.notificationPreferences || this.getDefaultPreferences();
        
        if (preferences.dailyReminders) {
            console.log('Scheduling daily notifications with preferences:', preferences);
        }
    }

    async scheduleWeeklySummaries() {
        const user = await this.getCurrentUser();
        if (!user) return;

        const preferences = user.notificationPreferences || this.getDefaultPreferences();
        
        if (preferences.weeklySummaries) {
            console.log('Scheduling weekly summaries with preferences:', preferences);
        }
    }

    async rescheduleNotifications(preferences) {
        console.log('Rescheduling notifications with updated preferences:', preferences);
        await this.scheduleDailyNotifications();
        await this.scheduleWeeklySummaries();
    }
}
/
/ Enhanced Engagement Tracker for Requirements 8.4 & 8.5
class EngagementTracker {
    constructor() {
        this.engagementData = new Map();
        this.behaviorPatterns = new Map();
        this.init();
    }

    async init() {
        await this.loadEngagementHistory();
        this.startPeriodicAnalysis();
    }

    async recordEngagement(engagement) {
        try {
            // Store engagement with detailed metadata
            const enhancedEngagement = {
                ...engagement,
                deviceType: this.getDeviceType(),
                timeOfDay: new Date(engagement.timestamp).getHours(),
                dayOfWeek: new Date(engagement.timestamp).getDay(),
                sessionId: this.getCurrentSessionId(),
                userAgent: navigator.userAgent,
                screenSize: `${screen.width}x${screen.height}`,
                connectionType: this.getConnectionType()
            };

            // Store in memory
            const userId = engagement.userId;
            if (!this.engagementData.has(userId)) {
                this.engagementData.set(userId, []);
            }
            this.engagementData.get(userId).push(enhancedEngagement);

            // Persist to storage
            await this.saveEngagementToStorage(enhancedEngagement);

            // Update behavior patterns
            await this.updateBehaviorPatterns(userId, enhancedEngagement);

        } catch (error) {
            console.error('Failed to record engagement:', error);
        }
    }

    async getUserEngagementHistory(userId, days = 30) {
        try {
            const userEngagements = this.engagementData.get(userId) || [];
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            return userEngagements.filter(engagement => 
                new Date(engagement.timestamp) >= cutoffDate
            );
        } catch (error) {
            console.error('Failed to get user engagement history:', error);
            return [];
        }
    }

    async getEngagementAnalytics(userId) {
        try {
            const history = await this.getUserEngagementHistory(userId);
            
            const analytics = {
                totalNotifications: history.filter(e => e.action === 'sent').length,
                clickRate: this.calculateClickRate(history),
                dismissRate: this.calculateDismissRate(history),
                bestTimeOfDay: this.findBestTimeOfDay(history),
                bestDayOfWeek: this.findBestDayOfWeek(history),
                engagementTrend: this.calculateEngagementTrend(history),
                notificationTypePerformance: this.analyzeTypePerformance(history),
                devicePreferences: this.analyzeDevicePreferences(history),
                sessionEngagement: this.analyzeSessionEngagement(history)
            };

            return analytics;
        } catch (error) {
            console.error('Failed to get engagement analytics:', error);
            return {};
        }
    }

    calculateClickRate(history) {
        const clicks = history.filter(e => e.action === 'clicked').length;
        const sent = history.filter(e => e.action === 'sent').length;
        return sent > 0 ? (clicks / sent) * 100 : 0;
    }

    calculateDismissRate(history) {
        const dismissals = history.filter(e => e.action === 'dismissed').length;
        const delivered = history.filter(e => e.action === 'delivered').length;
        return delivered > 0 ? (dismissals / delivered) * 100 : 0;
    }

    findBestTimeOfDay(history) {
        const hourlyEngagement = {};
        const clicks = history.filter(e => e.action === 'clicked');
        
        clicks.forEach(engagement => {
            const hour = engagement.timeOfDay;
            hourlyEngagement[hour] = (hourlyEngagement[hour] || 0) + 1;
        });

        return Object.entries(hourlyEngagement)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour, count]) => ({ hour: parseInt(hour), engagements: count }));
    }

    findBestDayOfWeek(history) {
        const dailyEngagement = {};
        const clicks = history.filter(e => e.action === 'clicked');
        
        clicks.forEach(engagement => {
            const day = engagement.dayOfWeek;
            dailyEngagement[day] = (dailyEngagement[day] || 0) + 1;
        });

        return Object.entries(dailyEngagement)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([day, count]) => ({ day: parseInt(day), engagements: count }));
    }

    calculateEngagementTrend(history) {
        if (history.length < 7) return 'insufficient_data';

        const recentWeek = history.filter(e => {
            const date = new Date(e.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
        });

        const previousWeek = history.filter(e => {
            const date = new Date(e.timestamp);
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= twoWeeksAgo && date < weekAgo;
        });

        const recentEngagement = this.calculateClickRate(recentWeek);
        const previousEngagement = this.calculateClickRate(previousWeek);

        if (recentEngagement > previousEngagement + 5) return 'improving';
        if (recentEngagement < previousEngagement - 5) return 'declining';
        return 'stable';
    }

    analyzeTypePerformance(history) {
        const typePerformance = {};
        
        history.forEach(engagement => {
            const type = engagement.notificationType || 'unknown';
            if (!typePerformance[type]) {
                typePerformance[type] = { sent: 0, clicked: 0, dismissed: 0 };
            }
            typePerformance[type][engagement.action]++;
        });

        // Calculate performance metrics for each type
        Object.keys(typePerformance).forEach(type => {
            const data = typePerformance[type];
            data.clickRate = data.sent > 0 ? (data.clicked / data.sent) * 100 : 0;
            data.dismissRate = data.sent > 0 ? (data.dismissed / data.sent) * 100 : 0;
        });

        return typePerformance;
    }

    analyzeDevicePreferences(history) {
        const deviceEngagement = {};
        
        history.filter(e => e.action === 'clicked').forEach(engagement => {
            const device = engagement.deviceType;
            deviceEngagement[device] = (deviceEngagement[device] || 0) + 1;
        });

        return deviceEngagement;
    }

    analyzeSessionEngagement(history) {
        const sessionData = {};
        
        history.forEach(engagement => {
            const sessionId = engagement.sessionId;
            if (!sessionData[sessionId]) {
                sessionData[sessionId] = { notifications: 0, clicks: 0 };
            }
            sessionData[sessionId].notifications++;
            if (engagement.action === 'clicked') {
                sessionData[sessionId].clicks++;
            }
        });

        const sessions = Object.values(sessionData);
        const avgNotificationsPerSession = sessions.length > 0 
            ? sessions.reduce((sum, s) => sum + s.notifications, 0) / sessions.length 
            : 0;
        const avgClicksPerSession = sessions.length > 0 
            ? sessions.reduce((sum, s) => sum + s.clicks, 0) / sessions.length 
            : 0;

        return {
            totalSessions: sessions.length,
            avgNotificationsPerSession,
            avgClicksPerSession,
            sessionEngagementRate: avgNotificationsPerSession > 0 
                ? (avgClicksPerSession / avgNotificationsPerSession) * 100 
                : 0
        };
    }

    async updateBehaviorPatterns(userId, engagement) {
        try {
            if (!this.behaviorPatterns.has(userId)) {
                this.behaviorPatterns.set(userId, {
                    preferredTimes: new Map(),
                    preferredDays: new Map(),
                    typePreferences: new Map(),
                    deviceUsage: new Map(),
                    responseSpeed: [],
                    lastUpdated: new Date().toISOString()
                });
            }

            const patterns = this.behaviorPatterns.get(userId);
            
            // Update time preferences
            const hour = engagement.timeOfDay;
            patterns.preferredTimes.set(hour, (patterns.preferredTimes.get(hour) || 0) + 1);
            
            // Update day preferences
            const day = engagement.dayOfWeek;
            patterns.preferredDays.set(day, (patterns.preferredDays.get(day) || 0) + 1);
            
            // Update type preferences
            const type = engagement.notificationType;
            if (type) {
                patterns.typePreferences.set(type, (patterns.typePreferences.get(type) || 0) + 1);
            }
            
            // Update device usage
            const device = engagement.deviceType;
            patterns.deviceUsage.set(device, (patterns.deviceUsage.get(device) || 0) + 1);
            
            patterns.lastUpdated = new Date().toISOString();
            
            // Persist patterns
            await this.saveBehaviorPatterns(userId, patterns);
            
        } catch (error) {
            console.error('Failed to update behavior patterns:', error);
        }
    }

    async getBehaviorPatterns(userId) {
        try {
            return this.behaviorPatterns.get(userId) || {};
        } catch (error) {
            console.error('Failed to get behavior patterns:', error);
            return {};
        }
    }

    // Helper methods
    getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
        return 'desktop';
    }

    getCurrentSessionId() {
        if (!window.sessionStorage.getItem('glucobalance_session_id')) {
            window.sessionStorage.setItem('glucobalance_session_id', 
                'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
        }
        return window.sessionStorage.getItem('glucobalance_session_id');
    }

    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }

    async loadEngagementHistory() {
        try {
            const stored = localStorage.getItem('glucobalance_engagement_history');
            if (stored) {
                const data = JSON.parse(stored);
                Object.entries(data).forEach(([userId, engagements]) => {
                    this.engagementData.set(userId, engagements);
                });
            }
        } catch (error) {
            console.error('Failed to load engagement history:', error);
        }
    }

    async saveEngagementToStorage(engagement) {
        try {
            const current = JSON.parse(localStorage.getItem('glucobalance_engagement_history') || '{}');
            const userId = engagement.userId;
            
            if (!current[userId]) current[userId] = [];
            current[userId].push(engagement);
            
            // Keep only last 1000 engagements per user
            if (current[userId].length > 1000) {
                current[userId] = current[userId].slice(-1000);
            }
            
            localStorage.setItem('glucobalance_engagement_history', JSON.stringify(current));
        } catch (error) {
            console.error('Failed to save engagement to storage:', error);
        }
    }

    async saveBehaviorPatterns(userId, patterns) {
        try {
            const current = JSON.parse(localStorage.getItem('glucobalance_behavior_patterns') || '{}');
            
            // Convert Maps to Objects for storage
            current[userId] = {
                preferredTimes: Object.fromEntries(patterns.preferredTimes),
                preferredDays: Object.fromEntries(patterns.preferredDays),
                typePreferences: Object.fromEntries(patterns.typePreferences),
                deviceUsage: Object.fromEntries(patterns.deviceUsage),
                responseSpeed: patterns.responseSpeed,
                lastUpdated: patterns.lastUpdated
            };
            
            localStorage.setItem('glucobalance_behavior_patterns', JSON.stringify(current));
        } catch (error) {
            console.error('Failed to save behavior patterns:', error);
        }
    }

    startPeriodicAnalysis() {
        // Run engagement analysis every hour
        setInterval(async () => {
            await this.performPeriodicAnalysis();
        }, 60 * 60 * 1000); // 1 hour
    }

    async performPeriodicAnalysis() {
        try {
            // Analyze all users' engagement patterns
            for (const [userId, engagements] of this.engagementData) {
                if (engagements.length > 10) { // Only analyze users with sufficient data
                    const analytics = await this.getEngagementAnalytics(userId);
                    
                    // Generate periodic optimization recommendations
                    if (analytics.engagementTrend === 'declining') {
                        console.log(`User ${userId} has declining engagement, triggering optimization`);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to perform periodic analysis:', error);
        }
    }
}// Re-eng
agement System for Requirement 8.7
class ReEngagementChecker {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.init();
    }

    init() {
        // Start periodic checks for inactive users
        this.startPeriodicChecks();
        
        // Check immediately on initialization
        setTimeout(() => this.checkAllUsers(), 5000);
    }

    startPeriodicChecks() {
        setInterval(async () => {
            await this.checkAllUsers();
        }, this.checkInterval);
    }

    async checkAllUsers() {
        try {
            const users = await this.notificationService.getAllUsers();
            
            for (const user of users) {
                await this.checkUserEngagement(user);
            }
        } catch (error) {
            console.error('Failed to check all users for re-engagement:', error);
        }
    }

    async checkUserEngagement(user) {
        try {
            const lastActivity = await this.notificationService.getLastUserActivity(user.id);
            const daysSinceActivity = this.notificationService.calculateDaysSince(lastActivity);
            
            // Define re-engagement thresholds with AI-powered messaging
            const reEngagementRules = [
                { days: 3, type: 'gentle_reminder', priority: 'low' },
                { days: 7, type: 'motivational_return', priority: 'medium' },
                { days: 14, type: 'progress_highlight', priority: 'high' },
                { days: 30, type: 'health_importance', priority: 'high' }
            ];

            // Check if user needs re-engagement
            for (const rule of reEngagementRules) {
                if (daysSinceActivity >= rule.days && daysSinceActivity < rule.days + 7) {
                    // Check if we haven't already sent this type recently
                    const recentReEngagement = await this.getRecentReEngagementNotifications(user.id, rule.days);
                    
                    if (recentReEngagement.length === 0) {
                        await this.sendReEngagementNotification(user, rule, daysSinceActivity);
                    }
                    break; // Only send one type of re-engagement notification
                }
            }
        } catch (error) {
            console.error('Failed to check user engagement:', error);
        }
    }

    async sendReEngagementNotification(user, rule, daysInactive) {
        try {
            // Get user context for personalization
            const userContext = await this.buildReEngagementContext(user, daysInactive);
            
            // Generate AI-powered re-engagement message
            const notification = await this.generateReEngagementNotification(rule.type, userContext);
            
            // Send notification
            await this.notificationService.sendNotification({
                ...notification,
                type: 're_engagement',
                subType: rule.type,
                userId: user.id,
                priority: rule.priority,
                daysInactive: daysInactive,
                context: userContext
            });

            // Track re-engagement attempt
            await this.trackReEngagementAttempt(user.id, rule.type, daysInactive);
            
        } catch (error) {
            console.error('Failed to send re-engagement notification:', error);
        }
    }

    async generateReEngagementNotification(type, context) {
        try {
            let prompt, fallback;

            switch (type) {
                case 'gentle_reminder':
                    prompt = `Create a gentle, caring reminder for someone who hasn't used their diabetes prevention app for 3 days. Focus on their wellbeing and make it feel supportive, not pushy. Keep it under 50 characters for title and 100 characters for body.`;
                    fallback = {
                        title: 'Thinking of you! 💙',
                        body: 'Your health journey matters. Take a moment to check in with yourself today.'
                    };
                    break;

                case 'motivational_return':
                    prompt = `Create an encouraging message for someone who hasn't used their health app for a week. Highlight the importance of consistency and offer motivation to return. Keep it under 50 characters for title and 120 characters for body.`;
                    fallback = {
                        title: 'Your health journey awaits! 🌟',
                        body: 'Small consistent steps lead to big health improvements. Ready to continue your journey?'
                    };
                    break;

                case 'progress_highlight':
                    prompt = `Create a message highlighting the user's past progress and achievements to motivate them to return after 2 weeks of inactivity. Make it personal and encouraging. Include specific achievements if available. Keep it under 50 characters for title and 120 characters for body.`;
                    fallback = {
                        title: 'Look how far you\'ve come! 📈',
                        body: 'Your previous progress shows your commitment to health. Let\'s continue building on that success!'
                    };
                    break;

                case 'health_importance':
                    prompt = `Create a caring but important message about the value of consistent health monitoring for someone inactive for 30 days. Focus on health benefits and support. Keep it under 50 characters for title and 120 characters for body.`;
                    fallback = {
                        title: 'Your health is worth it 💪',
                        body: 'Regular health monitoring is one of the best investments you can make. We\'re here to support you every step of the way.'
                    };
                    break;

                default:
                    return this.notificationService.getFallbackNotification('re_engagement');
            }

            // Generate AI content with user context
            const aiResponse = await this.notificationService.ai.generateContent(prompt, {
                ...context,
                notificationType: 're_engagement',
                subType: type
            });

            return {
                title: this.notificationService.extractTitle(aiResponse) || fallback.title,
                body: this.notificationService.extractBody(aiResponse) || fallback.body,
                generated: true,
                timestamp: new Date().toISOString(),
                personalizationLevel: 'ai_powered_reengagement'
            };

        } catch (error) {
            console.error('Failed to generate re-engagement notification:', error);
            return this.notificationService.getFallbackNotification('re_engagement');
        }
    }

    async buildReEngagementContext(user, daysInactive) {
        try {
            // Get user's historical data for personalization
            const assessments = await this.notificationService.db.getUserAssessments(user.id);
            const moods = await this.notificationService.db.getUserMoods(user.id);
            const nutritionPlans = await this.notificationService.db.getNutritionPlans(user.id);
            
            // Calculate achievements
            const achievements = {
                totalAssessments: assessments.length,
                totalMoodEntries: moods.length,
                totalNutritionPlans: nutritionPlans.length,
                bestRiskScore: assessments.length > 0 ? Math.min(...assessments.map(a => a.riskScore)) : null,
                averageMood: moods.length > 0 ? moods.reduce((sum, m) => sum + m.mood, 0) / moods.length : null,
                lastActivity: await this.notificationService.getLastUserActivity(user.id)
            };

            return {
                userId: user.id,
                userName: user.name,
                daysInactive,
                achievements,
                hasData: assessments.length > 0 || moods.length > 0 || nutritionPlans.length > 0,
                userProfile: {
                    age: user.age,
                    preferences: user.notificationPreferences || {}
                }
            };
        } catch (error) {
            console.error('Failed to build re-engagement context:', error);
            return {
                userId: user.id,
                userName: user.name,
                daysInactive,
                hasData: false
            };
        }
    }

    async getRecentReEngagementNotifications(userId, days) {
        try {
            const engagementHistory = await this.notificationService.engagementTracker.getUserEngagementHistory(userId, days + 1);
            return engagementHistory.filter(e => 
                e.notificationType === 're_engagement' && 
                e.action === 'sent'
            );
        } catch (error) {
            console.error('Failed to get recent re-engagement notifications:', error);
            return [];
        }
    }

    async trackReEngagementAttempt(userId, type, daysInactive) {
        try {
            const attempt = {
                userId,
                type,
                daysInactive,
                timestamp: new Date().toISOString(),
                id: 'reengagement_' + Date.now()
            };

            // Store re-engagement attempts
            const attempts = JSON.parse(localStorage.getItem('glucobalance_reengagement_attempts') || '[]');
            attempts.push(attempt);
            
            // Keep only last 100 attempts
            if (attempts.length > 100) {
                attempts.splice(0, attempts.length - 100);
            }
            
            localStorage.setItem('glucobalance_reengagement_attempts', JSON.stringify(attempts));
            
        } catch (error) {
            console.error('Failed to track re-engagement attempt:', error);
        }
    }

    async getReEngagementStats() {
        try {
            const attempts = JSON.parse(localStorage.getItem('glucobalance_reengagement_attempts') || '[]');
            const engagementHistory = JSON.parse(localStorage.getItem('glucobalance_engagement_history') || '{}');
            
            // Calculate success rates
            const stats = {
                totalAttempts: attempts.length,
                successfulReturns: 0,
                averageDaysToReturn: 0,
                typePerformance: {}
            };

            // Analyze success rates
            attempts.forEach(attempt => {
                const userEngagements = engagementHistory[attempt.userId] || [];
                const returnEngagement = userEngagements.find(e => 
                    new Date(e.timestamp) > new Date(attempt.timestamp) &&
                    e.action === 'clicked'
                );

                if (returnEngagement) {
                    stats.successfulReturns++;
                    const daysToReturn = Math.ceil(
                        (new Date(returnEngagement.timestamp) - new Date(attempt.timestamp)) / (1000 * 60 * 60 * 24)
                    );
                    stats.averageDaysToReturn += daysToReturn;
                }

                // Track type performance
                if (!stats.typePerformance[attempt.type]) {
                    stats.typePerformance[attempt.type] = { attempts: 0, successes: 0 };
                }
                stats.typePerformance[attempt.type].attempts++;
                if (returnEngagement) {
                    stats.typePerformance[attempt.type].successes++;
                }
            });

            if (stats.successfulReturns > 0) {
                stats.averageDaysToReturn = stats.averageDaysToReturn / stats.successfulReturns;
            }

            // Calculate success rates for each type
            Object.keys(stats.typePerformance).forEach(type => {
                const perf = stats.typePerformance[type];
                perf.successRate = perf.attempts > 0 ? (perf.successes / perf.attempts) * 100 : 0;
            });

            return stats;
        } catch (error) {
            console.error('Failed to get re-engagement stats:', error);
            return {};
        }
    }
}// No
tification Preference Manager for Requirement 8.6
class NotificationPreferenceManager {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.init();
    }

    async init() {
        // Initialize preference management
        console.log('Notification Preference Manager initialized');
    }

    async getUserPreferences(userId) {
        try {
            const user = await this.notificationService.db.getUser(userId);
            return user.notificationPreferences || this.notificationService.getDefaultPreferences();
        } catch (error) {
            console.error('Failed to get user preferences:', error);
            return this.notificationService.getDefaultPreferences();
        }
    }

    async updateUserPreferences(userId, preferences) {
        try {
            // Validate preferences
            const validatedPreferences = this.validatePreferences(preferences);
            
            // Get current user
            const user = await this.notificationService.db.getUser(userId);
            const currentPrefs = user.notificationPreferences || {};
            
            // Merge with existing preferences
            const updatedPreferences = {
                ...currentPrefs,
                ...validatedPreferences,
                lastUpdated: new Date().toISOString(),
                updatedBy: 'user'
            };

            // Update user in database
            await this.notificationService.db.updateUser(userId, {
                notificationPreferences: updatedPreferences
            });

            // Reschedule notifications with new preferences
            await this.notificationService.rescheduleNotifications(updatedPreferences);

            return updatedPreferences;
        } catch (error) {
            console.error('Failed to update user preferences:', error);
            throw error;
        }
    }

    validatePreferences(preferences) {
        const validated = {};
        
        // Validate boolean preferences
        const booleanPrefs = ['dailyReminders', 'weeklySummaries', 'motivationalMessages', 'reEngagement'];
        booleanPrefs.forEach(pref => {
            if (typeof preferences[pref] === 'boolean') {
                validated[pref] = preferences[pref];
            }
        });

        // Validate time preferences
        if (preferences.assessmentReminderTime && this.isValidTime(preferences.assessmentReminderTime)) {
            validated.assessmentReminderTime = preferences.assessmentReminderTime;
        }
        
        if (preferences.moodReminderTime && this.isValidTime(preferences.moodReminderTime)) {
            validated.moodReminderTime = preferences.moodReminderTime;
        }

        if (preferences.weeklySummaryTime) {
            validated.weeklySummaryTime = preferences.weeklySummaryTime;
        }

        // Validate frequency
        if (preferences.frequency && ['low', 'normal', 'high'].includes(preferences.frequency)) {
            validated.frequency = preferences.frequency;
        }

        return validated;
    }

    isValidTime(timeString) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    async generatePersonalizedPreferences(userId) {
        try {
            // Get user engagement analytics
            const analytics = await this.notificationService.engagementTracker.getEngagementAnalytics(userId);
            
            // Get current preferences
            const currentPrefs = await this.getUserPreferences(userId);
            
            // Generate AI-powered preference recommendations
            const recommendationPrompt = `
                Based on this user's notification engagement patterns, suggest optimal notification preferences:
                
                Current Engagement:
                - Click Rate: ${analytics.clickRate}%
                - Best Times: ${analytics.bestTimeOfDay.map(t => t.hour + ':00').join(', ')}
                - Best Days: ${analytics.bestDayOfWeek.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.day]).join(', ')}
                - Engagement Trend: ${analytics.engagementTrend}
                
                Current Preferences:
                - Daily Reminders: ${currentPrefs.dailyReminders}
                - Assessment Time: ${currentPrefs.assessmentReminderTime}
                - Mood Time: ${currentPrefs.moodReminderTime}
                - Frequency: ${currentPrefs.frequency}
                
                Provide specific recommendations for:
                1. Optimal reminder times
                2. Notification frequency
                3. Which notification types to enable/disable
                4. Weekly summary timing
                
                Format as JSON with specific values.
            `;

            const aiRecommendations = await this.notificationService.ai.generateContent(recommendationPrompt, {
                userId,
                analytics,
                currentPreferences: currentPrefs,
                recommendationType: 'preference_optimization'
            });

            // Parse AI recommendations
            const recommendations = this.parsePreferenceRecommendations(aiRecommendations);
            
            return {
                current: currentPrefs,
                recommended: recommendations,
                reasoning: aiRecommendations.substring(0, 300) // Store reasoning
            };
            
        } catch (error) {
            console.error('Failed to generate personalized preferences:', error);
            return {
                current: await this.getUserPreferences(userId),
                recommended: {},
                reasoning: 'Unable to generate AI recommendations'
            };
        }
    }

    parsePreferenceRecommendations(aiRecommendations) {
        const recommendations = {};
        const text = aiRecommendations.toLowerCase();
        
        try {
            // Try to parse as JSON first
            if (aiRecommendations.includes('{') && aiRecommendations.includes('}')) {
                const jsonMatch = aiRecommendations.match(/\{[^}]+\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return parsed;
                }
            }

            // Fallback to text parsing
            // Extract time recommendations
            const timeMatches = aiRecommendations.match(/(\d{1,2}):(\d{2})/g);
            if (timeMatches && timeMatches.length > 0) {
                recommendations.assessmentReminderTime = timeMatches[0];
                if (timeMatches.length > 1) {
                    recommendations.moodReminderTime = timeMatches[1];
                }
            }

            // Extract frequency recommendations
            if (text.includes('reduce') || text.includes('less frequent')) {
                recommendations.frequency = 'low';
            } else if (text.includes('increase') || text.includes('more frequent')) {
                recommendations.frequency = 'high';
            }

            // Extract boolean recommendations
            if (text.includes('disable daily') || text.includes('turn off daily')) {
                recommendations.dailyReminders = false;
            } else if (text.includes('enable daily') || text.includes('turn on daily')) {
                recommendations.dailyReminders = true;
            }

            if (text.includes('disable weekly') || text.includes('turn off weekly')) {
                recommendations.weeklySummaries = false;
            } else if (text.includes('enable weekly') || text.includes('turn on weekly')) {
                recommendations.weeklySummaries = true;
            }

            return recommendations;
            
        } catch (error) {
            console.error('Failed to parse preference recommendations:', error);
            return {};
        }
    }

    async applyRecommendedPreferences(userId, recommendations) {
        try {
            const currentPrefs = await this.getUserPreferences(userId);
            
            // Merge recommendations with current preferences
            const updatedPrefs = {
                ...currentPrefs,
                ...recommendations,
                aiRecommended: true,
                recommendationApplied: new Date().toISOString()
            };

            // Update preferences
            await this.updateUserPreferences(userId, updatedPrefs);
            
            return updatedPrefs;
        } catch (error) {
            console.error('Failed to apply recommended preferences:', error);
            throw error;
        }
    }

    async getPreferenceAnalytics(userId) {
        try {
            const preferences = await this.getUserPreferences(userId);
            const analytics = await this.notificationService.engagementTracker.getEngagementAnalytics(userId);
            
            return {
                preferences,
                engagement: analytics,
                optimizationOpportunities: this.identifyOptimizationOpportunities(preferences, analytics),
                lastOptimization: preferences.lastOptimization || null,
                aiOptimized: preferences.aiOptimized || false
            };
        } catch (error) {
            console.error('Failed to get preference analytics:', error);
            return {};
        }
    }

    identifyOptimizationOpportunities(preferences, analytics) {
        const opportunities = [];
        
        // Low engagement opportunities
        if (analytics.clickRate < 15) {
            opportunities.push({
                type: 'low_engagement',
                suggestion: 'Consider adjusting notification timing or reducing frequency',
                priority: 'high'
            });
        }

        // Timing optimization opportunities
        if (analytics.bestTimeOfDay.length > 0) {
            const bestHour = analytics.bestTimeOfDay[0].hour;
            const currentAssessmentHour = parseInt(preferences.assessmentReminderTime?.split(':')[0] || 9);
            
            if (Math.abs(bestHour - currentAssessmentHour) > 2) {
                opportunities.push({
                    type: 'timing_optimization',
                    suggestion: `Consider moving assessment reminders to ${bestHour}:00 for better engagement`,
                    priority: 'medium'
                });
            }
        }

        // Frequency optimization
        if (analytics.dismissRate > 50) {
            opportunities.push({
                type: 'frequency_optimization',
                suggestion: 'High dismiss rate suggests notifications may be too frequent',
                priority: 'medium'
            });
        }

        return opportunities;
    }
}

// Initialize the enhanced notification service
window.notificationService = new NotificationService();