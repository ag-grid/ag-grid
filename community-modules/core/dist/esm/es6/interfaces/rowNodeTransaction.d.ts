// Type definitions for @ag-grid-community/core v27.0.1
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
