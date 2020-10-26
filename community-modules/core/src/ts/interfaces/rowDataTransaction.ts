export interface RowDataTransaction<T = any> {
    addIndex?: number;
    add?: T[];
    remove?: T[];
    update?: T[];
}
