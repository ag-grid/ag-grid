// Type definitions for ag-grid v5.0.6
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../entities/rowNode";
import { IRowModel } from "./../interfaces/iRowModel";
export declare class VirtualPageRowModel implements IRowModel {
    private rowRenderer;
    private gridOptionsWrapper;
    private filterManager;
    private sortController;
    private selectionController;
    private eventService;
    private context;
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
    private rowHeight;
    init(): void;
    getType(): string;
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
    getRowCombinedHeight(): number;
    getRowIndexAtPixel(pixel: number): number;
    getRowCount(): number;
    setRowData(rows: any[], refresh: boolean, firstId?: number): void;
    forEachNodeAfterFilter(callback: (rowNode: RowNode) => void): void;
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode) => void): void;
    refreshModel(): void;
    getTopLevelNodes(): RowNode[];
}
