var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/row-grouping/src/main.ts
var main_exports = {};
__export(main_exports, {
  PivotDropZonePanel: () => PivotDropZonePanel,
  RowGroupDropZonePanel: () => RowGroupDropZonePanel,
  RowGroupingModule: () => RowGroupingModule,
  ValuesDropZonePanel: () => ValuesDropZonePanel
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/row-grouping/src/rowGroupingModule.ts
var import_core14 = require("@ag-grid-community/core");
var import_core15 = require("@ag-grid-enterprise/core");

// enterprise-modules/row-grouping/src/rowGrouping/aggregationStage.ts
var import_core = require("@ag-grid-community/core");
var AggregationStage = class extends import_core.BeanStub {
  // it's possible to recompute the aggregate without doing the other parts
  // + api.refreshClientSideRowModel('aggregate')
  execute(params) {
    const noValueColumns = import_core._.missingOrEmpty(this.columnModel.getValueColumns());
    const noUserAgg = !this.gos.getCallback("getGroupRowAgg");
    const changedPathActive = params.changedPath && params.changedPath.isActive();
    if (noValueColumns && noUserAgg && changedPathActive) {
      return;
    }
    const aggDetails = this.createAggDetails(params);
    this.recursivelyCreateAggData(aggDetails);
  }
  createAggDetails(params) {
    const pivotActive = this.columnModel.isPivotActive();
    const measureColumns = this.columnModel.getValueColumns();
    const pivotColumns = pivotActive ? this.columnModel.getPivotColumns() : [];
    const aggDetails = {
      alwaysAggregateAtRootLevel: this.gos.get("alwaysAggregateAtRootLevel"),
      groupIncludeTotalFooter: !!this.gos.getGrandTotalRow(),
      changedPath: params.changedPath,
      valueColumns: measureColumns,
      pivotColumns,
      filteredOnly: !this.isSuppressAggFilteredOnly(),
      userAggFunc: this.gos.getCallback("getGroupRowAgg")
    };
    return aggDetails;
  }
  isSuppressAggFilteredOnly() {
    const isGroupAggFiltering = this.gos.getGroupAggFiltering() !== void 0;
    return isGroupAggFiltering || this.gos.get("suppressAggFilteredOnly");
  }
  recursivelyCreateAggData(aggDetails) {
    const callback = (rowNode) => {
      const hasNoChildren = !rowNode.hasChildren();
      if (hasNoChildren) {
        if (rowNode.aggData) {
          rowNode.setAggData(null);
        }
        return;
      }
      const isRootNode = rowNode.level === -1;
      if (isRootNode && !aggDetails.groupIncludeTotalFooter) {
        const notPivoting = !this.columnModel.isPivotMode();
        if (!aggDetails.alwaysAggregateAtRootLevel && notPivoting) {
          rowNode.setAggData(null);
          return;
        }
      }
      this.aggregateRowNode(rowNode, aggDetails);
    };
    aggDetails.changedPath.forEachChangedNodeDepthFirst(callback, true);
  }
  aggregateRowNode(rowNode, aggDetails) {
    const measureColumnsMissing = aggDetails.valueColumns.length === 0;
    const pivotColumnsMissing = aggDetails.pivotColumns.length === 0;
    let aggResult;
    if (aggDetails.userAggFunc) {
      aggResult = aggDetails.userAggFunc({ nodes: rowNode.childrenAfterFilter });
    } else if (measureColumnsMissing) {
      aggResult = null;
    } else if (pivotColumnsMissing) {
      aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, aggDetails);
    } else {
      aggResult = this.aggregateRowNodeUsingValuesAndPivot(rowNode);
    }
    rowNode.setAggData(aggResult);
    if (rowNode.sibling) {
      rowNode.sibling.setAggData(aggResult);
    }
  }
  aggregateRowNodeUsingValuesAndPivot(rowNode) {
    var _a, _b;
    const result = {};
    const secondaryColumns = (_a = this.columnModel.getSecondaryColumns()) != null ? _a : [];
    let canSkipTotalColumns = true;
    for (let i = 0; i < secondaryColumns.length; i++) {
      const secondaryCol = secondaryColumns[i];
      const colDef = secondaryCol.getColDef();
      if (colDef.pivotTotalColumnIds != null) {
        canSkipTotalColumns = false;
        continue;
      }
      const keys = (_b = colDef.pivotKeys) != null ? _b : [];
      let values;
      if (rowNode.leafGroup) {
        values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, colDef.pivotValueColumn);
      } else {
        values = this.getValuesPivotNonLeaf(rowNode, colDef.colId);
      }
      result[colDef.colId] = this.aggregateValues(values, colDef.pivotValueColumn.getAggFunc(), colDef.pivotValueColumn, rowNode, secondaryCol);
    }
    if (!canSkipTotalColumns) {
      for (let i = 0; i < secondaryColumns.length; i++) {
        const secondaryCol = secondaryColumns[i];
        const colDef = secondaryCol.getColDef();
        if (colDef.pivotTotalColumnIds == null || !colDef.pivotTotalColumnIds.length) {
          continue;
        }
        const aggResults = colDef.pivotTotalColumnIds.map((currentColId) => result[currentColId]);
        result[colDef.colId] = this.aggregateValues(aggResults, colDef.pivotValueColumn.getAggFunc(), colDef.pivotValueColumn, rowNode, secondaryCol);
      }
    }
    return result;
  }
  aggregateRowNodeUsingValuesOnly(rowNode, aggDetails) {
    const result = {};
    const changedValueColumns = aggDetails.changedPath.isActive() ? aggDetails.changedPath.getValueColumnsForNode(rowNode, aggDetails.valueColumns) : aggDetails.valueColumns;
    const notChangedValueColumns = aggDetails.changedPath.isActive() ? aggDetails.changedPath.getNotValueColumnsForNode(rowNode, aggDetails.valueColumns) : null;
    const values2d = this.getValuesNormal(rowNode, changedValueColumns, aggDetails.filteredOnly);
    const oldValues = rowNode.aggData;
    changedValueColumns.forEach((valueColumn, index) => {
      result[valueColumn.getId()] = this.aggregateValues(values2d[index], valueColumn.getAggFunc(), valueColumn, rowNode);
    });
    if (notChangedValueColumns && oldValues) {
      notChangedValueColumns.forEach((valueColumn) => {
        result[valueColumn.getId()] = oldValues[valueColumn.getId()];
      });
    }
    return result;
  }
  getValuesPivotNonLeaf(rowNode, colId) {
    return rowNode.childrenAfterFilter.map((childNode) => childNode.aggData[colId]);
  }
  getValuesFromMappedSet(mappedSet, keys, valueColumn) {
    let mapPointer = mappedSet;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      mapPointer = mapPointer ? mapPointer[key] : null;
    }
    if (!mapPointer) {
      return [];
    }
    return mapPointer.map((rowNode) => this.valueService.getValue(valueColumn, rowNode));
  }
  getValuesNormal(rowNode, valueColumns, filteredOnly) {
    const values = [];
    valueColumns.forEach(() => values.push([]));
    const valueColumnCount = valueColumns.length;
    const nodeList = filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup;
    const rowCount = nodeList.length;
    for (let i = 0; i < rowCount; i++) {
      const childNode = nodeList[i];
      for (let j = 0; j < valueColumnCount; j++) {
        const valueColumn = valueColumns[j];
        const value = this.valueService.getValue(valueColumn, childNode);
        values[j].push(value);
      }
    }
    return values;
  }
  aggregateValues(values, aggFuncOrString, column, rowNode, pivotResultColumn) {
    const aggFunc = typeof aggFuncOrString === "string" ? this.aggFuncService.getAggFunc(aggFuncOrString) : aggFuncOrString;
    if (typeof aggFunc !== "function") {
      console.error(`AG Grid: unrecognised aggregation function ${aggFuncOrString}`);
      return null;
    }
    const aggFuncAny = aggFunc;
    const params = this.gos.addGridCommonParams({
      values,
      column,
      colDef: column ? column.getColDef() : void 0,
      pivotResultColumn,
      rowNode,
      data: rowNode ? rowNode.data : void 0
    });
    return aggFuncAny(params);
  }
};
__decorateClass([
  (0, import_core.Autowired)("columnModel")
], AggregationStage.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core.Autowired)("valueService")
], AggregationStage.prototype, "valueService", 2);
__decorateClass([
  (0, import_core.Autowired)("aggFuncService")
], AggregationStage.prototype, "aggFuncService", 2);
AggregationStage = __decorateClass([
  (0, import_core.Bean)("aggregationStage")
], AggregationStage);

// enterprise-modules/row-grouping/src/rowGrouping/groupStage.ts
var import_core2 = require("@ag-grid-community/core");

