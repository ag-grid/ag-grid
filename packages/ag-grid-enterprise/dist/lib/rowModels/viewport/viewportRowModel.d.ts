// ag-grid-enterprise v19.1.3
import { IRowModel, RowNode, IViewportDatasource, RowBounds } from "ag-grid-community";
export declare class ViewportRowModel implements IRowModel {
    private gridOptionsWrapper;
    private eventService;
    private selectionController;
    private context;
    private gridApi;
    private columnApi;
    private firstRow;
    private lastRow;
    private rowCount;
    private rowNodesByIndex;
    private rowHeight;
    private viewportDatasource;
    private init;
    isLastRowFound(): boolean;
    private destroyDatasource;
    private calculateFirstRow;
    private calculateLastRow;
    private onViewportChanged;
    purgeRowsNotInViewport(): void;
    setViewportDatasource(viewportDatasource: IViewportDatasource): void;
    getType(): string;
    getRow(rowIndex: number): RowNode;
    getRowNode(id: string): RowNode;
    getPageFirstRow(): number;
    getPageLastRow(): number;
    getRowCount(): number;
    getRowIndexAtPixel(pixel: number): number;
    getRowBounds(index: number): RowBounds;
    getCurrentPageHeight(): number;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    private setRowData;
    private createBlankRowNode;
    setRowCount(rowCount: number): void;
    isRowPresent(rowNode: RowNode): boolean;
}
//# sourceMappingURL=viewportRowModel.d.ts.map