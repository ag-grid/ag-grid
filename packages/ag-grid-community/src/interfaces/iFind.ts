import type { ColDef } from '../entities/colDef';
import type { Column } from './iColumn';
import type { IRowNode } from './iRowNode';

export interface FindMatch<TData = any, TValue = any> {
    node: IRowNode<TData>;
    column: Column<TValue>;
    /**
     * The number of the match within the cell (starting from `1`).
     */
    numInMatch: number;
    /** The number of the match within all the matches in the grid (starting from `1`) */
    numOverall: number;
}

export interface IFindService {
    totalMatches: number;

    activeMatch: FindMatch | undefined;

    isMatch(node: IRowNode, column: Column): boolean;

    getParts(params: FindCellValueParams): FindPart[];

    next(): void;

    previous(): void;

    goTo(match: number): void;

    getNumMatches(node: IRowNode, column: Column): number;

    setupGroupCol(colDef: ColDef): void;
}

export interface FindOptions {
    /**
     * Match values in the current page only (when pagination enabled).
     */
    currentPageOnly?: boolean;
    /**
     * Match case of values.
     */
    caseSensitive?: boolean;
}

export interface FindCellParams<TData = any, TValue = any> {
    node: IRowNode<TData>;
    column: Column<TValue>;
}

export interface FindCellValueParams<TData = any, TValue = any> extends FindCellParams<TData, TValue> {
    /** Display value to search within. */
    value: string;
}

export interface FindPart {
    /** Partial display value. */
    value: string;
    /** `true` if a match. */
    match?: boolean;
    /** `true` if the active match. */
    activeMatch?: boolean;
}
