import { BeanStub, LoadSuccessParams, NumberSequence, RowNode, IRowNode, ServerSideGroupLevelParams } from "@ag-grid-community/core";
import { LazyStore } from "./lazyStore";
export declare class LazyCache extends BeanStub {
    private api;
    private blockUtils;
    private focusService;
    private nodeManager;
    private live;
    private nodeIndexMap;
    private nodeIds;
    private numberOfRows;
    private isLastRowKnown;
    private defaultNodeIdPrefix;
    private store;
    private rowLoader;
    private storeParams;
    constructor(store: LazyStore, numberOfRows: number, storeParams: ServerSideGroupLevelParams);
    private init;
    private destroyRowNodes;
    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    getRowByDisplayIndex(displayIndex: number): IRowNode | undefined;
    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    private createStubNode;
    getRowByStoreIndex(index: number): RowNode<any>;
    private skipDisplayIndexes;
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    getRowCount(): number;
    getNodeMapEntries(): [string, RowNode][];
    getAllNodes(): RowNode[];
    /**
     * Get or calculate the display index for this store
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to all stores
     */
    getDisplayIndexFromStoreIndex(storeIndex: number): number | null;
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    private createRowAtIndex;
    destroyRowAtIndex(atStoreIndex: number): void;
    getSsrmParams(): import("../../serverSideRowModel").SSRMParams;
    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    private getPrefixedId;
    private markBlockForVerify;
    private doesNodeMatch;
    /**
     * Deletes any stub nodes not within the given range
     */
    purgeStubsOutsideOfViewport(): void;
    /**
     * Calculates the number of rows to cache based on either the viewport, or number of cached blocks
     */
    private getNumberOfRowsToRetain;
    private getBlocksDistanceFromRow;
    private purgeExcessRows;
    private isNodeFocused;
    private isNodeCached;
    private extractDuplicateIds;
    onLoadSuccess(firstRowIndex: number, numberOfRowsExpected: number, response: LoadSuccessParams): void;
    isLastRowIndexKnown(): boolean;
    onLoadFailed(firstRowIndex: number, numberOfRowsExpected: number): void;
    markNodesForRefresh(): void;
    isNodeInCache(id: string): boolean;
    private fireStoreUpdatedEvent;
    private isUsingRowIds;
    private getRowId;
    private lookupRowNode;
    updateRowNodes(updates: any[]): RowNode[];
    insertRowNodes(inserts: any[], indexToAdd?: number): RowNode[];
    removeRowNodes(idsToRemove: string[]): RowNode[];
}
