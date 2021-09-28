import { NumberSequence } from "../utils";
import { RowNode } from "../entities/rowNode";
import { RowBounds } from "./iRowModel";
import { ServerSideTransaction, ServerSideTransactionResult } from "./serverSideTransaction";
import { ServerSideStoreType } from "../entities/gridOptions";
export interface IServerSideStore {
    clearDisplayIndexes(): void;
    getDisplayIndexEnd(): number | undefined;
    isDisplayIndexInStore(displayIndex: number): boolean;
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void;
    forEachNodeDeepAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void;
    retryLoads(): void;
    getRowUsingDisplayIndex(displayRowIndex: number, dontCreateBlock?: boolean): RowNode | undefined;
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
    getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    addStoreStates(result: ServerSideStoreState[]): void;
}
export interface StoreRefreshAfterParams {
    valueColChanged: boolean;
    secondaryColChanged: boolean;
    alwaysReset: boolean;
    changedColumns: string[];
}
export interface ServerSideStoreState {
    /** Store type, `partial` or `full` */
    type: ServerSideStoreType;
    /** The route that identifies this store. */
    route: string[];
    /** How many rows the store has. This includes 'loading rows'. */
    rowCount: number;
    /**
     * Partial store only.
     * Whether the last row index is know.
     * */
    lastRowIndexKnown?: boolean;
    /** Any extra info provided to the store, when data was loaded. */
    info?: any;
    /**
     * Partial store only.
     * Max blocks allowed in the store.
     */
    maxBlocksInCache?: number;
    /**
     * Partial store only.
     * The size (number of rows) of each block.
     */
    cacheBlockSize?: number;
}
