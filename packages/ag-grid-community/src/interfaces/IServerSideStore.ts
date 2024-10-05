import type { Bean } from '../context/bean';
import type { NumberSequence } from '../utils/numberSequence';
import type { RowBounds } from './iRowModel';
import type { IRowNode } from './iRowNode';
import type { ServerSideTransaction, ServerSideTransactionResult } from './serverSideTransaction';

export interface IServerSideStore extends Bean {
    clearDisplayIndexes(): void;
    getDisplayIndexEnd(): number | undefined;
    isDisplayIndexInStore(displayIndex: number): boolean;
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: { value: number }, uiLevel: number): void;
    forEachStoreDeep(callback: (rowNode: IServerSideStore, index: number) => void): void;
    getStoresDeepIterator(): Generator<IServerSideStore>;
    forEachNodeDeep(callback: (rowNode: IRowNode, index: number) => void): void;
    getNodesDeepIterator(): Generator<IRowNode>;
    forEachNodeDeepAfterFilterAndSort(
        callback: (rowNode: IRowNode, index: number) => void,
        includeFooterNodes?: boolean
    ): void;
    getNodesDeepAfterFilterAndSortIterator(includeFooterNodes?: boolean): Generator<IRowNode>;
    retryLoads(): void;
    getRowUsingDisplayIndex(displayRowIndex: number, dontCreateBlock?: boolean): IRowNode | undefined;
    getRowBounds(index: number): RowBounds | null;
    isPixelInRange(pixel: number): boolean;
    getRowIndexAtPixel(pixel: number): number | null;
    getChildStore(keys: string[]): IServerSideStore | null;
    refreshAfterSort(params: StoreRefreshAfterParams): void;
    refreshAfterFilter(params: StoreRefreshAfterParams): void;
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult;
    refreshStore(purge: boolean): void;
    getRowCount(): number;
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number;
    isLastRowIndexKnown(): boolean;
    getRowNodesInRange(firstInRange: IRowNode, lastInRange: IRowNode): IRowNode[];
    addStoreStates(result: ServerSideGroupLevelState[]): void;
    getStoreBounds(): { topPx: number; heightPx: number };
}

export interface StoreRefreshAfterParams {
    valueColChanged: boolean;
    secondaryColChanged: boolean;
    changedColumns: string[];
}

export interface ServerSideGroupLevelState {
    /** True if suppressing infinite scrolling and loading all the data at the current level */
    suppressInfiniteScroll: boolean;
    /** The route that identifies this level. */
    route: string[];
    /** How many rows the level has. This includes 'loading rows'. */
    rowCount: number;
    /**
     * Infinite Scroll only.
     * Whether the last row index is know.
     * */
    lastRowIndexKnown?: boolean;
    /** Any extra info provided to the level, when data was loaded. */
    info?: any;
    /**
     *Infinite Scroll only.
     * Max blocks allowed in the infinite cache.
     */
    maxBlocksInCache?: number;
    /**
     * Infinite Scroll only.
     * The size (number of rows) of each infinite cache block.
     */
    cacheBlockSize?: number;
}
