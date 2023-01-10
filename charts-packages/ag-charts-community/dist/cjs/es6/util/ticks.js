"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericTicks = exports.tickStep = void 0;
function default_1(start, stop, count) {
    const step = tickStep(start, stop, count);
    start = Math.ceil(start / step) * step;
    stop = Math.floor(stop / step) * step;
    return range(start, stop, step);
}
exports.default = default_1;
// Make error thresholds 2/5 between the intervals
const tickMultiplierErrors = [
    [10, 7],
    [5, 3.2],
    [2, 1.4],
    [1, 0],
];
function getTickMultiplier(error) {
    return tickMultiplierErrors.find((m) => error >= m[1])[0];
}
function tickStep(a, b, count) {
    const rawStep = (b - a) / count;
    const power = Math.floor(Math.log10(rawStep));
    const step = Math.pow(10, power);
    const error = rawStep / step;
    const m = getTickMultiplier(error);
    return m * step;
}
exports.tickStep = tickStep;
class NumericTicks extends Array {
    constructor(fractionDigits, elements) {
        super();
        if (elements) {
            for (let i = 0, n = elements.length; i < n; i++) {
                this[i] = elements[i];
            }
        }
        this.fractionDigits = fractionDigits;
    }
}
exports.NumericTicks = NumericTicks;
function range(start, stop, step) {
    const isInteger = step >= 1;
    const fractionDigits = isInteger ? 0 : -Math.floor(Math.log10(step));
    const f = Math.pow(10, fractionDigits);
    const n = Math.ceil((stop - start) / step);
    const values = new NumericTicks(fractionDigits);
    for (let i = 0; i <= n; i++) {
        const value = start + step * i;
        values.push(Math.round(value * f) / f);
    }
    return values;
}
