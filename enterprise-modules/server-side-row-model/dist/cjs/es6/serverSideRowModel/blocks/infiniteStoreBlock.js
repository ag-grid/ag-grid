"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
class InfiniteStoreBlock extends core_1.RowNodeBlock {
    constructor(blockNumber, parentRowNode, ssrmParams, storeParams, parentStore) {
        super(blockNumber);
        this.ssrmParams = ssrmParams;
        this.storeParams = storeParams;
        this.parentRowNode = parentRowNode;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * storeParams.cacheBlockSize;
        this.parentStore = parentStore;
        this.level = parentRowNode.level + 1;
        this.groupLevel = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : undefined;
        this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
    }
    postConstruct() {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        this.setData([]);
    }
    isDisplayIndexInBlock(displayIndex) {
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    }
    isBlockBefore(displayIndex) {
        return displayIndex >= this.displayIndexEnd;
    }
    getDisplayIndexStart() {
        return this.displayIndexStart;
    }
    getDisplayIndexEnd() {
        return this.displayIndexEnd;
    }
    getBlockHeightPx() {
        return this.blockHeightPx;
    }
    getBlockTopPx() {
        return this.blockTopPx;
    }
    isGroupLevel() {
        return this.groupLevel;
    }
    getGroupField() {
        return this.groupField;
    }
    prefixId(id) {
        if (this.nodeIdPrefix != null) {
            return this.nodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    }
    getBlockStateJson() {
        return {
            id: this.prefixId(this.getId()),
            state: {
                blockNumber: this.getId(),
                startRow: this.startRow,
                endRow: this.startRow + this.storeParams.cacheBlockSize,
                pageStatus: this.getState()
            }
        };
    }
    isAnyNodeOpen() {
        const openNodeCount = this.rowNodes.filter(node => node.expanded).length;
        return openNodeCount > 0;
    }
    // this method is repeated, see forEachRowNode, why?
    forEachNode(callback, sequence = new core_1.NumberSequence(), includeChildren, filterAndSort) {
        this.rowNodes.forEach(rowNode => {
            callback(rowNode, sequence.next());
            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (includeChildren && rowNode.childStore) {
                const childStore = rowNode.childStore;
                if (filterAndSort) {
                    childStore.forEachNodeDeepAfterFilterAndSort(callback, sequence);
                }
                else {
                    childStore.forEachNodeDeep(callback, sequence);
                }
            }
        });
    }
    forEachNodeDeep(callback, sequence) {
        this.forEachNode(callback, sequence, true, false);
    }
    forEachNodeAfterFilterAndSort(callback, sequence) {
        this.forEachNode(callback, sequence, true, true);
    }
    forEachNodeShallow(callback, sequence) {
        this.forEachNode(callback, sequence, false, false);
    }
    getLastAccessed() {
        return this.lastAccessed;
    }
    getRowUsingLocalIndex(rowIndex) {
        return this.rowNodes[rowIndex - this.startRow];
    }
    touchLastAccessed() {
        this.lastAccessed = this.ssrmParams.lastAccessedSequence.next();
    }
    processServerFail() {
        this.parentStore.onBlockLoadFailed(this);
    }
    retryLoads() {
        if (this.getState() === core_1.RowNodeBlock.STATE_FAILED) {
            this.setStateWaitingToLoad();
            this.rowNodeBlockLoader.checkBlockToLoad();
            this.setData();
        }
        this.forEachNodeShallow(node => {
            if (node.childStore) {
                node.childStore.retryLoads();
            }
        });
    }
    processServerResult(params) {
        this.parentStore.onBlockLoaded(this, params);
    }
    setData(rows = [], failedLoad = false) {
        this.destroyRowNodes();
        const storeRowCount = this.parentStore.getRowCount();
        const startRow = this.getId() * this.storeParams.cacheBlockSize;
        const endRow = Math.min(startRow + this.storeParams.cacheBlockSize, storeRowCount);
        const rowsToCreate = endRow - startRow;
        // when using autoHeight, we default the row heights to a height to fill the old height of the block.
        // we only ever do this to autoHeight, as we could be setting invalid heights (especially if different
        // number of rows in the block due to a filter, less rows would mean bigger rows), and autoHeight is
        // the only pattern that will automatically correct this. we check for visible autoHeight cols,
        // to omit the case where all autoHeight cols are hidden.
        const showingAutoHeightCols = this.columnModel.getAllDisplayedAutoHeightCols().length > 0;
        const cachedBlockHeight = showingAutoHeightCols ? this.parentStore.getCachedBlockHeight(this.getId()) : undefined;
        const cachedRowHeight = cachedBlockHeight ? Math.round(cachedBlockHeight / rowsToCreate) : undefined;
        for (let i = 0; i < rowsToCreate; i++) {
            const dataLoadedForThisRow = i < rows.length;
            const getNodeWithData = (existingNode) => {
                // if there's not an existing node to reuse, create a fresh node
                const rowNode = (existingNode !== null && existingNode !== void 0 ? existingNode : this.blockUtils.createRowNode({
                    field: this.groupField,
                    group: this.groupLevel,
                    leafGroup: this.leafGroup,
                    level: this.level,
                    parent: this.parentRowNode,
                    rowGroupColumn: this.rowGroupColumn,
                    rowHeight: cachedRowHeight
                }));
                if (dataLoadedForThisRow) {
                    const data = rows[i];
                    if (!!existingNode) {
                        this.blockUtils.updateDataIntoRowNode(rowNode, data);
                    }
                    else {
                        const defaultId = this.prefixId(this.startRow + i);
                        this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, cachedRowHeight);
                        this.blockUtils.checkOpenByDefault(rowNode);
                    }
                    this.parentStore.removeDuplicateNode(rowNode.id);
                    this.nodeManager.addRowNode(rowNode);
                    this.allNodesMap[rowNode.id] = rowNode;
                }
                if (failedLoad) {
                    rowNode.failedLoad = true;
                }
                return rowNode;
            };
            const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();
            let row;
            if (getRowIdFunc && dataLoadedForThisRow) {
                const data = rows[i];
                const parentKeys = this.parentRowNode.getGroupKeys();
                const id = getRowIdFunc({
                    data,
                    level: this.level,
                    parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                });
                const cachedRow = this.parentStore.retrieveNodeFromCache(id);
                row = getNodeWithData(cachedRow);
            }
            if (!row) {
                row = getNodeWithData();
            }
            this.rowNodes.push(row);
        }
    }
    // to safeguard the grid against duplicate nodes, when a row is loaded, we check
    // for another row in the same cache. if another row does exist, we delete it.
    // this covers for when user refreshes the store (which typically happens after a
    // data change) and the same row ends up coming back in a different block, and the
    // new block finishes refreshing before the old block has finished refreshing.
    removeDuplicateNode(id) {
        // we don't remove duplicates if this block is loaded, as that's a duplicate ID.
        // we are only interested in removing rows in blocks that are in the middle of a refresh,
        // ie two blocks, A and B, both are refreshed (as in the same cache) but A comes back
        // first and some rows have moved from B to A, we must remove the old rows from B.
        // however if B is not also getting refreshed (ie it's loaded) this is a bug
        // we need to tell the application about, as they provided duplicate ID's (done in Node Manager)
        if (this.getState() == core_1.RowNodeBlock.STATE_LOADED) {
            return;
        }
        const rowNode = this.allNodesMap[id];
        if (!rowNode) {
            return;
        }
        this.blockUtils.destroyRowNode(rowNode);
        const index = this.rowNodes.indexOf(rowNode);
        const stubRowNode = this.blockUtils.createRowNode({ field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn });
        this.rowNodes[index] = stubRowNode;
    }
    refresh() {
        if (this.getState() !== core_1.RowNodeBlock.STATE_WAITING_TO_LOAD) {
            this.setStateWaitingToLoad();
        }
    }
    destroyRowNodes() {
        var _a;
        (_a = this.rowNodes) === null || _a === void 0 ? void 0 : _a.forEach(row => {
            const isStoreCachingNode = this.parentStore.isNodeCached(row.id);
            this.blockUtils.destroyRowNode(row, isStoreCachingNode);
        });
        this.rowNodes = [];
        this.allNodesMap = {};
    }
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('ServerSideBlock');
    }
    getRowUsingDisplayIndex(displayRowIndex) {
        this.touchLastAccessed();
        const res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.rowNodes);
        return res;
    }
    loadFromDatasource() {
        this.storeUtils.loadFromDatasource({
            startRow: this.startRow,
            endRow: this.startRow + this.storeParams.cacheBlockSize,
            parentBlock: this,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            fail: this.pageLoadFailed.bind(this, this.getVersion())
        });
    }
    isPixelInRange(pixel) {
        return pixel >= this.blockTopPx && pixel < (this.blockTopPx + this.blockHeightPx);
    }
    getRowBounds(index) {
        this.touchLastAccessed();
        let res;
        for (const rowNode of this.rowNodes) {
            res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res != null) {
                break;
            }
        }
        return res;
    }
    getRowIndexAtPixel(pixel) {
        this.touchLastAccessed();
        let res = null;
        for (const rowNode of this.rowNodes) {
            res = this.blockUtils.getIndexAtPixel(rowNode, pixel);
            if (res != null) {
                break;
            }
        }
        return res;
    }
    clearDisplayIndexes() {
        this.displayIndexEnd = undefined;
        this.displayIndexStart = undefined;
        this.rowNodes.forEach(rowNode => this.blockUtils.clearDisplayIndex(rowNode));
    }
    setDisplayIndexes(displayIndexSeq, nextRowTop) {
        this.displayIndexStart = displayIndexSeq.peek();
        this.blockTopPx = nextRowTop.value;
        this.rowNodes.forEach(rowNode => this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop));
        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeightPx = nextRowTop.value - this.blockTopPx;
    }
}
__decorate([
    core_1.Autowired('columnModel')
], InfiniteStoreBlock.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('ssrmStoreUtils')
], InfiniteStoreBlock.prototype, "storeUtils", void 0);
__decorate([
    core_1.Autowired('ssrmBlockUtils')
], InfiniteStoreBlock.prototype, "blockUtils", void 0);
__decorate([
    core_1.Autowired('ssrmNodeManager')
], InfiniteStoreBlock.prototype, "nodeManager", void 0);
__decorate([
    core_1.Autowired('rowNodeBlockLoader')
], InfiniteStoreBlock.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    core_1.PostConstruct
], InfiniteStoreBlock.prototype, "postConstruct", null);
__decorate([
    core_1.PreDestroy
], InfiniteStoreBlock.prototype, "destroyRowNodes", null);
__decorate([
    __param(0, core_1.Qualifier('loggerFactory'))
], InfiniteStoreBlock.prototype, "setBeans", null);
exports.InfiniteStoreBlock = InfiniteStoreBlock;
