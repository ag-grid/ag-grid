// Type definitions for @ag-grid-community/core v31.0.3
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface RowDataTransaction<TData = any> {
    /** Index to add rows */
    addIndex?: number | null;
    /** Rows to add */
    add?: TData[] | null;
    /** Rows to remove */
    remove?: TData[] | null;
    /** Rows to update */
    update?: TData[] | null;
}
