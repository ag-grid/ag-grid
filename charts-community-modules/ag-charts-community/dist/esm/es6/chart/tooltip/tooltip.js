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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC90b29sdGlwL3Rvb2x0aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hFLE9BQU8sRUFDSCxRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTixVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUNwQixXQUFXLEdBQ2QsTUFBTSx1QkFBdUIsQ0FBQztBQUkvQixNQUFNLHFCQUFxQixHQUFHLGtCQUFrQixDQUFDO0FBRWpELE1BQU0saUJBQWlCLEdBQUc7R0FDdkIscUJBQXFCOzs7Ozs7Ozs7Ozs7Ozs7R0FlckIscUJBQXFCOzs7OztHQUtyQixxQkFBcUI7Ozs7R0FJckIscUJBQXFCOzs7O0dBSXJCLHFCQUFxQjs7Ozs7Ozs7Ozs7R0FXckIscUJBQXFCOzs7Ozs7OztHQVFyQixxQkFBcUI7Ozs7O0dBS3JCLHFCQUFxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJyQixxQkFBcUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F5QnZCLENBQUM7QUFnQkYsTUFBTSxVQUFVLGFBQWEsQ0FBQyxLQUF1QyxFQUFFLFFBQWtDOztJQUNyRyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUMzQixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELFFBQVEsR0FBRyxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBSSxFQUFFLENBQUM7SUFFMUIsTUFBTSxFQUNGLE9BQU8sR0FBRyxNQUFBLFFBQVEsQ0FBQyxPQUFPLG1DQUFJLEVBQUUsRUFDaEMsS0FBSyxHQUFHLE1BQUEsUUFBUSxDQUFDLEtBQUssbUNBQUksU0FBUyxFQUNuQyxLQUFLLEdBQUcsTUFBQSxRQUFR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