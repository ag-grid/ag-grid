import { Color } from '../util/color';
import interpolateColor from '../interpolate/color';
var ColorScale = /** @class */ (function () {
    function ColorScale() {
        this.domain = [0, 1];
        this._range = ['red', 'green'];
        this.parsedRange = this._range.map(function (v) { return Color.fromString(v); });
    }
    Object.defineProperty(ColorScale.prototype, "range", {
        get: function () {
            return this._range;
        },
        set: function (values) {
            this._range = values;
            this.parsedRange = values.map(function (v) { return Color.fromString(v); });
        },
        enumerable: false,
        configurable: true
    });
    ColorScale.prototype.convert = function (x) {
        var _a = this, domain = _a.domain, range = _a.range, parsedRange = _a.parsedRange;
        var d0 = domain[0];
        var d1 = domain[domain.length - 1];
        var r0 = range[0];
        var r1 = range[range.length - 1];
        if (x <= d0) {
            return r0;
        }
        if (x >= d1) {
            return r1;
        }
        var index;
        var q;
        if (domain.length === 2) {
            var t = (x - d0) / (d1 - d0);
            var step = 1 / (range.length - 1);
            index = range.length <= 2 ? 0 : Math.min(Math.floor(t * (range.length - 1)), range.length - 2);
            q = (t - index * step) / step;
        }
        else {
            for (index = 0; index < domain.length - 2; index++) {
                if (x < domain[index + 1]) {
                    break;
                }
            }
            var a = domain[index];
            var b = domain[index + 1];
            q = (x - a) / (b - a);
        }
        var c0 = parsedRange[index];
        var c1 = parsedRange[index + 1];
        return interpolateColor(c0, c1)(q);
    };
    return ColorScale;
}());
export { ColorScale };
