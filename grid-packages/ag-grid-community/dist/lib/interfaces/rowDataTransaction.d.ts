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