// enterprise-modules/row-grouping/src/rowGrouping/batchRemover.ts
var BatchRemover = class {
  constructor() {
    this.allSets = {};
    this.allParents = [];
  }
  removeFromChildrenAfterGroup(parent, child) {
    const set = this.getSet(parent);
    set.removeFromChildrenAfterGroup[child.id] = true;
  }
  isRemoveFromAllLeafChildren(parent, child) {
    const set = this.getSet(parent);
    return !!set.removeFromAllLeafChildren[child.id];
  }
  preventRemoveFromAllLeafChildren(parent, child) {
    const set = this.getSet(parent);
    delete set.removeFromAllLeafChildren[child.id];
  }
  removeFromAllLeafChildren(parent, child) {
    const set = this.getSet(parent);
    set.removeFromAllLeafChildren[child.id] = true;
  }
  getSet(parent) {
    if (!this.allSets[parent.id]) {
      this.allSets[parent.id] = {
        removeFromAllLeafChildren: {},
        removeFromChildrenAfterGroup: {}
      };
      this.allParents.push(parent);
    }
    return this.allSets[parent.id];
  }
  getAllParents() {
    return this.allParents;
  }
  flush() {
    this.allParents.forEach((parent) => {
      const nodeDetails = this.allSets[parent.id];
      parent.childrenAfterGroup = parent.childrenAfterGroup.filter(
        (child) => !nodeDetails.removeFromChildrenAfterGroup[child.id]
      );
      parent.allLeafChildren = parent.allLeafChildren.filter(
        (child) => !nodeDetails.removeFromAllLeafChildren[child.id]
      );
      parent.updateHasChildren();
      if (parent.sibling) {
        parent.sibling.childrenAfterGroup = parent.childrenAfterGroup;
        parent.sibling.allLeafChildren = parent.allLeafChildren;
      }
    });
    this.allSets = {};
    this.allParents.length = 0;
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/groupStage.ts
var GroupStage = class extends import_core2.BeanStub {
  execute(params) {
    const details = this.createGroupingDetails(params);
    if (details.transactions) {
      this.handleTransaction(details);
    } else {
      const afterColsChanged = params.afterColumnsChanged === true;
      this.shotgunResetEverything(details, afterColsChanged);
    }
    if (!details.usingTreeData) {
      this.positionLeafsAndGroups(params.changedPath);
      this.orderGroups(details);
    }
    this.selectableService.updateSelectableAfterGrouping();
  }
  positionLeafsAndGroups(changedPath) {
    changedPath.forEachChangedNodeDepthFirst((group) => {
      if (group.childrenAfterGroup) {
        const leafNodes = [];
        const groupNodes = [];
        let unbalancedNode;
        group.childrenAfterGroup.forEach((row) => {
          var _a;
          if (!((_a = row.childrenAfterGroup) == null ? void 0 : _a.length)) {
            leafNodes.push(row);
          } else {
            if (row.key === "" && !unbalancedNode) {
              unbalancedNode = row;
            } else {
              groupNodes.push(row);
            }
          }
        });
        if (unbalancedNode) {
          groupNodes.push(unbalancedNode);
        }
        group.childrenAfterGroup = [...leafNodes, ...groupNodes];
      }
    }, false);
  }
  createGroupingDetails(params) {
    var _a;
    const { rowNode, changedPath, rowNodeTransactions, rowNodeOrder } = params;
    const usingTreeData = this.gos.get("treeData");
    const groupedCols = usingTreeData ? null : this.columnModel.getRowGroupColumns();
    const details = {
      // someone complained that the parent attribute was causing some change detection
      // to break in an angular add-on.  Taking the parent out breaks a cyclic dependency, hence this flag got introduced.
      includeParents: !this.gos.get("suppressParentsInRowNodes"),
      expandByDefault: this.gos.get("groupDefaultExpanded"),
      groupedCols,
      rootNode: rowNode,
      pivotMode: this.columnModel.isPivotMode(),
      groupedColCount: usingTreeData || !groupedCols ? 0 : groupedCols.length,
      rowNodeOrder,
      transactions: rowNodeTransactions,
      // if no transaction, then it's shotgun, changed path would be 'not active' at this point anyway
      changedPath,
      groupAllowUnbalanced: this.gos.get("groupAllowUnbalanced"),
      isGroupOpenByDefault: this.gos.getCallback("isGroupOpenByDefault"),
      initialGroupOrderComparator: this.gos.getCallback("initialGroupOrderComparator"),
      usingTreeData,
      suppressGroupMaintainValueType: this.gos.get("suppressGroupMaintainValueType"),
      getDataPath: usingTreeData ? this.gos.get("getDataPath") : void 0,
      keyCreators: (_a = groupedCols == null ? void 0 : groupedCols.map((column) => column.getColDef().keyCreator)) != null ? _a : []
    };
    return details;
  }
  handleTransaction(details) {
    details.transactions.forEach((tran) => {
      const batchRemover = !details.usingTreeData ? new BatchRemover() : void 0;
      if (import_core2._.existsAndNotEmpty(tran.remove)) {
        this.removeNodes(tran.remove, details, batchRemover);
      }
      if (import_core2._.existsAndNotEmpty(tran.update)) {
        this.moveNodesInWrongPath(tran.update, details, batchRemover);
      }
      if (import_core2._.existsAndNotEmpty(tran.add)) {
        this.insertNodes(tran.add, details, false);
      }
      if (batchRemover) {
        const parentsWithChildrenRemoved = batchRemover.getAllParents().slice();
        batchRemover.flush();
        this.removeEmptyGroups(parentsWithChildrenRemoved, details);
      }
    });
    if (details.rowNodeOrder) {
      this.sortChildren(details);
    }
  }
  // this is used when doing delta updates, eg Redux, keeps nodes in right order
  sortChildren(details) {
    details.changedPath.forEachChangedNodeDepthFirst((node) => {
      if (!node.childrenAfterGroup) {
        return;
      }
      const didSort = import_core2._.sortRowNodesByOrder(node.childrenAfterGroup, details.rowNodeOrder);
      if (didSort) {
        details.changedPath.addParentNode(node);
      }
    }, false, true);
  }
  orderGroups(details) {
    const comparator = details.initialGroupOrderComparator;
    if (import_core2._.exists(comparator)) {
      recursiveSort(details.rootNode);
    }
    function recursiveSort(rowNode) {
      const doSort = import_core2._.exists(rowNode.childrenAfterGroup) && // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
      !rowNode.leafGroup;
      if (doSort) {
        rowNode.childrenAfterGroup.sort((nodeA, nodeB) => comparator({ nodeA, nodeB }));
        rowNode.childrenAfterGroup.forEach((childNode) => recursiveSort(childNode));
      }
    }
  }
  getExistingPathForNode(node, details) {
    const res = [];
    let pointer = details.usingTreeData ? node : node.parent;
    while (pointer && pointer !== details.rootNode) {
      res.push({
        key: pointer.key,
        rowGroupColumn: pointer.rowGroupColumn,
        field: pointer.field
      });
      pointer = pointer.parent;
    }
    res.reverse();
    return res;
  }
  moveNodesInWrongPath(childNodes, details, batchRemover) {
    childNodes.forEach((childNode) => {
      if (details.changedPath.isActive()) {
        details.changedPath.addParentNode(childNode.parent);
      }
      const infoToKeyMapper = (item) => item.key;
      const oldPath = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
      const newPath = this.getGroupInfo(childNode, details).map(infoToKeyMapper);
      const nodeInCorrectPath = import_core2._.areEqual(oldPath, newPath);
      if (!nodeInCorrectPath) {
        this.moveNode(childNode, details, batchRemover);
      }
    });
  }
  moveNode(childNode, details, batchRemover) {
    this.removeNodesInStages([childNode], details, batchRemover);
    this.insertOneNode(childNode, details, true, batchRemover);
    childNode.setData(childNode.data);
    if (details.changedPath.isActive()) {
      const newParent = childNode.parent;
      details.changedPath.addParentNode(newParent);
    }
  }
  removeNodes(leafRowNodes, details, batchRemover) {
    this.removeNodesInStages(leafRowNodes, details, batchRemover);
    if (details.changedPath.isActive()) {
      leafRowNodes.forEach((rowNode) => details.changedPath.addParentNode(rowNode.parent));
    }
  }
  removeNodesInStages(leafRowNodes, details, batchRemover) {
    this.removeNodesFromParents(leafRowNodes, details, batchRemover);
    if (details.usingTreeData) {
      this.postRemoveCreateFillerNodes(leafRowNodes, details);
      const nodeParents = leafRowNodes.map((n) => n.parent);
      this.removeEmptyGroups(nodeParents, details);
    }
  }
  forEachParentGroup(details, group, callback) {
    let pointer = group;
    while (pointer && pointer !== details.rootNode) {
      callback(pointer);
      pointer = pointer.parent;
    }
  }
  removeNodesFromParents(nodesToRemove, details, provided) {
    const batchRemoverIsLocal = provided == null;
    const batchRemoverToUse = provided ? provided : new BatchRemover();
    nodesToRemove.forEach((nodeToRemove) => {
      this.removeFromParent(nodeToRemove, batchRemoverToUse);
      this.forEachParentGroup(details, nodeToRemove.parent, (parentNode) => {
        batchRemoverToUse.removeFromAllLeafChildren(parentNode, nodeToRemove);
      });
    });
    if (batchRemoverIsLocal) {
      batchRemoverToUse.flush();
    }
  }
  postRemoveCreateFillerNodes(nodesToRemove, details) {
    nodesToRemove.forEach((nodeToRemove) => {
      const replaceWithGroup = nodeToRemove.hasChildren();
      if (replaceWithGroup) {
        const oldPath = this.getExistingPathForNode(nodeToRemove, details);
        const newGroupNode = this.findParentForNode(nodeToRemove, oldPath, details);
        newGroupNode.expanded = nodeToRemove.expanded;
        newGroupNode.allLeafChildren = nodeToRemove.allLeafChildren;
        newGroupNode.childrenAfterGroup = nodeToRemove.childrenAfterGroup;
        newGroupNode.childrenMapped = nodeToRemove.childrenMapped;
        newGroupNode.updateHasChildren();
        newGroupNode.childrenAfterGroup.forEach((rowNode) => rowNode.parent = newGroupNode);
      }
    });
  }
  removeEmptyGroups(possibleEmptyGroups, details) {
    let checkAgain = true;
    const groupShouldBeRemoved = (rowNode) => {
      const mapKey = this.getChildrenMappedKey(rowNode.key, rowNode.rowGroupColumn);
      const parentRowNode = rowNode.parent;
      const groupAlreadyRemoved = parentRowNode && parentRowNode.childrenMapped ? !parentRowNode.childrenMapped[mapKey] : true;
      if (groupAlreadyRemoved) {
        return false;
      }
      return !!rowNode.isEmptyRowGroupNode();
    };
    while (checkAgain) {
      checkAgain = false;
      const batchRemover = new BatchRemover();
      possibleEmptyGroups.forEach((possibleEmptyGroup) => {
        this.forEachParentGroup(details, possibleEmptyGroup, (rowNode) => {
          if (groupShouldBeRemoved(rowNode)) {
            checkAgain = true;
            this.removeFromParent(rowNode, batchRemover);
            rowNode.setSelectedParams({ newValue: false, source: "rowGroupChanged" });
          }
        });
      });
      batchRemover.flush();
    }
  }
  // removes the node from the parent by:
  // a) removing from childrenAfterGroup (using batchRemover if present, otherwise immediately)
  // b) removing from childrenMapped (immediately)
  // c) setRowTop(null) - as the rowRenderer uses this to know the RowNode is no longer needed
  // d) setRowIndex(null) - as the rowNode will no longer be displayed.
  removeFromParent(child, batchRemover) {
    if (child.parent) {
      if (batchRemover) {
        batchRemover.removeFromChildrenAfterGroup(child.parent, child);
      } else {
        import_core2._.removeFromArray(child.parent.childrenAfterGroup, child);
        child.parent.updateHasChildren();
      }
    }
    const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
    if (child.parent && child.parent.childrenMapped) {
      child.parent.childrenMapped[mapKey] = void 0;
    }
    child.setRowTop(null);
    child.setRowIndex(null);
  }
  addToParent(child, parent) {
    const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
    if (parent) {
      const children = parent.childrenMapped != null;
      if (children) {
        parent.childrenMapped[mapKey] = child;
      }
      parent.childrenAfterGroup.push(child);
      parent.updateHasChildren();
    }
  }
  areGroupColsEqual(d1, d2) {
    if (d1 == null || d2 == null || d1.pivotMode !== d2.pivotMode) {
      return false;
    }
    return import_core2._.areEqual(d1.groupedCols, d2.groupedCols) && import_core2._.areEqual(d1.keyCreators, d2.keyCreators);
  }
  checkAllGroupDataAfterColsChanged(details) {
    const recurse = (rowNodes) => {
      if (!rowNodes) {
        return;
      }
      rowNodes.forEach((rowNode) => {
        const isLeafNode = !details.usingTreeData && !rowNode.group;
        if (isLeafNode) {
          return;
        }
        const groupInfo = {
          field: rowNode.field,
          key: rowNode.key,
          rowGroupColumn: rowNode.rowGroupColumn,
          leafNode: rowNode.allLeafChildren[0]
        };
        this.setGroupData(rowNode, groupInfo, details);
        recurse(rowNode.childrenAfterGroup);
      });
    };
    recurse(details.rootNode.childrenAfterGroup);
  }
  shotgunResetEverything(details, afterColumnsChanged) {
    if (this.noChangeInGroupingColumns(details, afterColumnsChanged)) {
      return;
    }
    this.selectionService.filterFromSelection((node) => node && !node.group);
    const { rootNode, groupedCols } = details;
    rootNode.leafGroup = details.usingTreeData ? false : groupedCols.length === 0;
    rootNode.childrenAfterGroup = [];
    rootNode.childrenMapped = {};
    rootNode.updateHasChildren();
    const sibling = rootNode.sibling;
    if (sibling) {
      sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
      sibling.childrenMapped = rootNode.childrenMapped;
    }
    this.insertNodes(rootNode.allLeafChildren, details, false);
  }
  noChangeInGroupingColumns(details, afterColumnsChanged) {
    let noFurtherProcessingNeeded = false;
    const groupDisplayColumns = this.columnModel.getGroupDisplayColumns();
    const newGroupDisplayColIds = groupDisplayColumns ? groupDisplayColumns.map((c) => c.getId()).join("-") : "";
    if (afterColumnsChanged) {
      noFurtherProcessingNeeded = details.usingTreeData || this.areGroupColsEqual(details, this.oldGroupingDetails);
      if (this.oldGroupDisplayColIds !== newGroupDisplayColIds) {
        this.checkAllGroupDataAfterColsChanged(details);
      }
    }
    this.oldGroupingDetails = details;
    this.oldGroupDisplayColIds = newGroupDisplayColIds;
    return noFurtherProcessingNeeded;
  }
  insertNodes(newRowNodes, details, isMove) {
    newRowNodes.forEach((rowNode) => {
      this.insertOneNode(rowNode, details, isMove);
      if (details.changedPath.isActive()) {
        details.changedPath.addParentNode(rowNode.parent);
      }
    });
  }
  insertOneNode(childNode, details, isMove, batchRemover) {
    const path = this.getGroupInfo(childNode, details);
    const parentGroup = this.findParentForNode(childNode, path, details, batchRemover);
    if (!parentGroup.group) {
      console.warn(
        `AG Grid: duplicate group keys for row data, keys should be unique`,
        [parentGroup.data, childNode.data]
      );
    }
    if (details.usingTreeData) {
      this.swapGroupWithUserNode(parentGroup, childNode, isMove);
    } else {
      childNode.parent = parentGroup;
      childNode.level = path.length;
      parentGroup.childrenAfterGroup.push(childNode);
      parentGroup.updateHasChildren();
    }
  }
  findParentForNode(childNode, path, details, batchRemover) {
    let nextNode = details.rootNode;
    path.forEach((groupInfo, level) => {
      nextNode = this.getOrCreateNextNode(nextNode, groupInfo, level, details);
      if (!(batchRemover == null ? void 0 : batchRemover.isRemoveFromAllLeafChildren(nextNode, childNode))) {
        nextNode.allLeafChildren.push(childNode);
      } else {
        batchRemover == null ? void 0 : batchRemover.preventRemoveFromAllLeafChildren(nextNode, childNode);
      }
    });
    return nextNode;
  }
  swapGroupWithUserNode(fillerGroup, userGroup, isMove) {
    userGroup.parent = fillerGroup.parent;
    userGroup.key = fillerGroup.key;
    userGroup.field = fillerGroup.field;
    userGroup.groupData = fillerGroup.groupData;
    userGroup.level = fillerGroup.level;
    if (!isMove) {
      userGroup.expanded = fillerGroup.expanded;
    }
    userGroup.leafGroup = fillerGroup.leafGroup;
    userGroup.rowGroupIndex = fillerGroup.rowGroupIndex;
    userGroup.allLeafChildren = fillerGroup.allLeafChildren;
    userGroup.childrenAfterGroup = fillerGroup.childrenAfterGroup;
    userGroup.childrenMapped = fillerGroup.childrenMapped;
    userGroup.sibling = fillerGroup.sibling;
    userGroup.updateHasChildren();
    this.removeFromParent(fillerGroup);
    userGroup.childrenAfterGroup.forEach((rowNode) => rowNode.parent = userGroup);
    this.addToParent(userGroup, fillerGroup.parent);
  }
  getOrCreateNextNode(parentGroup, groupInfo, level, details) {
    const key = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
    let nextNode = parentGroup.childrenMapped ? parentGroup.childrenMapped[key] : void 0;
    if (!nextNode) {
      nextNode = this.createGroup(groupInfo, parentGroup, level, details);
      this.addToParent(nextNode, parentGroup);
    }
    return nextNode;
  }
  createGroup(groupInfo, parent, level, details) {
    const groupNode = new import_core2.RowNode(this.beans);
    groupNode.group = true;
    groupNode.field = groupInfo.field;
    groupNode.rowGroupColumn = groupInfo.rowGroupColumn;
    this.setGroupData(groupNode, groupInfo, details);
    groupNode.key = groupInfo.key;
    groupNode.id = this.createGroupId(groupNode, parent, details.usingTreeData, level);
    groupNode.level = level;
    groupNode.leafGroup = details.usingTreeData ? false : level === details.groupedColCount - 1;
    groupNode.allLeafChildren = [];
    groupNode.setAllChildrenCount(0);
    groupNode.rowGroupIndex = details.usingTreeData ? null : level;
    groupNode.childrenAfterGroup = [];
    groupNode.childrenMapped = {};
    groupNode.updateHasChildren();
    groupNode.parent = details.includeParents ? parent : null;
    this.setExpandedInitialValue(details, groupNode);
    return groupNode;
  }
  createGroupId(node, parent, usingTreeData, level) {
    let createGroupId;
    if (usingTreeData) {
      createGroupId = (node2, parent2, level2) => {
        if (level2 < 0) {
          return null;
        }
        const parentId = parent2 ? createGroupId(parent2, parent2.parent, level2 - 1) : null;
        return `${parentId == null ? "" : parentId + "-"}${level2}-${node2.key}`;
      };
    } else {
      createGroupId = (node2, parent2) => {
        if (!node2.rowGroupColumn) {
          return null;
        }
        const parentId = parent2 ? createGroupId(parent2, parent2.parent, 0) : null;
        return `${parentId == null ? "" : parentId + "-"}${node2.rowGroupColumn.getColId()}-${node2.key}`;
      };
    }
    return import_core2.RowNode.ID_PREFIX_ROW_GROUP + createGroupId(node, parent, level);
  }
  setGroupData(groupNode, groupInfo, details) {
    groupNode.groupData = {};
    const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
    groupDisplayCols.forEach((col) => {
      const isTreeData = details.usingTreeData;
      if (isTreeData) {
        groupNode.groupData[col.getColId()] = groupInfo.key;
        return;
      }
      const groupColumn = groupNode.rowGroupColumn;
      const isRowGroupDisplayed = groupColumn !== null && col.isRowGroupDisplayed(groupColumn.getId());
      if (isRowGroupDisplayed) {
        if (details.suppressGroupMaintainValueType) {
          groupNode.groupData[col.getColId()] = groupInfo.key;
        } else {
          groupNode.groupData[col.getColId()] = this.valueService.getValue(groupColumn, groupInfo.leafNode);
        }
      }
    });
  }
  getChildrenMappedKey(key, rowGroupColumn) {
    if (rowGroupColumn) {
      return rowGroupColumn.getId() + "-" + key;
    }
    return key;
  }
  setExpandedInitialValue(details, groupNode) {
    if (details.pivotMode && groupNode.leafGroup) {
      groupNode.expanded = false;
      return;
    }
    const userCallback = details.isGroupOpenByDefault;
    if (userCallback) {
      const params = {
        rowNode: groupNode,
        field: groupNode.field,
        key: groupNode.key,
        level: groupNode.level,
        rowGroupColumn: groupNode.rowGroupColumn
      };
      groupNode.expanded = userCallback(params) == true;
      return;
    }
    const { expandByDefault } = details;
    if (details.expandByDefault === -1) {
      groupNode.expanded = true;
      return;
    }
    groupNode.expanded = groupNode.level < expandByDefault;
  }
  getGroupInfo(rowNode, details) {
    if (details.usingTreeData) {
      return this.getGroupInfoFromCallback(rowNode, details);
    }
    return this.getGroupInfoFromGroupColumns(rowNode, details);
  }
  getGroupInfoFromCallback(rowNode, details) {
    const keys = details.getDataPath ? details.getDataPath(rowNode.data) : null;
    if (keys === null || keys === void 0 || keys.length === 0) {
      import_core2._.warnOnce(`getDataPath() should not return an empty path for data ${rowNode.data}`);
    }
    const groupInfoMapper = (key) => ({ key, field: null, rowGroupColumn: null });
    return keys ? keys.map(groupInfoMapper) : [];
  }
  getGroupInfoFromGroupColumns(rowNode, details) {
    const res = [];
    details.groupedCols.forEach((groupCol) => {
      let key = this.valueService.getKeyForNode(groupCol, rowNode);
      let keyExists = key !== null && key !== void 0 && key !== "";
      const createGroupForEmpty = details.pivotMode || !details.groupAllowUnbalanced;
      if (createGroupForEmpty && !keyExists) {
        key = "";
        keyExists = true;
      }
      if (keyExists) {
        const item = {
          key,
          field: groupCol.getColDef().field,
          rowGroupColumn: groupCol,
          leafNode: rowNode
        };
        res.push(item);
      }
    });
    return res;
  }
};
__decorateClass([
  (0, import_core2.Autowired)("columnModel")
], GroupStage.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core2.Autowired)("selectableService")
], GroupStage.prototype, "selectableService", 2);
__decorateClass([
  (0, import_core2.Autowired)("valueService")
], GroupStage.prototype, "valueService", 2);
__decorateClass([
  (0, import_core2.Autowired)("beans")
], GroupStage.prototype, "beans", 2);
__decorateClass([
  (0, import_core2.Autowired)("selectionService")
], GroupStage.prototype, "selectionService", 2);
GroupStage = __decorateClass([
  (0, import_core2.Bean)("groupStage")
], GroupStage);

