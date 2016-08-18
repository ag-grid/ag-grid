// Type definitions for ag-grid v5.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { NumberSequence } from "../../utils";
import { RowNode } from "../../entities/rowNode";
import { IDatasource } from "../iDatasource";
export interface CacheParams {
    pageSize: number;
    rowHeight: number;
    maxPagesInCache: number;
    maxConcurrentDatasourceRequests: number;
    paginationOverflowSize: number;
    paginationInitialRowCount: number;
    sortModel: any;
    filterModel: any;
    datasource: IDatasource;
    lastAccessedSequence: NumberSequence;
}
export declare class VirtualPageCache {
    private eventService;
    private context;
    private pages;
    private activePageLoadsCount;
    private pagesInCacheCount;
    private cacheParams;
    private virtualRowCount;
    private maxRowFound;
    private logger;
    private active;
    constructor(cacheSettings: CacheParams);
    private setBeans(loggerFactory);
    private init();
    getRowCombinedHeight(): number;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    getRowIndexAtPixel(pixel: number): number;
    private moveItemsDown(page, moveFromIndex, moveCount);
    private insertItems(page, indexToInsert, items);
    insertItemsAtIndex(indexToInsert: number, items: any[]): void;
    getRowCount(): number;
    private onPageLoaded(event);
    destroy(): void;
    getRow(rowIndex: number, dontCreatePage?: boolean): RowNode;
    private createPage(pageNumber);
    private removePageFromCache(pageToRemove);
    private printCacheStatus();
    private checkPageToLoad();
    private findLeastRecentlyUsedPage(pageToExclude);
    private checkVirtualRowCount(page, lastRow);
    private dispatchModelUpdated();
    getPageState(): any;
    refreshVirtualPageCache(): void;
    purgeVirtualPageCache(): void;
    getVirtualRowCount(): number;
    isMaxRowFound(): boolean;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
}
