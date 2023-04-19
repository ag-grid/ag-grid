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
exports.range = exports.NumericTicks = exports.singleTickDomain = exports.tickStep = void 0;
function default_1(start, stop, count, minCount, maxCount) {
    if (count < 2) {
        return range(start, stop, stop - start);
    }
    var step = tickStep(start, stop, count, minCount, maxCount);
    if (isNaN(step)) {
        return new NumericTicks(0);
    }
    start = Math.ceil(start / step) * step;
    stop = Math.floor(stop / step) * step;
    return range(start, stop, step);
}
exports.default = default_1;
var tickMultipliers = [1, 2, 5, 10];
function tickStep(a, b, count, minCount, maxCount) {
    if (minCount === void 0) { minCount = 0; }
    if (maxCount === void 0) { maxCount = Infinity; }
    var rawStep = (b - a) / count;
    var power = Math.floor(Math.log10(rawStep));
    var step = Math.pow(10, power);
    var m = tickMultipliers
        .map(function (multiplier) {
        var s = multiplier * step;
        var c = Math.ceil((b - a) / s);
        var isWithinBounds = c >= minCount && c <= maxCount;
        var diffCount = Math.abs(c - count);
        return { multiplier: multiplier, isWithinBounds: isWithinBounds, diffCount: diffCount };
    })
        .sort(function (a, b) {
        if (a.isWithinBounds !== b.isWithinBounds) {
            return a.isWithinBounds ? -1 : 1;
        }
        return a.diffCount - b.diffCount;
    })[0].multiplier;
    if (!m || isNaN(m)) {
        return NaN;
    }
    return m * step;
}
exports.tickStep = tickStep;
function singleTickDomain(a, b) {
    var power = Math.floor(Math.log10(b - a));
    var step = Math.pow(10, power);
    return tickMultipliers
        .map(function (multiplier) {
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
