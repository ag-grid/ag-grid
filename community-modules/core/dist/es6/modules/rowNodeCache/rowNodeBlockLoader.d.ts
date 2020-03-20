// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
