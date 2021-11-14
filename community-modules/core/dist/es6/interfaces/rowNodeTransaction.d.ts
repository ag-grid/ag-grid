// Type definitions for @ag-grid-community/core v26.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export interface RowNodeTransaction {
    /** Row nodes added */
    add: RowNode[];
    /** Row nodes removed */
    remove: RowNode[];
    /** Row nodes updated */
    update: RowNode[];
}
