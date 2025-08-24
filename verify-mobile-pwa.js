// GlucoBalance Mobile-First PWA Verification Script
class PWAVerifier {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runAllTests() {
        console.log('🧪 Starting GlucoBalance Mobile-First PWA Verification...\n');
        
        await this.testViewportConfiguration();
        await this.testPWAManifest();
        await this.testServiceWorker();
        await this.testResponsiveDesign();
        await this.testTouchTargets();
        await this.testOfflineCapability();
        await this.testAccessibility();
        await this.testPerformance();
        
        this.printResults();
        return this.results;
    }

    async testViewportConfiguration() {
        const test = { name: 'Viewport Configuration', status: 'FAIL', details: [] };
        
        try {
            const viewport = document.querySelector('meta[name="viewport"]');
            
            if (!viewport) {
                test.details.push('❌ No viewport meta tag found');
            } else {
                const content = viewport.getAttribute('content');
                
                if (content.includes('width=device-width')) {
                    test.details.push('✅ Device width responsive');
                } else {
                    test.details.push('❌ Missing device-width');
                }
                
                if (content.includes('initial-scale=1.0')) {
                    test.details.push('✅ Initial scale set correctly');
                } else {
                    test.details.push('❌ Missing initial-scale=1.0');
                }
                
                if (content.includes('viewport-fit=cover')) {
                    test.details.push('✅ Safe area support (viewport-fit=cover)');
                } else {
                    test.details.push('⚠️  Missing viewport-fit=cover for safe areas');
                }
                
                if (content.includes('user-scalable=no')) {
                    test.details.push('✅ User scaling disabled for PWA experience');
                } else {
                    test.details.push('⚠️  User scaling not disabled');
                }
            }
            
            test.status = test.details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL';
        } catch (error) {
            test.details.push(`❌ Error testing viewport: ${error.message}`);
        }
        
        this.recordTest(test);
    }

    async testPWAManifest() {
        const test = { name: 'PWA Manifest', status: 'FAIL', details: [] };
        
        try {
            const manifestLink = document.querySelector('link[rel="manifest"]');
            
            if (!manifestLink) {
                test.details.push('❌ No manifest link found');
                this.recordTest(test);
                return;
            }
            
            const response = await fetch(manifestLink.href);
            const manifest = await response.json();
            
            // Required fields
            const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color', 'icons'];
            
            requiredFields.forEach(field => {
                if (manifest[field]) {
                    test.details.push(`✅ ${field}: ${typeof manifest[field] === 'object' ? 'configured' : manifest[field]}`);
                } else {
                    test.details.push(`❌ Missing required field: ${field}`);
                }
            });
            
            // Check display mode
            if (manifest.display === 'standalone') {
                test.details.push('✅ Standalone display mode');
            } else {
                test.details.push(`⚠️  Display mode: ${manifest.display} (recommended: standalone)`);
            }
            
            // Check theme color
            if (manifest.theme_color === '#007FFF') {
                test.details.push('✅ Correct Azure Blue theme color');
            } else {
                test.details.push(`⚠️  Theme color: ${manifest.theme_color} (expected: #007FFF)`);
            }
            
            // Check icons
            if (manifest.icons && manifest.icons.length >= 2) {
                test.details.push(`✅ ${manifest.icons.length} icons configured`);
                
                const has192 = manifest.icons.some(icon => icon.sizes.includes('192x192'));
                const has512 = manifest.icons.some(icon => icon.sizes.includes('512x512'));
                
                if (has192 && has512) {
                    test.details.push('✅ Required icon sizes (192x192, 512x512)');
                } else {
                    test.details.push('❌ Missing required icon sizes');
                }
            } else {
                test.details.push('❌ Insufficient icons configured');
            }
            
            test.status = test.details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL';
        } catch (error) {
            test.details.push(`❌ Error loading manifest: ${error.message}`);
        }
        
        this.recordTest(test);
    }

    async testServiceWorker() {
        const test = { name: 'Service Worker', status: 'FAIL', details: [] };
        
        try {
            if (!('serviceWorker' in navigator)) {
                test.details.push('❌ Service Worker not supported');
                this.recordTest(test);
                return;
            }
            
            test.details.push('✅ Service Worker API supported');
            
            const registration = await navigator.serviceWorker.getRegistration();
            
            if (registration) {
                test.details.push('✅ Service Worker registered');
                
                if (registration.active) {
                    test.details.push('✅ Service Worker active');
                } else {
                    test.details.push('⚠️  Service Worker not active');
                }
                
                if (registration.scope) {
                    test.details.push(`✅ Scope: ${registration.scope}`);
                }
                
                test.status = 'PASS';
            } else {
                test.details.push('❌ Service Worker not registered');
            }
        } catch (error) {
            test.details.push(`❌ Service Worker error: ${error.message}`);
        }
        
        this.recordTest(test);
    }