// enterprise-modules/row-grouping/src/rowGrouping/pivotColDefService.ts
var import_core3 = require("@ag-grid-community/core");
var PivotColDefService = class extends import_core3.BeanStub {
  init() {
    const getFieldSeparator = () => {
      var _a;
      return (_a = this.gos.get("serverSidePivotResultFieldSeparator")) != null ? _a : "_";
    };
    this.fieldSeparator = getFieldSeparator();
    this.addManagedPropertyListener("serverSidePivotResultFieldSeparator", () => {
      this.fieldSeparator = getFieldSeparator();
    });
    const getPivotDefaultExpanded = () => this.gos.get("pivotDefaultExpanded");
    this.pivotDefaultExpanded = getPivotDefaultExpanded();
    this.addManagedPropertyListener("pivotDefaultExpanded", () => {
      this.pivotDefaultExpanded = getPivotDefaultExpanded();
    });
  }
  createPivotColumnDefs(uniqueValues) {
    const pivotColumnGroupDefs = this.createPivotColumnsFromUniqueValues(uniqueValues);
    function extractColDefs(input, arr = []) {
      input.forEach((def) => {
        if (def.children !== void 0) {
          extractColDefs(def.children, arr);
        } else {
          arr.push(def);
        }
      });
      return arr;
    }
    const pivotColumnDefs = extractColDefs(pivotColumnGroupDefs);
    this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs);
    this.addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs);
    this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs);
    const pivotColumnDefsClone = pivotColumnDefs.map((colDef) => import_core3._.cloneObject(colDef));
    return {
      pivotColumnGroupDefs,
      pivotColumnDefs: pivotColumnDefsClone
    };
  }
  createPivotColumnsFromUniqueValues(uniqueValues) {
    const pivotColumns = this.columnModel.getPivotColumns();
    const maxDepth = pivotColumns.length;
    const pivotColumnGroupDefs = this.recursivelyBuildGroup(0, uniqueValues, [], maxDepth, pivotColumns);
    return pivotColumnGroupDefs;
  }
  recursivelyBuildGroup(index, uniqueValue, pivotKeys, maxDepth, primaryPivotColumns) {
    const measureColumns = this.columnModel.getValueColumns();
    if (index >= maxDepth) {
      return this.buildMeasureCols(pivotKeys);
    }
    const primaryPivotColumnDefs = primaryPivotColumns[index].getColDef();
    const comparator = this.headerNameComparator.bind(this, primaryPivotColumnDefs.pivotComparator);
    if (measureColumns.length === 1 && this.gos.get("removePivotHeaderRowWhenSingleValueColumn") && index === maxDepth - 1) {
      const leafCols = [];
      import_core3._.iterateObject(uniqueValue, (key) => {
        const newPivotKeys = [...pivotKeys, key];
        const colDef = this.createColDef(measureColumns[0], key, newPivotKeys);
        colDef.columnGroupShow = "open";
        leafCols.push(colDef);
      });
      leafCols.sort(comparator);
      return leafCols;
    }
    const groups = [];
    import_core3._.iterateObject(uniqueValue, (key, value) => {
      const openByDefault = this.pivotDefaultExpanded === -1 || index < this.pivotDefaultExpanded;
      const newPivotKeys = [...pivotKeys, key];
      groups.push({
        children: this.recursivelyBuildGroup(index + 1, value, newPivotKeys, maxDepth, primaryPivotColumns),
        headerName: key,
        pivotKeys: newPivotKeys,
        columnGroupShow: "open",
        openByDefault,
        groupId: this.generateColumnGroupId(newPivotKeys)
      });
    });
    groups.sort(comparator);
    return groups;
  }
  buildMeasureCols(pivotKeys) {
    const measureColumns = this.columnModel.getValueColumns();
    if (measureColumns.length === 0) {
      return [this.createColDef(null, "-", pivotKeys)];
    }
    return measureColumns.map((measureCol) => {
      const columnName = this.columnModel.getDisplayNameForColumn(measureCol, "header");
      return __spreadProps(__spreadValues({}, this.createColDef(measureCol, columnName, pivotKeys)), {
        columnGroupShow: "open"
      });
    });
  }
  addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs) {
    if (this.gos.get("suppressExpandablePivotGroups") || this.gos.get("pivotColumnGroupTotals")) {
      return;
    }
    const recursivelyAddSubTotals = (groupDef, currentPivotColumnDefs, acc) => {
      const group = groupDef;
      if (group.children) {
        const childAcc = /* @__PURE__ */ new Map();
        group.children.forEach((grp) => {
          recursivelyAddSubTotals(grp, currentPivotColumnDefs, childAcc);
        });
        const firstGroup = !group.children.some((child) => child.children);
        this.columnModel.getValueColumns().forEach((valueColumn) => {
          const columnName = this.columnModel.getDisplayNameForColumn(valueColumn, "header");
          const totalColDef = this.createColDef(valueColumn, columnName, groupDef.pivotKeys);
          totalColDef.pivotTotalColumnIds = childAcc.get(valueColumn.getColId());
          totalColDef.columnGroupShow = "closed";
          totalColDef.aggFunc = valueColumn.getAggFunc();
          if (!firstGroup) {
            const children = groupDef.children;
            children.push(totalColDef);
            currentPivotColumnDefs.push(totalColDef);
          }
        });
        this.merge(acc, childAcc);
      } else {
        const def = groupDef;
        if (!def.pivotValueColumn) {
          return;
        }
        const pivotValueColId = def.pivotValueColumn.getColId();
        const arr = acc.has(pivotValueColId) ? acc.get(pivotValueColId) : [];
        arr.push(def.colId);
        acc.set(pivotValueColId, arr);
      }
    };
    pivotColumnGroupDefs.forEach((groupDef) => {
      recursivelyAddSubTotals(groupDef, pivotColumnDefs, /* @__PURE__ */ new Map());
    });
  }
  addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs) {
    if (!this.gos.get("pivotColumnGroupTotals")) {
      return;
    }
    const insertAfter = this.gos.get("pivotColumnGroupTotals") === "after";
    const valueCols = this.columnModel.getValueColumns();
    const aggFuncs = valueCols.map((valueCol) => valueCol.getAggFunc());
    if (!aggFuncs || aggFuncs.length < 1 || !this.sameAggFuncs(aggFuncs)) {
      return;
    }
    const valueColumn = valueCols[0];
    pivotColumnGroupDefs.forEach((groupDef) => {
      this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, valueColumn, insertAfter);
    });
  }
  recursivelyAddPivotTotal(groupDef, pivotColumnDefs, valueColumn, insertAfter) {
    const group = groupDef;
    if (!group.children) {
      const def = groupDef;
      return def.colId ? [def.colId] : null;
    }
    let colIds = [];
    group.children.forEach((grp) => {
      const childColIds = this.recursivelyAddPivotTotal(grp, pivotColumnDefs, valueColumn, insertAfter);
      if (childColIds) {
        colIds = colIds.concat(childColIds);
      }
    });
    if (group.children.length > 1) {
      const localeTextFunc = this.localeService.getLocaleTextFunc();
      const headerName = localeTextFunc("pivotColumnGroupTotals", "Total");
      const totalColDef = this.createColDef(valueColumn, headerName, groupDef.pivotKeys, true);
      totalColDef.pivotTotalColumnIds = colIds;
      totalColDef.aggFunc = valueColumn.getAggFunc();
      const children = groupDef.children;
      insertAfter ? children.push(totalColDef) : children.unshift(totalColDef);
      pivotColumnDefs.push(totalColDef);
    }
    return colIds;
  }
  addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs) {
    if (!this.gos.get("pivotRowTotals")) {
      return;
    }
    const insertAfter = this.gos.get("pivotRowTotals") === "after";
    const valueColumns = this.columnModel.getValueColumns();
    const valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();
    for (let i = 0; i < valueCols.length; i++) {
      const valueCol = valueCols[i];
      let colIds = [];
      pivotColumnGroupDefs.forEach((groupDef) => {
        colIds = colIds.concat(this.extractColIdsForValueColumn(groupDef, valueCol));
      });
      const withGroup = valueCols.length > 1 || !this.gos.get("removePivotHeaderRowWhenSingleValueColumn");
      this.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, valueCol, colIds, insertAfter, withGroup);
    }
  }
  extractColIdsForValueColumn(groupDef, valueColumn) {
    const group = groupDef;
    if (!group.children) {
      const colDef = group;
      return colDef.pivotValueColumn === valueColumn && colDef.colId ? [colDef.colId] : [];
    }
    let colIds = [];
    group.children.forEach((grp) => {
      this.extractColIdsForValueColumn(grp, valueColumn);
      const childColIds = this.extractColIdsForValueColumn(grp, valueColumn);
      colIds = colIds.concat(childColIds);
    });
    return colIds;
  }
  createRowGroupTotal(parentChildren, pivotColumnDefs, valueColumn, colIds, insertAfter, addGroup) {
    const measureColumns = this.columnModel.getValueColumns();
    let colDef;
    if (measureColumns.length === 0) {
      colDef = this.createColDef(null, "-", []);
    } else {
      const columnName = this.columnModel.getDisplayNameForColumn(valueColumn, "header");
      colDef = this.createColDef(valueColumn, columnName, []);
      colDef.pivotTotalColumnIds = colIds;
    }
    colDef.colId = PivotColDefService.PIVOT_ROW_TOTAL_PREFIX + colDef.colId;
    pivotColumnDefs.push(colDef);
    const valueGroup = addGroup ? {
      children: [colDef],
      pivotKeys: [],
      groupId: `${PivotColDefService.PIVOT_ROW_TOTAL_PREFIX}_pivotGroup_${valueColumn.getColId()}`
    } : colDef;
    insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
  }
  createColDef(valueColumn, headerName, pivotKeys, totalColumn = false) {
    const colDef = {};
    if (valueColumn) {
      const colDefToCopy = valueColumn.getColDef();
      Object.assign(colDef, colDefToCopy);
      colDef.hide = false;
    }
    colDef.headerName = headerName;
    colDef.colId = this.generateColumnId(pivotKeys || [], valueColumn && !totalColumn ? valueColumn.getColId() : "");
    colDef.field = colDef.colId;
    colDef.valueGetter = (params) => {
      var _a;
      return (_a = params.data) == null ? void 0 : _a[params.colDef.field];
    };
    colDef.pivotKeys = pivotKeys;
    colDef.pivotValueColumn = valueColumn;
    if (colDef.filter === true) {
      colDef.filter = "agNumberColumnFilter";
    }
    return colDef;
  }
  sameAggFuncs(aggFuncs) {
    if (aggFuncs.length == 1) {
      return true;
    }
    for (let i = 1; i < aggFuncs.length; i++) {
      if (aggFuncs[i] !== aggFuncs[0]) {
        return false;
      }
    }
    return true;
  }
  headerNameComparator(userComparator, a, b) {
    if (userComparator) {
      return userComparator(a.headerName, b.headerName);
    } else {
      if (a.headerName && !b.headerName) {
        return 1;
      } else if (!a.headerName && b.headerName) {
        return -1;
      }
      if (!a.headerName || !b.headerName) {
        return 0;
      }
      if (a.headerName < b.headerName) {
        return -1;
      }
      if (a.headerName > b.headerName) {
        return 1;
      }
      return 0;
    }
  }
  merge(m1, m2) {
    m2.forEach((value, key, map) => {
      const existingList = m1.has(key) ? m1.get(key) : [];
      const updatedList = [...existingList, ...value];
      m1.set(key, updatedList);
    });
  }
  generateColumnGroupId(pivotKeys) {
    const pivotCols = this.columnModel.getPivotColumns().map((col) => col.getColId());
    return `pivotGroup_${pivotCols.join("-")}_${pivotKeys.join("-")}`;
  }
  generateColumnId(pivotKeys, measureColumnId) {
    const pivotCols = this.columnModel.getPivotColumns().map((col) => col.getColId());
    return `pivot_${pivotCols.join("-")}_${pivotKeys.join("-")}_${measureColumnId}`;
  }
  /**
   * Used by the SSRM to create secondary columns from provided fields
   * @param fields 
   */
  createColDefsFromFields(fields) {
    ;
    const uniqueValues = {};
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const parts = field.split(this.fieldSeparator);
      let level = uniqueValues;
      for (let p = 0; p < parts.length; p++) {
        const part = parts[p];
        if (level[part] == null) {
          level[part] = {};
        }
        level = level[part];
      }
    }
    const uniqueValuesToGroups = (id, key, uniqueValues2, depth) => {
      var _a;
      const children = [];
      for (let key2 in uniqueValues2) {
        const item = uniqueValues2[key2];
        const child = uniqueValuesToGroups(`${id}${this.fieldSeparator}${key2}`, key2, item, depth + 1);
        children.push(child);
      }
      if (children.length === 0) {
        const potentialAggCol = this.columnModel.getPrimaryColumn(key);
        if (potentialAggCol) {
          const headerName = (_a = this.columnModel.getDisplayNameForColumn(potentialAggCol, "header")) != null ? _a : key;
          const colDef = this.createColDef(potentialAggCol, headerName, void 0, false);
          colDef.colId = id;
          colDef.aggFunc = potentialAggCol.getAggFunc();
          colDef.valueGetter = (params) => {
            var _a2;
            return (_a2 = params.data) == null ? void 0 : _a2[id];
          };
          return colDef;
        }
        const col = {
          colId: id,
          headerName: key,
          // this is to support using pinned rows, normally the data will be extracted from the aggData object using the colId
          // however pinned rows still access the data object by field, this prevents values with dots from being treated as complex objects
          valueGetter: (params) => {
            var _a2;
            return (_a2 = params.data) == null ? void 0 : _a2[id];
          }
        };
        return col;
      }
      const collapseSingleChildren = this.gos.get("removePivotHeaderRowWhenSingleValueColumn");
      if (collapseSingleChildren && children.length === 1 && "colId" in children[0]) {
        children[0].headerName = key;
        return children[0];
      }
      const group = {
        openByDefault: this.pivotDefaultExpanded === -1 || depth < this.pivotDefaultExpanded,
        groupId: id,
        headerName: key,
        children
      };
      return group;
    };
    const res = [];
    for (let key in uniqueValues) {
      const item = uniqueValues[key];
      const col = uniqueValuesToGroups(key, key, item, 0);
      res.push(col);
    }
    return res;
  }
};
PivotColDefService.PIVOT_ROW_TOTAL_PREFIX = "PivotRowTotal_";
__decorateClass([
  (0, import_core3.Autowired)("columnModel")
], PivotColDefService.prototype, "columnModel", 2);
__decorateClass([
  import_core3.PostConstruct
], PivotColDefService.prototype, "init", 1);
PivotColDefService = __decorateClass([
  (0, import_core3.Bean)("pivotColDefService")
], PivotColDefService);

