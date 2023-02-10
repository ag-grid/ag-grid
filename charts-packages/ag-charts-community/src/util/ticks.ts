export default function (start: number, stop: number, count: number): NumericTicks {
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

function getTickMultiplier(error: number) {
    return tickMultiplierErrors.find((m) => error >= m[1])?.[0];
}

export function tickStep(a: number, b: number, count: number): number {
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

export function singleTickDomain(a: number, b: number): number[] {
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

export class NumericTicks extends Array<number> {
    readonly fractionDigits: number;

    constructor(fractionDigits: number, elements?: Array<number>) {
        super();
        if (elements) {
            for (let i = 0, n = elements.length; i < n; i++) {
                this[i] = elements[i];
            }
        }
        this.fractionDigits = fractionDigits;
    }
}

export function range(start: number, stop: number, step: number): NumericTicks {
    const fractionalRemainder = step % 1;
    const fractionDigits = fractionalRemainder === 0 ? 0 : -Math.floor(Math.log10(fractionalRemainder));
    const f = Math.pow(10, fractionDigits);
    const n = Math.ceil((stop - start) / step);
    const values = new NumericTicks(fractionDigits);

    for (let i = 0; i <= n; i++) {
        const value = start + step * i;
        values.push(Math.round(value * f) / f);
    }

    return values;
}
