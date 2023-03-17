/**
          * @ag-grid-community/infinite-row-model - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v29.2.0
          * @link https://www.ag-grid.com/
          * @license MIT
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');

var __extends$2 = (undefined && undefined.__extends) || (function () {
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
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InfiniteBlock = /** @class */ (function (_super) {
    __extends$2(InfiniteBlock, _super);
    function InfiniteBlock(id, parentCache, params) {
        var _this = _super.call(this, id) || this;
        _this.parentCache = parentCache;
        _this.params = params;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        _this.startRow = id * params.blockSize;
        _this.endRow = _this.startRow + params.blockSize;
        return _this;
    }
    InfiniteBlock.prototype.postConstruct = function () {
        this.createRowNodes();
    };
    InfiniteBlock.prototype.getBlockStateJson = function () {
        return {
            id: '' + this.getId(),
            state: {
                blockNumber: this.getId(),
                startRow: this.getStartRow(),
                endRow: this.getEndRow(),
                pageStatus: this.getState()
            }
        };
    };
    InfiniteBlock.prototype.setDataAndId = function (rowNode, data, index) {
        // if there's no id and the rowNode was rendered before, it means this
        // was a placeholder rowNode and should not be recycled. Setting
        // `alreadyRendered`  to `false` forces the rowRenderer to flush it.
        if (!rowNode.id && rowNode.alreadyRendered) {
            rowNode.alreadyRendered = false;
        }
        if (core._.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
        }
    };
    InfiniteBlock.prototype.loadFromDatasource = function () {
        var _this = this;
        var params = this.createLoadParams();
        if (core._.missing(this.params.datasource.getRows)) {
            console.warn("AG Grid: datasource is missing getRows method");
            return;
        }
        // put in timeout, to force result to be async
        window.setTimeout(function () {
            _this.params.datasource.getRows(params);
        }, 0);
    };
    InfiniteBlock.prototype.processServerFail = function () {
        // todo - this method has better handling in SSRM
    };
    InfiniteBlock.prototype.createLoadParams = function () {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        var params = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            sortModel: this.params.sortModel,
            filterModel: this.params.filterModel,
            context: this.gridOptionsService.context
        };
        return params;
    };
    InfiniteBlock.prototype.forEachNode = function (callback, sequence, rowCount) {
        var _this = this;
        this.rowNodes.forEach(function (rowNode, index) {
            var rowIndex = _this.startRow + index;
            if (rowIndex < rowCount) {
                callback(rowNode, sequence.next());
            }
        });
    };
    InfiniteBlock.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    InfiniteBlock.prototype.getRow = function (rowIndex, dontTouchLastAccessed) {
        if (dontTouchLastAccessed === void 0) { dontTouchLastAccessed = false; }
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.params.lastAccessedSequence.next();
        }
        var localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    };
    InfiniteBlock.prototype.getStartRow = function () {
        return this.startRow;
    };
    InfiniteBlock.prototype.getEndRow = function () {
        return this.endRow;
    };
    // creates empty row nodes, data is missing as not loaded yet
    InfiniteBlock.prototype.createRowNodes = function () {
        this.rowNodes = [];
        for (var i = 0; i < this.params.blockSize; i++) {
            var rowIndex = this.startRow + i;
            var rowNode = new core.RowNode(this.beans);
            rowNode.setRowHeight(this.params.rowHeight);
            rowNode.uiLevel = 0;
            rowNode.setRowIndex(rowIndex);
            rowNode.setRowTop(this.params.rowHeight * rowIndex);
            this.rowNodes.push(rowNode);
        }
    };
    InfiniteBlock.prototype.processServerResult = function (params) {
        var _this = this;
        this.rowNodes.forEach(function (rowNode, index) {
            var data = params.rowData ? params.rowData[index] : undefined;
            _this.setDataAndId(rowNode, data, _this.startRow + index);
        });
        var finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;
        this.parentCache.pageLoaded(this, finalRowCount);
    };
    InfiniteBlock.prototype.destroyRowNodes = function () {
        this.rowNodes.forEach(function (rowNode) {
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown.
            rowNode.clearRowTopAndRowIndex();
        });
    };
    __decorate$2([
        core.Autowired('beans')
    ], InfiniteBlock.prototype, "beans", void 0);
    __decorate$2([
        core.PostConstruct
    ], InfiniteBlock.prototype, "postConstruct", null);
    __decorate$2([
        core.PreDestroy
    ], InfiniteBlock.prototype, "destroyRowNodes", null);
    return InfiniteBlock;
}(core.RowNodeBlock));

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InfiniteCache = /** @class */ (function (_super) {
    __extends$1(InfiniteCache, _super);
    function InfiniteCache(params) {
        var _this = _super.call(this) || this;
        _this.lastRowIndexKnown = false;
        _this.blocks = {};
        _this.blockCount = 0;
        _this.rowCount = params.initialRowCount;
        _this.params = params;
        return _this;
    }
    InfiniteCache.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('InfiniteCache');
    };
    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in the cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    InfiniteCache.prototype.getRow = function (rowIndex, dontCreatePage) {
        if (dontCreatePage === void 0) { dontCreatePage = false; }
        var blockId = Math.floor(rowIndex / this.params.blockSize);
        var block = this.blocks[blockId];
        if (!block) {
            if (dontCreatePage) {
                return undefined;
            }
            block = this.createBlock(blockId);
        }
        return block.getRow(rowIndex);
    };
    InfiniteCache.prototype.createBlock = function (blockNumber) {
        var newBlock = this.createBean(new InfiniteBlock(blockNumber, this, this.params));
        this.blocks[newBlock.getId()] = newBlock;
        this.blockCount++;
        this.purgeBlocksIfNeeded(newBlock);
        this.params.rowNodeBlockLoader.addBlock(newBlock);
        return newBlock;
    };
    // we have this on infinite row model only, not server side row model,
    // because for server side, it would leave the children in inconsistent
    // state - eg if a node had children, but after the refresh it had data
    // for a different row, then the children would be with the wrong row node.
    InfiniteCache.prototype.refreshCache = function () {
        var nothingToRefresh = this.blockCount == 0;
        if (nothingToRefresh) {
            this.purgeCache();
            return;
        }
        this.getBlocksInOrder().forEach(function (block) { return block.setStateWaitingToLoad(); });
        this.params.rowNodeBlockLoader.checkBlockToLoad();
    };
    InfiniteCache.prototype.destroyAllBlocks = function () {
        var _this = this;
        this.getBlocksInOrder().forEach(function (block) { return _this.destroyBlock(block); });
    };
    InfiniteCache.prototype.getRowCount = function () {
        return this.rowCount;
    };
    InfiniteCache.prototype.isLastRowIndexKnown = function () {
        return this.lastRowIndexKnown;
    };
    // block calls this, when page loaded
    InfiniteCache.prototype.pageLoaded = function (block, lastRow) {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) {
            return;
        }
        this.logger.log("onPageLoaded: page = " + block.getId() + ", lastRow = " + lastRow);
        this.checkRowCount(block, lastRow);
        // we fire cacheUpdated even if the row count has not changed, as some items need updating even
        // if no new rows to render. for example the pagination panel has '?' as the total rows when loading
        // is underway, which would need to get updated when loading finishes.
        this.onCacheUpdated();
    };
    InfiniteCache.prototype.purgeBlocksIfNeeded = function (blockToExclude) {
        var _this = this;
        // we exclude checking for the page just created, as this has yet to be accessed and hence
        // the lastAccessed stamp will not be updated for the first time yet
        var blocksForPurging = this.getBlocksInOrder().filter(function (b) { return b != blockToExclude; });
        var lastAccessedComparator = function (a, b) { return b.getLastAccessed() - a.getLastAccessed(); };
        blocksForPurging.sort(lastAccessedComparator);
        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        var maxBlocksProvided = this.params.maxBlocksInCache > 0;
        var blocksToKeep = maxBlocksProvided ? this.params.maxBlocksInCache - 1 : null;
        var emptyBlocksToKeep = InfiniteCache.MAX_EMPTY_BLOCKS_TO_KEEP - 1;
        blocksForPurging.forEach(function (block, index) {
            var purgeBecauseBlockEmpty = block.getState() === InfiniteBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;
            var purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;
            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {
                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (_this.isBlockCurrentlyDisplayed(block)) {
                    return;
                }
                // don't want to loose keyboard focus, so keyboard navigation can continue. so keep focused blocks.
                if (_this.isBlockFocused(block)) {
                    return;
                }
                // at this point, block is not needed, so burn baby burn
                _this.removeBlockFromCache(block);
            }
        });
    };
    InfiniteCache.prototype.isBlockFocused = function (block) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var blockIndexStart = block.getStartRow();
        var blockIndexEnd = block.getEndRow();
        var hasFocus = focusedCell.rowIndex >= blockIndexStart && focusedCell.rowIndex < blockIndexEnd;
        return hasFocus;
    };
    InfiniteCache.prototype.isBlockCurrentlyDisplayed = function (block) {
        var startIndex = block.getStartRow();
        var endIndex = block.getEndRow() - 1;
        return this.rowRenderer.isRangeInRenderedViewport(startIndex, endIndex);
    };
    InfiniteCache.prototype.removeBlockFromCache = function (blockToRemove) {
        if (!blockToRemove) {
            return;
        }
        this.destroyBlock(blockToRemove);
        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    };
    InfiniteCache.prototype.checkRowCount = function (block, lastRow) {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.rowCount = lastRow;
            this.lastRowIndexKnown = true;
        }
        else if (!this.lastRowIndexKnown) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (block.getId() + 1) * this.params.blockSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.params.overflowSize;
            if (this.rowCount < lastRowIndexPlusOverflow) {
                this.rowCount = lastRowIndexPlusOverflow;
            }
        }
    };
    InfiniteCache.prototype.setRowCount = function (rowCount, lastRowIndexKnown) {
        this.rowCount = rowCount;
        // if undefined is passed, we do not set this value, if one of {true,false}
        // is passed, we do set the value.
        if (core._.exists(lastRowIndexKnown)) {
            this.lastRowIndexKnown = lastRowIndexKnown;
        }
        // if we are still searching, then the row count must not end at the end
        // of a particular page, otherwise the searching will not pop into the
        // next page
        if (!this.lastRowIndexKnown) {
            if (this.rowCount % this.params.blockSize === 0) {
                this.rowCount++;
            }
        }
        this.onCacheUpdated();
    };
    InfiniteCache.prototype.forEachNodeDeep = function (callback) {
        var _this = this;
        var sequence = new core.NumberSequence();
        this.getBlocksInOrder().forEach(function (block) { return block.forEachNode(callback, sequence, _this.rowCount); });
    };
    InfiniteCache.prototype.getBlocksInOrder = function () {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        var blockComparator = function (a, b) { return a.getId() - b.getId(); };
        var blocks = core._.getAllValuesInObject(this.blocks).sort(blockComparator);
        return blocks;
    };
    InfiniteCache.prototype.destroyBlock = function (block) {
        delete this.blocks[block.getId()];
        this.destroyBean(block);
        this.blockCount--;
        this.params.rowNodeBlockLoader.removeBlock(block);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    InfiniteCache.prototype.onCacheUpdated = function () {
        if (this.isAlive()) {
            // if the virtualRowCount is shortened, then it's possible blocks exist that are no longer
            // in the valid range. so we must remove these. this can happen if user explicitly sets
            // the virtual row count, or the datasource returns a result and sets lastRow to something
            // less than virtualRowCount (can happen if user scrolls down, server reduces dataset size).
            this.destroyAllBlocksPastVirtualRowCount();
            // this results in both row models (infinite and server side) firing ModelUpdated,
            // however server side row model also updates the row indexes first
            var event_1 = {
                type: core.Events.EVENT_STORE_UPDATED
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    InfiniteCache.prototype.destroyAllBlocksPastVirtualRowCount = function () {
        var _this = this;
        var blocksToDestroy = [];
        this.getBlocksInOrder().forEach(function (block) {
            var startRow = block.getId() * _this.params.blockSize;
            if (startRow >= _this.rowCount) {
                blocksToDestroy.push(block);
            }
        });
        if (blocksToDestroy.length > 0) {
            blocksToDestroy.forEach(function (block) { return _this.destroyBlock(block); });
        }
    };
    InfiniteCache.prototype.purgeCache = function () {
        var _this = this;
        this.getBlocksInOrder().forEach(function (block) { return _this.removeBlockFromCache(block); });
        this.lastRowIndexKnown = false;
        // if zero rows in the cache, we need to get the SSRM to start asking for rows again.
        // otherwise if set to zero rows last time, and we don't update the row count, then after
        // the purge there will still be zero rows, meaning the SSRM won't request any rows.
        // to kick things off, at least one row needs to be asked for.
        if (this.rowCount === 0) {
            this.rowCount = this.params.initialRowCount;
        }
        this.onCacheUpdated();
    };
    InfiniteCache.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var _this = this;
        var result = [];
        var lastBlockId = -1;
        var inActiveRange = false;
        var numberSequence = new core.NumberSequence();
        // if only one node passed, we start the selection at the top
        if (core._.missing(firstInRange)) {
            inActiveRange = true;
        }
        var foundGapInSelection = false;
        this.getBlocksInOrder().forEach(function (block) {
            if (foundGapInSelection) {
                return;
            }
            if (inActiveRange && (lastBlockId + 1 !== block.getId())) {
                foundGapInSelection = true;
                return;
            }
            lastBlockId = block.getId();
            block.forEachNode(function (rowNode) {
                var hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }
                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }
            }, numberSequence, _this.rowCount);
        });
        // inActiveRange will be still true if we never hit the second rowNode
        var invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    };
    // this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
    // blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
    // scrolled over are not needed to be loaded.
    InfiniteCache.MAX_EMPTY_BLOCKS_TO_KEEP = 2;
    __decorate$1([
        core.Autowired('rowRenderer')
    ], InfiniteCache.prototype, "rowRenderer", void 0);
    __decorate$1([
        core.Autowired("focusService")
    ], InfiniteCache.prototype, "focusService", void 0);
    __decorate$1([
        __param(0, core.Qualifier('loggerFactory'))
    ], InfiniteCache.prototype, "setBeans", null);
    __decorate$1([
        core.PreDestroy
    ], InfiniteCache.prototype, "destroyAllBlocks", null);
    return InfiniteCache;
}(core.BeanStub));

