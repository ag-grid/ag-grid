// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "../gridOptionsWrapper";
import { RowNode } from "../entities/rowNode";
export default class VirtualPageRowController {
    rowRenderer: any;
    datasourceVersion: any;
    gridOptionsWrapper: GridOptionsWrapper;
    angularGrid: any;
    datasource: any;
    virtualRowCount: any;
    foundMaxRow: any;
    pageCache: {
        [key: string]: RowNode[];
    };
    pageCacheSize: any;
    pageLoadsInProgress: any;
    pageLoadsQueued: any;
    pageAccessTimes: any;
    accessTime: any;
    maxConcurrentDatasourceRequests: any;
    maxPagesInCache: any;
    pageSize: any;
    overflowSize: any;
    init(rowRenderer: any, gridOptionsWrapper: any, angularGrid: any): void;
    setDatasource(datasource: any): void;
    reset(): void;
    createNodesFromRows(pageNumber: any, rows: any): any;
    private createNode(data, virtualRowIndex);
    removeFromLoading(pageNumber: any): void;
    pageLoadFailed(pageNumber: any): void;
    pageLoaded(pageNumber: any, rows: any, lastRow: any): void;
    putPageIntoCacheAndPurge(pageNumber: any, rows: any): void;
    checkMaxRowAndInformRowRenderer(pageNumber: any, lastRow: any): void;
    isPageAlreadyLoading(pageNumber: any): boolean;
    doLoadOrQueue(pageNumber: any): void;
    addToQueueAndPurgeQueue(pageNumber: any): void;
    findLeastRecentlyAccessedPage(pageIndexes: any): number;
    checkQueueForNextLoad(): void;
    loadPage(pageNumber: any): void;
    requestIsDaemon(datasourceVersionCopy: any): boolean;
    getVirtualRow(rowIndex: any): RowNode;
    forEachNode(callback: any): void;
    getRowHeightAsNumber(): number;
    getVirtualRowCombinedHeight(): number;
    getRowAtPixel(pixel: number): number;
    getModel(): {
        getRowAtPixel: (pixel: number) => number;
        getVirtualRowCombinedHeight: () => number;
        getVirtualRow: (index: any) => RowNode;
        getVirtualRowCount: () => any;
        forEachInMemory: (callback: any) => void;
        forEachNode: (callback: any) => void;
        forEachNodeAfterFilter: (callback: any) => void;
        forEachNodeAfterFilterAndSort: (callback: any) => void;
    };
}
