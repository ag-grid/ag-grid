// ag-grid-enterprise v19.1.3
import { ColumnVO, IServerSideCache, IServerSideDatasource, NumberSequence, RowNode, RowNodeCache, RowNodeCacheParams, RowBounds } from "ag-grid-community";
import { ServerSideBlock } from "./serverSideBlock";
export interface ServerSideCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource: IServerSideDatasource;
    lastAccessedSequence: NumberSequence;
}
export declare class ServerSideCache extends RowNodeCache<ServerSideBlock, ServerSideCacheParams> implements IServerSideCache {
    private eventService;
    private context;
    private gridOptionsWrapper;
    private displayIndexStart;
    private displayIndexEnd;
    private readonly parentRowNode;
    private cacheTop;
    private cacheHeight;
    private blockHeights;
    constructor(cacheParams: ServerSideCacheParams, parentRowNode: RowNode);
    private setBeans;
    protected init(): void;
    getRowBounds(index: number): RowBounds;
    protected destroyBlock(block: ServerSideBlock): void;
    getRowIndexAtPixel(pixel: number): number;
    clearRowTops(): void;
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    getRow(displayRowIndex: number, dontCreateBlock?: boolean): RowNode;
    private createBlock;
    getDisplayIndexEnd(): number;
    isDisplayIndexInCache(displayIndex: number): boolean;
    getChildCache(keys: string[]): ServerSideCache;
    isPixelInRange(pixel: number): boolean;
    removeFromCache(items: any[]): void;
    addToCache(items: any[], indexToInsert: number): void;
    private moveItemsDown;
    private insertItems;
    refreshCacheAfterSort(changedColumnsInSort: string[], rowGroupColIds: string[]): void;
}
//# sourceMappingURL=serverSideCache.d.ts.map