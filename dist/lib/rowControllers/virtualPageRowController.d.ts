// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../entities/rowNode";
import { IRowModel } from "./../interfaces/iRowModel";
export declare class VirtualPageRowController implements IRowModel {
    private rowRenderer;
    private gridOptionsWrapper;
    private filterManager;
    private sortController;
    private selectionController;
    private eventService;
    private datasourceVersion;
    private datasource;
    private virtualRowCount;
    private foundMaxRow;
    private pageCache;
    private pageCacheSize;
    private pageLoadsInProgress;
    private pageLoadsQueued;
    private pageAccessTimes;
    private accessTime;
    private maxConcurrentDatasourceRequests;
    private maxPagesInCache;
    private pageSize;
    private overflowSize;
    init(): void;
    getTopLevelNodes(): RowNode[];
    setDatasource(datasource: any): void;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    private reset();
    private createNodesFromRows(pageNumber, rows);
    private createNode(data, virtualRowIndex, realNode);
    private removeFromLoading(pageNumber);
    private pageLoadFailed(pageNumber);
    private pageLoaded(pageNumber, rows, lastRow);
    private putPageIntoCacheAndPurge(pageNumber, rows);
    private checkMaxRowAndInformRowRenderer(pageNumber, lastRow);
    private isPageAlreadyLoading(pageNumber);
    private doLoadOrQueue(pageNumber);
    private addToQueueAndPurgeQueue(pageNumber);
    private findLeastRecentlyAccessedPage(pageIndexes);
    private checkQueueForNextLoad();
    private loadPage(pageNumber);
    expandOrCollapseAll(expand: boolean): void;
    private requestIsDaemon(datasourceVersionCopy);
    getRow(rowIndex: number): RowNode;
    forEachNode(callback: (rowNode: RowNode) => void): void;
    getRowHeightAsNumber(): number;
    getRowCombinedHeight(): number;
    getRowAtPixel(pixel: number): number;
    getRowCount(): number;
    setRowData(rows: any[], refresh: boolean, firstId?: number): void;
    forEachNodeAfterFilter(callback: (rowNode: RowNode) => void): void;
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode) => void): void;
    refreshModel(): void;
}
