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
import { OHLC } from "./ohlc";
var Candlestick = /** @class */ (function (_super) {
    __extends(Candlestick, _super);
    function Candlestick() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Candlestick.prototype.updatePath = function () {
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
        // path.moveTo(date, high);
        // path.lineTo(date, Math.min(open, close));
        // path.moveTo(date, low);
        // path.lineTo(date, Math.max(open, close));
        // path.moveTo(date - dx, close);
        // path.lineTo(date + dx, close);
        // path.lineTo(date + dx, open);
        // path.lineTo(date - dx, open);
        // path.closePath();
    };
    Candlestick.className = 'OHLC';
    return Candlestick;
}(OHLC));
export { Candlestick };
