import { _isFiniteNumber } from 'ag-grid-community';

import { FormulaError } from '../../ast/utils';

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
    if (typeof v === 'bigint') {
        const asNumber = Number(v);
        if (Number.isFinite(asNumber)) {
            return asNumber;
        }
        throw new FormulaError(48, [fname]);
    }
    if (_isFiniteNumber(v)) {
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

    throw new FormulaError(48, [fname]);
}

/** Convert a value to a finite number or bigint, allowing numeric strings. */
export function coerceFiniteNumberOrBigInt(fname: string, v: unknown): number | bigint {
    if (typeof v === 'bigint') {
        return v;
    }
    return coerceFiniteNumber(fname, v);
}

export function coerceBigInt(fname: string, v: number | bigint): bigint {
    if (typeof v === 'bigint') {
        return v;
    }
    if (!Number.isFinite(v) || !Number.isInteger(v)) {
        throw new FormulaError(49, [fname]);
    }
    return BigInt(v);
}
