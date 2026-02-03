// Bookmarklet loader for Component Extractor
(function () {
    // Check if widget already exists and remove it
    const existing = document.getElementById('clone-element-widget');
    if (existing) {
        existing.remove();
    }

    // Configuration - update this URL when deploying
    const SCRIPT_URL = 'http://localhost:5173/src/client.ts';

    // Check if script is already loaded
    const existingScript = document.getElementById('clone-element-script');
    if (existingScript) {
        // If script exists, just reinitialize
        if ((window as any).CloneElementExtractor) {
            new (window as any).CloneElementExtractor();
        }
    } else {
        // Load the script
        const script = document.createElement('script');
        script.id = 'clone-element-script';
        script.type = 'module';
        script.src = SCRIPT_URL;
        document.head.appendChild(script);
    }
})();
