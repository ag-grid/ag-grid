import type { AgColumn } from '../../entities/agColumn';
import type { IRowNode } from '../../interfaces/iRowNode';

// Value argument
export interface ValueParam {
    kind: 'value';
    value: unknown;
}

// Range argument (no row/col expansion; iteration is lazy)
export interface RangeParam extends Iterable<unknown> {
    kind: 'range';
    rowStart: number; // inclusive, 1-based
    rowEnd: number; // inclusive, 1-based
    colStart: AgColumn; // inclusive
    colEnd: AgColumn; // inclusive
}

export type FormulaParam = ValueParam | RangeParam;

export type FormulaFunctionParams = {
    row: IRowNode;
    column: AgColumn;
    args: Iterable<FormulaParam>; // structured args (Arg) if you need shape
    values: Iterable<unknown>; // **raw values** only (flattened)
};
