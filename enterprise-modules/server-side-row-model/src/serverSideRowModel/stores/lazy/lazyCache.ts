import { Autowired, BeanStub, Events, FocusService, GridApi, LoadSuccessParams, NumberSequence, PostConstruct, PreDestroy, RowNode, ServerSideGroupLevelParams, StoreUpdatedEvent, WithoutGridCommon } from "@ag-grid-community/core";
import { BlockUtils } from "src/serverSideRowModel/blocks/blockUtils";
import { NodeManager } from "src/serverSideRowModel/nodeManager";
import { LazyStore } from "./lazyStore";
import { LazyBlockLoader } from "./lazyBlockLoader";

export class LazyCache extends BeanStub {
    @Autowired('gridApi') private api: GridApi;
    @Autowired('ssrmBlockUtils') private blockUtils: BlockUtils;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('ssrmNodeManager') private nodeManager: NodeManager;

    // Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
    private live = true;

    private nodeIndexMap: { [index: number]: RowNode };
    private nodeIds: Set<string>;

    private numberOfRows: number;
    private isLastRowKnown: boolean;

    private defaultNodeIdPrefix: string | undefined;

    private store: LazyStore;
    private rowLoader: LazyBlockLoader;

    private storeParams: ServerSideGroupLevelParams;

    constructor(store: LazyStore, numberOfRows: number, storeParams: ServerSideGroupLevelParams) {
        super();
        this.store = store;
        this.numberOfRows = numberOfRows;
        this.isLastRowKnown = false;
        this.storeParams = storeParams;
    }

    @PostConstruct
    private init() {
        this.nodeIndexMap = {};
        this.nodeIds = new Set();
        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
    }

    @PreDestroy
    private destroyRowNodes() {
        this.numberOfRows = 0;
        this.blockUtils.destroyRowNodes(this.getAllNodes());
        this.nodeIndexMap = {};
        this.nodeIds.clear();
        this.live = false;
    }

    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    public getRowByDisplayIndex(displayIndex: number): RowNode | undefined {
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }

        let nodeAfterStringIndex: string | undefined;
        const nodeMapEntries = this.getNodeMapEntries();
        for (let i = 0; i < nodeMapEntries.length; i++) {
            const [stringIndex, node] = nodeMapEntries[i];
            // if we find the index, simply return this node
            if (node.rowIndex === displayIndex) {
                return node;
            }

            // then check if current row contains a detail row with the index
            const expandedMasterRow = node.master && node.expanded;
            const detailNode = node.detailNode;

            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayIndex) {
                return detailNode;
            }

            // if the index belongs to a child store, recursively search
            if (node.childStore?.isDisplayIndexInStore(displayIndex)) {
                return node.childStore.getRowUsingDisplayIndex(displayIndex);
            }

