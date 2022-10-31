// Type definitions for @ag-grid-community/core v28.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export interface RowNodeTransaction<TData = any> {
    /** Row nodes added */
    add: RowNode<TData>[];
    /** Row nodes removed */
    remove: RowNode<TData>[];
    /** Row nodes updated */
    update: RowNode<TData>[];
}
