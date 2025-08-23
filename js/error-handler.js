// GlucoBalance - Comprehensive Error Handling and Fallback Systems
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.retryAttempts = new Map(); // Track retry attempts per operation
        this.circuitBreakers = new Map(); // Circuit breaker pattern for services
        this.fallbackCache = new Map(); // Cache for fallback content
        this.networkStatus = navigator.onLine;
        this.recoveryStrategies = new Map(); // Custom recovery strategies
        this.init();
    }

    init() {
        // Set up global error handlers
        window.addEventListener('error', (event) => {
            this.handleError('GLOBAL_ERROR', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('UNHANDLED_PROMISE', event.reason, {
                promise: event.promise
            });
        });

        // Network connectivity monitoring
        window.addEventListener('online', () => {
            this.networkStatus = true;
            this.handleNetworkStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.networkStatus = false;
            this.handleNetworkStatusChange(false);
        });

        // Initialize circuit breakers for critical services
        this.initializeCircuitBreakers();
        
        // Initialize fallback content cache
        this.initializeFallbackCache();

        // Set up recovery strategies
        this.initializeRecoveryStrategies();

        console.log('Comprehensive error handling system initialized');
    }

    async handleError(type, error, context = {}) {
        const errorEntry = {
            id: Date.now(),
            type,
            message: error?.message || error?.toString() || 'Unknown error',
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Add to in-memory log
        this.errorLog.unshift(errorEntry);
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }

        // Store in localStorage for persistence
        try {
            localStorage.setItem('glucobalance-errors', JSON.stringify(this.errorLog));
        } catch (e) {
            console.warn('Could not save error log to localStorage:', e);
        }

        // Log to console in development
        if (this.isDevelopment()) {
            console.error(`[${type}]`, error, context);
        }

        // Send to monitoring service in production (placeholder)
        if (this.isProduction()) {
            this.sendToMonitoring(errorEntry);
        }

        return errorEntry;
    }

    // Specific error handlers for different components
    async handleDatabaseError(error, operation, fallbackAction = null) {
        const errorEntry = await this.handleError('DATABASE_ERROR', error, {
            operation,
            fallbackAvailable: !!fallbackAction
        });

        // Try automatic recovery first
        const recovered = await this.attemptRecovery('database_connection_failed');
        if (recovered) {
            // Retry the original operation
            try {
                return await operation();
            } catch (retryError) {
                console.warn('Operation failed after database recovery:', retryError);
            }
        }

        // Execute fallback if available
        if (fallbackAction && typeof fallbackAction === 'function') {
            try {
                const result = await fallbackAction();
                this.showUserNotification(
                    'Using offline mode due to database issues. Data will sync when connection is restored.',
                    'warning',
                    8000
                );
                return result;
            } catch (fallbackError) {
                await this.handleError('FALLBACK_ERROR', fallbackError, {
                    originalOperation: operation
                });
                throw fallbackError;
            }
        }

        // Show user-friendly error with recovery options
        this.showUserNotification(
            this.getUserFriendlyMessage('DATABASE_ERROR', error),
            'error',
            10000,
            [
                {
                    id: 'retry',
                    label: 'Retry',
                    handler: () => window.location.reload()
                },
                {
                    id: 'offline',
                    label: 'Continue Offline',
                    handler: () => {
                        // Enable offline mode
                        if (window.offlineManager) {
                            window.offlineManager.enableOfflineMode();
                        }
                    }
                }
            ]
        );

        throw error;
    }

    async handleAIError(error, fallbackContent = null, context = {}) {
        const errorEntry = await this.handleError('AI_SERVICE_ERROR', error, {
            hasFallback: !!fallbackContent,
            context: context
        });

        // Try to recover AI service
        const recovered = await this.attemptRecovery('ai_service_failed');
        if (recovered && context.retryOperation) {
            try {
                return await context.retryOperation();
            } catch (retryError) {
                console.warn('AI operation failed after recovery:', retryError);
            }
        }

        // Use provided fallback content
        if (fallbackContent) {
            this.showUserNotification(
                'AI service temporarily unavailable. Using alternative content.',
                'warning',
                5000
            );
            return fallbackContent;
        }

        // Use cached fallback content based on context
        const contentType = this.determineAIContentType(error, context);
        const cachedFallback = this.getFallbackContent(contentType, context);
        
        if (cachedFallback) {
            this.showUserNotification(
                'AI insights temporarily unavailable. Showing alternative guidance.',
                'info',
                5000
            );
            return cachedFallback;
        }

        // Return generic fallback message
        return this.getGenericAIFallback(error);
    }

    determineAIContentType(error, context) {
        const errorMessage = error?.message?.toLowerCase() || '';
        const contextType = context?.type?.toLowerCase() || '';
        
        if (contextType.includes('risk') || errorMessage.includes('risk')) {
            return 'ai_risk_explanation';
        }
        if (contextType.includes('mood') || errorMessage.includes('mood')) {
            return 'ai_mood_support';
        }
        if (contextType.includes('nutrition') || errorMessage.includes('nutrition')) {
            return 'ai_nutrition_tips';
        }
        if (contextType.includes('coping') || errorMessage.includes('coping')) {
            return 'ai_coping_strategies';
        }
        
        return 'ai_content';
    }

    async handleNetworkError(error, retryFunction = null, options = {}) {
        const {
            maxRetries = 3,
            enableOfflineMode = true,
            showUserGuidance = true
        } = options;

        const errorEntry = await this.handleError('NETWORK_ERROR', error, {
            canRetry: !!retryFunction,
            maxRetries,
            networkStatus: this.networkStatus
        });

        // Check if we're actually offline
        if (!this.networkStatus) {
            if (enableOfflineMode && window.offlineManager) {
                await window.offlineManager.enableOfflineMode();
                this.showUserNotification(
                    'You\'re offline. Working in offline mode - data will sync when connection returns.',
                    'info',
                    8000
                );
                return null; // Indicate offline mode
            }
        }

        // Implement enhanced retry logic with circuit breaker
        if (retryFunction && typeof retryFunction === 'function') {
            try {
                return await this.retryWithBackoff(retryFunction, {
                    maxRetries,
                    baseDelay: 1000,
                    backoffFactor: 2,
                    jitter: true,
                    retryCondition: (error, attempt) => {
                        // Don't retry if we're offline
                        if (!navigator.onLine) return false;
                        
                        // Don't retry client errors (4xx)
                        if (error.status >= 400 && error.status < 500) return false;
                        
                        return true;
                    }
                });
            } catch (retryError) {
                await this.handleError('RETRY_EXHAUSTED', retryError, {
                    attempts: maxRetries,
                    originalError: error.message
                });

                if (showUserGuidance) {
                    this.showUserNotification(
                        'Connection issues persist. Please check your internet connection.',
                        'error',
                        10000,
                        [
                            {
                                id: 'retry',
                                label: 'Try Again',
                                handler: () => window.location.reload()
                            },
                            {
                                id: 'offline',
                                label: 'Work Offline',
                                handler: () => {
                                    if (window.offlineManager) {
                                        window.offlineManager.enableOfflineMode();
                                    }
                                }
                            }
                        ]
                    );
                }

                throw retryError;
            }
        }

        throw error;
    }

    async handleValidationError(error, field, value, suggestions = []) {
        const errorEntry = await this.handleError('VALIDATION_ERROR', error, {
            field,
            value: typeof value === 'string' ? value.substring(0, 100) : value,
            suggestions
        });

        // Show user-friendly validation guidance
        const fieldName = this.getFieldDisplayName(field);
        let message = `Please check your ${fieldName}`;
        
        if (suggestions.length > 0) {
            message += `. Suggestions: ${suggestions.join(', ')}`;
        }

        this.showUserNotification(message, 'warning', 7000);

        // Highlight the problematic field if it exists
        const fieldElement = document.querySelector(`[name="${field}"], #${field}, .${field}`);
        if (fieldElement) {
            fieldElement.classList.add('error-highlight');
            fieldElement.focus();
            
            // Remove highlight after user interaction
            const removeHighlight = () => {
                fieldElement.classList.remove('error-highlight');
                fieldElement.removeEventListener('input', removeHighlight);
                fieldElement.removeEventListener('change', removeHighlight);
            };
            
            fieldElement.addEventListener('input', removeHighlight);
            fieldElement.addEventListener('change', removeHighlight);
        }

        return errorEntry;
    }

    getFieldDisplayName(field) {
        const fieldNames = {
            'email': 'email address',
            'password': 'password',
            'age': 'age',
            'name': 'name',
            'mood': 'mood rating',
            'apiKey': 'API key',
            'riskScore': 'risk assessment'
        };
        
        return fieldNames[field] || field.replace(/([A-Z])/g, ' $1').toLowerCase();
    }

    // Enhanced user-friendly error messages with recovery guidance
    getUserFriendlyMessage(errorType, error, context = {}) {
        const baseMessages = {
            'DATABASE_ERROR': {
                message: 'Unable to save your data right now.',
                guidance: 'Your data will be saved locally and synced when the connection is restored.',
                actions: ['Try working offline', 'Refresh the page', 'Check your connection']
            },
            'AI_SERVICE_ERROR': {
                message: 'AI insights are temporarily unavailable.',
                guidance: 'We\'ve provided alternative guidance based on medical best practices.',
                actions: ['Continue with standard recommendations', 'Try again later', 'Check API key settings']
            },
            'NETWORK_ERROR': {
                message: 'Connection issue detected.',
                guidance: 'You can continue working offline. Data will sync when connection returns.',
                actions: ['Work offline', 'Check internet connection', 'Try again']
            },
            'VALIDATION_ERROR': {
                message: 'Please check your input.',
                guidance: 'Make sure all required fields are filled correctly.',
                actions: ['Review your input', 'Check field requirements', 'Try again']
            },
            'GLOBAL_ERROR': {
                message: 'Something unexpected happened.',
                guidance: 'This is usually temporary. Refreshing the page often resolves the issue.',
                actions: ['Refresh the page', 'Clear browser cache', 'Try again later']
            },
            'UNHANDLED_PROMISE': {
                message: 'An unexpected error occurred.',
                guidance: 'This might be a temporary issue with the application.',
                actions: ['Refresh the page', 'Try the action again', 'Report if it persists']
            },
            'SYNC_ERROR': {
                message: 'Unable to sync your data.',
                guidance: 'Your data is safe locally and will sync when connection improves.',
                actions: ['Continue working', 'Check connection', 'Try manual sync later']
            },
            'STORAGE_ERROR': {
                message: 'Unable to save data locally.',
                guidance: 'Your browser storage might be full or restricted.',
                actions: ['Clear browser data', 'Free up storage space', 'Check privacy settings']
            }
        };

        const errorInfo = baseMessages[errorType] || {
            message: 'An unexpected error occurred.',
            guidance: 'Please try again or contact support if the issue persists.',
            actions: ['Try again', 'Refresh the page', 'Contact support']
        };

        // Add context-specific information
        if (context.offline) {
            errorInfo.guidance += ' You\'re currently offline.';
        }
        
        if (context.retryCount > 0) {
            errorInfo.guidance += ` (Attempt ${context.retryCount + 1})`;
        }

        return errorInfo;
    }

    // Show user error with enhanced guidance
    showUserError(errorType, error, context = {}) {
        const errorInfo = this.getUserFriendlyMessage(errorType, error, context);
        
        const actions = errorInfo.actions.map((action, index) => ({
            id: `action_${index}`,
            label: action,
            handler: () => this.handleErrorAction(action, errorType, context)
        }));

        this.showUserNotification(
            `${errorInfo.message} ${errorInfo.guidance}`,
            'error',
            10000,
            actions.slice(0, 2) // Limit to 2 actions for UI clarity
        );
    }

    handleErrorAction(action, errorType, context) {
        switch (action.toLowerCase()) {
            case 'refresh the page':
                window.location.reload();
                break;
                
            case 'try again':
                if (context.retryCallback) {
                    context.retryCallback();
                }
                break;
                
            case 'work offline':
            case 'try working offline':
                if (window.offlineManager) {
                    window.offlineManager.enableOfflineMode();
                }
                break;
                
            case 'check connection':
            case 'check internet connection':
                this.performConnectivityTest();
                break;
                
            case 'clear browser cache':
                this.showCacheClearingGuidance();
                break;
                
            case 'check api key settings':
                if (window.geminiAI) {
                    window.geminiAI.promptForApiKey();
                }
                break;
                
            default:
                console.log(`Action not implemented: ${action}`);
        }
    }

    async performConnectivityTest() {
        this.showUserNotification('Testing connection...', 'info', 3000);
        
        try {
            const response = await fetch('/manifest.json', { 
                method: 'HEAD',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                this.showUserNotification('Connection is working! You can try your action again.', 'success');
            } else {
                this.showUserNotification('Connection issues detected. Please check your internet.', 'warning');
            }
        } catch (error) {
            this.showUserNotification('Unable to connect. Please check your internet connection.', 'error');
        }
    }

    showCacheClearingGuidance() {
        const guidance = `
            <div class="cache-guidance">
                <h4>Clear Browser Cache</h4>
                <p>To clear your browser cache:</p>
                <ol>
                    <li>Press <kbd>Ctrl+Shift+Delete</kbd> (or <kbd>Cmd+Shift+Delete</kbd> on Mac)</li>
                    <li>Select "Cached images and files"</li>
                    <li>Click "Clear data"</li>
                    <li>Refresh this page</li>
                </ol>
            </div>
        `;
        
        this.showUserNotification(guidance, 'info', 15000);
    }

    // Fallback content generators
    getGenericAIFallback(error) {
        const fallbacks = {
            'risk_explanation': 'Your risk assessment has been completed. Please consult with a healthcare provider for personalized advice.',
            'meal_plan': 'We recommend following a balanced diet with plenty of vegetables, lean proteins, and whole grains.',
            'mood_support': 'Remember that taking care of your mental health is important. Consider speaking with a counselor if you need support.',
            'health_insights': 'Keep tracking your health metrics regularly. Consistency is key to managing your health effectively.'
        };

        // Try to determine fallback type from error context
        const errorMessage = error?.message?.toLowerCase() || '';
        for (const [type, content] of Object.entries(fallbacks)) {
            if (errorMessage.includes(type.replace('_', ' '))) {
                return content;
            }
        }

        return 'We\'re experiencing technical difficulties. Please try again later.';
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    }

    isProduction() {
        return !this.isDevelopment();
    }

    // Monitoring integration (placeholder)
    async sendToMonitoring(errorEntry) {
        // In a real application, this would send to a service like Sentry, LogRocket, etc.
        console.log('Would send to monitoring service:', errorEntry);
    }

    // Error log management
    getErrorLog(limit = 20) {
        return this.errorLog.slice(0, limit);
    }

    clearErrorLog() {
        this.errorLog = [];
        try {
            localStorage.removeItem('glucobalance-errors');
        } catch (e) {
            console.warn('Could not clear error log from localStorage:', e);
        }
    }

    // Load persisted errors on initialization
    loadPersistedErrors() {
        try {
            const stored = localStorage.getItem('glucobalance-errors');
            if (stored) {
                this.errorLog = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not load persisted errors:', e);
        }
    }

    // Initialize circuit breakers for critical services
    initializeCircuitBreakers() {
        const services = ['database', 'ai', 'network', 'storage'];
        services.forEach(service => {
            this.circuitBreakers.set(service, {
                state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
                failureCount: 0,
                failureThreshold: 5,
                timeout: 60000, // 1 minute
                lastFailureTime: null,
                successCount: 0,
                halfOpenSuccessThreshold: 3
            });
        });
    }

    // Initialize fallback content cache
    initializeFallbackCache() {
        // Pre-populate with essential fallback content
        this.fallbackCache.set('ai_risk_explanation', {
            'Low': 'Your risk assessment indicates a low likelihood of developing diabetes. Continue maintaining healthy lifestyle habits.',
            'Increased': 'Your assessment shows increased diabetes risk. Focus on regular exercise, healthy eating, and weight management.',
            'High': 'Your risk score indicates high diabetes likelihood. Consider immediate lifestyle changes and consult a healthcare provider.',
            'Possible Diabetes': 'Your assessment suggests possible diabetes. Please consult a healthcare provider for proper testing and guidance.'
        });

        this.fallbackCache.set('ai_mood_support', {
            1: 'It\'s okay to have difficult days. Taking care of your health is an act of self-love.',
            2: 'You\'re showing strength by staying engaged with your health journey.',
            3: 'You\'re doing well maintaining health awareness. Small consistent actions lead to big changes.',
            4: 'Your positive attitude is a powerful tool for health. Keep up the great work!',
            5: 'Wonderful! Your positive energy and health commitment are inspiring.'
        });

        this.fallbackCache.set('ai_nutrition_tips', [
            'Focus on vegetables, lean proteins, and whole grains',
            'Limit processed foods and added sugars',
            'Stay hydrated with water throughout the day',
            'Practice portion control at meals',
            'Include healthy fats like nuts and olive oil'
        ]);

        this.fallbackCache.set('ai_coping_strategies', [
            'Practice deep breathing exercises for 5 minutes',
            'Take a short walk outdoors if possible',
            'Write down three things you\'re grateful for',
            'Listen to calming music or nature sounds',
            'Reach out to a trusted friend or family member'
        ]);
    }

    // Initialize recovery strategies
    initializeRecoveryStrategies() {
        // Database recovery strategies
        this.recoveryStrategies.set('database_connection_failed', async () => {
            console.log('Attempting database recovery...');
            try {
                // Try to reinitialize database
                if (window.kiroDb) {
                    await window.kiroDb.init();
                    return { success: true, message: 'Database connection restored' };
                }
            } catch (error) {
                return { success: false, message: 'Database recovery failed, using local storage' };
            }
        });

        // AI service recovery strategies
        this.recoveryStrategies.set('ai_service_failed', async () => {
            console.log('Attempting AI service recovery...');
            try {
                // Check if API key is still valid
                if (window.geminiAI && window.geminiAI.isInitialized()) {
                    // Try a simple test request
                    await window.geminiAI.generateContent('test', {});
                    return { success: true, message: 'AI service restored' };
                }
            } catch (error) {
                return { success: false, message: 'AI service unavailable, using fallback content' };
            }
        });

        // Network recovery strategies
        this.recoveryStrategies.set('network_connection_failed', async () => {
            console.log('Attempting network recovery...');
            try {
                // Test network connectivity
                const response = await fetch('/manifest.json', { 
                    method: 'HEAD',
                    cache: 'no-cache',
                    signal: AbortSignal.timeout(5000)
                });
                if (response.ok) {
                    return { success: true, message: 'Network connection restored' };
                }
            } catch (error) {
                return { success: false, message: 'Network still unavailable, continuing offline' };
            }
        });
    }

    // Network status change handler
    handleNetworkStatusChange(isOnline) {
        if (isOnline) {
            this.showUserNotification('Connection restored. Syncing data...', 'success');
            this.attemptRecovery('network_connection_failed');
            
            // Trigger offline data sync if available
            if (window.offlineManager) {
                window.offlineManager.syncOfflineData().catch(error => {
                    this.handleError('SYNC_ERROR', error, { context: 'network_restored' });
                });
            }
        } else {
            this.showUserNotification('You\'re offline. Some features may be limited.', 'warning');
        }
    }

    // Circuit breaker pattern implementation
    async executeWithCircuitBreaker(serviceName, operation, fallbackAction = null) {
        const breaker = this.circuitBreakers.get(serviceName);
        if (!breaker) {
            throw new Error(`Circuit breaker not found for service: ${serviceName}`);
        }

        // Check circuit breaker state
        if (breaker.state === 'OPEN') {
            const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
            if (timeSinceLastFailure < breaker.timeout) {
                // Circuit is open, use fallback
                if (fallbackAction) {
                    return await fallbackAction();
                }
                throw new Error(`Service ${serviceName} is temporarily unavailable`);
            } else {
                // Try to transition to half-open
                breaker.state = 'HALF_OPEN';
                breaker.successCount = 0;
            }
        }

        try {
            const result = await operation();
            
            // Success - handle circuit breaker state
            if (breaker.state === 'HALF_OPEN') {
                breaker.successCount++;
                if (breaker.successCount >= breaker.halfOpenSuccessThreshold) {
                    breaker.state = 'CLOSED';
                    breaker.failureCount = 0;
                }
            } else if (breaker.state === 'CLOSED') {
                breaker.failureCount = 0; // Reset failure count on success
            }

            return result;
        } catch (error) {
            // Failure - update circuit breaker
            breaker.failureCount++;
            breaker.lastFailureTime = Date.now();

            if (breaker.failureCount >= breaker.failureThreshold) {
                breaker.state = 'OPEN';
            } else if (breaker.state === 'HALF_OPEN') {
                breaker.state = 'OPEN';
            }

            // Log the error
            await this.handleError(`${serviceName.toUpperCase()}_CIRCUIT_BREAKER`, error, {
                breakerState: breaker.state,
                failureCount: breaker.failureCount
            });

            // Try fallback if available
            if (fallbackAction) {
                return await fallbackAction();
            }

            throw error;
        }
    }

    // Enhanced retry mechanism with exponential backoff and jitter
    async retryWithBackoff(operation, options = {}) {
        const {
            maxRetries = 3,
            baseDelay = 1000,
            maxDelay = 30000,
            backoffFactor = 2,
            jitter = true,
            retryCondition = () => true
        } = options;

        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                // Check if we should retry
                if (attempt === maxRetries || !retryCondition(error, attempt)) {
                    break;
                }

                // Calculate delay with exponential backoff and optional jitter
                let delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
                if (jitter) {
                    delay = delay * (0.5 + Math.random() * 0.5); // Add 0-50% jitter
                }

                await this.delay(delay);
            }
        }

        throw lastError;
    }

    // Attempt automatic recovery
    async attemptRecovery(errorType) {
        const strategy = this.recoveryStrategies.get(errorType);
        if (strategy) {
            try {
                const result = await strategy();
                if (result.success) {
                    this.showUserNotification(result.message, 'success');
                    return true;
                } else {
                    this.showUserNotification(result.message, 'warning');
                    return false;
                }
            } catch (error) {
                await this.handleError('RECOVERY_FAILED', error, { originalError: errorType });
                return false;
            }
        }
        return false;
    }

    // Enhanced user notification system
    showUserNotification(message, type = 'info', duration = 5000, actions = []) {
        // Remove existing notifications of the same type
        const existingNotifications = document.querySelectorAll(`.notification.${type}`);
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                ${actions.length > 0 ? `
                    <div class="notification-actions">
                        ${actions.map(action => `
                            <button class="notification-action" data-action="${action.id}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add event listeners
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Handle action buttons
        actions.forEach(action => {
            const button = notification.querySelector(`[data-action="${action.id}"]`);
            if (button) {
                button.addEventListener('click', () => {
                    action.handler();
                    notification.remove();
                });
            }
        });

        document.body.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Enhanced fallback content system
    getFallbackContent(contentType, context = {}) {
        const cached = this.fallbackCache.get(contentType);
        
        if (!cached) {
            return this.getGenericFallback(contentType);
        }

        // Handle different content types
        switch (contentType) {
            case 'ai_risk_explanation':
                const category = context.category || 'Low';
                return cached[category] || cached['Low'];
                
            case 'ai_mood_support':
                const mood = context.mood || 3;
                return cached[mood] || cached[3];
                
            case 'ai_nutrition_tips':
                return this.getRandomItems(cached, 3).join('\n• ');
                
            case 'ai_coping_strategies':
                return this.getRandomItems(cached, 2);
                
            default:
                return cached;
        }
    }

    getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    getGenericFallback(contentType) {
        const fallbacks = {
            'ai_content': 'We\'re experiencing technical difficulties with our AI service. Please try again later.',
            'database_content': 'Unable to retrieve data at this time. Please check your connection and try again.',
            'network_content': 'You appear to be offline. Some features may be limited until connection is restored.'
        };
        
        return fallbacks[contentType] || 'Service temporarily unavailable. Please try again later.';
    }

    // Health check for critical systems
    async performHealthCheck() {
        const results = {
            database: false,
            localStorage: false,
            indexedDB: false,
            timestamp: new Date().toISOString()
        };

        // Test localStorage
        try {
            localStorage.setItem('health-check', 'test');
            localStorage.removeItem('health-check');
            results.localStorage = true;
        } catch (e) {
            await this.handleError('HEALTH_CHECK', e, { component: 'localStorage' });
        }

        // Test IndexedDB
        try {
            if (window.kiroDb && window.kiroDb.db) {
                results.database = true;
                results.indexedDB = true;
            }
        } catch (e) {
            await this.handleError('HEALTH_CHECK', e, { component: 'indexedDB' });
        }

        return results;
    }
}

// Enhanced database wrapper with comprehensive error handling
class DatabaseService {
    constructor(database, errorHandler) {
        this.db = database;
        this.errorHandler = errorHandler;
        this.operationQueue = [];
        this.isProcessingQueue = false;
    }

    async safeExecute(operation, fallbackAction = null, options = {}) {
        const {
            retryCount = 0,
            maxRetries = 3,
            useCircuitBreaker = true,
            queueOnFailure = true
        } = options;

        try {
            if (useCircuitBreaker) {
                return await this.errorHandler.executeWithCircuitBreaker(
                    'database',
                    operation,
                    fallbackAction
                );
            } else {
                return await operation();
            }
        } catch (error) {
            // Queue operation for retry if appropriate
            if (queueOnFailure && retryCount < maxRetries) {
                this.queueOperation(operation, fallbackAction, {
                    ...options,
                    retryCount: retryCount + 1
                });
            }

            return await this.errorHandler.handleDatabaseError(
                error, 
                operation, 
                fallbackAction
            );
        }
    }

    queueOperation(operation, fallbackAction, options) {
        this.operationQueue.push({
            operation,
            fallbackAction,
            options,
            timestamp: Date.now()
        });

        // Process queue if not already processing
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.isProcessingQueue || this.operationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.operationQueue.length > 0) {
            const queuedOp = this.operationQueue.shift();
            
            // Skip operations that are too old (5 minutes)
            if (Date.now() - queuedOp.timestamp > 300000) {
                continue;
            }

            try {
                await this.safeExecute(
                    queuedOp.operation,
                    queuedOp.fallbackAction,
                    { ...queuedOp.options, queueOnFailure: false }
                );
                
                // Small delay between operations
                await this.errorHandler.delay(100);
            } catch (error) {
                console.warn('Queued operation failed:', error);
            }
        }

        this.isProcessingQueue = false;
    }

    // User operations with error handling
    async createUser(userData) {
        return this.safeExecute(
            () => this.db.createUser(userData),
            () => {
                // Fallback: store in localStorage temporarily
                const users = JSON.parse(localStorage.getItem('temp-users') || '[]');
                const user = { ...userData, id: Date.now(), createdAt: new Date().toISOString() };
                users.push(user);
                localStorage.setItem('temp-users', JSON.stringify(users));
                return user;
            }
        );
    }

    async getUser(userId) {
        return this.safeExecute(
            () => this.db.getUser(userId),
            () => {
                const users = JSON.parse(localStorage.getItem('temp-users') || '[]');
                return users.find(u => u.id === userId);
            }
        );
    }

    async updateUser(userId, updates) {
        return this.safeExecute(
            () => this.db.updateUser(userId, updates)
        );
    }

    // Assessment operations with error handling
    async saveAssessment(userId, assessmentData) {
        return this.safeExecute(
            () => this.db.saveAssessment(userId, assessmentData)
        );
    }

    async getUserAssessments(userId, limit) {
        return this.safeExecute(
            () => this.db.getUserAssessments(userId, limit),
            () => [] // Return empty array as fallback
        );
    }

    // Mood operations with error handling
    async saveMood(userId, date, mood, notes) {
        return this.safeExecute(
            () => this.db.saveMood(userId, date, mood, notes)
        );
    }

    async getUserMoods(userId, days) {
        return this.safeExecute(
            () => this.db.getUserMoods(userId, days),
            () => [] // Return empty array as fallback
        );
    }

    // Nutrition operations with error handling
    async saveNutritionPlan(userId, planData) {
        return this.safeExecute(
            () => this.db.saveNutritionPlan(userId, planData)
        );
    }

    async getUserNutritionPlans(userId, limit) {
        return this.safeExecute(
            () => this.db.getUserNutritionPlans(userId, limit),
            () => [] // Return empty array as fallback
        );
    }

    // Progress operations with error handling
    async saveProgress(userId, metricType, value, date) {
        return this.safeExecute(
            () => this.db.saveProgress(userId, metricType, value, date)
        );
    }

    async getUserProgress(userId, metricType, days) {
        return this.safeExecute(
            () => this.db.getUserProgress(userId, metricType, days),
            () => [] // Return empty array as fallback
        );
    }

    // Health report with error handling
    async generateHealthReport(userId, days) {
        return this.safeExecute(
            () => this.db.generateHealthReport(userId, days),
            () => ({
                assessments: [],
                moods: [],
                progress: [],
                summary: {
                    totalMoodEntries: 0,
                    averageMood: 0,
                    latestRiskScore: null,
                    progressMetrics: {}
                }
            })
        );
    }
}

// Initialize error handling system
window.errorHandler = new ErrorHandler();
window.errorHandler.loadPersistedErrors();

// Initialize enhanced database service
window.dbService = new DatabaseService(window.kiroDb, window.errorHandler);

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandler, DatabaseService };
}