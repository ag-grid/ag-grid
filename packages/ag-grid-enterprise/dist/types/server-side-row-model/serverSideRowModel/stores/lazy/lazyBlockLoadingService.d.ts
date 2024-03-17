import { BeanStub } from "ag-grid-community";
import { LazyCache } from "./lazyCache";
export declare class LazyBlockLoadingService extends BeanStub {
    static DEFAULT_BLOCK_SIZE: number;
    private rowNodeBlockLoader;
    private rowRenderer;
    private rowModel;
    private cacheLoadingNodesMap;
    private isCheckQueued;
    private nextBlockToLoad?;
    private loaderTimeout?;
    private init;
    subscribe(cache: LazyCache): void;
    unsubscribe(cache: LazyCache): void;
    /**
     * Queues a microtask to check if any blocks need to be loaded.
     */
    queueLoadCheck(): void;
    private queueLoadAction;
    private attemptLoad;
    private executeLoad;
    private getBlockToLoad;
    isRowLoading(cache: LazyCache, index: number): boolean;
}
