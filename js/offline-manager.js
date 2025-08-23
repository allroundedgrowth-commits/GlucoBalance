// GlucoBalance - Offline Data Manager
class OfflineDataManager {
    constructor() {
        this.dbName = 'GlucoBalanceOfflineDB';
        this.version = 1;
        this.db = null;
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.conflictResolutionStrategy = 'client-wins'; // 'client-wins', 'server-wins', 'merge'
        this.init();
    }

    async init() {
        try {
            this.db = await this.openOfflineDatabase();
            this.setupEventListeners();
            console.log('Offline Data Manager initialized successfully');
            
            // Enhanced initialization with performance monitoring
            this.initializationTime = Date.now();
            this.performanceMetrics = {
                syncOperations: 0,
                conflictsResolved: 0,
                cacheHits: 0,
                cacheMisses: 0,
                averageSyncTime: 0
            };
            
            // Attempt initial sync if online with enhanced error handling
            if (this.isOnline) {
                try {
                    await this.syncOfflineData();
                } catch (syncError) {
                    console.warn('Initial sync failed, will retry later:', syncError);
                    // Schedule retry
                    setTimeout(() => this.syncOfflineData(), 30000); // Retry in 30 seconds
                }
            }
            
            // Start periodic health checks
            this.startHealthMonitoring();
            
        } catch (error) {
            console.error('Offline Data Manager initialization failed:', error);
            
            // Enhanced fallback initialization
            this.initializeFallbackMode();
        }
    }

    openOfflineDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Offline data queue store
                if (!db.objectStoreNames.contains('offlineQueue')) {
                    const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
                    queueStore.createIndex('timestamp', 'timestamp');
                    queueStore.createIndex('operation', 'operation');
                    queueStore.createIndex('table', 'table');
                }

                // Conflict resolution store
                if (!db.objectStoreNames.contains('conflicts')) {
                    const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id', autoIncrement: true });
                    conflictStore.createIndex('timestamp', 'timestamp');
                    conflictStore.createIndex('table', 'table');
                    conflictStore.createIndex('recordId', 'recordId');
                }

                // Sync metadata store
                if (!db.objectStoreNames.contains('syncMetadata')) {
                    const metadataStore = db.createObjectStore('syncMetadata', { keyPath: 'key' });
                }

