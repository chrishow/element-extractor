import ElementExtractor from "./ElementExtractor";

// console.log('Client module loaded');

// Make it globally accessible for bookmarklet
(window as any).CloneElementExtractor = ElementExtractor;

const elementExtractor = new ElementExtractor();

// HMR Support - Accept updates without full page reload
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        // console.log('HMR: Module updated, re-running client code...');
        // The module will automatically re-execute when accepted
    });

    // Cleanup before hot update
    import.meta.hot.dispose(() => {
        // console.log('HMR: Cleaning up old module...');
        elementExtractor.cleanup();
    });
}
