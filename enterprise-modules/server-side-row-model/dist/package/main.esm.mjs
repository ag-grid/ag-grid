var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/server-side-row-model/src/serverSideRowModelModule.ts
import { ModuleNames as ModuleNames2 } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/server-side-row-model/src/serverSideRowModel/serverSideRowModel.ts
import {
  _ as _3,
  Autowired as Autowired5,
  Bean as Bean2,
  BeanStub as BeanStub4,
  Events as Events3,
  NumberSequence as NumberSequence4,
  PostConstruct as PostConstruct5,
  PreDestroy as PreDestroy4,
  RowNode as RowNode5,
  Optional,
  ModuleRegistry,
  ModuleNames
} from "@ag-grid-community/core";

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/fullStore.ts
import {
  _,
  Autowired,
  Events,
  NumberSequence,
  PostConstruct,
  PreDestroy,
  RowNodeBlock,
  ServerSideTransactionResultStatus
} from "@ag-grid-community/core";
var FullStore = class extends RowNodeBlock {
  constructor(ssrmParams, storeParams, parentRowNode) {
    super(0);
    this.nodeIdSequence = new NumberSequence();
    this.info = {};
    this.ssrmParams = ssrmParams;
    this.parentRowNode = parentRowNode;
    this.level = parentRowNode.level + 1;
    this.groupLevel = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : void 0;
    this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
  }
  postConstruct() {
    this.usingTreeData = this.gos.get("treeData");
    this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
    if (!this.usingTreeData && this.groupLevel) {
      const groupColVo = this.ssrmParams.rowGroupCols[this.level];
      this.groupField = groupColVo.field;
      this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
    }
    let initialRowCount = 1;
    const isRootStore = this.parentRowNode.level === -1;
    const userInitialRowCount = this.storeUtils.getServerSideInitialRowCount();
    if (isRootStore && userInitialRowCount != null) {
      initialRowCount = userInitialRowCount;
    }
    this.initialiseRowNodes(initialRowCount);
    this.rowNodeBlockLoader.addBlock(this);
    this.addDestroyFunc(() => this.rowNodeBlockLoader.removeBlock(this));
    this.postSortFunc = this.gos.getCallback("postSortRows");
    if (userInitialRowCount != null) {
      this.eventService.dispatchEventOnce({
        type: Events.EVENT_ROW_COUNT_READY
      });
    }
  }
  destroyRowNodes() {
    this.blockUtils.destroyRowNodes(this.allRowNodes);
    this.allRowNodes = [];
    this.nodesAfterSort = [];
    this.nodesAfterFilter = [];
    this.allNodesMap = {};
  }
  initialiseRowNodes(loadingRowsCount, failedLoad = false) {
    this.destroyRowNodes();
    for (let i = 0; i < loadingRowsCount; i++) {
      const loadingRowNode = this.blockUtils.createRowNode(
        {
          field: this.groupField,
          group: this.groupLevel,
          leafGroup: this.leafGroup,
          level: this.level,
          parent: this.parentRowNode,
          rowGroupColumn: this.rowGroupColumn
        }
      );
      if (failedLoad) {
        loadingRowNode.failedLoad = true;
      }
      this.allRowNodes.push(loadingRowNode);
      this.nodesAfterFilter.push(loadingRowNode);
      this.nodesAfterSort.push(loadingRowNode);
    }
  }
  getBlockStateJson() {
    return {
      id: this.nodeIdPrefix ? this.nodeIdPrefix : "",
      state: this.getState()
    };
  }
  loadFromDatasource() {
    this.storeUtils.loadFromDatasource({
      startRow: void 0,
      endRow: void 0,
      parentBlock: this,
      parentNode: this.parentRowNode,
      storeParams: this.ssrmParams,
      success: this.success.bind(this, this.getVersion()),
      fail: this.pageLoadFailed.bind(this, this.getVersion())
    });
  }
  getStartRow() {
    return 0;
  }
  getEndRow() {
    return this.nodesAfterSort.length;
  }
  createDataNode(data, index) {
    const rowNode = this.blockUtils.createRowNode(
      {
        field: this.groupField,
        group: this.groupLevel,
        leafGroup: this.leafGroup,
        level: this.level,
        parent: this.parentRowNode,
        rowGroupColumn: this.rowGroupColumn
      }
    );
    if (index != null) {
      _.insertIntoArray(this.allRowNodes, rowNode, index);
    } else {
      this.allRowNodes.push(rowNode);
    }
    const defaultId = this.prefixId(this.nodeIdSequence.next());
    this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, void 0);
    this.nodeManager.addRowNode(rowNode);
    this.blockUtils.checkOpenByDefault(rowNode);
    this.allNodesMap[rowNode.id] = rowNode;
    return rowNode;
  }
  prefixId(id) {
    if (this.nodeIdPrefix) {
      return this.nodeIdPrefix + "-" + id;
    } else {
      return id.toString();
    }
  }
  processServerFail() {
    this.initialiseRowNodes(1, true);
    this.fireStoreUpdatedEvent();
    this.flushAsyncTransactions();
  }
  processServerResult(params) {
    if (!this.isAlive()) {
      return;
    }
    const info = params.groupLevelInfo;
    if (info) {
      Object.assign(this.info, info);
    }
    if (params.pivotResultFields) {
      this.serverSideRowModel.generateSecondaryColumns(params.pivotResultFields);
    }
    const nodesToRecycle = this.allRowNodes.length > 0 ? this.allNodesMap : void 0;
    this.allRowNodes = [];
    this.nodesAfterSort = [];
    this.nodesAfterFilter = [];
    this.allNodesMap = {};
    if (!params.rowData) {
      _.warnOnce('"params.data" is missing from Server-Side Row Model success() callback. Please use the "data" attribute. If no data is returned, set an empty list.');
    }
    this.createOrRecycleNodes(nodesToRecycle, params.rowData);
    if (nodesToRecycle) {
      this.blockUtils.destroyRowNodes(_.getAllValuesInObject(nodesToRecycle));
    }
    if (this.level === 0) {
      this.eventService.dispatchEventOnce({
        type: Events.EVENT_ROW_COUNT_READY
      });
    }
    this.filterAndSortNodes();
    this.fireStoreUpdatedEvent();
    this.flushAsyncTransactions();
  }
  createOrRecycleNodes(nodesToRecycle, rowData) {
    if (!rowData) {
      return;
    }
    const lookupNodeToRecycle = (data) => {
      if (!nodesToRecycle) {
        return void 0;
      }
      const getRowIdFunc = this.gos.getCallback("getRowId");
      if (!getRowIdFunc) {
        return void 0;
      }
      const parentKeys = this.parentRowNode.getGroupKeys();
      const level = this.level;
      const id = getRowIdFunc({
        data,
        parentKeys: parentKeys.length > 0 ? parentKeys : void 0,
        level
      });
      const foundNode = nodesToRecycle[id];
      if (!foundNode) {
        return void 0;
      }
      delete nodesToRecycle[id];
      return foundNode;
    };
    const recycleNode = (rowNode, dataItem) => {
      this.allNodesMap[rowNode.id] = rowNode;
      this.blockUtils.updateDataIntoRowNode(rowNode, dataItem);
      this.allRowNodes.push(rowNode);
    };
    rowData.forEach((dataItem) => {
      const nodeToRecycle = lookupNodeToRecycle(dataItem);
      if (nodeToRecycle) {
        recycleNode(nodeToRecycle, dataItem);
      } else {
        this.createDataNode(dataItem);
      }
    });
  }
  flushAsyncTransactions() {
    window.setTimeout(() => this.transactionManager.flushAsyncTransactions(), 0);
  }
  filterAndSortNodes() {
    this.filterRowNodes();
    this.sortRowNodes();
  }
  sortRowNodes() {
    const serverIsSorting = this.storeUtils.isServerSideSortAllLevels() || this.storeUtils.isServerSideSortOnServer();
    const sortOptions = this.sortController.getSortOptions();
    const noSortApplied = !sortOptions || sortOptions.length == 0;
    if (serverIsSorting || noSortApplied) {
      this.nodesAfterSort = this.nodesAfterFilter;
      return;
    }
    this.nodesAfterSort = this.rowNodeSorter.doFullSort(this.nodesAfterFilter, sortOptions);
    if (this.postSortFunc) {
      const params = { nodes: this.nodesAfterSort };
      this.postSortFunc(params);
    }
  }
  filterRowNodes() {
    const serverIsFiltering = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups() || this.storeUtils.isServerSideFilterOnServer();
    const groupLevel = this.groupLevel;
    if (serverIsFiltering || groupLevel) {
      this.nodesAfterFilter = this.allRowNodes;
      return;
    }
    this.nodesAfterFilter = this.allRowNodes.filter(
      (rowNode) => this.filterManager.doesRowPassFilter({ rowNode })
    );
  }
  clearDisplayIndexes() {
    this.displayIndexStart = void 0;
    this.displayIndexEnd = void 0;
    this.allRowNodes.forEach((rowNode) => this.blockUtils.clearDisplayIndex(rowNode));
  }
  getDisplayIndexEnd() {
    return this.displayIndexEnd;
  }
  isDisplayIndexInStore(displayIndex) {
    if (this.getRowCount() === 0) {
      return false;
    }
    return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
  }
  setDisplayIndexes(displayIndexSeq, nextRowTop) {
    this.displayIndexStart = displayIndexSeq.peek();
    this.topPx = nextRowTop.value;
    const visibleNodeIds = {};
    this.nodesAfterSort.forEach((rowNode) => {
      this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop);
      visibleNodeIds[rowNode.id] = true;
    });
    this.allRowNodes.forEach((rowNode) => {
      if (!visibleNodeIds[rowNode.id]) {
        this.blockUtils.clearDisplayIndex(rowNode);
      }
    });
    this.displayIndexEnd = displayIndexSeq.peek();
    this.heightPx = nextRowTop.value - this.topPx;
  }
  forEachStoreDeep(callback, sequence = new NumberSequence()) {
    callback(this, sequence.next());
    this.allRowNodes.forEach((rowNode) => {
      const childCache = rowNode.childStore;
      if (childCache) {
        childCache.forEachStoreDeep(callback, sequence);
      }
    });
  }
  forEachNodeDeep(callback, sequence = new NumberSequence()) {
    this.allRowNodes.forEach((rowNode) => {
      callback(rowNode, sequence.next());
      const childCache = rowNode.childStore;
      if (childCache) {
        childCache.forEachNodeDeep(callback, sequence);
      }
    });
  }
  forEachNodeDeepAfterFilterAndSort(callback, sequence = new NumberSequence(), includeFooterNodes = false) {
    this.nodesAfterSort.forEach((rowNode) => {
      callback(rowNode, sequence.next());
      const childCache = rowNode.childStore;
      if (childCache) {
        childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence, includeFooterNodes);
      }
    });
    if (includeFooterNodes && this.parentRowNode.sibling) {
      callback(this.parentRowNode.sibling, sequence.next());
    }
  }
  getRowUsingDisplayIndex(displayRowIndex) {
    if (!this.isDisplayIndexInStore(displayRowIndex)) {
      return void 0;
    }
    const res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.nodesAfterSort);
    return res;
  }
  getRowBounds(index) {
    for (let i = 0; i < this.nodesAfterSort.length; i++) {
      const rowNode = this.nodesAfterSort[i];
      const res = this.blockUtils.extractRowBounds(rowNode, index);
      if (res) {
        return res;
      }
    }
    return null;
  }
  isPixelInRange(pixel) {
    return pixel >= this.topPx && pixel < this.topPx + this.heightPx;
  }
  getRowIndexAtPixel(pixel) {
    const pixelBeforeThisStore = pixel <= this.topPx;
    if (pixelBeforeThisStore) {
      const firstNode = this.nodesAfterSort[0];
      return firstNode.rowIndex;
    }
    const pixelAfterThisStore = pixel >= this.topPx + this.heightPx;
    if (pixelAfterThisStore) {
      const lastRowNode = this.nodesAfterSort[this.nodesAfterSort.length - 1];
      const lastRowNodeBottomPx = lastRowNode.rowTop + lastRowNode.rowHeight;
      if (pixel >= lastRowNodeBottomPx && lastRowNode.expanded) {
        if (lastRowNode.childStore && lastRowNode.childStore.getRowCount() > 0) {
          return lastRowNode.childStore.getRowIndexAtPixel(pixel);
        }
        if (lastRowNode.detailNode) {
          return lastRowNode.detailNode.rowIndex;
        }
      }
      return lastRowNode.rowIndex;
    }
    let res = null;
    this.nodesAfterSort.forEach((rowNode) => {
      const res2 = this.blockUtils.getIndexAtPixel(rowNode, pixel);
      if (res2 != null) {
        res = res2;
      }
    });
    const pixelIsPastLastRow = res == null;
    if (pixelIsPastLastRow) {
      return this.displayIndexEnd - 1;
    }
    return res;
  }
  getChildStore(keys) {
    return this.storeUtils.getChildStore(keys, this, (key) => {
      const rowNode = this.allRowNodes.find((currentRowNode) => {
        return currentRowNode.key == key;
      });
      return rowNode;
    });
  }
  forEachChildStoreShallow(callback) {
    this.allRowNodes.forEach((rowNode) => {
      const childStore = rowNode.childStore;
      if (childStore) {
        callback(childStore);
      }
    });
  }
  refreshAfterFilter(params) {
    const serverIsFiltering = this.storeUtils.isServerSideFilterOnServer();
    const storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
    const serverIsFilteringAllLevels = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups();
    if (serverIsFilteringAllLevels || serverIsFiltering && storeIsImpacted) {
      this.refreshStore(true);
      this.sortRowNodes();
      return;
    }
    this.filterRowNodes();
    this.sortRowNodes();
    this.forEachChildStoreShallow((store) => store.refreshAfterFilter(params));
  }
  refreshAfterSort(params) {
    const serverIsSorting = this.storeUtils.isServerSideSortOnServer();
    const storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
    const serverIsSortingAllLevels = this.storeUtils.isServerSideSortAllLevels();
    if (serverIsSortingAllLevels || serverIsSorting && storeIsImpacted) {
      this.refreshStore(true);
      this.filterRowNodes();
      return;
    }
    this.filterRowNodes();
    this.sortRowNodes();
    this.forEachChildStoreShallow((store) => store.refreshAfterSort(params));
  }
  applyTransaction(transaction) {
    switch (this.getState()) {
      case RowNodeBlock.STATE_FAILED:
        return { status: ServerSideTransactionResultStatus.StoreLoadingFailed };
      case RowNodeBlock.STATE_LOADING:
        return { status: ServerSideTransactionResultStatus.StoreLoading };
      case RowNodeBlock.STATE_WAITING_TO_LOAD:
        return { status: ServerSideTransactionResultStatus.StoreWaitingToLoad };
    }
    const applyCallback = this.gos.getCallback("isApplyServerSideTransaction");
    if (applyCallback) {
      const params = {
        transaction,
        parentNode: this.parentRowNode,
        groupLevelInfo: this.info
      };
      const apply = applyCallback(params);
      if (!apply) {
        return { status: ServerSideTransactionResultStatus.Cancelled };
      }
    }
    const res = {
      status: ServerSideTransactionResultStatus.Applied,
      remove: [],
      update: [],
      add: []
    };
    const nodesToUnselect = [];
    this.executeAdd(transaction, res);
    this.executeRemove(transaction, res, nodesToUnselect);
    this.executeUpdate(transaction, res, nodesToUnselect);
    this.filterAndSortNodes();
    this.updateSelection(nodesToUnselect);
    return res;
  }
  updateSelection(nodesToUnselect) {
    const selectionChanged = nodesToUnselect.length > 0;
    if (selectionChanged) {
      this.selectionService.setNodesSelected({
        newValue: false,
        nodes: nodesToUnselect,
        suppressFinishActions: true,
        clearSelection: false,
        source: "rowDataChanged"
      });
      const event = {
        type: Events.EVENT_SELECTION_CHANGED,
        source: "rowDataChanged"
      };
      this.eventService.dispatchEvent(event);
    }
  }
  executeAdd(rowDataTran, rowNodeTransaction) {
    const { add, addIndex } = rowDataTran;
    if (_.missingOrEmpty(add)) {
      return;
    }
    const useIndex = typeof addIndex === "number" && addIndex >= 0;
    if (useIndex) {
      add.reverse().forEach((item) => {
        const newRowNode = this.createDataNode(item, addIndex);
        rowNodeTransaction.add.push(newRowNode);
      });
    } else {
      add.forEach((item) => {
        const newRowNode = this.createDataNode(item);
        rowNodeTransaction.add.push(newRowNode);
      });
    }
  }
  executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect) {
    const { remove } = rowDataTran;
    if (remove == null) {
      return;
    }
    const rowIdsRemoved = {};
    remove.forEach((item) => {
      const rowNode = this.lookupRowNode(item);
      if (!rowNode) {
        return;
      }
      if (rowNode.isSelected()) {
        nodesToUnselect.push(rowNode);
      }
      rowNode.clearRowTopAndRowIndex();
      rowIdsRemoved[rowNode.id] = true;
      delete this.allNodesMap[rowNode.id];
      rowNodeTransaction.remove.push(rowNode);
      this.nodeManager.removeNode(rowNode);
    });
    this.allRowNodes = this.allRowNodes.filter((rowNode) => !rowIdsRemoved[rowNode.id]);
  }
  executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect) {
    const { update } = rowDataTran;
    if (update == null) {
      return;
    }
    update.forEach((item) => {
      const rowNode = this.lookupRowNode(item);
      if (!rowNode) {
        return;
      }
      this.blockUtils.updateDataIntoRowNode(rowNode, item);
      if (!rowNode.selectable && rowNode.isSelected()) {
        nodesToUnselect.push(rowNode);
      }
      rowNodeTransaction.update.push(rowNode);
    });
  }
  lookupRowNode(data) {
    const getRowIdFunc = this.gos.getCallback("getRowId");
    let rowNode;
    if (getRowIdFunc != null) {
      const level = this.level;
      const parentKeys = this.parentRowNode.getGroupKeys();
      const id = getRowIdFunc({
        data,
        parentKeys: parentKeys.length > 0 ? parentKeys : void 0,
        level
      });
      rowNode = this.allNodesMap[id];
      if (!rowNode) {
        console.error(`AG Grid: could not find row id=${id}, data item was not found for this id`);
        return null;
      }
    } else {
      rowNode = this.allRowNodes.find((currentRowNode) => currentRowNode.data === data);
      if (!rowNode) {
        console.error(`AG Grid: could not find data item as object was not found`, data);
        return null;
      }
    }
    return rowNode;
  }
  addStoreStates(result) {
    result.push({
      suppressInfiniteScroll: true,
      route: this.parentRowNode.getGroupKeys(),
      rowCount: this.allRowNodes.length,
      info: this.info
    });
    this.forEachChildStoreShallow((childStore) => childStore.addStoreStates(result));
  }
  refreshStore(purge) {
    if (purge) {
      const loadingRowsToShow = this.nodesAfterSort ? this.nodesAfterSort.length : 1;
      this.initialiseRowNodes(loadingRowsToShow);
    }
    this.scheduleLoad();
    this.fireStoreUpdatedEvent();
  }
  retryLoads() {
    if (this.getState() === RowNodeBlock.STATE_FAILED) {
      this.initialiseRowNodes(1);
      this.scheduleLoad();
    }
    this.forEachChildStoreShallow((store) => store.retryLoads());
  }
  scheduleLoad() {
    this.setStateWaitingToLoad();
    this.rowNodeBlockLoader.checkBlockToLoad();
  }
  // gets called 1) row count changed 2) cache purged 3) items inserted
  fireStoreUpdatedEvent() {
    const event = {
      type: Events.EVENT_STORE_UPDATED
    };
    this.eventService.dispatchEvent(event);
  }
  getRowCount() {
    return this.nodesAfterSort.length;
  }
  getTopLevelRowDisplayedIndex(topLevelIndex) {
    const rowNode = this.nodesAfterSort[topLevelIndex];
    return rowNode.rowIndex;
  }
  isLastRowIndexKnown() {
    return this.getState() == RowNodeBlock.STATE_LOADED;
  }
  getRowNodesInRange(firstInRange, lastInRange) {
    const result = [];
    let inActiveRange = false;
    if (_.missing(firstInRange)) {
      inActiveRange = true;
    }
    this.nodesAfterSort.forEach((rowNode) => {
      const hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
      if (inActiveRange || hitFirstOrLast) {
        result.push(rowNode);
      }
      if (hitFirstOrLast) {
        inActiveRange = !inActiveRange;
      }
    });
    const invalidRange = inActiveRange;
    return invalidRange ? [] : result;
  }
  getStoreBounds() {
    return {
      topPx: this.topPx,
      heightPx: this.heightPx
    };
  }
};
__decorateClass([
  Autowired("ssrmStoreUtils")
], FullStore.prototype, "storeUtils", 2);
__decorateClass([
  Autowired("ssrmBlockUtils")
], FullStore.prototype, "blockUtils", 2);
__decorateClass([
  Autowired("columnModel")
], FullStore.prototype, "columnModel", 2);
__decorateClass([
  Autowired("rowNodeBlockLoader")
], FullStore.prototype, "rowNodeBlockLoader", 2);
__decorateClass([
  Autowired("rowNodeSorter")
], FullStore.prototype, "rowNodeSorter", 2);
__decorateClass([
  Autowired("sortController")
], FullStore.prototype, "sortController", 2);
__decorateClass([
  Autowired("selectionService")
], FullStore.prototype, "selectionService", 2);
__decorateClass([
  Autowired("ssrmNodeManager")
], FullStore.prototype, "nodeManager", 2);
__decorateClass([
  Autowired("filterManager")
], FullStore.prototype, "filterManager", 2);
__decorateClass([
  Autowired("ssrmTransactionManager")
], FullStore.prototype, "transactionManager", 2);
__decorateClass([
  Autowired("rowModel")
], FullStore.prototype, "serverSideRowModel", 2);
__decorateClass([
  PostConstruct
], FullStore.prototype, "postConstruct", 1);
__decorateClass([
  PreDestroy
], FullStore.prototype, "destroyRowNodes", 1);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/lazy/lazyStore.ts
import {
  _ as _2,
  Autowired as Autowired4,
  BeanStub as BeanStub3,
  Events as Events2,
  NumberSequence as NumberSequence3,
  PostConstruct as PostConstruct4,
  PreDestroy as PreDestroy3,
  ServerSideTransactionResultStatus as ServerSideTransactionResultStatus2
} from "@ag-grid-community/core";

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/lazy/lazyCache.ts
import { Autowired as Autowired3, BeanStub as BeanStub2, PostConstruct as PostConstruct3, PreDestroy as PreDestroy2 } from "@ag-grid-community/core";

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/lazy/multiIndexMap.ts
var MultiIndexMap = class {
  constructor(...indexes) {
    if (indexes.length < 1) {
      throw new Error("AG Grid: At least one index must be provided.");
    }
    this.indexes = indexes;
    this.maps = new Map(
      this.indexes.map((index) => [index, /* @__PURE__ */ new Map()])
    );
  }
  getSize() {
    return this.maps.get(this.indexes[0]).size;
  }
  getBy(index, key) {
    const map = this.maps.get(index);
    if (!map) {
      throw new Error(`AG Grid: ${String(index)} not found`);
    }
    return map.get(key);
  }
  set(item) {
    this.indexes.forEach((index) => {
      const map = this.maps.get(index);
      if (!map) {
        throw new Error(`AG Grid: ${String(index)} not found`);
      }
      map.set(item[index], item);
    });
  }
  delete(item) {
    this.indexes.forEach((index) => {
      const map = this.maps.get(index);
      if (!map) {
        throw new Error(`AG Grid: ${String(index)} not found`);
      }
      map.delete(item[index]);
    });
  }
  clear() {
    this.maps.forEach((map) => map.clear());
  }
  getIterator(index) {
    const map = this.maps.get(index);
    if (!map) {
      throw new Error(`AG Grid: ${String(index)} not found`);
    }
    return map.values();
  }
  forEach(callback) {
    const iterator = this.getIterator(this.indexes[0]);
    let pointer;
    while (pointer = iterator.next()) {
      if (pointer.done)
        break;
      callback(pointer.value);
    }
  }
  find(callback) {
    const iterator = this.getIterator(this.indexes[0]);
    let pointer;
    while (pointer = iterator.next()) {
      if (pointer.done)
        break;
      if (callback(pointer.value)) {
        return pointer.value;
      }
    }
  }
  filter(predicate) {
    const iterator = this.getIterator(this.indexes[0]);
    let pointer;
    const result = [];
    while (pointer = iterator.next()) {
      if (pointer.done)
        break;
      if (predicate(pointer.value)) {
        result.push(pointer.value);
      }
    }
    return result;
  }
};

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/lazy/lazyBlockLoadingService.ts
import { Autowired as Autowired2, Bean, BeanStub, PostConstruct as PostConstruct2, RowNodeBlockLoader as RowNodeBlockLoader2 } from "@ag-grid-community/core";
var LazyBlockLoadingService = class extends BeanStub {
  constructor() {
    super(...arguments);
    // a map of caches to loading nodes
    this.cacheLoadingNodesMap = /* @__PURE__ */ new Map();
    // if a check is queued to happen this cycle
    this.isCheckQueued = false;
    // this is cached for blockLoadDebounce
    this.nextBlockToLoad = void 0;
  }
  init() {
    this.addManagedListener(this.rowNodeBlockLoader, RowNodeBlockLoader2.BLOCK_LOADED_EVENT, () => this.queueLoadCheck());
  }
  subscribe(cache) {
    this.cacheLoadingNodesMap.set(cache, /* @__PURE__ */ new Set());
  }
  unsubscribe(cache) {
    this.cacheLoadingNodesMap.delete(cache);
  }
  /**
   * Queues a microtask to check if any blocks need to be loaded.
   */
  queueLoadCheck() {
    if (this.isCheckQueued) {
      return;
    }
    this.isCheckQueued = true;
    window.queueMicrotask(() => {
      this.queueLoadAction();
      this.isCheckQueued = false;
    });
  }
  queueLoadAction() {
    const nextBlockToLoad = this.getBlockToLoad();
    if (!nextBlockToLoad) {
      return;
    }
    const isSameBlock = this.nextBlockToLoad && this.nextBlockToLoad.cache === nextBlockToLoad.cache && this.nextBlockToLoad.index === nextBlockToLoad.index;
    if (isSameBlock) {
      return;
    }
    if (!this.nextBlockToLoad || !isSameBlock) {
      this.nextBlockToLoad = nextBlockToLoad;
      window.clearTimeout(this.loaderTimeout);
      const startRow = Number(this.nextBlockToLoad.index);
      const cache = this.nextBlockToLoad.cache;
      const endRow = nextBlockToLoad.index + nextBlockToLoad.cache.getBlockSize();
      this.loaderTimeout = window.setTimeout(() => {
        if (!cache.isAlive()) {
          return;
        }
        this.loaderTimeout = void 0;
        this.attemptLoad(cache, startRow, endRow);
        this.nextBlockToLoad = void 0;
      }, this.gos.get("blockLoadDebounceMillis"));
    }
  }
  attemptLoad(cache, start, end) {
    const availableLoadingCount = this.rowNodeBlockLoader.getAvailableLoadingCount();
    if (availableLoadingCount != null && availableLoadingCount === 0) {
      return;
    }
    ;
    this.rowNodeBlockLoader.registerLoads(1);
    this.executeLoad(cache, start, end);
    this.queueLoadCheck();
  }
  executeLoad(cache, startRow, endRow) {
    var _a;
    const ssrmParams = cache.getSsrmParams();
    const request = {
      startRow,
      endRow,
      rowGroupCols: ssrmParams.rowGroupCols,
      valueCols: ssrmParams.valueCols,
      pivotCols: ssrmParams.pivotCols,
      pivotMode: ssrmParams.pivotMode,
      groupKeys: cache.store.getParentNode().getGroupKeys(),
      filterModel: ssrmParams.filterModel,
      sortModel: ssrmParams.sortModel
    };
    const loadingNodes = this.cacheLoadingNodesMap.get(cache);
    const removeNodesFromLoadingMap = () => {
      for (let i = 0; i < endRow - startRow; i++) {
        loadingNodes.delete(startRow + i);
      }
    };
    const addNodesToLoadingMap = () => {
      for (let i = 0; i < endRow - startRow; i++) {
        loadingNodes.add(startRow + i);
      }
    };
    const success = (params2) => {
      this.rowNodeBlockLoader.loadComplete();
      cache.onLoadSuccess(startRow, endRow - startRow, params2);
      removeNodesFromLoadingMap();
    };
    const fail = () => {
      this.rowNodeBlockLoader.loadComplete();
      cache.onLoadFailed(startRow, endRow - startRow);
      removeNodesFromLoadingMap();
    };
    const params = this.gos.addGridCommonParams({
      request,
      success,
      fail,
      parentNode: cache.store.getParentNode()
    });
    addNodesToLoadingMap();
    (_a = cache.getSsrmParams().datasource) == null ? void 0 : _a.getRows(params);
  }
  getBlockToLoad() {
    var _a;
    const firstRowInViewport = this.rowRenderer.getFirstVirtualRenderedRow();
    const lastRowInViewport = this.rowRenderer.getLastVirtualRenderedRow();
    for (let i = firstRowInViewport; i <= lastRowInViewport; i++) {
      const row = this.rowModel.getRow(i);
      if (!row) {
        continue;
      }
      const store = row.parent && row.parent.childStore;
      if (!store || !(store instanceof LazyStore)) {
        continue;
      }
      const cache = store.getCache();
      const lazyNode = cache.getNodes().getBy("node", row);
      if (!lazyNode) {
        continue;
      }
      const loadingNodes = this.cacheLoadingNodesMap.get(cache);
      if (loadingNodes == null ? void 0 : loadingNodes.has(lazyNode.index)) {
        continue;
      }
      if (row.__needsRefreshWhenVisible || row.stub && !row.failedLoad) {
        return {
          cache,
          index: cache.getBlockStartIndex(lazyNode.index)
        };
      }
    }
    let cacheToRefresh = null;
    let nodeToRefresh = null;
    let nodeToRefreshDist = Number.MAX_SAFE_INTEGER;
    for (const cache of this.cacheLoadingNodesMap.keys()) {
      const nodesToRefresh = cache.getNodesToRefresh();
      nodesToRefresh.forEach((node) => {
        if (node.rowIndex == null) {
          nodeToRefresh = node;
          cacheToRefresh = cache;
          return;
        }
        const lazyNode = cache.getNodes().getBy("node", node);
        if (!lazyNode) {
          return;
        }
        const loadingNodes = this.cacheLoadingNodesMap.get(cache);
        if (loadingNodes == null ? void 0 : loadingNodes.has(lazyNode.index)) {
          return;
        }
        const distToViewportTop = Math.abs(firstRowInViewport - node.rowIndex);
        const distToViewportBottom = Math.abs(node.rowIndex - lastRowInViewport);
        if (distToViewportTop < nodeToRefreshDist) {
          nodeToRefresh = node;
          nodeToRefreshDist = distToViewportTop;
          cacheToRefresh = cache;
        }
        if (distToViewportBottom < nodeToRefreshDist) {
          nodeToRefresh = node;
          nodeToRefreshDist = distToViewportBottom;
          cacheToRefresh = cache;
        }
      });
    }
    if (!cacheToRefresh) {
      return void 0;
    }
    const lazyCache = cacheToRefresh;
    const lazyIndex = (_a = lazyCache.getNodes().getBy("node", nodeToRefresh)) == null ? void 0 : _a.index;
    return lazyIndex == null ? void 0 : {
      cache: lazyCache,
      index: lazyCache.getBlockStartIndex(lazyIndex)
    };
  }
  isRowLoading(cache, index) {
    var _a, _b;
    return (_b = (_a = this.cacheLoadingNodesMap.get(cache)) == null ? void 0 : _a.has(index)) != null ? _b : false;
  }
};
LazyBlockLoadingService.DEFAULT_BLOCK_SIZE = 100;
__decorateClass([
  Autowired2("rowNodeBlockLoader")
], LazyBlockLoadingService.prototype, "rowNodeBlockLoader", 2);
__decorateClass([
  Autowired2("rowRenderer")
], LazyBlockLoadingService.prototype, "rowRenderer", 2);
__decorateClass([
  Autowired2("rowModel")
], LazyBlockLoadingService.prototype, "rowModel", 2);
__decorateClass([
  PostConstruct2
], LazyBlockLoadingService.prototype, "init", 1);
LazyBlockLoadingService = __decorateClass([
  Bean("lazyBlockLoadingService")
], LazyBlockLoadingService);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/lazy/lazyCache.ts
var LazyCache = class extends BeanStub2 {
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
    this.removedNodeCache = /* @__PURE__ */ new Map();
    this.store = store;
    this.numberOfRows = numberOfRows;
    this.isLastRowKnown = false;
    this.storeParams = storeParams;
  }
  init() {
    this.lazyBlockLoadingService.subscribe(this);
    this.nodeMap = new MultiIndexMap("index", "id", "node");
    this.nodeDisplayIndexMap = /* @__PURE__ */ new Map();
    this.nodesToRefresh = /* @__PURE__ */ new Set();
    this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
    this.getRowIdFunc = this.gos.getCallback("getRowId");
    this.isMasterDetail = this.gos.get("masterDetail");
  }
  destroyRowNodes() {
    this.lazyBlockLoadingService.unsubscribe(this);
    this.numberOfRows = 0;
    this.nodeMap.forEach((node) => this.blockUtils.destroyRowNode(node.node));
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
    if (!this.store.isDisplayIndexInStore(displayIndex)) {
      return void 0;
    }
    const node = this.nodeDisplayIndexMap.get(displayIndex);
    if (node) {
      if (node.stub || node.__needsRefreshWhenVisible) {
        this.lazyBlockLoadingService.queueLoadCheck();
      }
      return node;
    }
    if (displayIndex === this.store.getDisplayIndexStart()) {
      return this.createStubNode(0, displayIndex);
    }
    const contiguouslyPreviousNode = this.nodeDisplayIndexMap.get(displayIndex - 1);
    if (contiguouslyPreviousNode) {
      if (this.isMasterDetail && contiguouslyPreviousNode.master && contiguouslyPreviousNode.expanded) {
        return contiguouslyPreviousNode.detailNode;
      }
      if (contiguouslyPreviousNode.expanded && ((_a = contiguouslyPreviousNode.childStore) == null ? void 0 : _a.isDisplayIndexInStore(displayIndex))) {
        return (_b = contiguouslyPreviousNode.childStore) == null ? void 0 : _b.getRowUsingDisplayIndex(displayIndex);
      }
      const lazyCacheNode = this.nodeMap.getBy("node", contiguouslyPreviousNode);
      return this.createStubNode(lazyCacheNode.index + 1, displayIndex);
    }
    const adjacentNodes = this.getSurroundingNodesByDisplayIndex(displayIndex);
    if (adjacentNodes == null) {
      const storeIndexFromEndIndex2 = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
      return this.createStubNode(storeIndexFromEndIndex2, displayIndex);
    }
    const { previousNode, nextNode } = adjacentNodes;
    if (previousNode && previousNode.node.expanded && ((_c = previousNode.node.childStore) == null ? void 0 : _c.isDisplayIndexInStore(displayIndex))) {
      return (_d = previousNode.node.childStore) == null ? void 0 : _d.getRowUsingDisplayIndex(displayIndex);
    }
    if (nextNode) {
      const displayIndexDiff = nextNode.node.rowIndex - displayIndex;
      const newStoreIndex = nextNode.index - displayIndexDiff;
      return this.createStubNode(newStoreIndex, displayIndex);
    }
    const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
    return this.createStubNode(storeIndexFromEndIndex, displayIndex);
  }
  /**
   * Used for creating and positioning a stub node without firing a store updated event
   */
  createStubNode(storeIndex, displayIndex) {
    const rowBounds = this.store.getRowBounds(displayIndex);
    const newNode = this.createRowAtIndex(storeIndex, null, (node) => {
      node.setRowIndex(displayIndex);
      node.setRowTop(rowBounds.rowTop);
      this.nodeDisplayIndexMap.set(displayIndex, node);
    });
    this.lazyBlockLoadingService.queueLoadCheck();
    return newNode;
  }
  /**
   * @param index The row index relative to this store
   * @returns A rowNode at the given store index
   */
  getRowByStoreIndex(index) {
    var _a;
    return (_a = this.nodeMap.getBy("index", index)) == null ? void 0 : _a.node;
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
    const defaultRowHeight = this.gos.getRowHeightAsNumber();
    displayIndexSeq.skip(numberOfRowsToSkip);
    nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
  }
  /**
   * @param displayIndexSeq the number sequence for generating the display index of each row
   * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
   */
  setDisplayIndexes(displayIndexSeq, nextRowTop) {
    this.nodeDisplayIndexMap.clear();
    const orderedMap = {};
    this.nodeMap.forEach((lazyNode) => {
      orderedMap[lazyNode.index] = lazyNode.node;
    });
    let lastIndex = -1;
    for (const stringIndex in orderedMap) {
      const node = orderedMap[stringIndex];
      const numericIndex = Number(stringIndex);
      const numberOfRowsToSkip2 = numericIndex - 1 - lastIndex;
      this.skipDisplayIndexes(numberOfRowsToSkip2, displayIndexSeq, nextRowTop);
      this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
      this.nodeDisplayIndexMap.set(node.rowIndex, node);
      lastIndex = numericIndex;
    }
    const numberOfRowsToSkip = this.numberOfRows - 1 - lastIndex;
    this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
    this.purgeExcessRows();
  }
  getRowCount() {
    return this.numberOfRows;
  }
  setRowCount(rowCount, isLastRowIndexKnown) {
    if (rowCount < 0) {
      throw new Error("AG Grid: setRowCount can only accept a positive row count.");
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
    return (_a = this.nodeDisplayIndexMap.get(displayIndex)) != null ? _a : null;
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
    this.nodeMap.forEach((lazyNode) => {
      if (displayIndex > lazyNode.node.rowIndex) {
        if (previousNode == null || previousNode.node.rowIndex < lazyNode.node.rowIndex) {
          previousNode = lazyNode;
        }
        return;
      }
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
    const nodeAtIndex = this.nodeMap.getBy("index", storeIndex);
    if (nodeAtIndex) {
      return nodeAtIndex.node.rowIndex;
    }
    let nextNode;
    let previousNode;
    this.nodeMap.forEach((lazyNode) => {
      if (storeIndex > lazyNode.index) {
        if (previousNode == null || previousNode.index < lazyNode.index) {
          previousNode = lazyNode;
        }
        return;
      }
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
    const previousDisplayIndex = (_b = (_a = previousNode.node.childStore) == null ? void 0 : _a.getDisplayIndexEnd()) != null ? _b : previousNode.node.rowIndex;
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
    const lazyNode = this.nodeMap.getBy("index", atStoreIndex);
    if (lazyNode) {
      const { node } = lazyNode;
      node.__needsRefreshWhenVisible = false;
      if (this.doesNodeMatch(data, node)) {
        this.blockUtils.updateDataIntoRowNode(node, data);
        this.nodesToRefresh.delete(node);
        return node;
      }
      if (this.getRowIdFunc == null && node.hasChildren() && node.expanded) {
        this.nodesToRefresh.delete(node);
        return node;
      }
      this.destroyRowAtIndex(atStoreIndex);
    }
    if (data && this.getRowIdFunc != null) {
      const id = this.getRowId(data);
      const deletedNode = id && ((_a = this.removedNodeCache) == null ? void 0 : _a.get(id));
      if (deletedNode) {
        (_b = this.removedNodeCache) == null ? void 0 : _b.delete(id);
        this.blockUtils.updateDataIntoRowNode(deletedNode, data);
        this.nodeMap.set({
          id: deletedNode.id,
          node: deletedNode,
          index: atStoreIndex
        });
        return deletedNode;
      }
      const lazyNode2 = this.nodeMap.getBy("id", id);
      if (lazyNode2) {
        this.nodeMap.delete(lazyNode2);
        const { node, index } = lazyNode2;
        this.blockUtils.updateDataIntoRowNode(node, data);
        this.nodeMap.set({
          id: node.id,
          node,
          index: atStoreIndex
        });
        this.nodesToRefresh.delete(node);
        if (this.getBlockStartIndex(index) === this.getBlockStartIndex(atStoreIndex)) {
          return node;
        }
        this.markBlockForVerify(index);
        return node;
      }
    }
    const newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
    if (data != null) {
      const defaultId = this.getPrefixedId(this.store.getIdSequence().next());
      this.blockUtils.setDataIntoRowNode(newNode, data, defaultId, void 0);
      this.serverSideRowModel.setPaused(true);
      this.blockUtils.checkOpenByDefault(newNode);
      this.serverSideRowModel.setPaused(false);
      this.nodeManager.addRowNode(newNode);
    }
    this.nodeMap.set({
      id: newNode.id,
      node: newNode,
      index: atStoreIndex
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
      const blockStart = this.getBlockStartIndex(index);
      if (!node.stub && !node.failedLoad) {
        blockCounts[blockStart] = ((_a = blockCounts[blockStart]) != null ? _a : 0) + 1;
      }
      let rowState = "loaded";
      if (node.failedLoad) {
        rowState = "failed";
      } else if (this.lazyBlockLoadingService.isRowLoading(this, blockStart)) {
        rowState = "loading";
      } else if (this.nodesToRefresh.has(node) || node.stub) {
        rowState = "needsLoading";
      }
      if (!blockStates[blockStart]) {
        blockStates[blockStart] = /* @__PURE__ */ new Set();
      }
      blockStates[blockStart].add(rowState);
    });
    const statePriorityMap = {
      loading: 4,
      failed: 3,
      needsLoading: 2,
      loaded: 1
    };
    const blockPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
    const results = {};
    Object.entries(blockStates).forEach(([blockStart, uniqueStates]) => {
      var _a;
      const sortedStates = [...uniqueStates].sort((a, b) => {
        var _a2, _b;
        return ((_a2 = statePriorityMap[a]) != null ? _a2 : 0) - ((_b = statePriorityMap[b]) != null ? _b : 0);
      });
      const priorityState = sortedStates[0];
      const blockNumber = Number(blockStart) / this.getBlockSize();
      const blockId = blockPrefix ? `${blockPrefix}-${blockNumber}` : String(blockNumber);
      results[blockId] = {
        blockNumber,
        startRow: Number(blockStart),
        endRow: Number(blockStart) + this.getBlockSize(),
        pageStatus: priorityState,
        loadedRowCount: (_a = blockCounts[blockStart]) != null ? _a : 0
      };
    });
    return results;
  }
  destroyRowAtIndex(atStoreIndex) {
    const lazyNode = this.nodeMap.getBy("index", atStoreIndex);
    if (!lazyNode) {
      return;
    }
    this.nodeMap.delete(lazyNode);
    this.nodeDisplayIndexMap.delete(lazyNode.node.rowIndex);
    if (this.nodesToRefresh.size > 0) {
      this.removedNodeCache.set(lazyNode.node.id, lazyNode.node);
    } else {
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
      return this.defaultNodeIdPrefix + "-" + id;
    } else {
      return id.toString();
    }
  }
  markBlockForVerify(rowIndex) {
    const [start, end] = this.getBlockBounds(rowIndex);
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
    const firstRow = this.api.getFirstDisplayedRowIndex();
    const lastRow = this.api.getLastDisplayedRowIndex();
    const firstRowBlockStart = this.getBlockStartIndex(firstRow);
    const [_9, lastRowBlockEnd] = this.getBlockBounds(lastRow);
    this.nodeMap.forEach((lazyNode) => {
      if (this.lazyBlockLoadingService.isRowLoading(this, lazyNode.index) || lazyNode.node.failedLoad) {
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
      const [blockStart, blockEnd] = this.getBlockBounds(index);
      if (blockStart in blockDistanceToMiddle) {
        return;
      }
      const distStart = Math.abs(node.rowIndex - otherDisplayIndex);
      let distEnd;
      const lastLazyNode = this.nodeMap.getBy("index", [blockEnd - 1]);
      if (lastLazyNode)
        distEnd = Math.abs(lastLazyNode.node.rowIndex - otherDisplayIndex);
      const farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
      blockDistanceToMiddle[blockStart] = farthest;
    });
    return Object.entries(blockDistanceToMiddle);
  }
  purgeExcessRows() {
    var _a;
    this.purgeStubsOutsideOfViewport();
    if (this.store.getDisplayIndexEnd() == null || this.storeParams.maxBlocksInCache == null) {
      return;
    }
    const firstRowInViewport = this.api.getFirstDisplayedRowIndex();
    const lastRowInViewport = this.api.getLastDisplayedRowIndex();
    const allLoadedBlocks = /* @__PURE__ */ new Set();
    const blocksInViewport = /* @__PURE__ */ new Set();
    this.nodeMap.forEach(({ index, node }) => {
      const blockStart = this.getBlockStartIndex(index);
      allLoadedBlocks.add(blockStart);
      const isInViewport = node.rowIndex >= firstRowInViewport && node.rowIndex <= lastRowInViewport;
      if (isInViewport) {
        blocksInViewport.add(blockStart);
      }
    });
    const numberOfBlocksToRetain = Math.max(blocksInViewport.size, (_a = this.storeParams.maxBlocksInCache) != null ? _a : 0);
    const loadedBlockCount = allLoadedBlocks.size;
    const blocksToRemove = loadedBlockCount - numberOfBlocksToRetain;
    if (blocksToRemove <= 0) {
      return;
    }
    let firstRowBlockStart = Number.MAX_SAFE_INTEGER;
    let lastRowBlockStart = Number.MIN_SAFE_INTEGER;
    blocksInViewport.forEach((blockStart) => {
      if (firstRowBlockStart > blockStart) {
        firstRowBlockStart = blockStart;
      }
      if (lastRowBlockStart < blockStart) {
        lastRowBlockStart = blockStart;
      }
    });
    const disposableNodes = this.nodeMap.filter(({ node, index }) => {
      const rowBlockStart = this.getBlockStartIndex(index);
      const rowBlockInViewport = rowBlockStart >= firstRowBlockStart && rowBlockStart <= lastRowBlockStart;
      return !rowBlockInViewport && !this.isNodeCached(node);
    });
    if (disposableNodes.length === 0) {
      return;
    }
    const midViewportRow = firstRowInViewport + (lastRowInViewport - firstRowInViewport) / 2;
    const blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodes, midViewportRow);
    const blockSize = this.getBlockSize();
    blockDistanceArray.sort((a, b) => Math.sign(b[1] - a[1]));
    for (let i = 0; i < Math.min(blocksToRemove, blockDistanceArray.length); i++) {
      const blockStart = Number(blockDistanceArray[i][0]);
      for (let x = blockStart; x < blockStart + blockSize; x++) {
        const lazyNode = this.nodeMap.getBy("index", x);
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
    return node.isExpandable() && node.expanded || this.isNodeFocused(node);
  }
  extractDuplicateIds(rows) {
    if (this.getRowIdFunc == null) {
      return [];
    }
    const newIds = /* @__PURE__ */ new Set();
    const duplicates = /* @__PURE__ */ new Set();
    rows.forEach((data) => {
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
        const duplicateIdText = duplicates.join(", ");
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
      const nodeFromCache = this.nodeMap.getBy("index", rowIndex);
      if ((_a = nodeFromCache == null ? void 0 : nodeFromCache.node) == null ? void 0 : _a.stub) {
        this.createRowAtIndex(rowIndex, data);
        return;
      }
      if (nodeFromCache && this.doesNodeMatch(data, nodeFromCache.node)) {
        this.blockUtils.updateDataIntoRowNode(nodeFromCache.node, data);
        this.nodesToRefresh.delete(nodeFromCache.node);
        nodeFromCache.node.__needsRefreshWhenVisible = false;
        return;
      }
      this.createRowAtIndex(rowIndex, data);
    });
    if (response.rowCount != void 0 && response.rowCount !== -1) {
      this.numberOfRows = response.rowCount;
      this.isLastRowKnown = true;
    } else if (numberOfRowsExpected > response.rowData.length) {
      this.numberOfRows = firstRowIndex + response.rowData.length;
      this.isLastRowKnown = true;
    } else if (!this.isLastRowKnown) {
      const lastInferredRow = firstRowIndex + response.rowData.length + 1;
      if (lastInferredRow > this.numberOfRows) {
        this.numberOfRows = lastInferredRow;
      }
    }
    if (this.isLastRowKnown) {
      const lazyNodesAfterStoreEnd = this.nodeMap.filter((lazyNode) => lazyNode.index >= this.numberOfRows);
      lazyNodesAfterStoreEnd.forEach((lazyNode) => this.destroyRowAtIndex(lazyNode.index));
    }
    this.fireStoreUpdatedEvent();
    const finishedRefreshing = this.nodesToRefresh.size === 0;
    if (wasRefreshing && finishedRefreshing) {
      this.fireRefreshFinishedEvent();
    }
  }
  fireRefreshFinishedEvent() {
    const finishedRefreshing = this.nodesToRefresh.size === 0;
    if (!finishedRefreshing) {
      return;
    }
    this.removedNodeCache.forEach((node) => {
      this.blockUtils.destroyRowNode(node);
    });
    this.removedNodeCache = /* @__PURE__ */ new Map();
    this.store.fireRefreshFinishedEvent();
  }
  /**
   * @returns true if all rows are loaded
   */
  isStoreFullyLoaded() {
    const knowsSize = this.isLastRowKnown;
    const hasCorrectRowCount = this.nodeMap.getSize() === this.numberOfRows;
    if (!knowsSize || !hasCorrectRowCount) {
      return;
    }
    if (this.nodesToRefresh.size > 0) {
      return;
    }
    let index = -1;
    const firstOutOfPlaceNode = this.nodeMap.find((lazyNode) => {
      index += 1;
      if (lazyNode.index !== index) {
        return true;
      }
      if (lazyNode.node.__needsRefreshWhenVisible) {
        return true;
      }
      if (lazyNode.node.stub) {
        return true;
      }
      return false;
    });
    return firstOutOfPlaceNode == null;
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
      let { node } = (_a = this.nodeMap.getBy("index", i)) != null ? _a : {};
      if (node) {
        this.nodesToRefresh.delete(node);
      }
      if (!node || !node.stub) {
        if (node && !node.stub) {
          this.destroyRowAtIndex(i);
        }
        node = this.createRowAtIndex(i);
      }
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
    this.nodeMap.forEach((lazyNode) => {
      if (lazyNode.node.stub && !lazyNode.node.failedLoad) {
        return;
      }
      this.nodesToRefresh.add(lazyNode.node);
    });
    this.lazyBlockLoadingService.queueLoadCheck();
    if (this.isLastRowKnown && this.numberOfRows === 0) {
      this.numberOfRows = 1;
      this.isLastRowKnown = false;
      this.fireStoreUpdatedEvent();
    }
  }
  isNodeInCache(id) {
    return !!this.nodeMap.getBy("id", id);
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
    const { level } = this.store.getRowDetails();
    const parentKeys = this.store.getParentNode().getGroupKeys();
    const id = this.getRowIdFunc({
      data,
      parentKeys: parentKeys.length > 0 ? parentKeys : void 0,
      level
    });
    return String(id);
  }
  getOrderedNodeMap() {
    const obj = {};
    this.nodeMap.forEach((node) => obj[node.index] = node);
    return obj;
  }
  clearDisplayIndexes() {
    this.nodeDisplayIndexMap.clear();
  }
  /**
   * Client side sorting
   */
  clientSideSortRows() {
    const sortOptions = this.sortController.getSortOptions();
    const isAnySort = sortOptions.some((opt) => opt.sort != null);
    if (!isAnySort) {
      return;
    }
    const allNodes = new Array(this.nodeMap.getSize());
    this.nodeMap.forEach((lazyNode) => allNodes[lazyNode.index] = lazyNode.node);
    this.nodeMap.clear();
    const sortedNodes = this.rowNodeSorter.doFullSort(allNodes, sortOptions);
    sortedNodes.forEach((node, index) => {
      this.nodeMap.set({
        id: node.id,
        node,
        index
      });
    });
  }
  /**
   * Transaction Support here
   */
  updateRowNodes(updates) {
    if (this.getRowIdFunc == null) {
      throw new Error("AG Grid: Transactions can only be applied when row ids are supplied.");
    }
    const updatedNodes = [];
    updates.forEach((data) => {
      const id = this.getRowId(data);
      const lazyNode = this.nodeMap.getBy("id", id);
      if (lazyNode) {
        this.blockUtils.updateDataIntoRowNode(lazyNode.node, data);
        updatedNodes.push(lazyNode.node);
      }
    });
    return updatedNodes;
  }
  insertRowNodes(inserts, indexToAdd) {
    const realRowCount = this.store.getRowCount() - (this.store.getParentNode().sibling ? 1 : 0);
    const addIndex = indexToAdd == null && this.isLastRowKnown ? realRowCount : indexToAdd;
    if (addIndex == null || realRowCount < addIndex) {
      return [];
    }
    if (this.getRowIdFunc == null) {
      throw new Error("AG Grid: Transactions can only be applied when row ids are supplied.");
    }
    const uniqueInsertsMap = {};
    inserts.forEach((data) => {
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
    const nodesToMove = this.nodeMap.filter((node) => node.index >= addIndex);
    nodesToMove.forEach((lazyNode) => this.nodeMap.delete(lazyNode));
    nodesToMove.forEach((lazyNode) => {
      this.nodeMap.set({
        node: lazyNode.node,
        index: lazyNode.index + numberOfInserts,
        id: lazyNode.id
      });
    });
    this.numberOfRows += numberOfInserts;
    return uniqueInserts.map((data, uniqueInsertOffset) => this.createRowAtIndex(addIndex + uniqueInsertOffset, data));
  }
  removeRowNodes(idsToRemove) {
    if (this.getRowIdFunc == null) {
      throw new Error("AG Grid: Transactions can only be applied when row ids are supplied.");
    }
    const removedNodes = [];
    const nodesToVerify = [];
    let deletedNodeCount = 0;
    const remainingIdsToRemove = [...idsToRemove];
    const allNodes = this.getOrderedNodeMap();
    let contiguousIndex = -1;
    for (let stringIndex in allNodes) {
      contiguousIndex += 1;
      const node = allNodes[stringIndex];
      const matchIndex = remainingIdsToRemove.findIndex((idToRemove) => idToRemove === node.id);
      if (matchIndex !== -1) {
        remainingIdsToRemove.splice(matchIndex, 1);
        this.destroyRowAtIndex(Number(stringIndex));
        removedNodes.push(node.node);
        deletedNodeCount += 1;
        continue;
      }
      if (deletedNodeCount === 0) {
        continue;
      }
      const numericStoreIndex = Number(stringIndex);
      if (contiguousIndex !== numericStoreIndex) {
        nodesToVerify.push(node.node);
      }
      this.nodeMap.delete(allNodes[stringIndex]);
      this.nodeMap.set({
        id: node.id,
        node: node.node,
        index: numericStoreIndex - deletedNodeCount
      });
    }
    this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
    if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
      nodesToVerify.forEach((node) => node.__needsRefreshWhenVisible = true);
      this.lazyBlockLoadingService.queueLoadCheck();
    }
    return removedNodes;
  }
  /**
   * Return the block size configured for this cache
   */
  getBlockSize() {
    return this.storeParams.cacheBlockSize || LazyBlockLoadingService.DEFAULT_BLOCK_SIZE;
  }
  /**
   * Get the start index of the loading block for a given index
   */
  getBlockStartIndex(storeIndex) {
    const blockSize = this.getBlockSize();
    return storeIndex - storeIndex % blockSize;
  }
  /**
   * Get the start and end index of a block, given a row store index
   */
  getBlockBounds(storeIndex) {
    const startOfBlock = this.getBlockStartIndex(storeIndex);
    const blockSize = this.getBlockSize();
    return [startOfBlock, startOfBlock + blockSize];
  }
};
__decorateClass([
  Autowired3("gridApi")
], LazyCache.prototype, "api", 2);
__decorateClass([
  Autowired3("ssrmBlockUtils")
], LazyCache.prototype, "blockUtils", 2);
__decorateClass([
  Autowired3("focusService")
], LazyCache.prototype, "focusService", 2);
__decorateClass([
  Autowired3("ssrmNodeManager")
], LazyCache.prototype, "nodeManager", 2);
__decorateClass([
  Autowired3("rowModel")
], LazyCache.prototype, "serverSideRowModel", 2);
__decorateClass([
  Autowired3("rowNodeSorter")
], LazyCache.prototype, "rowNodeSorter", 2);
__decorateClass([
  Autowired3("sortController")
], LazyCache.prototype, "sortController", 2);
__decorateClass([
  Autowired3("lazyBlockLoadingService")
], LazyCache.prototype, "lazyBlockLoadingService", 2);
__decorateClass([
  PostConstruct3
], LazyCache.prototype, "init", 1);
__decorateClass([
  PreDestroy2
], LazyCache.prototype, "destroyRowNodes", 1);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/lazy/lazyStore.ts
var LazyStore = class extends BeanStub3 {
  constructor(ssrmParams, storeParams, parentRowNode) {
    super();
    this.idSequence = new NumberSequence3();
    this.ssrmParams = ssrmParams;
    this.parentRowNode = parentRowNode;
    this.storeParams = storeParams;
    this.level = parentRowNode.level + 1;
    this.group = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : false;
    this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
    this.info = {};
  }
  init() {
    var _a;
    let numberOfRows = 1;
    if (this.level === 0) {
      numberOfRows = (_a = this.storeUtils.getServerSideInitialRowCount()) != null ? _a : 1;
      this.eventService.dispatchEventOnce({
        type: Events2.EVENT_ROW_COUNT_READY
      });
    }
    this.cache = this.createManagedBean(new LazyCache(this, numberOfRows, this.storeParams));
    const usingTreeData = this.gos.get("treeData");
    if (!usingTreeData && this.group) {
      const groupColVo = this.ssrmParams.rowGroupCols[this.level];
      this.groupField = groupColVo.field;
      this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
    }
  }
  destroyRowNodes() {
    this.displayIndexStart = void 0;
    this.displayIndexEnd = void 0;
    this.destroyBean(this.cache);
  }
  /**
   * Given a server response, ingest the rows outside of the data source lifecycle.
   * 
   * @param rowDataParams the server response containing the rows to ingest
   * @param startRow the index to start ingesting rows
   * @param expectedRows the expected number of rows in the response (used to determine if the last row index is known)
   */
  applyRowData(rowDataParams, startRow, expectedRows) {
    this.cache.onLoadSuccess(startRow, expectedRows, rowDataParams);
  }
  /**
   * Applies a given transaction to the data set within this store
   * 
   * @param transaction an object containing delta instructions determining the changes to apply to this store
   * @returns an object determining the status of this transaction and effected nodes
   */
  applyTransaction(transaction) {
    var _a, _b, _c;
    const idFunc = this.gos.getCallback("getRowId");
    if (!idFunc) {
      console.warn("AG Grid: getRowId callback must be implemented for transactions to work. Transaction was ignored.");
      return {
        status: ServerSideTransactionResultStatus2.Cancelled
      };
    }
    const applyCallback = this.gos.getCallback("isApplyServerSideTransaction");
    if (applyCallback) {
      const params = {
        transaction,
        parentNode: this.parentRowNode,
        groupLevelInfo: this.info
      };
      const apply = applyCallback(params);
      if (!apply) {
        return { status: ServerSideTransactionResultStatus2.Cancelled };
      }
    }
    const allRowsLoaded = this.cache.isStoreFullyLoaded();
    let updatedNodes = void 0;
    if ((_a = transaction.update) == null ? void 0 : _a.length) {
      updatedNodes = this.cache.updateRowNodes(transaction.update);
    }
    let insertedNodes = void 0;
    if ((_b = transaction.add) == null ? void 0 : _b.length) {
      let addIndex = transaction.addIndex;
      if (addIndex != null && addIndex < 0) {
        addIndex = void 0;
      }
      insertedNodes = this.cache.insertRowNodes(transaction.add, addIndex);
    }
    let removedNodes = void 0;
    if ((_c = transaction.remove) == null ? void 0 : _c.length) {
      const allIdsToRemove = transaction.remove.map((data) => idFunc({ level: this.level, parentKeys: this.parentRowNode.getGroupKeys(), data }));
      const allUniqueIdsToRemove = [...new Set(allIdsToRemove)];
      removedNodes = this.cache.removeRowNodes(allUniqueIdsToRemove);
    }
    const isClientSideSortingEnabled = this.gos.get("serverSideEnableClientSideSort");
    const isUpdateOrAdd = (updatedNodes == null ? void 0 : updatedNodes.length) || (insertedNodes == null ? void 0 : insertedNodes.length);
    const isClientSideSort = allRowsLoaded && isClientSideSortingEnabled;
    if (isClientSideSort && isUpdateOrAdd) {
      this.cache.clientSideSortRows();
    }
    this.updateSelectionAfterTransaction(updatedNodes, removedNodes);
    return {
      status: ServerSideTransactionResultStatus2.Applied,
      update: updatedNodes,
      add: insertedNodes,
      remove: removedNodes
    };
  }
  updateSelectionAfterTransaction(updatedNodes, removedNodes) {
    const nodesToDeselect = [];
    updatedNodes == null ? void 0 : updatedNodes.forEach((node) => {
      if (node.isSelected() && !node.selectable) {
        nodesToDeselect.push(node);
      }
    });
    removedNodes == null ? void 0 : removedNodes.forEach((node) => {
      if (node.isSelected()) {
        nodesToDeselect.push(node);
      }
    });
    if (nodesToDeselect.length) {
      this.selectionService.setNodesSelected({
        newValue: false,
        clearSelection: false,
        nodes: nodesToDeselect,
        source: "rowDataChanged"
      });
    }
  }
  /**
   * Clear the display indexes, used for fading rows out when stores are not being destroyed
   */
  clearDisplayIndexes() {
    this.displayIndexStart = void 0;
    this.displayIndexEnd = void 0;
    this.cache.getNodes().forEach((lazyNode) => this.blockUtils.clearDisplayIndex(lazyNode.node));
    if (this.parentRowNode.sibling) {
      this.blockUtils.clearDisplayIndex(this.parentRowNode.sibling);
    }
    this.cache.clearDisplayIndexes();
  }
  /**
   * @returns an index representing the last sequentially displayed row in the grid for this store
   */
  getDisplayIndexStart() {
    return this.displayIndexStart;
  }
  /**
   * @returns the index representing one after the last sequentially displayed row in the grid for this store
   */
  getDisplayIndexEnd() {
    return this.displayIndexEnd;
  }
  /** 
   * @returns the virtual size of this store
   */
  getRowCount() {
    if (this.parentRowNode.sibling) {
      return this.cache.getRowCount() + 1;
    }
    return this.cache.getRowCount();
  }
  /** 
   * Sets the current row count of the store, and whether the last row index is known
   */
  setRowCount(rowCount, isLastRowIndexKnown) {
    this.cache.setRowCount(rowCount, isLastRowIndexKnown);
  }
  /**
   * Given a display index, returns whether that row is within this store or a child store of this store
   * 
   * @param displayIndex the visible index of a row
   * @returns whether or not the row exists within this store
   */
  isDisplayIndexInStore(displayIndex) {
    if (this.cache.getRowCount() === 0)
      return false;
    return this.displayIndexStart <= displayIndex && displayIndex < this.getDisplayIndexEnd();
  }
  /**
   * Recursively sets up the display indexes and top position of every node belonging to this store.
   * 
   * Called after a row height changes, or a store updated event.
   * 
   * @param displayIndexSeq the number sequence for generating the display index of each row
   * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
   */
  setDisplayIndexes(displayIndexSeq, nextRowTop) {
    this.displayIndexStart = displayIndexSeq.peek();
    this.topPx = nextRowTop.value;
    const footerNode = this.parentRowNode.level > -1 && this.gos.getGroupTotalRowCallback()({ node: this.parentRowNode });
    if (!footerNode) {
      this.parentRowNode.destroyFooter();
    }
    if (footerNode === "top") {
      this.parentRowNode.createFooter();
      this.blockUtils.setDisplayIndex(this.parentRowNode.sibling, displayIndexSeq, nextRowTop);
    }
    this.cache.setDisplayIndexes(displayIndexSeq, nextRowTop);
    if (footerNode === "bottom") {
      this.parentRowNode.createFooter();
      this.blockUtils.setDisplayIndex(this.parentRowNode.sibling, displayIndexSeq, nextRowTop);
    }
    this.displayIndexEnd = displayIndexSeq.peek();
    this.heightPx = nextRowTop.value - this.topPx;
  }
  /**
   * Recursively applies a provided function to every node
   * 
   * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
   */
  forEachStoreDeep(callback, sequence = new NumberSequence3()) {
    callback(this, sequence.next());
    this.cache.getNodes().forEach((lazyNode) => {
      const childCache = lazyNode.node.childStore;
      if (childCache) {
        childCache.forEachStoreDeep(callback, sequence);
      }
    });
  }
  /**
   * Recursively applies a provided function to every node
   * 
   * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
   */
  forEachNodeDeep(callback, sequence = new NumberSequence3()) {
    this.cache.getNodes().forEach((lazyNode) => {
      callback(lazyNode.node, sequence.next());
      const childCache = lazyNode.node.childStore;
      if (childCache) {
        childCache.forEachNodeDeep(callback, sequence);
      }
    });
  }
  /**
   * Recursively applies a provided function to every node
   * 
   * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeep
   */
  forEachNodeDeepAfterFilterAndSort(callback, sequence = new NumberSequence3(), includeFooterNodes = false) {
    const footerNode = this.parentRowNode.level > -1 && this.gos.getGroupTotalRowCallback()({ node: this.parentRowNode });
    if (footerNode === "top") {
      callback(this.parentRowNode.sibling, sequence.next());
    }
    const orderedNodes = this.cache.getOrderedNodeMap();
    for (let key in orderedNodes) {
      const lazyNode = orderedNodes[key];
      callback(lazyNode.node, sequence.next());
      const childCache = lazyNode.node.childStore;
      if (childCache) {
        childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence, includeFooterNodes);
      }
    }
    if (footerNode === "bottom") {
      callback(this.parentRowNode.sibling, sequence.next());
    }
  }
  /**
   * Removes the failed status from all nodes, and marks them as stub to encourage reloading
   */
  retryLoads() {
    this.cache.getNodes().forEach(({ node }) => {
      if (node.failedLoad) {
        node.failedLoad = false;
        node.__needsRefreshWhenVisible = true;
        node.stub = true;
      }
    });
    this.forEachChildStoreShallow((store) => store.retryLoads());
    this.fireStoreUpdatedEvent();
  }
  /**
   * Given a display index, returns the row at that location.
   * 
   * @param displayRowIndex the displayed index within the grid to search for
   * @returns the row node if the display index falls within the store, if it didn't exist this will create a new stub to return
   */
  getRowUsingDisplayIndex(displayRowIndex) {
    if (this.parentRowNode.sibling && displayRowIndex === this.parentRowNode.sibling.rowIndex) {
      return this.parentRowNode.sibling;
    }
    return this.cache.getRowByDisplayIndex(displayRowIndex);
  }
  /**
   * Given a display index, returns the row top and height for the row at that index.
   * 
   * @param displayIndex the display index of the node
   * @returns an object containing the rowTop and rowHeight of the node at the given displayIndex
   */
  getRowBounds(displayIndex) {
    var _a;
    if (!this.isDisplayIndexInStore(displayIndex)) {
      return null;
    }
    const thisNode = this.cache.getNodeCachedByDisplayIndex(displayIndex);
    if (thisNode) {
      const boundsFromRow = this.blockUtils.extractRowBounds(thisNode, displayIndex);
      if (boundsFromRow) {
        return boundsFromRow;
      }
    }
    const { previousNode, nextNode } = (_a = this.cache.getSurroundingNodesByDisplayIndex(displayIndex)) != null ? _a : {};
    if (previousNode) {
      const boundsFromRow = this.blockUtils.extractRowBounds(previousNode.node, displayIndex);
      if (boundsFromRow != null) {
        return boundsFromRow;
      }
    }
    const defaultRowHeight = this.gos.getRowHeightAsNumber();
    if (nextNode) {
      const numberOfRowDiff2 = (nextNode.node.rowIndex - displayIndex) * defaultRowHeight;
      return {
        rowTop: nextNode.node.rowTop - numberOfRowDiff2,
        rowHeight: defaultRowHeight
      };
    }
    const lastTop = this.topPx + this.heightPx;
    const numberOfRowDiff = (this.getDisplayIndexEnd() - displayIndex) * defaultRowHeight;
    return {
      rowTop: lastTop - numberOfRowDiff,
      rowHeight: defaultRowHeight
    };
  }
  /**
   * Given a vertical pixel, determines whether this store contains a row at that pixel
   * 
   * @param pixel a vertical pixel position from the grid
   * @returns whether that pixel points to a virtual space belonging to this store
   */
  isPixelInRange(pixel) {
    return pixel >= this.topPx && pixel < this.topPx + this.heightPx;
  }
  /**
   * Given a vertical pixel, returns the row existing at that pixel location
   * 
   * @param pixel a vertical pixel position from the grid
   * @returns the display index at the given pixel location
   */
  getRowIndexAtPixel(pixel) {
    if (pixel < this.topPx) {
      return this.getDisplayIndexStart();
    }
    if (pixel >= this.topPx + this.heightPx) {
      return this.getDisplayIndexEnd() - 1;
    }
    if (this.parentRowNode.sibling && pixel > this.parentRowNode.sibling.rowTop && pixel < this.parentRowNode.sibling.rowTop + this.parentRowNode.sibling.rowHeight) {
      return this.parentRowNode.sibling.rowIndex;
    }
    let distToPreviousNodeTop = Number.MAX_SAFE_INTEGER;
    let previousNode = null;
    let distToNextNodeTop = Number.MAX_SAFE_INTEGER;
    let nextNode = null;
    this.cache.getNodes().forEach(({ node }) => {
      const distBetween = Math.abs(pixel - node.rowTop);
      if (node.rowTop < pixel) {
        if (distBetween < distToPreviousNodeTop) {
          distToPreviousNodeTop = distBetween;
          previousNode = node;
        }
        return;
      }
      if (distBetween < distToNextNodeTop) {
        distToNextNodeTop = distBetween;
        nextNode = node;
      }
    });
    previousNode = previousNode;
    nextNode = nextNode;
    if (previousNode) {
      const indexOfRow = this.blockUtils.getIndexAtPixel(previousNode, pixel);
      if (indexOfRow != null) {
        return indexOfRow;
      }
    }
    const defaultRowHeight = this.gos.getRowHeightAsNumber();
    if (nextNode) {
      const nextTop2 = nextNode.rowTop;
      const numberOfRowDiff2 = Math.ceil((nextTop2 - pixel) / defaultRowHeight);
      return nextNode.rowIndex - numberOfRowDiff2;
    }
    const nextTop = this.topPx + this.heightPx;
    const numberOfRowDiff = Math.floor((nextTop - pixel) / defaultRowHeight);
    return this.getDisplayIndexEnd() - numberOfRowDiff;
  }
  /**
   * Given a path of group keys, returns the child store for that group.
   * 
   * @param keys the grouping path to the desired store
   * @returns the child store for the given keys, or null if not found
   */
  getChildStore(keys) {
    return this.storeUtils.getChildStore(keys, this, (key) => {
      const lazyNode = this.cache.getNodes().find((lazyNode2) => lazyNode2.node.key == key);
      if (!lazyNode) {
        return null;
      }
      return lazyNode.node;
    });
  }
  /**
   * Executes a provided callback on each child store belonging to this store
   * 
   * @param cb the callback to execute
   */
  forEachChildStoreShallow(cb) {
    this.cache.getNodes().forEach(({ node }) => {
      if (node.childStore) {
        cb(node.childStore);
      }
    });
  }
  /**
   * Executes after a change to sorting, determines recursively whether this store or a child requires refreshed.
   * 
   * If a purge refresh occurs, the row count is preserved.
   * 
   * @param params a set of properties pertaining to the sort changes
   */
  refreshAfterSort(params) {
    const serverSortsAllLevels = this.storeUtils.isServerSideSortAllLevels();
    if (serverSortsAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
      const allRowsLoaded = this.cache.isStoreFullyLoaded();
      const isClientSideSortingEnabled = this.gos.get("serverSideEnableClientSideSort");
      const isClientSideSort = allRowsLoaded && isClientSideSortingEnabled;
      if (!isClientSideSort) {
        const oldCount = this.cache.getRowCount();
        this.destroyBean(this.cache);
        this.cache = this.createManagedBean(new LazyCache(this, oldCount, this.storeParams));
        return;
      }
      this.cache.clientSideSortRows();
    }
    this.forEachChildStoreShallow((store) => store.refreshAfterSort(params));
  }
  /**
   * Executes after a change to filtering, determines recursively whether this store or a child requires refreshed.
   * 
   * If a refresh occurs, the row count is reset.
   * 
   * @param params a set of properties pertaining to the filter changes
   */
  refreshAfterFilter(params) {
    const serverFiltersAllLevels = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups();
    if (serverFiltersAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
      this.refreshStore(true);
      return;
    }
    this.forEachChildStoreShallow((store) => store.refreshAfterFilter(params));
  }
  /**
   * Marks all existing nodes as requiring reloaded, and triggers a load check
   *
   * @param purge whether to remove all nodes and data in favour of stub nodes
   */
  refreshStore(purge) {
    if (purge) {
      this.destroyBean(this.cache);
      this.cache = this.createManagedBean(new LazyCache(this, 1, this.storeParams));
      this.fireStoreUpdatedEvent();
      return;
    }
    this.cache.markNodesForRefresh();
  }
  /**
   * Used for pagination, given a local/store index, returns the display index of that row
   * 
   * @param topLevelIndex the store index of a row
   * @returns the display index for the given store index
   */
  getTopLevelRowDisplayedIndex(topLevelIndex) {
    const displayIndex = this.cache.getDisplayIndexFromStoreIndex(topLevelIndex);
    return displayIndex != null ? displayIndex : topLevelIndex;
  }
  /**
   * Used for pagination to determine if the last page is known, and for aria to determine if the last grid row is known
   * 
   * @returns whether the last index of this store is known, or if lazy loading still required
   */
  isLastRowIndexKnown() {
    return this.cache.isLastRowIndexKnown();
  }
  /**
   * Used by the selection service to select a range of nodes
   * 
   * @param firstInRange the first node in the range to find
   * @param lastInRange the last node in the range to find
   * @returns a range of nodes between firstInRange and lastInRange inclusive
   */
  getRowNodesInRange(firstInRange, lastInRange) {
    const result = [];
    let inActiveRange = false;
    if (_2.missing(firstInRange)) {
      inActiveRange = true;
    }
    return this.cache.getNodes().filter(({ node }) => {
      return node.rowIndex >= firstInRange.rowIndex && node.rowIndex <= lastInRange.rowIndex;
    }).map(({ node }) => node);
  }
  /**
   * Mutates a given array to add this stores state, and recursively add all the children store states.
   * 
   * @param result a mutable results array
   */
  addStoreStates(result) {
    result.push({
      suppressInfiniteScroll: false,
      route: this.parentRowNode.getGroupKeys(),
      rowCount: this.getRowCount(),
      lastRowIndexKnown: this.isLastRowIndexKnown(),
      info: this.info,
      maxBlocksInCache: this.storeParams.maxBlocksInCache,
      cacheBlockSize: this.storeParams.cacheBlockSize
    });
    this.forEachChildStoreShallow((childStore) => childStore.addStoreStates(result));
  }
  getIdSequence() {
    return this.idSequence;
  }
  getParentNode() {
    return this.parentRowNode;
  }
  getRowDetails() {
    return {
      field: this.groupField,
      group: this.group,
      leafGroup: this.leafGroup,
      level: this.level,
      parent: this.parentRowNode,
      rowGroupColumn: this.rowGroupColumn
    };
  }
  getSsrmParams() {
    return this.ssrmParams;
  }
  setStoreInfo(info) {
    if (info) {
      Object.assign(this.info, info);
    }
  }
  // gets called 1) row count changed 2) cache purged
  fireStoreUpdatedEvent() {
    const event = {
      type: Events2.EVENT_STORE_UPDATED
    };
    this.eventService.dispatchEvent(event);
  }
  // gets called when row data updated, and no more refreshing needed
  fireRefreshFinishedEvent() {
    const event = {
      type: Events2.EVENT_STORE_REFRESHED,
      route: this.parentRowNode.getRoute()
    };
    this.eventService.dispatchEvent(event);
  }
  getBlockStates() {
    return this.cache.getBlockStates();
  }
  getStoreBounds() {
    return {
      topPx: this.topPx,
      heightPx: this.heightPx
    };
  }
  getCache() {
    return this.cache;
  }
};
__decorateClass([
  Autowired4("ssrmBlockUtils")
], LazyStore.prototype, "blockUtils", 2);
__decorateClass([
  Autowired4("ssrmStoreUtils")
], LazyStore.prototype, "storeUtils", 2);
__decorateClass([
  Autowired4("columnModel")
], LazyStore.prototype, "columnModel", 2);
__decorateClass([
  Autowired4("selectionService")
], LazyStore.prototype, "selectionService", 2);
__decorateClass([
  PostConstruct4
], LazyStore.prototype, "init", 1);
__decorateClass([
  PreDestroy3
], LazyStore.prototype, "destroyRowNodes", 1);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/serverSideRowModel.ts
var ServerSideRowModel = class extends BeanStub4 {
  constructor() {
    super(...arguments);
    this.onRowHeightChanged_debounced = _3.debounce(this.onRowHeightChanged.bind(this), 100);
    this.pauseStoreUpdateListening = false;
    this.started = false;
    this.managingPivotResultColumns = false;
  }
  // we don't implement as lazy row heights is not supported in this row model
  ensureRowHeightsValid() {
    return false;
  }
  start() {
    this.started = true;
    this.updateDatasource();
  }
  destroyDatasource() {
    if (!this.datasource) {
      return;
    }
    if (this.datasource.destroy) {
      this.datasource.destroy();
    }
    this.rowRenderer.datasourceChanged();
    this.datasource = void 0;
  }
  addEventListeners() {
    this.addManagedListener(this.eventService, Events3.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
    this.addManagedListener(this.eventService, Events3.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));
    const resetListener = this.resetRootStore.bind(this);
    this.addManagedListener(this.eventService, Events3.EVENT_COLUMN_VALUE_CHANGED, resetListener);
    this.addManagedListener(this.eventService, Events3.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
    this.addManagedListener(this.eventService, Events3.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
    this.addManagedListener(this.eventService, Events3.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
    this.addManagedPropertyListeners([
      /**
       * Following properties omitted as they are likely to come with undesired  side effects.
       * 'getRowId', 'isRowMaster', 'getRowHeight', 'isServerSideGroup', 'getServerSideGroupKey',
       * */
      "masterDetail",
      "treeData",
      "removePivotHeaderRowWhenSingleValueColumn",
      "suppressServerSideInfiniteScroll",
      "cacheBlockSize"
    ], resetListener);
    this.addManagedPropertyListener("rowHeight", () => this.resetRowHeights());
    this.verifyProps();
    this.addManagedPropertyListener("serverSideDatasource", () => this.updateDatasource());
  }
  updateDatasource() {
    const datasource = this.gos.get("serverSideDatasource");
    if (datasource) {
      this.setDatasource(datasource);
    }
  }
  verifyProps() {
    if (this.gos.exists("initialGroupOrderComparator")) {
      _3.warnOnce(`initialGroupOrderComparator cannot be used with Server Side Row Model.`);
    }
    if (this.gos.isRowSelection() && !this.gos.exists("getRowId")) {
      _3.warnOnce(`getRowId callback must be provided for Server Side Row Model selection to work correctly.`);
    }
  }
  setDatasource(datasource) {
    if (!this.started) {
      return;
    }
    this.destroyDatasource();
    this.datasource = datasource;
    this.resetRootStore();
  }
  applyRowData(rowDataParams, startRow, route) {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return;
    }
    const storeToExecuteOn = rootStore.getChildStore(route);
    if (!storeToExecuteOn) {
      return;
    }
    ;
    if (storeToExecuteOn instanceof LazyStore) {
      storeToExecuteOn.applyRowData(rowDataParams, startRow, rowDataParams.rowData.length);
    } else if (storeToExecuteOn instanceof FullStore) {
      storeToExecuteOn.processServerResult(rowDataParams);
    }
  }
  isLastRowIndexKnown() {
    const cache = this.getRootStore();
    if (!cache) {
      return false;
    }
    return cache.isLastRowIndexKnown();
  }
  onColumnEverything() {
    if (!this.storeParams) {
      this.resetRootStore();
      return;
    }
    const rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
    const valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
    const pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
    const areColsSame = (params) => {
      const oldColsMap = {};
      params.oldCols.forEach((col) => oldColsMap[col.id] = col);
      const allColsUnchanged = params.newCols.every((col) => {
        const equivalentCol = oldColsMap[col.id];
        if (equivalentCol) {
          delete oldColsMap[col.id];
        }
        return equivalentCol && equivalentCol.field === col.field && equivalentCol.aggFunc === col.aggFunc;
      });
      const missingCols = !params.allowRemovedColumns && !!Object.values(oldColsMap).length;
      return allColsUnchanged && !missingCols;
    };
    const sortModelDifferent = !_3.jsonEquals(this.storeParams.sortModel, this.sortController.getSortModel());
    const rowGroupDifferent = !areColsSame({
      oldCols: this.storeParams.rowGroupCols,
      newCols: rowGroupColumnVos
    });
    const pivotDifferent = !areColsSame({
      oldCols: this.storeParams.pivotCols,
      newCols: pivotColumnVos
    });
    const valuesDifferent = !!(rowGroupColumnVos == null ? void 0 : rowGroupColumnVos.length) && !areColsSame({
      oldCols: this.storeParams.valueCols,
      newCols: valueColumnVos,
      allowRemovedColumns: true
    });
    const resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
    if (resetRequired) {
      this.resetRootStore();
    } else {
      const newParams = this.createStoreParams();
      this.storeParams.rowGroupCols = newParams.rowGroupCols;
      this.storeParams.pivotCols = newParams.pivotCols;
      this.storeParams.valueCols = newParams.valueCols;
    }
  }
  destroyRootStore() {
    if (!this.rootNode || !this.rootNode.childStore) {
      return;
    }
    this.rootNode.childStore = this.destroyBean(this.rootNode.childStore);
    this.nodeManager.clear();
  }
  refreshAfterSort(newSortModel, params) {
    if (this.storeParams) {
      this.storeParams.sortModel = newSortModel;
    }
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return;
    }
    rootStore.refreshAfterSort(params);
    this.onStoreUpdated();
  }
  generateSecondaryColumns(pivotFields) {
    if (!this.pivotColDefService) {
      ModuleRegistry.__assertRegistered(ModuleNames.RowGroupingModule, "pivotResultFields", this.context.getGridId());
      return;
    }
    const pivotColumnGroupDefs = this.pivotColDefService.createColDefsFromFields(pivotFields);
    this.managingPivotResultColumns = true;
    this.columnModel.setSecondaryColumns(pivotColumnGroupDefs, "rowModelUpdated");
  }
  resetRowHeights() {
    const atLeastOne = this.resetRowHeightsForAllRowNodes();
    const rootNodeHeight = this.gos.getRowHeightForNode(this.rootNode);
    this.rootNode.setRowHeight(rootNodeHeight.height, rootNodeHeight.estimated);
    if (this.rootNode.sibling) {
      const rootNodeSibling = this.gos.getRowHeightForNode(this.rootNode.sibling);
      this.rootNode.sibling.setRowHeight(rootNodeSibling.height, rootNodeSibling.estimated);
    }
    if (atLeastOne) {
      this.onRowHeightChanged();
    }
  }
  resetRowHeightsForAllRowNodes() {
    let atLeastOne = false;
    this.forEachNode((rowNode) => {
      const rowHeightForNode = this.gos.getRowHeightForNode(rowNode);
      rowNode.setRowHeight(rowHeightForNode.height, rowHeightForNode.estimated);
      const detailNode = rowNode.detailNode;
      if (detailNode) {
        const detailRowHeight = this.gos.getRowHeightForNode(detailNode);
        detailNode.setRowHeight(detailRowHeight.height, detailRowHeight.estimated);
      }
      if (rowNode.sibling) {
        const siblingRowHeight = this.gos.getRowHeightForNode(rowNode.sibling);
        detailNode.setRowHeight(siblingRowHeight.height, siblingRowHeight.estimated);
      }
      atLeastOne = true;
    });
    return atLeastOne;
  }
  resetRootStore() {
    this.destroyRootStore();
    this.rootNode = new RowNode5(this.beans);
    this.rootNode.group = true;
    this.rootNode.level = -1;
    if (this.datasource) {
      this.storeParams = this.createStoreParams();
      this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
      this.updateRowIndexesAndBounds();
    }
    if (this.managingPivotResultColumns) {
      this.columnModel.setSecondaryColumns(null, "api");
      this.managingPivotResultColumns = false;
    }
    this.dispatchModelUpdated(true);
  }
  columnsToValueObjects(columns) {
    return columns.map((col) => ({
      id: col.getId(),
      aggFunc: col.getAggFunc(),
      displayName: this.columnModel.getDisplayNameForColumn(col, "model"),
      field: col.getColDef().field
    }));
  }
  createStoreParams() {
    const rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
    const valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
    const pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
    const dynamicRowHeight = this.gos.isGetRowHeightFunction();
    const params = {
      // the columns the user has grouped and aggregated by
      valueCols: valueColumnVos,
      rowGroupCols: rowGroupColumnVos,
      pivotCols: pivotColumnVos,
      pivotMode: this.columnModel.isPivotMode(),
      // sort and filter model
      filterModel: this.filterManager.isAdvancedFilterEnabled() ? this.filterManager.getAdvancedFilterModel() : this.filterManager.getFilterModel(),
      sortModel: this.sortController.getSortModel(),
      datasource: this.datasource,
      lastAccessedSequence: new NumberSequence4(),
      // blockSize: blockSize == null ? 100 : blockSize,
      dynamicRowHeight
    };
    return params;
  }
  getParams() {
    return this.storeParams;
  }
  dispatchModelUpdated(reset = false) {
    const modelUpdatedEvent = {
      type: Events3.EVENT_MODEL_UPDATED,
      animate: !reset,
      keepRenderedRows: !reset,
      newPage: false,
      newData: false
    };
    this.eventService.dispatchEvent(modelUpdatedEvent);
  }
  onStoreUpdated() {
    if (this.pauseStoreUpdateListening) {
      return;
    }
    this.updateRowIndexesAndBounds();
    this.dispatchModelUpdated();
  }
  /** This method is debounced. It is used for row auto-height. If we don't debounce,
   * then the Row Models will end up recalculating each row position
   * for each row height change and result in the Row Renderer laying out rows.
   * This is particularly bad if using print layout, and showing eg 1,000 rows,
   * each row will change it's height, causing Row Model to update 1,000 times.
   */
  onRowHeightChangedDebounced() {
    this.onRowHeightChanged_debounced();
  }
  onRowHeightChanged() {
    this.updateRowIndexesAndBounds();
    this.dispatchModelUpdated();
  }
  updateRowIndexesAndBounds() {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return;
    }
    rootStore.setDisplayIndexes(new NumberSequence4(), { value: 0 });
  }
  retryLoads() {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return;
    }
    rootStore.retryLoads();
    this.onStoreUpdated();
  }
  getRow(index) {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return void 0;
    }
    return rootStore.getRowUsingDisplayIndex(index);
  }
  /**
   * Pauses the store, to prevent it updating the UI. This is used when doing batch updates to the store.
   */
  setPaused(paused) {
    this.pauseStoreUpdateListening = paused;
  }
  expandAll(value) {
    this.pauseStoreUpdateListening = true;
    this.forEachNode((node) => {
      if (node.stub) {
        return;
      }
      if (node.hasChildren()) {
        node.setExpanded(value);
      }
    });
    this.pauseStoreUpdateListening = false;
    this.onStoreUpdated();
  }
  refreshAfterFilter(newFilterModel, params) {
    if (this.storeParams) {
      this.storeParams.filterModel = newFilterModel;
    }
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return;
    }
    rootStore.refreshAfterFilter(params);
    this.onStoreUpdated();
  }
  getRootStore() {
    if (this.rootNode && this.rootNode.childStore) {
      return this.rootNode.childStore;
    }
  }
  getRowCount() {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return 0;
    }
    return rootStore.getDisplayIndexEnd();
  }
  getTopLevelRowCount() {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return 1;
    }
    return rootStore.getRowCount();
  }
  getTopLevelRowDisplayedIndex(topLevelIndex) {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return topLevelIndex;
    }
    return rootStore.getTopLevelRowDisplayedIndex(topLevelIndex);
  }
  getRowBounds(index) {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      const rowHeight = this.gos.getRowHeightAsNumber();
      return {
        rowTop: 0,
        rowHeight
      };
    }
    return rootStore.getRowBounds(index);
  }
  getBlockStates() {
    const root = this.getRootStore();
    if (!root) {
      return void 0;
    }
    const states = {};
    root.forEachStoreDeep((store) => {
      if (store instanceof FullStore) {
        const { id, state } = store.getBlockStateJson();
        states[id] = state;
      } else if (store instanceof LazyStore) {
        Object.entries(store.getBlockStates()).forEach(([block, state]) => {
          states[block] = state;
        });
      } else {
        throw new Error("AG Grid: Unsupported store type");
      }
    });
    return states;
  }
  getRowIndexAtPixel(pixel) {
    const rootStore = this.getRootStore();
    if (pixel <= 0 || !rootStore) {
      return 0;
    }
    return rootStore.getRowIndexAtPixel(pixel);
  }
  isEmpty() {
    return false;
  }
  isRowsToRender() {
    return this.getRootStore() != null && this.getRowCount() > 0;
  }
  getType() {
    return "serverSide";
  }
  forEachNode(callback) {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return;
    }
    rootStore.forEachNodeDeep(callback);
  }
  forEachNodeAfterFilterAndSort(callback, includeFooterNodes = false) {
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return;
    }
    rootStore.forEachNodeDeepAfterFilterAndSort(callback, void 0, includeFooterNodes);
  }
  /** @return false if store hasn't started */
  executeOnStore(route, callback) {
    if (!this.started) {
      return false;
    }
    const rootStore = this.getRootStore();
    if (!rootStore) {
      return true;
    }
    const storeToExecuteOn = rootStore.getChildStore(route);
    if (storeToExecuteOn) {
      callback(storeToExecuteOn);
    }
    return true;
  }
  refreshStore(params = {}) {
    const route = params.route ? params.route : [];
    this.executeOnStore(route, (store) => store.refreshStore(params.purge == true));
  }
  getStoreState() {
    const res = [];
    const rootStore = this.getRootStore();
    if (rootStore) {
      rootStore.addStoreStates(res);
    }
    return res;
  }
  getNodesInRangeForSelection(firstInRange, lastInRange) {
    if (!_3.exists(firstInRange)) {
      return [];
    }
    if (!lastInRange) {
      return [firstInRange];
    }
    const startIndex = firstInRange.rowIndex;
    const endIndex = lastInRange.rowIndex;
    if (startIndex === null || endIndex === null) {
      return [firstInRange];
    }
    const nodeRange = [];
    const [firstIndex, lastIndex] = [startIndex, endIndex].sort((a, b) => a - b);
    this.forEachNode((node) => {
      const thisRowIndex = node.rowIndex;
      if (thisRowIndex == null || node.stub) {
        return;
      }
      if (thisRowIndex >= firstIndex && thisRowIndex <= lastIndex) {
        nodeRange.push(node);
      }
    });
    if (nodeRange.length !== lastIndex - firstIndex + 1) {
      return [firstInRange];
    }
    return nodeRange;
  }
  getRowNode(id) {
    let result;
    this.forEachNode((rowNode) => {
      if (rowNode.id === id) {
        result = rowNode;
      }
      if (rowNode.detailNode && rowNode.detailNode.id === id) {
        result = rowNode.detailNode;
      }
    });
    return result;
  }
  isRowPresent(rowNode) {
    const foundRowNode = this.getRowNode(rowNode.id);
    return !!foundRowNode;
  }
  setRowCount(rowCount, lastRowIndexKnown) {
    const rootStore = this.getRootStore();
    if (rootStore) {
      if (rootStore instanceof LazyStore) {
        rootStore.setRowCount(rowCount, lastRowIndexKnown);
        return;
      }
      console.error("AG Grid: Infinite scrolling must be enabled in order to set the row count.");
    }
  }
};
__decorateClass([
  Autowired5("columnModel")
], ServerSideRowModel.prototype, "columnModel", 2);
__decorateClass([
  Autowired5("filterManager")
], ServerSideRowModel.prototype, "filterManager", 2);
__decorateClass([
  Autowired5("sortController")
], ServerSideRowModel.prototype, "sortController", 2);
__decorateClass([
  Autowired5("rowRenderer")
], ServerSideRowModel.prototype, "rowRenderer", 2);
__decorateClass([
  Autowired5("ssrmNodeManager")
], ServerSideRowModel.prototype, "nodeManager", 2);
__decorateClass([
  Autowired5("ssrmStoreFactory")
], ServerSideRowModel.prototype, "storeFactory", 2);
__decorateClass([
  Autowired5("beans")
], ServerSideRowModel.prototype, "beans", 2);
__decorateClass([
  Optional("pivotColDefService")
], ServerSideRowModel.prototype, "pivotColDefService", 2);
__decorateClass([
  PreDestroy4
], ServerSideRowModel.prototype, "destroyDatasource", 1);
__decorateClass([
  PostConstruct5
], ServerSideRowModel.prototype, "addEventListeners", 1);
__decorateClass([
  PreDestroy4
], ServerSideRowModel.prototype, "destroyRootStore", 1);
ServerSideRowModel = __decorateClass([
  Bean2("rowModel")
], ServerSideRowModel);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/storeUtils.ts
import {
  _ as _4,
  Autowired as Autowired6,
  Bean as Bean3,
  BeanStub as BeanStub5
} from "@ag-grid-community/core";
var StoreUtils = class extends BeanStub5 {
  loadFromDatasource(p) {
    const { storeParams, parentBlock, parentNode } = p;
    const groupKeys = parentNode.getGroupKeys();
    if (!storeParams.datasource) {
      return;
    }
    const request = {
      startRow: p.startRow,
      endRow: p.endRow,
      rowGroupCols: storeParams.rowGroupCols,
      valueCols: storeParams.valueCols,
      pivotCols: storeParams.pivotCols,
      pivotMode: storeParams.pivotMode,
      groupKeys,
      filterModel: storeParams.filterModel,
      sortModel: storeParams.sortModel
    };
    const getRowsParams = this.gos.addGridCommonParams({
      success: p.success,
      fail: p.fail,
      request,
      parentNode: p.parentNode
    });
    window.setTimeout(() => {
      if (!storeParams.datasource || !parentBlock.isAlive()) {
        p.fail();
        return;
      }
      storeParams.datasource.getRows(getRowsParams);
    }, 0);
  }
  getChildStore(keys, currentCache, findNodeFunc) {
    if (_4.missingOrEmpty(keys)) {
      return currentCache;
    }
    const nextKey = keys[0];
    const nextNode = findNodeFunc(nextKey);
    if (nextNode) {
      if (keys.length === 1 && !nextNode.childStore) {
        const storeParams = this.serverSideRowModel.getParams();
        nextNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, nextNode));
      }
      const keyListForNextLevel = keys.slice(1, keys.length);
      const nextStore = nextNode.childStore;
      return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
    }
    return null;
  }
  isServerRefreshNeeded(parentRowNode, rowGroupCols, params) {
    if (params.valueColChanged || params.secondaryColChanged) {
      return true;
    }
    const level = parentRowNode.level + 1;
    const grouping = level < rowGroupCols.length;
    const leafNodes = !grouping;
    if (leafNodes) {
      return true;
    }
    const colIdThisGroup = rowGroupCols[level].id;
    const actionOnThisGroup = params.changedColumns.indexOf(colIdThisGroup) > -1;
    if (actionOnThisGroup) {
      return true;
    }
    const allCols = this.columnModel.getAllGridColumns();
    const affectedGroupCols = allCols.filter((col) => col.getColDef().showRowGroup && params.changedColumns.includes(col.getId())).map((col) => col.getColDef().showRowGroup).some((group) => group === true || group === colIdThisGroup);
    return affectedGroupCols;
  }
  getServerSideInitialRowCount() {
    return this.gos.get("serverSideInitialRowCount");
  }
  assertRowModelIsServerSide(key) {
    if (!this.gos.isRowModelType("serverSide")) {
      _4.warnOnce(`The '${key}' property can only be used with the Server Side Row Model.`);
      return false;
    }
    return true;
  }
  assertNotTreeData(key) {
    if (this.gos.get("treeData")) {
      _4.warnOnce(`The '${key}' property cannot be used while using tree data.`);
      return false;
    }
    return true;
  }
  isServerSideSortAllLevels() {
    return this.gos.get("serverSideSortAllLevels") && this.assertRowModelIsServerSide("serverSideSortAllLevels");
  }
  isServerSideOnlyRefreshFilteredGroups() {
    return this.gos.get("serverSideOnlyRefreshFilteredGroups") && this.assertRowModelIsServerSide("serverSideOnlyRefreshFilteredGroups");
  }
  isServerSideSortOnServer() {
    return this.gos.get("serverSideSortOnServer") && this.assertRowModelIsServerSide("serverSideSortOnServer") && this.assertNotTreeData("serverSideSortOnServer");
  }
  isServerSideFilterOnServer() {
    return this.gos.get("serverSideFilterOnServer") && this.assertRowModelIsServerSide("serverSideFilterOnServer") && this.assertNotTreeData("serverSideFilterOnServer");
  }
};
__decorateClass([
  Autowired6("columnModel")
], StoreUtils.prototype, "columnModel", 2);
__decorateClass([
  Autowired6("rowModel")
], StoreUtils.prototype, "serverSideRowModel", 2);
__decorateClass([
  Autowired6("ssrmStoreFactory")
], StoreUtils.prototype, "storeFactory", 2);
StoreUtils = __decorateClass([
  Bean3("ssrmStoreUtils")
], StoreUtils);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/blocks/blockUtils.ts
import {
  _ as _5,
  Autowired as Autowired7,
  Bean as Bean4,
  BeanStub as BeanStub6,
  RowNode as RowNode7
} from "@ag-grid-community/core";
var GROUP_MISSING_KEY_ID = "ag-Grid-MissingKey";
var BlockUtils = class extends BeanStub6 {
  createRowNode(params) {
    const rowNode = new RowNode7(this.beans);
    const rowHeight = params.rowHeight != null ? params.rowHeight : this.gos.getRowHeightAsNumber();
    rowNode.setRowHeight(rowHeight);
    rowNode.group = params.group;
    rowNode.leafGroup = params.leafGroup;
    rowNode.level = params.level;
    rowNode.uiLevel = params.level;
    rowNode.parent = params.parent;
    rowNode.stub = true;
    rowNode.__needsRefreshWhenVisible = false;
    if (rowNode.group) {
      rowNode.expanded = false;
      rowNode.field = params.field;
      rowNode.rowGroupColumn = params.rowGroupColumn;
    }
    return rowNode;
  }
  destroyRowNodes(rowNodes) {
    if (rowNodes) {
      rowNodes.forEach((row) => this.destroyRowNode(row));
    }
  }
  destroyRowNode(rowNode, preserveStore = false) {
    if (rowNode.childStore && !preserveStore) {
      this.destroyBean(rowNode.childStore);
      rowNode.childStore = null;
    }
    if (rowNode.sibling && !rowNode.footer) {
      this.destroyRowNode(rowNode.sibling, false);
    }
    rowNode.clearRowTopAndRowIndex();
    if (rowNode.id != null) {
      this.nodeManager.removeNode(rowNode);
    }
  }
  setTreeGroupInfo(rowNode) {
    rowNode.updateHasChildren();
    const getKeyFunc = this.gos.get("getServerSideGroupKey");
    if (rowNode.hasChildren() && getKeyFunc != null) {
      rowNode.key = getKeyFunc(rowNode.data);
    }
    if (!rowNode.hasChildren() && rowNode.childStore != null) {
      this.destroyBean(rowNode.childStore);
      rowNode.childStore = null;
      rowNode.expanded = false;
    }
  }
  setRowGroupInfo(rowNode) {
    rowNode.key = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
    if (rowNode.key === null || rowNode.key === void 0) {
      _5.doOnce(() => {
        console.warn(`AG Grid: null and undefined values are not allowed for server side row model keys`);
        if (rowNode.rowGroupColumn) {
          console.warn(`column = ${rowNode.rowGroupColumn.getId()}`);
        }
        console.warn(`data is `, rowNode.data);
      }, "ServerSideBlock-CannotHaveNullOrUndefinedForKey");
    }
    const getGroupIncludeFooter = this.beans.gos.getGroupTotalRowCallback();
    const doesRowShowFooter = getGroupIncludeFooter({ node: rowNode });
    if (doesRowShowFooter) {
      rowNode.createFooter();
      if (rowNode.sibling) {
        rowNode.sibling.uiLevel = rowNode.uiLevel + 1;
      }
    }
  }
  setMasterDetailInfo(rowNode) {
    const isMasterFunc = this.gos.get("isRowMaster");
    if (isMasterFunc != null) {
      rowNode.master = isMasterFunc(rowNode.data);
    } else {
      rowNode.master = true;
    }
  }
  updateDataIntoRowNode(rowNode, data) {
    rowNode.updateData(data);
    if (this.gos.get("treeData")) {
      this.setTreeGroupInfo(rowNode);
      this.setChildCountIntoRowNode(rowNode);
    } else if (rowNode.group) {
      this.setChildCountIntoRowNode(rowNode);
      if (!rowNode.footer) {
        const getGroupIncludeFooter = this.beans.gos.getGroupTotalRowCallback();
        const doesRowShowFooter = getGroupIncludeFooter({ node: rowNode });
        if (doesRowShowFooter) {
          if (rowNode.sibling) {
            rowNode.sibling.updateData(data);
          } else {
            rowNode.createFooter();
          }
        } else if (rowNode.sibling) {
          rowNode.destroyFooter();
        }
      }
    } else if (this.gos.get("masterDetail")) {
    }
  }
  setDataIntoRowNode(rowNode, data, defaultId, cachedRowHeight) {
    var _a;
    rowNode.stub = false;
    const treeData = this.gos.get("treeData");
    if (_5.exists(data)) {
      rowNode.setDataAndId(data, defaultId);
      if (treeData) {
        this.setTreeGroupInfo(rowNode);
      } else if (rowNode.group) {
        this.setRowGroupInfo(rowNode);
      } else if (this.gos.get("masterDetail")) {
        this.setMasterDetailInfo(rowNode);
      }
    } else {
      rowNode.setDataAndId(void 0, void 0);
      rowNode.key = null;
    }
    if (treeData || rowNode.group) {
      this.setGroupDataIntoRowNode(rowNode);
      this.setChildCountIntoRowNode(rowNode);
    }
    if (_5.exists(data)) {
      rowNode.setRowHeight(this.gos.getRowHeightForNode(rowNode, false, cachedRowHeight).height);
      (_a = rowNode.sibling) == null ? void 0 : _a.setRowHeight(this.gos.getRowHeightForNode(rowNode.sibling, false, cachedRowHeight).height);
    }
  }
  setChildCountIntoRowNode(rowNode) {
    const getChildCount = this.gos.get("getChildCount");
    if (getChildCount) {
      rowNode.setAllChildrenCount(getChildCount(rowNode.data));
    }
  }
  setGroupDataIntoRowNode(rowNode) {
    const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
    const usingTreeData = this.gos.get("treeData");
    groupDisplayCols.forEach((col) => {
      if (rowNode.groupData == null) {
        rowNode.groupData = {};
      }
      if (usingTreeData) {
        rowNode.groupData[col.getColId()] = rowNode.key;
      } else if (col.isRowGroupDisplayed(rowNode.rowGroupColumn.getId())) {
        const groupValue = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
        rowNode.groupData[col.getColId()] = groupValue;
      }
    });
  }
  clearDisplayIndex(rowNode) {
    rowNode.clearRowTopAndRowIndex();
    const hasChildStore = rowNode.hasChildren() && _5.exists(rowNode.childStore);
    if (hasChildStore) {
      const childStore = rowNode.childStore;
      childStore.clearDisplayIndexes();
    }
    const hasDetailNode = rowNode.master && rowNode.detailNode;
    if (hasDetailNode) {
      rowNode.detailNode.clearRowTopAndRowIndex();
    }
  }
  setDisplayIndex(rowNode, displayIndexSeq, nextRowTop) {
    rowNode.setRowIndex(displayIndexSeq.next());
    rowNode.setRowTop(nextRowTop.value);
    nextRowTop.value += rowNode.rowHeight;
    if (rowNode.footer) {
      return;
    }
    const hasDetailRow = rowNode.master;
    if (hasDetailRow) {
      if (rowNode.expanded && rowNode.detailNode) {
        rowNode.detailNode.setRowIndex(displayIndexSeq.next());
        rowNode.detailNode.setRowTop(nextRowTop.value);
        nextRowTop.value += rowNode.detailNode.rowHeight;
      } else if (rowNode.detailNode) {
        rowNode.detailNode.clearRowTopAndRowIndex();
      }
    }
    const hasChildStore = rowNode.hasChildren() && _5.exists(rowNode.childStore);
    if (hasChildStore) {
      const childStore = rowNode.childStore;
      if (rowNode.expanded) {
        childStore.setDisplayIndexes(displayIndexSeq, nextRowTop);
      } else {
        childStore.clearDisplayIndexes();
      }
    }
  }
  binarySearchForDisplayIndex(displayRowIndex, rowNodes) {
    let bottomPointer = 0;
    let topPointer = rowNodes.length - 1;
    if (_5.missing(topPointer) || _5.missing(bottomPointer)) {
      console.warn(`AG Grid: error: topPointer = ${topPointer}, bottomPointer = ${bottomPointer}`);
      return void 0;
    }
    while (true) {
      const midPointer = Math.floor((bottomPointer + topPointer) / 2);
      const currentRowNode = rowNodes[midPointer];
      if (currentRowNode.rowIndex === displayRowIndex) {
        return currentRowNode;
      }
      const expandedMasterRow = currentRowNode.master && currentRowNode.expanded;
      const detailNode = currentRowNode.detailNode;
      if (expandedMasterRow && detailNode && detailNode.rowIndex === displayRowIndex) {
        return currentRowNode.detailNode;
      }
      const childStore = currentRowNode.childStore;
      if (currentRowNode.expanded && childStore && childStore.isDisplayIndexInStore(displayRowIndex)) {
        return childStore.getRowUsingDisplayIndex(displayRowIndex);
      }
      if (currentRowNode.rowIndex < displayRowIndex) {
        bottomPointer = midPointer + 1;
      } else if (currentRowNode.rowIndex > displayRowIndex) {
        topPointer = midPointer - 1;
      } else {
        console.warn(`AG Grid: error: unable to locate rowIndex = ${displayRowIndex} in cache`);
        return void 0;
      }
    }
  }
  extractRowBounds(rowNode, index) {
    const extractRowBounds = (currentRowNode) => ({
      rowHeight: currentRowNode.rowHeight,
      rowTop: currentRowNode.rowTop
    });
    if (rowNode.rowIndex === index) {
      return extractRowBounds(rowNode);
    }
    if (rowNode.hasChildren() && rowNode.expanded && _5.exists(rowNode.childStore)) {
      const childStore = rowNode.childStore;
      if (childStore.isDisplayIndexInStore(index)) {
        return childStore.getRowBounds(index);
      }
    } else if (rowNode.master && rowNode.expanded && _5.exists(rowNode.detailNode)) {
      if (rowNode.detailNode.rowIndex === index) {
        return extractRowBounds(rowNode.detailNode);
      }
    }
  }
  getIndexAtPixel(rowNode, pixel) {
    if (rowNode.isPixelInRange(pixel)) {
      return rowNode.rowIndex;
    }
    const expandedMasterRow = rowNode.master && rowNode.expanded;
    const detailNode = rowNode.detailNode;
    if (expandedMasterRow && detailNode && detailNode.isPixelInRange(pixel)) {
      return rowNode.detailNode.rowIndex;
    }
    if (rowNode.hasChildren() && rowNode.expanded && _5.exists(rowNode.childStore)) {
      const childStore = rowNode.childStore;
      if (childStore.isPixelInRange(pixel)) {
        return childStore.getRowIndexAtPixel(pixel);
      }
    }
    return null;
  }
  createNodeIdPrefix(parentRowNode) {
    const parts = [];
    let rowNode = parentRowNode;
    while (rowNode && rowNode.level >= 0) {
      if (rowNode.key === "") {
        parts.push(GROUP_MISSING_KEY_ID);
      } else {
        parts.push(rowNode.key);
      }
      rowNode = rowNode.parent;
    }
    if (parts.length > 0) {
      return parts.reverse().join("-");
    }
    return void 0;
  }
  checkOpenByDefault(rowNode) {
    return this.expansionService.checkOpenByDefault(rowNode);
  }
};
__decorateClass([
  Autowired7("valueService")
], BlockUtils.prototype, "valueService", 2);
__decorateClass([
  Autowired7("columnModel")
], BlockUtils.prototype, "columnModel", 2);
__decorateClass([
  Autowired7("ssrmNodeManager")
], BlockUtils.prototype, "nodeManager", 2);
__decorateClass([
  Autowired7("beans")
], BlockUtils.prototype, "beans", 2);
__decorateClass([
  Autowired7("expansionService")
], BlockUtils.prototype, "expansionService", 2);
BlockUtils = __decorateClass([
  Bean4("ssrmBlockUtils")
], BlockUtils);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/nodeManager.ts
import { Bean as Bean5, PreDestroy as PreDestroy5 } from "@ag-grid-community/core";
var NodeManager = class {
  constructor() {
    this.rowNodes = {};
  }
  addRowNode(rowNode) {
    const id = rowNode.id;
    if (this.rowNodes[id]) {
      console.warn(`AG Grid: Duplicate node id ${rowNode.id}. Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values.`);
      console.warn("first instance", this.rowNodes[id].data);
      console.warn("second instance", rowNode.data);
    }
    this.rowNodes[id] = rowNode;
  }
  removeNode(rowNode) {
    const id = rowNode.id;
    if (this.rowNodes[id]) {
      this.rowNodes[id] = void 0;
    }
  }
  clear() {
    this.rowNodes = {};
  }
};
__decorateClass([
  PreDestroy5
], NodeManager.prototype, "clear", 1);
NodeManager = __decorateClass([
  Bean5("ssrmNodeManager")
], NodeManager);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/transactionManager.ts
import {
  Autowired as Autowired8,
  Bean as Bean6,
  BeanStub as BeanStub7,
  Events as Events4,
  PostConstruct as PostConstruct7,
  ServerSideTransactionResultStatus as ServerSideTransactionResultStatus3
} from "@ag-grid-community/core";
var TransactionManager = class extends BeanStub7 {
  constructor() {
    super(...arguments);
    this.asyncTransactions = [];
  }
  postConstruct() {
    if (!this.gos.isRowModelType("serverSide")) {
      return;
    }
  }
  applyTransactionAsync(transaction, callback) {
    if (this.asyncTransactionsTimeout == null) {
      this.scheduleExecuteAsync();
    }
    this.asyncTransactions.push({ transaction, callback });
  }
  scheduleExecuteAsync() {
    const waitMillis = this.gos.getAsyncTransactionWaitMillis();
    this.asyncTransactionsTimeout = window.setTimeout(() => {
      this.executeAsyncTransactions();
    }, waitMillis);
  }
  executeAsyncTransactions() {
    if (!this.asyncTransactions) {
      return;
    }
    const resultFuncs = [];
    const resultsForEvent = [];
    const transactionsToRetry = [];
    let atLeastOneTransactionApplied = false;
    this.asyncTransactions.forEach((txWrapper) => {
      let result;
      const hasStarted = this.serverSideRowModel.executeOnStore(txWrapper.transaction.route, (cache) => {
        result = cache.applyTransaction(txWrapper.transaction);
      });
      if (!hasStarted) {
        result = { status: ServerSideTransactionResultStatus3.StoreNotStarted };
      } else if (result == void 0) {
        result = { status: ServerSideTransactionResultStatus3.StoreNotFound };
      }
      resultsForEvent.push(result);
      const retryTransaction = result.status == ServerSideTransactionResultStatus3.StoreLoading;
      if (retryTransaction) {
        transactionsToRetry.push(txWrapper);
        return;
      }
      if (txWrapper.callback) {
        resultFuncs.push(() => txWrapper.callback(result));
      }
      if (result.status === ServerSideTransactionResultStatus3.Applied) {
        atLeastOneTransactionApplied = true;
      }
    });
    if (resultFuncs.length > 0) {
      window.setTimeout(() => {
        resultFuncs.forEach((func) => func());
      }, 0);
    }
    this.asyncTransactionsTimeout = void 0;
    this.asyncTransactions = transactionsToRetry;
    if (atLeastOneTransactionApplied) {
      this.valueCache.onDataChanged();
      this.eventService.dispatchEvent({ type: Events4.EVENT_STORE_UPDATED });
    }
    if (resultsForEvent.length > 0) {
      const event = {
        type: Events4.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
        results: resultsForEvent
      };
      this.eventService.dispatchEvent(event);
    }
  }
  flushAsyncTransactions() {
    if (this.asyncTransactionsTimeout != null) {
      clearTimeout(this.asyncTransactionsTimeout);
    }
    this.executeAsyncTransactions();
  }
  applyTransaction(transaction) {
    let res;
    const hasStarted = this.serverSideRowModel.executeOnStore(transaction.route, (store) => {
      res = store.applyTransaction(transaction);
    });
    if (!hasStarted) {
      return { status: ServerSideTransactionResultStatus3.StoreNotStarted };
    } else if (res) {
      this.valueCache.onDataChanged();
      if (res.remove) {
        const removedRowIds = res.remove.map((row) => row.id);
        this.selectionService.deleteSelectionStateFromParent(transaction.route || [], removedRowIds);
      }
      this.eventService.dispatchEvent({ type: Events4.EVENT_STORE_UPDATED });
      return res;
    } else {
      return { status: ServerSideTransactionResultStatus3.StoreNotFound };
    }
  }
};
__decorateClass([
  Autowired8("rowNodeBlockLoader")
], TransactionManager.prototype, "rowNodeBlockLoader", 2);
__decorateClass([
  Autowired8("valueCache")
], TransactionManager.prototype, "valueCache", 2);
__decorateClass([
  Autowired8("rowModel")
], TransactionManager.prototype, "serverSideRowModel", 2);
__decorateClass([
  Autowired8("rowRenderer")
], TransactionManager.prototype, "rowRenderer", 2);
__decorateClass([
  Autowired8("selectionService")
], TransactionManager.prototype, "selectionService", 2);
__decorateClass([
  PostConstruct7
], TransactionManager.prototype, "postConstruct", 1);
TransactionManager = __decorateClass([
  Bean6("ssrmTransactionManager")
], TransactionManager);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/listeners/expandListener.ts
import {
  _ as _6,
  Autowired as Autowired9,
  BeanStub as BeanStub8,
  Events as Events5,
  PostConstruct as PostConstruct8,
  RowNode as RowNode10,
  Bean as Bean7
} from "@ag-grid-community/core";
var ExpandListener = class extends BeanStub8 {
  postConstruct() {
    if (!this.gos.isRowModelType("serverSide")) {
      return;
    }
    this.addManagedListener(this.eventService, Events5.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
  }
  onRowGroupOpened(event) {
    const rowNode = event.node;
    if (rowNode.expanded) {
      if (rowNode.master) {
        this.createDetailNode(rowNode);
      } else if (_6.missing(rowNode.childStore)) {
        const storeParams = this.serverSideRowModel.getParams();
        rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
      }
    } else if (this.gos.get("purgeClosedRowNodes") && _6.exists(rowNode.childStore)) {
      rowNode.childStore = this.destroyBean(rowNode.childStore);
    }
    const storeUpdatedEvent = { type: Events5.EVENT_STORE_UPDATED };
    this.eventService.dispatchEvent(storeUpdatedEvent);
  }
  createDetailNode(masterNode) {
    if (_6.exists(masterNode.detailNode)) {
      return masterNode.detailNode;
    }
    const detailNode = new RowNode10(this.beans);
    detailNode.detail = true;
    detailNode.selectable = false;
    detailNode.parent = masterNode;
    if (_6.exists(masterNode.id)) {
      detailNode.id = "detail_" + masterNode.id;
    }
    detailNode.data = masterNode.data;
    detailNode.level = masterNode.level + 1;
    const defaultDetailRowHeight = 200;
    const rowHeight = this.gos.getRowHeightForNode(detailNode).height;
    detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
    masterNode.detailNode = detailNode;
    return detailNode;
  }
};
__decorateClass([
  Autowired9("rowModel")
], ExpandListener.prototype, "serverSideRowModel", 2);
__decorateClass([
  Autowired9("ssrmStoreFactory")
], ExpandListener.prototype, "storeFactory", 2);
__decorateClass([
  Autowired9("beans")
], ExpandListener.prototype, "beans", 2);
__decorateClass([
  PostConstruct8
], ExpandListener.prototype, "postConstruct", 1);
ExpandListener = __decorateClass([
  Bean7("ssrmExpandListener")
], ExpandListener);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/listeners/sortListener.ts
import {
  Autowired as Autowired10,
  Bean as Bean8,
  BeanStub as BeanStub9,
  Events as Events6,
  PostConstruct as PostConstruct9
} from "@ag-grid-community/core";
var SortListener = class extends BeanStub9 {
  postConstruct() {
    if (!this.gos.isRowModelType("serverSide")) {
      return;
    }
    this.addManagedListener(this.eventService, Events6.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
  }
  onSortChanged() {
    const storeParams = this.serverSideRowModel.getParams();
    if (!storeParams) {
      return;
    }
    const newSortModel = this.sortController.getSortModel();
    const oldSortModel = storeParams.sortModel;
    const changedColumns = this.findChangedColumnsInSort(newSortModel, oldSortModel);
    const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
    const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
    const params = {
      valueColChanged,
      secondaryColChanged,
      changedColumns
    };
    this.serverSideRowModel.refreshAfterSort(newSortModel, params);
  }
  // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
  // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
  // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
  // was previously sorted by A and then the A sort now needs to be cleared.
  findChangedColumnsInSort(newSortModel, oldSortModel) {
    let allColsInBothSorts = [];
    [newSortModel, oldSortModel].forEach((sortModel) => {
      if (sortModel) {
        const ids = sortModel.map((sm) => sm.colId);
        allColsInBothSorts = allColsInBothSorts.concat(ids);
      }
    });
    const differentSorts = (oldSortItem, newSortItem) => {
      const oldSort = oldSortItem ? oldSortItem.sort : null;
      const newSort = newSortItem ? newSortItem.sort : null;
      return oldSort !== newSort;
    };
    const differentIndexes = (oldSortItem, newSortItem) => {
      const oldIndex = oldSortItem ? oldSortModel.indexOf(oldSortItem) : -1;
      const newIndex = newSortItem ? newSortModel.indexOf(newSortItem) : -1;
      return oldIndex !== newIndex;
    };
    return allColsInBothSorts.filter((colId) => {
      const oldSortItem = oldSortModel.find((sm) => sm.colId === colId);
      const newSortItem = newSortModel.find((sm) => sm.colId === colId);
      return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
    });
  }
};
__decorateClass([
  Autowired10("sortController")
], SortListener.prototype, "sortController", 2);
__decorateClass([
  Autowired10("rowModel")
], SortListener.prototype, "serverSideRowModel", 2);
__decorateClass([
  Autowired10("ssrmListenerUtils")
], SortListener.prototype, "listenerUtils", 2);
__decorateClass([
  PostConstruct9
], SortListener.prototype, "postConstruct", 1);
SortListener = __decorateClass([
  Bean8("ssrmSortService")
], SortListener);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/listeners/filterListener.ts
import {
  Autowired as Autowired11,
  Bean as Bean9,
  BeanStub as BeanStub10,
  Events as Events7,
  PostConstruct as PostConstruct10
} from "@ag-grid-community/core";
var FilterListener = class extends BeanStub10 {
  postConstruct() {
    if (!this.gos.isRowModelType("serverSide")) {
      return;
    }
    this.addManagedListener(this.eventService, Events7.EVENT_ADVANCED_FILTER_ENABLED_CHANGED, () => this.onFilterChanged(true));
    this.addManagedListener(this.eventService, Events7.EVENT_FILTER_CHANGED, () => this.onFilterChanged());
  }
  onFilterChanged(advancedFilterEnabledChanged) {
    const storeParams = this.serverSideRowModel.getParams();
    if (!storeParams) {
      return;
    }
    const oldModel = storeParams.filterModel;
    let newModel;
    let changedColumns;
    if (this.filterManager.isAdvancedFilterEnabled()) {
      newModel = this.filterManager.getAdvancedFilterModel();
      const oldColumns = advancedFilterEnabledChanged ? Object.keys(oldModel != null ? oldModel : {}) : this.getAdvancedFilterColumns(oldModel);
      const newColumns = this.getAdvancedFilterColumns(newModel);
      oldColumns.forEach((column) => newColumns.add(column));
      changedColumns = Array.from(newColumns);
    } else {
      newModel = this.filterManager.getFilterModel();
      if (advancedFilterEnabledChanged) {
        const oldColumns = this.getAdvancedFilterColumns(oldModel);
        Object.keys(newModel).forEach((column) => oldColumns.add(column));
        changedColumns = Array.from(oldColumns);
      } else {
        changedColumns = this.findChangedColumns(oldModel, newModel);
      }
    }
    const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
    const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
    const params = {
      valueColChanged,
      secondaryColChanged,
      changedColumns
    };
    this.serverSideRowModel.refreshAfterFilter(newModel, params);
  }
  findChangedColumns(oldModel, newModel) {
    const allColKeysMap = {};
    Object.keys(oldModel).forEach((key) => allColKeysMap[key] = true);
    Object.keys(newModel).forEach((key) => allColKeysMap[key] = true);
    const res = [];
    Object.keys(allColKeysMap).forEach((key) => {
      const oldJson = JSON.stringify(oldModel[key]);
      const newJson = JSON.stringify(newModel[key]);
      const filterChanged = oldJson != newJson;
      if (filterChanged) {
        res.push(key);
      }
    });
    return res;
  }
  getAdvancedFilterColumns(model) {
    const columns = /* @__PURE__ */ new Set();
    if (!model) {
      return columns;
    }
    const processAdvancedFilterModel = (filterModel) => {
      if (filterModel.filterType === "join") {
        filterModel.conditions.forEach((condition) => processAdvancedFilterModel(condition));
      } else {
        columns.add(filterModel.colId);
      }
    };
    processAdvancedFilterModel(model);
    return columns;
  }
};
__decorateClass([
  Autowired11("rowModel")
], FilterListener.prototype, "serverSideRowModel", 2);
__decorateClass([
  Autowired11("filterManager")
], FilterListener.prototype, "filterManager", 2);
__decorateClass([
  Autowired11("ssrmListenerUtils")
], FilterListener.prototype, "listenerUtils", 2);
__decorateClass([
  PostConstruct10
], FilterListener.prototype, "postConstruct", 1);
FilterListener = __decorateClass([
  Bean9("ssrmFilterListener")
], FilterListener);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/stores/storeFactory.ts
import {
  _ as _8,
  Autowired as Autowired12,
  Bean as Bean10
} from "@ag-grid-community/core";
var StoreFactory = class {
  createStore(ssrmParams, parentNode) {
    const storeParams = this.getStoreParams(ssrmParams, parentNode);
    const CacheClass = storeParams.suppressInfiniteScroll ? FullStore : LazyStore;
    return new CacheClass(ssrmParams, storeParams, parentNode);
  }
  getStoreParams(ssrmParams, parentNode) {
    const userStoreParams = this.getLevelSpecificParams(parentNode);
    const infiniteScroll = this.isInfiniteScroll(userStoreParams);
    const cacheBlockSize = this.getBlockSize(infiniteScroll, userStoreParams);
    const maxBlocksInCache = this.getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams);
    const storeParams = {
      suppressInfiniteScroll: !infiniteScroll,
      cacheBlockSize,
      maxBlocksInCache
    };
    return storeParams;
  }
  getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams) {
    if (!infiniteScroll) {
      return void 0;
    }
    const maxBlocksInCache = userStoreParams && userStoreParams.maxBlocksInCache != null ? userStoreParams.maxBlocksInCache : this.gos.get("maxBlocksInCache");
    const maxBlocksActive = maxBlocksInCache != null && maxBlocksInCache >= 0;
    if (!maxBlocksActive) {
      return void 0;
    }
    if (ssrmParams.dynamicRowHeight) {
      const message = "Server Side Row Model does not support Dynamic Row Height and Cache Purging. Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.";
      _8.warnOnce(message);
      return void 0;
    }
    if (this.columnModel.isAutoRowHeightActive()) {
      const message = "Server Side Row Model does not support Auto Row Height and Cache Purging. Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.";
      _8.warnOnce(message);
      return void 0;
    }
    return maxBlocksInCache;
  }
  getBlockSize(infiniteScroll, userStoreParams) {
    if (!infiniteScroll) {
      return void 0;
    }
    const blockSize = userStoreParams && userStoreParams.cacheBlockSize != null ? userStoreParams.cacheBlockSize : this.gos.get("cacheBlockSize");
    if (blockSize != null && blockSize > 0) {
      return blockSize;
    } else {
      return 100;
    }
  }
  getLevelSpecificParams(parentNode) {
    const callback = this.gos.getCallback("getServerSideGroupLevelParams");
    if (!callback) {
      return void 0;
    }
    const params = {
      level: parentNode.level + 1,
      parentRowNode: parentNode.level >= 0 ? parentNode : void 0,
      rowGroupColumns: this.columnModel.getRowGroupColumns(),
      pivotColumns: this.columnModel.getPivotColumns(),
      pivotMode: this.columnModel.isPivotMode()
    };
    const res = callback(params);
    return res;
  }
  isInfiniteScroll(storeParams) {
    const res = storeParams && storeParams.suppressInfiniteScroll != null ? storeParams.suppressInfiniteScroll : this.isSuppressServerSideInfiniteScroll();
    return !res;
  }
  isSuppressServerSideInfiniteScroll() {
    return this.gos.get("suppressServerSideInfiniteScroll");
  }
};
__decorateClass([
  Autowired12("gridOptionsService")
], StoreFactory.prototype, "gos", 2);
__decorateClass([
  Autowired12("columnModel")
], StoreFactory.prototype, "columnModel", 2);
StoreFactory = __decorateClass([
  Bean10("ssrmStoreFactory")
], StoreFactory);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/listeners/listenerUtils.ts
import { Autowired as Autowired13, Bean as Bean11 } from "@ag-grid-community/core";
var ListenerUtils = class {
  isSortingWithValueColumn(changedColumnsInSort) {
    const valueColIds = this.columnModel.getValueColumns().map((col) => col.getColId());
    for (let i = 0; i < changedColumnsInSort.length; i++) {
      if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
        return true;
      }
    }
    return false;
  }
  isSortingWithSecondaryColumn(changedColumnsInSort) {
    if (!this.columnModel.getSecondaryColumns()) {
      return false;
    }
    const secondaryColIds = this.columnModel.getSecondaryColumns().map((col) => col.getColId());
    for (let i = 0; i < changedColumnsInSort.length; i++) {
      if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
        return true;
      }
    }
    return false;
  }
};
__decorateClass([
  Autowired13("columnModel")
], ListenerUtils.prototype, "columnModel", 2);
ListenerUtils = __decorateClass([
  Bean11("ssrmListenerUtils")
], ListenerUtils);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/services/serverSideSelectionService.ts
import {
  Autowired as Autowired16,
  Bean as Bean12,
  BeanStub as BeanStub13,
  Events as Events10,
  PostConstruct as PostConstruct13
} from "@ag-grid-community/core";

