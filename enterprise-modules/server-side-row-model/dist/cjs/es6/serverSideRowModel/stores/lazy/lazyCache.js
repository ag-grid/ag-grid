"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyCache = void 0;
const core_1 = require("@ag-grid-community/core");
const lazyBlockLoader_1 = require("./lazyBlockLoader");
class LazyCache extends core_1.BeanStub {
    constructor(store, numberOfRows, storeParams) {
        super();
        // Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
        this.live = true;
        this.store = store;
        this.numberOfRows = numberOfRows;
        this.isLastRowKnown = false;
        this.storeParams = storeParams;
    }
    init() {
        this.nodeIndexMap = {};
        this.nodeIds = new Set();
        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new lazyBlockLoader_1.LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
    }
    destroyRowNodes() {
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
    getRowByDisplayIndex(displayIndex) {
        var _a;
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }
        let nodeAfterStringIndex;
        const nodeMapEntries = this.getNodeMapEntries();
        for (let i = 0; i < nodeMapEntries.length; i++) {
            const [stringIndex, node] = nodeMapEntries[i];
            // if we find the index, simply return this node
            if (node.rowIndex === displayIndex) {
                if (node.stub || node.__needsRefreshWhenVisible) {
                    this.rowLoader.queueLoadAction();
                }
                return node;
            }
            // then check if current row contains a detail row with the index
            const expandedMasterRow = node.master && node.expanded;
            const detailNode = node.detailNode;
            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayIndex) {
                return detailNode;
            }
            // if the index belongs to a child store, recursively search
            if ((_a = node.childStore) === null || _a === void 0 ? void 0 : _a.isDisplayIndexInStore(displayIndex)) {
                return node.childStore.getRowUsingDisplayIndex(displayIndex);
            }
            // if current row index is higher, then the node has been passed
            if (node.rowIndex > displayIndex) {
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
            const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex, displayIndex);
        }
        // important to remember this node is not necessarily directly after the node we're searching for
        const nodeAfterIndex = Number(nodeAfterStringIndex);
        const nodeAfter = this.nodeIndexMap[nodeAfterIndex];
        // difference can be calculated from next nodes display index
        const nodeAfterDisplayIndex = nodeAfter.rowIndex;
        const storeIndexFromNodeAfterIndex = nodeAfterIndex - (nodeAfterDisplayIndex - displayIndex);
        return this.createStubNode(storeIndexFromNodeAfterIndex, displayIndex);
    }
    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    createStubNode(storeIndex, displayIndex) {
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        const rowBounds = this.store.getRowBounds(displayIndex);
        const newNode = this.createRowAtIndex(storeIndex, null, node => {
            node.setRowIndex(displayIndex);
            node.setRowTop(rowBounds.rowTop);
        });
        this.rowLoader.queueLoadAction();
        return newNode;
    }
    getRowByStoreIndex(index) {
        return this.nodeIndexMap[index];
    }
    skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop) {
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    }
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    setDisplayIndexes(displayIndexSeq, nextRowTop) {
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
    getRowCount() {
        return this.numberOfRows;
    }
    getNodeMapEntries() {
        return Object.entries(this.nodeIndexMap);
    }
    getAllNodes() {
        return Object.values(this.nodeIndexMap);
    }
    /**
     * Get or calculate the display index for this store
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to all stores
     */
    getDisplayIndexFromStoreIndex(storeIndex) {
        var _a;
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
        const childStoreEnd = (_a = lastNode.childStore) === null || _a === void 0 ? void 0 : _a.getDisplayIndexEnd();
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
    createRowAtIndex(atStoreIndex, data, createNodeCallback) {
        const usingRowIds = this.isUsingRowIds();
        // make sure an existing node isn't being overwritten
        const existingNodeAtIndex = this.nodeIndexMap[atStoreIndex];
        if (existingNodeAtIndex) {
            existingNodeAtIndex.__needsRefresh = false;
            existingNodeAtIndex.__needsRefreshWhenVisible = false;
            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, existingNodeAtIndex)) {
                this.blockUtils.updateDataIntoRowNode(existingNodeAtIndex, data);
                return existingNodeAtIndex;
            }
            // if there's no id and this is an open group, protect this node from changes
            if (!usingRowIds && existingNodeAtIndex.group && existingNodeAtIndex.expanded) {
                return existingNodeAtIndex;
            }
            // destroy the old node, might be worth caching state here
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
                // mark all of the old block as needsVerify to trigger it for a refresh
                this.markBlockForVerify(existingIndex);
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
            this.nodeIds.add(newNode.id);
        }
        // add the new node to the store, has to be done after the display index is calculated so it doesn't take itself into account
        this.nodeIndexMap[atStoreIndex] = newNode;
        if (createNodeCallback) {
            createNodeCallback(newNode);
        }
        // if this is a stub, we need to tell the loader to load rows
        if (newNode.stub) {
            this.rowLoader.queueLoadAction();
        }
        return newNode;
    }
    destroyRowAtIndex(atStoreIndex) {
        const node = this.nodeIndexMap[atStoreIndex];
        this.nodeIds.delete(node.id);
        this.blockUtils.destroyRowNode(node);
        delete this.nodeIndexMap[atStoreIndex];
    }
    getSsrmParams() {
        return this.store.getSsrmParams();
    }
    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    getPrefixedId(id) {
        if (this.defaultNodeIdPrefix) {
            return this.defaultNodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    }
    markBlockForVerify(rowIndex) {
        const [start, end] = this.rowLoader.getBlockBoundsForIndex(rowIndex);
        for (let i = start; i < end; i++) {
            const node = this.nodeIndexMap[i];
            if (node) {
                node.__needsRefreshWhenVisible = true;
            }
        }
    }
    doesNodeMatch(data, node) {
        if (node.stub) {
            return false;
        }
        if (this.isUsingRowIds()) {
            const id = this.getRowId(data);
            return node.id === id;
        }
        return node.data === data;
    }
    /**
     * Deletes any stub nodes not within the given range
     */
    purgeStubsOutsideOfViewport() {
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
    getNumberOfRowsToRetain(firstRow, lastRow) {
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
    getBlocksDistanceFromRow(nodes, otherDisplayIndex) {
        const blockDistanceToMiddle = {};
        nodes.forEach(([storeIndexString, node]) => {
            const [blockStart, blockEnd] = this.rowLoader.getBlockBoundsForIndex(Number(storeIndexString));
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            const distStart = Math.abs(node.rowIndex - otherDisplayIndex);
            let distEnd;
            // may not have an end node if the block came back small 
            if (this.nodeIndexMap[blockEnd - 1])
                distEnd = Math.abs(this.nodeIndexMap[blockEnd - 1].rowIndex - otherDisplayIndex);
            const farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    }
    purgeExcessRows() {
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
    isNodeFocused(node) {
        const focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        const hasFocus = focusedCell.rowIndex === node.rowIndex;
        return hasFocus;
    }
    isNodeCached(node) {
        return (!!node.group && node.expanded) || this.isNodeFocused(node);
    }
    extractDuplicateIds(rows) {
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
    onLoadSuccess(firstRowIndex, numberOfRowsExpected, response) {
        if (!this.live)
            return;
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
            if (nodeFromCache === null || nodeFromCache === void 0 ? void 0 : nodeFromCache.stub) {
                this.createRowAtIndex(rowIndex, data);
                return;
            }
            if (nodeFromCache && this.doesNodeMatch(data, nodeFromCache)) {
                this.blockUtils.updateDataIntoRowNode(nodeFromCache, data);
                nodeFromCache.__needsRefresh = false;
                nodeFromCache.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            this.createRowAtIndex(rowIndex, data);
        });
        if (response.rowCount != undefined && response.rowCount !== -1) {
            // if the rowCount has been provided, set the row count
            this.numberOfRows = response.rowCount;
            this.isLastRowKnown = true;
        }
        else if (numberOfRowsExpected > response.rowData.length) {
            // infer the last row as the response came back short
            this.numberOfRows = firstRowIndex + response.rowData.length;
            this.isLastRowKnown = true;
        }
        else if (!this.isLastRowKnown) {
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
    isLastRowIndexKnown() {
        return this.isLastRowKnown;
    }
    onLoadFailed(firstRowIndex, numberOfRowsExpected) {
        if (!this.live)
            return;
        for (let i = firstRowIndex; i < firstRowIndex + numberOfRowsExpected; i++) {
            const nodeFromCache = this.nodeIndexMap[i];
            if (nodeFromCache) {
                nodeFromCache.failedLoad = true;
            }
        }
        this.fireStoreUpdatedEvent();
    }
    markNodesForRefresh() {
        this.getAllNodes().forEach(node => node.__needsRefresh = true);
        this.rowLoader.queueLoadAction();
    }
    isNodeInCache(id) {
        return this.nodeIds.has(id);
    }
    // gets called 1) row count changed 2) cache purged 3) items inserted
    fireStoreUpdatedEvent() {
        if (!this.live) {
            return;
        }
        this.store.fireStoreUpdatedEvent();
    }
    isUsingRowIds() {
        return this.gridOptionsService.getRowIdFunc() != null;
    }
    getRowId(data) {
        const getRowIdFunc = this.gridOptionsService.getRowIdFunc();
        if (getRowIdFunc == null) {
            return null;
        }
        // find rowNode using id
        const { level } = this.store.getRowDetails();
        const parentKeys = this.store.getParentNode().getGroupKeys();
        const id = getRowIdFunc({
            data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level,
        });
        return String(id);
    }
    lookupRowNode(data) {
        var _a;
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        // find rowNode using id
        const id = this.getRowId(data);
        return (_a = this.getAllNodes().find(node => node.id === id)) !== null && _a !== void 0 ? _a : null;
    }
    updateRowNodes(updates) {
        const updatedNodes = [];
        updates.forEach(data => {
            const row = this.lookupRowNode(data);
            if (row) {
                this.blockUtils.updateDataIntoRowNode(row, data);
                updatedNodes.push(row);
            }
        });
        return updatedNodes;
    }
    insertRowNodes(inserts, indexToAdd) {
        // if missing and we know the last row, we're inserting at the end
        const addIndex = indexToAdd == null && this.isLastRowKnown ? this.store.getRowCount() : indexToAdd;
        // can't insert nodes past the end of the store
        if (addIndex == null || this.store.getRowCount() < addIndex) {
            return [];
        }
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        const uniqueInsertsMap = {};
        inserts.forEach(data => {
            const dataId = this.getRowId(data);
            if (dataId && this.isNodeInCache(dataId)) {
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
            }
            else {
                this.nodeIndexMap[numericStoreIndex + numberOfInserts] = node;
                delete this.nodeIndexMap[numericStoreIndex];
            }
        }
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;
        // finally insert the new rows
        return uniqueInserts.map((data, uniqueInsertOffset) => this.createRowAtIndex(addIndex + uniqueInsertOffset, data));
    }
    removeRowNodes(idsToRemove) {
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        const removedNodes = [];
        const allNodes = this.getNodeMapEntries();
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        let deletedNodeCount = 0;
        const remainingIdsToRemove = [...idsToRemove];
        const nodesToVerify = [];
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
            const numericStoreIndex = Number(stringStoreIndex);
            if (i !== numericStoreIndex) {
                nodesToVerify.push(node);
            }
            // shift normal node up by number of deleted prior to this point
            this.nodeIndexMap[numericStoreIndex - deletedNodeCount] = this.nodeIndexMap[numericStoreIndex];
            delete this.nodeIndexMap[numericStoreIndex];
        }
        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(node => node.__needsRefreshWhenVisible = true);
            this.rowLoader.queueLoadAction();
        }
        return removedNodes;
    }
}
__decorate([
    core_1.Autowired('gridApi')
], LazyCache.prototype, "api", void 0);
__decorate([
    core_1.Autowired('ssrmBlockUtils')
], LazyCache.prototype, "blockUtils", void 0);
__decorate([
    core_1.Autowired('focusService')
], LazyCache.prototype, "focusService", void 0);
__decorate([
    core_1.Autowired('ssrmNodeManager')
], LazyCache.prototype, "nodeManager", void 0);
__decorate([
    core_1.PostConstruct
], LazyCache.prototype, "init", null);
__decorate([
    core_1.PreDestroy
], LazyCache.prototype, "destroyRowNodes", null);
exports.LazyCache = LazyCache;
