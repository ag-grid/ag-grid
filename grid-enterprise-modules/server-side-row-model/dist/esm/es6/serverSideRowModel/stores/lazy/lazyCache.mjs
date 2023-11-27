var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, BeanStub, PostConstruct, PreDestroy } from "@ag-grid-community/core";
import { LazyBlockLoader } from "./lazyBlockLoader.mjs";
import { MultiIndexMap } from "./multiIndexMap.mjs";
;
export class LazyCache extends BeanStub {
    constructor(store, numberOfRows, storeParams) {
        super();
        /**
         * Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
         */
        this.live = true;
        /**
         * A cache of removed group nodes, this is retained for preserving group
         * state when the node moves in and out of the cache. Generally caused by
         * rows moving blocks.
         */
        this.removedNodeCache = new Map();
        this.store = store;
        this.numberOfRows = numberOfRows;
        this.isLastRowKnown = false;
        this.storeParams = storeParams;
    }
    init() {
        // initiate the node map to be indexed at 'index', 'id' and 'node' for quick look-up.
        // it's important id isn't first, as stub nodes overwrite each-other, and the first index is
        // used for iteration.
        this.nodeMap = new MultiIndexMap('index', 'id', 'node');
        this.nodeDisplayIndexMap = new Map();
        this.nodesToRefresh = new Set();
        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
        this.getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        this.isMasterDetail = this.gridOptionsService.get('masterDetail');
    }
    destroyRowNodes() {
        this.numberOfRows = 0;
        this.nodeMap.forEach(node => this.blockUtils.destroyRowNode(node.node));
        this.nodeMap.clear();
        this.nodeDisplayIndexMap.clear();
        this.nodesToRefresh.clear();
        this.live = false;
    }
    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    getRowByDisplayIndex(displayIndex) {
        var _a, _b, _c, _d;
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }
        // first try to directly look this node up in the display index map
        const node = this.nodeDisplayIndexMap.get(displayIndex);
        if (node) {
            // if we have the node, check if it needs refreshed when rendered
            if (node.stub || node.__needsRefreshWhenVisible) {
                this.rowLoader.queueLoadCheck();
            }
            return node;
        }
        // next check if this is the first row, if so return a stub node
        // this is a performance optimisation, as it is the most common scenario
        // and enables the node - 1 check to kick in more often.
        if (displayIndex === this.store.getDisplayIndexStart()) {
            return this.createStubNode(0, displayIndex);
        }
        // check if the row immediately prior is available in the store
        const contiguouslyPreviousNode = this.nodeDisplayIndexMap.get(displayIndex - 1);
        if (contiguouslyPreviousNode) {
            // if previous row is master detail, and expanded, this node must be detail
            if (this.isMasterDetail && contiguouslyPreviousNode.master && contiguouslyPreviousNode.expanded) {
                return contiguouslyPreviousNode.detailNode;
            }
            // if previous row is expanded group, this node will belong to that group.
            if (contiguouslyPreviousNode.expanded && ((_a = contiguouslyPreviousNode.childStore) === null || _a === void 0 ? void 0 : _a.isDisplayIndexInStore(displayIndex))) {
                return (_b = contiguouslyPreviousNode.childStore) === null || _b === void 0 ? void 0 : _b.getRowUsingDisplayIndex(displayIndex);
            }
            // otherwise, row must be a stub node
            const lazyCacheNode = this.nodeMap.getBy('node', contiguouslyPreviousNode);
            return this.createStubNode(lazyCacheNode.index + 1, displayIndex);
        }
        const adjacentNodes = this.getSurroundingNodesByDisplayIndex(displayIndex);
        // if no bounds skipped includes this, calculate from end index
        if (adjacentNodes == null) {
            const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex, displayIndex);
        }
        const { previousNode, nextNode } = adjacentNodes;
        // if the node before this node is expanded, this node might be a child of that node
        if (previousNode && previousNode.node.expanded && ((_c = previousNode.node.childStore) === null || _c === void 0 ? void 0 : _c.isDisplayIndexInStore(displayIndex))) {
            return (_d = previousNode.node.childStore) === null || _d === void 0 ? void 0 : _d.getRowUsingDisplayIndex(displayIndex);
        }
        // if we have the node after this node, we can calculate the store index of this node by the difference
        // in display indexes between the two nodes.
        if (nextNode) {
            const displayIndexDiff = nextNode.node.rowIndex - displayIndex;
            const newStoreIndex = nextNode.index - displayIndexDiff;
            return this.createStubNode(newStoreIndex, displayIndex);
        }
        // if no next node, calculate from end index of this store
        const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
        return this.createStubNode(storeIndexFromEndIndex, displayIndex);
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
            this.nodeDisplayIndexMap.set(displayIndex, node);
        });
        this.rowLoader.queueLoadCheck();
        return newNode;
    }
    /**
     * @param index The row index relative to this store
     * @returns A rowNode at the given store index
     */
    getRowByStoreIndex(index) {
        var _a;
        return (_a = this.nodeMap.getBy('index', index)) === null || _a === void 0 ? void 0 : _a.node;
    }
    /**
     * Given a number of rows, skips through the given sequence & row top reference (using default row height)
     * @param numberOfRowsToSkip number of rows to skip over in the given sequence
     * @param displayIndexSeq the sequence in which to skip
     * @param nextRowTop the row top reference in which to skip
     */
    skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop) {
        if (numberOfRowsToSkip === 0) {
            return;
        }
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    }
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    setDisplayIndexes(displayIndexSeq, nextRowTop) {
        // Create a map of display index nodes for access speed
        this.nodeDisplayIndexMap.clear();
        // create an object indexed by store index, as this will sort all of the nodes when we iterate
        // the object
        const orderedMap = {};
        this.nodeMap.forEach(lazyNode => {
            orderedMap[lazyNode.index] = lazyNode.node;
        });
        let lastIndex = -1;
        // iterate over the nodes in order, setting the display index on each node.
        for (const stringIndex in orderedMap) {
            const node = orderedMap[stringIndex];
            const numericIndex = Number(stringIndex);
            // if any nodes aren't currently in the store, skip the display indexes too
            const numberOfRowsToSkip = (numericIndex - 1) - lastIndex;
            this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
            // set this nodes index and row top
            this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
            this.nodeDisplayIndexMap.set(node.rowIndex, node);
            // store this index for skipping after this
            lastIndex = numericIndex;
        }
        // need to skip rows until the end of this store
        const numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
        // this is not terribly efficient, and could probs be improved
        this.purgeExcessRows();
    }
    getRowCount() {
        return this.numberOfRows;
    }
    setRowCount(rowCount, isLastRowIndexKnown) {
        if (rowCount < 0) {
            throw new Error('AG Grid: setRowCount can only accept a positive row count.');
        }
        this.numberOfRows = rowCount;
        if (isLastRowIndexKnown != null) {
            this.isLastRowKnown = isLastRowIndexKnown;
            if (isLastRowIndexKnown === false) {
                this.numberOfRows += 1;
            }
        }
        this.fireStoreUpdatedEvent();
    }
    getNodes() {
        return this.nodeMap;
    }
    getNodeCachedByDisplayIndex(displayIndex) {
        var _a;
        return (_a = this.nodeDisplayIndexMap.get(displayIndex)) !== null && _a !== void 0 ? _a : null;
    }
    getNodesToRefresh() {
        return this.nodesToRefresh;
    }
    /**
     * @returns the previous and next loaded row nodes surrounding the given display index
     */
    getSurroundingNodesByDisplayIndex(displayIndex) {
        let nextNode;
        let previousNode;
        this.nodeMap.forEach(lazyNode => {
            // previous node
            if (displayIndex > lazyNode.node.rowIndex) {
                // get the largest previous node
                if (previousNode == null || previousNode.node.rowIndex < lazyNode.node.rowIndex) {
                    previousNode = lazyNode;
                }
                return;
            }
            // next node
            // get the smallest next node
            if (nextNode == null || nextNode.node.rowIndex > lazyNode.node.rowIndex) {
                nextNode = lazyNode;
                return;
            }
        });
        if (!previousNode && !nextNode)
            return null;
        return { previousNode, nextNode };
    }
    /**
     * Get or calculate the display index for a given store index
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to the grid
     */
    getDisplayIndexFromStoreIndex(storeIndex) {
        var _a, _b;
        const nodeAtIndex = this.nodeMap.getBy('index', storeIndex);
        if (nodeAtIndex) {
            return nodeAtIndex.node.rowIndex;
        }
        let nextNode;
        let previousNode;
        this.nodeMap.forEach(lazyNode => {
            // previous node
            if (storeIndex > lazyNode.index) {
                // get the largest previous node
                if (previousNode == null || previousNode.index < lazyNode.index) {
                    previousNode = lazyNode;
                }
                return;
            }
            // next node
            // get the smallest next node
            if (nextNode == null || nextNode.index > lazyNode.index) {
                nextNode = lazyNode;
                return;
            }
        });
        if (!nextNode) {
            return this.store.getDisplayIndexEnd() - (this.numberOfRows - storeIndex);
        }
        if (!previousNode) {
            return this.store.getDisplayIndexStart() + storeIndex;
        }
        const storeIndexDiff = storeIndex - previousNode.index;
        const previousDisplayIndex = ((_b = (_a = previousNode.node.childStore) === null || _a === void 0 ? void 0 : _a.getDisplayIndexEnd()) !== null && _b !== void 0 ? _b : previousNode.node.rowIndex);
        return previousDisplayIndex + storeIndexDiff;
    }
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    createRowAtIndex(atStoreIndex, data, createNodeCallback) {
        var _a, _b;
        // make sure an existing node isn't being overwritten
        const lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        // if node already exists, update it or destroy it
        if (lazyNode) {
            const { node } = lazyNode;
            node.__needsRefreshWhenVisible = false;
            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, node)) {
                this.blockUtils.updateDataIntoRowNode(node, data);
                this.nodesToRefresh.delete(node);
                return node;
            }
            // if there's no id and this is an open group, protect this node from changes
            // hasChildren also checks for tree data and master detail
            if (this.getRowIdFunc == null && node.hasChildren() && node.expanded) {
                this.nodesToRefresh.delete(node);
                return node;
            }
            // destroy the old node, might be worth caching state here
            this.destroyRowAtIndex(atStoreIndex);
        }
        // if the node already exists elsewhere, update it and move it to the new location
        if (data && this.getRowIdFunc != null) {
            const id = this.getRowId(data);
            // the node was deleted at some point, but as we're refreshing
            // it's been cached and we can retrieve it for reuse.
            const deletedNode = id && ((_a = this.removedNodeCache) === null || _a === void 0 ? void 0 : _a.get(id));
            if (deletedNode) {
                (_b = this.removedNodeCache) === null || _b === void 0 ? void 0 : _b.delete(id);
                this.blockUtils.updateDataIntoRowNode(deletedNode, data);
                this.nodeMap.set({
                    id: deletedNode.id,
                    node: deletedNode,
                    index: atStoreIndex
                });
                return deletedNode;
            }
            const lazyNode = this.nodeMap.getBy('id', id);
            if (lazyNode) {
                // delete old lazy node so we can insert it at different location
                this.nodeMap.delete(lazyNode);
                const { node, index } = lazyNode;
                this.blockUtils.updateDataIntoRowNode(node, data);
                this.nodeMap.set({
                    id: node.id,
                    node,
                    index: atStoreIndex
                });
                this.nodesToRefresh.delete(node);
                if (this.rowLoader.getBlockStartIndexForIndex(index) === this.rowLoader.getBlockStartIndexForIndex(atStoreIndex)) {
                    // if the block hasn't changed and we have a nodes map, we don't need to refresh the original block, as this block
                    // has just been refreshed.
                    return node;
                }
                // mark all of the old block as needsVerify to trigger it for a refresh, as nodes
                // should not be out of place
                this.markBlockForVerify(index);
                return node;
            }
        }
        // node doesn't exist, create a new one
        const newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            const defaultId = this.getPrefixedId(this.store.getIdSequence().next());
            this.blockUtils.setDataIntoRowNode(newNode, data, defaultId, undefined);
            this.blockUtils.checkOpenByDefault(newNode);
            this.nodeManager.addRowNode(newNode);
        }
        // add the new node to the store, has to be done after the display index is calculated so it doesn't take itself into account
        this.nodeMap.set({
            id: newNode.id,
            node: newNode,
            index: atStoreIndex,
        });
        if (createNodeCallback) {
            createNodeCallback(newNode);
        }
        return newNode;
    }
    getBlockStates() {
        const blockCounts = {};
        const blockStates = {};
        this.nodeMap.forEach(({ node, index }) => {
            var _a;
            const blockStart = this.rowLoader.getBlockStartIndexForIndex(index);
            if (!node.stub && !node.failedLoad) {
                blockCounts[blockStart] = ((_a = blockCounts[blockStart]) !== null && _a !== void 0 ? _a : 0) + 1;
            }
            let rowState = 'loaded';
            if (node.failedLoad) {
                rowState = 'failed';
            }
            else if (this.rowLoader.isRowLoading(blockStart)) {
                rowState = 'loading';
            }
            else if (this.nodesToRefresh.has(node) || node.stub) {
                rowState = 'needsLoading';
            }
            if (!blockStates[blockStart]) {
                blockStates[blockStart] = new Set();
            }
            blockStates[blockStart].add(rowState);
        });
        const statePriorityMap = {
            loading: 4,
            failed: 3,
            needsLoading: 2,
            loaded: 1,
        };
        const blockPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        const results = {};
        Object.entries(blockStates).forEach(([blockStart, uniqueStates]) => {
            var _a;
            const sortedStates = [...uniqueStates].sort((a, b) => { var _a, _b; return ((_a = statePriorityMap[a]) !== null && _a !== void 0 ? _a : 0) - ((_b = statePriorityMap[b]) !== null && _b !== void 0 ? _b : 0); });
            const priorityState = sortedStates[0];
            const blockNumber = Number(blockStart) / this.rowLoader.getBlockSize();
            const blockId = blockPrefix ? `${blockPrefix}-${blockNumber}` : String(blockNumber);
            results[blockId] = {
                blockNumber,
                startRow: Number(blockStart),
                endRow: Number(blockStart) + this.rowLoader.getBlockSize(),
                pageStatus: priorityState,
                loadedRowCount: (_a = blockCounts[blockStart]) !== null && _a !== void 0 ? _a : 0,
            };
        });
        return results;
    }
    destroyRowAtIndex(atStoreIndex) {
        const lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        if (!lazyNode) {
            return;
        }
        this.nodeMap.delete(lazyNode);
        this.nodeDisplayIndexMap.delete(lazyNode.node.rowIndex);
        if (lazyNode.node.hasChildren() && this.nodesToRefresh.size > 0) {
            // while refreshing, we retain the group nodes so they can be moved
            // without losing state
            this.removedNodeCache.set(lazyNode.node.id, lazyNode.node);
        }
        else {
            this.blockUtils.destroyRowNode(lazyNode.node);
        }
        this.nodesToRefresh.delete(lazyNode.node);
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
        const lazyNodesInRange = this.nodeMap.filter((lazyNode) => lazyNode.index >= start && lazyNode.index < end);
        lazyNodesInRange.forEach(({ node }) => {
            node.__needsRefreshWhenVisible = true;
        });
    }
    doesNodeMatch(data, node) {
        if (node.stub) {
            return false;
        }
        if (this.getRowIdFunc != null) {
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
        this.nodeMap.forEach(lazyNode => {
            // failed loads are still useful, so we don't purge them
            if (this.rowLoader.isRowLoading(lazyNode.index) || lazyNode.node.failedLoad) {
                return;
            }
            if (lazyNode.node.stub && (lazyNode.index < firstRowBlockStart || lazyNode.index > lastRowBlockEnd)) {
                this.destroyRowAtIndex(lazyNode.index);
            }
        });
    }
    getBlocksDistanceFromRow(nodes, otherDisplayIndex) {
        const blockDistanceToMiddle = {};
        nodes.forEach(({ node, index }) => {
            const [blockStart, blockEnd] = this.rowLoader.getBlockBoundsForIndex(index);
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            const distStart = Math.abs(node.rowIndex - otherDisplayIndex);
            let distEnd;
            // may not have an end node if the block came back small 
            const lastLazyNode = this.nodeMap.getBy('index', [blockEnd - 1]);
            if (lastLazyNode)
                distEnd = Math.abs(lastLazyNode.node.rowIndex - otherDisplayIndex);
            const farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    }
    purgeExcessRows() {
        var _a;
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();
        if (this.store.getDisplayIndexEnd() == null || this.storeParams.maxBlocksInCache == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }
        const firstRowInViewport = this.api.getFirstDisplayedRow();
        const lastRowInViewport = this.api.getLastDisplayedRow();
        // the start storeIndex of every block in this store
        const allLoadedBlocks = new Set();
        // the start storeIndex of every displayed block in this store
        const blocksInViewport = new Set();
        this.nodeMap.forEach(({ index, node }) => {
            const blockStart = this.rowLoader.getBlockStartIndexForIndex(index);
            allLoadedBlocks.add(blockStart);
            const isInViewport = node.rowIndex >= firstRowInViewport && node.rowIndex <= lastRowInViewport;
            if (isInViewport) {
                blocksInViewport.add(blockStart);
            }
        });
        // if the viewport is larger than the max blocks, then the viewport size is minimum cache size
        const numberOfBlocksToRetain = Math.max(blocksInViewport.size, (_a = this.storeParams.maxBlocksInCache) !== null && _a !== void 0 ? _a : 0);
        // ensure there is blocks that can be removed
        const loadedBlockCount = allLoadedBlocks.size;
        const blocksToRemove = loadedBlockCount - numberOfBlocksToRetain;
        if (blocksToRemove <= 0) {
            return;
        }
        // the first and last block in the viewport
        let firstRowBlockStart = Number.MAX_SAFE_INTEGER;
        let lastRowBlockStart = Number.MIN_SAFE_INTEGER;
        blocksInViewport.forEach(blockStart => {
            if (firstRowBlockStart > blockStart) {
                firstRowBlockStart = blockStart;
            }
            if (lastRowBlockStart < blockStart) {
                lastRowBlockStart = blockStart;
            }
        });
        // all nodes which aren't cached or in the viewport, and so can be removed
        const disposableNodes = this.nodeMap.filter(({ node, index }) => {
            const rowBlockStart = this.rowLoader.getBlockStartIndexForIndex(index);
            const rowBlockInViewport = rowBlockStart >= firstRowBlockStart && rowBlockStart <= lastRowBlockStart;
            return !rowBlockInViewport && !this.isNodeCached(node);
        });
        if (disposableNodes.length === 0) {
            return;
        }
        const midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        const blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodes, midViewportRow);
        const blockSize = this.rowLoader.getBlockSize();
        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort((a, b) => Math.sign(b[1] - a[1]));
        // remove excess blocks, starting from furthest from viewport
        for (let i = 0; i < Math.min(blocksToRemove, blockDistanceArray.length); i++) {
            const blockStart = Number(blockDistanceArray[i][0]);
            for (let x = blockStart; x < blockStart + blockSize; x++) {
                const lazyNode = this.nodeMap.getBy('index', x);
                if (!lazyNode || this.isNodeCached(lazyNode.node)) {
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
        return (node.isExpandable() && node.expanded) || this.isNodeFocused(node);
    }
    extractDuplicateIds(rows) {
        if (this.getRowIdFunc != null) {
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
        const info = response.groupLevelInfo;
        this.store.setStoreInfo(info);
        if (this.getRowIdFunc != null) {
            const duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                const duplicateIdText = duplicates.join(', ');
                console.warn(`AG Grid: Unable to display rows as duplicate row ids (${duplicateIdText}) were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids.`);
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        if (response.pivotResultFields) {
            this.serverSideRowModel.generateSecondaryColumns(response.pivotResultFields);
        }
        const wasRefreshing = this.nodesToRefresh.size > 0;
        response.rowData.forEach((data, responseRowIndex) => {
            var _a;
            const rowIndex = firstRowIndex + responseRowIndex;
            const nodeFromCache = this.nodeMap.getBy('index', rowIndex);
            // if stub, overwrite
            if ((_a = nodeFromCache === null || nodeFromCache === void 0 ? void 0 : nodeFromCache.node) === null || _a === void 0 ? void 0 : _a.stub) {
                this.createRowAtIndex(rowIndex, data);
                return;
            }
            // node already exists, and same as node at designated position, update data
            if (nodeFromCache && this.doesNodeMatch(data, nodeFromCache.node)) {
                this.blockUtils.updateDataIntoRowNode(nodeFromCache.node, data);
                this.nodesToRefresh.delete(nodeFromCache.node);
                nodeFromCache.node.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            this.createRowAtIndex(rowIndex, data);
        });
        const finishedRefreshing = this.nodesToRefresh.size === 0;
        if (wasRefreshing && finishedRefreshing) {
            this.fireRefreshFinishedEvent();
        }
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
            const lazyNodesAfterStoreEnd = this.nodeMap.filter(lazyNode => lazyNode.index >= this.numberOfRows);
            lazyNodesAfterStoreEnd.forEach(lazyNode => this.destroyRowAtIndex(lazyNode.index));
        }
        this.fireStoreUpdatedEvent();
    }
    fireRefreshFinishedEvent() {
        const finishedRefreshing = this.nodesToRefresh.size === 0;
        // if anything refreshing currently, skip.
        if (!finishedRefreshing) {
            return;
        }
        // any nodes left in the map need to be cleaned up, this prevents us preserving nodes
        // indefinitely
        this.removedNodeCache.forEach(node => {
            this.blockUtils.destroyRowNode(node);
        });
        this.removedNodeCache = new Map();
        this.store.fireRefreshFinishedEvent();
    }
    isLastRowIndexKnown() {
        return this.isLastRowKnown;
    }
    onLoadFailed(firstRowIndex, numberOfRowsExpected) {
        var _a;
        if (!this.live)
            return;
        const wasRefreshing = this.nodesToRefresh.size > 0;
        for (let i = firstRowIndex; i < firstRowIndex + numberOfRowsExpected && i < this.getRowCount(); i++) {
            let { node } = (_a = this.nodeMap.getBy('index', i)) !== null && _a !== void 0 ? _a : {};
            if (node) {
                this.nodesToRefresh.delete(node);
            }
            if (!node || !node.stub) {
                if (node && !node.stub) {
                    // if node is not a stub, we destroy it and recreate as nodes can't go from data to stub
                    this.destroyRowAtIndex(i);
                }
                node = this.createRowAtIndex(i);
            }
            // this node has been refreshed, even if it wasn't successful
            node.__needsRefreshWhenVisible = false;
            node.failedLoad = true;
        }
        const finishedRefreshing = this.nodesToRefresh.size === 0;
        if (wasRefreshing && finishedRefreshing) {
            this.fireRefreshFinishedEvent();
        }
        this.fireStoreUpdatedEvent();
    }
    markNodesForRefresh() {
        this.nodeMap.forEach(lazyNode => {
            if (lazyNode.node.stub && !lazyNode.node.failedLoad) {
                return;
            }
            this.nodesToRefresh.add(lazyNode.node);
        });
        this.rowLoader.queueLoadCheck();
        if (this.isLastRowKnown && this.numberOfRows === 0) {
            this.numberOfRows = 1;
            this.isLastRowKnown = false;
            this.fireStoreUpdatedEvent();
        }
    }
    isNodeInCache(id) {
        return !!this.nodeMap.getBy('id', id);
    }
    // gets called 1) row count changed 2) cache purged 3) items inserted
    fireStoreUpdatedEvent() {
        if (!this.live) {
            return;
        }
        this.store.fireStoreUpdatedEvent();
    }
    getRowId(data) {
        if (this.getRowIdFunc == null) {
            return null;
        }
        // find rowNode using id
        const { level } = this.store.getRowDetails();
        const parentKeys = this.store.getParentNode().getGroupKeys();
        const id = this.getRowIdFunc({
            data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level,
        });
        return String(id);
    }
    updateRowNodes(updates) {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
        }
        const updatedNodes = [];
        updates.forEach(data => {
            const id = this.getRowId(data);
            const lazyNode = this.nodeMap.getBy('id', id);
            if (lazyNode) {
                this.blockUtils.updateDataIntoRowNode(lazyNode.node, data);
                updatedNodes.push(lazyNode.node);
            }
        });
        return updatedNodes;
    }
    insertRowNodes(inserts, indexToAdd) {
        // adjust row count to allow for footer row
        const realRowCount = this.store.getRowCount() - (this.store.getParentNode().sibling ? 1 : 0);
        // if missing and we know the last row, we're inserting at the end
        const addIndex = indexToAdd == null && this.isLastRowKnown ? realRowCount : indexToAdd;
        // can't insert nodes past the end of the store
        if (addIndex == null || realRowCount < addIndex) {
            return [];
        }
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
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
        const nodesToMove = this.nodeMap.filter(node => node.index >= addIndex);
        // delete all nodes which need moved first, so they don't get overwritten
        nodesToMove.forEach(lazyNode => this.nodeMap.delete(lazyNode));
        // then move the nodes to their new locations
        nodesToMove.forEach(lazyNode => {
            this.nodeMap.set({
                node: lazyNode.node,
                index: lazyNode.index + numberOfInserts,
                id: lazyNode.id,
            });
        });
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;
        // finally insert the new rows
        return uniqueInserts.map((data, uniqueInsertOffset) => this.createRowAtIndex(addIndex + uniqueInsertOffset, data));
    }
    getOrderedNodeMap() {
        const obj = {};
        this.nodeMap.forEach(node => obj[node.index] = node);
        return obj;
    }
    clearDisplayIndexes() {
        this.nodeDisplayIndexMap.clear();
    }
    removeRowNodes(idsToRemove) {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
        }
        const removedNodes = [];
        const nodesToVerify = [];
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        let deletedNodeCount = 0;
        const remainingIdsToRemove = [...idsToRemove];
        const allNodes = this.getOrderedNodeMap();
        let contiguousIndex = -1;
        for (let stringIndex in allNodes) {
            contiguousIndex += 1;
            const node = allNodes[stringIndex];
            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            const matchIndex = remainingIdsToRemove.findIndex(idToRemove => idToRemove === node.id);
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);
                this.destroyRowAtIndex(Number(stringIndex));
                removedNodes.push(node.node);
                deletedNodeCount += 1;
                continue;
            }
            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                continue;
            }
            const numericStoreIndex = Number(stringIndex);
            if (contiguousIndex !== numericStoreIndex) {
                nodesToVerify.push(node.node);
            }
            // shift normal node up by number of deleted prior to this point
            this.nodeMap.delete(allNodes[stringIndex]);
            this.nodeMap.set({
                id: node.id,
                node: node.node,
                index: numericStoreIndex - deletedNodeCount,
            });
        }
        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(node => node.__needsRefreshWhenVisible = true);
            this.rowLoader.queueLoadCheck();
        }
        return removedNodes;
    }
}
__decorate([
    Autowired('gridApi')
], LazyCache.prototype, "api", void 0);
__decorate([
    Autowired('ssrmBlockUtils')
], LazyCache.prototype, "blockUtils", void 0);
__decorate([
    Autowired('focusService')
], LazyCache.prototype, "focusService", void 0);
__decorate([
    Autowired('ssrmNodeManager')
], LazyCache.prototype, "nodeManager", void 0);
__decorate([
    Autowired('rowModel')
], LazyCache.prototype, "serverSideRowModel", void 0);
__decorate([
    PostConstruct
], LazyCache.prototype, "init", null);
__decorate([
    PreDestroy
], LazyCache.prototype, "destroyRowNodes", null);