// enterprise-modules/server-side-row-model/src/serverSideRowModel/services/selection/strategies/defaultStrategy.ts
import { Autowired as Autowired14, BeanStub as BeanStub11, Events as Events8, PostConstruct as PostConstruct11 } from "@ag-grid-community/core";
var DefaultStrategy = class extends BeanStub11 {
  constructor() {
    super(...arguments);
    this.selectedState = { selectAll: false, toggledNodes: /* @__PURE__ */ new Set() };
    this.lastSelected = null;
    this.selectAllUsed = false;
    // this is to prevent regressions, default selectionService retains reference of clicked nodes.
    this.selectedNodes = {};
  }
  init() {
    this.rowSelection = this.gos.get("rowSelection");
    this.addManagedPropertyListener("rowSelection", (propChange) => {
      this.rowSelection = propChange.currentValue;
    });
  }
  getSelectedState() {
    return {
      selectAll: this.selectedState.selectAll,
      toggledNodes: [...this.selectedState.toggledNodes]
    };
  }
  setSelectedState(state) {
    const newState = {
      selectAll: false,
      toggledNodes: /* @__PURE__ */ new Set()
    };
    if (typeof state !== "object") {
      console.error("AG Grid: The provided selection state should be an object.");
      return;
    }
    if ("selectAll" in state && typeof state.selectAll === "boolean") {
      newState.selectAll = state.selectAll;
    } else {
      console.error("AG Grid: Select all status should be of boolean type.");
      return;
    }
    if ("toggledNodes" in state && Array.isArray(state.toggledNodes)) {
      state.toggledNodes.forEach((key) => {
        if (typeof key === "string") {
          newState.toggledNodes.add(key);
        } else {
          console.warn(`AG Grid: Provided ids must be of string type. Invalid id provided: ${key}`);
        }
      });
    } else {
      console.error("AG Grid: `toggledNodes` must be an array of string ids.");
      return;
    }
    this.selectedState = newState;
  }
  deleteSelectionStateFromParent(parentPath, removedNodeIds) {
    if (this.selectedState.toggledNodes.size === 0) {
      return false;
    }
    let anyNodesToggled = false;
    removedNodeIds.forEach((id) => {
      if (this.selectedState.toggledNodes.delete(id)) {
        anyNodesToggled = true;
      }
    });
    return anyNodesToggled;
  }
  setNodesSelected(params) {
    if (params.nodes.length === 0)
      return 0;
    const onlyThisNode = params.clearSelection && params.newValue && !params.rangeSelect;
    if (this.rowSelection !== "multiple" || onlyThisNode) {
      if (params.nodes.length > 1) {
        throw new Error("AG Grid: cannot select multiple rows when rowSelection is set to 'single'");
      }
      const node = params.nodes[0];
      if (params.newValue) {
        this.selectedNodes = { [node.id]: node };
        this.selectedState = {
          selectAll: false,
          toggledNodes: /* @__PURE__ */ new Set([node.id])
        };
      } else {
        this.selectedNodes = {};
        this.selectedState = {
          selectAll: false,
          toggledNodes: /* @__PURE__ */ new Set()
        };
      }
      this.lastSelected = node.id;
      return 1;
    }
    const updateNodeState = (node) => {
      if (params.newValue) {
        this.selectedNodes[node.id] = node;
      } else {
        delete this.selectedNodes[node.id];
      }
      const isNodeSelectable = node.selectable;
      const doesNodeConform = params.newValue === this.selectedState.selectAll;
      if (doesNodeConform || !isNodeSelectable) {
        this.selectedState.toggledNodes.delete(node.id);
        return;
      }
      this.selectedState.toggledNodes.add(node.id);
    };
    if (params.rangeSelect && this.lastSelected) {
      if (params.nodes.length > 1) {
        throw new Error("AG Grid: cannot select multiple rows when using rangeSelect");
      }
      const node = params.nodes[0];
      const lastSelectedNode = this.rowModel.getRowNode(this.lastSelected);
      this.rowModel.getNodesInRangeForSelection(node, lastSelectedNode != null ? lastSelectedNode : null).forEach(updateNodeState);
      this.lastSelected = node.id;
      return 1;
    }
    params.nodes.forEach(updateNodeState);
    this.lastSelected = params.nodes[params.nodes.length - 1].id;
    return 1;
  }
  processNewRow(node) {
    if (this.selectedNodes[node.id]) {
      this.selectedNodes[node.id] = node;
    }
  }
  isNodeSelected(node) {
    const isToggled = this.selectedState.toggledNodes.has(node.id);
    return this.selectedState.selectAll ? !isToggled : isToggled;
  }
  getSelectedNodes() {
    if (this.selectAllUsed) {
      console.warn(
        `AG Grid: getSelectedNodes and getSelectedRows functions cannot be used with select all functionality with the server-side row model.
                Use \`api.getServerSideSelectionState()\` instead.`
      );
    }
    return Object.values(this.selectedNodes);
  }
  getSelectedRows() {
    return this.getSelectedNodes().map((node) => node.data);
  }
  getSelectionCount() {
    if (this.selectedState.selectAll) {
      return -1;
    }
    return this.selectedState.toggledNodes.size;
  }
  clearOtherNodes(rowNodeToKeepSelected, source) {
    const clearedRows = this.selectedState.selectAll ? 1 : this.selectedState.toggledNodes.size - 1;
    this.selectedState = {
      selectAll: false,
      toggledNodes: /* @__PURE__ */ new Set([rowNodeToKeepSelected.id])
    };
    this.rowModel.forEachNode((node) => {
      if (node !== rowNodeToKeepSelected) {
        node.selectThisNode(false, void 0, source);
      }
    });
    const event = {
      type: Events8.EVENT_SELECTION_CHANGED,
      source
    };
    this.eventService.dispatchEvent(event);
    return clearedRows;
  }
  isEmpty() {
    var _a;
    return !this.selectedState.selectAll && !((_a = this.selectedState.toggledNodes) == null ? void 0 : _a.size);
  }
  selectAllRowNodes(params) {
    this.selectedState = { selectAll: true, toggledNodes: /* @__PURE__ */ new Set() };
    this.selectedNodes = {};
    this.selectAllUsed = true;
  }
  deselectAllRowNodes(params) {
    this.selectedState = { selectAll: false, toggledNodes: /* @__PURE__ */ new Set() };
    this.selectedNodes = {};
  }
  getSelectAllState(justFiltered, justCurrentPage) {
    if (this.selectedState.selectAll) {
      if (this.selectedState.toggledNodes.size > 0) {
        return null;
      }
      return true;
    }
    if (this.selectedState.toggledNodes.size > 0) {
      return null;
    }
    return false;
  }
};
__decorateClass([
  Autowired14("rowModel")
], DefaultStrategy.prototype, "rowModel", 2);
__decorateClass([
  PostConstruct11
], DefaultStrategy.prototype, "init", 1);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/services/selection/strategies/groupSelectsChildrenStrategy.ts
import { Autowired as Autowired15, BeanStub as BeanStub12, PostConstruct as PostConstruct12, Events as Events9 } from "@ag-grid-community/core";
var GroupSelectsChildrenStrategy = class extends BeanStub12 {
  constructor() {
    super(...arguments);
    this.selectedState = { selectAllChildren: false, toggledNodes: /* @__PURE__ */ new Map() };
    this.lastSelected = null;
  }
  init() {
    this.addManagedListener(this.eventService, Events9.EVENT_MODEL_UPDATED, () => this.removeRedundantState());
    this.addManagedListener(this.eventService, Events9.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.selectionService.reset("rowGroupChanged"));
  }
  getSelectedState() {
    const treeData = this.gos.get("treeData");
    const recursivelySerializeState = (state, level, nodeId) => {
      const normalisedState = {
        nodeId
      };
      if (treeData || level <= this.columnModel.getRowGroupColumns().length) {
        normalisedState.selectAllChildren = state.selectAllChildren;
      }
      if (state.toggledNodes.size) {
        const toggledNodes = [];
        state.toggledNodes.forEach((value, key) => {
          const newState = recursivelySerializeState(value, level + 1, key);
          toggledNodes.push(newState);
        });
        normalisedState.toggledNodes = toggledNodes;
      }
      return normalisedState;
    };
    return recursivelySerializeState(this.selectedState, 0);
  }
  setSelectedState(state) {
    const recursivelyDeserializeState = (normalisedState, parentSelected) => {
      var _a, _b;
      if (typeof normalisedState !== "object") {
        throw new Error("AG Grid: Each provided state object must be an object.");
      }
      if ("selectAllChildren" in normalisedState && typeof normalisedState.selectAllChildren !== "boolean") {
        throw new Error("AG Grid: `selectAllChildren` must be a boolean value or undefined.");
      }
      if ("toggledNodes" in normalisedState) {
        if (!Array.isArray(normalisedState.toggledNodes)) {
          throw new Error("AG Grid: `toggledNodes` must be an array.");
        }
        const allHaveIds = normalisedState.toggledNodes.every((innerState) => typeof innerState === "object" && "nodeId" in innerState && typeof innerState.nodeId === "string");
        if (!allHaveIds) {
          throw new Error("AG Grid: Every `toggledNode` requires an associated string id.");
        }
      }
      const isThisNodeSelected = (_a = normalisedState.selectAllChildren) != null ? _a : !parentSelected;
      const convertedChildren = (_b = normalisedState.toggledNodes) == null ? void 0 : _b.map((innerState) => [innerState.nodeId, recursivelyDeserializeState(innerState, isThisNodeSelected)]);
      const doesRedundantStateExist = convertedChildren == null ? void 0 : convertedChildren.some(([_9, innerState]) => isThisNodeSelected === innerState.selectAllChildren && innerState.toggledNodes.size === 0);
      if (doesRedundantStateExist) {
        throw new Error(`
                    AG Grid: AG Grid: Row selection state could not be parsed due to invalid data. Ensure all child state has toggledNodes or does not conform with the parent rule.
                    Please rebuild the selection state and reapply it.
                `);
      }
      return {
        selectAllChildren: isThisNodeSelected,
        toggledNodes: new Map(convertedChildren)
      };
    };
    try {
      this.selectedState = recursivelyDeserializeState(state, !!state.selectAllChildren);
    } catch (e) {
      console.error(e.message);
    }
  }
  deleteSelectionStateFromParent(parentRoute, removedNodeIds) {
    let parentState = this.selectedState;
    const remainingRoute = [...parentRoute];
    while (parentState && remainingRoute.length) {
      parentState = parentState.toggledNodes.get(remainingRoute.pop());
    }
    if (!parentState) {
      return false;
    }
    let anyStateChanged = false;
    removedNodeIds.forEach((id) => {
      if (parentState == null ? void 0 : parentState.toggledNodes.delete(id)) {
        anyStateChanged = true;
      }
    });
    if (anyStateChanged) {
      this.removeRedundantState();
    }
    return anyStateChanged;
  }
  setNodesSelected(params) {
    const _a = params, { nodes } = _a, other = __objRest(_a, ["nodes"]);
    if (nodes.length === 0)
      return 0;
    if (params.rangeSelect) {
      if (nodes.length > 1) {
        throw new Error("AG Grid: cannot select multiple rows when using rangeSelect");
      }
      const node = nodes[0];
      const rangeOfNodes = this.rowModel.getNodesInRangeForSelection(node, this.lastSelected);
      const routes = rangeOfNodes.map(this.getRouteToNode).sort((a, b) => b.length - a.length);
      const completedRoutes = /* @__PURE__ */ new Set();
      routes.forEach((route) => {
        if (completedRoutes.has(route[route.length - 1])) {
          return;
        }
        route.forEach((part) => completedRoutes.add(part));
        this.recursivelySelectNode(route, this.selectedState, __spreadValues({ node }, other));
      });
      this.removeRedundantState();
      this.lastSelected = node;
      return 1;
    }
    params.nodes.forEach((node) => {
      const idPathToNode = this.getRouteToNode(node);
      this.recursivelySelectNode(idPathToNode, this.selectedState, __spreadProps(__spreadValues({}, other), { node }));
    });
    this.removeRedundantState();
    this.lastSelected = params.nodes[params.nodes.length - 1];
    return 1;
  }
  isNodeSelected(node) {
    const path = this.getRouteToNode(node);
    return this.isNodePathSelected(path, this.selectedState);
  }
  isNodePathSelected([nextNode, ...nodes], state) {
    if (nodes.length === 0) {
      const isToggled = state.toggledNodes.has(nextNode.id);
      if (nextNode.hasChildren()) {
        const groupState = state.toggledNodes.get(nextNode.id);
        if (groupState && groupState.toggledNodes.size) {
          return void 0;
        }
      }
      return state.selectAllChildren ? !isToggled : isToggled;
    }
    if (state.toggledNodes.has(nextNode.id)) {
      const nextState = state.toggledNodes.get(nextNode.id);
      if (nextState) {
        return this.isNodePathSelected(nodes, nextState);
      }
    }
    return !!state.selectAllChildren;
  }
  getRouteToNode(node) {
    const pathToNode = [];
    let tempNode = node;
    while (tempNode.parent) {
      pathToNode.push(tempNode);
      tempNode = tempNode.parent;
    }
    return pathToNode.reverse();
  }
  removeRedundantState() {
    if (this.filterManager.isAnyFilterPresent()) {
      return;
    }
    const forEachNodeStateDepthFirst = (state = this.selectedState, thisKey, parentState) => {
      state.toggledNodes.forEach((value, key) => {
        forEachNodeStateDepthFirst(value, key, state);
      });
      if (thisKey) {
        const thisRow = this.rowModel.getRowNode(thisKey);
        const thisRowStore = thisRow == null ? void 0 : thisRow.childStore;
        const isStoreSizeKnown = thisRowStore == null ? void 0 : thisRowStore.isLastRowIndexKnown();
        if (isStoreSizeKnown) {
          const possibleAllNodesToggled = state.toggledNodes.size >= thisRowStore.getRowCount();
          if (possibleAllNodesToggled) {
            for (const childState of state.toggledNodes.entries()) {
              const [key, value] = childState;
              if (value.toggledNodes.size > 0) {
                return;
              }
              const rowDoesNotExist = !this.rowModel.getRowNode(key);
              if (rowDoesNotExist) {
                return;
              }
            }
            state.selectAllChildren = !state.selectAllChildren;
            state.toggledNodes.clear();
          }
        }
      }
      const hasNoToggledRows = state.toggledNodes.size === 0;
      const isIdenticalToParent = (parentState == null ? void 0 : parentState.selectAllChildren) === state.selectAllChildren;
      if (hasNoToggledRows && isIdenticalToParent) {
        parentState == null ? void 0 : parentState.toggledNodes.delete(thisKey);
      }
    };
    forEachNodeStateDepthFirst();
  }
  recursivelySelectNode([nextNode, ...nodes], selectedState, params) {
    if (!nextNode) {
      return;
    }
    const isLastNode = !nodes.length;
    if (isLastNode) {
      const isNodeSelectable = nextNode.selectable;
      const doesNodeConform = selectedState.selectAllChildren === params.newValue;
      if (doesNodeConform || !isNodeSelectable) {
        selectedState.toggledNodes.delete(nextNode.id);
        return;
      }
      const newState = {
        selectAllChildren: params.newValue,
        toggledNodes: /* @__PURE__ */ new Map()
      };
      selectedState.toggledNodes.set(nextNode.id, newState);
      return;
    }
    const doesStateAlreadyExist = selectedState.toggledNodes.has(nextNode.id);
    const childState = doesStateAlreadyExist ? selectedState.toggledNodes.get(nextNode.id) : {
      selectAllChildren: selectedState.selectAllChildren,
      toggledNodes: /* @__PURE__ */ new Map()
    };
    if (!doesStateAlreadyExist) {
      selectedState.toggledNodes.set(nextNode.id, childState);
    }
    this.recursivelySelectNode(nodes, childState, params);
    if (selectedState.selectAllChildren === childState.selectAllChildren && childState.toggledNodes.size === 0) {
      selectedState.toggledNodes.delete(nextNode.id);
    }
  }
  getSelectedNodes() {
    console.warn(
      `AG Grid: \`getSelectedNodes\` and \`getSelectedRows\` functions cannot be used with \`groupSelectsChildren\` and the server-side row model.
            Use \`api.getServerSideSelectionState()\` instead.`
    );
    const selectedNodes = [];
    this.rowModel.forEachNode((node) => {
      if (node.isSelected()) {
        selectedNodes.push(node);
      }
    });
    return selectedNodes;
  }
  processNewRow(node) {
  }
  getSelectedRows() {
    return this.getSelectedNodes().map((node) => node.data);
  }
  getSelectionCount() {
    return -1;
  }
  isEmpty() {
    var _a;
    return !this.selectedState.selectAllChildren && !((_a = this.selectedState.toggledNodes) == null ? void 0 : _a.size);
  }
  selectAllRowNodes(params) {
    this.selectedState = { selectAllChildren: true, toggledNodes: /* @__PURE__ */ new Map() };
  }
  deselectAllRowNodes(params) {
    this.selectedState = { selectAllChildren: false, toggledNodes: /* @__PURE__ */ new Map() };
  }
  getSelectAllState(justFiltered, justCurrentPage) {
    if (this.selectedState.selectAllChildren) {
      if (this.selectedState.toggledNodes.size > 0) {
        return null;
      }
      return true;
    }
    if (this.selectedState.toggledNodes.size > 0) {
      return null;
    }
    return false;
  }
};
__decorateClass([
  Autowired15("rowModel")
], GroupSelectsChildrenStrategy.prototype, "rowModel", 2);
__decorateClass([
  Autowired15("columnModel")
], GroupSelectsChildrenStrategy.prototype, "columnModel", 2);
__decorateClass([
  Autowired15("filterManager")
], GroupSelectsChildrenStrategy.prototype, "filterManager", 2);
__decorateClass([
  Autowired15("rowModel")
], GroupSelectsChildrenStrategy.prototype, "serverSideRowModel", 2);
__decorateClass([
  Autowired15("selectionService")
], GroupSelectsChildrenStrategy.prototype, "selectionService", 2);
__decorateClass([
  PostConstruct12
], GroupSelectsChildrenStrategy.prototype, "init", 1);

