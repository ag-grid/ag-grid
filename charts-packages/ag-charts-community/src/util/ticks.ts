export default function (
    start: number,
    stop: number,
    count: number,
    minCount?: number,
    maxCount?: number
): NumericTicks {
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

const tickMultipliers = [1, 2, 5, 10];

export function tickStep(a: number, b: number, count: number, minCount = 0, maxCount = Infinity): number {
    const rawStep = (b - a) / count;
    const power = Math.floor(Math.log10(rawStep));
    const step = Math.pow(10, power);
    const m = tickMultipliers
        .map((multiplier) => {
            const s = multiplier * step;
            const c = (b - a) / s;
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

export function singleTickDomain(a: number, b: number): number[] {
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
    const countDigits = (expNo: string) => {
        const parts = expNo.split('e');
        return Math.max((parts[0].split('.')[1]?.length ?? 0) - Number(parts[1]), 0);
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