// enterprise-modules/row-grouping/src/rowGrouping/pivotStage.ts
var import_core4 = require("@ag-grid-community/core");
var PivotStage = class extends import_core4.BeanStub {
  constructor() {
    super(...arguments);
    this.uniqueValues = {};
    this.lastTimeFailed = false;
    this.maxUniqueValues = -1;
    this.currentUniqueCount = 0;
  }
  execute(params) {
    const changedPath = params.changedPath;
    if (this.columnModel.isPivotActive()) {
      this.executePivotOn(changedPath);
    } else {
      this.executePivotOff(changedPath);
    }
  }
  executePivotOff(changedPath) {
    this.aggregationColumnsHashLastTime = null;
    this.uniqueValues = {};
    if (this.columnModel.isSecondaryColumnsPresent()) {
      this.columnModel.setSecondaryColumns(null, "rowModelUpdated");
      if (changedPath) {
        changedPath.setInactive();
      }
    }
  }
  executePivotOn(changedPath) {
    var _a;
    const numberOfAggregationColumns = (_a = this.columnModel.getValueColumns().length) != null ? _a : 1;
    const configuredMaxCols = this.gos.get("pivotMaxGeneratedColumns");
    this.maxUniqueValues = configuredMaxCols === -1 ? -1 : configuredMaxCols / numberOfAggregationColumns;
    let uniqueValues;
    try {
      uniqueValues = this.bucketUpRowNodes(changedPath);
    } catch (e) {
      if (e.message === PivotStage.EXCEEDED_MAX_UNIQUE_VALUES) {
        this.columnModel.setSecondaryColumns([], "rowModelUpdated");
        const event = {
          type: import_core4.Events.EVENT_PIVOT_MAX_COLUMNS_EXCEEDED,
          message: e.message
        };
        this.eventService.dispatchEvent(event);
        this.lastTimeFailed = true;
        return;
      }
      throw e;
    }
    const uniqueValuesChanged = this.setUniqueValues(uniqueValues);
    const aggregationColumns = this.columnModel.getValueColumns();
    const aggregationColumnsHash = aggregationColumns.map((column) => `${column.getId()}-${column.getColDef().headerName}`).join("#");
    const aggregationFuncsHash = aggregationColumns.map((column) => column.getAggFunc().toString()).join("#");
    const aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
    const aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
    this.aggregationColumnsHashLastTime = aggregationColumnsHash;
    this.aggregationFuncsHashLastTime = aggregationFuncsHash;
    const groupColumnsHash = this.columnModel.getRowGroupColumns().map((column) => column.getId()).join("#");
    const groupColumnsChanged = groupColumnsHash !== this.groupColumnsHashLastTime;
    this.groupColumnsHashLastTime = groupColumnsHash;
    const pivotRowTotals = this.gos.get("pivotRowTotals");
    const pivotColumnGroupTotals = this.gos.get("pivotColumnGroupTotals");
    const suppressExpandablePivotGroups = this.gos.get("suppressExpandablePivotGroups");
    const removePivotHeaderRowWhenSingleValueColumn = this.gos.get("removePivotHeaderRowWhenSingleValueColumn");
    const anyGridOptionsChanged = pivotRowTotals !== this.pivotRowTotalsLastTime || pivotColumnGroupTotals !== this.pivotColumnGroupTotalsLastTime || suppressExpandablePivotGroups !== this.suppressExpandablePivotGroupsLastTime || removePivotHeaderRowWhenSingleValueColumn !== this.removePivotHeaderRowWhenSingleValueColumnLastTime;
    this.pivotRowTotalsLastTime = pivotRowTotals;
    this.pivotColumnGroupTotalsLastTime = pivotColumnGroupTotals;
    this.suppressExpandablePivotGroupsLastTime = suppressExpandablePivotGroups;
    this.removePivotHeaderRowWhenSingleValueColumnLastTime = removePivotHeaderRowWhenSingleValueColumn;
    if (this.lastTimeFailed || uniqueValuesChanged || aggregationColumnsChanged || groupColumnsChanged || aggregationFuncsChanged || anyGridOptionsChanged) {
      const { pivotColumnGroupDefs, pivotColumnDefs } = this.pivotColDefService.createPivotColumnDefs(this.uniqueValues);
      this.pivotColumnDefs = pivotColumnDefs;
      this.columnModel.setSecondaryColumns(pivotColumnGroupDefs, "rowModelUpdated");
      if (changedPath) {
        changedPath.setInactive();
      }
    }
    this.lastTimeFailed = false;
  }
  setUniqueValues(newValues) {
    const json1 = JSON.stringify(newValues);
    const json2 = JSON.stringify(this.uniqueValues);
    const uniqueValuesChanged = json1 !== json2;
    if (uniqueValuesChanged) {
      this.uniqueValues = newValues;
      return true;
    } else {
      return false;
    }
  }
  bucketUpRowNodes(changedPath) {
    this.currentUniqueCount = 0;
    const uniqueValues = {};
    changedPath.forEachChangedNodeDepthFirst((node) => {
      if (node.leafGroup) {
        node.childrenMapped = null;
      }
    });
    const recursivelyBucketFilteredChildren = (node) => {
      var _a;
      if (node.leafGroup) {
        this.bucketRowNode(node, uniqueValues);
      } else {
        (_a = node.childrenAfterFilter) == null ? void 0 : _a.forEach(recursivelyBucketFilteredChildren);
      }
    };
    changedPath.executeFromRootNode(recursivelyBucketFilteredChildren);
    return uniqueValues;
  }
  bucketRowNode(rowNode, uniqueValues) {
    const pivotColumns = this.columnModel.getPivotColumns();
    if (pivotColumns.length === 0) {
      rowNode.childrenMapped = null;
    } else {
      rowNode.childrenMapped = this.bucketChildren(rowNode.childrenAfterFilter, pivotColumns, 0, uniqueValues);
    }
    if (rowNode.sibling) {
      rowNode.sibling.childrenMapped = rowNode.childrenMapped;
    }
  }
  bucketChildren(children, pivotColumns, pivotIndex, uniqueValues) {
    const mappedChildren = {};
    const pivotColumn = pivotColumns[pivotIndex];
    children.forEach((child) => {
      let key = this.valueService.getKeyForNode(pivotColumn, child);
      if (import_core4._.missing(key)) {
        key = "";
      }
      if (!uniqueValues[key]) {
        this.currentUniqueCount += 1;
        uniqueValues[key] = {};
        const doesGeneratedColMaxExist = this.maxUniqueValues !== -1;
        const hasExceededColMax = this.currentUniqueCount > this.maxUniqueValues;
        if (doesGeneratedColMaxExist && hasExceededColMax) {
          throw Error(PivotStage.EXCEEDED_MAX_UNIQUE_VALUES);
        }
      }
      if (!mappedChildren[key]) {
        mappedChildren[key] = [];
      }
      mappedChildren[key].push(child);
    });
    if (pivotIndex === pivotColumns.length - 1) {
      return mappedChildren;
    } else {
      const result = {};
      import_core4._.iterateObject(mappedChildren, (key, value) => {
        result[key] = this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
      });
      return result;
    }
  }
  getPivotColumnDefs() {
    return this.pivotColumnDefs;
  }
};
PivotStage.EXCEEDED_MAX_UNIQUE_VALUES = "Exceeded maximum allowed pivot column count.";
__decorateClass([
  (0, import_core4.Autowired)("valueService")
], PivotStage.prototype, "valueService", 2);
__decorateClass([
  (0, import_core4.Autowired)("columnModel")
], PivotStage.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core4.Autowired)("pivotColDefService")
], PivotStage.prototype, "pivotColDefService", 2);
PivotStage = __decorateClass([
  (0, import_core4.Bean)("pivotStage")
], PivotStage);