// enterprise-modules/server-side-row-model/src/serverSideRowModel/services/serverSideSelectionService.ts
var ServerSideSelectionService = class extends BeanStub13 {
  init() {
    const groupSelectsChildren = this.gos.get("groupSelectsChildren");
    this.addManagedPropertyListener("groupSelectsChildren", (propChange) => {
      this.destroyBean(this.selectionStrategy);
      const StrategyClazz2 = !propChange.currentValue ? DefaultStrategy : GroupSelectsChildrenStrategy;
      this.selectionStrategy = this.createManagedBean(new StrategyClazz2());
      this.shotgunResetNodeSelectionState();
      const event = {
        type: Events10.EVENT_SELECTION_CHANGED,
        source: "api"
      };
      this.eventService.dispatchEvent(event);
    });
    this.addManagedPropertyListener("rowSelection", () => this.deselectAllRowNodes({ source: "api" }));
    const StrategyClazz = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
    this.selectionStrategy = this.createManagedBean(new StrategyClazz());
  }
  getSelectionState() {
    return this.selectionStrategy.getSelectedState();
  }
  setSelectionState(state, source) {
    if (Array.isArray(state)) {
      return;
    }
    this.selectionStrategy.setSelectedState(state);
    this.shotgunResetNodeSelectionState();
    const event = {
      type: Events10.EVENT_SELECTION_CHANGED,
      source
    };
    this.eventService.dispatchEvent(event);
  }
  setNodesSelected(params) {
    const _a = params, { nodes } = _a, otherParams = __objRest(_a, ["nodes"]);
    const rowSelection = this.gos.get("rowSelection");
    if (nodes.length > 1 && rowSelection !== "multiple") {
      console.warn(`AG Grid: cannot multi select while rowSelection='single'`);
      return 0;
    }
    if (nodes.length > 1 && params.rangeSelect) {
      console.warn(`AG Grid: cannot use range selection when multi selecting rows`);
      return 0;
    }
    const adjustedParams = __spreadValues({
      nodes: nodes.filter((node) => node.selectable)
    }, otherParams);
    if (!adjustedParams.nodes.length) {
      return 0;
    }
    const changedNodes = this.selectionStrategy.setNodesSelected(adjustedParams);
    this.shotgunResetNodeSelectionState(adjustedParams.source);
    const event = {
      type: Events10.EVENT_SELECTION_CHANGED,
      source: adjustedParams.source
    };
    this.eventService.dispatchEvent(event);
    return changedNodes;
  }
  /**
   * Deletes the selection state for a set of nodes, for use after deleting nodes via
   * transaction. As this is designed for transactions, all nodes should belong to the same group.
   */
  deleteSelectionStateFromParent(storeRoute, removedNodeIds) {
    const stateChanged = this.selectionStrategy.deleteSelectionStateFromParent(storeRoute, removedNodeIds);
    if (!stateChanged) {
      return;
    }
    this.shotgunResetNodeSelectionState();
    const event = {
      type: Events10.EVENT_SELECTION_CHANGED,
      source: "api"
    };
    this.eventService.dispatchEvent(event);
  }
  shotgunResetNodeSelectionState(source) {
    this.rowModel.forEachNode((node) => {
      if (node.stub) {
        return;
      }
      const isNodeSelected = this.selectionStrategy.isNodeSelected(node);
      if (isNodeSelected !== node.isSelected()) {
        node.selectThisNode(isNodeSelected, void 0, source);
      }
    });
  }
  getSelectedNodes() {
    return this.selectionStrategy.getSelectedNodes();
  }
  getSelectedRows() {
    return this.selectionStrategy.getSelectedRows();
  }
  getSelectionCount() {
    return this.selectionStrategy.getSelectionCount();
  }
  syncInRowNode(rowNode, oldNode) {
    this.selectionStrategy.processNewRow(rowNode);
    const isNodeSelected = this.selectionStrategy.isNodeSelected(rowNode);
    if (isNodeSelected != false && !rowNode.selectable) {
      this.selectionStrategy.setNodesSelected({
        nodes: [rowNode],
        newValue: false,
        source: "api"
      });
      this.shotgunResetNodeSelectionState();
      const event = {
        type: Events10.EVENT_SELECTION_CHANGED,
        source: "api"
      };
      this.eventService.dispatchEvent(event);
      return;
    }
    rowNode.setSelectedInitialValue(isNodeSelected);
  }
  reset() {
    this.selectionStrategy.deselectAllRowNodes({ source: "api" });
  }
  isEmpty() {
    return this.selectionStrategy.isEmpty();
  }
  hasNodesToSelect(justFiltered = false, justCurrentPage = false) {
    return true;
  }
  selectAllRowNodes(params) {
    if (params.justCurrentPage || params.justFiltered) {
      console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
    }
    this.selectionStrategy.selectAllRowNodes(params);
    this.rowModel.forEachNode((node) => {
      if (node.stub) {
        return;
      }
      node.selectThisNode(true, void 0, params.source);
    });
    const event = {
      type: Events10.EVENT_SELECTION_CHANGED,
      source: params.source
    };
    this.eventService.dispatchEvent(event);
  }
  deselectAllRowNodes(params) {
    if (params.justCurrentPage || params.justFiltered) {
      console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
    }
    this.selectionStrategy.deselectAllRowNodes(params);
    this.rowModel.forEachNode((node) => {
      if (node.stub) {
        return;
      }
      node.selectThisNode(false, void 0, params.source);
    });
    const event = {
      type: Events10.EVENT_SELECTION_CHANGED,
      source: params.source
    };
    this.eventService.dispatchEvent(event);
  }
  getSelectAllState(justFiltered, justCurrentPage) {
    return this.selectionStrategy.getSelectAllState(justFiltered, justCurrentPage);
  }
  // used by CSRM
  updateGroupsFromChildrenSelections(source, changedPath) {
    return false;
  }
  // used by CSRM
  getBestCostNodeSelection() {
    console.warn("AG Grid: calling gridApi.getBestCostNodeSelection() is only possible when using rowModelType=`clientSide`.");
    return void 0;
  }
  // used by CSRM
  filterFromSelection() {
    return;
  }
};
__decorateClass([
  Autowired16("rowModel")
], ServerSideSelectionService.prototype, "rowModel", 2);
__decorateClass([
  PostConstruct13
], ServerSideSelectionService.prototype, "init", 1);
ServerSideSelectionService = __decorateClass([
  Bean12("selectionService")
], ServerSideSelectionService);

