import type { FormulaFunctionParams } from 'ag-grid-community';

import { FormulaError } from '../../ast/utils';
import { criteriaToPredicate, isRangeParam, isValueParam, iterableWithoutBlanks, take, takeBetween } from '../utils';
import { coerceBigInt, coerceFiniteNumber, coerceFiniteNumberOrBigInt, dateFromDays, isDateValue } from './utils';

export const PRODUCT = ({ values }: FormulaFunctionParams): number | bigint => {
    let acc = 1;
    let accBigInt: bigint | null = null;
    for (const v of iterableWithoutBlanks(values)) {
        const n = coerceFiniteNumberOrBigInt('PRODUCT', v);

        if (typeof n === 'bigint') {
            accBigInt ??= coerceBigInt('PRODUCT', acc);
            if (n === 0n) {
                return 0n;
            }
            accBigInt *= n;
            continue;
        }

        if (accBigInt != null) {
            accBigInt *= coerceBigInt('PRODUCT', n);
            continue;
        }

        if (n === 0) {
            return 0;
        }

        acc *= n;
    }
    return accBigInt ?? acc;
};

export const DIVIDE = ({ values }: FormulaFunctionParams): number => {
    const [a, b] = take(iterableWithoutBlanks(values), 'DIVIDE', 2);
    const na = coerceFiniteNumber('DIV', a);
    const nb = coerceFiniteNumber('DIV', b);
    if (na == null || nb == null) {
        throw new FormulaError(54);
    }
    if (nb === 0) {
        throw new FormulaError(55);
    }
    return na / nb;
};

export const SUM = ({ values }: FormulaFunctionParams): number | Date | bigint => {
    let hasDates = false;
    let acc = 0;
    let accBigInt: bigint | null = null;
    let hasValue = false;
    for (const v of iterableWithoutBlanks(values)) {
        hasDates ||= isDateValue(v);

        const n = coerceFiniteNumberOrBigInt('SUM', v);
        if (typeof n === 'bigint') {
            if (hasDates) {
                throw new FormulaError(56);
            }
            accBigInt ??= coerceBigInt('SUM', acc);
            accBigInt += n;
            hasValue = true;
            continue;
        }

        if (typeof accBigInt === 'bigint') {
            if (hasDates) {
                throw new FormulaError(56);
            }
            accBigInt += coerceBigInt('SUM', n);
            hasValue = true;
            continue;
        }

        acc += n;
        hasValue = true;
    }
    if (!hasValue) {
        throw new FormulaError(57);
    }

    if (typeof accBigInt === 'bigint') {
        return accBigInt;
    }
    return hasDates ? dateFromDays(acc) : acc;
};

export const MINUS = ({ values }: FormulaFunctionParams): number | Date | bigint => {
    const [a, b] = take(iterableWithoutBlanks(values), 'MINUS', 2);
    const aDate = isDateValue(a);
    const bDate = isDateValue(b);
    if (aDate || bDate) {
        const na = coerceFiniteNumber('MINUS', a);
        const nb = coerceFiniteNumber('MINUS', b);
        if (aDate && !bDate) {
            return dateFromDays(na - nb); // date - number = date
        }
        if (aDate && bDate) {
            return na - nb; // subtracting two dates gives number of days between
        }
        return na - nb;
    }

    const na = coerceFiniteNumberOrBigInt('MINUS', a);
    const nb = coerceFiniteNumberOrBigInt('MINUS', b);
    if (typeof na === 'bigint' || typeof nb === 'bigint') {
        return coerceBigInt('MINUS', na as number | bigint) - coerceBigInt('MINUS', nb as number | bigint);
    }
    return na - nb;
};

export const PERCENT = ({ values }: FormulaFunctionParams): number => {
    const [a] = take(values, 'PERCENT', 1);
    const n = coerceFiniteNumber('PERCENT', a);
    if (n == null) {
        throw new FormulaError(70);
    }
    return n / 100;
};

