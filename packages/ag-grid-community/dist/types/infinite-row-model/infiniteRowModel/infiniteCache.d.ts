import { BeanStub, IDatasource, NumberSequence, RowNode, RowNodeBlockLoader, RowRenderer, SortModelItem } from "ag-grid-community";
import { InfiniteBlock } from "./infiniteBlock";
export interface InfiniteCacheParams {
    datasource: IDatasource;
    initialRowCount: number;
    blockSize?: number;
    overflowSize: number;
    sortModel: SortModelItem[];
    filterModel: any;
    maxBlocksInCache?: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
    rowNodeBlockLoader?: RowNodeBlockLoader;
    dynamicRowHeight: boolean;
}
export declare class InfiniteCache extends BeanStub {
    private static MAX_EMPTY_BLOCKS_TO_KEEP;
    protected rowRenderer: RowRenderer;
    private focusService;
    private readonly params;
    private rowCount;
    private lastRowIndexKnown;
    private blocks;
    private blockCount;
    private logger;
    constructor(params: InfiniteCacheParams);
    private setBeans;
    getRow(rowIndex: number, dontCreatePage?: boolean): RowNode | undefined;
    private createBlock;
    refreshCache(): void;
    private destroyAllBlocks;
    getRowCount(): number;
    isLastRowIndexKnown(): boolean;
    pageLoaded(block: InfiniteBlock, lastRow?: number): void;
    private purgeBlocksIfNeeded;
    private isBlockFocused;
    private isBlockCurrentlyDisplayed;
    private removeBlockFromCache;
    private checkRowCount;
    setRowCount(rowCount: number, lastRowIndexKnown?: boolean): void;
    forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void): void;
    getBlocksInOrder(): InfiniteBlock[];
    private destroyBlock;
    private onCacheUpdated;
    private destroyAllBlocksPastVirtualRowCount;
    purgeCache(): void;
    getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
}