// enterprise-modules/server-side-row-model/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/server-side-row-model/src/serverSideRowModel/services/serverSideExpansionService.ts
import {
  Autowired as Autowired17,
  Bean as Bean13,
  Events as Events11,
  ExpansionService
} from "@ag-grid-community/core";
var ServerSideExpansionService = class extends ExpansionService {
  constructor() {
    super(...arguments);
    this.queuedRowIds = /* @__PURE__ */ new Set();
  }
  postConstruct() {
    super.postConstruct();
    this.addManagedListener(this.eventService, Events11.EVENT_COLUMN_ROW_GROUP_CHANGED, () => {
      this.queuedRowIds.clear();
    });
  }
  checkOpenByDefault(rowNode) {
    if (!rowNode.isExpandable()) {
      return;
    }
    if (this.queuedRowIds.has(rowNode.id)) {
      this.queuedRowIds.delete(rowNode.id);
      rowNode.setExpanded(true);
      return;
    }
    const userFunc = this.gos.getCallback("isServerSideGroupOpenByDefault");
    if (!userFunc) {
      return;
    }
    const params = {
      data: rowNode.data,
      rowNode
    };
    const userFuncRes = userFunc(params);
    if (userFuncRes) {
      rowNode.setExpanded(true);
    }
  }
  expandRows(rowIds) {
    rowIds.forEach((rowId) => {
      const rowNode = this.serverSideRowModel.getRowNode(rowId);
      if (rowNode) {
        rowNode.setExpanded(true);
      } else {
        this.queuedRowIds.add(rowId);
      }
    });
  }
  expandAll(value) {
    this.serverSideRowModel.expandAll(value);
  }
  onGroupExpandedOrCollapsed() {
  }
};
__decorateClass([
  Autowired17("rowModel")
], ServerSideExpansionService.prototype, "serverSideRowModel", 2);
ServerSideExpansionService = __decorateClass([
  Bean13("expansionService")
], ServerSideExpansionService);

// enterprise-modules/server-side-row-model/src/serverSideRowModelModule.ts
var ServerSideRowModelModule = {
  version: VERSION,
  moduleName: ModuleNames2.ServerSideRowModelModule,
  rowModel: "serverSide",
  beans: [
    ServerSideRowModel,
    ExpandListener,
    SortListener,
    StoreUtils,
    BlockUtils,
    NodeManager,
    TransactionManager,
    FilterListener,
    StoreFactory,
    ListenerUtils,
    ServerSideSelectionService,
    ServerSideExpansionService,
    LazyBlockLoadingService
  ],
  dependantModules: [
    EnterpriseCoreModule
  ]
};
export {
  ServerSideRowModelModule
};
