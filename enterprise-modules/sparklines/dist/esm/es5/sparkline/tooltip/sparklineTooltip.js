var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Color } from '../../util/color';
import { Observable } from '../../util/observable';
export function toTooltipHtml(input, defaults) {
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
    if (backgroundColor) {
        var bgColor = Color.fromString(backgroundColor.toLowerCase());
        var r = bgColor.r, g = bgColor.g, b = bgColor.b, a = bgColor.a;
        // TODO: combine a and opacity for alpha?
        var alpha = opacity;
        var bgColorWithAlpha = Color.fromArray([r, g, b, alpha]);
        var bgColorRgbaString = bgColorWithAlpha.toRgbaString();
        return "<div class=\"" + SparklineTooltip.class + "\" style=\"background-color: " + bgColorRgbaString + "\">\n                    " + titleHtml + "\n                    " + contentHtml + "\n                </div>";
    }
    else {
        return "<div class=\"" + SparklineTooltip.class + "\">\n                    " + titleHtml + "\n                    " + contentHtml + "\n                </div>";
    }
}
var SparklineTooltip = /** @class */ (function (_super) {
    __extends(SparklineTooltip, _super);
    function SparklineTooltip() {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.enabled = true;
        _this.container = undefined;
        _this.xOffset = 10;
        _this.yOffset = 0;
        _this.renderer = undefined;
        var tooltipRoot = document.body;
        tooltipRoot.appendChild(_this.element);
        return _this;
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
}(Observable));
export { SparklineTooltip };
