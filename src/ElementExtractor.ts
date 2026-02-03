
class ElementExtractor {

    widgetElement: HTMLDivElement | null = null;
    widgetButton: HTMLButtonElement | null = null;
    elementInfo: HTMLDivElement | null = null;
    extractedContent: HTMLDivElement | null = null;
    isInSelectMode: boolean = false;
    selectedElement: HTMLElement | null = null;
    currentTab: 'html' | 'css' = 'html';

    constructor() {
        console.log('ElementExtractor class initialized');
        this.installWidget();
    }


    installWidget() {
        const widget = document.createElement('div');
        widget.id = 'clone-element-widget';
        widget.innerHTML = `
        <div class="widget-header">
            <div class="widget-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <h3>Component Extractor</h3>
            </div>
            <button class="close-btn" aria-label="Close">×</button>
        </div>
        <div class="widget-body">
            <div class="selector-section">
                <button class="select-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"></path>
                    </svg>
                    <span>Select Element</span>
                </button>
                <div class="element-info"></div>
            </div>
            <div class="extracted-content" style="display: none;">
                <div class="tabs">
                    <button class="tab active" data-tab="html">HTML</button>
                    <button class="tab" data-tab="css">CSS</button>
                </div>
                <div class="tab-content">
                    <div class="code-header">
                        <span class="code-label"></span>
                        <button class="copy-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy
                        </button>
                    </div>
                    <pre class="code-display"><code></code></pre>
                </div>
            </div>
        </div>
        `;
        document.body.appendChild(widget);
        this.widgetButton = widget.querySelector('.select-btn');
        this.elementInfo = widget.querySelector('.element-info');
        this.extractedContent = widget.querySelector('.extracted-content');

        this.widgetButton?.addEventListener('click', () => {
            if (this.isInSelectMode) {
                this.exitSelectMode();
            } else {
                this.enterSelectMode();
            }
        });

        // Tab switching
        const tabs = widget.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const tabName = target.dataset.tab as 'html' | 'css';
                this.switchTab(tabName);
            });
        });

        // Copy button
        const copyBtn = widget.querySelector('.copy-btn');
        copyBtn?.addEventListener('click', () => this.copyToClipboard());

        // Close button
        const closeBtn = widget.querySelector('.close-btn');
        closeBtn?.addEventListener('click', () => this.cleanup());

        this.widgetElement = widget;
    }

    enterSelectMode() {
        console.log('Entering select mode');
        this.isInSelectMode = true;
        this.widgetButton!.classList.add('active');
        this.widgetButton!.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
            <span>Cancel Selection</span>
        `;
        document.addEventListener('mouseover', this.mouseoverListener);
        document.addEventListener('mouseout', this.mouseoutListener);
        document.addEventListener('click', this.clickListener, true);
    }

    exitSelectMode() {
        console.log('Exiting select mode');
        this.isInSelectMode = false;
        this.widgetButton!.classList.remove('active');
        this.widgetButton!.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"></path>
            </svg>
            <span>Select Element</span>
        `;
        document.removeEventListener('mouseover', this.mouseoverListener);
        document.removeEventListener('mouseout', this.mouseoutListener);
        document.removeEventListener('click', this.clickListener, true);

        // Remove any lingering highlights
        document.querySelectorAll('.clone-element-highlighted').forEach(el => {
            el.classList.remove('clone-element-highlighted');
        });
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
            target.classList.remove('clone-element-highlighted');

            const elementClasses = Array.from(target.classList).filter(c => c !== 'clone-element-highlighted');
            const classAttr = elementClasses.length > 0 ? ` class="${elementClasses.join(' ')}"` : '';
            this.elementInfo!.innerHTML = `
                <div class="selected-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>&lt;${target.tagName.toLowerCase()}${classAttr}&gt;</span>
                </div>
            `;

            this.exitSelectMode();
            this.extractComponent();
        }
    }

    extractComponent() {
        if (!this.selectedElement) return;

        // Extract HTML
        const html = this.extractHTML(this.selectedElement);

        // Extract CSS
        const css = this.extractCSS(this.selectedElement);

        // Show extracted content
        this.extractedContent!.style.display = 'block';

        // Display the current tab content
        this.switchTab(this.currentTab);
    }

    extractHTML(element: HTMLElement): string {
        const clone = element.cloneNode(true) as HTMLElement;

        // Remove any highlighting classes
        clone.classList.remove('clone-element-highlighted');
        clone.querySelectorAll('.clone-element-highlighted').forEach(el => {
            el.classList.remove('clone-element-highlighted');
        });

        // Format the HTML nicely
        return this.formatHTML(clone.outerHTML);
    }

    formatHTML(html: string): string {
        let formatted = '';
        let indent = 0;
        const tab = '  ';

        html.split(/>\s*</).forEach((node) => {
            if (node.match(/^\/\w/)) {
                indent--;
            }

            formatted += tab.repeat(indent < 0 ? 0 : indent);

            if (node.startsWith('<')) {
                formatted += node + '>\n';
            } else if (node.endsWith('>')) {
                formatted += '<' + node + '\n';
            } else {
                formatted += '<' + node + '>\n';
            }

            if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input') && !node.startsWith('br') &&
                !node.startsWith('img') && !node.startsWith('hr') && !node.startsWith('meta') &&
                !node.startsWith('link')) {
                indent++;
            }
        });

        return formatted.trim();
    }

    extractCSS(element: HTMLElement): string {
        const styles: Map<string, string[]> = new Map();
        const pseudoStyles: Map<string, string[]> = new Map();

        // Get all elements including the root
        const elements = [element, ...Array.from(element.querySelectorAll('*'))];

        elements.forEach(el => {
            const computed = window.getComputedStyle(el as HTMLElement);
            const htmlEl = el as HTMLElement;

            // Create a selector
            let selector = htmlEl.tagName.toLowerCase();
            if (htmlEl.id) {
                selector = '#' + htmlEl.id;
            } else if (htmlEl.className) {
                const classes = Array.from(htmlEl.classList)
                    .filter(c => !c.startsWith('clone-element-'))
                    .join('.');
                if (classes) {
                    selector = '.' + classes;
                }
            }

            // Get relevant CSS properties
            const relevantProps = this.getRelevantCSSProperties(computed);

            if (relevantProps.length > 0) {
                if (!styles.has(selector)) {
                    styles.set(selector, []);
                }
                styles.get(selector)!.push(...relevantProps);
            }
        });

        // Extract pseudo-class styles from stylesheets
        this.extractPseudoStyles(element, pseudoStyles);

        // Format CSS
        let css = '';
        styles.forEach((props, selector) => {
            css += selector + ' {\n';
            // Remove duplicates
            const uniqueProps = [...new Set(props)];
            uniqueProps.forEach(prop => {
                css += '  ' + prop + '\n';
            });
            css += '}\n\n';
        });

        // Add pseudo-class styles
        pseudoStyles.forEach((props, selector) => {
            css += selector + ' {\n';
            props.forEach(prop => {
                css += '  ' + prop + '\n';
            });
            css += '}\n\n';
        });

        return css.trim();
    }

    getRelevantCSSProperties(computed: CSSStyleDeclaration): string[] {
        const relevantProps = [
            'display', 'position', 'top', 'right', 'bottom', 'left',
            'max-width', 'max-height', 'min-width', 'min-height',
            'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'border', 'border-radius', 'border-width', 'border-style', 'border-color',
            'background', 'background-color', 'background-image', 'background-size', 'background-position',
            'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align', 'text-decoration',
            'flex', 'flex-direction', 'justify-content', 'align-items', 'gap',
            'grid', 'grid-template-columns', 'grid-template-rows', 'grid-gap',
            'box-shadow', 'text-shadow', 'opacity', 'transform', 'transition',
            'overflow', 'overflow-x', 'overflow-y', 'z-index', 'cursor'
        ];

        const props: string[] = [];

        relevantProps.forEach(prop => {
            const value = computed.getPropertyValue(prop);

            // Special handling for text-decoration
            if (prop === 'text-decoration') {
                // Include 'none' (common override for links) but skip default 'underline'
                if (value === 'none' || (value && !value.includes('underline') && value !== 'auto')) {
                    props.push(prop + ': ' + value + ';');
                }
                return;
            }

            if (value && value !== 'none' && value !== 'normal' && value !== 'auto' &&
                value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent' && value !== '0px') {
                props.push(prop + ': ' + value + ';');
            }
        });

        return props;
    }

    extractPseudoStyles(element: HTMLElement, pseudoStyles: Map<string, string[]>) {
        // Get all stylesheets
        const sheets = Array.from(document.styleSheets);
        const elements = [element, ...Array.from(element.querySelectorAll('*'))];

        sheets.forEach(sheet => {
            try {
                const rules = Array.from(sheet.cssRules || []);

                rules.forEach(rule => {
                    if (rule instanceof CSSStyleRule) {
                        const selectorText = rule.selectorText;

                        // Check if it's a pseudo-class (:hover, :focus, etc.) or pseudo-element (::before, ::after, etc.)
                        if (selectorText && (selectorText.includes(':hover') || selectorText.includes(':focus') ||
                            selectorText.includes(':active') || selectorText.includes(':visited') ||
                            selectorText.includes('::before') || selectorText.includes('::after') ||
                            selectorText.includes('::first-line') || selectorText.includes('::first-letter'))) {

                            // Extract the base selector (without pseudo-class/element)
                            const baseSelector = selectorText.split(':')[0].trim();

                            // Check if any of our elements match this base selector
                            elements.forEach(el => {
                                try {
                                    if ((el as HTMLElement).matches(baseSelector)) {
                                        const props: string[] = [];
                                        const style = rule.style;

                                        // Extract all non-empty properties
                                        for (let i = 0; i < style.length; i++) {
                                            const prop = style[i];
                                            const value = style.getPropertyValue(prop);
                                            if (value) {
                                                props.push(prop + ': ' + value + ';');
                                            }
                                        }

                                        if (props.length > 0) {
                                            // Create selector with class or id if available
                                            let targetSelector = (el as HTMLElement).tagName.toLowerCase();
                                            const htmlEl = el as HTMLElement;
                                            if (htmlEl.id) {
                                                targetSelector = '#' + htmlEl.id;
                                            } else if (htmlEl.className) {
                                                const classes = Array.from(htmlEl.classList)
                                                    .filter(c => !c.startsWith('clone-element-'))
                                                    .join('.');
                                                if (classes) {
                                                    targetSelector = '.' + classes;
                                                }
                                            }

                                            // Get the pseudo-class part
                                            const pseudoPart = selectorText.substring(selectorText.indexOf(':'));
                                            const fullSelector = targetSelector + pseudoPart;

                                            if (!pseudoStyles.has(fullSelector)) {
                                                pseudoStyles.set(fullSelector, []);
                                            }
                                            pseudoStyles.get(fullSelector)!.push(...props);
                                        }
                                    }
                                } catch (e) {
                                    // Skip invalid selectors
                                }
                            });
                        }
                    }
                });
            } catch (e) {
                // Skip stylesheets we can't access (CORS)
            }
        });
    }

    switchTab(tabName: 'html' | 'css') {
        this.currentTab = tabName;

        // Update tab buttons
        const tabs = this.widgetElement!.querySelectorAll('.tab');
        tabs.forEach(tab => {
            const btn = tab as HTMLButtonElement;
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update content
        const codeDisplay = this.widgetElement!.querySelector('.code-display code') as HTMLElement;
        const codeLabel = this.widgetElement!.querySelector('.code-label') as HTMLElement;

        if (tabName === 'html') {
            const html = this.selectedElement ? this.extractHTML(this.selectedElement) : '';
            codeDisplay.textContent = html;
            codeLabel.textContent = 'HTML Markup';
        } else {
            const css = this.selectedElement ? this.extractCSS(this.selectedElement) : '';
            codeDisplay.textContent = css;
            codeLabel.textContent = 'CSS Styles';
        }
    }

    async copyToClipboard() {
        const codeDisplay = this.widgetElement!.querySelector('.code-display code') as HTMLElement;
        const copyBtn = this.widgetElement!.querySelector('.copy-btn') as HTMLButtonElement;

        try {
            await navigator.clipboard.writeText(codeDisplay.textContent || '');

            // Show feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
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