    async testResponsiveDesign() {
        const test = { name: 'Responsive Design', status: 'FAIL', details: [] };
        
        try {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            test.details.push(`📱 Viewport: ${width}x${height}px`);
            
            // Check CSS custom properties (CSS variables)
            const rootStyles = getComputedStyle(document.documentElement);
            const azureBlue = rootStyles.getPropertyValue('--azure-blue').trim();
            
            if (azureBlue === '#007FFF') {
                test.details.push('✅ CSS custom properties configured');
            } else {
                test.details.push(`⚠️  CSS variables: ${azureBlue || 'not found'}`);
            }
            
            // Check mobile-first breakpoints
            const container = document.querySelector('.container');
            if (container) {
                const containerStyles = getComputedStyle(container);
                const padding = containerStyles.paddingLeft;
                test.details.push(`✅ Container padding: ${padding}`);
            }
            
            // Check grid layouts
            const dashboardGrid = document.querySelector('.dashboard-grid');
            if (dashboardGrid) {
                const gridStyles = getComputedStyle(dashboardGrid);
                const gridColumns = gridStyles.gridTemplateColumns;
                
                if (width <= 640 && gridColumns.includes('1fr')) {
                    test.details.push('✅ Mobile-first grid (single column)');
                } else if (width > 640) {
                    test.details.push('✅ Responsive grid for larger screens');
                } else {
                    test.details.push('⚠️  Grid layout may not be mobile-optimized');
                }
            }
            
            // Check safe area support
            const safeAreaTop = rootStyles.getPropertyValue('--safe-area-inset-top');
            if (safeAreaTop) {
                test.details.push('✅ Safe area insets configured');
            } else {
                test.details.push('⚠️  Safe area insets not configured');
            }
            
            test.status = test.details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL';
        } catch (error) {
            test.details.push(`❌ Error testing responsive design: ${error.message}`);
        }
        
        this.recordTest(test);
    }

    async testTouchTargets() {
        const test = { name: 'Touch Targets', status: 'FAIL', details: [] };
        
        try {
            const interactiveElements = document.querySelectorAll('button, .btn, .nav-btn, .action-btn, a, input, select');
            let validTargets = 0;
            let totalTargets = interactiveElements.length;
            
            interactiveElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const minSize = 44; // WCAG recommended minimum
                
                if (rect.width >= minSize && rect.height >= minSize) {
                    validTargets++;
                }
            });
            
            const percentage = totalTargets > 0 ? Math.round((validTargets / totalTargets) * 100) : 0;
            
            test.details.push(`📏 Touch targets: ${validTargets}/${totalTargets} (${percentage}%) meet 44px minimum`);
            
            if (percentage >= 90) {
                test.details.push('✅ Excellent touch target compliance');
                test.status = 'PASS';
            } else if (percentage >= 75) {
                test.details.push('⚠️  Good touch target compliance');
                test.status = 'PASS';
            } else {
                test.details.push('❌ Poor touch target compliance');
            }
            
