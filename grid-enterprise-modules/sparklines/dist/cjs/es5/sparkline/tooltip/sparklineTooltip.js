"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparklineTooltip = exports.toTooltipHtml = void 0;
function toTooltipHtml(input, defaults) {
    var _a, _b, _c;
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults !== null && defaults !== void 0 ? defaults : {};
    var _d = input.content, content = _d === void 0 ? (_a = defaults.content) !== null && _a !== void 0 ? _a : '' : _d, _e = input.title, title = _e === void 0 ? (_b = defaults.title) !== null && _b !== void 0 ? _b : undefined : _e, _f = input.color, color = _f === void 0 ? defaults.color : _f, _g = input.backgroundColor, backgroundColor = _g === void 0 ? defaults.backgroundColor : _g, _h = input.opacity, opacity = _h === void 0 ? (_c = defaults.opacity) !== null && _c !== void 0 ? _c : 1 : _h;
    var titleHtml;
    var contentHtml;
    if (color) {
        titleHtml = title
            ? "<span class=\"".concat(SparklineTooltip.class, "-title\"; style=\"color: ").concat(color, "\">").concat(title, "</span>")
            : '';
        contentHtml = "<span class=\"".concat(SparklineTooltip.class, "-content\" style=\"color: ").concat(color, "\">").concat(content, "</span>");
    }
    else {
        titleHtml = title ? "<span class=\"".concat(SparklineTooltip.class, "-title\">").concat(title, "</span>") : '';
        contentHtml = "<span class=\"".concat(SparklineTooltip.class, "-content\">").concat(content, "</span>");
    }
    var style = "opacity: ".concat(opacity);
    if (backgroundColor) {
        style += "; background-color: ".concat(backgroundColor.toLowerCase());
    }
    return "<div class=\"".concat(SparklineTooltip.class, "\" style=\"").concat(style, "\">\n                ").concat(titleHtml, "\n                ").concat(contentHtml, "\n            </div>");
}
exports.toTooltipHtml = toTooltipHtml;
var SparklineTooltip = /** @class */ (function () {
    function SparklineTooltip() {
        this.element = document.createElement('div');
        var tooltipRoot = document.body;
        tooltipRoot.appendChild(this.element);
    }
    SparklineTooltip.prototype.isVisible = function () {
        var element = this.element;
        if (element.classList) {
            return !element.classList.contains("".concat(SparklineTooltip.class, "-wrapper-hidden"));
        }
        // IE11
        var classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf("".concat(SparklineTooltip.class, "-wrapper-hidden")) < 0;
        }
        return false;
    };
    SparklineTooltip.prototype.updateClass = function (visible) {
        var classList = ["".concat(SparklineTooltip.class, "-wrapper")];
        if (visible !== true) {
            classList.push("".concat(SparklineTooltip.class, "-wrapper-hidden"));
        }
        this.element.setAttribute('class', classList.join(' '));
    };
    SparklineTooltip.prototype.show = function (meta, html) {
        var _a, _b, _c, _d;
        this.toggle(false);
        var element = this.element;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            return;
        }
        var xOffset = (_b = (_a = meta.position) === null || _a === void 0 ? void 0 : _a.xOffset) !== null && _b !== void 0 ? _b : 10;
        var yOffset = (_d = (_c = meta.position) === null || _c === void 0 ? void 0 : _c.yOffset) !== null && _d !== void 0 ? _d : 0;
        var left = meta.pageX + xOffset;
        var top = meta.pageY + yOffset;
        var tooltipRect = element.getBoundingClientRect();
        var maxLeft = window.innerWidth - tooltipRect.width;
        if (meta.container) {
            var containerRect = meta.container.getBoundingClientRect();
            maxLeft = containerRect.left + (containerRect.width - tooltipRect.width);
        }
        if (left > maxLeft) {
            left = meta.pageX - element.clientWidth - xOffset;
        }
        if (typeof scrollX !== 'undefined') {
            left += scrollX;
        }
        if (typeof scrollY !== 'undefined') {
            top += scrollY;
        }
        element.style.left = "".concat(Math.round(left), "px");
        element.style.top = "".concat(Math.round(top), "px");
        this.toggle(true);
    };
    SparklineTooltip.prototype.toggle = function (visible) {
        this.updateClass(visible);
    };
    SparklineTooltip.prototype.destroy = function () {
        var parentNode = this.element.parentNode;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }
    };
    SparklineTooltip.class = 'ag-sparkline-tooltip';
    return SparklineTooltip;
}());
exports.SparklineTooltip = SparklineTooltip;
