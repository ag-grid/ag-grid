var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// community-modules/client-side-row-model/src/clientSideRowModelModule.ts
import { ModuleNames } from "@ag-grid-community/core";

// community-modules/client-side-row-model/src/clientSideRowModel/clientSideRowModel.ts
import {
  _ as _2,
  Autowired,
  Bean,
  BeanStub,
  ChangedPath,
  Events as Events2,
  Optional,
  PostConstruct,
  ClientSideRowModelSteps,
  RowNode as RowNode2,
  RowHighlightPosition
} from "@ag-grid-community/core";

// community-modules/client-side-row-model/src/clientSideRowModel/clientSideNodeManager.ts
import {
  Events,
  RowNode,
  _
} from "@ag-grid-community/core";
var _ClientSideNodeManager = class _ClientSideNodeManager {
  constructor(rootNode, gos, eventService, columnModel, selectionService, beans) {
    this.nextId = 0;
    // has row data actually been set
    this.rowCountReady = false;
    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    this.allNodesMap = {};
    this.rootNode = rootNode;
    this.gos = gos;
    this.eventService = eventService;
    this.columnModel = columnModel;
    this.beans = beans;
    this.selectionService = selectionService;
    this.rootNode.group = true;
    this.rootNode.level = -1;
    this.rootNode.id = _ClientSideNodeManager.ROOT_NODE_ID;
    this.rootNode.allLeafChildren = [];
    this.rootNode.childrenAfterGroup = [];
    this.rootNode.childrenAfterSort = [];
    this.rootNode.childrenAfterAggFilter = [];
    this.rootNode.childrenAfterFilter = [];
  }
  getCopyOfNodesMap() {
    return _.cloneObject(this.allNodesMap);
  }
  getRowNode(id) {
    return this.allNodesMap[id];
  }
  setRowData(rowData) {
    if (typeof rowData === "string") {
      console.warn("AG Grid: rowData must be an array.");
      return;
    }
    this.rowCountReady = true;
    this.dispatchRowDataUpdateStartedEvent(rowData);
    const rootNode = this.rootNode;
    const sibling = this.rootNode.sibling;
    rootNode.childrenAfterFilter = null;
    rootNode.childrenAfterGroup = null;
    rootNode.childrenAfterAggFilter = null;
    rootNode.childrenAfterSort = null;
    rootNode.childrenMapped = null;
    rootNode.updateHasChildren();
    this.nextId = 0;
    this.allNodesMap = {};
    if (rowData) {
      rootNode.allLeafChildren = rowData.map((dataItem) => this.createNode(dataItem, this.rootNode, _ClientSideNodeManager.TOP_LEVEL));
    } else {
      rootNode.allLeafChildren = [];
      rootNode.childrenAfterGroup = [];
    }
    if (sibling) {
      sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
      sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
      sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
      sibling.childrenAfterSort = rootNode.childrenAfterSort;
      sibling.childrenMapped = rootNode.childrenMapped;
      sibling.allLeafChildren = rootNode.allLeafChildren;
    }
  }
  updateRowData(rowDataTran, rowNodeOrder) {
    this.rowCountReady = true;
    this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);
    const rowNodeTransaction = {
      remove: [],
      update: [],
      add: []
    };
    const nodesToUnselect = [];
    this.executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect);
    this.executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect);
    this.executeAdd(rowDataTran, rowNodeTransaction);
    this.updateSelection(nodesToUnselect, "rowDataChanged");
    if (rowNodeOrder) {
      _.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
    }
    return rowNodeTransaction;
  }
  isRowCountReady() {
    return this.rowCountReady;
  }
  dispatchRowDataUpdateStartedEvent(rowData) {
    const event = {
      type: Events.EVENT_ROW_DATA_UPDATE_STARTED,
      firstRowData: (rowData == null ? void 0 : rowData.length) ? rowData[0] : null
    };
    this.eventService.dispatchEvent(event);
  }
  updateSelection(nodesToUnselect, source) {
    const selectionChanged = nodesToUnselect.length > 0;
    if (selectionChanged) {
      this.selectionService.setNodesSelected({
        newValue: false,
        nodes: nodesToUnselect,
        suppressFinishActions: true,
        source
      });
    }
    this.selectionService.updateGroupsFromChildrenSelections(source);
    if (selectionChanged) {
      const event = {
        type: Events.EVENT_SELECTION_CHANGED,
        source
      };
      this.eventService.dispatchEvent(event);
    }
  }
  executeAdd(rowDataTran, rowNodeTransaction) {
    var _a;
    const { add, addIndex } = rowDataTran;
    if (_.missingOrEmpty(add)) {
      return;
    }
    const newNodes = add.map((item) => this.createNode(item, this.rootNode, _ClientSideNodeManager.TOP_LEVEL));
    if (typeof addIndex === "number" && addIndex >= 0) {
      const { allLeafChildren } = this.rootNode;
      const len = allLeafChildren.length;
      let normalisedAddIndex = addIndex;
      const isTreeData = this.gos.get("treeData");
      if (isTreeData && addIndex > 0 && len > 0) {
        for (let i = 0; i < len; i++) {
          if (((_a = allLeafChildren[i]) == null ? void 0 : _a.rowIndex) == addIndex - 1) {
            normalisedAddIndex = i + 1;
            break;
          }
        }
      }
      const nodesBeforeIndex = allLeafChildren.slice(0, normalisedAddIndex);
      const nodesAfterIndex = allLeafChildren.slice(normalisedAddIndex, allLeafChildren.length);
      this.rootNode.allLeafChildren = [...nodesBeforeIndex, ...newNodes, ...nodesAfterIndex];
    } else {
      this.rootNode.allLeafChildren = [...this.rootNode.allLeafChildren, ...newNodes];
    }
    if (this.rootNode.sibling) {
      this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
    }
    rowNodeTransaction.add = newNodes;
  }
  executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect) {
    const { remove } = rowDataTran;
    if (_.missingOrEmpty(remove)) {
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
    });
    this.rootNode.allLeafChildren = this.rootNode.allLeafChildren.filter((rowNode) => !rowIdsRemoved[rowNode.id]);
    if (this.rootNode.sibling) {
      this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
    }
  }
  executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect) {
    const { update } = rowDataTran;
    if (_.missingOrEmpty(update)) {
      return;
    }
    update.forEach((item) => {
      const rowNode = this.lookupRowNode(item);
      if (!rowNode) {
        return;
      }
      rowNode.updateData(item);
      if (!rowNode.selectable && rowNode.isSelected()) {
        nodesToUnselect.push(rowNode);
      }
      this.setMasterForRow(rowNode, item, _ClientSideNodeManager.TOP_LEVEL, false);
      rowNodeTransaction.update.push(rowNode);
    });
  }
  lookupRowNode(data) {
    const getRowIdFunc = this.gos.getCallback("getRowId");
    let rowNode;
    if (getRowIdFunc) {
      const id = getRowIdFunc({ data, level: 0 });
      rowNode = this.allNodesMap[id];
      if (!rowNode) {
        console.error(`AG Grid: could not find row id=${id}, data item was not found for this id`);
        return null;
      }
    } else {
      rowNode = this.rootNode.allLeafChildren.find((node) => node.data === data);
      if (!rowNode) {
        console.error(`AG Grid: could not find data item as object was not found`, data);
        console.error(`Consider using getRowId to help the Grid find matching row data`);
        return null;
      }
    }
    return rowNode || null;
  }
  createNode(dataItem, parent, level) {
    const node = new RowNode(this.beans);
    node.group = false;
    this.setMasterForRow(node, dataItem, level, true);
    const suppressParentsInRowNodes = this.gos.get("suppressParentsInRowNodes");
    if (parent && !suppressParentsInRowNodes) {
      node.parent = parent;
    }
    node.level = level;
    node.setDataAndId(dataItem, this.nextId.toString());
    if (this.allNodesMap[node.id]) {
      console.warn(`AG Grid: duplicate node id '${node.id}' detected from getRowId callback, this could cause issues in your grid.`);
    }
    this.allNodesMap[node.id] = node;
    this.nextId++;
    return node;
  }
  setMasterForRow(rowNode, data, level, setExpanded) {
    const isTreeData = this.gos.get("treeData");
    if (isTreeData) {
      rowNode.setMaster(false);
      if (setExpanded) {
        rowNode.expanded = false;
      }
    } else {
      const masterDetail = this.gos.get("masterDetail");
      if (masterDetail) {
        const isRowMasterFunc = this.gos.get("isRowMaster");
        if (isRowMasterFunc) {
          rowNode.setMaster(isRowMasterFunc(data));
        } else {
          rowNode.setMaster(true);
        }
      } else {
        rowNode.setMaster(false);
      }
      if (setExpanded) {
        const rowGroupColumns = this.columnModel.getRowGroupColumns();
        const numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;
        const masterRowLevel = level + numRowGroupColumns;
        rowNode.expanded = rowNode.master ? this.isExpanded(masterRowLevel) : false;
      }
    }
  }
  isExpanded(level) {
    const expandByDefault = this.gos.get("groupDefaultExpanded");
    if (expandByDefault === -1) {
      return true;
    }
    return level < expandByDefault;
  }
};
_ClientSideNodeManager.TOP_LEVEL = 0;
_ClientSideNodeManager.ROOT_NODE_ID = "ROOT_NODE_ID";
var ClientSideNodeManager = _ClientSideNodeManager;

