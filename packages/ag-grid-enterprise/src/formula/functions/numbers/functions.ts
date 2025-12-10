import type { FormulaFunctionParams } from 'ag-grid-community';

import { FormulaError } from '../../ast/utils';
import { criteriaToPredicate, isRangeParam, isValueParam, iterableWithoutBlanks, take, takeBetween } from '../utils';
import { coerceFiniteNumber, dateFromDays, isDateValue } from './utils';

export const PRODUCT = ({ values }: FormulaFunctionParams): number => {
    let acc = 1;
    for (const v of iterableWithoutBlanks(values)) {
        const n = coerceFiniteNumber('PRODUCT', v);
        if (n == null) {
            continue;
        }

        if (n === 0) {
            return 0;
        }

        acc *= n;
    }
    return acc;
};

export const DIVIDE = ({ values }: FormulaFunctionParams): number => {
    const [a, b] = take(iterableWithoutBlanks(values), 'DIVIDE', 2);
    const na = coerceFiniteNumber('DIV', a);
    const nb = coerceFiniteNumber('DIV', b);
    if (na == null || nb == null) {
        throw new FormulaError('DIV: non-numeric argument', '#VALUE!');
    }
    if (nb === 0) {
        throw new FormulaError('DIV: division by zero', '#DIV/0!');
    }
    return na / nb;
};

export const SUM = ({ values }: FormulaFunctionParams): number | Date => {
    let hasDates = false;
    let acc = 0;
    let hasValue = false;
    for (const v of iterableWithoutBlanks(values)) {
        hasDates ||= isDateValue(v);

        const n = coerceFiniteNumber('SUM', v);
        if (n == null) {
            continue;
        }
        acc += n;
        hasValue = true;
    }
    if (!hasValue) {
        throw new FormulaError('SUM: requires at least one numeric value', '#PARSE!');
    }

    return hasDates ? dateFromDays(acc) : acc;
};

export const MINUS = ({ values }: FormulaFunctionParams): number | Date => {
    const [a, b] = take(iterableWithoutBlanks(values), 'MINUS', 2);
    const na = coerceFiniteNumber('MINUS', a);
    const nb = coerceFiniteNumber('MINUS', b);
    if (na == null || nb == null) {
        throw new FormulaError('MINUS: non-numeric argument', '#VALUE!');
    }

    const aDate = isDateValue(a);
    const bDate = isDateValue(b);
    if (aDate && !bDate) {
        return dateFromDays(na - nb); // date - number = date
    }
    if (aDate && bDate) {
        return na - nb; // subtracting two dates gives number of days between
    }
    return na - nb;
};

export const PERCENT = ({ values }: FormulaFunctionParams): number => {
    const [a] = take(values, 'PERCENT', 1);
    const n = coerceFiniteNumber('PERCENT', a);
    if (n == null) {
        throw new FormulaError('PERCENT: non-numeric argument', '#VALUE!');
    }
    return n / 100;
};

export const POWER = ({ values }: FormulaFunctionParams): number => {
    const [a, b] = take(values, 'POWER', 2);
    const na = coerceFiniteNumber('POWER', a);
    const nb = coerceFiniteNumber('POWER', b);
    if (na == null || nb == null) {
        throw new FormulaError('POWER: non-numeric argument', '#VALUE!');
    }
    return Math.pow(na, nb);
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
        throw new FormulaError('AVG: requires at least one value');
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
            throw new FormulaError('MEDIAN: all values must be numbers', '#VALUE!');
        }
        arr.push(n);
        allDates &&= isDateValue(v);
    }
    if (arr.length === 0) {
        throw new FormulaError('MEDIAN: requires at least one value');
    }
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    const med = arr.length % 2 === 1 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    return allDates ? dateFromDays(med) : med;
};

export const RAND = (): number => Math.random();

export const SUMIF = ({ args }: FormulaFunctionParams): number => {
    const [critRange, criteria, sumRange] = takeBetween(args, 'SUMIF', 2, 3);

    if (!isRangeParam(critRange)) {
        throw new FormulaError('SUMIF: first argument must be a range', '#VALUE!');
    }
    if (!isValueParam(criteria)) {
        throw new FormulaError('SUMIF: second argument must be a value (criteria)', '#VALUE!');
    }
    if (sumRange && !isRangeParam(sumRange)) {
        throw new FormulaError('SUMIF: third argument must be a range (sum_range)', '#VALUE!');
    }

    const pred = criteriaToPredicate(criteria.value);

    // No sum_range → sum over critRange itself (Excel behavior).
    if (!sumRange) {
        let acc = 0;
        for (const v of critRange) {
            if (pred(v)) {
                const n = coerceFiniteNumber('SUMIF', v);
                if (n != null) {
                    acc += n; // non-numerics ignored
                }
            }
        }
        return acc;
    }

    const critRangeHeight = critRange.rowEnd - critRange.rowStart;
    const sumRangeHeight = sumRange.rowEnd - sumRange.rowStart;
    if (critRangeHeight !== sumRangeHeight) {
        throw new FormulaError('SUMIF: ranges have different sizes', '#VALUE!');
    }

    const critRangeIterator = critRange![Symbol.iterator]();
    const sumRangeIterator = sumRange[Symbol.iterator]();

    let total = 0;
    while (true) {
        const a = critRangeIterator.next();
        const b = sumRangeIterator.next();
        if (a.done || b.done) {
            if (a.done !== b.done) {
                throw new FormulaError('SUMIF: ranges have different sizes', '#VALUE!');
            }
            break;
        }
        if (pred(a.value)) {
            const n = coerceFiniteNumber('SUMIF', b.value);
            if (n != null) {
                total += n;
            }
        }
    }
    return total;
};
