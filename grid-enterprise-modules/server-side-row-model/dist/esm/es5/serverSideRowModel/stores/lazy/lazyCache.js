var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Autowired, BeanStub, PostConstruct, PreDestroy } from "@ag-grid-community/core";
import { LazyBlockLoader } from "./lazyBlockLoader";
import { MultiIndexMap } from "./multiIndexMap";
;
var LazyCache = /** @class */ (function (_super) {
    __extends(LazyCache, _super);
    function LazyCache(store, numberOfRows, storeParams) {
        var _this = _super.call(this) || this;
        /**
         * Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
         */
        _this.live = true;
        /**
         * A cache of removed group nodes, this is retained for preserving group
         * state when the node moves in and out of the cache. Generally caused by
         * rows moving blocks.
         */
        _this.removedNodeCache = new Map();
        _this.store = store;
        _this.numberOfRows = numberOfRows;
        _this.isLastRowKnown = false;
        _this.storeParams = storeParams;
        return _this;
    }
    LazyCache.prototype.init = function () {
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
    };
    LazyCache.prototype.destroyRowNodes = function () {
        var _this = this;
        this.numberOfRows = 0;
        this.nodeMap.forEach(function (node) { return _this.blockUtils.destroyRowNode(node.node); });
        this.nodeMap.clear();
        this.nodeDisplayIndexMap.clear();
        this.nodesToRefresh.clear();
        this.live = false;
    };
    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    LazyCache.prototype.getRowByDisplayIndex = function (displayIndex) {
        var _a, _b, _c, _d;
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }
        // first try to directly look this node up in the display index map
        var node = this.nodeDisplayIndexMap.get(displayIndex);
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
        var contiguouslyPreviousNode = this.nodeDisplayIndexMap.get(displayIndex - 1);
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
            var lazyCacheNode = this.nodeMap.getBy('node', contiguouslyPreviousNode);
            return this.createStubNode(lazyCacheNode.index + 1, displayIndex);
        }
        var adjacentNodes = this.getSurroundingNodesByDisplayIndex(displayIndex);
        // if no bounds skipped includes this, calculate from end index
        if (adjacentNodes == null) {
            var storeIndexFromEndIndex_1 = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex_1, displayIndex);
        }
        var previousNode = adjacentNodes.previousNode, nextNode = adjacentNodes.nextNode;
        // if the node before this node is expanded, this node might be a child of that node
        if (previousNode && previousNode.node.expanded && ((_c = previousNode.node.childStore) === null || _c === void 0 ? void 0 : _c.isDisplayIndexInStore(displayIndex))) {
            return (_d = previousNode.node.childStore) === null || _d === void 0 ? void 0 : _d.getRowUsingDisplayIndex(displayIndex);
        }
        // if we have the node after this node, we can calculate the store index of this node by the difference
        // in display indexes between the two nodes.
        if (nextNode) {
            var displayIndexDiff = nextNode.node.rowIndex - displayIndex;
            var newStoreIndex = nextNode.index - displayIndexDiff;
            return this.createStubNode(newStoreIndex, displayIndex);
        }
        // if no next node, calculate from end index of this store
        var storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
        return this.createStubNode(storeIndexFromEndIndex, displayIndex);
    };
    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    LazyCache.prototype.createStubNode = function (storeIndex, displayIndex) {
        var _this = this;
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        var rowBounds = this.store.getRowBounds(displayIndex);
        var newNode = this.createRowAtIndex(storeIndex, null, function (node) {
            node.setRowIndex(displayIndex);
            node.setRowTop(rowBounds.rowTop);
            _this.nodeDisplayIndexMap.set(displayIndex, node);
        });
        this.rowLoader.queueLoadCheck();
        return newNode;
    };
    /**
     * @param index The row index relative to this store
     * @returns A rowNode at the given store index
     */
    LazyCache.prototype.getRowByStoreIndex = function (index) {
        var _a;
        return (_a = this.nodeMap.getBy('index', index)) === null || _a === void 0 ? void 0 : _a.node;
    };
    /**
     * Given a number of rows, skips through the given sequence & row top reference (using default row height)
     * @param numberOfRowsToSkip number of rows to skip over in the given sequence
     * @param displayIndexSeq the sequence in which to skip
     * @param nextRowTop the row top reference in which to skip
     */
    LazyCache.prototype.skipDisplayIndexes = function (numberOfRowsToSkip, displayIndexSeq, nextRowTop) {
        if (numberOfRowsToSkip === 0) {
            return;
        }
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    };
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    LazyCache.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        // Create a map of display index nodes for access speed
        this.nodeDisplayIndexMap.clear();
        // create an object indexed by store index, as this will sort all of the nodes when we iterate
        // the object
        var orderedMap = {};
        this.nodeMap.forEach(function (lazyNode) {
            orderedMap[lazyNode.index] = lazyNode.node;
        });
        var lastIndex = -1;
        // iterate over the nodes in order, setting the display index on each node.
        for (var stringIndex in orderedMap) {
            var node = orderedMap[stringIndex];
            var numericIndex = Number(stringIndex);
            // if any nodes aren't currently in the store, skip the display indexes too
            var numberOfRowsToSkip_1 = (numericIndex - 1) - lastIndex;
            this.skipDisplayIndexes(numberOfRowsToSkip_1, displayIndexSeq, nextRowTop);
            // set this nodes index and row top
            this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
            this.nodeDisplayIndexMap.set(node.rowIndex, node);
            // store this index for skipping after this
            lastIndex = numericIndex;
        }
        // need to skip rows until the end of this store
        var numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
        // this is not terribly efficient, and could probs be improved
        this.purgeExcessRows();
    };
    LazyCache.prototype.getRowCount = function () {
        return this.numberOfRows;
    };
    LazyCache.prototype.setRowCount = function (rowCount, isLastRowIndexKnown) {
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
    };
    LazyCache.prototype.getNodes = function () {
        return this.nodeMap;
    };
    LazyCache.prototype.getNodeCachedByDisplayIndex = function (displayIndex) {
        var _a;
        return (_a = this.nodeDisplayIndexMap.get(displayIndex)) !== null && _a !== void 0 ? _a : null;
    };
    LazyCache.prototype.getNodesToRefresh = function () {
        return this.nodesToRefresh;
    };
    /**
     * @returns the previous and next loaded row nodes surrounding the given display index
     */
    LazyCache.prototype.getSurroundingNodesByDisplayIndex = function (displayIndex) {
        var nextNode;
        var previousNode;
        this.nodeMap.forEach(function (lazyNode) {
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
        return { previousNode: previousNode, nextNode: nextNode };
    };
    /**
     * Get or calculate the display index for a given store index
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to the grid
     */
    LazyCache.prototype.getDisplayIndexFromStoreIndex = function (storeIndex) {
        var _a, _b;
        var nodeAtIndex = this.nodeMap.getBy('index', storeIndex);
        if (nodeAtIndex) {
            return nodeAtIndex.node.rowIndex;
        }
        var nextNode;
        var previousNode;
        this.nodeMap.forEach(function (lazyNode) {
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
        var storeIndexDiff = storeIndex - previousNode.index;
        var previousDisplayIndex = ((_b = (_a = previousNode.node.childStore) === null || _a === void 0 ? void 0 : _a.getDisplayIndexEnd()) !== null && _b !== void 0 ? _b : previousNode.node.rowIndex);
        return previousDisplayIndex + storeIndexDiff;
    };
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    LazyCache.prototype.createRowAtIndex = function (atStoreIndex, data, createNodeCallback) {
        var _a, _b;
        // make sure an existing node isn't being overwritten
        var lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        // if node already exists, update it or destroy it
        if (lazyNode) {
            var node = lazyNode.node;
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
            var id = this.getRowId(data);
            // the node was deleted at some point, but as we're refreshing
            // it's been cached and we can retrieve it for reuse.
            var deletedNode = id && ((_a = this.removedNodeCache) === null || _a === void 0 ? void 0 : _a.get(id));
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
            var lazyNode_1 = this.nodeMap.getBy('id', id);
            if (lazyNode_1) {
                // delete old lazy node so we can insert it at different location
                this.nodeMap.delete(lazyNode_1);
                var node = lazyNode_1.node, index = lazyNode_1.index;
                this.blockUtils.updateDataIntoRowNode(node, data);
                this.nodeMap.set({
                    id: node.id,
                    node: node,
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
        var newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            var defaultId = this.getPrefixedId(this.store.getIdSequence().next());
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
    };
    LazyCache.prototype.getBlockStates = function () {
        var _this = this;
        var blockCounts = {};
        var blockStates = {};
        this.nodeMap.forEach(function (_a) {
            var _b;
            var node = _a.node, index = _a.index;
            var blockStart = _this.rowLoader.getBlockStartIndexForIndex(index);
            if (!node.stub && !node.failedLoad) {
                blockCounts[blockStart] = ((_b = blockCounts[blockStart]) !== null && _b !== void 0 ? _b : 0) + 1;
            }
            var rowState = 'loaded';
            if (node.failedLoad) {
                rowState = 'failed';
            }
            else if (_this.rowLoader.isRowLoading(blockStart)) {
                rowState = 'loading';
            }
            else if (_this.nodesToRefresh.has(node) || node.stub) {
                rowState = 'needsLoading';
            }
            if (!blockStates[blockStart]) {
                blockStates[blockStart] = new Set();
            }
            blockStates[blockStart].add(rowState);
        });
        var statePriorityMap = {
            loading: 4,
            failed: 3,
            needsLoading: 2,
            loaded: 1,
        };
        var blockPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        var results = {};
        Object.entries(blockStates).forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), blockStart = _c[0], uniqueStates = _c[1];
            var sortedStates = __spreadArray([], __read(uniqueStates), false).sort(function (a, b) { var _a, _b; return ((_a = statePriorityMap[a]) !== null && _a !== void 0 ? _a : 0) - ((_b = statePriorityMap[b]) !== null && _b !== void 0 ? _b : 0); });
            var priorityState = sortedStates[0];
            var blockNumber = Number(blockStart) / _this.rowLoader.getBlockSize();
            var blockId = blockPrefix ? "".concat(blockPrefix, "-").concat(blockNumber) : String(blockNumber);
            results[blockId] = {
                blockNumber: blockNumber,
                startRow: Number(blockStart),
                endRow: Number(blockStart) + _this.rowLoader.getBlockSize(),
                pageStatus: priorityState,
                loadedRowCount: (_b = blockCounts[blockStart]) !== null && _b !== void 0 ? _b : 0,
            };
        });
        return results;
    };
    LazyCache.prototype.destroyRowAtIndex = function (atStoreIndex) {
        var lazyNode = this.nodeMap.getBy('index', atStoreIndex);
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
    };
    LazyCache.prototype.getSsrmParams = function () {
        return this.store.getSsrmParams();
    };
    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    LazyCache.prototype.getPrefixedId = function (id) {
        if (this.defaultNodeIdPrefix) {
            return this.defaultNodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    LazyCache.prototype.markBlockForVerify = function (rowIndex) {
        var _a = __read(this.rowLoader.getBlockBoundsForIndex(rowIndex), 2), start = _a[0], end = _a[1];
        var lazyNodesInRange = this.nodeMap.filter(function (lazyNode) { return lazyNode.index >= start && lazyNode.index < end; });
        lazyNodesInRange.forEach(function (_a) {
            var node = _a.node;
            node.__needsRefreshWhenVisible = true;
        });
    };
    LazyCache.prototype.doesNodeMatch = function (data, node) {
        if (node.stub) {
            return false;
        }
        if (this.getRowIdFunc != null) {
            var id = this.getRowId(data);
            return node.id === id;
        }
        return node.data === data;
    };
    /**
     * Deletes any stub nodes not within the given range
     */
    LazyCache.prototype.purgeStubsOutsideOfViewport = function () {
        var _this = this;
        var firstRow = this.api.getFirstDisplayedRow();
        var lastRow = this.api.getLastDisplayedRow();
        var firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRow);
        var _a = __read(this.rowLoader.getBlockBoundsForIndex(lastRow), 2), _ = _a[0], lastRowBlockEnd = _a[1];
        this.nodeMap.forEach(function (lazyNode) {
            // failed loads are still useful, so we don't purge them
            if (_this.rowLoader.isRowLoading(lazyNode.index) || lazyNode.node.failedLoad) {
                return;
            }
            if (lazyNode.node.stub && (lazyNode.index < firstRowBlockStart || lazyNode.index > lastRowBlockEnd)) {
                _this.destroyRowAtIndex(lazyNode.index);
            }
        });
    };
    LazyCache.prototype.getBlocksDistanceFromRow = function (nodes, otherDisplayIndex) {
        var _this = this;
        var blockDistanceToMiddle = {};
        nodes.forEach(function (_a) {
            var node = _a.node, index = _a.index;
            var _b = __read(_this.rowLoader.getBlockBoundsForIndex(index), 2), blockStart = _b[0], blockEnd = _b[1];
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            var distStart = Math.abs(node.rowIndex - otherDisplayIndex);
            var distEnd;
            // may not have an end node if the block came back small 
            var lastLazyNode = _this.nodeMap.getBy('index', [blockEnd - 1]);
            if (lastLazyNode)
                distEnd = Math.abs(lastLazyNode.node.rowIndex - otherDisplayIndex);
            var farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    };
    LazyCache.prototype.purgeExcessRows = function () {
        var _this = this;
        var _a;
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();
        if (this.store.getDisplayIndexEnd() == null || this.storeParams.maxBlocksInCache == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        // the start storeIndex of every block in this store
        var allLoadedBlocks = new Set();
        // the start storeIndex of every displayed block in this store
        var blocksInViewport = new Set();
        this.nodeMap.forEach(function (_a) {
            var index = _a.index, node = _a.node;
            var blockStart = _this.rowLoader.getBlockStartIndexForIndex(index);
            allLoadedBlocks.add(blockStart);
            var isInViewport = node.rowIndex >= firstRowInViewport && node.rowIndex <= lastRowInViewport;
            if (isInViewport) {
                blocksInViewport.add(blockStart);
            }
        });
        // if the viewport is larger than the max blocks, then the viewport size is minimum cache size
        var numberOfBlocksToRetain = Math.max(blocksInViewport.size, (_a = this.storeParams.maxBlocksInCache) !== null && _a !== void 0 ? _a : 0);
        // ensure there is blocks that can be removed
        var loadedBlockCount = allLoadedBlocks.size;
        var blocksToRemove = loadedBlockCount - numberOfBlocksToRetain;
        if (blocksToRemove <= 0) {
            return;
        }
        // the first and last block in the viewport
        var firstRowBlockStart = Number.MAX_SAFE_INTEGER;
        var lastRowBlockStart = Number.MIN_SAFE_INTEGER;
        blocksInViewport.forEach(function (blockStart) {
            if (firstRowBlockStart > blockStart) {
                firstRowBlockStart = blockStart;
            }
            if (lastRowBlockStart < blockStart) {
                lastRowBlockStart = blockStart;
            }
        });
        // all nodes which aren't cached or in the viewport, and so can be removed
        var disposableNodes = this.nodeMap.filter(function (_a) {
            var node = _a.node, index = _a.index;
            var rowBlockStart = _this.rowLoader.getBlockStartIndexForIndex(index);
            var rowBlockInViewport = rowBlockStart >= firstRowBlockStart && rowBlockStart <= lastRowBlockStart;
            return !rowBlockInViewport && !_this.isNodeCached(node);
        });
        if (disposableNodes.length === 0) {
            return;
        }
        var midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        var blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodes, midViewportRow);
        var blockSize = this.rowLoader.getBlockSize();
        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort(function (a, b) { return Math.sign(b[1] - a[1]); });
        // remove excess blocks, starting from furthest from viewport
        for (var i = 0; i < Math.min(blocksToRemove, blockDistanceArray.length); i++) {
            var blockStart = Number(blockDistanceArray[i][0]);
            for (var x = blockStart; x < blockStart + blockSize; x++) {
                var lazyNode = this.nodeMap.getBy('index', x);
                if (!lazyNode || this.isNodeCached(lazyNode.node)) {
                    continue;
                }
                this.destroyRowAtIndex(x);
            }
        }
    };
    LazyCache.prototype.isNodeFocused = function (node) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var hasFocus = focusedCell.rowIndex === node.rowIndex;
        return hasFocus;
    };
    LazyCache.prototype.isNodeCached = function (node) {
        return (node.isExpandable() && node.expanded) || this.isNodeFocused(node);
    };
    LazyCache.prototype.extractDuplicateIds = function (rows) {
        var _this = this;
        if (this.getRowIdFunc != null) {
            return [];
        }
        var newIds = new Set();
        var duplicates = new Set();
        rows.forEach(function (data) {
            var id = _this.getRowId(data);
            if (newIds.has(id)) {
                duplicates.add(id);
                return;
            }
            newIds.add(id);
        });
        return __spreadArray([], __read(duplicates), false);
    };
    LazyCache.prototype.onLoadSuccess = function (firstRowIndex, numberOfRowsExpected, response) {
        var _this = this;
        if (!this.live)
            return;
        var info = response.groupLevelInfo;
        this.store.setStoreInfo(info);
        if (this.getRowIdFunc != null) {
            var duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                var duplicateIdText = duplicates.join(', ');
                console.warn("AG Grid: Unable to display rows as duplicate row ids (".concat(duplicateIdText, ") were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids."));
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        if (response.pivotResultFields) {
            this.serverSideRowModel.generateSecondaryColumns(response.pivotResultFields);
        }
        var wasRefreshing = this.nodesToRefresh.size > 0;
        response.rowData.forEach(function (data, responseRowIndex) {
            var _a;
            var rowIndex = firstRowIndex + responseRowIndex;
            var nodeFromCache = _this.nodeMap.getBy('index', rowIndex);
            // if stub, overwrite
            if ((_a = nodeFromCache === null || nodeFromCache === void 0 ? void 0 : nodeFromCache.node) === null || _a === void 0 ? void 0 : _a.stub) {
                _this.createRowAtIndex(rowIndex, data);
                return;
            }
            // node already exists, and same as node at designated position, update data
            if (nodeFromCache && _this.doesNodeMatch(data, nodeFromCache.node)) {
                _this.blockUtils.updateDataIntoRowNode(nodeFromCache.node, data);
                _this.nodesToRefresh.delete(nodeFromCache.node);
                nodeFromCache.node.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            _this.createRowAtIndex(rowIndex, data);
        });
        var finishedRefreshing = this.nodesToRefresh.size === 0;
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
            var lastInferredRow = firstRowIndex + response.rowData.length + 1;
            if (lastInferredRow > this.numberOfRows) {
                this.numberOfRows = lastInferredRow;
            }
        }
        if (this.isLastRowKnown) {
            // delete any rows after the last index
            var lazyNodesAfterStoreEnd = this.nodeMap.filter(function (lazyNode) { return lazyNode.index >= _this.numberOfRows; });
            lazyNodesAfterStoreEnd.forEach(function (lazyNode) { return _this.destroyRowAtIndex(lazyNode.index); });
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.fireRefreshFinishedEvent = function () {
        var _this = this;
        var finishedRefreshing = this.nodesToRefresh.size === 0;
        // if anything refreshing currently, skip.
        if (!finishedRefreshing) {
            return;
        }
        // any nodes left in the map need to be cleaned up, this prevents us preserving nodes
        // indefinitely
        this.removedNodeCache.forEach(function (node) {
            _this.blockUtils.destroyRowNode(node);
        });
        this.removedNodeCache = new Map();
        this.store.fireRefreshFinishedEvent();
    };
    LazyCache.prototype.isLastRowIndexKnown = function () {
        return this.isLastRowKnown;
    };
    LazyCache.prototype.onLoadFailed = function (firstRowIndex, numberOfRowsExpected) {
        var _a;
        if (!this.live)
            return;
        var wasRefreshing = this.nodesToRefresh.size > 0;
        for (var i = firstRowIndex; i < firstRowIndex + numberOfRowsExpected && i < this.getRowCount(); i++) {
            var node = ((_a = this.nodeMap.getBy('index', i)) !== null && _a !== void 0 ? _a : {}).node;
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
        var finishedRefreshing = this.nodesToRefresh.size === 0;
        if (wasRefreshing && finishedRefreshing) {
            this.fireRefreshFinishedEvent();
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.markNodesForRefresh = function () {
        var _this = this;
        this.nodeMap.forEach(function (lazyNode) {
            if (lazyNode.node.stub && !lazyNode.node.failedLoad) {
                return;
            }
            _this.nodesToRefresh.add(lazyNode.node);
        });
        this.rowLoader.queueLoadCheck();
        if (this.isLastRowKnown && this.numberOfRows === 0) {
            this.numberOfRows = 1;
            this.isLastRowKnown = false;
            this.fireStoreUpdatedEvent();
        }
    };
    LazyCache.prototype.isNodeInCache = function (id) {
        return !!this.nodeMap.getBy('id', id);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    LazyCache.prototype.fireStoreUpdatedEvent = function () {
        if (!this.live) {
            return;
        }
        this.store.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.getRowId = function (data) {
        if (this.getRowIdFunc == null) {
            return null;
        }
        // find rowNode using id
        var level = this.store.getRowDetails().level;
        var parentKeys = this.store.getParentNode().getGroupKeys();
        var id = this.getRowIdFunc({
            data: data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level: level,
        });
        return String(id);
    };
    LazyCache.prototype.updateRowNodes = function (updates) {
        var _this = this;
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
        }
        var updatedNodes = [];
        updates.forEach(function (data) {
            var id = _this.getRowId(data);
            var lazyNode = _this.nodeMap.getBy('id', id);
            if (lazyNode) {
                _this.blockUtils.updateDataIntoRowNode(lazyNode.node, data);
                updatedNodes.push(lazyNode.node);
            }
        });
        return updatedNodes;
    };
    LazyCache.prototype.insertRowNodes = function (inserts, indexToAdd) {
        var _this = this;
        // adjust row count to allow for footer row
        var realRowCount = this.store.getRowCount() - (this.store.getParentNode().sibling ? 1 : 0);
        // if missing and we know the last row, we're inserting at the end
        var addIndex = indexToAdd == null && this.isLastRowKnown ? realRowCount : indexToAdd;
        // can't insert nodes past the end of the store
        if (addIndex == null || realRowCount < addIndex) {
            return [];
        }
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
        }
        var uniqueInsertsMap = {};
        inserts.forEach(function (data) {
            var dataId = _this.getRowId(data);
            if (dataId && _this.isNodeInCache(dataId)) {
                return;
            }
            uniqueInsertsMap[dataId] = data;
        });
        var uniqueInserts = Object.values(uniqueInsertsMap);
        var numberOfInserts = uniqueInserts.length;
        if (numberOfInserts === 0) {
            return [];
        }
        var nodesToMove = this.nodeMap.filter(function (node) { return node.index >= addIndex; });
        // delete all nodes which need moved first, so they don't get overwritten
        nodesToMove.forEach(function (lazyNode) { return _this.nodeMap.delete(lazyNode); });
        // then move the nodes to their new locations
        nodesToMove.forEach(function (lazyNode) {
            _this.nodeMap.set({
                node: lazyNode.node,
                index: lazyNode.index + numberOfInserts,
                id: lazyNode.id,
            });
        });
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;
        // finally insert the new rows
        return uniqueInserts.map(function (data, uniqueInsertOffset) { return _this.createRowAtIndex(addIndex + uniqueInsertOffset, data); });
    };
    LazyCache.prototype.getOrderedNodeMap = function () {
        var obj = {};
        this.nodeMap.forEach(function (node) { return obj[node.index] = node; });
        return obj;
    };
    LazyCache.prototype.clearDisplayIndexes = function () {
        this.nodeDisplayIndexMap.clear();
    };
    LazyCache.prototype.removeRowNodes = function (idsToRemove) {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
        }
        var removedNodes = [];
        var nodesToVerify = [];
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        var deletedNodeCount = 0;
        var remainingIdsToRemove = __spreadArray([], __read(idsToRemove), false);
        var allNodes = this.getOrderedNodeMap();
        var contiguousIndex = -1;
        var _loop_1 = function (stringIndex) {
            contiguousIndex += 1;
            var node = allNodes[stringIndex];
            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            var matchIndex = remainingIdsToRemove.findIndex(function (idToRemove) { return idToRemove === node.id; });
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);
                this_1.destroyRowAtIndex(Number(stringIndex));
                removedNodes.push(node.node);
                deletedNodeCount += 1;
                return "continue";
            }
            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                return "continue";
            }
            var numericStoreIndex = Number(stringIndex);
            if (contiguousIndex !== numericStoreIndex) {
                nodesToVerify.push(node.node);
            }
            // shift normal node up by number of deleted prior to this point
            this_1.nodeMap.delete(allNodes[stringIndex]);
            this_1.nodeMap.set({
                id: node.id,
                node: node.node,
                index: numericStoreIndex - deletedNodeCount,
            });
        };
        var this_1 = this;
        for (var stringIndex in allNodes) {
            _loop_1(stringIndex);
        }
        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(function (node) { return node.__needsRefreshWhenVisible = true; });
            this.rowLoader.queueLoadCheck();
        }
        return removedNodes;
    };
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
    return LazyCache;
}(BeanStub));
export { LazyCache };
