export default function (a: number, b: number, count: number): NumericTicks {
    const step = tickStep(a, b, count);
    a = Math.ceil(a / step) * step;
    b = Math.floor(b / step) * step + step / 2;
    // Add half a step here so that the array returned by `range` includes the last tick.
    return range(a, b, step);
}

const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

function tickStep(a: number, b: number, count: number): number {
    if (count <= 0) {
        throw new Error('Count should be greater than zero.');
    }
    const rawStep = Math.abs(b - a) / count;
    let step = Math.pow(10, Math.floor( Math.log(rawStep) / Math.LN10) ); // = Math.log10(rawStep)
    const error = rawStep / step;

    if (error >= E10) {
        step *= 10;
    } else if (error >= E5) {
        step *= 5;
    } else if (error >= E2) {
        step *= 2
    }
    return step;
}

export class NumericTicks extends Array<number> {
    constructor(decimalDigits: number, size = 0) {
        super(size);
        this.decimalDigits = decimalDigits;
    }
    readonly decimalDigits: number;
}

function range(a: number, b: number, step: number = 1): NumericTicks {
    const absStep = Math.abs(step);
    const decimalDigits = (absStep > 0 && absStep < 1)
        ? Math.abs(Math.floor(Math.log(absStep) / Math.LN10))
        : 0;
    const f = Math.pow(10, decimalDigits);
    const n = Math.max(0, Math.ceil((b - a) / step));
    const values = new NumericTicks(decimalDigits, n);

    for (let i = 0; i < n; i++) {
        const value = a + step * i;
        values[i] = Math.round(value * f) / f;
    }

    return values;
}
