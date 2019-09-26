// ag-grid-enterprise v21.2.2
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(a, b, count) {
    var step = tickStep(a, b, count);
    a = Math.ceil(a / step) * step;
    b = Math.floor(b / step) * step + step / 2;
    // Add half a step here so that the array returned by `range` includes the last tick.
    return range(a, b, step);
}
exports.default = default_1;
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function tickStep(a, b, count) {
    var rawStep = Math.abs(b - a) / Math.max(0, count);
    var step = Math.pow(10, Math.floor(Math.log(rawStep) / Math.LN10)); // = Math.log10(rawStep)
    var error = rawStep / step;
    if (error >= e10) {
        step *= 10;
    }
    else if (error >= e5) {
        step *= 5;
    }
    else if (error >= e2) {
        step *= 2;
    }
    return b < a ? -step : step;
}
function tickIncrement(a, b, count) {
    var rawStep = (b - a) / Math.max(0, count);
    var power = Math.floor(Math.log(rawStep) / Math.LN10);
    var error = rawStep / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}
exports.tickIncrement = tickIncrement;
var NumericTicks = /** @class */ (function (_super) {
    __extends(NumericTicks, _super);
    function NumericTicks(fractionDigits, size) {
        if (size === void 0) { size = 0; }
        var _this = _super.call(this, size) || this;
        _this.fractionDigits = fractionDigits;
        return _this;
    }
    return NumericTicks;
}(Array));
exports.NumericTicks = NumericTicks;
function range(a, b, step) {
    if (step === void 0) { step = 1; }
    var absStep = Math.abs(step);
    var fractionDigits = (absStep > 0 && absStep < 1)
        ? Math.abs(Math.floor(Math.log(absStep) / Math.LN10))
        : 0;
    var f = Math.pow(10, fractionDigits);
    var n = Math.max(0, Math.ceil((b - a) / step)) || 0;
    var values = new NumericTicks(fractionDigits, n);
    for (var i = 0; i < n; i++) {
        var value = a + step * i;
        values[i] = Math.round(value * f) / f;
    }
    return values;
}
