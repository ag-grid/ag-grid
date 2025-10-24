import { FormulaError } from '../../ast/utils';

// Helpers for funcs below
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysFromDate(d: Date): number {
    return d.getTime() / MS_PER_DAY;
}

export function dateFromDays(n: number): Date {
    return new Date(n * MS_PER_DAY);
}

export function isDateValue(v: unknown): v is Date {
    return v instanceof Date;
}

/** Convert a value to a finite number, allowing numeric strings; else throw. */
export function coerceFiniteNumber(fname: string, v: unknown): number {
    if (isFiniteNumber(v)) {
        return v;
    }

    if (isDateValue(v)) {
        return daysFromDate(v); // dates are treated as days when adding
    }

    if (typeof v === 'boolean') {
        return v ? 1 : 0;
    }

    if (typeof v === 'string') {
        const n = Number(v.trim());
        if (Number.isFinite(n)) {
            return n;
        }
    }

    throw new FormulaError(`${fname}: values must be numeric`, '#VALUE!');
}
