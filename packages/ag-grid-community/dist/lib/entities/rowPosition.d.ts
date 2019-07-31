// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface RowPosition {
    rowIndex: number;
    rowPinned: string | undefined;
}
export declare class RowPositionUtils {
    static sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean;
    static before(rowA: RowPosition, rowB: RowPosition): boolean;
}
