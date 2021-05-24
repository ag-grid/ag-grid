// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { RowNode } from "./rowNode";
export interface RowPosition {
    rowIndex: number;
    rowPinned: string | null;
}
export declare class RowPositionUtils extends BeanStub {
    private rowModel;
    private pinnedRowModel;
    private paginationProxy;
    getFirstRow(): RowPosition | null;
    getLastRow(): RowPosition | null;
    getRowNode(gridRow: RowPosition): RowNode | null;
    sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean;
    before(rowA: RowPosition, rowB: RowPosition): boolean;
}
