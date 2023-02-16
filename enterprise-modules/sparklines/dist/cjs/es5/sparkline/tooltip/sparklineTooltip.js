"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparklineTooltip = exports.toTooltipHtml = void 0;
function toTooltipHtml(input, defaults) {
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults || {};
    var _a = input.content, content = _a === void 0 ? defaults.content || '' : _a, _b = input.title, title = _b === void 0 ? defaults.title || undefined : _b, _c = input.color, color = _c === void 0 ? defaults.color : _c, _d = input.backgroundColor, backgroundColor = _d === void 0 ? defaults.backgroundColor : _d, _e = input.opacity, opacity = _e === void 0 ? defaults.opacity || 1 : _e;
    var titleHtml;
    var contentHtml;
    if (color) {
        titleHtml = title
            ? "<span class=\"" + SparklineTooltip.class + "-title\"; style=\"color: " + color + "\">" + title + "</span>"
            : '';
        contentHtml = "<span class=\"" + SparklineTooltip.class + "-content\" style=\"color: " + color + "\">" + content + "</span>";
    }
    else {
        titleHtml = title ? "<span class=\"" + SparklineTooltip.class + "-title\">" + title + "</span>" : '';
        contentHtml = "<span class=\"" + SparklineTooltip.class + "-content\">" + content + "</span>";
    }
    var style = "opacity: " + opacity;
    if (backgroundColor) {
        style += "; background-color: " + backgroundColor.toLowerCase();
    }
    return "<div class=\"" + SparklineTooltip.class + "\" style=\"" + style + "\">\n                " + titleHtml + "\n                " + contentHtml + "\n            </div>";
}
exports.toTooltipHtml = toTooltipHtml;
var SparklineTooltip = /** @class */ (function () {
    function SparklineTooltip() {
        this.element = document.createElement('div');
        this.enabled = true;
        this.container = undefined;
        this.xOffset = 10;
        this.yOffset = 0;
        this.renderer = undefined;
        var tooltipRoot = document.body;
        tooltipRoot.appendChild(this.element);
    }
    SparklineTooltip.prototype.isVisible = function () {
        var element = this.element;
        if (element.classList) {
            return !element.classList.contains(SparklineTooltip.class + "-wrapper-hidden");
        }
        // IE11
        var classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(SparklineTooltip.class + "-wrapper-hidden") < 0;
        }
        return false;
    };
    SparklineTooltip.prototype.updateClass = function (visible) {
        var classList = [SparklineTooltip.class + "-wrapper"];
        if (visible !== true) {
            classList.push(SparklineTooltip.class + "-wrapper-hidden");
        }
        this.element.setAttribute('class', classList.join(' '));
    };
    SparklineTooltip.prototype.show = function (meta, html) {
        this.toggle(false);
        var element = this.element;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            return;
        }
        var left = meta.pageX + this.xOffset;
        var top = meta.pageY + this.yOffset;
        var tooltipRect = element.getBoundingClientRect();
        var maxLeft = window.innerWidth - tooltipRect.width;
        if (this.container) {
            var containerRect = this.container.getBoundingClientRect();
            maxLeft = containerRect.left + (containerRect.width - tooltipRect.width);
        }
        if (left > maxLeft) {
            left = meta.pageX - element.clientWidth - this.xOffset;
        }
        if (typeof scrollX !== 'undefined') {
            left += scrollX;
        }
        if (typeof scrollY !== 'undefined') {
            top += scrollY;
        }
        element.style.left = Math.round(left) + "px";
        element.style.top = Math.round(top) + "px";
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
