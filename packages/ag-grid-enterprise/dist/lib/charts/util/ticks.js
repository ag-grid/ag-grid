// ag-grid-enterprise v20.2.0
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
var E10 = Math.sqrt(50);
var E5 = Math.sqrt(10);
var E2 = Math.sqrt(2);
function tickStep(a, b, count) {
    if (count <= 0) {
        throw new Error('Count should be greater than zero.');
    }
    var rawStep = Math.abs(b - a) / count;
    var step = Math.pow(10, Math.floor(Math.log(rawStep) / Math.LN10)); // = Math.log10(rawStep)
    var error = rawStep / step;
    if (error >= E10) {
        step *= 10;
    }
    else if (error >= E5) {
        step *= 5;
    }
    else if (error >= E2) {
        step *= 2;
    }
    return step;
}
var NumericTicks = /** @class */ (function (_super) {
    __extends(NumericTicks, _super);
    function NumericTicks(decimalDigits, size) {
        if (size === void 0) { size = 0; }
        var _this = _super.call(this, size) || this;
        _this.decimalDigits = decimalDigits;
        return _this;
    }
    return NumericTicks;
}(Array));
exports.NumericTicks = NumericTicks;
function range(a, b, step) {
    if (step === void 0) { step = 1; }
    var absStep = Math.abs(step);
    var decimalDigits = (absStep > 0 && absStep < 1)
        ? Math.abs(Math.floor(Math.log(absStep) / Math.LN10))
        : 0;
    var f = Math.pow(10, decimalDigits);
    var n = Math.max(0, Math.ceil((b - a) / step));
    var values = new NumericTicks(decimalDigits, n);
    for (var i = 0; i < n; i++) {
        var value = a + step * i;
        values[i] = Math.round(value * f) / f;
    }
    return values;
}
