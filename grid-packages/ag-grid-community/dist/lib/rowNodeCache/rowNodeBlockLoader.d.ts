import { RowNodeBlock } from "./rowNodeBlock";
import { BeanStub } from "../context/beanStub";
export declare class RowNodeBlockLoader extends BeanStub {
    private rowModel;
    static BLOCK_LOADED_EVENT: string;
    static BLOCK_LOADER_FINISHED_EVENT: string;
    private maxConcurrentRequests;
    private checkBlockToLoadDebounce;
    private activeBlockLoadsCount;
    private blocks;
    private logger;
    private active;
    private postConstruct;
    private setBeans;
    private getMaxConcurrentDatasourceRequests;
    addBlock(block: RowNodeBlock): void;
    removeBlock(block: RowNodeBlock): void;
    protected destroy(): void;
    loadComplete(): void;
    checkBlockToLoad(): void;
    private performCheckBlocksToLoad;
    getBlockState(): void | {
        [key: string]: any;
    };
    private printCacheStatus;
    isLoading(): boolean;
    registerLoads(count: number): void;
    getAvailableLoadingCount(): number | undefined;
}
