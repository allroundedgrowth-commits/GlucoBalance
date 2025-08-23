// GlucoBalance - Mental Health Support and Mood Tracking System
class MentalHealthService {
    constructor() {
        this.currentUser = null;
        this.moodHistory = [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for database to be ready
            if (window.kiroDb) {
                this.isInitialized = true;
                console.log('Mental Health Service initialized');
            } else {
                // Retry initialization after a short delay
                setTimeout(() => this.init(), 500);
            }
        } catch (error) {
            console.error('Mental Health Service initialization failed:', error);
            if (window.errorHandler) {
                await window.errorHandler.handleError('MENTAL_HEALTH_INIT_ERROR', error);
            }
        }
    }

    setCurrentUser(userId) {
        this.currentUser = userId;
        this.loadMoodHistory();
    }

    async loadMoodHistory(days = 30) {
        if (!this.currentUser || !this.isInitialized) return [];

        try {
            if (window.kiroDb) {
                this.moodHistory = await window.kiroDb.getUserMoods(this.currentUser, days);
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem(`glucobalance-moods-${this.currentUser}`);
                this.moodHistory = stored ? JSON.parse(stored) : [];
            }
            return this.moodHistory;
        } catch (error) {
            console.error('Failed to load mood history:', error);
            if (window.errorHandler) {
                await window.errorHandler.handleError('MOOD_LOAD_ERROR', error);
            }
            return [];
        }
    }

    async saveMood(mood, notes = '', date = null) {
        if (!this.currentUser) {
            throw new Error('No user set for mood tracking');
        }

        const moodDate = date || new Date().toISOString().split('T')[0];
        const moodValue = parseInt(mood);

        if (moodValue < 1 || moodValue > 5) {
            throw new Error('Mood value must be between 1 and 5');
        }

        try {
            let savedMood;
            
            if (window.kiroDb && this.isInitialized) {
                // Generate AI affirmation and coping strategies first
                const affirmation = await this.generateMoodAffirmation(moodValue, notes);
                const copingStrategies = await this.generateCopingStrategies(moodValue, []);
                
                savedMood = await window.kiroDb.saveMood(this.currentUser, moodDate, moodValue, notes, affirmation, copingStrategies);
            } else {
                // Fallback to localStorage
                const affirmation = await this.generateMoodAffirmation(moodValue, notes);
                const copingStrategies = await this.generateCopingStrategies(moodValue, []);
                
                const moodEntry = {
                    id: Date.now(),
                    userId: this.currentUser,
                    date: moodDate,
                    mood: moodValue,
                    notes,
                    affirmation,
                    copingStrategies,
                    createdAt: new Date().toISOString()
                };
                
                const stored = localStorage.getItem(`glucobalance-moods-${this.currentUser}`);
                let moods = stored ? JSON.parse(stored) : [];
                
                // Remove existing mood for the same date
                moods = moods.filter(m => m.date !== moodDate);
                moods.push(moodEntry);
                
                localStorage.setItem(`glucobalance-moods-${this.currentUser}`, JSON.stringify(moods));
                savedMood = moodEntry;
            }

            // Update local history
            await this.loadMoodHistory();
            
            return { 
                mood: savedMood, 
                affirmation: savedMood.affirmation || await this.generateMoodAffirmation(moodValue, notes),
                copingStrategies: savedMood.copingStrategies || await this.generateCopingStrategies(moodValue, [])
            };
        } catch (error) {
            console.error('Failed to save mood:', error);
            if (window.errorHandler) {
                await window.errorHandler.handleError('MOOD_SAVE_ERROR', error);
            }
            throw error;
        }
    }

    async getMoodByDate(date) {
        if (!this.currentUser) return null;

        try {
            if (window.kiroDb && this.isInitialized) {
                return await window.kiroDb.getMoodByDate(this.currentUser, date);
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem(`glucobalance-moods-${this.currentUser}`);
                const moods = stored ? JSON.parse(stored) : [];
                return moods.find(m => m.date === date);
            }
        } catch (error) {
            console.error('Failed to get mood by date:', error);
            return null;
        }
    }

