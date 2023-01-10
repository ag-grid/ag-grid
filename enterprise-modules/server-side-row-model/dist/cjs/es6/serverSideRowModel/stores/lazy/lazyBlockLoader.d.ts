import { BeanStub, RowNode, ServerSideGroupLevelParams } from "@ag-grid-community/core";
import { LazyCache } from "./lazyCache";
export declare class LazyBlockLoader extends BeanStub {
    private api;
    private columnApi;
    private rowNodeBlockLoader;
    static DEFAULT_BLOCK_SIZE: number;
    private loadingNodes;
    private readonly parentNode;
    private readonly cache;
    private loaderTimeout;
    private nextBlockToLoad;
    private storeParams;
    constructor(cache: LazyCache, parentNode: RowNode, storeParams: ServerSideGroupLevelParams);
    private init;
    isRowLoading(index: number): boolean;
    private doesRowNeedLoaded;
    private getBlocksToLoad;
    private getNodeRanges;
    reset(): void;
    private executeLoad;
    private isBlockInViewport;
    private getNextBlockToLoad;
    queueLoadAction(): void;
    private attemptLoad;
    getBlockSize(): number;
    getBlockStartIndexForIndex(storeIndex: number): number;
    getBlockBoundsForIndex(storeIndex: number): [number, number];
}
