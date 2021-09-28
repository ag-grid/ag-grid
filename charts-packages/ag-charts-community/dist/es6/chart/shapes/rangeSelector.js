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
import { Group } from "../../scene/group";
import { RangeHandle } from "./rangeHandle";
import { RangeMask } from "./rangeMask";
var RangeSelector = /** @class */ (function (_super) {
    __extends(RangeSelector, _super);
    function RangeSelector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isContainerNode = true;
        _this.minHandle = new RangeHandle();
        _this.maxHandle = new RangeHandle();
        _this.mask = (function () {
            var _a = RangeSelector.defaults, x = _a.x, y = _a.y, width = _a.width, height = _a.height, min = _a.min, max = _a.max;
            var mask = new RangeMask();
            mask.x = x;
            mask.y = y;
            mask.width = width;
            mask.height = height;
            mask.min = min;
            mask.max = max;
            var _b = _this, minHandle = _b.minHandle, maxHandle = _b.maxHandle;
            minHandle.centerX = x;
            maxHandle.centerX = x + width;
            minHandle.centerY = maxHandle.centerY = y + height / 2;
            _this.append([mask, minHandle, maxHandle]);
            mask.onRangeChange = function (min, max) {
                _this.updateHandles();
                _this.onRangeChange && _this.onRangeChange(min, max);
            };
            return mask;
        })();
        _this._x = RangeSelector.defaults.x;
        _this._y = RangeSelector.defaults.y;
        _this._width = RangeSelector.defaults.width;
        _this._height = RangeSelector.defaults.height;
        _this._min = RangeSelector.defaults.min;
        _this._max = RangeSelector.defaults.max;
        return _this;
    }
    Object.defineProperty(RangeSelector.prototype, "x", {
        get: function () {
            return this.mask.x;
        },
        set: function (value) {
            this.mask.x = value;
            this.updateHandles();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "y", {
        get: function () {
            return this.mask.y;
        },
        set: function (value) {
            this.mask.y = value;
            this.updateHandles();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "width", {
        get: function () {
            return this.mask.width;
        },
        set: function (value) {
            this.mask.width = value;
            this.updateHandles();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "height", {
        get: function () {
            return this.mask.height;
        },
        set: function (value) {
            this.mask.height = value;
            this.updateHandles();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "min", {
        get: function () {
            return this.mask.min;
        },
        set: function (value) {
            this.mask.min = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "max", {
        get: function () {
            return this.mask.max;
        },
        set: function (value) {
            this.mask.max = value;
        },
        enumerable: true,
        configurable: true
    });
    RangeSelector.prototype.updateHandles = function () {
        var _a = this, minHandle = _a.minHandle, maxHandle = _a.maxHandle, x = _a.x, y = _a.y, width = _a.width, height = _a.height, mask = _a.mask;
        minHandle.centerX = x + width * mask.min;
        maxHandle.centerX = x + width * mask.max;
        minHandle.centerY = maxHandle.centerY = y + height / 2;
    };
    RangeSelector.prototype.computeBBox = function () {
        return this.mask.computeBBox();
    };
    RangeSelector.prototype.computeVisibleRangeBBox = function () {
        return this.mask.computeVisibleRangeBBox();
    };
    RangeSelector.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var _a = this, mask = _a.mask, minHandle = _a.minHandle, maxHandle = _a.maxHandle;
        [mask, minHandle, maxHandle].forEach(function (child) {
            ctx.save();
            if (child.visible) {
                child.render(ctx);
            }
            ctx.restore();
        });
    };
    RangeSelector.className = 'Range';
    RangeSelector.defaults = {
        x: 0,
        y: 0,
        width: 200,
        height: 30,
        min: 0,
        max: 1
    };
    return RangeSelector;
}(Group));
export { RangeSelector };
