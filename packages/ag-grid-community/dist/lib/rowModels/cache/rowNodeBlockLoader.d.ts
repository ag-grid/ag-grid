// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNodeBlock } from "./rowNodeBlock";
export declare class RowNodeBlockLoader {
    private readonly maxConcurrentRequests;
    private readonly checkBlockToLoadDebounce;
    private activeBlockLoadsCount;
    private blocks;
    private logger;
    private active;
    constructor(maxConcurrentRequests: number, blockLoadDebounceMillis: number | undefined);
    private setBeans;
    addBlock(block: RowNodeBlock): void;
    removeBlock(block: RowNodeBlock): void;
    destroy(): void;
    loadComplete(): void;
    checkBlockToLoad(): void;
    private performCheckBlocksToLoad;
    getBlockState(): any;
    private printCacheStatus;
    isLoading(): boolean;
}
