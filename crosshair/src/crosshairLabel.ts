import { AgCrosshairLabelRendererParams, AgCrosshairLabelRendererResult, _ModuleSupport, _Scene } from 'ag-charts-community';

export const defaultLabelCss = `
.ag-crosshair-label {
    position: absolute;
    left: 0px;
    top: 0px;
    user-select: none;
    pointer-events: none;
    border-radius: 2px;
    font: 12px Verdana, sans-serif;
    box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%);
    line-height: 1.7em;
    overflow: hidden;
    white-space: nowrap;
    z-index: 99999;
    background-color: rgb(255, 255, 255);
    color: rgba(87, 87, 87, 1);
}

.ag-crosshair-label-content {
    padding: 0 7px;
    opacity: 1;
}

.ag-crosshair-label-title {
    padding-left: 7px;
    opacity: 1;
}

.ag-crosshair-label-hidden {
    top: -10000px !important;
}

.ag-crosshair-label {
    box-sizing: border-box;
    overflow: hidden;
}
`;

export interface LabelMeta {
    x: number;
    y: number;
}

export const DEFAULT_LABEL_CLASS = 'ag-crosshair-label';

export class CrosshairLabel {
    private static labelDocuments: Document[] = [];
    private readonly element: HTMLElement;

    private readonly labelRoot: HTMLElement;

    enabled: boolean = true;
    container?: HTMLElement = undefined;
    xOffset: number = 0;
    yOffset: number = 0;
    renderer?: (params: AgCrosshairLabelRendererParams) => string | AgCrosshairLabelRendererResult = undefined;

    constructor(document: Document, container: HTMLElement) {
        this.labelRoot = container;
        const element = document.createElement('div');
        this.element = this.labelRoot.appendChild(element);
        this.element.classList.add(DEFAULT_LABEL_CLASS);

        if (CrosshairLabel.labelDocuments.indexOf(document) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = defaultLabelCss;
            // Make sure the default label style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            CrosshairLabel.labelDocuments.push(document);
        }
    }

    private updateClass(visible?: boolean) {
        const classList = [DEFAULT_LABEL_CLASS];

        if (visible !== true) {
            classList.push(`${DEFAULT_LABEL_CLASS}-hidden`);
        }

        this.element.className = classList.join(' ');
    }

    show(meta: LabelMeta) {
        const { element } = this;

        const left = meta.x + this.xOffset;
        const top = meta.y + this.yOffset;

        element.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;

        this.toggle(true);
    }

    setLabelHtml(html?: string) {
        if (html !== undefined) {
            this.element.innerHTML = html;
        }
    }

    computeBBox(): _Scene.BBox {
        const { element } = this;
        return new _Scene.BBox(element.clientLeft, element.clientTop, element.clientWidth, element.clientHeight);
    }

    toggle(visible?: boolean) {
        this.updateClass(visible);
    }

    destroy() {
        const { parentNode } = this.element;

        if (parentNode) {
            parentNode.removeChild(this.element);
        }
    }

    toLabelHtml(input: string | AgCrosshairLabelRendererResult, defaults?: AgCrosshairLabelRendererResult): string {
        if (typeof input === 'string') {
            return input;
        }

        defaults = defaults || {};

        const {
            text = defaults.text || '',
            color = defaults.color,
            backgroundColor = undefined,
            opacity = defaults.opacity || 1,
        } = input;

        let contentHtml;

        if (color) {
            contentHtml = `<span class="${DEFAULT_LABEL_CLASS}-content" style="color: ${color}">${text}</span>`;
        } else {
            contentHtml = `<span class="${DEFAULT_LABEL_CLASS}-content">${text}</span>`;
        }

        let style = `opacity: ${opacity}`;
        if (backgroundColor) {
            style += `; background-color: ${backgroundColor.toLowerCase()}`;
        }

        return `<div class="${DEFAULT_LABEL_CLASS}-wrapper" style="${style}">
                    ${contentHtml}
                </div>`;
    }
}
