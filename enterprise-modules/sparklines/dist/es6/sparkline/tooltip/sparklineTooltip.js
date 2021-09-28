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
import { Color } from "../../util/color";
import { Observable } from "../../util/observable";
export function toTooltipHtml(input, defaults) {
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults || {};
    var _a = input.content, content = _a === void 0 ? defaults.content || '' : _a, _b = input.title, title = _b === void 0 ? defaults.title || undefined : _b, _c = input.color, color = _c === void 0 ? defaults.color || 'black' : _c, _d = input.backgroundColor, backgroundColor = _d === void 0 ? defaults.backgroundColor || 'rgb(136, 136, 136)' : _d, _e = input.opacity, opacity = _e === void 0 ? defaults.opacity || 0.2 : _e;
    var titleBgColor = Color.fromString(backgroundColor.toLowerCase());
    var r = titleBgColor.r, g = titleBgColor.g, b = titleBgColor.b, a = titleBgColor.a;
    // TODO: combine a and opacity for alpha?
    var alpha = opacity;
    var titleBgColorWithAlpha = Color.fromArray([r, g, b, alpha]);
    var titleBgColorRgbaString = titleBgColorWithAlpha.toRgbaString();
    var contentBgColor = "rgba(244, 244, 244, " + opacity + ")";
    var titleHtml = title ? "<div class=\"" + SparklineTooltip.class + "-title\";\n    style=\"color: " + color + "; background-color: " + titleBgColorRgbaString + "\">" + title + "</div>" : '';
    return titleHtml + "<div class=\"" + SparklineTooltip.class + "-content\" style=\"background-color: " + contentBgColor + "\">" + content + "</div>";
}
var SparklineTooltip = /** @class */ (function (_super) {
    __extends(SparklineTooltip, _super);
    function SparklineTooltip() {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.enabled = true;
        _this.container = undefined;
        _this.renderer = undefined;
        _this.constrained = false;
        var tooltipRoot = document.body;
        tooltipRoot.appendChild(_this.element);
        return _this;
    }
    SparklineTooltip.prototype.isVisible = function () {
        var element = this.element;
        if (element.classList) {
            return !element.classList.contains(SparklineTooltip.class + "-hidden");
        }
        // IE11
        var classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(SparklineTooltip.class + "-hidden") < 0;
        }
        return false;
    };
    SparklineTooltip.prototype.updateClass = function (visible, constrained) {
        var classList = [SparklineTooltip.class];
        if (visible !== true) {
            classList.push(SparklineTooltip.class + "-hidden");
        }
        if (constrained !== true) {
            classList.push(SparklineTooltip.class + "-arrow");
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
        var left = meta.pageX - element.clientWidth / 2;
        var top = meta.pageY - element.clientHeight - 6;
        this.constrained = false;
        var tooltipRect = element.getBoundingClientRect();
        var minLeft = 0;
        var maxLeft = window.innerWidth - tooltipRect.width;
        var minTop = window.pageYOffset;
        if (this.container) {
            var containerRect = this.container.getBoundingClientRect();
            minLeft = containerRect.left;
            maxLeft = containerRect.width - tooltipRect.width;
            minTop = containerRect.top < 0 ? window.pageYOffset : containerRect.top;
        }
        if (left < minLeft) {
            left = minLeft;
            this.updateClass(true, this.constrained = true);
        }
        else if (left > maxLeft) {
            left = maxLeft;
            this.updateClass(true, this.constrained = true);
        }
        if (top < minTop) {
            top = minTop;
            this.updateClass(true, this.constrained = true);
        }
        element.style.left = Math.round(left) + "px";
        element.style.top = Math.round(top) + "px";
        this.toggle(true);
    };
    SparklineTooltip.prototype.toggle = function (visible) {
        this.updateClass(visible, this.constrained);
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
