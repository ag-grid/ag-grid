/**
          * @ag-grid-community/infinite-row-model - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.1
          * @link https://www.ag-grid.com/
          * @license MIT
          */
import { Autowired, PostConstruct, PreDestroy, RowNodeBlock, _, RowNode, Qualifier, BeanStub, NumberSequence, Events, Bean, ModuleNames } from '@ag-grid-community/core';

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class InfiniteBlock extends RowNodeBlock {
    constructor(id, parentCache, params) {
        super(id);
        this.parentCache = parentCache;
        this.params = params;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = id * params.blockSize;
        this.endRow = this.startRow + params.blockSize;
    }
    postConstruct() {
        this.createRowNodes();
    }
    getBlockStateJson() {
        return {
            id: '' + this.getId(),
            state: {
                blockNumber: this.getId(),
                startRow: this.getStartRow(),
                endRow: this.getEndRow(),
                pageStatus: this.getState()
            }
        };
    }
    setDataAndId(rowNode, data, index) {
        // if there's no id and the rowNode was rendered before, it means this
        // was a placeholder rowNode and should not be recycled. Setting
        // `alreadyRendered`  to `false` forces the rowRenderer to flush it.
        if (!rowNode.id && rowNode.alreadyRendered) {
            rowNode.alreadyRendered = false;
        }
        if (_.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
        }
    }
    loadFromDatasource() {
        const params = this.createLoadParams();
        if (_.missing(this.params.datasource.getRows)) {
            console.warn(`AG Grid: datasource is missing getRows method`);
            return;
        }
        // put in timeout, to force result to be async
        window.setTimeout(() => {
            this.params.datasource.getRows(params);
        }, 0);
    }
    processServerFail() {
        // todo - this method has better handling in SSRM
    }
    createLoadParams() {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        const params = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            sortModel: this.params.sortModel,
            filterModel: this.params.filterModel,
            context: this.gridOptionsService.context
        };
        return params;
    }
    forEachNode(callback, sequence, rowCount) {
        this.rowNodes.forEach((rowNode, index) => {
            const rowIndex = this.startRow + index;
            if (rowIndex < rowCount) {
                callback(rowNode, sequence.next());
            }
        });
    }
    getLastAccessed() {
        return this.lastAccessed;
    }
    getRow(rowIndex, dontTouchLastAccessed = false) {
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.params.lastAccessedSequence.next();
        }
        const localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }
    getStartRow() {
        return this.startRow;
    }
    getEndRow() {
        return this.endRow;
    }
    // creates empty row nodes, data is missing as not loaded yet
    createRowNodes() {
        this.rowNodes = [];
        for (let i = 0; i < this.params.blockSize; i++) {
            const rowIndex = this.startRow + i;
            const rowNode = new RowNode(this.beans);
            rowNode.setRowHeight(this.params.rowHeight);
            rowNode.uiLevel = 0;
            rowNode.setRowIndex(rowIndex);
            rowNode.setRowTop(this.params.rowHeight * rowIndex);
            this.rowNodes.push(rowNode);
        }
    }
    processServerResult(params) {
        this.rowNodes.forEach((rowNode, index) => {
            const data = params.rowData ? params.rowData[index] : undefined;
            this.setDataAndId(rowNode, data, this.startRow + index);
        });
        const finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;
        this.parentCache.pageLoaded(this, finalRowCount);
    }
    destroyRowNodes() {
        this.rowNodes.forEach(rowNode => {
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown.
            rowNode.clearRowTopAndRowIndex();
        });
    }
}
__decorate$2([
    Autowired('beans')
], InfiniteBlock.prototype, "beans", void 0);
__decorate$2([
    PostConstruct
], InfiniteBlock.prototype, "postConstruct", null);
__decorate$2([
    PreDestroy
], InfiniteBlock.prototype, "destroyRowNodes", null);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
class InfiniteCache extends BeanStub {
    constructor(params) {
        super();
        this.lastRowIndexKnown = false;
        this.blocks = {};
        this.blockCount = 0;
        this.rowCount = params.initialRowCount;
        this.params = params;
    }
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('InfiniteCache');
    }
    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in the cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    getRow(rowIndex, dontCreatePage = false) {
        const blockId = Math.floor(rowIndex / this.params.blockSize);
        let block = this.blocks[blockId];
        if (!block) {
            if (dontCreatePage) {
                return undefined;
            }
            block = this.createBlock(blockId);
        }
        return block.getRow(rowIndex);
    }
    createBlock(blockNumber) {
        const newBlock = this.createBean(new InfiniteBlock(blockNumber, this, this.params));
        this.blocks[newBlock.getId()] = newBlock;
        this.blockCount++;
        this.purgeBlocksIfNeeded(newBlock);
        this.params.rowNodeBlockLoader.addBlock(newBlock);
        return newBlock;
    }
    // we have this on infinite row model only, not server side row model,
    // because for server side, it would leave the children in inconsistent
    // state - eg if a node had children, but after the refresh it had data
    // for a different row, then the children would be with the wrong row node.
    refreshCache() {
        const nothingToRefresh = this.blockCount == 0;
        if (nothingToRefresh) {
            this.purgeCache();
            return;
        }
        this.getBlocksInOrder().forEach(block => block.setStateWaitingToLoad());
        this.params.rowNodeBlockLoader.checkBlockToLoad();
    }
    destroyAllBlocks() {
        this.getBlocksInOrder().forEach(block => this.destroyBlock(block));
    }
    getRowCount() {
        return this.rowCount;
    }
    isLastRowIndexKnown() {
        return this.lastRowIndexKnown;
    }
    // block calls this, when page loaded
    pageLoaded(block, lastRow) {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) {
            return;
        }
        this.logger.log(`onPageLoaded: page = ${block.getId()}, lastRow = ${lastRow}`);
        this.checkRowCount(block, lastRow);
        // we fire cacheUpdated even if the row count has not changed, as some items need updating even
        // if no new rows to render. for example the pagination panel has '?' as the total rows when loading
        // is underway, which would need to get updated when loading finishes.
        this.onCacheUpdated();
    }
    purgeBlocksIfNeeded(blockToExclude) {
        // we exclude checking for the page just created, as this has yet to be accessed and hence
        // the lastAccessed stamp will not be updated for the first time yet
        const blocksForPurging = this.getBlocksInOrder().filter(b => b != blockToExclude);
        const lastAccessedComparator = (a, b) => b.getLastAccessed() - a.getLastAccessed();
        blocksForPurging.sort(lastAccessedComparator);
        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        const maxBlocksProvided = this.params.maxBlocksInCache > 0;
        const blocksToKeep = maxBlocksProvided ? this.params.maxBlocksInCache - 1 : null;
        const emptyBlocksToKeep = InfiniteCache.MAX_EMPTY_BLOCKS_TO_KEEP - 1;
        blocksForPurging.forEach((block, index) => {
            const purgeBecauseBlockEmpty = block.getState() === InfiniteBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;
            const purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;
            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {
                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (this.isBlockCurrentlyDisplayed(block)) {
                    return;
                }
                // don't want to loose keyboard focus, so keyboard navigation can continue. so keep focused blocks.
                if (this.isBlockFocused(block)) {
                    return;
                }
                // at this point, block is not needed, so burn baby burn
                this.removeBlockFromCache(block);
            }
        });
    }
    isBlockFocused(block) {
        const focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        const blockIndexStart = block.getStartRow();
        const blockIndexEnd = block.getEndRow();
        const hasFocus = focusedCell.rowIndex >= blockIndexStart && focusedCell.rowIndex < blockIndexEnd;
        return hasFocus;
    }
    isBlockCurrentlyDisplayed(block) {
        const startIndex = block.getStartRow();
        const endIndex = block.getEndRow() - 1;
        return this.rowRenderer.isRangeInRenderedViewport(startIndex, endIndex);
    }
    removeBlockFromCache(blockToRemove) {
        if (!blockToRemove) {
            return;
        }
        this.destroyBlock(blockToRemove);
        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    }
    checkRowCount(block, lastRow) {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.rowCount = lastRow;
            this.lastRowIndexKnown = true;
        }
        else if (!this.lastRowIndexKnown) {
            // otherwise, see if we need to add some virtual rows
            const lastRowIndex = (block.getId() + 1) * this.params.blockSize;
            const lastRowIndexPlusOverflow = lastRowIndex + this.params.overflowSize;
            if (this.rowCount < lastRowIndexPlusOverflow) {
                this.rowCount = lastRowIndexPlusOverflow;
            }
        }
    }
    setRowCount(rowCount, lastRowIndexKnown) {
        this.rowCount = rowCount;
        // if undefined is passed, we do not set this value, if one of {true,false}
        // is passed, we do set the value.
        if (_.exists(lastRowIndexKnown)) {
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
    }
    forEachNodeDeep(callback) {
        const sequence = new NumberSequence();
        this.getBlocksInOrder().forEach(block => block.forEachNode(callback, sequence, this.rowCount));
    }
    getBlocksInOrder() {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        const blockComparator = (a, b) => a.getId() - b.getId();
        const blocks = _.getAllValuesInObject(this.blocks).sort(blockComparator);
        return blocks;
    }
    destroyBlock(block) {
        delete this.blocks[block.getId()];
        this.destroyBean(block);
        this.blockCount--;
        this.params.rowNodeBlockLoader.removeBlock(block);
    }
    // gets called 1) row count changed 2) cache purged 3) items inserted
    onCacheUpdated() {
        if (this.isAlive()) {
            // if the virtualRowCount is shortened, then it's possible blocks exist that are no longer
            // in the valid range. so we must remove these. this can happen if user explicitly sets
            // the virtual row count, or the datasource returns a result and sets lastRow to something
            // less than virtualRowCount (can happen if user scrolls down, server reduces dataset size).
            this.destroyAllBlocksPastVirtualRowCount();
            // this results in both row models (infinite and server side) firing ModelUpdated,
            // however server side row model also updates the row indexes first
            const event = {
                type: Events.EVENT_STORE_UPDATED
            };
            this.eventService.dispatchEvent(event);
        }
    }
    destroyAllBlocksPastVirtualRowCount() {
        const blocksToDestroy = [];
        this.getBlocksInOrder().forEach(block => {
            const startRow = block.getId() * this.params.blockSize;
            if (startRow >= this.rowCount) {
                blocksToDestroy.push(block);
            }
        });
        if (blocksToDestroy.length > 0) {
            blocksToDestroy.forEach(block => this.destroyBlock(block));
        }
    }
    purgeCache() {
        this.getBlocksInOrder().forEach(block => this.removeBlockFromCache(block));
        this.lastRowIndexKnown = false;
        // if zero rows in the cache, we need to get the SSRM to start asking for rows again.
        // otherwise if set to zero rows last time, and we don't update the row count, then after
        // the purge there will still be zero rows, meaning the SSRM won't request any rows.
        // to kick things off, at least one row needs to be asked for.
        if (this.rowCount === 0) {
            this.rowCount = this.params.initialRowCount;
        }
        this.onCacheUpdated();
    }
    getRowNodesInRange(firstInRange, lastInRange) {
        const result = [];
        let lastBlockId = -1;
        let inActiveRange = false;
        const numberSequence = new NumberSequence();
        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }
        let foundGapInSelection = false;
        this.getBlocksInOrder().forEach(block => {
            if (foundGapInSelection) {
                return;
            }
            if (inActiveRange && (lastBlockId + 1 !== block.getId())) {
                foundGapInSelection = true;
                return;
            }
            lastBlockId = block.getId();
            block.forEachNode(rowNode => {
                const hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }
                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }
            }, numberSequence, this.rowCount);
        });
        // inActiveRange will be still true if we never hit the second rowNode
        const invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    }
}
// this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
// blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
// scrolled over are not needed to be loaded.
InfiniteCache.MAX_EMPTY_BLOCKS_TO_KEEP = 2;
__decorate$1([
    Autowired('rowRenderer')
], InfiniteCache.prototype, "rowRenderer", void 0);
__decorate$1([
    Autowired("focusService")
], InfiniteCache.prototype, "focusService", void 0);
__decorate$1([
    __param(0, Qualifier('loggerFactory'))
], InfiniteCache.prototype, "setBeans", null);
__decorate$1([
    PreDestroy
], InfiniteCache.prototype, "destroyAllBlocks", null);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let InfiniteRowModel = class InfiniteRowModel extends BeanStub {
    getRowBounds(index) {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    }
    // we don't implement as lazy row heights is not supported in this row model
    ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
        return false;
    }
    init() {
        if (!this.gridOptionsService.isRowModelType('infinite')) {
            return;
        }
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.addEventListeners();
        this.addDestroyFunc(() => this.destroyCache());
        this.verifyProps();
    }
    verifyProps() {
        if (this.gridOptionsService.exists('initialGroupOrderComparator')) {
            const message = `AG Grid: initialGroupOrderComparator cannot be used with Infinite Row Model. If using Infinite Row Model, then sorting is done on the server side, nothing to do with the client.`;
            _.doOnce(() => console.warn(message), 'IRM.InitialGroupOrderComparator');
        }
    }
    start() {
        this.setDatasource(this.gridOptionsService.get('datasource'));
    }
    destroyDatasource() {
        if (this.datasource) {
            this.getContext().destroyBean(this.datasource);
            this.rowRenderer.datasourceChanged();
            this.datasource = null;
        }
    }
    addEventListeners() {
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onCacheUpdated.bind(this));
    }
    onFilterChanged() {
        this.reset();
    }
    onSortChanged() {
        this.reset();
    }
    onColumnEverything() {
        let resetRequired;
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
    }
    isSortModelDifferent() {
        return !_.jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
    }
    getType() {
        return 'infinite';
    }
    setDatasource(datasource) {
        this.destroyDatasource();
        this.datasource = datasource;
        // only reset if we have a valid datasource to working with
        if (datasource) {
            this.reset();
        }
    }
    isEmpty() {
        return !this.infiniteCache;
    }
    isRowsToRender() {
        return !!this.infiniteCache;
    }
    getNodesInRangeForSelection(firstInRange, lastInRange) {
        return this.infiniteCache ? this.infiniteCache.getRowNodesInRange(firstInRange, lastInRange) : [];
    }
    reset() {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (!this.datasource) {
            return;
        }
        // if user is providing id's, then this means we can keep the selection between datasource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done.
        const getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        const userGeneratingIds = getRowIdFunc != null;
        if (!userGeneratingIds) {
            this.selectionService.reset();
        }
        this.resetCache();
        const event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    }
    createModelUpdatedEvent() {
        return {
            type: Events.EVENT_MODEL_UPDATED,
            // not sure if these should all be false - noticed if after implementing,
            // maybe they should be true?
            newPage: false,
            newData: false,
            keepRenderedRows: true,
            animate: false
        };
    }
    resetCache() {
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
            lastAccessedSequence: new NumberSequence()
        };
        this.infiniteCache = this.createBean(new InfiniteCache(this.cacheParams));
    }
    defaultIfInvalid(value, defaultValue) {
        return value > 0 ? value : defaultValue;
    }
    destroyCache() {
        if (this.infiniteCache) {
            this.infiniteCache = this.destroyBean(this.infiniteCache);
        }
    }
    onCacheUpdated() {
        const event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    }
    getRow(rowIndex) {
        if (!this.infiniteCache) {
            return undefined;
        }
        if (rowIndex >= this.infiniteCache.getRowCount()) {
            return undefined;
        }
        return this.infiniteCache.getRow(rowIndex);
    }
    getRowNode(id) {
        let result;
        this.forEachNode(rowNode => {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    }
    forEachNode(callback) {
        if (this.infiniteCache) {
            this.infiniteCache.forEachNodeDeep(callback);
        }
    }
    getTopLevelRowCount() {
        return this.getRowCount();
    }
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        return topLevelIndex;
    }
    getRowIndexAtPixel(pixel) {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            const rowIndexForPixel = Math.floor(pixel / this.rowHeight);
            const lastRowIndex = this.getRowCount() - 1;
            if (rowIndexForPixel > lastRowIndex) {
                return lastRowIndex;
            }
            return rowIndexForPixel;
        }
        return 0;
    }
    getRowCount() {
        return this.infiniteCache ? this.infiniteCache.getRowCount() : 0;
    }
    isRowPresent(rowNode) {
        const foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    }
    refreshCache() {
        if (this.infiniteCache) {
            this.infiniteCache.refreshCache();
        }
    }
    purgeCache() {
        if (this.infiniteCache) {
            this.infiniteCache.purgeCache();
        }
    }
    // for iRowModel
    isLastRowIndexKnown() {
        if (this.infiniteCache) {
            return this.infiniteCache.isLastRowIndexKnown();
        }
        return false;
    }
    setRowCount(rowCount, lastRowIndexKnown) {
        if (this.infiniteCache) {
            this.infiniteCache.setRowCount(rowCount, lastRowIndexKnown);
        }
    }
};
__decorate([
    Autowired('filterManager')
], InfiniteRowModel.prototype, "filterManager", void 0);
__decorate([
    Autowired('sortController')
], InfiniteRowModel.prototype, "sortController", void 0);
__decorate([
    Autowired('selectionService')
], InfiniteRowModel.prototype, "selectionService", void 0);
__decorate([
    Autowired('rowRenderer')
], InfiniteRowModel.prototype, "rowRenderer", void 0);
__decorate([
    Autowired('rowNodeBlockLoader')
], InfiniteRowModel.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    PostConstruct
], InfiniteRowModel.prototype, "init", null);
__decorate([
    PreDestroy
], InfiniteRowModel.prototype, "destroyDatasource", null);
InfiniteRowModel = __decorate([
    Bean('rowModel')
], InfiniteRowModel);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.1';

const InfiniteRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
};

export { InfiniteRowModelModule };
