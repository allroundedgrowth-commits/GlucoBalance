// GlucoBalance - Offline UI Components
class OfflineUI {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncStatus = 'idle'; // 'idle', 'syncing', 'error', 'success'
        this.queuedOperations = 0;
        this.init();
    }

    init() {
        this.createOfflineIndicators();
        this.setupEventListeners();
        this.updateConnectivityStatus();
    }

    createOfflineIndicators() {
        // Create main offline status bar
        this.createOfflineStatusBar();
        
        // Create sync progress indicator
        this.createSyncProgressIndicator();
        
        // Create offline capabilities panel
        this.createOfflineCapabilitiesPanel();
    }

    createOfflineStatusBar() {
        const statusBar = document.createElement('div');
        statusBar.id = 'offline-status-bar';
        statusBar.className = 'offline-status-bar';
        statusBar.innerHTML = `
            <div class="status-content">
                <div class="connectivity-indicator">
                    <span class="status-icon" id="connectivity-icon">📶</span>
                    <span class="status-text" id="connectivity-text">Online</span>
                    <span class="connection-quality" id="connection-quality"></span>
                </div>
                <div class="sync-indicator" id="sync-indicator">
                    <span class="sync-icon" id="sync-icon">✓</span>
                    <span class="sync-text" id="sync-text">Synced</span>
                    <span class="last-sync" id="last-sync"></span>
                </div>
                <div class="queue-indicator" id="queue-indicator" style="display: none;">
                    <span class="queue-icon">⏳</span>
                    <span class="queue-text" id="queue-text">0 pending</span>
                    <button class="queue-action" id="queue-action" title="View pending changes">👁️</button>
                </div>
                <div class="offline-capabilities" id="offline-capabilities" style="display: none;">
                    <span class="capabilities-icon">🔧</span>
                    <span class="capabilities-text">Limited features available</span>
                </div>
            </div>
        `;

        // Insert at the top of the body
        document.body.insertBefore(statusBar, document.body.firstChild);
        
        // Add click handler for queue action
        document.getElementById('queue-action').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showOfflineCapabilitiesPanel();
        });
    }

    createSyncProgressIndicator() {
        const progressIndicator = document.createElement('div');
        progressIndicator.id = 'sync-progress-indicator';
        progressIndicator.className = 'sync-progress-indicator';
        progressIndicator.innerHTML = `
            <div class="progress-content">
                <div class="progress-text">Syncing data...</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="sync-progress-fill"></div>
                </div>
                <div class="progress-details" id="sync-progress-details">Preparing sync...</div>
            </div>
        `;

        document.body.appendChild(progressIndicator);
    }

    createOfflineCapabilitiesPanel() {
        const panel = document.createElement('div');
        panel.id = 'offline-capabilities-panel';
        panel.className = 'offline-capabilities-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Offline Mode</h3>
                <div class="panel-status" id="panel-status">
                    <span class="status-dot offline"></span>
                    <span>Limited functionality</span>
                </div>
                <button class="close-btn" id="close-offline-panel">×</button>
            </div>
            <div class="panel-content">
                <div class="capability-section">
                    <h4>✅ Available Offline:</h4>
                    <ul class="capability-list">
                        <li class="capability-item available">
                            <span class="capability-icon">📊</span>
                            <span>View previous assessments and results</span>
                        </li>
                        <li class="capability-item available">
                            <span class="capability-icon">😊</span>
                            <span>Log daily mood entries</span>
                        </li>
                        <li class="capability-item available">
                            <span class="capability-icon">🍽️</span>
                            <span>View and track nutrition plans</span>
                        </li>
                        <li class="capability-item available">
                            <span class="capability-icon">📈</span>
                            <span>Access progress dashboard</span>
                        </li>
                        <li class="capability-item available">
                            <span class="capability-icon">💾</span>
                            <span>All data saved locally</span>
                        </li>
                    </ul>
                </div>
                <div class="capability-section">
                    <h4>⚠️ Requires Internet:</h4>
                    <ul class="capability-list">
                        <li class="capability-item unavailable">
                            <span class="capability-icon">🤖</span>
                            <span>AI-powered insights and explanations</span>
                        </li>
                        <li class="capability-item unavailable">
                            <span class="capability-icon">🍳</span>
                            <span>Generate new personalized meal plans</span>
                        </li>
                        <li class="capability-item unavailable">
                            <span class="capability-icon">📋</span>
                            <span>Doctor report generation and export</span>
                        </li>
                        <li class="capability-item unavailable">
                            <span class="capability-icon">🔄</span>
                            <span>Real-time data synchronization</span>
                        </li>
                    </ul>
                </div>
                <div class="sync-section" id="offline-sync-section">
                    <h4>📤 Pending Changes:</h4>
                    <div class="sync-status-info" id="sync-status-info">
                        <p class="sync-info">Your data is safely stored locally and will sync automatically when you're back online.</p>
                    </div>
                    <div class="pending-changes" id="pending-changes-list">
                        <p class="no-changes">No pending changes</p>
                    </div>
                    <div class="sync-actions">
                        <button class="btn-primary" id="manual-sync-btn" disabled>
                            Sync When Online
                        </button>
                        <button class="btn-secondary" id="view-conflicts-btn" style="display: none;">
                            View Conflicts
                        </button>
                    </div>
                </div>
                <div class="offline-tips" id="offline-tips">
                    <h4>💡 Offline Tips:</h4>
                    <ul class="tips-list">
                        <li>Continue logging your health data - it will sync when you're online</li>
                        <li>Review your progress and trends using cached data</li>
                        <li>Check the status bar for sync updates</li>
                        <li>AI features will resume automatically when connected</li>
                    </ul>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Setup panel event listeners
        document.getElementById('close-offline-panel').addEventListener('click', () => {
            this.hideOfflineCapabilitiesPanel();
        });

        document.getElementById('manual-sync-btn').addEventListener('click', () => {
            this.triggerManualSync();
        });

        document.getElementById('view-conflicts-btn').addEventListener('click', () => {
            this.showConflictsPanel();
        });
    }

    setupEventListeners() {
        // Listen for connectivity changes
        document.addEventListener('connectivityChanged', (event) => {
            this.handleConnectivityChange(event.detail);
        });

        // Enhanced sync event listeners
        document.addEventListener('syncStarted', (event) => {
            this.handleSyncStarted(event.detail);
        });

        document.addEventListener('syncProgress', (event) => {
            this.handleSyncProgress(event.detail);
        });

        document.addEventListener('syncCompleted', (event) => {
            this.handleSyncCompleted(event.detail);
        });

        document.addEventListener('syncFailed', (event) => {
            this.handleSyncFailed(event.detail);
        });

        document.addEventListener('operationSynced', (event) => {
            this.handleOperationSynced(event.detail);
        });

        document.addEventListener('conflictDetected', (event) => {
            this.handleConflictDetected(event.detail);
        });

        document.addEventListener('conflictHandlingFailed', (event) => {
            this.handleConflictHandlingFailed(event.detail);
        });

        document.addEventListener('operationFailed', (event) => {
            this.handleOperationFailed(event.detail);
        });

        // Listen for offline operations
        document.addEventListener('offlineOperationQueued', (event) => {
            this.handleOfflineOperationQueued(event.detail);
        });

        // Enhanced status bar interactions
        const statusBar = document.getElementById('offline-status-bar');
        if (statusBar) {
            statusBar.addEventListener('click', () => {
                if (!this.isOnline) {
                    this.showOfflineCapabilitiesPanel();
                } else {
                    this.showOnlineStatusDetails();
                }
            });
            
            // Add hover effects for better UX
            statusBar.addEventListener('mouseenter', () => {
                this.showStatusTooltip();
            });
            
            statusBar.addEventListener('mouseleave', () => {
                this.hideStatusTooltip();
            });
        }

        // Enhanced online/offline events with debouncing
        let connectivityTimeout;
        
        window.addEventListener('online', () => {
            clearTimeout(connectivityTimeout);
            connectivityTimeout = setTimeout(() => {
                this.isOnline = true;
                this.offlineTipsShown = false; // Reset tips for next offline session
                this.updateConnectivityStatus();
            }, 500); // Debounce to avoid rapid state changes
        });

        window.addEventListener('offline', () => {
            clearTimeout(connectivityTimeout);
            connectivityTimeout = setTimeout(() => {
                this.isOnline = false;
                this.updateConnectivityStatus();
            }, 500);
        });

        // Listen for visibility changes to update sync status
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.updateQueueStatus();
                this.updateLastSyncTime();
            }
        });
    }

    handleSyncStarted(detail) {
        this.syncStatus = 'syncing';
        this.updateSyncStatus();
        
        if (detail.totalOperations > 0) {
            this.showSyncProgress(`Starting sync of ${detail.totalOperations} operations...`);
            this.showNotification(`Syncing ${detail.totalOperations} changes...`, 'info');
        }
    }

    handleSyncProgress(detail) {
        const { completed, total, percentage, currentBatch, totalBatches } = detail;
        
        this.updateSyncProgress(
            percentage, 
            `Syncing batch ${currentBatch}/${totalBatches} (${completed}/${total} operations)`
        );
        
        // Update queue status in real-time
        this.queuedOperations = total - completed;
        this.updateQueueStatus();
    }

    handleOperationSynced(detail) {
        // Provide feedback for individual operation success
        console.log(`✅ Synced ${detail.operation} operation for ${detail.table}`);
        
        // Update UI to reflect successful sync
        this.decrementQueuedOperations();
    }

    handleConflictHandlingFailed(detail) {
        this.showEnhancedNotification(
            `Failed to handle data conflict for ${detail.operation.table}. Manual resolution may be required.`,
            'error',
            [
                {
                    text: 'View Details',
                    handler: 'window.offlineUI.showConflictsPanel()'
                }
            ]
        );
    }

    showOnlineStatusDetails() {
        // Show detailed online status information
        this.showEnhancedNotification(
            'You\'re online! All features are available including AI insights, meal planning, and real-time sync.',
            'success',
            [
                {
                    text: 'Check Sync Status',
                    handler: 'window.offlineUI.triggerManualSync()'
                }
            ]
        );
    }

    showStatusTooltip() {
        // Show tooltip with current status details
        const statusBar = document.getElementById('offline-status-bar');
        if (!statusBar || this.tooltipVisible) return;
        
        this.tooltipVisible = true;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'status-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <strong>${this.isOnline ? 'Online' : 'Offline'} Mode</strong>
                </div>
                <div class="tooltip-body">
                    ${this.isOnline ? 
                        `<p>✅ All features available</p>
                         <p>🔄 Auto-sync enabled</p>
                         <p>🤖 AI insights active</p>` :
                        `<p>📱 Basic features available</p>
                         <p>💾 Data saved locally</p>
                         <p>🔄 Will sync when online</p>`
                    }
                    ${this.queuedOperations > 0 ? 
                        `<p>⏳ ${this.queuedOperations} changes pending</p>` : 
                        '<p>✅ All changes synced</p>'
                    }
                </div>
                <div class="tooltip-footer">
                    <small>Click for ${this.isOnline ? 'sync details' : 'offline features'}</small>
                </div>
            </div>
        `;
        
        statusBar.appendChild(tooltip);
        
        // Position tooltip
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 50);
    }

    hideStatusTooltip() {
        const tooltip = document.querySelector('.status-tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentElement) {
                    tooltip.remove();
                }
                this.tooltipVisible = false;
            }, 200);
        }
    }

    updateConnectivityStatus() {
        const statusBar = document.getElementById('offline-status-bar');
        const connectivityIcon = document.getElementById('connectivity-icon');
        const connectivityText = document.getElementById('connectivity-text');
        const connectionQuality = document.getElementById('connection-quality');
        const offlineCapabilities = document.getElementById('offline-capabilities');

        if (this.isOnline) {
            statusBar.className = 'offline-status-bar online';
            connectivityIcon.textContent = '📶';
            connectivityText.textContent = 'Online';
            
            // Enhanced connection quality monitoring
            this.updateConnectionQuality();
            
            // Hide offline capabilities indicator with smooth transition
            if (offlineCapabilities) {
                offlineCapabilities.style.opacity = '0';
                setTimeout(() => {
                    offlineCapabilities.style.display = 'none';
                }, 300);
            }
            
            // Show online-specific indicators
            this.showOnlineIndicators();
            
        } else {
            statusBar.className = 'offline-status-bar offline';
            connectivityIcon.textContent = '📵';
            connectivityText.textContent = 'Offline';
            
            // Clear connection quality
            if (connectionQuality) {
                connectionQuality.textContent = '';
            }
            
            // Show offline capabilities indicator with smooth transition
            if (offlineCapabilities) {
                offlineCapabilities.style.display = 'flex';
                setTimeout(() => {
                    offlineCapabilities.style.opacity = '1';
                }, 50);
            }
            
            // Show offline-specific indicators
            this.showOfflineIndicators();
        }

        this.updateSyncStatus();
        this.updateQueueStatus();
        this.updatePanelStatus();
        this.updateLastSyncTime();
    }

    showOnlineIndicators() {
        // Add visual indicators for online mode
        const statusBar = document.getElementById('offline-status-bar');
        if (statusBar) {
            statusBar.setAttribute('data-connection-status', 'online');
            statusBar.title = 'Online - All features available';
        }
        
        // Update any online-specific UI elements
        this.updateFeatureAvailability(true);
    }

    showOfflineIndicators() {
        // Add visual indicators for offline mode
        const statusBar = document.getElementById('offline-status-bar');
        if (statusBar) {
            statusBar.setAttribute('data-connection-status', 'offline');
            statusBar.title = 'Offline - Limited features available. Click for details.';
        }
        
        // Update any offline-specific UI elements
        this.updateFeatureAvailability(false);
        
        // Show helpful offline tips
        this.showOfflineTips();
    }

    updateFeatureAvailability(isOnline) {
        // Update UI to show which features are available
        const aiFeatures = document.querySelectorAll('[data-requires="ai"], [data-requires="online"]');
        aiFeatures.forEach(element => {
            if (isOnline) {
                element.classList.remove('offline-disabled');
                element.removeAttribute('disabled');
                element.title = '';
            } else {
                element.classList.add('offline-disabled');
                element.setAttribute('disabled', 'true');
                element.title = 'This feature requires an internet connection';
            }
        });
        
        // Update offline-available features
        const offlineFeatures = document.querySelectorAll('[data-offline="true"]');
        offlineFeatures.forEach(element => {
            element.classList.remove('offline-disabled');
            element.removeAttribute('disabled');
            if (!isOnline) {
                element.title = 'Available offline';
            }
        });
    }

    showOfflineTips() {
        // Show contextual tips for offline usage
        if (!this.offlineTipsShown) {
            this.offlineTipsShown = true;
            
            setTimeout(() => {
                this.showEnhancedNotification(
                    'You\'re now offline. You can still log mood, view data, and track progress. Changes will sync when you\'re back online.',
                    'info',
                    [
                        {
                            text: 'View Offline Features',
                            handler: 'window.offlineUI.showOfflineCapabilitiesPanel()'
                        }
                    ]
                );
            }, 1000);
        }
    }

    async updateConnectionQuality() {
        const connectionQuality = document.getElementById('connection-quality');
        if (!connectionQuality || !this.isOnline) return;

        try {
            // Test connection speed with a small request
            const startTime = Date.now();
            await fetch('/manifest.json', { cache: 'no-cache' });
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            let qualityText = '';
            if (responseTime < 200) {
                qualityText = '🟢 Fast';
            } else if (responseTime < 1000) {
                qualityText = '🟡 Good';
            } else {
                qualityText = '🔴 Slow';
            }

            connectionQuality.textContent = qualityText;
        } catch (error) {
            connectionQuality.textContent = '🔴 Poor';
        }
    }

    updatePanelStatus() {
        const panelStatus = document.getElementById('panel-status');
        if (!panelStatus) return;

        const statusDot = panelStatus.querySelector('.status-dot');
        const statusText = panelStatus.querySelector('span:last-child');

        if (this.isOnline) {
            statusDot.className = 'status-dot online';
            statusText.textContent = 'Full functionality';
        } else {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'Limited functionality';
        }
    }

    updateSyncStatus() {
        const syncIcon = document.getElementById('sync-icon');
        const syncText = document.getElementById('sync-text');

        if (!this.isOnline) {
            syncIcon.textContent = '⏸️';
            syncText.textContent = 'Paused';
            return;
        }

        switch (this.syncStatus) {
            case 'syncing':
                syncIcon.textContent = '🔄';
                syncText.textContent = 'Syncing';
                break;
            case 'error':
                syncIcon.textContent = '⚠️';
                syncText.textContent = 'Error';
                break;
            case 'success':
                syncIcon.textContent = '✓';
                syncText.textContent = 'Synced';
                break;
            default:
                syncIcon.textContent = '✓';
                syncText.textContent = 'Synced';
        }
    }

    async updateQueueStatus() {
        if (window.offlineManager) {
            try {
                this.queuedOperations = await window.offlineManager.getQueuedOperationsCount();
            } catch (error) {
                console.error('Failed to get queued operations count:', error);
                this.queuedOperations = 0;
            }
        }

        const queueIndicator = document.getElementById('queue-indicator');
        const queueText = document.getElementById('queue-text');

        if (this.queuedOperations > 0) {
            queueIndicator.style.display = 'flex';
            queueText.textContent = `${this.queuedOperations} pending`;
        } else {
            queueIndicator.style.display = 'none';
        }

        // Update manual sync button
        const manualSyncBtn = document.getElementById('manual-sync-btn');
        if (manualSyncBtn) {
            manualSyncBtn.disabled = !this.isOnline || this.queuedOperations === 0;
            manualSyncBtn.textContent = this.queuedOperations > 0 ? 
                `Sync ${this.queuedOperations} Changes` : 'No Changes to Sync';
        }

        // Update pending changes list
        await this.updatePendingChangesList();
    }

    async updatePendingChangesList() {
        const pendingChangesList = document.getElementById('pending-changes-list');
        if (!pendingChangesList || !window.offlineManager) return;

        try {
            const queuedOperations = await window.offlineManager.getQueuedOperations();
            
            if (queuedOperations.length === 0) {
                pendingChangesList.innerHTML = '<p class="no-changes">No pending changes</p>';
                return;
            }

            const changesHtml = queuedOperations.map(op => `
                <div class="pending-change">
                    <span class="change-type">${this.getOperationDisplayName(op.operation)}</span>
                    <span class="change-table">${this.getTableDisplayName(op.table)}</span>
                    <span class="change-time">${this.formatRelativeTime(op.timestamp)}</span>
                </div>
            `).join('');

            pendingChangesList.innerHTML = changesHtml;
        } catch (error) {
            console.error('Failed to update pending changes list:', error);
            pendingChangesList.innerHTML = '<p class="error">Unable to load pending changes</p>';
        }
    }

    handleConnectivityChange(detail) {
        this.isOnline = detail.isOnline;
        this.updateConnectivityStatus();

        if (detail.isOnline) {
            this.showNotification('Connection restored! Syncing data...', 'success');
            this.hideOfflineCapabilitiesPanel();
        } else {
            this.showNotification('You\'re offline. Some features may be limited.', 'warning');
        }
    }

    handleSyncCompleted(detail) {
        this.syncStatus = 'success';
        this.updateSyncStatus();
        this.updateQueueStatus();
        this.hideSyncProgress();
        
        if (detail.syncedCount > 0) {
            this.showNotification(`Successfully synced ${detail.syncedCount} changes`, 'success');
        }
    }

    handleSyncFailed(detail) {
        this.syncStatus = 'error';
        this.updateSyncStatus();
        this.hideSyncProgress();
        this.showNotification('Sync failed. Will retry when connection improves.', 'error');
    }

    handleConflictDetected(detail) {
        this.showConflictNotification(detail.conflict);
    }

    handleOperationFailed(detail) {
        this.showNotification(`Failed to sync ${detail.operation.operation} operation`, 'error');
    }

    handleOfflineOperationQueued(detail) {
        this.queuedOperations++;
        this.updateQueueStatus();
        this.showNotification('Changes saved offline. Will sync when online.', 'info');
    }

    showSyncProgress(message = 'Syncing data...') {
        this.syncStatus = 'syncing';
        this.updateSyncStatus();
        
        const progressIndicator = document.getElementById('sync-progress-indicator');
        const progressDetails = document.getElementById('sync-progress-details');
        
        progressIndicator.classList.add('show');
        progressDetails.textContent = message;
    }

    hideSyncProgress() {
        const progressIndicator = document.getElementById('sync-progress-indicator');
        progressIndicator.classList.remove('show');
    }

    updateSyncProgress(percentage, message) {
        const progressFill = document.getElementById('sync-progress-fill');
        const progressDetails = document.getElementById('sync-progress-details');
        
        progressFill.style.width = `${percentage}%`;
        progressDetails.textContent = message;
    }

    showOfflineCapabilitiesPanel() {
        const panel = document.getElementById('offline-capabilities-panel');
        panel.classList.add('show');
        this.updateQueueStatus();
    }

    hideOfflineCapabilitiesPanel() {
        const panel = document.getElementById('offline-capabilities-panel');
        panel.classList.remove('show');
    }

    async triggerManualSync() {
        if (!this.isOnline || !window.offlineManager) return;

        this.showSyncProgress('Starting manual sync...');
        
        try {
            await window.offlineManager.syncOfflineData();
        } catch (error) {
            console.error('Manual sync failed:', error);
            this.showNotification('Manual sync failed. Please try again.', 'error');
        }
    }

    showConflictNotification(conflict) {
        const notification = document.createElement('div');
        notification.className = 'conflict-notification';
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">⚠️</span>
                <span class="notification-title">Data Conflict Detected</span>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-content">
                <p>Your local changes conflict with server data for ${this.getTableDisplayName(conflict.table)}.</p>
                <p>The conflict has been automatically resolved using the current strategy.</p>
            </div>
            <div class="notification-actions">
                <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">
                    OK
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `offline-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    }

    getOperationDisplayName(operation) {
        switch (operation) {
            case 'create': return 'Added';
            case 'update': return 'Updated';
            case 'delete': return 'Deleted';
            default: return operation;
        }
    }

    getTableDisplayName(table) {
        switch (table) {
            case 'users': return 'Profile';
            case 'assessments': return 'Risk Assessment';
            case 'moods': return 'Mood Entry';
            case 'nutritionPlans': return 'Nutrition Plan';
            case 'progress': return 'Progress Data';
            default: return table;
        }
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    async showConflictsPanel() {
        if (!window.offlineManager) return;

        try {
            const conflicts = await window.offlineManager.getConflicts();
            
            if (conflicts.length === 0) {
                this.showNotification('No conflicts to resolve', 'info');
                return;
            }

            // Create conflicts panel
            const conflictsPanel = document.createElement('div');
            conflictsPanel.id = 'conflicts-panel';
            conflictsPanel.className = 'conflicts-panel';
            conflictsPanel.innerHTML = `
                <div class="panel-header">
                    <h3>Data Conflicts</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="panel-content">
                    <p class="conflicts-info">The following conflicts were detected during synchronization:</p>
                    <div class="conflicts-list">
                        ${conflicts.map(conflict => `
                            <div class="conflict-item ${conflict.resolved ? 'resolved' : 'pending'}">
                                <div class="conflict-header">
                                    <span class="conflict-type">${this.getTableDisplayName(conflict.table)}</span>
                                    <span class="conflict-status">${conflict.resolved ? 'Resolved' : 'Pending'}</span>
                                </div>
                                <div class="conflict-details">
                                    <div class="conflict-data">
                                        <strong>Your Version:</strong>
                                        <pre>${JSON.stringify(conflict.clientData, null, 2)}</pre>
                                    </div>
                                    <div class="conflict-data">
                                        <strong>Server Version:</strong>
                                        <pre>${JSON.stringify(conflict.serverData, null, 2)}</pre>
                                    </div>
                                    ${conflict.resolved ? `
                                        <div class="conflict-resolution">
                                            <strong>Resolution:</strong>
                                            <pre>${JSON.stringify(conflict.resolvedData, null, 2)}</pre>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            document.body.appendChild(conflictsPanel);
        } catch (error) {
            console.error('Failed to show conflicts panel:', error);
            this.showNotification('Failed to load conflicts', 'error');
        }
    }

    async updateLastSyncTime() {
        if (!window.offlineManager) return;

        try {
            const lastSync = await window.offlineManager.getSyncMetadata('lastSync');
            const lastSyncElement = document.getElementById('last-sync');
            
            if (lastSyncElement && lastSync) {
                const syncTime = new Date(lastSync);
                const now = new Date();
                const diffMs = now - syncTime;
                const diffMins = Math.floor(diffMs / 60000);
                
                let timeText = '';
                if (diffMins < 1) {
                    timeText = 'Just now';
                } else if (diffMins < 60) {
                    timeText = `${diffMins}m ago`;
                } else if (diffMins < 1440) {
                    timeText = `${Math.floor(diffMins / 60)}h ago`;
                } else {
                    timeText = `${Math.floor(diffMins / 1440)}d ago`;
                }
                
                lastSyncElement.textContent = `(${timeText})`;
            }
        } catch (error) {
            console.error('Failed to update last sync time:', error);
        }
    }

    // Enhanced notification system with better user feedback
    showEnhancedNotification(message, type = 'info', actions = []) {
        const notification = document.createElement('div');
        notification.className = `enhanced-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <div class="notification-body">
                    <span class="notification-message">${message}</span>
                    ${actions.length > 0 ? `
                        <div class="notification-actions">
                            ${actions.map(action => `
                                <button class="notification-btn" onclick="${action.handler}">${action.text}</button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after delay (longer for actions)
        const hideDelay = actions.length > 0 ? 8000 : 4000;
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, hideDelay);

        return notification;
    }

    // Public API methods
    setOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        this.updateConnectivityStatus();
    }

    setSyncStatus(status) {
        this.syncStatus = status;
        this.updateSyncStatus();
        this.updateLastSyncTime();
    }

    incrementQueuedOperations() {
        this.queuedOperations++;
        this.updateQueueStatus();
    }

    decrementQueuedOperations() {
        if (this.queuedOperations > 0) {
            this.queuedOperations--;
            this.updateQueueStatus();
        }
    }
}

// Initialize offline UI
window.offlineUI = new OfflineUI();