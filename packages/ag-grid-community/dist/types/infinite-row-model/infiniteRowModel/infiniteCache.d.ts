import type { BeanCollection, IDatasource, RowNode, RowNodeBlockLoader, RowRenderer, SortModelItem } from 'ag-grid-community';
import { BeanStub, NumberSequence } from 'ag-grid-community';
import { InfiniteBlock } from './infiniteBlock';
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
    protected rowRenderer: RowRenderer;
    private focusService;
    wireBeans(beans: BeanCollection): void;
    private readonly params;
    private rowCount;
    private lastRowIndexKnown;
    private blocks;
    private blockCount;
    constructor(params: InfiniteCacheParams);
    getRow(rowIndex: number, dontCreatePage?: boolean): RowNode | undefined;
    private createBlock;
    refreshCache(): void;
    destroy(): void;
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
