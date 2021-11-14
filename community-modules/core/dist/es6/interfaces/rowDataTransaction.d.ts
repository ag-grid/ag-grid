// Type definitions for @ag-grid-community/core v26.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface RowDataTransaction {
    /** Index to add rows */
    addIndex?: number | null;
    /** Rows to add */
    add?: any[] | null;
    /** Rows to remove */
    remove?: any[] | null;
    /** Rows to update */
    update?: any[] | null;
}
