"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = exports.NumericTicks = exports.singleTickDomain = exports.tickStep = void 0;
function default_1(start, stop, count, minCount, maxCount) {
    if (count < 2) {
        return range(start, stop, stop - start);
    }
    const step = tickStep(start, stop, count, minCount, maxCount);
    if (isNaN(step)) {
        return new NumericTicks(0);
    }
    start = Math.ceil(start / step) * step;
    stop = Math.floor(stop / step) * step;
    return range(start, stop, step);
}
exports.default = default_1;
const tickMultipliers = [1, 2, 5, 10];
function tickStep(a, b, count, minCount = 0, maxCount = Infinity) {
    const rawStep = (b - a) / count;
    const power = Math.floor(Math.log10(rawStep));
    const step = Math.pow(10, power);
    const m = tickMultipliers
        .map((multiplier) => {
        const s = multiplier * step;
        const c = Math.ceil((b - a) / s);
        const isWithinBounds = c >= minCount && c <= maxCount;
        const diffCount = Math.abs(c - count);
        return { multiplier, isWithinBounds, diffCount };
    })
        .sort((a, b) => {
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
    const power = Math.floor(Math.log10(b - a));
    const step = Math.pow(10, power);
    return tickMultipliers
        .map((multiplier) => {
        const s = multiplier * step;
        const start = Math.floor(a / s) * s;
        const end = Math.ceil(b / s) * s;
        const error = 1 - (b - a) / (end - start);
        const domain = [start, end];
        return { error, domain };
    })
        .sort((a, b) => a.error - b.error)[0].domain;
}
exports.singleTickDomain = singleTickDomain;
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
    const countDigits = (expNo) => {
        var _a, _b;
        const parts = expNo.split('e');
        return Math.max(((_b = (_a = parts[0].split('.')[1]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) - Number(parts[1]), 0);
    };
    const fractionalDigits = countDigits((step % 1).toExponential());
    const f = Math.pow(10, fractionalDigits);
    const n = Math.ceil((stop - start) / step);
    const values = new NumericTicks(fractionalDigits);
    for (let i = 0; i <= n; i++) {
        const value = start + step * i;
        values.push(Math.round(value * f) / f);
    }
    return values;
}
exports.range = range;
