/**
 * Security Service for GlucoBalance Application
 * Handles data encryption, API key management, input validation, and privacy compliance
 */

class SecurityService {
    constructor() {
        this.encryptionKey = this.generateEncryptionKey();
        this.apiKeyManager = new APIKeyManager();
        this.validator = new InputValidator();
        this.privacyManager = new PrivacyManager();
    }

    /**
     * Generate or retrieve encryption key for data protection
     */
    generateEncryptionKey() {
        let key = localStorage.getItem('glucobalance_encryption_key');
        if (!key) {
            // Generate a new key using Web Crypto API
            key = this.generateSecureKey();
            localStorage.setItem('glucobalance_encryption_key', key);
        }
        return key;
    }

    /**
     * Generate a secure encryption key
     */
    generateSecureKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Encrypt sensitive health data
     */
    async encryptHealthData(data) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            // Generate a random IV for each encryption
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Import the key
            const key = await crypto.subtle.importKey(
                'raw',
                this.hexToArrayBuffer(this.encryptionKey),
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );
            
            // Encrypt the data
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                dataBuffer
            );
            
            // Combine IV and encrypted data
            const result = new Uint8Array(iv.length + encryptedData.byteLength);
            result.set(iv);
            result.set(new Uint8Array(encryptedData), iv.length);
            
            return this.arrayBufferToHex(result);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt sensitive data');
        }
    }

    /**
     * Decrypt sensitive health data
     */
    async decryptHealthData(encryptedHex) {
        try {
            const encryptedData = this.hexToArrayBuffer(encryptedHex);
            
            // Extract IV and encrypted content
            const iv = encryptedData.slice(0, 12);
            const encrypted = encryptedData.slice(12);
            
            // Import the key
            const key = await crypto.subtle.importKey(
                'raw',
                this.hexToArrayBuffer(this.encryptionKey),
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );
            
            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );
            
            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decryptedData));
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt sensitive data');
        }
    }

    /**
     * Utility functions for data conversion
     */
    hexToArrayBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes.buffer;
    }

    arrayBufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Hash sensitive data for storage (one-way)
     */
    async hashSensitiveData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        return this.arrayBufferToHex(hashBuffer);
    }

    /**
     * Secure data storage with encryption
     */
    async secureStore(key, data, isHealthData = false) {
        try {
            let processedData = data;
            
            if (isHealthData) {
                processedData = await this.encryptHealthData(data);
            }
            
            localStorage.setItem(`secure_${key}`, JSON.stringify({
                data: processedData,
                encrypted: isHealthData,
                timestamp: Date.now()
            }));
            
            return true;
        } catch (error) {
            console.error('Secure storage failed:', error);
            return false;
        }
    }

    /**
     * Secure data retrieval with decryption
     */
    async secureRetrieve(key) {
        try {
            const stored = localStorage.getItem(`secure_${key}`);
            if (!stored) return null;
            
            const { data, encrypted, timestamp } = JSON.parse(stored);
            
            // Check if data is too old (optional expiration)
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            if (Date.now() - timestamp > maxAge) {
                localStorage.removeItem(`secure_${key}`);
                return null;
            }
            
            if (encrypted) {
                return await this.decryptHealthData(data);
            }
            
            return data;
        } catch (error) {
            console.error('Secure retrieval failed:', error);
            return null;
        }
    }

    /**
     * Clear all secure data
     */
    clearSecureData() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('secure_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

/**
 * API Key Manager for secure Gemini AI integration
 */
class APIKeyManager {
    constructor() {
        this.keyRotationInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.maxRetries = 3;
    }

    /**
     * Securely store API key with rotation tracking
     */
    storeAPIKey(key, service = 'gemini') {
        const keyData = {
            key: this.obfuscateKey(key),
            service: service,
            created: Date.now(),
            lastUsed: Date.now(),
            usageCount: 0
        };
        
        localStorage.setItem(`api_key_${service}`, JSON.stringify(keyData));
    }

    /**
     * Retrieve and validate API key
     */
    getAPIKey(service = 'gemini') {
        const stored = localStorage.getItem(`api_key_${service}`);
        if (!stored) return null;
        
        const keyData = JSON.parse(stored);
        
        // Update usage tracking
        keyData.lastUsed = Date.now();
        keyData.usageCount++;
        localStorage.setItem(`api_key_${service}`, JSON.stringify(keyData));
        
        return this.deobfuscateKey(keyData.key);
    }

    /**
     * Simple key obfuscation (not cryptographically secure, but adds a layer)
     */
    obfuscateKey(key) {
        return btoa(key.split('').reverse().join(''));
    }

    /**
     * Deobfuscate API key
     */
    deobfuscateKey(obfuscatedKey) {
        return atob(obfuscatedKey).split('').reverse().join('');
    }

    /**
     * Validate API key format
     */
    validateKeyFormat(key, service = 'gemini') {
        if (service === 'gemini') {
            // Gemini API keys typically start with 'AIza' and are 39 characters long
            return /^AIza[A-Za-z0-9_-]{35}$/.test(key);
        }
        return false;
    }

    /**
     * Check if key needs rotation
     */
    needsRotation(service = 'gemini') {
        const stored = localStorage.getItem(`api_key_${service}`);
        if (!stored) return true;
        
        const keyData = JSON.parse(stored);
        return Date.now() - keyData.created > this.keyRotationInterval;
    }

    /**
     * Remove API key
     */
    removeAPIKey(service = 'gemini') {
        localStorage.removeItem(`api_key_${service}`);
    }
}
/**
 *
 Input Validator for comprehensive input validation and sanitization
 */
class InputValidator {
    constructor() {
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            name: /^[a-zA-Z\s'-]{2,50}$/,
            age: /^(?:[1-9][0-9]?|1[01][0-9]|120)$/, // 1-120
            phone: /^\+?[\d\s\-\(\)]{10,15}$/,
            alphanumeric: /^[a-zA-Z0-9\s]{1,100}$/,
            numeric: /^\d+(\.\d+)?$/,
            mood: /^[1-5]$/,
            riskScore: /^(?:[0-9]|[1-4][0-9]|50)$/ // 0-50
        };
        
        this.sanitizers = {
            html: this.sanitizeHTML.bind(this),
            sql: this.sanitizeSQL.bind(this),
            xss: this.sanitizeXSS.bind(this),
            general: this.sanitizeGeneral.bind(this)
        };
    }

    /**
     * Validate user registration data
     */
    validateUserRegistration(userData) {
        const errors = [];
        
        if (!userData.name || !this.patterns.name.test(userData.name)) {
            errors.push('Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes');
        }
        
        if (!userData.email || !this.patterns.email.test(userData.email)) {
            errors.push('Please provide a valid email address');
        }
        
        if (!userData.age || !this.patterns.age.test(userData.age.toString())) {
            errors.push('Age must be between 1 and 120');
        }
        
        if (!userData.gender || !['male', 'female', 'other'].includes(userData.gender)) {
            errors.push('Please select a valid gender option');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedData: this.sanitizeUserData(userData)
        };
    }

    /**
     * Validate risk assessment data
     */
    validateRiskAssessment(assessmentData) {
        const errors = [];
        
        if (!assessmentData.responses || !Array.isArray(assessmentData.responses)) {
            errors.push('Assessment responses must be provided as an array');
            return { isValid: false, errors: errors };
        }
        
        assessmentData.responses.forEach((response, index) => {
            if (!response.questionId || typeof response.questionId !== 'string') {
                errors.push(`Question ID is required for response ${index + 1}`);
            }
            
            if (response.value === undefined || response.value === null) {
                errors.push(`Value is required for response ${index + 1}`);
            }
            
            if (typeof response.value === 'number' && (response.value < 0 || response.value > 10)) {
                errors.push(`Response value must be between 0 and 10 for question ${index + 1}`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedData: this.sanitizeAssessmentData(assessmentData)
        };
    }

    /**
     * Validate mood entry data
     */
    validateMoodEntry(moodData) {
        const errors = [];
        
        if (!moodData.mood || !this.patterns.mood.test(moodData.mood.toString())) {
            errors.push('Mood must be a number between 1 and 5');
        }
        
        if (moodData.notes && moodData.notes.length > 500) {
            errors.push('Mood notes cannot exceed 500 characters');
        }
        
        if (moodData.date && !this.isValidDate(moodData.date)) {
            errors.push('Please provide a valid date');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedData: this.sanitizeMoodData(moodData)
        };
    }

    /**
     * Validate nutrition plan data
     */
    validateNutritionPlan(nutritionData) {
        const errors = [];
        
        if (nutritionData.adherencePercentage !== undefined) {
            if (!this.patterns.numeric.test(nutritionData.adherencePercentage.toString()) ||
                nutritionData.adherencePercentage < 0 || nutritionData.adherencePercentage > 100) {
                errors.push('Adherence percentage must be between 0 and 100');
            }
        }
        
        if (nutritionData.dietaryRestrictions && Array.isArray(nutritionData.dietaryRestrictions)) {
            nutritionData.dietaryRestrictions.forEach((restriction, index) => {
                if (typeof restriction !== 'string' || restriction.length > 50) {
                    errors.push(`Dietary restriction ${index + 1} must be a string under 50 characters`);
                }
            });
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedData: this.sanitizeNutritionData(nutritionData)
        };
    }

    /**
     * Sanitize user data
     */
    sanitizeUserData(userData) {
        return {
            name: this.sanitizeGeneral(userData.name),
            email: this.sanitizeGeneral(userData.email).toLowerCase(),
            age: parseInt(userData.age),
            gender: this.sanitizeGeneral(userData.gender).toLowerCase()
        };
    }

    /**
     * Sanitize assessment data
     */
    sanitizeAssessmentData(assessmentData) {
        return {
            ...assessmentData,
            responses: assessmentData.responses.map(response => ({
                questionId: this.sanitizeGeneral(response.questionId),
                value: typeof response.value === 'number' ? response.value : parseFloat(response.value),
                text: response.text ? this.sanitizeGeneral(response.text) : ''
            }))
        };
    }

    /**
     * Sanitize mood data
     */
    sanitizeMoodData(moodData) {
        return {
            mood: parseInt(moodData.mood),
            notes: moodData.notes ? this.sanitizeGeneral(moodData.notes) : '',
            date: moodData.date ? this.sanitizeGeneral(moodData.date) : new Date().toISOString().split('T')[0]
        };
    }

    /**
     * Sanitize nutrition data
     */
    sanitizeNutritionData(nutritionData) {
        const sanitized = { ...nutritionData };
        
        if (sanitized.adherencePercentage !== undefined) {
            sanitized.adherencePercentage = parseFloat(sanitized.adherencePercentage);
        }
        
        if (sanitized.dietaryRestrictions && Array.isArray(sanitized.dietaryRestrictions)) {
            sanitized.dietaryRestrictions = sanitized.dietaryRestrictions.map(restriction => 
                this.sanitizeGeneral(restriction)
            );
        }
        
        return sanitized;
    }

    /**
     * General sanitization for text inputs
     */
    sanitizeGeneral(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/['"]/g, '') // Remove quotes to prevent injection
            .replace(/\\/g, '') // Remove backslashes
            .substring(0, 1000); // Limit length
    }

    /**
     * HTML sanitization
     */
    sanitizeHTML(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * XSS prevention sanitization
     */
    sanitizeXSS(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .replace(/script/gi, '');
    }

    /**
     * SQL injection prevention
     */
    sanitizeSQL(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/['"]/g, '')
            .replace(/;/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '');
    }

    /**
     * Validate date format
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    }

    /**
     * Rate limiting validation
     */
    checkRateLimit(userId, action, maxAttempts = 5, timeWindow = 60000) {
        const key = `rate_limit_${userId}_${action}`;
        const now = Date.now();
        
        let attempts = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Remove old attempts outside the time window
        attempts = attempts.filter(timestamp => now - timestamp < timeWindow);
        
        if (attempts.length >= maxAttempts) {
            return {
                allowed: false,
                resetTime: Math.min(...attempts) + timeWindow
            };
        }
        
        // Add current attempt
        attempts.push(now);
        localStorage.setItem(key, JSON.stringify(attempts));
        
        return {
            allowed: true,
            remaining: maxAttempts - attempts.length
        };
    }
}/**
 
* Privacy Manager for GDPR and health data compliance
 */
class PrivacyManager {
    constructor() {
        this.consentTypes = {
            ESSENTIAL: 'essential',
            ANALYTICS: 'analytics',
            MARKETING: 'marketing',
            HEALTH_DATA: 'health_data',
            AI_PROCESSING: 'ai_processing'
        };
        
        this.dataRetentionPeriods = {
            USER_DATA: 365 * 24 * 60 * 60 * 1000, // 1 year
            HEALTH_DATA: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
            ANALYTICS: 90 * 24 * 60 * 60 * 1000, // 90 days
            LOGS: 30 * 24 * 60 * 60 * 1000 // 30 days
        };
    }

    /**
     * Initialize privacy settings for new users
     */
    initializePrivacySettings(userId) {
        const defaultSettings = {
            userId: userId,
            consentGiven: {
                [this.consentTypes.ESSENTIAL]: true, // Required for app functionality
                [this.consentTypes.ANALYTICS]: false,
                [this.consentTypes.MARKETING]: false,
                [this.consentTypes.HEALTH_DATA]: false,
                [this.consentTypes.AI_PROCESSING]: false
            },
            consentDate: Date.now(),
            dataProcessingAgreement: false,
            privacyPolicyVersion: '1.0',
            lastUpdated: Date.now()
        };
        
        localStorage.setItem(`privacy_settings_${userId}`, JSON.stringify(defaultSettings));
        return defaultSettings;
    }

    /**
     * Update consent preferences
     */
    updateConsent(userId, consentType, granted) {
        const settings = this.getPrivacySettings(userId);
        if (!settings) return false;
        
        settings.consentGiven[consentType] = granted;
        settings.lastUpdated = Date.now();
        
        if (granted) {
            settings.consentDate = Date.now();
        }
        
        localStorage.setItem(`privacy_settings_${userId}`, JSON.stringify(settings));
        
        // Log consent change for audit trail
        this.logConsentChange(userId, consentType, granted);
        
        return true;
    }

    /**
     * Get privacy settings for user
     */
    getPrivacySettings(userId) {
        const stored = localStorage.getItem(`privacy_settings_${userId}`);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Check if user has given consent for specific data processing
     */
    hasConsent(userId, consentType) {
        const settings = this.getPrivacySettings(userId);
        return settings && settings.consentGiven[consentType] === true;
    }

    /**
     * Export all user data (GDPR Article 20 - Right to data portability)
     */
    async exportUserData(userId) {
        try {
            const userData = {
                exportDate: new Date().toISOString(),
                userId: userId,
                personalData: await this.getUserPersonalData(userId),
                healthData: await this.getUserHealthData(userId),
                assessmentData: await this.getUserAssessmentData(userId),
                nutritionData: await this.getUserNutritionData(userId),
                moodData: await this.getUserMoodData(userId),
                privacySettings: this.getPrivacySettings(userId),
                consentHistory: this.getConsentHistory(userId)
            };
            
            // Create downloadable JSON file
            const blob = new Blob([JSON.stringify(userData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `glucobalance_data_export_${userId}_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Log data export for audit
            this.logDataAccess(userId, 'DATA_EXPORT');
            
            return true;
        } catch (error) {
            console.error('Data export failed:', error);
            return false;
        }
    }

    /**
     * Delete all user data (GDPR Article 17 - Right to erasure)
     */
    async deleteAllUserData(userId) {
        try {
            // Get list of all data to be deleted for audit
            const dataToDelete = await this.getUserDataInventory(userId);
            
            // Delete from various storage locations
            const keysToDelete = Object.keys(localStorage).filter(key => 
                key.includes(userId) || key.includes(`user_${userId}`)
            );
            
            keysToDelete.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Delete from IndexedDB if used
            if (window.indexedDB) {
                await this.deleteFromIndexedDB(userId);
            }
            
            // Log deletion for audit (before removing audit logs)
            this.logDataDeletion(userId, dataToDelete);
            
            // Finally, remove audit logs after a delay (for compliance)
            setTimeout(() => {
                this.removeAuditLogs(userId);
            }, 30 * 24 * 60 * 60 * 1000); // 30 days
            
            return true;
        } catch (error) {
            console.error('Data deletion failed:', error);
            return false;
        }
    }

    /**
     * Get inventory of all user data
     */
    async getUserDataInventory(userId) {
        const inventory = {
            personalData: !!localStorage.getItem(`user_${userId}`),
            healthData: !!localStorage.getItem(`health_data_${userId}`),
            assessments: !!localStorage.getItem(`assessments_${userId}`),
            nutrition: !!localStorage.getItem(`nutrition_${userId}`),
            mood: !!localStorage.getItem(`mood_${userId}`),
            privacySettings: !!localStorage.getItem(`privacy_settings_${userId}`),
            auditLogs: !!localStorage.getItem(`audit_logs_${userId}`)
        };
        
        return inventory;
    }

    /**
     * Anonymize user data instead of deletion (alternative to full deletion)
     */
    async anonymizeUserData(userId) {
        try {
            const anonymizedId = this.generateAnonymousId();
            
            // Replace personal identifiers with anonymous ones
            const userData = await this.getUserPersonalData(userId);
            if (userData) {
                const anonymizedData = {
                    ...userData,
                    id: anonymizedId,
                    name: 'Anonymous User',
                    email: `anonymous_${anonymizedId}@example.com`,
                    anonymized: true,
                    anonymizedDate: Date.now()
                };
                
                localStorage.setItem(`user_${anonymizedId}`, JSON.stringify(anonymizedData));
                localStorage.removeItem(`user_${userId}`);
            }
            
            // Update references in other data
            await this.updateDataReferences(userId, anonymizedId);
            
            this.logDataAnonymization(userId, anonymizedId);
            
            return anonymizedId;
        } catch (error) {
            console.error('Data anonymization failed:', error);
            return null;
        }
    }

    /**
     * Check data retention and auto-delete expired data
     */
    async performDataRetentionCleanup() {
        const now = Date.now();
        
        Object.keys(localStorage).forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                
                if (data && data.createdAt) {
                    const age = now - data.createdAt;
                    let shouldDelete = false;
                    
                    // Check retention periods based on data type
                    if (key.includes('analytics') && age > this.dataRetentionPeriods.ANALYTICS) {
                        shouldDelete = true;
                    } else if (key.includes('logs') && age > this.dataRetentionPeriods.LOGS) {
                        shouldDelete = true;
                    } else if (key.includes('user_') && age > this.dataRetentionPeriods.USER_DATA) {
                        shouldDelete = true;
                    } else if (key.includes('health_') && age > this.dataRetentionPeriods.HEALTH_DATA) {
                        shouldDelete = true;
                    }
                    
                    if (shouldDelete) {
                        localStorage.removeItem(key);
                        console.log(`Expired data removed: ${key}`);
                    }
                }
            } catch (error) {
                // Skip invalid JSON data
            }
        });
    }

    /**
     * Log consent changes for audit trail
     */
    logConsentChange(userId, consentType, granted) {
        const auditLog = {
            userId: userId,
            action: 'CONSENT_CHANGE',
            consentType: consentType,
            granted: granted,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            ipAddress: 'client-side' // Would need server-side for real IP
        };
        
        this.addToAuditLog(userId, auditLog);
    }

    /**
     * Log data access for audit trail
     */
    logDataAccess(userId, accessType) {
        const auditLog = {
            userId: userId,
            action: 'DATA_ACCESS',
            accessType: accessType,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        this.addToAuditLog(userId, auditLog);
    }

    /**
     * Log data deletion for audit trail
     */
    logDataDeletion(userId, deletedData) {
        const auditLog = {
            userId: userId,
            action: 'DATA_DELETION',
            deletedData: deletedData,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        this.addToAuditLog(userId, auditLog);
    }

    /**
     * Log data anonymization for audit trail
     */
    logDataAnonymization(originalUserId, anonymizedId) {
        const auditLog = {
            originalUserId: originalUserId,
            anonymizedId: anonymizedId,
            action: 'DATA_ANONYMIZATION',
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        this.addToAuditLog(originalUserId, auditLog);
    }

    /**
     * Add entry to audit log
     */
    addToAuditLog(userId, logEntry) {
        const key = `audit_logs_${userId}`;
        const existingLogs = JSON.parse(localStorage.getItem(key) || '[]');
        
        existingLogs.push(logEntry);
        
        // Keep only last 1000 entries to prevent storage overflow
        if (existingLogs.length > 1000) {
            existingLogs.splice(0, existingLogs.length - 1000);
        }
        
        localStorage.setItem(key, JSON.stringify(existingLogs));
    }

    /**
     * Get consent history for user
     */
    getConsentHistory(userId) {
        const auditLogs = JSON.parse(localStorage.getItem(`audit_logs_${userId}`) || '[]');
        return auditLogs.filter(log => log.action === 'CONSENT_CHANGE');
    }

    /**
     * Generate anonymous ID
     */
    generateAnonymousId() {
        return 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Helper methods for data retrieval (to be implemented based on actual data structure)
     */
    async getUserPersonalData(userId) {
        const data = localStorage.getItem(`user_${userId}`);
        return data ? JSON.parse(data) : null;
    }

    async getUserHealthData(userId) {
        const data = localStorage.getItem(`health_data_${userId}`);
        return data ? JSON.parse(data) : null;
    }

    async getUserAssessmentData(userId) {
        const data = localStorage.getItem(`assessments_${userId}`);
        return data ? JSON.parse(data) : null;
    }

    async getUserNutritionData(userId) {
        const data = localStorage.getItem(`nutrition_${userId}`);
        return data ? JSON.parse(data) : null;
    }

    async getUserMoodData(userId) {
        const data = localStorage.getItem(`mood_${userId}`);
        return data ? JSON.parse(data) : null;
    }

    async deleteFromIndexedDB(userId) {
        // Implementation would depend on IndexedDB structure
        console.log(`Deleting IndexedDB data for user: ${userId}`);
    }

    async updateDataReferences(oldUserId, newUserId) {
        // Update any data that references the old user ID
        console.log(`Updating references from ${oldUserId} to ${newUserId}`);
    }

    removeAuditLogs(userId) {
        localStorage.removeItem(`audit_logs_${userId}`);
    }
}

// Export the security service for use in other modules
window.SecurityService = SecurityService;
window.APIKeyManager = APIKeyManager;
window.InputValidator = InputValidator;
window.PrivacyManager = PrivacyManager;
//# sourceMappingURL=security.js.map