// community-modules/client-side-row-model/src/clientSideRowModel/clientSideRowModel.ts
var ClientSideRowModel = class extends BeanStub {
  constructor() {
    super(...arguments);
    this.onRowHeightChanged_debounced = _2.debounce(this.onRowHeightChanged.bind(this), 100);
    this.rowsToDisplay = [];
    /** Has the start method been called */
    this.hasStarted = false;
    /** E.g. data has been set into the node manager already */
    this.shouldSkipSettingDataOnStart = false;
    /**
     * This is to prevent refresh model being called when it's already being called.
     * E.g. the group stage can trigger initial state filter model to be applied. This fires onFilterChanged,
     * which then triggers the listener here that calls refresh model again but at the filter stage
     * (which is about to be run by the original call).
     */
    this.isRefreshingModel = false;
    this.rowCountReady = false;
  }
  init() {
    const refreshEverythingFunc = this.refreshModel.bind(this, { step: ClientSideRowModelSteps.EVERYTHING });
    const animate = !this.gos.get("suppressAnimationFrame");
    const refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
      step: ClientSideRowModelSteps.EVERYTHING,
      // after cols change, row grouping (the first stage) could of changed
      afterColumnsChanged: true,
      keepRenderedRows: true,
      // we want animations cos sorting or filtering could be applied
      animate
    });
    this.addManagedListener(this.eventService, Events2.EVENT_NEW_COLUMNS_LOADED, refreshEverythingAfterColsChangedFunc);
    this.addManagedListener(this.eventService, Events2.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
    this.addManagedListener(this.eventService, Events2.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
    this.addManagedListener(this.eventService, Events2.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, { step: ClientSideRowModelSteps.PIVOT }));
    this.addManagedListener(this.eventService, Events2.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    this.addManagedListener(this.eventService, Events2.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    this.addManagedListener(this.eventService, Events2.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);
    this.addManagedListener(this.eventService, Events2.EVENT_GRID_STYLES_CHANGED, this.onGridStylesChanges.bind(this));
    this.addManagedListener(this.eventService, Events2.EVENT_GRID_READY, () => this.onGridReady());
    this.addPropertyListeners();
    this.rootNode = new RowNode2(this.beans);
    this.nodeManager = new ClientSideNodeManager(
      this.rootNode,
      this.gos,
      this.eventService,
      this.columnModel,
      this.selectionService,
      this.beans
    );
  }
  addPropertyListeners() {
    const resetProps = /* @__PURE__ */ new Set([
      "treeData",
      "masterDetail"
    ]);
    const groupStageRefreshProps = /* @__PURE__ */ new Set([
      "suppressParentsInRowNodes",
      "groupDefaultExpanded",
      "groupAllowUnbalanced",
      "initialGroupOrderComparator",
      "groupHideOpenParents",
      "groupDisplayType"
    ]);
    const filterStageRefreshProps = /* @__PURE__ */ new Set([
      "excludeChildrenWhenTreeDataFiltering"
    ]);
    const pivotStageRefreshProps = /* @__PURE__ */ new Set([
      "removePivotHeaderRowWhenSingleValueColumn",
      "pivotRowTotals",
      "pivotColumnGroupTotals",
      "suppressExpandablePivotGroups"
    ]);
    const aggregateStageRefreshProps = /* @__PURE__ */ new Set([
      "getGroupRowAgg",
      "alwaysAggregateAtRootLevel",
      "groupIncludeTotalFooter",
      "suppressAggFilteredOnly",
      "grandTotalRow"
    ]);
    const sortStageRefreshProps = /* @__PURE__ */ new Set([
      "postSortRows",
      "groupDisplayType",
      "accentedSort"
    ]);
    const filterAggStageRefreshProps = /* @__PURE__ */ new Set([]);
    const flattenStageRefreshProps = /* @__PURE__ */ new Set([
      "groupRemoveSingleChildren",
      "groupRemoveLowestSingleChildren",
      "groupIncludeFooter",
      "groupTotalRow"
    ]);
    const allProps = [
      ...resetProps,
      ...groupStageRefreshProps,
      ...filterStageRefreshProps,
      ...pivotStageRefreshProps,
      ...pivotStageRefreshProps,
      ...aggregateStageRefreshProps,
      ...sortStageRefreshProps,
      ...filterAggStageRefreshProps,
      ...flattenStageRefreshProps
    ];
    this.addManagedPropertyListeners(allProps, (params) => {
      var _a;
      const properties = (_a = params.changeSet) == null ? void 0 : _a.properties;
      if (!properties) {
        return;
      }
      ;
      const arePropertiesImpacted = (propSet) => properties.some((prop) => propSet.has(prop));
      if (arePropertiesImpacted(resetProps)) {
        this.setRowData(this.rootNode.allLeafChildren.map((child) => child.data));
        return;
      }
      if (arePropertiesImpacted(groupStageRefreshProps)) {
        this.refreshModel({ step: ClientSideRowModelSteps.EVERYTHING });
        return;
      }
      if (arePropertiesImpacted(filterStageRefreshProps)) {
        this.refreshModel({ step: ClientSideRowModelSteps.FILTER });
        return;
      }
      if (arePropertiesImpacted(pivotStageRefreshProps)) {
        this.refreshModel({ step: ClientSideRowModelSteps.PIVOT });
        return;
      }
      if (arePropertiesImpacted(aggregateStageRefreshProps)) {
        this.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
        return;
      }
      if (arePropertiesImpacted(sortStageRefreshProps)) {
        this.refreshModel({ step: ClientSideRowModelSteps.SORT });
        return;
      }
      if (arePropertiesImpacted(filterAggStageRefreshProps)) {
        this.refreshModel({ step: ClientSideRowModelSteps.FILTER_AGGREGATES });
        return;
      }
      if (arePropertiesImpacted(flattenStageRefreshProps)) {
        this.refreshModel({ step: ClientSideRowModelSteps.MAP });
      }
    });
    this.addManagedPropertyListener("rowHeight", () => this.resetRowHeights());
  }
  start() {
    this.hasStarted = true;
    if (this.shouldSkipSettingDataOnStart) {
      this.dispatchUpdateEventsAndRefresh();
    } else {
      this.setInitialData();
    }
  }
  setInitialData() {
    const rowData = this.gos.get("rowData");
    if (rowData) {
      this.shouldSkipSettingDataOnStart = true;
      this.setRowData(rowData);
    }
  }
  ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
    let atLeastOneChange;
    let res = false;
    do {
      atLeastOneChange = false;
      const rowAtStartPixel = this.getRowIndexAtPixel(startPixel);
      const rowAtEndPixel = this.getRowIndexAtPixel(endPixel);
      const firstRow = Math.max(rowAtStartPixel, startLimitIndex);
      const lastRow = Math.min(rowAtEndPixel, endLimitIndex);
      for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
        const rowNode = this.getRow(rowIndex);
        if (rowNode.rowHeightEstimated) {
          const rowHeight = this.gos.getRowHeightForNode(rowNode);
          rowNode.setRowHeight(rowHeight.height);
          atLeastOneChange = true;
          res = true;
        }
      }
      if (atLeastOneChange) {
        this.setRowTopAndRowIndex();
      }
    } while (atLeastOneChange);
    return res;
  }
  setRowTopAndRowIndex() {
    const defaultRowHeight = this.environment.getDefaultRowHeight();
    let nextRowTop = 0;
    const displayedRowsMapped = /* @__PURE__ */ new Set();
    const allowEstimate = this.gos.isDomLayout("normal");
    for (let i = 0; i < this.rowsToDisplay.length; i++) {
      const rowNode = this.rowsToDisplay[i];
      if (rowNode.id != null) {
        displayedRowsMapped.add(rowNode.id);
      }
      if (rowNode.rowHeight == null) {
        const rowHeight = this.gos.getRowHeightForNode(rowNode, allowEstimate, defaultRowHeight);
        rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
      }
      rowNode.setRowTop(nextRowTop);
      rowNode.setRowIndex(i);
      nextRowTop += rowNode.rowHeight;
    }
    return displayedRowsMapped;
  }
  clearRowTopAndRowIndex(changedPath, displayedRowsMapped) {
    const changedPathActive = changedPath.isActive();
    const clearIfNotDisplayed = (rowNode) => {
      if (rowNode && rowNode.id != null && !displayedRowsMapped.has(rowNode.id)) {
        rowNode.clearRowTopAndRowIndex();
      }
    };
    const recurse = (rowNode) => {
      clearIfNotDisplayed(rowNode);
      clearIfNotDisplayed(rowNode.detailNode);
      clearIfNotDisplayed(rowNode.sibling);
      if (rowNode.hasChildren()) {
        if (rowNode.childrenAfterGroup) {
          const isRootNode = rowNode.level == -1;
          const skipChildren = changedPathActive && !isRootNode && !rowNode.expanded;
          if (!skipChildren) {
            rowNode.childrenAfterGroup.forEach(recurse);
          }
        }
      }
    };
    recurse(this.rootNode);
  }
  // returns false if row was moved, otherwise true
  ensureRowsAtPixel(rowNodes, pixel, increment = 0) {
    const indexAtPixelNow = this.getRowIndexAtPixel(pixel);
    const rowNodeAtPixelNow = this.getRow(indexAtPixelNow);
    const animate = !this.gos.get("suppressAnimationFrame");
    if (rowNodeAtPixelNow === rowNodes[0]) {
      return false;
    }
    rowNodes.forEach((rowNode) => {
      _2.removeFromArray(this.rootNode.allLeafChildren, rowNode);
    });
    rowNodes.forEach((rowNode, idx) => {
      _2.insertIntoArray(this.rootNode.allLeafChildren, rowNode, Math.max(indexAtPixelNow + increment, 0) + idx);
    });
    this.refreshModel({
      step: ClientSideRowModelSteps.EVERYTHING,
      keepRenderedRows: true,
      keepEditingRows: true,
      animate
    });
    return true;
  }
  highlightRowAtPixel(rowNode, pixel) {
    const indexAtPixelNow = pixel != null ? this.getRowIndexAtPixel(pixel) : null;
    const rowNodeAtPixelNow = indexAtPixelNow != null ? this.getRow(indexAtPixelNow) : null;
    if (!rowNodeAtPixelNow || !rowNode || rowNodeAtPixelNow === rowNode || pixel == null) {
      if (this.lastHighlightedRow) {
        this.lastHighlightedRow.setHighlighted(null);
        this.lastHighlightedRow = null;
      }
      return;
    }
    const highlight = this.getHighlightPosition(pixel, rowNodeAtPixelNow);
    if (this.lastHighlightedRow && this.lastHighlightedRow !== rowNodeAtPixelNow) {
      this.lastHighlightedRow.setHighlighted(null);
      this.lastHighlightedRow = null;
    }
    rowNodeAtPixelNow.setHighlighted(highlight);
    this.lastHighlightedRow = rowNodeAtPixelNow;
  }
  getHighlightPosition(pixel, rowNode) {
    if (!rowNode) {
      const index = this.getRowIndexAtPixel(pixel);
      rowNode = this.getRow(index || 0);
      if (!rowNode) {
        return RowHighlightPosition.Below;
      }
    }
    const { rowTop, rowHeight } = rowNode;
    return pixel - rowTop < rowHeight / 2 ? RowHighlightPosition.Above : RowHighlightPosition.Below;
  }
  getLastHighlightedRowNode() {
    return this.lastHighlightedRow;
  }
  isLastRowIndexKnown() {
    return true;
  }
  getRowCount() {
    if (this.rowsToDisplay) {
      return this.rowsToDisplay.length;
    }
    return 0;
  }
  getTopLevelRowCount() {
    const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
    if (showingRootNode) {
      return 1;
    }
    const filteredChildren = this.rootNode.childrenAfterAggFilter;
    return filteredChildren ? filteredChildren.length : 0;
  }
  getTopLevelRowDisplayedIndex(topLevelIndex) {
    const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
    if (showingRootNode) {
      return topLevelIndex;
    }
    let rowNode = this.rootNode.childrenAfterSort[topLevelIndex];
    if (this.gos.get("groupHideOpenParents")) {
      while (rowNode.expanded && rowNode.childrenAfterSort && rowNode.childrenAfterSort.length > 0) {
        rowNode = rowNode.childrenAfterSort[0];
      }
    }
    return rowNode.rowIndex;
  }
  getRowBounds(index) {
    if (_2.missing(this.rowsToDisplay)) {
      return null;
    }
    const rowNode = this.rowsToDisplay[index];
    if (rowNode) {
      return {
        rowTop: rowNode.rowTop,
        rowHeight: rowNode.rowHeight
      };
    }
    return null;
  }
  onRowGroupOpened() {
    const animate = this.gos.isAnimateRows();
    this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, animate });
  }
  onFilterChanged(event) {
    if (event.afterDataChange) {
      return;
    }
    const animate = this.gos.isAnimateRows();
    const primaryOrQuickFilterChanged = event.columns.length === 0 || event.columns.some((col) => col.isPrimary());
    const step = primaryOrQuickFilterChanged ? ClientSideRowModelSteps.FILTER : ClientSideRowModelSteps.FILTER_AGGREGATES;
    this.refreshModel({ step, keepRenderedRows: true, animate });
  }
  onSortChanged() {
    const animate = this.gos.isAnimateRows();
    this.refreshModel({ step: ClientSideRowModelSteps.SORT, keepRenderedRows: true, animate, keepEditingRows: true });
  }
  getType() {
    return "clientSide";
  }
  onValueChanged() {
    if (this.columnModel.isPivotActive()) {
      this.refreshModel({ step: ClientSideRowModelSteps.PIVOT });
    } else {
      this.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
    }
  }
  createChangePath(rowNodeTransactions) {
    const noTransactions = _2.missingOrEmpty(rowNodeTransactions);
    const changedPath = new ChangedPath(false, this.rootNode);
    if (noTransactions || this.gos.get("treeData")) {
      changedPath.setInactive();
    }
    return changedPath;
  }
  isSuppressModelUpdateAfterUpdateTransaction(params) {
    if (!this.gos.get("suppressModelUpdateAfterUpdateTransaction")) {
      return false;
    }
    if (params.rowNodeTransactions == null) {
      return false;
    }
    const transWithAddsOrDeletes = params.rowNodeTransactions.filter(
      (tx) => tx.add != null && tx.add.length > 0 || tx.remove != null && tx.remove.length > 0
    );
    const transactionsContainUpdatesOnly = transWithAddsOrDeletes == null || transWithAddsOrDeletes.length == 0;
    return transactionsContainUpdatesOnly;
  }
  buildRefreshModelParams(step) {
    let paramsStep = ClientSideRowModelSteps.EVERYTHING;
    const stepsMapped = {
      everything: ClientSideRowModelSteps.EVERYTHING,
      group: ClientSideRowModelSteps.EVERYTHING,
      filter: ClientSideRowModelSteps.FILTER,
      map: ClientSideRowModelSteps.MAP,
      aggregate: ClientSideRowModelSteps.AGGREGATE,
      sort: ClientSideRowModelSteps.SORT,
      pivot: ClientSideRowModelSteps.PIVOT
    };
    if (_2.exists(step)) {
      paramsStep = stepsMapped[step];
    }
    if (_2.missing(paramsStep)) {
      console.error(`AG Grid: invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(", ")}`);
      return void 0;
    }
    const animate = !this.gos.get("suppressAnimationFrame");
    const modelParams = {
      step: paramsStep,
      keepRenderedRows: true,
      keepEditingRows: true,
      animate
    };
    return modelParams;
  }
  refreshModel(paramsOrStep) {
    if (!this.hasStarted || this.isRefreshingModel || this.columnModel.shouldRowModelIgnoreRefresh()) {
      return;
    }
    let params = typeof paramsOrStep === "object" && "step" in paramsOrStep ? paramsOrStep : this.buildRefreshModelParams(paramsOrStep);
    if (!params) {
      return;
    }
    if (this.isSuppressModelUpdateAfterUpdateTransaction(params)) {
      return;
    }
    const changedPath = this.createChangePath(params.rowNodeTransactions);
    this.isRefreshingModel = true;
    switch (params.step) {
      case ClientSideRowModelSteps.EVERYTHING:
        this.doRowGrouping(
          params.rowNodeTransactions,
          params.rowNodeOrder,
          changedPath,
          !!params.afterColumnsChanged
        );
      case ClientSideRowModelSteps.FILTER:
        this.doFilter(changedPath);
      case ClientSideRowModelSteps.PIVOT:
        this.doPivot(changedPath);
      case ClientSideRowModelSteps.AGGREGATE:
        this.doAggregate(changedPath);
      case ClientSideRowModelSteps.FILTER_AGGREGATES:
        this.doFilterAggregates(changedPath);
      case ClientSideRowModelSteps.SORT:
        this.doSort(params.rowNodeTransactions, changedPath);
      case ClientSideRowModelSteps.MAP:
        this.doRowsToDisplay();
    }
    const displayedNodesMapped = this.setRowTopAndRowIndex();
    this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);
    this.isRefreshingModel = false;
    const event = {
      type: Events2.EVENT_MODEL_UPDATED,
      animate: params.animate,
      keepRenderedRows: params.keepRenderedRows,
      newData: params.newData,
      newPage: false,
      keepUndoRedoStack: params.keepUndoRedoStack
    };
    this.eventService.dispatchEvent(event);
  }
  isEmpty() {
    const rowsMissing = _2.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
    return _2.missing(this.rootNode) || rowsMissing || !this.columnModel.isReady();
  }
  isRowsToRender() {
    return _2.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
  }
  getNodesInRangeForSelection(firstInRange, lastInRange) {
    let started = !lastInRange;
    let finished = false;
    const result = [];
    const groupsSelectChildren = this.gos.get("groupSelectsChildren");
    this.forEachNodeAfterFilterAndSort((rowNode) => {
      if (finished) {
        return;
      }
      if (started) {
        if (rowNode === lastInRange || rowNode === firstInRange) {
          finished = true;
          if (rowNode.group && groupsSelectChildren) {
            result.push(...rowNode.allLeafChildren);
            return;
          }
        }
      }
      if (!started) {
        if (rowNode !== lastInRange && rowNode !== firstInRange) {
          return;
        }
        started = true;
      }
      const includeThisNode = !rowNode.group || !groupsSelectChildren;
      if (includeThisNode) {
        result.push(rowNode);
        return;
      }
    });
    return result;
  }
  setDatasource(datasource) {
    console.error("AG Grid: should never call setDatasource on clientSideRowController");
  }
  getTopLevelNodes() {
    return this.rootNode ? this.rootNode.childrenAfterGroup : null;
  }
  getRootNode() {
    return this.rootNode;
  }
  getRow(index) {
    return this.rowsToDisplay[index];
  }
  isRowPresent(rowNode) {
    return this.rowsToDisplay.indexOf(rowNode) >= 0;
  }
  getRowIndexAtPixel(pixelToMatch) {
    if (this.isEmpty() || this.rowsToDisplay.length === 0) {
      return -1;
    }
    let bottomPointer = 0;
    let topPointer = this.rowsToDisplay.length - 1;
    if (pixelToMatch <= 0) {
      return 0;
    }
    const lastNode = _2.last(this.rowsToDisplay);
    if (lastNode.rowTop <= pixelToMatch) {
      return this.rowsToDisplay.length - 1;
    }
    let oldBottomPointer = -1;
    let oldTopPointer = -1;
    while (true) {
      const midPointer = Math.floor((bottomPointer + topPointer) / 2);
      const currentRowNode = this.rowsToDisplay[midPointer];
      if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
        return midPointer;
      }
      if (currentRowNode.rowTop < pixelToMatch) {
        bottomPointer = midPointer + 1;
      } else if (currentRowNode.rowTop > pixelToMatch) {
        topPointer = midPointer - 1;
      }
      const caughtInInfiniteLoop = oldBottomPointer === bottomPointer && oldTopPointer === topPointer;
      if (caughtInInfiniteLoop) {
        return midPointer;
      }
      oldBottomPointer = bottomPointer;
      oldTopPointer = topPointer;
    }
  }
  isRowInPixel(rowNode, pixelToMatch) {
    const topPixel = rowNode.rowTop;
    const bottomPixel = rowNode.rowTop + rowNode.rowHeight;
    const pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
    return pixelInRow;
  }
  forEachLeafNode(callback) {
    if (this.rootNode.allLeafChildren) {
      this.rootNode.allLeafChildren.forEach((rowNode, index) => callback(rowNode, index));
    }
  }
  forEachNode(callback, includeFooterNodes = false) {
    this.recursivelyWalkNodesAndCallback({
      nodes: [...this.rootNode.childrenAfterGroup || []],
      callback,
      recursionType: 0 /* Normal */,
      index: 0,
      includeFooterNodes
    });
  }
  forEachNodeAfterFilter(callback, includeFooterNodes = false) {
    this.recursivelyWalkNodesAndCallback({
      nodes: [...this.rootNode.childrenAfterAggFilter || []],
      callback,
      recursionType: 1 /* AfterFilter */,
      index: 0,
      includeFooterNodes
    });
  }
  forEachNodeAfterFilterAndSort(callback, includeFooterNodes = false) {
    this.recursivelyWalkNodesAndCallback({
      nodes: [...this.rootNode.childrenAfterSort || []],
      callback,
      recursionType: 2 /* AfterFilterAndSort */,
      index: 0,
      includeFooterNodes
    });
  }
  forEachPivotNode(callback, includeFooterNodes = false) {
    this.recursivelyWalkNodesAndCallback({
      nodes: [this.rootNode],
      callback,
      recursionType: 3 /* PivotNodes */,
      index: 0,
      includeFooterNodes
    });
  }
  // iterates through each item in memory, and calls the callback function
  // nodes - the rowNodes to traverse
  // callback - the user provided callback
  // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
  // index - works similar to the index in forEach in javascript's array function
  recursivelyWalkNodesAndCallback(params) {
    const { nodes, callback, recursionType, includeFooterNodes } = params;
    let { index } = params;
    const addFooters = (position) => {
      var _a;
      const parentNode = (_a = nodes[0]) == null ? void 0 : _a.parent;
      if (!parentNode)
        return;
      const grandTotal = includeFooterNodes && this.gos.getGrandTotalRow();
      const isGroupIncludeFooter = this.gos.getGroupTotalRowCallback();
      const groupTotal = includeFooterNodes && isGroupIncludeFooter({ node: parentNode });
      const isRootNode = parentNode === this.rootNode;
      if (isRootNode) {
        if (grandTotal === position) {
          parentNode.createFooter();
          callback(parentNode.sibling, index++);
        }
        return;
      }
      if (groupTotal === position) {
        parentNode.createFooter();
        callback(parentNode.sibling, index++);
      }
    };
    addFooters("top");
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      callback(node, index++);
      if (node.hasChildren() && !node.footer) {
        let nodeChildren = null;
        switch (recursionType) {
          case 0 /* Normal */:
            nodeChildren = node.childrenAfterGroup;
            break;
          case 1 /* AfterFilter */:
            nodeChildren = node.childrenAfterAggFilter;
            break;
          case 2 /* AfterFilterAndSort */:
            nodeChildren = node.childrenAfterSort;
            break;
          case 3 /* PivotNodes */:
            nodeChildren = !node.leafGroup ? node.childrenAfterSort : null;
            break;
        }
        if (nodeChildren) {
          index = this.recursivelyWalkNodesAndCallback({
            nodes: [...nodeChildren],
            callback,
            recursionType,
            index,
            includeFooterNodes
          });
        }
      }
    }
    addFooters("bottom");
    return index;
  }
  // it's possible to recompute the aggregate without doing the other parts
  // + api.refreshClientSideRowModel('aggregate')
  doAggregate(changedPath) {
    var _a;
    (_a = this.aggregationStage) == null ? void 0 : _a.execute({ rowNode: this.rootNode, changedPath });
  }
  doFilterAggregates(changedPath) {
    if (this.filterAggregatesStage) {
      this.filterAggregatesStage.execute({ rowNode: this.rootNode, changedPath });
    } else {
      this.rootNode.childrenAfterAggFilter = this.rootNode.childrenAfterFilter;
    }
  }
  // + gridApi.expandAll()
  // + gridApi.collapseAll()
  expandOrCollapseAll(expand) {
    const usingTreeData = this.gos.get("treeData");
    const usingPivotMode = this.columnModel.isPivotActive();
    const recursiveExpandOrCollapse = (rowNodes) => {
      if (!rowNodes) {
        return;
      }
      rowNodes.forEach((rowNode) => {
        const actionRow = () => {
          rowNode.expanded = expand;
          recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
        };
        if (usingTreeData) {
          const hasChildren = _2.exists(rowNode.childrenAfterGroup);
          if (hasChildren) {
            actionRow();
          }
          return;
        }
        if (usingPivotMode) {
          const notLeafGroup = !rowNode.leafGroup;
          if (notLeafGroup) {
            actionRow();
          }
          return;
        }
        const isRowGroup = rowNode.group;
        if (isRowGroup) {
          actionRow();
        }
      });
    };
    if (this.rootNode) {
      recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
    }
    this.refreshModel({ step: ClientSideRowModelSteps.MAP });
    const eventSource = expand ? "expandAll" : "collapseAll";
    const event = {
      type: Events2.EVENT_EXPAND_COLLAPSE_ALL,
      source: eventSource
    };
    this.eventService.dispatchEvent(event);
  }
  doSort(rowNodeTransactions, changedPath) {
    this.sortStage.execute({
      rowNode: this.rootNode,
      rowNodeTransactions,
      changedPath
    });
  }
  doRowGrouping(rowNodeTransactions, rowNodeOrder, changedPath, afterColumnsChanged) {
    if (this.groupStage) {
      if (rowNodeTransactions) {
        this.groupStage.execute({
          rowNode: this.rootNode,
          rowNodeTransactions,
          rowNodeOrder,
          changedPath
        });
      } else {
        this.groupStage.execute({
          rowNode: this.rootNode,
          changedPath,
          afterColumnsChanged
        });
      }
      if (this.gos.get("groupSelectsChildren")) {
        const selectionChanged = this.selectionService.updateGroupsFromChildrenSelections("rowGroupChanged", changedPath);
        if (selectionChanged) {
          const event = {
            type: Events2.EVENT_SELECTION_CHANGED,
            source: "rowGroupChanged"
          };
          this.eventService.dispatchEvent(event);
        }
      }
    } else {
      this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
      if (this.rootNode.sibling) {
        this.rootNode.sibling.childrenAfterGroup = this.rootNode.childrenAfterGroup;
      }
      this.rootNode.updateHasChildren();
    }
    if (this.nodeManager.isRowCountReady()) {
      this.rowCountReady = true;
      this.eventService.dispatchEventOnce({
        type: Events2.EVENT_ROW_COUNT_READY
      });
    }
  }
  doFilter(changedPath) {
    this.filterStage.execute({ rowNode: this.rootNode, changedPath });
  }
  doPivot(changedPath) {
    var _a;
    (_a = this.pivotStage) == null ? void 0 : _a.execute({ rowNode: this.rootNode, changedPath });
  }
  getCopyOfNodesMap() {
    return this.nodeManager.getCopyOfNodesMap();
  }
  getRowNode(id) {
    const idIsGroup = typeof id == "string" && id.indexOf(RowNode2.ID_PREFIX_ROW_GROUP) == 0;
    if (idIsGroup) {
      let res = void 0;
      this.forEachNode((node) => {
        if (node.id === id) {
          res = node;
        }
      });
      return res;
    }
    return this.nodeManager.getRowNode(id);
  }
  // rows: the rows to put into the model
  setRowData(rowData) {
    this.selectionService.reset("rowDataChanged");
    this.nodeManager.setRowData(rowData);
    if (this.hasStarted) {
      this.dispatchUpdateEventsAndRefresh();
    }
  }
  dispatchUpdateEventsAndRefresh() {
    const rowDataUpdatedEvent = {
      type: Events2.EVENT_ROW_DATA_UPDATED
    };
    this.eventService.dispatchEvent(rowDataUpdatedEvent);
    this.refreshModel({
      step: ClientSideRowModelSteps.EVERYTHING,
      newData: true
    });
  }
  batchUpdateRowData(rowDataTransaction, callback) {
    if (this.applyAsyncTransactionsTimeout == null) {
      this.rowDataTransactionBatch = [];
      const waitMillis = this.gos.getAsyncTransactionWaitMillis();
      this.applyAsyncTransactionsTimeout = window.setTimeout(() => {
        this.executeBatchUpdateRowData();
      }, waitMillis);
    }
    this.rowDataTransactionBatch.push({ rowDataTransaction, callback });
  }
  flushAsyncTransactions() {
    if (this.applyAsyncTransactionsTimeout != null) {
      clearTimeout(this.applyAsyncTransactionsTimeout);
      this.executeBatchUpdateRowData();
    }
  }
  executeBatchUpdateRowData() {
    this.valueCache.onDataChanged();
    const callbackFuncsBound = [];
    const rowNodeTrans = [];
    let forceRowNodeOrder = false;
    if (this.rowDataTransactionBatch) {
      this.rowDataTransactionBatch.forEach((tranItem) => {
        const rowNodeTran = this.nodeManager.updateRowData(tranItem.rowDataTransaction, void 0);
        rowNodeTrans.push(rowNodeTran);
        if (tranItem.callback) {
          callbackFuncsBound.push(tranItem.callback.bind(null, rowNodeTran));
        }
        if (typeof tranItem.rowDataTransaction.addIndex === "number") {
          forceRowNodeOrder = true;
        }
      });
    }
    this.commonUpdateRowData(rowNodeTrans, void 0, forceRowNodeOrder);
    if (callbackFuncsBound.length > 0) {
      window.setTimeout(() => {
        callbackFuncsBound.forEach((func) => func());
      }, 0);
    }
    if (rowNodeTrans.length > 0) {
      const event = {
        type: Events2.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
        results: rowNodeTrans
      };
      this.eventService.dispatchEvent(event);
    }
    this.rowDataTransactionBatch = null;
    this.applyAsyncTransactionsTimeout = void 0;
  }
  updateRowData(rowDataTran, rowNodeOrder) {
    this.valueCache.onDataChanged();
    const rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);
    const forceRowNodeOrder = typeof rowDataTran.addIndex === "number";
    this.commonUpdateRowData([rowNodeTran], rowNodeOrder, forceRowNodeOrder);
    return rowNodeTran;
  }
  createRowNodeOrder() {
    const suppressSortOrder = this.gos.get("suppressMaintainUnsortedOrder");
    if (suppressSortOrder) {
      return;
    }
    const orderMap = {};
    if (this.rootNode && this.rootNode.allLeafChildren) {
      for (let index = 0; index < this.rootNode.allLeafChildren.length; index++) {
        const node = this.rootNode.allLeafChildren[index];
        orderMap[node.id] = index;
      }
    }
    return orderMap;
  }
  // common to updateRowData and batchUpdateRowData
  commonUpdateRowData(rowNodeTrans, rowNodeOrder, forceRowNodeOrder) {
    if (!this.hasStarted) {
      return;
    }
    const animate = !this.gos.get("suppressAnimationFrame");
    if (forceRowNodeOrder) {
      rowNodeOrder = this.createRowNodeOrder();
    }
    const event = {
      type: Events2.EVENT_ROW_DATA_UPDATED
    };
    this.eventService.dispatchEvent(event);
    this.refreshModel({
      step: ClientSideRowModelSteps.EVERYTHING,
      rowNodeTransactions: rowNodeTrans,
      rowNodeOrder,
      keepRenderedRows: true,
      keepEditingRows: true,
      animate
    });
  }
  doRowsToDisplay() {
    this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
  }
  onRowHeightChanged() {
    this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, keepEditingRows: true, keepUndoRedoStack: true });
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
  resetRowHeights() {
    const atLeastOne = this.resetRowHeightsForAllRowNodes();
    this.rootNode.setRowHeight(this.rootNode.rowHeight, true);
    if (this.rootNode.sibling) {
      this.rootNode.sibling.setRowHeight(this.rootNode.sibling.rowHeight, true);
    }
    if (atLeastOne) {
      this.onRowHeightChanged();
    }
  }
  resetRowHeightsForAllRowNodes() {
    let atLeastOne = false;
    this.forEachNode((rowNode) => {
      rowNode.setRowHeight(rowNode.rowHeight, true);
      const detailNode = rowNode.detailNode;
      if (detailNode) {
        detailNode.setRowHeight(detailNode.rowHeight, true);
      }
      if (rowNode.sibling) {
        rowNode.sibling.setRowHeight(rowNode.sibling.rowHeight, true);
      }
      atLeastOne = true;
    });
    return atLeastOne;
  }
  onGridStylesChanges() {
    if (this.columnModel.isAutoRowHeightActive()) {
      return;
    }
    this.resetRowHeights();
  }
  onGridReady() {
    if (this.hasStarted) {
      return;
    }
    this.setInitialData();
  }
  isRowDataLoaded() {
    return this.rowCountReady;
  }
};
__decorateClass([
  Autowired("columnModel")
], ClientSideRowModel.prototype, "columnModel", 2);
__decorateClass([
  Autowired("selectionService")
], ClientSideRowModel.prototype, "selectionService", 2);
__decorateClass([
  Autowired("valueCache")
], ClientSideRowModel.prototype, "valueCache", 2);
__decorateClass([
  Autowired("beans")
], ClientSideRowModel.prototype, "beans", 2);
__decorateClass([
  Autowired("filterStage")
], ClientSideRowModel.prototype, "filterStage", 2);
__decorateClass([
  Autowired("sortStage")
], ClientSideRowModel.prototype, "sortStage", 2);
__decorateClass([
  Autowired("flattenStage")
], ClientSideRowModel.prototype, "flattenStage", 2);
__decorateClass([
  Optional("groupStage")
], ClientSideRowModel.prototype, "groupStage", 2);
__decorateClass([
  Optional("aggregationStage")
], ClientSideRowModel.prototype, "aggregationStage", 2);
__decorateClass([
  Optional("pivotStage")
], ClientSideRowModel.prototype, "pivotStage", 2);
__decorateClass([
  Optional("filterAggregatesStage")
], ClientSideRowModel.prototype, "filterAggregatesStage", 2);
__decorateClass([
  PostConstruct
], ClientSideRowModel.prototype, "init", 1);
ClientSideRowModel = __decorateClass([
  Bean("rowModel")
], ClientSideRowModel);

