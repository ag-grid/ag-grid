import { BeanStub, LoadSuccessParams, NumberSequence, RowNode, IRowNode, ServerSideGroupLevelParams } from "ag-grid-community";
import { LazyStore } from "./lazyStore";
import { MultiIndexMap } from "./multiIndexMap";
interface LazyStoreNode {
    id: string;
    index: number;
    node: RowNode;
}
export declare class LazyCache extends BeanStub {
    private api;
    private blockUtils;
    private focusService;
    private nodeManager;
    private serverSideRowModel;
    private rowNodeSorter;
    private sortController;
    private lazyBlockLoadingService;
    /**
     * Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
     */
    private live;
    /**
     * A node map indexed by the node's id, index, and node.
     */
    private nodeMap;
    /**
     * A map of nodes indexed by the display index.
     */
    private nodeDisplayIndexMap;
    /**
     * A set of nodes waiting to be refreshed
     */
    private nodesToRefresh;
    /**
     * End of store properties
     */
    private numberOfRows;
    private isLastRowKnown;
    /**
     * The prefix to use for node ids, this is used to ensure that node ids are unique across stores
     */
    private defaultNodeIdPrefix;
    /**
     * Sibling services - 1-1 relationships.
     */
    private store;
    private storeParams;
    /**
     * Grid options properties - stored locally for access speed.
     */
    private getRowIdFunc?;
    private isMasterDetail;
    /**
     * A cache of removed group nodes, this is retained for preserving group
     * state when the node moves in and out of the cache. Generally caused by
     * rows moving blocks.
     */
    private removedNodeCache;
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
    /**
     * @param index The row index relative to this store
     * @returns A rowNode at the given store index
     */
    getRowByStoreIndex(index: number): RowNode<any> | undefined;
    /**
     * Given a number of rows, skips through the given sequence & row top reference (using default row height)
     * @param numberOfRowsToSkip number of rows to skip over in the given sequence
     * @param displayIndexSeq the sequence in which to skip
     * @param nextRowTop the row top reference in which to skip
     */
    private skipDisplayIndexes;
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    getRowCount(): number;
    setRowCount(rowCount: number, isLastRowIndexKnown?: boolean): void;
    getNodes(): MultiIndexMap<LazyStoreNode>;
    getNodeCachedByDisplayIndex(displayIndex: number): RowNode | null;
    getNodesToRefresh(): Set<RowNode>;
    /**
     * @returns the previous and next loaded row nodes surrounding the given display index
     */
    getSurroundingNodesByDisplayIndex(displayIndex: number): {
        previousNode: LazyStoreNode | undefined;
        nextNode: LazyStoreNode | undefined;
    } | null;
    /**
     * Get or calculate the display index for a given store index
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to the grid
     */
    getDisplayIndexFromStoreIndex(storeIndex: number): number | null;
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    private createRowAtIndex;
    getBlockStates(): {
        [key: string]: any;
    };
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
    private getBlocksDistanceFromRow;
    private purgeExcessRows;
    private isNodeFocused;
    private isNodeCached;
    private extractDuplicateIds;
    onLoadSuccess(firstRowIndex: number, numberOfRowsExpected: number, response: LoadSuccessParams): void;
    fireRefreshFinishedEvent(): void;
    /**
     * @returns true if all rows are loaded
     */
    isStoreFullyLoaded(): boolean | undefined;
    isLastRowIndexKnown(): boolean;
    onLoadFailed(firstRowIndex: number, numberOfRowsExpected: number): void;
    markNodesForRefresh(): void;
    isNodeInCache(id: string): boolean;
    private fireStoreUpdatedEvent;
    private getRowId;
    getOrderedNodeMap(): {
        [key: number]: LazyStoreNode;
    };
    clearDisplayIndexes(): void;
    /**
     * Client side sorting
     */
    clientSideSortRows(): void;
    /**
     * Transaction Support here
     */
    updateRowNodes(updates: any[]): RowNode[];
    insertRowNodes(inserts: any[], indexToAdd?: number): RowNode[];
    removeRowNodes(idsToRemove: string[]): RowNode[];
    /**
     * Return the block size configured for this cache
     */
    getBlockSize(): number;
    /**
     * Get the start index of the loading block for a given index
     */
    getBlockStartIndex(storeIndex: number): number;
    /**
     * Get the start and end index of a block, given a row store index
     */
    getBlockBounds(storeIndex: number): [number, number];
}
export {};