// enterprise-modules/row-grouping/src/rowGrouping/aggFuncService.ts
var import_core5 = require("@ag-grid-community/core");
var defaultAggFuncNames = {
  sum: "Sum",
  first: "First",
  last: "Last",
  min: "Min",
  max: "Max",
  count: "Count",
  avg: "Average"
};
var AggFuncService = class extends import_core5.BeanStub {
  constructor() {
    super(...arguments);
    this.aggFuncsMap = {};
    this.initialised = false;
  }
  init() {
    if (this.initialised) {
      return;
    }
    this.initialiseWithDefaultAggregations();
    this.addAggFuncs(this.gos.get("aggFuncs"));
  }
  initialiseWithDefaultAggregations() {
    this.aggFuncsMap[AggFuncService.AGG_SUM] = aggSum;
    this.aggFuncsMap[AggFuncService.AGG_FIRST] = aggFirst;
    this.aggFuncsMap[AggFuncService.AGG_LAST] = aggLast;
    this.aggFuncsMap[AggFuncService.AGG_MIN] = aggMin;
    this.aggFuncsMap[AggFuncService.AGG_MAX] = aggMax;
    this.aggFuncsMap[AggFuncService.AGG_COUNT] = aggCount;
    this.aggFuncsMap[AggFuncService.AGG_AVG] = aggAvg;
    this.initialised = true;
  }
  isAggFuncPossible(column, func) {
    const allKeys = this.getFuncNames(column);
    const allowed = import_core5._.includes(allKeys, func);
    const funcExists = import_core5._.exists(this.aggFuncsMap[func]);
    return allowed && funcExists;
  }
  getDefaultFuncLabel(fctName) {
    var _a;
    return (_a = defaultAggFuncNames[fctName]) != null ? _a : fctName;
  }
  getDefaultAggFunc(column) {
    const defaultAgg = column.getColDef().defaultAggFunc;
    if (import_core5._.exists(defaultAgg) && this.isAggFuncPossible(column, defaultAgg)) {
      return defaultAgg;
    }
    if (this.isAggFuncPossible(column, AggFuncService.AGG_SUM)) {
      return AggFuncService.AGG_SUM;
    }
    const allKeys = this.getFuncNames(column);
    return import_core5._.existsAndNotEmpty(allKeys) ? allKeys[0] : null;
  }
  addAggFuncs(aggFuncs) {
    this.init();
    import_core5._.iterateObject(aggFuncs, (key, aggFunc) => {
      this.aggFuncsMap[key] = aggFunc;
    });
  }
  getAggFunc(name) {
    this.init();
    return this.aggFuncsMap[name];
  }
  getFuncNames(column) {
    const userAllowedFuncs = column.getColDef().allowedAggFuncs;
    return userAllowedFuncs == null ? Object.keys(this.aggFuncsMap).sort() : userAllowedFuncs;
  }
  clear() {
    this.aggFuncsMap = {};
  }
};
AggFuncService.AGG_SUM = "sum";
AggFuncService.AGG_FIRST = "first";
AggFuncService.AGG_LAST = "last";
AggFuncService.AGG_MIN = "min";
AggFuncService.AGG_MAX = "max";
AggFuncService.AGG_COUNT = "count";
AggFuncService.AGG_AVG = "avg";
__decorateClass([
  import_core5.PostConstruct
], AggFuncService.prototype, "init", 1);
AggFuncService = __decorateClass([
  (0, import_core5.Bean)("aggFuncService")
], AggFuncService);
function aggSum(params) {
  const { values } = params;
  let result = null;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value === "number") {
      if (result === null) {
        result = value;
      } else {
        result += typeof result === "number" ? value : BigInt(value);
      }
    } else if (typeof value === "bigint") {
      if (result === null) {
        result = value;
      } else {
        result = (typeof result === "bigint" ? result : BigInt(result)) + value;
      }
    }
  }
  return result;
}
function aggFirst(params) {
  return params.values.length > 0 ? params.values[0] : null;
}
function aggLast(params) {
  return params.values.length > 0 ? import_core5._.last(params.values) : null;
}
function aggMin(params) {
  const { values } = params;
  let result = null;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if ((typeof value === "number" || typeof value === "bigint") && (result === null || result > value)) {
      result = value;
    }
  }
  return result;
}
function aggMax(params) {
  const { values } = params;
  let result = null;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if ((typeof value === "number" || typeof value === "bigint") && (result === null || result < value)) {
      result = value;
    }
  }
  return result;
}
function aggCount(params) {
  var _a, _b;
  const { values } = params;
  let result = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    result += value != null && typeof value.value === "number" ? value.value : 1;
  }
  const existingAggData = (_b = (_a = params.rowNode) == null ? void 0 : _a.aggData) == null ? void 0 : _b[params.column.getColId()];
  if (existingAggData && existingAggData.value === result) {
    return existingAggData;
  }
  return {
    value: result,
    toString: function() {
      return this.value.toString();
    },
    // used for sorting
    toNumber: function() {
      return this.value;
    }
  };
}
function aggAvg(params) {
  var _a, _b, _c;
  const { values } = params;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    const currentValue = values[i];
    let valueToAdd = null;
    if (typeof currentValue === "number" || typeof currentValue === "bigint") {
      valueToAdd = currentValue;
      count++;
    } else if (currentValue != null && (typeof currentValue.value === "number" || typeof currentValue.value === "bigint") && typeof currentValue.count === "number") {
      valueToAdd = currentValue.value * (typeof currentValue.value === "number" ? currentValue.count : BigInt(currentValue.count));
      count += currentValue.count;
    }
    if (typeof valueToAdd === "number") {
      sum += typeof sum === "number" ? valueToAdd : BigInt(valueToAdd);
    } else if (typeof valueToAdd === "bigint") {
      sum = (typeof sum === "bigint" ? sum : BigInt(sum)) + valueToAdd;
    }
  }
  let value = null;
  if (count > 0) {
    value = sum / (typeof sum === "number" ? count : BigInt(count));
  }
  const existingAggData = (_c = (_a = params.rowNode) == null ? void 0 : _a.aggData) == null ? void 0 : _c[(_b = params.column) == null ? void 0 : _b.getColId()];
  if (existingAggData && existingAggData.count === count && existingAggData.value === value) {
    return existingAggData;
  }
  return {
    count,
    value,
    // the grid by default uses toString to render values for an object, so this
    // is a trick to get the default cellRenderer to display the avg value
    toString: function() {
      return typeof this.value === "number" || typeof this.value === "bigint" ? this.value.toString() : "";
    },
    // used for sorting
    toNumber: function() {
      return this.value;
    }
  };
}

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/gridHeaderDropZones.ts
var import_core10 = require("@ag-grid-community/core");

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/rowGroupDropZonePanel.ts
var import_core8 = require("@ag-grid-community/core");

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/baseDropZonePanel.ts
var import_core7 = require("@ag-grid-community/core");

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/dropZoneColumnComp.ts
var import_core6 = require("@ag-grid-community/core");
var DropZoneColumnComp = class extends import_core6.PillDragComp {
  constructor(column, dragSourceDropTarget, ghost, dropZonePurpose, horizontal) {
    super(
      dragSourceDropTarget,
      ghost,
      horizontal,
      /* html */
      `
                <span role="option">
                    <span ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle" role="presentation"></span>
                    <span ref="eText" class="ag-column-drop-cell-text" aria-hidden="true"></span>
                    <ag-sort-indicator ref="eSortIndicator"></ag-sort-indicator>
                    <span ref="eButton" class="ag-column-drop-cell-button" role="presentation"></span>
                </span>
            `
    );
    this.column = column;
    this.dropZonePurpose = dropZonePurpose;
    this.popupShowing = false;
  }
  init() {
    this.displayName = this.columnModel.getDisplayNameForColumn(this.column, "columnDrop");
    super.init();
    this.setupSort();
    this.addManagedListener(this.eventService, import_core6.Column.EVENT_SORT_CHANGED, () => {
      this.setupAria();
    });
    if (this.isGroupingZone()) {
      this.addManagedPropertyListener("groupLockGroupColumns", () => {
        this.refreshRemove();
        this.refreshDraggable();
        this.setupAria();
      });
    }
  }
  getItem() {
    return this.column;
  }
  getDisplayName() {
    return this.displayName;
  }
  getTooltip() {
    return this.column.getColDef().headerTooltip;
  }
  addAdditionalAriaInstructions(ariaInstructions, translate) {
    const isSortSuppressed = this.gos.get("rowGroupPanelSuppressSort");
    const isFunctionsReadOnly = this.gos.get("functionsReadOnly");
    if (this.isAggregationZone() && !isFunctionsReadOnly) {
      const aggregationMenuAria = translate("ariaDropZoneColumnValueItemDescription", "Press ENTER to change the aggregation type");
      ariaInstructions.push(aggregationMenuAria);
    }
    if (this.isGroupingZone() && this.column.isSortable() && !isSortSuppressed) {
      const sortProgressAria = translate("ariaDropZoneColumnGroupItemDescription", "Press ENTER to sort");
      ariaInstructions.push(sortProgressAria);
    }
    super.addAdditionalAriaInstructions(ariaInstructions, translate);
  }
  isDraggable() {
    return this.isReadOnly();
  }
  isRemovable() {
    return this.isReadOnly();
  }
  isReadOnly() {
    return !this.isGroupingAndLocked() && !this.gos.get("functionsReadOnly");
  }
  getAriaDisplayName() {
    const translate = this.localeService.getLocaleTextFunc();
    const { name, aggFuncName } = this.getColumnAndAggFuncName();
    const aggSeparator = translate("ariaDropZoneColumnComponentAggFuncSeparator", " of ");
    const sortDirection = {
      asc: translate("ariaDropZoneColumnComponentSortAscending", "ascending"),
      desc: translate("ariaDropZoneColumnComponentSortDescending", "descending")
    };
    const columnSort = this.column.getSort();
    const isSortSuppressed = this.gos.get("rowGroupPanelSuppressSort");
    return [
      aggFuncName && `${aggFuncName}${aggSeparator}`,
      name,
      this.isGroupingZone() && !isSortSuppressed && columnSort && `, ${sortDirection[columnSort]}`
    ].filter((part) => !!part).join("");
  }
  getColumnAndAggFuncName() {
    const name = this.displayName;
    let aggFuncName = "";
    if (this.isAggregationZone()) {
      const aggFunc = this.column.getAggFunc();
      const aggFuncString = typeof aggFunc === "string" ? aggFunc : "agg";
      const localeTextFunc = this.localeService.getLocaleTextFunc();
      aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
    }
    return { name, aggFuncName };
  }
  setupSort() {
    const canSort = this.column.isSortable();
    const isGroupingZone = this.isGroupingZone();
    if (!canSort || !isGroupingZone) {
      return;
    }
    if (!this.gos.get("rowGroupPanelSuppressSort")) {
      this.eSortIndicator.setupSort(this.column, true);
      const performSort = (event) => {
        event.preventDefault();
        const sortUsingCtrl = this.gos.get("multiSortKey") === "ctrl";
        const multiSort = sortUsingCtrl ? event.ctrlKey || event.metaKey : event.shiftKey;
        this.sortController.progressSort(this.column, multiSort, "uiColumnSorted");
      };
      this.addGuiEventListener("click", performSort);
      this.addGuiEventListener("keydown", (e) => {
        const isEnter = e.key === import_core6.KeyCode.ENTER;
        if (isEnter && this.isGroupingZone()) {
          performSort(e);
        }
      });
    }
  }
  getDefaultIconName() {
    return import_core6.DragAndDropService.ICON_HIDE;
  }
  createGetDragItem() {
    const { column } = this;
    return () => {
      const visibleState = {};
      visibleState[column.getId()] = column.isVisible();
      return {
        columns: [column],
        visibleState
      };
    };
  }
  setupComponents() {
    super.setupComponents();
    if (this.isAggregationZone() && !this.gos.get("functionsReadOnly")) {
      this.addGuiEventListener("click", this.onShowAggFuncSelection.bind(this));
    }
  }
  onKeyDown(e) {
    super.onKeyDown(e);
    const isEnter = e.key === import_core6.KeyCode.ENTER;
    if (isEnter && this.isAggregationZone() && !this.gos.get("functionsReadOnly")) {
      e.preventDefault();
      this.onShowAggFuncSelection();
    }
  }
  getDisplayValue() {
    const { name, aggFuncName } = this.getColumnAndAggFuncName();
    return this.isAggregationZone() ? `${aggFuncName}(${name})` : name;
  }
  onShowAggFuncSelection() {
    if (this.popupShowing) {
      return;
    }
    this.popupShowing = true;
    const virtualList = new import_core6.VirtualList({ cssIdentifier: "select-agg-func" });
    const rows = this.aggFuncService.getFuncNames(this.column);
    const eGui = this.getGui();
    const virtualListGui = virtualList.getGui();
    virtualList.setModel({
      getRow: function(index) {
        return rows[index];
      },
      getRowCount: function() {
        return rows.length;
      }
    });
    this.getContext().createBean(virtualList);
    const ePopup = import_core6._.loadTemplate(
      /* html*/
      `<div class="ag-select-agg-func-popup"></div>`
    );
    ePopup.style.top = "0px";
    ePopup.style.left = "0px";
    ePopup.appendChild(virtualListGui);
    ePopup.style.width = `${eGui.clientWidth}px`;
    const focusoutListener = this.addManagedListener(ePopup, "focusout", (e) => {
      if (!ePopup.contains(e.relatedTarget) && addPopupRes) {
        addPopupRes.hideFunc();
      }
    });
    const popupHiddenFunc = (callbackEvent) => {
      this.destroyBean(virtualList);
      this.popupShowing = false;
      if ((callbackEvent == null ? void 0 : callbackEvent.key) === "Escape") {
        eGui.focus();
      }
      if (focusoutListener) {
        focusoutListener();
      }
    };
    const translate = this.localeService.getLocaleTextFunc();
    const addPopupRes = this.popupService.addPopup({
      modal: true,
      eChild: ePopup,
      closeOnEsc: true,
      closedCallback: popupHiddenFunc,
      ariaLabel: translate("ariaLabelAggregationFunction", "Aggregation Function")
    });
    if (addPopupRes) {
      virtualList.setComponentCreator(
        this.createAggSelect.bind(this, addPopupRes.hideFunc)
      );
    }
    virtualList.addGuiEventListener("keydown", (e) => {
      if (e.key === import_core6.KeyCode.ENTER || e.key === import_core6.KeyCode.SPACE) {
        const row = virtualList.getLastFocusedRow();
        if (row == null) {
          return;
        }
        const comp = virtualList.getComponentAt(row);
        if (comp) {
          comp.selectItem();
        }
      }
    });
    this.popupService.positionPopupByComponent({
      type: "aggFuncSelect",
      eventSource: eGui,
      ePopup,
      keepWithinBounds: true,
      column: this.column,
      position: "under"
    });
    virtualList.refresh();
    let rowToFocus = rows.findIndex((r) => r === this.column.getAggFunc());
    if (rowToFocus === -1) {
      rowToFocus = 0;
    }
    virtualList.focusRow(rowToFocus);
  }
  createAggSelect(hidePopup, value) {
    const itemSelected = () => {
      hidePopup();
      if (this.gos.get("functionsPassive")) {
        const event = {
          type: import_core6.Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
          columns: [this.column],
          aggFunc: value
        };
        this.eventService.dispatchEvent(event);
      } else {
        this.columnModel.setColumnAggFunc(this.column, value, "toolPanelDragAndDrop");
      }
    };
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const aggFuncString = value.toString();
    const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
    const comp = new AggItemComp(itemSelected, aggFuncStringTranslated);
    return comp;
  }
  isGroupingAndLocked() {
    return this.isGroupingZone() && this.columnModel.isColumnGroupingLocked(this.column);
  }
  isAggregationZone() {
    return this.dropZonePurpose === "aggregation";
  }
  isGroupingZone() {
    return this.dropZonePurpose === "rowGroup";
  }
  getDragSourceType() {
    return import_core6.DragSourceType.ToolPanel;
  }
  destroy() {
    super.destroy();
    this.column = null;
  }
};
__decorateClass([
  (0, import_core6.Autowired)("popupService")
], DropZoneColumnComp.prototype, "popupService", 2);
__decorateClass([
  (0, import_core6.Autowired)("sortController")
], DropZoneColumnComp.prototype, "sortController", 2);
__decorateClass([
  (0, import_core6.Autowired)("columnModel")
], DropZoneColumnComp.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core6.Optional)("aggFuncService")
], DropZoneColumnComp.prototype, "aggFuncService", 2);
__decorateClass([
  (0, import_core6.RefSelector)("eSortIndicator")
], DropZoneColumnComp.prototype, "eSortIndicator", 2);
var AggItemComp = class extends import_core6.Component {
  constructor(itemSelected, value) {
    super(
      /* html */
      `<div class="ag-select-agg-func-item"/>`
    );
    this.selectItem = itemSelected;
    this.getGui().innerText = value;
    this.addGuiEventListener("click", this.selectItem);
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/baseDropZonePanel.ts
var BaseDropZonePanel = class extends import_core7.PillDropZonePanel {
  constructor(horizontal, dropZonePurpose) {
    super(horizontal);
    this.dropZonePurpose = dropZonePurpose;
  }
  init(params) {
    super.init(params);
    this.addManagedListener(this.eventService, import_core7.Events.EVENT_NEW_COLUMNS_LOADED, this.refreshGui.bind(this));
    this.addManagedPropertyListeners(["functionsReadOnly", "rowGroupPanelSuppressSort", "groupLockGroupColumns"], this.refreshGui.bind(this));
  }
  getItems(dragItem) {
    var _a;
    return (_a = dragItem.columns) != null ? _a : [];
  }
  isInterestedIn(type) {
    return type === import_core7.DragSourceType.HeaderCell || type === import_core7.DragSourceType.ToolPanel;
  }
  minimumAllowedNewInsertIndex() {
    const numberOfLockedCols = this.gos.get("groupLockGroupColumns");
    const numberOfGroupCols = this.columnModel.getRowGroupColumns().length;
    if (numberOfLockedCols === -1) {
      return numberOfGroupCols;
    }
    return Math.min(numberOfLockedCols, numberOfGroupCols);
  }
  showOrHideColumnOnExit(draggingEvent) {
    return this.isRowGroupPanel() && !this.gos.get("suppressRowGroupHidesColumns") && !draggingEvent.fromNudge;
  }
  handleDragEnterEnd(draggingEvent) {
    const hideColumnOnExit = this.showOrHideColumnOnExit(draggingEvent);
    if (hideColumnOnExit) {
      const dragItem = draggingEvent.dragSource.getDragItem();
      const columns = dragItem.columns;
      this.setColumnsVisible(columns, false, "uiColumnDragged");
    }
  }
  handleDragLeaveEnd(draggingEvent) {
    const showColumnOnExit = this.showOrHideColumnOnExit(draggingEvent);
    if (showColumnOnExit) {
      const dragItem = draggingEvent.dragSource.getDragItem();
      this.setColumnsVisible(dragItem.columns, true, "uiColumnDragged");
    }
  }
  setColumnsVisible(columns, visible, source) {
    if (columns) {
      const allowedCols = columns.filter((c) => !c.getColDef().lockVisible);
      this.columnModel.setColumnsVisible(allowedCols, visible, source);
    }
  }
  isRowGroupPanel() {
    return this.dropZonePurpose === "rowGroup";
  }
  refreshOnDragStop() {
    return !this.gos.get("functionsPassive");
  }
  createPillComponent(column, dropTarget, ghost, horizontal) {
    return new DropZoneColumnComp(column, dropTarget, ghost, this.dropZonePurpose, horizontal);
  }
};
__decorateClass([
  (0, import_core7.Autowired)("columnModel")
], BaseDropZonePanel.prototype, "columnModel", 2);

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/rowGroupDropZonePanel.ts
var RowGroupDropZonePanel = class extends BaseDropZonePanel {
  constructor(horizontal) {
    super(horizontal, "rowGroup");
  }
  passBeansUp() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const emptyMessage = localeTextFunc("rowGroupColumnsEmptyMessage", "Drag here to set row groups");
    const title = localeTextFunc("groups", "Row Groups");
    super.init({
      icon: import_core8._.createIconNoSpan("rowGroupPanel", this.gos, null),
      emptyMessage,
      title
    });
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
  }
  getAriaLabel() {
    const translate = this.localeService.getLocaleTextFunc();
    const label = translate("ariaRowGroupDropZonePanelLabel", "Row Groups");
    return label;
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "rowGroupColumnsList";
    return res;
  }
  isItemDroppable(column, draggingEvent) {
    if (this.gos.get("functionsReadOnly") || !column.isPrimary()) {
      return false;
    }
    return column.isAllowRowGroup() && (!column.isRowGroupActive() || this.isSourceEventFromTarget(draggingEvent));
  }
  updateItems(columns) {
    if (this.gos.get("functionsPassive")) {
      const event = {
        type: import_core8.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
        columns
      };
      this.eventService.dispatchEvent(event);
    } else {
      this.columnModel.setRowGroupColumns(columns, "toolPanelUi");
    }
  }
  getIconName() {
    return this.isPotentialDndItems() ? import_core8.DragAndDropService.ICON_GROUP : import_core8.DragAndDropService.ICON_NOT_ALLOWED;
  }
  getExistingItems() {
    return this.columnModel.getRowGroupColumns();
  }
};
__decorateClass([
  import_core8.PostConstruct
], RowGroupDropZonePanel.prototype, "passBeansUp", 1);

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/pivotDropZonePanel.ts
var import_core9 = require("@ag-grid-community/core");
var PivotDropZonePanel = class extends BaseDropZonePanel {
  constructor(horizontal) {
    super(horizontal, "pivot");
  }
  passBeansUp() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const emptyMessage = localeTextFunc("pivotColumnsEmptyMessage", "Drag here to set column labels");
    const title = localeTextFunc("pivots", "Column Labels");
    super.init({
      icon: import_core9._.createIconNoSpan("pivotPanel", this.gos, null),
      emptyMessage,
      title
    });
    this.addManagedListener(this.eventService, import_core9.Events.EVENT_NEW_COLUMNS_LOADED, this.refresh.bind(this));
    this.addManagedListener(this.eventService, import_core9.Events.EVENT_COLUMN_PIVOT_CHANGED, this.refresh.bind(this));
    this.addManagedListener(this.eventService, import_core9.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.checkVisibility.bind(this));
    this.refresh();
  }
  getAriaLabel() {
    const translate = this.localeService.getLocaleTextFunc();
    const label = translate("ariaPivotDropZonePanelLabel", "Column Labels");
    return label;
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "pivotColumnsList";
    return res;
  }
  refresh() {
    this.checkVisibility();
    this.refreshGui();
  }
  checkVisibility() {
    const pivotMode = this.columnModel.isPivotMode();
    if (this.isHorizontal()) {
      switch (this.gos.get("pivotPanelShow")) {
        case "always":
          this.setDisplayed(pivotMode);
          break;
        case "onlyWhenPivoting":
          const pivotActive = this.columnModel.isPivotActive();
          this.setDisplayed(pivotMode && pivotActive);
          break;
        default:
          this.setDisplayed(false);
          break;
      }
    } else {
      this.setDisplayed(pivotMode);
    }
  }
  isItemDroppable(column, draggingEvent) {
    if (this.gos.get("functionsReadOnly") || !column.isPrimary()) {
      return false;
    }
    return column.isAllowPivot() && (!column.isPivotActive() || this.isSourceEventFromTarget(draggingEvent));
  }
  updateItems(columns) {
    if (this.gos.get("functionsPassive")) {
      const event = {
        type: import_core9.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
        columns
      };
      this.eventService.dispatchEvent(event);
    } else {
      this.columnModel.setPivotColumns(columns, "toolPanelUi");
    }
  }
  getIconName() {
    return this.isPotentialDndItems() ? import_core9.DragAndDropService.ICON_PIVOT : import_core9.DragAndDropService.ICON_NOT_ALLOWED;
  }
  getExistingItems() {
    return this.columnModel.getPivotColumns();
  }
};
__decorateClass([
  import_core9.PostConstruct
], PivotDropZonePanel.prototype, "passBeansUp", 1);

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/gridHeaderDropZones.ts
var GridHeaderDropZones = class extends import_core10.Component {
  constructor() {
    super();
  }
  postConstruct() {
    this.setGui(this.createNorthPanel());
    this.addManagedListener(this.eventService, import_core10.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onRowGroupChanged());
    this.addManagedListener(this.eventService, import_core10.Events.EVENT_NEW_COLUMNS_LOADED, () => this.onRowGroupChanged());
    this.addManagedPropertyListener("rowGroupPanelShow", () => this.onRowGroupChanged());
    this.addManagedPropertyListener("pivotPanelShow", () => this.onPivotPanelShow());
    this.onRowGroupChanged();
  }
  createNorthPanel() {
    const topPanelGui = document.createElement("div");
    topPanelGui.classList.add("ag-column-drop-wrapper");
    import_core10._.setAriaRole(topPanelGui, "presentation");
    this.rowGroupComp = new RowGroupDropZonePanel(true);
    this.createManagedBean(this.rowGroupComp);
    this.pivotComp = new PivotDropZonePanel(true);
    this.createManagedBean(this.pivotComp);
    topPanelGui.appendChild(this.rowGroupComp.getGui());
    topPanelGui.appendChild(this.pivotComp.getGui());
    this.addManagedListener(this.rowGroupComp, import_core10.Component.EVENT_DISPLAYED_CHANGED, () => this.onDropPanelVisible());
    this.addManagedListener(this.pivotComp, import_core10.Component.EVENT_DISPLAYED_CHANGED, () => this.onDropPanelVisible());
    this.onDropPanelVisible();
    return topPanelGui;
  }
  onDropPanelVisible() {
    const bothDisplayed = this.rowGroupComp.isDisplayed() && this.pivotComp.isDisplayed();
    this.rowGroupComp.addOrRemoveCssClass("ag-column-drop-horizontal-half-width", bothDisplayed);
    this.pivotComp.addOrRemoveCssClass("ag-column-drop-horizontal-half-width", bothDisplayed);
  }
  onRowGroupChanged() {
    if (!this.rowGroupComp) {
      return;
    }
    const rowGroupPanelShow = this.gos.get("rowGroupPanelShow");
    if (rowGroupPanelShow === "always") {
      this.rowGroupComp.setDisplayed(true);
    } else if (rowGroupPanelShow === "onlyWhenGrouping") {
      const grouping = !this.columnModel.isRowGroupEmpty();
      this.rowGroupComp.setDisplayed(grouping);
    } else {
      this.rowGroupComp.setDisplayed(false);
    }
  }
  onPivotPanelShow() {
    if (!this.pivotComp) {
      return;
    }
    const pivotPanelShow = this.gos.get("pivotPanelShow");
    if (pivotPanelShow === "always") {
      this.pivotComp.setDisplayed(true);
    } else if (pivotPanelShow === "onlyWhenPivoting") {
      const pivoting = this.columnModel.isPivotActive();
      this.pivotComp.setDisplayed(pivoting);
    } else {
      this.pivotComp.setDisplayed(false);
    }
  }
};
__decorateClass([
  (0, import_core10.Autowired)("columnModel")
], GridHeaderDropZones.prototype, "columnModel", 2);
__decorateClass([
  import_core10.PostConstruct
], GridHeaderDropZones.prototype, "postConstruct", 1);