                // Cached responses store for offline fallbacks
                if (!db.objectStoreNames.contains('cachedResponses')) {
                    const cacheStore = db.createObjectStore('cachedResponses', { keyPath: 'key' });
                    cacheStore.createIndex('timestamp', 'timestamp');
                    cacheStore.createIndex('type', 'type');
                }
            };
        });
    }

    setupEventListeners() {
        // Online/offline status monitoring
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOnlineStatusChange(false);
        });

        // Background sync registration
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                // Register for background sync when data is queued
                this.registerBackgroundSync = () => {
                    return registration.sync.register('sync-health-data');
                };
            });
        }
    }

    async handleOnlineStatusChange(isOnline) {
        if (isOnline) {
            console.log('Device came online - attempting sync');
            await this.syncOfflineData();
            this.showConnectivityStatus('online');
        } else {
            console.log('Device went offline - enabling offline mode');
            this.showConnectivityStatus('offline');
        }
    }

    showConnectivityStatus(status) {
        // Dispatch event for UI components to handle
        const event = new CustomEvent('connectivityChanged', {
            detail: { 
                isOnline: status === 'online',
                status: status,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }

    // Queue operations for offline sync
    async queueOperation(operation, table, data, recordId = null) {
        try {
            const queueItem = {
                operation, // 'create', 'update', 'delete'
                table,
                data,
                recordId,
                timestamp: new Date().toISOString(),
                attempts: 0,
                maxAttempts: 3
            };

            const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
            const store = transaction.objectStore('offlineQueue');
            await this.promisifyRequest(store.add(queueItem));

            console.log(`Queued ${operation} operation for ${table}:`, queueItem);

            // Register for background sync if available
            if (this.registerBackgroundSync) {
                await this.registerBackgroundSync();
            }

            return queueItem;
        } catch (error) {
            console.error('Failed to queue operation:', error);
            throw error;
        }
    }

    // Enhanced sync with better error handling, batching, and progress tracking
    async syncOfflineData() {
        if (this.syncInProgress || !this.isOnline) {
            console.log('Sync skipped: already in progress or offline');
            return;
        }

        this.syncInProgress = true;
        console.log('Starting enhanced offline data synchronization...');

        try {
            const queuedOperations = await this.getQueuedOperations();
            
            if (queuedOperations.length === 0) {
                console.log('No operations to sync');
                this.dispatchSyncEvent('syncCompleted', { 
                    syncedCount: 0,
                    timestamp: new Date().toISOString()
                });
                return;
            }

            console.log(`Syncing ${queuedOperations.length} queued operations`);
            
            // Dispatch sync started event
            this.dispatchSyncEvent('syncStarted', { 
                totalOperations: queuedOperations.length,
                timestamp: new Date().toISOString()
            });

            let syncedCount = 0;
            let failedCount = 0;
            const batchSize = 5; // Process operations in batches for better performance
            
            // Process operations in batches to avoid overwhelming the server
            for (let i = 0; i < queuedOperations.length; i += batchSize) {
                const batch = queuedOperations.slice(i, i + batchSize);
                
                // Dispatch progress event
                this.dispatchSyncEvent('syncProgress', {
                    completed: i,
                    total: queuedOperations.length,
                    percentage: Math.round((i / queuedOperations.length) * 100),
                    currentBatch: Math.floor(i / batchSize) + 1,
                    totalBatches: Math.ceil(queuedOperations.length / batchSize)
                });
                
                // Process batch with parallel execution for better performance
                const batchPromises = batch.map(async (operation) => {
                    try {
                        await this.syncOperation(operation);
                        await this.removeFromQueue(operation.id);
                        syncedCount++;
                        
                        // Dispatch individual operation success
                        this.dispatchSyncEvent('operationSynced', {
                            operation: operation.operation,
                            table: operation.table,
                            id: operation.id
                        });
                        
                        return { success: true, operation };
                    } catch (error) {
                        console.error('Failed to sync operation:', operation, error);
                        await this.handleSyncError(operation, error);
                        failedCount++;
                        
                        // Dispatch individual operation failure
                        this.dispatchSyncEvent('operationFailed', {
                            operation,
                            error: error.message
                        });
                        
                        return { success: false, operation, error };
                    }
                });
                
                // Wait for batch to complete before proceeding
                await Promise.allSettled(batchPromises);
                
                // Add small delay between batches to prevent server overload
                if (i + batchSize < queuedOperations.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Update sync metadata with detailed information
            const syncMetadata = {
                lastSync: new Date().toISOString(),
                totalOperations: queuedOperations.length,
                syncedCount,
                failedCount,
                successRate: ((syncedCount / queuedOperations.length) * 100).toFixed(1)
            };
            
            await this.updateSyncMetadata('lastSync', syncMetadata.lastSync);
            await this.updateSyncMetadata('lastSyncDetails', syncMetadata);
            
            // Dispatch comprehensive sync completion event
            this.dispatchSyncEvent('syncCompleted', { 
                ...syncMetadata,
                timestamp: new Date().toISOString()
            });

            console.log(`Sync completed: ${syncedCount} successful, ${failedCount} failed`);

        } catch (error) {
            console.error('Sync process failed:', error);
            this.dispatchSyncEvent('syncFailed', { 
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncOperation(operation) {
        const { table, data, recordId, operation: op } = operation;

        // Simulate API call - replace with actual API endpoints
        const apiEndpoint = this.getApiEndpoint(table, op, recordId);
        const method = this.getHttpMethod(op);
        
        const response = await fetch(apiEndpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.getAuthToken()
            },
            body: method !== 'DELETE' ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
            if (response.status === 409) {
                // Conflict detected
                const serverData = await response.json();
                await this.handleConflict(operation, serverData);
                return;
            }
            throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Successfully synced ${op} operation for ${table}:`, result);

        // Update local data with server response if needed
        if (result && result.id && window.kiroDb) {
            await this.updateLocalDataFromServer(table, result);
        }
    }

    async handleConflict(operation, serverData) {
        console.log('Enhanced conflict detection and resolution:', operation, serverData);

        // Create detailed conflict record with enhanced metadata
        const conflict = {
            id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            operation,
            serverData,
            clientData: operation.data,
            timestamp: new Date().toISOString(),
            resolved: false,
            table: operation.table,
            recordId: operation.recordId,
            conflictType: this.determineConflictType(operation.data, serverData),
            severity: this.assessConflictSeverity(operation.data, serverData),
            autoResolvable: this.isAutoResolvable(operation.data, serverData)
        };

        try {
            // Store conflict with enhanced error handling
            const transaction = this.db.transaction(['conflicts'], 'readwrite');
            const store = transaction.objectStore('conflicts');
            await this.promisifyRequest(store.add(conflict));

            // Apply enhanced conflict resolution strategy
            const resolvedData = await this.resolveConflictEnhanced(conflict);
            
            if (resolvedData) {
                // Update local data with resolved version
                await this.updateLocalDataFromServer(operation.table, resolvedData);
                
                // Mark conflict as resolved with detailed resolution info
                conflict.resolved = true;
                conflict.resolvedData = resolvedData;
                conflict.resolvedAt = new Date().toISOString();
                conflict.resolutionStrategy = this.conflictResolutionStrategy;
                conflict.resolutionReason = this.getResolutionReason(conflict, resolvedData);
                
                const updateTransaction = this.db.transaction(['conflicts'], 'readwrite');
                const updateStore = updateTransaction.objectStore('conflicts');
                await this.promisifyRequest(updateStore.put(conflict));
                
                console.log(`Conflict resolved using ${this.conflictResolutionStrategy} strategy:`, conflict.id);
            } else {
                // Mark as requiring manual resolution
                conflict.requiresManualResolution = true;
                conflict.manualResolutionReason = 'Automatic resolution failed';
                
                const updateTransaction = this.db.transaction(['conflicts'], 'readwrite');
                const updateStore = updateTransaction.objectStore('conflicts');
                await this.promisifyRequest(updateStore.put(conflict));
                
                console.warn('Conflict requires manual resolution:', conflict.id);
            }

            // Dispatch enhanced conflict event for UI handling
            this.dispatchSyncEvent('conflictDetected', { 
                conflict,
                autoResolved: conflict.resolved,
                requiresAttention: !conflict.resolved || conflict.severity === 'high'
            });
            
        } catch (error) {
            console.error('Failed to handle conflict:', error);
            
            // Dispatch conflict handling failure event
            this.dispatchSyncEvent('conflictHandlingFailed', {
                operation,
                serverData,
                error: error.message
            });
        }
    }

    async resolveConflictEnhanced(conflict) {
        const { clientData, serverData, conflictType, severity, autoResolvable } = conflict;

        // If not auto-resolvable and high severity, require manual intervention
        if (!autoResolvable && severity === 'high') {
            console.log('Conflict requires manual resolution due to high severity');
            return null;
        }

        switch (this.conflictResolutionStrategy) {
            case 'client-wins':
                console.log('Resolving conflict: client wins strategy');
                return this.applyClientWinsStrategy(clientData, serverData, conflict);

            case 'server-wins':
                console.log('Resolving conflict: server wins strategy');
                return this.applyServerWinsStrategy(clientData, serverData, conflict);

            case 'merge':
                console.log('Resolving conflict: intelligent merge strategy');
                return this.mergeConflictDataEnhanced(clientData, serverData, conflict);

            case 'smart':
                console.log('Resolving conflict: smart resolution strategy');
                return this.applySmartResolution(clientData, serverData, conflict);

            default:
                // Enhanced default strategy based on conflict type
                return this.applyDefaultResolution(clientData, serverData, conflict);
        }
    }

    determineConflictType(clientData, serverData) {
        const clientKeys = Object.keys(clientData);
        const serverKeys = Object.keys(serverData);
        
        if (clientKeys.length !== serverKeys.length) {
            return 'structural'; // Different field structure
        }
        
        const conflictingFields = clientKeys.filter(key => 
            clientData[key] !== serverData[key] && 
            key !== 'updatedAt' && 
            key !== 'modifiedAt'
        );
        
        if (conflictingFields.length === 0) {
            return 'timestamp'; // Only timestamp differences
        } else if (conflictingFields.length === 1) {
            return 'single-field'; // Single field conflict
        } else {
            return 'multi-field'; // Multiple field conflicts
        }
    }

    assessConflictSeverity(clientData, serverData) {
        const criticalFields = ['id', 'userId', 'riskScore', 'category', 'mood'];
        const conflictingCriticalFields = criticalFields.filter(field => 
            clientData[field] !== serverData[field] && 
            clientData[field] !== undefined && 
            serverData[field] !== undefined
        );
        
        if (conflictingCriticalFields.length > 0) {
            return 'high';
        }
        
        const importantFields = ['name', 'email', 'responses', 'mealPlan', 'adherence'];
        const conflictingImportantFields = importantFields.filter(field => 
            clientData[field] !== serverData[field] && 
            clientData[field] !== undefined && 
            serverData[field] !== undefined
        );
        
        if (conflictingImportantFields.length > 0) {
            return 'medium';
        }
        
        return 'low';
    }

    isAutoResolvable(clientData, serverData) {
        // Check if conflict can be automatically resolved
        const criticalFields = ['id', 'userId'];
        const hasCriticalConflicts = criticalFields.some(field => 
            clientData[field] !== serverData[field] && 
            clientData[field] !== undefined && 
            serverData[field] !== undefined
        );
        
        return !hasCriticalConflicts;
    }

    applyClientWinsStrategy(clientData, serverData, conflict) {
        // Preserve server ID and creation timestamp, use client data for everything else
        return {
            ...clientData,
            id: serverData.id || clientData.id,
            createdAt: serverData.createdAt || clientData.createdAt,
            updatedAt: new Date().toISOString(),
            resolvedBy: 'client-wins'
        };
    }

    applyServerWinsStrategy(clientData, serverData, conflict) {
        // Use server data but preserve any client-only fields
        const clientOnlyFields = Object.keys(clientData).filter(key => 
            !(key in serverData) && clientData[key] !== undefined
        );
        
        const result = { ...serverData };
        clientOnlyFields.forEach(field => {
            result[field] = clientData[field];
        });
        
        result.updatedAt = new Date().toISOString();
        result.resolvedBy = 'server-wins';
        
        return result;
    }

    applySmartResolution(clientData, serverData, conflict) {
        // Intelligent resolution based on data freshness, completeness, and type
        const result = { ...serverData };
        
        Object.keys(clientData).forEach(key => {
            if (key === 'id' || key === 'createdAt') {
                // Always preserve server ID and creation timestamp
                return;
            }
            
            if (key === 'updatedAt' || key === 'modifiedAt') {
                // Use most recent timestamp
                const clientTime = new Date(clientData[key] || 0);
                const serverTime = new Date(serverData[key] || 0);
                result[key] = clientTime > serverTime ? clientData[key] : serverData[key];
                return;
            }
            
            // Apply field-specific smart resolution
            result[key] = this.resolveFieldSmart(key, clientData[key], serverData[key]);
        });
        
        result.updatedAt = new Date().toISOString();
        result.resolvedBy = 'smart';
        
        return result;
    }

    resolveFieldSmart(fieldName, clientValue, serverValue) {
        // Smart field resolution based on field type and content
        if (clientValue === undefined || clientValue === null) {
            return serverValue;
        }
        
        if (serverValue === undefined || serverValue === null) {
            return clientValue;
        }
        
        // For health data fields, apply specific logic
        if (this.isHealthDataField(fieldName)) {
            return this.mergeHealthDataField(fieldName, clientValue, serverValue);
        }
        
        // For arrays, merge intelligently
        if (Array.isArray(clientValue) && Array.isArray(serverValue)) {
            return this.mergeArraysIntelligently(clientValue, serverValue);
        }
        
        // For strings, prefer longer/more complete content
        if (typeof clientValue === 'string' && typeof serverValue === 'string') {
            return clientValue.length > serverValue.length ? clientValue : serverValue;
        }
        
        // For numbers, prefer non-zero values
        if (typeof clientValue === 'number' && typeof serverValue === 'number') {
            return clientValue !== 0 ? clientValue : serverValue;
        }
        
        // Default to client value (more recent)
        return clientValue;
    }

    mergeArraysIntelligently(clientArray, serverArray) {
        // Merge arrays while avoiding duplicates and preserving order
        const merged = [...serverArray];
        
        clientArray.forEach(item => {
            if (typeof item === 'object' && item.id) {
                // For objects with IDs, replace or add
                const existingIndex = merged.findIndex(existing => existing.id === item.id);
                if (existingIndex >= 0) {
                    merged[existingIndex] = item;
                } else {
                    merged.push(item);
                }
            } else if (!merged.includes(item)) {
                // For primitives, add if not already present
                merged.push(item);
            }
        });
        
        return merged;
    }

    applyDefaultResolution(clientData, serverData, conflict) {
        // Enhanced default resolution based on conflict characteristics
        switch (conflict.conflictType) {
            case 'timestamp':
                return this.applyServerWinsStrategy(clientData, serverData, conflict);
            
            case 'single-field':
                return this.applySmartResolution(clientData, serverData, conflict);
            
            case 'multi-field':
                return this.mergeConflictDataEnhanced(clientData, serverData, conflict);
            
            default:
                return this.applyServerWinsStrategy(clientData, serverData, conflict);
        }
    }

    getResolutionReason(conflict, resolvedData) {
        const reasons = [];
        
        if (conflict.conflictType === 'timestamp') {
            reasons.push('Resolved timestamp-only conflict');
        }
        
        if (conflict.severity === 'low') {
            reasons.push('Low severity conflict auto-resolved');
        }
        
        if (conflict.autoResolvable) {
            reasons.push('Conflict was auto-resolvable');
        }
        
        reasons.push(`Used ${this.conflictResolutionStrategy} strategy`);
        
        return reasons.join('; ');
    }

    mergeConflictDataEnhanced(clientData, serverData, conflict) {
        // Enhanced intelligent merge strategy with comprehensive field-specific logic
        const merged = { ...serverData };
        const mergeLog = [];
        const conflictMetadata = {
            mergeStrategy: 'enhanced-intelligent',
            conflictId: conflict.id,
            mergedAt: new Date().toISOString(),
            fieldResolutions: {}
        };

        // Enhanced merge strategy with detailed logging and validation
        Object.keys(clientData).forEach(key => {
            let resolutionReason = '';
            let originalValue = merged[key];
            
            if (key === 'updatedAt' || key === 'modifiedAt') {
                // Use most recent timestamp with validation
                const clientTime = new Date(clientData[key]);
                const serverTime = new Date(serverData[key]);
                
                if (isNaN(clientTime.getTime()) && isNaN(serverTime.getTime())) {
                    merged[key] = new Date().toISOString();
                    resolutionReason = 'Both timestamps invalid, used current time';
                } else if (isNaN(clientTime.getTime())) {
                    merged[key] = serverData[key];
                    resolutionReason = 'Client timestamp invalid, used server';
                } else if (isNaN(serverTime.getTime())) {
                    merged[key] = clientData[key];
                    resolutionReason = 'Server timestamp invalid, used client';
                } else if (clientTime > serverTime) {
                    merged[key] = clientData[key];
                    resolutionReason = 'Client timestamp more recent';
                } else {
                    resolutionReason = 'Server timestamp more recent or equal';
                }
                
            } else if (key === 'id' || key === 'createdAt') {
                // Always preserve server ID and creation timestamp
                resolutionReason = `Preserved server ${key} for data integrity`;
                
            } else if (this.isHealthDataField(key)) {
                // Enhanced health data field handling
                const mergedValue = this.mergeHealthDataFieldEnhanced(key, clientData[key], serverData[key]);
                merged[key] = mergedValue;
                resolutionReason = `Applied health-specific merge logic for ${key}`;
                
            } else if (this.isMetadataField(key)) {
                // Handle metadata fields specially
                merged[key] = this.mergeMetadataField(key, clientData[key], serverData[key]);
                resolutionReason = `Applied metadata merge logic for ${key}`;
                
            } else {
                // Enhanced general field merge logic
                const mergeResult = this.mergeGeneralField(key, clientData[key], serverData[key]);
                merged[key] = mergeResult.value;
                resolutionReason = mergeResult.reason;
            }
            
            // Log detailed resolution information
            if (originalValue !== merged[key]) {
                mergeLog.push(`${key}: ${resolutionReason}`);
                conflictMetadata.fieldResolutions[key] = {
                    clientValue: clientData[key],
                    serverValue: serverData[key],
                    resolvedValue: merged[key],
                    reason: resolutionReason
                };
            }
        });

        // Add any client-only fields that don't exist on server
        Object.keys(clientData).forEach(key => {
            if (!(key in serverData) && clientData[key] !== undefined) {
                merged[key] = clientData[key];
                mergeLog.push(`Added client-only field: ${key}`);
                conflictMetadata.fieldResolutions[key] = {
                    clientValue: clientData[key],
                    serverValue: undefined,
                    resolvedValue: clientData[key],
                    reason: 'Client-only field preserved'
                };
            }
        });

        // Add merge metadata
        merged.updatedAt = new Date().toISOString();
        merged._conflictResolution = conflictMetadata;
        merged._mergeLog = mergeLog;

        // Log comprehensive merge decisions
        console.log('Enhanced conflict merge completed:', {
            conflictId: conflict.id,
            fieldsResolved: Object.keys(conflictMetadata.fieldResolutions).length,
            mergeLog
        });

        return merged;
    }

    mergeHealthDataFieldEnhanced(fieldName, clientValue, serverValue) {
        // Enhanced health data field merging with validation and safety checks
        switch (fieldName) {
            case 'mood':
                // For mood, prefer valid values in range 1-5
                const clientMood = parseInt(clientValue);
                const serverMood = parseInt(serverValue);
                
                if (clientMood >= 1 && clientMood <= 5 && (serverMood < 1 || serverMood > 5)) {
                    return clientValue;
                } else if (serverMood >= 1 && serverMood <= 5 && (clientMood < 1 || clientMood > 5)) {
                    return serverValue;
                } else if (clientMood >= 1 && clientMood <= 5 && serverMood >= 1 && serverMood <= 5) {
                    // Both valid, prefer more recent (client is usually more recent)
                    return clientValue;
                }
                return serverValue; // Fallback to server
            
            case 'riskScore':
                // For risk scores, prefer valid numeric values
                const clientScore = parseFloat(clientValue);
                const serverScore = parseFloat(serverValue);
                
                if (!isNaN(clientScore) && isNaN(serverScore)) {
                    return clientValue;
                } else if (isNaN(clientScore) && !isNaN(serverScore)) {
                    return serverValue;
                } else if (!isNaN(clientScore) && !isNaN(serverScore)) {
                    // Both valid, prefer higher precision or more recent
                    return clientValue;
                }
                return serverValue;
            
            case 'responses':
                // For assessment responses, merge arrays intelligently
                if (Array.isArray(clientValue) && Array.isArray(serverValue)) {
                    return this.mergeAssessmentResponses(clientValue, serverValue);
                }
                return clientValue || serverValue;
            
            case 'adherence':
                // For adherence, prefer valid percentages (0-100)
                const clientAdherence = parseFloat(clientValue);
                const serverAdherence = parseFloat(serverValue);
                
                if (clientAdherence >= 0 && clientAdherence <= 100 && 
                    (serverAdherence < 0 || serverAdherence > 100)) {
                    return clientValue;
                } else if (serverAdherence >= 0 && serverAdherence <= 100 && 
                          (clientAdherence < 0 || clientAdherence > 100)) {
                    return serverValue;
                } else if (clientAdherence >= 0 && clientAdherence <= 100 && 
                          serverAdherence >= 0 && serverAdherence <= 100) {
                    // Both valid, prefer higher value (more optimistic)
                    return Math.max(clientValue, serverValue);
                }
                return serverValue;
            
            case 'notes':
                // For notes, merge text intelligently
                return this.mergeTextFields(clientValue, serverValue);
            
            case 'mealPlan':
                // For meal plans, merge objects intelligently
                if (typeof clientValue === 'object' && typeof serverValue === 'object') {
                    return this.mergeMealPlans(clientValue, serverValue);
                }
                return clientValue || serverValue;
            
            default:
                return clientValue !== undefined ? clientValue : serverValue;
        }
    }

    mergeAssessmentResponses(clientResponses, serverResponses) {
        // Merge assessment responses by question ID
        const merged = [...serverResponses];
        
        clientResponses.forEach(clientResponse => {
            if (clientResponse && clientResponse.questionId) {
                const existingIndex = merged.findIndex(r => r && r.questionId === clientResponse.questionId);
                if (existingIndex >= 0) {
                    // Prefer client response for same question (more recent)
                    merged[existingIndex] = clientResponse;
                } else {
                    // Add new client response
                    merged.push(clientResponse);
                }
            }
        });
        
        return merged.filter(response => response && response.questionId); // Remove invalid responses
    }

    mergeTextFields(clientText, serverText) {
        // Intelligent text field merging
        if (!clientText && !serverText) return '';
        if (!clientText) return serverText;
        if (!serverText) return clientText;
        
        // If texts are identical, return one
        if (clientText === serverText) return clientText;
        
        // If one contains the other, return the longer one
        if (clientText.includes(serverText)) return clientText;
        if (serverText.includes(clientText)) return serverText;
        
        // If both are different and substantial, concatenate with separator
        if (clientText.length > 10 && serverText.length > 10) {
            return `${serverText}\n[Updated]: ${clientText}`;
        }
        
        // Prefer longer text for short texts
        return clientText.length > serverText.length ? clientText : serverText;
    }

    mergeMealPlans(clientPlan, serverPlan) {
        // Merge meal plan objects intelligently
        const merged = { ...serverPlan };
        
        Object.keys(clientPlan).forEach(key => {
            if (key === 'createdAt' || key === 'id') {
                // Preserve server metadata
                return;
            }
            
            if (Array.isArray(clientPlan[key]) && Array.isArray(serverPlan[key])) {
                // Merge arrays (e.g., meals for a day)
                merged[key] = this.mergeArraysIntelligently(clientPlan[key], serverPlan[key]);
            } else if (clientPlan[key] !== undefined) {
                // Use client value if available
                merged[key] = clientPlan[key];
            }
        });
        
        return merged;
    }

    isMetadataField(fieldName) {
        const metadataFields = ['version', 'source', 'deviceId', 'appVersion', 'syncedAt'];
        return metadataFields.includes(fieldName);
    }

    mergeMetadataField(fieldName, clientValue, serverValue) {
        switch (fieldName) {
            case 'version':
                // Prefer higher version numbers
                const clientVersion = parseFloat(clientValue) || 0;
                const serverVersion = parseFloat(serverValue) || 0;
                return clientVersion > serverVersion ? clientValue : serverValue;
            
            case 'source':
                // Prefer client source (more recent)
                return clientValue || serverValue;
            
            default:
                return clientValue !== undefined ? clientValue : serverValue;
        }
    }

    mergeGeneralField(fieldName, clientValue, serverValue) {
        // Enhanced general field merging with detailed reasoning
        if (clientValue === undefined || clientValue === null) {
            return { value: serverValue, reason: 'Client value was null/undefined' };
        }
        
        if (serverValue === undefined || serverValue === null) {
            return { value: clientValue, reason: 'Server value was null/undefined' };
        }
        
        if (clientValue === serverValue) {
            return { value: clientValue, reason: 'Values were identical' };
        }
        
        // Type-specific merging
        if (Array.isArray(clientValue) && Array.isArray(serverValue)) {
            return { 
                value: this.mergeArraysIntelligently(clientValue, serverValue), 
                reason: 'Merged arrays intelligently' 
            };
        }
        
        if (typeof clientValue === 'string' && typeof serverValue === 'string') {
            const longerValue = clientValue.length > serverValue.length ? clientValue : serverValue;
            return { 
                value: longerValue, 
                reason: `Preferred longer string (${longerValue.length} vs ${clientValue === longerValue ? serverValue.length : clientValue.length} chars)` 
            };
        }
        
        if (typeof clientValue === 'number' && typeof serverValue === 'number') {
            const nonZeroValue = clientValue !== 0 ? clientValue : serverValue;
            return { 
                value: nonZeroValue, 
                reason: nonZeroValue === clientValue ? 'Preferred non-zero client value' : 'Used server value' 
            };
        }
        
        if (typeof clientValue === 'boolean' && typeof serverValue === 'boolean') {
            return { 
                value: clientValue, 
                reason: 'Preferred client boolean value (more recent)' 
            };
        }
        
        // Default to client value (more recent)
        return { 
            value: clientValue, 
            reason: 'Defaulted to client value (more recent)' 
        };
    }

    isHealthDataField(fieldName) {
        const healthFields = ['mood', 'riskScore', 'category', 'responses', 'adherence', 'mealPlan', 'notes'];
        return healthFields.includes(fieldName);
    }

    mergeHealthDataField(fieldName, clientValue, serverValue) {
        switch (fieldName) {
            case 'mood':
                // For mood, prefer the most recent entry (client is usually more recent)
                return clientValue !== undefined ? clientValue : serverValue;
            
            case 'riskScore':
                // For risk scores, prefer higher precision or more recent calculation
                return typeof clientValue === 'number' ? clientValue : serverValue;
            
            case 'responses':
                // For assessment responses, merge arrays intelligently
                if (Array.isArray(clientValue) && Array.isArray(serverValue)) {
                    const merged = [...serverValue];
                    clientValue.forEach(clientResponse => {
                        const existingIndex = merged.findIndex(r => r.questionId === clientResponse.questionId);
                        if (existingIndex >= 0) {
                            merged[existingIndex] = clientResponse; // Prefer client response
                        } else {
                            merged.push(clientResponse);
                        }
                    });
                    return merged;
                }
                return clientValue || serverValue;
            
            case 'adherence':
                // For adherence, prefer the higher value (more optimistic)
                return Math.max(clientValue || 0, serverValue || 0);
            
            case 'notes':
                // For notes, concatenate if both exist
                if (clientValue && serverValue && clientValue !== serverValue) {
                    return `${serverValue}\n[Updated]: ${clientValue}`;
                }
                return clientValue || serverValue;
            
            default:
                return clientValue !== undefined ? clientValue : serverValue;
        }
    }

    selectBetterValue(clientValue, serverValue) {
        // Select the "better" value based on completeness and recency
        if (typeof clientValue === 'string' && typeof serverValue === 'string') {
            // Prefer longer, more descriptive strings
            return clientValue.length > serverValue.length ? clientValue : serverValue;
        }
        
        if (typeof clientValue === 'number' && typeof serverValue === 'number') {
            // For numbers, prefer non-zero values
            return clientValue !== 0 ? clientValue : serverValue;
        }
        
        if (Array.isArray(clientValue) && Array.isArray(serverValue)) {
            // Prefer longer arrays (more complete data)
            return clientValue.length > serverValue.length ? clientValue : serverValue;
        }
        
        // Default to client value (more recent)
        return clientValue;
    }

    async handleSyncError(operation, error) {
        operation.attempts = (operation.attempts || 0) + 1;
        operation.lastError = error.message;
        operation.lastAttempt = new Date().toISOString();

        if (operation.attempts >= operation.maxAttempts) {
            console.error(`Max sync attempts reached for operation:`, operation);
            
            // Move to failed operations store or mark as failed
            operation.failed = true;
            
            // Dispatch failure event
            this.dispatchSyncEvent('operationFailed', { operation, error });
        }

        // Update operation in queue
        const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
        const store = transaction.objectStore('offlineQueue');
        await this.promisifyRequest(store.put(operation));
    }

    // Cache AI responses for offline fallback
    async cacheAIResponse(key, response, type = 'ai-response') {
        try {
            const cacheItem = {
                key,
                response,
                type,
                timestamp: new Date().toISOString(),
                expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() // 24 hours
            };

            const transaction = this.db.transaction(['cachedResponses'], 'readwrite');
            const store = transaction.objectStore('cachedResponses');
            await this.promisifyRequest(store.put(cacheItem));

            console.log(`Cached AI response for key: ${key}`);
        } catch (error) {
            console.error('Failed to cache AI response:', error);
        }
    }

    async getCachedAIResponse(key) {
        try {
            const transaction = this.db.transaction(['cachedResponses'], 'readonly');
            const store = transaction.objectStore('cachedResponses');
            const result = await this.promisifyRequest(store.get(key));

            if (result && new Date(result.expiresAt) > new Date()) {
                console.log(`Retrieved cached AI response for key: ${key}`);
                return result.response;
            }

            return null;
        } catch (error) {
            console.error('Failed to retrieve cached AI response:', error);
            return null;
        }
    }

    // Utility methods
    async getQueuedOperations() {
        const transaction = this.db.transaction(['offlineQueue'], 'readonly');
        const store = transaction.objectStore('offlineQueue');
        const index = store.index('timestamp');
        return this.promisifyRequest(index.getAll());
    }

    async removeFromQueue(operationId) {
        const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
        const store = transaction.objectStore('offlineQueue');
        await this.promisifyRequest(store.delete(operationId));
    }

    async updateSyncMetadata(key, value) {
        const transaction = this.db.transaction(['syncMetadata'], 'readwrite');
        const store = transaction.objectStore('syncMetadata');
        await this.promisifyRequest(store.put({ key, value, timestamp: new Date().toISOString() }));
    }

    async getSyncMetadata(key) {
        const transaction = this.db.transaction(['syncMetadata'], 'readonly');
        const store = transaction.objectStore('syncMetadata');
        const result = await this.promisifyRequest(store.get(key));
        return result ? result.value : null;
    }

    async updateLocalDataFromServer(table, serverData) {
        if (!window.kiroDb) return;

        try {
            switch (table) {
                case 'users':
                    await window.kiroDb.updateUser(serverData.id, serverData);
                    break;
                case 'assessments':
                    // Update assessment in local database
                    break;
                case 'moods':
                    // Update mood in local database
                    break;
                case 'nutritionPlans':
                    // Update nutrition plan in local database
                    break;
                default:
                    console.warn(`Unknown table for local update: ${table}`);
            }
        } catch (error) {
            console.error('Failed to update local data from server:', error);
        }
    }

    getApiEndpoint(table, operation, recordId) {
        const baseUrl = '/api'; // Replace with actual API base URL
        
        switch (table) {
            case 'users':
                return operation === 'create' ? `${baseUrl}/users` : `${baseUrl}/users/${recordId}`;
            case 'assessments':
                return operation === 'create' ? `${baseUrl}/assessments` : `${baseUrl}/assessments/${recordId}`;
            case 'moods':
                return operation === 'create' ? `${baseUrl}/moods` : `${baseUrl}/moods/${recordId}`;
            case 'nutritionPlans':
                return operation === 'create' ? `${baseUrl}/nutrition-plans` : `${baseUrl}/nutrition-plans/${recordId}`;
            default:
                throw new Error(`Unknown table: ${table}`);
        }
    }

    getHttpMethod(operation) {
        switch (operation) {
            case 'create': return 'POST';
            case 'update': return 'PUT';
            case 'delete': return 'DELETE';
            default: return 'POST';
        }
    }

    getAuthToken() {
        // Get authentication token from auth service
        if (window.authService && window.authService.getToken) {
            return `Bearer ${window.authService.getToken()}`;
        }
        return '';
    }

    dispatchSyncEvent(eventType, detail) {
        const event = new CustomEvent(eventType, { detail });
        document.dispatchEvent(event);
    }

    promisifyRequest(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Public API methods
    async isOperationQueued(table, recordId) {
        const operations = await this.getQueuedOperations();
        return operations.some(op => op.table === table && op.recordId === recordId);
    }

    async getQueuedOperationsCount() {
        const operations = await this.getQueuedOperations();
        return operations.length;
    }

    async clearQueue() {
        const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
        const store = transaction.objectStore('offlineQueue');
        await this.promisifyRequest(store.clear());
        console.log('Offline queue cleared');
    }

    async getConflicts() {
        const transaction = this.db.transaction(['conflicts'], 'readonly');
        const store = transaction.objectStore('conflicts');
        return this.promisifyRequest(store.getAll());
    }

    setConflictResolutionStrategy(strategy) {
        if (['client-wins', 'server-wins', 'merge', 'smart'].includes(strategy)) {
            this.conflictResolutionStrategy = strategy;
            console.log(`Conflict resolution strategy set to: ${strategy}`);
        } else {
            console.error('Invalid conflict resolution strategy:', strategy);
        }
    }

    // Enhanced performance monitoring methods
    async getPerformanceMetrics() {
        return {
            syncOperations: this.performanceMetrics?.syncOperations || 0,
            conflictsResolved: this.performanceMetrics?.conflictsResolved || 0,
            cacheHits: this.performanceMetrics?.cacheHits || 0,
            cacheMisses: this.performanceMetrics?.cacheMisses || 0,
            uptime: this.initializationTime ? Date.now() - this.initializationTime : 0,
            fallbackMode: this.fallbackMode || false,
            dbStatus: this.db ? 'connected' : 'disconnected',
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress
        };
    }

    // Enhanced health monitoring
    async performHealthCheck() {
        try {
            const healthStatus = {
                database: false,
                storage: false,
                sync: false,
                conflicts: 0,
                queueSize: 0,
                timestamp: new Date().toISOString()
            };

            // Check database connectivity
            if (this.db) {
                try {
                    const transaction = this.db.transaction(['offlineQueue'], 'readonly');
                    const store = transaction.objectStore('offlineQueue');
                    await this.promisifyRequest(store.count());
                    healthStatus.database = true;
                } catch (error) {
                    console.warn('Database health check failed:', error);
                }
            }

            // Check storage quota
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                try {
                    const estimate = await navigator.storage.estimate();
                    const usagePercentage = (estimate.usage / estimate.quota) * 100;
                    healthStatus.storage = usagePercentage < 90; // Consider healthy if under 90%
                    
                    if (usagePercentage > 80) {
                        console.warn('Storage quota usage high:', usagePercentage.toFixed(1) + '%');
                    }
                } catch (error) {
                    console.warn('Storage health check failed:', error);
                }
            }

            // Check sync status
            healthStatus.sync = !this.syncInProgress && this.isOnline;
            
            // Get queue and conflict counts
            try {
                healthStatus.queueSize = await this.getQueuedOperationsCount();
                const conflicts = await this.getConflicts();
                healthStatus.conflicts = conflicts.length;
            } catch (error) {
                console.warn('Queue/conflict health check failed:', error);
            }

            // Dispatch health status event
            document.dispatchEvent(new CustomEvent('offlineHealthStatus', {
                detail: healthStatus
            }));

            return healthStatus;
        } catch (error) {
            console.error('Health check failed:', error);
            return null;
        }
    }

    // Enhanced cleanup methods
    async cleanupExpiredData() {
        try {
            // Clean up expired AI responses
            if (this.db) {
                const transaction = this.db.transaction(['cachedResponses'], 'readwrite');
                const store = transaction.objectStore('cachedResponses');
                const allResponses = await this.promisifyRequest(store.getAll());
                
                let cleanedCount = 0;
                for (const response of allResponses) {
                    if (new Date(response.expiresAt) <= new Date()) {
                        await this.promisifyRequest(store.delete(response.key));
                        cleanedCount++;
                    }
                }
                
                if (cleanedCount > 0) {
                    console.log(`Cleaned up ${cleanedCount} expired AI responses`);
                }
            }

            // Clean up old conflicts (older than 30 days)
            const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
            if (this.db) {
                const transaction = this.db.transaction(['conflicts'], 'readwrite');
                const store = transaction.objectStore('conflicts');
                const allConflicts = await this.promisifyRequest(store.getAll());
                
                let cleanedConflicts = 0;
                for (const conflict of allConflicts) {
                    if (new Date(conflict.timestamp) <= thirtyDaysAgo && conflict.resolved) {
                        await this.promisifyRequest(store.delete(conflict.id));
                        cleanedConflicts++;
                    }
                }
                
                if (cleanedConflicts > 0) {
                    console.log(`Cleaned up ${cleanedConflicts} old resolved conflicts`);
                }
            }

        } catch (error) {
            console.error('Data cleanup failed:', error);
        }
    }
}

// Initialize offline manager
window.offlineManager = new OfflineDataManager();