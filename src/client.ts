import ElementExtractor from "./ElementExtractor";


console.log('Client module loaded');


const elementExtractor = new ElementExtractor();


// const addWidget = () => {
//     const widget = document.createElement('div');
//     widget.id = 'clone-element-widget';
//     widget.innerHTML = '<h3>Clone element</h3><p><button>Select mode</button></p>';
//     document.body.appendChild(widget);
//     const button = widget.querySelector('button');
//     button?.addEventListener('click', () => {
//         alert('Select mode activated!');
//     });
//     return widget;
// };

// // Cleanup function
// const cleanup = () => {
//     const existing = document.getElementById('clone-element-widget');
//     if (existing) {
//         existing.remove();
//     }
// };


// HMR Support - Accept updates without full page reload
if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        console.log('HMR: Module updated, re-running client code...');
        // The module will automatically re-execute when accepted
    });

    // Cleanup before hot update
    import.meta.hot.dispose(() => {
        console.log('HMR: Cleaning up old module...');
        elementExtractor.cleanup();
    });
}