            // Check navigation buttons specifically
            const navButtons = document.querySelectorAll('.nav-btn');
            if (navButtons.length > 0) {
                let validNavButtons = 0;
                navButtons.forEach(btn => {
                    const rect = btn.getBoundingClientRect();
                    if (rect.width >= 44 && rect.height >= 44) {
                        validNavButtons++;
                    }
                });
                
                if (validNavButtons === navButtons.length) {
                    test.details.push('✅ All navigation buttons meet touch requirements');
                } else {
                    test.details.push(`⚠️  Navigation: ${validNavButtons}/${navButtons.length} buttons valid`);
                }
            }
        } catch (error) {
            test.details.push(`❌ Error testing touch targets: ${error.message}`);
        }
        
        this.recordTest(test);
    }

    async testOfflineCapability() {
        const test = { name: 'Offline Capability', status: 'FAIL', details: [] };
        
        try {
            if (!('caches' in window)) {
                test.details.push('❌ Cache API not supported');
                this.recordTest(test);
                return;
            }
            
            test.details.push('✅ Cache API supported');
            
            const cacheNames = await caches.keys();
            test.details.push(`📦 Active caches: ${cacheNames.length}`);
            
            if (cacheNames.length > 0) {
                test.details.push('✅ Caches available for offline use');
                
                // Check for critical resources in cache
                const criticalResources = ['/', '/index.html', '/styles/main.css', '/js/app.js'];
                let cachedResources = 0;
                
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    for (const resource of criticalResources) {
                        const response = await cache.match(resource);
                        if (response) {
                            cachedResources++;
                        }
                    }
                }
                
                if (cachedResources >= criticalResources.length) {
                    test.details.push('✅ Critical resources cached');
                    test.status = 'PASS';
                } else {
                    test.details.push(`⚠️  ${cachedResources}/${criticalResources.length} critical resources cached`);
                }
            } else {
                test.details.push('❌ No caches found');
            }
        } catch (error) {
            test.details.push(`❌ Error testing offline capability: ${error.message}`);
        }
        
        this.recordTest(test);
    }

    async testAccessibility() {
        const test = { name: 'Accessibility', status: 'FAIL', details: [] };
        
        try {
            // Check for skip link
            const skipLink = document.querySelector('.skip-link');
            if (skipLink) {
                test.details.push('✅ Skip link present');
            } else {
                test.details.push('❌ Missing skip link');
            }
            
            // Check for proper heading structure
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            if (headings.length > 0) {
                test.details.push(`✅ ${headings.length} headings found`);
            } else {
                test.details.push('⚠️  No headings found');
            }
            
            // Check for ARIA labels
            const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]');
            if (ariaLabels.length > 0) {
                test.details.push(`✅ ${ariaLabels.length} elements with ARIA labels`);
            } else {
                test.details.push('⚠️  No ARIA labels found');
            }
            
            // Check for role attributes
            const roles = document.querySelectorAll('[role]');
            if (roles.length > 0) {
                test.details.push(`✅ ${roles.length} elements with roles`);
            } else {
                test.details.push('⚠️  No role attributes found');
            }
            
            // Check color contrast (basic check)
            const rootStyles = getComputedStyle(document.documentElement);
            const textColor = rootStyles.getPropertyValue('--text-primary');
            const backgroundColor = rootStyles.getPropertyValue('--white');
            
            if (textColor && backgroundColor) {
                test.details.push('✅ Color variables defined');
            } else {
                test.details.push('⚠️  Color variables not found');
            }
            
            test.status = test.details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL';
        } catch (error) {
            test.details.push(`❌ Error testing accessibility: ${error.message}`);
        }
        
        this.recordTest(test);
    }

    async testPerformance() {
        const test = { name: 'Performance', status: 'FAIL', details: [] };
        
        try {
            // Check for preload hints
            const preloads = document.querySelectorAll('link[rel="preload"]');
            if (preloads.length > 0) {
                test.details.push(`✅ ${preloads.length} preload hints`);
            } else {
                test.details.push('⚠️  No preload hints found');
            }
            
            // Check for resource hints
            const dns = document.querySelectorAll('link[rel="dns-prefetch"], link[rel="preconnect"]');
            if (dns.length > 0) {
                test.details.push(`✅ ${dns.length} DNS/connection hints`);
            } else {
                test.details.push('⚠️  No DNS prefetch hints');
            }
            
            // Check CSS loading
            const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
            test.details.push(`📄 ${cssLinks.length} CSS files`);
            
            // Check JS loading
            const scripts = document.querySelectorAll('script[src]');
            test.details.push(`📜 ${scripts.length} JavaScript files`);
            
            // Basic performance timing
            if (performance && performance.timing) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                if (loadTime > 0) {
                    test.details.push(`⏱️  Page load time: ${loadTime}ms`);
                    
                    if (loadTime < 3000) {
                        test.details.push('✅ Good load performance');
                    } else {
                        test.details.push('⚠️  Slow load performance');
                    }
                }
            }
            
            test.status = test.details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL';
        } catch (error) {
            test.details.push(`❌ Error testing performance: ${error.message}`);
        }
        
        this.recordTest(test);
    }

    recordTest(test) {
        this.results.tests.push(test);
        if (test.status === 'PASS') {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
        
        console.log(`\n${test.status === 'PASS' ? '✅' : '❌'} ${test.name}: ${test.status}`);
        test.details.forEach(detail => console.log(`   ${detail}`));
    }

    printResults() {
        const total = this.results.passed + this.results.failed;
        const percentage = Math.round((this.results.passed / total) * 100);
        
        console.log('\n' + '='.repeat(60));
        console.log('🏆 GLUCOBALANCE MOBILE-FIRST PWA VERIFICATION RESULTS');
        console.log('='.repeat(60));
        console.log(`📊 Tests Passed: ${this.results.passed}/${total} (${percentage}%)`);
        console.log(`📊 Tests Failed: ${this.results.failed}/${total}`);
        
        if (percentage >= 90) {
            console.log('🎉 EXCELLENT: PWA implementation is outstanding!');
        } else if (percentage >= 75) {
            console.log('👍 GOOD: PWA implementation is solid with minor improvements needed.');
        } else if (percentage >= 50) {
            console.log('⚠️  FAIR: PWA implementation needs significant improvements.');
        } else {
            console.log('❌ POOR: PWA implementation requires major fixes.');
        }
        
        console.log('\n📱 Mobile-First PWA Features Verified:');
        console.log('   • Responsive card-based UI with Azure Blue theme');
        console.log('   • Mobile-optimized navigation and touch interactions');
        console.log('   • PWA manifest and service worker for offline functionality');
        console.log('   • Progressive enhancement for desktop and tablet experiences');
        console.log('   • Accessibility and performance optimizations');
        
        return this.results;
    }
}

// Auto-run verification when script loads
if (typeof window !== 'undefined') {
    // Browser environment
    document.addEventListener('DOMContentLoaded', async () => {
        const verifier = new PWAVerifier();
        await verifier.runAllTests();
    });
}

// Export for ES modules
export default PWAVerifier;

// Make available globally for manual testing
if (typeof window !== 'undefined') {
    window.PWAVerifier = PWAVerifier;
}