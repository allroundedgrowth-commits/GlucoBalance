// GlucoBalance - Database Management (Kiro Database Integration)
class KiroDatabase {
    constructor() {
        this.dbName = 'GlucoBalanceDB';
        this.version = 1;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            this.db = await this.openDatabase();
            console.log('Kiro Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            // Fallback to localStorage
            this.useLocalStorage = true;
        }
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Users table
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('createdAt', 'createdAt');
                }

                // Risk Assessments table (Kiro RiskAssessments)
                if (!db.objectStoreNames.contains('assessments')) {
                    const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id', autoIncrement: true });
                    assessmentStore.createIndex('userId', 'user_id');
                    assessmentStore.createIndex('user_id', 'user_id');
                    assessmentStore.createIndex('date', 'date');
                    assessmentStore.createIndex('createdAt', 'createdAt');
                    assessmentStore.createIndex('score', 'score');
                    assessmentStore.createIndex('category', 'category');
                    assessmentStore.createIndex('riskScore', 'score'); // Legacy compatibility
                }

                // Mental Health Logs table (Kiro MentalHealthLogs)
                if (!db.objectStoreNames.contains('moods')) {
                    const moodStore = db.createObjectStore('moods', { keyPath: 'id', autoIncrement: true });
                    moodStore.createIndex('userId', 'userId');
                    moodStore.createIndex('date', 'date', { unique: false });
                    moodStore.createIndex('mood', 'mood');
                    moodStore.createIndex('createdAt', 'createdAt');
                    moodStore.createIndex('notes', 'notes');
                }

                // MentalHealthLogs table (alias for moods for Kiro compatibility)
                if (!db.objectStoreNames.contains('MentalHealthLogs')) {
                    const mentalHealthStore = db.createObjectStore('MentalHealthLogs', { keyPath: 'id', autoIncrement: true });
                    mentalHealthStore.createIndex('userId', 'userId');
                    mentalHealthStore.createIndex('date', 'date', { unique: false });
                    mentalHealthStore.createIndex('mood', 'mood');
                    mentalHealthStore.createIndex('notes', 'notes');
                    mentalHealthStore.createIndex('createdAt', 'createdAt');
                    mentalHealthStore.createIndex('affirmation', 'affirmation');
                    mentalHealthStore.createIndex('copingStrategies', 'copingStrategies');
                }

                // Nutrition Plans table
                if (!db.objectStoreNames.contains('nutritionPlans')) {
                    const nutritionStore = db.createObjectStore('nutritionPlans', { keyPath: 'id', autoIncrement: true });
                    nutritionStore.createIndex('userId', 'userId');
                    nutritionStore.createIndex('createdAt', 'createdAt');
                    nutritionStore.createIndex('planType', 'planType');
                }

