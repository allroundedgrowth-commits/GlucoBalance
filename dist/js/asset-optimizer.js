// Asset Optimizer - Image optimization and asset compression
class AssetOptimizer {
    constructor() {
        this.imageCache = new Map();
        this.compressionWorker = null;
        this.supportedFormats = this.detectSupportedFormats();
        this.lazyImages = new Set();
        this.init();
    }

    init() {
        this.setupLazyImageLoading();
        this.setupImageOptimization();
        this.setupAssetCaching();
        this.initializeCompressionWorker();
    }

    detectSupportedFormats() {
        const formats = {
            webp: false,
            avif: false,
            jpeg2000: false
        };

        // Test WebP support
        const webpCanvas = document.createElement('canvas');
        webpCanvas.width = 1;
        webpCanvas.height = 1;
        formats.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

        // Test AVIF support (modern browsers)
        const avifImg = new Image();
        avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        formats.avif = avifImg.complete && avifImg.naturalWidth > 0;

        return formats;
    }

    setupLazyImageLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadOptimizedImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
            this.lazyImages.add(img);
        });

        // Set up mutation observer for dynamically added images
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        const lazyImages = node.querySelectorAll ? 
                            node.querySelectorAll('img[data-src]') : 
                            (node.matches && node.matches('img[data-src]') ? [node] : []);
                        
                        lazyImages.forEach(img => {
                            imageObserver.observe(img);
                            this.lazyImages.add(img);
                        });
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    async loadOptimizedImage(img) {
        const originalSrc = img.dataset.src;
        if (!originalSrc) return;

        try {
            // Show loading placeholder
            img.classList.add('loading');
            
            // Get optimized image URL
            const optimizedSrc = await this.getOptimizedImageUrl(originalSrc, img);
            
            // Preload the image
            const preloadImg = new Image();
            preloadImg.onload = () => {
                img.src = optimizedSrc;
                img.classList.remove('loading');
                img.classList.add('loaded');
                
                // Remove data-src to prevent reprocessing
                img.removeAttribute('data-src');
            };
            
            preloadImg.onerror = () => {
                // Fallback to original image
                img.src = originalSrc;
                img.classList.remove('loading');
                img.classList.add('error');
            };
            
            preloadImg.src = optimizedSrc;
            
        } catch (error) {
            console.error('Failed to load optimized image:', error);
            // Fallback to original
            img.src = originalSrc;
            img.classList.remove('loading');
        }
    }

    async getOptimizedImageUrl(originalSrc, imgElement) {
        // Check cache first
        const cacheKey = this.generateCacheKey(originalSrc, imgElement);
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey);
        }

        // Determine optimal format and size
        const optimizedUrl = this.buildOptimizedUrl(originalSrc, imgElement);
        
        // Cache the result
        this.imageCache.set(cacheKey, optimizedUrl);
        
        return optimizedUrl;
    }

    buildOptimizedUrl(originalSrc, imgElement) {
        // Get element dimensions for responsive sizing
        const rect = imgElement.getBoundingClientRect();
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        const targetWidth = Math.ceil(rect.width * devicePixelRatio);
        const targetHeight = Math.ceil(rect.height * devicePixelRatio);
        
        // Choose optimal format
        let format = 'jpeg';
        if (this.supportedFormats.avif) {
            format = 'avif';
        } else if (this.supportedFormats.webp) {
            format = 'webp';
        }
        
        // For local images, we'll use a simple naming convention
        // In production, this would integrate with an image CDN
        if (originalSrc.startsWith('icons/') || originalSrc.startsWith('images/')) {
            const baseName = originalSrc.split('.')[0];
            const extension = this.supportedFormats.webp ? 'webp' : 'png';
            
            // Try to find optimized version
            const optimizedSrc = `${baseName}-${targetWidth}w.${extension}`;
            return optimizedSrc;
        }
        
        return originalSrc; // Return original if no optimization available
    }

    generateCacheKey(src, element) {
        const rect = element.getBoundingClientRect();
        return `${src}_${Math.ceil(rect.width)}_${Math.ceil(rect.height)}_${window.devicePixelRatio}`;
    }

    setupImageOptimization() {
        // Add CSS for image loading states
        if (!document.getElementById('image-optimization-styles')) {
            const style = document.createElement('style');
            style.id = 'image-optimization-styles';
            style.textContent = `
                img[data-src] {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading-shimmer 1.5s infinite;
                }
                
                img.loading {
                    opacity: 0.7;
                    filter: blur(2px);
                    transition: all 0.3s ease;
                }
                
                img.loaded {
                    opacity: 1;
                    filter: none;
                    transition: all 0.3s ease;
                }
                
                img.error {
                    background: #f5f5f5;
                    opacity: 0.8;
                }
                
                @keyframes loading-shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                
                /* Responsive image sizing */
                img {
                    max-width: 100%;
                    height: auto;
                }
                
                /* Critical images should load immediately */
                img.critical {
                    content-visibility: auto;
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupAssetCaching() {
        // Implement intelligent asset caching
        if ('caches' in window) {
            this.setupCacheStrategy();
        }
    }

    async setupCacheStrategy() {
        try {
            const cache = await caches.open('glucobalance-assets-v1');
            
            // Cache critical assets
            const criticalAssets = [
                'styles/main.css',
                'styles/components.css',
                'js/app.js',
                'js/error-handler.js',
                'manifest.json'
            ];
            
            await cache.addAll(criticalAssets);
            console.log('Critical assets cached successfully');
        } catch (error) {
            console.error('Failed to setup asset caching:', error);
        }
    }

    initializeCompressionWorker() {
        // Initialize web worker for image compression if needed
        if (window.Worker) {
            try {
                this.compressionWorker = new Worker(this.createCompressionWorkerBlob());
                
                this.compressionWorker.onmessage = (e) => {
                    const { id, compressedData, error } = e.data;
                    this.handleCompressionResult(id, compressedData, error);
                };
            } catch (error) {
                console.warn('Compression worker not available:', error);
            }
        }
    }

    createCompressionWorkerBlob() {
        const workerScript = `
            self.onmessage = function(e) {
                const { id, imageData, quality } = e.data;
                
                try {
                    // Simple compression logic (in real implementation, use more sophisticated algorithms)
                    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
                    const ctx = canvas.getContext('2d');
                    
                    // Apply compression techniques
                    const compressedData = canvas.toBlob({ 
                        type: 'image/jpeg', 
                        quality: quality || 0.8 
                    });
                    
                    self.postMessage({ id, compressedData });
                } catch (error) {
                    self.postMessage({ id, error: error.message });
                }
            };
        `;
        
        return URL.createObjectURL(new Blob([workerScript], { type: 'application/javascript' }));
    }

    handleCompressionResult(id, compressedData, error) {
        if (error) {
            console.error(`Compression failed for ${id}:`, error);
            return;
        }
        
        // Handle successful compression
        console.log(`Image ${id} compressed successfully`);
    }

    // Public API methods
    async compressImage(file, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                const maxWidth = 1920;
                const maxHeight = 1080;
                
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', quality);
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    preloadCriticalImages(imageSrcs) {
        imageSrcs.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    getOptimizationStats() {
        return {
            cachedImages: this.imageCache.size,
            lazyImages: this.lazyImages.size,
            supportedFormats: this.supportedFormats,
            compressionWorkerAvailable: !!this.compressionWorker
        };
    }

    clearImageCache() {
        this.imageCache.clear();
        
        if ('caches' in window) {
            caches.delete('glucobalance-assets-v1');
        }
    }
}

// Initialize global asset optimizer
window.assetOptimizer = new AssetOptimizer();

// Export for ES6 modules
export default AssetOptimizer;
//# sourceMappingURL=asset-optimizer.js.map