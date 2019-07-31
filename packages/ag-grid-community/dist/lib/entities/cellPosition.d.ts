// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "./column";
import { RowPosition } from "./rowPosition";
export interface CellPosition extends RowPosition {
    column: Column;
}
export declare class CellPositionUtils {
    static createId(cellPosition: CellPosition): string;
    static equals(cellA: CellPosition, cellB: CellPosition): boolean;
}
