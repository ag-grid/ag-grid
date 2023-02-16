import { NumberSequence } from "../utils";
import { RowBounds } from "./iRowModel";
import { IRowNode } from "./iRowNode";
import { ServerSideTransaction, ServerSideTransactionResult } from "./serverSideTransaction";
export interface IServerSideStore {
    clearDisplayIndexes(): void;
    getDisplayIndexEnd(): number | undefined;
    isDisplayIndexInStore(displayIndex: number): boolean;
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    forEachStoreDeep(callback: (rowNode: IServerSideStore, index: number) => void, sequence?: NumberSequence): void;
    forEachNodeDeep(callback: (rowNode: IRowNode, index: number) => void, sequence?: NumberSequence): void;
    forEachNodeDeepAfterFilterAndSort(callback: (rowNode: IRowNode, index: number) => void, sequence?: NumberSequence): void;
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
/** @deprecated use ServerSideGroupLevelState instead  */
export interface ServerSideGroupState extends ServerSideGroupLevelState {
}
