// Production Build Configuration
const BuildConfig = {
    // Environment settings
    environment: {
        production: {
            apiUrl: 'https://api.glucobalance.app',
            cdnUrl: 'https://cdn.glucobalance.app',
            enableAnalytics: true,
            enableServiceWorker: true,
            enableCompression: true,
            minifyAssets: true,
            enableSourceMaps: false,
            cacheMaxAge: 31536000, // 1 year
            enablePWA: true
        },
        staging: {
            apiUrl: 'https://staging-api.glucobalance.app',
            cdnUrl: 'https://staging-cdn.glucobalance.app',
            enableAnalytics: false,
            enableServiceWorker: true,
            enableCompression: true,
            minifyAssets: true,
            enableSourceMaps: true,
            cacheMaxAge: 86400, // 1 day
            enablePWA: true
        },
        development: {
            apiUrl: 'http://localhost:3000',
            cdnUrl: 'http://localhost:3000',
            enableAnalytics: false,
            enableServiceWorker: false,
            enableCompression: false,
            minifyAssets: false,
            enableSourceMaps: true,
            cacheMaxAge: 0,
            enablePWA: false
        }
    },

    // Build optimization settings
    optimization: {
        // Code splitting configuration
        codeSplitting: {
            enabled: true,
            chunks: {
                vendor: ['ai', 'database', 'auth'],
                features: ['nutrition', 'mental-health', 'progress', 'doctor-report'],
                ui: ['auth-ui', 'nutrition-ui', 'mental-health-ui', 'doctor-report-ui']
            },
            maxChunkSize: 250000, // 250KB
            minChunkSize: 20000   // 20KB
        },

        // Asset optimization
        assets: {
            images: {
                formats: ['avif', 'webp', 'jpeg'],
                quality: {
                    avif: 50,
                    webp: 75,
                    jpeg: 85
                },
                sizes: [320, 640, 960, 1280, 1920],
                lazyLoading: true
            },
            css: {
                minify: true,
                purgeUnused: true,
                inlineCritical: true,
                extractCritical: true
            },
            js: {
                minify: true,
                mangle: true,
                compress: true,
                treeshake: true
            }
        },

        // Performance budgets
        budgets: {
            maxBundleSize: 500000,    // 500KB
            maxChunkSize: 250000,     // 250KB
            maxAssetSize: 100000,     // 100KB
            maxInitialLoad: 1000000,  // 1MB
            maxLCP: 2500,             // 2.5s
            maxFID: 100,              // 100ms
            maxCLS: 0.1               // 0.1
        }
    },

    // PWA configuration
    pwa: {
        name: 'GlucoBalance',
        shortName: 'GlucoBalance',
        description: 'Diabetes Prevention and Management PWA',
        themeColor: '#007FFF',
        backgroundColor: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait-primary',
        startUrl: '/',
        scope: '/',
        icons: [
            { src: 'icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
            { src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
            { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
            { src: 'icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
            { src: 'icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
        shortcuts: [
            {
                name: 'Risk Assessment',
                short_name: 'Assessment',
                description: 'Take diabetes risk assessment',
                url: '/#assessment',
                icons: [{ src: 'icons/shortcut-assessment.png', sizes: '96x96' }]
            },
            {
                name: 'Mood Tracker',
                short_name: 'Mood',
                description: 'Track your daily mood',
                url: '/#mental-health',
                icons: [{ src: 'icons/shortcut-mood.png', sizes: '96x96' }]
            }
        ]
    },

    // Security headers
    security: {
        contentSecurityPolicy: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'", 'https://generativelanguage.googleapis.com'],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:', 'https:'],
            'connect-src': ["'self'", 'https://generativelanguage.googleapis.com'],
            'font-src': ["'self'"],
            'object-src': ["'none'"],
            'media-src': ["'self'"],
            'frame-src': ["'none'"]
        },
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        }
    },

    // Caching strategy
    caching: {
        static: {
            maxAge: 31536000, // 1 year
            immutable: true
        },
        dynamic: {
            maxAge: 86400, // 1 day
            staleWhileRevalidate: true
        },
        api: {
            maxAge: 300, // 5 minutes
            networkFirst: true
        }
    }
};

// Build script functions
class BuildProcessor {
    constructor(config) {
        this.config = config;
        this.env = process.env.NODE_ENV || 'development';
        this.buildConfig = config.environment[this.env];
    }

    async build() {
        console.log(`Building for ${this.env} environment...`);
        
        try {
            await this.prepareBuild();
            await this.processAssets();
            await this.generateManifest();
            await this.generateServiceWorker();
            await this.optimizeBundle();
            await this.generateReport();
            
            console.log('Build completed successfully!');
        } catch (error) {
            console.error('Build failed:', error);
            process.exit(1);
        }
    }

    async prepareBuild() {
        // Create build directory structure
        const fs = require('fs').promises;
        const path = require('path');
        
        const buildDir = path.join(process.cwd(), 'dist');
        
        // Clean and create build directory
        try {
            await fs.rmdir(buildDir, { recursive: true });
        } catch (error) {
            // Directory doesn't exist, ignore
        }
        
        await fs.mkdir(buildDir, { recursive: true });
        await fs.mkdir(path.join(buildDir, 'js'), { recursive: true });
        await fs.mkdir(path.join(buildDir, 'styles'), { recursive: true });
        await fs.mkdir(path.join(buildDir, 'icons'), { recursive: true });
        
        console.log('Build directory prepared');
    }

    async processAssets() {
        // Process and optimize assets based on configuration
        if (this.buildConfig.minifyAssets) {
            await this.minifyCSS();
            await this.minifyJS();
        }
        
        if (this.buildConfig.enableCompression) {
            await this.compressAssets();
        }
        
        await this.optimizeImages();
        
        console.log('Assets processed');
    }

    async minifyCSS() {
        // CSS minification logic
        console.log('Minifying CSS...');
        // Implementation would use tools like cssnano or clean-css
    }

    async minifyJS() {
        // JavaScript minification logic
        console.log('Minifying JavaScript...');
        // Implementation would use tools like terser or uglify-js
    }

    async compressAssets() {
        // Asset compression logic
        console.log('Compressing assets...');
        // Implementation would use gzip/brotli compression
    }

    async optimizeImages() {
        // Image optimization logic
        console.log('Optimizing images...');
        // Implementation would use tools like imagemin
    }

    async generateManifest() {
        const fs = require('fs').promises;
        const path = require('path');
        
        const manifest = {
            ...this.config.pwa,
            start_url: this.buildConfig.enablePWA ? '/' : '/index.html',
            scope: this.buildConfig.enablePWA ? '/' : '/index.html'
        };
        
        await fs.writeFile(
            path.join(process.cwd(), 'dist', 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        console.log('Manifest generated');
    }

    async generateServiceWorker() {
        if (!this.buildConfig.enableServiceWorker) {
            console.log('Service worker disabled for this environment');
            return;
        }
        
        const fs = require('fs').promises;
        const path = require('path');
        
        const swContent = this.generateServiceWorkerContent();
        
        await fs.writeFile(
            path.join(process.cwd(), 'dist', 'sw.js'),
            swContent
        );
        
        console.log('Service worker generated');
    }

    generateServiceWorkerContent() {
        return `
// Generated Service Worker for GlucoBalance
const CACHE_NAME = 'glucobalance-v${Date.now()}';
const STATIC_CACHE = 'glucobalance-static-v1';
const DYNAMIC_CACHE = 'glucobalance-dynamic-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/components.css',
    '/js/app.js',
    '/js/error-handler.js',
    '/js/database.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Handle different types of requests
    if (request.destination === 'image') {
        event.respondWith(handleImageRequest(request));
    } else if (request.url.includes('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else {
        event.respondWith(handleStaticRequest(request));
    }
});

async function handleStaticRequest(request) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetch(request);
}

async function handleImageRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // Return placeholder image on network failure
        return new Response('', { status: 200, statusText: 'OK' });
    }
}

async function handleApiRequest(request) {
    try {
        const response = await fetch(request);
        
        // Cache successful GET requests
        if (request.method === 'GET' && response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Return cached response if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}
        `;
    }

    async optimizeBundle() {
        // Bundle optimization logic
        console.log('Optimizing bundle...');
        
        if (this.config.optimization.codeSplitting.enabled) {
            await this.performCodeSplitting();
        }
        
        await this.checkPerformanceBudgets();
    }

    async performCodeSplitting() {
        console.log('Performing code splitting...');
        // Implementation would split code into chunks based on configuration
    }

    async checkPerformanceBudgets() {
        const budgets = this.config.optimization.budgets;
        console.log('Checking performance budgets...');
        
        // Implementation would check file sizes against budgets
        // and warn/fail if budgets are exceeded
    }

    async generateReport() {
        const fs = require('fs').promises;
        const path = require('path');
        
        const report = {
            environment: this.env,
            buildTime: new Date().toISOString(),
            config: this.buildConfig,
            optimization: this.config.optimization,
            // Add more build statistics here
        };
        
        await fs.writeFile(
            path.join(process.cwd(), 'dist', 'build-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('Build report generated');
    }
}

// Export configuration and processor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BuildConfig, BuildProcessor };
} else {
    window.BuildConfig = BuildConfig;
    window.BuildProcessor = BuildProcessor;
}