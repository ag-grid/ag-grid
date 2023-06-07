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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
        this.isMasterDetail = this.gridOptionsService.isMasterDetail();
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
        // make sure an existing node isn't being overwritten
        var lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        // if node already exists, update it or destroy it
        if (lazyNode) {
            var node = lazyNode.node;
            this.nodesToRefresh.delete(node);
            node.__needsRefreshWhenVisible = false;
            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, node)) {
                this.blockUtils.updateDataIntoRowNode(node, data);
                return node;
            }
            // if there's no id and this is an open group, protect this node from changes
            if (this.getRowIdFunc == null && node.group && node.expanded) {
                return node;
            }
            // destroy the old node, might be worth caching state here
            this.destroyRowAtIndex(atStoreIndex);
        }
        // if the node already exists elsewhere, update it and move it to the new location
        if (data && this.getRowIdFunc != null) {
            var id = this.getRowId(data);
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
            var sortedStates = __spreadArray([], __read(uniqueStates)).sort(function (a, b) { var _a, _b; return ((_a = statePriorityMap[a]) !== null && _a !== void 0 ? _a : 0) - ((_b = statePriorityMap[b]) !== null && _b !== void 0 ? _b : 0); });
            var priorityState = sortedStates[0];
            var blockNumber = Number(blockStart) / _this.rowLoader.getBlockSize();
            var blockId = blockPrefix ? blockPrefix + "-" + blockNumber : String(blockNumber);
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
        this.nodesToRefresh.delete(lazyNode.node);
        this.blockUtils.destroyRowNode(lazyNode.node);
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
        if (!this.getRowIdFunc == null) {
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
        return __spreadArray([], __read(duplicates));
    };
    LazyCache.prototype.onLoadSuccess = function (firstRowIndex, numberOfRowsExpected, response) {
        var _this = this;
        var _a;
        if (!this.live)
            return;
        var info = (_a = response.groupLevelInfo) !== null && _a !== void 0 ? _a : response.storeInfo;
        this.store.setStoreInfo(info);
        if (this.getRowIdFunc != null) {
            var duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                var duplicateIdText = duplicates.join(', ');
                console.warn("AG Grid: Unable to display rows as duplicate row ids (" + duplicateIdText + ") were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids.");
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
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
        var finishedRefreshing = this.nodesToRefresh.size === 0;
        // if anything refreshing currently, skip.
        if (!finishedRefreshing) {
            return;
        }
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
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
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
        // if missing and we know the last row, we're inserting at the end
        var addIndex = indexToAdd == null && this.isLastRowKnown ? this.store.getRowCount() : indexToAdd;
        // can't insert nodes past the end of the store
        if (addIndex == null || this.store.getRowCount() < addIndex) {
            return [];
        }
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
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
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        var removedNodes = [];
        var nodesToVerify = [];
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        var deletedNodeCount = 0;
        var remainingIdsToRemove = __spreadArray([], __read(idsToRemove));
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
        PostConstruct
    ], LazyCache.prototype, "init", null);
    __decorate([
        PreDestroy
    ], LazyCache.prototype, "destroyRowNodes", null);
    return LazyCache;
}(BeanStub));
export { LazyCache };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eUNhY2hlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zdG9yZXMvbGF6eS9sYXp5Q2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQTRELGFBQWEsRUFBRSxVQUFVLEVBQWtHLE1BQU0seUJBQXlCLENBQUM7QUFJblAsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQU0vQyxDQUFDO0FBRUY7SUFBK0IsNkJBQVE7SUFrRG5DLG1CQUFZLEtBQWdCLEVBQUUsWUFBb0IsRUFBRSxXQUF1QztRQUEzRixZQUNJLGlCQUFPLFNBS1Y7UUFsREQ7O1dBRUc7UUFDSyxVQUFJLEdBQUcsSUFBSSxDQUFDO1FBMkNoQixLQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixLQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxLQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztRQUM1QixLQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzs7SUFDbkMsQ0FBQztJQUdPLHdCQUFJLEdBQVo7UUFDSSxxRkFBcUY7UUFDckYsNEZBQTRGO1FBQzVGLHNCQUFzQjtRQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENB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