    async generateMoodAffirmation(mood, context = '') {
        try {
            // Try AI service first with enhanced context
            if (window.aiService && window.aiService.isAvailable()) {
                const enhancedContext = {
                    notes: context,
                    moodLevel: mood,
                    recentTrend: this.getRecentMoodTrend(),
                    userProfile: this.getUserMoodProfile(),
                    healthGoals: ['diabetes prevention', 'emotional wellbeing']
                };
                
                const aiAffirmation = await window.aiService.getMoodSupport(mood, enhancedContext);
                if (aiAffirmation && aiAffirmation.trim().length > 0) {
                    return aiAffirmation;
                }
            }
        } catch (error) {
            console.error('AI affirmation generation failed:', error);
            if (window.errorHandler) {
                await window.errorHandler.handleError('AI_AFFIRMATION_ERROR', error);
            }
        }

        // Fallback to predefined affirmations
        return this.getFallbackAffirmation(mood);
    }

    getFallbackAffirmation(mood) {
        const affirmations = {
            1: [
                "It's okay to have difficult days. Remember that your feelings are valid, and tomorrow brings new possibilities.",
                "You're brave for acknowledging how you feel. Taking care of your health during tough times shows real strength.",
                "Every small step you take for your health matters, especially on challenging days like today."
            ],
            2: [
                "You're taking important steps for your health even when things feel tough. That takes courage.",
                "It's normal to have ups and downs. What matters is that you're staying engaged with your wellbeing.",
                "Your commitment to tracking your health shows you care about yourself, and that's something to be proud of."
            ],
            3: [
                "You're doing well by staying engaged with your health journey. Consistency is key, and you're showing up.",
                "Neutral days are part of life's rhythm. You're maintaining good habits, and that's what counts.",
                "Taking time to check in with yourself is a healthy practice. Keep going with your wellness routine."
            ],
            4: [
                "Great to see you're feeling positive! Your commitment to health is paying off in how you feel.",
                "Your positive energy is a wonderful foundation for maintaining healthy habits. Keep it up!",
                "It's beautiful to see you thriving. Your good mood can be a powerful motivator for continued wellness."
            ],
            5: [
                "Wonderful! Your positive energy is a powerful tool for maintaining good health and inspiring others.",
                "Your joy is contagious! This is the perfect mindset for making healthy choices and staying motivated.",
                "Fantastic mood today! Use this positive energy to reinforce all the great health habits you're building."
            ]
        };

        const moodAffirmations = affirmations[mood] || affirmations[3];
        return moodAffirmations[Math.floor(Math.random() * moodAffirmations.length)];
    }

    async generateCopingStrategies(mood, stressors = []) {
        try {
            // Try AI service first with enhanced context
            if (window.aiService && window.aiService.isAvailable()) {
                const enhancedContext = {
                    currentMood: mood,
                    stressors: stressors,
                    moodHistory: this.moodHistory.slice(0, 7), // Last 7 days
                    recentTrend: this.getRecentMoodTrend(),
                    userSituation: this.analyzeMoodContext(),
                    healthFocus: true,
                    diabetesPrevention: true
                };
                
                const aiStrategies = await window.aiService.getCopingStrategies(mood, enhancedContext);
                if (aiStrategies) {
                    // Parse AI response into array if it's a string
                    if (typeof aiStrategies === 'string') {
                        return this.parseStrategiesFromText(aiStrategies);
                    }
                    return Array.isArray(aiStrategies) ? aiStrategies : [aiStrategies];
                }
            }
        } catch (error) {
            console.error('AI coping strategies generation failed:', error);
            if (window.errorHandler) {
                await window.errorHandler.handleError('AI_COPING_STRATEGIES_ERROR', error);
            }
        }

        // Fallback to predefined strategies
        return this.getFallbackCopingStrategies(mood);
    }

    getFallbackCopingStrategies(mood) {
        const strategies = {
            1: [
                "Try deep breathing exercises: inhale for 4 counts, hold for 4, exhale for 6",
                "Consider reaching out to a trusted friend or family member for support",
                "Engage in gentle physical activity like a short walk or stretching",
                "Practice self-compassion - treat yourself with the same kindness you'd show a good friend"
            ],
            2: [
                "Take a few minutes for mindfulness or meditation",
                "Write down three things you're grateful for today",
                "Listen to calming music or nature sounds",
                "Try progressive muscle relaxation to release physical tension"
            ],
            3: [
                "Maintain your regular routine to provide stability",
                "Engage in a hobby or activity you enjoy",
                "Take breaks throughout the day to check in with yourself",
                "Stay hydrated and eat nourishing meals"
            ],
            4: [
                "Channel your positive energy into physical activity",
                "Share your good mood with others through acts of kindness",
                "Use this time to plan healthy activities for the week",
                "Practice gratitude by writing in a journal"
            ],
            5: [
                "Celebrate your positive mood and use it to motivate healthy choices",
                "Share your joy with others - positive emotions are contagious",
                "Take on a new healthy challenge or goal",
                "Use this energy to prepare healthy meals or plan exercise"
            ]
        };

        return strategies[mood] || strategies[3];
    }

