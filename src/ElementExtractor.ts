
class ElementExtractor {

    widgetElement: HTMLDivElement | null = null;
    widgetButton: HTMLButtonElement | null = null;
    elementInfo: HTMLDivElement | null = null;
    isInSelectMode: boolean = false;
    selectedElement: HTMLElement | null = null;

    constructor() {
        console.log('ElementExtractor class initialized');
        this.installWidget();
    }


    installWidget() {
        const widget = document.createElement('div');
        widget.id = 'clone-element-widget';
        widget.innerHTML = `
        <h3>Clone element</h3>
        <p><button>Enter select mode</button></p>
        <div class='element-info'></div>
        `;
        document.body.appendChild(widget);
        this.widgetButton = widget.querySelector('button');;
        this.elementInfo = widget.querySelector('.element-info');
        this.widgetButton?.addEventListener('click', () => {
            if (this.isInSelectMode) {
                this.exitSelectMode();
            } else {
                this.enterSelectMode();
            }
        });
        this.widgetElement = widget;
    }

    enterSelectMode() {
        console.log('Entering select mode');
        this.isInSelectMode = true;
        this.widgetButton!.textContent = 'Exit select mode';
        document.addEventListener('mouseover', this.mouseoverListener);
        document.addEventListener('mouseout', this.mouseoutListener);
        document.addEventListener('click', this.clickListener, true);
    }

    exitSelectMode() {
        console.log('Exiting select mode');
        this.isInSelectMode = false;
        this.widgetButton!.textContent = 'Enter select mode';
        this.elementInfo!.textContent = '';
        document.removeEventListener('mouseover', this.mouseoverListener);
        document.removeEventListener('mouseout', this.mouseoutListener);
        document.removeEventListener('click', this.clickListener, true);

    }

    mouseoverListener = (event: MouseEvent) => {
        if (this.isInSelectMode) {
            const target = event.target as HTMLElement;
            // If target is not the widget itself, highlight it
            if (target.id === 'clone-element-widget' || target.closest('#clone-element-widget')) {
                return;
            }
            target.classList.add('clone-element-highlighted');
        }
    }

    mouseoutListener = (event: MouseEvent) => {
        if (this.isInSelectMode) {
            const target = event.target as HTMLElement;
            target.classList.remove('clone-element-highlighted');
        }
    }

    clickListener = (event: MouseEvent) => {
        if (this.isInSelectMode) {
            const target = event.target as HTMLElement;
            if (target.id === 'clone-element-widget' || target.closest('#clone-element-widget')) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            console.log('Element selected for cloning:', target);
            this.selectedElement = target;
            const elementClasses = Array.from(target.classList).filter(c => c !== 'clone-element-highlighted');
            const classAttr = elementClasses.length > 0 ? ` class="${elementClasses.join(' ')}"` : '';
            this.elementInfo!.textContent = `Selected element: <${target.tagName.toLowerCase()}${classAttr}>`;
        }
    }

    cleanup() {
        console.log('ElementExtractor cleanup called');
        if (this.widgetElement) {
            this.widgetElement.remove();
            this.widgetElement = null;
            document.removeEventListener('mouseover', this.mouseoverListener);
            document.removeEventListener('mouseout', this.mouseoutListener);
        }

    }
}

export default ElementExtractor;