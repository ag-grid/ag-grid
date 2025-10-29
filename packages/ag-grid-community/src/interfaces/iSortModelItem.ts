export interface SortModelItem {
    /** Column Id to apply the sort to. */
    colId: string;
    /** Sort direction */
    sort: 'asc' | 'desc';
    /** Sort type, undefined value means 'default' sort type */
    sortType?: 'absolute';
}
