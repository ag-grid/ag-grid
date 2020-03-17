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
import { Path } from "../../../../../scene/shape/path";
var OHLC = /** @class */ (function (_super) {
    __extends(OHLC, _super);
    function OHLC() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._date = 0;
        _this._open = 0;
        _this._high = 0;
        _this._low = 0;
        _this._close = 0;
        _this._width = 5;
        return _this;
    }
    Object.defineProperty(OHLC.prototype, "date", {
        get: function () {
            return this._date;
        },
        set: function (value) {
            if (this._date !== value) {
                this._date = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLC.prototype, "open", {
        get: function () {
            return this._open;
        },
        set: function (value) {
            if (this._open !== value) {
                this._open = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLC.prototype, "high", {
        get: function () {
            return this._high;
        },
        set: function (value) {
            if (this._high !== value) {
                this._high = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLC.prototype, "low", {
        get: function () {
            return this._low;
        },
        set: function (value) {
            if (this._low !== value) {
                this._low = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLC.prototype, "close", {
        get: function () {
            return this._close;
        },
        set: function (value) {
            if (this._close !== value) {
                this._close = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLC.prototype, "width", {
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
    OHLC.prototype.updatePath = function () {
        var _a = this, path = _a.path, date = _a.date, open = _a.open, high = _a.high, low = _a.low, close = _a.close, width = _a.width, strokeWidth = _a.strokeWidth;
        var dx = width / 2;
        {
            var alignment_1 = Math.floor(strokeWidth) % 2 / 2;
            var align = function (x) { return Math.floor(x) + alignment_1; };
            var ax = Math.round(date);
            var axm = align(date - dx);
            var axp = align(date + dx);
            var aopen = align(open);
            var aclose = align(close);
            path.clear();
            path.moveTo(ax, align(high));
            path.lineTo(ax, Math.min(aopen, aclose));
            path.moveTo(ax, align(low));
            path.lineTo(ax, Math.max(aopen, aclose));
            path.moveTo(axm, aclose);
            path.lineTo(axp, aclose);
            path.lineTo(axp, aopen);
            path.lineTo(axm, aopen);
            path.closePath();
        }
        // path.clear();
        // path.moveTo(x, high);
        // path.lineTo(x, Math.min(open, close));
        // path.moveTo(x, low);
        // path.lineTo(x, Math.max(open, close));
        // path.moveTo(x - dx, close);
        // path.lineTo(x + dx, close);
        // path.lineTo(x + dx, open);
        // path.lineTo(x - dx, open);
        // path.closePath();
    };
    return OHLC;
}(Path));
export { OHLC };
