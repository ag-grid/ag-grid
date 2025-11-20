import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from './iRowNode';

// Value argument
export interface ValueParam {
    kind: 'value';
    value: unknown;
}

// Range argument
export interface RangeParam extends Iterable<unknown> {
    kind: 'range';
    rowStart: number; // inclusive
    rowEnd: number; // inclusive
    colStart: AgColumn; // inclusive
    colEnd: AgColumn; // inclusive
}

export type FormulaParam = ValueParam | RangeParam;

export type FormulaFunctionParams = {
    row: IRowNode;
    column: AgColumn;
    args: Iterable<FormulaParam>; // top level params iterator only
    values: Iterable<unknown>; // flattens all ranges and top level params
};

export interface IFormulaService extends Bean {
    isFormula(value: unknown): value is `=${string}`;
    resolveValue(col: AgColumn, row: RowNode): unknown;
    getFormulaError(col: AgColumn, row: RowNode): Error | null;
    normaliseFormula(value: string, shorthand: boolean): string | null;
    getColByRef(ref: string): AgColumn | null;
    getColRef(col: AgColumn): string | null;
    updateFormulaByOffset(value: string, direction: 'up' | 'down' | 'left' | 'right'): string;
    refreshFormulas(refreshRows: boolean): void;
    getFunction(name: string): ((params: FormulaFunctionParams) => unknown) | undefined;
}
