import { BeanStub, RowNode, ServerSideGroupLevelParams } from "@ag-grid-community/core";
import { LazyCache } from "./lazyCache";
export declare class LazyBlockLoader extends BeanStub {
    private api;
    private rowNodeBlockLoader;
    static DEFAULT_BLOCK_SIZE: number;
    private loadingNodes;
    private readonly parentNode;
    private readonly cache;
    private checkForLoadQueued;
    private loaderTimeout;
    private nextBlockToLoad;
    private storeParams;
    constructor(cache: LazyCache, parentNode: RowNode, storeParams: ServerSideGroupLevelParams);
    private init;
    isRowLoading(index: number): boolean;
    private getBlockToLoad;
    reset(): void;
    private executeLoad;
    private getNextBlockToLoad;
    queueLoadCheck(): void;
    queueLoadAction(): void;
    private attemptLoad;
    getBlockSize(): number;
    getBlockStartIndexForIndex(storeIndex: number): number;
    getBlockBoundsForIndex(storeIndex: number): [number, number];
}
