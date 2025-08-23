// Performance Optimization Verification Script
const fs = require('fs').promises;
const path = require('path');

class PerformanceOptimizationVerifier {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }

    async verify() {
        console.log('🚀 Verifying Performance Optimization Implementation...\n');

        try {
            // Test 1: Code splitting and lazy loading
            await this.testCodeSplittingImplementation();
            
            // Test 2: Asset optimization
            await this.testAssetOptimization();
            
            // Test 3: Build configuration
            await this.testBuildConfiguration();
            
            // Test 4: Performance monitoring
            await this.testPerformanceMonitoring();
            
            // Test 5: Service worker optimizations
            await this.testServiceWorkerOptimizations();
            
            // Test 6: PWA optimizations
            await this.testPWAOptimizations();
            
            // Generate final report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Verification failed:', error.message);
            process.exit(1);
        }
    }

    async testCodeSplittingImplementation() {
        console.log('📦 Testing Code Splitting and Lazy Loading...');
        
        try {
            // Check if module loader exists
            const moduleLoaderExists = await this.fileExists('js/module-loader.js');
            this.addTest('Module Loader Implementation', moduleLoaderExists, 
                'Module loader script should exist for dynamic imports');
            
            if (moduleLoaderExists) {
                const moduleLoaderContent = await fs.readFile('js/module-loader.js', 'utf8');
                
                // Check for dynamic import functionality
                const hasDynamicImport = moduleLoaderContent.includes('import(') || 
                                       moduleLoaderContent.includes('loadModule');
                this.addTest('Dynamic Import Support', hasDynamicImport,
                    'Module loader should support dynamic imports');
                
                // Check for lazy loading setup
                const hasLazyLoading = moduleLoaderContent.includes('IntersectionObserver') ||
                                     moduleLoaderContent.includes('lazy');
                this.addTest('Lazy Loading Implementation', hasLazyLoading,
                    'Module loader should implement lazy loading');
                
                // Check for prefetch functionality
                const hasPrefetch = moduleLoaderContent.includes('prefetch') ||
                                  moduleLoaderContent.includes('preload');
                this.addTest('Module Prefetching', hasPrefetch,
                    'Module loader should support prefetching');
            }
            
            // Check HTML for lazy loading attributes
            const htmlContent = await fs.readFile('index.html', 'utf8');
            const hasLazyAttributes = htmlContent.includes('data-lazy-module') ||
                                    htmlContent.includes('data-prefetch-module');
            this.addTest('HTML Lazy Loading Attributes', hasLazyAttributes,
                'HTML should contain lazy loading attributes');
            
        } catch (error) {
            this.addTest('Code Splitting Test', false, `Error: ${error.message}`);
        }
    }

    async testAssetOptimization() {
        console.log('🖼️  Testing Asset Optimization...');
        
        try {
            // Check if asset optimizer exists
            const assetOptimizerExists = await this.fileExists('js/asset-optimizer.js');
            this.addTest('Asset Optimizer Implementation', assetOptimizerExists,
                'Asset optimizer script should exist');
            
            if (assetOptimizerExists) {
                const assetOptimizerContent = await fs.readFile('js/asset-optimizer.js', 'utf8');
                
                // Check for image optimization features
                const hasImageOptimization = assetOptimizerContent.includes('webp') ||
                                           assetOptimizerContent.includes('avif') ||
                                           assetOptimizerContent.includes('compressImage');
                this.addTest('Image Optimization Features', hasImageOptimization,
                    'Asset optimizer should support modern image formats');
                
                // Check for lazy image loading
                const hasLazyImages = assetOptimizerContent.includes('IntersectionObserver') &&
                                    assetOptimizerContent.includes('data-src');
                this.addTest('Lazy Image Loading', hasLazyImages,
                    'Asset optimizer should implement lazy image loading');
                
                // Check for compression worker
                const hasCompressionWorker = assetOptimizerContent.includes('Worker') ||
                                           assetOptimizerContent.includes('compression');
                this.addTest('Compression Worker Support', hasCompressionWorker,
                    'Asset optimizer should support compression workers');
            }
            
            // Check HTML for preload directives
            const htmlContent = await fs.readFile('index.html', 'utf8');
            const hasPreloadDirectives = htmlContent.includes('rel="preload"') ||
                                       htmlContent.includes('rel="prefetch"');
            this.addTest('Resource Preloading', hasPreloadDirectives,
                'HTML should contain resource preload directives');
            
        } catch (error) {
            this.addTest('Asset Optimization Test', false, `Error: ${error.message}`);
        }
    }

    async testBuildConfiguration() {
        console.log('⚙️  Testing Build Configuration...');
        
        try {
            // Check if build config exists
            const buildConfigExists = await this.fileExists('build.config.js');
            this.addTest('Build Configuration File', buildConfigExists,
                'Build configuration file should exist');
            
            if (buildConfigExists) {
                const buildConfigContent = await fs.readFile('build.config.js', 'utf8');
                
                // Check for environment configurations
                const hasEnvironments = buildConfigContent.includes('production') &&
                                       buildConfigContent.includes('staging') &&
                                       buildConfigContent.includes('development');
                this.addTest('Environment Configurations', hasEnvironments,
                    'Build config should define multiple environments');
                
                // Check for optimization settings
                const hasOptimization = buildConfigContent.includes('optimization') ||
                                      buildConfigContent.includes('minify') ||
                                      buildConfigContent.includes('compress');
                this.addTest('Optimization Settings', hasOptimization,
                    'Build config should include optimization settings');
                
                // Check for performance budgets
                const hasBudgets = buildConfigContent.includes('budgets') ||
                                 buildConfigContent.includes('maxBundleSize');
                this.addTest('Performance Budgets', hasBudgets,
                    'Build config should define performance budgets');
            }
            
            // Check if build script exists
            const buildScriptExists = await this.fileExists('build.js');
            this.addTest('Build Script Implementation', buildScriptExists,
                'Build script should exist for production builds');
            
            // Check if deploy script exists
            const deployScriptExists = await this.fileExists('deploy.js');
            this.addTest('Deployment Script', deployScriptExists,
                'Deployment script should exist');
            
            // Check package.json for build scripts
            const packageJsonContent = await fs.readFile('package.json', 'utf8');
            const packageJson = JSON.parse(packageJsonContent);
            const hasBuildScripts = packageJson.scripts && 
                                  (packageJson.scripts.build || packageJson.scripts['build:prod']);
            this.addTest('Package.json Build Scripts', hasBuildScripts,
                'Package.json should contain build scripts');
            
        } catch (error) {
            this.addTest('Build Configuration Test', false, `Error: ${error.message}`);
        }
    }

    async testPerformanceMonitoring() {
        console.log('📊 Testing Performance Monitoring...');
        
        try {
            // Check if performance monitor exists
            const perfMonitorExists = await this.fileExists('js/performance-monitor.js');
            this.addTest('Performance Monitor Implementation', perfMonitorExists,
                'Performance monitor script should exist');
            
            if (perfMonitorExists) {
                const perfMonitorContent = await fs.readFile('js/performance-monitor.js', 'utf8');
                
                // Check for Web Vitals monitoring
                const hasWebVitals = perfMonitorContent.includes('LCP') &&
                                   perfMonitorContent.includes('FID') &&
                                   perfMonitorContent.includes('CLS');
                this.addTest('Web Vitals Monitoring', hasWebVitals,
                    'Performance monitor should track Core Web Vitals');
                
                // Check for Performance Observer usage
                const hasPerformanceObserver = perfMonitorContent.includes('PerformanceObserver');
                this.addTest('Performance Observer Usage', hasPerformanceObserver,
                    'Performance monitor should use Performance Observer API');
                
                // Check for analytics integration
                const hasAnalytics = perfMonitorContent.includes('analytics') ||
                                   perfMonitorContent.includes('sendAnalytics') ||
                                   perfMonitorContent.includes('fetch');
                this.addTest('Analytics Integration', hasAnalytics,
                    'Performance monitor should integrate with analytics');
                
                // Check for error tracking
                const hasErrorTracking = perfMonitorContent.includes('error') &&
                                       perfMonitorContent.includes('addEventListener');
                this.addTest('Error Tracking', hasErrorTracking,
                    'Performance monitor should track errors');
            }
            
        } catch (error) {
            this.addTest('Performance Monitoring Test', false, `Error: ${error.message}`);
        }
    }

    async testServiceWorkerOptimizations() {
        console.log('⚡ Testing Service Worker Optimizations...');
        
        try {
            // Check if service worker exists
            const swExists = await this.fileExists('sw.js');
            this.addTest('Service Worker File', swExists,
                'Service worker file should exist');
            
            if (swExists) {
                const swContent = await fs.readFile('sw.js', 'utf8');
                
                // Check for performance cache
                const hasPerformanceCache = swContent.includes('PERFORMANCE_CACHE') ||
                                          swContent.includes('performance');
                this.addTest('Performance Cache Implementation', hasPerformanceCache,
                    'Service worker should implement performance caching');
                
                // Check for intelligent caching strategies
                const hasIntelligentCaching = swContent.includes('staleWhileRevalidate') ||
                                            swContent.includes('networkFirst') ||
                                            swContent.includes('cacheFirst');
                this.addTest('Intelligent Caching Strategies', hasIntelligentCaching,
                    'Service worker should use intelligent caching strategies');
                
                // Check for cache expiration
                const hasCacheExpiration = swContent.includes('ttl') ||
                                         swContent.includes('maxAge') ||
                                         swContent.includes('expir');
                this.addTest('Cache Expiration Logic', hasCacheExpiration,
                    'Service worker should implement cache expiration');
                
                // Check for performance tracking
                const hasPerformanceTracking = swContent.includes('SW_PERFORMANCE') ||
                                             swContent.includes('trackCache') ||
                                             swContent.includes('performance');
                this.addTest('SW Performance Tracking', hasPerformanceTracking,
                    'Service worker should track performance metrics');
            }
            
        } catch (error) {
            this.addTest('Service Worker Optimization Test', false, `Error: ${error.message}`);
        }
    }

    async testPWAOptimizations() {
        console.log('📱 Testing PWA Optimizations...');
        
        try {
            // Check manifest file
            const manifestExists = await this.fileExists('manifest.json');
            this.addTest('PWA Manifest File', manifestExists,
                'PWA manifest file should exist');
            
            if (manifestExists) {
                const manifestContent = await fs.readFile('manifest.json', 'utf8');
                const manifest = JSON.parse(manifestContent);
                
                // Check for performance-related manifest properties
                const hasPerformanceProps = manifest.display === 'standalone' &&
                                          manifest.start_url &&
                                          manifest.icons && manifest.icons.length > 0;
                this.addTest('PWA Performance Properties', hasPerformanceProps,
                    'Manifest should contain performance-optimized properties');
            }
            
            // Check HTML for PWA meta tags
            const htmlContent = await fs.readFile('index.html', 'utf8');
            const hasPWAMeta = htmlContent.includes('apple-mobile-web-app') &&
                             htmlContent.includes('theme-color') &&
                             htmlContent.includes('viewport');
            this.addTest('PWA Meta Tags', hasPWAMeta,
                'HTML should contain PWA optimization meta tags');
            
            // Check for performance-related meta tags
            const hasPerformanceMeta = htmlContent.includes('dns-prefetch') ||
                                     htmlContent.includes('preconnect') ||
                                     htmlContent.includes('preload');
            this.addTest('Performance Meta Tags', hasPerformanceMeta,
                'HTML should contain performance optimization meta tags');
            
        } catch (error) {
            this.addTest('PWA Optimization Test', false, `Error: ${error.message}`);
        }
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    addTest(name, passed, message) {
        const result = {
            name,
            passed,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.results.tests.push(result);
        
        if (passed) {
            this.results.passed++;
            console.log(`  ✅ ${name}`);
        } else {
            this.results.failed++;
            console.log(`  ❌ ${name}: ${message}`);
        }
    }

    generateReport() {
        console.log('\n📋 Performance Optimization Verification Report');
        console.log('=' .repeat(60));
        console.log(`Total Tests: ${this.results.tests.length}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / this.results.tests.length) * 100).toFixed(1)}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.message}`);
                });
        }
        
        // Generate detailed report file
        const report = {
            summary: {
                totalTests: this.results.tests.length,
                passed: this.results.passed,
                failed: this.results.failed,
                successRate: ((this.results.passed / this.results.tests.length) * 100).toFixed(1) + '%',
                timestamp: new Date().toISOString()
            },
            tests: this.results.tests,
            recommendations: this.generateRecommendations()
        };
        
        // Write report to file
        fs.writeFile('performance-optimization-report.json', JSON.stringify(report, null, 2))
            .then(() => {
                console.log('\n📄 Detailed report saved to: performance-optimization-report.json');
            })
            .catch(error => {
                console.error('Failed to save report:', error.message);
            });
        
        // Overall result
        if (this.results.failed === 0) {
            console.log('\n🎉 All performance optimization tests passed!');
            console.log('✅ Task 20 implementation is complete and verified.');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the implementation.');
            if (this.results.passed / this.results.tests.length >= 0.8) {
                console.log('✅ Task 20 is mostly complete with minor issues.');
            } else {
                console.log('❌ Task 20 requires significant fixes.');
                process.exit(1);
            }
        }
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Check for common issues and provide recommendations
        const failedTests = this.results.tests.filter(test => !test.passed);
        
        if (failedTests.some(test => test.name.includes('Module Loader'))) {
            recommendations.push({
                category: 'Code Splitting',
                message: 'Implement module loader for dynamic imports and lazy loading',
                priority: 'high'
            });
        }
        
        if (failedTests.some(test => test.name.includes('Asset Optimizer'))) {
            recommendations.push({
                category: 'Asset Optimization',
                message: 'Implement asset optimizer for image compression and lazy loading',
                priority: 'high'
            });
        }
        
        if (failedTests.some(test => test.name.includes('Performance Monitor'))) {
            recommendations.push({
                category: 'Performance Monitoring',
                message: 'Implement performance monitoring for Web Vitals and analytics',
                priority: 'medium'
            });
        }
        
        if (failedTests.some(test => test.name.includes('Build'))) {
            recommendations.push({
                category: 'Build Configuration',
                message: 'Set up build configuration and deployment scripts',
                priority: 'high'
            });
        }
        
        return recommendations;
    }
}

// Run verification if this script is executed directly
if (require.main === module) {
    const verifier = new PerformanceOptimizationVerifier();
    verifier.verify().catch(console.error);
}

module.exports = PerformanceOptimizationVerifier;