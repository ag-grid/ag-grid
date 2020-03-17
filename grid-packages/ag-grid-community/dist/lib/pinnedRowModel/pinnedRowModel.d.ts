import { RowNode } from "../entities/rowNode";
export declare class PinnedRowModel {
    private gridOptionsWrapper;
    private eventService;
    private context;
    private columnApi;
    private gridApi;
    private pinnedTopRows;
    private pinnedBottomRows;
    init(): void;
    isEmpty(floating: string): boolean;
    isRowsToRender(floating: string): boolean;
    getRowAtPixel(pixel: number, floating: string): number;
    setPinnedTopRowData(rowData: any[] | undefined): void;
    setPinnedBottomRowData(rowData: any[] | undefined): void;
    private createNodesFromData;
    getPinnedTopRowData(): RowNode[];
    getPinnedBottomRowData(): RowNode[];
    getPinnedTopTotalHeight(): number;
    getPinnedTopRowCount(): number;
    getPinnedBottomRowCount(): number;
    getPinnedTopRow(index: number): RowNode;
    getPinnedBottomRow(index: number): RowNode;
    forEachPinnedTopRow(callback: (rowNode: RowNode, index: number) => void): void;
    forEachPinnedBottomRow(callback: (rowNode: RowNode, index: number) => void): void;
    getPinnedBottomTotalHeight(): number;
    private getTotalHeight;
}
