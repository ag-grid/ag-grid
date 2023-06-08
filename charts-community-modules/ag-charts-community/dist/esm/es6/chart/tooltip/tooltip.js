var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BBox } from '../../scene/bbox';
import { DeprecatedAndRenamedTo } from '../../util/deprecation';
import { Validate, BOOLEAN, NUMBER, OPT_STRING, INTERACTION_RANGE, predicateWithMessage, OPT_BOOLEAN, } from '../../util/validation';
const DEFAULT_TOOLTIP_CLASS = 'ag-chart-tooltip';
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

.${DEFAULT_TOOLTIP_CLASS}-arrow:empty::before,
.${DEFAULT_TOOLTIP_CLASS}-arrow:empty::after {
    visibility: hidden;
}

.ag-chart-wrapper {
    box-sizing: border-box;
    overflow: hidden;
}
`;
export function toTooltipHtml(input, defaults) {
    var _a, _b, _c, _d;
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults !== null && defaults !== void 0 ? defaults : {};
    const { content = (_a = defaults.content) !== null && _a !== void 0 ? _a : '', title = (_b = defaults.title) !== null && _b !== void 0 ? _b : undefined, color = (_c = defaults.color) !== null && _c !== void 0 ? _c : 'white', backgroundColor = (_d = defaults.backgroundColor) !== null && _d !== void 0 ? _d : '#888', } = input;
    const titleHtml = title
        ? `<div class="${DEFAULT_TOOLTIP_CLASS}-title"
        style="color: ${color}; background-color: ${backgroundColor}">${title}</div>`
        : '';
    return `${titleHtml}<div class="${DEFAULT_TOOLTIP_CLASS}-content">${content}</div>`;
}
const POSITION_TYPES = ['pointer', 'node'];
const POSITION_TYPE = predicateWithMessage((v) => POSITION_TYPES.includes(v), `expecting a position type keyword such as 'pointer' or 'node'`);
export class TooltipPosition {
    constructor() {
        /** The type of positioning for the tooltip. By default, the tooltip follows the pointer. */
        this.type = 'pointer';
        /** The horizontal offset in pixels for the position of the tooltip. */
        this.xOffset = 0;
        /** The vertical offset in pixels for the position of the tooltip. */
        this.yOffset = 0;
    }
}
__decorate([
    Validate(POSITION_TYPE)
], TooltipPosition.prototype, "type", void 0);
__decorate([
    Validate(NUMBER())
], TooltipPosition.prototype, "xOffset", void 0);
__decorate([
    Validate(NUMBER())
], TooltipPosition.prototype, "yOffset", void 0);
export class Tooltip {
    constructor(canvasElement, document, container) {
        this.enableInteraction = false;
        this.enabled = true;
        this.showArrow = undefined;
        this.class = undefined;
        this.lastClass = undefined;
        this.delay = 0;
        this.range = 'nearest';
        this.position = new TooltipPosition();
        this.showTimeout = 0;
        this._showArrow = true;
        this.tooltipRoot = container;
        const element = document.createElement('div');
        this.element = this.tooltipRoot.appendChild(element);
        this.element.classList.add(DEFAULT_TOOLTIP_CLASS);
        this.canvasElement = canvasElement;
        // Detect when the chart becomes invisible and hide the tooltip as well.
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target === this.canvasElement && entry.intersectionRatio === 0) {
                        this.toggle(false);
                    }
                }
            }, { root: this.tooltipRoot });
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
    isVisible() {
        const { element } = this;
        return !element.classList.contains(DEFAULT_TOOLTIP_CLASS + '-hidden');
    }
    updateClass(visible, showArrow) {
        const { element, class: newClass, lastClass, enableInteraction } = this;
        const wasVisible = this.isVisible();
        const toggleClass = (name, include) => {
            const className = `${DEFAULT_TOOLTIP_CLASS}-${name}`;
            if (include) {
                element.classList.add(className);
            }
            else {
                element.classList.remove(className);
            }
        };
        toggleClass('no-animation', !wasVisible && !!visible); // No animation on first show.
        toggleClass('no-interaction', !enableInteraction); // Prevent interaction.
        toggleClass('hidden', !visible); // Hide if not visible.
        toggleClass('arrow', !!showArrow); // Add arrow if tooltip is constrained.
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
        var _a, _b, _c, _d, _e, _f, _g;
        const { element, canvasElement } = this;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            this.toggle(false);
            return;
        }
        const limit = (low, actual, high) => {
            return Math.max(Math.min(actual, high), low);
        };
        const xOffset = (_b = (_a = meta.position) === null || _a === void 0 ? void 0 : _a.xOffset) !== null && _b !== void 0 ? _b : 0;
        const yOffset = (_d = (_c = meta.position) === null || _c === void 0 ? void 0 : _c.yOffset) !== null && _d !== void 0 ? _d : 0;
        const canvasRect = canvasElement.getBoundingClientRect();
        const naiveLeft = canvasRect.left + meta.offsetX - element.clientWidth / 2 + xOffset;
        const naiveTop = canvasRect.top + meta.offsetY - element.clientHeight - 8 + yOffset;
        const windowBounds = this.getWindowBoundingBox();
        const maxLeft = windowBounds.x + windowBounds.width - element.clientWidth - 1;
        const maxTop = windowBounds.y + windowBounds.height - element.clientHeight;
        const left = limit(windowBounds.x, naiveLeft, maxLeft);
        const top = limit(windowBounds.y, naiveTop, maxTop);
        const constrained = left !== naiveLeft || top !== naiveTop;
        const defaultShowArrow = !constrained && !xOffset && !yOffset;
        const showArrow = (_f = (_e = meta.showArrow) !== null && _e !== void 0 ? _e : this.showArrow) !== null && _f !== void 0 ? _f : defaultShowArrow;
        this.updateShowArrow(showArrow);
        element.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
        this.enableInteraction = (_g = meta.enableInteraction) !== null && _g !== void 0 ? _g : false;
        if (this.delay > 0 && !instantly) {
            this.toggle(false);
            this.showTimeout = window.setTimeout(() => {
                this.toggle(true);
            }, this.delay);
            return;
        }
        this.toggle(true);
    }
    getWindowBoundingBox() {
        return new BBox(0, 0, window.innerWidth, window.innerHeight);
    }
    toggle(visible) {
        if (!visible) {
            window.clearTimeout(this.showTimeout);
        }
        this.updateClass(visible, this._showArrow);
    }
    pointerLeftOntoTooltip(event) {
        var _a;
        if (!this.enableInteraction)
            return false;
        const classList = (_a = event.sourceEvent.relatedTarget) === null || _a === void 0 ? void 0 : _a.classList;
        const classes = ['', '-title', '-content'];
        const classListContains = Boolean(classes.filter((c) => classList === null || classList === void 0 ? void 0 : classList.contains(`${DEFAULT_TOOLTIP_CLASS}${c}`)));
        return classList !== undefined && classListContains;
    }
    updateShowArrow(show) {
        this._showArrow = show;
    }
}
Tooltip.tooltipDocuments = [];
__decorate([
    Validate(BOOLEAN)
], Tooltip.prototype, "enabled", void 0);
__decorate([
    Validate(OPT_BOOLEAN)
], Tooltip.prototype, "showArrow", void 0);
__decorate([
    Validate(OPT_STRING)
], Tooltip.prototype, "class", void 0);
__decorate([
    Validate(NUMBER(0))
], Tooltip.prototype, "delay", void 0);
__decorate([
    DeprecatedAndRenamedTo('range', (value) => (value ? 'nearest' : 'exact'))
], Tooltip.prototype, "tracking", void 0);
__decorate([
    Validate(INTERACTION_RANGE)
], Tooltip.prototype, "range", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC90b29sdGlwL3Rvb2x0aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hFLE9BQU8sRUFDSCxRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTixVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUNwQixXQUFXLEdBQ2QsTUFBTSx1QkFBdUIsQ0FBQztBQUkvQixNQUFNLHFCQUFxQixHQUFHLGtCQUFrQixDQUFDO0FBRWpELE1BQU0saUJBQWlCLEdBQUc7R0FDdkIscUJBQXFCOzs7Ozs7Ozs7Ozs7Ozs7R0FlckIscUJBQXFCOzs7OztHQUtyQixxQkFBcUI7Ozs7R0FJckIscUJBQXFCOzs7O0dBSXJCLHFCQUFxQjs7Ozs7Ozs7Ozs7R0FXckIscUJBQXFCOzs7Ozs7OztHQVFyQixxQkFBcUI7Ozs7O0dBS3JCLHFCQUFxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJyQixxQkFBcUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCckIscUJBQXFCO0dBQ3JCLHFCQUFxQjs7Ozs7Ozs7Q0FRdkIsQ0FBQztBQWdCRixNQUFNLFVBQVUsYUFBYSxDQUFDLEtBQXVDLEVBQUUsUUFBa0M7O0lBQ3JHLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzNCLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsUUFBUSxHQUFHLFFBQVEsYUFBUixRQUFRLGNBQVIsUUFBUSxHQUFJLEVBQUUsQ0FBQztJQUUxQixNQUFNLEVBQ0YsT0FBTyxHQUFHLE1BQUEsUUFBUSxDQUFDLE9BQU8sbUNBQUksRUFBRSxFQUNoQyxLQUFLLEdBQUcsTUFBQSxRQUFRLENBQUMsS0FBSyxtQ0FBSSxT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