// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { AbstractColDef } from "./colDef";
export interface ColumnGroupChild {
    getActualWidth(): number;
    getMinWidth(): number;
    getDefinition(): AbstractColDef;
    getColumnGroupShow(): string;
}
