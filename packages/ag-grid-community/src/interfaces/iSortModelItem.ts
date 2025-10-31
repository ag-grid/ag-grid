import type { SortDirection, SortType } from '../entities/colDef';

export interface SortModelItem {
    /** Column Id to apply the sort to. */
    colId: string;
    /** Sort direction */
    sort: SortDirection;
    /** Sort type */
    type?: SortType;
}
