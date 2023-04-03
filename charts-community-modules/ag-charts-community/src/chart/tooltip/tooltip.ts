import { BBox } from '../../scene/bbox';
import { DeprecatedAndRenamedTo } from '../../util/deprecation';
import { Validate, BOOLEAN, NUMBER, OPT_STRING, INTERACTION_RANGE, predicateWithMessage } from '../../util/validation';
import { AgChartInteractionRange, AgTooltipRendererResult } from '../agChartOptions';
import { InteractionEvent } from '../interaction/interactionManager';

// Extend EventTarget to to provide `classList` for `relatedTarget`
declare global {
    interface EventTarget {
        readonly classList: DOMTokenList;
    }
}

export const DEFAULT_TOOLTIP_CLASS = 'ag-chart-tooltip';

const defaultTooltipCss = `
.${DEFAULT_TOOLTIP_CLASS} {
    transition: transform 0.1s ease;
    display: table;
    position: fixed;
    left: 0px;
    top: 0px;
    white-space: nowrap;
    z-index: 99999;
    font: 12px Verdana, sans-serif;
    color: black;
    background: rgb(244, 244, 244);
    border-radius: 5px;
    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);
}

.${DEFAULT_TOOLTIP_CLASS}-no-interaction {
    pointer-events: none;
    user-select: none;
}

.${DEFAULT_TOOLTIP_CLASS}-no-animation {
    transition: none !important;
}

.${DEFAULT_TOOLTIP_CLASS}-hidden {
    visibility: hidden;
}

.${DEFAULT_TOOLTIP_CLASS}-title {
    font-weight: bold;
    padding: 7px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    color: white;
    background-color: #888888;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.${DEFAULT_TOOLTIP_CLASS}-content {
    padding: 7px;
    line-height: 1.7em;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    overflow: hidden;
}

.${DEFAULT_TOOLTIP_CLASS}-content:empty {
    padding: 0;
    height: 7px;
}

.${DEFAULT_TOOLTIP_CLASS}-arrow::before {
    content: "";

    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);

    border: 6px solid #989898;

    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: #989898;
    border-bottom-color: transparent;

    width: 0;
    height: 0;

    margin: 0 auto;
}

.${DEFAULT_TOOLTIP_CLASS}-arrow::after {
    content: "";

    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);

    border: 5px solid black;

    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: rgb(244, 244, 244);
    border-bottom-color: transparent;

    width: 0;
    height: 0;

    margin: 0 auto;
}

.ag-chart-wrapper {
    box-sizing: border-box;
    overflow: hidden;
}
`;

export interface TooltipMeta {
    pageX: number;
    pageY: number;
    offsetX: number;
    offsetY: number;
    event: Event | InteractionEvent<any>;
}

export function toTooltipHtml(input: string | AgTooltipRendererResult, defaults?: AgTooltipRendererResult): string {
    if (typeof input === 'string') {
        return input;
    }

    defaults = defaults || {};

    const {
        content = defaults.content || '',
        title = defaults.title || undefined,
        color = defaults.color || 'white',
        backgroundColor = defaults.backgroundColor || '#888',
    } = input;

    const titleHtml = title
        ? `<div class="${DEFAULT_TOOLTIP_CLASS}-title"
        style="color: ${color}; background-color: ${backgroundColor}">${title}</div>`
        : '';

    return `${titleHtml}<div class="${DEFAULT_TOOLTIP_CLASS}-content">${content}</div>`;
}

const POSITION_TYPES = ['pointer', 'node'];
export const POSITION_TYPE = predicateWithMessage(
    (v: any) => POSITION_TYPES.includes(v),
    `expecting a position type keyword such as 'pointer' or 'node'`
);

export type TooltipPositionType = 'pointer' | 'node';

class TooltipPosition {
    @Validate(POSITION_TYPE)
    /** The type of positioning for the tooltip. By default, the tooltip follows the pointer. */
    type: TooltipPositionType = 'pointer';

    @Validate(NUMBER())
    /** The horizontal offset in pixels for the position of the tooltip. */
    xOffset?: number = 0;

    @Validate(NUMBER())
    /** The vertical offset in pixels for the position of the tooltip. */
    yOffset?: number = 0;
}

export class Tooltip {
    private static tooltipDocuments: Document[] = [];

    private readonly element: HTMLDivElement;

    private readonly observer?: IntersectionObserver;
    private readonly canvasElement: HTMLElement;
    private readonly tooltipRoot: HTMLElement;

    @Validate(BOOLEAN)
    enabled: boolean = true;

