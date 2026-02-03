// Component Extractor Injection Script
// This is loaded by the bookmarklet and injects the full extractor

(function () {
    'use strict';

    // Remove existing widget if present
    const existing = document.getElementById('clone-element-widget');
    if (existing) {
        existing.remove();
    }

    // Check if already loaded
    if (window.CloneElementExtractor) {
        new window.CloneElementExtractor();
        return;
    }

    // Auto-detect base URL from where this script was loaded
    const currentScript = document.currentScript || document.getElementById('clone-element-injector');
    const scriptUrl = currentScript ? currentScript.src : null;
    let BASE_URL = 'http://localhost:5173'; // fallback

    if (scriptUrl) {
        // Extract the base URL (everything before /inject.js)
        const url = new URL(scriptUrl);
        BASE_URL = url.origin + url.pathname.replace('/inject.js', '');
    }

    console.log('Component Extractor loading from:', BASE_URL);

    // Check if we're loading from production (built assets) or dev
    const isProduction = !BASE_URL.includes('localhost');

    // Inject CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = BASE_URL + (isProduction ? '/assets/main.css' : '/src/style.css');
    cssLink.id = 'clone-element-styles';
    document.head.appendChild(cssLink);

    // Inject the main script
    const script = document.createElement('script');
    script.type = 'module';
    script.id = 'clone-element-main-script';

    if (isProduction) {
        // In production, load the compiled bundle
        script.src = BASE_URL + '/assets/main.js';
        script.onload = function () {
            // After loading, initialize the extractor
            if (window.CloneElementExtractor) {
                new window.CloneElementExtractor();
            }
        };
        document.head.appendChild(script);
    } else {
        // In development, use module imports
        script.textContent = `
            import ElementExtractor from '${BASE_URL}/src/ElementExtractor.ts';
            import '${BASE_URL}/src/style.css';
            
            // Make globally available
            window.CloneElementExtractor = ElementExtractor;
            
            // Create instance
            new ElementExtractor();
        `;
        document.head.appendChild(script);
    }
})();
