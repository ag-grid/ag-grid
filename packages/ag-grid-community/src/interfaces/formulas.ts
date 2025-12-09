import type { ColumnCollections } from '../columns/columnModel';
import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { AgGridCommon } from './iCommon';
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

/** A map of 'function name' to 'function' for custom functions that are used for formulas */
export type FormulaFuncs = { [key: string]: { func: (params: FormulaFunctionParams) => any } };

export type FormulaFunctionParams = {
    /** Row for this formula */
    row: IRowNode;
    /** Column for this formula */
    column: AgColumn;
    /** Top level params iterator only. */
    args: Iterable<FormulaParam>;
    /** Flattens all ranges and top level params */
    values: Iterable<unknown>;
};

export interface GetFormulaParams {
    column: AgColumn;
    rowNode: IRowNode;
}

export interface SetFormulaParams extends GetFormulaParams {
    formula: string | undefined;
    /** Optional computed value associated with the formula. */
    value?: unknown;
}

export interface FormulaDataSourceParams extends AgGridCommon<any, any> {}

/**
 * Control where formula data is stored/retrieved from.
 * Idea for implementation could be to store the formula back into the row data
 * Idea for implementation could be to have a separate map store for formulas
 */
export interface FormulaDataSource {
    /** Initialise the data source so that the user can take a reference to the gridApi if they are going to need it. */
    init?(params: FormulaDataSourceParams): void;
    /** Return the formula string for the given cell. */
    getFormula(params: GetFormulaParams): string | undefined;
    /** Set the formula string for the given cell. */
    setFormula(params: SetFormulaParams): void;
    /** Called by the grid when the data source is being disposed. */
    destroy?(): void;
}

export interface IFormulaDataService extends Bean {
    hasDataSource(): boolean;
    getFormula(params: GetFormulaParams): string | undefined;
    setFormula(params: SetFormulaParams): void;
}

export interface IFormulaService extends Bean {
    active: boolean;
    isFormula(value: unknown): value is `=${string}`;
    setFormulasActive(cols: ColumnCollections): void;
    resolveValue(col: AgColumn, row: RowNode): unknown;
    getFormulaError(col: AgColumn, row: RowNode): Error | null;
    normaliseFormula(value: string, shorthand: boolean): string | null;
    getColByRef(ref: string): AgColumn | null;
    getColRef(col: AgColumn): string | null;
    updateFormulaByOffset(params: {
        value: string;
        rowDelta?: number;
        columnDelta?: number;
        useRefFormat?: boolean;
    }): string;
    refreshFormulas(refreshRows: boolean): void;
    getFunction(name: string): ((params: FormulaFunctionParams) => unknown) | undefined;
}
