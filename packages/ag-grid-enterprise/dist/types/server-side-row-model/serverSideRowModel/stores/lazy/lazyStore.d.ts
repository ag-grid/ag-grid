import { BeanStub, IServerSideStore, NumberSequence, RowBounds, RowNode, ServerSideGroupLevelParams, ServerSideGroupLevelState, ServerSideTransaction, ServerSideTransactionResult, StoreRefreshAfterParams, Column, IRowNode, LoadSuccessParams } from "ag-grid-community";
import { SSRMParams } from "../../serverSideRowModel";
import { LazyCache } from "./lazyCache";
export declare class LazyStore extends BeanStub implements IServerSideStore {
    private blockUtils;
    private storeUtils;
    private columnModel;
    private selectionService;
    private displayIndexStart;
    private displayIndexEnd;
    private topPx;
    private heightPx;
    private readonly level;
    private readonly group;
    private readonly leafGroup;
    private readonly ssrmParams;
    private readonly storeParams;
    private readonly parentRowNode;
    private groupField;
    private rowGroupColumn;
    private idSequence;
    private cache;
    private info;
    constructor(ssrmParams: SSRMParams, storeParams: ServerSideGroupLevelParams, parentRowNode: RowNode);
    private init;
    private destroyRowNodes;
    /**
     * Given a server response, ingest the rows outside of the data source lifecycle.
     *
     * @param rowDataParams the server response containing the rows to ingest
     * @param startRow the index to start ingesting rows
     * @param expectedRows the expected number of rows in the response (used to determine if the last row index is known)
     */
    applyRowData(rowDataParams: LoadSuccessParams, startRow: number, expectedRows: number): void;
    /**
     * Applies a given transaction to the data set within this store
     *
     * @param transaction an object containing delta instructions determining the changes to apply to this store
     * @returns an object determining the status of this transaction and effected nodes
     */
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult;
    private updateSelectionAfterTransaction;
    /**
     * Clear the display indexes, used for fading rows out when stores are not being destroyed
     */
    clearDisplayIndexes(): void;
    /**
     * @returns an index representing the last sequentially displayed row in the grid for this store
     */
    getDisplayIndexStart(): number | undefined;
    /**
     * @returns the index representing one after the last sequentially displayed row in the grid for this store
     */
    getDisplayIndexEnd(): number | undefined;
    /**
     * @returns the virtual size of this store
     */
    getRowCount(): number;
    /**
     * Sets the current row count of the store, and whether the last row index is known
     */
    setRowCount(rowCount: number, isLastRowIndexKnown?: boolean): void;
    /**
     * Given a display index, returns whether that row is within this store or a child store of this store
     *
     * @param displayIndex the visible index of a row
     * @returns whether or not the row exists within this store
     */
    isDisplayIndexInStore(displayIndex: number): boolean;
    /**
     * Recursively sets up the display indexes and top position of every node belonging to this store.
     *
     * Called after a row height changes, or a store updated event.
     *
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
     */
    forEachStoreDeep(callback: (store: IServerSideStore, index: number) => void, sequence?: NumberSequence): void;
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
     */
    forEachNodeDeep(callback: (rowNode: RowNode<any>, index: number) => void, sequence?: NumberSequence): void;
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeep
     */
    forEachNodeDeepAfterFilterAndSort(callback: (rowNode: RowNode<any>, index: number) => void, sequence?: NumberSequence, includeFooterNodes?: boolean): void;
    /**
     * Removes the failed status from all nodes, and marks them as stub to encourage reloading
     */
    retryLoads(): void;
    /**
     * Given a display index, returns the row at that location.
     *
     * @param displayRowIndex the displayed index within the grid to search for
     * @returns the row node if the display index falls within the store, if it didn't exist this will create a new stub to return
     */
    getRowUsingDisplayIndex(displayRowIndex: number): IRowNode<any> | undefined;
    /**
     * Given a display index, returns the row top and height for the row at that index.
     *
     * @param displayIndex the display index of the node
     * @returns an object containing the rowTop and rowHeight of the node at the given displayIndex
     */
    getRowBounds(displayIndex: number): RowBounds | null;
    /**
     * Given a vertical pixel, determines whether this store contains a row at that pixel
     *
     * @param pixel a vertical pixel position from the grid
     * @returns whether that pixel points to a virtual space belonging to this store
     */
    isPixelInRange(pixel: number): boolean;
    /**
     * Given a vertical pixel, returns the row existing at that pixel location
     *
     * @param pixel a vertical pixel position from the grid
     * @returns the display index at the given pixel location
     */
    getRowIndexAtPixel(pixel: number): number | null;
    /**
     * Given a path of group keys, returns the child store for that group.
     *
     * @param keys the grouping path to the desired store
     * @returns the child store for the given keys, or null if not found
     */
    getChildStore(keys: string[]): IServerSideStore | null;
    /**
     * Executes a provided callback on each child store belonging to this store
     *
     * @param cb the callback to execute
     */
    private forEachChildStoreShallow;
    /**
     * Executes after a change to sorting, determines recursively whether this store or a child requires refreshed.
     *
     * If a purge refresh occurs, the row count is preserved.
     *
     * @param params a set of properties pertaining to the sort changes
     */
    refreshAfterSort(params: StoreRefreshAfterParams): void;
    /**
     * Executes after a change to filtering, determines recursively whether this store or a child requires refreshed.
     *
     * If a refresh occurs, the row count is reset.
     *
     * @param params a set of properties pertaining to the filter changes
     */
    refreshAfterFilter(params: StoreRefreshAfterParams): void;
    /**
     * Marks all existing nodes as requiring reloaded, and triggers a load check
     *
     * @param purge whether to remove all nodes and data in favour of stub nodes
     */
    refreshStore(purge: boolean): void;
    /**
     * Used for pagination, given a local/store index, returns the display index of that row
     *
     * @param topLevelIndex the store index of a row
     * @returns the display index for the given store index
     */
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number;
    /**
     * Used for pagination to determine if the last page is known, and for aria to determine if the last grid row is known
     *
     * @returns whether the last index of this store is known, or if lazy loading still required
     */
    isLastRowIndexKnown(): boolean;
    /**
     * Used by the selection service to select a range of nodes
     *
     * @param firstInRange the first node in the range to find
     * @param lastInRange the last node in the range to find
     * @returns a range of nodes between firstInRange and lastInRange inclusive
     */
    getRowNodesInRange(firstInRange: RowNode<any>, lastInRange: RowNode<any>): RowNode<any>[];
    /**
     * Mutates a given array to add this stores state, and recursively add all the children store states.
     *
     * @param result a mutable results array
     */
    addStoreStates(result: ServerSideGroupLevelState[]): void;
    getIdSequence(): NumberSequence;
    getParentNode(): RowNode<any>;
    getRowDetails(): {
        field: string;
        group: boolean;
        leafGroup: boolean;
        level: number;
        parent: RowNode<any>;
        rowGroupColumn: Column<any>;
    };
    getSsrmParams(): SSRMParams;
    setStoreInfo(info: any): void;
    fireStoreUpdatedEvent(): void;
    fireRefreshFinishedEvent(): void;
    getBlockStates(): {
        [key: string]: any;
    };
    getStoreBounds(): {
        topPx: number;
        heightPx: number;
    };
    getCache(): LazyCache;
}
