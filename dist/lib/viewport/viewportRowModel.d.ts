// ag-grid-enterprise v8.0.0
import { IRowModel, RowNode, IViewportDatasource } from "ag-grid/main";
export declare class ViewportRowModel implements IRowModel {
    private gridOptionsWrapper;
    private eventService;
    private selectionController;
    private context;
    private firstRow;
    private lastRow;
    private rowCount;
    private rowNodesByIndex;
    private rowHeight;
    private viewportDatasource;
    private init();
    private destroy();
    private destroyCurrentDatasource();
    private calculateFirstRow(firstRenderedRow);
    private calculateLastRow(lastRenderedRow);
    private onViewportChanged(event);
    purgeRowsNotInViewport(): void;
    setViewportDatasource(viewportDatasource: IViewportDatasource): void;
    getType(): string;
    getRow(rowIndex: number): RowNode;
    getRowCount(): number;
    getRowIndexAtPixel(pixel: number): number;
    getRowCombinedHeight(): number;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    private setRowData(rowData);
    private createBlankRowNode(rowIndex);
    setRowCount(rowCount: number): void;
    insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void;
    removeItems(rowNodes: RowNode[], skipRefresh: boolean): void;
    addItems(item: any[], skipRefresh: boolean): void;
    isRowPresent(rowNode: RowNode): boolean;
}
