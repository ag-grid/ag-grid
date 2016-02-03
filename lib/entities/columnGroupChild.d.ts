// Type definitions for ag-grid v3.3.0-alpha.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { AbstractColDef } from "./colDef";
export interface ColumnGroupChild {
    getActualWidth(): number;
    getMinimumWidth(): number;
    getDefinition(): AbstractColDef;
    getColumnGroupShow(): string;
}
