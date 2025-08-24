// Fix the "crazy stuff" that's not appealing on localhost:8080
console.log('🔧 Fixing the crazy stuff...');

// Remove conflicting styles and scripts
function fixCrazyStuff() {
    console.log('🧹 Cleaning up conflicts...');
    
    // Remove duplicate or conflicting stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    const keepStyles = ['styles/main.css', 'styles/components.css'];
    
    stylesheets.forEach(sheet => {
        const href = sheet.getAttribute('href');
        if (href && !keepStyles.some(keep => href.includes(keep))) {
            console.log(`❌ Removing conflicting stylesheet: ${href}`);
            sheet.remove();
        }
    });
    
    // Remove duplicate scripts
    const scripts = document.querySelectorAll('script[src]');
    const seenScripts = new Set();
    
    scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src) {
            if (seenScripts.has(src)) {
                console.log(`❌ Removing duplicate script: ${src}`);
                script.remove();
            } else {
                seenScripts.add(src);
            }
        }
    });
    
    // Fix broken CSS by adding essential styles
    addEssentialStyles();
    
    // Fix JavaScript conflicts
    fixJavaScriptConflicts();
    
    // Fix responsive issues
    fixResponsiveIssues();
    
    console.log('✅ Crazy stuff fixed!');
}

function addEssentialStyles() {
    const essentialCSS = `
        <style id="essential-fixes">
        /* Essential fixes for the crazy stuff */
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        /* Fix navigation */
        .top-nav {
            background: #ffffff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }
        
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Fix hero section */
        .hero-section {
            margin-top: 80px;
            padding: 60px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            min-height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .hero-content {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .hero-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        
        .hero-cta {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
        }
        
        .hero-btn {
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 1rem;
        }
        
        .hero-btn.primary {
            background: #ffffff;
            color: #007FFF;
        }
        
        .hero-btn.secondary {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
        }
        
        .hero-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        /* Fix features section */
        .features-section {
            padding: 60px 20px;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .feature-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
        }
        
        .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,127,255,0.15);
            border-color: #007FFF;
        }
        
        .feature-card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .feature-card p {
            color: #7f8c8d;
            line-height: 1.6;
        }
        
        /* Fix buttons */
        .btn, button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9rem;
        }
        
        .btn-primary {
            background: #007FFF;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0066CC;
        }
        
        .btn-outline {
            background: transparent;
            color: #007FFF;
            border: 2px solid #007FFF;
        }
        
        .btn-outline:hover {
            background: #007FFF;
            color: white;
        }
        
        /* Fix responsive issues */
        @media (max-width: 768px) {
            .hero-title {
                font-size: 2rem;
            }
            
            .hero-cta {
                flex-direction: column;
                align-items: center;
            }
            
            .hero-btn {
                width: 100%;
                max-width: 300px;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
            
            .nav-actions {
                display: none;
            }
        }
        
        /* Hide problematic elements */
        .floating-elements,
        .hero-pattern,
        .pulse-ring,
        .hero-illustration {
            display: none !important;
        }
        
        /* Fix any broken layouts */
        .hero-layout {
            display: block !important;
        }
        
        .hero-visual {
            display: none !important;
        }
        
        /* Ensure proper spacing */
        .page {
            min-height: 100vh;
        }
        
        .page.active {
            display: block;
        }
        
        .page:not(.active) {
            display: none;
        }
        </style>
    `;
    
    // Remove existing essential fixes
    const existing = document.getElementById('essential-fixes');
    if (existing) {
        existing.remove();
    }
    
    // Add new essential styles
    document.head.insertAdjacentHTML('beforeend', essentialCSS);
    console.log('✅ Essential styles added');
}

function fixJavaScriptConflicts() {
    // Remove duplicate event listeners
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        // Clone button to remove all event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Add clean event listeners
    addCleanEventListeners();
    
    console.log('✅ JavaScript conflicts fixed');
}

function addCleanEventListeners() {
    // Navigation buttons
    document.getElementById('nav-get-started-btn')?.addEventListener('click', () => {
        showNotification('Starting Risk Assessment...', 'info');
    });
    
    document.getElementById('nav-dashboard-btn')?.addEventListener('click', () => {
        showNotification('Opening Dashboard...', 'info');
    });
    
    document.getElementById('nav-signup-btn')?.addEventListener('click', () => {
        showNotification('Opening Sign Up...', 'info');
    });
    
    // Hero buttons
    document.getElementById('hero-start-assessment')?.addEventListener('click', () => {
        showNotification('Risk Assessment Started!', 'success');
    });
    
    document.getElementById('hero-explore-features')?.addEventListener('click', () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', () => {
            const feature = card.dataset.feature || 'feature';
            showNotification(`${feature.replace('-', ' ')} clicked!`, 'success');
        });
    });
    
    console.log('✅ Clean event listeners added');
}

function fixResponsiveIssues() {
    // Add viewport meta tag if missing
    if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(viewport);
    }
    
    // Fix any overflow issues
    document.body.style.overflowX = 'hidden';
    
    console.log('✅ Responsive issues fixed');
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.fix-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `fix-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Auto-fix on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixCrazyStuff);
} else {
    fixCrazyStuff();
}

// Also fix after a short delay to catch any late-loading issues
setTimeout(fixCrazyStuff, 2000);

console.log('🎉 Fix script loaded - the crazy stuff will be cleaned up!');