// ag-grid-enterprise v20.0.0
"use strict";
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
function range(a, b, step) {
    if (step === void 0) { step = 1; }
    var n = Math.max(0, Math.ceil((b - a) / step));
    var values = [];
    for (var i = 0; i < n; i++) {
        values.push(a + step * i);
    }
    return values;
}
