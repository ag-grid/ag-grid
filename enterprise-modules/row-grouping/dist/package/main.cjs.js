var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_core19 = require("@ag-grid-community/core");
var import_core20 = require("@ag-grid-enterprise/core");

// enterprise-modules/row-grouping/src/rowGrouping/aggFuncService.ts
var import_core = require("@ag-grid-community/core");
var defaultAggFuncNames = {
  sum: "Sum",
  first: "First",
  last: "Last",
  min: "Min",
  max: "Max",
  count: "Count",
  avg: "Average"
};
var AggFuncService = class extends import_core.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "aggFuncService";
    this.aggFuncsMap = {};
    this.initialised = false;
  }
  postConstruct() {
    this.init();
  }
  init() {
    if (this.initialised) {
      return;
    }
    this.initialiseWithDefaultAggregations();
    this.addAggFuncs(this.gos.get("aggFuncs"));
  }
  initialiseWithDefaultAggregations() {
    const aggMap = this.aggFuncsMap;
    aggMap["sum"] = aggSum;
    aggMap["first"] = aggFirst;
    aggMap["last"] = aggLast;
    aggMap["min"] = aggMin;
    aggMap["max"] = aggMax;
    aggMap["count"] = aggCount;
    aggMap["avg"] = aggAvg;
    this.initialised = true;
  }
  isAggFuncPossible(column, func) {
    const allKeys = this.getFuncNames(column);
    const allowed = (0, import_core._includes)(allKeys, func);
    const funcExists = (0, import_core._exists)(this.aggFuncsMap[func]);
    return allowed && funcExists;
  }
  getDefaultFuncLabel(fctName) {
    return defaultAggFuncNames[fctName] ?? fctName;
  }
  getDefaultAggFunc(column) {
    const defaultAgg = column.getColDef().defaultAggFunc;
    if ((0, import_core._exists)(defaultAgg) && this.isAggFuncPossible(column, defaultAgg)) {
      return defaultAgg;
    }
    if (this.isAggFuncPossible(column, "sum")) {
      return "sum";
    }
    const allKeys = this.getFuncNames(column);
    return (0, import_core._existsAndNotEmpty)(allKeys) ? allKeys[0] : null;
  }
  addAggFuncs(aggFuncs) {
    this.init();
    (0, import_core._iterateObject)(aggFuncs, (key, aggFunc) => {
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
  return params.values.length > 0 ? (0, import_core._last)(params.values) : null;
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
  const { values } = params;
  let result = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    result += value != null && typeof value.value === "number" ? value.value : 1;
  }
  const existingAggData = params.rowNode?.aggData?.[params.column.getColId()];
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
  const existingAggData = params.rowNode?.aggData?.[params.column?.getColId()];
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

// enterprise-modules/row-grouping/src/rowGrouping/aggregationStage.ts
var import_core2 = require("@ag-grid-community/core");
var AggregationStage = class extends import_core2.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "aggregationStage";
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.aggFuncService = beans.aggFuncService;
    this.funcColsService = beans.funcColsService;
    this.pivotResultColsService = beans.pivotResultColsService;
    this.valueService = beans.valueService;
  }
  // it's possible to recompute the aggregate without doing the other parts
  // + api.refreshClientSideRowModel('aggregate')
  execute(params) {
    const noValueColumns = (0, import_core2._missingOrEmpty)(this.funcColsService.getValueColumns());
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
    const measureColumns = this.funcColsService.getValueColumns();
    const pivotColumns = pivotActive ? this.funcColsService.getPivotColumns() : [];
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
    const result = {};
    const secondaryColumns = this.pivotResultColsService.getPivotResultCols()?.list ?? [];
    let canSkipTotalColumns = true;
    for (let i = 0; i < secondaryColumns.length; i++) {
      const secondaryCol = secondaryColumns[i];
      const colDef = secondaryCol.getColDef();
      if (colDef.pivotTotalColumnIds != null) {
        canSkipTotalColumns = false;
        continue;
      }
      const keys = colDef.pivotKeys ?? [];
      let values;
      if (rowNode.leafGroup) {
        values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, colDef.pivotValueColumn);
      } else {
        values = this.getValuesPivotNonLeaf(rowNode, colDef.colId);
      }
      result[colDef.colId] = this.aggregateValues(
        values,
        colDef.pivotValueColumn.getAggFunc(),
        colDef.pivotValueColumn,
        rowNode,
        secondaryCol
      );
    }
    if (!canSkipTotalColumns) {
      for (let i = 0; i < secondaryColumns.length; i++) {
        const secondaryCol = secondaryColumns[i];
        const colDef = secondaryCol.getColDef();
        if (colDef.pivotTotalColumnIds == null || !colDef.pivotTotalColumnIds.length) {
          continue;
        }
        const aggResults = colDef.pivotTotalColumnIds.map(
          (currentColId) => result[currentColId]
        );
        result[colDef.colId] = this.aggregateValues(
          aggResults,
          colDef.pivotValueColumn.getAggFunc(),
          colDef.pivotValueColumn,
          rowNode,
          secondaryCol
        );
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
      result[valueColumn.getId()] = this.aggregateValues(
        values2d[index],
        valueColumn.getAggFunc(),
        valueColumn,
        rowNode
      );
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
      (0, import_core2._errorOnce)(`unrecognised aggregation function ${aggFuncOrString}`);
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

// enterprise-modules/row-grouping/src/rowGrouping/autoColService.ts
var import_core3 = require("@ag-grid-community/core");
var AutoColService = class extends import_core3.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "autoColService";
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.columnNameService = beans.columnNameService;
    this.columnFactory = beans.columnFactory;
  }
  createAutoCols(rowGroupCols) {
    const autoCols = [];
    const doingTreeData = this.gos.get("treeData");
    let doingMultiAutoColumn = this.gos.isGroupMultiAutoColumn();
    if (doingTreeData && doingMultiAutoColumn) {
      (0, import_core3._warnOnce)(
        'you cannot mix groupDisplayType = "multipleColumns" with treeData, only one column can be used to display groups when doing tree data'
      );
      doingMultiAutoColumn = false;
    }
    if (doingMultiAutoColumn) {
      rowGroupCols.forEach((rowGroupCol, index) => {
        autoCols.push(this.createOneAutoCol(rowGroupCol, index));
      });
    } else {
      autoCols.push(this.createOneAutoCol());
    }
    return autoCols;
  }
  updateAutoCols(autoGroupCols, source) {
    autoGroupCols.forEach((col, index) => this.updateOneAutoCol(col, index, source));
  }
  // rowGroupCol and index are missing if groupDisplayType != "multipleColumns"
  createOneAutoCol(rowGroupCol, index) {
    let colId;
    if (rowGroupCol) {
      colId = `${import_core3.GROUP_AUTO_COLUMN_ID}-${rowGroupCol.getId()}`;
    } else {
      colId = import_core3.GROUP_AUTO_COLUMN_ID;
    }
    const colDef = this.createAutoColDef(colId, rowGroupCol, index);
    colDef.colId = colId;
    const newCol = new import_core3.AgColumn(colDef, null, colId, true);
    this.createBean(newCol);
    return newCol;
  }
  /**
   * Refreshes an auto group col to load changes from defaultColDef or autoGroupColDef
   */
  updateOneAutoCol(colToUpdate, index, source) {
    const oldColDef = colToUpdate.getColDef();
    const underlyingColId = typeof oldColDef.showRowGroup == "string" ? oldColDef.showRowGroup : void 0;
    const underlyingColumn = underlyingColId != null ? this.columnModel.getColDefCol(underlyingColId) : void 0;
    const colDef = this.createAutoColDef(colToUpdate.getId(), underlyingColumn ?? void 0, index);
    colToUpdate.setColDef(colDef, null, source);
    this.columnFactory.applyColumnState(colToUpdate, colDef, source);
  }
  createAutoColDef(colId, underlyingColumn, index) {
    let res = this.createBaseColDef(underlyingColumn);
    const autoGroupColumnDef = this.gos.get("autoGroupColumnDef");
    (0, import_core3._mergeDeep)(res, autoGroupColumnDef);
    res = this.columnFactory.addColumnDefaultAndTypes(res, colId);
    if (!this.gos.get("treeData")) {
      const noFieldOrValueGetter = (0, import_core3._missing)(res.field) && (0, import_core3._missing)(res.valueGetter) && (0, import_core3._missing)(res.filterValueGetter) && res.filter !== "agGroupColumnFilter";
      if (noFieldOrValueGetter) {
        res.filter = false;
      }
    }
    if (index && index > 0) {
      res.headerCheckboxSelection = false;
    }
    const isSortingCoupled = this.gos.isColumnsSortingCoupledToGroup();
    const hasOwnData = res.valueGetter || res.field != null;
    if (isSortingCoupled && !hasOwnData) {
      res.sortIndex = void 0;
      res.initialSort = void 0;
    }
    return res;
  }
  createBaseColDef(rowGroupCol) {
    const userDef = this.gos.get("autoGroupColumnDef");
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const res = {
      headerName: localeTextFunc("group", "Group")
    };
    const userHasProvidedGroupCellRenderer = userDef && (userDef.cellRenderer || userDef.cellRendererSelector);
    if (!userHasProvidedGroupCellRenderer) {
      res.cellRenderer = "agGroupCellRenderer";
    }
    if (rowGroupCol) {
      const colDef = rowGroupCol.getColDef();
      Object.assign(res, {
        // cellRendererParams.groupKey: colDefToCopy.field;
        headerName: this.columnNameService.getDisplayNameForColumn(rowGroupCol, "header"),
        headerValueGetter: colDef.headerValueGetter
      });
      if (colDef.cellRenderer) {
        Object.assign(res, {
          cellRendererParams: {
            innerRenderer: colDef.cellRenderer,
            innerRendererParams: colDef.cellRendererParams
          }
        });
      }
      res.showRowGroup = rowGroupCol.getColId();
    } else {
      res.showRowGroup = true;
    }
    return res;
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/columnDropZoneService.ts
var import_core11 = require("@ag-grid-community/core");

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/agGridHeaderDropZones.ts
var import_core10 = require("@ag-grid-community/core");

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/pivotDropZonePanel.ts
var import_core8 = require("@ag-grid-community/core");

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/baseDropZonePanel.ts
var import_core6 = require("@ag-grid-community/core");
var import_core7 = require("@ag-grid-enterprise/core");

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/dropZoneColumnComp.ts
var import_core4 = require("@ag-grid-community/core");
var import_core5 = require("@ag-grid-enterprise/core");
var DropZoneColumnComp = class extends import_core5.PillDragComp {
  constructor(column, dragSourceDropTarget, ghost, dropZonePurpose, horizontal) {
    super(
      dragSourceDropTarget,
      ghost,
      horizontal,
      /* html */
      `
                <span role="option">
                    <span data-ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle" role="presentation"></span>
                    <span data-ref="eText" class="ag-column-drop-cell-text" aria-hidden="true"></span>
                    <ag-sort-indicator data-ref="eSortIndicator"></ag-sort-indicator>
                    <span data-ref="eButton" class="ag-column-drop-cell-button" role="presentation"></span>
                </span>
            `,
      [import_core4.SortIndicatorSelector]
    );
    this.column = column;
    this.dropZonePurpose = dropZonePurpose;
    this.eSortIndicator = import_core4.RefPlaceholder;
    this.popupShowing = false;
  }
  wireBeans(beans) {
    super.wireBeans(beans);
    this.popupService = beans.popupService;
    this.sortController = beans.sortController;
    this.columnModel = beans.columnModel;
    this.columnNameService = beans.columnNameService;
    this.funcColsService = beans.funcColsService;
    this.aggFuncService = beans.aggFuncService;
  }
  postConstruct() {
    this.displayName = this.columnNameService.getDisplayNameForColumn(this.column, "columnDrop");
    super.postConstruct();
    this.setupSort();
    this.addManagedEventListeners({
      sortChanged: () => {
        this.setupAria();
      }
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
      const aggregationMenuAria = translate(
        "ariaDropZoneColumnValueItemDescription",
        "Press ENTER to change the aggregation type"
      );
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
        const isEnter = e.key === import_core4.KeyCode.ENTER;
        if (isEnter && this.isGroupingZone()) {
          performSort(e);
        }
      });
    }
  }
  getDefaultIconName() {
    return "hide";
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
    const isEnter = e.key === import_core4.KeyCode.ENTER;
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
    const virtualList = new import_core5.VirtualList({ cssIdentifier: "select-agg-func" });
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
    this.createBean(virtualList);
    const ePopup = (0, import_core4._loadTemplate)(
      /* html*/
      `<div class="ag-select-agg-func-popup"></div>`
    );
    ePopup.style.top = "0px";
    ePopup.style.left = "0px";
    ePopup.appendChild(virtualListGui);
    ePopup.style.width = `${eGui.clientWidth}px`;
    const [focusoutListener] = this.addManagedElementListeners(ePopup, {
      focusout: (e) => {
        if (!ePopup.contains(e.relatedTarget) && addPopupRes) {
          addPopupRes.hideFunc();
        }
      }
    });
    const popupHiddenFunc = (callbackEvent) => {
      this.destroyBean(virtualList);
      this.popupShowing = false;
      if (callbackEvent?.key === "Escape") {
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
      virtualList.setComponentCreator(this.createAggSelect.bind(this, addPopupRes.hideFunc));
    }
    virtualList.addGuiEventListener("keydown", (e) => {
      if (e.key === import_core4.KeyCode.ENTER || e.key === import_core4.KeyCode.SPACE) {
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
      this.funcColsService.setColumnAggFunc(this.column, value, "toolPanelDragAndDrop");
    };
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const aggFuncString = value.toString();
    const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
    const comp = new AggItemComp(itemSelected, aggFuncStringTranslated);
    return comp;
  }
  isGroupingAndLocked() {
    return this.isGroupingZone() && this.columnModel.isColGroupLocked(this.column);
  }
  isAggregationZone() {
    return this.dropZonePurpose === "aggregation";
  }
  isGroupingZone() {
    return this.dropZonePurpose === "rowGroup";
  }
  getDragSourceType() {
    return import_core4.DragSourceType.ToolPanel;
  }
  destroy() {
    super.destroy();
    this.column = null;
  }
};
var AggItemComp = class extends import_core4.Component {
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
  wireBeans(beans) {
    super.wireBeans(beans);
    this.columnModel = beans.columnModel;
    this.funcColsService = beans.funcColsService;
  }
  init(params) {
    super.init(params);
    this.addManagedEventListeners({ newColumnsLoaded: this.refreshGui.bind(this) });
    this.addManagedPropertyListeners(
      ["functionsReadOnly", "rowGroupPanelSuppressSort", "groupLockGroupColumns"],
      this.refreshGui.bind(this)
    );
  }
  getItems(dragItem) {
    return dragItem.columns ?? [];
  }
  isInterestedIn(type) {
    return type === import_core6.DragSourceType.HeaderCell || type === import_core6.DragSourceType.ToolPanel;
  }
  minimumAllowedNewInsertIndex() {
    const numberOfLockedCols = this.gos.get("groupLockGroupColumns");
    const numberOfGroupCols = this.funcColsService.getRowGroupColumns().length;
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
      this.columnModel.setColsVisible(allowedCols, visible, source);
    }
  }
  isRowGroupPanel() {
    return this.dropZonePurpose === "rowGroup";
  }
  createPillComponent(column, dropTarget, ghost, horizontal) {
    return new DropZoneColumnComp(column, dropTarget, ghost, this.dropZonePurpose, horizontal);
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/pivotDropZonePanel.ts
var PivotDropZonePanel = class extends BaseDropZonePanel {
  constructor(horizontal) {
    super(horizontal, "pivot");
  }
  postConstruct() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const emptyMessage = localeTextFunc("pivotColumnsEmptyMessage", "Drag here to set column labels");
    const title = localeTextFunc("pivots", "Column Labels");
    super.init({
      icon: (0, import_core8._createIconNoSpan)("pivotPanel", this.gos, null),
      emptyMessage,
      title
    });
    this.addManagedEventListeners({
      newColumnsLoaded: this.refresh.bind(this),
      columnPivotChanged: this.refresh.bind(this),
      columnPivotModeChanged: this.checkVisibility.bind(this)
    });
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
        case "onlyWhenPivoting": {
          const pivotActive = this.columnModel.isPivotActive();
          this.setDisplayed(pivotMode && pivotActive);
          break;
        }
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
    this.funcColsService.setPivotColumns(columns, "toolPanelUi");
  }
  getIconName() {
    return this.isPotentialDndItems() ? "pivot" : "notAllowed";
  }
  getExistingItems() {
    return this.funcColsService.getPivotColumns();
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/rowGroupDropZonePanel.ts
var import_core9 = require("@ag-grid-community/core");
var RowGroupDropZonePanel = class extends BaseDropZonePanel {
  constructor(horizontal) {
    super(horizontal, "rowGroup");
  }
  postConstruct() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const emptyMessage = localeTextFunc("rowGroupColumnsEmptyMessage", "Drag here to set row groups");
    const title = localeTextFunc("groups", "Row Groups");
    super.init({
      icon: (0, import_core9._createIconNoSpan)("rowGroupPanel", this.gos, null),
      emptyMessage,
      title
    });
    this.addManagedEventListeners({ columnRowGroupChanged: this.refreshGui.bind(this) });
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
    this.funcColsService.setRowGroupColumns(columns, "toolPanelUi");
  }
  getIconName() {
    return this.isPotentialDndItems() ? "group" : "notAllowed";
  }
  getExistingItems() {
    return this.funcColsService.getRowGroupColumns();
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/agGridHeaderDropZones.ts
var AgGridHeaderDropZones = class extends import_core10.Component {
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.funcColsService = beans.funcColsService;
  }
  constructor() {
    super();
  }
  postConstruct() {
    this.setGui(this.createNorthPanel());
    const onRowGroupChanged = this.onRowGroupChanged.bind(this);
    this.addManagedEventListeners({
      columnRowGroupChanged: onRowGroupChanged,
      newColumnsLoaded: onRowGroupChanged
    });
    this.addManagedPropertyListener("rowGroupPanelShow", onRowGroupChanged);
    this.addManagedPropertyListener("pivotPanelShow", () => this.onPivotPanelShow());
    this.onRowGroupChanged();
  }
  createNorthPanel() {
    const topPanelGui = document.createElement("div");
    topPanelGui.classList.add("ag-column-drop-wrapper");
    (0, import_core10._setAriaRole)(topPanelGui, "presentation");
    this.rowGroupComp = new RowGroupDropZonePanel(true);
    this.createManagedBean(this.rowGroupComp);
    this.pivotComp = new PivotDropZonePanel(true);
    this.createManagedBean(this.pivotComp);
    topPanelGui.appendChild(this.rowGroupComp.getGui());
    topPanelGui.appendChild(this.pivotComp.getGui());
    const listener = this.onDropPanelVisible.bind(this);
    this.addManagedListeners(this.rowGroupComp, {
      displayChanged: listener
    });
    this.addManagedListeners(this.pivotComp, {
      displayChanged: listener
    });
    this.onDropPanelVisible();
    return topPanelGui;
  }
  onDropPanelVisible() {
    const bothDisplayed = this.rowGroupComp.isDisplayed() && this.pivotComp.isDisplayed();
    const classStr = "ag-column-drop-horizontal-half-width";
    this.rowGroupComp.addOrRemoveCssClass(classStr, bothDisplayed);
    this.pivotComp.addOrRemoveCssClass(classStr, bothDisplayed);
  }
  onRowGroupChanged() {
    if (!this.rowGroupComp) {
      return;
    }
    const rowGroupPanelShow = this.gos.get("rowGroupPanelShow");
    if (rowGroupPanelShow === "always") {
      this.rowGroupComp.setDisplayed(true);
    } else if (rowGroupPanelShow === "onlyWhenGrouping") {
      const grouping = !this.funcColsService.isRowGroupEmpty();
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
var AgGridHeaderDropZonesSelector = {
  selector: "AG-GRID-HEADER-DROP-ZONES",
  component: AgGridHeaderDropZones
};

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/columnDropZoneService.ts
var ColumnDropZoneService = class extends import_core11.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "columnDropZonesService";
  }
  getDropZoneSelector() {
    return AgGridHeaderDropZonesSelector;
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/filterAggregatesStage.ts
var import_core12 = require("@ag-grid-community/core");
var FilterAggregatesStage = class extends import_core12.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "filterAggregatesStage";
  }
  wireBeans(beans) {
    this.filterManager = beans.filterManager;
    this.columnModel = beans.columnModel;
  }
  execute(params) {
    const isPivotMode2 = this.columnModel.isPivotMode();
    const isAggFilterActive = this.filterManager?.isAggregateFilterPresent() || this.filterManager?.isAggregateQuickFilterPresent();
    const defaultPrimaryColumnPredicate = (params2) => !params2.node.group;
    const defaultSecondaryColumnPredicate = (params2) => params2.node.leafGroup;
    const applyFilterToNode = this.gos.getGroupAggFiltering() || (isPivotMode2 ? defaultSecondaryColumnPredicate : defaultPrimaryColumnPredicate);
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
      node.childrenAfterAggFilter = node.childrenAfterFilter?.filter((child) => {
        const shouldFilterRow = applyFilterToNode({ node: child });
        if (shouldFilterRow) {
          const doesNodePassFilter = this.filterManager.doesRowPassAggregateFilters({ rowNode: child });
          if (doesNodePassFilter) {
            preserveChildren(child, true);
            return true;
          }
        }
        const hasChildPassed = child.childrenAfterAggFilter?.length;
        return hasChildPassed;
      }) || null;
      this.setAllChildrenCount(node);
      if (node.sibling) {
        node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
      }
    };
    changedPath.forEachChangedNodeDepthFirst(isAggFilterActive ? filterChildren : preserveChildren, true);
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

// enterprise-modules/row-grouping/src/rowGrouping/groupFilter/groupFilter.ts
var import_core13 = require("@ag-grid-community/core");
var GroupFilter = class extends import_core13.TabGuardComp {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-group-filter">
                <div data-ref="eGroupField"></div>
                <div data-ref="eUnderlyingFilter"></div>
            </div>
        `
    );
    this.eGroupField = import_core13.RefPlaceholder;
    this.eUnderlyingFilter = import_core13.RefPlaceholder;
  }
  wireBeans(beans) {
    this.filterManager = beans.filterManager;
    this.columnNameService = beans.columnNameService;
    this.funcColsService = beans.funcColsService;
  }
  postConstruct() {
    this.initialiseTabGuard({});
  }
  init(params) {
    this.params = params;
    this.validateParams();
    return this.updateGroups().then(() => {
      this.addManagedEventListeners({ columnRowGroupChanged: () => this.onColumnRowGroupChanged() });
    });
  }
  validateParams() {
    const { colDef } = this.params;
    if (colDef.field) {
      (0, import_core13._warnOnce)(
        'Group Column Filter does not work with the colDef property "field". This property will be ignored.'
      );
    }
    if (colDef.filterValueGetter) {
      (0, import_core13._warnOnce)(
        'Group Column Filter does not work with the colDef property "filterValueGetter". This property will be ignored.'
      );
    }
    if (colDef.filterParams) {
      (0, import_core13._warnOnce)(
        'Group Column Filter does not work with the colDef property "filterParams". This property will be ignored.'
      );
    }
  }
  updateGroups() {
    const sourceColumns = this.updateGroupField();
    return this.getUnderlyingFilters(sourceColumns);
  }
  getSourceColumns() {
    this.groupColumn = this.params.column;
    if (this.gos.get("treeData")) {
      (0, import_core13._warnOnce)(
        "Group Column Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter."
      );
      return [];
    }
    const sourceColumns = this.funcColsService.getSourceColumnsForGroupColumn(this.groupColumn);
    if (!sourceColumns) {
      (0, import_core13._warnOnce)("Group Column Filter only works on group columns. Please use a different filter.");
      return [];
    }
    return sourceColumns;
  }
  updateGroupField() {
    (0, import_core13._clearElement)(this.eGroupField);
    if (this.eGroupFieldSelect) {
      this.destroyBean(this.eGroupFieldSelect);
    }
    const allSourceColumns = this.getSourceColumns();
    const sourceColumns = allSourceColumns.filter((sourceColumn) => sourceColumn.isFilterAllowed());
    if (!sourceColumns.length) {
      this.selectedColumn = void 0;
      (0, import_core13._setDisplayed)(this.eGroupField, false);
      return null;
    }
    if (allSourceColumns.length === 1) {
      this.selectedColumn = sourceColumns[0];
      (0, import_core13._setDisplayed)(this.eGroupField, false);
    } else {
      if (!this.selectedColumn || !sourceColumns.some((column) => column.getId() === this.selectedColumn.getId())) {
        this.selectedColumn = sourceColumns[0];
      }
      this.createGroupFieldSelectElement(sourceColumns);
      this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
      this.eGroupField.appendChild((0, import_core13._loadTemplate)(
        /* html */
        `<div class="ag-filter-separator"></div>`
      ));
      (0, import_core13._setDisplayed)(this.eGroupField, true);
    }
    return sourceColumns;
  }
  createGroupFieldSelectElement(sourceColumns) {
    this.eGroupFieldSelect = this.createManagedBean(new import_core13.AgSelect());
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    this.eGroupFieldSelect.setLabel(localeTextFunc("groupFilterSelect", "Select field:"));
    this.eGroupFieldSelect.setLabelAlignment("top");
    this.eGroupFieldSelect.addOptions(
      sourceColumns.map((sourceColumn) => ({
        value: sourceColumn.getId(),
        text: this.columnNameService.getDisplayNameForColumn(sourceColumn, "groupFilter", false) ?? void 0
      }))
    );
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
      return import_core13.AgPromise.resolve();
    }
    const filterPromises = [];
    const filterColumnPairs = [];
    sourceColumns.forEach((column) => {
      const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column);
      if (filterWrapper?.filterPromise) {
        filterPromises.push(
          filterWrapper.filterPromise.then((filter) => {
            if (filter) {
              filterColumnPairs.push({
                filter,
                column
              });
            }
            if (column.getId() === this.selectedColumn.getId()) {
              this.selectedFilter = filter ?? void 0;
            }
            return filter;
          })
        );
      }
    });
    return import_core13.AgPromise.all(filterPromises).then(() => {
      this.filterColumnPairs = filterColumnPairs;
      this.groupColumn.setFilterActive(this.isFilterActive(), "columnRowGroupChanged");
    });
  }
  addUnderlyingFilterElement() {
    (0, import_core13._clearElement)(this.eUnderlyingFilter);
    if (!this.selectedColumn) {
      return import_core13.AgPromise.resolve();
    }
    const comp = this.createManagedBean(new import_core13.FilterWrapperComp(this.selectedColumn, "COLUMN_MENU"));
    this.filterWrapperComp = comp;
    if (!comp.hasFilter()) {
      return import_core13.AgPromise.resolve();
    }
    this.eUnderlyingFilter.appendChild(comp.getGui());
    return comp.getFilter()?.then(() => {
      comp.afterGuiAttached?.(this.afterGuiAttachedParams);
      if (!this.afterGuiAttachedParams?.suppressFocus && this.eGroupFieldSelect && !this.eGroupFieldSelect.isDisabled()) {
        this.eGroupFieldSelect.getFocusableElement().focus();
      }
    }) ?? import_core13.AgPromise.resolve();
  }
  updateSelectedColumn(columnId) {
    if (!columnId) {
      return;
    }
    this.filterWrapperComp?.afterGuiDetached();
    this.destroyBean(this.filterWrapperComp);
    const selectedFilterColumnPair = this.getFilterColumnPair(columnId);
    this.selectedColumn = selectedFilterColumnPair?.column;
    this.selectedFilter = selectedFilterColumnPair?.filter;
    this.dispatchLocalEvent({
      type: "selectedColumnChanged"
    });
    this.addUnderlyingFilterElement();
  }
  isFilterActive() {
    return !!this.filterColumnPairs?.some(({ filter }) => filter.isFilterActive());
  }
  doesFilterPass() {
    return true;
  }
  getModel() {
    return null;
  }
  setModel() {
    return import_core13.AgPromise.resolve();
  }
  afterGuiAttached(params) {
    this.afterGuiAttachedParams = params;
    this.addUnderlyingFilterElement();
  }
  afterGuiDetached() {
    (0, import_core13._clearElement)(this.eUnderlyingFilter);
    this.selectedFilter?.afterGuiDetached?.();
  }
  onColumnRowGroupChanged() {
    this.updateGroups().then(() => {
      this.dispatchLocalEvent({
        type: "columnRowGroupChanged"
      });
    });
  }
  getFilterColumnPair(columnId) {
    if (!columnId) {
      return void 0;
    }
    return this.filterColumnPairs?.find(({ column }) => column.getId() === columnId);
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

// enterprise-modules/row-grouping/src/rowGrouping/groupFilter/groupFloatingFilter.ts
var import_core14 = require("@ag-grid-community/core");
var GroupFloatingFilterComp = class extends import_core14.Component {
  constructor() {
    super(
      /* html */
      `
            <div data-ref="eFloatingFilter" class="ag-group-floating-filter ag-floating-filter-input" role="presentation"></div>
        `
    );
    this.eFloatingFilter = import_core14.RefPlaceholder;
    this.haveAddedColumnListeners = false;
  }
  wireBeans(beans) {
    this.columnNameService = beans.columnNameService;
    this.filterManager = beans.filterManager;
  }
  init(params) {
    this.params = params;
    const canShowUnderlyingFloatingFilter = this.gos.get("groupDisplayType") === "multipleColumns";
    return new import_core14.AgPromise((resolve) => {
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
      this.addManagedListeners(this.parentFilterInstance, {
        selectedColumnChanged: this.onSelectedColumnChanged.bind(this),
        columnRowGroupChanged: this.onColumnRowGroupChanged.bind(this)
      });
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
    const displayName = this.columnNameService.getDisplayNameForColumn(
      this.params.column,
      "header",
      true
    );
    const translate = this.localeService.getLocaleTextFunc();
    this.eFloatingFilterText?.setInputAriaLabel(`${displayName} ${translate("ariaFilterInput", "Filter Input")}`);
  }
  setupReadOnlyFloatingFilterElement() {
    if (!this.eFloatingFilterText) {
      this.eFloatingFilterText = this.createManagedBean(new import_core14.AgInputTextField());
      this.eFloatingFilterText.setDisabled(true).addGuiEventListener("click", () => this.params.showParentFilter());
      this.setParams();
    }
    this.updateDisplayedValue();
    this.eFloatingFilter.appendChild(this.eFloatingFilterText.getGui());
  }
  setupUnderlyingFloatingFilterElement() {
    this.showingUnderlyingFloatingFilter = false;
    this.underlyingFloatingFilter = void 0;
    (0, import_core14._clearElement)(this.eFloatingFilter);
    const column = this.parentFilterInstance.getSelectedColumn();
    if (column && !column.isVisible()) {
      const compDetails = this.filterManager.getFloatingFilterCompDetails(column, this.params.showParentFilter);
      if (compDetails) {
        if (!this.haveAddedColumnListeners) {
          this.haveAddedColumnListeners = true;
          this.addManagedListeners(column, {
            visibleChanged: this.onColumnVisibleChanged.bind(this),
            colDefChanged: this.onColDefChanged.bind(this)
          });
        }
        return compDetails.newAgStackInstance().then((floatingFilter) => {
          this.underlyingFloatingFilter = floatingFilter;
          this.underlyingFloatingFilter?.onParentModelChanged(
            this.parentFilterInstance.getSelectedFilter()?.getModel()
          );
          this.appendChild(floatingFilter.getGui());
          this.showingUnderlyingFloatingFilter = true;
        });
      }
    }
    this.setupReadOnlyFloatingFilterElement();
    return import_core14.AgPromise.resolve();
  }
  onColumnVisibleChanged() {
    this.setupUnderlyingFloatingFilterElement();
  }
  onColDefChanged(event) {
    if (!event.column) {
      return;
    }
    const compDetails = this.filterManager.getFloatingFilterCompDetails(
      event.column,
      this.params.showParentFilter
    );
    if (compDetails) {
      if (this.underlyingFloatingFilter?.refresh) {
        this.underlyingFloatingFilter.refresh(compDetails.params);
      } else {
        this.underlyingFloatingFilter?.onParamsUpdated?.(compDetails.params);
      }
    }
  }
  onParentModelChanged(_model, event) {
    if (this.showingUnderlyingFloatingFilter) {
      this.underlyingFloatingFilter?.onParentModelChanged(
        this.parentFilterInstance.getSelectedFilter()?.getModel(),
        event
      );
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

// enterprise-modules/row-grouping/src/rowGrouping/groupStage.ts
var import_core15 = require("@ag-grid-community/core");

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
      parent.allLeafChildren = parent.allLeafChildren?.filter((child) => !nodeDetails.removeFromAllLeafChildren[child.id]) ?? null;
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
var GroupStage = class extends import_core15.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "groupStage";
    /** Hierarchical node cache to speed up tree data node insertion */
    this.treeNodeCache = new TreeDataNodeCache();
  }
  wireBeans(beans) {
    this.beans = beans;
    this.columnModel = beans.columnModel;
    this.funcColsService = beans.funcColsService;
    this.selectableService = beans.selectableService;
    this.valueService = beans.valueService;
    this.selectionService = beans.selectionService;
    this.showRowGroupColsService = beans.showRowGroupColsService;
  }
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
          if (!row.childrenAfterGroup?.length) {
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
    const { rowNode, changedPath, rowNodeTransactions, rowNodeOrder } = params;
    const usingTreeData = this.gos.get("treeData");
    const groupedCols = usingTreeData ? null : this.funcColsService.getRowGroupColumns();
    const details = {
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
      keyCreators: groupedCols?.map((column) => column.getColDef().keyCreator) ?? []
    };
    return details;
  }
  handleTransaction(details) {
    details.transactions.forEach((tran) => {
      const batchRemover = !details.usingTreeData ? new BatchRemover() : void 0;
      if ((0, import_core15._existsAndNotEmpty)(tran.remove)) {
        this.removeNodes(tran.remove, details, batchRemover);
      }
      if ((0, import_core15._existsAndNotEmpty)(tran.update)) {
        this.moveNodesInWrongPath(tran.update, details, batchRemover);
      }
      if ((0, import_core15._existsAndNotEmpty)(tran.add)) {
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
    details.changedPath.forEachChangedNodeDepthFirst(
      (node) => {
        const didSort = (0, import_core15._sortRowNodesByOrder)(node.childrenAfterGroup, details.rowNodeOrder);
        if (didSort) {
          details.changedPath.addParentNode(node);
        }
      },
      false,
      true
    );
  }
  orderGroups(details) {
    const comparator = details.initialGroupOrderComparator;
    if ((0, import_core15._exists)(comparator)) {
      recursiveSort(details.rootNode);
    }
    function recursiveSort(rowNode) {
      const doSort = (0, import_core15._exists)(rowNode.childrenAfterGroup) && // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
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
  /**
   * Topological sort of the given row nodes based on the grouping hierarchy, where parents come before children.
   * Used to ensure tree data is moved in the correct order (see AG-11678)
   */
  topoSort(rowNodes, details) {
    const sortedNodes = [];
    const idLookup = Object.fromEntries(rowNodes.map((node, i2) => [node.id, i2]));
    const stillToFind = new Set(Object.keys(idLookup));
    const queue = [details.rootNode];
    let i = 0;
    while (i < queue.length) {
      const node = queue[i];
      i++;
      if (node === void 0) {
        continue;
      }
      if (node.id && node.id in idLookup) {
        sortedNodes.push(rowNodes[idLookup[node.id]]);
        stillToFind.delete(node.id);
      }
      if (stillToFind.size === 0) {
        return sortedNodes;
      }
      const children = node.childrenAfterGroup ?? [];
      for (let i2 = 0; i2 < children.length; i2++) {
        queue.push(children[i2]);
      }
    }
    return sortedNodes;
  }
  moveNodesInWrongPath(childNodes, details, batchRemover) {
    const sorted = details.usingTreeData ? this.topoSort(childNodes, details) : childNodes;
    sorted.forEach((childNode) => {
      if (details.changedPath.isActive()) {
        details.changedPath.addParentNode(childNode.parent);
      }
      const infoToKeyMapper = (item) => item.key;
      const oldPath = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
      const newPath = this.getGroupInfo(childNode, details).map(infoToKeyMapper);
      const nodeInCorrectPath = (0, import_core15._areEqual)(oldPath, newPath);
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
  removeEmptyGroups(possibleEmptyGroups, details) {
    let checkAgain = true;
    const groupShouldBeRemoved = (rowNode) => {
      const mapKey = this.getChildrenMappedKey(rowNode.key, rowNode.rowGroupColumn);
      const parentRowNode = rowNode.parent;
      const groupAlreadyRemoved = parentRowNode?.childrenMapped ? !parentRowNode.childrenMapped[mapKey] : true;
      if (groupAlreadyRemoved) {
        return false;
      }
      return rowNode.isEmptyRowGroupNode();
    };
    while (checkAgain) {
      checkAgain = false;
      const batchRemover = new BatchRemover();
      possibleEmptyGroups.forEach((possibleEmptyGroup) => {
        this.forEachParentGroup(details, possibleEmptyGroup, (rowNode) => {
          const shouldBeRemoved = groupShouldBeRemoved(rowNode);
          if (shouldBeRemoved && details.usingTreeData && details.getDataPath?.(rowNode.data)) {
            rowNode.setGroup(
              (rowNode.childrenAfterGroup && rowNode.childrenAfterGroup.length > 0) ?? false
            );
          } else if (shouldBeRemoved) {
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
        (0, import_core15._removeFromArray)(child.parent.childrenAfterGroup, child);
        child.parent.updateHasChildren();
      }
    }
    const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
    if (child.parent?.childrenMapped != void 0) {
      delete child.parent.childrenMapped[mapKey];
    }
    child.setRowTop(null);
    child.setRowIndex(null);
  }
  /**
   * This is idempotent, but relies on the `key` field being the same throughout a RowNode's lifetime
   */
  addToParent(child, parent) {
    const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
    if (parent?.childrenMapped != null) {
      if (parent?.childrenMapped?.[mapKey] !== child) {
        parent.childrenMapped[mapKey] = child;
        parent.childrenAfterGroup.push(child);
        parent.setGroup(true);
      }
    }
  }
  areGroupColsEqual(d1, d2) {
    if (d1 == null || d2 == null || d1.pivotMode !== d2.pivotMode) {
      return false;
    }
    return (0, import_core15._areEqual)(d1.groupedCols, d2.groupedCols) && (0, import_core15._areEqual)(d1.keyCreators, d2.keyCreators);
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
          leafNode: rowNode.allLeafChildren?.[0]
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
    const groupDisplayColumns = this.showRowGroupColsService.getShowRowGroupCols();
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
    if (details.usingTreeData) {
      this.buildNodeCacheFromRows(newRowNodes, details);
    } else {
      this.treeNodeCache.clear();
    }
    newRowNodes.forEach((rowNode) => {
      this.insertOneNode(rowNode, details, isMove);
      if (details.changedPath.isActive()) {
        details.changedPath.addParentNode(rowNode.parent);
      }
    });
  }
  insertOneNode(childNode, details, isMove, batchRemover) {
    const path = this.getGroupInfo(childNode, details);
    const level = details.usingTreeData ? path.length - 1 : void 0;
    const parentGroup = this.findParentForNode(childNode, path, details, batchRemover, level);
    if (details.usingTreeData) {
      const info = (0, import_core15._last)(path);
      childNode.parent = parentGroup;
      childNode.level = path.length;
      this.ensureRowNodeFields(childNode, this.getChildrenMappedKey(info.key, info.rowGroupColumn));
      this.setGroupData(childNode, info, details);
      if (!isMove) {
        this.setExpandedInitialValue(details, childNode);
      }
      this.addToParent(childNode, parentGroup);
    } else {
      if (!parentGroup.group) {
        (0, import_core15._warnOnce)(`duplicate group keys for row data, keys should be unique`, [
          parentGroup.data,
          childNode.data
        ]);
      }
      childNode.parent = parentGroup;
      childNode.level = path.length;
      parentGroup.childrenAfterGroup.push(childNode);
      parentGroup.updateHasChildren();
    }
  }
  findParentForNode(childNode, path, details, batchRemover, stopLevel) {
    let nextNode = details.rootNode;
    path.forEach((groupInfo, level) => {
      if (stopLevel !== void 0 && level >= stopLevel) {
        return;
      }
      nextNode = this.getOrCreateNextNode(nextNode, path, groupInfo, level, details);
      if (!batchRemover?.isRemoveFromAllLeafChildren(nextNode, childNode)) {
        nextNode.allLeafChildren.push(childNode);
      } else {
        batchRemover?.preventRemoveFromAllLeafChildren(nextNode, childNode);
      }
    });
    return nextNode;
  }
  getOrCreateNextNode(parentGroup, path, groupInfo, level, details) {
    const key = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
    let nextNode = parentGroup?.childrenMapped?.[key];
    if (!nextNode) {
      if (details.usingTreeData && this.treeNodeCache.has(path, level, key)) {
        nextNode = this.treeNodeCache.get(path, level, key);
        nextNode.parent = parentGroup;
      } else {
        nextNode = this.createGroup(groupInfo, parentGroup, level, details);
      }
      this.addToParent(nextNode, parentGroup);
    }
    return nextNode;
  }
  /**
   * Directly re-initialises the `TreeDataNodeCache`
   */
  buildNodeCacheFromRows(rowNodes, details) {
    let width = 0;
    const paths = rowNodes.map((node) => {
      const info = this.getGroupInfo(node, details);
      width = Math.max(width, info.length);
      return info;
    });
    this.treeNodeCache.clear();
    for (let level = 0; level < width; level++) {
      for (const [rowIdx, path] of paths.entries()) {
        const isDefined = path[level] !== void 0;
        const isLeaf = path[level + 1] === void 0;
        if (!isDefined) {
          continue;
        }
        const info = path[level];
        const currentValue = this.treeNodeCache.get(path, level, info.key);
        if (currentValue != null) {
          continue;
        }
        this.treeNodeCache.set(
          path,
          level,
          info.key,
          isLeaf ? this.ensureRowNodeFields(rowNodes[rowIdx], info.key) : null
        );
      }
    }
    this.backfillGroups(this.treeNodeCache.inner(), details.rootNode, 0, details);
  }
  ensureRowNodeFields(rowNode, key) {
    if (key !== void 0) {
      rowNode.key = key;
    }
    rowNode.childrenMapped ?? (rowNode.childrenMapped = {});
    rowNode.allLeafChildren ?? (rowNode.allLeafChildren = []);
    rowNode.childrenAfterGroup ?? (rowNode.childrenAfterGroup = []);
    return rowNode;
  }
  /** Walks the TreeDataNodeCache recursively and backfills `null` entries with filler group nodes */
  backfillGroups(cache, parent, level, details) {
    for (const [key, value] of Object.entries(cache)) {
      if (value.node === null) {
        value.node = this.createGroup({ key, rowGroupColumn: null, field: null }, parent, level, details);
      }
      this.backfillGroups(value.subtree, value.node, level + 1, details);
    }
  }
  createGroup(groupInfo, parent, level, details) {
    const groupNode = new import_core15.RowNode(this.beans);
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
    groupNode.parent = parent;
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
    return import_core15.RowNode.ID_PREFIX_ROW_GROUP + createGroupId(node, parent, level);
  }
  setGroupData(groupNode, groupInfo, details) {
    groupNode.groupData = {};
    const groupDisplayCols = this.showRowGroupColsService.getShowRowGroupCols();
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
    if (details.expandByDefault === -1) {
      groupNode.expanded = true;
      return;
    }
    groupNode.expanded = groupNode.level < details.expandByDefault;
  }
  getGroupInfo(rowNode, details) {
    if (details.usingTreeData) {
      return this.getGroupInfoFromCallback(rowNode, details);
    }
    return this.getGroupInfoFromGroupColumns(rowNode, details);
  }
  getGroupInfoFromCallback(rowNode, details) {
    const keys = details.getDataPath?.(rowNode.data);
    if (keys === void 0 || keys.length === 0) {
      (0, import_core15._warnOnce)(`getDataPath() should not return an empty path for data ${rowNode.data}`);
    }
    return keys?.map((key) => ({ key, field: null, rowGroupColumn: null })) ?? [];
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
var TreeDataNodeCache = class {
  constructor() {
    this.cache = {};
  }
  traverse(path, level) {
    let cache = this.cache;
    let i = 0;
    while (i <= level) {
      const key = path[i].key;
      if (!(key in cache)) {
        cache[key] = { node: null, subtree: {} };
      }
      cache = cache[key].subtree;
      i++;
    }
    return cache;
  }
  set(path, level, key, value) {
    const cache = this.traverse(path, level - 1);
    cache[key] = { node: value, subtree: {} };
  }
  has(path, level, key) {
    const cache = this.traverse(path, level - 1);
    return key in cache;
  }
  get(path, level, key) {
    const cache = this.traverse(path, level - 1);
    return cache[key]?.node;
  }
  clear() {
    this.cache = {};
  }
  inner() {
    return this.cache;
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/pivotColDefService.ts
var import_core16 = require("@ag-grid-community/core");
var PIVOT_ROW_TOTAL_PREFIX = "PivotRowTotal_";
var PivotColDefService = class extends import_core16.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "pivotColDefService";
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.funcColsService = beans.funcColsService;
    this.columnNameService = beans.columnNameService;
  }
  postConstruct() {
    const getFieldSeparator = () => this.gos.get("serverSidePivotResultFieldSeparator") ?? "_";
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
    const pivotColumnDefsClone = pivotColumnDefs.map((colDef) => (0, import_core16._cloneObject)(colDef));
    return {
      pivotColumnGroupDefs,
      pivotColumnDefs: pivotColumnDefsClone
    };
  }
  createPivotColumnsFromUniqueValues(uniqueValues) {
    const pivotColumns = this.funcColsService.getPivotColumns();
    const maxDepth = pivotColumns.length;
    const pivotColumnGroupDefs = this.recursivelyBuildGroup(
      0,
      uniqueValues,
      [],
      maxDepth,
      pivotColumns
    );
    return pivotColumnGroupDefs;
  }
  recursivelyBuildGroup(index, uniqueValue, pivotKeys, maxDepth, primaryPivotColumns) {
    const measureColumns = this.funcColsService.getValueColumns();
    if (index >= maxDepth) {
      return this.buildMeasureCols(pivotKeys);
    }
    const primaryPivotColumnDefs = primaryPivotColumns[index].getColDef();
    const comparator = this.headerNameComparator.bind(this, primaryPivotColumnDefs.pivotComparator);
    if (measureColumns.length === 1 && this.gos.get("removePivotHeaderRowWhenSingleValueColumn") && index === maxDepth - 1) {
      const leafCols = [];
      (0, import_core16._iterateObject)(uniqueValue, (key) => {
        const newPivotKeys = [...pivotKeys, key];
        const colDef = this.createColDef(measureColumns[0], key, newPivotKeys);
        colDef.columnGroupShow = "open";
        leafCols.push(colDef);
      });
      leafCols.sort(comparator);
      return leafCols;
    }
    const groups = [];
    (0, import_core16._iterateObject)(uniqueValue, (key, value) => {
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
    const measureColumns = this.funcColsService.getValueColumns();
    if (measureColumns.length === 0) {
      return [this.createColDef(null, "-", pivotKeys)];
    }
    return measureColumns.map((measureCol) => {
      const columnName = this.columnNameService.getDisplayNameForColumn(measureCol, "header");
      return {
        ...this.createColDef(measureCol, columnName, pivotKeys),
        columnGroupShow: "open"
      };
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
        this.funcColsService.getValueColumns().forEach((valueColumn) => {
          const columnName = this.columnNameService.getDisplayNameForColumn(
            valueColumn,
            "header"
          );
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
    const valueCols = this.funcColsService.getValueColumns();
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
    const valueColumns = this.funcColsService.getValueColumns();
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
    const measureColumns = this.funcColsService.getValueColumns();
    let colDef;
    if (measureColumns.length === 0) {
      colDef = this.createColDef(null, "-", []);
    } else {
      const columnName = this.columnNameService.getDisplayNameForColumn(valueColumn, "header");
      colDef = this.createColDef(valueColumn, columnName, []);
      colDef.pivotTotalColumnIds = colIds;
    }
    colDef.colId = PIVOT_ROW_TOTAL_PREFIX + colDef.colId;
    pivotColumnDefs.push(colDef);
    const valueGroup = addGroup ? {
      children: [colDef],
      pivotKeys: [],
      groupId: `${PIVOT_ROW_TOTAL_PREFIX}_pivotGroup_${valueColumn.getColId()}`
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
    colDef.colId = this.generateColumnId(
      pivotKeys || [],
      valueColumn && !totalColumn ? valueColumn.getColId() : ""
    );
    colDef.field = colDef.colId;
    colDef.valueGetter = (params) => params.data?.[params.colDef.field];
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
    m2.forEach((value, key) => {
      const existingList = m1.has(key) ? m1.get(key) : [];
      const updatedList = [...existingList, ...value];
      m1.set(key, updatedList);
    });
  }
  generateColumnGroupId(pivotKeys) {
    const pivotCols = this.funcColsService.getPivotColumns().map((col) => col.getColId());
    return `pivotGroup_${pivotCols.join("-")}_${pivotKeys.join("-")}`;
  }
  generateColumnId(pivotKeys, measureColumnId) {
    const pivotCols = this.funcColsService.getPivotColumns().map((col) => col.getColId());
    return `pivot_${pivotCols.join("-")}_${pivotKeys.join("-")}_${measureColumnId}`;
  }
  /**
   * Used by the SSRM to create secondary columns from provided fields
   * @param fields
   */
  createColDefsFromFields(fields) {
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
      const children = [];
      for (const key2 in uniqueValues2) {
        const item = uniqueValues2[key2];
        const child = uniqueValuesToGroups(`${id}${this.fieldSeparator}${key2}`, key2, item, depth + 1);
        children.push(child);
      }
      if (children.length === 0) {
        const potentialAggCol = this.columnModel.getColDefCol(key);
        if (potentialAggCol) {
          const headerName = this.columnNameService.getDisplayNameForColumn(potentialAggCol, "header") ?? key;
          const colDef = this.createColDef(potentialAggCol, headerName, void 0, false);
          colDef.colId = id;
          colDef.aggFunc = potentialAggCol.getAggFunc();
          colDef.valueGetter = (params) => params.data?.[id];
          return colDef;
        }
        const col = {
          colId: id,
          headerName: key,
          // this is to support using pinned rows, normally the data will be extracted from the aggData object using the colId
          // however pinned rows still access the data object by field, this prevents values with dots from being treated as complex objects
          valueGetter: (params) => params.data?.[id]
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
    for (const key in uniqueValues) {
      const item = uniqueValues[key];
      const col = uniqueValuesToGroups(key, key, item, 0);
      res.push(col);
    }
    return res;
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/pivotStage.ts
var import_core17 = require("@ag-grid-community/core");
var EXCEEDED_MAX_UNIQUE_VALUES = "Exceeded maximum allowed pivot column count.";
var PivotStage = class extends import_core17.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "pivotStage";
    this.uniqueValues = {};
    this.lastTimeFailed = false;
    this.maxUniqueValues = -1;
    this.currentUniqueCount = 0;
  }
  wireBeans(beans) {
    this.valueService = beans.valueService;
    this.columnModel = beans.columnModel;
    this.pivotResultColsService = beans.pivotResultColsService;
    this.funcColsService = beans.funcColsService;
    this.pivotColDefService = beans.pivotColDefService;
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
    if (this.pivotResultColsService.isPivotResultColsPresent()) {
      this.pivotResultColsService.setPivotResultCols(null, "rowModelUpdated");
      if (changedPath) {
        changedPath.setInactive();
      }
    }
  }
  executePivotOn(changedPath) {
    const numberOfAggregationColumns = this.funcColsService.getValueColumns().length ?? 1;
    const configuredMaxCols = this.gos.get("pivotMaxGeneratedColumns");
    this.maxUniqueValues = configuredMaxCols === -1 ? -1 : configuredMaxCols / numberOfAggregationColumns;
    let uniqueValues;
    try {
      uniqueValues = this.bucketUpRowNodes(changedPath);
    } catch (e) {
      if (e.message === EXCEEDED_MAX_UNIQUE_VALUES) {
        this.pivotResultColsService.setPivotResultCols([], "rowModelUpdated");
        const event = {
          type: "pivotMaxColumnsExceeded",
          message: e.message
        };
        this.eventService.dispatchEvent(event);
        this.lastTimeFailed = true;
        return;
      }
      throw e;
    }
    const uniqueValuesChanged = this.setUniqueValues(uniqueValues);
    const aggregationColumns = this.funcColsService.getValueColumns();
    const aggregationColumnsHash = aggregationColumns.map((column) => `${column.getId()}-${column.getColDef().headerName}`).join("#");
    const aggregationFuncsHash = aggregationColumns.map((column) => column.getAggFunc().toString()).join("#");
    const aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
    const aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
    this.aggregationColumnsHashLastTime = aggregationColumnsHash;
    this.aggregationFuncsHashLastTime = aggregationFuncsHash;
    const groupColumnsHash = this.funcColsService.getRowGroupColumns().map((column) => column.getId()).join("#");
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
      const { pivotColumnGroupDefs, pivotColumnDefs } = this.pivotColDefService.createPivotColumnDefs(
        this.uniqueValues
      );
      this.pivotColumnDefs = pivotColumnDefs;
      this.pivotResultColsService.setPivotResultCols(pivotColumnGroupDefs, "rowModelUpdated");
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
      if (node.leafGroup) {
        this.bucketRowNode(node, uniqueValues);
      } else {
        node.childrenAfterFilter?.forEach(recursivelyBucketFilteredChildren);
      }
    };
    changedPath.executeFromRootNode(recursivelyBucketFilteredChildren);
    return uniqueValues;
  }
  bucketRowNode(rowNode, uniqueValues) {
    const pivotColumns = this.funcColsService.getPivotColumns();
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
      if ((0, import_core17._missing)(key)) {
        key = "";
      }
      if (!uniqueValues[key]) {
        this.currentUniqueCount += 1;
        uniqueValues[key] = {};
        const doesGeneratedColMaxExist = this.maxUniqueValues !== -1;
        const hasExceededColMax = this.currentUniqueCount > this.maxUniqueValues;
        if (doesGeneratedColMaxExist && hasExceededColMax) {
          throw Error(EXCEEDED_MAX_UNIQUE_VALUES);
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
      (0, import_core17._iterateObject)(mappedChildren, (key, value) => {
        result[key] = this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
      });
      return result;
    }
  }
  getPivotColumnDefs() {
    return this.pivotColumnDefs;
  }
};

// enterprise-modules/row-grouping/src/rowGrouping/rowGroupingApi.ts
function addAggFunc(beans, key, aggFunc) {
  if (beans.aggFuncService) {
    beans.aggFuncService.addAggFuncs({ key: aggFunc });
  }
}
function addAggFuncs(beans, aggFuncs) {
  if (beans.aggFuncService) {
    beans.aggFuncService.addAggFuncs(aggFuncs);
  }
}
function clearAggFuncs(beans) {
  if (beans.aggFuncService) {
    beans.aggFuncService.clear();
  }
}
function setColumnAggFunc(beans, key, aggFunc) {
  beans.funcColsService.setColumnAggFunc(key, aggFunc, "api");
}
function isPivotMode(beans) {
  return beans.columnModel.isPivotMode();
}
function getPivotResultColumn(beans, pivotKeys, valueColKey) {
  return beans.pivotResultColsService.lookupPivotResultCol(pivotKeys, valueColKey);
}
function setValueColumns(beans, colKeys) {
  beans.funcColsService.setValueColumns(colKeys, "api");
}
function getValueColumns(beans) {
  return beans.funcColsService.getValueColumns();
}
function removeValueColumn(beans, colKey) {
  beans.funcColsService.removeValueColumns([colKey], "api");
}
function removeValueColumns(beans, colKeys) {
  beans.funcColsService.removeValueColumns(colKeys, "api");
}
function addValueColumn(beans, colKey) {
  beans.funcColsService.addValueColumns([colKey], "api");
}
function addValueColumns(beans, colKeys) {
  beans.funcColsService.addValueColumns(colKeys, "api");
}
function setRowGroupColumns(beans, colKeys) {
  beans.funcColsService.setRowGroupColumns(colKeys, "api");
}
function removeRowGroupColumn(beans, colKey) {
  beans.funcColsService.removeRowGroupColumns([colKey], "api");
}
function removeRowGroupColumns(beans, colKeys) {
  beans.funcColsService.removeRowGroupColumns(colKeys, "api");
}
function addRowGroupColumn(beans, colKey) {
  beans.funcColsService.addRowGroupColumns([colKey], "api");
}
function addRowGroupColumns(beans, colKeys) {
  beans.funcColsService.addRowGroupColumns(colKeys, "api");
}
function moveRowGroupColumn(beans, fromIndex, toIndex) {
  beans.funcColsService.moveRowGroupColumn(fromIndex, toIndex, "api");
}
function getRowGroupColumns(beans) {
  return beans.funcColsService.getRowGroupColumns();
}
function setPivotColumns(beans, colKeys) {
  beans.funcColsService.setPivotColumns(colKeys, "api");
}
function removePivotColumn(beans, colKey) {
  beans.funcColsService.removePivotColumns([colKey], "api");
}
function removePivotColumns(beans, colKeys) {
  beans.funcColsService.removePivotColumns(colKeys, "api");
}
function addPivotColumn(beans, colKey) {
  beans.funcColsService.addPivotColumns([colKey], "api");
}
function addPivotColumns(beans, colKeys) {
  beans.funcColsService.addPivotColumns(colKeys, "api");
}
function getPivotColumns(beans) {
  return beans.funcColsService.getPivotColumns();
}
function setPivotResultColumns(beans, colDefs) {
  beans.pivotResultColsService.setPivotResultCols(colDefs, "api");
}
function getPivotResultColumns(beans) {
  const pivotResultCols = beans.pivotResultColsService.getPivotResultCols();
  return pivotResultCols ? pivotResultCols.list : null;
}

// enterprise-modules/row-grouping/src/rowGrouping/showRowGroupColsService.ts
var import_core18 = require("@ag-grid-community/core");
var ShowRowGroupColsService = class extends import_core18.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "showRowGroupColsService";
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.funcColsService = beans.funcColsService;
  }
  refresh() {
    this.showRowGroupCols = [];
    this.showRowGroupColsMap = {};
    this.columnModel.getCols().forEach((col) => {
      const colDef = col.getColDef();
      const showRowGroup = colDef.showRowGroup;
      const isString = typeof showRowGroup === "string";
      const isTrue = showRowGroup === true;
      if (!isString && !isTrue) {
        return;
      }
      this.showRowGroupCols.push(col);
      if (isString) {
        this.showRowGroupColsMap[showRowGroup] = col;
      } else {
        const rowGroupCols = this.funcColsService.getRowGroupColumns();
        rowGroupCols.forEach((rowGroupCol) => {
          this.showRowGroupColsMap[rowGroupCol.getId()] = col;
        });
      }
    });
  }
  getShowRowGroupCols() {
    return this.showRowGroupCols;
  }
  getShowRowGroupCol(id) {
    return this.showRowGroupColsMap[id];
  }
};

// enterprise-modules/row-grouping/src/version.ts
var VERSION = "32.0.0";

// enterprise-modules/row-grouping/src/rowGroupingModule.ts
var RowGroupingCoreModule = {
  version: VERSION,
  moduleName: `${import_core19.ModuleNames.RowGroupingModule}-core`,
  beans: [
    AggregationStage,
    FilterAggregatesStage,
    GroupStage,
    PivotColDefService,
    PivotStage,
    AggFuncService,
    AutoColService,
    ShowRowGroupColsService,
    ColumnDropZoneService
  ],
  userComponents: [
    {
      name: "agGroupRowRenderer",
      classImp: import_core20.GroupCellRenderer
    },
    {
      name: "agGroupCellRenderer",
      classImp: import_core20.GroupCellRenderer
    }
  ],
  controllers: [{ name: "groupCellRendererCtrl", classImp: import_core20.GroupCellRendererCtrl }],
  dependantModules: [import_core20.EnterpriseCoreModule]
};
var RowGroupingApiModule = {
  version: VERSION,
  moduleName: `${import_core19.ModuleNames.RowGroupingModule}-api`,
  apiFunctions: {
    addAggFunc,
    addAggFuncs,
    clearAggFuncs,
    setColumnAggFunc,
    isPivotMode,
    getPivotResultColumn,
    setValueColumns,
    getValueColumns,
    removeValueColumn,
    removeValueColumns,
    addValueColumn,
    addValueColumns,
    setRowGroupColumns,
    removeRowGroupColumn,
    removeRowGroupColumns,
    addRowGroupColumn,
    addRowGroupColumns,
    getRowGroupColumns,
    moveRowGroupColumn,
    setPivotColumns,
    removePivotColumn,
    removePivotColumns,
    addPivotColumn,
    addPivotColumns,
    getPivotColumns,
    setPivotResultColumns,
    getPivotResultColumns
  },
  dependantModules: [RowGroupingCoreModule]
};
var GroupFilterModule = {
  version: VERSION,
  moduleName: "@ag-grid-enterprise/group-filter",
  userComponents: [{ name: "agGroupColumnFilter", classImp: GroupFilter }],
  dependantModules: [RowGroupingCoreModule, import_core19._ColumnFilterModule]
};
var GroupFloatingFilterModule = {
  version: VERSION,
  moduleName: "@ag-grid-enterprise/group-floating-filter",
  userComponents: [{ name: "agGroupColumnFloatingFilter", classImp: GroupFloatingFilterComp }],
  dependantModules: [GroupFilterModule, import_core19._FloatingFilterModule]
};
var RowGroupingModule = {
  version: VERSION,
  moduleName: import_core19.ModuleNames.RowGroupingModule,
  dependantModules: [RowGroupingCoreModule, RowGroupingApiModule, GroupFilterModule, GroupFloatingFilterModule]
};

// enterprise-modules/row-grouping/src/rowGrouping/columnDropZones/valueDropZonePanel.ts
var import_core21 = require("@ag-grid-community/core");
var ValuesDropZonePanel = class extends BaseDropZonePanel {
  constructor(horizontal) {
    super(horizontal, "aggregation");
  }
  postConstruct() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const emptyMessage = localeTextFunc("valueColumnsEmptyMessage", "Drag here to aggregate");
    const title = localeTextFunc("values", "Values");
    super.init({
      icon: (0, import_core21._createIconNoSpan)("valuePanel", this.gos, null),
      emptyMessage,
      title
    });
    this.addManagedEventListeners({ columnValueChanged: this.refreshGui.bind(this) });
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
    return this.isPotentialDndItems() ? "aggregate" : "notAllowed";
  }
  isItemDroppable(column, draggingEvent) {
    if (this.gos.get("functionsReadOnly") || !column.isPrimary()) {
      return false;
    }
    return column.isAllowValue() && (!column.isValueActive() || this.isSourceEventFromTarget(draggingEvent));
  }
  updateItems(columns) {
    this.funcColsService.setValueColumns(columns, "toolPanelUi");
  }
  getExistingItems() {
    return this.funcColsService.getValueColumns();
  }
};
