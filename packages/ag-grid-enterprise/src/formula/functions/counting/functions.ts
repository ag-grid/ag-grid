import type { FormulaFunctionParams } from 'ag-grid-community';

import { FormulaError } from '../../ast/utils';
import { criteriaToPredicate, isRangeParam, isValueParam, take } from '../utils';

export const COUNT = ({ values }: FormulaFunctionParams): number => {
    let count = 0;
    for (const v of values) {
        if (!isNaN(v as any)) {
            count++;
        }
    }
    return count;
};

export const COUNTA = ({ values }: FormulaFunctionParams): number => {
    let count = 0;
    for (const v of values) {
        if (v != null && v !== '') {
            count++;
        }
    }
    return count;
};

export const COUNTBLANK = ({ values }: FormulaFunctionParams): number => {
    let count = 0;
    for (const v of values) {
        if (v == null || v === '') {
            count++;
        }
    }
    return count;
};

export const COUNTIF = ({ args }: FormulaFunctionParams): number => {
    const [range, criteria] = take(args, 'COUNTIF', 2);
    if (!isRangeParam(range)) {
        throw new FormulaError('COUNTIF: first argument must be a range', '#VALUE!');
    }
    if (!isValueParam(criteria)) {
        throw new FormulaError('COUNTIF: second argument must be a value (criteria)', '#VALUE!');
    }

    const pred = criteriaToPredicate(criteria.value);

    let count = 0;
    for (const v of range) {
        if (pred(v)) {
            count++;
        }
    }
    return count;
};