            // if current row index is higher, then the node has been passed
            if (node.rowIndex! > displayIndex) {
                // keep track of the last next node we find that comes after in case we need to create a new stub
                nodeAfterStringIndex = stringIndex;
                break;
            }

        }

        /**
         * The code below this point is assuming we haven't found a stored node with this display index, but the node does belong in this store,
         * in this case we want to create a stub node to display in the grid, so we need to calculate the store index from the display index using
         * the next node found after this one (can use end index here as we have confidence it should be up to date, as we aren't inserting rows)
         */

        // no node was found before this display index, so calculate based on store end index
        if (nodeAfterStringIndex == null) {
            const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd()! - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex, displayIndex);
        }

        // important to remember this node is not necessarily directly after the node we're searching for
        const nodeAfterIndex = Number(nodeAfterStringIndex);
        const nodeAfter = this.nodeIndexMap[nodeAfterIndex];

        // difference can be calculated from next nodes display index
        const nodeAfterDisplayIndex = nodeAfter.rowIndex!;
        const storeIndexFromNodeAfterIndex = nodeAfterIndex - (nodeAfterDisplayIndex - displayIndex);
        return this.createStubNode(storeIndexFromNodeAfterIndex, displayIndex);
    }

    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    private createStubNode(storeIndex: number, displayIndex: number): RowNode {
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        const rowBounds = this.store.getRowBounds(displayIndex!);
        const newNode = this.createRowAtIndex(storeIndex);
        newNode.setRowIndex(displayIndex);
        newNode.setRowTop(rowBounds!.rowTop);
        return newNode;
    }

    public getRowByStoreIndex(index: number) {
        return this.nodeIndexMap[index];
    }

    private skipDisplayIndexes(numberOfRowsToSkip: number, displayIndexSeq: NumberSequence, nextRowTop: { value: number; }) {
        const defaultRowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    }

    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    public setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: { value: number; }): void {
        const nodeEntries = this.getNodeMapEntries();

        let lastIndex = -1;
        nodeEntries.forEach(([stringIndex, node]) => {
            const numericIndex = Number(stringIndex);

            // if any nodes aren't currently in the store, skip the display indexes too
            const numberOfRowsToSkip = (numericIndex - 1) - lastIndex;
            this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);

            // set this nodes index and row top
            this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);

            // store this index for skipping after this
            lastIndex = numericIndex;
        });

        // need to skip rows until the end of this store
        const numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);

        this.purgeExcessRows();
    }

    public getRowCount(): number {
        return this.numberOfRows;
    }

    public getNodeMapEntries(): [string, RowNode][] {
        return Object.entries(this.nodeIndexMap);
    }

    public getAllNodes(): RowNode[] {
        return Object.values(this.nodeIndexMap);
    }

    /**
     * Get or calculate the display index for this store
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to all stores
     */
    public getDisplayIndexFromStoreIndex(storeIndex: number): number | null {
        const nodeToReplace = this.nodeIndexMap[storeIndex];
        const displayIndexStart = this.store.getDisplayIndexStart();
        if (displayIndexStart == null) {
            return null;
        }

        // if node exists, we can extract its displayIndex
        if (nodeToReplace && nodeToReplace.rowIndex != null) {
            return nodeToReplace.rowIndex;
        }

        const allNodes = this.getNodeMapEntries();
        let lastNode = undefined;
        let lastIndex = -1;
        for (let i = 0; i < allNodes.length; i++) {
            const [stringNodeStoreIndex, node] = allNodes[i];
            const numericNodeStoreIndex = Number(stringNodeStoreIndex);
            if (numericNodeStoreIndex > storeIndex) {
                break;
            }

            lastNode = node;
            lastIndex = numericNodeStoreIndex;
        }

        // unlike in getRowByDisplayIndex, we have to use getDisplayIndexStart here, as nodes may
        // have been inserted without updating display index end yet. 

        if (lastNode == null) {
            return displayIndexStart + storeIndex;
        }

        const nodeDiff = storeIndex - lastIndex;
        const childStoreEnd = lastNode.childStore?.getDisplayIndexEnd();
        if (childStoreEnd != null) {
            return childStoreEnd + nodeDiff - 1;
        }

        if (lastNode.rowIndex != null) {
            return lastNode.rowIndex + nodeDiff;
        }

        return displayIndexStart + storeIndex;
    }

    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with 
     * @returns the new row node
     */
    private createRowAtIndex(atStoreIndex: number, data?: any): RowNode {
        const usingRowIds = this.isUsingRowIds();

        // make sure an existing node isn't being overwritten
        const existingNodeAtIndex = this.nodeIndexMap[atStoreIndex];
        if (existingNodeAtIndex) {
            existingNodeAtIndex.needsRefresh = false;

            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, existingNodeAtIndex)) {
                this.blockUtils.updateDataIntoRowNode(existingNodeAtIndex, data);
                return existingNodeAtIndex;
            }

            // if there's no id and this is an open group, protect this node from changes
            if (!usingRowIds && existingNodeAtIndex.group && existingNodeAtIndex.expanded) {
                return existingNodeAtIndex;
            }

            // destroy the old node
            this.destroyRowAtIndex(atStoreIndex);
        }

        // if the node already exists, update it and move it to the new location
        if (data && usingRowIds) {
            const allNodes = this.getNodeMapEntries();
            const existingNodeDetails = allNodes.find(([_, node]) => this.doesNodeMatch(data, node));

            if (existingNodeDetails) {
                const [existingStringIndex, existingNode] = existingNodeDetails;
                const existingIndex = Number(existingStringIndex);
                this.blockUtils.updateDataIntoRowNode(existingNode, data);
                delete this.nodeIndexMap[existingIndex];
                this.nodeIndexMap[atStoreIndex] = existingNode;

                // mark all of the old block as needsRefresh to trigger it for a refresh
                this.markBlockForRefresh(existingIndex);

                return existingNode;
            }
        }

        // node doesn't exist, create a new one
        const newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            const defaultId = this.getPrefixedId(this.store.getIdSequence().next());
            this.blockUtils.setDataIntoRowNode(newNode, data, defaultId, undefined);
            this.blockUtils.checkOpenByDefault(newNode);
            this.nodeManager.addRowNode(newNode);
            this.nodeIds.add(newNode.id!);
        }

        // add the new node to the store, has to be done after the display index is calculated so it doesn't take itself into account
        this.nodeIndexMap[atStoreIndex] = newNode;

        // if this is a stub, we need to tell the loader to load rows
        if (newNode.stub) {
            this.rowLoader.queueLoadAction();
        }

        return newNode;
    }

    public destroyRowAtIndex(atStoreIndex: number) {
        const node = this.nodeIndexMap[atStoreIndex];
        this.nodeIds.delete(node.id!);
        this.blockUtils.destroyRowNode(node);
        delete this.nodeIndexMap[atStoreIndex];
    }

    public getSsrmParams() {
        return this.store.getSsrmParams();
    }

    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    private getPrefixedId(id: number): string {
        if (this.defaultNodeIdPrefix) {
            return this.defaultNodeIdPrefix + '-' + id;
        } else {
            return id.toString();
        }
    }

    private markBlockForRefresh(rowIndex: number) {
        const [start, end] = this.rowLoader.getBlockBoundsForIndex(rowIndex);
        for(let i = start; i < end; i++) {
            const node = this.nodeIndexMap[i];
            if (node) {
                node.needsRefresh = true;
            }
        }
    }

    private doesNodeMatch(data: any, node: RowNode): boolean {
        if (node.stub) {
            return false;
        }

        if (this.isUsingRowIds()) {
            const id: string = this.getRowId(data)!;
            return node.id === id;
        }
        return node.data === data;
    }

    /**
     * Deletes any stub nodes not within the given range
     */
    public purgeStubsOutsideOfViewport() {
        const firstRow = this.api.getFirstDisplayedRow();
        const lastRow = this.api.getLastDisplayedRow();
        const firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRow);
        const [_, lastRowBlockEnd] = this.rowLoader.getBlockBoundsForIndex(lastRow);
        this.getNodeMapEntries().forEach(([stringIndex, node]) => {
            const numericIndex = Number(stringIndex);
            if (this.rowLoader.isRowLoading(numericIndex)) {
                return;
            }
            if (node.stub && (numericIndex < firstRowBlockStart || numericIndex > lastRowBlockEnd)) {
                this.destroyRowAtIndex(numericIndex);
            }
        });
    }

    /**
     * Calculates the number of rows to cache based on either the viewport, or number of cached blocks 
     */
    private getNumberOfRowsToRetain(firstRow: number, lastRow: number): number | null {
        const numberOfCachedBlocks = this.storeParams.maxBlocksInCache;
        if (numberOfCachedBlocks == null) {
            return null;
        }
    
        const blockSize = this.rowLoader.getBlockSize();
        const numberOfViewportBlocks = Math.ceil((lastRow - firstRow) / blockSize);
        const numberOfBlocksToRetain = Math.max(numberOfCachedBlocks, numberOfViewportBlocks);
        const numberOfRowsToRetain = numberOfBlocksToRetain * blockSize;
        return numberOfRowsToRetain;
    }

    private getBlocksDistanceFromRow(nodes: [string, RowNode][], otherDisplayIndex: number) {
        const blockDistanceToMiddle: { [key: number]: number } = {};
        nodes.forEach(([storeIndexString, node]) => {
            const [blockStart, blockEnd] = this.rowLoader.getBlockBoundsForIndex(Number(storeIndexString));
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            const distStart = Math.abs(node.rowIndex! - otherDisplayIndex);
            let distEnd;
            // may not have an end node if the block came back small 
            if (this.nodeIndexMap[blockEnd - 1]) distEnd = Math.abs(this.nodeIndexMap[blockEnd - 1].rowIndex! - otherDisplayIndex);
            const farthest = distEnd == null || distStart > distEnd ? distStart : distEnd;

            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    }

    private purgeExcessRows() {
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();

        const firstRowInViewport = this.api.getFirstDisplayedRow();
        const lastRowInViewport = this.api.getLastDisplayedRow();
        const firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRowInViewport);
        const [_, lastRowBlockEnd] = this.rowLoader.getBlockBoundsForIndex(lastRowInViewport);

        // number of blocks to cache on top of the viewport blocks
        const numberOfRowsToRetain = this.getNumberOfRowsToRetain(firstRowBlockStart, lastRowBlockEnd);
        if (this.store.getDisplayIndexEnd() == null || numberOfRowsToRetain == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }

        // don't check the nodes that could have been cached out of necessity
        const disposableNodes = this.getNodeMapEntries().filter(([_, node]) => !node.stub && !this.isNodeCached(node));
        if (disposableNodes.length <= numberOfRowsToRetain) {
            // not enough rows to bother clearing any
            return;
        }

        const midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        const blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodes, midViewportRow);

        const blockSize = this.rowLoader.getBlockSize();
        const numberOfBlocksToRetain = Math.ceil(numberOfRowsToRetain / blockSize);
        if (blockDistanceArray.length <= numberOfBlocksToRetain) {
            return;
        }

        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort((a, b) => Math.sign(b[1] - a[1]));
        const blocksToRemove = blockDistanceArray.length - numberOfBlocksToRetain;
        for (let i = 0; i < blocksToRemove; i++) {
            const blockStart = Number(blockDistanceArray[i][0]);
            for (let x = blockStart; x < blockStart + blockSize; x++) {
                const node = this.nodeIndexMap[x];
                if (!node || this.isNodeCached(node)) {
                    continue;
                }
                this.destroyRowAtIndex(x);
            }
        }
    }

    private isNodeFocused(node: RowNode): boolean {
        const focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) { return false; }
        if (focusedCell.rowPinned != null) { return false; }

        const hasFocus = focusedCell.rowIndex === node.rowIndex;
        return hasFocus;
    }

    private isNodeCached(node: RowNode): boolean {
        return (!!node.group && node.expanded) || this.isNodeFocused(node);
    }

    private extractDuplicateIds(rows: any[]) {
        if (!this.isUsingRowIds()) {
            return [];
        }

        const newIds = new Set();
        const duplicates = new Set();
        rows.forEach(data => {
            const id = this.getRowId(data);
            if (newIds.has(id)) {
                duplicates.add(id);
                return;
            }
            newIds.add(id);
        });

        return [...duplicates];
    }

    public onLoadSuccess(firstRowIndex: number, numberOfRowsExpected: number, response: LoadSuccessParams) {
        if (!this.live) return;

        if (this.isUsingRowIds()) {
            const duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                const duplicateIdText = duplicates.join(', ');
                console.warn(`AG Grid: Unable to display rows as duplicate row ids (${duplicateIdText}) were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids.`);
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        
        response.rowData.forEach((data, responseRowIndex) => {
            const rowIndex = firstRowIndex + responseRowIndex;
            const nodeFromCache = this.nodeIndexMap[rowIndex];
        
            // if stub, overwrite
            if (nodeFromCache?.stub) {
                this.createRowAtIndex(rowIndex, data);
                return;
            }
            
            if (nodeFromCache && this.doesNodeMatch(data, nodeFromCache)) {
                this.blockUtils.updateDataIntoRowNode(nodeFromCache, data);
                nodeFromCache.needsRefresh = false;
                return;
            }
            // create row will handle deleting the overwritten row
            this.createRowAtIndex(rowIndex, data);
        });

        if (response.rowCount != undefined && response.rowCount !== -1) {
            // if the rowCount has been provided, set the row count
            this.numberOfRows = response.rowCount;
            this.isLastRowKnown = true;
        } else if (numberOfRowsExpected > response.rowData.length) {
            // infer the last row as the response came back short
            this.numberOfRows = firstRowIndex + response.rowData.length;
            this.isLastRowKnown = true;
        } else if (!this.isLastRowKnown) {
            // add 1 for loading row, as we don't know the last row
            const lastInferredRow = firstRowIndex + response.rowData.length + 1;
            if (lastInferredRow > this.numberOfRows) {
                this.numberOfRows = lastInferredRow;
            }
        }

        if (this.isLastRowKnown) {
            // delete any rows after the last index
            const allRows = this.getNodeMapEntries();
            for (let i = allRows.length - 1; i >= 0; i--) {
                const numericIndex = Number(allRows[i][0]);
                if (numericIndex < this.numberOfRows) {
                    break;
                }
                this.destroyRowAtIndex(numericIndex);
            }
        }

        this.fireStoreUpdatedEvent();
    }

    public isLastRowIndexKnown() {
        return this.isLastRowKnown;
    }

    public onLoadFailed(firstRowIndex: number, numberOfRowsExpected: number) {
        if (!this.live) return;
        for(let i = firstRowIndex; i < firstRowIndex + numberOfRowsExpected; i++) {
            const nodeFromCache = this.nodeIndexMap[i];
            if (nodeFromCache) {
                nodeFromCache.failedLoad = true;
            }
        }

        this.fireStoreUpdatedEvent();
    }

    public markNodesForRefresh() {
        this.getAllNodes().forEach(node => node.needsRefresh = true);
        this.rowLoader.queueLoadAction();
    }

    public isNodeInCache(id: string): boolean {
        return this.nodeIds.has(id);
    }

    // gets called 1) row count changed 2) cache purged 3) items inserted
    private fireStoreUpdatedEvent(): void {
        if (!this.live) { return; }

        this.store.fireStoreUpdatedEvent();
    }

    private isUsingRowIds() {
        return this.gridOptionsWrapper.getRowIdFunc() != null;
    }

    private getRowId(data: any) {
        const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();

        if (getRowIdFunc == null) {
            return null;
        }

        // find rowNode using id
        const { level } = this.store.getRowDetails();
        const parentKeys = this.store.getParentNode().getGroupKeys();
        const id: string = getRowIdFunc({
            data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level,
        });
        return String(id);
    }

    private lookupRowNode(data: any): RowNode | null {
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }

        // find rowNode using id
        const id: string = this.getRowId(data)!;
        return this.getAllNodes().find(node => node.id === id) ?? null;
    }

    public updateRowNodes(updates: any[]): RowNode[] {
        const updatedNodes: RowNode[] = [];
        updates.forEach(data => {
            const row = this.lookupRowNode(data);
            if (row) {
                this.blockUtils.updateDataIntoRowNode(row, data);
                updatedNodes.push(row);
            }
        });
        return updatedNodes;
    }

    public insertRowNodes(inserts: any[], indexToAdd?: number): RowNode[] {
        // if missing and we know the last row, we're inserting at the end
        const addIndex = indexToAdd == null && this.isLastRowKnown ? this.store.getRowCount() : indexToAdd;

        // can't insert nodes past the end of the store
        if(addIndex == null || this.store.getRowCount() < addIndex) {
            return [];
        }

        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }

        const uniqueInsertsMap: { [id: string]: any } = {};
        
        inserts.forEach(data => {
            const dataId = this.getRowId(data)!;
            if (dataId && this.isNodeInCache(dataId)) {
                console.warn(`AG Grid: Ignoring add transaction for a new row with rowId=${dataId} as this row is already in the grid.`);
                return;
            }
            
            uniqueInsertsMap[dataId] = data;
        });

        const uniqueInserts = Object.values(uniqueInsertsMap);

        let numberOfInserts = uniqueInserts.length;
        if (numberOfInserts === 0) {
            return [];
        }

        // first move all the nodes after the addIndex out of the way
        const allNodes = this.getNodeMapEntries();
        // iterate backwards to avoid overwriting nodes which haven't been shifted yet
        for (let i = allNodes.length - 1; i >= 0; i--) {
            const [stringStoreIndex, node] = allNodes[i];
            const numericStoreIndex = Number(stringStoreIndex);
            
            // nodes should be in order as js maps sort by numeric keys, so if index is too low can stop iterating
            if (numericStoreIndex < addIndex) {
                break;
            }

            const newIndex = numericStoreIndex + numberOfInserts;
            if (this.getRowByStoreIndex(newIndex)) {
                // this shouldn't happen, why would a row already exist here
                throw new Error('Ag Grid: Something went wrong, node in wrong place.');
            } else {
                this.nodeIndexMap[numericStoreIndex + numberOfInserts] = node;
                delete this.nodeIndexMap[numericStoreIndex];
            }
        }
                    

        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;

        // finally insert the new rows
        return uniqueInserts.map((data, uniqueInsertOffset) => this.createRowAtIndex(addIndex + uniqueInsertOffset, data));
    }

    public removeRowNodes(idsToRemove: string[]): RowNode[] {
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }

        const removedNodes = [];

        const allNodes = this.getNodeMapEntries();

        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        let deletedNodeCount = 0;

        const remainingIdsToRemove = [...idsToRemove];
        for (let i = 0; i < allNodes.length; i++) {
            const [stringStoreIndex, node] = allNodes[i];

            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            const matchIndex = remainingIdsToRemove.findIndex(idToRemove => idToRemove === node.id);
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);

                this.destroyRowAtIndex(Number(stringStoreIndex));
                removedNodes.push(node);
                deletedNodeCount += 1;
                continue;
            }

            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                continue;
            }

            // shift normal node up by number of deleted prior to this point
            const numericStoreIndex = Number(stringStoreIndex);
            this.nodeIndexMap[numericStoreIndex - deletedNodeCount] = this.nodeIndexMap[numericStoreIndex];
            delete this.nodeIndexMap[numericStoreIndex];
        }

        this.numberOfRows -= deletedNodeCount;
        return removedNodes;
    }
}