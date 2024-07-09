// community-modules/infinite-row-model/src/infiniteRowModelModule.ts
import {
  ModuleNames,
  RowModelHelperService,
  _RowNodeBlockModule,
  _SsrmInfiniteSharedApiModule
} from "@ag-grid-community/core";

// community-modules/infinite-row-model/src/infiniteRowModel/infiniteRowModel.ts
import { BeanStub as BeanStub2, NumberSequence as NumberSequence2, _jsonEquals, _warnOnce as _warnOnce2 } from "@ag-grid-community/core";

// community-modules/infinite-row-model/src/infiniteRowModel/infiniteCache.ts
import { BeanStub, NumberSequence, _exists as _exists2, _getAllValuesInObject, _log } from "@ag-grid-community/core";

// community-modules/infinite-row-model/src/infiniteRowModel/infiniteBlock.ts
import { RowNode, RowNodeBlock, _exists, _missing, _warnOnce } from "@ag-grid-community/core";
var InfiniteBlock = class extends RowNodeBlock {
  wireBeans(beans) {
    this.beans = beans;
  }
  constructor(id, parentCache, params) {
    super(id);
    this.parentCache = parentCache;
    this.params = params;
    this.startRow = id * params.blockSize;
    this.endRow = this.startRow + params.blockSize;
  }
  postConstruct() {
    this.createRowNodes();
  }
  getBlockStateJson() {
    return {
      id: "" + this.getId(),
      state: {
        blockNumber: this.getId(),
        startRow: this.getStartRow(),
        endRow: this.getEndRow(),
        pageStatus: this.getState()
      }
    };
  }
  setDataAndId(rowNode, data, index) {
    if (_exists(data)) {
      rowNode.setDataAndId(data, index.toString());
    } else {
      rowNode.setDataAndId(void 0, void 0);
    }
  }
  loadFromDatasource() {
    const params = this.createLoadParams();
    if (_missing(this.params.datasource.getRows)) {
      _warnOnce(`datasource is missing getRows method`);
      return;
    }
    window.setTimeout(() => {
      this.params.datasource.getRows(params);
    }, 0);
  }
  processServerFail() {
  }
  createLoadParams() {
    const params = {
      startRow: this.getStartRow(),
      endRow: this.getEndRow(),
      successCallback: this.pageLoaded.bind(this, this.getVersion()),
      failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
      sortModel: this.params.sortModel,
      filterModel: this.params.filterModel,
      context: this.gos.getGridCommonParams().context
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
      const data = params.rowData ? params.rowData[index] : void 0;
      if (!rowNode.id && rowNode.alreadyRendered && data) {
        this.rowNodes[index] = new RowNode(this.beans);
        this.rowNodes[index].setRowIndex(rowNode.rowIndex);
        this.rowNodes[index].setRowTop(rowNode.rowTop);
        this.rowNodes[index].setRowHeight(rowNode.rowHeight);
        rowNode.clearRowTopAndRowIndex();
      }
      this.setDataAndId(this.rowNodes[index], data, this.startRow + index);
    });
    const finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : void 0;
    this.parentCache.pageLoaded(this, finalRowCount);
  }
  destroy() {
    this.rowNodes.forEach((rowNode) => {
      rowNode.clearRowTopAndRowIndex();
    });
    super.destroy();
  }
};