// enterprise-modules/row-grouping/src/rowGrouping/filterAggregatesStage.ts
var import_core11 = require("@ag-grid-community/core");
var FilterAggregatesStage = class extends import_core11.BeanStub {
  execute(params) {
    const isPivotMode = this.columnModel.isPivotMode();
    const isAggFilterActive = this.filterManager.isAggregateFilterPresent() || this.filterManager.isAggregateQuickFilterPresent();
    const defaultPrimaryColumnPredicate = (params2) => !params2.node.group;
    const defaultSecondaryColumnPredicate = (params2) => params2.node.leafGroup;
    const applyFilterToNode = this.gos.getGroupAggFiltering() || (isPivotMode ? defaultSecondaryColumnPredicate : defaultPrimaryColumnPredicate);
    const { changedPath } = params;
    const preserveChildren = (node, recursive = false) => {
      if (node.childrenAfterFilter) {
        node.childrenAfterAggFilter = node.childrenAfterFilter;
        if (recursive) {
          node.childrenAfterAggFilter.forEach((child) => preserveChildren(child, recursive));
        }
        this.setAllChildrenCount(node);
      }
      if (node.sibling) {
        node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
      }
    };
    const filterChildren = (node) => {
      var _a;
      node.childrenAfterAggFilter = ((_a = node.childrenAfterFilter) == null ? void 0 : _a.filter((child) => {
        var _a2;
        const shouldFilterRow = applyFilterToNode({ node: child });
        if (shouldFilterRow) {
          const doesNodePassFilter = this.filterManager.doesRowPassAggregateFilters({ rowNode: child });
          if (doesNodePassFilter) {
            preserveChildren(child, true);
            return true;
          }
        }
        const hasChildPassed = (_a2 = child.childrenAfterAggFilter) == null ? void 0 : _a2.length;
        return hasChildPassed;
      })) || null;
      this.setAllChildrenCount(node);
      if (node.sibling) {
        node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
      }
    };
    changedPath.forEachChangedNodeDepthFirst(
      isAggFilterActive ? filterChildren : preserveChildren,
      true
    );
  }
  setAllChildrenCountTreeData(rowNode) {
    let allChildrenCount = 0;
    rowNode.childrenAfterAggFilter.forEach((child) => {
      allChildrenCount++;
      allChildrenCount += child.allChildrenCount;
    });
    rowNode.setAllChildrenCount(allChildrenCount);
  }
  setAllChildrenCountGridGrouping(rowNode) {
    let allChildrenCount = 0;
    rowNode.childrenAfterAggFilter.forEach((child) => {
      if (child.group) {
        allChildrenCount += child.allChildrenCount;
      } else {
        allChildrenCount++;
      }
    });
    rowNode.setAllChildrenCount(allChildrenCount);
  }
  setAllChildrenCount(rowNode) {
    if (!rowNode.hasChildren()) {
      rowNode.setAllChildrenCount(null);
      return;
    }
    if (this.gos.get("treeData")) {
      this.setAllChildrenCountTreeData(rowNode);
    } else {
      this.setAllChildrenCountGridGrouping(rowNode);
    }
  }
};
__decorateClass([
  (0, import_core11.Autowired)("filterManager")
], FilterAggregatesStage.prototype, "filterManager", 2);
__decorateClass([
  (0, import_core11.Autowired)("columnModel")
], FilterAggregatesStage.prototype, "columnModel", 2);
FilterAggregatesStage = __decorateClass([
  (0, import_core11.Bean)("filterAggregatesStage")
], FilterAggregatesStage);

