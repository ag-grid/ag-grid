import { RowNode } from "../entities/rowNode";
import { RowPinnedType } from "../interfaces/iRowNode";
import { BeanStub } from "../context/beanStub";
export declare class PinnedRowModel extends BeanStub {
    private beans;
    private pinnedTopRows;
    private pinnedBottomRows;
    init(): void;
    isEmpty(floating: RowPinnedType): boolean;
    isRowsToRender(floating: RowPinnedType): boolean;
    getRowAtPixel(pixel: number, floating: RowPinnedType): number;
    setPinnedTopRowData(rowData: any[] | undefined): void;
    setPinnedBottomRowData(rowData: any[] | undefined): void;
    private createNodesFromData;
    getPinnedTopRowData(): RowNode[];
    getPinnedBottomRowData(): RowNode[];
    getPinnedTopTotalHeight(): number;
    getPinnedTopRowCount(): number;
    getPinnedBottomRowCount(): number;
    getPinnedTopRow(index: number): RowNode | undefined;
    getPinnedBottomRow(index: number): RowNode | undefined;
    forEachPinnedTopRow(callback: (rowNode: RowNode, index: number) => void): void;
    forEachPinnedBottomRow(callback: (rowNode: RowNode, index: number) => void): void;
    getPinnedBottomTotalHeight(): number;
    private getTotalHeight;
}
