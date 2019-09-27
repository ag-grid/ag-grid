// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
import { BeanStub } from "../../context/beanStub";
import { RowNodeBlock } from "./rowNodeBlock";
import { Logger } from "../../logger";
import { RowNodeBlockLoader } from "./rowNodeBlockLoader";
import { AgEvent } from "../../events";
import { NumberSequence } from "../../utils";
export interface RowNodeCacheParams {
    initialRowCount: number;
    blockSize?: number;
    overflowSize: number;
    sortModel: any;
    filterModel: any;
    maxBlocksInCache?: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
    maxConcurrentRequests?: number;
    rowNodeBlockLoader?: RowNodeBlockLoader;
    dynamicRowHeight: boolean;
}
export interface CacheUpdatedEvent extends AgEvent {
}
export declare abstract class RowNodeCache<T extends RowNodeBlock, P extends RowNodeCacheParams> extends BeanStub {
    static EVENT_CACHE_UPDATED: string;
    private static MAX_EMPTY_BLOCKS_TO_KEEP;
    private virtualRowCount;
    private maxRowFound;
    protected cacheParams: P;
    private active;
    blocks: {
        [blockNumber: string]: T;
    };
    private blockCount;
    protected logger: Logger;
    abstract getRow(rowIndex: number): RowNode | null;
    protected constructor(cacheParams: P);
    destroy(): void;
    protected init(): void;
    isActive(): boolean;
    getVirtualRowCount(): number;
    hack_setVirtualRowCount(virtualRowCount: number): void;
    isMaxRowFound(): boolean;
    protected onPageLoaded(event: any): void;
    private purgeBlocksIfNeeded;
    protected postCreateBlock(newBlock: T): void;
    protected removeBlockFromCache(blockToRemove: T): void;
    protected checkBlockToLoad(): void;
    protected checkVirtualRowCount(block: T, lastRow: any): void;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void;
    forEachBlockInOrder(callback: (block: T, id: number) => void): void;
    protected forEachBlockInReverseOrder(callback: (block: T, id: number) => void): void;
    private forEachBlockId;
    protected getBlockIdsSorted(): number[];
    protected getBlock(blockId: string | number): T;
    protected setBlock(id: number, block: T): void;
    protected destroyBlock(block: T): void;
    protected onCacheUpdated(): void;
    purgeCache(): void;
    getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
}
