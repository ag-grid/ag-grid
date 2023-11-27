import { ColumnApi } from '../columns/columnApi';
import { GridApi } from '../gridApi';
declare type TypeOrNull<T> = T | null;
declare type ApiRef = {
    /** api of the grid to align with. */
    api?: TypeOrNull<GridApi>;
    /** @deprecated v31 ColumnApi is no longer required for aligned grids. */
    columnApi?: TypeOrNull<ColumnApi>;
} | null;
/**
 * Alias for the grid API or an object containing the grid API for linking Aligned Grids.
 */
export declare type AlignedGrid = TypeOrNull<GridApi> | ApiRef | {
    current: ApiRef;
};
export {};