// community-modules/client-side-row-model/src/clientSideRowModel/filterStage.ts
import {
  Autowired as Autowired2,
  Bean as Bean2,
  BeanStub as BeanStub2
} from "@ag-grid-community/core";
var FilterStage = class extends BeanStub2 {
  execute(params) {
    const { changedPath } = params;
    this.filterService.filter(changedPath);
  }
};
__decorateClass([
  Autowired2("filterService")
], FilterStage.prototype, "filterService", 2);
FilterStage = __decorateClass([
  Bean2("filterStage")
], FilterStage);

// community-modules/client-side-row-model/src/clientSideRowModel/sortStage.ts
import {
  _ as _3,
  Autowired as Autowired3,
  Bean as Bean3,
  BeanStub as BeanStub3
} from "@ag-grid-community/core";
var SortStage = class extends BeanStub3 {
  execute(params) {
    const sortOptions = this.sortController.getSortOptions();
    const sortActive = _3.exists(sortOptions) && sortOptions.length > 0;
    const deltaSort = sortActive && _3.exists(params.rowNodeTransactions) && this.gos.get("deltaSort");
    const sortContainsGroupColumns = sortOptions.some((opt) => {
      const isSortingCoupled = this.gos.isColumnsSortingCoupledToGroup();
      if (isSortingCoupled) {
        return opt.column.isPrimary() && opt.column.isRowGroupActive();
      }
      return !!opt.column.getColDef().showRowGroup;
    });
    this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
  }
};
__decorateClass([
  Autowired3("sortService")
], SortStage.prototype, "sortService", 2);
__decorateClass([
  Autowired3("sortController")
], SortStage.prototype, "sortController", 2);
SortStage = __decorateClass([
  Bean3("sortStage")
], SortStage);