    calculateMoodTrends(days = 7) {
        if (this.moodHistory.length < 2) {
            return { 
                trend: 'insufficient_data', 
                message: 'Need more mood entries to analyze trends',
                change: 0,
                confidence: 'low'
            };
        }

        const recentMoods = this.moodHistory
            .slice(0, days)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (recentMoods.length < 2) {
            return { 
                trend: 'insufficient_data', 
                message: 'Need more recent mood entries',
                change: 0,
                confidence: 'low'
            };
        }

        // Calculate linear regression for more accurate trend analysis
        const n = recentMoods.length;
        const sumX = recentMoods.reduce((sum, _, i) => sum + i, 0);
        const sumY = recentMoods.reduce((sum, m) => sum + m.mood, 0);
        const sumXY = recentMoods.reduce((sum, m, i) => sum + (i * m.mood), 0);
        const sumXX = recentMoods.reduce((sum, _, i) => sum + (i * i), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R-squared for confidence
        const yMean = sumY / n;
        const ssTotal = recentMoods.reduce((sum, m) => sum + Math.pow(m.mood - yMean, 2), 0);
        const ssResidual = recentMoods.reduce((sum, m, i) => {
            const predicted = slope * i + intercept;
            return sum + Math.pow(m.mood - predicted, 2);
        }, 0);
        const rSquared = 1 - (ssResidual / ssTotal);

        // Determine confidence level
        let confidence = 'low';
        if (rSquared > 0.7 && n >= 7) confidence = 'high';
        else if (rSquared > 0.4 && n >= 5) confidence = 'medium';

        // Calculate the actual change over the period
        const firstHalf = recentMoods.slice(0, Math.ceil(n / 2));
        const secondHalf = recentMoods.slice(Math.ceil(n / 2));
        const firstAvg = firstHalf.reduce((sum, m) => sum + m.mood, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, m) => sum + m.mood, 0) / secondHalf.length;
        const change = secondAvg - firstAvg;

        // Determine trend based on slope and change
        let trend, message;
        
        if (slope > 0.1 && change > 0.3) {
            trend = 'improving';
            message = `Your mood has been trending upward (${change > 0 ? '+' : ''}${change.toFixed(1)} points)`;
        } else if (slope < -0.1 && change < -0.3) {
            trend = 'declining';
            message = `Your mood has been trending downward (${change.toFixed(1)} points)`;
        } else if (Math.abs(slope) <= 0.05 && Math.abs(change) <= 0.2) {
            trend = 'stable';
            message = 'Your mood has been relatively stable with minimal variation';
        } else if (slope > 0 || change > 0) {
            trend = 'slightly_improving';
            message = `Your mood shows a slight upward trend (${change > 0 ? '+' : ''}${change.toFixed(1)} points)`;
        } else {
            trend = 'slightly_declining';
            message = `Your mood shows a slight downward trend (${change.toFixed(1)} points)`;
        }

        // Add confidence qualifier to message
        if (confidence === 'low') {
            message += ' (more data needed for reliable analysis)';
        } else if (confidence === 'high') {
            message += ' (high confidence in this trend)';
        }

        return {
            trend,
            message,
            change: parseFloat(change.toFixed(2)),
            slope: parseFloat(slope.toFixed(3)),
            confidence,
            rSquared: parseFloat(rSquared.toFixed(3)),
            dataPoints: n,
            period: `${days} days`
        };
    }

    getAverageMood(days = 7) {
        if (this.moodHistory.length === 0) return null;

        const recentMoods = this.moodHistory.slice(0, days);
        const sum = recentMoods.reduce((total, mood) => total + mood.mood, 0);
        return (sum / recentMoods.length).toFixed(1);
    }

    getMoodDistribution(days = 30) {
        if (this.moodHistory.length === 0) return {};

        const recentMoods = this.moodHistory.slice(0, days);
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        recentMoods.forEach(mood => {
            distribution[mood.mood]++;
        });

        return distribution;
    }

