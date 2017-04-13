// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { NumberSequence } from "../../utils";
import { RowNode } from "../../entities/rowNode";
import { IDatasource } from "../iDatasource";
import { InfiniteBlock } from "./infiniteBlock";
export interface RowNodeCacheParams {
    initialRowCount: number;
    pageSize: number;
    overflowSize: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
}
export interface InfiniteCacheParams extends RowNodeCacheParams {
    maxBlocksInCache: number;
    maxConcurrentRequests: number;
    sortModel: any;
    filterModel: any;
    datasource: IDatasource;
}
export declare abstract class RowNodeCache {
    private virtualRowCount;
    private maxRowFound;
    private rowNodeCacheParams;
    private active;
    constructor(params: RowNodeCacheParams);
    isActive(): boolean;
    getVirtualRowCount(): number;
    hack_setVirtualRowCount(virtualRowCount: number): void;
    isMaxRowFound(): boolean;
    destroy(): void;
    protected checkVirtualRowCount(page: InfiniteBlock, lastRow: any): void;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    protected abstract dispatchModelUpdated(): void;
}
export declare class InfiniteCache extends RowNodeCache {
    private eventService;
    private context;
    private blocks;
    private activePageLoadsCount;
    private blocksCount;
    private cacheParams;
    private logger;
    constructor(params: InfiniteCacheParams);
    getRowBounds(index: number): {
        rowTop: number;
        rowHeight: number;
    };
    private setBeans(loggerFactory);
    private init();
    getCurrentPageHeight(): number;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    getRowIndexAtPixel(pixel: number): number;
    private moveItemsDown(page, moveFromIndex, moveCount);
    private insertItems(page, indexToInsert, items);
    insertItemsAtIndex(indexToInsert: number, items: any[]): void;
    getRowCount(): number;
    private onPageLoaded(event);
    getRow(rowIndex: number, dontCreatePage?: boolean): RowNode;
    private createBlock(blockNumber);
    private removeBlockFromCache(pageToRemove);
    private printCacheStatus();
    private checkBlockToLoad();
    private findLeastRecentlyUsedPage(pageToExclude);
    protected dispatchModelUpdated(): void;
    getPageState(): any;
    refreshCache(): void;
    purgeCache(): void;
}