// community-modules/client-side-row-model/src/clientSideRowModel/flattenStage.ts
import {
  _ as _4,
  Autowired as Autowired4,
  Bean as Bean4,
  BeanStub as BeanStub4,
  RowNode as RowNode3
} from "@ag-grid-community/core";
var FlattenStage = class extends BeanStub4 {
  execute(params) {
    const rootNode = params.rowNode;
    const result = [];
    const skipLeafNodes = this.beans.columnModel.isPivotMode();
    const showRootNode = skipLeafNodes && rootNode.leafGroup;
    const topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
    const details = this.getFlattenDetails();
    this.recursivelyAddToRowsToDisplay(details, topList, result, skipLeafNodes, 0);
    const atLeastOneRowPresent = result.length > 0;
    const includeGrandTotalRow = !showRootNode && atLeastOneRowPresent && details.grandTotalRow;
    if (includeGrandTotalRow) {
      rootNode.createFooter();
      const addToTop = details.grandTotalRow === "top";
      this.addRowNodeToRowsToDisplay(details, rootNode.sibling, result, 0, addToTop);
    }
    return result;
  }
  getFlattenDetails() {
    const groupRemoveSingleChildren = this.gos.get("groupRemoveSingleChildren");
    const groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gos.get("groupRemoveLowestSingleChildren");
    return {
      groupRemoveLowestSingleChildren,
      groupRemoveSingleChildren,
      isGroupMultiAutoColumn: this.gos.isGroupMultiAutoColumn(),
      hideOpenParents: this.gos.get("groupHideOpenParents"),
      grandTotalRow: this.gos.getGrandTotalRow(),
      groupTotalRow: this.gos.getGroupTotalRowCallback()
    };
  }
  recursivelyAddToRowsToDisplay(details, rowsToFlatten, result, skipLeafNodes, uiLevel) {
    if (_4.missingOrEmpty(rowsToFlatten)) {
      return;
    }
    for (let i = 0; i < rowsToFlatten.length; i++) {
      const rowNode = rowsToFlatten[i];
      const isParent = rowNode.hasChildren();
      const isSkippedLeafNode = skipLeafNodes && !isParent;
      const isRemovedSingleChildrenGroup = details.groupRemoveSingleChildren && isParent && rowNode.childrenAfterGroup.length === 1;
      const isRemovedLowestSingleChildrenGroup = details.groupRemoveLowestSingleChildren && isParent && rowNode.leafGroup && rowNode.childrenAfterGroup.length === 1;
      const neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
      const isHiddenOpenParent = details.hideOpenParents && rowNode.expanded && !rowNode.master && !neverAllowToExpand;
      const thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent && !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
      if (thisRowShouldBeRendered) {
        this.addRowNodeToRowsToDisplay(details, rowNode, result, uiLevel);
      }
      if (skipLeafNodes && rowNode.leafGroup) {
        continue;
      }
      if (isParent) {
        const excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;
        if (rowNode.expanded || excludedParent) {
          const doesRowShowFooter = details.groupTotalRow({ node: rowNode });
          if (!doesRowShowFooter) {
            rowNode.destroyFooter();
          }
          const uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
          if (doesRowShowFooter === "top") {
            rowNode.createFooter();
            this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
          }
          this.recursivelyAddToRowsToDisplay(
            details,
            rowNode.childrenAfterSort,
            result,
            skipLeafNodes,
            uiLevelForChildren
          );
          if (doesRowShowFooter === "bottom") {
            rowNode.createFooter();
            this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
          }
        }
      } else if (rowNode.master && rowNode.expanded) {
        const detailNode = this.createDetailNode(rowNode);
        this.addRowNodeToRowsToDisplay(details, detailNode, result, uiLevel);
      }
    }
  }
  // duplicated method, it's also in floatingRowModel
  addRowNodeToRowsToDisplay(details, rowNode, result, uiLevel, addToTop) {
    if (addToTop) {
      result.unshift(rowNode);
    } else {
      result.push(rowNode);
    }
    rowNode.setUiLevel(details.isGroupMultiAutoColumn ? 0 : uiLevel);
  }
  createDetailNode(masterNode) {
    if (_4.exists(masterNode.detailNode)) {
      return masterNode.detailNode;
    }
    const detailNode = new RowNode3(this.beans);
    detailNode.detail = true;
    detailNode.selectable = false;
    detailNode.parent = masterNode;
    if (_4.exists(masterNode.id)) {
      detailNode.id = "detail_" + masterNode.id;
    }
    detailNode.data = masterNode.data;
    detailNode.level = masterNode.level + 1;
    masterNode.detailNode = detailNode;
    return detailNode;
  }
};
__decorateClass([
  Autowired4("beans")
], FlattenStage.prototype, "beans", 2);
FlattenStage = __decorateClass([
  Bean4("flattenStage")
], FlattenStage);

