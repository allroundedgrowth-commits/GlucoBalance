// Module Loader - Dynamic Import System for Code Splitting
class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.preloadQueue = [];
        this.criticalModules = new Set(['error-handler', 'database', 'auth']);
        this.init();
    }

    init() {
        // Preload critical modules
        this.preloadCriticalModules();
        
        // Set up intersection observer for lazy loading
        this.setupLazyLoading();
        
        // Set up prefetch on hover/focus
        this.setupPrefetchOnInteraction();
    }

    async preloadCriticalModules() {
        const criticalPromises = Array.from(this.criticalModules).map(module => 
            this.loadModule(module, true)
        );
        
        try {
            await Promise.all(criticalPromises);
            console.log('Critical modules preloaded successfully');
        } catch (error) {
            console.error('Failed to preload critical modules:', error);
        }
    }

    async loadModule(moduleName, isCritical = false) {
        // Return cached module if already loaded
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        // Return existing loading promise if module is currently loading
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // Create loading promise
        const loadingPromise = this.createLoadingPromise(moduleName, isCritical);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const module = await loadingPromise;
            this.loadedModules.set(moduleName, module);
            this.loadingPromises.delete(moduleName);
            return module;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }

    async createLoadingPromise(moduleName, isCritical) {
        const startTime = performance.now();
        
        try {
            let module;
            
            // Use dynamic import for modern browsers
            if (typeof import === 'function') {
                module = await import(`./modules/${moduleName}.js`);
            } else {
                // Fallback for older browsers - load via script tag
                module = await this.loadScriptModule(moduleName);
            }

            const loadTime = performance.now() - startTime;
            this.trackModulePerformance(moduleName, loadTime, isCritical);
            
            return module;
        } catch (error) {
            console.error(`Failed to load module ${moduleName}:`, error);
            
            // Try fallback loading method
            return this.loadFallbackModule(moduleName);
        }
    }

    async loadScriptModule(moduleName) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/${moduleName}.js`;
            script.async = true;
            
            script.onload = () => {
                // Assume module exports to window[moduleName]
                const module = window[this.getModuleGlobalName(moduleName)];
                if (module) {
                    resolve({ default: module });
                } else {
                    reject(new Error(`Module ${moduleName} not found in global scope`));
                }
            };
            
            script.onerror = () => reject(new Error(`Failed to load script ${moduleName}`));
            
            document.head.appendChild(script);
        });
    }

    async loadFallbackModule(moduleName) {
        // Return a minimal fallback implementation
        console.warn(`Using fallback for module ${moduleName}`);
        
        const fallbacks = {
            'ai': { generateContent: () => 'AI service unavailable' },
            'nutrition-service': { generateMealPlan: () => ({ meals: [] }) },
            'mental-health': { generateAffirmation: () => 'Stay positive!' },
            'progress-dashboard': { updateCharts: () => {} },
            'doctor-report': { generateReport: () => ({ data: 'Report unavailable' }) }
        };
        
        return { default: fallbacks[moduleName] || {} };
    }

    getModuleGlobalName(moduleName) {
        // Convert kebab-case to camelCase for global variable names
        return moduleName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    trackModulePerformance(moduleName, loadTime, isCritical) {
        const performanceData = {
            module: moduleName,
            loadTime,
            isCritical,
            timestamp: Date.now()
        };
        
        // Store performance data for analytics
        const perfData = JSON.parse(localStorage.getItem('glucobalance_module_perf') || '[]');
        perfData.push(performanceData);
        
        // Keep only last 50 entries
        if (perfData.length > 50) {
            perfData.splice(0, perfData.length - 50);
        }
        
        localStorage.setItem('glucobalance_module_perf', JSON.stringify(perfData));
        
        // Log slow loading modules
        if (loadTime > 1000) {
            console.warn(`Slow module load: ${moduleName} took ${loadTime.toFixed(2)}ms`);
        }
    }

    setupLazyLoading() {
        // Intersection Observer for lazy loading components
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const moduleName = element.dataset.lazyModule;
                    
                    if (moduleName && !this.loadedModules.has(moduleName)) {
                        this.loadModule(moduleName).then(module => {
                            this.initializeModuleForElement(element, module, moduleName);
                        }).catch(error => {
                            console.error(`Failed to lazy load module ${moduleName}:`, error);
                        });
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before element comes into view
        });

        // Observe elements with lazy loading attributes
        document.querySelectorAll('[data-lazy-module]').forEach(element => {
            observer.observe(element);
        });
    }

    setupPrefetchOnInteraction() {
        // Prefetch modules on hover/focus for faster perceived performance
        document.addEventListener('mouseover', (e) => {
            const element = e.target.closest('[data-prefetch-module]');
            if (element) {
                const moduleName = element.dataset.prefetchModule;
                this.prefetchModule(moduleName);
            }
        }, { passive: true });

        document.addEventListener('focusin', (e) => {
            const element = e.target.closest('[data-prefetch-module]');
            if (element) {
                const moduleName = element.dataset.prefetchModule;
                this.prefetchModule(moduleName);
            }
        }, { passive: true });
    }

    async prefetchModule(moduleName) {
        if (!this.loadedModules.has(moduleName) && !this.loadingPromises.has(moduleName)) {
            try {
                await this.loadModule(moduleName);
                console.log(`Prefetched module: ${moduleName}`);
            } catch (error) {
                console.error(`Failed to prefetch module ${moduleName}:`, error);
            }
        }
    }

    initializeModuleForElement(element, module, moduleName) {
        // Initialize the module for the specific element
        try {
            if (module.default && typeof module.default.init === 'function') {
                module.default.init(element);
            } else if (module.default && typeof module.default === 'function') {
                new module.default(element);
            }
            
            element.classList.add('module-loaded');
            element.removeAttribute('data-lazy-module');
        } catch (error) {
            console.error(`Failed to initialize module ${moduleName}:`, error);
        }
    }

    // Public API methods
    async require(moduleName) {
        return this.loadModule(moduleName);
    }

    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    preload(moduleNames) {
        if (Array.isArray(moduleNames)) {
            moduleNames.forEach(name => this.prefetchModule(name));
        } else {
            this.prefetchModule(moduleNames);
        }
    }

    getPerformanceData() {
        return JSON.parse(localStorage.getItem('glucobalance_module_perf') || '[]');
    }

    clearCache() {
        this.loadedModules.clear();
        this.loadingPromises.clear();
        localStorage.removeItem('glucobalance_module_perf');
    }
}

// Initialize global module loader
window.moduleLoader = new ModuleLoader();

// Export for ES6 modules
export default ModuleLoader;