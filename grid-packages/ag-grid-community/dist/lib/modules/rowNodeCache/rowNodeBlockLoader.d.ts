import { IRowNodeBlock } from "../../interfaces/iRowNodeBlock";
export declare class RowNodeBlockLoader {
    private readonly maxConcurrentRequests;
    private readonly checkBlockToLoadDebounce;
    private activeBlockLoadsCount;
    private blocks;
    private logger;
    private active;
    constructor(maxConcurrentRequests: number, blockLoadDebounceMillis: number | undefined);
    private setBeans;
    addBlock(block: IRowNodeBlock): void;
    removeBlock(block: IRowNodeBlock): void;
    destroy(): void;
    loadComplete(): void;
    checkBlockToLoad(): void;
    private performCheckBlocksToLoad;
    getBlockState(): any;
    private printCacheStatus;
    isLoading(): boolean;
}