    async analyzeMoodPatterns() {
        if (this.moodHistory.length < 3) {
            return {
                hasPatterns: false,
                message: 'Need at least 3 mood entries to analyze patterns'
            };
        }

        const trends = this.calculateMoodTrends();
        const avgMood = this.getAverageMood();
        const distribution = this.getMoodDistribution();
        const weeklyAvg = this.getAverageMood(7);
        const monthlyAvg = this.getAverageMood(30);

        // Enhanced pattern analysis
        const patterns = this.detectMoodPatterns();
        const consistency = this.calculateMoodConsistency();
        const volatility = this.calculateMoodVolatility();

        // Check for concerning patterns
        const lowMoodDays = this.moodHistory.filter(m => m.mood <= 2).length;
        const totalDays = this.moodHistory.length;
        const lowMoodPercentage = (lowMoodDays / totalDays) * 100;

        let insights = [];
        let recommendations = [];

        // Trend-based insights
        if (trends.trend === 'improving') {
            insights.push('Your mood has been improving recently - great progress!');
            insights.push(`Your mood has increased by an average of ${Math.abs(trends.change).toFixed(1)} points over the recent period`);
            recommendations.push('Continue with the activities that are helping your mood');
            recommendations.push('Consider documenting what\'s working well for future reference');
        } else if (trends.trend === 'declining') {
            insights.push('Your mood has been declining recently');
            insights.push(`There\'s been a decrease of ${Math.abs(trends.change).toFixed(1)} points in your average mood`);
            recommendations.push('Consider what changes might be affecting your mood');
            recommendations.push('Reach out for support if needed');
            recommendations.push('Try incorporating stress-reduction activities into your routine');
        } else {
            insights.push('Your mood has been relatively stable');
            recommendations.push('Maintain your current wellness routine');
        }

        // Mood level insights
        if (avgMood >= 4) {
            insights.push('You\'ve been maintaining a positive mood overall');
            recommendations.push('Keep up the great work with your mental wellness');
            recommendations.push('Consider sharing your positive strategies with others');
        } else if (avgMood <= 2.5) {
            insights.push('Your average mood has been on the lower side');
            recommendations.push('Consider speaking with a mental health professional');
            recommendations.push('Focus on self-care and stress management techniques');
            recommendations.push('Ensure you\'re getting adequate sleep and nutrition');
        }

        // Frequency-based insights
        if (lowMoodPercentage > 40) {
            insights.push(`You\'ve experienced low mood on ${lowMoodPercentage.toFixed(0)}% of tracked days`);
            recommendations.push('Consider speaking with a mental health professional');
            recommendations.push('Focus on identifying and managing mood triggers');
        } else if (lowMoodPercentage < 10) {
            insights.push('You\'ve maintained good emotional resilience');
            recommendations.push('Your mood management strategies are working well');
        }

        // Consistency insights
        if (consistency.isHighlyVariable) {
            insights.push('Your mood shows significant day-to-day variation');
            recommendations.push('Try to identify patterns or triggers for mood changes');
            recommendations.push('Consider maintaining a mood journal with notes about daily events');
        } else if (consistency.isVeryStable) {
            insights.push('Your mood has been remarkably consistent');
            recommendations.push('Your emotional regulation strategies are very effective');
        }

        // Volatility insights
        if (volatility.isHigh) {
            insights.push('You\'ve experienced some significant mood swings');
            recommendations.push('Practice mindfulness and grounding techniques');
            recommendations.push('Consider tracking potential triggers for mood changes');
        }

        // Pattern-specific insights
        if (patterns.weekendEffect) {
            insights.push('Your mood tends to be different on weekends');
            recommendations.push('Consider how your weekend routine affects your wellbeing');
        }

        if (patterns.recentStreak) {
            if (patterns.recentStreak.type === 'positive') {
                insights.push(`You\'ve had ${patterns.recentStreak.length} consecutive days of good mood!`);
                recommendations.push('Celebrate this positive streak and identify what\'s contributing to it');
            } else {
                insights.push(`You\'ve had ${patterns.recentStreak.length} consecutive days of low mood`);
                recommendations.push('Consider reaching out for support during this difficult period');
                recommendations.push('Focus on small, manageable self-care activities');
            }
        }

        // Weekly comparison insights
        if (weeklyAvg && monthlyAvg) {
            const weeklyChange = parseFloat(weeklyAvg) - parseFloat(monthlyAvg);
            if (Math.abs(weeklyChange) > 0.5) {
                if (weeklyChange > 0) {
                    insights.push('Your mood has been better this week compared to your monthly average');
                } else {
                    insights.push('Your mood has been lower this week compared to your monthly average');
                }
            }
        }

        return {
            hasPatterns: true,
            trends,
            avgMood,
            weeklyAvg,
            monthlyAvg,
            distribution,
            patterns,
            consistency,
            volatility,
            insights,
            recommendations,
            lowMoodPercentage
        };
    }