export const POWER = ({ values }: FormulaFunctionParams): number => {
    const [a, b] = take(values, 'POWER', 2);
    const na = coerceFiniteNumber('POWER', a);
    const nb = coerceFiniteNumber('POWER', b);
    if (na == null || nb == null) {
        throw new FormulaError(71);
    }
    return Math.pow(na, nb);
};

export const ROUND = ({ values }: FormulaFunctionParams): number => {
    const [value, digits = 0] = takeBetween(values, 'ROUND', 1, 2);
    const number = coerceFiniteNumber('ROUND', value);
    const precision = Math.trunc(coerceFiniteNumber('ROUND', digits));
    const factor = Math.pow(10, precision);

    return Math.round(number * factor) / factor;
};

export const AVERAGE = ({ values }: FormulaFunctionParams): number | Date => {
    let sum = 0;
    let count = 0;
    let allDate = true;
    for (const v of iterableWithoutBlanks(values)) {
        const n = coerceFiniteNumber('AVG', v);
        if (n == null) {
            continue;
        }
        sum += n;
        count++;
        allDate &&= isDateValue(v);
    }
    if (count === 0) {
        throw new FormulaError(58);
    }
    const avg = sum / count;
    return allDate ? dateFromDays(avg) : avg;
};

export const MEDIAN = ({ values }: FormulaFunctionParams): number | Date => {
    let allDates = true;
    const arr: number[] = [];
    for (const v of iterableWithoutBlanks(values)) {
        const n = coerceFiniteNumber('MEDIAN', v);
        if (n == null) {
            throw new FormulaError(59);
        }
        arr.push(n);
        allDates &&= isDateValue(v);
    }
    if (arr.length === 0) {
        throw new FormulaError(60);
    }
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    const med = arr.length % 2 === 1 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    return allDates ? dateFromDays(med) : med;
};

export const RAND = (): number => Math.random();

export const SUMIF = ({ args }: FormulaFunctionParams): number | bigint => {
    const [critRange, criteria, sumRange] = takeBetween(args, 'SUMIF', 2, 3);

    if (!isRangeParam(critRange)) {
        throw new FormulaError(61);
    }
    if (!isValueParam(criteria)) {
        throw new FormulaError(62);
    }
    if (sumRange && !isRangeParam(sumRange)) {
        throw new FormulaError(63);
    }

    const pred = criteriaToPredicate(criteria.value);

    // No sum_range → sum over critRange itself (Excel behavior).
    if (!sumRange) {
        let acc = 0;
        let accBigInt: bigint | null = null;
        for (const v of critRange) {
            if (pred(v)) {
                const n = coerceFiniteNumberOrBigInt('SUMIF', v);
                if (typeof n === 'bigint') {
                    accBigInt ??= coerceBigInt('SUMIF', acc);
                    accBigInt += n;
                } else if (accBigInt != null) {
                    accBigInt += coerceBigInt('SUMIF', n);
                } else {
                    acc += n;
                }
            }
        }
        return accBigInt ?? acc;
    }

    const critRangeHeight = critRange.rowEnd - critRange.rowStart;
    const sumRangeHeight = sumRange.rowEnd - sumRange.rowStart;
    if (critRangeHeight !== sumRangeHeight) {
        throw new FormulaError(64);
    }

    const critRangeIterator = critRange![Symbol.iterator]();
    const sumRangeIterator = sumRange[Symbol.iterator]();

    let total = 0;
    let totalBigInt: bigint | null = null;
    while (true) {
        const a = critRangeIterator.next();
        const b = sumRangeIterator.next();
        if (a.done || b.done) {
            if (a.done !== b.done) {
                throw new FormulaError(64);
            }
            break;
        }
        if (pred(a.value)) {
            const n = coerceFiniteNumberOrBigInt('SUMIF', b.value);
            if (typeof n === 'bigint') {
                totalBigInt ??= coerceBigInt('SUMIF', total);
                totalBigInt += n;
            } else if (totalBigInt != null) {
                totalBigInt += coerceBigInt('SUMIF', n);
            } else {
                total += n;
            }
        }
    }
    return totalBigInt ?? total;
};