// community-modules/client-side-row-model/src/clientSideRowModel/sortService.ts
import {
  _ as _5,
  Autowired as Autowired5,
  Bean as Bean5,
  BeanStub as BeanStub5
} from "@ag-grid-community/core";
var SortService = class extends BeanStub5 {
  sort(sortOptions, sortActive, useDeltaSort, rowNodeTransactions, changedPath, sortContainsGroupColumns) {
    const groupMaintainOrder = this.gos.get("groupMaintainOrder");
    const groupColumnsPresent = this.columnModel.getAllGridColumns().some((c) => c.isRowGroupActive());
    let allDirtyNodes = {};
    if (useDeltaSort && rowNodeTransactions) {
      allDirtyNodes = this.calculateDirtyNodes(rowNodeTransactions);
    }
    const isPivotMode = this.columnModel.isPivotMode();
    const postSortFunc = this.gos.getCallback("postSortRows");
    const callback = (rowNode) => {
      var _a;
      this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterAggFilter, true);
      const skipSortingPivotLeafs = isPivotMode && rowNode.leafGroup;
      let skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
      if (skipSortingGroups) {
        const nextGroup = (_a = this.columnModel.getRowGroupColumns()) == null ? void 0 : _a[rowNode.level + 1];
        const wasSortExplicitlyRemoved = (nextGroup == null ? void 0 : nextGroup.getSort()) === null;
        const childrenToBeSorted = rowNode.childrenAfterAggFilter.slice(0);
        if (rowNode.childrenAfterSort && !wasSortExplicitlyRemoved) {
          const indexedOrders = {};
          rowNode.childrenAfterSort.forEach((node, idx) => {
            indexedOrders[node.id] = idx;
          });
          childrenToBeSorted.sort((row1, row2) => {
            var _a2, _b;
            return ((_a2 = indexedOrders[row1.id]) != null ? _a2 : 0) - ((_b = indexedOrders[row2.id]) != null ? _b : 0);
          });
        }
        rowNode.childrenAfterSort = childrenToBeSorted;
      } else if (!sortActive || skipSortingPivotLeafs) {
        rowNode.childrenAfterSort = rowNode.childrenAfterAggFilter.slice(0);
      } else if (useDeltaSort) {
        rowNode.childrenAfterSort = this.doDeltaSort(rowNode, allDirtyNodes, changedPath, sortOptions);
      } else {
        rowNode.childrenAfterSort = this.rowNodeSorter.doFullSort(rowNode.childrenAfterAggFilter, sortOptions);
      }
      if (rowNode.sibling) {
        rowNode.sibling.childrenAfterSort = rowNode.childrenAfterSort;
      }
      this.updateChildIndexes(rowNode);
      if (postSortFunc) {
        const params = { nodes: rowNode.childrenAfterSort };
        postSortFunc(params);
      }
    };
    if (changedPath) {
      changedPath.forEachChangedNodeDepthFirst(callback);
    }
    this.updateGroupDataForHideOpenParents(changedPath);
  }
  calculateDirtyNodes(rowNodeTransactions) {
    const dirtyNodes = {};
    const addNodesFunc = (rowNodes) => {
      if (rowNodes) {
        rowNodes.forEach((rowNode) => dirtyNodes[rowNode.id] = true);
      }
    };
    if (rowNodeTransactions) {
      rowNodeTransactions.forEach((tran) => {
        addNodesFunc(tran.add);
        addNodesFunc(tran.update);
        addNodesFunc(tran.remove);
      });
    }
    return dirtyNodes;
  }
  doDeltaSort(rowNode, allTouchedNodes, changedPath, sortOptions) {
    const unsortedRows = rowNode.childrenAfterAggFilter;
    const oldSortedRows = rowNode.childrenAfterSort;
    if (!oldSortedRows) {
      return this.rowNodeSorter.doFullSort(unsortedRows, sortOptions);
    }
    const untouchedRowsMap = {};
    const touchedRows = [];
    unsortedRows.forEach((row) => {
      if (allTouchedNodes[row.id] || !changedPath.canSkip(row)) {
        touchedRows.push(row);
      } else {
        untouchedRowsMap[row.id] = true;
      }
    });
    const sortedUntouchedRows = oldSortedRows.filter((child) => untouchedRowsMap[child.id]);
    const mapNodeToSortedNode = (rowNode2, pos) => ({ currentPos: pos, rowNode: rowNode2 });
    const sortedChangedRows = touchedRows.map(mapNodeToSortedNode).sort((a, b) => this.rowNodeSorter.compareRowNodes(sortOptions, a, b));
    return this.mergeSortedArrays(
      sortOptions,
      sortedChangedRows,
      sortedUntouchedRows.map(mapNodeToSortedNode)
    ).map(({ rowNode: rowNode2 }) => rowNode2);
  }
  // Merge two sorted arrays into each other
  mergeSortedArrays(sortOptions, arr1, arr2) {
    const res = [];
    let i = 0;
    let j = 0;
    while (i < arr1.length && j < arr2.length) {
      const compareResult = this.rowNodeSorter.compareRowNodes(sortOptions, arr1[i], arr2[j]);
      if (compareResult < 0) {
        res.push(arr1[i++]);
      } else {
        res.push(arr2[j++]);
      }
    }
    while (i < arr1.length) {
      res.push(arr1[i++]);
    }
    while (j < arr2.length) {
      res.push(arr2[j++]);
    }
    return res;
  }
  updateChildIndexes(rowNode) {
    if (_5.missing(rowNode.childrenAfterSort)) {
      return;
    }
    const listToSort = rowNode.childrenAfterSort;
    for (let i = 0; i < listToSort.length; i++) {
      const child = listToSort[i];
      const firstChild = i === 0;
      const lastChild = i === rowNode.childrenAfterSort.length - 1;
      child.setFirstChild(firstChild);
      child.setLastChild(lastChild);
      child.setChildIndex(i);
    }
  }
  updateGroupDataForHideOpenParents(changedPath) {
    if (!this.gos.get("groupHideOpenParents")) {
      return;
    }
    if (this.gos.get("treeData")) {
      _5.warnOnce(`The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them.`);
      return false;
    }
    const callback = (rowNode) => {
      this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
      rowNode.childrenAfterSort.forEach((child) => {
        if (child.hasChildren()) {
          callback(child);
        }
      });
    };
    if (changedPath) {
      changedPath.executeFromRootNode((rowNode) => callback(rowNode));
    }
  }
  pullDownGroupDataForHideOpenParents(rowNodes, clearOperation) {
    if (!this.gos.get("groupHideOpenParents") || _5.missing(rowNodes)) {
      return;
    }
    rowNodes.forEach((childRowNode) => {
      const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
      groupDisplayCols.forEach((groupDisplayCol) => {
        const showRowGroup = groupDisplayCol.getColDef().showRowGroup;
        if (typeof showRowGroup !== "string") {
          console.error("AG Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup");
          return;
        }
        const displayingGroupKey = showRowGroup;
        const rowGroupColumn = this.columnModel.getPrimaryColumn(displayingGroupKey);
        const thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
        if (thisRowNodeMatches) {
          return;
        }
        if (clearOperation) {
          childRowNode.setGroupValue(groupDisplayCol.getId(), void 0);
        } else {
          const parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
          if (parentToStealFrom) {
            childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
          }
        }
      });
    });
  }
};
__decorateClass([
  Autowired5("columnModel")
], SortService.prototype, "columnModel", 2);
__decorateClass([
  Autowired5("rowNodeSorter")
], SortService.prototype, "rowNodeSorter", 2);
SortService = __decorateClass([
  Bean5("sortService")
], SortService);