    detectMoodPatterns() {
        if (this.moodHistory.length < 7) return {};

        const patterns = {};
        
        // Check for weekend effect (if we have day-of-week data)
        const weekendMoods = [];
        const weekdayMoods = [];
        
        this.moodHistory.forEach(entry => {
            const date = new Date(entry.date);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                weekendMoods.push(entry.mood);
            } else {
                weekdayMoods.push(entry.mood);
            }
        });

        if (weekendMoods.length > 0 && weekdayMoods.length > 0) {
            const weekendAvg = weekendMoods.reduce((a, b) => a + b, 0) / weekendMoods.length;
            const weekdayAvg = weekdayMoods.reduce((a, b) => a + b, 0) / weekdayMoods.length;
            
            if (Math.abs(weekendAvg - weekdayAvg) > 0.5) {
                patterns.weekendEffect = {
                    weekendAvg: weekendAvg.toFixed(1),
                    weekdayAvg: weekdayAvg.toFixed(1),
                    difference: (weekendAvg - weekdayAvg).toFixed(1)
                };
            }
        }

        // Check for recent streaks
        let currentStreak = 1;
        let streakType = null;
        
        if (this.moodHistory.length > 1) {
            const recentMood = this.moodHistory[0].mood;
            streakType = recentMood >= 4 ? 'positive' : recentMood <= 2 ? 'negative' : 'neutral';
            
            for (let i = 1; i < Math.min(this.moodHistory.length, 7); i++) {
                const mood = this.moodHistory[i].mood;
                const moodType = mood >= 4 ? 'positive' : mood <= 2 ? 'negative' : 'neutral';
                
                if (moodType === streakType) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            
            if (currentStreak >= 3 && streakType !== 'neutral') {
                patterns.recentStreak = {
                    length: currentStreak,
                    type: streakType
                };
            }
        }

        return patterns;
    }

