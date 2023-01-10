"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericTicks = exports.tickStep = void 0;
function default_1(start, stop, count) {
    var step = tickStep(start, stop, count);
    start = Math.ceil(start / step) * step;
    stop = Math.floor(stop / step) * step;
    return range(start, stop, step);
}
exports.default = default_1;
// Make error thresholds 2/5 between the intervals
var tickMultiplierErrors = [
    [10, 7],
    [5, 3.2],
    [2, 1.4],
    [1, 0],
];
function getTickMultiplier(error) {
    return tickMultiplierErrors.find(function (m) { return error >= m[1]; })[0];
}
function tickStep(a, b, count) {
    var rawStep = (b - a) / count;
    var power = Math.floor(Math.log10(rawStep));
    var step = Math.pow(10, power);
    var error = rawStep / step;
    var m = getTickMultiplier(error);
    return m * step;
}
exports.tickStep = tickStep;
var NumericTicks = /** @class */ (function (_super) {
    __extends(NumericTicks, _super);
    function NumericTicks(fractionDigits, elements) {
        var _this = _super.call(this) || this;
        if (elements) {
            for (var i = 0, n = elements.length; i < n; i++) {
                _this[i] = elements[i];
            }
        }
        _this.fractionDigits = fractionDigits;
        return _this;
    }
    return NumericTicks;
}(Array));
exports.NumericTicks = NumericTicks;
function range(start, stop, step) {
    var isInteger = step >= 1;
    var fractionDigits = isInteger ? 0 : -Math.floor(Math.log10(step));
    var f = Math.pow(10, fractionDigits);
    var n = Math.ceil((stop - start) / step);
    var values = new NumericTicks(fractionDigits);
    for (var i = 0; i <= n; i++) {
        var value = start + step * i;
        values.push(Math.round(value * f) / f);
    }
    return values;
}
