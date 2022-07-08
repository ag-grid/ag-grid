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
import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";
var RangeMask = /** @class */ (function (_super) {
    __extends(RangeMask, _super);
    function RangeMask() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._stroke = '#999999';
        _this._strokeWidth = 1;
        _this._fill = '#999999';
        _this._fillOpacity = 0.2;
        _this._lineCap = 'square';
        _this._x = 0;
        _this._y = 0;
        _this._width = 200;
        _this._height = 30;
        _this.minRange = 0.05;
        _this._min = 0;
        _this._max = 1;
        return _this;
    }
    Object.defineProperty(RangeMask.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "min", {
        get: function () {
            return this._min;
        },
        set: function (value) {
            value = Math.min(Math.max(value, 0), this.max - this.minRange);
            if (isNaN(value)) {
                return;
            }
            if (this._min !== value) {
                this._min = value;
                this.dirtyPath = true;
                this.onRangeChange && this.onRangeChange(value, this.max);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "max", {
        get: function () {
            return this._max;
        },
        set: function (value) {
            value = Math.max(Math.min(value, 1), this.min + this.minRange);
            if (isNaN(value)) {
                return;
            }
            if (this._max !== value) {
                this._max = value;
                this.dirtyPath = true;
                this.onRangeChange && this.onRangeChange(this.min, value);
            }
        },
        enumerable: true,
        configurable: true
    });
    RangeMask.prototype.computeBBox = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        return new BBox(x, y, width, height);
    };
    RangeMask.prototype.computeVisibleRangeBBox = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height, min = _a.min, max = _a.max;
        var minX = x + width * min;
        var maxX = x + width * max;
        return new BBox(minX, y, maxX - minX, height);
    };
    RangeMask.prototype.updatePath = function () {
        var _a = this, path = _a.path, x = _a.x, y = _a.y, width = _a.width, height = _a.height, min = _a.min, max = _a.max;
        var _b = this, a = _b.alignment, al = _b.align;
        path.clear();
        var ax = al(a, x);
        var ay = al(a, y);
        var axw = ax + al(a, x, width);
        var ayh = ay + al(a, y, height);
        // Whole range.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);
        var minX = al(a, x + width * min);
        var maxX = al(a, x + width * max);
        // Visible range.
        path.moveTo(minX, ay);
        path.lineTo(minX, ayh);
        path.lineTo(maxX, ayh);
        path.lineTo(maxX, ay);
        path.lineTo(minX, ay);
    };
    RangeMask.className = 'RangeMask';
    return RangeMask;
}(Path));
export { RangeMask };