// community-modules/client-side-row-model/src/clientSideRowModel/filterService.ts
import {
  Autowired as Autowired6,
  Bean as Bean6,
  BeanStub as BeanStub6
} from "@ag-grid-community/core";
var FilterService = class extends BeanStub6 {
  filter(changedPath) {
    const filterActive = this.filterManager.isChildFilterPresent();
    this.filterNodes(filterActive, changedPath);
  }
  filterNodes(filterActive, changedPath) {
    const filterCallback = (rowNode, includeChildNodes) => {
      if (rowNode.hasChildren()) {
        if (filterActive && !includeChildNodes) {
          rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter((childNode) => {
            const passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
            const passBecauseDataPasses = childNode.data && this.filterManager.doesRowPassFilter({ rowNode: childNode });
            return passBecauseChildren || passBecauseDataPasses;
          });
        } else {
          rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
        }
      } else {
        rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
      }
      if (rowNode.sibling) {
        rowNode.sibling.childrenAfterFilter = rowNode.childrenAfterFilter;
      }
    };
    if (this.doingTreeDataFiltering()) {
      const treeDataDepthFirstFilter = (rowNode, alreadyFoundInParent) => {
        if (rowNode.childrenAfterGroup) {
          for (let i = 0; i < rowNode.childrenAfterGroup.length; i++) {
            const childNode = rowNode.childrenAfterGroup[i];
            const foundInParent = alreadyFoundInParent || this.filterManager.doesRowPassFilter({ rowNode: childNode });
            if (childNode.childrenAfterGroup) {
              treeDataDepthFirstFilter(rowNode.childrenAfterGroup[i], foundInParent);
            } else {
              filterCallback(childNode, foundInParent);
            }
          }
        }
        filterCallback(rowNode, alreadyFoundInParent);
      };
      const treeDataFilterCallback = (rowNode) => treeDataDepthFirstFilter(rowNode, false);
      changedPath.executeFromRootNode(treeDataFilterCallback);
    } else {
      const defaultFilterCallback = (rowNode) => filterCallback(rowNode, false);
      changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
    }
  }
  doingTreeDataFiltering() {
    return this.gos.get("treeData") && !this.gos.get("excludeChildrenWhenTreeDataFiltering");
  }
};
__decorateClass([
  Autowired6("filterManager")
], FilterService.prototype, "filterManager", 2);
FilterService = __decorateClass([
  Bean6("filterService")
], FilterService);

