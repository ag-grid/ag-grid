"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tooltip = exports.toTooltipHtml = exports.DEFAULT_TOOLTIP_CLASS = void 0;
var bbox_1 = require("../../scene/bbox");
var deprecation_1 = require("../../util/deprecation");
var validation_1 = require("../../util/validation");
exports.DEFAULT_TOOLTIP_CLASS = 'ag-chart-tooltip';
var defaultTooltipCss = "\n.ag-chart-tooltip {\n    transition: transform 0.1s ease;\n    display: table;\n    position: fixed;\n    left: 0px;\n    top: 0px;\n    user-select: none;\n    pointer-events: none;\n    white-space: nowrap;\n    z-index: 99999;\n    font: 12px Verdana, sans-serif;\n    color: black;\n    background: rgb(244, 244, 244);\n    border-radius: 5px;\n    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);\n}\n\n.ag-chart-tooltip-no-animation {\n    transition: none !important;\n}\n\n.ag-chart-tooltip-hidden {\n    visibility: hidden;\n}\n\n.ag-chart-tooltip-title {\n    font-weight: bold;\n    padding: 7px;\n    border-top-left-radius: 5px;\n    border-top-right-radius: 5px;\n    color: white;\n    background-color: #888888;\n    border-top-left-radius: 5px;\n    border-top-right-radius: 5px;\n}\n\n.ag-chart-tooltip-content {\n    padding: 7px;\n    line-height: 1.7em;\n    border-bottom-left-radius: 5px;\n    border-bottom-right-radius: 5px;\n    overflow: hidden;\n}\n\n.ag-chart-tooltip-content:empty {\n    padding: 0;\n    height: 7px;\n}\n\n.ag-chart-tooltip-arrow::before {\n    content: \"\";\n\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    transform: translateX(-50%);\n\n    border: 6px solid #989898;\n\n    border-left-color: transparent;\n    border-right-color: transparent;\n    border-top-color: #989898;\n    border-bottom-color: transparent;\n\n    width: 0;\n    height: 0;\n\n    margin: 0 auto;\n}\n\n.ag-chart-tooltip-arrow::after {\n    content: \"\";\n\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    transform: translateX(-50%);\n\n    border: 5px solid black;\n\n    border-left-color: transparent;\n    border-right-color: transparent;\n    border-top-color: rgb(244, 244, 244);\n    border-bottom-color: transparent;\n\n    width: 0;\n    height: 0;\n\n    margin: 0 auto;\n}\n\n.ag-chart-wrapper {\n    box-sizing: border-box;\n    overflow: hidden;\n}\n";
function toTooltipHtml(input, defaults) {
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults || {};
    var _a = input.content, content = _a === void 0 ? defaults.content || '' : _a, _b = input.title, title = _b === void 0 ? defaults.title || undefined : _b, _c = input.color, color = _c === void 0 ? defaults.color || 'white' : _c, _d = input.backgroundColor, backgroundColor = _d === void 0 ? defaults.backgroundColor || '#888' : _d;
    var titleHtml = title
        ? "<div class=\"" + exports.DEFAULT_TOOLTIP_CLASS + "-title\"\n        style=\"color: " + color + "; background-color: " + backgroundColor + "\">" + title + "</div>"
        : '';
    return titleHtml + "<div class=\"" + exports.DEFAULT_TOOLTIP_CLASS + "-content\">" + content + "</div>";
}
exports.toTooltipHtml = toTooltipHtml;
var Tooltip = /** @class */ (function () {
    function Tooltip(canvasElement, document, container) {
        var _this = this;
        this.enabled = true;
        this.class = undefined;
        this.lastClass = undefined;
        this.delay = 0;
        this.range = 'nearest';
        this.showTimeout = 0;
        this.constrained = false;
        this.tooltipRoot = container;
        var element = document.createElement('div');
        this.element = this.tooltipRoot.appendChild(element);
        this.element.classList.add(exports.DEFAULT_TOOLTIP_CLASS);
        this.canvasElement = canvasElement;
        // Detect when the chart becomes invisible and hide the tooltip as well.
        if (window.IntersectionObserver) {
            var observer = new IntersectionObserver(function (entries) {
                var e_1, _a;
                try {
                    for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                        var entry = entries_1_1.value;
                        if (entry.target === _this.canvasElement && entry.intersectionRatio === 0) {
                            _this.toggle(false);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }, { root: this.tooltipRoot });
            observer.observe(this.canvasElement);
            this.observer = observer;
        }
        if (Tooltip.tooltipDocuments.indexOf(document) < 0) {
            var styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            // Make sure the default tooltip style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Tooltip.tooltipDocuments.push(document);
        }
    }
    Tooltip.prototype.destroy = function () {
        var parentNode = this.element.parentNode;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }
        if (this.observer) {
            this.observer.unobserve(this.canvasElement);
        }
    };
    Tooltip.prototype.isVisible = function () {
        var element = this.element;
        return !element.classList.contains(exports.DEFAULT_TOOLTIP_CLASS + '-hidden');
    };
    Tooltip.prototype.updateClass = function (visible, constrained) {
        var _a = this, element = _a.element, newClass = _a.class, lastClass = _a.lastClass;
        var wasVisible = !element.classList.contains(exports.DEFAULT_TOOLTIP_CLASS + "-hidden");
        var toggleClass = function (name, include) {
            var className = exports.DEFAULT_TOOLTIP_CLASS + "-" + name;
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
    };
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    Tooltip.prototype.show = function (meta, html, instantly) {
        var _this = this;
        if (instantly === void 0) { instantly = false; }
        var _a = this, element = _a.element, canvasElement = _a.canvasElement;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            return;
        }
        var limit = function (low, actual, high) {
            return Math.max(Math.min(actual, high), low);
        };
        var canvasRect = canvasElement.getBoundingClientRect();
        var naiveLeft = canvasRect.left + meta.offsetX - element.clientWidth / 2;
        var naiveTop = canvasRect.top + meta.offsetY - element.clientHeight - 8;
        var windowBounds = this.getWindowBoundingBox();
        var maxLeft = windowBounds.x + windowBounds.width - element.clientWidth - 1;
        var maxTop = windowBounds.y + windowBounds.height - element.clientHeight;
        var left = limit(windowBounds.x, naiveLeft, maxLeft);
        var top = limit(windowBounds.y, naiveTop, maxTop);
        this.constrained = left !== naiveLeft || top !== naiveTop;
        element.style.transform = "translate(" + Math.round(left) + "px, " + Math.round(top) + "px)";
        if (this.delay > 0 && !instantly) {
            this.toggle(false);
            this.showTimeout = window.setTimeout(function () {
                _this.toggle(true);
            }, this.delay);
            return;
        }
        this.toggle(true);
    };
    Tooltip.prototype.getWindowBoundingBox = function () {
        return new bbox_1.BBox(0, 0, window.innerWidth, window.innerHeight);
    };
    Tooltip.prototype.toggle = function (visible) {
        if (!visible) {
            window.clearTimeout(this.showTimeout);
        }
        this.updateClass(visible, this.constrained);
    };
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
        deprecation_1.DeprecatedAndRenamedTo('range', function (value) { return (value ? 'nearest' : 'exact'); })
    ], Tooltip.prototype, "tracking", void 0);
    __decorate([
        validation_1.Validate(validation_1.INTERACTION_RANGE)
    ], Tooltip.prototype, "range", void 0);
    return Tooltip;
}());
exports.Tooltip = Tooltip;
//# sourceMappingURL=tooltip.js.map