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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = exports.NumericTicks = exports.singleTickDomain = exports.tickStep = void 0;
function default_1(start, stop, count) {
    if (count < 2) {
        return range(start, stop, stop - start);
    }
    var step = tickStep(start, stop, count);
    if (isNaN(step)) {
        return new NumericTicks(0);
    }
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
    var _a;
    return (_a = tickMultiplierErrors.find(function (m) { return error >= m[1]; })) === null || _a === void 0 ? void 0 : _a[0];
}
function tickStep(a, b, count) {
    var rawStep = (b - a) / count;
    var power = Math.floor(Math.log10(rawStep));
    var step = Math.pow(10, power);
    var error = rawStep / step;
    var m = getTickMultiplier(error);
    if (!m || isNaN(m)) {
        return NaN;
    }
    return m * step;
}
exports.tickStep = tickStep;
function singleTickDomain(a, b) {
    var power = Math.floor(Math.log10(b - a));
    var step = Math.pow(10, power);
    return tickMultiplierErrors
        .map(function (_a) {
        var _b = __read(_a, 1), multiplier = _b[0];
        var s = multiplier * step;
        var start = Math.floor(a / s) * s;
        var end = Math.ceil(b / s) * s;
        var error = 1 - (b - a) / (end - start);
        var domain = [start, end];
        return { error: error, domain: domain };
    })
        .sort(function (a, b) { return a.error - b.error; })[0].domain;
}
exports.singleTickDomain = singleTickDomain;
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
    var countDigits = function (expNo) {
        var _a, _b;
        var parts = expNo.split('e');
        return Math.max(((_b = (_a = parts[0].split('.')[1]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) - Number(parts[1]), 0);
    };
    var fractionalDigits = countDigits((step % 1).toExponential());
    var f = Math.pow(10, fractionalDigits);
    var n = Math.ceil((stop - start) / step);
    var values = new NumericTicks(fractionalDigits);
    for (var i = 0; i <= n; i++) {
        var value = start + step * i;
        values.push(Math.round(value * f) / f);
    }
    return values;
}
exports.range = range;
//# sourceMappingURL=ticks.js.map