var __extends = (undefined && undefined.__extends) || (function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InfiniteRowModel = /** @class */ (function (_super) {
    __extends(InfiniteRowModel, _super);
    function InfiniteRowModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InfiniteRowModel.prototype.getRowBounds = function (index) {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    };
    // we don't implement as lazy row heights is not supported in this row model
    InfiniteRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) {
        return false;
    };
    InfiniteRowModel.prototype.init = function () {
        var _this = this;
        if (!this.gridOptionsService.isRowModelType('infinite')) {
            return;
        }
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.addEventListeners();
        this.addDestroyFunc(function () { return _this.destroyCache(); });
        this.verifyProps();
    };
    InfiniteRowModel.prototype.verifyProps = function () {
        if (this.gridOptionsService.exists('initialGroupOrderComparator') || this.gridOptionsService.exists('defaultGroupOrderComparator')) {
            var message_1 = "AG Grid: initialGroupOrderComparator cannot be used with Infinite Row Model. If using Infinite Row Model, then sorting is done on the server side, nothing to do with the client.";
            core._.doOnce(function () { return console.warn(message_1); }, 'IRM.InitialGroupOrderComparator');
        }
    };
    InfiniteRowModel.prototype.start = function () {
        this.setDatasource(this.gridOptionsService.get('datasource'));
    };
    InfiniteRowModel.prototype.destroyDatasource = function () {
        if (this.datasource) {
            this.getContext().destroyBean(this.datasource);
            this.rowRenderer.datasourceChanged();
            this.datasource = null;
        }
    };
    InfiniteRowModel.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, core.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_STORE_UPDATED, this.onCacheUpdated.bind(this));
    };
    InfiniteRowModel.prototype.onFilterChanged = function () {
        this.reset();
    };
    InfiniteRowModel.prototype.onSortChanged = function () {
        this.reset();
    };
    InfiniteRowModel.prototype.onColumnEverything = function () {
        var resetRequired;
        // if cache params, we require reset only if sort model has changed. we don't need to check
        // for filter model, as the filter manager will fire an event when columns change that result
        // in the filter changing.
        if (this.cacheParams) {
            resetRequired = this.isSortModelDifferent();
        }
        else {
            // if no cacheParams, means first time creating the cache, so always create one
            resetRequired = true;
        }
        if (resetRequired) {
            this.reset();
        }
    };
    InfiniteRowModel.prototype.isSortModelDifferent = function () {
        return !core._.jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
    };
    InfiniteRowModel.prototype.getType = function () {
        return 'infinite';
    };
    InfiniteRowModel.prototype.setDatasource = function (datasource) {
        this.destroyDatasource();
        this.datasource = datasource;
        // only reset if we have a valid datasource to working with
        if (datasource) {
            this.reset();
        }
    };
    InfiniteRowModel.prototype.isEmpty = function () {
        return !this.infiniteCache;
    };
    InfiniteRowModel.prototype.isRowsToRender = function () {
        return !!this.infiniteCache;
    };
    InfiniteRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        return this.infiniteCache ? this.infiniteCache.getRowNodesInRange(firstInRange, lastInRange) : [];
    };
    InfiniteRowModel.prototype.reset = function () {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (!this.datasource) {
            return;
        }
        // if user is providing id's, then this means we can keep the selection between datasource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done.
        var getRowIdFunc = this.gridOptionsService.getRowIdFunc();
        var userGeneratingIds = getRowIdFunc != null;
        if (!userGeneratingIds) {
            this.selectionService.reset();
        }
        this.resetCache();
        var event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    };
    InfiniteRowModel.prototype.createModelUpdatedEvent = function () {
        return {
            type: core.Events.EVENT_MODEL_UPDATED,
            // not sure if these should all be false - noticed if after implementing,
            // maybe they should be true?
            newPage: false,
            newData: false,
            keepRenderedRows: true,
            animate: false
        };
    };
    InfiniteRowModel.prototype.resetCache = function () {
        // if not first time creating a cache, need to destroy the old one
        this.destroyCache();
        this.cacheParams = {
            // the user provided datasource
            datasource: this.datasource,
            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),
            rowNodeBlockLoader: this.rowNodeBlockLoader,
            // properties - this way we take a snapshot of them, so if user changes any, they will be
            // used next time we create a new cache, which is generally after a filter or sort change,
            // or a new datasource is set
            initialRowCount: this.defaultIfInvalid(this.gridOptionsService.getNum('infiniteInitialRowCount'), 1),
            maxBlocksInCache: this.gridOptionsService.getNum('maxBlocksInCache'),
            rowHeight: this.gridOptionsService.getRowHeightAsNumber(),
            // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
            // the current page and request first row of next page
            overflowSize: this.defaultIfInvalid(this.gridOptionsService.getNum('cacheOverflowSize'), 1),
            // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
            // server for one page at a time. so the default if not specified is 100.
            blockSize: this.defaultIfInvalid(this.gridOptionsService.getNum('cacheBlockSize'), 100),
            // the cache could create this, however it is also used by the pages, so handy to create it
            // here as the settings are also passed to the pages
            lastAccessedSequence: new core.NumberSequence()
        };
        this.infiniteCache = this.createBean(new InfiniteCache(this.cacheParams));
    };
    InfiniteRowModel.prototype.defaultIfInvalid = function (value, defaultValue) {
        return value > 0 ? value : defaultValue;
    };
    InfiniteRowModel.prototype.destroyCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache = this.destroyBean(this.infiniteCache);
        }
    };
    InfiniteRowModel.prototype.onCacheUpdated = function () {
        var event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    };
    InfiniteRowModel.prototype.getRow = function (rowIndex) {
        if (!this.infiniteCache) {
            return undefined;
        }
        if (rowIndex >= this.infiniteCache.getRowCount()) {
            return undefined;
        }
        return this.infiniteCache.getRow(rowIndex);
    };
    InfiniteRowModel.prototype.getRowNode = function (id) {
        var result;
        this.forEachNode(function (rowNode) {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    };
    InfiniteRowModel.prototype.forEachNode = function (callback) {
        if (this.infiniteCache) {
            this.infiniteCache.forEachNodeDeep(callback);
        }
    };
    InfiniteRowModel.prototype.getTopLevelRowCount = function () {
        return this.getRowCount();
    };
    InfiniteRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        return topLevelIndex;
    };
    InfiniteRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            var rowIndexForPixel = Math.floor(pixel / this.rowHeight);
            var lastRowIndex = this.getRowCount() - 1;
            if (rowIndexForPixel > lastRowIndex) {
                return lastRowIndex;
            }
            return rowIndexForPixel;
        }
        return 0;
    };
    InfiniteRowModel.prototype.getRowCount = function () {
        return this.infiniteCache ? this.infiniteCache.getRowCount() : 0;
    };
    InfiniteRowModel.prototype.isRowPresent = function (rowNode) {
        var foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    };
    InfiniteRowModel.prototype.refreshCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache.refreshCache();
        }
    };
    InfiniteRowModel.prototype.purgeCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache.purgeCache();
        }
    };
    // for iRowModel
    InfiniteRowModel.prototype.isLastRowIndexKnown = function () {
        if (this.infiniteCache) {
            return this.infiniteCache.isLastRowIndexKnown();
        }
        return false;
    };
    InfiniteRowModel.prototype.setRowCount = function (rowCount, lastRowIndexKnown) {
        if (this.infiniteCache) {
            this.infiniteCache.setRowCount(rowCount, lastRowIndexKnown);
        }
    };
    __decorate([
        core.Autowired('filterManager')
    ], InfiniteRowModel.prototype, "filterManager", void 0);
    __decorate([
        core.Autowired('sortController')
    ], InfiniteRowModel.prototype, "sortController", void 0);
    __decorate([
        core.Autowired('selectionService')
    ], InfiniteRowModel.prototype, "selectionService", void 0);
    __decorate([
        core.Autowired('rowRenderer')
    ], InfiniteRowModel.prototype, "rowRenderer", void 0);
    __decorate([
        core.Autowired('rowNodeBlockLoader')
    ], InfiniteRowModel.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        core.PostConstruct
    ], InfiniteRowModel.prototype, "init", null);
    __decorate([
        core.PreDestroy
    ], InfiniteRowModel.prototype, "destroyDatasource", null);
    InfiniteRowModel = __decorate([
        core.Bean('rowModel')
    ], InfiniteRowModel);
    return InfiniteRowModel;
}(core.BeanStub));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '29.2.0';

var InfiniteRowModelModule = {
    version: VERSION,
    moduleName: core.ModuleNames.InfiniteRowModelModule,
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
};

exports.InfiniteRowModelModule = InfiniteRowModelModule;