    calculateMoodConsistency() {
        if (this.moodHistory.length < 3) return { isVeryStable: false, isHighlyVariable: false };

        const moods = this.moodHistory.map(m => m.mood);
        const mean = moods.reduce((a, b) => a + b, 0) / moods.length;
        const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - mean, 2), 0) / moods.length;
        const standardDeviation = Math.sqrt(variance);

        return {
            standardDeviation: standardDeviation.toFixed(2),
            isVeryStable: standardDeviation < 0.5,
            isHighlyVariable: standardDeviation > 1.2,
            consistency: standardDeviation < 0.5 ? 'very stable' : 
                        standardDeviation < 1.0 ? 'stable' : 
                        standardDeviation < 1.5 ? 'variable' : 'highly variable'
        };
    }

    calculateMoodVolatility() {
        if (this.moodHistory.length < 2) return { isHigh: false, maxChange: 0 };

        let maxChange = 0;
        let significantChanges = 0;

        for (let i = 0; i < this.moodHistory.length - 1; i++) {
            const change = Math.abs(this.moodHistory[i].mood - this.moodHistory[i + 1].mood);
            maxChange = Math.max(maxChange, change);
            
            if (change >= 2) {
                significantChanges++;
            }
        }

        return {
            maxChange,
            significantChanges,
            isHigh: maxChange >= 3 || significantChanges >= 2,
            volatilityLevel: maxChange >= 3 ? 'high' : 
                           maxChange >= 2 ? 'moderate' : 'low'
        };
    }

    // Generate mood chart data for visualization
    getMoodChartData(days = 30) {
        const recentMoods = this.moodHistory
            .slice(0, days)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return recentMoods.map(mood => ({
            date: mood.date,
            mood: mood.mood,
            notes: mood.notes
        }));
    }

    // Check if user needs enhanced support
    needsEnhancedSupport() {
        if (this.moodHistory.length < 5) return false;

        const recentMoods = this.moodHistory.slice(0, 5);
        const lowMoodCount = recentMoods.filter(m => m.mood <= 2).length;
        
        return lowMoodCount >= 3; // 3 or more low mood days in last 5 entries
    }

    async getEnhancedSupportMessage() {
        try {
            // Try AI service first for personalized enhanced support
            if (window.aiService && window.aiService.isAvailable()) {
                const context = {
                    consistentLowMood: true,
                    moodHistory: this.moodHistory.slice(0, 10), // Last 10 days
                    moodTrends: this.calculateMoodTrends(7),
                    userProfile: this.getUserMoodProfile(),
                    needsProfessionalSupport: true
                };
                
                const aiSupportMessage = await window.aiService.getEnhancedMentalHealthSupport(context);
                if (aiSupportMessage && aiSupportMessage.trim().length > 0) {
                    return aiSupportMessage;
                }
            }
        } catch (error) {
            console.error('AI enhanced support generation failed:', error);
            if (window.errorHandler) {
                await window.errorHandler.handleError('AI_ENHANCED_SUPPORT_ERROR', error);
            }
        }

        // Fallback to predefined support messages
        const supportMessages = [
            "We've noticed you've been having some difficult days. Remember that it's okay to seek support when you need it.",
            "Your mental health is just as important as your physical health. Consider reaching out to a counselor or therapist.",
            "You're not alone in this journey. Many people find it helpful to talk to a mental health professional.",
            "Taking care of your emotional wellbeing is a sign of strength, not weakness. Professional support can make a real difference."
        ];

        return supportMessages[Math.floor(Math.random() * supportMessages.length)];
    }

    // Helper methods for enhanced AI context
    getRecentMoodTrend() {
        if (this.moodHistory.length < 3) return 'insufficient_data';
        
        const recent = this.moodHistory.slice(0, 3);
        const older = this.moodHistory.slice(3, 6);
        
        if (recent.length === 0 || older.length === 0) return 'insufficient_data';
        
        const recentAvg = recent.reduce((sum, m) => sum + m.mood, 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + m.mood, 0) / older.length;
        
        const difference = recentAvg - olderAvg;
        
        if (difference > 0.5) return 'improving';
        if (difference < -0.5) return 'declining';
        return 'stable';
    }

    getUserMoodProfile() {
        if (this.moodHistory.length < 5) return { profile: 'new_user', confidence: 'low' };
        
        const moods = this.moodHistory.map(m => m.mood);
        const average = moods.reduce((a, b) => a + b, 0) / moods.length;
        const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - average, 2), 0) / moods.length;
        const standardDeviation = Math.sqrt(variance);
        
        let profile = 'balanced';
        if (average >= 4) profile = 'generally_positive';
        else if (average <= 2.5) profile = 'struggling';
        else if (standardDeviation > 1.2) profile = 'variable';
        
        const confidence = this.moodHistory.length >= 14 ? 'high' : 
                          this.moodHistory.length >= 7 ? 'medium' : 'low';
        
        return {
            profile,
            average: average.toFixed(1),
            stability: standardDeviation < 0.8 ? 'stable' : 'variable',
            confidence,
            dataPoints: this.moodHistory.length
        };
    }

    analyzeMoodContext() {
        const patterns = this.detectMoodPatterns();
        const trends = this.calculateMoodTrends(7);
        const consistency = this.calculateMoodConsistency();
        
        return {
            hasRecentStreak: patterns.recentStreak ? true : false,
            streakType: patterns.recentStreak?.type || null,
            weekendEffect: patterns.weekendEffect ? true : false,
            trendDirection: trends.trend,
            stabilityLevel: consistency.consistency,
            needsSupport: this.needsEnhancedSupport()
        };
    }

    parseStrategiesFromText(text) {
        // Parse AI-generated text into an array of strategies
        const lines = text.split('\n').filter(line => line.trim());
        const strategies = [];
        
        lines.forEach(line => {
            const trimmed = line.trim();
            // Look for numbered lists, bullet points, or strategy indicators
            if (trimmed.match(/^\d+\./) || trimmed.startsWith('-') || trimmed.startsWith('•') || 
                trimmed.toLowerCase().includes('strategy') || trimmed.toLowerCase().includes('try')) {
                const strategy = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '');
                if (strategy.length > 10) { // Filter out very short lines
                    strategies.push(strategy);
                }
            }
        });
        
        // If no structured list found, split by sentences and take meaningful ones
        if (strategies.length === 0) {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
            return sentences.slice(0, 4); // Return up to 4 strategies
        }
        
        return strategies.slice(0, 5); // Return up to 5 strategies
    }
}

// Initialize Mental Health Service
window.mentalHealthService = new MentalHealthService();