                // Progress Tracking table
                if (!db.objectStoreNames.contains('progress')) {
                    const progressStore = db.createObjectStore('progress', { keyPath: 'id', autoIncrement: true });
                    progressStore.createIndex('userId', 'userId');
                    progressStore.createIndex('date', 'date');
                    progressStore.createIndex('metricType', 'metricType');
                }
            };
        });
    }

    // User Management
    async createUser(userData) {
        const user = {
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const users = this.getFromLocalStorage('users') || [];
            user.id = users.length + 1;
            users.push(user);
            this.saveToLocalStorage('users', users);
            
            // Queue for offline sync
            if (window.offlineManager && !navigator.onLine) {
                await window.offlineManager.queueOperation('create', 'users', user);
                document.dispatchEvent(new CustomEvent('offlineOperationQueued', {
                    detail: { operation: 'create', table: 'users', data: user }
                }));
            }
            
            return user;
        }

        try {
            const result = await this.performTransaction('users', 'readwrite', (store) => {
                return store.add(user);
            });
            
            // Enhanced offline sync queuing with better error handling
            if (window.offlineManager && (!navigator.onLine || this.shouldQueueOperation())) {
                try {
                    await window.offlineManager.queueOperation('create', 'users', user, result.id || result);
                    this.dispatchOfflineEvent('create', 'users', user, 'User creation queued for sync');
                } catch (queueError) {
                    console.warn('Failed to queue user creation for sync:', queueError);
                    // Continue execution even if queuing fails
                }
            }
            
            return result;
        } catch (error) {
            console.error('User creation failed:', error);
            
            // Enhanced fallback: try to queue for offline sync even on failure
            if (window.offlineManager) {
                try {
                    await window.offlineManager.queueOperation('create', 'users', user);
                    this.dispatchOfflineEvent('create', 'users', user, 'User creation failed but queued for retry');
                    
                    // Return a temporary user object for immediate use
                    const tempUser = {
                        ...user,
                        id: `temp_${Date.now()}`,
                        _temporary: true,
                        _queuedForSync: true
                    };
                    
                    return tempUser;
                } catch (queueError) {
                    console.error('Failed to queue user creation for offline sync:', queueError);
                }
            }
            throw error;
        }
    }

    async getUser(userId) {
        if (this.useLocalStorage) {
            const users = this.getFromLocalStorage('users') || [];
            return users.find(u => u.id === userId);
        }

        return this.performTransaction('users', 'readonly', (store) => {
            return store.get(userId);
        });
    }

    async updateUser(userId, updates) {
        if (this.useLocalStorage) {
            const users = this.getFromLocalStorage('users') || [];
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
                this.saveToLocalStorage('users', users);
                return users[userIndex];
            }
            return null;
        }

        const user = await this.getUser(userId);
        if (user) {
            const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
            return this.performTransaction('users', 'readwrite', (store) => {
                return store.put(updatedUser);
            });
        }
        return null;
    }

    // Risk Assessment Management
    async saveAssessment(userId, assessmentData) {
        const assessment = {
            userId,
            ...assessmentData,
            createdAt: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const assessments = this.getFromLocalStorage('assessments') || [];
            assessment.id = assessments.length + 1;
            assessments.push(assessment);
            this.saveToLocalStorage('assessments', assessments);
            return assessment;
        }

        return this.performTransaction('assessments', 'readwrite', (store) => {
            return store.add(assessment);
        });
    }

    async getUserAssessments(userId, limit = 10) {
        if (this.useLocalStorage) {
            const assessments = this.getFromLocalStorage('assessments') || [];
            return assessments
                .filter(a => a.userId === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        }

        return this.performTransaction('assessments', 'readonly', (store) => {
            const index = store.index('userId');
            return index.getAll(userId);
        });
    }

    async getLatestAssessment(userId) {
        const assessments = await this.getUserAssessments(userId, 1);
        return assessments.length > 0 ? assessments[0] : null;
    }

    // Mood Tracking (Mental Health Logs)
    async saveMood(userId, date, mood, notes = '', affirmation = '', copingStrategies = []) {
        const moodEntry = {
            userId,
            date,
            mood: parseInt(mood),
            notes,
            affirmation,
            copingStrategies: Array.isArray(copingStrategies) ? copingStrategies : [],
            createdAt: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const moods = this.getFromLocalStorage('moods') || [];
            // Remove existing mood for the same date
            const filteredMoods = moods.filter(m => !(m.userId === userId && m.date === date));
            moodEntry.id = moods.length + 1;
            filteredMoods.push(moodEntry);
            this.saveToLocalStorage('moods', filteredMoods);
            
            // Queue for offline sync
            if (window.offlineManager && !navigator.onLine) {
                await window.offlineManager.queueOperation('create', 'moods', moodEntry);
                document.dispatchEvent(new CustomEvent('offlineOperationQueued', {
                    detail: { operation: 'create', table: 'moods', data: moodEntry }
                }));
            }
            
            return moodEntry;
        }

        try {
            // Check if mood already exists for this date
            const existingMood = await this.getMoodByDate(userId, date);
            
            if (existingMood) {
                const updatedMood = { ...existingMood, mood: parseInt(mood), notes, updatedAt: new Date().toISOString() };
                const result = await this.performTransaction('moods', 'readwrite', (store) => {
                    return store.put(updatedMood);
                });
                
                // Queue for offline sync if offline
                if (window.offlineManager && !navigator.onLine) {
                    await window.offlineManager.queueOperation('update', 'moods', updatedMood, existingMood.id);
                }
                
                return result;
            }

            const result = await this.performTransaction('moods', 'readwrite', (store) => {
                return store.add(moodEntry);
            });
            
            // Queue for offline sync if offline
            if (window.offlineManager && !navigator.onLine) {
                await window.offlineManager.queueOperation('create', 'moods', moodEntry, result.id);
            }
            
            return result;
        } catch (error) {
            // If operation fails, queue for offline sync
            if (window.offlineManager) {
                await window.offlineManager.queueOperation('create', 'moods', moodEntry);
                document.dispatchEvent(new CustomEvent('offlineOperationQueued', {
                    detail: { operation: 'create', table: 'moods', data: moodEntry }
                }));
            }
            throw error;
        }
    }

    async getMoodByDate(userId, date) {
        if (this.useLocalStorage) {
            const moods = this.getFromLocalStorage('moods') || [];
            return moods.find(m => m.userId === userId && m.date === date);
        }

        return this.performTransaction('moods', 'readonly', (store) => {
            const index = store.index('userId');
            return index.getAll(userId).then(moods => 
                moods.find(m => m.date === date)
            );
        });
    }

    async getUserMoods(userId, days = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

        if (this.useLocalStorage) {
            const moods = this.getFromLocalStorage('moods') || [];
            return moods
                .filter(m => {
                    const moodDate = new Date(m.date);
                    return m.userId === userId && moodDate >= startDate && moodDate <= endDate;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return this.performTransaction('moods', 'readonly', (store) => {
            const index = store.index('userId');
            return index.getAll(userId).then(moods => 
                moods
                    .filter(m => {
                        const moodDate = new Date(m.date);
                        return moodDate >= startDate && moodDate <= endDate;
                    })
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
            );
        });
    }

    // Nutrition Plan Management
    async saveNutritionPlan(userId, planData) {
        const plan = {
            userId,
            ...planData,
            createdAt: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const plans = this.getFromLocalStorage('nutritionPlans') || [];
            plan.id = plans.length + 1;
            plans.push(plan);
            this.saveToLocalStorage('nutritionPlans', plans);
            return plan;
        }

        return this.performTransaction('nutritionPlans', 'readwrite', (store) => {
            return store.add(plan);
        });
    }

    async getUserNutritionPlans(userId, limit = 5) {
        if (this.useLocalStorage) {
            const plans = this.getFromLocalStorage('nutritionPlans') || [];
            return plans
                .filter(p => p.userId === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        }

        return this.performTransaction('nutritionPlans', 'readonly', (store) => {
            const index = store.index('userId');
            return index.getAll(userId);
        });
    }

    // Progress Tracking
    async saveProgress(userId, metricType, value, date = null) {
        const progress = {
            userId,
            metricType,
            value,
            date: date || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const progressData = this.getFromLocalStorage('progress') || [];
            progress.id = progressData.length + 1;
            progressData.push(progress);
            this.saveToLocalStorage('progress', progressData);
            return progress;
        }

        return this.performTransaction('progress', 'readwrite', (store) => {
            return store.add(progress);
        });
    }

    async getUserProgress(userId, metricType = null, days = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

        if (this.useLocalStorage) {
            const progressData = this.getFromLocalStorage('progress') || [];
            return progressData
                .filter(p => {
                    const progressDate = new Date(p.date);
                    const matchesUser = p.userId === userId;
                    const matchesType = !metricType || p.metricType === metricType;
                    const matchesDate = progressDate >= startDate && progressDate <= endDate;
                    return matchesUser && matchesType && matchesDate;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        return this.performTransaction('progress', 'readonly', (store) => {
            const index = store.index('userId');
            return index.getAll(userId).then(progressData => 
                progressData
                    .filter(p => {
                        const progressDate = new Date(p.date);
                        const matchesType = !metricType || p.metricType === metricType;
                        const matchesDate = progressDate >= startDate && progressDate <= endDate;
                        return matchesType && matchesDate;
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
            );
        });
    }

    // Utility Methods
    async performTransaction(storeName, mode, operation) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            
            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => resolve();

            const request = operation(store);
            if (request) {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            }
        });
    }

    // Enhanced offline support methods
    shouldQueueOperation() {
        // Determine if operation should be queued based on various factors
        return !navigator.onLine || 
               this.isInOfflineMode() || 
               this.hasNetworkIssues();
    }

    isInOfflineMode() {
        // Check if app is explicitly in offline mode
        return window.offlineManager && window.offlineManager.isOfflineMode;
    }

    hasNetworkIssues() {
        // Check for network connectivity issues
        return navigator.connection && 
               (navigator.connection.effectiveType === 'slow-2g' || 
                navigator.connection.downlink < 0.5);
    }

    dispatchOfflineEvent(operation, table, data, message) {
        // Enhanced event dispatching with more details
        const event = new CustomEvent('offlineOperationQueued', {
            detail: { 
                operation, 
                table, 
                data,
                message,
                timestamp: new Date().toISOString(),
                networkStatus: navigator.onLine ? 'online' : 'offline',
                queueReason: this.getQueueReason()
            }
        });
        document.dispatchEvent(event);
    }

    getQueueReason() {
        if (!navigator.onLine) return 'offline';
        if (this.isInOfflineMode()) return 'offline-mode';
        if (this.hasNetworkIssues()) return 'poor-connection';
        return 'precautionary';
    }

    // Enhanced LocalStorage fallback methods with compression and validation
    getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`glucobalance-${key}`);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            
            // Validate data structure
            if (this.validateStoredData(key, parsed)) {
                return parsed;
            } else {
                console.warn(`Invalid data structure for key: ${key}`);
                this.clearLocalStorageKey(key);
                return null;
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            // Try to recover by clearing corrupted data
            this.clearLocalStorageKey(key);
            return null;
        }
    }

    saveToLocalStorage(key, data) {
        try {
            // Add metadata for better data management
            const dataWithMetadata = {
                data,
                timestamp: new Date().toISOString(),
                version: '1.0',
                checksum: this.calculateChecksum(data)
            };
            
            const serialized = JSON.stringify(dataWithMetadata);
            
            // Check storage quota
            if (this.checkStorageQuota(serialized.length)) {
                localStorage.setItem(`glucobalance-${key}`, serialized);
            } else {
                console.warn('Storage quota exceeded, cleaning up old data');
                this.cleanupOldData();
                localStorage.setItem(`glucobalance-${key}`, serialized);
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded(key, data);
            }
        }
    }

    validateStoredData(key, data) {
        // Validate data structure based on key type
        if (!data || typeof data !== 'object') return false;
        
        // Check for metadata
        if (!data.data || !data.timestamp) return false;
        
        // Validate checksum if available
        if (data.checksum && !this.verifyChecksum(data.data, data.checksum)) {
            console.warn('Data checksum validation failed');
            return false;
        }
        
        return true;
    }

    calculateChecksum(data) {
        // Simple checksum calculation for data integrity
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    verifyChecksum(data, expectedChecksum) {
        return this.calculateChecksum(data) === expectedChecksum;
    }

    checkStorageQuota(dataSize) {
        try {
            // Estimate current storage usage
            let currentUsage = 0;
            for (let key in localStorage) {
                if (key.startsWith('glucobalance-')) {
                    currentUsage += localStorage[key].length;
                }
            }
            
            // Assume 5MB quota (conservative estimate)
            const quotaLimit = 5 * 1024 * 1024;
            return (currentUsage + dataSize) < quotaLimit;
        } catch (error) {
            console.error('Error checking storage quota:', error);
            return true; // Assume it's okay if we can't check
        }
    }

    cleanupOldData() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('glucobalance-'));
            const dataWithTimestamps = [];
            
            keys.forEach(key => {
                try {
                    const data = JSON.parse(localStorage[key]);
                    if (data.timestamp) {
                        dataWithTimestamps.push({
                            key,
                            timestamp: new Date(data.timestamp),
                            size: localStorage[key].length
                        });
                    }
                } catch (error) {
                    // Remove corrupted entries
                    localStorage.removeItem(key);
                }
            });
            
            // Sort by timestamp (oldest first) and remove oldest 20%
            dataWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);
            const toRemove = Math.ceil(dataWithTimestamps.length * 0.2);
            
            for (let i = 0; i < toRemove; i++) {
                localStorage.removeItem(dataWithTimestamps[i].key);
                console.log(`Cleaned up old data: ${dataWithTimestamps[i].key}`);
            }
        } catch (error) {
            console.error('Error during data cleanup:', error);
        }
    }

    handleStorageQuotaExceeded(key, data) {
        console.warn('Storage quota exceeded, attempting emergency cleanup');
        
        // Emergency cleanup: remove all but essential data
        const essentialKeys = ['users', 'assessments', 'moods'];
        const allKeys = Object.keys(localStorage).filter(k => k.startsWith('glucobalance-'));
        
        allKeys.forEach(storageKey => {
            const dataType = storageKey.replace('glucobalance-', '');
            if (!essentialKeys.includes(dataType)) {
                localStorage.removeItem(storageKey);
            }
        });
        
        // Try saving again
        try {
            localStorage.setItem(`glucobalance-${key}`, JSON.stringify({
                data,
                timestamp: new Date().toISOString(),
                version: '1.0'
            }));
        } catch (error) {
            console.error('Failed to save even after cleanup:', error);
            // Dispatch event to notify user
            document.dispatchEvent(new CustomEvent('storageQuotaExceeded', {
                detail: { key, error: error.message }
            }));
        }
    }

    clearLocalStorageKey(key) {
        try {
            localStorage.removeItem(`glucobalance-${key}`);
        } catch (error) {
            console.error('Error clearing localStorage key:', error);
        }
    }

    // Analytics and Reporting
    async generateHealthReport(userId, days = 30) {
        const [assessments, moods, progress] = await Promise.all([
            this.getUserAssessments(userId, 5),
            this.getUserMoods(userId, days),
            this.getUserProgress(userId, null, days)
        ]);

        return {
            assessments,
            moods,
            progress,
            summary: {
                totalMoodEntries: moods.length,
                averageMood: moods.length > 0 ? moods.reduce((sum, m) => sum + m.mood, 0) / moods.length : 0,
                latestRiskScore: assessments.length > 0 ? assessments[0].riskScore : null,
                progressMetrics: this.summarizeProgress(progress)
            }
        };
    }

    summarizeProgress(progressData) {
        const metrics = {};
        progressData.forEach(p => {
            if (!metrics[p.metricType]) {
                metrics[p.metricType] = [];
            }
            metrics[p.metricType].push({ date: p.date, value: p.value });
        });

        Object.keys(metrics).forEach(key => {
            metrics[key].sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        return metrics;
    }
}

// Initialize database
window.kiroDb = new KiroDatabase();
//# sourceMappingURL=database.js.map