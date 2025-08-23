// Performance Monitor - Real-time performance tracking and analytics
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.analyticsQueue = [];
        this.isEnabled = true;
        this.sessionId = this.generateSessionId();
        this.startTime = performance.now();
        this.init();
    }

    init() {
        this.setupPerformanceObservers();
        this.setupUserTimingAPI();
        this.setupResourceMonitoring();
        this.setupErrorTracking();
        this.setupUserInteractionTracking();
        this.setupNetworkMonitoring();
        this.startPeriodicReporting();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupPerformanceObservers() {
        // Core Web Vitals monitoring
        this.observeWebVitals();
        
        // Navigation timing
        this.observeNavigation();
        
        // Resource timing
        this.observeResources();
        
        // Long tasks
        this.observeLongTasks();
        
        // Layout shifts
        this.observeLayoutShifts();
    }

    observeWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    this.recordMetric('LCP', {
                        value: lastEntry.startTime,
                        element: lastEntry.element?.tagName || 'unknown',
                        url: lastEntry.url || 'unknown',
                        timestamp: Date.now()
                    });
                });
                
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.set('lcp', lcpObserver);
            } catch (error) {
                console.warn('LCP observer not supported:', error);
            }
        }

        // First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.recordMetric('FID', {
                            value: entry.processingStart - entry.startTime,
                            eventType: entry.name,
                            timestamp: Date.now()
                        });
                    });
                });
                
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.set('fid', fidObserver);
            } catch (error) {
                console.warn('FID observer not supported:', error);
            }
        }

        // Cumulative Layout Shift (CLS) - handled in observeLayoutShifts
    }

    observeNavigation() {
        if ('PerformanceObserver' in window) {
            try {
                const navObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.recordMetric('Navigation', {
                            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                            loadComplete: entry.loadEventEnd - entry.loadEventStart,
                            domInteractive: entry.domInteractive - entry.navigationStart,
                            firstPaint: this.getFirstPaint(),
                            firstContentfulPaint: this.getFirstContentfulPaint(),
                            timestamp: Date.now()
                        });
                    });
                });
                
                navObserver.observe({ entryTypes: ['navigation'] });
                this.observers.set('navigation', navObserver);
            } catch (error) {
                console.warn('Navigation observer not supported:', error);
            }
        }
    }

    observeResources() {
        if ('PerformanceObserver' in window) {
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        // Only track significant resources
                        if (entry.transferSize > 1000 || entry.duration > 100) {
                            this.recordMetric('Resource', {
                                name: entry.name,
                                type: entry.initiatorType,
                                size: entry.transferSize,
                                duration: entry.duration,
                                cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
                                timestamp: Date.now()
                            });
                        }
                    });
                });
                
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.set('resource', resourceObserver);
            } catch (error) {
                console.warn('Resource observer not supported:', error);
            }
        }
    }

    observeLongTasks() {
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.recordMetric('LongTask', {
                            duration: entry.duration,
                            startTime: entry.startTime,
                            attribution: entry.attribution?.[0]?.name || 'unknown',
                            timestamp: Date.now()
                        });
                    });
                });
                
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.set('longtask', longTaskObserver);
            } catch (error) {
                console.warn('Long task observer not supported:', error);
            }
        }
    }

    observeLayoutShifts() {
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                let clsEntries = [];
                
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            clsEntries.push(entry);
                        }
                    });
                    
                    this.recordMetric('CLS', {
                        value: clsValue,
                        entryCount: clsEntries.length,
                        timestamp: Date.now()
                    });
                });
                
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.set('cls', clsObserver);
            } catch (error) {
                console.warn('CLS observer not supported:', error);
            }
        }
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
        return fpEntry ? fpEntry.startTime : null;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
    }

    setupUserTimingAPI() {
        // Custom timing marks and measures
        this.markStart = (name) => {
            if (performance.mark) {
                performance.mark(`${name}-start`);
            }
        };

        this.markEnd = (name) => {
            if (performance.mark && performance.measure) {
                performance.mark(`${name}-end`);
                performance.measure(name, `${name}-start`, `${name}-end`);
                
                const measure = performance.getEntriesByName(name, 'measure')[0];
                if (measure) {
                    this.recordMetric('UserTiming', {
                        name,
                        duration: measure.duration,
                        timestamp: Date.now()
                    });
                }
            }
        };
    }

    setupResourceMonitoring() {
        // Monitor critical resources
        this.monitorCriticalResources();
        
        // Monitor bundle sizes
        this.monitorBundleSizes();
        
        // Monitor cache performance
        this.monitorCachePerformance();
    }

    monitorCriticalResources() {
        const criticalResources = [
            'styles/main.css',
            'styles/components.css',
            'js/app.js',
            'js/error-handler.js'
        ];

        criticalResources.forEach(resource => {
            const entries = performance.getEntriesByName(resource);
            if (entries.length > 0) {
                const entry = entries[0];
                this.recordMetric('CriticalResource', {
                    name: resource,
                    loadTime: entry.responseEnd - entry.requestStart,
                    size: entry.transferSize,
                    cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
                    timestamp: Date.now()
                });
            }
        });
    }

    monitorBundleSizes() {
        // Track JavaScript bundle sizes
        const jsEntries = performance.getEntriesByType('resource')
            .filter(entry => entry.name.endsWith('.js'));
        
        let totalJSSize = 0;
        jsEntries.forEach(entry => {
            totalJSSize += entry.transferSize || 0;
        });

        this.recordMetric('BundleSize', {
            totalJS: totalJSSize,
            fileCount: jsEntries.length,
            timestamp: Date.now()
        });
    }

    monitorCachePerformance() {
        const resourceEntries = performance.getEntriesByType('resource');
        let cachedCount = 0;
        let totalCount = resourceEntries.length;

        resourceEntries.forEach(entry => {
            if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
                cachedCount++;
            }
        });

        const cacheHitRate = totalCount > 0 ? (cachedCount / totalCount) * 100 : 0;

        this.recordMetric('CachePerformance', {
            hitRate: cacheHitRate,
            cachedResources: cachedCount,
            totalResources: totalCount,
            timestamp: Date.now()
        });
    }

    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.recordMetric('JSError', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.recordMetric('UnhandledRejection', {
                reason: event.reason?.toString() || 'Unknown',
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        // Resource loading errors
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.recordMetric('ResourceError', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    setupUserInteractionTracking() {
        // Track user interactions for performance context
        const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.recordInteraction(eventType, event);
            }, { passive: true, capture: true });
        });
    }

    recordInteraction(type, event) {
        // Throttle interaction recording
        if (!this.lastInteractionTime || Date.now() - this.lastInteractionTime > 1000) {
            this.lastInteractionTime = Date.now();
            
            this.recordMetric('UserInteraction', {
                type,
                target: event.target?.tagName || 'unknown',
                timestamp: Date.now()
            });
        }
    }

    setupNetworkMonitoring() {
        // Monitor network conditions
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            this.recordMetric('NetworkInfo', {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
                timestamp: Date.now()
            });

            // Monitor connection changes
            connection.addEventListener('change', () => {
                this.recordMetric('NetworkChange', {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    timestamp: Date.now()
                });
            });
        }
    }

    recordMetric(type, data) {
        if (!this.isEnabled) return;

        const metric = {
            type,
            data,
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        };

        // Store locally
        if (!this.metrics.has(type)) {
            this.metrics.set(type, []);
        }
        this.metrics.get(type).push(metric);

        // Add to analytics queue
        this.analyticsQueue.push(metric);

        // Trigger immediate reporting for critical metrics
        if (this.isCriticalMetric(type)) {
            this.sendAnalytics([metric]);
        }
    }

    isCriticalMetric(type) {
        const criticalTypes = ['JSError', 'UnhandledRejection', 'ResourceError'];
        return criticalTypes.includes(type);
    }

    startPeriodicReporting() {
        // Send analytics data every 30 seconds
        setInterval(() => {
            if (this.analyticsQueue.length > 0) {
                this.sendAnalytics([...this.analyticsQueue]);
                this.analyticsQueue = [];
            }
        }, 30000);

        // Send data before page unload
        window.addEventListener('beforeunload', () => {
            if (this.analyticsQueue.length > 0) {
                this.sendAnalytics([...this.analyticsQueue], true);
            }
        });

        // Send data when page becomes hidden
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.analyticsQueue.length > 0) {
                this.sendAnalytics([...this.analyticsQueue], true);
                this.analyticsQueue = [];
            }
        });
    }

    sendAnalytics(metrics, useBeacon = false) {
        if (!this.isEnabled || metrics.length === 0) return;

        const payload = {
            sessionId: this.sessionId,
            metrics,
            timestamp: Date.now(),
            app: 'glucobalance',
            version: '1.0.0'
        };

        try {
            if (useBeacon && navigator.sendBeacon) {
                // Use sendBeacon for reliable delivery during page unload
                navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
            } else {
                // Use fetch for regular reporting
                fetch('/api/analytics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }).catch(error => {
                    console.warn('Failed to send analytics:', error);
                    // Store failed metrics for retry
                    this.storeFailedMetrics(metrics);
                });
            }
        } catch (error) {
            console.warn('Analytics sending failed:', error);
            this.storeFailedMetrics(metrics);
        }
    }

    storeFailedMetrics(metrics) {
        try {
            const stored = JSON.parse(localStorage.getItem('glucobalance_failed_metrics') || '[]');
            stored.push(...metrics);
            
            // Keep only last 100 failed metrics
            if (stored.length > 100) {
                stored.splice(0, stored.length - 100);
            }
            
            localStorage.setItem('glucobalance_failed_metrics', JSON.stringify(stored));
        } catch (error) {
            console.warn('Failed to store metrics locally:', error);
        }
    }

    retryFailedMetrics() {
        try {
            const stored = JSON.parse(localStorage.getItem('glucobalance_failed_metrics') || '[]');
            if (stored.length > 0) {
                this.sendAnalytics(stored);
                localStorage.removeItem('glucobalance_failed_metrics');
            }
        } catch (error) {
            console.warn('Failed to retry metrics:', error);
        }
    }

    // Public API methods
    mark(name) {
        this.markStart(name);
    }

    measure(name) {
        this.markEnd(name);
    }

    trackCustomEvent(eventName, data = {}) {
        this.recordMetric('CustomEvent', {
            eventName,
            ...data,
            timestamp: Date.now()
        });
    }

    getMetrics(type = null) {
        if (type) {
            return this.metrics.get(type) || [];
        }
        
        const allMetrics = {};
        for (const [key, value] of this.metrics) {
            allMetrics[key] = value;
        }
        return allMetrics;
    }

    getPerformanceSummary() {
        const summary = {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            metricsCollected: this.analyticsQueue.length,
            webVitals: this.getWebVitalsSummary(),
            errors: this.getErrorSummary(),
            resources: this.getResourceSummary()
        };

        return summary;
    }

    getWebVitalsSummary() {
        const lcp = this.metrics.get('LCP')?.[0]?.data?.value || null;
        const fid = this.metrics.get('FID')?.[0]?.data?.value || null;
        const cls = this.metrics.get('CLS')?.[0]?.data?.value || null;

        return { lcp, fid, cls };
    }

    getErrorSummary() {
        const jsErrors = this.metrics.get('JSError')?.length || 0;
        const resourceErrors = this.metrics.get('ResourceError')?.length || 0;
        const rejections = this.metrics.get('UnhandledRejection')?.length || 0;

        return { jsErrors, resourceErrors, rejections };
    }

    getResourceSummary() {
        const resources = this.metrics.get('Resource') || [];
        const totalSize = resources.reduce((sum, r) => sum + (r.data.size || 0), 0);
        const cachedCount = resources.filter(r => r.data.cached).length;

        return {
            totalResources: resources.length,
            totalSize,
            cachedResources: cachedCount,
            cacheHitRate: resources.length > 0 ? (cachedCount / resources.length) * 100 : 0
        };
    }

    enable() {
        this.isEnabled = true;
        this.retryFailedMetrics();
    }

    disable() {
        this.isEnabled = false;
    }

    reset() {
        this.metrics.clear();
        this.analyticsQueue = [];
        localStorage.removeItem('glucobalance_failed_metrics');
    }

    destroy() {
        // Clean up observers
        for (const [name, observer] of this.observers) {
            try {
                observer.disconnect();
            } catch (error) {
                console.warn(`Failed to disconnect observer ${name}:`, error);
            }
        }
        
        this.observers.clear();
        this.reset();
        this.isEnabled = false;
    }
}

// Initialize global performance monitor
window.performanceMonitor = new PerformanceMonitor();

// Export for ES6 modules
export default PerformanceMonitor;