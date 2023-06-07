"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNiceSecondaryAxis = void 0;
var ticks_1 = require("./ticks");
function calculateNiceSecondaryAxis(domain, primaryTickCount) {
    // Make secondary axis domain nice using strict tick count, matching the tick count from the primary axis.
    // This is to make the secondary axis grid lines/ tick positions align with the ones from the primary axis.
    var start = Math.floor(domain[0]);
    var stop = domain[1];
    start = calculateNiceStart(start, stop, primaryTickCount);
    var step = getTickStep(start, stop, primaryTickCount);
    var segments = primaryTickCount - 1;
    stop = start + segments * step;
    var d = [start, stop];
    var ticks = getTicks(start, step, primaryTickCount);
    return [d, ticks];
}
exports.calculateNiceSecondaryAxis = calculateNiceSecondaryAxis;
function calculateNiceStart(a, b, count) {
    var rawStep = Math.abs(b - a) / (count - 1);
    var order = Math.floor(Math.log10(rawStep));
    var magnitude = Math.pow(10, order);
    return Math.floor(a / magnitude) * magnitude;
}
function getTicks(start, step, count) {
    // power of the step will be negative if the step is a fraction (between 0 and 1)
    var stepPower = Math.floor(Math.log10(step));
    var fractionDigits = step > 0 && step < 1 ? Math.abs(stepPower) : 0;
    var f = Math.pow(10, fractionDigits);
    var ticks = new ticks_1.NumericTicks(fractionDigits);
    for (var i = 0; i < count; i++) {
        var tick = start + step * i;
        ticks[i] = Math.round(tick * f) / f;
    }
    return ticks;
}
function getTickStep(start, stop, count) {
    var segments = count - 1;
    var rawStep = (stop - start) / segments;
    return calculateNextNiceStep(rawStep);
}
function calculateNextNiceStep(rawStep) {
    var order = Math.floor(Math.log10(rawStep));
    var magnitude = Math.pow(10, order);
    // Make order 1
    var step = (rawStep / magnitude) * 10;
    if (step > 0 && step <= 1) {
        return magnitude / 10;
    }
    if (step > 1 && step <= 2) {
        return (2 * magnitude) / 10;
    }
    if (step > 1 && step <= 5) {
        return (5 * magnitude) / 10;
    }
    if (step > 5 && step <= 10) {
        return (10 * magnitude) / 10;
    }
    if (step > 10 && step <= 20) {
        return (20 * magnitude) / 10;
    }
    if (step > 20 && step <= 40) {
        return (40 * magnitude) / 10;
    }
    if (step > 40 && step <= 50) {
        return (50 * magnitude) / 10;
    }
    if (step > 50 && step <= 100) {
        return (100 * magnitude) / 10;
    }
    return step;
}
//# sourceMappingURL=secondaryAxisTicks.js.map