    @Validate(OPT_STRING)
    class?: string = undefined;
    lastClass?: string = undefined;

    @Validate(NUMBER(0))
    delay: number = 0;

    @DeprecatedAndRenamedTo('range', (value) => (value ? 'nearest' : 'exact'))
    tracking?: boolean;

    @Validate(INTERACTION_RANGE)
    range: AgChartInteractionRange = 'nearest';

    @Validate(BOOLEAN)
    enableInteraction: boolean = false;

    readonly position: TooltipPosition = new TooltipPosition();

    constructor(canvasElement: HTMLCanvasElement, document: Document, container: HTMLElement) {
        this.tooltipRoot = container;
        const element = document.createElement('div');
        this.element = this.tooltipRoot.appendChild(element);
        this.element.classList.add(DEFAULT_TOOLTIP_CLASS);
        this.canvasElement = canvasElement;

        // Detect when the chart becomes invisible and hide the tooltip as well.
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        if (entry.target === this.canvasElement && entry.intersectionRatio === 0) {
                            this.toggle(false);
                        }
                    }
                },
                { root: this.tooltipRoot }
            );
            observer.observe(this.canvasElement);
            this.observer = observer;
        }

        if (Tooltip.tooltipDocuments.indexOf(document) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            // Make sure the default tooltip style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Tooltip.tooltipDocuments.push(document);
        }
    }

    destroy() {
        const { parentNode } = this.element;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }

        if (this.observer) {
            this.observer.unobserve(this.canvasElement);
        }
    }

    isVisible(): boolean {
        const { element } = this;

        return !element.classList.contains(DEFAULT_TOOLTIP_CLASS + '-hidden');
    }

    private updateClass(visible?: boolean, constrained?: boolean) {
        const { element, class: newClass, lastClass, enableInteraction } = this;

        const wasVisible = this.isVisible();

        const toggleClass = (name: string, include: boolean) => {
            const className = `${DEFAULT_TOOLTIP_CLASS}-${name}`;
            if (include) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        };

        toggleClass('no-animation', !wasVisible && !!visible); // No animation on first show.
        toggleClass('no-interaction', !enableInteraction); // Prevent interaction.
        toggleClass('hidden', !visible); // Hide if not visible.
        toggleClass('arrow', !constrained); // Add arrow if tooltip is constrained.

        if (newClass !== lastClass) {
            if (lastClass) {
                element.classList.remove(lastClass);
            }
            if (newClass) {
                element.classList.add(newClass);
            }
            this.lastClass = newClass;
        }
    }

    private showTimeout: number = 0;
    private constrained = false;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta: TooltipMeta, html?: string, instantly = false) {
        const { element, canvasElement } = this;

        if (html !== undefined) {
            element.innerHTML = html;
        } else if (!element.innerHTML) {
            return;
        }

        const limit = (low: number, actual: number, high: number) => {
            return Math.max(Math.min(actual, high), low);
        };

        const canvasRect = canvasElement.getBoundingClientRect();
        const naiveLeft = canvasRect.left + meta.offsetX - element.clientWidth / 2;
        const naiveTop = canvasRect.top + meta.offsetY - element.clientHeight - 8;

        const windowBounds = this.getWindowBoundingBox();
        const maxLeft = windowBounds.x + windowBounds.width - element.clientWidth - 1;
        const maxTop = windowBounds.y + windowBounds.height - element.clientHeight;

        const left = limit(windowBounds.x, naiveLeft, maxLeft);
        const top = limit(windowBounds.y, naiveTop, maxTop);

        this.constrained = left !== naiveLeft || top !== naiveTop;
        element.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;

        if (this.delay > 0 && !instantly) {
            this.toggle(false);
            this.showTimeout = window.setTimeout(() => {
                this.toggle(true);
            }, this.delay);
            return;
        }

        this.toggle(true);
    }

    private getWindowBoundingBox(): BBox {
        return new BBox(0, 0, window.innerWidth, window.innerHeight);
    }

    toggle(visible?: boolean) {
        if (!visible) {
            window.clearTimeout(this.showTimeout);
        }
        this.updateClass(visible, this.constrained);
    }

    pointerLeftOntoTooltip(event: InteractionEvent<'leave'>): boolean {
        if (!this.enableInteraction) return false;

        const classList = (event.sourceEvent as MouseEvent).relatedTarget?.classList;
        const classes = ['', '-title', '-content'];
        const classListContains = Boolean(classes.filter((c) => classList?.contains(`${DEFAULT_TOOLTIP_CLASS}${c}`)));

        return classList !== undefined && classListContains;
    }
}
