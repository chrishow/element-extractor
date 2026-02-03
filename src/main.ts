import './style.css'
import './client'

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hostname === 'localhost') {
        const devButton = document.querySelector('.extractor-dev-button') as HTMLElement;
        if (devButton) {
            devButton.style.display = 'block';
        }
    }
});