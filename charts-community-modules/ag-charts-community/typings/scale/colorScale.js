"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorScale = void 0;
var color_1 = require("../util/color");
var logger_1 = require("../util/logger");
var color_2 = require("../interpolate/color");
var ColorScale = /** @class */ (function () {
    function ColorScale() {
        this.domain = [0, 1];
        this.range = ['red', 'blue'];
        this.parsedRange = this.range.map(function (v) { return color_1.Color.fromString(v); });
    }
    ColorScale.prototype.update = function () {
        var _a = this, domain = _a.domain, range = _a.range;
        if (domain.length < 2) {
            logger_1.Logger.warnOnce('`colorDomain` should have at least 2 values.');
            if (domain.length === 0) {
                domain.push(0, 1);
            }
            else if (domain.length === 1) {
                domain.push(domain[0] + 1);
            }
        }
        for (var i = 1; i < domain.length; i++) {
            var a = domain[i - 1];
            var b = domain[i];
            if (a >= b) {
                logger_1.Logger.warnOnce('`colorDomain` values should be supplied in ascending order.');
                domain.sort(function (a, b) { return a - b; });
                break;
            }
        }
        var isSmallRange = range.length < domain.length;
        if (isSmallRange || (domain.length > 2 && range.length > domain.length)) {
            logger_1.Logger.warnOnce('Number of elements in `colorRange` needs to match the number of elements in `colorDomain`.');
            if (isSmallRange) {
                for (var i = range.length; i < domain.length; i++) {
                    range.push('black');
                }
            }
            else {
                range.splice(domain.length);
            }
        }
        this.parsedRange = this.range.map(function (v) { return color_1.Color.fromString(v); });
    };
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
        return color_2.default(c0, c1)(q);
    };
    return ColorScale;
}());
exports.ColorScale = ColorScale;
//# sourceMappingURL=colorScale.js.map