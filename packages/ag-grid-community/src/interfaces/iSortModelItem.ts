import type { SortDirection, SortType } from '../entities/colDef';

export interface SortModelItem {
    /** Column Id to apply the sort to. */
    colId: string;
    /** Sort direction */
    sort: NonNullable<SortDirection>;
    /** Sort type */
    type?: SortType;
}
