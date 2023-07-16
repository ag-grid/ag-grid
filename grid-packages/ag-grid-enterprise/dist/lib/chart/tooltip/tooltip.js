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
exports.Tooltip = exports.TooltipPosition = exports.toTooltipHtml = void 0;
var bbox_1 = require("../../scene/bbox");
var deprecation_1 = require("../../util/deprecation");
var validation_1 = require("../../util/validation");
var DEFAULT_TOOLTIP_CLASS = 'ag-chart-tooltip';
var defaultTooltipCss = "\n." + DEFAULT_TOOLTIP_CLASS + " {\n    transition: transform 0.1s ease;\n    display: table;\n    position: fixed;\n    left: 0px;\n    top: 0px;\n    white-space: nowrap;\n    z-index: 99999;\n    font: 12px Verdana, sans-serif;\n    color: black;\n    background: rgb(244, 244, 244);\n    border-radius: 5px;\n    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);\n}\n\n." + DEFAULT_TOOLTIP_CLASS + "-no-interaction {\n    pointer-events: none;\n    user-select: none;\n}\n\n." + DEFAULT_TOOLTIP_CLASS + "-no-animation {\n    transition: none !important;\n}\n\n." + DEFAULT_TOOLTIP_CLASS + "-hidden {\n    visibility: hidden;\n}\n\n." + DEFAULT_TOOLTIP_CLASS + "-title {\n    font-weight: bold;\n    padding: 7px;\n    border-top-left-radius: 5px;\n    border-top-right-radius: 5px;\n    color: white;\n    background-color: #888888;\n    border-top-left-radius: 5px;\n    border-top-right-radius: 5px;\n}\n\n." + DEFAULT_TOOLTIP_CLASS + "-content {\n    padding: 7px;\n    line-height: 1.7em;\n    border-bottom-left-radius: 5px;\n    border-bottom-right-radius: 5px;\n    overflow: hidden;\n}\n\n." + DEFAULT_TOOLTIP_CLASS + "-content:empty {\n    padding: 0;\n    height: 7px;\n}\n\n." + DEFAULT_TOOLTIP_CLASS + "-arrow::before {\n    content: \"\";\n\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    transform: translateX(-50%);\n\n    border: 6px solid #989898;\n\n    border-left-color: transparent;\n    border-right-color: transparent;\n    border-top-color: #989898;\n    border-bottom-color: transparent;\n\n    width: 0;\n    height: 0;\n\n    margin: 0 auto;\n}\n\n." + DEFAULT_TOOLTIP_CLASS + "-arrow::after {\n    content: \"\";\n\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    transform: translateX(-50%);\n\n    border: 5px solid black;\n\n    border-left-color: transparent;\n    border-right-color: transparent;\n    border-top-color: rgb(244, 244, 244);\n    border-bottom-color: transparent;\n\n    width: 0;\n    height: 0;\n\n    margin: 0 auto;\n}\n\n.ag-chart-wrapper {\n    box-sizing: border-box;\n    overflow: hidden;\n}\n";
function toTooltipHtml(input, defaults) {
    var _a, _b, _c, _d;
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults !== null && defaults !== void 0 ? defaults : {};
    var _e = input.content, content = _e === void 0 ? (_a = defaults.content) !== null && _a !== void 0 ? _a : '' : _e, _f = input.title, title = _f === void 0 ? (_b = defaults.title) !== null && _b !== void 0 ? _b : undefined : _f, _g = input.color, color = _g === void 0 ? (_c = defaults.color) !== null && _c !== void 0 ? _c : 'white' : _g, _h = input.backgroundColor, backgroundColor = _h === void 0 ? (_d = defaults.backgroundColor) !== null && _d !== void 0 ? _d : '#888' : _h;
    var titleHtml = title
        ? "<div class=\"" + DEFAULT_TOOLTIP_CLASS + "-title\"\n        style=\"color: " + color + "; background-color: " + backgroundColor + "\">" + title + "</div>"
        : '';
    return titleHtml + "<div class=\"" + DEFAULT_TOOLTIP_CLASS + "-content\">" + content + "</div>";
}
exports.toTooltipHtml = toTooltipHtml;
var POSITION_TYPES = ['pointer', 'node'];
var POSITION_TYPE = validation_1.predicateWithMessage(function (v) { return POSITION_TYPES.includes(v); }, "expecting a position type keyword such as 'pointer' or 'node'");
var TooltipPosition = /** @class */ (function () {
    function TooltipPosition() {
        /** The type of positioning for the tooltip. By default, the tooltip follows the pointer. */
        this.type = 'pointer';
        /** The horizontal offset in pixels for the position of the tooltip. */
        this.xOffset = 0;
        /** The vertical offset in pixels for the position of the tooltip. */
        this.yOffset = 0;
    }
    __decorate([
        validation_1.Validate(POSITION_TYPE)
    ], TooltipPosition.prototype, "type", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER())
    ], TooltipPosition.prototype, "xOffset", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER())
    ], TooltipPosition.prototype, "yOffset", void 0);
    return TooltipPosition;
}());
exports.TooltipPosition = TooltipPosition;
var Tooltip = /** @class */ (function () {
    function Tooltip(canvasElement, document, container) {
        var _this = this;
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
        var element = document.createElement('div');
        this.element = this.tooltipRoot.appendChild(element);
        this.element.classList.add(DEFAULT_TOOLTIP_CLASS);
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
        return !element.classList.contains(DEFAULT_TOOLTIP_CLASS + '-hidden');
    };
    Tooltip.prototype.updateClass = function (visible, showArrow) {
        var _a = this, element = _a.element, newClass = _a.class, lastClass = _a.lastClass, enableInteraction = _a.enableInteraction;
        var wasVisible = this.isVisible();
        var toggleClass = function (name, include) {
            var className = DEFAULT_TOOLTIP_CLASS + "-" + name;
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
    };
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    Tooltip.prototype.show = function (meta, html, instantly) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        if (instantly === void 0) { instantly = false; }
        var _h = this, element = _h.element, canvasElement = _h.canvasElement;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            this.toggle(false);
            return;
        }
        var limit = function (low, actual, high) {
            return Math.max(Math.min(actual, high), low);
        };
        var xOffset = (_b = (_a = meta.position) === null || _a === void 0 ? void 0 : _a.xOffset) !== null && _b !== void 0 ? _b : 0;
        var yOffset = (_d = (_c = meta.position) === null || _c === void 0 ? void 0 : _c.yOffset) !== null && _d !== void 0 ? _d : 0;
        var canvasRect = canvasElement.getBoundingClientRect();
        var naiveLeft = canvasRect.left + meta.offsetX - element.clientWidth / 2 + xOffset;
        var naiveTop = canvasRect.top + meta.offsetY - element.clientHeight - 8 + yOffset;
        var windowBounds = this.getWindowBoundingBox();
        var maxLeft = windowBounds.x + windowBounds.width - element.clientWidth - 1;
        var maxTop = windowBounds.y + windowBounds.height - element.clientHeight;
        var left = limit(windowBounds.x, naiveLeft, maxLeft);
        var top = limit(windowBounds.y, naiveTop, maxTop);
        var constrained = left !== naiveLeft || top !== naiveTop;
        var defaultShowArrow = !constrained && !xOffset && !yOffset;
        var showArrow = (_f = (_e = meta.showArrow) !== null && _e !== void 0 ? _e : this.showArrow) !== null && _f !== void 0 ? _f : defaultShowArrow;
        this.updateShowArrow(showArrow);
        element.style.transform = "translate(" + Math.round(left) + "px, " + Math.round(top) + "px)";
        this.enableInteraction = (_g = meta.enableInteraction) !== null && _g !== void 0 ? _g : false;
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
        this.updateClass(visible, this._showArrow);
    };
    Tooltip.prototype.pointerLeftOntoTooltip = function (event) {
        var _a;
        if (!this.enableInteraction)
            return false;
        var classList = (_a = event.sourceEvent.relatedTarget) === null || _a === void 0 ? void 0 : _a.classList;
        var classes = ['', '-title', '-content'];
        var classListContains = Boolean(classes.filter(function (c) { return classList === null || classList === void 0 ? void 0 : classList.contains("" + DEFAULT_TOOLTIP_CLASS + c); }));
        return classList !== undefined && classListContains;
    };
    Tooltip.prototype.updateShowArrow = function (show) {
        this._showArrow = show;
    };
    Tooltip.tooltipDocuments = [];
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], Tooltip.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], Tooltip.prototype, "showArrow", void 0);
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