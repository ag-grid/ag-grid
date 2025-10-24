import type { FormulaFunctionParams } from 'ag-grid-community';

import { FormulaError } from '../../ast/utils';
import { take } from '../utils';

export const EQUALS = ({ values }: FormulaFunctionParams): boolean => {
    const [a, b] = take(values, 'EQUALS', 2);
    return a === b;
};

export const NOT_EQUALS = ({ values }: FormulaFunctionParams): boolean => {
    const [a, b] = take(values, 'NOT_EQUALS', 2);
    return a !== b;
};

export const GT = ({ values }: FormulaFunctionParams): boolean => {
    const [a, b] = take(values, 'GT', 2);
    return (a as any) > (b as any);
};

export const GTE = ({ values }: FormulaFunctionParams): boolean => {
    const [a, b] = take(values, 'GTE', 2);
    return (a as any) >= (b as any);
};

export const LT = ({ values }: FormulaFunctionParams): boolean => {
    const [a, b] = take(values, 'LT', 2);
    return (a as any) < (b as any);
};

export const LTE = ({ values }: FormulaFunctionParams): boolean => {
    const [a, b] = take(values, 'LTE', 2);
    return (a as any) <= (b as any);
};

export const IF = ({ values }: FormulaFunctionParams): unknown => {
    const [cond, valTrue, valFalse] = take(values, 'IF', 3);
    return cond ? valTrue : valFalse;
};

/**
 * Treated as logic as excel allows any values to be compared, not just numbers
 */
export const MIN = ({ values }: FormulaFunctionParams): any => {
    let best = null;
    for (const v of values) {
        if (v == null) {
            continue;
        }
        if (best === null || v < best) {
            best = v;
        }
    }
    if (best === null) {
        throw new FormulaError('MIN: requires at least one value');
    }
    return best;
};

/**
 * Treated as logic as excel allows any values to be compared, not just numbers
 */
export const MAX = ({ values }: FormulaFunctionParams): any => {
    let best = null;
    for (const v of values) {
        if (v == null) {
            continue;
        }
        if (best === null || v > best) {
            best = v;
        }
    }
    if (best === null) {
        throw new FormulaError('MAX: requires at least one value');
    }
    return best;
};