// enterprise-modules/row-grouping/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/row-grouping/src/rowGrouping/groupFilter/groupFilter.ts
var import_core12 = require("@ag-grid-community/core");
var _GroupFilter = class _GroupFilter extends import_core12.TabGuardComp {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-group-filter">
                <div ref="eGroupField"></div>
                <div ref="eUnderlyingFilter"></div>
            </div>
        `
    );
  }
  postConstruct() {
    this.initialiseTabGuard({});
  }
  init(params) {
    this.params = params;
    this.validateParams();
    return this.updateGroups().then(() => {
      this.addManagedListener(this.eventService, import_core12.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
    });
  }
  validateParams() {
    const { colDef } = this.params;
    if (colDef.field) {
      import_core12._.warnOnce('Group Column Filter does not work with the colDef property "field". This property will be ignored.');
    }
    if (colDef.filterValueGetter) {
      import_core12._.warnOnce('Group Column Filter does not work with the colDef property "filterValueGetter". This property will be ignored.');
    }
    if (colDef.filterParams) {
      import_core12._.warnOnce('Group Column Filter does not work with the colDef property "filterParams". This property will be ignored.');
    }
  }
  updateGroups() {
    const sourceColumns = this.updateGroupField();
    return this.getUnderlyingFilters(sourceColumns);
  }
  getSourceColumns() {
    this.groupColumn = this.params.column;
    if (this.gos.get("treeData")) {
      import_core12._.warnOnce("Group Column Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter.");
      return [];
    }
    const sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.groupColumn);
    if (!sourceColumns) {
      import_core12._.warnOnce("Group Column Filter only works on group columns. Please use a different filter.");
      return [];
    }
    return sourceColumns;
  }
  updateGroupField() {
    import_core12._.clearElement(this.eGroupField);
    if (this.eGroupFieldSelect) {
      this.destroyBean(this.eGroupFieldSelect);
    }
    const allSourceColumns = this.getSourceColumns();
    const sourceColumns = allSourceColumns.filter((sourceColumn) => sourceColumn.isFilterAllowed());
    if (!sourceColumns.length) {
      this.selectedColumn = void 0;
      import_core12._.setDisplayed(this.eGroupField, false);
      return null;
    }
    if (allSourceColumns.length === 1) {
      this.selectedColumn = sourceColumns[0];
      import_core12._.setDisplayed(this.eGroupField, false);
    } else {
      if (!this.selectedColumn || !sourceColumns.some((column) => column.getId() === this.selectedColumn.getId())) {
        this.selectedColumn = sourceColumns[0];
      }
      this.createGroupFieldSelectElement(sourceColumns);
      this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
      this.eGroupField.appendChild(import_core12._.loadTemplate(
        /* html */
        `<div class="ag-filter-separator"></div>`
      ));
      import_core12._.setDisplayed(this.eGroupField, true);
    }
    return sourceColumns;
  }
  createGroupFieldSelectElement(sourceColumns) {
    this.eGroupFieldSelect = this.createManagedBean(new import_core12.AgSelect());
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    this.eGroupFieldSelect.setLabel(localeTextFunc("groupFilterSelect", "Select field:"));
    this.eGroupFieldSelect.setLabelAlignment("top");
    this.eGroupFieldSelect.addOptions(sourceColumns.map((sourceColumn) => {
      var _a;
      return {
        value: sourceColumn.getId(),
        text: (_a = this.columnModel.getDisplayNameForColumn(sourceColumn, "groupFilter", false)) != null ? _a : void 0
      };
    }));
    this.eGroupFieldSelect.setValue(this.selectedColumn.getId());
    this.eGroupFieldSelect.onValueChange((newValue) => this.updateSelectedColumn(newValue));
    this.eGroupFieldSelect.addCssClass("ag-group-filter-field-select-wrapper");
    if (sourceColumns.length === 1) {
      this.eGroupFieldSelect.setDisabled(true);
    }
  }
  getUnderlyingFilters(sourceColumns) {
    if (!sourceColumns) {
      this.filterColumnPairs = void 0;
      this.selectedFilter = void 0;
      this.groupColumn.setFilterActive(false, "columnRowGroupChanged");
      return import_core12.AgPromise.resolve();
    }
    const filterPromises = [];
    const filterColumnPairs = [];
    sourceColumns.forEach((column) => {
      const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, "COLUMN_MENU");
      if (filterWrapper == null ? void 0 : filterWrapper.filterPromise) {
        filterPromises.push(filterWrapper.filterPromise.then((filter) => {
          if (filter) {
            filterColumnPairs.push({
              filter,
              column
            });
          }
          if (column.getId() === this.selectedColumn.getId()) {
            this.selectedFilter = filter != null ? filter : void 0;
          }
          return filter;
        }));
      }
    });
    return import_core12.AgPromise.all(filterPromises).then(() => {
      this.filterColumnPairs = filterColumnPairs;
      this.groupColumn.setFilterActive(this.isFilterActive(), "columnRowGroupChanged");
    });
  }
  addUnderlyingFilterElement() {
    var _a, _b;
    import_core12._.clearElement(this.eUnderlyingFilter);
    if (!this.selectedColumn) {
      return import_core12.AgPromise.resolve();
    }
    const comp = this.createManagedBean(new import_core12.FilterWrapperComp(this.selectedColumn, "COLUMN_MENU"));
    this.filterWrapperComp = comp;
    if (!comp.hasFilter()) {
      return import_core12.AgPromise.resolve();
    }
    this.eUnderlyingFilter.appendChild(comp.getGui());
    return (_b = (_a = comp.getFilter()) == null ? void 0 : _a.then(() => {
      var _a2, _b2;
      (_a2 = comp.afterGuiAttached) == null ? void 0 : _a2.call(comp, this.afterGuiAttachedParams);
      if (!((_b2 = this.afterGuiAttachedParams) == null ? void 0 : _b2.suppressFocus) && this.eGroupFieldSelect && !this.eGroupFieldSelect.isDisabled()) {
        this.eGroupFieldSelect.getFocusableElement().focus();
      }
    })) != null ? _b : import_core12.AgPromise.resolve();
  }
  updateSelectedColumn(columnId) {
    var _a;
    if (!columnId) {
      return;
    }
    (_a = this.filterWrapperComp) == null ? void 0 : _a.afterGuiDetached();
    this.destroyBean(this.filterWrapperComp);
    const selectedFilterColumnPair = this.getFilterColumnPair(columnId);
    this.selectedColumn = selectedFilterColumnPair == null ? void 0 : selectedFilterColumnPair.column;
    this.selectedFilter = selectedFilterColumnPair == null ? void 0 : selectedFilterColumnPair.filter;
    this.dispatchEvent({
      type: _GroupFilter.EVENT_SELECTED_COLUMN_CHANGED
    });
    this.addUnderlyingFilterElement();
  }
  isFilterActive() {
    var _a;
    return !!((_a = this.filterColumnPairs) == null ? void 0 : _a.some(({ filter }) => filter.isFilterActive()));
  }
  doesFilterPass() {
    return true;
  }
  getModel() {
    return null;
  }
  setModel() {
    return import_core12.AgPromise.resolve();
  }
  afterGuiAttached(params) {
    this.afterGuiAttachedParams = params;
    this.addUnderlyingFilterElement();
  }
  afterGuiDetached() {
    var _a, _b;
    import_core12._.clearElement(this.eUnderlyingFilter);
    (_b = (_a = this.selectedFilter) == null ? void 0 : _a.afterGuiDetached) == null ? void 0 : _b.call(_a);
  }
  onColumnRowGroupChanged() {
    this.updateGroups().then(() => {
      this.dispatchEvent({
        type: _GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED
      });
      this.eventService.dispatchEvent({
        type: "filterAllowedUpdated"
      });
    });
  }
  getFilterColumnPair(columnId) {
    var _a;
    if (!columnId) {
      return void 0;
    }
    return (_a = this.filterColumnPairs) == null ? void 0 : _a.find(({ column }) => column.getId() === columnId);
  }
  getSelectedFilter() {
    return this.selectedFilter;
  }
  getSelectedColumn() {
    return this.selectedColumn;
  }
  isFilterAllowed() {
    return !!this.selectedColumn;
  }
  destroy() {
    super.destroy();
  }
};
_GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED = "columnRowGroupChanged";
_GroupFilter.EVENT_SELECTED_COLUMN_CHANGED = "selectedColumnChanged";
__decorateClass([
  (0, import_core12.Autowired)("filterManager")
], _GroupFilter.prototype, "filterManager", 2);
__decorateClass([
  (0, import_core12.Autowired)("columnModel")
], _GroupFilter.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core12.RefSelector)("eGroupField")
], _GroupFilter.prototype, "eGroupField", 2);
__decorateClass([
  (0, import_core12.RefSelector)("eUnderlyingFilter")
], _GroupFilter.prototype, "eUnderlyingFilter", 2);
__decorateClass([
  import_core12.PostConstruct
], _GroupFilter.prototype, "postConstruct", 1);
var GroupFilter = _GroupFilter;

// enterprise-modules/row-grouping/src/rowGrouping/groupFilter/groupFloatingFilter.ts
var import_core13 = require("@ag-grid-community/core");
var GroupFloatingFilterComp = class extends import_core13.Component {
  constructor() {
    super(
      /* html */
      `
            <div ref="eFloatingFilter" class="ag-group-floating-filter ag-floating-filter-input" role="presentation"></div>
        `
    );
    this.haveAddedColumnListeners = false;
  }
  init(params) {
    this.params = params;
    const canShowUnderlyingFloatingFilter = this.gos.get("groupDisplayType") === "multipleColumns";
    return new import_core13.AgPromise((resolve) => {
      this.params.parentFilterInstance((parentFilterInstance) => {
        this.parentFilterInstance = parentFilterInstance;
        if (canShowUnderlyingFloatingFilter) {
          this.setupUnderlyingFloatingFilterElement().then(() => resolve());
        } else {
          this.setupReadOnlyFloatingFilterElement();
          resolve();
        }
      });
    }).then(() => {
      this.addManagedListener(this.parentFilterInstance, GroupFilter.EVENT_SELECTED_COLUMN_CHANGED, () => this.onSelectedColumnChanged());
      this.addManagedListener(this.parentFilterInstance, GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
    });
  }
  onParamsUpdated(params) {
    this.refresh(params);
  }
  refresh(params) {
    this.params = params;
    this.setParams();
  }
  setParams() {
    var _a;
    const displayName = this.columnModel.getDisplayNameForColumn(this.params.column, "header", true);
    const translate = this.localeService.getLocaleTextFunc();
    (_a = this.eFloatingFilterText) == null ? void 0 : _a.setInputAriaLabel(`${displayName} ${translate("ariaFilterInput", "Filter Input")}`);
  }
  setupReadOnlyFloatingFilterElement() {
    if (!this.eFloatingFilterText) {
      this.eFloatingFilterText = this.createManagedBean(new import_core13.AgInputTextField());
      this.eFloatingFilterText.setDisabled(true).addGuiEventListener("click", () => this.params.showParentFilter());
      this.setParams();
    }
    this.updateDisplayedValue();
    this.eFloatingFilter.appendChild(this.eFloatingFilterText.getGui());
  }
  setupUnderlyingFloatingFilterElement() {
    this.showingUnderlyingFloatingFilter = false;
    this.underlyingFloatingFilter = void 0;
    import_core13._.clearElement(this.eFloatingFilter);
    const column = this.parentFilterInstance.getSelectedColumn();
    if (column && !column.isVisible()) {
      const compDetails = this.filterManager.getFloatingFilterCompDetails(column, this.params.showParentFilter);
      if (compDetails) {
        this.compDetails = compDetails;
        if (!this.haveAddedColumnListeners) {
          this.haveAddedColumnListeners = true;
          this.addManagedListener(column, import_core13.Column.EVENT_VISIBLE_CHANGED, this.onColumnVisibleChanged.bind(this));
          this.addManagedListener(column, import_core13.Column.EVENT_COL_DEF_CHANGED, this.onColDefChanged.bind(this));
        }
        return compDetails.newAgStackInstance().then((floatingFilter) => {
          var _a, _b;
          this.underlyingFloatingFilter = floatingFilter;
          (_b = this.underlyingFloatingFilter) == null ? void 0 : _b.onParentModelChanged((_a = this.parentFilterInstance.getSelectedFilter()) == null ? void 0 : _a.getModel());
          this.appendChild(floatingFilter.getGui());
          this.showingUnderlyingFloatingFilter = true;
        });
      }
    }
    this.setupReadOnlyFloatingFilterElement();
    return import_core13.AgPromise.resolve();
  }
  onColumnVisibleChanged() {
    this.setupUnderlyingFloatingFilterElement();
  }
  onColDefChanged(event) {
    var _a, _b, _c;
    if (!event.column) {
      return;
    }
    const compDetails = this.filterManager.getFloatingFilterCompDetails(event.column, this.params.showParentFilter);
    if (compDetails) {
      if ((_a = this.underlyingFloatingFilter) == null ? void 0 : _a.refresh) {
        this.underlyingFloatingFilter.refresh(compDetails.params);
      } else {
        (_c = (_b = this.underlyingFloatingFilter) == null ? void 0 : _b.onParamsUpdated) == null ? void 0 : _c.call(_b, compDetails.params);
      }
    }
  }
  onParentModelChanged(_model, event) {
    var _a, _b;
    if (this.showingUnderlyingFloatingFilter) {
      (_b = this.underlyingFloatingFilter) == null ? void 0 : _b.onParentModelChanged((_a = this.parentFilterInstance.getSelectedFilter()) == null ? void 0 : _a.getModel(), event);
    } else {
      this.updateDisplayedValue();
    }
  }
  updateDisplayedValue() {
    if (!this.parentFilterInstance || !this.eFloatingFilterText) {
      return;
    }
    const selectedFilter = this.parentFilterInstance.getSelectedFilter();
    if (!selectedFilter) {
      this.eFloatingFilterText.setValue("");
      this.eFloatingFilterText.setDisplayed(false);
      return;
    }
    this.eFloatingFilterText.setDisplayed(true);
    if (selectedFilter.getModelAsString) {
      const filterModel = selectedFilter.getModel();
      this.eFloatingFilterText.setValue(filterModel == null ? "" : selectedFilter.getModelAsString(filterModel));
    } else {
      this.eFloatingFilterText.setValue("");
    }
  }
  onSelectedColumnChanged() {
    if (!this.showingUnderlyingFloatingFilter) {
      this.updateDisplayedValue();
    }
  }
  onColumnRowGroupChanged() {
    if (!this.showingUnderlyingFloatingFilter) {
      this.updateDisplayedValue();
    }
  }
  destroy() {
    super.destroy();
  }
};
__decorateClass([
  (0, import_core13.Autowired)("columnModel")
], GroupFloatingFilterComp.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core13.Autowired)("filterManager")
], GroupFloatingFilterComp.prototype, "filterManager", 2);
__decorateClass([
  (0, import_core13.RefSelector)("eFloatingFilter")
], GroupFloatingFilterComp.prototype, "eFloatingFilter", 2);

// enterprise-modules/row-grouping/src/rowGroupingModule.ts
var RowGroupingModule = {
  version: VERSION,
  moduleName: import_core14.ModuleNames.RowGroupingModule,
  beans: [AggregationStage, FilterAggregatesStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
  agStackComponents: [
    { componentName: "AgGridHeaderDropZones", componentClass: GridHeaderDropZones }
  ],
  userComponents: [
    { componentName: "agGroupColumnFilter", componentClass: GroupFilter },
    { componentName: "agGroupColumnFloatingFilter", componentClass: GroupFloatingFilterComp }
  ],
  dependantModules: [
    import_core15.EnterpriseCoreModule
  ]
};

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/valueDropZonePanel.ts
var import_core16 = require("@ag-grid-community/core");
var ValuesDropZonePanel = class extends BaseDropZonePanel {
  constructor(horizontal) {
    super(horizontal, "aggregation");
  }
  passBeansUp() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const emptyMessage = localeTextFunc("valueColumnsEmptyMessage", "Drag here to aggregate");
    const title = localeTextFunc("values", "Values");
    super.init({
      icon: import_core16._.createIconNoSpan("valuePanel", this.gos, null),
      emptyMessage,
      title
    });
    this.addManagedListener(this.eventService, import_core16.Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
  }
  getAriaLabel() {
    const translate = this.localeService.getLocaleTextFunc();
    const label = translate("ariaValuesDropZonePanelLabel", "Values");
    return label;
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "valueColumnsList";
    return res;
  }
  getIconName() {
    return this.isPotentialDndItems() ? import_core16.DragAndDropService.ICON_AGGREGATE : import_core16.DragAndDropService.ICON_NOT_ALLOWED;
  }
  isItemDroppable(column, draggingEvent) {
    if (this.gos.get("functionsReadOnly") || !column.isPrimary()) {
      return false;
    }
    return column.isAllowValue() && (!column.isValueActive() || this.isSourceEventFromTarget(draggingEvent));
  }
  updateItems(columns) {
    if (this.gos.get("functionsPassive")) {
      const event = {
        type: import_core16.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
        columns
      };
      this.eventService.dispatchEvent(event);
    } else {
      this.columnModel.setValueColumns(columns, "toolPanelUi");
    }
  }
  getExistingItems() {
    return this.columnModel.getValueColumns();
  }
};
__decorateClass([
  import_core16.PostConstruct
], ValuesDropZonePanel.prototype, "passBeansUp", 1);
