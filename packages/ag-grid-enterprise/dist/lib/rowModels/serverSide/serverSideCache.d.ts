// ag-grid-enterprise v21.2.2
import { ColumnVO, IServerSideCache, IServerSideDatasource, NumberSequence, RowBounds, RowNode, RowNodeCache, RowNodeCacheParams } from "ag-grid-community";
import { ServerSideBlock } from "./serverSideBlock";
export interface ServerSideCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource?: IServerSideDatasource;
    lastAccessedSequence: NumberSequence;
}
export declare class ServerSideCache extends RowNodeCache<ServerSideBlock, ServerSideCacheParams> implements IServerSideCache {
    private eventService;
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
    getRow(displayRowIndex: number, dontCreateBlock?: boolean): RowNode | null;
    private getBlockSize;
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number;
    private createBlock;
    getDisplayIndexEnd(): number;
    isDisplayIndexInCache(displayIndex: number): boolean;
    getChildCache(keys: string[]): ServerSideCache | null;
    isPixelInRange(pixel: number): boolean;
    refreshCacheAfterSort(changedColumnsInSort: string[], rowGroupColIds: string[]): void;
}
