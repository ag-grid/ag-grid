import { RowNode } from "./rowNode";
export interface RowPosition {
    rowIndex: number;
    rowPinned: string | undefined;
}
export declare class RowPositionUtils {
    private rowModel;
    private pinnedRowModel;
    getRowNode(gridRow: RowPosition): RowNode | null;
    sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean;
    before(rowA: RowPosition, rowB: RowPosition): boolean;
}