// community-modules/client-side-row-model/src/clientSideRowModel/immutableService.ts
import {
  Autowired as Autowired7,
  Bean as Bean7,
  BeanStub as BeanStub7,
  PostConstruct as PostConstruct2,
  _ as _6
} from "@ag-grid-community/core";
var ImmutableService = class extends BeanStub7 {
  postConstruct() {
    if (this.rowModel.getType() === "clientSide") {
      this.clientSideRowModel = this.rowModel;
      this.addManagedPropertyListener("rowData", () => this.onRowDataUpdated());
    }
  }
  isActive() {
    const getRowIdProvided = this.gos.exists("getRowId");
    const resetRowDataOnUpdate = this.gos.get("resetRowDataOnUpdate");
    if (resetRowDataOnUpdate) {
      return false;
    }
    return getRowIdProvided;
  }
  setRowData(rowData) {
    const transactionAndMap = this.createTransactionForRowData(rowData);
    if (!transactionAndMap) {
      return;
    }
    const [transaction, orderIdMap] = transactionAndMap;
    this.clientSideRowModel.updateRowData(transaction, orderIdMap);
  }
  // converts the setRowData() command to a transaction
  createTransactionForRowData(rowData) {
    if (_6.missing(this.clientSideRowModel)) {
      console.error("AG Grid: ImmutableService only works with ClientSideRowModel");
      return;
    }
    const getRowIdFunc = this.gos.getCallback("getRowId");
    if (getRowIdFunc == null) {
      console.error("AG Grid: ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!");
      return;
    }
    const transaction = {
      remove: [],
      update: [],
      add: []
    };
    const existingNodesMap = this.clientSideRowModel.getCopyOfNodesMap();
    const suppressSortOrder = this.gos.get("suppressMaintainUnsortedOrder");
    const orderMap = suppressSortOrder ? void 0 : {};
    if (_6.exists(rowData)) {
      rowData.forEach((data, index) => {
        const id = getRowIdFunc({ data, level: 0 });
        const existingNode = existingNodesMap[id];
        if (orderMap) {
          orderMap[id] = index;
        }
        if (existingNode) {
          const dataHasChanged = existingNode.data !== data;
          if (dataHasChanged) {
            transaction.update.push(data);
          }
          existingNodesMap[id] = void 0;
        } else {
          transaction.add.push(data);
        }
      });
    }
    _6.iterateObject(existingNodesMap, (id, rowNode) => {
      if (rowNode) {
        transaction.remove.push(rowNode.data);
      }
    });
    return [transaction, orderMap];
  }
  onRowDataUpdated() {
    const rowData = this.gos.get("rowData");
    if (!rowData) {
      return;
    }
    if (this.isActive()) {
      this.setRowData(rowData);
    } else {
      this.selectionService.reset("rowDataChanged");
      this.clientSideRowModel.setRowData(rowData);
    }
  }
};
__decorateClass([
  Autowired7("rowModel")
], ImmutableService.prototype, "rowModel", 2);
__decorateClass([
  Autowired7("rowRenderer")
], ImmutableService.prototype, "rowRenderer", 2);
__decorateClass([
  Autowired7("selectionService")
], ImmutableService.prototype, "selectionService", 2);
__decorateClass([
  PostConstruct2
], ImmutableService.prototype, "postConstruct", 1);
ImmutableService = __decorateClass([
  Bean7("immutableService")
], ImmutableService);

// community-modules/client-side-row-model/src/version.ts
var VERSION = "31.3.4";

// community-modules/client-side-row-model/src/clientSideRowModelModule.ts
var ClientSideRowModelModule = {
  version: VERSION,
  moduleName: ModuleNames.ClientSideRowModelModule,
  rowModel: "clientSide",
  beans: [ClientSideRowModel, FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService]
};
export {
  ClientSideRowModelModule
};
