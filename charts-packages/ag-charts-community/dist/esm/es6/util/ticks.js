export default function (start, stop, count) {
    if (count < 2) {
        return range(start, stop, stop - start);
    }
    const step = tickStep(start, stop, count);
    if (isNaN(step)) {
        return new NumericTicks(0);
    }
    start = Math.ceil(start / step) * step;
    stop = Math.floor(stop / step) * step;
    return range(start, stop, step);
}
// Make error thresholds 2/5 between the intervals
const tickMultiplierErrors = [
    [10, 7],
    [5, 3.2],
    [2, 1.4],
    [1, 0],
];
function getTickMultiplier(error) {
    var _a;
    return (_a = tickMultiplierErrors.find((m) => error >= m[1])) === null || _a === void 0 ? void 0 : _a[0];
}
export function tickStep(a, b, count) {
    const rawStep = (b - a) / count;
    const power = Math.floor(Math.log10(rawStep));
    const step = Math.pow(10, power);
    const error = rawStep / step;
    const m = getTickMultiplier(error);
    if (!m || isNaN(m)) {
        return NaN;
    }
    return m * step;
}
export function singleTickDomain(a, b) {
    const power = Math.floor(Math.log10(b - a));
    const step = Math.pow(10, power);
    return tickMultiplierErrors
        .map(([multiplier]) => {
        const s = multiplier * step;
        const start = Math.floor(a / s) * s;
        const end = Math.ceil(b / s) * s;
        const error = 1 - (b - a) / (end - start);
        const domain = [start, end];
        return { error, domain };
    })
        .sort((a, b) => a.error - b.error)[0].domain;
}
export class NumericTicks extends Array {
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
export function range(start, stop, step) {
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
