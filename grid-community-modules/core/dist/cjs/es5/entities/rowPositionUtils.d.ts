// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { RowNode } from "./rowNode";
import { RowPinnedType } from "../interfaces/iRowNode";
export interface RowPosition {
    /** A positive number from 0 to n, where n is the last row the grid is rendering
    * or -1 if you want to navigate to the grid header */
    rowIndex: number;
    /** Either 'top', 'bottom' or null/undefined (for not pinned) */
    rowPinned: RowPinnedType;
}
export declare class RowPositionUtils extends BeanStub {
    private rowModel;
    private pinnedRowModel;
    private paginationProxy;
    getFirstRow(): RowPosition | null;
    getLastRow(): RowPosition | null;
    getRowNode(gridRow: RowPosition): RowNode | undefined;
    sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean;
    before(rowA: RowPosition, rowB: RowPosition): boolean;
    rowMax(rows: RowPosition[]): RowPosition | undefined;
    rowMin(rows: RowPosition[]): RowPosition | undefined;
}
