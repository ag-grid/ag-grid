"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyCache = void 0;
var core_1 = require("@ag-grid-community/core");
var lazyBlockLoader_1 = require("./lazyBlockLoader");
var LazyCache = /** @class */ (function (_super) {
    __extends(LazyCache, _super);
    function LazyCache(store, numberOfRows, storeParams) {
        var _this = _super.call(this) || this;
        // Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
        _this.live = true;
        _this.store = store;
        _this.numberOfRows = numberOfRows;
        _this.isLastRowKnown = false;
        _this.storeParams = storeParams;
        return _this;
    }
    LazyCache.prototype.init = function () {
        this.nodeIndexMap = {};
        this.nodeIds = new Set();
        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new lazyBlockLoader_1.LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
    };
    LazyCache.prototype.destroyRowNodes = function () {
        this.numberOfRows = 0;
        this.blockUtils.destroyRowNodes(this.getAllNodes());
        this.nodeIndexMap = {};
        this.nodeIds.clear();
        this.live = false;
    };
    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    LazyCache.prototype.getRowByDisplayIndex = function (displayIndex) {
        var _a;
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }
        var nodeAfterStringIndex;
        var nodeMapEntries = this.getNodeMapEntries();
        for (var i = 0; i < nodeMapEntries.length; i++) {
            var _b = __read(nodeMapEntries[i], 2), stringIndex = _b[0], node = _b[1];
            // if we find the index, simply return this node
            if (node.rowIndex === displayIndex) {
                if (node.stub || node.__needsRefreshWhenVisible) {
                    this.rowLoader.queueLoadAction();
                }
                return node;
            }
            // then check if current row contains a detail row with the index
            var expandedMasterRow = node.master && node.expanded;
            var detailNode = node.detailNode;
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
            var storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex, displayIndex);
        }
        // important to remember this node is not necessarily directly after the node we're searching for
        var nodeAfterIndex = Number(nodeAfterStringIndex);
        var nodeAfter = this.nodeIndexMap[nodeAfterIndex];
        // difference can be calculated from next nodes display index
        var nodeAfterDisplayIndex = nodeAfter.rowIndex;
        var storeIndexFromNodeAfterIndex = nodeAfterIndex - (nodeAfterDisplayIndex - displayIndex);
        return this.createStubNode(storeIndexFromNodeAfterIndex, displayIndex);
    };
    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    LazyCache.prototype.createStubNode = function (storeIndex, displayIndex) {
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        var rowBounds = this.store.getRowBounds(displayIndex);
        var newNode = this.createRowAtIndex(storeIndex, null, function (node) {
            node.setRowIndex(displayIndex);
            node.setRowTop(rowBounds.rowTop);
        });
        this.rowLoader.queueLoadAction();
        return newNode;
    };
    /**
     * @param index The row index relative to this store
     * @returns A rowNode at the given store index
     */
    LazyCache.prototype.getRowByStoreIndex = function (index) {
        return this.nodeIndexMap[index];
    };
    /**
     * Given a number of rows, skips through the given sequence & row top reference (using default row height)
     * @param numberOfRowsToSkip number of rows to skip over in the given sequence
     * @param displayIndexSeq the sequence in which to skip
     * @param nextRowTop the row top reference in which to skip
     */
    LazyCache.prototype.skipDisplayIndexes = function (numberOfRowsToSkip, displayIndexSeq, nextRowTop) {
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    };
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    LazyCache.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        var nodeEntries = this.getNodeMapEntries();
        var lastIndex = -1;
        nodeEntries.forEach(function (_a) {
            var _b = __read(_a, 2), stringIndex = _b[0], node = _b[1];
            var numericIndex = Number(stringIndex);
            // if any nodes aren't currently in the store, skip the display indexes too
            var numberOfRowsToSkip = (numericIndex - 1) - lastIndex;
            _this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
            // set this nodes index and row top
            _this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
            // store this index for skipping after this
            lastIndex = numericIndex;
        });
        // need to skip rows until the end of this store
        var numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
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
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.getNodeMapEntries = function () {
        return Object.entries(this.nodeIndexMap);
    };
    LazyCache.prototype.getAllNodes = function () {
        return Object.values(this.nodeIndexMap);
    };
    /**
     * Get or calculate the display index for this store
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to all stores
     */
    LazyCache.prototype.getDisplayIndexFromStoreIndex = function (storeIndex) {
        var _a;
        var nodeToReplace = this.nodeIndexMap[storeIndex];
        var displayIndexStart = this.store.getDisplayIndexStart();
        if (displayIndexStart == null) {
            return null;
        }
        // if node exists, we can extract its displayIndex
        if (nodeToReplace && nodeToReplace.rowIndex != null) {
            return nodeToReplace.rowIndex;
        }
        var allNodes = this.getNodeMapEntries();
        var lastNode = undefined;
        var lastIndex = -1;
        for (var i = 0; i < allNodes.length; i++) {
            var _b = __read(allNodes[i], 2), stringNodeStoreIndex = _b[0], node = _b[1];
            var numericNodeStoreIndex = Number(stringNodeStoreIndex);
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
        var nodeDiff = storeIndex - lastIndex;
        var childStoreEnd = (_a = lastNode.childStore) === null || _a === void 0 ? void 0 : _a.getDisplayIndexEnd();
        if (childStoreEnd != null) {
            return childStoreEnd + nodeDiff - 1;
        }
        if (lastNode.rowIndex != null) {
            return lastNode.rowIndex + nodeDiff;
        }
        return displayIndexStart + storeIndex;
    };
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    LazyCache.prototype.createRowAtIndex = function (atStoreIndex, data, createNodeCallback) {
        var _this = this;
        var usingRowIds = this.isUsingRowIds();
        // make sure an existing node isn't being overwritten
        var existingNodeAtIndex = this.nodeIndexMap[atStoreIndex];
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
            var allNodes = this.getNodeMapEntries();
            var existingNodeDetails = allNodes.find(function (_a) {
                var _b = __read(_a, 2), _ = _b[0], node = _b[1];
                return _this.doesNodeMatch(data, node);
            });
            if (existingNodeDetails) {
                var _a = __read(existingNodeDetails, 2), existingStringIndex = _a[0], existingNode = _a[1];
                var existingIndex = Number(existingStringIndex);
                this.blockUtils.updateDataIntoRowNode(existingNode, data);
                delete this.nodeIndexMap[existingIndex];
                this.nodeIndexMap[atStoreIndex] = existingNode;
                // mark all of the old block as needsVerify to trigger it for a refresh
                this.markBlockForVerify(existingIndex);
                return existingNode;
            }
        }
        // node doesn't exist, create a new one
        var newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            var defaultId = this.getPrefixedId(this.store.getIdSequence().next());
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
    };
    LazyCache.prototype.getBlockStates = function () {
        var _this = this;
        var blockCounts = {};
        var blockStates = {};
        var dirtyBlocks = new Set();
        this.getNodeMapEntries().forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), stringIndex = _c[0], node = _c[1];
            var index = Number(stringIndex);
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
            else if (node.__needsRefresh) {
                rowState = 'needsLoading';
            }
            if (node.__needsRefreshWhenVisible || node.stub) {
                dirtyBlocks.add(blockStart);
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
            var sortedStates = __spread(uniqueStates).sort(function (a, b) { var _a, _b; return ((_a = statePriorityMap[a]) !== null && _a !== void 0 ? _a : 0) - ((_b = statePriorityMap[b]) !== null && _b !== void 0 ? _b : 0); });
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
        var node = this.nodeIndexMap[atStoreIndex];
        this.nodeIds.delete(node.id);
        this.blockUtils.destroyRowNode(node);
        delete this.nodeIndexMap[atStoreIndex];
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
        for (var i = start; i < end; i++) {
            var node = this.nodeIndexMap[i];
            if (node) {
                node.__needsRefreshWhenVisible = true;
            }
        }
    };
    LazyCache.prototype.doesNodeMatch = function (data, node) {
        if (node.stub) {
            return false;
        }
        if (this.isUsingRowIds()) {
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
        this.getNodeMapEntries().forEach(function (_a) {
            var _b = __read(_a, 2), stringIndex = _b[0], node = _b[1];
            var numericIndex = Number(stringIndex);
            if (_this.rowLoader.isRowLoading(numericIndex)) {
                return;
            }
            if (node.stub && (numericIndex < firstRowBlockStart || numericIndex > lastRowBlockEnd)) {
                _this.destroyRowAtIndex(numericIndex);
            }
        });
    };
    /**
     * Calculates the number of rows to cache based on either the viewport, or number of cached blocks
     */
    LazyCache.prototype.getNumberOfRowsToRetain = function (firstRow, lastRow) {
        var numberOfCachedBlocks = this.storeParams.maxBlocksInCache;
        if (numberOfCachedBlocks == null) {
            return null;
        }
        var blockSize = this.rowLoader.getBlockSize();
        var numberOfViewportBlocks = Math.ceil((lastRow - firstRow) / blockSize);
        var numberOfBlocksToRetain = Math.max(numberOfCachedBlocks, numberOfViewportBlocks);
        var numberOfRowsToRetain = numberOfBlocksToRetain * blockSize;
        return numberOfRowsToRetain;
    };
    LazyCache.prototype.getBlocksDistanceFromRow = function (nodes, otherDisplayIndex) {
        var _this = this;
        var blockDistanceToMiddle = {};
        nodes.forEach(function (_a) {
            var _b = __read(_a, 2), storeIndexString = _b[0], node = _b[1];
            var _c = __read(_this.rowLoader.getBlockBoundsForIndex(Number(storeIndexString)), 2), blockStart = _c[0], blockEnd = _c[1];
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            var distStart = Math.abs(node.rowIndex - otherDisplayIndex);
            var distEnd;
            // may not have an end node if the block came back small 
            if (_this.nodeIndexMap[blockEnd - 1])
                distEnd = Math.abs(_this.nodeIndexMap[blockEnd - 1].rowIndex - otherDisplayIndex);
            var farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    };
    LazyCache.prototype.purgeExcessRows = function () {
        var _this = this;
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        var firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRowInViewport);
        var _a = __read(this.rowLoader.getBlockBoundsForIndex(lastRowInViewport), 2), _ = _a[0], lastRowBlockEnd = _a[1];
        // number of blocks to cache on top of the viewport blocks
        var numberOfRowsToRetain = this.getNumberOfRowsToRetain(firstRowBlockStart, lastRowBlockEnd);
        if (this.store.getDisplayIndexEnd() == null || numberOfRowsToRetain == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }
        // don't check the nodes that could have been cached out of necessity
        var disposableNodes = this.getNodeMapEntries().filter(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], node = _b[1];
            return !node.stub && !_this.isNodeCached(node);
        });
        if (disposableNodes.length <= numberOfRowsToRetain) {
            // not enough rows to bother clearing any
            return;
        }
        var midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        var blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodes, midViewportRow);
        var blockSize = this.rowLoader.getBlockSize();
        var numberOfBlocksToRetain = Math.ceil(numberOfRowsToRetain / blockSize);
        if (blockDistanceArray.length <= numberOfBlocksToRetain) {
            return;
        }
        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort(function (a, b) { return Math.sign(b[1] - a[1]); });
        var blocksToRemove = blockDistanceArray.length - numberOfBlocksToRetain;
        for (var i = 0; i < blocksToRemove; i++) {
            var blockStart = Number(blockDistanceArray[i][0]);
            for (var x = blockStart; x < blockStart + blockSize; x++) {
                var node = this.nodeIndexMap[x];
                if (!node || this.isNodeCached(node)) {
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
        return (!!node.group && node.expanded) || this.isNodeFocused(node);
    };
    LazyCache.prototype.extractDuplicateIds = function (rows) {
        var _this = this;
        if (!this.isUsingRowIds()) {
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
        return __spread(duplicates);
    };
    LazyCache.prototype.onLoadSuccess = function (firstRowIndex, numberOfRowsExpected, response) {
        var _this = this;
        if (!this.live)
            return;
        if (this.isUsingRowIds()) {
            var duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                var duplicateIdText = duplicates.join(', ');
                console.warn("AG Grid: Unable to display rows as duplicate row ids (" + duplicateIdText + ") were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids.");
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        response.rowData.forEach(function (data, responseRowIndex) {
            var rowIndex = firstRowIndex + responseRowIndex;
            var nodeFromCache = _this.nodeIndexMap[rowIndex];
            // if stub, overwrite
            if (nodeFromCache === null || nodeFromCache === void 0 ? void 0 : nodeFromCache.stub) {
                _this.createRowAtIndex(rowIndex, data);
                return;
            }
            if (nodeFromCache && _this.doesNodeMatch(data, nodeFromCache)) {
                _this.blockUtils.updateDataIntoRowNode(nodeFromCache, data);
                nodeFromCache.__needsRefresh = false;
                nodeFromCache.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            _this.createRowAtIndex(rowIndex, data);
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
            var lastInferredRow = firstRowIndex + response.rowData.length + 1;
            if (lastInferredRow > this.numberOfRows) {
                this.numberOfRows = lastInferredRow;
            }
        }
        if (this.isLastRowKnown) {
            // delete any rows after the last index
            var allRows = this.getNodeMapEntries();
            for (var i = allRows.length - 1; i >= 0; i--) {
                var numericIndex = Number(allRows[i][0]);
                if (numericIndex < this.numberOfRows) {
                    break;
                }
                this.destroyRowAtIndex(numericIndex);
            }
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.isLastRowIndexKnown = function () {
        return this.isLastRowKnown;
    };
    LazyCache.prototype.onLoadFailed = function (firstRowIndex, numberOfRowsExpected) {
        if (!this.live)
            return;
        for (var i = firstRowIndex; i < firstRowIndex + numberOfRowsExpected; i++) {
            var nodeFromCache = this.nodeIndexMap[i];
            if (nodeFromCache) {
                nodeFromCache.failedLoad = true;
            }
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.markNodesForRefresh = function () {
        this.getAllNodes().forEach(function (node) { return node.__needsRefresh = true; });
        this.rowLoader.queueLoadAction();
    };
    LazyCache.prototype.isNodeInCache = function (id) {
        return this.nodeIds.has(id);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    LazyCache.prototype.fireStoreUpdatedEvent = function () {
        if (!this.live) {
            return;
        }
        this.store.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.isUsingRowIds = function () {
        return this.gridOptionsService.getRowIdFunc() != null;
    };
    LazyCache.prototype.getRowId = function (data) {
        var getRowIdFunc = this.gridOptionsService.getRowIdFunc();
        if (getRowIdFunc == null) {
            return null;
        }
        // find rowNode using id
        var level = this.store.getRowDetails().level;
        var parentKeys = this.store.getParentNode().getGroupKeys();
        var id = getRowIdFunc({
            data: data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level: level,
        });
        return String(id);
    };
    LazyCache.prototype.lookupRowNode = function (data) {
        var _a;
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        // find rowNode using id
        var id = this.getRowId(data);
        return (_a = this.getAllNodes().find(function (node) { return node.id === id; })) !== null && _a !== void 0 ? _a : null;
    };
    LazyCache.prototype.updateRowNodes = function (updates) {
        var _this = this;
        var updatedNodes = [];
        updates.forEach(function (data) {
            var row = _this.lookupRowNode(data);
            if (row) {
                _this.blockUtils.updateDataIntoRowNode(row, data);
                updatedNodes.push(row);
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
        if (!this.isUsingRowIds()) {
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
        // first move all the nodes after the addIndex out of the way
        var allNodes = this.getNodeMapEntries();
        // iterate backwards to avoid overwriting nodes which haven't been shifted yet
        for (var i = allNodes.length - 1; i >= 0; i--) {
            var _a = __read(allNodes[i], 2), stringStoreIndex = _a[0], node = _a[1];
            var numericStoreIndex = Number(stringStoreIndex);
            // nodes should be in order as js maps sort by numeric keys, so if index is too low can stop iterating
            if (numericStoreIndex < addIndex) {
                break;
            }
            var newIndex = numericStoreIndex + numberOfInserts;
            if (this.getRowByStoreIndex(newIndex)) {
                // this shouldn't happen, why would a row already exist here
                throw new Error('AG Grid: Something went wrong, node in wrong place.');
            }
            else {
                this.nodeIndexMap[numericStoreIndex + numberOfInserts] = node;
                delete this.nodeIndexMap[numericStoreIndex];
            }
        }
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;
        // finally insert the new rows
        return uniqueInserts.map(function (data, uniqueInsertOffset) { return _this.createRowAtIndex(addIndex + uniqueInsertOffset, data); });
    };
    LazyCache.prototype.removeRowNodes = function (idsToRemove) {
        if (!this.isUsingRowIds()) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        var removedNodes = [];
        var allNodes = this.getNodeMapEntries();
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        var deletedNodeCount = 0;
        var remainingIdsToRemove = __spread(idsToRemove);
        var nodesToVerify = [];
        var _loop_1 = function (i) {
            var _a = __read(allNodes[i], 2), stringStoreIndex = _a[0], node = _a[1];
            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            var matchIndex = remainingIdsToRemove.findIndex(function (idToRemove) { return idToRemove === node.id; });
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);
                this_1.destroyRowAtIndex(Number(stringStoreIndex));
                removedNodes.push(node);
                deletedNodeCount += 1;
                return "continue";
            }
            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                return "continue";
            }
            var numericStoreIndex = Number(stringStoreIndex);
            if (i !== numericStoreIndex) {
                nodesToVerify.push(node);
            }
            // shift normal node up by number of deleted prior to this point
            this_1.nodeIndexMap[numericStoreIndex - deletedNodeCount] = this_1.nodeIndexMap[numericStoreIndex];
            delete this_1.nodeIndexMap[numericStoreIndex];
        };
        var this_1 = this;
        for (var i = 0; i < allNodes.length; i++) {
            _loop_1(i);
        }
        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(function (node) { return node.__needsRefreshWhenVisible = true; });
            this.rowLoader.queueLoadAction();
        }
        return removedNodes;
    };
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
    return LazyCache;
}(core_1.BeanStub));
exports.LazyCache = LazyCache;
