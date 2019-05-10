export default function(a: number, b: number, count: number): NumericTicks {
    const step = tickStep(a, b, count);
    a = Math.ceil(a / step) * step;
    b = Math.floor(b / step) * step + step / 2;
    // Add half a step here so that the array returned by `range` includes the last tick.
    return range(a, b, step);
}

const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);

function tickStep(a: number, b: number, count: number): number {
    const rawStep = Math.abs(b - a) / Math.max(0, count);
    let step = Math.pow(10, Math.floor(Math.log(rawStep) / Math.LN10)); // = Math.log10(rawStep)
    const error = rawStep / step;

    if (error >= e10) {
        step *= 10;
    } else if (error >= e5) {
        step *= 5;
    } else if (error >= e2) {
        step *= 2;
    }
    return b < a ? -step : step;
}

export function tickIncrement(a: number, b: number, count: number): number {
    const rawStep = (b - a) / Math.max(0, count);
    const power = Math.floor(Math.log(rawStep) / Math.LN10);
    const error = rawStep / Math.pow(10, power);

    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

export class NumericTicks extends Array<number> {
    readonly fractionDigits: number;

    constructor(fractionDigits: number, size = 0) {
        super(size);
        this.fractionDigits = fractionDigits;
    }
}

function range(a: number, b: number, step: number = 1): NumericTicks {
    const absStep = Math.abs(step);
    const fractionDigits = (absStep > 0 && absStep < 1)
        ? Math.abs(Math.floor(Math.log(absStep) / Math.LN10))
        : 0;
    const f = Math.pow(10, fractionDigits);
    const n = Math.max(0, Math.ceil((b - a) / step)) || 0;
    const values = new NumericTicks(fractionDigits, n);

    for (let i = 0; i < n; i++) {
        const value = a + step * i;
        values[i] = Math.round(value * f) / f;
    }

    return values;
}
