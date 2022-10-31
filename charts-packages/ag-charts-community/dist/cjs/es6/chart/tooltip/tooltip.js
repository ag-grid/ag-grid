"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../util/validation");
exports.DEFAULT_TOOLTIP_CLASS = 'ag-chart-tooltip';
const defaultTooltipCss = `
.ag-chart-tooltip {
    transition: transform 0.1s ease;
    display: table;
    position: fixed;
    left: 0px;
    top: 0px;
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    z-index: 99999;
    font: 12px Verdana, sans-serif;
    color: black;
    background: rgb(244, 244, 244);
    border-radius: 5px;
    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);
}

.ag-chart-tooltip-no-animation {
    transition: none !important;
}

.ag-chart-tooltip-hidden {
    visibility: hidden;
}

.ag-chart-tooltip-title {
    font-weight: bold;
    padding: 7px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    color: white;
    background-color: #888888;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.ag-chart-tooltip-content {
    padding: 7px;
    line-height: 1.7em;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    overflow: hidden;
}

.ag-chart-tooltip-content:empty {
    padding: 0;
    height: 7px;
}

.ag-chart-tooltip-arrow::before {
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

.ag-chart-tooltip-arrow::after {
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
function toTooltipHtml(input, defaults) {
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults || {};
    const { content = defaults.content || '', title = defaults.title || undefined, color = defaults.color || 'white', backgroundColor = defaults.backgroundColor || '#888', } = input;
    const titleHtml = title
        ? `<div class="${exports.DEFAULT_TOOLTIP_CLASS}-title"
        style="color: ${color}; background-color: ${backgroundColor}">${title}</div>`
        : '';
    return `${titleHtml}<div class="${exports.DEFAULT_TOOLTIP_CLASS}-content">${content}</div>`;
}
exports.toTooltipHtml = toTooltipHtml;
class Tooltip {
    constructor(canvasElement, document, container) {
        this.enabled = true;
        this.class = undefined;
        this.lastClass = undefined;
        this.delay = 0;
        /**
         * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
         * Only has effect on series with markers.
         */
        this.tracking = true;
        this.showTimeout = 0;
        this.constrained = false;
        const tooltipRoot = document.body;
        const element = document.createElement('div');
        this.element = tooltipRoot.appendChild(element);
        this.element.classList.add(exports.DEFAULT_TOOLTIP_CLASS);
        this.container = container;
        this.observedElement = canvasElement;
        // Detect when the chart becomes invisible and hide the tooltip as well.
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target === this.observedElement() && entry.intersectionRatio === 0) {
                        this.toggle(false);
                    }
                }
            }, { root: tooltipRoot });
            observer.observe(this.observedElement());
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
            this.observer.unobserve(this.observedElement());
        }
    }
    isVisible() {
        const { element } = this;
        return !element.classList.contains(exports.DEFAULT_TOOLTIP_CLASS + '-hidden');
    }
    updateClass(visible, constrained) {
        const { element, class: newClass, lastClass } = this;
        const wasVisible = !element.classList.contains(`${exports.DEFAULT_TOOLTIP_CLASS}-hidden`);
        const toggleClass = (name, include) => {
            const className = `${exports.DEFAULT_TOOLTIP_CLASS}-${name}`;
            if (include) {
                element.classList.add(className);
            }
            else {
                element.classList.remove(className);
            }
        };
        toggleClass('no-animation', !wasVisible && !!visible); // No animation on first show.
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
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta, html, instantly = false) {
        const el = this.element;
        if (html !== undefined) {
            el.innerHTML = html;
        }
        else if (!el.innerHTML) {
            return;
        }
        let left = meta.pageX - el.clientWidth / 2;
        let top = meta.pageY - el.clientHeight - 8;
        this.constrained = false;
        if (this.container()) {
            const tooltipWidth = el.getBoundingClientRect().width;
            const minLeft = 0;
            const maxLeft = window.innerWidth - tooltipWidth - 1;
            if (left < minLeft) {
                left = minLeft;
                this.constrained = true;
            }
            else if (left > maxLeft) {
                left = maxLeft;
                this.constrained = true;
            }
            if (top < window.scrollY) {
                top = meta.pageY + 20;
                this.constrained = true;
            }
        }
        el.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
        if (this.delay > 0 && !instantly) {
            this.toggle(false);
            this.showTimeout = window.setTimeout(() => {
                this.toggle(true);
            }, this.delay);
            return;
        }
        this.toggle(true);
    }
    toggle(visible) {
        if (!visible) {
            window.clearTimeout(this.showTimeout);
        }
        this.updateClass(visible, this.constrained);
    }
}
Tooltip.tooltipDocuments = [];
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Tooltip.prototype, "enabled", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], Tooltip.prototype, "class", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], Tooltip.prototype, "delay", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Tooltip.prototype, "tracking", void 0);
exports.Tooltip = Tooltip;
