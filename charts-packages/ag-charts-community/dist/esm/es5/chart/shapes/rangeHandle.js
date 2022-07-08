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
var RangeHandle = /** @class */ (function (_super) {
    __extends(RangeHandle, _super);
    function RangeHandle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._fill = '#f2f2f2';
        _this._stroke = '#999999';
        _this._strokeWidth = 1;
        _this._lineCap = 'square';
        _this._centerX = 0;
        _this._centerY = 0;
        // Use an even number for better looking results.
        _this._width = 8;
        // Use an even number for better looking results.
        _this._gripLineGap = 2;
        // Use an even number for better looking results.
        _this._gripLineLength = 8;
        _this._height = 16;
        return _this;
    }
    Object.defineProperty(RangeHandle.prototype, "centerX", {
        get: function () {
            return this._centerX;
        },
        set: function (value) {
            if (this._centerX !== value) {
                this._centerX = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "centerY", {
        get: function () {
            return this._centerY;
        },
        set: function (value) {
            if (this._centerY !== value) {
                this._centerY = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "width", {
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
    Object.defineProperty(RangeHandle.prototype, "gripLineGap", {
        get: function () {
            return this._gripLineGap;
        },
        set: function (value) {
            if (this._gripLineGap !== value) {
                this._gripLineGap = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "gripLineLength", {
        get: function () {
            return this._gripLineLength;
        },
        set: function (value) {
            if (this._gripLineLength !== value) {
                this._gripLineLength = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "height", {
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
    RangeHandle.prototype.computeBBox = function () {
        var _a = this, centerX = _a.centerX, centerY = _a.centerY, width = _a.width, height = _a.height;
        var x = centerX - width / 2;
        var y = centerY - height / 2;
        return new BBox(x, y, width, height);
    };
    RangeHandle.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox.containsPoint(point.x, point.y);
    };
    RangeHandle.prototype.updatePath = function () {
        var _a = this, path = _a.path, centerX = _a.centerX, centerY = _a.centerY, width = _a.width, height = _a.height;
        var _b = this, a = _b.alignment, al = _b.align;
        path.clear();
        var x = centerX - width / 2;
        var y = centerY - height / 2;
        var ax = al(a, x);
        var ay = al(a, y);
        var axw = ax + al(a, x, width);
        var ayh = ay + al(a, y, height);
        // Handle.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);
        // Grip lines.
        var dx = this.gripLineGap / 2;
        var dy = this.gripLineLength / 2;
        path.moveTo(al(a, centerX - dx), al(a, centerY - dy));
        path.lineTo(al(a, centerX - dx), al(a, centerY + dy));
        path.moveTo(al(a, centerX + dx), al(a, centerY - dy));
        path.lineTo(al(a, centerX + dx), al(a, centerY + dy));
    };
    RangeHandle.className = 'RangeHandle';
    return RangeHandle;
}(Path));
export { RangeHandle };
