// Type definitions for @ag-community/grid-core v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export interface RowNodeTransaction {
    add: RowNode[];
    remove: RowNode[];
    update: RowNode[];
}
