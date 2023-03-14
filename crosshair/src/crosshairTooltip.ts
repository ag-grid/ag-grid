import { AgCrosshairTooltipRendererParams, AgTooltipRendererResult, _ModuleSupport, _Scene } from 'ag-charts-community';

export const defaultTooltipCss = `
.ag-crosshair-tooltip {
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

.ag-crosshair-tooltip-content {
    padding: 0 7px;
    opacity: 1;
}

.ag-crosshair-tooltip-title {
    padding-left: 7px;
    opacity: 1;
}

.ag-crosshair-tooltip-hidden {
    top: -10000px !important;
}

.ag-crosshair-tooltip {
    box-sizing: border-box;
    overflow: hidden;
}
`;

export interface TooltipMeta {
    x: number;
    y: number;
}

export const DEFAULT_TOOLTIP_CLASS = 'ag-crosshair-tooltip';

export class CrosshairTooltip {
    private static tooltipDocuments: Document[] = [];
    private readonly element: HTMLElement;

    private readonly tooltipRoot: HTMLElement;

    enabled: boolean = true;
    container?: HTMLElement = undefined;
    xOffset: number = 0;
    yOffset: number = 0;
    renderer?: (params: AgCrosshairTooltipRendererParams) => string | AgTooltipRendererResult = undefined;

    constructor(document: Document, container: HTMLElement) {
        this.tooltipRoot = container;
        const element = document.createElement('div');
        this.element = this.tooltipRoot.appendChild(element);
        this.element.classList.add(DEFAULT_TOOLTIP_CLASS);

        if (CrosshairTooltip.tooltipDocuments.indexOf(document) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            // Make sure the default tooltip style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            CrosshairTooltip.tooltipDocuments.push(document);
        }
    }

    isVisible(): boolean {
        const { element } = this;
        if (element.classList) {
            return !element.classList.contains(`${DEFAULT_TOOLTIP_CLASS}-hidden`);
        }

        // IE11
        const classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(`${DEFAULT_TOOLTIP_CLASS}-hidden`) < 0;
        }

        return false;
    }

    updateClass(visible?: boolean) {
        const classList = [DEFAULT_TOOLTIP_CLASS];

        if (visible !== true) {
            classList.push(`${DEFAULT_TOOLTIP_CLASS}-hidden`);
        }

        this.element.className = classList.join(' ');
    }

    show(meta: TooltipMeta) {
        const { element } = this;

        const left = meta.x + this.xOffset;
        const top = meta.y + this.yOffset;

        element.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;

        this.toggle(true);
    }

    setTooltipHtml(html?: string) {
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
}
