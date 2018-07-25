// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
import { IDatasource } from "../iDatasource";
import { InfiniteBlock } from "./infiniteBlock";
import { RowNodeCache, RowNodeCacheParams } from "../cache/rowNodeCache";
export interface InfiniteCacheParams extends RowNodeCacheParams {
    datasource: IDatasource;
}
export declare class InfiniteCache extends RowNodeCache<InfiniteBlock, InfiniteCacheParams> {
    private eventService;
    private context;
    private columnApi;
    private gridApi;
    constructor(params: InfiniteCacheParams);
    private setBeans(loggerFactory);
    protected init(): void;
    private moveItemsDown(block, moveFromIndex, moveCount);
    private insertItems(block, indexToInsert, items);
    insertItemsAtIndex(indexToInsert: number, items: any[]): void;
    getRow(rowIndex: number, dontCreatePage?: boolean): RowNode;
    private createBlock(blockNumber);
    refreshCache(): void;
}