// community-modules/infinite-row-model/src/infiniteRowModel/infiniteCache.ts
var MAX_EMPTY_BLOCKS_TO_KEEP = 2;
var InfiniteCache = class extends BeanStub {
  constructor(params) {
    super();
    this.lastRowIndexKnown = false;
    this.blocks = {};
    this.blockCount = 0;
    this.rowCount = params.initialRowCount;
    this.params = params;
  }
  wireBeans(beans) {
    this.rowRenderer = beans.rowRenderer;
    this.focusService = beans.focusService;
  }
  // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
  // it will want new pages in the cache as it asks for rows. only when we are inserting /
  // removing rows via the api is dontCreatePage set, where we move rows between the pages.
  getRow(rowIndex, dontCreatePage = false) {
    const blockId = Math.floor(rowIndex / this.params.blockSize);
    let block = this.blocks[blockId];
    if (!block) {
      if (dontCreatePage) {
        return void 0;
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
    this.getBlocksInOrder().forEach((block) => block.setStateWaitingToLoad());
    this.params.rowNodeBlockLoader.checkBlockToLoad();
  }
  destroy() {
    this.getBlocksInOrder().forEach((block) => this.destroyBlock(block));
    super.destroy();
  }
  getRowCount() {
    return this.rowCount;
  }
  isLastRowIndexKnown() {
    return this.lastRowIndexKnown;
  }
  // block calls this, when page loaded
  pageLoaded(block, lastRow) {
    if (!this.isAlive()) {
      return;
    }
    if (this.gos.get("debug")) {
      _log(`InfiniteCache - onPageLoaded: page = ${block.getId()}, lastRow = ${lastRow}`);
    }
    this.checkRowCount(block, lastRow);
    this.onCacheUpdated();
  }
  purgeBlocksIfNeeded(blockToExclude) {
    const blocksForPurging = this.getBlocksInOrder().filter((b) => b != blockToExclude);
    const lastAccessedComparator = (a, b) => b.getLastAccessed() - a.getLastAccessed();
    blocksForPurging.sort(lastAccessedComparator);
    const maxBlocksProvided = this.params.maxBlocksInCache > 0;
    const blocksToKeep = maxBlocksProvided ? this.params.maxBlocksInCache - 1 : null;
    const emptyBlocksToKeep = MAX_EMPTY_BLOCKS_TO_KEEP - 1;
    blocksForPurging.forEach((block, index) => {
      const purgeBecauseBlockEmpty = block.getState() === "needsLoading" && index >= emptyBlocksToKeep;
      const purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;
      if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {
        if (this.isBlockCurrentlyDisplayed(block)) {
          return;
        }
        if (this.isBlockFocused(block)) {
          return;
        }
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
  }
  checkRowCount(block, lastRow) {
    if (typeof lastRow === "number" && lastRow >= 0) {
      this.rowCount = lastRow;
      this.lastRowIndexKnown = true;
    } else if (!this.lastRowIndexKnown) {
      const lastRowIndex = (block.getId() + 1) * this.params.blockSize;
      const lastRowIndexPlusOverflow = lastRowIndex + this.params.overflowSize;
      if (this.rowCount < lastRowIndexPlusOverflow) {
        this.rowCount = lastRowIndexPlusOverflow;
      }
    }
  }
  setRowCount(rowCount, lastRowIndexKnown) {
    this.rowCount = rowCount;
    if (_exists2(lastRowIndexKnown)) {
      this.lastRowIndexKnown = lastRowIndexKnown;
    }
    if (!this.lastRowIndexKnown) {
      if (this.rowCount % this.params.blockSize === 0) {
        this.rowCount++;
      }
    }
    this.onCacheUpdated();
  }
  forEachNodeDeep(callback) {
    const sequence = new NumberSequence();
    this.getBlocksInOrder().forEach((block) => block.forEachNode(callback, sequence, this.rowCount));
  }
  getBlocksInOrder() {
    const blockComparator = (a, b) => a.getId() - b.getId();
    const blocks = _getAllValuesInObject(this.blocks).sort(blockComparator);
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
      this.destroyAllBlocksPastVirtualRowCount();
      const event = {
        type: "storeUpdated"
      };
      this.eventService.dispatchEvent(event);
    }
  }
  destroyAllBlocksPastVirtualRowCount() {
    const blocksToDestroy = [];
    this.getBlocksInOrder().forEach((block) => {
      const startRow = block.getId() * this.params.blockSize;
      if (startRow >= this.rowCount) {
        blocksToDestroy.push(block);
      }
    });
    if (blocksToDestroy.length > 0) {
      blocksToDestroy.forEach((block) => this.destroyBlock(block));
    }
  }
  purgeCache() {
    this.getBlocksInOrder().forEach((block) => this.removeBlockFromCache(block));
    this.lastRowIndexKnown = false;
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
    let foundGapInSelection = false;
    this.getBlocksInOrder().forEach((block) => {
      if (foundGapInSelection) {
        return;
      }
      if (inActiveRange && lastBlockId + 1 !== block.getId()) {
        foundGapInSelection = true;
        return;
      }
      lastBlockId = block.getId();
      block.forEachNode(
        (rowNode) => {
          const hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
          if (inActiveRange || hitFirstOrLast) {
            result.push(rowNode);
          }
          if (hitFirstOrLast) {
            inActiveRange = !inActiveRange;
          }
        },
        numberSequence,
        this.rowCount
      );
    });
    const invalidRange = foundGapInSelection || inActiveRange;
    return invalidRange ? [] : result;
  }
};

// community-modules/infinite-row-model/src/infiniteRowModel/infiniteRowModel.ts
var InfiniteRowModel = class extends BeanStub2 {
  constructor() {
    super(...arguments);
    this.beanName = "rowModel";
  }
  wireBeans(beans) {
    this.filterManager = beans.filterManager;
    this.sortController = beans.sortController;
    this.selectionService = beans.selectionService;
    this.rowRenderer = beans.rowRenderer;
    this.rowNodeBlockLoader = beans.rowNodeBlockLoader;
  }
  getRowBounds(index) {
    return {
      rowHeight: this.rowHeight,
      rowTop: this.rowHeight * index
    };
  }
  // we don't implement as lazy row heights is not supported in this row model
  ensureRowHeightsValid() {
    return false;
  }
  postConstruct() {
    if (!this.gos.isRowModelType("infinite")) {
      return;
    }
    this.rowHeight = this.gos.getRowHeightAsNumber();
    this.addEventListeners();
    this.addDestroyFunc(() => this.destroyCache());
    this.verifyProps();
  }
  verifyProps() {
    if (this.gos.exists("initialGroupOrderComparator")) {
      _warnOnce2(
        "initialGroupOrderComparator cannot be used with Infinite Row Model as sorting is done on the server side"
      );
    }
  }
  start() {
    this.setDatasource(this.gos.get("datasource"));
  }
  destroy() {
    this.destroyDatasource();
    super.destroy();
  }
  destroyDatasource() {
    if (this.datasource) {
      this.destroyBean(this.datasource);
      this.rowRenderer.datasourceChanged();
      this.datasource = null;
    }
  }
  addEventListeners() {
    this.addManagedEventListeners({
      filterChanged: this.onFilterChanged.bind(this),
      sortChanged: this.onSortChanged.bind(this),
      newColumnsLoaded: this.onColumnEverything.bind(this),
      storeUpdated: this.onCacheUpdated.bind(this)
    });
    this.addManagedPropertyListener("datasource", () => this.setDatasource(this.gos.get("datasource")));
    this.addManagedPropertyListener("cacheBlockSize", () => this.resetCache());
    this.addManagedPropertyListener("rowHeight", () => {
      this.rowHeight = this.gos.getRowHeightAsNumber();
      this.cacheParams.rowHeight = this.rowHeight;
      this.updateRowHeights();
    });
  }
  onFilterChanged() {
    this.reset();
  }
  onSortChanged() {
    this.reset();
  }
  onColumnEverything() {
    let resetRequired;
    if (this.cacheParams) {
      resetRequired = this.isSortModelDifferent();
    } else {
      resetRequired = true;
    }
    if (resetRequired) {
      this.reset();
    }
  }
  isSortModelDifferent() {
    return !_jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
  }
  getType() {
    return "infinite";
  }
  setDatasource(datasource) {
    this.destroyDatasource();
    this.datasource = datasource;
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
    if (!this.datasource) {
      return;
    }
    const getRowIdFunc = this.gos.getRowIdCallback();
    const userGeneratingIds = getRowIdFunc != null;
    if (!userGeneratingIds) {
      this.selectionService.reset("rowDataChanged");
    }
    this.resetCache();
  }
  createModelUpdatedEvent() {
    return {
      type: "modelUpdated",
      // not sure if these should all be false - noticed if after implementing,
      // maybe they should be true?
      newPage: false,
      newPageSize: false,
      newData: false,
      keepRenderedRows: true,
      animate: false
    };
  }
  resetCache() {
    this.destroyCache();
    this.cacheParams = {
      // the user provided datasource
      datasource: this.datasource,
      // sort and filter model
      filterModel: this.filterManager?.getFilterModel() ?? {},
      sortModel: this.sortController.getSortModel(),
      rowNodeBlockLoader: this.rowNodeBlockLoader,
      // properties - this way we take a snapshot of them, so if user changes any, they will be
      // used next time we create a new cache, which is generally after a filter or sort change,
      // or a new datasource is set
      initialRowCount: this.gos.get("infiniteInitialRowCount"),
      maxBlocksInCache: this.gos.get("maxBlocksInCache"),
      rowHeight: this.gos.getRowHeightAsNumber(),
      // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
      // the current page and request first row of next page
      overflowSize: this.gos.get("cacheOverflowSize"),
      // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
      // server for one page at a time. so the default if not specified is 100.
      blockSize: this.gos.get("cacheBlockSize"),
      // the cache could create this, however it is also used by the pages, so handy to create it
      // here as the settings are also passed to the pages
      lastAccessedSequence: new NumberSequence2()
    };
    this.infiniteCache = this.createBean(new InfiniteCache(this.cacheParams));
    this.eventService.dispatchEventOnce({
      type: "rowCountReady"
    });
    const event = this.createModelUpdatedEvent();
    this.eventService.dispatchEvent(event);
  }
  updateRowHeights() {
    this.forEachNode((node) => {
      node.setRowHeight(this.rowHeight);
      node.setRowTop(this.rowHeight * node.rowIndex);
    });
    const event = this.createModelUpdatedEvent();
    this.eventService.dispatchEvent(event);
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
      return void 0;
    }
    if (rowIndex >= this.infiniteCache.getRowCount()) {
      return void 0;
    }
    return this.infiniteCache.getRow(rowIndex);
  }
  getRowNode(id) {
    let result;
    this.forEachNode((rowNode) => {
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
    if (this.rowHeight !== 0) {
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

// community-modules/infinite-row-model/src/infiniteRowModel/infiniteRowModelApi.ts
function refreshInfiniteCache(beans) {
  beans.rowModelHelperService?.getInfiniteRowModel()?.refreshCache();
}
function purgeInfiniteCache(beans) {
  beans.rowModelHelperService?.getInfiniteRowModel()?.purgeCache();
}
function getInfiniteRowCount(beans) {
  return beans.rowModelHelperService?.getInfiniteRowModel()?.getRowCount();
}
function isLastRowIndexKnown(beans) {
  return beans.rowModelHelperService?.getInfiniteRowModel()?.isLastRowIndexKnown();
}

// community-modules/infinite-row-model/src/version.ts
var VERSION = "32.0.1";

// community-modules/infinite-row-model/src/infiniteRowModelModule.ts
var InfiniteRowModelCoreModule = {
  version: VERSION,
  moduleName: `${ModuleNames.InfiniteRowModelModule}-core`,
  rowModel: "infinite",
  beans: [InfiniteRowModel],
  dependantModules: [_RowNodeBlockModule]
};
var InfiniteRowModelApiModule = {
  version: VERSION,
  moduleName: `${ModuleNames.InfiniteRowModelModule}-api`,
  beans: [RowModelHelperService],
  apiFunctions: {
    refreshInfiniteCache,
    purgeInfiniteCache,
    getInfiniteRowCount,
    isLastRowIndexKnown
  },
  dependantModules: [InfiniteRowModelCoreModule, _SsrmInfiniteSharedApiModule]
};
var InfiniteRowModelModule = {
  version: VERSION,
  moduleName: ModuleNames.InfiniteRowModelModule,
  dependantModules: [InfiniteRowModelCoreModule, InfiniteRowModelApiModule]
};
export {
  InfiniteRowModelModule
};
