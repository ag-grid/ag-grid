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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
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

// enterprise-modules/charts/src/main.ts
var main_exports = {};
__export(main_exports, {
  GridChartsModule: () => GridChartsModule,
  __FORCE_MODULE_DETECTION_AG_GRID_CORE_EXT: () => __FORCE_MODULE_DETECTION_AG_GRID_CORE_EXT,
  agCharts: () => agCharts
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/charts/src/gridChartsModule.ts
var import_core67 = require("@ag-grid-community/core");
var import_core68 = require("@ag-grid-enterprise/core");
var import_range_selection = require("@ag-grid-enterprise/range-selection");

// enterprise-modules/charts/src/charts/chartService.ts
var import_core57 = require("@ag-grid-community/core");
var import_ag_charts_community32 = require("ag-charts-community");

// enterprise-modules/charts/src/charts/chartComp/gridChartComp.ts
var import_core56 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/chartMenu.ts
var import_core50 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/tabbedChartMenu.ts
var import_core48 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/data/chartDataPanel.ts
var import_core15 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/chartController.ts
var import_core8 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/model/chartDataModel.ts
var import_core5 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/datasource/chartDatasource.ts
var import_core = require("@ag-grid-community/core");
var _ChartDatasource = class _ChartDatasource extends import_core.BeanStub {
  getData(params) {
    if (params.crossFiltering) {
      if (params.grouping) {
        console.warn("AG Grid: crossing filtering with row grouping is not supported.");
        return { chartData: [], columnNames: {} };
      }
      if (!this.gos.isRowModelType("clientSide")) {
        console.warn("AG Grid: crossing filtering is only supported in the client side row model.");
        return { chartData: [], columnNames: {} };
      }
    }
    const isServerSide = this.gos.isRowModelType("serverSide");
    if (isServerSide && params.pivoting) {
      this.updatePivotKeysForSSRM();
    }
    const result = this.extractRowsFromGridRowModel(params);
    result.chartData = this.aggregateRowsByDimension(params, result.chartData);
    return result;
  }
  extractRowsFromGridRowModel(params) {
    const { crossFiltering, startRow, endRow, valueCols, dimensionCols, grouping } = params;
    let extractedRowData = [];
    const columnNames = {};
    const groupNodeIndexes = {};
    const groupsToRemove = {};
    let filteredNodes = {};
    let allRowNodes = [];
    let numRows;
    if (crossFiltering) {
      filteredNodes = this.getFilteredRowNodes();
      allRowNodes = this.getAllRowNodes();
      numRows = allRowNodes.length;
    } else {
      const modelLastRow = this.gridRowModel.getRowCount() - 1;
      const hasNoRange = startRow === endRow && startRow === 0 && dimensionCols.length === 0 && valueCols.length === 0;
      if (hasNoRange) {
        numRows = 0;
      } else {
        const rangeLastRow = endRow >= 0 ? Math.min(endRow, modelLastRow) : modelLastRow;
        numRows = rangeLastRow - startRow + 1;
      }
    }
    if (numRows > 0) {
      valueCols.forEach((col) => {
        let columnNamesArr = [];
        const pivotKeys = col.getColDef().pivotKeys;
        if (pivotKeys) {
          columnNamesArr = pivotKeys.slice();
        }
        const headerName = col.getColDef().headerName;
        if (headerName) {
          columnNamesArr.push(headerName);
        }
        if (columnNamesArr.length > 0) {
          columnNames[col.getId()] = columnNamesArr;
        }
      });
    }
    let numRemovedNodes = 0;
    for (let i = 0; i < numRows; i++) {
      const rowNode = crossFiltering ? allRowNodes[i] : this.gridRowModel.getRow(i + startRow);
      if (rowNode.footer) {
        numRemovedNodes++;
        continue;
      }
      const data = {};
      dimensionCols.forEach((col) => {
        const colId = col.colId;
        const column = this.columnModel.getGridColumn(colId);
        if (column) {
          const valueObject = this.valueService.getValue(column, rowNode);
          if (grouping) {
            const valueString = valueObject && valueObject.toString ? String(valueObject.toString()) : "";
            const labels = _ChartDatasource.getGroupLabels(rowNode, valueString);
            data[colId] = {
              labels,
              toString: function() {
                return this.labels.filter((l) => !!l).reverse().join(" - ");
              }
            };
            if (rowNode.group) {
              groupNodeIndexes[labels.toString()] = i - numRemovedNodes;
            }
            const groupKey = labels.slice(1, labels.length).toString();
            if (groupKey) {
              groupsToRemove[groupKey] = groupNodeIndexes[groupKey];
            }
          } else {
            data[colId] = valueObject;
          }
        } else {
          data[ChartDataModel.DEFAULT_CATEGORY] = i + 1;
        }
      });
      valueCols.forEach((col) => {
        const colId = col.getColId();
        if (crossFiltering) {
          const filteredOutColId = colId + "-filtered-out";
          const value = this.valueService.getValue(col, rowNode);
          const actualValue = value != null && typeof value.toNumber === "function" ? value.toNumber() : value;
          if (filteredNodes[rowNode.id]) {
            data[colId] = actualValue;
            data[filteredOutColId] = params.aggFunc || params.isScatter ? void 0 : 0;
          } else {
            data[colId] = params.aggFunc || params.isScatter ? void 0 : 0;
            data[filteredOutColId] = actualValue;
          }
        } else {
          let value = this.valueService.getValue(col, rowNode);
          if (value && value.hasOwnProperty("toString")) {
            value = parseFloat(value.toString());
          }
          data[colId] = value != null && typeof value.toNumber === "function" ? value.toNumber() : value;
        }
      });
      extractedRowData.push(data);
    }
    let groupChartData;
    if (grouping) {
      const groupIndexesToRemove = import_core._.values(groupsToRemove);
      const allData = extractedRowData;
      extractedRowData = [];
      groupChartData = [];
      for (let i = 0; i < allData.length; i++) {
        (import_core._.includes(groupIndexesToRemove, i) ? groupChartData : extractedRowData).push(allData[i]);
      }
    }
    return { chartData: extractedRowData, columnNames, groupChartData };
  }
  aggregateRowsByDimension(params, dataFromGrid) {
    const dimensionCols = params.dimensionCols;
    if (!params.aggFunc || dimensionCols.length === 0) {
      return dataFromGrid;
    }
    const lastCol = import_core._.last(dimensionCols);
    const lastColId = lastCol && lastCol.colId;
    const map = {};
    const dataAggregated = [];
    dataFromGrid.forEach((data) => {
      let currentMap = map;
      dimensionCols.forEach((col) => {
        const colId = col.colId;
        const key = data[colId];
        if (colId === lastColId) {
          let groupItem = currentMap[key];
          if (!groupItem) {
            groupItem = { __children: [] };
            dimensionCols.forEach((dimCol) => {
              const dimColId = dimCol.colId;
              groupItem[dimColId] = data[dimColId];
            });
            currentMap[key] = groupItem;
            dataAggregated.push(groupItem);
          }
          groupItem.__children.push(data);
        } else {
          if (!currentMap[key]) {
            currentMap[key] = {};
          }
          currentMap = currentMap[key];
        }
      });
    });
    if (import_core.ModuleRegistry.__assertRegistered(import_core.ModuleNames.RowGroupingModule, "Charting Aggregation", this.context.getGridId())) {
      const aggStage = this.aggregationStage;
      dataAggregated.forEach((groupItem) => params.valueCols.forEach((col) => {
        if (params.crossFiltering) {
          params.valueCols.forEach((valueCol) => {
            const colId = valueCol.getColId();
            const dataToAgg = groupItem.__children.filter((child) => typeof child[colId] !== "undefined").map((child) => child[colId]);
            let aggResult = aggStage.aggregateValues(dataToAgg, params.aggFunc);
            groupItem[valueCol.getId()] = aggResult && typeof aggResult.value !== "undefined" ? aggResult.value : aggResult;
            const filteredOutColId = `${colId}-filtered-out`;
            const dataToAggFiltered = groupItem.__children.filter((child) => typeof child[filteredOutColId] !== "undefined").map((child) => child[filteredOutColId]);
            let aggResultFiltered = aggStage.aggregateValues(dataToAggFiltered, params.aggFunc);
            groupItem[filteredOutColId] = aggResultFiltered && typeof aggResultFiltered.value !== "undefined" ? aggResultFiltered.value : aggResultFiltered;
          });
        } else {
          const dataToAgg = groupItem.__children.map((child) => child[col.getId()]);
          let aggResult = aggStage.aggregateValues(dataToAgg, params.aggFunc);
          groupItem[col.getId()] = aggResult && typeof aggResult.value !== "undefined" ? aggResult.value : aggResult;
        }
      }));
    }
    return dataAggregated;
  }
  updatePivotKeysForSSRM() {
    const secondaryColumns = this.columnModel.getSecondaryColumns();
    if (!secondaryColumns) {
      return;
    }
    const pivotKeySeparator = this.extractPivotKeySeparator(secondaryColumns);
    secondaryColumns.forEach((col) => {
      if (pivotKeySeparator === "") {
        col.getColDef().pivotKeys = [];
      } else {
        const keys = col.getColId().split(pivotKeySeparator);
        col.getColDef().pivotKeys = keys.slice(0, keys.length - 1);
      }
    });
  }
  extractPivotKeySeparator(secondaryColumns) {
    if (secondaryColumns.length === 0) {
      return "";
    }
    const extractSeparator = (columnGroup, childId) => {
      const groupId = columnGroup.getGroupId();
      if (!columnGroup.getParent()) {
        return childId.split(groupId)[1][0];
      }
      return extractSeparator(columnGroup.getParent(), groupId);
    };
    const firstSecondaryCol = secondaryColumns[0];
    if (firstSecondaryCol.getParent() == null) {
      return "";
    }
    return extractSeparator(firstSecondaryCol.getParent(), firstSecondaryCol.getColId());
  }
  static getGroupLabels(rowNode, initialLabel) {
    const labels = [initialLabel];
    while (rowNode && rowNode.level !== 0) {
      rowNode = rowNode.parent;
      if (rowNode) {
        labels.push(rowNode.key);
      }
    }
    return labels;
  }
  getFilteredRowNodes() {
    const filteredNodes = {};
    this.gridRowModel.forEachNodeAfterFilterAndSort((rowNode) => {
      filteredNodes[rowNode.id] = rowNode;
    });
    return filteredNodes;
  }
  getAllRowNodes() {
    let allRowNodes = [];
    this.gridRowModel.forEachNode((rowNode) => {
      allRowNodes.push(rowNode);
    });
    return this.sortRowNodes(allRowNodes);
  }
  sortRowNodes(rowNodes) {
    const sortOptions = this.sortController.getSortOptions();
    const noSort = !sortOptions || sortOptions.length == 0;
    if (noSort)
      return rowNodes;
    return this.rowNodeSorter.doFullSort(rowNodes, sortOptions);
  }
};
__decorateClass([
  (0, import_core.Autowired)("rowModel")
], _ChartDatasource.prototype, "gridRowModel", 2);
__decorateClass([
  (0, import_core.Autowired)("valueService")
], _ChartDatasource.prototype, "valueService", 2);
__decorateClass([
  (0, import_core.Autowired)("columnModel")
], _ChartDatasource.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core.Autowired)("rowNodeSorter")
], _ChartDatasource.prototype, "rowNodeSorter", 2);
__decorateClass([
  (0, import_core.Autowired)("sortController")
], _ChartDatasource.prototype, "sortController", 2);
__decorateClass([
  (0, import_core.Optional)("aggregationStage")
], _ChartDatasource.prototype, "aggregationStage", 2);
var ChartDatasource = _ChartDatasource;

// enterprise-modules/charts/src/charts/chartComp/services/chartColumnService.ts
var import_core2 = require("@ag-grid-community/core");
var ChartColumnService = class extends import_core2.BeanStub {
  constructor() {
    super(...arguments);
    this.valueColsWithoutSeriesType = /* @__PURE__ */ new Set();
  }
  postConstruct() {
    const clearValueCols = () => this.valueColsWithoutSeriesType.clear();
    this.addManagedListener(this.eventService, import_core2.Events.EVENT_NEW_COLUMNS_LOADED, clearValueCols);
    this.addManagedListener(this.eventService, import_core2.Events.EVENT_ROW_DATA_UPDATED, clearValueCols);
  }
  getColumn(colId) {
    return this.columnModel.getPrimaryColumn(colId);
  }
  getAllDisplayedColumns() {
    return this.columnModel.getAllDisplayedColumns();
  }
  getColDisplayName(col) {
    return this.columnModel.getDisplayNameForColumn(col, "chart");
  }
  getRowGroupColumns() {
    return this.columnModel.getRowGroupColumns();
  }
  getGroupDisplayColumns() {
    return this.columnModel.getGroupDisplayColumns();
  }
  isPivotMode() {
    return this.columnModel.isPivotMode();
  }
  isPivotActive() {
    return this.columnModel.isPivotActive();
  }
  getChartColumns() {
    const gridCols = this.columnModel.getAllGridColumns();
    const dimensionCols = /* @__PURE__ */ new Set();
    const valueCols = /* @__PURE__ */ new Set();
    gridCols.forEach((col) => {
      const colDef = col.getColDef();
      const chartDataType = colDef.chartDataType;
      if (chartDataType) {
        switch (chartDataType) {
          case "category":
          case "time":
            dimensionCols.add(col);
            return;
          case "series":
            valueCols.add(col);
            return;
          case "excluded":
            return;
          default:
            console.warn(`AG Grid: unexpected chartDataType value '${chartDataType}' supplied, instead use 'category', 'series' or 'excluded'`);
            break;
        }
      }
      if (colDef.colId === "ag-Grid-AutoColumn") {
        dimensionCols.add(col);
        return;
      }
      if (!col.isPrimary()) {
        valueCols.add(col);
        return;
      }
      (this.isInferredValueCol(col) ? valueCols : dimensionCols).add(col);
    });
    return { dimensionCols, valueCols };
  }
  isInferredValueCol(col) {
    const colId = col.getColId();
    if (colId === "ag-Grid-AutoColumn") {
      return false;
    }
    const row = this.rowPositionUtils.getRowNode({ rowIndex: 0, rowPinned: null });
    if (!row) {
      return this.valueColsWithoutSeriesType.has(colId);
    }
    let cellValue = this.valueService.getValue(col, row);
    if (cellValue == null) {
      cellValue = this.extractLeafData(row, col);
    }
    if (cellValue != null && typeof cellValue.toNumber === "function") {
      cellValue = cellValue.toNumber();
    }
    const isNumber = typeof cellValue === "number";
    if (isNumber) {
      this.valueColsWithoutSeriesType.add(colId);
    }
    return isNumber;
  }
  extractLeafData(row, col) {
    if (!row.allLeafChildren) {
      return null;
    }
    for (let i = 0; i < row.allLeafChildren.length; i++) {
      const childRow = row.allLeafChildren[i];
      const value = this.valueService.getValue(col, childRow);
      if (value != null) {
        return value;
      }
    }
    return null;
  }
  destroy() {
    this.valueColsWithoutSeriesType.clear();
    super.destroy();
  }
};
__decorateClass([
  (0, import_core2.Autowired)("columnModel")
], ChartColumnService.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core2.Autowired)("valueService")
], ChartColumnService.prototype, "valueService", 2);
__decorateClass([
  (0, import_core2.Autowired)("rowPositionUtils")
], ChartColumnService.prototype, "rowPositionUtils", 2);
__decorateClass([
  import_core2.PostConstruct
], ChartColumnService.prototype, "postConstruct", 1);
ChartColumnService = __decorateClass([
  (0, import_core2.Bean)("chartColumnService")
], ChartColumnService);

// enterprise-modules/charts/src/charts/chartComp/model/comboChartModel.ts
var import_core3 = require("@ag-grid-community/core");
var _ComboChartModel = class _ComboChartModel extends import_core3.BeanStub {
  constructor(chartDataModel) {
    var _a;
    super();
    // this control flag is used to only log warning for the initial user config
    this.suppressComboChartWarnings = false;
    this.chartDataModel = chartDataModel;
    this.seriesChartTypes = (_a = chartDataModel.params.seriesChartTypes) != null ? _a : [];
  }
  init() {
    this.initComboCharts();
  }
  update(seriesChartTypes) {
    this.seriesChartTypes = seriesChartTypes != null ? seriesChartTypes : this.seriesChartTypes;
    this.initComboCharts();
    this.updateSeriesChartTypes();
  }
  initComboCharts() {
    const seriesChartTypesExist = this.seriesChartTypes && this.seriesChartTypes.length > 0;
    const customCombo = this.chartDataModel.chartType === "customCombo" || seriesChartTypesExist;
    if (customCombo) {
      this.chartDataModel.chartType = "customCombo";
      this.savedCustomSeriesChartTypes = this.seriesChartTypes || [];
    }
  }
  updateSeriesChartTypes() {
    if (!this.chartDataModel.isComboChart()) {
      return;
    }
    this.seriesChartTypes = this.seriesChartTypes.map((seriesChartType) => {
      const primaryOnly = ["groupedColumn", "stackedColumn", "stackedArea"].includes(seriesChartType.chartType);
      seriesChartType.secondaryAxis = primaryOnly ? false : seriesChartType.secondaryAxis;
      return seriesChartType;
    });
    if (this.chartDataModel.chartType === "customCombo") {
      this.updateSeriesChartTypesForCustomCombo();
      return;
    }
    this.updateChartSeriesTypesForBuiltInCombos();
  }
  updateSeriesChartTypesForCustomCombo() {
    const seriesChartTypesSupplied = this.seriesChartTypes && this.seriesChartTypes.length > 0;
    if (!seriesChartTypesSupplied && !this.suppressComboChartWarnings) {
      console.warn(`AG Grid: 'seriesChartTypes' are required when the 'customCombo' chart type is specified.`);
    }
    this.seriesChartTypes = this.seriesChartTypes.map((s) => {
      if (!_ComboChartModel.SUPPORTED_COMBO_CHART_TYPES.includes(s.chartType)) {
        console.warn(`AG Grid: invalid chartType '${s.chartType}' supplied in 'seriesChartTypes', converting to 'line' instead.`);
        s.chartType = "line";
      }
      return s;
    });
    const getSeriesChartType = (valueCol) => {
      if (!this.savedCustomSeriesChartTypes || this.savedCustomSeriesChartTypes.length === 0) {
        this.savedCustomSeriesChartTypes = this.seriesChartTypes;
      }
      const providedSeriesChartType = this.savedCustomSeriesChartTypes.find((s) => s.colId === valueCol.colId);
      if (!providedSeriesChartType) {
        if (valueCol.selected && !this.suppressComboChartWarnings) {
          console.warn(`AG Grid: no 'seriesChartType' found for colId = '${valueCol.colId}', defaulting to 'line'.`);
        }
        return {
          colId: valueCol.colId,
          chartType: "line",
          secondaryAxis: false
        };
      }
      return providedSeriesChartType;
    };
    const updatedSeriesChartTypes = this.chartDataModel.valueColState.map(getSeriesChartType);
    this.seriesChartTypes = updatedSeriesChartTypes;
    this.savedCustomSeriesChartTypes = updatedSeriesChartTypes;
    this.suppressComboChartWarnings = true;
  }
  updateChartSeriesTypesForBuiltInCombos() {
    const { chartType, valueColState } = this.chartDataModel;
    let primaryChartType = chartType === "columnLineCombo" ? "groupedColumn" : "stackedArea";
    let secondaryChartType = chartType === "columnLineCombo" ? "line" : "groupedColumn";
    const selectedCols = valueColState.filter((cs) => cs.selected);
    const lineIndex = Math.ceil(selectedCols.length / 2);
    this.seriesChartTypes = selectedCols.map((valueCol, i) => {
      const seriesType = i >= lineIndex ? secondaryChartType : primaryChartType;
      return { colId: valueCol.colId, chartType: seriesType, secondaryAxis: false };
    });
  }
};
_ComboChartModel.SUPPORTED_COMBO_CHART_TYPES = ["line", "groupedColumn", "stackedColumn", "area", "stackedArea"];
__decorateClass([
  import_core3.PostConstruct
], _ComboChartModel.prototype, "init", 1);
var ComboChartModel = _ComboChartModel;

// enterprise-modules/charts/src/charts/chartComp/utils/seriesTypeMapper.ts
var import_core4 = require("@ag-grid-community/core");
var SERIES_TYPES = {
  "area": {
    isCartesian: true,
    canInvert: true
  },
  "bar": {
    isCartesian: true,
    canInvert: true
  },
  "histogram": {
    isCartesian: true
  },
  "line": {
    isCartesian: true,
    canInvert: true
  },
  "pie": {
    isPie: true
  },
  "donut": {
    isPie: true,
    canInvert: true
  },
  "scatter": {
    isCartesian: true
  },
  "bubble": {
    isCartesian: true
  },
  "radial-column": {
    isPolar: true,
    isEnterprise: true,
    isRadial: true,
    canInvert: true
  },
  "radial-bar": {
    isPolar: true,
    isEnterprise: true,
    isRadial: true,
    canInvert: true
  },
  "radar-line": {
    isPolar: true,
    isEnterprise: true,
    canInvert: true
  },
  "radar-area": {
    isPolar: true,
    isEnterprise: true,
    canInvert: true
  },
  "nightingale": {
    isPolar: true,
    isEnterprise: true,
    canInvert: true
  },
  "range-bar": {
    isCartesian: true,
    isEnterprise: true,
    canSwitchDirection: true
  },
  "range-area": {
    isCartesian: true,
    isEnterprise: true
  },
  "box-plot": {
    isCartesian: true,
    isEnterprise: true,
    canSwitchDirection: true
  },
  "treemap": {
    isEnterprise: true,
    isHierarchical: true
  },
  "sunburst": {
    isEnterprise: true,
    isHierarchical: true
  },
  "heatmap": {
    isCartesian: true,
    isEnterprise: true
  },
  "waterfall": {
    isCartesian: true,
    isEnterprise: true,
    canSwitchDirection: true
  }
};
function isSeriesType(seriesType) {
  return !!SERIES_TYPES[seriesType];
}
function isComboChart(chartType) {
  return import_core4.ChartMappings.COMBO_CHART_TYPES.includes(chartType);
}
function doesSeriesHaveProperty(seriesType, prop) {
  var _a;
  return !!((_a = SERIES_TYPES[seriesType]) == null ? void 0 : _a[prop]);
}
function isEnterpriseChartType(chartType) {
  return doesSeriesHaveProperty(getSeriesType(chartType), "isEnterprise");
}
var stackedChartTypes = /* @__PURE__ */ new Set(["stackedColumn", "normalizedColumn", "stackedBar", "normalizedBar"]);
function isStacked(chartType) {
  return stackedChartTypes.has(chartType);
}
function isCartesian(seriesType) {
  return doesSeriesHaveProperty(seriesType, "isCartesian");
}
function isPolar(seriesType) {
  return doesSeriesHaveProperty(seriesType, "isPolar");
}
function isRadial(seriesType) {
  return doesSeriesHaveProperty(seriesType, "isRadial");
}
function isHierarchical(seriesType) {
  return doesSeriesHaveProperty(seriesType, "isHierarchical");
}
function getCanonicalChartType(chartType) {
  return chartType === "doughnut" ? "donut" : chartType;
}
function getSeriesTypeIfExists(chartType) {
  return import_core4.ChartMappings.CHART_TYPE_TO_SERIES_TYPE[chartType];
}
function getSeriesType(chartType) {
  var _a;
  return (_a = getSeriesTypeIfExists(chartType)) != null ? _a : "line";
}
function isPieChartSeries(seriesType) {
  return doesSeriesHaveProperty(seriesType, "isPie");
}
function canOnlyHaveSingleSeries(chartType) {
  return chartType === "pie" || chartType === "waterfall" || chartType === "histogram";
}
function getMaxNumCategories(chartType) {
  return isHierarchical(getSeriesType(chartType)) ? void 0 : 1;
}
function getMaxNumSeries(chartType) {
  if (isHierarchical(getSeriesType(chartType))) {
    return 2;
  } else if (canOnlyHaveSingleSeries(chartType)) {
    return 1;
  } else {
    return void 0;
  }
}
function supportsInvertedCategorySeries(chartType) {
  return doesSeriesHaveProperty(getSeriesType(chartType), "canInvert");
}
function canSwitchDirection(chartType) {
  return doesSeriesHaveProperty(getSeriesType(chartType), "canSwitchDirection");
}

// enterprise-modules/charts/src/charts/chartComp/model/chartDataModel.ts
var _ChartDataModel = class _ChartDataModel extends import_core5.BeanStub {
  constructor(params) {
    super();
    this.unlinked = false;
    this.chartData = [];
    this.valueColState = [];
    this.dimensionColState = [];
    this.columnNames = {};
    this.crossFiltering = false;
    this.grouping = false;
    this.params = params;
    this.chartId = params.chartId;
    this.setParams(params);
  }
  setParams(params) {
    const {
      chartType,
      pivotChart,
      chartThemeName,
      switchCategorySeries,
      aggFunc,
      cellRange,
      suppressChartRanges,
      unlinkChart,
      crossFiltering,
      seriesGroupType
    } = params;
    this.chartType = chartType;
    this.pivotChart = pivotChart != null ? pivotChart : false;
    this.chartThemeName = chartThemeName;
    this.switchCategorySeries = !!switchCategorySeries;
    this.aggFunc = aggFunc;
    this.referenceCellRange = cellRange;
    this.suppliedCellRange = cellRange;
    this.suppressChartRanges = suppressChartRanges != null ? suppressChartRanges : false;
    this.unlinked = !!unlinkChart;
    this.crossFiltering = !!crossFiltering;
    this.seriesGroupType = seriesGroupType;
  }
  init() {
    this.datasource = this.createManagedBean(new ChartDatasource());
    this.chartColumnService = this.createManagedBean(new ChartColumnService());
    this.comboChartModel = this.createManagedBean(new ComboChartModel(this));
    this.updateCellRanges({ setColsFromRange: true });
    this.updateData();
  }
  updateModel(params) {
    const { cellRange, seriesChartTypes } = params;
    if (cellRange !== this.suppliedCellRange) {
      this.dimensionCellRange = void 0;
      this.valueCellRange = void 0;
    }
    this.setParams(params);
    this.updateSelectedDimensions(cellRange == null ? void 0 : cellRange.columns);
    this.updateCellRanges({ setColsFromRange: true });
    const shouldUpdateComboModel = this.isComboChart() || seriesChartTypes;
    if (shouldUpdateComboModel) {
      this.comboChartModel.update(seriesChartTypes);
    }
    if (!this.unlinked) {
      this.updateData();
    }
  }
  updateCellRanges(params) {
    const { updatedColState, resetOrder, maintainColState, setColsFromRange } = params != null ? params : {};
    if (this.valueCellRange) {
      this.referenceCellRange = this.valueCellRange;
    }
    const { dimensionCols, valueCols } = this.chartColumnService.getChartColumns();
    const allColsFromRanges = this.getAllColumnsFromRanges();
    if (updatedColState) {
      this.updateColumnState(updatedColState, resetOrder);
    }
    this.setDimensionCellRange(dimensionCols, allColsFromRanges, updatedColState);
    this.setValueCellRange(valueCols, allColsFromRanges, setColsFromRange);
    if (!updatedColState && !maintainColState) {
      this.resetColumnState();
      this.syncDimensionCellRange();
    }
    this.comboChartModel.updateSeriesChartTypes();
  }
  updateData() {
    const { startRow, endRow } = this.getRowIndexes();
    if (this.pivotChart) {
      this.resetColumnState();
    }
    this.grouping = this.isGrouping();
    const params = {
      aggFunc: this.aggFunc,
      dimensionCols: this.getSelectedDimensions(),
      grouping: this.grouping,
      pivoting: this.isPivotActive(),
      crossFiltering: this.crossFiltering,
      valueCols: this.getSelectedValueCols(),
      startRow,
      endRow,
      isScatter: import_core5._.includes(["scatter", "bubble"], this.chartType)
    };
    const { chartData, columnNames, groupChartData } = this.datasource.getData(params);
    this.chartData = chartData;
    this.groupChartData = groupChartData;
    this.columnNames = columnNames;
    this.categoryAxisType = void 0;
  }
  isGrouping() {
    const usingTreeData = this.gos.get("treeData");
    const groupedCols = usingTreeData ? null : this.chartColumnService.getRowGroupColumns();
    const isGroupActive = usingTreeData || groupedCols && groupedCols.length > 0;
    const colIds = this.getSelectedDimensions().map(({ colId }) => colId);
    const displayedGroupCols = this.chartColumnService.getGroupDisplayColumns();
    const groupDimensionSelected = displayedGroupCols.map((col) => col.getColId()).some((id) => colIds.includes(id));
    return !!isGroupActive && groupDimensionSelected;
  }
  getSelectedValueCols() {
    return this.valueColState.filter((cs) => cs.selected).map((cs) => cs.column);
  }
  getSelectedDimensions() {
    return this.dimensionColState.filter((cs) => cs.selected);
  }
  getColDisplayName(col) {
    return this.chartColumnService.getColDisplayName(col);
  }
  isPivotMode() {
    return this.chartColumnService.isPivotMode();
  }
  getChartDataType(colId) {
    const column = this.chartColumnService.getColumn(colId);
    return column ? column.getColDef().chartDataType : void 0;
  }
  isPivotActive() {
    return this.chartColumnService.isPivotActive();
  }
  createCellRange(type, ...columns) {
    return {
      id: this.chartId,
      // set range ID to match chart ID so we can identify changes to the ranges for this chart
      startRow: this.referenceCellRange.startRow,
      endRow: this.referenceCellRange.endRow,
      columns,
      startColumn: type === import_core5.CellRangeType.DIMENSION || this.referenceCellRange.startColumn == null ? columns[0] : this.referenceCellRange.startColumn,
      type
    };
  }
  getAllColumnsFromRanges() {
    if (this.pivotChart) {
      return import_core5._.convertToSet(this.chartColumnService.getAllDisplayedColumns());
    }
    const columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;
    if (this.dimensionCellRange) {
      columns.push(...this.dimensionCellRange.columns);
    }
    if (this.valueCellRange) {
      columns.push(...this.valueCellRange.columns);
    }
    return import_core5._.convertToSet(columns);
  }
  getRowIndexes() {
    let startRow = 0, endRow = 0;
    const { rangeService, valueCellRange, dimensionCellRange } = this;
    const cellRange = valueCellRange || dimensionCellRange;
    if (rangeService && cellRange) {
      startRow = rangeService.getRangeStartRow(cellRange).rowIndex;
      const endRowPosition = rangeService.getRangeEndRow(cellRange);
      endRow = endRowPosition.rowPinned === "bottom" ? -1 : endRowPosition.rowIndex;
    }
    return { startRow, endRow };
  }
  resetColumnState() {
    const { dimensionCols, valueCols } = this.chartColumnService.getChartColumns();
    const allCols = this.getAllColumnsFromRanges();
    const isInitialising = this.valueColState.length < 1;
    this.dimensionColState = [];
    this.valueColState = [];
    const supportsMultipleDimensions = isHierarchical(getSeriesType(this.chartType));
    let hasSelectedDimension = false;
    let order = 1;
    const aggFuncDimension = this.suppliedCellRange.columns[0];
    dimensionCols.forEach((column) => {
      const isAutoGroupCol = column.getColId() === "ag-Grid-AutoColumn";
      let selected = false;
      if (this.crossFiltering && this.aggFunc) {
        if (aggFuncDimension.getColId() === column.getColId()) {
          selected = true;
        }
      } else {
        selected = isAutoGroupCol ? true : (!hasSelectedDimension || supportsMultipleDimensions) && allCols.has(column);
      }
      this.dimensionColState.push({
        column,
        colId: column.getColId(),
        displayName: this.getColDisplayName(column),
        selected,
        order: order++
      });
      if (selected) {
        hasSelectedDimension = true;
      }
    });
    const defaultCategory = {
      colId: _ChartDataModel.DEFAULT_CATEGORY,
      displayName: this.chartTranslationService.translate("defaultCategory"),
      selected: !hasSelectedDimension,
      // if no dimensions in range select the default
      order: 0
    };
    this.dimensionColState.unshift(defaultCategory);
    const valueColumnsFromReferenceRange = this.referenceCellRange.columns.filter((c) => valueCols.has(c));
    valueCols.forEach((column) => {
      if (isInitialising && import_core5._.includes(this.referenceCellRange.columns, column)) {
        column = valueColumnsFromReferenceRange.shift();
      }
      this.valueColState.push({
        column,
        colId: column.getColId(),
        displayName: this.getColDisplayName(column),
        selected: allCols.has(column),
        order: order++
      });
    });
  }
  updateColumnState(updatedCol, resetOrder) {
    const idsMatch = (cs) => cs.colId === updatedCol.colId;
    const { dimensionColState, valueColState } = this;
    const matchedDimensionColState = dimensionColState.find(idsMatch);
    const matchedValueColState = valueColState.find(idsMatch);
    if (matchedDimensionColState) {
      const supportsMultipleDimensions = isHierarchical(getSeriesType(this.chartType));
      if (!supportsMultipleDimensions) {
        const selectedColumnState = updatedCol.selected ? matchedDimensionColState : dimensionColState.filter((cs) => cs !== matchedDimensionColState).find(({ selected }) => selected);
        dimensionColState.forEach((cs) => cs.selected = cs === selectedColumnState);
      } else {
        matchedDimensionColState.selected = updatedCol.selected;
      }
    } else if (matchedValueColState) {
      matchedValueColState.selected = updatedCol.selected;
    }
    const allColumns = [...dimensionColState, ...valueColState];
    const orderedColIds = [];
    if (!resetOrder) {
      allColumns.forEach((col, i) => {
        if (i === updatedCol.order) {
          orderedColIds.push(updatedCol.colId);
        }
        if (col.colId !== updatedCol.colId) {
          orderedColIds.push(col.colId);
        }
      });
      allColumns.forEach((col) => {
        const order = orderedColIds.indexOf(col.colId);
        col.order = order >= 0 ? orderedColIds.indexOf(col.colId) : allColumns.length - 1;
      });
    }
    this.reorderColState();
  }
  reorderColState() {
    const ascColStateOrder = (a, b) => a.order - b.order;
    this.dimensionColState.sort(ascColStateOrder);
    this.valueColState.sort(ascColStateOrder);
  }
  setDimensionCellRange(dimensionCols, colsInRange, updatedColState) {
    this.dimensionCellRange = void 0;
    const supportsMultipleDimensions = isHierarchical(getSeriesType(this.chartType));
    if (!updatedColState && !this.dimensionColState.length) {
      const selectedCols = new Array();
      dimensionCols.forEach((col) => {
        if (selectedCols.length > 0 && !supportsMultipleDimensions || !colsInRange.has(col)) {
          return;
        }
        selectedCols.push(col);
      });
      if (selectedCols.length > 0) {
        this.dimensionCellRange = this.createCellRange(import_core5.CellRangeType.DIMENSION, ...selectedCols);
      }
      return;
    }
    let selectedDimensionColStates = updatedColState ? [updatedColState] : [];
    if (this.crossFiltering && this.aggFunc) {
      const aggFuncDimension = this.suppliedCellRange.columns[0];
      selectedDimensionColStates = this.dimensionColState.filter((cs) => cs.colId === aggFuncDimension.getColId());
    } else if (supportsMultipleDimensions || selectedDimensionColStates.length === 0 || selectedDimensionColStates.some(({ column }) => !column || !dimensionCols.has(column))) {
      selectedDimensionColStates = this.dimensionColState.filter((cs) => cs.selected);
    }
    const isDefaultCategory = selectedDimensionColStates.length === 1 ? selectedDimensionColStates[0].colId === _ChartDataModel.DEFAULT_CATEGORY : false;
    const selectedColumns = selectedDimensionColStates.map(({ column }) => column).filter((value) => value != null);
    if (selectedColumns.length > 0 && !isDefaultCategory) {
      this.dimensionCellRange = this.createCellRange(import_core5.CellRangeType.DIMENSION, ...selectedColumns);
    }
  }
  setValueCellRange(valueCols, colsInRange, setColsFromRange) {
    this.valueCellRange = void 0;
    const selectedValueCols = [];
    const maxSelection = getMaxNumSeries(this.chartType);
    let numSelected = 0;
    valueCols.forEach((col) => {
      if (setColsFromRange) {
        if ((maxSelection == null || numSelected < maxSelection) && colsInRange.has(col)) {
          selectedValueCols.push(col);
          numSelected++;
        }
      } else {
        if (this.valueColState.some((colState) => colState.selected && colState.colId === col.getColId())) {
          selectedValueCols.push(col);
        }
      }
    });
    if (selectedValueCols.length > 0) {
      let orderedColIds = [];
      if (this.valueColState.length > 0) {
        orderedColIds = this.valueColState.map((c) => c.colId);
      } else {
        colsInRange.forEach((c) => orderedColIds.push(c.getColId()));
      }
      selectedValueCols.sort((a, b) => orderedColIds.indexOf(a.getColId()) - orderedColIds.indexOf(b.getColId()));
      this.valueCellRange = this.createCellRange(import_core5.CellRangeType.VALUE, ...selectedValueCols);
    }
  }
  resetCellRanges(dimension, value) {
    if (!dimension && !value) {
      return;
    }
    const { dimensionCols, valueCols } = this.chartColumnService.getChartColumns();
    const allColsFromRanges = this.getAllColumnsFromRanges();
    if (dimension) {
      this.setDimensionCellRange(dimensionCols, allColsFromRanges);
    }
    if (value) {
      this.setValueCellRange(valueCols, allColsFromRanges);
    }
  }
  updateSelectedDimensions(columns) {
    const colIdSet = new Set(columns.map((column) => column.getColId()));
    const supportsMultipleDimensions = isHierarchical(getSeriesType(this.chartType));
    if (!supportsMultipleDimensions) {
      const foundColState = this.dimensionColState.find((colState) => colIdSet.has(colState.colId)) || this.dimensionColState[0];
      const selectedColumnId = foundColState.colId;
      this.dimensionColState = this.dimensionColState.map((colState) => __spreadProps(__spreadValues({}, colState), {
        selected: colState.colId === selectedColumnId
      }));
    } else {
      const foundColStates = this.dimensionColState.filter((colState) => colIdSet.has(colState.colId));
      const selectedColumnIds = new Set(foundColStates.map((colState) => colState.colId));
      this.dimensionColState = this.dimensionColState.map((colState) => __spreadProps(__spreadValues({}, colState), {
        selected: selectedColumnIds.has(colState.colId)
      }));
    }
  }
  syncDimensionCellRange() {
    const selectedDimensions = this.getSelectedDimensions();
    if (selectedDimensions.length === 0)
      return;
    const selectedCols = selectedDimensions.map(({ column }) => column).filter((value) => value != null);
    if (selectedCols.length > 0) {
      this.dimensionCellRange = this.createCellRange(import_core5.CellRangeType.DIMENSION, ...selectedCols);
    }
  }
  isComboChart(chartType) {
    return isComboChart(chartType != null ? chartType : this.chartType);
  }
};
_ChartDataModel.DEFAULT_CATEGORY = "AG-GRID-DEFAULT-CATEGORY";
__decorateClass([
  (0, import_core5.Autowired)("rangeService")
], _ChartDataModel.prototype, "rangeService", 2);
__decorateClass([
  (0, import_core5.Autowired)("chartTranslationService")
], _ChartDataModel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core5.PostConstruct
], _ChartDataModel.prototype, "init", 1);
var ChartDataModel = _ChartDataModel;

// enterprise-modules/charts/src/charts/chartComp/chartController.ts
var import_ag_charts_community3 = require("ag-charts-community");

// enterprise-modules/charts/src/charts/chartComp/chartProxies/chartTheme.ts
var import_core6 = require("@ag-grid-community/core");
var import_ag_charts_community = require("ag-charts-community");

// enterprise-modules/charts/src/charts/chartComp/utils/axisTypeMapper.ts
var ALL_AXIS_TYPES = ["number", "category", "grouped-category", "log", "time"];
function getLegacyAxisType(chartType) {
  switch (chartType) {
    case "bar":
    case "stackedBar":
    case "normalizedBar":
      return ["number", "category"];
    case "groupedBar":
      return ["number", "grouped-category"];
    case "column":
    case "stackedColumn":
    case "normalizedColumn":
    case "line":
    case "area":
    case "stackedArea":
    case "normalizedArea":
    case "histogram":
      return ["category", "number"];
    case "groupedColumn":
      return ["grouped-category", "number"];
    case "scatter":
    case "bubble":
      return ["number", "number"];
    default:
      return void 0;
  }
}

// enterprise-modules/charts/src/charts/chartComp/utils/object.ts
function emptyTarget(value) {
  return Array.isArray(value) ? [] : {};
}
function cloneUnlessOtherwiseSpecified(value, options) {
  return options.clone !== false && options.isMergeableObject(value) ? deepMerge(emptyTarget(value), value, options) : value;
}
function defaultArrayMerge(target, source, options) {
  return target.concat(source).map(function(element) {
    return cloneUnlessOtherwiseSpecified(element, options);
  });
}
function getMergeFunction(key, options) {
  if (!options.customMerge) {
    return deepMerge;
  }
  const customMerge = options.customMerge(key);
  return typeof customMerge === "function" ? customMerge : deepMerge;
}
function getEnumerableOwnPropertySymbols(target) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
    return target.propertyIsEnumerable(symbol);
  }) : [];
}
function getKeys(target) {
  return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}
function propertyIsOnObject(object, property) {
  try {
    return property in object;
  } catch (_38) {
    return false;
  }
}
function propertyIsUnsafe(target, key) {
  return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
}
function mergeObject(target = {}, source = {}, options) {
  const destination = {};
  if (options.isMergeableObject(target)) {
    getKeys(target).forEach(function(key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  getKeys(source).forEach(function(key) {
    if (propertyIsUnsafe(target, key)) {
      return;
    }
    if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
      destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    }
  });
  return destination;
}
function defaultIsMergeableObject(value) {
  return isNonNullObject(value) && !isSpecial(value);
}
function isNonNullObject(value) {
  return !!value && typeof value === "object";
}
function isSpecial(value) {
  const stringValue = Object.prototype.toString.call(value);
  return stringValue === "[object RegExp]" || stringValue === "[object Date]";
}
function deepMerge(target, source, options) {
  options = options || {};
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject;
  options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options);
  } else {
    return mergeObject(target, source, options);
  }
}
function get(source, expression, defaultValue) {
  if (source == null) {
    return defaultValue;
  }
  const keys = expression.split(".");
  let objectToRead = source;
  while (keys.length > 1) {
    objectToRead = objectToRead[keys.shift()];
    if (objectToRead == null) {
      return defaultValue;
    }
  }
  const value = objectToRead[keys[0]];
  return value != null ? value : defaultValue;
}
function set(target, expression, value) {
  if (target == null) {
    return;
  }
  const keys = expression.split(".");
  let objectToUpdate = target;
  keys.forEach((key, i) => {
    if (!objectToUpdate[key]) {
      objectToUpdate[key] = {};
    }
    if (i < keys.length - 1) {
      objectToUpdate = objectToUpdate[key];
    }
  });
  objectToUpdate[keys[keys.length - 1]] = value;
}

// enterprise-modules/charts/src/charts/chartComp/chartProxies/chartTheme.ts
function createAgChartTheme(chartProxyParams, proxy, isEnterprise, chartThemeDefaults, updatedOverrides) {
  var _a;
  const { chartOptionsToRestore, chartPaletteToRestore, chartThemeToRestore } = chartProxyParams;
  const themeName = getSelectedTheme(chartProxyParams);
  const stockTheme = isStockTheme(themeName);
  const rootTheme = stockTheme ? { baseTheme: themeName } : (_a = lookupCustomChartTheme(chartProxyParams, themeName)) != null ? _a : {};
  const gridOptionsThemeOverrides = chartProxyParams.getGridOptionsChartThemeOverrides();
  const apiThemeOverrides = chartProxyParams.apiChartThemeOverrides;
  const standaloneChartType = getSeriesType(chartProxyParams.chartType);
  const crossFilteringOverrides = chartProxyParams.crossFiltering ? createCrossFilterThemeOverrides(proxy, chartProxyParams, standaloneChartType) : void 0;
  const isTitleEnabled = () => {
    const isTitleEnabled2 = (obj) => {
      if (!obj) {
        return false;
      }
      return Object.keys(obj).some((key) => get(obj[key], "title.enabled", false));
    };
    return isTitleEnabled2(gridOptionsThemeOverrides) || isTitleEnabled2(apiThemeOverrides);
  };
  const overrides = [
    stockTheme ? inbuiltStockThemeOverrides(chartProxyParams, isEnterprise, isTitleEnabled()) : void 0,
    chartThemeDefaults,
    crossFilteringOverrides,
    gridOptionsThemeOverrides,
    apiThemeOverrides,
    __spreadValues({}, chartOptionsToRestore != null ? chartOptionsToRestore : {}),
    updatedOverrides
  ];
  const theme = overrides.filter((v) => !!v).reduce(
    (r, n) => ({
      baseTheme: r,
      overrides: n
    }),
    rootTheme
  );
  if (chartPaletteToRestore && themeName === chartThemeToRestore) {
    const rootThemePalette = import_ag_charts_community._Theme.getChartTheme(rootTheme).palette;
    if (!isIdenticalPalette(chartPaletteToRestore, rootThemePalette)) {
      theme.palette = chartPaletteToRestore;
    }
  }
  return theme;
}
function isIdenticalPalette(paletteA, paletteB) {
  const arrayCompare = (arrA, arrB) => {
    if (arrA.length !== arrB.length)
      return false;
    return arrA.every((v, i) => v === arrB[i]);
  };
  return arrayCompare(paletteA.fills, paletteB.fills) && arrayCompare(paletteA.strokes, paletteB.strokes);
}
function isStockTheme(themeName) {
  return import_core6._.includes(Object.keys(import_ag_charts_community._Theme.themes), themeName);
}
function createCrossFilterThemeOverrides(proxy, chartProxyParams, seriesType) {
  const legend = {
    listeners: {
      legendItemClick: (e) => {
        const chart = proxy.getChart();
        chart.series.forEach((s) => {
          s.toggleSeriesItem(e.itemId, e.enabled);
          s.toggleSeriesItem(`${e.itemId}-filtered-out`, e.enabled);
        });
      }
    }
  };
  return {
    [seriesType]: {
      tooltip: {
        delay: 500
      },
      legend,
      listeners: {
        click: (e) => chartProxyParams.crossFilterCallback(e, true)
      }
    }
  };
}
var STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES = ALL_AXIS_TYPES.reduce(
  (r, n) => __spreadProps(__spreadValues({}, r), { [n]: { title: { _enabledFromTheme: true } } }),
  {}
);
function inbuiltStockThemeOverrides(params, isEnterprise, titleEnabled) {
  const extraPadding = params.getExtraPaddingDirections();
  return {
    common: __spreadProps(__spreadValues({}, isEnterprise ? { animation: { duration: 500 } } : void 0), {
      axes: STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES,
      padding: {
        // don't add extra padding when a title is present!
        top: !titleEnabled && extraPadding.includes("top") ? 40 : 20,
        right: extraPadding.includes("right") ? 30 : 20,
        bottom: extraPadding.includes("bottom") ? 40 : 20,
        left: extraPadding.includes("left") ? 30 : 20
      }
    }),
    pie: {
      series: {
        title: { _enabledFromTheme: true },
        calloutLabel: { _enabledFromTheme: true },
        sectorLabel: {
          enabled: false,
          _enabledFromTheme: true
        }
      }
    },
    donut: {
      series: {
        title: { _enabledFromTheme: true },
        calloutLabel: { _enabledFromTheme: true },
        sectorLabel: {
          enabled: false,
          _enabledFromTheme: true
        }
      }
    }
  };
}
function getSelectedTheme(chartProxyParams) {
  let chartThemeName = chartProxyParams.getChartThemeName();
  const availableThemes = chartProxyParams.getChartThemes();
  if (!import_core6._.includes(availableThemes, chartThemeName)) {
    chartThemeName = availableThemes[0];
  }
  return chartThemeName;
}
function lookupCustomChartTheme(chartProxyParams, name) {
  const { customChartThemes } = chartProxyParams;
  const customChartTheme = customChartThemes && customChartThemes[name];
  if (!customChartTheme) {
    console.warn(
      `AG Grid: no stock theme exists with the name '${name}' and no custom chart theme with that name was supplied to 'customChartThemes'`
    );
  }
  return customChartTheme;
}

// enterprise-modules/charts/src/charts/chartComp/utils/chartParamsValidator.ts
var import_core7 = require("@ag-grid-community/core");
var import_ag_charts_community2 = require("ag-charts-community");
var validateIfDefined = (validationFn) => {
  return (value) => {
    if (value == void 0)
      return true;
    return validationFn(value);
  };
};
var isString = (value) => typeof value === "string";
var isBoolean = (value) => typeof value === "boolean";
var isValidSeriesChartType = (value) => typeof value === "object";
var createWarnMessage = (property, expectedType) => (value) => `AG Grid - unable to update chart as invalid params supplied:  \`${property}: ${value}\`, expected ${expectedType}.`;
var createEnterpriseMessage = (feature) => {
  const url = "https://www.ag-grid.com/javascript-data-grid/integrated-charts-installation/";
  return `${feature} is not supported in AG Charts Community (either 'ag-grid-charts-enterprise' or '@ag-grid-enterprise/charts-enterprise' hasn't been loaded). See ${url} for more details.`;
};
var _ChartParamsValidator = class _ChartParamsValidator {
  static isEnterprise() {
    return import_ag_charts_community2._ModuleSupport.enterpriseModule.isEnterprise;
  }
  static isValidChartType(value) {
    return !!getSeriesTypeIfExists(value) || isComboChart(value);
  }
  static isLegacyChartType(value) {
    return _ChartParamsValidator.legacyChartTypes.includes(value);
  }
  static validateUpdateParams(params) {
    let paramsToValidate = params;
    switch (paramsToValidate.type) {
      case "rangeChartUpdate":
        return _ChartParamsValidator.validateUpdateRangeChartParams(params);
      case "pivotChartUpdate":
        return _ChartParamsValidator.validateUpdatePivotChartParams(params);
      case "crossFilterChartUpdate":
        return _ChartParamsValidator.validateUpdateCrossFilterChartParams(params);
      default:
        console.warn(`AG Grid - Invalid value supplied for 'type': ${params.type}. It must be either 'rangeChartUpdate', 'pivotChartUpdate', or 'crossFilterChartUpdate'.`);
        return false;
    }
  }
  static validateCreateParams(params) {
    return _ChartParamsValidator.validateProperties(params, [
      _ChartParamsValidator.enterpriseChartTypeValidation,
      _ChartParamsValidator.switchCategorySeriesValidation
    ]);
  }
  static validateUpdateRangeChartParams(params) {
    const validations = [
      ..._ChartParamsValidator.commonUpdateValidations,
      _ChartParamsValidator.enterpriseChartTypeValidation,
      ..._ChartParamsValidator.cellRangeValidations,
      {
        property: "seriesChartTypes",
        validationFn: (value) => value === void 0 || Array.isArray(value) && value.every(isValidSeriesChartType),
        warnMessage: createWarnMessage("seriesChartTypes", "Array of SeriesChartType")
      }
    ];
    return _ChartParamsValidator.validateProperties(params, validations, [..._ChartParamsValidator.baseUpdateChartParams, "cellRange", "suppressChartRanges", "switchCategorySeries", "aggFunc", "seriesChartTypes", "seriesGroupType"], "UpdateRangeChartParams");
  }
  static validateUpdatePivotChartParams(params) {
    const validations = [
      ..._ChartParamsValidator.commonUpdateValidations
    ];
    return _ChartParamsValidator.validateProperties(params, validations, [..._ChartParamsValidator.baseUpdateChartParams], "UpdatePivotChartParams");
  }
  static validateUpdateCrossFilterChartParams(params) {
    const validations = [
      ..._ChartParamsValidator.commonUpdateValidations,
      ..._ChartParamsValidator.cellRangeValidations
    ];
    return _ChartParamsValidator.validateProperties(params, validations, [..._ChartParamsValidator.baseUpdateChartParams, "cellRange", "suppressChartRanges", "aggFunc"], "UpdateCrossFilterChartParams");
  }
  static validateProperties(params, validations, validPropertyNames, paramsType) {
    let validatedProperties = void 0;
    for (const validation of validations) {
      const { property, validationFn, warnMessage, warnIfFixed } = validation;
      if (property in params) {
        const value = params[property];
        const validationResult = validationFn(value);
        if (validationResult === true)
          continue;
        if (validationResult === false) {
          console.warn(warnMessage(value));
          return false;
        }
        validatedProperties = validatedProperties || __spreadValues({}, params);
        validatedProperties[property] = validationResult;
        if (warnIfFixed) {
          console.warn(warnMessage(value));
        }
      }
    }
    if (validPropertyNames) {
      for (const property in params) {
        if (!validPropertyNames.includes(property)) {
          console.warn(`AG Grid - Unexpected property supplied. ${paramsType} does not contain: \`${property}\`.`);
          return false;
        }
      }
    }
    if (validatedProperties)
      return validatedProperties;
    return true;
  }
};
_ChartParamsValidator.legacyChartTypes = [
  "doughnut"
];
_ChartParamsValidator.baseUpdateChartParams = ["type", "chartId", "chartType", "chartThemeName", "chartThemeOverrides", "unlinkChart"];
_ChartParamsValidator.validateChartType = validateIfDefined((chartType) => {
  if (_ChartParamsValidator.isValidChartType(chartType))
    return true;
  if (_ChartParamsValidator.isLegacyChartType(chartType)) {
    const renamedChartType = getCanonicalChartType(chartType);
    import_core7._.warnOnce(`The chart type '${chartType}' has been deprecated. Please use '${renamedChartType}' instead.`);
    return renamedChartType;
  }
  ;
  return false;
});
_ChartParamsValidator.validateAgChartThemeOverrides = validateIfDefined((themeOverrides) => {
  return typeof themeOverrides === "object";
});
_ChartParamsValidator.validateChartParamsCellRange = validateIfDefined((cellRange) => {
  return typeof cellRange === "object";
});
_ChartParamsValidator.validateAggFunc = validateIfDefined((aggFunc) => {
  return typeof aggFunc === "string" || typeof aggFunc === "function";
});
_ChartParamsValidator.enterpriseChartTypeValidation = {
  property: "chartType",
  validationFn: validateIfDefined((chartType) => _ChartParamsValidator.isEnterprise() || !chartType || !isEnterpriseChartType(chartType)),
  warnMessage: (chartType) => createEnterpriseMessage(`The '${chartType}' chart type`)
};
_ChartParamsValidator.switchCategorySeriesValidation = {
  property: "switchCategorySeries",
  validationFn: validateIfDefined((switchCategorySeries) => {
    if (!switchCategorySeries || _ChartParamsValidator.isEnterprise()) {
      return true;
    }
    return void 0;
  }),
  warnMessage: () => createEnterpriseMessage(`'switchCategorySeries' has been ignored as it`),
  warnIfFixed: true
};
_ChartParamsValidator.commonUpdateValidations = [
  { property: "chartId", validationFn: isString, warnMessage: createWarnMessage("chartId", "string") },
  {
    property: "chartType",
    validationFn: _ChartParamsValidator.validateChartType,
    warnMessage: createWarnMessage("chartType", "ChartType")
  },
  {
    property: "chartThemeName",
    validationFn: isString,
    warnMessage: createWarnMessage("chartThemeName", "string")
  },
  {
    property: "chartThemeOverrides",
    validationFn: _ChartParamsValidator.validateAgChartThemeOverrides,
    warnMessage: createWarnMessage("chartThemeOverrides", "AgChartThemeOverrides")
  },
  { property: "unlinkChart", validationFn: isBoolean, warnMessage: createWarnMessage("unlinkChart", "boolean") }
];
_ChartParamsValidator.cellRangeValidations = [
  {
    property: "cellRange",
    validationFn: _ChartParamsValidator.validateChartParamsCellRange,
    warnMessage: createWarnMessage("cellRange", "ChartParamsCellRange")
  },
  {
    property: "suppressChartRanges",
    validationFn: isBoolean,
    warnMessage: createWarnMessage("suppressChartRanges", "boolean")
  },
  {
    property: "aggFunc",
    validationFn: _ChartParamsValidator.validateAggFunc,
    warnMessage: createWarnMessage("aggFunc", "string or IAggFunc")
  },
  _ChartParamsValidator.switchCategorySeriesValidation
];
var ChartParamsValidator = _ChartParamsValidator;

// enterprise-modules/charts/src/charts/chartComp/chartController.ts
var DEFAULT_THEMES = ["ag-default", "ag-material", "ag-sheets", "ag-polychroma", "ag-vivid"];
var _ChartController = class _ChartController extends import_core8.BeanStub {
  constructor(model) {
    super();
    this.model = model;
    this.isEnterprise = () => import_ag_charts_community3._ModuleSupport.enterpriseModule.isEnterprise;
  }
  init() {
    this.setChartRange();
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_RANGE_SELECTION_CHANGED, (event) => {
      if (event.id && event.id === this.model.chartId) {
        this.updateForRangeChange();
      }
    });
    if (this.model.unlinked) {
      if (this.rangeService) {
        this.rangeService.setCellRanges([]);
      }
    }
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.updateForGridChange.bind(this));
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
    this.addManagedListener(this.eventService, import_core8.Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
  }
  update(params) {
    if (!this.validUpdateType(params))
      return false;
    const validationResult = ChartParamsValidator.validateUpdateParams(params);
    if (!validationResult)
      return false;
    const validParams = validationResult === true ? params : validationResult;
    this.applyValidatedChartParams(validParams);
    return true;
  }
  applyValidatedChartParams(params) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const { chartId, chartType, chartThemeName, unlinkChart } = params;
    const common = {
      chartId,
      pivotChart: this.model.pivotChart,
      chartType: chartType != null ? chartType : this.model.chartType,
      chartThemeName: chartThemeName != null ? chartThemeName : this.model.chartThemeName,
      unlinkChart: unlinkChart != null ? unlinkChart : this.model.unlinked,
      cellRange: this.model.suppliedCellRange,
      switchCategorySeries: this.model.switchCategorySeries,
      aggFunc: this.model.aggFunc,
      seriesChartTypes: void 0,
      suppressChartRanges: false,
      crossFiltering: false
    };
    let chartModelParams = __spreadValues({}, common);
    switch (params.type) {
      case "rangeChartUpdate":
        chartModelParams.cellRange = (_a = this.createCellRange(params)) != null ? _a : this.model.suppliedCellRange;
        chartModelParams.switchCategorySeries = (_b = params.switchCategorySeries) != null ? _b : this.model.switchCategorySeries;
        chartModelParams.aggFunc = (_c = params.aggFunc) != null ? _c : this.model.aggFunc;
        chartModelParams.seriesChartTypes = params.seriesChartTypes;
        chartModelParams.suppressChartRanges = (_d = params.suppressChartRanges) != null ? _d : this.model.suppressChartRanges;
        chartModelParams.seriesGroupType = (_e = params.seriesGroupType) != null ? _e : this.model.seriesGroupType;
        break;
      case "crossFilterChartUpdate":
        chartModelParams.cellRange = (_f = this.createCellRange(params)) != null ? _f : this.model.suppliedCellRange;
        chartModelParams.switchCategorySeries = false;
        chartModelParams.aggFunc = (_g = params.aggFunc) != null ? _g : this.model.aggFunc;
        chartModelParams.crossFiltering = true;
        chartModelParams.suppressChartRanges = (_h = params.suppressChartRanges) != null ? _h : this.model.suppressChartRanges;
        break;
      case "pivotChartUpdate":
        chartModelParams.switchCategorySeries = false;
        break;
    }
    this.model.updateModel(chartModelParams);
    const removeChartCellRanges = chartModelParams.unlinkChart || chartModelParams.suppressChartRanges;
    removeChartCellRanges ? (_i = this.rangeService) == null ? void 0 : _i.setCellRanges([]) : this.setChartRange();
  }
  updateForGridChange(params) {
    if (this.model.unlinked) {
      return;
    }
    const { maintainColState, setColsFromRange } = params != null ? params : {};
    this.model.updateCellRanges({ maintainColState, setColsFromRange });
    this.model.updateData();
    this.setChartRange();
  }
  updateForDataChange() {
    if (this.model.unlinked) {
      return;
    }
    this.model.updateData();
    this.raiseChartModelUpdateEvent();
  }
  updateForRangeChange() {
    this.updateForGridChange({ setColsFromRange: true });
    this.raiseChartRangeSelectionChangedEvent();
  }
  updateForPanelChange(params) {
    this.model.updateCellRanges(params);
    this.model.updateData();
    if (params.skipAnimation) {
      this.getChartProxy().getChartRef().skipAnimations();
    }
    this.setChartRange();
    this.raiseChartRangeSelectionChangedEvent();
  }
  updateThemeOverrides(updatedOverrides) {
    this.chartProxy.updateThemeOverrides(updatedOverrides);
  }
  getChartUpdateParams(updatedOverrides) {
    const selectedCols = this.getSelectedValueColState();
    const fields = selectedCols.map((c) => ({ colId: c.colId, displayName: c.displayName }));
    const data = this.getChartData();
    const selectedDimensions = this.getSelectedDimensions();
    const params = {
      data,
      groupData: this.model.groupChartData,
      grouping: this.isGrouping(),
      categories: selectedDimensions.map((selectedDimension) => {
        var _a;
        return {
          id: selectedDimension.colId,
          name: selectedDimension.displayName,
          chartDataType: (_a = this.model.categoryAxisType) != null ? _a : this.model.getChartDataType(selectedDimension.colId)
        };
      }),
      fields,
      chartId: this.getChartId(),
      getCrossFilteringContext: () => ({ lastSelectedChartId: "xxx" }),
      //this.params.crossFilteringContext, //TODO
      seriesChartTypes: this.getSeriesChartTypes(),
      updatedOverrides,
      seriesGroupType: this.model.seriesGroupType
    };
    return this.isCategorySeriesSwitched() ? this.invertCategorySeriesParams(params) : params;
  }
  invertCategorySeriesParams(params) {
    const [category] = params.categories;
    const categories = [{ id: ChartDataModel.DEFAULT_CATEGORY, name: "" }];
    const fields = params.data.map((value, index) => {
      const categoryKey = `${category.id}:${index}`;
      const categoryValue = value[category.id];
      const seriesLabel = categoryValue == null ? "" : String(categoryValue);
      return { colId: categoryKey, displayName: seriesLabel };
    });
    const data = params.fields.map((field) => {
      const row = {
        [ChartDataModel.DEFAULT_CATEGORY]: field.displayName
      };
      for (const [index, value] of params.data.entries()) {
        const categoryKey = `${category.id}:${index}`;
        const seriesLabelValue = value[field.colId];
        row[categoryKey] = seriesLabelValue;
      }
      return row;
    });
    return __spreadProps(__spreadValues({}, params), {
      categories,
      fields,
      data
    });
  }
  getChartModel() {
    const modelType = this.model.pivotChart ? "pivot" : "range";
    const seriesChartTypes = this.isComboChart() ? this.model.comboChartModel.seriesChartTypes : void 0;
    return {
      modelType,
      chartId: this.model.chartId,
      chartType: this.model.chartType,
      chartThemeName: this.getChartThemeName(),
      chartOptions: this.chartProxy.getChartThemeOverrides(),
      chartPalette: this.chartProxy.getChartPalette(),
      cellRange: this.getCellRangeParams(),
      switchCategorySeries: this.model.switchCategorySeries,
      suppressChartRanges: this.model.suppressChartRanges,
      aggFunc: this.model.aggFunc,
      unlinkChart: this.model.unlinked,
      seriesChartTypes,
      seriesGroupType: this.model.seriesGroupType
    };
  }
  getChartId() {
    return this.model.chartId;
  }
  getChartData() {
    return this.model.chartData;
  }
  getChartType() {
    return this.model.chartType;
  }
  setChartType(chartType) {
    this.updateMultiSeriesAndCategory(this.model.chartType, chartType);
    this.model.chartType = chartType;
    this.model.comboChartModel.updateSeriesChartTypes();
    this.model.switchCategorySeries = false;
    this.model.categoryAxisType = void 0;
    this.model.seriesGroupType = void 0;
    this.raiseChartModelUpdateEvent();
    this.raiseChartOptionsChangedEvent();
  }
  isCategorySeriesSwitched() {
    return this.model.switchCategorySeries && !this.model.isGrouping();
  }
  switchCategorySeries(inverted) {
    if (!supportsInvertedCategorySeries(this.getChartType()))
      return;
    this.model.switchCategorySeries = inverted;
    this.raiseChartModelUpdateEvent();
  }
  getAggFunc() {
    return this.model.aggFunc;
  }
  setAggFunc(value, silent) {
    if (this.model.aggFunc === value)
      return;
    this.model.aggFunc = value;
    if (silent)
      return;
    this.model.updateData();
    this.raiseChartModelUpdateEvent();
  }
  updateMultiSeriesAndCategory(previousChartType, chartType) {
    var _a, _b;
    const updateForMax = (columns, maxNum) => {
      let numSelected = 0;
      for (const colState of columns) {
        if (!colState.selected)
          continue;
        if (numSelected >= maxNum) {
          colState.selected = false;
        } else {
          numSelected++;
        }
      }
      if (numSelected === 0) {
        columns[0].selected = true;
      }
    };
    const maxNumDimensions = getMaxNumCategories(chartType);
    const maxNumSeries = getMaxNumSeries(chartType);
    const updateDimensionColState = maxNumDimensions != null && ((_a = getMaxNumCategories(previousChartType)) != null ? _a : 100) > (maxNumDimensions != null ? maxNumDimensions : 100);
    const updateValueColState = maxNumSeries != null && ((_b = getMaxNumSeries(previousChartType)) != null ? _b : 100) > (maxNumSeries != null ? maxNumSeries : 100);
    if (updateDimensionColState) {
      updateForMax(this.model.dimensionColState, maxNumDimensions);
    }
    if (updateValueColState) {
      updateForMax(this.model.valueColState, maxNumSeries);
    }
    if (updateDimensionColState || updateValueColState) {
      this.model.resetCellRanges(updateDimensionColState, updateValueColState);
      this.setChartRange(true);
    }
  }
  setChartThemeName(chartThemeName, silent) {
    this.model.chartThemeName = chartThemeName;
    if (!silent) {
      this.raiseChartModelUpdateEvent();
      this.raiseChartOptionsChangedEvent();
    }
  }
  getChartThemeName() {
    return this.model.chartThemeName;
  }
  isPivotChart() {
    return this.model.pivotChart;
  }
  isPivotMode() {
    return this.model.isPivotMode();
  }
  isGrouping() {
    return this.model.isGrouping();
  }
  isCrossFilterChart() {
    return this.model.crossFiltering;
  }
  getThemeNames() {
    return this.gos.get("chartThemes") || DEFAULT_THEMES;
  }
  getThemes() {
    const themeNames = this.getThemeNames();
    return themeNames.map((themeName) => {
      const stockTheme = isStockTheme(themeName);
      const theme = stockTheme ? themeName : this.chartProxy.lookupCustomChartTheme(themeName);
      return import_ag_charts_community3._Theme.getChartTheme(theme);
    });
  }
  getPalettes() {
    const themes = this.getThemes();
    return themes.map((theme) => {
      return theme.palette;
    });
  }
  getThemeTemplateParameters() {
    const themes = this.getThemes();
    return themes.map((theme) => {
      return theme.getTemplateParameters();
    });
  }
  getValueColState() {
    return this.model.valueColState.map(this.displayNameMapper.bind(this));
  }
  getSelectedValueColState() {
    return this.getValueColState().filter((cs) => cs.selected);
  }
  getSelectedDimensions() {
    return this.model.getSelectedDimensions();
  }
  displayNameMapper(col) {
    const columnNames = this.model.columnNames[col.colId];
    col.displayName = columnNames ? columnNames.join(" - ") : this.model.getColDisplayName(col.column);
    return col;
  }
  getColStateForMenu() {
    return { dimensionCols: this.model.dimensionColState, valueCols: this.getValueColState() };
  }
  setChartRange(silent = false) {
    if (this.rangeService && !this.model.suppressChartRanges && !this.model.unlinked) {
      this.rangeService.setCellRanges(this.getCellRanges());
    }
    if (!silent) {
      this.raiseChartModelUpdateEvent();
    }
  }
  detachChartRange() {
    this.model.unlinked = !this.model.unlinked;
    if (this.model.unlinked) {
      if (this.rangeService) {
        this.rangeService.setCellRanges([]);
      }
    } else {
      this.updateForGridChange();
    }
    this.dispatchEvent({ type: _ChartController.EVENT_CHART_LINKED_CHANGED });
  }
  setChartProxy(chartProxy) {
    this.chartProxy = chartProxy;
  }
  getChartProxy() {
    return this.chartProxy;
  }
  isActiveXYChart() {
    return import_core8._.includes(["scatter", "bubble"], this.getChartType());
  }
  isChartLinked() {
    return !this.model.unlinked;
  }
  customComboExists() {
    const savedCustomSeriesChartTypes = this.model.comboChartModel.savedCustomSeriesChartTypes;
    return savedCustomSeriesChartTypes && savedCustomSeriesChartTypes.length > 0;
  }
  getSeriesChartTypes() {
    return this.model.comboChartModel.seriesChartTypes;
  }
  isComboChart(chartType) {
    return this.model.isComboChart(chartType);
  }
  updateSeriesChartType(colId, chartType, secondaryAxis) {
    const seriesChartType = this.model.comboChartModel.seriesChartTypes.find((s) => s.colId === colId);
    if (seriesChartType) {
      const updateChartType = this.model.chartType !== "customCombo";
      if (updateChartType) {
        this.model.chartType = "customCombo";
      }
      const prevSeriesChartType = seriesChartType.chartType;
      if (chartType != null) {
        seriesChartType.chartType = chartType;
      }
      if (secondaryAxis != null) {
        seriesChartType.secondaryAxis = secondaryAxis;
      }
      this.model.comboChartModel.savedCustomSeriesChartTypes = this.model.comboChartModel.seriesChartTypes;
      this.model.comboChartModel.updateSeriesChartTypes();
      this.updateForDataChange();
      if (updateChartType) {
        this.dispatchEvent({
          type: _ChartController.EVENT_CHART_TYPE_CHANGED
        });
      }
      if (prevSeriesChartType !== chartType) {
        this.dispatchEvent({
          type: _ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED
        });
      }
      this.raiseChartOptionsChangedEvent();
    }
  }
  getActiveSeriesChartTypes() {
    const selectedColIds = this.getSelectedValueColState().map((c) => c.colId);
    return this.getSeriesChartTypes().filter((s) => selectedColIds.includes(s.colId));
  }
  getChartSeriesTypes(chartType) {
    const targetChartType = chartType != null ? chartType : this.getChartType();
    return this.isComboChart(targetChartType) ? ["line", "bar", "area"] : [getSeriesType(targetChartType)];
  }
  getChartSeriesType() {
    const seriesChartTypes = this.getSeriesChartTypes();
    if (seriesChartTypes.length === 0) {
      return "bar";
    }
    const ct = seriesChartTypes[0].chartType;
    if (ct === "columnLineCombo") {
      return "bar";
    }
    if (ct === "areaColumnCombo") {
      return "area";
    }
    return getSeriesType(ct);
  }
  getCellRanges() {
    return [this.model.dimensionCellRange, this.model.valueCellRange].filter((r) => r);
  }
  createCellRange(params) {
    var _a;
    return params.cellRange && ((_a = this.rangeService) == null ? void 0 : _a.createPartialCellRangeFromRangeParams(params.cellRange, true));
  }
  validUpdateType(params) {
    var _a;
    if (!params.type) {
      console.warn(`AG Grid - Unable to update chart as the 'type' is missing. It must be either 'rangeChartUpdate', 'pivotChartUpdate', or 'crossFilterChartUpdate'.`);
      return false;
    }
    const chartTypeMap = {
      "Range Chart": () => !this.isPivotChart() && !this.isCrossFilterChart(),
      "Pivot Chart": () => this.isPivotChart(),
      "Cross Filter Chart": () => this.isCrossFilterChart()
    };
    const currentChartType = (_a = Object.keys(chartTypeMap).find((type) => chartTypeMap[type]())) != null ? _a : "Range Chart";
    const valid = params.type === `${currentChartType[0].toLowerCase()}${currentChartType.slice(1).replace(/ /g, "")}Update`;
    if (!valid) {
      console.warn(`AG Grid - Unable to update chart as a '${params.type}' update type is not permitted on a ${currentChartType}.`);
    }
    return valid;
  }
  getCellRangeParams() {
    const cellRanges = this.getCellRanges();
    const firstCellRange = cellRanges[0];
    const startRow = firstCellRange && firstCellRange.startRow || null;
    const endRow = firstCellRange && firstCellRange.endRow || null;
    return {
      rowStartIndex: startRow && startRow.rowIndex,
      rowStartPinned: startRow && startRow.rowPinned,
      rowEndIndex: endRow && endRow.rowIndex,
      rowEndPinned: endRow && endRow.rowPinned,
      columns: cellRanges.reduce((columns, value) => columns.concat(value.columns.map((c) => c.getId())), [])
    };
  }
  setCategoryAxisType(categoryAxisType) {
    this.model.categoryAxisType = categoryAxisType;
    this.raiseChartModelUpdateEvent();
  }
  getSeriesGroupType() {
    var _a;
    return (_a = this.model.seriesGroupType) != null ? _a : this.chartProxy.getSeriesGroupType();
  }
  setSeriesGroupType(seriesGroupType) {
    this.model.seriesGroupType = seriesGroupType;
    this.raiseChartModelUpdateEvent();
  }
  raiseChartModelUpdateEvent() {
    const event = {
      type: _ChartController.EVENT_CHART_MODEL_UPDATE
    };
    this.dispatchEvent(event);
  }
  raiseChartUpdatedEvent() {
    const event = {
      type: _ChartController.EVENT_CHART_UPDATED
    };
    this.dispatchEvent(event);
  }
  raiseChartApiUpdateEvent() {
    const event = {
      type: _ChartController.EVENT_CHART_API_UPDATE
    };
    this.dispatchEvent(event);
  }
  raiseChartOptionsChangedEvent() {
    const { chartId, chartType } = this.getChartModel();
    const event = {
      type: import_core8.Events.EVENT_CHART_OPTIONS_CHANGED,
      chartId,
      chartType,
      chartThemeName: this.getChartThemeName(),
      chartOptions: this.chartProxy.getChartThemeOverrides()
    };
    this.eventService.dispatchEvent(event);
  }
  raiseChartRangeSelectionChangedEvent() {
    const event = {
      type: import_core8.Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
      id: this.model.chartId,
      chartId: this.model.chartId,
      cellRange: this.getCellRangeParams()
    };
    this.eventService.dispatchEvent(event);
  }
  destroy() {
    super.destroy();
    if (this.rangeService) {
      this.rangeService.setCellRanges([]);
    }
  }
};
_ChartController.EVENT_CHART_UPDATED = "chartUpdated";
_ChartController.EVENT_CHART_API_UPDATE = "chartApiUpdate";
_ChartController.EVENT_CHART_MODEL_UPDATE = "chartModelUpdate";
_ChartController.EVENT_CHART_TYPE_CHANGED = "chartTypeChanged";
_ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED = "chartSeriesChartTypeChanged";
_ChartController.EVENT_CHART_LINKED_CHANGED = "chartLinkedChanged";
__decorateClass([
  (0, import_core8.Autowired)("rangeService")
], _ChartController.prototype, "rangeService", 2);
__decorateClass([
  import_core8.PostConstruct
], _ChartController.prototype, "init", 1);
var ChartController = _ChartController;

// enterprise-modules/charts/src/charts/chartComp/menu/data/categoriesDataPanel.ts
var import_core11 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/data/dragDataPanel.ts
var import_core10 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/widgets/agPillSelect.ts
var import_core9 = require("@ag-grid-community/core");
var _AgPillSelect = class _AgPillSelect extends import_core9.Component {
  constructor(config) {
    super(_AgPillSelect.TEMPLATE);
    this.config = config != null ? config : {};
    const { selectedValueList, valueFormatter, valueList } = this.config;
    this.selectedValues = selectedValueList != null ? selectedValueList : [];
    this.valueList = valueList != null ? valueList : [];
    this.valueFormatter = valueFormatter != null ? valueFormatter : (value) => import_core9._.escapeString(value);
  }
  init() {
    const { ariaLabel, onValuesChange, dragSourceId } = this.config;
    this.dropZonePanel = this.createManagedBean(new PillSelectDropZonePanel(
      {
        getValues: () => this.selectedValues,
        setValues: (values) => this.updateValues(values),
        isDraggable: () => this.selectedValues.length > 1
      },
      (value) => this.valueFormatter(value),
      ariaLabel,
      dragSourceId
    ));
    const eGui = this.getGui();
    eGui.appendChild(this.dropZonePanel.getGui());
    this.initSelect();
    if (onValuesChange != null) {
      this.onValuesChange = onValuesChange;
    }
  }
  setValues(valueList, selectedValues) {
    const { added, removed, updated } = this.getChanges(this.valueList, valueList);
    let refreshSelect = false;
    if (added.length || removed.length || updated.length) {
      refreshSelect = true;
    }
    this.valueList = valueList;
    this.updateValues(selectedValues, refreshSelect, true);
    return this;
  }
  setValueFormatter(valueFormatter) {
    this.valueFormatter = valueFormatter;
    return this;
  }
  initSelect() {
    const options = this.createSelectOptions();
    if (!options.length) {
      return false;
    }
    const { selectPlaceholder: placeholder } = this.config;
    this.eSelect = this.createBean(new import_core9.AgSelect({
      options,
      placeholder,
      onValueChange: (value) => this.addValue(value),
      pickerIcon: "chartsMenuAdd"
    }));
    this.getGui().appendChild(this.eSelect.getGui());
    return true;
  }
  createSelectOptions() {
    let options = [];
    const { maxSelection } = this.config;
    if (maxSelection && this.selectedValues.length >= maxSelection) {
      return options;
    }
    this.valueList.forEach((value) => {
      if (!this.selectedValues.includes(value)) {
        options.push({ value, text: this.valueFormatter(value) });
      }
    });
    return options;
  }
  addValue(value) {
    this.dropZonePanel.addItem(value);
  }
  updateValues(values, forceRefreshSelect, silent) {
    var _a, _b, _c, _d, _e;
    const previousSelectedValues = this.selectedValues;
    this.selectedValues = values;
    const changes = this.getChanges(previousSelectedValues, values);
    const refreshSelect = forceRefreshSelect || changes.added.length || changes.removed.length;
    const activeElement = this.gos.getActiveDomElement();
    const selectHasFocus = (_a = this.eSelect) == null ? void 0 : _a.getGui().contains(activeElement);
    const dropZoneHasFocus = (_b = this.dropZonePanel) == null ? void 0 : _b.getGui().contains(activeElement);
    if (!silent) {
      (_c = this.onValuesChange) == null ? void 0 : _c.call(this, changes);
    }
    const emptyRefreshedSelect = refreshSelect ? !this.refreshSelect() : false;
    this.dropZonePanel.refreshGui();
    if (refreshSelect && selectHasFocus) {
      if (emptyRefreshedSelect) {
        this.dropZonePanel.focusList(true);
      } else {
        (_d = this.eSelect) == null ? void 0 : _d.getFocusableElement().focus();
      }
    }
    if (dropZoneHasFocus && !values.length) {
      (_e = this.eSelect) == null ? void 0 : _e.getFocusableElement().focus();
    }
  }
  getChanges(previousSelectedValues, newSelectedValues) {
    const added = newSelectedValues.filter((value) => !previousSelectedValues.includes(value));
    const removed = previousSelectedValues.filter((value) => !newSelectedValues.includes(value));
    const updated = newSelectedValues.filter((value, index) => previousSelectedValues[index] !== value);
    return { added, removed, updated, selected: newSelectedValues };
  }
  refreshSelect() {
    if (!this.eSelect) {
      return this.initSelect();
    }
    const options = this.createSelectOptions();
    if (!options.length) {
      import_core9._.removeFromParent(this.eSelect.getGui());
      this.eSelect = this.destroyBean(this.eSelect);
      return false;
    }
    this.eSelect.clearOptions().addOptions(options).setValue(void 0, true);
    return true;
  }
  destroy() {
    this.destroyBean(this.eSelect);
    super.destroy();
  }
};
_AgPillSelect.TEMPLATE = /* html */
`<div class="ag-pill-select" role="presentation"></div>`;
__decorateClass([
  import_core9.PostConstruct
], _AgPillSelect.prototype, "init", 1);
var AgPillSelect = _AgPillSelect;
var PillSelectDragComp = class extends import_core9.PillDragComp {
  constructor(value, dragSourceDropTarget, ghost, valueFormatter, draggable, sourceId) {
    super(dragSourceDropTarget, ghost, false);
    this.value = value;
    this.valueFormatter = valueFormatter;
    this.draggable = draggable;
    this.sourceId = sourceId;
  }
  getItem() {
    return this.value;
  }
  getDisplayName() {
    return this.valueFormatter(this.value);
  }
  getAriaDisplayName() {
    return this.getDisplayName();
  }
  getTooltip() {
    return void 0;
  }
  createGetDragItem() {
    return () => ({
      value: this.value
    });
  }
  getDragSourceType() {
    return import_core9.DragSourceType.ChartPanel;
  }
  getDragSourceId() {
    return this.sourceId;
  }
  isDraggable() {
    return this.draggable;
  }
};
var PillSelectDropZonePanel = class extends import_core9.PillDropZonePanel {
  constructor(model, valueFormatter, ariaLabel, sourceId) {
    super(false);
    this.model = model;
    this.valueFormatter = valueFormatter;
    this.ariaLabel = ariaLabel;
    this.sourceId = sourceId;
  }
  postConstruct() {
    super.init();
  }
  isItemDroppable(item, draggingEvent) {
    return this.isSourceEventFromTarget(draggingEvent) || this.sourceId != null && this.sourceId === draggingEvent.dragSource.sourceId;
  }
  updateItems(items) {
    this.model.setValues(items);
  }
  getExistingItems() {
    return this.model.getValues();
  }
  getIconName() {
    return this.isPotentialDndItems() ? import_core9.DragAndDropService.ICON_MOVE : import_core9.DragAndDropService.ICON_NOT_ALLOWED;
  }
  getAriaLabel() {
    return this.ariaLabel;
  }
  createPillComponent(item, dropTarget, ghost) {
    return new PillSelectDragComp(item, dropTarget, ghost, this.valueFormatter, this.model.isDraggable(), this.sourceId);
  }
  getItems(dragItem) {
    return [dragItem.value];
  }
  isInterestedIn(type) {
    return type === import_core9.DragSourceType.ChartPanel;
  }
};
__decorateClass([
  import_core9.PostConstruct
], PillSelectDropZonePanel.prototype, "postConstruct", 1);

// enterprise-modules/charts/src/charts/chartComp/menu/data/dragDataPanel.ts
var DragDataPanel = class extends import_core10.Component {
  constructor(chartController, autoScrollService, allowMultipleSelection, maxSelection, template) {
    super(template);
    this.chartController = chartController;
    this.autoScrollService = autoScrollService;
    this.allowMultipleSelection = allowMultipleSelection;
    this.maxSelection = maxSelection;
    this.columnComps = /* @__PURE__ */ new Map();
  }
  refreshColumnComps(cols) {
    if (!import_core10._.areEqual(import_core10._.keys(this.columnComps), cols.map(({ colId }) => colId))) {
      return false;
    }
    cols.forEach((col) => {
      this.columnComps.get(col.colId).setValue(col.selected, true);
    });
    return true;
  }
  createGroup(columns, valueFormatter, selectLabelKey, dragSourceId, skipAnimation) {
    if (this.allowMultipleSelection) {
      const selectedValueList = columns.filter((col) => col.selected);
      this.valuePillSelect = this.groupComp.createManagedBean(new AgPillSelect({
        valueList: columns,
        selectedValueList,
        valueFormatter,
        selectPlaceholder: this.chartTranslationService.translate(selectLabelKey),
        dragSourceId,
        onValuesChange: (params) => this.onValueChange(params),
        maxSelection: this.maxSelection
      }));
      this.groupComp.addItem(this.valuePillSelect);
    } else {
      const params = this.createValueSelectParams(columns);
      params.onValueChange = (updatedColState) => {
        columns.forEach((col) => {
          col.selected = false;
        });
        updatedColState.selected = true;
        if (updatedColState.colId === ChartDataModel.DEFAULT_CATEGORY) {
          this.chartController.setAggFunc(void 0, true);
        }
        this.chartController.updateForPanelChange({ updatedColState, skipAnimation: skipAnimation == null ? void 0 : skipAnimation() });
      };
      this.valueSelect = this.groupComp.createManagedBean(new import_core10.AgSelect(params));
      this.groupComp.addItem(this.valueSelect);
    }
  }
  refreshValueSelect(columns) {
    if (!this.valueSelect) {
      return;
    }
    const { options, value } = this.createValueSelectParams(columns);
    this.valueSelect.clearOptions().addOptions(options).setValue(value, true);
  }
  createValueSelectParams(columns) {
    let selectedValue;
    const options = columns.map((value) => {
      var _a;
      const text = (_a = value.displayName) != null ? _a : "";
      if (value.selected) {
        selectedValue = value;
      }
      return {
        value,
        text
      };
    });
    return {
      options,
      value: selectedValue
    };
  }
  onDragging(draggingEvent) {
    const itemHovered = this.checkHoveredItem(draggingEvent);
    if (!itemHovered) {
      return;
    }
    this.lastDraggedColumn = draggingEvent.dragItem.columns[0];
    const { comp, position } = itemHovered;
    const { comp: lastHoveredComp, position: lastHoveredPosition } = this.lastHoveredItem || {};
    if (comp === lastHoveredComp && position === lastHoveredPosition) {
      return;
    }
    this.autoScrollService.check(draggingEvent.event);
    this.clearHoveredItems();
    this.lastHoveredItem = { comp, position };
    const eGui = comp.getGui();
    eGui.classList.add("ag-list-item-hovered", `ag-item-highlight-${position}`);
  }
  checkHoveredItem(draggingEvent) {
    if (import_core10._.missing(draggingEvent.vDirection)) {
      return null;
    }
    const mouseEvent = draggingEvent.event;
    for (const comp of this.columnComps.values()) {
      const eGui = comp.getGui();
      if (!eGui.querySelector(".ag-chart-data-column-drag-handle")) {
        continue;
      }
      const rect = eGui.getBoundingClientRect();
      const isOverComp = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;
      if (isOverComp) {
        const height = eGui.clientHeight;
        const position = mouseEvent.clientY > rect.top + height / 2 ? "bottom" : "top";
        return { comp, position };
      }
    }
    return null;
  }
  onDragLeave() {
    this.clearHoveredItems();
  }
  onDragStop() {
    if (this.lastHoveredItem) {
      const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
      const draggedColumnState = [...dimensionCols, ...valueCols].find((state) => state.column === this.lastDraggedColumn);
      if (draggedColumnState) {
        let targetIndex = Array.from(this.columnComps.values()).indexOf(this.lastHoveredItem.comp);
        if (this.lastHoveredItem.position === "bottom") {
          targetIndex++;
        }
        draggedColumnState.order = targetIndex;
        this.chartController.updateForPanelChange({ updatedColState: draggedColumnState });
      }
    }
    this.clearHoveredItems();
    this.lastDraggedColumn = void 0;
    this.autoScrollService.ensureCleared();
  }
  clearHoveredItems() {
    this.columnComps.forEach((columnComp) => {
      columnComp.getGui().classList.remove(
        "ag-list-item-hovered",
        "ag-item-highlight-top",
        "ag-item-highlight-bottom"
      );
    });
    this.lastHoveredItem = void 0;
  }
  addDragHandle(comp, col) {
    const eDragHandle = import_core10._.createIconNoSpan("columnDrag", this.gos);
    eDragHandle.classList.add("ag-drag-handle", "ag-chart-data-column-drag-handle");
    comp.getGui().insertAdjacentElement("beforeend", eDragHandle);
    const dragSource = {
      type: import_core10.DragSourceType.ChartPanel,
      eElement: eDragHandle,
      dragItemName: col.displayName,
      getDragItem: () => ({ columns: [col.column] }),
      onDragStopped: () => this.onDragStop()
    };
    this.dragAndDropService.addDragSource(dragSource, true);
    this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
  }
  addChangeListener(component, updatedColState) {
    this.addManagedListener(component, import_core10.Events.EVENT_FIELD_VALUE_CHANGED, () => {
      updatedColState.selected = component.getValue();
      this.chartController.updateForPanelChange({ updatedColState });
    });
  }
  isInterestedIn(type) {
    return type === import_core10.DragSourceType.ChartPanel;
  }
  onValueChange({ added, updated, removed, selected }) {
    let updatedColState;
    let resetOrder;
    const updateOrder = () => {
      selected.forEach((col, index) => {
        col.order = index;
      });
      resetOrder = true;
    };
    if (added.length) {
      updatedColState = added[0];
      updatedColState.selected = true;
      updateOrder();
    } else if (removed.length) {
      updatedColState = removed[0];
      updatedColState.selected = false;
    } else if (updated.length) {
      updateOrder();
      updatedColState = updated[0];
    }
    if (updatedColState) {
      this.chartController.updateForPanelChange({ updatedColState, resetOrder });
    }
  }
  destroy() {
    this.valuePillSelect = void 0;
    this.valueSelect = void 0;
    super.destroy();
  }
};
__decorateClass([
  (0, import_core10.Autowired)("dragAndDropService")
], DragDataPanel.prototype, "dragAndDropService", 2);
__decorateClass([
  (0, import_core10.Autowired)("chartTranslationService")
], DragDataPanel.prototype, "chartTranslationService", 2);

// enterprise-modules/charts/src/charts/chartComp/menu/data/categoriesDataPanel.ts
var DEFAULT_AGG_FUNC = "sum";
var _CategoriesDataPanel = class _CategoriesDataPanel extends DragDataPanel {
  constructor(chartController, autoScrollService, title, allowMultipleSelection, dimensionCols, isOpen) {
    const maxSelection = void 0;
    super(chartController, autoScrollService, allowMultipleSelection, maxSelection, _CategoriesDataPanel.TEMPLATE);
    this.title = title;
    this.dimensionCols = dimensionCols;
    this.isOpen = isOpen;
  }
  init() {
    this.groupComp = this.createBean(new import_core11.AgGroupComponent({
      title: this.title,
      enabled: true,
      suppressEnabledCheckbox: true,
      suppressOpenCloseIcons: false,
      cssIdentifier: "charts-data",
      expanded: this.isOpen
    }));
    if (this.chartMenuService.isLegacyFormat()) {
      this.createLegacyCategoriesGroup(this.dimensionCols);
      this.clearAggFuncControls();
    } else {
      this.createCategoriesGroup(this.dimensionCols);
      this.createAggFuncControls(this.dimensionCols);
    }
    this.getGui().appendChild(this.groupComp.getGui());
  }
  refresh(dimensionCols) {
    var _a;
    if (this.chartMenuService.isLegacyFormat()) {
      if (!this.refreshColumnComps(dimensionCols)) {
        this.recreate(dimensionCols);
      }
    } else {
      (_a = this.valuePillSelect) == null ? void 0 : _a.setValues(dimensionCols, dimensionCols.filter((col) => col.selected));
      this.refreshValueSelect(dimensionCols);
      this.refreshAggFuncControls(dimensionCols, this.chartController.getAggFunc());
    }
  }
  recreate(dimensionCols) {
    this.isOpen = this.groupComp.isExpanded();
    import_core11._.clearElement(this.getGui());
    this.destroyBean(this.groupComp);
    this.dimensionCols = dimensionCols;
    this.init();
  }
  createCategoriesGroup(columns) {
    this.createGroup(columns, (col) => {
      var _a;
      return (_a = col.displayName) != null ? _a : "";
    }, "categoryAdd", "categorySelect", () => !this.chartController.getAggFunc());
  }
  createLegacyCategoriesGroup(columns) {
    const inputName = `chartDimension${this.groupComp.getCompId()}`;
    const supportsMultipleCategoryColumns = this.allowMultipleSelection;
    columns.forEach((col) => {
      var _a;
      const params = {
        label: (_a = col.displayName) != null ? _a : "",
        value: col.selected,
        inputName
      };
      const comp = this.groupComp.createManagedBean(
        supportsMultipleCategoryColumns ? (() => {
          const checkboxComp = new import_core11.AgCheckbox(params);
          checkboxComp.addCssClass("ag-data-select-checkbox");
          return checkboxComp;
        })() : new import_core11.AgRadioButton(params)
      );
      this.addChangeListener(comp, col);
      this.groupComp.addItem(comp);
      this.columnComps.set(col.colId, comp);
      if (supportsMultipleCategoryColumns)
        this.addDragHandle(comp, col);
    });
    if (supportsMultipleCategoryColumns) {
      const categoriesGroupGui = this.groupComp.getGui();
      const dropTarget = {
        getIconName: () => import_core11.DragAndDropService.ICON_MOVE,
        getContainer: () => categoriesGroupGui,
        onDragging: (params) => this.onDragging(params),
        onDragLeave: () => this.onDragLeave(),
        isInterestedIn: this.isInterestedIn.bind(this),
        targetContainsSource: true
      };
      this.dragAndDropService.addDropTarget(dropTarget);
      this.addDestroyFunc(() => this.dragAndDropService.removeDropTarget(dropTarget));
    }
  }
  createAggFuncControls(dimensionCols) {
    const aggFunc = this.chartController.getAggFunc();
    this.groupComp.addItem(this.aggFuncToggle = this.createBean(new import_core11.AgToggleButton({
      label: this.chartTranslationService.translate("aggregate"),
      labelAlignment: "left",
      labelWidth: "flex",
      inputWidth: "flex",
      value: aggFunc != void 0,
      onValueChange: (value) => {
        var _a, _b;
        const aggFunc2 = value ? DEFAULT_AGG_FUNC : void 0;
        this.chartController.setAggFunc(aggFunc2);
        (_a = this.aggFuncSelect) == null ? void 0 : _a.setValue(aggFunc2, true);
        (_b = this.aggFuncSelect) == null ? void 0 : _b.setDisplayed(aggFunc2 != void 0);
      }
    })));
    this.groupComp.addItem(this.aggFuncSelect = this.createBean(new import_core11.AgSelect({
      options: [
        { value: "sum", text: this.chartTranslationService.translate("sum") },
        { value: "first", text: this.chartTranslationService.translate("first") },
        { value: "last", text: this.chartTranslationService.translate("last") },
        { value: "min", text: this.chartTranslationService.translate("min") },
        { value: "max", text: this.chartTranslationService.translate("max") },
        { value: "count", text: this.chartTranslationService.translate("count") },
        { value: "avg", text: this.chartTranslationService.translate("avg") }
      ],
      value: typeof aggFunc === "string" ? aggFunc : void 0,
      onValueChange: (value) => {
        this.chartController.setAggFunc(value);
      }
    })));
    this.refreshAggFuncControls(dimensionCols, aggFunc);
  }
  refreshAggFuncControls(dimensionCols, aggFunc) {
    var _a, _b, _c, _d;
    const selectedDimensions = dimensionCols.filter((col) => col.selected);
    const supportsAggregation = selectedDimensions.some((col) => col.colId !== ChartDataModel.DEFAULT_CATEGORY);
    (_a = this.aggFuncToggle) == null ? void 0 : _a.setValue(aggFunc != void 0);
    (_b = this.aggFuncSelect) == null ? void 0 : _b.setValue(typeof aggFunc === "string" ? aggFunc : void 0, true);
    (_c = this.aggFuncToggle) == null ? void 0 : _c.setDisplayed(supportsAggregation);
    (_d = this.aggFuncSelect) == null ? void 0 : _d.setDisplayed(supportsAggregation && aggFunc != void 0);
  }
  clearAggFuncControls() {
    this.aggFuncToggle = this.aggFuncToggle && this.destroyBean(this.aggFuncToggle);
    this.aggFuncSelect = this.aggFuncSelect && this.destroyBean(this.aggFuncSelect);
  }
  destroy() {
    this.clearAggFuncControls();
    this.groupComp = this.destroyBean(this.groupComp);
    super.destroy();
  }
};
_CategoriesDataPanel.TEMPLATE = /* html */
`<div id="categoriesGroup"></div>`;
__decorateClass([
  (0, import_core11.Autowired)("chartMenuService")
], _CategoriesDataPanel.prototype, "chartMenuService", 2);
__decorateClass([
  import_core11.PostConstruct
], _CategoriesDataPanel.prototype, "init", 1);
var CategoriesDataPanel = _CategoriesDataPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/data/seriesDataPanel.ts
var import_core12 = require("@ag-grid-community/core");
var _SeriesDataPanel = class _SeriesDataPanel extends DragDataPanel {
  constructor(chartController, autoScrollService, chartOptionsService, title, allowMultipleSelect, maxSelection, valueCols, isOpen) {
    super(chartController, autoScrollService, allowMultipleSelect, maxSelection, _SeriesDataPanel.TEMPLATE);
    this.chartOptionsService = chartOptionsService;
    this.title = title;
    this.valueCols = valueCols;
    this.isOpen = isOpen;
  }
  init() {
    this.groupComp = this.createBean(new import_core12.AgGroupComponent({
      title: this.title,
      enabled: true,
      suppressEnabledCheckbox: true,
      suppressOpenCloseIcons: false,
      cssIdentifier: "charts-data",
      expanded: this.isOpen
    }));
    if (this.chartController.isActiveXYChart()) {
      const pairedModeToggle = this.groupComp.createManagedBean(new import_core12.AgToggleButton({
        label: this.chartTranslationService.translate("paired"),
        labelAlignment: "left",
        labelWidth: "flex",
        inputWidth: "flex",
        value: this.chartOptionsService.getPairedMode(),
        onValueChange: (newValue) => {
          this.chartOptionsService.setPairedMode(!!newValue);
          this.chartController.updateForGridChange({ maintainColState: true });
        }
      }));
      this.groupComp.addItem(pairedModeToggle);
    }
    if (this.chartMenuService.isLegacyFormat()) {
      this.createLegacySeriesGroup(this.valueCols);
    } else {
      this.createSeriesGroup(this.valueCols);
    }
    this.getGui().appendChild(this.groupComp.getGui());
  }
  refresh(valueCols) {
    var _a, _b;
    if (this.chartMenuService.isLegacyFormat()) {
      const canRefresh = this.refreshColumnComps(valueCols);
      if (canRefresh) {
        if (this.chartController.isActiveXYChart()) {
          const getSeriesLabel = this.generateGetSeriesLabel(valueCols);
          valueCols.forEach((col) => {
            this.columnComps.get(col.colId).setLabel(getSeriesLabel(col));
          });
        }
      } else {
        this.recreate(valueCols);
      }
    } else {
      (_a = this.valuePillSelect) == null ? void 0 : _a.setValueFormatter(this.generateGetSeriesLabel(valueCols));
      (_b = this.valuePillSelect) == null ? void 0 : _b.setValues(valueCols, valueCols.filter((col) => col.selected));
      this.refreshValueSelect(valueCols);
    }
  }
  recreate(valueCols) {
    this.isOpen = this.groupComp.isExpanded();
    import_core12._.clearElement(this.getGui());
    this.destroyBean(this.groupComp);
    this.valueCols = valueCols;
    this.init();
  }
  createSeriesGroup(columns) {
    this.createGroup(columns, this.generateGetSeriesLabel(columns), "seriesAdd", "seriesSelect");
  }
  createLegacySeriesGroup(columns) {
    const getSeriesLabel = this.generateGetSeriesLabel(columns);
    columns.forEach((col) => {
      const label = getSeriesLabel(col);
      const comp = this.groupComp.createManagedBean(new import_core12.AgCheckbox({
        label,
        value: col.selected
      }));
      comp.addCssClass("ag-data-select-checkbox");
      this.addChangeListener(comp, col);
      this.groupComp.addItem(comp);
      this.columnComps.set(col.colId, comp);
      this.addDragHandle(comp, col);
    });
    const seriesGroupGui = this.groupComp.getGui();
    const dropTarget = {
      getIconName: () => import_core12.DragAndDropService.ICON_MOVE,
      getContainer: () => seriesGroupGui,
      onDragging: (params) => this.onDragging(params),
      onDragLeave: () => this.onDragLeave(),
      isInterestedIn: this.isInterestedIn.bind(this),
      targetContainsSource: true
    };
    this.dragAndDropService.addDropTarget(dropTarget);
    this.addDestroyFunc(() => this.dragAndDropService.removeDropTarget(dropTarget));
  }
  generateGetSeriesLabel(valueCols) {
    if (!this.chartController.isActiveXYChart()) {
      return (col) => {
        var _a;
        return (_a = col.displayName) != null ? _a : "";
      };
    }
    const selectedCols = valueCols.filter((col) => col.selected);
    const isBubble = this.chartController.getChartType() === "bubble";
    const isInPairedMode = this.chartOptionsService.getPairedMode();
    const indexToAxisLabel = /* @__PURE__ */ new Map();
    indexToAxisLabel.set(0, "X");
    indexToAxisLabel.set(1, "Y");
    indexToAxisLabel.set(2, "size");
    return (col) => {
      var _a;
      const escapedLabel = (_a = col.displayName) != null ? _a : "";
      if (!col.selected) {
        return escapedLabel;
      }
      const index = selectedCols.indexOf(col);
      if (index === -1) {
        return escapedLabel;
      }
      let axisLabel;
      if (isInPairedMode) {
        axisLabel = indexToAxisLabel.get(index % (isBubble ? 3 : 2));
      } else {
        if (index === 0) {
          axisLabel = "X";
        } else {
          axisLabel = isBubble && index % 2 === 0 ? "size" : "Y";
        }
      }
      return `${escapedLabel} (${axisLabel})`;
    };
  }
  destroy() {
    this.groupComp = this.destroyBean(this.groupComp);
    super.destroy();
  }
};
_SeriesDataPanel.TEMPLATE = /* html */
`<div id="seriesGroup"></div>`;
__decorateClass([
  (0, import_core12.Autowired)("chartMenuService")
], _SeriesDataPanel.prototype, "chartMenuService", 2);
__decorateClass([
  import_core12.PostConstruct
], _SeriesDataPanel.prototype, "init", 1);
var SeriesDataPanel = _SeriesDataPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/data/seriesChartTypePanel.ts
var import_core13 = require("@ag-grid-community/core");
var _SeriesChartTypePanel = class _SeriesChartTypePanel extends import_core13.Component {
  constructor(chartController, columns, isOpen) {
    super(_SeriesChartTypePanel.TEMPLATE);
    this.chartController = chartController;
    this.columns = columns;
    this.isOpen = isOpen;
    this.selectedColIds = [];
    this.chartTypeComps = /* @__PURE__ */ new Map();
    this.secondaryAxisComps = /* @__PURE__ */ new Map();
  }
  init() {
    this.createSeriesChartTypeGroup(this.columns);
  }
  refresh(columns) {
    if (!import_core13._.areEqual(this.getValidColIds(columns), this.selectedColIds)) {
      this.recreate(columns);
    } else {
      this.refreshComps();
    }
  }
  recreate(columns) {
    this.isOpen = this.seriesChartTypeGroupComp.isExpanded();
    import_core13._.clearElement(this.getGui());
    this.destroyBean(this.seriesChartTypeGroupComp);
    this.columns = columns;
    this.selectedColIds = [];
    this.clearComps();
    this.init();
  }
  getValidColIds(columns) {
    const seriesChartTypes = this.chartController.getSeriesChartTypes();
    return columns.filter((col) => col.selected && !!seriesChartTypes.filter((s) => s.colId === col.colId)[0]).map(({ colId }) => colId);
  }
  createSeriesChartTypeGroup(columns) {
    this.seriesChartTypeGroupComp = this.createBean(new import_core13.AgGroupComponent({
      title: this.chartTranslationService.translate("seriesChartType"),
      enabled: true,
      suppressEnabledCheckbox: true,
      suppressOpenCloseIcons: false,
      cssIdentifier: "charts-data",
      expanded: this.isOpen
    }));
    const seriesChartTypes = this.chartController.getSeriesChartTypes();
    columns.forEach((col) => {
      if (!col.selected) {
        return;
      }
      const seriesChartType = seriesChartTypes.filter((s) => s.colId === col.colId)[0];
      if (!seriesChartType) {
        return;
      }
      this.selectedColIds.push(col.colId);
      const seriesItemGroup = this.seriesChartTypeGroupComp.createManagedBean(new import_core13.AgGroupComponent({
        title: col.displayName,
        enabled: true,
        suppressEnabledCheckbox: true,
        suppressOpenCloseIcons: true,
        cssIdentifier: "charts-format-sub-level"
      }));
      const isSecondaryAxisDisabled = (chartType) => ["groupedColumn", "stackedColumn", "stackedArea"].includes(chartType);
      const secondaryAxisComp = this.seriesChartTypeGroupComp.createManagedBean(new import_core13.AgCheckbox({
        label: this.chartTranslationService.translate("secondaryAxis"),
        labelWidth: "flex",
        disabled: isSecondaryAxisDisabled(seriesChartType.chartType),
        value: !!seriesChartType.secondaryAxis,
        onValueChange: (enabled) => this.chartController.updateSeriesChartType(col.colId, void 0, enabled)
      }));
      seriesItemGroup.addItem(secondaryAxisComp);
      const translate = (key) => {
        return this.chartTranslationService.translate(key);
      };
      const availableChartTypes = [
        { value: "line", text: translate("line") },
        { value: "area", text: translate("area") },
        { value: "stackedArea", text: translate("stackedArea") },
        { value: "groupedColumn", text: translate("groupedColumn") },
        { value: "stackedColumn", text: translate("stackedColumn") }
      ];
      const chartTypeComp = seriesItemGroup.createManagedBean(new import_core13.AgSelect({
        labelAlignment: "left",
        labelWidth: "flex",
        options: availableChartTypes,
        value: seriesChartType.chartType,
        onValueChange: (chartType) => this.chartController.updateSeriesChartType(col.colId, chartType)
      }));
      seriesItemGroup.addItem(chartTypeComp);
      this.seriesChartTypeGroupComp.addItem(seriesItemGroup);
      this.chartTypeComps.set(col.colId, chartTypeComp);
      this.secondaryAxisComps.set(col.colId, secondaryAxisComp);
    });
    this.getGui().appendChild(this.seriesChartTypeGroupComp.getGui());
  }
  refreshComps() {
    const seriesChartTypes = this.chartController.getSeriesChartTypes();
    this.selectedColIds.forEach((colId) => {
      const seriesChartType = seriesChartTypes.find((chartType) => chartType.colId === colId);
      if (!seriesChartType) {
        return;
      }
      const chartTypeComp = this.chartTypeComps.get(colId);
      const secondaryAxisComp = this.secondaryAxisComps.get(colId);
      chartTypeComp == null ? void 0 : chartTypeComp.setValue(seriesChartType.chartType);
      secondaryAxisComp == null ? void 0 : secondaryAxisComp.setValue(!!seriesChartType.secondaryAxis);
      secondaryAxisComp == null ? void 0 : secondaryAxisComp.setDisabled(this.isSecondaryAxisDisabled(seriesChartType.chartType));
    });
  }
  clearComps() {
    this.chartTypeComps.clear();
    this.secondaryAxisComps.clear();
  }
  isSecondaryAxisDisabled(chartType) {
    return ["groupedColumn", "stackedColumn", "stackedArea"].includes(chartType);
  }
  destroy() {
    this.clearComps();
    this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
    super.destroy();
  }
};
_SeriesChartTypePanel.TEMPLATE = /* html */
`<div id="seriesChartTypeGroup"></div>`;
__decorateClass([
  (0, import_core13.Autowired)("chartTranslationService")
], _SeriesChartTypePanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core13.PostConstruct
], _SeriesChartTypePanel.prototype, "init", 1);
var SeriesChartTypePanel = _SeriesChartTypePanel;

// enterprise-modules/charts/src/charts/chartComp/menu/data/switchCategorySeriesDataPanel.ts
var import_core14 = require("@ag-grid-community/core");
var _SwitchCategorySeriesDataPanel = class _SwitchCategorySeriesDataPanel extends import_core14.Component {
  constructor(getValue, setValue) {
    super();
    this.getValue = getValue;
    this.setValue = setValue;
  }
  init() {
    this.switchCategorySeriesToggleButton = this.createManagedBean(new import_core14.AgToggleButton({
      label: this.chartTranslationService.translate("switchCategorySeries"),
      labelAlignment: "left",
      labelWidth: "flex",
      inputWidth: "flex",
      value: this.getValue(),
      onValueChange: (value) => {
        this.setValue(value);
      }
    }));
    const switchCategorySeriesGroupParams = {
      title: void 0,
      suppressEnabledCheckbox: true,
      suppressOpenCloseIcons: true,
      cssIdentifier: "charts-data",
      expanded: true,
      items: [this.switchCategorySeriesToggleButton]
    };
    this.setTemplate(_SwitchCategorySeriesDataPanel.TEMPLATE, {
      switchCategorySeriesGroup: switchCategorySeriesGroupParams
    });
  }
  refresh() {
    var _a;
    (_a = this.switchCategorySeriesToggleButton) == null ? void 0 : _a.setValue(this.getValue(), true);
  }
};
_SwitchCategorySeriesDataPanel.TEMPLATE = /* html */
`<div>
        <ag-group-component ref="switchCategorySeriesGroup"></ag-group-component>
    </div>`;
__decorateClass([
  (0, import_core14.Autowired)("chartTranslationService")
], _SwitchCategorySeriesDataPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core14.PostConstruct
], _SwitchCategorySeriesDataPanel.prototype, "init", 1);
var SwitchCategorySeriesDataPanel = _SwitchCategorySeriesDataPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/data/chartDataPanel.ts
var DefaultDataPanelDef = {
  groups: [
    { type: "categories", isOpen: true },
    { type: "series", isOpen: true },
    { type: "seriesChartType", isOpen: true }
  ]
};
var _ChartDataPanel = class _ChartDataPanel extends import_core15.Component {
  constructor(chartController, chartOptionsService) {
    super(_ChartDataPanel.TEMPLATE);
    this.chartController = chartController;
    this.chartOptionsService = chartOptionsService;
    this.isSwitchCategorySeriesToggled = false;
  }
  init() {
    this.switchCategorySeriesPanel = this.addComponent(this.createManagedBean(new SwitchCategorySeriesDataPanel(
      () => this.chartController.isCategorySeriesSwitched(),
      (value) => this.chartController.switchCategorySeries(value)
    )));
    this.isSwitchCategorySeriesToggled = this.chartController.isCategorySeriesSwitched();
    this.createAutoScrollService();
    this.updatePanels();
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, this.updatePanels.bind(this));
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.updatePanels.bind(this));
  }
  destroy() {
    this.clearPanelComponents();
    super.destroy();
  }
  updatePanels() {
    var _a, _b, _c, _d, _e;
    const currentChartType = this.chartType;
    const isSwitchCategorySeriesToggledCurrent = this.isSwitchCategorySeriesToggled;
    const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
    this.chartType = this.chartController.getChartType();
    this.isSwitchCategorySeriesToggled = this.chartController.isCategorySeriesSwitched();
    const hasChangedSwitchCategorySeries = this.isSwitchCategorySeriesToggled !== isSwitchCategorySeriesToggledCurrent;
    if (this.canRefresh(currentChartType, this.chartType) && !hasChangedSwitchCategorySeries) {
      (_a = this.categoriesDataPanel) == null ? void 0 : _a.refresh(dimensionCols);
      (_b = this.seriesDataPanel) == null ? void 0 : _b.refresh(valueCols);
      (_c = this.seriesChartTypePanel) == null ? void 0 : _c.refresh(valueCols);
    } else {
      this.recreatePanels(dimensionCols, valueCols);
    }
    (_d = this.switchCategorySeriesPanel) == null ? void 0 : _d.setDisplayed(
      supportsInvertedCategorySeries(this.chartType) && !this.chartMenuService.isLegacyFormat() && !this.chartController.isGrouping()
    );
    if (hasChangedSwitchCategorySeries) {
      (_e = this.switchCategorySeriesPanel) == null ? void 0 : _e.refresh();
    }
  }
  canRefresh(oldChartType, newChartType) {
    if (oldChartType === void 0)
      return false;
    if (oldChartType === newChartType) {
      return true;
    }
    const isCombo = (chartType) => ["columnLineCombo", "areaColumnCombo", "customCombo"].includes(chartType);
    if (isCombo(oldChartType) && isCombo(newChartType)) {
      return true;
    }
    return false;
  }
  recreatePanels(dimensionCols, valueCols) {
    var _a;
    this.clearPanelComponents();
    const { chartType } = this;
    if (!chartType)
      return;
    const isCategorySeriesSwitched = this.chartController.isCategorySeriesSwitched();
    const panels = (_a = this.getDataPanelDef().groups) == null ? void 0 : _a.map(({ type, isOpen }) => {
      if (type === (isCategorySeriesSwitched ? "series" : "categories")) {
        return this.categoriesDataPanel = this.createBean(new CategoriesDataPanel(
          this.chartController,
          this.autoScrollService,
          this.getCategoryGroupTitle(isCategorySeriesSwitched),
          this.getCategoryGroupMultipleSelect(chartType, isCategorySeriesSwitched),
          dimensionCols,
          isOpen
        ));
      } else if (type === (isCategorySeriesSwitched ? "categories" : "series")) {
        return this.seriesDataPanel = this.createBean(new SeriesDataPanel(
          this.chartController,
          this.autoScrollService,
          this.chartOptionsService,
          this.getSeriesGroupTitle(isCategorySeriesSwitched),
          this.getSeriesGroupMultipleSelect(chartType, isCategorySeriesSwitched),
          this.getSeriesGroupMaxSelection(chartType, isCategorySeriesSwitched),
          valueCols,
          isOpen
        ));
      } else if (type === "seriesChartType") {
        if (this.chartController.isComboChart()) {
          return this.seriesChartTypePanel = this.createBean(new SeriesChartTypePanel(
            this.chartController,
            valueCols,
            isOpen
          ));
        }
        return null;
      } else {
        import_core15._.warnOnce(`Invalid charts data panel group name supplied: '${type}'`);
        return null;
      }
    }).filter((value) => value != null);
    if (panels)
      this.addPanelComponents(panels);
  }
  addPanelComponents(panels) {
    var _a;
    const fragment = document.createDocumentFragment();
    for (const panel of panels) {
      this.registerComponent(panel);
      fragment.appendChild(panel.getGui());
    }
    const afterPanelElement = (_a = this.switchCategorySeriesPanel) == null ? void 0 : _a.getGui();
    this.getGui().insertBefore(fragment, afterPanelElement != null ? afterPanelElement : null);
    return panels;
  }
  clearPanelComponents() {
    const eGui = this.getGui();
    if (this.categoriesDataPanel)
      eGui.removeChild(this.categoriesDataPanel.getGui());
    if (this.seriesDataPanel)
      eGui.removeChild(this.seriesDataPanel.getGui());
    if (this.seriesChartTypePanel)
      eGui.removeChild(this.seriesChartTypePanel.getGui());
    this.categoriesDataPanel = this.destroyBean(this.categoriesDataPanel);
    this.seriesDataPanel = this.destroyBean(this.seriesDataPanel);
    this.seriesChartTypePanel = this.destroyBean(this.seriesChartTypePanel);
  }
  createAutoScrollService() {
    const eGui = this.getGui();
    this.autoScrollService = new import_core15.AutoScrollService({
      scrollContainer: eGui,
      scrollAxis: "y",
      getVerticalPosition: () => eGui.scrollTop,
      setVerticalPosition: (position) => eGui.scrollTop = position
    });
  }
  addComponent(component) {
    this.registerComponent(component);
    this.getGui().appendChild(component.getGui());
    return component;
  }
  registerComponent(component) {
    component.addCssClass("ag-chart-data-section");
  }
  getDataPanelDef() {
    var _a, _b;
    return (_b = (_a = this.gos.get("chartToolPanelsDef")) == null ? void 0 : _a.dataPanel) != null ? _b : DefaultDataPanelDef;
  }
  getCategoryGroupTitle(isCategorySeriesSwitched) {
    if (isCategorySeriesSwitched)
      return this.chartTranslationService.translate("seriesLabels");
    return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? "labels" : "categories");
  }
  getCategoryGroupMultipleSelect(chartType, isCategorySeriesSwitched) {
    if (isCategorySeriesSwitched)
      return false;
    return getMaxNumCategories(chartType) !== 1;
  }
  getSeriesGroupTitle(isCategorySeriesSwitched) {
    if (isCategorySeriesSwitched)
      return this.chartTranslationService.translate("categoryValues");
    return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? "xyValues" : "series");
  }
  getSeriesGroupMultipleSelect(chartType, isCategorySeriesSwitched) {
    return this.getSeriesGroupMaxSelection(chartType, isCategorySeriesSwitched) !== 1;
  }
  getSeriesGroupMaxSelection(chartType, isCategorySeriesSwitched) {
    if (isCategorySeriesSwitched)
      return void 0;
    return getMaxNumSeries(chartType);
  }
};
_ChartDataPanel.TEMPLATE = /* html */
`<div class="ag-chart-data-wrapper ag-scrollable-container"></div>`;
__decorateClass([
  (0, import_core15.Autowired)("chartTranslationService")
], _ChartDataPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  (0, import_core15.Autowired)("chartMenuService")
], _ChartDataPanel.prototype, "chartMenuService", 2);
__decorateClass([
  import_core15.PostConstruct
], _ChartDataPanel.prototype, "init", 1);
var ChartDataPanel = _ChartDataPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/formatPanel.ts
var import_core42 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/format/legend/legendPanel.ts
var import_core17 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/format/fontPanel.ts
var import_core16 = require("@ag-grid-community/core");
var _FontPanel = class _FontPanel extends import_core16.Component {
  constructor(params) {
    super();
    this.activeComps = [];
    this.params = params;
    this.chartOptions = params.chartMenuUtils.getChartOptions();
  }
  init() {
    const fontGroupParams = {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      suppressOpenCloseIcons: true,
      title: this.params.name || this.chartTranslationService.translate("font"),
      enabled: this.params.enabled,
      suppressEnabledCheckbox: !!this.params.suppressEnabledCheckbox,
      onEnableChange: (enabled) => {
        if (this.params.onEnableChange) {
          this.params.onEnableChange(enabled);
        }
      }
    };
    this.setTemplate(_FontPanel.TEMPLATE, {
      fontGroup: fontGroupParams,
      familySelect: this.getFamilySelectParams(),
      weightStyleSelect: this.getWeightStyleSelectParams(),
      sizeSelect: this.getSizeSelectParams(),
      colorPicker: this.params.chartMenuUtils.getDefaultColorPickerParams(this.params.keyMapper("color"))
    });
  }
  addCompToPanel(comp) {
    this.fontGroup.addItem(comp);
    this.activeComps.push(comp);
  }
  setEnabled(enabled) {
    this.fontGroup.setEnabled(enabled);
  }
  getFamilySelectParams() {
    const families = [
      "Arial, sans-serif",
      "Aria Black, sans-serif",
      "Book Antiqua,  serif",
      "Charcoal, sans-serif",
      "Comic Sans MS, cursive",
      "Courier, monospace",
      "Courier New, monospace",
      "Gadget, sans-serif",
      "Geneva, sans-serif",
      "Helvetica, sans-serif",
      "Impact, sans-serif",
      "Lucida Console, monospace",
      "Lucida Grande, sans-serif",
      "Lucida Sans Unicode,  sans-serif",
      "Monaco, monospace",
      "Palatino Linotype, serif",
      "Palatino, serif",
      "Times New Roman, serif",
      "Times, serif",
      "Verdana, sans-serif"
    ];
    const family = this.getInitialFontValue("fontFamily");
    let initialValue = families[0];
    if (family) {
      const lowerCaseValues = families.map((f) => f.toLowerCase());
      const valueIndex = lowerCaseValues.indexOf(family.toLowerCase());
      if (valueIndex >= 0) {
        initialValue = families[valueIndex];
      } else {
        const capitalisedFontValue = import_core16._.capitalise(family);
        families.push(capitalisedFontValue);
        initialValue = capitalisedFontValue;
      }
    }
    const options = families.sort().map((value) => ({ value, text: value }));
    return {
      options,
      inputWidth: "flex",
      value: `${initialValue}`,
      onValueChange: (newValue) => this.setFont({ fontFamily: newValue })
    };
  }
  getSizeSelectParams() {
    const sizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
    const size = this.getInitialFontValue("fontSize");
    if (!import_core16._.includes(sizes, size)) {
      sizes.push(size);
    }
    const options = sizes.sort((a, b) => a - b).map((value) => ({ value: `${value}`, text: `${value}` }));
    return {
      options,
      inputWidth: "flex",
      value: `${size}`,
      onValueChange: (newValue) => this.setFont({ fontSize: parseInt(newValue, 10) }),
      label: this.chartTranslationService.translate("size")
    };
  }
  getWeightStyleSelectParams() {
    var _a, _b;
    const weight = (_a = this.getInitialFontValue("fontWeight")) != null ? _a : "normal";
    const style = (_b = this.getInitialFontValue("fontStyle")) != null ? _b : "normal";
    const weightStyles = [
      { name: "normal", weight: "normal", style: "normal" },
      { name: "bold", weight: "bold", style: "normal" },
      { name: "italic", weight: "normal", style: "italic" },
      { name: "boldItalic", weight: "bold", style: "italic" }
    ];
    let selectedOption = weightStyles.find((x) => x.weight === weight && x.style === style);
    if (!selectedOption) {
      selectedOption = { name: "predefined", weight, style };
      weightStyles.unshift(selectedOption);
    }
    const options = weightStyles.map((ws) => ({
      value: ws.name,
      text: this.chartTranslationService.translate(ws.name)
    }));
    return {
      options,
      inputWidth: "flex",
      value: selectedOption.name,
      onValueChange: (newValue) => {
        const selectedWeightStyle = weightStyles.find((x) => x.name === newValue);
        this.setFont({ fontWeight: selectedWeightStyle.weight, fontStyle: selectedWeightStyle.style });
      }
    };
  }
  addItemToPanel(item) {
    this.fontGroup.addItem(item);
    this.activeComps.push(item);
  }
  destroyActiveComps() {
    this.activeComps.forEach((comp) => {
      import_core16._.removeFromParent(comp.getGui());
      this.destroyBean(comp);
    });
  }
  destroy() {
    this.destroyActiveComps();
    super.destroy();
  }
  setFont(font) {
    const { keyMapper } = this.params;
    Object.entries(font).forEach(([fontKey, value]) => {
      if (value) {
        this.chartOptions.setValue(keyMapper(fontKey), value);
      }
    });
  }
  getInitialFontValue(fontKey) {
    const { keyMapper } = this.params;
    return this.chartOptions.getValue(keyMapper(fontKey));
  }
};
_FontPanel.TEMPLATE = /* html */
`<div class="ag-font-panel">
            <ag-group-component ref="fontGroup">
                <ag-select ref="familySelect"></ag-select>
                <ag-select ref="weightStyleSelect"></ag-select>
                <div class="ag-charts-font-size-color">
                    <ag-select ref="sizeSelect"></ag-select>
                    <ag-color-picker ref="colorPicker"></ag-color-picker>
                </div>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core16.RefSelector)("fontGroup")
], _FontPanel.prototype, "fontGroup", 2);
__decorateClass([
  (0, import_core16.Autowired)("chartTranslationService")
], _FontPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core16.PostConstruct
], _FontPanel.prototype, "init", 1);
var FontPanel = _FontPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/legend/legendPanel.ts
var _LegendPanel = class _LegendPanel extends import_core17.Component {
  constructor({ chartMenuParamsFactory: chartMenuUtils, isExpandedOnInit = false }) {
    super();
    this.chartMenuUtils = chartMenuUtils;
    this.isExpandedOnInit = isExpandedOnInit;
  }
  init() {
    const legendGroupParams = this.chartMenuUtils.addEnableParams(
      "legend.enabled",
      {
        cssIdentifier: "charts-format-top-level",
        direction: "vertical",
        title: this.chartTranslationService.translate("legend"),
        suppressEnabledCheckbox: false,
        suppressToggleExpandOnEnableChange: true,
        expanded: this.isExpandedOnInit,
        items: [this.createLabelPanel()]
      }
    );
    this.setTemplate(_LegendPanel.TEMPLATE, {
      legendGroup: legendGroupParams,
      legendPositionSelect: this.chartMenuUtils.getDefaultLegendParams("legend.position"),
      legendPaddingSlider: this.getSliderParams("spacing", "spacing", 200),
      markerSizeSlider: this.getSliderParams("item.marker.size", "markerSize", 40),
      markerStrokeSlider: this.getSliderParams("item.marker.strokeWidth", "markerStroke", 10),
      markerPaddingSlider: this.getSliderParams("item.marker.padding", "itemSpacing", 20),
      itemPaddingXSlider: this.getSliderParams("item.paddingX", "layoutHorizontalSpacing", 50),
      itemPaddingYSlider: this.getSliderParams("item.paddingY", "layoutVerticalSpacing", 50)
    });
  }
  getSliderParams(expression, labelKey, defaultMaxValue) {
    return this.chartMenuUtils.getDefaultSliderParams(`legend.${expression}`, labelKey, defaultMaxValue);
  }
  createLabelPanel() {
    const params = {
      enabled: true,
      suppressEnabledCheckbox: true,
      chartMenuUtils: this.chartMenuUtils,
      keyMapper: (key) => `legend.item.label.${key}`
    };
    return this.createManagedBean(new FontPanel(params));
  }
};
_LegendPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-slider ref="legendPaddingSlider"></ag-slider>
                <ag-slider ref="markerSizeSlider"></ag-slider>
                <ag-slider ref="markerStrokeSlider"></ag-slider>
                <ag-slider ref="markerPaddingSlider"></ag-slider>
                <ag-slider ref="itemPaddingXSlider"></ag-slider>
                <ag-slider ref="itemPaddingYSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core17.Autowired)("chartTranslationService")
], _LegendPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core17.PostConstruct
], _LegendPanel.prototype, "init", 1);
var LegendPanel = _LegendPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/axis/cartesianAxisPanel.ts
var import_core22 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/format/axis/axisTicksPanel.ts
var import_core18 = require("@ag-grid-community/core");
var _AxisTicksPanel = class _AxisTicksPanel extends import_core18.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
  }
  init() {
    const axisTicksGroupParams = this.chartMenuUtils.addEnableParams(
      "tick.enabled",
      {
        cssIdentifier: "charts-format-sub-level",
        direction: "vertical",
        suppressOpenCloseIcons: true,
        title: this.chartTranslationService.translate("ticks"),
        suppressEnabledCheckbox: false
      }
    );
    const axisTicksColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams("tick.color");
    const axisTicksWidthSliderParams = this.chartMenuUtils.getDefaultSliderParams("tick.width", "width", 10);
    const axisTicksSizeSliderParams = this.chartMenuUtils.getDefaultSliderParams("tick.size", "length", 30);
    this.setTemplate(_AxisTicksPanel.TEMPLATE, {
      axisTicksGroup: axisTicksGroupParams,
      axisTicksColorPicker: axisTicksColorPickerParams,
      axisTicksWidthSlider: axisTicksWidthSliderParams,
      axisTicksSizeSlider: axisTicksSizeSliderParams
    });
  }
};
_AxisTicksPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core18.Autowired)("chartTranslationService")
], _AxisTicksPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core18.PostConstruct
], _AxisTicksPanel.prototype, "init", 1);
var AxisTicksPanel = _AxisTicksPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/gridLine/gridLinePanel.ts
var import_core19 = require("@ag-grid-community/core");
var _GridLinePanel = class _GridLinePanel extends import_core19.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
    this.chartOptions = chartMenuUtils.getChartOptions();
  }
  init() {
    const gridLineGroupParams = this.chartMenuUtils.addEnableParams("gridLine.enabled", {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      suppressOpenCloseIcons: true,
      title: this.chartTranslationService.translate("gridLines"),
      suppressEnabledCheckbox: false
    });
    const gridLineColorPickerParams = this.getGridLineColorPickerParams("color");
    const gridLineWidthSliderParams = this.getGridLineWidthSliderParams("thickness");
    const gridLineLineDashSliderParams = this.getGridLineDashSliderParams("lineDash");
    this.setTemplate(_GridLinePanel.TEMPLATE, {
      gridLineGroup: gridLineGroupParams,
      gridLineColorPicker: gridLineColorPickerParams,
      gridLineWidthSlider: gridLineWidthSliderParams,
      gridLineLineDashSlider: gridLineLineDashSliderParams
    });
  }
  getGridLineColorPickerParams(labelKey) {
    return this.chartMenuUtils.getDefaultColorPickerParams(
      "gridLine.style",
      labelKey,
      {
        formatInputValue: (value) => {
          var _a;
          return (_a = value == null ? void 0 : value[0]) == null ? void 0 : _a.stroke;
        },
        parseInputValue: (value) => {
          var _a;
          const styles = (_a = this.chartOptions.getValue("gridLine.style")) != null ? _a : [];
          if (styles.length === 0)
            return [{ stroke: value, lineDash: [] }];
          return [__spreadProps(__spreadValues({}, styles[0]), { stroke: value })];
        }
      }
    );
  }
  getGridLineWidthSliderParams(labelKey) {
    return this.chartMenuUtils.getDefaultSliderParams("gridLine.width", labelKey, 10);
  }
  getGridLineDashSliderParams(labelKey) {
    var _a, _b;
    const initialStyles = this.chartOptions.getValue("gridLine.style");
    const initialValue = (_b = (_a = initialStyles == null ? void 0 : initialStyles[0]) == null ? void 0 : _a.lineDash) == null ? void 0 : _b[0];
    const params = this.chartMenuUtils.getDefaultSliderParamsWithoutValueParams(
      initialValue != null ? initialValue : 0,
      labelKey,
      30
    );
    params.onValueChange = (value) => {
      const stroke = this.chartOptions.getValue("gridLine.style.0.stroke");
      this.chartOptions.setValue(
        "gridLine.style",
        [{ lineDash: [value], stroke }]
      );
    };
    return params;
  }
};
_GridLinePanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="gridLineGroup">
                <ag-color-picker ref="gridLineColorPicker"></ag-color-picker>
                <ag-slider ref="gridLineWidthSlider"></ag-slider>
                <ag-slider ref="gridLineLineDashSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core19.Autowired)("chartTranslationService")
], _GridLinePanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core19.PostConstruct
], _GridLinePanel.prototype, "init", 1);
var GridLinePanel = _GridLinePanel;

// enterprise-modules/charts/src/widgets/agAngleSelect.ts
var import_core20 = require("@ag-grid-community/core");
var _AgAngleSelect = class _AgAngleSelect extends import_core20.AgAbstractLabel {
  constructor(config) {
    super(config, _AgAngleSelect.TEMPLATE);
    this.radius = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  postConstruct() {
    super.postConstruct();
    const { value, onValueChange } = this.config;
    if (value != null) {
      this.setValue(value, void 0, true);
    }
    if (onValueChange != null) {
      this.onValueChange(onValueChange);
    }
    this.dragListener = {
      eElement: this.eParentCircle,
      dragStartPixels: 0,
      onDragStart: (e) => {
        this.parentCircleRect = this.eParentCircle.getBoundingClientRect();
      },
      onDragging: (e) => this.calculateAngleDrag(e),
      onDragStop: () => {
      }
    };
    this.dragService.addDragSource(this.dragListener);
    this.eAngleValue.setLabel("").setLabelWidth(5).setInputWidth(45).setMin(0).setMax(360).setValue(`${this.degrees}`).onValueChange((value2) => {
      if (value2 == null || value2 === "") {
        value2 = "0";
      }
      value2 = this.eAngleValue.normalizeValue(value2);
      let floatValue = parseFloat(value2);
      if (floatValue > 180) {
        floatValue = floatValue - 360;
      }
      this.setValue(floatValue);
    });
    this.updateNumberInput();
    if (import_core20._.exists(this.getValue())) {
      this.eAngleValue.setValue(this.normalizeNegativeValue(this.getValue()).toString());
    }
    this.addManagedListener(this, import_core20.Events.EVENT_FIELD_VALUE_CHANGED, () => {
      if (this.eAngleValue.getInputElement().contains(this.gos.getActiveDomElement())) {
        return;
      }
      this.updateNumberInput();
    });
  }
  updateNumberInput() {
    const normalizedValue = this.normalizeNegativeValue(this.getValue());
    this.eAngleValue.setValue(normalizedValue.toString());
  }
  positionChildCircle(radians) {
    const rect = this.parentCircleRect || { width: 24, height: 24 };
    const eChildCircle = this.eChildCircle;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    eChildCircle.style.left = `${centerX + Math.cos(radians) * 8}px`;
    eChildCircle.style.top = `${centerY + Math.sin(radians) * 8}px`;
  }
  calculatePolar() {
    const x = this.offsetX;
    const y = this.offsetY;
    const radians = Math.atan2(y, x);
    this.degrees = this.toDegrees(radians);
    this.radius = Math.sqrt(x * x + y * y);
    this.positionChildCircle(radians);
  }
  calculateCartesian() {
    const radians = this.toRadians(this.getValue());
    const radius = this.getRadius();
    this.setOffsetX(Math.cos(radians) * radius).setOffsetY(Math.sin(radians) * radius);
  }
  setOffsetX(offset) {
    if (this.offsetX !== offset) {
      this.offsetX = offset;
      this.calculatePolar();
    }
    return this;
  }
  setOffsetY(offset) {
    if (this.offsetY !== offset) {
      this.offsetY = offset;
      this.calculatePolar();
    }
    return this;
  }
  calculateAngleDrag(e) {
    const rect = this.parentCircleRect;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - centerX;
    const dy = y - centerY;
    const radians = Math.atan2(dy, dx);
    this.setValue(radians, true);
  }
  toDegrees(radians) {
    return radians / Math.PI * 180;
  }
  toRadians(degrees) {
    return degrees / 180 * Math.PI;
  }
  normalizeNegativeValue(degrees) {
    return degrees < 0 ? 360 + degrees : degrees;
  }
  normalizeAngle180(radians) {
    radians %= Math.PI * 2;
    if (radians < -Math.PI) {
      radians += Math.PI * 2;
    } else if (radians >= Math.PI) {
      radians -= Math.PI * 2;
    }
    return radians;
  }
  getRadius() {
    return this.radius;
  }
  setRadius(r) {
    if (this.radius === r) {
      return this;
    }
    this.radius = r;
    this.calculateCartesian();
    return this;
  }
  onValueChange(callbackFn) {
    this.addManagedListener(this, import_core20.Events.EVENT_FIELD_VALUE_CHANGED, () => {
      callbackFn(this.degrees);
    });
    return this;
  }
  getValue(radians) {
    return radians ? this.toRadians(this.degrees) : this.degrees;
  }
  setValue(degrees, radians, silent) {
    let radiansValue;
    if (!radians) {
      radiansValue = this.normalizeAngle180(this.toRadians(degrees));
    } else {
      radiansValue = degrees;
    }
    degrees = this.toDegrees(radiansValue);
    if (this.degrees !== degrees) {
      this.degrees = Math.floor(degrees);
      this.calculateCartesian();
      this.positionChildCircle(radiansValue);
      if (!silent) {
        this.dispatchEvent({ type: import_core20.Events.EVENT_FIELD_VALUE_CHANGED });
      }
    }
    return this;
  }
  setWidth(width) {
    import_core20._.setFixedWidth(this.getGui(), width);
    return this;
  }
  setDisabled(disabled) {
    super.setDisabled(disabled);
    this.eAngleValue.setDisabled(disabled);
    return this;
  }
  destroy() {
    this.dragService.removeDragSource(this.dragListener);
    super.destroy();
  }
};
_AgAngleSelect.TEMPLATE = /* html */
`<div class="ag-angle-select">
            <div ref="eLabel"></div>
            <div class="ag-wrapper ag-angle-select-wrapper">
                <div ref="eAngleSelectField" class="ag-angle-select-field">
                    <div ref="eParentCircle" class="ag-angle-select-parent-circle">
                        <div ref="eChildCircle" class="ag-angle-select-child-circle"></div>
                    </div>
                </div>
                <ag-input-number-field ref="eAngleValue"></ag-input-number-field>
            </div>
        </div>`;
__decorateClass([
  (0, import_core20.RefSelector)("eLabel")
], _AgAngleSelect.prototype, "eLabel", 2);
__decorateClass([
  (0, import_core20.RefSelector)("eParentCircle")
], _AgAngleSelect.prototype, "eParentCircle", 2);
__decorateClass([
  (0, import_core20.RefSelector)("eChildCircle")
], _AgAngleSelect.prototype, "eChildCircle", 2);
__decorateClass([
  (0, import_core20.RefSelector)("eAngleValue")
], _AgAngleSelect.prototype, "eAngleValue", 2);
__decorateClass([
  (0, import_core20.Autowired)("dragService")
], _AgAngleSelect.prototype, "dragService", 2);
var AgAngleSelect = _AgAngleSelect;

// enterprise-modules/charts/src/charts/chartComp/menu/chartMenuParamsFactory.ts
var import_core21 = require("@ag-grid-community/core");
var ChartMenuParamsFactory = class extends import_core21.BeanStub {
  constructor(chartOptionsProxy) {
    super();
    this.chartOptionsProxy = chartOptionsProxy;
  }
  getDefaultColorPickerParams(expression, labelKey, options) {
    return this.addValueParams(
      expression,
      {
        label: this.chartTranslationService.translate(labelKey != null ? labelKey : "color"),
        labelWidth: "flex",
        inputWidth: "flex"
      },
      options
    );
  }
  getDefaultNumberInputParams(expression, labelKey, options) {
    return this.addValueParams(
      expression,
      {
        label: this.chartTranslationService.translate(labelKey),
        labelWidth: "flex",
        inputWidth: "flex",
        precision: options == null ? void 0 : options.precision,
        step: options == null ? void 0 : options.step,
        min: options == null ? void 0 : options.min,
        max: options == null ? void 0 : options.max
      },
      {
        parseInputValue: (value) => {
          const numberValue = Number(value);
          return isNaN(numberValue) ? void 0 : numberValue;
        },
        formatInputValue: (value) => {
          return value == null ? "" : `${value}`;
        }
      }
    );
  }
  getDefaultSliderParams(expression, labelKey, defaultMaxValue, isArray) {
    var _a;
    let value = (_a = this.chartOptionsProxy.getValue(expression)) != null ? _a : 0;
    if (isArray && Array.isArray(value)) {
      value = value[0];
    }
    const params = this.getDefaultSliderParamsWithoutValueParams(value, labelKey, defaultMaxValue);
    params.onValueChange = (value2) => this.chartOptionsProxy.setValue(expression, isArray ? [value2] : value2);
    return params;
  }
  getDefaultSliderParamsWithoutValueParams(value, labelKey, defaultMaxValue) {
    return {
      label: this.chartTranslationService.translate(labelKey),
      minValue: 0,
      maxValue: Math.max(value, defaultMaxValue),
      textFieldWidth: 45,
      value: `${value}`
    };
  }
  getDefaultCheckboxParams(expression, labelKey, options) {
    const value = this.chartOptionsProxy.getValue(expression);
    const params = {
      label: this.chartTranslationService.translate(labelKey),
      value,
      readOnly: options == null ? void 0 : options.readOnly,
      passive: options == null ? void 0 : options.passive
    };
    params.onValueChange = (value2) => {
      this.chartOptionsProxy.setValue(expression, typeof value2 === "boolean" ? value2 : void 0);
    };
    return params;
  }
  getDefaultSelectParams(expression, labelKey, dropdownOptions, options) {
    const value = this.chartOptionsProxy.getValue(expression);
    const params = {
      label: this.chartTranslationService.translate(labelKey),
      value,
      options: dropdownOptions,
      pickerType: options == null ? void 0 : options.pickerType,
      pickerAriaLabelKey: options == null ? void 0 : options.pickerAriaLabelKey,
      pickerAriaLabelValue: options == null ? void 0 : options.pickerAriaLabelValue
    };
    params.onValueChange = (value2) => {
      this.chartOptionsProxy.setValue(expression, value2);
    };
    return params;
  }
  getDefaultLegendParams(expression) {
    return this.addValueParams(
      expression,
      {
        label: this.chartTranslationService.translate("position"),
        labelWidth: "flex",
        inputWidth: "flex",
        options: ["top", "right", "bottom", "left"].map((position) => ({
          value: position,
          text: this.chartTranslationService.translate(position)
        }))
      }
    );
  }
  getDefaultFontPanelParams(expression, labelKey) {
    const keyMapper = (key) => `${expression}.${key}`;
    return this.addEnableParams(
      keyMapper("enabled"),
      {
        name: this.chartTranslationService.translate(labelKey),
        suppressEnabledCheckbox: false,
        chartMenuUtils: this,
        keyMapper
      }
    );
  }
  addValueParams(expression, params, options) {
    const optionsValue = this.chartOptionsProxy.getValue(expression);
    params.value = (options == null ? void 0 : options.formatInputValue) ? options.formatInputValue(optionsValue) : optionsValue;
    params.onValueChange = (value) => {
      const optionsValue2 = (options == null ? void 0 : options.parseInputValue) ? options.parseInputValue(value) : value;
      this.chartOptionsProxy.setValue(expression, optionsValue2);
    };
    return params;
  }
  addEnableParams(expression, params) {
    var _a;
    params.enabled = (_a = this.chartOptionsProxy.getValue(expression)) != null ? _a : false;
    params.onEnableChange = (value) => this.chartOptionsProxy.setValue(expression, value);
    return params;
  }
  getChartOptions() {
    return this.chartOptionsProxy;
  }
};
__decorateClass([
  (0, import_core21.Autowired)("chartTranslationService")
], ChartMenuParamsFactory.prototype, "chartTranslationService", 2);

// enterprise-modules/charts/src/charts/chartComp/menu/format/axis/cartesianAxisPanel.ts
var DEFAULT_TIME_AXIS_FORMAT = "%d %B %Y";
var _CartesianAxisPanel = class _CartesianAxisPanel extends import_core22.Component {
  constructor(axisType, { chartController, chartOptionsService, isExpandedOnInit = false, seriesType }) {
    super();
    this.activePanels = [];
    this.axisLabelUpdateFuncs = [];
    this.axisType = axisType;
    this.chartController = chartController;
    this.chartAxisOptionsProxy = chartOptionsService.getCartesianAxisOptionsProxy(axisType);
    this.chartAxisThemeOverridesProxy = chartOptionsService.getCartesianAxisThemeOverridesProxy(axisType);
    this.chartAxisAppliedThemeOverridesProxy = chartOptionsService.getCartesianAxisAppliedThemeOverridesProxy(axisType);
    this.chartOptionsSeriesProxy = chartOptionsService.getSeriesOptionsProxy(() => seriesType != null ? seriesType : this.chartController.getChartSeriesType());
    this.chartOptionsService = chartOptionsService;
    this.isExpandedOnInit = isExpandedOnInit;
  }
  init() {
    var _a;
    const labelKey = this.axisType;
    const axisGroupParams = {
      cssIdentifier: "charts-format-top-level",
      direction: "vertical",
      title: this.translate(labelKey),
      expanded: this.isExpandedOnInit,
      suppressEnabledCheckbox: true
    };
    const chartAxisOptions = this.createManagedBean(new ChartMenuParamsFactory(this.chartAxisOptionsProxy));
    const chartAxisThemeOverrides = this.createManagedBean(new ChartMenuParamsFactory(this.chartAxisThemeOverridesProxy));
    const axisTypeSelectParams = this.getAxisTypeSelectParams(chartAxisOptions, this.chartAxisAppliedThemeOverridesProxy);
    const axisPositionSelectParams = this.getAxisPositionSelectParams(chartAxisOptions);
    const axisTimeFormatSelectParams = this.getAxisTimeFormatSelectParams(chartAxisOptions);
    const axisColorInputParams = this.getAxisColorInputParams(chartAxisThemeOverrides);
    const axisLineWidthSliderParams = this.getAxisLineWidthSliderParams(chartAxisThemeOverrides);
    this.setTemplate(_CartesianAxisPanel.TEMPLATE, {
      axisGroup: axisGroupParams,
      axisTypeSelect: axisTypeSelectParams != null ? axisTypeSelectParams : void 0,
      axisPositionSelect: axisPositionSelectParams != null ? axisPositionSelectParams : void 0,
      axisTimeFormatSelect: axisTimeFormatSelectParams != null ? axisTimeFormatSelectParams : void 0,
      axisColorInput: axisColorInputParams,
      axisLineWidthSlider: axisLineWidthSliderParams
    });
    this.axisTypeSelect.setDisplayed(!!((_a = axisTypeSelectParams.options) == null ? void 0 : _a.length));
    if (!axisPositionSelectParams)
      this.removeTemplateComponent(this.axisPositionSelect);
    const updateTimeFormatVisibility = () => {
      const isTimeAxis = this.chartAxisOptionsProxy.getValue("type") === "time";
      import_core22._.setDisplayed(this.axisTimeFormatSelect.getGui(), isTimeAxis);
    };
    if (!axisTimeFormatSelectParams) {
      this.removeTemplateComponent(this.axisTimeFormatSelect);
    } else {
      updateTimeFormatVisibility();
      this.addManagedListener(this.eventService, import_core22.Events.EVENT_CHART_OPTIONS_CHANGED, (e) => {
        updateTimeFormatVisibility();
      });
    }
    this.initGridLines(chartAxisThemeOverrides);
    this.initAxisTicks(chartAxisThemeOverrides);
    this.initAxisLabels(chartAxisThemeOverrides);
    const updateAxisLabelRotations = () => this.axisLabelUpdateFuncs.forEach((func) => func());
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, () => setTimeout(() => {
      this.refreshAxisTypeSelect(chartAxisOptions);
      updateTimeFormatVisibility();
    }));
  }
  getAxisTypeSelectParams(chartAxisOptions, chartAxisAppliedThemeOverrides) {
    const chartOptions = chartAxisOptions.getChartOptions();
    const axisTypeSelectOptions = this.getAxisTypeSelectOptions();
    const params = chartAxisOptions.getDefaultSelectParams(
      "type",
      "axisType",
      axisTypeSelectOptions
    );
    params.onValueChange = (value) => {
      var _a;
      const previousAxisType = chartOptions.getValue("type");
      if (value === previousAxisType)
        return;
      const previousAxisThemeOverrides = chartAxisAppliedThemeOverrides.getValue("*");
      const previousAxisIsTimeAxis = previousAxisType === "time";
      const updatedAxisIsTimeAxis = value === "time";
      const updatedLabelFormat = previousAxisIsTimeAxis !== updatedAxisIsTimeAxis ? updatedAxisIsTimeAxis ? DEFAULT_TIME_AXIS_FORMAT : void 0 : null;
      this.chartOptionsService.setCartesianCategoryAxisType(this.axisType, value);
      if (updatedLabelFormat !== null) {
        const existingLabel = (_a = chartOptions.getValue("label")) != null ? _a : {};
        chartOptions.setValue("label", __spreadProps(__spreadValues({}, existingLabel), { format: updatedLabelFormat }));
      }
      chartAxisAppliedThemeOverrides.setValue("*", previousAxisThemeOverrides);
    };
    return params;
  }
  refreshAxisTypeSelect(chartAxisOptions) {
    const options = this.getAxisTypeSelectOptions();
    const hasOptions = !!options.length;
    this.axisTypeSelect.setDisplayed(hasOptions);
    if (!hasOptions) {
      return;
    }
    this.axisTypeSelect.clearOptions().addOptions(options).setValue(chartAxisOptions.getChartOptions().getValue("type"));
  }
  getAxisTypeSelectOptions() {
    const chartType = this.chartController.getChartType();
    const supportsNumericalAxis = () => {
      const testDatum = this.chartController.getChartData()[0];
      if (!testDatum) {
        return false;
      }
      return this.chartController.getSelectedDimensions().every((col) => !isNaN(parseFloat(testDatum[col.colId])));
    };
    if ([
      "heatmap",
      "histogram",
      "boxPlot",
      "rangeBar",
      "scatter",
      "bubble"
    ].includes(chartType) || this.chartController.isGrouping() || !this.isCategoryAxis() || this.chartController.isCategorySeriesSwitched() || !supportsNumericalAxis()) {
      return [];
    }
    return ["category", "number", "time"].map((value) => ({
      value,
      text: this.translate(value)
    }));
  }
  isCategoryAxis() {
    const isHorizontal = this.chartOptionsSeriesProxy.getValue("direction") === "horizontal";
    return isHorizontal && this.axisType === "yAxis" || !isHorizontal && this.axisType === "xAxis";
  }
  getAxisPositionSelectParams(chartAxisOptions) {
    const axisPositionSelectOptions = ((chartType, axisType) => {
      switch (chartType) {
        case "heatmap":
          return null;
        default:
          switch (axisType) {
            case "xAxis":
              return [
                { value: "top", text: this.translate("top") },
                { value: "bottom", text: this.translate("bottom") }
              ];
            case "yAxis":
              return [
                { value: "left", text: this.translate("left") },
                { value: "right", text: this.translate("right") }
              ];
          }
      }
    })(this.chartController.getChartType(), this.axisType);
    if (!axisPositionSelectOptions)
      return null;
    return chartAxisOptions.getDefaultSelectParams(
      "position",
      "position",
      axisPositionSelectOptions
    );
  }
  getAxisTimeFormatSelectParams(chartAxisOptions) {
    if (!this.isCategoryAxis()) {
      return null;
    }
    const axisTimeFormatSelectOptions = [
      { value: "%d/%m/%Y", text: this.translate("timeFormatSlashesDDMMYYYY") },
      { value: "%m/%d/%Y", text: this.translate("timeFormatSlashesMMDDYYYY") },
      { value: "%d/%m/%y", text: this.translate("timeFormatSlashesDDMMYY") },
      { value: "%m/%d/%y", text: this.translate("timeFormatSlashesMMDDYY") },
      { value: "%d.%e.%y", text: this.translate("timeFormatDotsDDMYY") },
      { value: "%e.%d.%y", text: this.translate("timeFormatDotsMDDYY") },
      { value: "%Y-%m-%d", text: this.translate("timeFormatDashesYYYYMMDD") },
      { value: "%d %B %Y", text: this.translate("timeFormatSpacesDDMMMMYYYY") },
      { value: "%H:%M:%S", text: this.translate("timeFormatHHMMSS") },
      { value: "%I:%M:%S %p", text: this.translate("timeFormatHHMMSSAmPm") }
    ];
    return chartAxisOptions.getDefaultSelectParams(
      "label.format",
      "timeFormat",
      axisTimeFormatSelectOptions
    );
  }
  getAxisColorInputParams(chartAxisThemeOverrides) {
    return chartAxisThemeOverrides.getDefaultColorPickerParams("line.color");
  }
  getAxisLineWidthSliderParams(chartAxisThemeOverrides) {
    var _a;
    const chartOptions = chartAxisThemeOverrides.getChartOptions();
    const getAxisLineWidth = () => {
      const isAxisLineEnabled = chartOptions.getValue("line.enabled");
      if (!isAxisLineEnabled)
        return null;
      return chartOptions.getValue("line.width");
    };
    const setAxisLineWidth = (value) => {
      chartOptions.setValues([
        { expression: "line.enabled", value: value != null },
        { expression: "line.width", value: value != null ? value : 0 }
      ]);
    };
    const axisLineWidthSliderParams = chartAxisThemeOverrides.getDefaultSliderParamsWithoutValueParams(
      (_a = getAxisLineWidth()) != null ? _a : 0,
      "thickness",
      10
    );
    axisLineWidthSliderParams.onValueChange = (newValue) => {
      setAxisLineWidth(newValue === 0 ? null : newValue);
    };
    return axisLineWidthSliderParams;
  }
  initGridLines(chartAxisThemeOverrides) {
    const chartType = this.chartController.getChartType();
    switch (chartType) {
      case "heatmap":
        return;
      default:
        const gridLineComp = this.createBean(new GridLinePanel(chartAxisThemeOverrides));
        this.axisGroup.addItem(gridLineComp);
        this.activePanels.push(gridLineComp);
    }
  }
  initAxisTicks(chartAxisThemeOverrides) {
    if (!this.hasConfigurableAxisTicks())
      return;
    const axisTicksComp = this.createBean(new AxisTicksPanel(chartAxisThemeOverrides));
    this.axisGroup.addItem(axisTicksComp);
    this.activePanels.push(axisTicksComp);
  }
  hasConfigurableAxisTicks() {
    const chartType = this.chartController.getChartType();
    switch (chartType) {
      case "radarLine":
      case "radarArea":
      case "rangeBar":
      case "boxPlot":
      case "waterfall":
        return false;
      default:
        return true;
    }
  }
  initAxisLabels(chartAxisThemeOverrides) {
    const params = {
      name: this.translate("labels"),
      enabled: true,
      suppressEnabledCheckbox: true,
      chartMenuUtils: chartAxisThemeOverrides,
      keyMapper: (key) => `label.${key}`
    };
    const labelPanelComp = this.createBean(new FontPanel(params));
    this.axisGroup.addItem(labelPanelComp);
    this.activePanels.push(labelPanelComp);
    this.addAdditionalLabelComps(labelPanelComp, chartAxisThemeOverrides);
  }
  addAdditionalLabelComps(labelPanelComp, chartAxisThemeOverrides) {
    this.addLabelPadding(labelPanelComp, chartAxisThemeOverrides);
    const rotationComp = this.createRotationWidget("labelRotation", chartAxisThemeOverrides);
    const autoRotateCb = this.initLabelRotation(rotationComp, chartAxisThemeOverrides);
    labelPanelComp.addCompToPanel(autoRotateCb);
    labelPanelComp.addCompToPanel(rotationComp);
  }
  initLabelRotation(rotationComp, chartAxisThemeOverrides) {
    const chartOptions = chartAxisThemeOverrides.getChartOptions();
    const getLabelRotationValue = () => {
      return chartOptions.getValue("label.rotation");
    };
    const getLabelAutoRotateValue = () => {
      return chartOptions.getValue("label.autoRotate");
    };
    const updateAutoRotate = (autoRotate2) => {
      if (autoRotate2)
        this.prevRotation = getLabelRotationValue();
      chartOptions.setValues([
        { expression: "label.autoRotate", value: autoRotate2 },
        // Clear the rotation option when activating auto-rotate, reinstate the previous value when deactivating
        { expression: "label.rotation", value: autoRotate2 ? void 0 : this.prevRotation }
      ]);
      rotationComp.setDisabled(autoRotate2);
    };
    const rotation = getLabelRotationValue();
    const autoRotate = typeof rotation === "number" ? false : getLabelAutoRotateValue();
    const autoRotateCheckbox = this.createBean(new import_core22.AgCheckbox({
      label: this.translate("autoRotate"),
      value: autoRotate,
      onValueChange: updateAutoRotate
    }));
    rotationComp.setDisabled(autoRotate);
    return autoRotateCheckbox;
  }
  createRotationWidget(labelKey, chartAxisThemeOverrides) {
    var _a;
    const chartOptions = chartAxisThemeOverrides.getChartOptions();
    const getLabelRotationValue = () => {
      return chartOptions.getValue("label.rotation");
    };
    const setLabelRotationValue = (value) => {
      return chartOptions.setValue("label.rotation", value);
    };
    const degreesSymbol = String.fromCharCode(176);
    const label = `${this.chartTranslationService.translate(labelKey)} ${degreesSymbol}`;
    const angleSelect = new AgAngleSelect({
      label,
      labelWidth: "flex",
      value: (_a = getLabelRotationValue()) != null ? _a : 0,
      onValueChange: setLabelRotationValue
    });
    this.axisLabelUpdateFuncs.push(() => {
      var _a2;
      angleSelect.setValue((_a2 = getLabelRotationValue()) != null ? _a2 : 0);
    });
    return this.createBean(angleSelect);
  }
  addLabelPadding(labelPanelComp, chartAxisThemeOverrides) {
    const labelPaddingSlider = this.createBean(new import_core22.AgSlider(chartAxisThemeOverrides.getDefaultSliderParams(
      "label.padding",
      "padding",
      30
    )));
    labelPanelComp.addCompToPanel(labelPaddingSlider);
  }
  translate(key) {
    return this.chartTranslationService.translate(key);
  }
  removeTemplateComponent(component) {
    import_core22._.removeFromParent(component.getGui());
    this.destroyBean(component);
  }
  destroyActivePanels() {
    this.activePanels.forEach((panel) => {
      import_core22._.removeFromParent(panel.getGui());
      this.destroyBean(panel);
    });
  }
  destroy() {
    this.destroyActivePanels();
    super.destroy();
  }
};
_CartesianAxisPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="axisGroup">
                <ag-select ref="axisTypeSelect"></ag-select>
                <ag-select ref="axisTimeFormatSelect"></ag-select>
                <ag-select ref="axisPositionSelect"></ag-select>
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core22.RefSelector)("axisGroup")
], _CartesianAxisPanel.prototype, "axisGroup", 2);
__decorateClass([
  (0, import_core22.RefSelector)("axisTypeSelect")
], _CartesianAxisPanel.prototype, "axisTypeSelect", 2);
__decorateClass([
  (0, import_core22.RefSelector)("axisPositionSelect")
], _CartesianAxisPanel.prototype, "axisPositionSelect", 2);
__decorateClass([
  (0, import_core22.RefSelector)("axisTimeFormatSelect")
], _CartesianAxisPanel.prototype, "axisTimeFormatSelect", 2);
__decorateClass([
  (0, import_core22.Autowired)("chartTranslationService")
], _CartesianAxisPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core22.PostConstruct
], _CartesianAxisPanel.prototype, "init", 1);
var CartesianAxisPanel = _CartesianAxisPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/axis/polarAxisPanel.ts
var import_core23 = require("@ag-grid-community/core");
var _PolarAxisPanel = class _PolarAxisPanel extends import_core23.Component {
  constructor({ chartController, chartAxisMenuParamsFactory: chartAxisMenuUtils, isExpandedOnInit = false }) {
    super();
    this.chartController = chartController;
    this.chartMenuUtils = chartAxisMenuUtils;
    this.isExpandedOnInit = isExpandedOnInit;
  }
  init() {
    const axisGroupParams = {
      cssIdentifier: "charts-format-top-level",
      direction: "vertical",
      title: this.translate("polarAxis"),
      expanded: this.isExpandedOnInit,
      suppressEnabledCheckbox: true
    };
    const axisColorInputParams = this.chartMenuUtils.getDefaultColorPickerParams("line.color");
    const axisLineWidthSliderParams = this.chartMenuUtils.getDefaultSliderParams("line.width", "thickness", 10);
    this.setTemplate(_PolarAxisPanel.TEMPLATE, {
      axisGroup: axisGroupParams,
      axisColorInput: axisColorInputParams,
      axisLineWidthSlider: axisLineWidthSliderParams
    });
    this.initAxis();
    this.initAxisLabels();
    this.initRadiusAxis();
  }
  initAxis() {
    const chartType = this.chartController.getChartType();
    const hasConfigurableAxisShape = ["radarLine", "radarArea"].includes(chartType);
    if (hasConfigurableAxisShape) {
      const options = [
        { value: "circle", text: this.translate("circle") },
        { value: "polygon", text: this.translate("polygon") }
      ];
      this.axisGroup.addItem(this.createSelect({
        labelKey: "shape",
        options,
        property: "shape"
      }));
    }
    if (chartType !== "pie") {
      this.axisGroup.addItem(this.createSlider({
        labelKey: "innerRadius",
        defaultMaxValue: 1,
        property: "innerRadiusRatio"
      }));
    }
  }
  initAxisLabels() {
    const params = {
      name: this.translate("labels"),
      enabled: true,
      suppressEnabledCheckbox: true,
      chartMenuUtils: this.chartMenuUtils,
      keyMapper: (key) => `label.${key}`
    };
    const labelPanelComp = this.createManagedBean(new FontPanel(params));
    const labelOrientationComp = this.createOrientationWidget();
    labelPanelComp.addItemToPanel(labelOrientationComp);
    this.axisGroup.addItem(labelPanelComp);
  }
  createOrientationWidget() {
    const options = [
      { value: "fixed", text: this.translate("fixed") },
      { value: "parallel", text: this.translate("parallel") },
      { value: "perpendicular", text: this.translate("perpendicular") }
    ];
    return this.createSelect({
      labelKey: "orientation",
      options,
      property: "label.orientation"
    });
  }
  initRadiusAxis() {
    const chartSeriesType = getSeriesType(this.chartController.getChartType());
    if (!isRadial(chartSeriesType))
      return;
    const items = [
      this.createSlider({
        labelKey: "groupPadding",
        defaultMaxValue: 1,
        property: "paddingInner"
      }),
      this.createSlider({
        labelKey: "seriesPadding",
        defaultMaxValue: 1,
        property: "groupPaddingInner"
      })
    ];
    const paddingPanelComp = this.createManagedBean(new import_core23.AgGroupComponent({
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      suppressOpenCloseIcons: true,
      enabled: true,
      suppressEnabledCheckbox: true,
      title: this.translate("padding"),
      items
    })).hideEnabledCheckbox(true).hideOpenCloseIcons(true);
    this.axisGroup.addItem(paddingPanelComp);
  }
  createSlider(config) {
    const { labelKey, defaultMaxValue, step = 0.05, property } = config;
    const params = this.chartMenuUtils.getDefaultSliderParams(property, labelKey, defaultMaxValue);
    params.step = step;
    return this.createManagedBean(new import_core23.AgSlider(params));
  }
  createSelect(config) {
    const { labelKey: label, options, property } = config;
    return this.createManagedBean(new import_core23.AgSelect(this.chartMenuUtils.addValueParams(
      property,
      {
        label: this.chartTranslationService.translate(label),
        labelAlignment: "left",
        labelWidth: "flex",
        inputWidth: "flex",
        options
      }
    )));
  }
  translate(key) {
    return this.chartTranslationService.translate(key);
  }
};
_PolarAxisPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core23.RefSelector)("axisGroup")
], _PolarAxisPanel.prototype, "axisGroup", 2);
__decorateClass([
  (0, import_core23.Autowired)("chartTranslationService")
], _PolarAxisPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core23.PostConstruct
], _PolarAxisPanel.prototype, "init", 1);
var PolarAxisPanel = _PolarAxisPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/chart/chartPanel.ts
var import_core27 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/format/chart/paddingPanel.ts
var import_core24 = require("@ag-grid-community/core");
var _PaddingPanel = class _PaddingPanel extends import_core24.Component {
  constructor(chartMenuUtils, chartController) {
    super();
    this.chartMenuUtils = chartMenuUtils;
    this.chartController = chartController;
  }
  init() {
    const chartPaddingGroupParams = {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      suppressOpenCloseIcons: true,
      title: this.chartTranslationService.translate("padding"),
      suppressEnabledCheckbox: true
    };
    const getSliderParams = (property) => this.chartMenuUtils.getDefaultSliderParams("padding." + property, property, 200);
    this.setTemplate(_PaddingPanel.TEMPLATE, {
      chartPaddingGroup: chartPaddingGroupParams,
      paddingTopSlider: getSliderParams("top"),
      paddingRightSlider: getSliderParams("right"),
      paddingBottomSlider: getSliderParams("bottom"),
      paddingLeftSlider: getSliderParams("left")
    });
    this.addManagedListener(this.eventService, import_core24.Events.EVENT_CHART_OPTIONS_CHANGED, (e) => {
      this.updateTopPadding(e.chartOptions);
    });
  }
  updateTopPadding(chartOptions) {
    const topPadding = [...this.chartController.getChartSeriesTypes(), "common"].map((seriesType) => {
      var _a, _b;
      return (_b = (_a = chartOptions[seriesType]) == null ? void 0 : _a.padding) == null ? void 0 : _b.top;
    }).find((value) => value != null);
    if (topPadding != null) {
      this.paddingTopSlider.setValue(`${topPadding}`);
    }
  }
};
_PaddingPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="chartPaddingGroup">
                <ag-slider ref="paddingTopSlider"></ag-slider>
                <ag-slider ref="paddingRightSlider"></ag-slider>
                <ag-slider ref="paddingBottomSlider"></ag-slider>
                <ag-slider ref="paddingLeftSlider"></ag-slider>
            </ag-group-component>
        <div>`;
__decorateClass([
  (0, import_core24.RefSelector)("paddingTopSlider")
], _PaddingPanel.prototype, "paddingTopSlider", 2);
__decorateClass([
  (0, import_core24.Autowired)("chartTranslationService")
], _PaddingPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core24.PostConstruct
], _PaddingPanel.prototype, "init", 1);
var PaddingPanel = _PaddingPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/chart/backgroundPanel.ts
var import_core25 = require("@ag-grid-community/core");
var _BackgroundPanel = class _BackgroundPanel extends import_core25.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
  }
  init() {
    const chartBackgroundGroupParams = this.chartMenuUtils.addEnableParams(
      "background.visible",
      {
        cssIdentifier: "charts-format-sub-level",
        direction: "vertical",
        suppressOpenCloseIcons: true,
        title: this.chartTranslationService.translate("background"),
        suppressEnabledCheckbox: false
      }
    );
    const colorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams("background.fill");
    this.setTemplate(_BackgroundPanel.TEMPLATE, {
      chartBackgroundGroup: chartBackgroundGroupParams,
      colorPicker: colorPickerParams
    });
  }
};
_BackgroundPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="chartBackgroundGroup">
                <ag-color-picker ref="colorPicker"></ag-color-picker>
            </ag-group-component>
        <div>`;
__decorateClass([
  (0, import_core25.Autowired)("chartTranslationService")
], _BackgroundPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core25.PostConstruct
], _BackgroundPanel.prototype, "init", 1);
var BackgroundPanel = _BackgroundPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/chart/titlePanel.ts
var import_core26 = require("@ag-grid-community/core");
var _TitlePanel = class _TitlePanel extends import_core26.Component {
  constructor(chartMenuUtils, chartController) {
    super(_TitlePanel.TEMPLATE);
    this.chartMenuUtils = chartMenuUtils;
    this.chartController = chartController;
    this.activePanels = [];
    this.chartOptions = chartMenuUtils.getChartOptions();
  }
  init() {
    this.initFontPanel();
    this.titlePlaceholder = this.chartTranslationService.translate("titlePlaceholder");
  }
  hasTitle() {
    const title = this.chartOptions.getValue("title");
    return title && title.enabled && title.text && title.text.length > 0;
  }
  initFontPanel() {
    const hasTitle = this.hasTitle();
    const fontPanelParams = {
      name: this.chartTranslationService.translate("title"),
      enabled: hasTitle,
      suppressEnabledCheckbox: false,
      chartMenuUtils: this.chartMenuUtils,
      keyMapper: (key) => `title.${key}`,
      onEnableChange: (enabled) => {
        if (this.chartMenuService.doesChartToolbarExist(this.chartController)) {
          const topPadding = this.chartOptions.getValue("padding.top");
          this.chartOptions.setValue("padding.top", enabled ? topPadding - 20 : topPadding + 20);
        }
        this.chartOptions.setValue("title.enabled", enabled);
        const currentTitleText = this.chartOptions.getValue("title.text");
        const replaceableTitleText = currentTitleText === "Title" || (currentTitleText == null ? void 0 : currentTitleText.trim().length) === 0;
        if (enabled && replaceableTitleText) {
          this.chartOptions.setValue("title.text", this.titlePlaceholder);
        }
      }
    };
    const fontPanelComp = this.createBean(new FontPanel(fontPanelParams));
    fontPanelComp.addItemToPanel(this.createSpacingSlicer());
    this.getGui().appendChild(fontPanelComp.getGui());
    this.activePanels.push(fontPanelComp);
    this.addManagedListener(this.eventService, "chartTitleEdit", () => {
      fontPanelComp.setEnabled(this.hasTitle());
    });
  }
  createSpacingSlicer() {
    const params = this.chartMenuUtils.getDefaultSliderParams("title.spacing", "spacing", 100);
    params.value = "10";
    return this.createBean(new import_core26.AgSlider(params));
  }
  destroyActivePanels() {
    this.activePanels.forEach((panel) => {
      import_core26._.removeFromParent(panel.getGui());
      this.destroyBean(panel);
    });
  }
  destroy() {
    this.destroyActivePanels();
    super.destroy();
  }
};
_TitlePanel.TEMPLATE = /* html */
`<div></div>`;
__decorateClass([
  (0, import_core26.Autowired)("chartTranslationService")
], _TitlePanel.prototype, "chartTranslationService", 2);
__decorateClass([
  (0, import_core26.Autowired)("chartMenuService")
], _TitlePanel.prototype, "chartMenuService", 2);
__decorateClass([
  import_core26.PostConstruct
], _TitlePanel.prototype, "init", 1);
var TitlePanel = _TitlePanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/chart/chartPanel.ts
var _ChartPanel = class _ChartPanel extends import_core27.Component {
  constructor({
    chartController,
    chartMenuParamsFactory,
    isExpandedOnInit = false,
    chartOptionsService,
    seriesType
  }) {
    super();
    this.chartController = chartController;
    this.chartMenuParamsFactory = chartMenuParamsFactory;
    this.chartOptionsSeriesProxy = chartOptionsService.getSeriesOptionsProxy(() => seriesType != null ? seriesType : this.chartController.getChartSeriesType());
    this.isExpandedOnInit = isExpandedOnInit;
  }
  init() {
    this.chartSeriesMenuParamsFactory = this.createManagedBean(new ChartMenuParamsFactory(this.chartOptionsSeriesProxy));
    const chartGroupParams = {
      cssIdentifier: "charts-format-top-level",
      direction: "vertical",
      title: this.chartTranslationService.translate("chart"),
      expanded: this.isExpandedOnInit,
      suppressEnabledCheckbox: true,
      items: [
        this.createManagedBean(new TitlePanel(this.chartMenuParamsFactory, this.chartController)),
        this.createManagedBean(new PaddingPanel(this.chartMenuParamsFactory, this.chartController)),
        this.createManagedBean(new BackgroundPanel(this.chartMenuParamsFactory)),
        ...this.createDirectionSelect()
      ]
    };
    this.setTemplate(_ChartPanel.TEMPLATE, { chartGroup: chartGroupParams });
    this.addManagedListener(this.eventService, import_core27.Events.EVENT_CHART_OPTIONS_CHANGED, () => this.refresh());
  }
  refresh() {
    this.updateDirectionSelect();
  }
  createDirectionSelect() {
    const enabled = !this.chartMenuService.isLegacyFormat();
    if (!enabled) {
      return [];
    }
    const options = ["horizontal", "vertical"].map((value) => ({
      value,
      text: this.chartTranslationService.translate(value)
    }));
    const params = this.chartSeriesMenuParamsFactory.getDefaultSelectParams("direction", "direction", options);
    params.labelWidth = "flex";
    params.inputWidth = "flex";
    const onValueChange = params.onValueChange;
    params.onValueChange = (value) => {
      onValueChange(value);
      this.chartController.raiseChartModelUpdateEvent();
    };
    this.directionSelect = this.createManagedBean(new import_core27.AgSelect(params));
    this.updateDirectionSelect();
    return [this.directionSelect];
  }
  updateDirectionSelect() {
    var _a;
    (_a = this.directionSelect) == null ? void 0 : _a.setDisplayed(canSwitchDirection(this.chartController.getChartType()));
  }
};
_ChartPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="chartGroup"></ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core27.Autowired)("chartTranslationService")
], _ChartPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  (0, import_core27.Autowired)("chartMenuService")
], _ChartPanel.prototype, "chartMenuService", 2);
__decorateClass([
  import_core27.PostConstruct
], _ChartPanel.prototype, "init", 1);
var ChartPanel = _ChartPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/seriesPanel.ts
var import_core39 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/shadowPanel.ts
var import_core28 = require("@ag-grid-community/core");
var _ShadowPanel = class _ShadowPanel extends import_core28.Component {
  constructor(chartMenuUtils, propertyKey = "shadow") {
    super();
    this.chartMenuUtils = chartMenuUtils;
    this.propertyKey = propertyKey;
  }
  init() {
    const propertyNamespace = this.propertyKey;
    const shadowGroupParams = this.chartMenuUtils.addEnableParams(
      `${propertyNamespace}.enabled`,
      {
        cssIdentifier: "charts-format-sub-level",
        direction: "vertical",
        suppressOpenCloseIcons: true,
        title: this.chartTranslationService.translate("shadow"),
        suppressEnabledCheckbox: false
      }
    );
    const shadowColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams(`${propertyNamespace}.color`);
    this.setTemplate(_ShadowPanel.TEMPLATE, {
      shadowGroup: shadowGroupParams,
      shadowColorPicker: shadowColorPickerParams,
      shadowBlurSlider: this.getSliderParams("blur", 0, 20),
      shadowXOffsetSlider: this.getSliderParams("xOffset", -10, 10),
      shadowYOffsetSlider: this.getSliderParams("yOffset", -10, 10)
    });
  }
  getSliderParams(property, minValue, defaultMaxValue) {
    const expression = `${this.propertyKey}.${property}`;
    const params = this.chartMenuUtils.getDefaultSliderParams(
      expression,
      property,
      defaultMaxValue
    );
    params.minValue = minValue;
    return params;
  }
};
_ShadowPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="shadowGroup">
                <ag-color-picker ref="shadowColorPicker"></ag-color-picker>
                <ag-slider ref="shadowBlurSlider"></ag-slider>
                <ag-slider ref="shadowXOffsetSlider"></ag-slider>
                <ag-slider ref="shadowYOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core28.Autowired)("chartTranslationService")
], _ShadowPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core28.PostConstruct
], _ShadowPanel.prototype, "init", 1);
var ShadowPanel = _ShadowPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/markersPanel.ts
var import_core29 = require("@ag-grid-community/core");
var _MarkersPanel = class _MarkersPanel extends import_core29.Component {
  constructor(chartOptionsService, chartMenuUtils) {
    super();
    this.chartOptionsService = chartOptionsService;
    this.chartMenuUtils = chartMenuUtils;
  }
  init() {
    const chartType = this.chartOptionsService.getChartType();
    const shouldHideEnabledCheckbox = import_core29._.includes(["scatter", "bubble"], chartType);
    const seriesMarkersGroupParams = this.chartMenuUtils.addEnableParams(
      "marker.enabled",
      {
        cssIdentifier: "charts-format-sub-level",
        direction: "vertical",
        title: this.chartTranslationService.translate("markers"),
        suppressEnabledCheckbox: shouldHideEnabledCheckbox,
        suppressOpenCloseIcons: true
      }
    );
    const isBubble = chartType === "bubble";
    let seriesMarkerMinSizeSliderParams;
    let seriesMarkerSizeSliderParams;
    if (isBubble) {
      seriesMarkerMinSizeSliderParams = this.getSliderParams("marker.maxSize", "maxSize", 60);
      seriesMarkerSizeSliderParams = this.getSliderParams("marker.size", "minSize", 60);
    } else {
      seriesMarkerMinSizeSliderParams = {};
      seriesMarkerSizeSliderParams = this.getSliderParams("marker.size", "size", 60);
    }
    this.setTemplate(_MarkersPanel.TEMPLATE, {
      seriesMarkersGroup: seriesMarkersGroupParams,
      seriesMarkerShapeSelect: this.getMarkerShapeSelectParams(),
      seriesMarkerMinSizeSlider: seriesMarkerMinSizeSliderParams,
      seriesMarkerSizeSlider: seriesMarkerSizeSliderParams,
      seriesMarkerStrokeWidthSlider: this.getSliderParams("marker.strokeWidth", "strokeWidth", 10)
    });
    if (!isBubble) {
      this.seriesMarkerMinSizeSlider.setDisplayed(false);
    }
  }
  getMarkerShapeSelectParams() {
    const options = [
      {
        value: "square",
        text: "Square"
      },
      {
        value: "circle",
        text: "Circle"
      },
      {
        value: "cross",
        text: "Cross"
      },
      {
        value: "diamond",
        text: "Diamond"
      },
      {
        value: "plus",
        text: "Plus"
      },
      {
        value: "triangle",
        text: "Triangle"
      },
      {
        value: "heart",
        text: "Heart"
      }
    ];
    return this.chartMenuUtils.addValueParams(
      "marker.shape",
      {
        options,
        label: this.chartTranslationService.translate("shape")
      }
    );
  }
  getSliderParams(expression, labelKey, defaultMaxValue) {
    return this.chartMenuUtils.getDefaultSliderParams(
      expression,
      labelKey,
      defaultMaxValue
    );
  }
};
_MarkersPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="seriesMarkersGroup">
                <ag-select ref="seriesMarkerShapeSelect"></ag-select>
                <ag-slider ref="seriesMarkerMinSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerSizeSlider"></ag-slider>
                <ag-slider ref="seriesMarkerStrokeWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core29.RefSelector)("seriesMarkerMinSizeSlider")
], _MarkersPanel.prototype, "seriesMarkerMinSizeSlider", 2);
__decorateClass([
  (0, import_core29.Autowired)("chartTranslationService")
], _MarkersPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core29.PostConstruct
], _MarkersPanel.prototype, "init", 1);
var MarkersPanel = _MarkersPanel;

// enterprise-modules/charts/src/widgets/agColorPanel.ts
var import_core30 = require("@ag-grid-community/core");
var import_ag_charts_community4 = require("ag-charts-community");
var import_core31 = require("@ag-grid-community/core");
var _AgColorPanel = class _AgColorPanel extends import_core30.Component {
  constructor(config) {
    super(_AgColorPanel.TEMPLATE);
    this.H = 1;
    // in the [0, 1] range
    this.S = 1;
    // in the [0, 1] range
    this.B = 1;
    // in the [0, 1] range
    this.A = 1;
    this.isSpectrumDragging = false;
    this.isSpectrumHueDragging = false;
    this.isSpectrumAlphaDragging = false;
    this.colorChanged = false;
    this.picker = config.picker;
  }
  postConstruct() {
    this.initTabIndex();
    this.initRecentColors();
    this.addGuiEventListener("focus", () => this.spectrumColor.focus());
    this.addGuiEventListener("keydown", (e) => {
      if (e.key === import_core31.KeyCode.ENTER && !e.defaultPrevented) {
        this.destroy();
      }
    });
    this.addManagedListener(this.spectrumColor, "keydown", (e) => this.moveDragger(e));
    this.addManagedListener(this.spectrumAlphaSlider, "keydown", (e) => this.moveAlphaSlider(e));
    this.addManagedListener(this.spectrumHueSlider, "keydown", (e) => this.moveHueSlider(e));
    this.addManagedListener(this.spectrumVal, "mousedown", this.onSpectrumDraggerDown.bind(this));
    this.addManagedListener(this.spectrumHue, "mousedown", this.onSpectrumHueDown.bind(this));
    this.addManagedListener(this.spectrumAlpha, "mousedown", this.onSpectrumAlphaDown.bind(this));
    this.addGuiEventListener("mousemove", (e) => {
      this.onSpectrumDraggerMove(e);
      this.onSpectrumHueMove(e);
      this.onSpectrumAlphaMove(e);
    });
    this.addManagedListener(document, "mouseup", this.onMouseUp.bind(this));
    this.addManagedListener(this.recentColors, "click", this.onRecentColorClick.bind(this));
    this.addManagedListener(this.recentColors, "keydown", (e) => {
      if (e.key === import_core31.KeyCode.ENTER || e.key === import_core31.KeyCode.SPACE) {
        e.preventDefault();
        this.onRecentColorClick(e);
      }
    });
  }
  initTabIndex() {
    const tabIndex = this.tabIndex = this.gos.get("tabIndex").toString();
    this.spectrumColor.setAttribute("tabindex", tabIndex);
    this.spectrumHueSlider.setAttribute("tabindex", tabIndex);
    this.spectrumAlphaSlider.setAttribute("tabindex", tabIndex);
  }
  refreshSpectrumRect() {
    return this.spectrumValRect = this.spectrumVal.getBoundingClientRect();
  }
  refreshHueRect() {
    return this.spectrumHueRect = this.spectrumHue.getBoundingClientRect();
  }
  refreshAlphaRect() {
    return this.spectrumAlphaRect = this.spectrumAlpha.getBoundingClientRect();
  }
  onSpectrumDraggerDown(e) {
    this.refreshSpectrumRect();
    this.isSpectrumDragging = true;
    this.moveDragger(e);
  }
  onSpectrumDraggerMove(e) {
    if (this.isSpectrumDragging) {
      this.moveDragger(e);
    }
  }
  onSpectrumHueDown(e) {
    this.refreshHueRect();
    this.isSpectrumHueDragging = true;
    this.moveHueSlider(e);
  }
  onSpectrumHueMove(e) {
    if (this.isSpectrumHueDragging) {
      this.moveHueSlider(e);
    }
  }
  onSpectrumAlphaDown(e) {
    this.refreshAlphaRect();
    this.isSpectrumAlphaDragging = true;
    this.moveAlphaSlider(e);
  }
  onSpectrumAlphaMove(e) {
    if (this.isSpectrumAlphaDragging) {
      this.moveAlphaSlider(e);
    }
  }
  onMouseUp() {
    this.isSpectrumDragging = false;
    this.isSpectrumHueDragging = false;
    this.isSpectrumAlphaDragging = false;
  }
  moveDragger(e) {
    const valRect = this.spectrumValRect;
    if (!valRect) {
      return;
    }
    let x;
    let y;
    if (e instanceof MouseEvent) {
      x = e.clientX - valRect.left;
      y = e.clientY - valRect.top;
    } else {
      const isLeft = e.key === import_core31.KeyCode.LEFT;
      const isRight = e.key === import_core31.KeyCode.RIGHT;
      const isUp = e.key === import_core31.KeyCode.UP;
      const isDown = e.key === import_core31.KeyCode.DOWN;
      const isVertical = isUp || isDown;
      const isHorizontal = isLeft || isRight;
      if (!isVertical && !isHorizontal) {
        return;
      }
      e.preventDefault();
      const { x: currentX, y: currentY } = this.getSpectrumValue();
      x = currentX + (isHorizontal ? isLeft ? -5 : 5 : 0);
      y = currentY + (isVertical ? isUp ? -5 : 5 : 0);
    }
    x = Math.max(x, 0);
    x = Math.min(x, valRect.width);
    y = Math.max(y, 0);
    y = Math.min(y, valRect.height);
    this.setSpectrumValue(x / valRect.width, 1 - y / valRect.height);
  }
  moveHueSlider(e) {
    const rect = this.spectrumHueRect;
    if (!rect) {
      return;
    }
    const x = this.moveSlider(this.spectrumHueSlider, e);
    if (x == null) {
      return;
    }
    this.H = 1 - x / rect.width;
    this.update();
  }
  moveAlphaSlider(e) {
    const rect = this.spectrumAlphaRect;
    if (!rect) {
      return;
    }
    const x = this.moveSlider(this.spectrumAlphaSlider, e);
    if (x == null) {
      return;
    }
    this.A = x / rect.width;
    this.update();
  }
  moveSlider(slider, e) {
    var _a;
    const sliderRect = slider.getBoundingClientRect();
    const parentRect = (_a = slider.parentElement) == null ? void 0 : _a.getBoundingClientRect();
    if (!slider || !parentRect) {
      return null;
    }
    let x;
    if (e instanceof MouseEvent) {
      x = e.clientX - parentRect.left;
    } else {
      const isLeft = e.key === import_core31.KeyCode.LEFT;
      const isRight = e.key === import_core31.KeyCode.RIGHT;
      if (!isLeft && !isRight) {
        return null;
      }
      e.preventDefault();
      const diff = isLeft ? -5 : 5;
      x = parseFloat(slider.style.left) - sliderRect.width / 2 + diff;
    }
    x = Math.max(x, 0);
    x = Math.min(x, parentRect.width);
    slider.style.left = x + sliderRect.width / 2 + "px";
    return x;
  }
  update() {
    const color = import_ag_charts_community4._Util.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
    const spectrumColor = import_ag_charts_community4._Util.Color.fromHSB(this.H * 360, 1, 1);
    const rgbaColor = color.toRgbaString();
    const colorPicker = this.picker;
    const existingColor = import_ag_charts_community4._Util.Color.fromString(colorPicker.getValue());
    if (existingColor.toRgbaString() !== rgbaColor) {
      this.colorChanged = true;
    }
    colorPicker.setValue(rgbaColor);
    this.spectrumColor.style.backgroundColor = spectrumColor.toRgbaString();
    this.spectrumDragger.style.backgroundColor = rgbaColor;
  }
  /**
   * @param saturation In the [0, 1] interval.
   * @param brightness In the [0, 1] interval.
   */
  setSpectrumValue(saturation, brightness) {
    const valRect = this.spectrumValRect || this.refreshSpectrumRect();
    if (valRect == null) {
      return;
    }
    const dragger = this.spectrumDragger;
    const draggerRect = dragger.getBoundingClientRect();
    saturation = Math.max(0, saturation);
    saturation = Math.min(1, saturation);
    brightness = Math.max(0, brightness);
    brightness = Math.min(1, brightness);
    this.S = saturation;
    this.B = brightness;
    dragger.style.left = saturation * valRect.width - draggerRect.width / 2 + "px";
    dragger.style.top = (1 - brightness) * valRect.height - draggerRect.height / 2 + "px";
    this.update();
  }
  getSpectrumValue() {
    const dragger = this.spectrumDragger;
    const draggerRect = dragger.getBoundingClientRect();
    const x = parseFloat(dragger.style.left) + draggerRect.width / 2;
    const y = parseFloat(dragger.style.top) + draggerRect.height / 2;
    return { x, y };
  }
  initRecentColors() {
    const recentColors = _AgColorPanel.recentColors;
    const innerHtml = recentColors.map((color, index) => {
      return (
        /* html */
        `<div class="ag-recent-color" id=${index} style="background-color: ${color}; width: 15px; height: 15px;" recent-color="${color}" tabIndex="${this.tabIndex}"></div>`
      );
    });
    this.recentColors.innerHTML = innerHtml.join("");
  }
  setValue(val) {
    const color = import_ag_charts_community4._Util.Color.fromString(val);
    const [h, s, b] = color.toHSB();
    this.H = (isNaN(h) ? 0 : h) / 360;
    this.A = color.a;
    const spectrumHueRect = this.spectrumHueRect || this.refreshHueRect();
    const spectrumAlphaRect = this.spectrumAlphaRect || this.refreshAlphaRect();
    this.spectrumHueSlider.style.left = `${(this.H - 1) * -spectrumHueRect.width}px`;
    this.spectrumAlphaSlider.style.left = `${this.A * spectrumAlphaRect.width}px`;
    this.setSpectrumValue(s, b);
  }
  onRecentColorClick(e) {
    const target = e.target;
    if (!import_core30._.exists(target.id)) {
      return;
    }
    const id = parseInt(target.id, 10);
    this.setValue(_AgColorPanel.recentColors[id]);
    this.destroy();
  }
  addRecentColor() {
    const color = import_ag_charts_community4._Util.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
    const rgbaColor = color.toRgbaString();
    let recentColors = _AgColorPanel.recentColors;
    if (!this.colorChanged || recentColors[0] === rgbaColor) {
      return;
    }
    recentColors = recentColors.filter((currentColor) => currentColor != rgbaColor);
    recentColors = [rgbaColor].concat(recentColors);
    if (recentColors.length > _AgColorPanel.maxRecentColors) {
      recentColors = recentColors.slice(0, _AgColorPanel.maxRecentColors);
    }
    _AgColorPanel.recentColors = recentColors;
  }
  destroy() {
    this.addRecentColor();
    super.destroy();
  }
};
_AgColorPanel.maxRecentColors = 8;
_AgColorPanel.recentColors = [];
_AgColorPanel.TEMPLATE = /* html */
`<div class="ag-color-panel" tabindex="-1">
            <div ref="spectrumColor" class="ag-spectrum-color">
                <div class="ag-spectrum-sat ag-spectrum-fill">
                    <div ref="spectrumVal" class="ag-spectrum-val ag-spectrum-fill">
                        <div ref="spectrumDragger" class="ag-spectrum-dragger"></div>
                    </div>
                </div>
            </div>
            <div class="ag-spectrum-tools">
                <div ref="spectrumHue" class="ag-spectrum-hue ag-spectrum-tool">
                    <div class="ag-spectrum-hue-background"></div>
                    <div ref="spectrumHueSlider" class="ag-spectrum-slider"></div>
                </div>
                <div ref="spectrumAlpha" class="ag-spectrum-alpha ag-spectrum-tool">
                    <div class="ag-spectrum-alpha-background"></div>
                    <div ref="spectrumAlphaSlider" class="ag-spectrum-slider"></div>
                </div>
                <div ref="recentColors" class="ag-recent-colors"></div>
            </div>
        </div>`;
__decorateClass([
  (0, import_core30.RefSelector)("spectrumColor")
], _AgColorPanel.prototype, "spectrumColor", 2);
__decorateClass([
  (0, import_core30.RefSelector)("spectrumVal")
], _AgColorPanel.prototype, "spectrumVal", 2);
__decorateClass([
  (0, import_core30.RefSelector)("spectrumDragger")
], _AgColorPanel.prototype, "spectrumDragger", 2);
__decorateClass([
  (0, import_core30.RefSelector)("spectrumHue")
], _AgColorPanel.prototype, "spectrumHue", 2);
__decorateClass([
  (0, import_core30.RefSelector)("spectrumHueSlider")
], _AgColorPanel.prototype, "spectrumHueSlider", 2);
__decorateClass([
  (0, import_core30.RefSelector)("spectrumAlpha")
], _AgColorPanel.prototype, "spectrumAlpha", 2);
__decorateClass([
  (0, import_core30.RefSelector)("spectrumAlphaSlider")
], _AgColorPanel.prototype, "spectrumAlphaSlider", 2);
__decorateClass([
  (0, import_core30.RefSelector)("recentColors")
], _AgColorPanel.prototype, "recentColors", 2);
__decorateClass([
  import_core30.PostConstruct
], _AgColorPanel.prototype, "postConstruct", 1);
var AgColorPanel = _AgColorPanel;

// enterprise-modules/charts/src/widgets/agColorPicker.ts
var import_core32 = require("@ag-grid-community/core");
var AgColorPicker = class extends import_core32.AgPickerField {
  constructor(config) {
    super(__spreadValues({
      pickerAriaLabelKey: "ariaLabelColorPicker",
      pickerAriaLabelValue: "Color Picker",
      pickerType: "ag-list",
      className: "ag-color-picker",
      pickerIcon: "colorPicker"
    }, config));
  }
  postConstruct() {
    super.postConstruct();
    if (this.value) {
      this.setValue(this.value);
    }
  }
  createPickerComponent() {
    const eGuiRect = this.getGui().getBoundingClientRect();
    const colorDialog = this.createBean(new import_core32.AgDialog({
      closable: false,
      modal: true,
      hideTitleBar: true,
      minWidth: 190,
      width: 190,
      height: 250,
      x: eGuiRect.right - 190,
      y: eGuiRect.top - 250
    }));
    return colorDialog;
  }
  renderAndPositionPicker() {
    const pickerComponent = this.pickerComponent;
    const colorPanel = this.createBean(new AgColorPanel({ picker: this }));
    pickerComponent.addCssClass("ag-color-dialog");
    colorPanel.addDestroyFunc(() => {
      if (pickerComponent.isAlive()) {
        this.destroyBean(pickerComponent);
      }
    });
    pickerComponent.setParentComponent(this);
    pickerComponent.setBodyComponent(colorPanel);
    colorPanel.setValue(this.getValue());
    colorPanel.getGui().focus();
    pickerComponent.addDestroyFunc(() => {
      if (!this.isDestroyingPicker) {
        this.beforeHidePicker();
        this.isDestroyingPicker = true;
        if (colorPanel.isAlive()) {
          this.destroyBean(colorPanel);
        }
        if (this.isAlive()) {
          this.getFocusableElement().focus();
        }
      } else {
        this.isDestroyingPicker = false;
      }
    });
    return () => {
      var _a;
      return (_a = this.pickerComponent) == null ? void 0 : _a.close();
    };
  }
  setValue(color) {
    if (this.value === color) {
      return this;
    }
    this.eDisplayField.style.backgroundColor = color;
    return super.setValue(color);
  }
  getValue() {
    return this.value;
  }
};

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/calloutPanel.ts
var import_core33 = require("@ag-grid-community/core");
var _CalloutPanel = class _CalloutPanel extends import_core33.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
  }
  init() {
    const calloutGroupParams = {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      title: this.chartTranslationService.translate("callout"),
      enabled: true,
      suppressOpenCloseIcons: true,
      suppressEnabledCheckbox: true
    };
    this.setTemplate(_CalloutPanel.TEMPLATE, {
      calloutGroup: calloutGroupParams,
      calloutLengthSlider: this.chartMenuUtils.getDefaultSliderParams("calloutLine.length", "length", 40),
      calloutStrokeWidthSlider: this.chartMenuUtils.getDefaultSliderParams("calloutLine.strokeWidth", "strokeWidth", 10),
      labelOffsetSlider: this.chartMenuUtils.getDefaultSliderParams("calloutLabel.offset", "offset", 30)
    });
  }
};
_CalloutPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="calloutGroup">
                <ag-slider ref="calloutLengthSlider"></ag-slider>
                <ag-slider ref="calloutStrokeWidthSlider"></ag-slider>
                <ag-slider ref="labelOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core33.Autowired)("chartTranslationService")
], _CalloutPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core33.PostConstruct
], _CalloutPanel.prototype, "init", 1);
var CalloutPanel = _CalloutPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/capsPanel.ts
var import_core34 = require("@ag-grid-community/core");
var _CapsPanel = class _CapsPanel extends import_core34.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
  }
  init() {
    const capsGroupParams = {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      title: this.chartTranslationService.translate("cap"),
      enabled: true,
      suppressOpenCloseIcons: true,
      suppressEnabledCheckbox: true
    };
    const capLengthRatioSliderParams = this.chartMenuUtils.getDefaultSliderParams("cap.lengthRatio", "capLengthRatio", 1);
    capLengthRatioSliderParams.step = 0.05;
    this.setTemplate(_CapsPanel.TEMPLATE, {
      capsGroup: capsGroupParams,
      capLengthRatioSlider: capLengthRatioSliderParams
    });
  }
};
_CapsPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="capsGroup">
                <ag-slider ref="capLengthRatioSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core34.Autowired)("chartTranslationService")
], _CapsPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core34.PostConstruct
], _CapsPanel.prototype, "init", 1);
var CapsPanel = _CapsPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/connectorLinePanel.ts
var import_core35 = require("@ag-grid-community/core");
var _ConnectorLinePanel = class _ConnectorLinePanel extends import_core35.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
  }
  init() {
    const lineGroupParams = {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      title: this.chartTranslationService.translate("connectorLine"),
      enabled: true,
      suppressOpenCloseIcons: true,
      suppressEnabledCheckbox: true
    };
    this.setTemplate(_ConnectorLinePanel.TEMPLATE, {
      lineGroup: lineGroupParams,
      lineColorPicker: this.chartMenuUtils.getDefaultColorPickerParams("line.stroke"),
      lineStrokeWidthSlider: this.getSliderParams("strokeWidth", 10, "line.strokeWidth"),
      lineDashSlider: this.getSliderParams("lineDash", 30, "line.lineDash", 1, true),
      lineOpacitySlider: this.getSliderParams("strokeOpacity", 1, "line.strokeOpacity", 0.05)
    });
  }
  getSliderParams(labelKey, maxValue, seriesOptionKey, step = 1, isArray = false) {
    const params = this.chartMenuUtils.getDefaultSliderParams(seriesOptionKey, labelKey, maxValue, isArray);
    params.step = step;
    return params;
  }
};
_ConnectorLinePanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="lineGroup">
                <ag-color-picker ref="lineColorPicker"></ag-color-picker>
                <ag-slider ref="lineStrokeWidthSlider"></ag-slider>
                <ag-slider ref="lineOpacitySlider"></ag-slider>
                <ag-slider ref="lineDashSlider"></ag-slider>                
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core35.Autowired)("chartTranslationService")
], _ConnectorLinePanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core35.PostConstruct
], _ConnectorLinePanel.prototype, "init", 1);
var ConnectorLinePanel = _ConnectorLinePanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/whiskersPanel.ts
var import_core36 = require("@ag-grid-community/core");
var _WhiskersPanel = class _WhiskersPanel extends import_core36.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
  }
  init() {
    const whiskersGroupParams = {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      title: this.chartTranslationService.translate("whisker"),
      enabled: true,
      suppressOpenCloseIcons: true,
      suppressEnabledCheckbox: true
    };
    this.setTemplate(_WhiskersPanel.TEMPLATE, {
      whiskersGroup: whiskersGroupParams,
      whiskerColorPicker: this.chartMenuUtils.getDefaultColorPickerParams("whisker.stroke"),
      whiskerThicknessSlider: this.chartMenuUtils.getDefaultSliderParams("whisker.strokeWidth", "strokeWidth", 10),
      whiskerOpacitySlider: this.chartMenuUtils.getDefaultSliderParams("whisker.strokeOpacity", "strokeOpacity", 1),
      whiskerLineDashSlider: this.chartMenuUtils.getDefaultSliderParams("whisker.lineDash", "lineDash", 30, true),
      whiskerLineDashOffsetSlider: this.chartMenuUtils.getDefaultSliderParams("whisker.lineDashOffset", "lineDashOffset", 30)
    });
  }
};
_WhiskersPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="whiskersGroup">
                <ag-color-picker ref="whiskerColorPicker"></ag-color-picker>
                <ag-slider ref="whiskerThicknessSlider"></ag-slider>
                <ag-slider ref="whiskerOpacitySlider"></ag-slider>
                <ag-slider ref="whiskerLineDashSlider"></ag-slider>
                <ag-slider ref="whiskerLineDashOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core36.Autowired)("chartTranslationService")
], _WhiskersPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core36.PostConstruct
], _WhiskersPanel.prototype, "init", 1);
var WhiskersPanel = _WhiskersPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/seriesItemsPanel.ts
var import_core37 = require("@ag-grid-community/core");
var _SeriesItemsPanel = class _SeriesItemsPanel extends import_core37.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
    this.activePanels = [];
  }
  init() {
    const seriesItemsGroupParams = {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      title: this.chartTranslationService.translate("seriesItems"),
      enabled: true,
      suppressOpenCloseIcons: true,
      suppressEnabledCheckbox: true
    };
    this.setTemplate(_SeriesItemsPanel.TEMPLATE, {
      seriesItemsGroup: seriesItemsGroupParams,
      seriesItemSelect: this.getSeriesItemsParams()
    });
    this.initSeriesControls();
  }
  getSeriesItemsParams() {
    const options = [
      { value: "positive", text: this.chartTranslationService.translate("seriesItemPositive") },
      { value: "negative", text: this.chartTranslationService.translate("seriesItemNegative") }
    ];
    const seriesItemChangedCallback = (newValue) => {
      this.destroyActivePanels();
      this.initSeriesControls(newValue);
    };
    return {
      label: this.chartTranslationService.translate("seriesItemType"),
      labelAlignment: "left",
      labelWidth: "flex",
      inputWidth: "flex",
      options,
      value: "positive",
      onValueChange: seriesItemChangedCallback
    };
  }
  initSeriesControls(itemType = "positive") {
    this.initSlider("strokeWidth", 10, `item.${itemType}.strokeWidth`);
    this.initSlider("lineDash", 30, `item.${itemType}.lineDash`, 1, true);
    this.initSlider("strokeOpacity", 1, `item.${itemType}.strokeOpacity`, 0.05, false);
    this.initSlider("fillOpacity", 1, `item.${itemType}.fillOpacity`, 0.05, false);
    this.initItemLabels(itemType);
  }
  initSlider(labelKey, maxValue, seriesOptionKey, step = 1, isArray = false) {
    const params = this.chartMenuUtils.getDefaultSliderParams(
      seriesOptionKey,
      labelKey,
      maxValue,
      isArray
    );
    params.step = step;
    const itemSlider = this.seriesItemsGroup.createManagedBean(new import_core37.AgSlider(params));
    this.seriesItemsGroup.addItem(itemSlider);
    this.activePanels.push(itemSlider);
  }
  initItemLabels(itemType) {
    const sectorParams = this.chartMenuUtils.getDefaultFontPanelParams(`item.${itemType}.label`, "seriesItemLabels");
    const labelPanelComp = this.createBean(new FontPanel(sectorParams));
    this.seriesItemsGroup.addItem(labelPanelComp);
    this.activePanels.push(labelPanelComp);
  }
  destroyActivePanels() {
    this.activePanels.forEach((panel) => {
      import_core37._.removeFromParent(panel.getGui());
      this.destroyBean(panel);
    });
  }
  destroy() {
    this.destroyActivePanels();
    super.destroy();
  }
};
_SeriesItemsPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="seriesItemsGroup">
                <ag-select ref="seriesItemSelect"></ag-select>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core37.RefSelector)("seriesItemsGroup")
], _SeriesItemsPanel.prototype, "seriesItemsGroup", 2);
__decorateClass([
  (0, import_core37.Autowired)("chartTranslationService")
], _SeriesItemsPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core37.PostConstruct
], _SeriesItemsPanel.prototype, "init", 1);
var SeriesItemsPanel = _SeriesItemsPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/tileSpacingPanel.ts
var import_core38 = require("@ag-grid-community/core");
var _TileSpacingPanel = class _TileSpacingPanel extends import_core38.Component {
  constructor(chartMenuUtils) {
    super();
    this.chartMenuUtils = chartMenuUtils;
  }
  init() {
    const groupParams = {
      cssIdentifier: "charts-format-sub-level",
      direction: "vertical",
      enabled: true,
      suppressOpenCloseIcons: true,
      suppressEnabledCheckbox: true
    };
    this.setTemplate(_TileSpacingPanel.TEMPLATE, {
      groupSpacing: __spreadProps(__spreadValues({}, groupParams), { title: this.chartTranslationService.translate("group") }),
      tileSpacing: __spreadProps(__spreadValues({}, groupParams), { title: this.chartTranslationService.translate("tile") }),
      groupPaddingSlider: this.getSliderParams("padding", "group.padding"),
      groupSpacingSlider: this.getSliderParams("spacing", "group.gap"),
      tilePaddingSlider: this.getSliderParams("padding", "tile.padding"),
      tileSpacingSlider: this.getSliderParams("spacing", "tile.gap")
    });
  }
  getSliderParams(labelKey, key) {
    return this.chartMenuUtils.getDefaultSliderParams(key, labelKey, 10);
  }
};
_TileSpacingPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="groupSpacing">
                <ag-slider ref="groupPaddingSlider"></ag-slider>
                <ag-slider ref="groupSpacingSlider"></ag-slider>
            </ag-group-component>
            <ag-group-component ref="tileSpacing">
                <ag-slider ref="tilePaddingSlider"></ag-slider>
                <ag-slider ref="tileSpacingSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core38.Autowired)("chartTranslationService")
], _TileSpacingPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core38.PostConstruct
], _TileSpacingPanel.prototype, "init", 1);
var TileSpacingPanel = _TileSpacingPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/series/seriesPanel.ts
var _SeriesPanel = class _SeriesPanel extends import_core39.Component {
  constructor({
    chartController,
    chartOptionsService,
    seriesType,
    isExpandedOnInit = false
  }) {
    super();
    this.activePanels = [];
    this.widgetFuncs = {
      lineWidth: () => this.initStrokeWidth("lineWidth"),
      strokeWidth: () => this.initStrokeWidth("strokeWidth"),
      lineColor: () => this.initLineColor(),
      lineDash: () => this.initLineDash(),
      lineOpacity: () => this.initLineOpacity(),
      fillOpacity: () => this.initFillOpacity(),
      markers: () => this.initMarkers(),
      labels: () => this.initLabels(),
      shadow: () => this.initShadow(),
      tooltips: () => this.initTooltips(),
      bins: () => this.initBins(),
      whiskers: () => this.initWhiskers(),
      caps: () => this.initCaps(),
      connectorLine: () => this.initConnectorLine(),
      seriesItems: () => this.initSeriesItemsPanel(),
      tileSpacing: () => this.initTileSpacingPanel(),
      groupType: () => this.initGroupType()
    };
    this.seriesWidgetMappings = {
      bar: ["tooltips", "strokeWidth", "lineDash", "lineOpacity", "fillOpacity", "labels", "shadow"],
      pie: ["tooltips", "strokeWidth", "lineOpacity", "fillOpacity", "labels", "shadow"],
      donut: ["tooltips", "strokeWidth", "lineOpacity", "fillOpacity", "labels", "shadow"],
      line: ["tooltips", "lineWidth", "lineDash", "lineOpacity", "markers", "labels"],
      scatter: ["tooltips", "markers", "labels"],
      bubble: ["tooltips", "markers", "labels"],
      area: ["tooltips", "lineWidth", "lineDash", "lineOpacity", "fillOpacity", "markers", "labels", "shadow"],
      histogram: ["tooltips", "bins", "strokeWidth", "lineDash", "lineOpacity", "fillOpacity", "labels", "shadow"],
      "radial-column": ["tooltips", "strokeWidth", "lineDash", "lineOpacity", "fillOpacity", "labels", "groupType"],
      "radial-bar": ["tooltips", "strokeWidth", "lineDash", "lineOpacity", "fillOpacity", "labels", "groupType"],
      "radar-line": ["tooltips", "strokeWidth", "lineDash", "lineOpacity", "markers", "labels"],
      "radar-area": ["tooltips", "strokeWidth", "lineDash", "lineOpacity", "fillOpacity", "markers", "labels"],
      nightingale: ["tooltips", "strokeWidth", "lineDash", "lineOpacity", "fillOpacity", "labels", "groupType"],
      "box-plot": ["tooltips", "strokeWidth", "lineDash", "lineOpacity", "fillOpacity", "whiskers", "caps"],
      "range-bar": ["tooltips", "strokeWidth", "lineDash", "lineOpacity", "fillOpacity", "labels"],
      "range-area": ["tooltips", "lineWidth", "lineDash", "lineOpacity", "fillOpacity", "markers", "labels", "shadow"],
      treemap: ["tooltips", "tileSpacing"],
      sunburst: ["tooltips"],
      heatmap: ["tooltips", "labels", "lineColor", "lineWidth", "lineOpacity"],
      waterfall: ["tooltips", "connectorLine", "seriesItems"]
    };
    this.chartController = chartController;
    this.chartOptionsService = chartOptionsService;
    this.seriesType = seriesType || this.chartController.getChartSeriesType();
    this.isExpandedOnInit = isExpandedOnInit;
  }
  init() {
    const seriesGroupParams = {
      cssIdentifier: "charts-format-top-level",
      direction: "vertical",
      title: this.translate("series"),
      expanded: this.isExpandedOnInit,
      suppressEnabledCheckbox: true
    };
    this.setTemplate(_SeriesPanel.TEMPLATE, { seriesGroup: seriesGroupParams });
    this.chartMenuUtils = this.createManagedBean(new ChartMenuParamsFactory(
      this.chartOptionsService.getSeriesOptionsProxy(() => this.seriesType)
    ));
    this.chartOptions = this.chartMenuUtils.getChartOptions();
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED, this.refreshWidgets.bind(this));
    this.refreshWidgets();
  }
  refreshWidgets() {
    this.destroyActivePanels();
    const chart = this.chartController.getChartProxy().getChart();
    chart.waitForUpdate().then(() => {
      var _a;
      const componentWasRemoved = !this.isAlive();
      if (componentWasRemoved) {
        return;
      }
      if (this.chartController.isComboChart()) {
        this.updateSeriesType();
        this.initSeriesSelect();
      }
      ((_a = this.seriesWidgetMappings[this.seriesType]) != null ? _a : []).forEach((w) => this.widgetFuncs[w]());
    }).catch((e) => console.error(`AG Grid - chart rendering failed`, e));
  }
  initSeriesSelect() {
    const seriesSelect = this.seriesGroup.createManagedBean(new import_core39.AgSelect({
      label: this.translate("seriesType"),
      labelAlignment: "left",
      labelWidth: "flex",
      inputWidth: "flex",
      options: this.getSeriesSelectOptions(),
      value: `${this.seriesType}`,
      onValueChange: (newValue) => {
        this.seriesType = newValue;
        this.refreshWidgets();
      }
    }));
    this.seriesGroup.addItem(seriesSelect);
    this.activePanels.push(seriesSelect);
  }
  initTooltips() {
    const seriesTooltipsToggle = this.createBean(new import_core39.AgToggleButton(this.chartMenuUtils.addValueParams(
      "tooltip.enabled",
      {
        label: this.translate("tooltips"),
        labelAlignment: "left",
        labelWidth: "flex",
        inputWidth: "flex"
      }
    )));
    this.addWidget(seriesTooltipsToggle);
  }
  initLineColor() {
    const seriesLineColorPicker = this.createBean(new AgColorPicker(this.chartMenuUtils.getDefaultColorPickerParams(
      "stroke",
      "strokeColor"
    )));
    this.addWidget(seriesLineColorPicker);
  }
  initStrokeWidth(labelKey) {
    const seriesStrokeWidthSlider = this.createBean(new import_core39.AgSlider(this.chartMenuUtils.getDefaultSliderParams(
      "strokeWidth",
      labelKey,
      10
    )));
    this.addWidget(seriesStrokeWidthSlider);
  }
  initLineDash() {
    const seriesLineDashSlider = this.createBean(new import_core39.AgSlider(this.chartMenuUtils.getDefaultSliderParams(
      "lineDash",
      "lineDash",
      30,
      true
    )));
    this.addWidget(seriesLineDashSlider);
  }
  initLineOpacity() {
    const params = this.chartMenuUtils.getDefaultSliderParams(
      "strokeOpacity",
      "strokeOpacity",
      1
    );
    params.step = 0.05;
    const seriesLineOpacitySlider = this.createBean(new import_core39.AgSlider(params));
    this.addWidget(seriesLineOpacitySlider);
  }
  initFillOpacity() {
    const params = this.chartMenuUtils.getDefaultSliderParams(
      "fillOpacity",
      "fillOpacity",
      1
    );
    params.step = 0.05;
    const seriesFillOpacitySlider = this.createBean(new import_core39.AgSlider(params));
    this.addWidget(seriesFillOpacitySlider);
  }
  initLabels() {
    const isPieChart = isPieChartSeries(this.seriesType);
    const seriesOptionLabelProperty = isPieChart ? "calloutLabel" : "label";
    const labelKey = isPieChart ? "calloutLabels" : "labels";
    const labelParams = this.chartMenuUtils.getDefaultFontPanelParams(seriesOptionLabelProperty, labelKey);
    const labelPanelComp = this.createBean(new FontPanel(labelParams));
    if (isPieChart) {
      const calloutPanelComp = this.createBean(new CalloutPanel(this.chartMenuUtils));
      labelPanelComp.addCompToPanel(calloutPanelComp);
      this.activePanels.push(calloutPanelComp);
    }
    this.addWidget(labelPanelComp);
    if (isPieChart) {
      const sectorParams = this.chartMenuUtils.getDefaultFontPanelParams("sectorLabel", "sectorLabels");
      const sectorPanelComp = this.createBean(new FontPanel(sectorParams));
      const positionRatioComp = this.getSectorLabelPositionRatio();
      sectorPanelComp.addCompToPanel(positionRatioComp);
      this.addWidget(sectorPanelComp);
    }
    if (this.seriesType === "range-bar") {
      const options = [
        { value: "inside", text: this.translate("inside") },
        { value: "outside", text: this.translate("outside") }
      ];
      const placementSelect = labelPanelComp.createManagedBean(new import_core39.AgSelect(this.chartMenuUtils.addValueParams(
        "label.placement",
        {
          label: this.translate("labelPlacement"),
          labelAlignment: "left",
          labelWidth: "flex",
          inputWidth: "flex",
          options
        }
      )));
      labelPanelComp.addCompToPanel(placementSelect);
      this.activePanels.push(placementSelect);
      const paddingSlider = labelPanelComp.createManagedBean(new import_core39.AgSlider(this.chartMenuUtils.getDefaultSliderParams(
        "label.padding",
        "padding",
        200
      )));
      labelPanelComp.addCompToPanel(paddingSlider);
      this.activePanels.push(paddingSlider);
    }
  }
  getSectorLabelPositionRatio() {
    const params = this.chartMenuUtils.getDefaultSliderParams(
      "sectorLabel.positionRatio",
      "positionRatio",
      1
    );
    params.step = 0.05;
    return this.createBean(new import_core39.AgSlider(params));
  }
  initShadow() {
    const shadowPanelComp = this.createBean(new ShadowPanel(this.chartMenuUtils));
    this.addWidget(shadowPanelComp);
  }
  initMarkers() {
    const markersPanelComp = this.createBean(new MarkersPanel(this.chartOptionsService, this.chartMenuUtils));
    this.addWidget(markersPanelComp);
  }
  initBins() {
    var _a;
    const params = this.chartMenuUtils.getDefaultSliderParams("binCount", "histogramBinCount", 20);
    const value = ((_a = this.chartOptions.getValue("bins")) != null ? _a : this.chartOptions.getValue("calculatedBins", true)).length;
    params.value = `${value}`;
    params.maxValue = Math.max(value, 20);
    const seriesBinCountSlider = this.createBean(new import_core39.AgSlider(params));
    this.addWidget(seriesBinCountSlider);
  }
  initWhiskers() {
    const whiskersPanelComp = this.createBean(new WhiskersPanel(this.chartMenuUtils));
    this.addWidget(whiskersPanelComp);
  }
  initCaps() {
    const capsPanelComp = this.createBean(new CapsPanel(this.chartMenuUtils));
    this.addWidget(capsPanelComp);
  }
  initConnectorLine() {
    const connectorLinePanelComp = this.createBean(new ConnectorLinePanel(this.chartMenuUtils));
    this.addWidget(connectorLinePanelComp);
  }
  initSeriesItemsPanel() {
    const seriesItemsPanelComp = this.createBean(new SeriesItemsPanel(this.chartMenuUtils));
    this.addWidget(seriesItemsPanelComp);
  }
  initTileSpacingPanel() {
    const tileSpacingPanelComp = this.createBean(new TileSpacingPanel(this.chartMenuUtils));
    this.addWidget(tileSpacingPanelComp);
  }
  initGroupType() {
    const groupTypeSelect = this.createBean(new import_core39.AgSelect({
      label: this.chartTranslationService.translate("seriesGroupType"),
      options: import_core39.ChartMappings.SERIES_GROUP_TYPES.map((value) => ({
        value,
        text: this.chartTranslationService.translate(`${value}SeriesGroupType`)
      })),
      value: this.chartController.getSeriesGroupType(),
      onValueChange: (value) => this.chartController.setSeriesGroupType(value)
    }));
    this.addWidget(groupTypeSelect);
  }
  addWidget(widget) {
    this.seriesGroup.addItem(widget);
    this.activePanels.push(widget);
  }
  getSeriesSelectOptions() {
    const activeSeriesTypes = this.getActiveSeriesTypes();
    return ["area", "bar", "line"].filter((seriesType) => activeSeriesTypes.includes(seriesType)).map((value) => ({ value, text: this.translate(value) }));
  }
  updateSeriesType() {
    const activeSeriesTypes = this.getActiveSeriesTypes();
    const invalidSeriesType = !activeSeriesTypes.includes(this.seriesType);
    if (invalidSeriesType && activeSeriesTypes.length > 0) {
      this.seriesType = activeSeriesTypes[0];
    }
  }
  getActiveSeriesTypes() {
    return this.chartController.getActiveSeriesChartTypes().map((s) => getSeriesType(s.chartType));
  }
  translate(key) {
    return this.chartTranslationService.translate(key);
  }
  destroyActivePanels() {
    this.activePanels.forEach((panel) => {
      import_core39._.removeFromParent(panel.getGui());
      this.destroyBean(panel);
    });
  }
  destroy() {
    this.destroyActivePanels();
    super.destroy();
  }
};
_SeriesPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="seriesGroup">
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core39.RefSelector)("seriesGroup")
], _SeriesPanel.prototype, "seriesGroup", 2);
__decorateClass([
  (0, import_core39.Autowired)("chartTranslationService")
], _SeriesPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core39.PostConstruct
], _SeriesPanel.prototype, "init", 1);
var SeriesPanel = _SeriesPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/format/legend/gradientLegendPanel.ts
var import_core40 = require("@ag-grid-community/core");
var _GradientLegendPanel = class _GradientLegendPanel extends import_core40.Component {
  constructor({ chartMenuParamsFactory: chartMenuUtils, isExpandedOnInit = false }) {
    super();
    this.chartMenuUtils = chartMenuUtils;
    this.isExpandedOnInit = isExpandedOnInit;
  }
  init() {
    const legendGroupParams = this.chartMenuUtils.addEnableParams(
      "gradientLegend.enabled",
      {
        cssIdentifier: "charts-format-top-level",
        direction: "vertical",
        title: this.chartTranslationService.translate("legend"),
        suppressEnabledCheckbox: false,
        suppressToggleExpandOnEnableChange: true,
        expanded: this.isExpandedOnInit,
        items: [this.createLabelPanel()]
      }
    );
    this.setTemplate(_GradientLegendPanel.TEMPLATE, {
      legendGroup: legendGroupParams,
      legendPositionSelect: this.chartMenuUtils.getDefaultLegendParams("gradientLegend.position"),
      gradientReverseCheckbox: this.getGradientReverseCheckboxParams(),
      gradientThicknessSlider: this.chartMenuUtils.getDefaultSliderParams("gradientLegend.gradient.thickness", "thickness", 40),
      gradientPreferredLengthSlider: this.chartMenuUtils.getDefaultSliderParams("gradientLegend.gradient.preferredLength", "preferredLength", 300),
      legendSpacingSlider: this.chartMenuUtils.getDefaultSliderParams("gradientLegend.spacing", "spacing", 200)
    });
  }
  getGradientReverseCheckboxParams() {
    return this.chartMenuUtils.addValueParams(
      "gradientLegend.reverseOrder",
      {
        label: this.chartTranslationService.translate("reverseDirection"),
        labelWidth: "flex"
      }
    );
  }
  createLabelPanel() {
    const params = {
      enabled: true,
      suppressEnabledCheckbox: true,
      chartMenuUtils: this.chartMenuUtils,
      keyMapper: (key) => `gradientLegend.scale.label.${key}`
    };
    return this.createManagedBean(new FontPanel(params));
  }
};
_GradientLegendPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-checkbox ref="gradientReverseCheckbox"></ag-checkbox>
                <ag-slider ref="gradientThicknessSlider"></ag-slider>
                <ag-slider ref="gradientPreferredLengthSlider"></ag-slider>
                <ag-slider ref="legendSpacingSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core40.Autowired)("chartTranslationService")
], _GradientLegendPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core40.PostConstruct
], _GradientLegendPanel.prototype, "init", 1);
var GradientLegendPanel = _GradientLegendPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/chartPanelFeature.ts
var import_core41 = require("@ag-grid-community/core");
var ChartPanelFeature = class extends import_core41.BeanStub {
  constructor(chartController, eGui, cssClass, createPanels) {
    super();
    this.chartController = chartController;
    this.eGui = eGui;
    this.cssClass = cssClass;
    this.createPanels = createPanels;
    this.panels = [];
  }
  postConstruct() {
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, () => this.refreshPanels(true));
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, () => this.refreshPanels(false));
  }
  addComponent(component) {
    this.createBean(component);
    this.panels.push(component);
    component.addCssClass(this.cssClass);
    this.eGui.appendChild(component.getGui());
  }
  refreshPanels(reuse) {
    const chartType = this.chartController.getChartType();
    const isGrouping = this.chartController.isGrouping();
    const seriesType = getSeriesType(chartType);
    if (reuse && chartType === this.chartType && isGrouping === this.isGrouping) {
      return;
    }
    this.destroyPanels();
    this.createPanels(chartType, seriesType);
    this.chartType = chartType;
    this.isGrouping = isGrouping;
  }
  destroyPanels() {
    this.panels.forEach((panel) => {
      import_core41._.removeFromParent(panel.getGui());
      this.destroyBean(panel);
    });
    this.panels = [];
  }
  destroy() {
    this.destroyPanels();
    super.destroy();
  }
};
__decorateClass([
  import_core41.PostConstruct
], ChartPanelFeature.prototype, "postConstruct", 1);

// enterprise-modules/charts/src/charts/chartComp/menu/format/formatPanel.ts
var DefaultFormatPanelDef = {
  groups: [
    { type: "chart" },
    { type: "legend" },
    { type: "series" },
    { type: "axis" }
  ]
};
var _FormatPanel = class _FormatPanel extends import_core42.Component {
  constructor(chartMenuContext) {
    super(_FormatPanel.TEMPLATE);
    this.chartMenuContext = chartMenuContext;
  }
  init() {
    this.chartPanelFeature = this.createManagedBean(new ChartPanelFeature(
      this.chartMenuContext.chartController,
      this.getGui(),
      "ag-chart-format-section",
      (chartType, seriesType) => this.createPanels(chartType, seriesType)
    ));
    this.chartPanelFeature.refreshPanels();
  }
  createPanels(chartType, seriesType) {
    var _a;
    (_a = this.getFormatPanelDef().groups) == null ? void 0 : _a.forEach((groupDef) => {
      const group = groupDef.type;
      if (!this.isGroupPanelShownInSeries(group, seriesType)) {
        return;
      }
      const opts = __spreadProps(__spreadValues({}, this.chartMenuContext), {
        isExpandedOnInit: groupDef.isOpen,
        seriesType
      });
      switch (group) {
        case "chart":
          this.chartPanelFeature.addComponent(new ChartPanel(opts));
          break;
        case "legend":
          const panel = ["treemap", "sunburst", "heatmap"].includes(chartType) ? new GradientLegendPanel(opts) : new LegendPanel(opts);
          this.chartPanelFeature.addComponent(panel);
          break;
        case "axis":
          if (isPolar(seriesType)) {
            this.chartPanelFeature.addComponent(new PolarAxisPanel(opts));
          } else if (isCartesian(seriesType)) {
            this.chartPanelFeature.addComponent(new CartesianAxisPanel("xAxis", opts));
            this.chartPanelFeature.addComponent(new CartesianAxisPanel("yAxis", opts));
          }
          break;
        case "horizontalAxis":
          this.chartPanelFeature.addComponent(new CartesianAxisPanel("xAxis", opts));
          break;
        case "verticalAxis":
          this.chartPanelFeature.addComponent(new CartesianAxisPanel("yAxis", opts));
          break;
        case "series":
          this.chartPanelFeature.addComponent(new SeriesPanel(opts));
          break;
        case "navigator":
          import_core42._.warnOnce(`'navigator' is now displayed in the charts advanced settings instead of the format panel, and this setting will be ignored.`);
        default:
          import_core42._.warnOnce(`Invalid charts format panel group name supplied: '${groupDef.type}'`);
      }
    });
  }
  getFormatPanelDef() {
    var _a;
    const userProvidedFormatPanelDef = (_a = this.gos.get("chartToolPanelsDef")) == null ? void 0 : _a.formatPanel;
    return userProvidedFormatPanelDef ? userProvidedFormatPanelDef : DefaultFormatPanelDef;
  }
  isGroupPanelShownInSeries(group, seriesType) {
    return ["chart", "legend", "series"].includes(group) || isCartesian(seriesType) && ["axis", "horizontalAxis", "verticalAxis"].includes(group) || isPolar(seriesType) && group === "axis";
  }
};
_FormatPanel.TEMPLATE = /* html */
`<div class="ag-chart-format-wrapper"></div>`;
__decorateClass([
  import_core42.PostConstruct
], _FormatPanel.prototype, "init", 1);
var FormatPanel = _FormatPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/chartSettingsPanel.ts
var import_core47 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniChartsContainer.ts
var import_core46 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/miniChartWithAxes.ts
var import_core44 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/miniChart.ts
var import_core43 = require("@ag-grid-community/core");
var import_ag_charts_community5 = require("ag-charts-community");
var CANVAS_CLASS = "ag-chart-mini-thumbnail-canvas";
var ERROR_MESSAGE = "AG Grid - chart update failed";
var MiniChart = class extends import_core43.Component {
  constructor(container, tooltipName) {
    super();
    this.tooltipName = tooltipName;
    this.size = 58;
    this.padding = 5;
    this.root = new import_ag_charts_community5._Scene.Group();
    const scene = new import_ag_charts_community5._Scene.Scene({
      width: this.size,
      height: this.size
    });
    scene.canvas.element.classList.add(CANVAS_CLASS);
    scene.setRoot(this.root);
    scene.setContainer(container);
    this.scene = scene;
  }
  init() {
    this.scene.canvas.element.title = this.chartTranslationService.translate(this.tooltipName);
    this.scene.render().catch((e) => {
      console.error(`${ERROR_MESSAGE}`, e);
    });
  }
};
__decorateClass([
  (0, import_core43.Autowired)("chartTranslationService")
], MiniChart.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core43.PostConstruct
], MiniChart.prototype, "init", 1);

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/miniChartWithAxes.ts
var import_ag_charts_community6 = require("ag-charts-community");
var MiniChartWithAxes = class extends MiniChart {
  constructor(container, tooltipName) {
    super(container, tooltipName);
    this.stroke = "gray";
    this.axisOvershoot = 3;
  }
  addAxes() {
    const size = this.size;
    const padding = this.padding;
    const leftAxis = new import_ag_charts_community6._Scene.Line();
    leftAxis.x1 = padding;
    leftAxis.y1 = padding;
    leftAxis.x2 = padding;
    leftAxis.y2 = size - padding + this.axisOvershoot;
    leftAxis.stroke = this.stroke;
    const bottomAxis = new import_ag_charts_community6._Scene.Line();
    bottomAxis.x1 = padding - this.axisOvershoot + 1;
    bottomAxis.y1 = size - padding;
    bottomAxis.x2 = size - padding + 1;
    bottomAxis.y2 = size - padding;
    bottomAxis.stroke = this.stroke;
    const root = this.root;
    root.append(leftAxis);
    root.append(bottomAxis);
  }
};
__decorateClass([
  import_core44.PostConstruct
], MiniChartWithAxes.prototype, "addAxes", 1);

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/miniChartHelpers.ts
var import_ag_charts_community7 = require("ag-charts-community");
function createColumnRects(params) {
  const { stacked, size, padding, xScalePadding, xScaleDomain, yScaleDomain } = params;
  const xScale = new import_ag_charts_community7._Scene.BandScale();
  xScale.domain = xScaleDomain;
  xScale.range = [padding, size - padding];
  xScale.paddingInner = xScalePadding;
  xScale.paddingOuter = xScalePadding;
  const yScale = new import_ag_charts_community7._Scene.LinearScale();
  yScale.domain = yScaleDomain;
  yScale.range = [size - padding, padding];
  const createBars = (series, xScale2, yScale2) => {
    return series.map((datum, i) => {
      const top = yScale2.convert(datum);
      const rect = new import_ag_charts_community7._Scene.Rect();
      rect.x = xScale2.convert(i);
      rect.y = top;
      rect.width = xScale2.bandwidth;
      rect.height = yScale2.convert(0) - top;
      rect.strokeWidth = 0;
      rect.crisp = true;
      return rect;
    });
  };
  if (stacked) {
    return params.data.map((d) => createBars(d, xScale, yScale));
  }
  return createBars(params.data, xScale, yScale);
}
function createLinePaths(root, data, size, padding) {
  const xScale = new import_ag_charts_community7._Scene.LinearScale();
  xScale.domain = [0, 4];
  xScale.range = [padding, size - padding];
  const yScale = new import_ag_charts_community7._Scene.LinearScale();
  yScale.domain = [0, 10];
  yScale.range = [size - padding, padding];
  const lines = data.map((series) => {
    const line = new import_ag_charts_community7._Scene.Path();
    line.strokeWidth = 3;
    line.lineCap = "round";
    line.fill = void 0;
    series.forEach((datum, i) => {
      line.path[i > 0 ? "lineTo" : "moveTo"](xScale.convert(i), yScale.convert(datum));
    });
    return line;
  });
  const linesGroup = new import_ag_charts_community7._Scene.Group();
  linesGroup.setClipRectInGroupCoordinateSpace(
    new import_ag_charts_community7._Scene.BBox(padding, padding, size - padding * 2, size - padding * 2)
  );
  linesGroup.append(lines);
  root.append(linesGroup);
  return lines;
}
function createPolarPaths(root, data, size, radius, innerRadius, markerSize = 0) {
  const angleScale = new import_ag_charts_community7._Scene.LinearScale();
  angleScale.domain = [0, 7];
  angleScale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);
  const radiusScale = new import_ag_charts_community7._Scene.LinearScale();
  radiusScale.domain = [0, 10];
  radiusScale.range = [radius, innerRadius];
  const markers = [];
  const paths = data.map((series) => {
    const path = new import_ag_charts_community7._Scene.Path();
    path.strokeWidth = 1;
    path.strokeOpacity = 0.5;
    path.lineCap = "round";
    path.fill = void 0;
    path.fillOpacity = 0.8;
    series.forEach((datum, i) => {
      const angle = angleScale.convert(i);
      const r = radius + innerRadius - radiusScale.convert(datum);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      path.path[i > 0 ? "lineTo" : "moveTo"](x, y);
      if (markerSize > 0) {
        const marker = new import_ag_charts_community7._Scene.Circle();
        marker.x = x;
        marker.y = y;
        marker.size = markerSize;
        markers.push(marker);
      }
    });
    path.path.closePath();
    return path;
  });
  const group = new import_ag_charts_community7._Scene.Group();
  const center = size / 2;
  group.translationX = center;
  group.translationY = center;
  group.append([...paths, ...markers]);
  root.append(group);
  return { paths, markers };
}
function accumulateData(data) {
  let [min, max] = [Infinity, -Infinity];
  const processedData = data.reduce((acc, curr, currIndex) => {
    var _a;
    const previous = currIndex > 0 ? acc[currIndex - 1] : void 0;
    (_a = acc[currIndex]) != null ? _a : acc[currIndex] = [];
    const current = acc[currIndex];
    curr.forEach((datum, datumIndex) => {
      if (previous) {
        datum += previous[datumIndex];
      }
      current[datumIndex] = datum;
      if (current[datumIndex] < min) {
        min = current[datumIndex];
      }
      if (current[datumIndex] > max) {
        max = current[datumIndex];
      }
    });
    return acc;
  }, []);
  return { processedData, min, max };
}

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/column/miniColumn.ts
var MiniColumn = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "groupedColumnTooltip");
    this.columnData = [2, 3, 4];
    const { root, columnData, size, padding } = this;
    this.columns = createColumnRects({
      stacked: false,
      root,
      data: columnData,
      size,
      padding,
      xScaleDomain: [0, 1, 2],
      yScaleDomain: [0, 4],
      xScalePadding: 0.3
    });
    root.append(this.columns);
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.columns.forEach((column, i) => {
      column.fill = fills[i];
      column.stroke = strokes[i];
    });
  }
};
MiniColumn.chartType = "groupedColumn";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/column/miniStackedColumn.ts
var _MiniStackedColumn = class _MiniStackedColumn extends MiniChartWithAxes {
  constructor(container, fills, strokes, _themeTemplateParameters, _isCustomTheme, data = _MiniStackedColumn.data, yScaleDomain = [0, 16], tooltipName = "stackedColumnTooltip") {
    super(container, tooltipName);
    const { root, size, padding } = this;
    this.stackedColumns = createColumnRects({
      stacked: true,
      root,
      data,
      size,
      padding,
      xScaleDomain: [0, 1, 2],
      yScaleDomain,
      xScalePadding: 0.3
    });
    root.append([].concat.apply([], this.stackedColumns));
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.stackedColumns.forEach(
      (series, i) => series.forEach((column) => {
        column.fill = fills[i];
        column.stroke = strokes[i];
      })
    );
  }
};
_MiniStackedColumn.chartType = "stackedColumn";
_MiniStackedColumn.data = [
  [8, 12, 16],
  [6, 9, 12],
  [2, 3, 4]
];
var MiniStackedColumn = _MiniStackedColumn;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/column/miniNormalizedColumn.ts
var _MiniNormalizedColumn = class _MiniNormalizedColumn extends MiniStackedColumn {
  constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
    super(container, fills, strokes, themeTemplateParameters, isCustomTheme, _MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip");
  }
};
_MiniNormalizedColumn.chartType = "normalizedColumn";
_MiniNormalizedColumn.data = [
  [10, 10, 10],
  [6, 7, 8],
  [2, 4, 6]
];
var MiniNormalizedColumn = _MiniNormalizedColumn;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/bar/miniBar.ts
var import_ag_charts_community8 = require("ag-charts-community");
var MiniBar = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "groupedBarTooltip");
    const padding = this.padding;
    const size = this.size;
    const data = [2, 3, 4];
    const yScale = new import_ag_charts_community8._Scene.BandScale();
    yScale.domain = [0, 1, 2];
    yScale.range = [padding, size - padding];
    yScale.paddingInner = 0.3;
    yScale.paddingOuter = 0.3;
    const xScale = new import_ag_charts_community8._Scene.LinearScale();
    xScale.domain = [0, 4];
    xScale.range = [size - padding, padding];
    const bottom = xScale.convert(0);
    const height = yScale.bandwidth;
    this.bars = data.map((datum, i) => {
      const rect = new import_ag_charts_community8._Scene.Rect();
      rect.x = padding;
      rect.y = yScale.convert(i);
      rect.width = bottom - xScale.convert(datum);
      rect.height = height;
      rect.strokeWidth = 0;
      rect.crisp = true;
      return rect;
    });
    this.updateColors(fills, strokes);
    this.root.append(this.bars);
  }
  updateColors(fills, strokes) {
    this.bars.forEach((bar, i) => {
      bar.fill = fills[i];
      bar.stroke = strokes[i];
    });
  }
};
MiniBar.chartType = "groupedBar";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/bar/miniStackedBar.ts
var import_ag_charts_community9 = require("ag-charts-community");
var _MiniStackedBar = class _MiniStackedBar extends MiniChartWithAxes {
  constructor(container, fills, strokes, _themeTemplateParameters, _isCustomTheme, data = _MiniStackedBar.data, xScaleDomain = [0, 16], tooltipName = "stackedBarTooltip") {
    super(container, tooltipName);
    const size = this.size;
    const padding = this.padding;
    const yScale = new import_ag_charts_community9._Scene.BandScale();
    yScale.domain = [0, 1, 2];
    yScale.range = [padding, size - padding];
    yScale.paddingInner = 0.3;
    yScale.paddingOuter = 0.3;
    const xScale = new import_ag_charts_community9._Scene.LinearScale();
    xScale.domain = xScaleDomain;
    xScale.range = [size - padding, padding];
    const bottom = xScale.convert(0);
    const height = yScale.bandwidth;
    this.bars = data.map(
      (series) => series.map((datum, i) => {
        const rect = new import_ag_charts_community9._Scene.Rect();
        rect.x = padding;
        rect.y = yScale.convert(i);
        rect.width = bottom - xScale.convert(datum);
        rect.height = height;
        rect.strokeWidth = 0;
        rect.crisp = true;
        return rect;
      })
    );
    this.updateColors(fills, strokes);
    this.root.append([].concat.apply([], this.bars));
  }
  updateColors(fills, strokes) {
    this.bars.forEach(
      (series, i) => series.forEach((bar) => {
        bar.fill = fills[i];
        bar.stroke = strokes[i];
      })
    );
  }
};
_MiniStackedBar.chartType = "stackedBar";
_MiniStackedBar.data = [
  [8, 12, 16],
  [6, 9, 12],
  [2, 3, 4]
];
var MiniStackedBar = _MiniStackedBar;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/bar/miniNormalizedBar.ts
var _MiniNormalizedBar = class _MiniNormalizedBar extends MiniStackedBar {
  constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
    super(container, fills, strokes, themeTemplateParameters, isCustomTheme, _MiniNormalizedBar.data, [0, 10], "normalizedBarTooltip");
  }
};
_MiniNormalizedBar.chartType = "normalizedBar";
_MiniNormalizedBar.data = [
  [10, 10, 10],
  [6, 7, 8],
  [2, 4, 6]
];
var MiniNormalizedBar = _MiniNormalizedBar;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/pie/miniDonut.ts
var import_ag_charts_community10 = require("ag-charts-community");
var toRadians = import_ag_charts_community10._Scene.toRadians;
var MiniDonut = class extends MiniChart {
  constructor(container, fills, strokes, _themeTemplateParameters, _isCustomTheme, centerRadiusScaler = 0.6, tooltipName = "donutTooltip") {
    super(container, tooltipName);
    const radius = (this.size - this.padding * 2) / 2;
    const center = radius + this.padding;
    const angles = [
      [toRadians(-90), toRadians(30)],
      [toRadians(30), toRadians(120)],
      [toRadians(120), toRadians(180)],
      [toRadians(180), toRadians(210)],
      [toRadians(210), toRadians(240)],
      [toRadians(240), toRadians(270)]
    ];
    this.sectors = angles.map(([startAngle, endAngle]) => {
      const sector = new import_ag_charts_community10._Scene.Sector();
      sector.centerX = center;
      sector.centerY = center;
      sector.innerRadius = radius * centerRadiusScaler;
      sector.outerRadius = radius;
      sector.startAngle = startAngle;
      sector.endAngle = endAngle;
      sector.stroke = void 0;
      sector.strokeWidth = 0;
      sector.inset = 0.75;
      return sector;
    });
    this.updateColors(fills, strokes);
    this.root.append(this.sectors);
  }
  updateColors(fills, strokes) {
    this.sectors.forEach((sector, i) => {
      sector.fill = fills[i % fills.length];
      sector.stroke = strokes[i % strokes.length];
    });
  }
};
MiniDonut.chartType = "donut";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/pie/miniPie.ts
var MiniPie = class extends MiniDonut {
  constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
    super(container, fills, strokes, themeTemplateParameters, isCustomTheme, 0, "pieTooltip");
  }
};
MiniPie.chartType = "pie";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/line/miniLine.ts
var MiniLine = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "lineTooltip");
    this.data = [
      [9, 7, 8, 5, 6],
      [5, 6, 3, 4, 1],
      [1, 3, 4, 8, 7]
    ];
    this.lines = createLinePaths(this.root, this.data, this.size, this.padding);
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.lines.forEach((line, i) => {
      line.stroke = fills[i];
    });
  }
};
MiniLine.chartType = "line";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/scatter/miniScatter.ts
var import_ag_charts_community11 = require("ag-charts-community");
var MiniScatter = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "scatterTooltip");
    const size = this.size;
    const padding = this.padding;
    const data = [
      [[0.3, 3], [1.1, 0.9], [2, 0.4], [3.4, 2.4]],
      [[0, 0.3], [1, 2], [2.4, 1.4], [3, 0]]
    ];
    const xScale = new import_ag_charts_community11._Scene.LinearScale();
    xScale.domain = [-0.5, 4];
    xScale.range = [padding * 2, size - padding];
    const yScale = new import_ag_charts_community11._Scene.LinearScale();
    yScale.domain = [-0.5, 3.5];
    yScale.range = [size - padding, padding];
    const points = [];
    data.forEach((series) => {
      series.forEach(([x, y]) => {
        const arc = new import_ag_charts_community11._Scene.Arc();
        arc.strokeWidth = 0;
        arc.centerX = xScale.convert(x);
        arc.centerY = yScale.convert(y);
        arc.radius = 2.5;
        points.push(arc);
      });
    });
    this.points = points;
    this.updateColors(fills, strokes);
    const pointsGroup = new import_ag_charts_community11._Scene.Group();
    pointsGroup.setClipRectInGroupCoordinateSpace(new import_ag_charts_community11._Scene.BBox(padding, padding, size - padding * 2, size - padding * 2));
    pointsGroup.append(this.points);
    this.root.append(pointsGroup);
  }
  updateColors(fills, strokes) {
    this.points.forEach((line, i) => {
      line.stroke = strokes[i % strokes.length];
      line.fill = fills[i % fills.length];
    });
  }
};
MiniScatter.chartType = "scatter";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/scatter/miniBubble.ts
var import_ag_charts_community12 = require("ag-charts-community");
var MiniBubble = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "bubbleTooltip");
    const size = this.size;
    const padding = this.padding;
    const data = [
      [[0.1, 0.3, 5], [0.5, 0.4, 7], [0.2, 0.8, 7]],
      [[0.8, 0.7, 5], [0.7, 0.3, 9]]
    ];
    const xScale = new import_ag_charts_community12._Scene.LinearScale();
    xScale.domain = [0, 1];
    xScale.range = [padding * 2, size - padding];
    const yScale = new import_ag_charts_community12._Scene.LinearScale();
    yScale.domain = [0, 1];
    yScale.range = [size - padding, padding];
    const points = [];
    data.forEach((series) => {
      series.forEach(([x, y, radius]) => {
        const arc = new import_ag_charts_community12._Scene.Arc();
        arc.strokeWidth = 0;
        arc.centerX = xScale.convert(x);
        arc.centerY = yScale.convert(y);
        arc.radius = radius;
        arc.fillOpacity = 0.7;
        points.push(arc);
      });
    });
    this.points = points;
    this.updateColors(fills, strokes);
    const pointsGroup = new import_ag_charts_community12._Scene.Group();
    pointsGroup.setClipRectInGroupCoordinateSpace(new import_ag_charts_community12._Scene.BBox(padding, padding, size - padding * 2, size - padding * 2));
    pointsGroup.append(this.points);
    this.root.append(pointsGroup);
  }
  updateColors(fills, strokes) {
    this.points.forEach((line, i) => {
      line.stroke = strokes[i % strokes.length];
      line.fill = fills[i % fills.length];
    });
  }
};
MiniBubble.chartType = "bubble";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/area/miniArea.ts
var import_ag_charts_community13 = require("ag-charts-community");
var _MiniArea = class _MiniArea extends MiniChartWithAxes {
  constructor(container, fills, strokes, _themeTemplateParameters, _isCustomTheme, data = _MiniArea.data) {
    super(container, "groupedAreaTooltip");
    const size = this.size;
    const padding = this.padding;
    const xScale = new import_ag_charts_community13._Scene.BandScale();
    xScale.domain = [0, 1, 2];
    xScale.paddingInner = 1;
    xScale.paddingOuter = 0;
    xScale.range = [padding + 0.5, size - padding - 0.5];
    const yScale = new import_ag_charts_community13._Scene.LinearScale();
    yScale.domain = [0, 6];
    yScale.range = [size - padding + 0.5, padding];
    const xCount = data.length;
    const last = xCount * 2 - 1;
    const pathData = [];
    const bottomY = yScale.convert(0);
    data.forEach((datum, i) => {
      const x = xScale.convert(i);
      datum.forEach((yDatum, j) => {
        const y = yScale.convert(yDatum);
        const points = pathData[j] || (pathData[j] = []);
        points[i] = {
          x,
          y
        };
        points[last - i] = {
          x,
          y: bottomY
        };
      });
    });
    this.areas = pathData.reverse().map((points) => {
      const area = new import_ag_charts_community13._Scene.Path();
      area.strokeWidth = 1;
      area.strokeOpacity = 0.75;
      area.fillOpacity = 0.7;
      const path = area.path;
      path.clear();
      points.forEach((point, i) => path[i > 0 ? "lineTo" : "moveTo"](point.x, point.y));
      path.closePath();
      return area;
    });
    this.updateColors(fills, strokes);
    this.root.append(this.areas);
  }
  updateColors(fills, strokes) {
    this.areas.forEach((area, i) => {
      area.fill = fills[i];
      area.stroke = strokes[i];
    });
  }
};
_MiniArea.chartType = "area";
_MiniArea.data = [
  [1, 3, 5],
  [2, 6, 4],
  [5, 3, 1]
];
var MiniArea = _MiniArea;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/area/miniStackedArea.ts
var import_ag_charts_community14 = require("ag-charts-community");
var _MiniStackedArea = class _MiniStackedArea extends MiniChartWithAxes {
  constructor(container, fills, strokes, _themeTemplateParameters, _isCustomTheme, data = _MiniStackedArea.data, tooltipName = "stackedAreaTooltip") {
    super(container, tooltipName);
    const size = this.size;
    const padding = this.padding;
    const xScale = new import_ag_charts_community14._Scene.BandScale();
    xScale.domain = [0, 1, 2];
    xScale.paddingInner = 1;
    xScale.paddingOuter = 0;
    xScale.range = [padding + 0.5, size - padding - 0.5];
    const yScale = new import_ag_charts_community14._Scene.LinearScale();
    yScale.domain = [0, 16];
    yScale.range = [size - padding + 0.5, padding + 0.5];
    const xCount = data.length;
    const last = xCount * 2 - 1;
    const pathData = [];
    data.forEach((datum, i) => {
      const x = xScale.convert(i);
      let total = 0;
      datum.forEach((yDatum, j) => {
        const y = yScale.convert(total + yDatum);
        const points = pathData[j] || (pathData[j] = []);
        points[i] = {
          x,
          y
        };
        points[last - i] = {
          x,
          y: yScale.convert(total)
          // bottom y
        };
        total += yDatum;
      });
    });
    this.areas = pathData.map((points) => {
      const area = new import_ag_charts_community14._Scene.Path();
      area.strokeWidth = 0;
      const path = area.path;
      path.clear();
      points.forEach((point, i) => path[i > 0 ? "lineTo" : "moveTo"](point.x, point.y));
      path.closePath();
      return area;
    });
    this.updateColors(fills, strokes);
    this.root.append(this.areas);
  }
  updateColors(fills, strokes) {
    this.areas.forEach((area, i) => {
      area.fill = fills[i];
      area.stroke = strokes[i];
    });
  }
};
_MiniStackedArea.chartType = "stackedArea";
_MiniStackedArea.data = [
  [2, 3, 2],
  [3, 6, 5],
  [6, 2, 2]
];
var MiniStackedArea = _MiniStackedArea;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/area/miniNormalizedArea.ts
var _MiniNormalizedArea = class _MiniNormalizedArea extends MiniStackedArea {
  constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme, data = _MiniNormalizedArea.data) {
    super(container, fills, strokes, themeTemplateParameters, isCustomTheme, data, "normalizedAreaTooltip");
  }
};
_MiniNormalizedArea.chartType = "normalizedArea";
_MiniNormalizedArea.data = MiniStackedArea.data.map((stack) => {
  const sum = stack.reduce((p, c) => p + c, 0);
  return stack.map((v) => v / sum * 16);
});
var MiniNormalizedArea = _MiniNormalizedArea;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/histogram/miniHistogram.ts
var import_ag_charts_community15 = require("ag-charts-community");
var MiniHistogram = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "histogramTooltip");
    const padding = this.padding;
    const size = this.size;
    const data = [2, 5, 11, 13, 10, 6, 1];
    const xScale = new import_ag_charts_community15._Scene.LinearScale();
    xScale.domain = [0, data.length];
    xScale.range = [padding, size - padding];
    const yScale = new import_ag_charts_community15._Scene.LinearScale();
    yScale.domain = [0, data.reduce((a, b) => Math.max(a, b), 0)];
    yScale.range = [size - padding, padding];
    const bottom = yScale.convert(0);
    this.bars = data.map((datum, i) => {
      const top = yScale.convert(datum);
      const left = xScale.convert(i);
      const right = xScale.convert(i + 1);
      const rect = new import_ag_charts_community15._Scene.Rect();
      rect.x = left;
      rect.y = top;
      rect.width = right - left;
      rect.height = bottom - top;
      rect.strokeWidth = 1;
      rect.strokeOpacity = 0.75;
      rect.crisp = true;
      return rect;
    });
    this.updateColors(fills, strokes);
    this.root.append(this.bars);
  }
  updateColors([fill], [stroke]) {
    this.bars.forEach((bar) => {
      bar.fill = fill;
      bar.stroke = stroke;
    });
  }
};
MiniHistogram.chartType = "histogram";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/polar/miniRadialColumn.ts
var import_ag_charts_community17 = require("ag-charts-community");

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/miniChartWithPolarAxes.ts
var import_core45 = require("@ag-grid-community/core");
var import_ag_charts_community16 = require("ag-charts-community");
var MiniChartWithPolarAxes = class extends MiniChart {
  constructor(container, tooltipName) {
    super(container, tooltipName);
    this.stroke = "gray";
    this.showRadiusAxisLine = true;
    this.showAngleAxisLines = true;
  }
  addAxes() {
    const size = this.size;
    const padding = this.padding;
    const combinedPadding = padding * 2;
    const axisLineRadius = (size - combinedPadding) / 2;
    const gridRadii = this.showAngleAxisLines ? [
      axisLineRadius,
      axisLineRadius * 0.8,
      axisLineRadius * 0.6,
      axisLineRadius * 0.4
    ] : [];
    const radiusAxisLine = new import_ag_charts_community16._Scene.Line();
    radiusAxisLine.x1 = size / 2;
    radiusAxisLine.y1 = padding;
    radiusAxisLine.x2 = size / 2;
    radiusAxisLine.y2 = size - padding - axisLineRadius - gridRadii[gridRadii.length - 1];
    radiusAxisLine.stroke = this.stroke;
    radiusAxisLine.strokeOpacity = 0.5;
    radiusAxisLine.fill = void 0;
    radiusAxisLine.visible = this.showRadiusAxisLine;
    const x = padding + axisLineRadius;
    this.gridLines = gridRadii.map((radius, index) => {
      const gridLine = new import_ag_charts_community16._Scene.Path();
      gridLine.path.arc(x, x, radius, 0, 2 * Math.PI);
      gridLine.strokeWidth = 1;
      gridLine.stroke = this.stroke;
      gridLine.strokeOpacity = index === 0 ? 0.5 : 0.2;
      gridLine.fill = void 0;
      return gridLine;
    });
    const root = this.root;
    root.append(radiusAxisLine);
    if (this.gridLines.length > 0)
      root.append(this.gridLines);
  }
};
__decorateClass([
  import_core45.PostConstruct
], MiniChartWithPolarAxes.prototype, "addAxes", 1);

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/polar/miniRadialColumn.ts
var MiniRadialColumn = class extends MiniChartWithPolarAxes {
  constructor(container, fills, strokes) {
    super(container, "radialColumnTooltip");
    this.data = [
      [6, 8, 10, 2, 6, 5],
      [4, 4, 3, 6, 4, 4],
      [5, 4, 2, 9, 8, 9]
    ];
    this.showRadiusAxisLine = false;
    const { padding, size, data } = this;
    const radius = (size - padding * 2) / 2;
    const innerRadiusRatio = 0.4;
    const axisInnerRadius = radius * innerRadiusRatio;
    const angleScale = new import_ag_charts_community17._Scene.BandScale();
    angleScale.domain = data[0].map((_38, index) => index);
    angleScale.range = [0, 2 * Math.PI];
    angleScale.paddingInner = 0;
    angleScale.paddingOuter = 0;
    const bandwidth = angleScale.bandwidth * 0.7;
    const { processedData, max } = accumulateData(data);
    const radiusScale = new import_ag_charts_community17._Scene.LinearScale();
    radiusScale.domain = [0, max];
    radiusScale.range = [axisInnerRadius, radius];
    const center = this.size / 2;
    this.series = processedData.map((series, seriesIndex) => {
      const firstSeries = seriesIndex === 0;
      const previousSeries = firstSeries ? void 0 : processedData[seriesIndex - 1];
      const seriesGroup = new import_ag_charts_community17._Scene.Group({ zIndex: 1e6 });
      const seriesColumns = series.map((datum, i) => {
        const previousDatum = previousSeries == null ? void 0 : previousSeries[i];
        const outerRadius = radiusScale.convert(datum);
        const innerRadius = radiusScale.convert(previousDatum != null ? previousDatum : 0);
        const startAngle = angleScale.convert(i);
        const endAngle = startAngle + bandwidth;
        const columnWidth = import_ag_charts_community17._Scene.getRadialColumnWidth(startAngle, endAngle, radius, 0.5, 0.5);
        const column = new import_ag_charts_community17._Scene.RadialColumnShape();
        column.scalingCenterX = center;
        column.scalingCenterY = center;
        column.columnWidth = columnWidth;
        column.innerRadius = innerRadius;
        column.outerRadius = outerRadius;
        column.startAngle = startAngle;
        column.endAngle = endAngle;
        column.isBeveled = true;
        column.axisInnerRadius = axisInnerRadius;
        column.axisOuterRadius = radius;
        column.stroke = void 0;
        column.strokeWidth = 0;
        return column;
      });
      seriesGroup.append(seriesColumns);
      seriesGroup.translationX = center;
      seriesGroup.translationY = center;
      return seriesGroup;
    });
    this.root.append(this.series);
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.series.forEach((group, i) => {
      var _a;
      (_a = group.children) == null ? void 0 : _a.forEach((sector) => {
        sector.fill = fills[i % fills.length];
        sector.stroke = strokes[i % strokes.length];
      });
    });
  }
};
MiniRadialColumn.chartType = "radialColumn";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/polar/miniRadialBar.ts
var import_ag_charts_community18 = require("ag-charts-community");
var MiniRadialBar = class extends MiniChartWithPolarAxes {
  constructor(container, fills, strokes) {
    super(container, "radialBarTooltip");
    this.data = [
      [6, 8, 10],
      [4, 4, 3],
      [5, 4, 2]
    ];
    this.showRadiusAxisLine = false;
    const radius = (this.size - this.padding) / 2;
    const innerRadiusRatio = 0.4;
    const innerRadius = radius * innerRadiusRatio;
    const totalRadius = radius + innerRadius;
    const radiusScale = new import_ag_charts_community18._Scene.BandScale();
    radiusScale.domain = this.data[0].map((_38, index) => index);
    radiusScale.range = [radius, innerRadius];
    radiusScale.paddingInner = 0.5;
    radiusScale.paddingOuter = 0;
    const bandwidth = radiusScale.bandwidth;
    const { processedData, max } = accumulateData(this.data);
    const angleScale = new import_ag_charts_community18._Scene.LinearScale();
    angleScale.domain = [0, Math.ceil(max * 1.5)];
    const start = 3 / 2 * Math.PI;
    const end = start + 2 * Math.PI;
    angleScale.range = [start, end];
    const center = this.size / 2;
    this.series = processedData.map((series, index) => {
      const previousSeries = index < 0 ? void 0 : processedData[index - 1];
      const seriesGroup = new import_ag_charts_community18._Scene.Group({ zIndex: 1e6 });
      const seriesSectors = series.map((datum, i) => {
        var _a;
        const previousDatum = (_a = previousSeries == null ? void 0 : previousSeries[i]) != null ? _a : 0;
        const innerRadius2 = totalRadius - radiusScale.convert(i);
        const outerRadius = innerRadius2 + bandwidth;
        const startAngle = angleScale.convert(previousDatum);
        const endAngle = angleScale.convert(datum);
        const sector = new import_ag_charts_community18._Scene.Sector();
        sector.centerX = center;
        sector.centerY = center;
        sector.innerRadius = innerRadius2;
        sector.outerRadius = outerRadius;
        sector.startAngle = startAngle;
        sector.endAngle = endAngle;
        sector.stroke = void 0;
        sector.strokeWidth = 0;
        return sector;
      });
      seriesGroup.append(seriesSectors);
      return seriesGroup;
    });
    this.root.append(this.series);
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.series.forEach((group, i) => {
      var _a;
      (_a = group.children) == null ? void 0 : _a.forEach((sector) => {
        sector.fill = fills[i % fills.length];
        sector.stroke = strokes[i % strokes.length];
      });
    });
  }
};
MiniRadialBar.chartType = "radialBar";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/polar/miniRadarLine.ts
var MiniRadarLine = class extends MiniChartWithPolarAxes {
  constructor(container, fills, strokes) {
    super(container, "radarLineTooltip");
    this.markerSize = 4;
    this.data = [
      [8, 7, 8, 7, 8, 8, 7, 8],
      [6, 8, 5, 10, 6, 7, 4, 6],
      [0, 3, 3, 5, 4, 4, 2, 0]
    ];
    this.showRadiusAxisLine = false;
    const radius = (this.size - this.padding * 2) / 2;
    const innerRadius = 0;
    const { paths, markers } = createPolarPaths(this.root, this.data, this.size, radius, innerRadius, this.markerSize);
    this.lines = paths;
    this.markers = markers;
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.lines.forEach((line, i) => {
      const n = this.data[i].length;
      line.stroke = fills[i];
      const startIdx = i * n;
      const endIdx = startIdx + n;
      const markers = this.markers.slice(startIdx, endIdx);
      markers.forEach((marker) => {
        marker.stroke = strokes[i];
        marker.fill = fills[i];
      });
    });
  }
};
MiniRadarLine.chartType = "radarLine";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/polar/miniRadarArea.ts
var MiniRadarArea = class extends MiniChartWithPolarAxes {
  constructor(container, fills, strokes) {
    super(container, "radarAreaTooltip");
    this.data = [
      [8, 10, 5, 7, 4, 1, 5, 8],
      [1, 1, 2, 7, 7, 8, 10, 1],
      [4, 5, 9, 9, 4, 2, 3, 4]
    ];
    this.showRadiusAxisLine = false;
    const radius = (this.size - this.padding * 2) / 2;
    const innerRadius = radius - this.size * 0.3;
    this.areas = createPolarPaths(this.root, this.data, this.size, radius, innerRadius).paths;
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.areas.forEach((area, i) => {
      area.fill = fills[i];
      area.stroke = strokes[i];
    });
  }
};
MiniRadarArea.chartType = "radarArea";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/polar/miniNightingale.ts
var import_ag_charts_community19 = require("ag-charts-community");
var MiniNightingale = class extends MiniChartWithPolarAxes {
  constructor(container, fills, strokes) {
    super(container, "nightingaleTooltip");
    this.data = [
      [6, 10, 9, 8, 7, 8],
      [4, 6, 5, 4, 5, 5],
      [3, 5, 4, 3, 4, 7]
    ];
    this.showRadiusAxisLine = false;
    const radius = (this.size - this.padding * 2) / 2;
    const angleScale = new import_ag_charts_community19._Scene.BandScale();
    angleScale.domain = this.data[0].map((_38, index) => index);
    angleScale.range = [-Math.PI, Math.PI];
    angleScale.paddingInner = 0;
    angleScale.paddingOuter = 0;
    const bandwidth = angleScale.bandwidth * 0.7;
    const { processedData, max } = accumulateData(this.data);
    const radiusScale = new import_ag_charts_community19._Scene.LinearScale();
    radiusScale.domain = [0, max];
    radiusScale.range = [0, radius];
    const center = this.size / 2;
    this.series = processedData.map((series, index) => {
      const previousSeries = index < 0 ? void 0 : processedData[index - 1];
      const seriesGroup = new import_ag_charts_community19._Scene.Group({ zIndex: 1e6 });
      const seriesSectors = series.map((datum, i) => {
        const previousDatum = previousSeries == null ? void 0 : previousSeries[i];
        const outerRadius = radiusScale.convert(datum);
        const innerRadius = radiusScale.convert(previousDatum != null ? previousDatum : 0);
        const startAngle = angleScale.convert(i);
        const endAngle = startAngle + bandwidth;
        const sector = new import_ag_charts_community19._Scene.Sector();
        sector.centerX = center;
        sector.centerY = center;
        sector.innerRadius = innerRadius;
        sector.outerRadius = outerRadius;
        sector.startAngle = startAngle;
        sector.endAngle = endAngle;
        sector.stroke = void 0;
        sector.strokeWidth = 0;
        return sector;
      });
      seriesGroup.append(seriesSectors);
      return seriesGroup;
    });
    this.root.append(this.series);
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.series.forEach((group, i) => {
      var _a;
      (_a = group.children) == null ? void 0 : _a.forEach((sector) => {
        sector.fill = fills[i % fills.length];
        sector.stroke = strokes[i % strokes.length];
      });
    });
  }
};
MiniNightingale.chartType = "nightingale";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/statistical/miniRangeBar.ts
var import_ag_charts_community20 = require("ag-charts-community");
var MiniRangeBar = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "rangeBarTooltip");
    const data = [3, 3.5, 3];
    this.bars = this.createRangeBar(this.root, data, this.size, this.padding, "vertical");
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.bars.forEach((bar, i) => {
      bar.fill = fills[i];
      bar.stroke = strokes[i];
    });
  }
  createRangeBar(root, data, size, padding, direction) {
    const barAlongX = direction === "horizontal";
    const scalePadding = 2 * padding;
    const xScale = new import_ag_charts_community20._Scene.BandScale();
    xScale.domain = data.map((_38, index) => index);
    xScale.range = [padding, size - padding];
    xScale.paddingInner = 0.3;
    xScale.paddingOuter = 0.3;
    const lowRatio = 0.7;
    const highRatio = 1.3;
    const yScale = new import_ag_charts_community20._Scene.LinearScale();
    yScale.domain = [
      data.reduce((a, b) => Math.min(a, b), Infinity) * lowRatio,
      data.reduce((a, b) => Math.max(a, b), 0) * highRatio
    ];
    yScale.range = [scalePadding, size - scalePadding];
    const width = xScale.bandwidth;
    const bars = data.map((datum, i) => {
      const [low, high] = [datum * lowRatio, datum * highRatio];
      const x = xScale.convert(i);
      const y = yScale.convert(low);
      const height = yScale.convert(high) - y;
      const rect = new import_ag_charts_community20._Scene.Rect();
      rect.x = barAlongX ? y : x;
      rect.y = barAlongX ? x : y;
      rect.width = barAlongX ? height : width;
      rect.height = barAlongX ? width : height;
      rect.strokeWidth = 0;
      rect.crisp = true;
      return rect;
    });
    root.append(bars);
    return bars;
  }
};
MiniRangeBar.chartType = "rangeBar";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/statistical/miniRangeArea.ts
var import_ag_charts_community21 = require("ag-charts-community");
var MiniRangeArea = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "rangeAreaTooltip");
    const period = 4;
    const dataSeriesMidpoints = [
      zigzag({ offset: 0.375 * period, length: period, pattern: { low: 3, high: 5, period } }),
      zigzag({ offset: 0.375 * period, length: period, pattern: { low: 2.25, high: 4.25, period } }),
      zigzag({ offset: 0.75 * period, length: period, pattern: { low: 2.5, high: 4.5, period } })
    ];
    const dataSeriesWidth = 1.75;
    const data = dataSeriesMidpoints.map(
      (series) => series.map(([x, y]) => ({
        x,
        low: y - 0.5 * dataSeriesWidth,
        high: y + 0.5 * dataSeriesWidth
      }))
    );
    const { lines, areas } = this.createRangeArea(this.root, data, this.size, this.padding);
    this.lines = lines;
    this.areas = areas;
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    fills = swapArrayItems(fills, 1, 2);
    strokes = swapArrayItems(strokes, 1, 2);
    this.lines.forEach(([highLine, lowLine], i) => {
      highLine.fill = void 0;
      highLine.stroke = strokes[i];
      lowLine.fill = void 0;
      lowLine.stroke = strokes[i];
    });
    this.areas.forEach((area, i) => {
      area.fill = fills[i];
    });
  }
  createRangeArea(root, data, size, padding) {
    const xMin = data.reduce((acc, series) => series.reduce((acc2, { x }) => Math.min(acc2, x), acc), Infinity);
    const xMax = data.reduce((acc, series) => series.reduce((acc2, { x }) => Math.max(acc2, x), acc), -Infinity);
    const yMin = data.reduce((acc, series) => series.reduce((acc2, { low }) => Math.min(acc2, low), acc), Infinity);
    const yMax = data.reduce((acc, series) => series.reduce((acc2, { high }) => Math.max(acc2, high), acc), -Infinity);
    const xScale = new import_ag_charts_community21._Scene.LinearScale();
    xScale.domain = [xMin, xMax];
    xScale.range = [padding, size - padding];
    const scalePadding = 2 * padding;
    const yScale = new import_ag_charts_community21._Scene.LinearScale();
    yScale.domain = [yMin, yMax];
    yScale.range = [size - scalePadding, scalePadding];
    const lines = [];
    const areas = [];
    const lowPoints = data.map((series) => {
      const highLine = new import_ag_charts_community21._Scene.Path();
      const lowLine = new import_ag_charts_community21._Scene.Path();
      const area = new import_ag_charts_community21._Scene.Path();
      lines.push([highLine, lowLine]);
      areas.push(area);
      highLine.strokeWidth = 0;
      lowLine.strokeWidth = 0;
      area.strokeWidth = 0;
      area.fillOpacity = 0.8;
      highLine.path.clear();
      lowLine.path.clear();
      area.path.clear();
      return series.map((datum, datumIndex) => {
        const { x, low, high } = datum;
        const scaledX = xScale.convert(x);
        const yLow = yScale.convert(low);
        const yHigh = yScale.convert(high);
        const command = datumIndex > 0 ? "lineTo" : "moveTo";
        highLine.path[command](scaledX, yHigh);
        lowLine.path[command](scaledX, yLow);
        area.path[command](scaledX, yHigh);
        return [scaledX, yLow];
      });
    });
    lowPoints.forEach((seriesLowPoints, seriesIndex) => {
      const n = seriesLowPoints.length - 1;
      const area = areas[seriesIndex];
      for (let datumIndex = n; datumIndex >= 0; datumIndex--) {
        const [x, y] = seriesLowPoints[datumIndex];
        area.path["lineTo"](x, y);
      }
    });
    root.append(areas.concat(...lines));
    return { lines, areas };
  }
};
MiniRangeArea.chartType = "rangeArea";
function zigzag(options) {
  const { offset, length, pattern } = options;
  const points = getZigzagInflectionPoints(offset, length, pattern);
  const xMin = 0;
  const xMax = length;
  if (points.length === 0 || points[0][0] !== xMin)
    points.unshift(getZigzagPoint(xMin, offset, pattern));
  if (points[points.length - 1][0] !== xMax)
    points.push(getZigzagPoint(xMax, offset, pattern));
  return points;
  function getZigzagInflectionPoints(offset2, length2, pattern2) {
    const { period } = pattern2;
    const scaledOffset = offset2 / period;
    const patternInflectionPoints = [0, 0.5];
    const inflectionPoints = patternInflectionPoints.map((x) => x - scaledOffset).map(getRemainderAbs).sort((a, b) => a - b);
    const repeatedPoints = Array.from(
      { length: Math.floor(inflectionPoints.length * (period / length2)) },
      (_38, i) => inflectionPoints[i % inflectionPoints.length] + Math.floor(i / inflectionPoints.length)
    );
    return repeatedPoints.map((x) => x * period).map((x) => getZigzagPoint(x, offset2, pattern2));
  }
  function getZigzagPoint(x, offset2, pattern2) {
    return [x, getZigzagValue(offset2 + x, pattern2)];
  }
  function getZigzagValue(x, pattern2) {
    const { low, high, period } = pattern2;
    const scaledX = getRemainderAbs(x / period);
    const y = scaledX > 0.5 ? 1 - 2 * (scaledX - 0.5) : 2 * scaledX;
    return low + (high - low) * y;
  }
}
function getRemainderAbs(value) {
  const remainder = value % 1;
  return remainder < 0 ? remainder + 1 : remainder;
}
function swapArrayItems(items, leftIndex, rightIndex) {
  const results = [...items];
  const temp = results[leftIndex];
  results[leftIndex] = results[rightIndex];
  results[rightIndex] = temp;
  return results;
}

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/statistical/miniBoxPlot.ts
var import_ag_charts_community22 = require("ag-charts-community");
var MiniBoxPlot = class extends MiniChartWithAxes {
  constructor(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
    super(container, "boxPlotTooltip");
    const padding = this.padding;
    const size = this.size;
    const data = [11, 11.5, 10.5];
    const maxRatio = 1.2;
    const q3Ratio = 1.1;
    const q1Ratio = 0.9;
    const minRatio = 0.8;
    const yScale = new import_ag_charts_community22._Scene.LinearScale();
    yScale.domain = [
      data.reduce((a, b) => Math.min(a, b), Infinity) * minRatio,
      data.reduce((a, b) => Math.max(a, b), 0) * maxRatio
    ];
    yScale.range = [size - 1.5 * padding, padding];
    const xScale = new import_ag_charts_community22._Scene.BandScale();
    xScale.domain = data.map((_38, index) => index);
    xScale.range = [padding, size - padding];
    xScale.paddingInner = 0.4;
    xScale.paddingOuter = 0.2;
    const bandwidth = Math.round(xScale.bandwidth);
    const halfBandWidth = Math.round(xScale.bandwidth / 2);
    this.boxPlotGroups = data.map((datum, i) => {
      let [minValue, q1Value, q3Value, maxValue] = [
        datum * minRatio,
        datum * q1Ratio,
        datum * q3Ratio,
        datum * maxRatio
      ];
      const top = Math.round(yScale.convert(q3Value));
      const left = Math.round(xScale.convert(i));
      const right = Math.round(left + bandwidth);
      const bottom = Math.round(yScale.convert(q1Value));
      const min = Math.round(yScale.convert(minValue));
      const mid = Math.round(yScale.convert(datum));
      const max = Math.round(yScale.convert(maxValue));
      const whiskerX = left + halfBandWidth;
      const boxPlotGroup = new import_ag_charts_community22._Scene.Group();
      const box = new import_ag_charts_community22._Scene.Rect();
      const median = new import_ag_charts_community22._Scene.Line();
      const topWhisker = new import_ag_charts_community22._Scene.Line();
      const bottomWhisker = new import_ag_charts_community22._Scene.Line();
      const topCap = new import_ag_charts_community22._Scene.Line();
      const bottomCap = new import_ag_charts_community22._Scene.Line();
      box.x = left;
      box.y = top;
      box.width = bandwidth;
      box.height = bottom - top;
      box.strokeWidth = 1;
      box.strokeOpacity = 0.75;
      box.crisp = true;
      this.setLineProperties(median, left, right, mid, mid);
      this.setLineProperties(topWhisker, whiskerX, whiskerX, max, top);
      this.setLineProperties(bottomWhisker, whiskerX, whiskerX, min, bottom);
      this.setLineProperties(topCap, left, right, max, max);
      this.setLineProperties(bottomCap, left, right, min, min);
      boxPlotGroup.append([box, median, topWhisker, bottomWhisker, topCap, bottomCap]);
      return boxPlotGroup;
    });
    this.updateColors(fills, strokes, themeTemplateParameters, isCustomTheme);
    this.root.append(this.boxPlotGroups);
  }
  updateColors(fills, strokes, themeTemplateParameters, isCustomTheme) {
    var _a;
    const themeBackgroundColor = themeTemplateParameters == null ? void 0 : themeTemplateParameters.properties.get(import_ag_charts_community22._Theme.DEFAULT_BACKGROUND_COLOUR);
    const backgroundFill = (_a = Array.isArray(themeBackgroundColor) ? themeBackgroundColor[0] : themeBackgroundColor) != null ? _a : "white";
    this.boxPlotGroups.forEach((group, i) => {
      var _a2;
      (_a2 = group.children) == null ? void 0 : _a2.forEach((node) => {
        const fill = fills[i % fills.length];
        node.fill = isCustomTheme ? fill : import_ag_charts_community22._Util.Color.interpolate(fill, backgroundFill)(0.7);
        node.stroke = strokes[i % strokes.length];
      });
    });
  }
  setLineProperties(line, x1, x2, y1, y2) {
    line.x1 = x1;
    line.x2 = x2;
    line.y1 = y1;
    line.y2 = y2;
    line.strokeOpacity = 0.75;
  }
};
MiniBoxPlot.chartType = "boxPlot";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/hierarchical/miniTreemap.ts
var import_ag_charts_community23 = require("ag-charts-community");
var MiniTreemap = class extends MiniChart {
  constructor(container, fills, strokes, themeTemplate, isCustomTheme) {
    super(container, "treemapTooltip");
    const { size, padding } = this;
    const data = [
      [1, 1],
      [3, 2, 1]
    ];
    const treeSize = data.length;
    const treePadding = treeSize % 2 === 0 ? 0.3 : 0.2;
    const range = [padding, size - padding];
    const columns = data.length;
    const columnParts = columns * (columns + 1) / 2;
    const columnPadding = treePadding / (columns - 1);
    const availableRange = range[1] - range[0];
    const availableWidth = availableRange - treePadding;
    let previousX = range[0];
    this.rects = data.reduce((rects, d, columnIndex) => {
      rects != null ? rects : rects = [];
      const widthRatio = (columns - columnIndex) / columnParts;
      const width = availableWidth * widthRatio;
      const rows = d.length;
      const rowParts = d.reduce((parts, ratio) => parts += ratio, 0);
      const rowPadding = treePadding / (rows - 1 || 1);
      const availableHeight = rows > 1 ? availableRange - treePadding : availableRange;
      let previousY = range[0];
      const xRects = d.map((ratio) => {
        const rect = new import_ag_charts_community23._Scene.Rect();
        const height = availableHeight * ratio / rowParts;
        rect.x = previousX;
        rect.y = previousY;
        rect.width = width;
        rect.height = height;
        rect.strokeWidth = 0.75;
        rect.crisp = true;
        previousY += height + rowPadding;
        return rect;
      });
      previousX += width + columnPadding;
      rects.push(...xRects);
      return rects;
    }, []);
    this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
    const rectGroup = new import_ag_charts_community23._Scene.Group();
    rectGroup.setClipRectInGroupCoordinateSpace(new import_ag_charts_community23._Scene.BBox(padding, padding, size - padding, size - padding));
    rectGroup.append(this.rects);
    this.root.append(rectGroup);
  }
  updateColors(fills, strokes, themeTemplate, isCustomTheme) {
    var _a;
    const { properties } = themeTemplate != null ? themeTemplate : {};
    const defaultBackgroundColor = properties == null ? void 0 : properties.get(import_ag_charts_community23._Theme.DEFAULT_BACKGROUND_COLOUR);
    const backgroundFill = (_a = Array.isArray(defaultBackgroundColor) ? defaultBackgroundColor[0] : defaultBackgroundColor) != null ? _a : "white";
    this.rects.forEach((rect, i) => {
      rect.fill = fills[i % strokes.length];
      rect.stroke = isCustomTheme ? strokes[i % strokes.length] : backgroundFill;
    });
  }
};
MiniTreemap.chartType = "treemap";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/hierarchical/miniSunburst.ts
var import_ag_charts_community24 = require("ag-charts-community");
var MiniSunburst = class extends MiniChartWithPolarAxes {
  constructor(container, fills, strokes) {
    super(container, "sunburstTooltip");
    // Hierarchical data using multidimensional array
    this.data = [
      [[], []],
      [[], []],
      [[], []]
    ];
    // Rotate the chart by the given angle (-90 degrees)
    this.angleOffset = -Math.PI / 2;
    this.innerRadiusRatio = 0;
    this.showRadiusAxisLine = false;
    this.showAngleAxisLines = false;
    const { data, size, padding, angleOffset, innerRadiusRatio } = this;
    const radius = (size - padding * 2) / 2;
    const angleRange = [angleOffset + 0, angleOffset + 2 * Math.PI];
    const angleExtent = Math.abs(angleRange[1] - angleRange[0]);
    const radiusRange = [radius * innerRadiusRatio, radius];
    const radiusExtent = Math.abs(radiusRange[1] - radiusRange[0]);
    let maxDepth = 0;
    const findMaxDepth = (data2, parentDepth) => {
      data2.forEach((child) => {
        const depth = parentDepth + 1;
        maxDepth = Math.max(maxDepth, depth);
        findMaxDepth(child, depth);
      });
    };
    findMaxDepth(data, 0);
    const radiusRatio = radiusExtent / maxDepth;
    const center = this.size / 2;
    const startAngle = angleRange[0];
    this.series = [];
    const createSectors = (data2, depth, startAngle2, availableAngle, group) => {
      const isArray = Array.isArray(data2);
      if (!isArray) {
        return;
      }
      const childDepth = depth + 1;
      let previousAngle = startAngle2;
      data2.forEach((child, childIndex, children) => {
        let childGroup = group;
        if (!childGroup) {
          childGroup = new import_ag_charts_community24._Scene.Group();
          this.series.push(childGroup);
        }
        const innerRadius = radiusRange[0] + depth * radiusRatio;
        const outerRadius = radiusRange[0] + childDepth * radiusRatio;
        const angleRatio = 1 / children.length;
        const start = previousAngle;
        const end = start + availableAngle * angleRatio;
        const sector = new import_ag_charts_community24._Scene.Sector();
        sector.centerX = center;
        sector.centerY = center;
        sector.innerRadius = innerRadius;
        sector.outerRadius = outerRadius;
        sector.startAngle = start;
        sector.endAngle = end;
        sector.stroke = void 0;
        sector.strokeWidth = 0;
        sector.inset = 0.75;
        previousAngle = end;
        childGroup.append(sector);
        createSectors(child, childDepth, start, Math.abs(end - start), childGroup);
      });
    };
    createSectors(data, 0, startAngle, angleExtent);
    this.root.append(this.series);
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.series.forEach((group, i) => {
      var _a;
      (_a = group.children) == null ? void 0 : _a.forEach((sector) => {
        sector.fill = fills[i % fills.length];
        sector.stroke = strokes[i % strokes.length];
      });
    });
  }
};
MiniSunburst.chartType = "sunburst";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/specialized/miniHeatmap.ts
var import_ag_charts_community25 = require("ag-charts-community");
var MiniHeatmap = class extends MiniChart {
  constructor(container, fills, strokes, themeTemplate, isCustomTheme) {
    var _a, _b;
    super(container, "heatmapTooltip");
    const { size, padding } = this;
    const heatmapSize = 3;
    const data = Array.from(
      { length: heatmapSize },
      (_38, __) => Array.from({ length: heatmapSize }, (_39, yIndex) => yIndex)
    );
    const domain = data.map((_38, index) => index);
    const xScale = new import_ag_charts_community25._Scene.BandScale();
    xScale.domain = domain;
    xScale.range = [padding, size - padding];
    xScale.paddingInner = 0.01;
    xScale.paddingOuter = 0.1;
    const yScale = new import_ag_charts_community25._Scene.BandScale();
    yScale.domain = domain;
    yScale.range = [padding, size - padding];
    yScale.paddingInner = 0.01;
    yScale.paddingOuter = 0.1;
    const width = (_a = xScale.bandwidth) != null ? _a : 0;
    const height = (_b = yScale.bandwidth) != null ? _b : 0;
    this.rects = data.reduce((rects, d, index) => {
      rects != null ? rects : rects = [];
      const xRects = d.map((_38, yIndex) => {
        const rect = new import_ag_charts_community25._Scene.Rect();
        rect.x = xScale.convert(index);
        rect.y = yScale.convert(yIndex);
        rect.width = width;
        rect.height = height;
        rect.strokeWidth = 0;
        rect.crisp = true;
        return rect;
      });
      rects.push(...xRects);
      return rects;
    }, []);
    this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
    const rectGroup = new import_ag_charts_community25._Scene.Group();
    rectGroup.setClipRectInGroupCoordinateSpace(new import_ag_charts_community25._Scene.BBox(padding, padding, size - padding, size - padding));
    rectGroup.append(this.rects);
    this.root.append(rectGroup);
  }
  updateColors(fills, strokes, themeTemplate, isCustomTheme) {
    var _a;
    const { properties } = themeTemplate != null ? themeTemplate : {};
    const defaultColorRange = properties == null ? void 0 : properties.get(import_ag_charts_community25._Theme.DEFAULT_DIVERGING_SERIES_COLOUR_RANGE);
    const defaultBackgroundColor = properties == null ? void 0 : properties.get(import_ag_charts_community25._Theme.DEFAULT_BACKGROUND_COLOUR);
    const backgroundFill = (_a = Array.isArray(defaultBackgroundColor) ? defaultBackgroundColor[0] : defaultBackgroundColor) != null ? _a : "white";
    const colorRange = isCustomTheme ? [fills[0], fills[1]] : defaultColorRange;
    const stroke = isCustomTheme ? strokes[0] : backgroundFill;
    this.rects.forEach((rect, i) => {
      rect.fill = import_ag_charts_community25._Util.Color.interpolate(colorRange[0], colorRange[1])(i * 0.2);
      rect.stroke = stroke;
    });
  }
};
MiniHeatmap.chartType = "heatmap";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/specialized/miniWaterfall.ts
var import_ag_charts_community26 = require("ag-charts-community");
var MiniWaterfall = class extends MiniChartWithAxes {
  constructor(container, fills, strokes, themeTemplate, isCustomTheme) {
    super(container, "waterfallTooltip");
    this.data = [4, 3, -3, 6, -3];
    this.bars = this.createWaterfall(this.root, this.data, this.size, this.padding, "vertical").bars;
    this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
  }
  updateColors(fills, strokes, themeTemplate, isCustomTheme) {
    var _a, _b;
    const { data } = this;
    const { properties } = themeTemplate != null ? themeTemplate : {};
    const palettePositive = {
      fill: fills[0],
      stroke: strokes[0]
    };
    const paletteNegative = {
      fill: fills[1],
      stroke: strokes[1]
    };
    const positive = isCustomTheme ? palettePositive : (_a = properties == null ? void 0 : properties.get(import_ag_charts_community26._Theme.DEFAULT_WATERFALL_SERIES_POSITIVE_COLOURS)) != null ? _a : palettePositive;
    const negative = isCustomTheme ? paletteNegative : (_b = properties == null ? void 0 : properties.get(import_ag_charts_community26._Theme.DEFAULT_WATERFALL_SERIES_NEGATIVE_COLOURS)) != null ? _b : paletteNegative;
    this.bars.forEach((bar, i) => {
      const isPositive = data[i] >= 0;
      bar.fill = isPositive ? positive.fill : negative.fill;
      bar.stroke = isPositive ? positive.stroke : negative.stroke;
    });
  }
  createWaterfall(root, data, size, padding, direction) {
    const scalePadding = 2 * padding;
    const { processedData, min, max } = accumulateData(data.map((d) => [d]));
    const flatData = processedData.reduce((flat, d) => flat.concat(d), []);
    const yScale = new import_ag_charts_community26._Scene.LinearScale();
    yScale.domain = [Math.min(min, 0), max];
    yScale.range = [size - scalePadding, scalePadding];
    const xScale = new import_ag_charts_community26._Scene.BandScale();
    xScale.domain = data.map((_38, index) => index);
    xScale.range = [padding, size - padding];
    xScale.paddingInner = 0.2;
    xScale.paddingOuter = 0.3;
    const width = xScale.bandwidth;
    const connectorLine = new import_ag_charts_community26._Scene.Path();
    connectorLine.stroke = "#575757";
    connectorLine.strokeWidth = 0;
    const pixelAlignmentOffset = Math.floor(connectorLine.strokeWidth) % 2 / 2;
    const connectorPath = connectorLine.path;
    connectorPath.clear();
    const barAlongX = direction === "horizontal";
    const bars = flatData.map((datum, i) => {
      const previousDatum = i > 0 ? flatData[i - 1] : 0;
      const rawValue = data[i];
      const isPositive = rawValue > 0;
      const currY = Math.round(yScale.convert(datum));
      const trailY = Math.round(yScale.convert(previousDatum));
      const y = (isPositive ? currY : trailY) - pixelAlignmentOffset;
      const bottomY = (isPositive ? trailY : currY) + pixelAlignmentOffset;
      const height = Math.abs(bottomY - y);
      const x = xScale.convert(i);
      const rect = new import_ag_charts_community26._Scene.Rect();
      rect.x = barAlongX ? y : x;
      rect.y = barAlongX ? x : y;
      rect.width = barAlongX ? height : width;
      rect.height = barAlongX ? width : height;
      rect.strokeWidth = 0;
      rect.crisp = true;
      const moveTo = currY + pixelAlignmentOffset;
      const lineTo = trailY + pixelAlignmentOffset;
      if (i > 0) {
        const lineToX = barAlongX ? lineTo : rect.x;
        const lineToY = barAlongX ? rect.y : lineTo;
        connectorPath.lineTo(lineToX, lineToY);
      }
      const moveToX = barAlongX ? moveTo : rect.x;
      const moveToY = barAlongX ? rect.y : moveTo;
      connectorPath.moveTo(moveToX, moveToY);
      return rect;
    });
    root.append([connectorLine, ...bars]);
    return { bars };
  }
};
MiniWaterfall.chartType = "waterfall";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/combo/miniColumnLineCombo.ts
var MiniColumnLineCombo = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "columnLineComboTooltip");
    this.columnData = [3, 4];
    this.lineData = [
      [5, 4, 6, 5, 4]
    ];
    const { root, columnData, lineData, size, padding } = this;
    this.columns = createColumnRects({
      stacked: false,
      root,
      data: columnData,
      size,
      padding,
      xScaleDomain: [0, 1],
      yScaleDomain: [0, 4],
      xScalePadding: 0.5
    });
    root.append(this.columns);
    this.lines = createLinePaths(root, lineData, size, padding);
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.columns.forEach((bar, i) => {
      bar.fill = fills[i];
      bar.stroke = strokes[i];
    });
    this.lines.forEach((line, i) => {
      line.stroke = fills[i + 2];
    });
  }
};
MiniColumnLineCombo.chartType = "columnLineCombo";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/combo/miniAreaColumnCombo.ts
var import_ag_charts_community27 = require("ag-charts-community");
var MiniAreaColumnCombo = class extends MiniChartWithAxes {
  constructor(container, fills, strokes) {
    super(container, "areaColumnComboTooltip");
    this.columnData = [3, 4.5];
    this.areaData = [
      [5, 4, 6, 5, 4]
    ];
    const { root, columnData, areaData, size, padding } = this;
    this.columns = createColumnRects({
      stacked: false,
      root,
      data: columnData,
      size,
      padding,
      xScaleDomain: [0, 1],
      yScaleDomain: [0, 6],
      xScalePadding: 0.5
    });
    const xScale = new import_ag_charts_community27._Scene.BandScale();
    xScale.range = [padding, size - padding];
    xScale.domain = [0, 1, 2, 3, 4];
    xScale.paddingInner = 1;
    xScale.paddingOuter = 0;
    const yScale = new import_ag_charts_community27._Scene.LinearScale();
    yScale.range = [size - padding, padding];
    yScale.domain = [0, 6];
    const pathData = [];
    const yZero = yScale.convert(0);
    const firstX = xScale.convert(0);
    areaData.forEach((series, i) => {
      const points = pathData[i] || (pathData[i] = []);
      series.forEach((data, j) => {
        const yDatum = data;
        const xDatum = j;
        const x = xScale.convert(xDatum);
        const y = yScale.convert(yDatum);
        points[j] = { x, y };
      });
      const lastX = xScale.convert(series.length - 1);
      pathData[i].push({
        x: lastX,
        y: yZero
      }, {
        x: firstX,
        y: yZero
      });
    });
    this.areas = pathData.map((points) => {
      const area = new import_ag_charts_community27._Scene.Path();
      area.strokeWidth = 0;
      area.fillOpacity = 0.8;
      const path = area.path;
      points.forEach((point, i) => path[i > 0 ? "lineTo" : "moveTo"](point.x, point.y));
      return area;
    });
    root.append(this.areas);
    root.append([].concat.apply([], this.columns));
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.areas.forEach((area, i) => {
      area.fill = fills[i];
      area.stroke = strokes[i];
    });
    this.columns.forEach((bar, i) => {
      bar.fill = fills[i + 1];
      bar.stroke = strokes[i + 1];
    });
  }
};
MiniAreaColumnCombo.chartType = "areaColumnCombo";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniCharts/combo/miniCustomCombo.ts
var import_ag_charts_community28 = require("ag-charts-community");
var MiniCustomCombo = class extends MiniChart {
  constructor(container, fills, strokes) {
    super(container, "customComboTooltip");
    this.columnData = [3, 4];
    this.lineData = [[5, 4, 6, 5, 4]];
    const { root, columnData, lineData, size, padding } = this;
    this.columns = createColumnRects({
      stacked: false,
      root,
      data: columnData,
      size,
      padding,
      xScaleDomain: [0, 1],
      yScaleDomain: [0, 4],
      xScalePadding: 0.5
    });
    root.append(this.columns);
    this.lines = createLinePaths(root, lineData, size, padding);
    const axisStroke = "grey";
    const axisOvershoot = 3;
    const leftAxis = new import_ag_charts_community28._Scene.Line();
    leftAxis.x1 = padding;
    leftAxis.y1 = padding;
    leftAxis.x2 = padding;
    leftAxis.y2 = size - padding + axisOvershoot;
    leftAxis.stroke = axisStroke;
    const bottomAxis = new import_ag_charts_community28._Scene.Line();
    bottomAxis.x1 = padding - axisOvershoot + 1;
    bottomAxis.y1 = size - padding;
    bottomAxis.x2 = size - padding + 1;
    bottomAxis.y2 = size - padding;
    bottomAxis.stroke = axisStroke;
    const penIcon = new import_ag_charts_community28._Scene.Path();
    this.buildPenIconPath(penIcon);
    penIcon.fill = "whitesmoke";
    penIcon.stroke = "darkslategrey";
    penIcon.strokeWidth = 1;
    root.append([bottomAxis, leftAxis, penIcon]);
    this.updateColors(fills, strokes);
  }
  updateColors(fills, strokes) {
    this.columns.forEach((bar, i) => {
      bar.fill = fills[i];
      bar.stroke = strokes[i];
    });
    this.lines.forEach((line, i) => {
      line.stroke = fills[i + 2];
    });
  }
  buildPenIconPath(penIcon) {
    const { path } = penIcon;
    path.moveTo(25.76, 43.46);
    path.lineTo(31.27, 48.53);
    path.moveTo(49.86, 22);
    path.lineTo(49.86, 22);
    path.cubicCurveTo(49.01994659053345, 21.317514933510974, 47.89593834348529, 21.09645997825817, 46.86, 21.41);
    path.lineTo(46.86, 21.41);
    path.cubicCurveTo(45.55460035985361, 21.77260167850787, 44.38777081121966, 22.517979360321792, 43.51, 23.55);
    path.lineTo(25.51, 43.8);
    path.lineTo(25.43, 43.89);
    path.lineTo(23.01, 51.89);
    path.lineTo(22.83, 52.46);
    path.lineTo(31.02, 48.86);
    path.lineTo(49.02, 28.52);
    path.lineTo(49.02, 28.52);
    path.cubicCurveTo(49.940716461596224, 27.521914221246085, 50.54302631059587, 26.2720342455763, 50.75, 24.93);
    path.lineTo(50.75, 24.93);
    path.cubicCurveTo(50.95363374988308, 23.866379846512814, 50.62080640232334, 22.77066734274871, 49.86, 22);
    path.closePath();
    path.moveTo(41.76, 25.5);
    path.lineTo(47.34, 30.5);
    path.moveTo(40.74, 26.65);
    path.lineTo(46.25, 31.71);
  }
};
MiniCustomCombo.chartType = "customCombo";

// enterprise-modules/charts/src/charts/chartComp/menu/settings/miniChartsContainer.ts
var miniChartMapping = {
  columnGroup: {
    column: { range: true, pivot: true, enterprise: false, icon: MiniColumn },
    stackedColumn: { range: true, pivot: true, enterprise: false, icon: MiniStackedColumn },
    normalizedColumn: { range: true, pivot: true, enterprise: false, icon: MiniNormalizedColumn }
  },
  barGroup: {
    bar: { range: true, pivot: true, enterprise: false, icon: MiniBar },
    stackedBar: { range: true, pivot: true, enterprise: false, icon: MiniStackedBar },
    normalizedBar: { range: true, pivot: true, enterprise: false, icon: MiniNormalizedBar }
  },
  pieGroup: {
    pie: { range: true, pivot: true, enterprise: false, icon: MiniPie },
    donut: { range: true, pivot: true, enterprise: false, icon: MiniDonut },
    doughnut: { range: true, pivot: true, enterprise: false, icon: MiniDonut }
  },
  lineGroup: { line: { range: true, pivot: true, enterprise: false, icon: MiniLine } },
  scatterGroup: {
    scatter: { range: true, pivot: true, enterprise: false, icon: MiniScatter },
    bubble: { range: true, pivot: true, enterprise: false, icon: MiniBubble }
  },
  areaGroup: {
    area: { range: true, pivot: true, enterprise: false, icon: MiniArea },
    stackedArea: { range: true, pivot: true, enterprise: false, icon: MiniStackedArea },
    normalizedArea: { range: true, pivot: true, enterprise: false, icon: MiniNormalizedArea }
  },
  polarGroup: {
    radarLine: { range: true, pivot: false, enterprise: true, icon: MiniRadarLine },
    radarArea: { range: true, pivot: false, enterprise: true, icon: MiniRadarArea },
    nightingale: { range: true, pivot: false, enterprise: true, icon: MiniNightingale },
    radialColumn: { range: true, pivot: false, enterprise: true, icon: MiniRadialColumn },
    radialBar: { range: true, pivot: false, enterprise: true, icon: MiniRadialBar }
  },
  statisticalGroup: {
    boxPlot: { range: true, pivot: false, enterprise: true, icon: MiniBoxPlot },
    histogram: { range: true, pivot: false, enterprise: false, icon: MiniHistogram },
    rangeBar: { range: true, pivot: false, enterprise: true, icon: MiniRangeBar },
    rangeArea: { range: true, pivot: false, enterprise: true, icon: MiniRangeArea }
  },
  hierarchicalGroup: {
    treemap: { range: true, pivot: true, enterprise: true, icon: MiniTreemap },
    sunburst: { range: true, pivot: true, enterprise: true, icon: MiniSunburst }
  },
  specializedGroup: {
    heatmap: { range: true, pivot: false, enterprise: true, icon: MiniHeatmap },
    waterfall: { range: true, pivot: false, enterprise: true, icon: MiniWaterfall }
  },
  combinationGroup: {
    columnLineCombo: { range: true, pivot: true, enterprise: false, icon: MiniColumnLineCombo },
    areaColumnCombo: { range: true, pivot: true, enterprise: false, icon: MiniAreaColumnCombo },
    customCombo: { range: true, pivot: true, enterprise: false, icon: MiniCustomCombo }
  }
};
var DEFAULT_CHART_GROUPS = {
  columnGroup: [
    "column",
    "stackedColumn",
    "normalizedColumn"
  ],
  barGroup: [
    "bar",
    "stackedBar",
    "normalizedBar"
  ],
  pieGroup: [
    "pie",
    "donut"
  ],
  lineGroup: [
    "line"
  ],
  scatterGroup: [
    "scatter",
    "bubble"
  ],
  areaGroup: [
    "area",
    "stackedArea",
    "normalizedArea"
  ],
  polarGroup: [
    "radarLine",
    "radarArea",
    "nightingale",
    "radialColumn",
    "radialBar"
  ],
  statisticalGroup: [
    "boxPlot",
    "histogram",
    "rangeBar",
    "rangeArea"
  ],
  hierarchicalGroup: [
    "treemap",
    "sunburst"
  ],
  specializedGroup: [
    "heatmap",
    "waterfall"
  ],
  combinationGroup: [
    "columnLineCombo",
    "areaColumnCombo",
    "customCombo"
  ]
};
var _MiniChartsContainer = class _MiniChartsContainer extends import_core46.Component {
  constructor(chartController, fills, strokes, themeTemplateParameters, isCustomTheme, chartGroups = DEFAULT_CHART_GROUPS) {
    super(_MiniChartsContainer.TEMPLATE);
    this.wrappers = {};
    this.chartController = chartController;
    this.fills = fills;
    this.strokes = strokes;
    this.themeTemplateParameters = themeTemplateParameters;
    this.isCustomTheme = isCustomTheme;
    this.chartGroups = __spreadValues({}, chartGroups);
  }
  init() {
    if (!this.chartController.customComboExists() && this.chartGroups.combinationGroup) {
      this.chartGroups.combinationGroup = this.chartGroups.combinationGroup.filter((chartType) => chartType !== "customCombo");
    }
    const eGui = this.getGui();
    const isEnterprise = this.chartController.isEnterprise();
    const isPivotChart = this.chartController.isPivotChart();
    const isRangeChart = !isPivotChart;
    const displayedMenuGroups = Object.keys(this.chartGroups).map((group) => {
      var _a;
      const menuGroup = group in miniChartMapping ? miniChartMapping[group] : void 0;
      if (!menuGroup) {
        import_core46._.warnOnce(`invalid chartGroupsDef config '${group}'`);
        return null;
      }
      const chartGroupValues = (_a = this.chartGroups[group]) != null ? _a : [];
      const menuItems = chartGroupValues.map((chartType) => {
        const menuItem = chartType in menuGroup ? menuGroup[chartType] : void 0;
        if (!menuItem) {
          import_core46._.warnOnce(`invalid chartGroupsDef config '${group}.${chartType}'`);
          return null;
        }
        if (!isEnterprise && menuItem.enterprise) {
          return null;
        }
        if (isRangeChart && menuItem.range)
          return menuItem;
        if (isPivotChart && menuItem.pivot)
          return menuItem;
        return null;
      }).filter((menuItem) => menuItem != null);
      if (menuItems.length === 0)
        return null;
      return {
        label: this.chartTranslationService.translate(group),
        items: menuItems
      };
    }).filter((menuGroup) => menuGroup != null);
    for (const { label, items } of displayedMenuGroups) {
      const groupComponent = this.createBean(
        new import_core46.AgGroupComponent({
          title: label,
          suppressEnabledCheckbox: true,
          enabled: true,
          suppressOpenCloseIcons: true,
          cssIdentifier: "charts-settings",
          direction: "horizontal"
        })
      );
      for (const menuItem of items) {
        const MiniClass = menuItem.icon;
        const miniWrapper = document.createElement("div");
        miniWrapper.classList.add("ag-chart-mini-thumbnail");
        const miniClassChartType = MiniClass.chartType;
        this.addManagedListener(miniWrapper, "click", () => {
          this.chartController.setChartType(miniClassChartType);
          this.updateSelectedMiniChart();
        });
        this.wrappers[miniClassChartType] = miniWrapper;
        this.createBean(new MiniClass(miniWrapper, this.fills, this.strokes, this.themeTemplateParameters, this.isCustomTheme));
        groupComponent.addItem(miniWrapper);
      }
      eGui.appendChild(groupComponent.getGui());
    }
    this.updateSelectedMiniChart();
  }
  updateSelectedMiniChart() {
    const selectedChartType = this.chartController.getChartType();
    for (const miniChartType in this.wrappers) {
      const miniChart = this.wrappers[miniChartType];
      const selected = miniChartType === selectedChartType;
      miniChart.classList.toggle("ag-selected", selected);
    }
  }
};
_MiniChartsContainer.TEMPLATE = /* html */
`<div class="ag-chart-settings-mini-wrapper"></div>`;
__decorateClass([
  (0, import_core46.Autowired)("chartTranslationService")
], _MiniChartsContainer.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core46.PostConstruct
], _MiniChartsContainer.prototype, "init", 1);
var MiniChartsContainer = _MiniChartsContainer;

// enterprise-modules/charts/src/charts/chartComp/menu/settings/chartSettingsPanel.ts
var _ChartSettingsPanel = class _ChartSettingsPanel extends import_core47.Component {
  constructor(chartController) {
    super(_ChartSettingsPanel.TEMPLATE);
    this.chartController = chartController;
    this.miniChartsContainers = [];
    this.cardItems = [];
    this.activePaletteIndex = 0;
    this.palettes = [];
    this.themes = [];
  }
  postConstruct() {
    this.resetPalettes();
    this.ePrevBtn.insertAdjacentElement("afterbegin", import_core47._.createIconNoSpan("previous", this.gos));
    this.eNextBtn.insertAdjacentElement("afterbegin", import_core47._.createIconNoSpan("next", this.gos));
    this.addManagedListener(this.ePrevBtn, "click", () => this.setActivePalette(this.getPrev(), "left"));
    this.addManagedListener(this.eNextBtn, "click", () => this.setActivePalette(this.getNext(), "right"));
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_TYPE_CHANGED, () => this.resetPalettes(true));
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, () => this.resetPalettes(true));
    this.scrollSelectedIntoView();
  }
  scrollSelectedIntoView() {
    setTimeout(() => {
      const isMiniChartsContainerVisible = (miniChartsContainers) => {
        return !miniChartsContainers.getGui().classList.contains("ag-hidden");
      };
      const currentMiniChartContainer = this.miniChartsContainers.find(isMiniChartsContainerVisible);
      const currentChart = currentMiniChartContainer.getGui().querySelector(".ag-selected");
      if (currentChart) {
        const parent = currentChart.offsetParent;
        if (parent) {
          this.eMiniChartsContainer.scrollTo(0, parent.offsetTop);
        }
      }
    }, 250);
  }
  resetPalettes(forceReset) {
    var _a, _b;
    const palettes = this.chartController.getPalettes();
    const themeTemplateParameters = this.chartController.getThemeTemplateParameters();
    const chartGroups = (_b = (_a = this.gos.get("chartToolPanelsDef")) == null ? void 0 : _a.settingsPanel) == null ? void 0 : _b.chartGroupsDef;
    if (import_core47._.shallowCompare(palettes, this.palettes) && !forceReset || this.isAnimating) {
      return;
    }
    this.palettes = palettes;
    this.themes = this.chartController.getThemeNames();
    this.activePaletteIndex = this.themes.findIndex((name) => name === this.chartController.getChartThemeName());
    this.cardItems = [];
    import_core47._.clearElement(this.eCardSelector);
    this.destroyMiniCharts();
    const { themes } = this;
    this.palettes.forEach((palette, index) => {
      const isActivePalette = this.activePaletteIndex === index;
      const { fills, strokes } = palette;
      const themeName = themes[index];
      const isCustomTheme = !isStockTheme(themeName);
      const miniChartsContainer = this.createBean(
        new MiniChartsContainer(
          this.chartController,
          fills,
          strokes,
          themeTemplateParameters[index],
          isCustomTheme,
          chartGroups
        )
      );
      this.miniChartsContainers.push(miniChartsContainer);
      this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
      this.addCardLink(index);
      if (isActivePalette) {
        miniChartsContainer.updateSelectedMiniChart();
      } else {
        miniChartsContainer.setDisplayed(false);
      }
    });
    import_core47._.setDisplayed(this.eNavBar, this.palettes.length > 1);
    import_core47._.radioCssClass(this.cardItems[this.activePaletteIndex], "ag-selected", "ag-not-selected");
  }
  addCardLink(index) {
    const link = document.createElement("div");
    link.classList.add("ag-chart-settings-card-item");
    this.addManagedListener(link, "click", () => {
      this.setActivePalette(index, index < this.activePaletteIndex ? "left" : "right");
    });
    this.eCardSelector.appendChild(link);
    this.cardItems.push(link);
  }
  getPrev() {
    let prev = this.activePaletteIndex - 1;
    if (prev < 0) {
      prev = this.palettes.length - 1;
    }
    return prev;
  }
  getNext() {
    let next = this.activePaletteIndex + 1;
    if (next >= this.palettes.length) {
      next = 0;
    }
    return next;
  }
  setActivePalette(index, animationDirection) {
    if (this.isAnimating || this.activePaletteIndex === index) {
      return;
    }
    import_core47._.radioCssClass(this.cardItems[index], "ag-selected", "ag-not-selected");
    const currentPalette = this.miniChartsContainers[this.activePaletteIndex];
    const currentGui = currentPalette.getGui();
    const futurePalette = this.miniChartsContainers[index];
    const nextGui = futurePalette.getGui();
    currentPalette.updateSelectedMiniChart();
    futurePalette.updateSelectedMiniChart();
    const multiplier = animationDirection === "left" ? -1 : 1;
    const final = nextGui.style.left = `${import_core47._.getAbsoluteWidth(this.getGui()) * multiplier}px`;
    this.activePaletteIndex = index;
    this.isAnimating = true;
    const animatingClass = "ag-animating";
    futurePalette.setDisplayed(true);
    currentPalette.addCssClass(animatingClass);
    futurePalette.addCssClass(animatingClass);
    this.chartController.setChartThemeName(this.themes[index]);
    window.setTimeout(() => {
      currentGui.style.left = `${-parseFloat(final)}px`;
      nextGui.style.left = "0px";
    }, 0);
    window.setTimeout(() => {
      this.isAnimating = false;
      currentPalette.removeCssClass(animatingClass);
      futurePalette.removeCssClass(animatingClass);
      currentPalette.setDisplayed(false);
    }, 300);
  }
  destroyMiniCharts() {
    import_core47._.clearElement(this.eMiniChartsContainer);
    this.miniChartsContainers = this.destroyBeans(this.miniChartsContainers);
  }
  destroy() {
    this.destroyMiniCharts();
    super.destroy();
  }
};
_ChartSettingsPanel.TEMPLATE = /* html */
`<div class="ag-chart-settings-wrapper">
            <div ref="eMiniChartsContainer" class="ag-chart-settings-mini-charts-container ag-scrollable-container"></div>
            <div ref="eNavBar" class="ag-chart-settings-nav-bar">
                <div ref="ePrevBtn" class="ag-chart-settings-prev">
                    <button type="button" class="ag-button ag-chart-settings-prev-button"></button>
                </div>
                <div ref="eCardSelector" class="ag-chart-settings-card-selector"></div>
                <div ref="eNextBtn" class="ag-chart-settings-next">
                    <button type="button" class="ag-button ag-chart-settings-next-button"></button>
                </div>
            </div>
        </div>`;
__decorateClass([
  (0, import_core47.RefSelector)("eMiniChartsContainer")
], _ChartSettingsPanel.prototype, "eMiniChartsContainer", 2);
__decorateClass([
  (0, import_core47.RefSelector)("eNavBar")
], _ChartSettingsPanel.prototype, "eNavBar", 2);
__decorateClass([
  (0, import_core47.RefSelector)("eCardSelector")
], _ChartSettingsPanel.prototype, "eCardSelector", 2);
__decorateClass([
  (0, import_core47.RefSelector)("ePrevBtn")
], _ChartSettingsPanel.prototype, "ePrevBtn", 2);
__decorateClass([
  (0, import_core47.RefSelector)("eNextBtn")
], _ChartSettingsPanel.prototype, "eNextBtn", 2);
__decorateClass([
  import_core47.PostConstruct
], _ChartSettingsPanel.prototype, "postConstruct", 1);
var ChartSettingsPanel = _ChartSettingsPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/tabbedChartMenu.ts
var _TabbedChartMenu = class _TabbedChartMenu extends import_core48.Component {
  constructor(panels, chartMenuContext) {
    super();
    this.panels = panels;
    this.chartMenuContext = chartMenuContext;
    this.tabs = [];
  }
  init() {
    this.panels.forEach((panel) => {
      const panelType = panel.replace("chart", "").toLowerCase();
      const panelComp = this.createPanel(panelType);
      const tabItem = this.createTab(panel, panelType, panelComp);
      this.tabs.push(tabItem);
      this.addDestroyFunc(() => this.destroyBean(panelComp));
    });
    this.tabbedLayout = new import_core48.TabbedLayout({
      items: this.tabs,
      cssClass: "ag-chart-tabbed-menu",
      keepScrollPosition: true,
      suppressFocusBodyOnOpen: true,
      suppressTrapFocus: true,
      enableCloseButton: !this.chartMenuService.isLegacyFormat(),
      closeButtonAriaLabel: this.chartTranslationService.translate("ariaChartMenuClose"),
      onCloseClicked: () => {
        var _a;
        (_a = this.eventSource) == null ? void 0 : _a.focus({ preventScroll: true });
        this.dispatchEvent({ type: _TabbedChartMenu.EVENT_CLOSED });
      }
    });
    this.getContext().createBean(this.tabbedLayout);
  }
  createTab(name, title, panelComp) {
    const eWrapperDiv = document.createElement("div");
    eWrapperDiv.classList.add("ag-chart-tab", `ag-chart-${title}`);
    this.getContext().createBean(panelComp);
    eWrapperDiv.appendChild(panelComp.getGui());
    const titleEl = document.createElement("div");
    const translatedTitle = this.chartTranslationService.translate(title);
    titleEl.innerText = translatedTitle;
    return {
      title: titleEl,
      titleLabel: translatedTitle,
      bodyPromise: import_core48.AgPromise.resolve(eWrapperDiv),
      getScrollableContainer: () => {
        const scrollableContainer = eWrapperDiv.querySelector(".ag-scrollable-container");
        return scrollableContainer || eWrapperDiv;
      },
      name
    };
  }
  showTab(tab) {
    const tabItem = this.tabs[tab];
    this.tabbedLayout.showItem(tabItem);
  }
  getGui() {
    return this.tabbedLayout && this.tabbedLayout.getGui();
  }
  showMenu(eventSource, suppressFocus) {
    var _a;
    this.eventSource = eventSource;
    if (!suppressFocus) {
      (_a = this.tabbedLayout) == null ? void 0 : _a.focusHeader(true);
    }
  }
  destroy() {
    if (this.parentComponent && this.parentComponent.isAlive()) {
      this.destroyBean(this.parentComponent);
    }
    super.destroy();
  }
  createPanel(panelType) {
    const { chartController, chartOptionsService } = this.chartMenuContext;
    switch (panelType) {
      case _TabbedChartMenu.TAB_DATA:
        return new ChartDataPanel(chartController, chartOptionsService);
      case _TabbedChartMenu.TAB_FORMAT:
        return new FormatPanel(this.chartMenuContext);
      default:
        return new ChartSettingsPanel(chartController);
    }
  }
};
_TabbedChartMenu.EVENT_CLOSED = "closed";
_TabbedChartMenu.TAB_DATA = "data";
_TabbedChartMenu.TAB_FORMAT = "format";
__decorateClass([
  (0, import_core48.Autowired)("chartTranslationService")
], _TabbedChartMenu.prototype, "chartTranslationService", 2);
__decorateClass([
  (0, import_core48.Autowired)("chartMenuService")
], _TabbedChartMenu.prototype, "chartMenuService", 2);
__decorateClass([
  import_core48.PostConstruct
], _TabbedChartMenu.prototype, "init", 1);
var TabbedChartMenu = _TabbedChartMenu;

// enterprise-modules/charts/src/charts/chartComp/menu/chartToolbar.ts
var import_core49 = require("@ag-grid-community/core");
var ChartToolbar = class extends import_core49.Component {
  constructor() {
    super(
      /* html */
      `<div class="ag-chart-menu" ref="eMenu"></div>`
    );
    this.buttonListenersDestroyFuncs = [];
  }
  updateParams(params) {
    const { buttons } = params;
    this.createButtons(buttons);
  }
  createButtons(buttons) {
    this.buttonListenersDestroyFuncs.forEach((func) => func == null ? void 0 : func());
    this.buttonListenersDestroyFuncs = [];
    const menuEl = this.eMenu;
    import_core49._.clearElement(menuEl);
    buttons.forEach((buttonConfig) => {
      const { buttonName, iconName, callback } = buttonConfig;
      const buttonEl = this.createButton(iconName);
      const tooltipTitle = this.chartTranslationService.translate(buttonName + "ToolbarTooltip");
      if (tooltipTitle && buttonEl instanceof HTMLElement) {
        buttonEl.title = tooltipTitle;
      }
      this.buttonListenersDestroyFuncs.push(
        this.addManagedListener(buttonEl, "click", (event) => callback(event.target))
      );
      menuEl.appendChild(buttonEl);
    });
  }
  createButton(iconName) {
    let buttonEl = import_core49._.createIconNoSpan(
      iconName,
      this.gos,
      void 0,
      true
    );
    buttonEl.classList.add("ag-chart-menu-icon");
    if (!this.chartMenuService.isLegacyFormat()) {
      buttonEl = this.wrapButton(buttonEl);
    }
    return buttonEl;
  }
  wrapButton(buttonEl) {
    const wrapperEl = this.gos.getDocument().createElement("button");
    wrapperEl.appendChild(buttonEl);
    wrapperEl.classList.add("ag-chart-menu-toolbar-button");
    return wrapperEl;
  }
  destroy() {
    this.buttonListenersDestroyFuncs = [];
    super.destroy();
  }
};
__decorateClass([
  (0, import_core49.Autowired)("chartTranslationService")
], ChartToolbar.prototype, "chartTranslationService", 2);
__decorateClass([
  (0, import_core49.Autowired)("chartMenuService")
], ChartToolbar.prototype, "chartMenuService", 2);
__decorateClass([
  (0, import_core49.RefSelector)("eMenu")
], ChartToolbar.prototype, "eMenu", 2);

// enterprise-modules/charts/src/charts/chartComp/menu/chartMenu.ts
var _ChartMenu = class _ChartMenu extends import_core50.Component {
  constructor(eChartContainer, eMenuPanelContainer, chartMenuContext) {
    super(_ChartMenu.TEMPLATE);
    this.eChartContainer = eChartContainer;
    this.eMenuPanelContainer = eMenuPanelContainer;
    this.chartMenuContext = chartMenuContext;
    this.buttons = {
      chartSettings: { iconName: "menu", callback: () => this.showMenu({ panel: this.defaultPanel }) },
      chartData: { iconName: "menu", callback: () => this.showMenu({ panel: "chartData" }) },
      chartFormat: { iconName: "menu", callback: () => this.showMenu({ panel: "chartFormat" }) },
      chartLink: { iconName: "linked", callback: () => this.chartMenuService.toggleLinked(this.chartMenuContext) },
      chartUnlink: { iconName: "unlinked", callback: () => this.chartMenuService.toggleLinked(this.chartMenuContext) },
      chartDownload: { iconName: "save", callback: () => this.chartMenuService.downloadChart(this.chartMenuContext) },
      chartMenu: { iconName: "menuAlt", callback: (eventSource) => this.showMenuList(eventSource) }
    };
    this.panels = [];
    this.menuVisible = false;
    this.chartController = chartMenuContext.chartController;
  }
  postConstruct() {
    this.legacyFormat = this.chartMenuService.isLegacyFormat();
    this.chartToolbar = this.createManagedBean(new ChartToolbar());
    this.getGui().appendChild(this.chartToolbar.getGui());
    if (this.legacyFormat) {
      this.createLegacyToggleButton();
    }
    this.refreshToolbarAndPanels();
    this.addManagedListener(this.eventService, import_core50.Events.EVENT_CHART_CREATED, (e) => {
      var _a;
      if (e.chartId === this.chartController.getChartId()) {
        const showDefaultToolPanel = Boolean((_a = this.gos.get("chartToolPanelsDef")) == null ? void 0 : _a.defaultToolPanel);
        if (showDefaultToolPanel) {
          this.showMenu({ panel: this.defaultPanel, animate: false, suppressFocus: true });
        }
      }
    });
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_LINKED_CHANGED, this.refreshToolbarAndPanels.bind(this));
    this.refreshMenuClasses();
    if (this.legacyFormat && !this.gos.get("suppressChartToolPanelsButton") && this.panels.length > 0) {
      this.getGui().classList.add("ag-chart-tool-panel-button-enable");
      if (this.eHideButton) {
        this.addManagedListener(this.eHideButton, "click", this.toggleMenu.bind(this));
      }
    }
    if (!this.legacyFormat) {
      this.getGui().classList.add("ag-chart-menu-wrapper");
    }
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.refreshToolbarAndPanels.bind(this));
  }
  isVisible() {
    return this.menuVisible;
  }
  getExtraPaddingDirections() {
    const topItems = ["chartMenu", "chartLink", "chartUnlink", "chartDownload"];
    const rightItems = ["chartSettings", "chartData", "chartFormat"];
    const result = [];
    if (topItems.some((v) => this.chartToolbarOptions.includes(v))) {
      result.push("top");
    }
    if (rightItems.some((v) => this.chartToolbarOptions.includes(v))) {
      result.push(this.gos.get("enableRtl") ? "left" : "right");
    }
    return result;
  }
  createLegacyToggleButton() {
    const eDocument = this.gos.getDocument();
    this.eHideButton = eDocument.createElement("button");
    this.eHideButton.classList.add("ag-button", "ag-chart-menu-close");
    this.eHideButtonIcon = eDocument.createElement("span");
    this.eHideButtonIcon.classList.add("ag-icon", "ag-icon-contracted");
    this.eHideButton.appendChild(this.eHideButtonIcon);
    this.getGui().appendChild(this.eHideButton);
  }
  refreshToolbarAndPanels() {
    this.initToolbarOptionsAndPanels();
    this.updateToolbar();
  }
  initToolbarOptionsAndPanels() {
    const {
      panels,
      defaultPanel,
      chartToolbarOptions
    } = this.chartMenuService.getToolbarOptionsAndPanels(this.chartController);
    this.panels = panels;
    this.defaultPanel = defaultPanel;
    this.chartToolbarOptions = chartToolbarOptions;
  }
  updateToolbar() {
    const buttons = this.chartToolbarOptions.map((buttonName) => {
      const { iconName, callback } = this.buttons[buttonName];
      return {
        buttonName,
        iconName,
        callback
      };
    });
    this.chartToolbar.updateParams({ buttons });
  }
  createMenuPanel(defaultTab) {
    const width = this.environment.chartMenuPanelWidth();
    const menuPanel = this.menuPanel = this.createBean(new import_core50.AgPanel({
      minWidth: width,
      width,
      height: "100%",
      closable: true,
      hideTitleBar: true,
      cssIdentifier: "chart-menu"
    }));
    menuPanel.setParentComponent(this);
    this.eMenuPanelContainer.appendChild(menuPanel.getGui());
    this.tabbedMenu = this.createBean(new TabbedChartMenu(
      this.panels,
      this.chartMenuContext
    ));
    this.addManagedListener(this.tabbedMenu, TabbedChartMenu.EVENT_CLOSED, () => {
      this.hideMenu(false);
    });
    this.addManagedListener(
      menuPanel,
      import_core50.Component.EVENT_DESTROYED,
      () => this.destroyBean(this.tabbedMenu)
    );
    return new import_core50.AgPromise((res) => {
      window.setTimeout(() => {
        menuPanel.setBodyComponent(this.tabbedMenu);
        this.tabbedMenu.showTab(defaultTab);
        res(menuPanel);
        if (this.legacyFormat) {
          this.addManagedListener(
            this.eChartContainer,
            "click",
            (event) => {
              if (this.getGui().contains(event.target)) {
                return;
              }
              if (this.menuVisible) {
                this.hideMenu();
              }
            }
          );
        }
      }, 100);
    });
  }
  showContainer(eventSource, suppressFocus) {
    if (!this.menuPanel) {
      return;
    }
    this.menuVisible = true;
    this.showParent(this.menuPanel.getWidth());
    this.refreshMenuClasses();
    this.tabbedMenu.showMenu(eventSource, suppressFocus);
  }
  toggleMenu() {
    this.menuVisible ? this.hideMenu(this.legacyFormat) : this.showMenu({ animate: this.legacyFormat });
  }
  showMenu(params) {
    const { panel, animate = true, eventSource, suppressFocus } = params;
    if (!animate) {
      this.eMenuPanelContainer.classList.add("ag-no-transition");
    }
    if (this.menuPanel && !panel) {
      this.showContainer(eventSource, suppressFocus);
    } else {
      const menuPanel = panel || this.defaultPanel;
      let tab = this.panels.indexOf(menuPanel);
      if (tab < 0) {
        console.warn(`AG Grid: '${panel}' is not a valid Chart Tool Panel name`);
        tab = this.panels.indexOf(this.defaultPanel);
      }
      if (this.menuPanel) {
        this.tabbedMenu.showTab(tab);
        this.showContainer(eventSource, suppressFocus);
      } else {
        this.createMenuPanel(tab).then(() => this.showContainer(eventSource, suppressFocus));
      }
    }
    if (!animate) {
      setTimeout(() => {
        if (!this.isAlive()) {
          return;
        }
        this.eMenuPanelContainer.classList.remove("ag-no-transition");
      }, 500);
    }
  }
  hideMenu(animate = true) {
    if (!animate) {
      this.eMenuPanelContainer.classList.add("ag-no-transition");
    }
    this.hideParent();
    window.setTimeout(() => {
      this.menuVisible = false;
      this.refreshMenuClasses();
      if (!animate) {
        this.eMenuPanelContainer.classList.remove("ag-no-transition");
      }
    }, 500);
  }
  refreshMenuClasses() {
    this.eChartContainer.classList.toggle("ag-chart-menu-visible", this.menuVisible);
    this.eChartContainer.classList.toggle("ag-chart-menu-hidden", !this.menuVisible);
    if (this.legacyFormat && !this.gos.get("suppressChartToolPanelsButton")) {
      this.eHideButtonIcon.classList.toggle("ag-icon-contracted", this.menuVisible);
      this.eHideButtonIcon.classList.toggle("ag-icon-expanded", !this.menuVisible);
    }
  }
  showParent(width) {
    this.eMenuPanelContainer.style.minWidth = `${width}px`;
  }
  hideParent() {
    this.eMenuPanelContainer.style.minWidth = "0";
  }
  showMenuList(eventSource) {
    this.chartMenuListFactory.showMenuList({
      eventSource,
      showMenu: () => this.showMenu({ animate: false, eventSource }),
      chartMenuContext: this.chartMenuContext
    });
  }
  destroy() {
    super.destroy();
    if (this.menuPanel && this.menuPanel.isAlive()) {
      this.destroyBean(this.menuPanel);
    }
    if (this.tabbedMenu && this.tabbedMenu.isAlive()) {
      this.destroyBean(this.tabbedMenu);
    }
  }
};
_ChartMenu.TEMPLATE = /* html */
`<div></div>`;
__decorateClass([
  (0, import_core50.Autowired)("chartMenuService")
], _ChartMenu.prototype, "chartMenuService", 2);
__decorateClass([
  (0, import_core50.Autowired)("chartMenuListFactory")
], _ChartMenu.prototype, "chartMenuListFactory", 2);
__decorateClass([
  import_core50.PostConstruct
], _ChartMenu.prototype, "postConstruct", 1);
var ChartMenu = _ChartMenu;

// enterprise-modules/charts/src/charts/chartComp/chartTitle/titleEdit.ts
var import_core51 = require("@ag-grid-community/core");
var _TitleEdit = class _TitleEdit extends import_core51.Component {
  constructor(chartMenu) {
    super(_TitleEdit.TEMPLATE);
    this.chartMenu = chartMenu;
    this.destroyableChartListeners = [];
    this.editing = false;
  }
  init() {
    this.addManagedListener(this.getGui(), "keydown", (e) => {
      if (this.editing && e.key === "Enter" && !e.shiftKey) {
        this.handleEndEditing();
        e.preventDefault();
      }
    });
    this.addManagedListener(this.getGui(), "input", () => {
      if (this.editing) {
        this.updateHeight();
      }
    });
    this.addManagedListener(this.getGui(), "blur", () => this.endEditing());
  }
  /* should be called when the containing component changes to a new chart proxy */
  refreshTitle(chartMenuContext) {
    this.chartController = chartMenuContext.chartController;
    this.chartOptionsService = chartMenuContext.chartOptionsService;
    this.chartMenuUtils = chartMenuContext.chartMenuParamsFactory.getChartOptions();
    for (const destroyFn of this.destroyableChartListeners) {
      destroyFn();
    }
    this.destroyableChartListeners = [];
    const chartProxy = this.chartController.getChartProxy();
    const chart = chartProxy.getChart();
    const canvas = chart.canvasElement;
    const destroyDbleClickListener = this.addManagedListener(canvas, "dblclick", (event) => {
      const { title } = chart;
      if (title && title.node.containsPoint(event.offsetX, event.offsetY)) {
        const bbox = title.node.computeBBox();
        const xy = title.node.inverseTransformPoint(bbox.x, bbox.y);
        this.startEditing(__spreadValues(__spreadValues({}, bbox), xy), canvas.width);
      }
    });
    let wasInTitle = false;
    const destroyMouseMoveListener = this.addManagedListener(canvas, "mousemove", (event) => {
      const { title } = chart;
      const inTitle = !!(title && title.enabled && title.node.containsPoint(event.offsetX, event.offsetY));
      if (wasInTitle !== inTitle) {
        canvas.style.cursor = inTitle ? "pointer" : "";
      }
      wasInTitle = inTitle;
    });
    this.destroyableChartListeners = [
      destroyDbleClickListener,
      destroyMouseMoveListener
    ];
  }
  startEditing(titleBBox, canvasWidth) {
    if (this.chartMenuService.isLegacyFormat() && this.chartMenu && this.chartMenu.isVisible()) {
      return;
    }
    if (this.editing) {
      return;
    }
    this.editing = true;
    const minimumTargetInputWidth = 300;
    const inputWidth = Math.max(Math.min(titleBBox.width + 20, canvasWidth), minimumTargetInputWidth);
    const element = this.getGui();
    element.classList.add("currently-editing");
    const inputStyle = element.style;
    inputStyle.fontFamily = this.chartMenuUtils.getValue("title.fontFamily");
    inputStyle.fontWeight = this.chartMenuUtils.getValue("title.fontWeight");
    inputStyle.fontStyle = this.chartMenuUtils.getValue("title.fontStyle");
    inputStyle.fontSize = this.chartMenuUtils.getValue("title.fontSize") + "px";
    inputStyle.color = this.chartMenuUtils.getValue("title.color");
    const oldTitle = this.chartMenuUtils.getValue("title.text");
    const isTitlePlaceholder = oldTitle === this.chartTranslationService.translate("titlePlaceholder");
    element.value = isTitlePlaceholder ? "" : oldTitle;
    const oldTitleLines = oldTitle.split(/\r?\n/g).length;
    inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2 - 1) + "px";
    inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - oldTitleLines * this.getLineHeight() / 2 - 2) + "px";
    inputStyle.width = Math.round(inputWidth) + "px";
    inputStyle.lineHeight = this.getLineHeight() + "px";
    this.updateHeight();
    element.focus();
  }
  updateHeight() {
    const element = this.getGui();
    const oldTitleLines = this.chartMenuUtils.getValue("title.text").split(/\r?\n/g).length;
    const currentTitleLines = element.value.split(/\r?\n/g).length;
    element.style.height = Math.round(Math.max(oldTitleLines, currentTitleLines) * this.getLineHeight()) + 4 + "px";
  }
  getLineHeight() {
    const fixedLineHeight = this.chartMenuUtils.getValue("title.lineHeight");
    if (fixedLineHeight) {
      return parseInt(fixedLineHeight);
    }
    return Math.round(parseInt(this.chartMenuUtils.getValue("title.fontSize")) * 1.2);
  }
  handleEndEditing() {
    const titleColor = this.chartMenuUtils.getValue("title.color");
    const transparentColor = "rgba(0, 0, 0, 0)";
    this.chartMenuUtils.setValue("title.color", transparentColor);
    this.chartOptionsService.awaitChartOptionUpdate(() => this.endEditing());
    this.chartOptionsService.awaitChartOptionUpdate(() => {
      this.chartMenuUtils.setValue("title.color", titleColor);
    });
  }
  endEditing() {
    if (!this.editing) {
      return;
    }
    this.editing = false;
    const value = this.getGui().value;
    if (value && value.trim() !== "") {
      this.chartMenuUtils.setValue("title.text", value);
      this.chartMenuUtils.setValue("title.enabled", true);
    } else {
      this.chartMenuUtils.setValue("title.text", "");
      this.chartMenuUtils.setValue("title.enabled", false);
    }
    this.getGui().classList.remove("currently-editing");
    this.chartOptionsService.awaitChartOptionUpdate(() => {
      this.eventService.dispatchEvent({ type: "chartTitleEdit" });
    });
  }
};
_TitleEdit.TEMPLATE = /* html */
`<textarea
             class="ag-chart-title-edit"
             style="padding:0; border:none; border-radius: 0; min-height: 0; text-align: center; resize: none;" />
        `;
__decorateClass([
  (0, import_core51.Autowired)("chartTranslationService")
], _TitleEdit.prototype, "chartTranslationService", 2);
__decorateClass([
  (0, import_core51.Autowired)("chartMenuService")
], _TitleEdit.prototype, "chartMenuService", 2);
__decorateClass([
  import_core51.PostConstruct
], _TitleEdit.prototype, "init", 1);
var TitleEdit = _TitleEdit;

// enterprise-modules/charts/src/charts/chartComp/chartProxies/cartesian/barChartProxy.ts
var import_core52 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/chartProxies/chartProxy.ts
var import_ag_charts_community29 = require("ag-charts-community");

// enterprise-modules/charts/src/charts/chartComp/utils/integration.ts
function deproxy(chartOrProxy) {
  if (chartOrProxy.chart != null) {
    return chartOrProxy.chart;
  }
  return chartOrProxy;
}

// enterprise-modules/charts/src/charts/chartComp/chartProxies/chartProxy.ts
var ChartProxy = class {
  constructor(chartProxyParams) {
    this.chartProxyParams = chartProxyParams;
    this.clearThemeOverrides = false;
    this.isEnterpriseCharts = import_ag_charts_community29._ModuleSupport.enterpriseModule.isEnterprise;
    this.chart = chartProxyParams.chartInstance;
    this.chartType = chartProxyParams.chartType;
    this.crossFiltering = chartProxyParams.crossFiltering;
    this.crossFilterCallback = chartProxyParams.crossFilterCallback;
    this.standaloneChartType = getSeriesType(this.chartType);
    if (this.chart == null) {
      this.chart = import_ag_charts_community29.AgCharts.create(this.getCommonChartOptions());
    } else {
      this.clearThemeOverrides = true;
    }
  }
  crossFilteringReset() {
  }
  update(params) {
    import_ag_charts_community29.AgCharts.update(this.getChartRef(), this.getUpdateOptions(params, this.getCommonChartOptions(params.updatedOverrides)));
  }
  updateThemeOverrides(themeOverrides) {
    import_ag_charts_community29.AgCharts.updateDelta(this.getChartRef(), { theme: { overrides: themeOverrides } });
  }
  getChart() {
    return deproxy(this.chart);
  }
  getChartRef() {
    return this.chart;
  }
  downloadChart(dimensions, fileName, fileFormat) {
    const { chart } = this;
    const rawChart = deproxy(chart);
    const imageFileName = fileName || (rawChart.title ? rawChart.title.text : "chart");
    const { width, height } = dimensions || {};
    import_ag_charts_community29.AgCharts.download(chart, { width, height, fileName: imageFileName, fileFormat });
  }
  getChartImageDataURL(type) {
    return this.getChart().getCanvasDataURL(type);
  }
  getChartOptions() {
    return this.chart.getOptions();
  }
  getChartThemeOverrides() {
    var _a;
    const chartOptionsTheme = this.getChartOptions().theme;
    return (_a = chartOptionsTheme.overrides) != null ? _a : {};
  }
  getChartPalette() {
    return import_ag_charts_community29._Theme.getChartTheme(this.getChartOptions().theme).palette;
  }
  setPaired(paired) {
    const seriesType = getSeriesType(this.chartProxyParams.chartType);
    import_ag_charts_community29.AgCharts.updateDelta(this.chart, { theme: { overrides: { [seriesType]: { paired } } } });
  }
  isPaired() {
    const seriesType = getSeriesType(this.chartProxyParams.chartType);
    return get(this.getChartThemeOverrides(), `${seriesType}.paired`, true);
  }
  lookupCustomChartTheme(themeName) {
    return lookupCustomChartTheme(this.chartProxyParams, themeName);
  }
  getSeriesGroupType() {
    return void 0;
  }
  transformCategoryData(data, categoryKey) {
    return data.map((d, index) => {
      const value = d[categoryKey];
      const valueString = value && value.toString ? value.toString() : "";
      const datum = __spreadValues({}, d);
      datum[categoryKey] = { id: index, value, toString: () => valueString };
      return datum;
    });
  }
  getCommonChartOptions(updatedOverrides) {
    var _a, _b;
    const existingOptions = this.clearThemeOverrides ? {} : (_b = (_a = this.chart) == null ? void 0 : _a.getOptions()) != null ? _b : {};
    const formattingPanelOverrides = this.chart != null ? this.getActiveFormattingPanelOverrides() : void 0;
    this.clearThemeOverrides = false;
    const theme = createAgChartTheme(
      this.chartProxyParams,
      this,
      this.isEnterpriseCharts,
      this.getChartThemeDefaults(),
      updatedOverrides != null ? updatedOverrides : formattingPanelOverrides
    );
    const newOptions = __spreadProps(__spreadValues({}, existingOptions), {
      mode: "integrated"
    });
    newOptions.theme = theme;
    newOptions.container = this.chartProxyParams.parentElement;
    return newOptions;
  }
  getChartThemeDefaults() {
    const seriesOverrides = this.getSeriesChartThemeDefaults();
    const seriesChartOptions = seriesOverrides ? {
      [this.standaloneChartType]: seriesOverrides
    } : {};
    const crosshair = {
      enabled: true,
      snap: true,
      label: {
        enabled: false
      }
    };
    return __spreadValues({
      common: {
        navigator: {
          enabled: false
        },
        zoom: {
          enabled: true
        },
        animation: {
          enabled: true,
          duration: 500
        },
        axes: {
          number: { crosshair },
          category: { crosshair },
          log: { crosshair },
          time: { crosshair }
        }
      }
    }, seriesChartOptions);
  }
  getSeriesChartThemeDefaults() {
    return void 0;
  }
  getActiveFormattingPanelOverrides() {
    var _a, _b;
    if (this.clearThemeOverrides) {
      return {};
    }
    const inUseTheme = (_a = this.chart) == null ? void 0 : _a.getOptions().theme;
    return (_b = inUseTheme == null ? void 0 : inUseTheme.overrides) != null ? _b : {};
  }
  destroy({ keepChartInstance = false } = {}) {
    if (keepChartInstance) {
      this.chart.resetAnimations();
      return this.chart;
    }
    this.destroyChart();
  }
  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = void 0;
    }
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/cartesian/cartesianChartProxy.ts
var CartesianChartProxy = class extends ChartProxy {
  constructor(params) {
    super(params);
    this.crossFilteringAllPoints = /* @__PURE__ */ new Set();
    this.crossFilteringSelectedPoints = [];
  }
  getUpdateOptions(params, commonChartOptions) {
    const axes = this.getAxes(params, commonChartOptions);
    return __spreadProps(__spreadValues({}, commonChartOptions), {
      data: this.getData(params, axes),
      axes,
      series: this.getSeries(params)
    });
  }
  getData(params, axes) {
    const supportsCrossFiltering = ["area", "line"].includes(this.standaloneChartType);
    return this.crossFiltering && supportsCrossFiltering ? this.getCrossFilterData(params) : this.getDataTransformedData(params, axes);
  }
  getDataTransformedData(params, axes) {
    const xAxisType = axes[0].type;
    const { categories, data } = params;
    const [category] = categories;
    switch (xAxisType) {
      case "category":
        return this.transformCategoryData(data, category.id);
      case "time":
        return this.transformTimeData(data, category.id);
      default:
        return data;
    }
  }
  getXAxisType(params) {
    if (params.grouping) {
      return "grouped-category";
    } else if (this.isXAxisOfType(params, "time", (value) => value instanceof Date)) {
      return "time";
    } else if (this.isXAxisOfType(params, "number")) {
      return "number";
    }
    return "category";
  }
  isXAxisOfType(params, type, isInstance) {
    const [category] = params.categories;
    if (category == null ? void 0 : category.chartDataType) {
      return category.chartDataType === type;
    }
    if (!isInstance) {
      return false;
    }
    const testDatum = params.data[0];
    if (!testDatum) {
      return false;
    }
    return isInstance(testDatum[category.id]);
  }
  transformTimeData(data, categoryKey) {
    var _a;
    const firstValue = (_a = data[0]) == null ? void 0 : _a[categoryKey];
    if (firstValue instanceof Date) {
      return data;
    }
    return data.map((datum) => {
      const value = datum[categoryKey];
      return typeof value === "string" ? __spreadProps(__spreadValues({}, datum), {
        [categoryKey]: new Date(value)
      }) : datum;
    });
  }
  crossFilteringReset() {
    this.crossFilteringSelectedPoints = [];
    this.crossFilteringAllPoints.clear();
  }
  crossFilteringPointSelected(point) {
    return this.crossFilteringSelectedPoints.length == 0 || this.crossFilteringSelectedPoints.includes(point);
  }
  crossFilteringDeselectedPoints() {
    return this.crossFilteringSelectedPoints.length > 0 && this.crossFilteringAllPoints.size !== this.crossFilteringSelectedPoints.length;
  }
  extractLineAreaCrossFilterSeries(series, params) {
    const [category] = params.categories;
    const getYKey = (yKey) => {
      if (this.standaloneChartType === "area") {
        const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
        return lastSelectedChartId === params.chartId ? yKey + "-total" : yKey;
      }
      return yKey + "-total";
    };
    return series.map((s) => {
      s.yKey = getYKey(s.yKey);
      s.listeners = {
        nodeClick: (e) => {
          const value = e.datum[s.xKey];
          const multiSelection = e.event.metaKey || e.event.ctrlKey;
          this.crossFilteringAddSelectedPoint(multiSelection, value);
          this.crossFilterCallback(e);
        }
      };
      s.marker = {
        formatter: (p) => {
          const value = p.datum[category.id];
          return {
            fill: p.highlighted ? "yellow" : p.fill,
            size: p.highlighted ? 14 : this.crossFilteringPointSelected(value) ? 8 : 0
          };
        }
      };
      if (this.standaloneChartType === "area") {
        s.fillOpacity = this.crossFilteringDeselectedPoints() ? 0.3 : 1;
      }
      if (this.standaloneChartType === "line") {
        s.strokeOpacity = this.crossFilteringDeselectedPoints() ? 0.3 : 1;
      }
      return s;
    });
  }
  getCrossFilterData(params) {
    this.crossFilteringAllPoints.clear();
    const [category] = params.categories;
    const colId = params.fields[0].colId;
    const filteredOutColId = `${colId}-filtered-out`;
    const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
    return params.data.map((d) => {
      const value = d[category.id];
      this.crossFilteringAllPoints.add(value);
      const pointSelected = this.crossFilteringPointSelected(value);
      if (this.standaloneChartType === "area" && lastSelectedChartId === params.chartId) {
        d[`${colId}-total`] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
      }
      if (this.standaloneChartType === "line") {
        d[`${colId}-total`] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
      }
      return d;
    });
  }
  crossFilteringAddSelectedPoint(multiSelection, value) {
    multiSelection ? this.crossFilteringSelectedPoints.push(value) : this.crossFilteringSelectedPoints = [value];
  }
  isHorizontal(commonChartOptions) {
    const seriesType = this.standaloneChartType;
    if (seriesType !== "waterfall" && seriesType !== "box-plot" && seriesType !== "range-bar") {
      return false;
    }
    const theme = commonChartOptions.theme;
    const isHorizontal = (theme2) => {
      var _a, _b, _c;
      const direction = (_c = (_b = (_a = theme2 == null ? void 0 : theme2.overrides) == null ? void 0 : _a[seriesType]) == null ? void 0 : _b.series) == null ? void 0 : _c.direction;
      if (direction != null) {
        return direction === "horizontal";
      }
      if (typeof (theme2 == null ? void 0 : theme2.baseTheme) === "object") {
        return isHorizontal(theme2.baseTheme);
      }
      return false;
    };
    return isHorizontal(theme);
  }
};

// enterprise-modules/charts/src/charts/chartComp/utils/color.ts
var import_ag_charts_community30 = require("ag-charts-community");
function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return alpha ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgba(${r}, ${g}, ${b})`;
}
function changeOpacity(fills, alpha) {
  return fills.map((fill) => {
    const c = import_ag_charts_community30._Util.Color.fromString(fill);
    return new import_ag_charts_community30._Util.Color(c.r, c.g, c.b, alpha).toHexString();
  });
}

// enterprise-modules/charts/src/charts/chartComp/chartProxies/cartesian/barChartProxy.ts
var HORIZONTAL_CHART_TYPES = /* @__PURE__ */ new Set(["bar", "groupedBar", "stackedBar", "normalizedBar"]);
var BarChartProxy = class extends CartesianChartProxy {
  constructor(params) {
    super(params);
  }
  getAxes(params) {
    const axes = [
      {
        type: this.getXAxisType(params),
        position: this.isHorizontal() ? "left" : "bottom"
      },
      {
        type: "number",
        position: this.isHorizontal() ? "bottom" : "left"
      }
    ];
    if (this.isNormalised()) {
      const numberAxis = axes[1];
      numberAxis.label = __spreadProps(__spreadValues({}, numberAxis.label), { formatter: (params2) => Math.round(params2.value) + "%" });
    }
    return axes;
  }
  getSeries(params) {
    const [category] = params.categories;
    const series = params.fields.map((f) => ({
      type: this.standaloneChartType,
      direction: this.isHorizontal() ? "horizontal" : "vertical",
      stacked: this.crossFiltering || isStacked(this.chartType),
      normalizedTo: this.isNormalised() ? 100 : void 0,
      xKey: category.id,
      xName: category.name,
      yKey: f.colId,
      yName: f.displayName
    }));
    return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
  }
  extractCrossFilterSeries(series) {
    const palette = this.getChartPalette();
    const updatePrimarySeries = (seriesOptions, index) => {
      return __spreadProps(__spreadValues({}, seriesOptions), {
        highlightStyle: { item: { fill: void 0 } },
        fill: palette == null ? void 0 : palette.fills[index],
        stroke: palette == null ? void 0 : palette.strokes[index],
        listeners: {
          nodeClick: this.crossFilterCallback
        }
      });
    };
    const updateFilteredOutSeries = (seriesOptions) => {
      const yKey = seriesOptions.yKey + "-filtered-out";
      return __spreadProps(__spreadValues({}, deepMerge({}, seriesOptions)), {
        yKey,
        fill: hexToRGBA(seriesOptions.fill, "0.3"),
        stroke: hexToRGBA(seriesOptions.stroke, "0.3"),
        showInLegend: false
      });
    };
    const allSeries = [];
    for (let i = 0; i < series.length; i++) {
      const primarySeries = updatePrimarySeries(series[i], i);
      allSeries.push(primarySeries);
      allSeries.push(updateFilteredOutSeries(primarySeries));
    }
    return allSeries;
  }
  isNormalised() {
    const normalisedCharts = ["normalizedColumn", "normalizedBar"];
    return !this.crossFiltering && import_core52._.includes(normalisedCharts, this.chartType);
  }
  isHorizontal() {
    return HORIZONTAL_CHART_TYPES.has(this.chartType);
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/cartesian/areaChartProxy.ts
var AreaChartProxy = class extends CartesianChartProxy {
  constructor(params) {
    super(params);
  }
  getAxes(params) {
    const axes = [
      {
        type: this.getXAxisType(params),
        position: "bottom"
      },
      {
        type: "number",
        position: "left"
      }
    ];
    if (this.isNormalised()) {
      const numberAxis = axes[1];
      numberAxis.label = __spreadProps(__spreadValues({}, numberAxis.label), { formatter: (params2) => Math.round(params2.value) + "%" });
    }
    return axes;
  }
  getSeries(params) {
    const [category] = params.categories;
    const series = params.fields.map((f) => ({
      type: this.standaloneChartType,
      xKey: category.id,
      xName: category.name,
      yKey: f.colId,
      yName: f.displayName,
      normalizedTo: this.chartType === "normalizedArea" ? 100 : void 0,
      stacked: ["normalizedArea", "stackedArea"].includes(this.chartType)
    }));
    return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
  }
  isNormalised() {
    return !this.crossFiltering && this.chartType === "normalizedArea";
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/cartesian/lineChartProxy.ts
var LineChartProxy = class extends CartesianChartProxy {
  constructor(params) {
    super(params);
  }
  getAxes(params) {
    return [
      {
        type: this.getXAxisType(params),
        position: "bottom"
      },
      {
        type: "number",
        position: "left"
      }
    ];
  }
  getSeries(params) {
    const [category] = params.categories;
    const series = params.fields.map((f) => ({
      type: this.standaloneChartType,
      xKey: category.id,
      xName: category.name,
      yKey: f.colId,
      yName: f.displayName
    }));
    return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/polar/polarChartProxy.ts
var PolarChartProxy = class extends ChartProxy {
  constructor(params) {
    super(params);
  }
  getAxes(_38) {
    const radialBar = this.standaloneChartType === "radial-bar";
    return [
      { type: radialBar ? "angle-number" : "angle-category" },
      { type: radialBar ? "radius-category" : "radius-number" }
    ];
  }
  getSeries(params) {
    const { fields, categories, seriesGroupType } = params;
    const [category] = categories;
    const radialBar = this.standaloneChartType === "radial-bar";
    const seriesGroupTypeOptions = this.getSeriesGroupTypeOptions(seriesGroupType);
    return fields.map((f) => {
      var _a, _b;
      return __spreadValues({
        type: this.standaloneChartType,
        angleKey: radialBar ? f.colId : category.id,
        angleName: radialBar ? (_a = f.displayName) != null ? _a : void 0 : category.name,
        radiusKey: radialBar ? category.id : f.colId,
        radiusName: radialBar ? category.name : (_b = f.displayName) != null ? _b : void 0
      }, seriesGroupTypeOptions);
    });
  }
  getSeriesGroupType() {
    var _a, _b;
    const standaloneChartType = this.standaloneChartType;
    if (!["nightingale", "radial-bar", "radial-column"].includes(standaloneChartType)) {
      return void 0;
    }
    const firstSeriesProperties = (_b = (_a = this.getChart().series) == null ? void 0 : _a[0]) == null ? void 0 : _b.properties.toJson();
    const getStackedValue = () => firstSeriesProperties.normalizedTo ? "normalized" : "stacked";
    if (standaloneChartType === "nightingale") {
      return firstSeriesProperties.grouped ? "grouped" : getStackedValue();
    } else {
      return firstSeriesProperties.stacked ? getStackedValue() : "grouped";
    }
  }
  getUpdateOptions(params, commonChartOptions) {
    const axes = this.getAxes(params);
    return __spreadProps(__spreadValues({}, commonChartOptions), {
      data: this.getData(params, axes),
      axes,
      series: this.getSeries(params)
    });
  }
  getData(params, axes) {
    const isCategoryAxis = axes.some((axis) => axis.type === "angle-category" || axis.type === "radius-category");
    if (isCategoryAxis) {
      const [category] = params.categories;
      return this.transformCategoryData(params.data, category.id);
    } else {
      return params.data;
    }
  }
  getSeriesGroupTypeOptions(seriesGroupType) {
    if (!seriesGroupType) {
      return {};
    }
    return {
      grouped: seriesGroupType === "grouped" || void 0,
      stacked: seriesGroupType !== "grouped" || void 0,
      normalizedTo: seriesGroupType === "normalized" ? 100 : void 0
    };
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/pie/pieChartProxy.ts
var PieChartProxy = class _PieChartProxy extends ChartProxy {
  constructor(params) {
    super(params);
  }
  getUpdateOptions(params, commonChartOptions) {
    return __spreadProps(__spreadValues({}, commonChartOptions), {
      data: this.crossFiltering ? this.getCrossFilterData(params) : params.data,
      series: this.getSeries(params)
    });
  }
  getSeries(params) {
    const [category] = params.categories;
    const numFields = params.fields.length;
    const offset = {
      currentOffset: 0,
      offsetAmount: numFields > 1 ? 20 : 40
    };
    const series = this.getFields(params).map((f) => {
      var _a;
      const options = {
        type: this.standaloneChartType,
        angleKey: f.colId,
        angleName: f.displayName,
        sectorLabelKey: f.colId,
        calloutLabelName: category.name,
        calloutLabelKey: category.id
      };
      if (this.chartType === "donut" || this.chartType === "doughnut") {
        const { outerRadiusOffset, innerRadiusOffset } = _PieChartProxy.calculateOffsets(offset);
        const title = f.displayName ? {
          title: { text: f.displayName, showInLegend: numFields > 1 }
        } : void 0;
        return __spreadProps(__spreadValues(__spreadProps(__spreadValues({}, options), {
          type: "donut",
          outerRadiusOffset,
          innerRadiusOffset
        }), title), {
          calloutLine: {
            colors: (_a = this.getChartPalette()) == null ? void 0 : _a.strokes
          }
        });
      }
      return options;
    });
    return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
  }
  getCrossFilterData(params) {
    const colId = params.fields[0].colId;
    const filteredOutColId = `${colId}-filtered-out`;
    return params.data.map((d) => {
      const total = d[colId] + d[filteredOutColId];
      d[`${colId}-total`] = total;
      d[filteredOutColId] = 1;
      d[colId] = d[colId] / total;
      return d;
    });
  }
  extractCrossFilterSeries(series) {
    const palette = this.getChartPalette();
    const primaryOptions = (seriesOptions) => {
      return __spreadProps(__spreadValues({}, seriesOptions), {
        legendItemKey: seriesOptions.calloutLabelKey,
        calloutLabel: { enabled: false },
        // hide labels on primary series
        highlightStyle: { item: { fill: void 0 } },
        radiusKey: seriesOptions.angleKey,
        angleKey: seriesOptions.angleKey + "-total",
        radiusMin: 0,
        radiusMax: 1,
        listeners: {
          nodeClick: this.crossFilterCallback
        }
      });
    };
    const filteredOutOptions = (seriesOptions, angleKey2) => {
      var _a, _b;
      return __spreadProps(__spreadValues({}, deepMerge({}, primaryOpts)), {
        radiusKey: angleKey2 + "-filtered-out",
        fills: changeOpacity((_a = seriesOptions.fills) != null ? _a : palette.fills, 0.3),
        strokes: changeOpacity((_b = seriesOptions.strokes) != null ? _b : palette.strokes, 0.3),
        showInLegend: false
      });
    };
    const primarySeries = series[0];
    const angleKey = primarySeries.angleKey;
    const primaryOpts = primaryOptions(primarySeries);
    return [
      filteredOutOptions(primarySeries, angleKey),
      primaryOpts
    ];
  }
  static calculateOffsets(offset) {
    const outerRadiusOffset = offset.currentOffset;
    offset.currentOffset -= offset.offsetAmount;
    const innerRadiusOffset = offset.currentOffset;
    offset.currentOffset -= offset.offsetAmount;
    return { outerRadiusOffset, innerRadiusOffset };
  }
  getFields(params) {
    return this.chartType === "pie" ? params.fields.slice(0, 1) : params.fields;
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/cartesian/scatterChartProxy.ts
var ScatterChartProxy = class extends CartesianChartProxy {
  constructor(params) {
    super(params);
  }
  getAxes(_params) {
    return [
      {
        type: "number",
        position: "bottom"
      },
      {
        type: "number",
        position: "left"
      }
    ];
  }
  getSeries(params) {
    const [category] = params.categories;
    const paired = this.isPaired();
    const seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
    const labelFieldDefinition = category.id === ChartDataModel.DEFAULT_CATEGORY ? void 0 : category;
    const series = seriesDefinitions.map((seriesDefinition) => {
      var _a, _b, _c, _d, _e;
      if (seriesDefinition == null ? void 0 : seriesDefinition.sizeField) {
        const opts2 = {
          type: "bubble",
          xKey: seriesDefinition.xField.colId,
          xName: (_a = seriesDefinition.xField.displayName) != null ? _a : void 0,
          yKey: seriesDefinition.yField.colId,
          yName: (_b = seriesDefinition.yField.displayName) != null ? _b : void 0,
          title: `${seriesDefinition.yField.displayName} vs ${seriesDefinition.xField.displayName}`,
          sizeKey: seriesDefinition.sizeField.colId,
          sizeName: (_c = seriesDefinition.sizeField.displayName) != null ? _c : "",
          labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition.yField.colId,
          labelName: labelFieldDefinition ? labelFieldDefinition.name : void 0
        };
        return opts2;
      }
      const opts = {
        type: "scatter",
        xKey: seriesDefinition.xField.colId,
        xName: (_d = seriesDefinition.xField.displayName) != null ? _d : void 0,
        yKey: seriesDefinition.yField.colId,
        yName: (_e = seriesDefinition.yField.displayName) != null ? _e : void 0,
        title: `${seriesDefinition.yField.displayName} vs ${seriesDefinition.xField.displayName}`,
        labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition.yField.colId,
        labelName: labelFieldDefinition ? labelFieldDefinition.name : void 0
      };
      return opts;
    });
    return this.crossFiltering ? this.extractCrossFilterSeries(series, params) : series;
  }
  extractCrossFilterSeries(series, params) {
    const { data } = params;
    const palette = this.getChartPalette();
    const filteredOutKey = (key) => `${key}-filtered-out`;
    const calcMarkerDomain = (data2, sizeKey) => {
      var _a;
      const markerDomain = [Infinity, -Infinity];
      if (sizeKey != null) {
        for (const datum of data2) {
          const value = (_a = datum[sizeKey]) != null ? _a : datum[filteredOutKey(sizeKey)];
          if (value < markerDomain[0]) {
            markerDomain[0] = value;
          }
          if (value > markerDomain[1]) {
            markerDomain[1] = value;
          }
        }
      }
      if (markerDomain[0] <= markerDomain[1]) {
        return markerDomain;
      }
      return void 0;
    };
    const updatePrimarySeries = (series2, idx) => {
      const fill = palette == null ? void 0 : palette.fills[idx];
      const stroke = palette == null ? void 0 : palette.strokes[idx];
      let markerDomain = void 0;
      if (series2.type === "bubble") {
        const { sizeKey } = series2;
        markerDomain = calcMarkerDomain(data, sizeKey);
      }
      const marker = __spreadProps(__spreadValues({}, series2.marker), {
        fill,
        stroke,
        domain: markerDomain
      });
      return __spreadProps(__spreadValues({}, series2), {
        marker,
        highlightStyle: { item: { fill: "yellow" } },
        listeners: __spreadProps(__spreadValues({}, series2.listeners), {
          nodeClick: this.crossFilterCallback
        })
      });
    };
    const updateFilteredOutSeries = (series2) => {
      let { yKey, xKey } = series2;
      let alteredSizeKey = {};
      if (series2.type === "bubble") {
        alteredSizeKey = { sizeKey: filteredOutKey(series2.sizeKey) };
      }
      return __spreadProps(__spreadValues(__spreadValues({}, series2), alteredSizeKey), {
        yKey: filteredOutKey(yKey),
        xKey: filteredOutKey(xKey),
        marker: __spreadProps(__spreadValues({}, series2.marker), {
          fillOpacity: 0.3,
          strokeOpacity: 0.3
        }),
        showInLegend: false,
        listeners: __spreadProps(__spreadValues({}, series2.listeners), {
          nodeClick: (e) => {
            const value = e.datum[filteredOutKey(xKey)];
            const filterableEvent = __spreadProps(__spreadValues({}, e), {
              xKey,
              datum: __spreadProps(__spreadValues({}, e.datum), { [xKey]: value })
            });
            this.crossFilterCallback(filterableEvent);
          }
        })
      });
    };
    const updatedSeries = series.map(updatePrimarySeries);
    return [
      ...updatedSeries,
      ...updatedSeries.map(updateFilteredOutSeries)
    ];
  }
  getSeriesDefinitions(fields, paired) {
    if (fields.length < 2) {
      return [];
    }
    const isBubbleChart = this.chartType === "bubble";
    if (paired) {
      if (isBubbleChart) {
        return fields.map((currentXField, i) => i % 3 === 0 ? {
          xField: currentXField,
          yField: fields[i + 1],
          sizeField: fields[i + 2]
        } : null).filter((x) => x && x.yField && x.sizeField);
      }
      return fields.map((currentXField, i) => i % 2 === 0 ? {
        xField: currentXField,
        yField: fields[i + 1]
      } : null).filter((x) => x && x.yField);
    }
    const xField = fields[0];
    if (isBubbleChart) {
      return fields.map((yField, i) => i % 2 === 1 ? {
        xField,
        yField,
        sizeField: fields[i + 1]
      } : null).filter((x) => x && x.sizeField);
    }
    return fields.filter((value, i) => i > 0).map((yField) => ({ xField, yField }));
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/statistical/statisticalChartProxy.ts
var StatisticalChartProxy = class extends CartesianChartProxy {
  constructor(params) {
    super(params);
  }
  getAxes(params, commonChartOptions) {
    return [
      {
        type: this.getXAxisType(params),
        position: this.isHorizontal(commonChartOptions) ? "left" : "bottom"
      },
      {
        type: "number",
        position: this.isHorizontal(commonChartOptions) ? "bottom" : "left"
      }
    ];
  }
  computeSeriesStatistics(params, computeStatsFn) {
    const { data, fields } = params;
    const [category] = params.categories;
    const categoryKey = category.id || ChartDataModel.DEFAULT_CATEGORY;
    const groupedData = this.groupDataByCategory(categoryKey, data);
    return Array.from(groupedData).map(([categoryValue, categoryData]) => {
      const categoryResult = { [category.id]: categoryValue };
      fields.forEach((field, seriesIndex) => {
        const seriesValues = categoryData.map((datum) => datum[field.colId]).filter((value) => typeof value === "number" && !isNaN(value));
        Object.entries(computeStatsFn(seriesValues)).forEach(([statKey, value]) => {
          const propertyKey = `${statKey}:${seriesIndex}`;
          categoryResult[propertyKey] = seriesValues.length > 0 ? value : null;
        });
      });
      return categoryResult;
    });
  }
  groupDataByCategory(categoryKey, data) {
    const getCategory = (datum) => {
      if (categoryKey === ChartDataModel.DEFAULT_CATEGORY) {
        return 1;
      }
      const categoryValue = datum[categoryKey];
      if (categoryValue === null || categoryValue === void 0) {
        return "";
      }
      return categoryValue instanceof Date ? categoryValue.getTime() : categoryValue;
    };
    return data.reduce((acc, datum) => {
      let category = getCategory(datum);
      const existingCategoryData = acc.get(category);
      if (existingCategoryData) {
        existingCategoryData.push(datum);
      } else {
        acc.set(category, [datum]);
      }
      return acc;
    }, /* @__PURE__ */ new Map());
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/statistical/rangeChartProxy.ts
var RangeChartProxy = class extends StatisticalChartProxy {
  constructor(params) {
    super(params);
  }
  getSeries(params) {
    const [category] = params.categories;
    return params.fields.map(
      (field, seriesIndex) => {
        var _a;
        return {
          type: this.standaloneChartType,
          // xKey/xName refer to category buckets
          xKey: category.id,
          xName: category.name,
          // yName is used to label the series
          yName: (_a = field.displayName) != null ? _a : void 0,
          // custom field labels shown in the tooltip
          yLowName: "Min",
          yHighName: "Max",
          // generated 'synthetic fields' from getData()
          yLowKey: `min:${seriesIndex}`,
          yHighKey: `max:${seriesIndex}`
        };
      }
    );
  }
  getData(params) {
    return this.computeSeriesStatistics(params, (seriesValues) => {
      return {
        min: Math.min(...seriesValues),
        max: Math.max(...seriesValues)
      };
    });
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/cartesian/histogramChartProxy.ts
var HistogramChartProxy = class extends CartesianChartProxy {
  constructor(params) {
    super(params);
  }
  getSeries(params) {
    const firstField = params.fields[0];
    return [
      {
        type: this.standaloneChartType,
        xKey: firstField.colId,
        xName: firstField.displayName,
        yName: this.chartProxyParams.translate("histogramFrequency"),
        areaPlot: false
        // only constant width is supported via integrated charts
      }
    ];
  }
  getAxes(_params) {
    return [
      {
        type: "number",
        position: "bottom"
      },
      {
        type: "number",
        position: "left"
      }
    ];
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/statistical/boxPlotChartProxy.ts
var BoxPlotChartProxy = class extends StatisticalChartProxy {
  constructor(params) {
    super(params);
  }
  getSeries(params) {
    const [category] = params.categories;
    return params.fields.map(
      (field, seriesIndex) => {
        var _a;
        return {
          type: this.standaloneChartType,
          // xKey/xName refer to category buckets
          xKey: category.id,
          xName: category.name,
          // yName is used to label the series
          yName: (_a = field.displayName) != null ? _a : void 0,
          // custom field labels shown in the tooltip
          minName: "Min",
          q1Name: "Q1",
          medianName: "Median",
          q3Name: "Q3",
          maxName: "Max",
          // generated 'synthetic fields' from getData()
          minKey: `min:${seriesIndex}`,
          q1Key: `q1:${seriesIndex}`,
          medianKey: `median:${seriesIndex}`,
          q3Key: `q3:${seriesIndex}`,
          maxKey: `max:${seriesIndex}`
        };
      }
    );
  }
  getData(params) {
    return this.computeSeriesStatistics(params, (seriesValues) => {
      const sortedValues = seriesValues.sort((a, b) => a - b);
      return {
        min: sortedValues[0],
        q1: this.quantile(sortedValues, 0.25),
        median: this.quantile(sortedValues, 0.5),
        q3: this.quantile(sortedValues, 0.75),
        max: sortedValues[sortedValues.length - 1]
      };
    });
  }
  quantile(sortedValues, q) {
    const position = (sortedValues.length - 1) * q;
    const indexBelow = Math.floor(position);
    const aboveValue = position - indexBelow;
    if (sortedValues[indexBelow + 1] !== void 0) {
      return sortedValues[indexBelow] + aboveValue * (sortedValues[indexBelow + 1] - sortedValues[indexBelow]);
    }
    return sortedValues[indexBelow];
  }
};

// enterprise-modules/charts/src/charts/chartComp/utils/array.ts
function flatMap(items, iteratee) {
  return items.reduce((acc, item, index, array) => acc.concat(iteratee(item, index, array)), new Array());
}

// enterprise-modules/charts/src/charts/chartComp/chartProxies/specialized/heatmapChartProxy.ts
var HEATMAP_CATEGORY_KEY = "AG-GRID-DEFAULT-HEATMAP-CATEGORY-KEY";
var HEATMAP_SERIES_KEY = "AG-GRID-DEFAULT-HEATMAP-SERIES-KEY";
var HEATMAP_VALUE_KEY = "AG-GRID-DEFAULT-HEATMAP-VALUE-KEY";
var HeatmapChartProxy = class extends ChartProxy {
  constructor(params) {
    super(params);
  }
  getUpdateOptions(params, commonChartOptions) {
    const xSeriesKey = HEATMAP_SERIES_KEY;
    const xValueKey = HEATMAP_VALUE_KEY;
    const yKey = HEATMAP_CATEGORY_KEY;
    return __spreadProps(__spreadValues({}, commonChartOptions), {
      series: this.getSeries(params, xSeriesKey, xValueKey, yKey),
      data: this.getData(params, xSeriesKey, xValueKey, yKey)
    });
  }
  getSeries(params, xSeriesKey, xValueKey, yKey) {
    const [category] = params.categories;
    return [
      {
        type: this.standaloneChartType,
        // The axis keys reference synthetic fields based on the category values and series column names
        yKey,
        xKey: xSeriesKey,
        // The color key references a synthetic field based on the series column value for a specific cell
        colorKey: xValueKey,
        yName: category.name,
        // We don't know how to label the 'x' series, as it is a synthetic series created from the set of all input columns
        // In future releases we may want to consider inferring the series label from column groupings etc
        xName: void 0,
        colorName: void 0
      }
    ];
  }
  getData(params, xSeriesKey, xValueKey, yKey) {
    const [category] = params.categories;
    return flatMap(
      params.data,
      (datum, index) => {
        const value = datum[category.id];
        const valueString = value == null ? "" : String(value);
        const yValue = { id: index, value, toString: () => valueString };
        return params.fields.map(({ colId, displayName }) => __spreadProps(__spreadValues({}, datum), {
          [xSeriesKey]: displayName,
          [xValueKey]: datum[colId],
          [yKey]: yValue
        }));
      }
    );
  }
  getSeriesChartThemeDefaults() {
    return {
      gradientLegend: {
        gradient: {
          preferredLength: 200
        }
      },
      series: {
        tooltip: {
          renderer: renderHeatmapTooltip
        }
      }
    };
  }
};
function renderHeatmapTooltip(params) {
  const { xKey, yKey, colorKey, yName, datum } = params;
  const table = [
    { label: yName, value: datum[yKey] },
    { label: datum[xKey], value: colorKey && datum[colorKey] }
  ];
  const html = table.map(({ label, value }) => `<b>${sanitizeHtml(String(label))}:</b> ${sanitizeHtml(String(value))}`).join("<br>");
  return {
    title: "",
    content: html
  };
}
function sanitizeHtml(input) {
  const ESCAPED_CHARS = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
  };
  const characterClass = `[${Object.keys(ESCAPED_CHARS).join("")}]`;
  const pattern = new RegExp(characterClass, "g");
  return input.replace(pattern, (char) => ESCAPED_CHARS[char]);
}

// enterprise-modules/charts/src/charts/chartComp/chartProxies/cartesian/waterfallChartProxy.ts
var WaterfallChartProxy = class extends CartesianChartProxy {
  constructor(params) {
    super(params);
  }
  getAxes(params, commonChartOptions) {
    return [
      {
        type: this.getXAxisType(params),
        position: this.isHorizontal(commonChartOptions) ? "left" : "bottom"
      },
      {
        type: "number",
        position: this.isHorizontal(commonChartOptions) ? "bottom" : "left"
      }
    ];
  }
  getSeries(params) {
    var _a;
    const [category] = params.categories;
    const [firstField] = params.fields;
    const firstSeries = {
      type: this.standaloneChartType,
      xKey: category.id,
      xName: category.name,
      yKey: firstField.colId,
      yName: (_a = firstField.displayName) != null ? _a : void 0
    };
    return [firstSeries];
  }
};

// enterprise-modules/charts/src/charts/chartComp/services/chartOptionsService.ts
var import_core53 = require("@ag-grid-community/core");
var import_ag_charts_community31 = require("ag-charts-community");
var CARTESIAN_AXIS_TYPES = ["number", "category", "time", "grouped-category"];
var POLAR_AXIS_TYPES = ["angle-category", "angle-number", "radius-category", "radius-number"];
var VALID_AXIS_TYPES = [...CARTESIAN_AXIS_TYPES, ...POLAR_AXIS_TYPES];
var ChartOptionsService = class _ChartOptionsService extends import_core53.BeanStub {
  constructor(chartController) {
    super();
    this.chartController = chartController;
  }
  getChartThemeOverridesProxy() {
    return {
      getValue: (expression) => this.getChartOption(expression),
      setValue: (expression, value) => this.setChartThemeOverrides([{ expression, value }]),
      setValues: (properties) => this.setChartThemeOverrides(properties)
    };
  }
  getAxisThemeOverridesProxy() {
    return {
      getValue: (expression) => this.getAxisProperty(expression),
      setValue: (expression, value) => this.setAxisThemeOverrides([{ expression, value }]),
      setValues: (properties) => this.setAxisThemeOverrides(properties)
    };
  }
  getCartesianAxisOptionsProxy(axisType) {
    return {
      getValue: (expression) => this.getCartesianAxisProperty(axisType, expression),
      setValue: (expression, value) => this.setCartesianAxisOptions(axisType, [{ expression, value }]),
      setValues: (properties) => this.setCartesianAxisOptions(axisType, properties)
    };
  }
  getCartesianAxisThemeOverridesProxy(axisType) {
    return {
      getValue: (expression) => this.getCartesianAxisProperty(axisType, expression),
      setValue: (expression, value) => this.setCartesianAxisThemeOverrides(axisType, [{ expression, value }]),
      setValues: (properties) => this.setCartesianAxisThemeOverrides(axisType, properties)
    };
  }
  getCartesianAxisAppliedThemeOverridesProxy(axisType) {
    return {
      getValue: (expression) => this.getCartesianAxisThemeOverride(
        axisType,
        // Allow the caller to specify a wildcard expression to retrieve the whole set of overrides
        expression === "*" ? null : expression
      ),
      setValue: (expression, value) => this.setCartesianAxisThemeOverrides(
        axisType,
        // Allow the caller to specify a wildcard expression to set the whole set of overrides
        [{ expression: expression === "*" ? null : expression, value }]
      ),
      setValues: (properties) => this.setCartesianAxisThemeOverrides(axisType, properties)
    };
  }
  getSeriesOptionsProxy(getSelectedSeries) {
    return {
      getValue: (expression, calculated) => this.getSeriesOption(getSelectedSeries(), expression, calculated),
      setValue: (expression, value) => this.setSeriesOptions(getSelectedSeries(), [{ expression, value }]),
      setValues: (properties) => this.setSeriesOptions(getSelectedSeries(), properties)
    };
  }
  /**
   * Determine the set of theme overrides that should be retained when transitioning from one chart type to another.
   */
  getPersistedChartThemeOverrides(existingChartOptions, existingAxes, existingChartType, targetChartType) {
    const retainedThemeOverrideKeys = this.getRetainedChartThemeOverrideKeys(existingChartType, targetChartType);
    const retainedChartAxisThemeOverrideKeys = this.getRetainedChartAxisThemeOverrideKeys(null, existingChartType, targetChartType);
    const targetChartOptions = this.createChartOptions();
    for (const expression of retainedThemeOverrideKeys) {
      const value = this.retrieveChartOptionsThemeOverride(existingChartOptions, existingChartType, expression);
      if (value !== void 0) {
        this.assignChartOptionsThemeOverride(targetChartOptions, targetChartType, expression, value);
      }
    }
    if (existingAxes) {
      this.assignPersistedAxisOverrides({
        existingAxes,
        retainedChartAxisThemeOverrideKeys,
        existingChartOptions,
        targetChartOptions,
        existingChartType,
        targetChartType
      });
    }
    return targetChartOptions.theme.overrides;
  }
  assignPersistedAxisOverrides(params) {
    const { existingAxes, retainedChartAxisThemeOverrideKeys, existingChartOptions, targetChartOptions, existingChartType, targetChartType } = params;
    for (const { expression, targetAxisTypes } of retainedChartAxisThemeOverrideKeys) {
      for (const existingAxisType of existingAxes.map((axis) => axis.type)) {
        const value = this.retrieveChartOptionsThemeOverride(
          existingChartOptions,
          existingChartType,
          ["axes", existingAxisType, expression].join(".")
        );
        if (value !== void 0) {
          for (const targetAxisType of targetAxisTypes) {
            this.assignChartOptionsThemeOverride(
              targetChartOptions,
              targetChartType,
              ["axes", targetAxisType, expression].join("."),
              value
            );
          }
        }
      }
    }
  }
  getRetainedChartThemeOverrideKeys(existingChartType, targetChartType) {
    const UNIVERSAL_PERSISTED_THEME_OVERRIDES = ["animation"];
    const PERSISTED_CARTESIAN_CHART_THEME_OVERRIDES = ["zoom", "navigator"];
    const chartSpecificThemeOverrideKeys = ((previousChartType, updatedChartType) => {
      const expressions = new Array();
      if (isCartesian(getSeriesType(previousChartType)) && isCartesian(getSeriesType(updatedChartType))) {
        expressions.push(...PERSISTED_CARTESIAN_CHART_THEME_OVERRIDES);
      }
      return expressions;
    })(existingChartType, targetChartType);
    return [
      ...UNIVERSAL_PERSISTED_THEME_OVERRIDES,
      ...chartSpecificThemeOverrideKeys
    ];
  }
  getRetainedChartAxisThemeOverrideKeys(axisType, existingChartType, targetChartType) {
    if (isCartesian(getSeriesType(existingChartType)) && isCartesian(getSeriesType(targetChartType))) {
      const retainedKeys = this.getRetainedCartesianAxisThemeOverrideKeys(axisType);
      return retainedKeys.map((expression) => ({ expression, targetAxisTypes: CARTESIAN_AXIS_TYPES }));
    }
    return [];
  }
  getRetainedCartesianAxisThemeOverrideKeys(axisType) {
    const axisPositionSuffixes = axisType === "xAxis" ? ["", ".top", ".bottom"] : axisType === "yAxis" ? ["", ".left", ".right"] : ["", ".left", ".right", ".top", ".bottom"];
    const PERSISTED_CARTESIAN_AXIS_THEME_OVERRIDES = ["crosshair"];
    const expressions = new Array();
    for (const expression of PERSISTED_CARTESIAN_AXIS_THEME_OVERRIDES) {
      for (const axisPositionSuffix of axisPositionSuffixes) {
        expressions.push(`${expression}${axisPositionSuffix}`);
      }
    }
    return expressions;
  }
  getChartOption(expression) {
    return get(this.getChart(), expression, void 0);
  }
  setChartThemeOverrides(properties) {
    const chartType = this.getChartType();
    const chartOptions = this.createChartOptions();
    for (const { expression, value } of properties) {
      this.assignChartOptionsThemeOverride(chartOptions, chartType, expression, value);
    }
    this.applyChartOptions(chartOptions);
  }
  applyChartOptions(chartOptions, options) {
    if (Object.keys(chartOptions).length === 0)
      return;
    this.updateChart(chartOptions);
    const shouldRaiseEvent = !(options == null ? void 0 : options.silent);
    if (shouldRaiseEvent)
      this.raiseChartOptionsChangedEvent();
  }
  awaitChartOptionUpdate(func) {
    const chart = this.chartController.getChartProxy().getChart();
    chart.waitForUpdate().then(() => func()).catch((e) => console.error(`AG Grid - chart update failed`, e));
  }
  getAxisProperty(expression) {
    var _a;
    return get((_a = this.getChart().axes) == null ? void 0 : _a[0], expression, void 0);
  }
  setAxisThemeOverrides(properties) {
    var _a;
    const chart = this.getChart();
    const chartType = this.getChartType();
    let chartOptions = this.createChartOptions();
    for (const { expression, value } of properties) {
      const relevantAxes = (_a = chart.axes) == null ? void 0 : _a.filter((axis) => {
        const parts = expression.split(".");
        let current = axis;
        for (const part of parts) {
          if (!(part in current)) {
            return false;
          }
          current = current[part];
        }
        return true;
      });
      if (!relevantAxes)
        continue;
      for (const axis of relevantAxes) {
        if (!this.isValidAxisType(axis))
          continue;
        this.assignChartAxisThemeOverride(chartOptions, chartType, axis.type, null, expression, value);
      }
    }
    this.applyChartOptions(chartOptions);
  }
  getCartesianAxisProperty(axisType, expression) {
    const axes = this.getChartAxes();
    const axis = this.getCartesianAxis(axes, axisType);
    return get(axis, expression, void 0);
  }
  getCartesianAxisThemeOverride(axisType, expression) {
    const axes = this.getChartAxes();
    const chartAxis = this.getCartesianAxis(axes, axisType);
    if (!chartAxis || !this.isValidAxisType(chartAxis))
      return void 0;
    const chartType = this.getChartType();
    const chartOptions = this.getChart().getOptions();
    return this.retrieveChartAxisThemeOverride(
      chartOptions,
      chartType,
      chartAxis.type,
      axisType === "yAxis" ? ["left", "right"] : ["bottom", "top"],
      expression
    );
  }
  setCartesianAxisThemeOverrides(axisType, properties) {
    const axes = this.getChartAxes();
    const chartAxis = this.getCartesianAxis(axes, axisType);
    if (!chartAxis || !this.isValidAxisType(chartAxis))
      return;
    const chartType = this.getChartType();
    let chartOptions = this.createChartOptions();
    for (const { expression, value } of properties) {
      this.assignChartAxisThemeOverride(
        chartOptions,
        chartType,
        chartAxis.type,
        axisType === "yAxis" ? ["left", "right"] : ["bottom", "top"],
        expression,
        value
      );
    }
    this.applyChartOptions(chartOptions);
  }
  setCartesianAxisOptions(axisType, properties) {
    this.updateCartesianAxisOptions(axisType, (chartOptions, axes, chartAxis) => {
      const axisIndex = axes.indexOf(chartAxis);
      for (const { expression, value } of properties) {
        this.assignChartOption(chartOptions, `axes.${axisIndex}.${expression}`, value);
      }
    });
  }
  updateCartesianAxisOptions(axisType, updateFunc) {
    const existingChartOptions = this.getChart().getOptions();
    const axisOptions = "axes" in existingChartOptions ? existingChartOptions.axes : void 0;
    if (!existingChartOptions || !axisOptions)
      return;
    const axes = this.getChartAxes();
    const chartAxis = this.getCartesianAxis(axes, axisType);
    if (!chartAxis)
      return;
    let chartOptions = this.createChartOptions();
    chartOptions.axes = axisOptions;
    updateFunc(chartOptions, axes, chartAxis, existingChartOptions);
    this.applyChartOptions(chartOptions);
  }
  setCartesianCategoryAxisType(axisType, value) {
    this.updateCartesianAxisOptions(axisType, (chartOptions, _axes, chartAxis, existingChartOptions) => {
      const chartType = this.getChartType();
      this.assignPersistedAxisOverrides({
        existingAxes: [chartAxis],
        retainedChartAxisThemeOverrideKeys: this.getRetainedChartAxisThemeOverrideKeys(axisType, chartType, chartType),
        existingChartOptions,
        targetChartOptions: chartOptions,
        existingChartType: chartType,
        targetChartType: chartType
      });
      this.assignChartOption(chartOptions, `axes.0.type`, value);
      this.chartController.setCategoryAxisType(value);
    });
  }
  getCartesianAxis(axes, axisType) {
    if (axes.length < 2) {
      return void 0;
    }
    switch (axisType) {
      case "xAxis":
        return axes[0].direction === "x" ? axes[0] : axes[1];
      case "yAxis":
        return axes[1].direction === "y" ? axes[1] : axes[0];
    }
  }
  getSeriesOption(seriesType, expression, calculated) {
    const series = this.getChart().series.find((s) => _ChartOptionsService.isMatchingSeries(seriesType, s));
    return get(calculated ? series : series == null ? void 0 : series.properties.toJson(), expression, void 0);
  }
  setSeriesOptions(seriesType, properties) {
    let chartOptions = this.createChartOptions();
    for (const { expression, value } of properties) {
      this.assignChartOptionsSeriesThemeOverride(
        chartOptions,
        seriesType,
        `series.${expression}`,
        value
      );
    }
    this.applyChartOptions(chartOptions);
  }
  getPairedMode() {
    return this.chartController.getChartProxy().isPaired();
  }
  setPairedMode(paired) {
    this.chartController.getChartProxy().setPaired(paired);
  }
  getChartAxes() {
    var _a;
    const chart = this.getChart();
    return (_a = chart.axes) != null ? _a : [];
  }
  retrieveChartAxisThemeOverride(chartOptions, chartType, axisType, axisPositions, expression) {
    if (axisPositions) {
      for (const axisPosition of axisPositions) {
        const value = this.retrieveChartOptionsThemeOverride(
          chartOptions,
          chartType,
          ["axes", axisType, axisPosition, ...expression ? [expression] : []].join(".")
        );
        if (value === void 0)
          continue;
        return value;
      }
    } else {
      return this.retrieveChartOptionsThemeOverride(
        chartOptions,
        chartType,
        ["axes", axisType, ...expression ? [expression] : []].join(".")
      );
    }
  }
  assignChartAxisThemeOverride(chartOptions, chartType, axisType, axisPositions, expression, value) {
    if (axisPositions) {
      for (const axisPosition of axisPositions) {
        this.assignChartOptionsThemeOverride(
          chartOptions,
          chartType,
          ["axes", axisType, axisPosition, ...expression ? [expression] : []].join("."),
          value
        );
      }
    } else {
      this.assignChartOptionsThemeOverride(
        chartOptions,
        chartType,
        ["axes", axisType, ...expression ? [expression] : []].join("."),
        value
      );
    }
  }
  isValidAxisType(chartAxis) {
    return VALID_AXIS_TYPES.includes(chartAxis.type);
  }
  getChartType() {
    return this.chartController.getChartType();
  }
  getChart() {
    return this.chartController.getChartProxy().getChart();
  }
  updateChart(chartOptions) {
    const chartRef = this.chartController.getChartProxy().getChartRef();
    chartRef.skipAnimations();
    import_ag_charts_community31.AgCharts.updateDelta(chartRef, chartOptions);
  }
  createChartOptions() {
    const chartOptions = {
      theme: {
        overrides: {}
      }
    };
    return chartOptions;
  }
  retrieveChartOptionsThemeOverride(chartOptions, chartType, expression) {
    const chartSeriesTypes = this.getChartThemeOverridesSeriesTypeKeys(chartType);
    for (const seriesType of chartSeriesTypes) {
      const value = this.retrieveChartOptionsSeriesThemeOverride(chartOptions, seriesType, expression);
      if (value === void 0)
        continue;
      return value;
    }
    return void 0;
  }
  assignChartOptionsThemeOverride(chartOptions, chartType, expression, value) {
    const chartSeriesTypes = this.getChartThemeOverridesSeriesTypeKeys(chartType);
    for (const seriesType of chartSeriesTypes) {
      this.assignChartOptionsSeriesThemeOverride(chartOptions, seriesType, expression, value);
    }
  }
  retrieveChartOptionsSeriesThemeOverride(chartOptions, seriesType, expression) {
    return this.retrieveChartOption(
      chartOptions,
      ["theme", "overrides", seriesType, ...expression ? [expression] : []].join(".")
    );
  }
  assignChartOptionsSeriesThemeOverride(chartOptions, seriesType, expression, value) {
    this.assignChartOption(
      chartOptions,
      ["theme", "overrides", seriesType, ...expression ? [expression] : []].join("."),
      value
    );
  }
  getChartThemeOverridesSeriesTypeKeys(chartType) {
    const chartSeriesTypes = this.chartController.getChartSeriesTypes(chartType);
    if (this.chartController.isComboChart()) {
      chartSeriesTypes.push("common");
    }
    return chartSeriesTypes;
  }
  retrieveChartOption(chartOptions, expression) {
    return get(chartOptions, expression, void 0);
  }
  assignChartOption(chartOptions, expression, value) {
    set(chartOptions, expression, value);
  }
  raiseChartOptionsChangedEvent() {
    const chartModel = this.chartController.getChartModel();
    const event = {
      type: import_core53.Events.EVENT_CHART_OPTIONS_CHANGED,
      chartId: chartModel.chartId,
      chartType: chartModel.chartType,
      chartThemeName: this.chartController.getChartThemeName(),
      chartOptions: chartModel.chartOptions
    };
    this.eventService.dispatchEvent(event);
  }
  static isMatchingSeries(seriesType, series) {
    return isSeriesType(seriesType) && series.type === seriesType;
  }
  destroy() {
    super.destroy();
  }
};

// enterprise-modules/charts/src/charts/chartComp/chartProxies/combo/comboChartProxy.ts
var ComboChartProxy = class extends CartesianChartProxy {
  constructor(params) {
    super(params);
  }
  getAxes(params) {
    const fields = params ? params.fields : [];
    const fieldsMap = new Map(fields.map((f) => [f.colId, f]));
    const { primaryYKeys, secondaryYKeys } = this.getYKeys(fields, params.seriesChartTypes);
    const axes = [
      {
        type: this.getXAxisType(params),
        position: "bottom"
      }
    ];
    if (primaryYKeys.length > 0) {
      axes.push({
        type: "number",
        keys: primaryYKeys,
        position: "left"
      });
    }
    if (secondaryYKeys.length > 0) {
      secondaryYKeys.forEach((secondaryYKey) => {
        const field = fieldsMap.get(secondaryYKey);
        const secondaryAxisIsVisible = field && field.colId === secondaryYKey;
        if (!secondaryAxisIsVisible) {
          return;
        }
        const secondaryAxisOptions = {
          type: "number",
          keys: [secondaryYKey],
          position: "right"
        };
        axes.push(secondaryAxisOptions);
      });
    }
    return axes;
  }
  getSeries(params) {
    const { fields, seriesChartTypes } = params;
    const [category] = params.categories;
    return fields.map((field) => {
      const seriesChartType = seriesChartTypes.find((s) => s.colId === field.colId);
      if (seriesChartType) {
        const chartType = seriesChartType.chartType;
        const grouped = ["groupedColumn", "groupedBar"].includes(chartType);
        const groupedOpts = grouped ? { grouped: true } : {};
        return __spreadValues({
          type: getSeriesType(chartType),
          xKey: category.id,
          yKey: field.colId,
          yName: field.displayName,
          stacked: ["stackedArea", "stackedColumn"].includes(chartType)
        }, groupedOpts);
      }
    });
  }
  getYKeys(fields, seriesChartTypes) {
    const primaryYKeys = [];
    const secondaryYKeys = [];
    fields.forEach((field) => {
      const colId = field.colId;
      const seriesChartType = seriesChartTypes.find((s) => s.colId === colId);
      if (seriesChartType) {
        seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
      }
    });
    return { primaryYKeys, secondaryYKeys };
  }
};

// enterprise-modules/charts/src/charts/chartComp/services/chartMenuService.ts
var import_core54 = require("@ag-grid-community/core");
var CHART_TOOL_PANEL_ALLOW_LIST = [
  "chartSettings",
  "chartData",
  "chartFormat"
];
var CHART_TOOLBAR_ALLOW_LIST = [
  "chartUnlink",
  "chartLink",
  "chartDownload"
];
var CHART_TOOL_PANEL_MENU_OPTIONS = {
  settings: "chartSettings",
  data: "chartData",
  format: "chartFormat"
};
var ChartMenuService = class extends import_core54.BeanStub {
  isLegacyFormat() {
    return !this.chartService.isEnterprise();
  }
  downloadChart(chartMenuContext, dimensions, fileName, fileFormat) {
    chartMenuContext.chartController.getChartProxy().downloadChart(dimensions, fileName, fileFormat);
  }
  toggleLinked(chartMenuContext) {
    chartMenuContext.chartController.detachChartRange();
  }
  openAdvancedSettings(chartMenuContext, eventSource) {
    this.advancedSettingsMenuFactory.showMenu(chartMenuContext, eventSource);
  }
  hideAdvancedSettings() {
    this.advancedSettingsMenuFactory.hideMenu();
  }
  getToolbarOptionsAndPanels(chartController) {
    var _a, _b, _c;
    const legacyFormat = this.isLegacyFormat();
    const useChartToolPanelCustomisation = Boolean(this.gos.get("chartToolPanelsDef")) || !legacyFormat;
    let panels;
    let defaultPanel;
    let chartToolbarOptions;
    if (useChartToolPanelCustomisation) {
      const defaultChartToolbarOptions = legacyFormat ? [
        chartController.isChartLinked() ? "chartLink" : "chartUnlink",
        "chartDownload"
      ] : [
        "chartMenu"
      ];
      const toolbarItemsFunc = this.gos.getCallback("getChartToolbarItems");
      const params = {
        defaultItems: defaultChartToolbarOptions
      };
      chartToolbarOptions = toolbarItemsFunc ? toolbarItemsFunc(params).filter((option) => {
        if (!(legacyFormat ? CHART_TOOLBAR_ALLOW_LIST : [...CHART_TOOLBAR_ALLOW_LIST, "chartMenu"]).includes(option)) {
          let msg;
          if (CHART_TOOL_PANEL_ALLOW_LIST.includes(option)) {
            msg = `'${option}' is a Chart Tool Panel option and will be ignored since 'chartToolPanelsDef' is used. Please use 'chartToolPanelsDef.panels' grid option instead`;
          } else if (option === "chartMenu") {
            msg = `'chartMenu' is only allowed as a Chart Toolbar Option when using AG Charts Enterprise`;
          } else {
            msg = `'${option}' is not a valid Chart Toolbar Option`;
          }
          import_core54._.warnOnce(msg);
          return false;
        }
        return true;
      }) : defaultChartToolbarOptions;
      const panelsOverride = (_b = (_a = this.gos.get("chartToolPanelsDef")) == null ? void 0 : _a.panels) == null ? void 0 : _b.map((panel) => {
        const menuOption = CHART_TOOL_PANEL_MENU_OPTIONS[panel];
        if (!menuOption) {
          import_core54._.warnOnce(`Invalid panel in chartToolPanelsDef.panels: '${panel}'`);
        }
        return menuOption;
      }).filter((panel) => Boolean(panel));
      panels = panelsOverride ? panelsOverride : Object.values(CHART_TOOL_PANEL_MENU_OPTIONS);
      if (chartController.isPivotChart()) {
        panels = panels.filter((panel) => panel !== "chartData");
      }
      const defaultToolPanel = (_c = this.gos.get("chartToolPanelsDef")) == null ? void 0 : _c.defaultToolPanel;
      defaultPanel = defaultToolPanel && CHART_TOOL_PANEL_MENU_OPTIONS[defaultToolPanel] || panels[0];
      if (legacyFormat) {
        chartToolbarOptions = panels.length > 0 ? [panels[0], ...chartToolbarOptions] : chartToolbarOptions;
      }
    } else {
      let tabOptions = [
        "chartSettings",
        "chartData",
        "chartFormat",
        chartController.isChartLinked() ? "chartLink" : "chartUnlink",
        "chartDownload"
      ];
      const toolbarItemsFunc = this.gos.getCallback("getChartToolbarItems");
      if (toolbarItemsFunc) {
        const isLegacyToolbar = this.gos.get("suppressChartToolPanelsButton");
        const params = {
          defaultItems: isLegacyToolbar ? tabOptions : CHART_TOOLBAR_ALLOW_LIST
        };
        tabOptions = toolbarItemsFunc(params).filter((option) => {
          if (!CHART_TOOL_PANEL_ALLOW_LIST.includes(option) && !CHART_TOOLBAR_ALLOW_LIST.includes(option)) {
            import_core54._.warnOnce(`'${option}' is not a valid Chart Toolbar Option`);
            return false;
          } else if (!isLegacyToolbar && CHART_TOOL_PANEL_ALLOW_LIST.includes(option)) {
            const msg = `'${option}' is a Chart Tool Panel option and will be ignored. Please use 'chartToolPanelsDef.panels' grid option instead`;
            import_core54._.warnOnce(msg);
            return false;
          }
          return true;
        });
        if (!isLegacyToolbar) {
          tabOptions = tabOptions.concat(CHART_TOOL_PANEL_ALLOW_LIST);
        }
      }
      if (chartController.isPivotChart()) {
        tabOptions = tabOptions.filter((option) => option !== "chartData");
      }
      const ignoreOptions = ["chartUnlink", "chartLink", "chartDownload"];
      panels = tabOptions.filter((option) => ignoreOptions.indexOf(option) === -1);
      defaultPanel = panels[0];
      chartToolbarOptions = tabOptions.filter(
        (value) => ignoreOptions.indexOf(value) !== -1 || panels.length && value === panels[0]
      );
    }
    return {
      panels,
      defaultPanel,
      chartToolbarOptions
    };
  }
  doesChartToolbarExist(chartController) {
    const { chartToolbarOptions } = this.getToolbarOptionsAndPanels(chartController);
    return ["chartMenu", ...CHART_TOOLBAR_ALLOW_LIST].some((option) => chartToolbarOptions.includes(option));
  }
  doChartToolPanelsExist(chartController) {
    const { panels } = this.getToolbarOptionsAndPanels(chartController);
    return panels.length > 0;
  }
};
__decorateClass([
  (0, import_core54.Autowired)("chartService")
], ChartMenuService.prototype, "chartService", 2);
__decorateClass([
  (0, import_core54.Autowired)("advancedSettingsMenuFactory")
], ChartMenuService.prototype, "advancedSettingsMenuFactory", 2);
ChartMenuService = __decorateClass([
  (0, import_core54.Bean)("chartMenuService")
], ChartMenuService);

// enterprise-modules/charts/src/charts/chartComp/chartProxies/hierarchical/hierarchicalChartUtils.ts
var CATEGORY_LABEL_KEY = "AG-GRID-DEFAULT-LABEL-KEY";
function createCategoryHierarchy(data, categoryKeys) {
  const hierarchy = buildNestedHierarchy(data, getItemDepth, getItemCategoryLabel);
  return formatCategoryHierarchy(hierarchy);
  function getItemDepth(item) {
    return categoryKeys.length;
  }
  function getItemCategoryLabel(item, categoryIndex) {
    const categoryKey = categoryKeys[categoryIndex];
    const categoryValue = item[categoryKey];
    return getCategoryLabel(categoryValue);
  }
  function getCategoryLabel(value) {
    if (value == null)
      return null;
    return String(value);
  }
}
function createAutoGroupHierarchy(data, getItemLabels) {
  const hierarchy = buildNestedHierarchy(data, getItemDepth, getItemGroupLabel);
  return formatCategoryHierarchy(hierarchy);
  function getItemDepth(item) {
    var _a, _b;
    return (_b = (_a = getItemLabels(item)) == null ? void 0 : _a.length) != null ? _b : 0;
  }
  function getItemGroupLabel(item, groupIndex) {
    const labels = getItemLabels(item);
    if (!labels)
      return null;
    const labelIndex = labels.length - 1 - groupIndex;
    return labels[labelIndex];
  }
}
function formatCategoryHierarchy(hierarchy, key = null, isChild) {
  const { depth, rootValues, value, children: inputChildren } = hierarchy;
  if (rootValues) {
    return rootValues.map((item) => __spreadValues({ [CATEGORY_LABEL_KEY]: key }, item));
  } else if (depth === 0) {
    return [__spreadValues({ [CATEGORY_LABEL_KEY]: key }, value)];
  }
  const children = [];
  for (const [childKey, childHierarchy] of inputChildren.entries()) {
    children.push(...formatCategoryHierarchy(childHierarchy, childKey, true));
  }
  return isChild ? [__spreadValues({
    [CATEGORY_LABEL_KEY]: key,
    children
  }, value != null ? value : {})] : children;
}
function buildNestedHierarchy(data, getItemDepth, getItemGroupKey) {
  const hierarchy = { depth: 0, children: /* @__PURE__ */ new Map() };
  data.forEach((item) => {
    const itemDepth = getItemDepth(item);
    createNestedItemHierarchy(item, itemDepth, getItemGroupKey, 0, hierarchy);
  });
  return hierarchy;
  function createNestedItemHierarchy(item, itemDepth, getItemGroupKey2, currentDepth, hierarchy2) {
    if (currentDepth === itemDepth) {
      if (currentDepth === 0) {
        if (!hierarchy2.rootValues) {
          hierarchy2.rootValues = [];
        }
        hierarchy2.rootValues.push(item);
      } else {
        hierarchy2.value = item;
      }
      return hierarchy2;
    } else {
      const key = getItemGroupKey2(item, currentDepth);
      const existingChildHierarchy = hierarchy2.children.get(key);
      const childHierarchy = createNestedItemHierarchy(
        item,
        itemDepth,
        getItemGroupKey2,
        currentDepth + 1,
        existingChildHierarchy || { depth: 0, children: /* @__PURE__ */ new Map() }
      );
      hierarchy2.children.set(key, childHierarchy);
      hierarchy2.depth = Math.max(1 + childHierarchy.depth, hierarchy2.depth);
      return hierarchy2;
    }
  }
}

// enterprise-modules/charts/src/charts/chartComp/chartProxies/hierarchical/hierarchicalChartProxy.ts
var import_core55 = require("@ag-grid-community/core");
var HierarchicalChartProxy = class extends ChartProxy {
  constructor(chartProxyParams) {
    super(chartProxyParams);
  }
  getUpdateOptions(params, commonChartOptions) {
    const { fields } = params;
    const [sizeField, colorField] = fields;
    return __spreadProps(__spreadValues({}, commonChartOptions), {
      series: this.getSeries(sizeField, colorField),
      data: this.getData(params, sizeField, colorField)
    });
  }
  getSeriesChartThemeDefaults() {
    return {
      gradientLegend: {
        gradient: {
          preferredLength: 200
        }
      }
    };
  }
  getSeries(sizeField, colorField) {
    var _a, _b;
    return [
      {
        type: this.standaloneChartType,
        labelKey: CATEGORY_LABEL_KEY,
        // Size and color fields are inferred from the range data
        sizeKey: sizeField == null ? void 0 : sizeField.colId,
        sizeName: (_a = sizeField == null ? void 0 : sizeField.displayName) != null ? _a : void 0,
        colorKey: colorField == null ? void 0 : colorField.colId,
        colorName: (_b = colorField == null ? void 0 : colorField.displayName) != null ? _b : void 0
      }
    ];
  }
  getData(params, sizeField, colorField) {
    var _a;
    const { categories, data, groupData, grouping: isGrouped } = params;
    if (isGrouped) {
      const processedData = colorField ? data.concat(
        (_a = groupData == null ? void 0 : groupData.map((groupDatum) => {
          const newDatum = __spreadValues({}, groupDatum);
          delete newDatum[sizeField.colId];
          return newDatum;
        })) != null ? _a : []
      ) : data;
      return createAutoGroupHierarchy(processedData, (item) => {
        var _a2, _b;
        return (_b = (_a2 = item[import_core55.GROUP_AUTO_COLUMN_ID]) == null ? void 0 : _a2.labels) != null ? _b : null;
      });
    } else {
      const categoryKeys = categories.map(({ id }) => id);
      return createCategoryHierarchy(data, categoryKeys);
    }
  }
};

// enterprise-modules/charts/src/charts/chartComp/gridChartComp.ts
var _GridChartComp = class _GridChartComp extends import_core56.Component {
  constructor(params) {
    super(_GridChartComp.TEMPLATE);
    this.params = params;
  }
  init() {
    const modelParams = __spreadProps(__spreadValues({}, this.params), {
      chartType: getCanonicalChartType(this.params.chartType),
      chartThemeName: this.getThemeName()
    });
    const isRtl = this.gos.get("enableRtl");
    this.addCssClass(isRtl ? "ag-rtl" : "ag-ltr");
    const model = this.createBean(new ChartDataModel(modelParams));
    this.chartController = this.createManagedBean(new ChartController(model));
    this.chartOptionsService = this.createManagedBean(new ChartOptionsService(this.chartController));
    this.validateCustomThemes();
    this.createChart();
    if (this.params.insideDialog) {
      this.addDialog();
    }
    this.addMenu();
    this.addTitleEditComp();
    this.addManagedListener(this.getGui(), "focusin", this.setActiveChartCellRange.bind(this));
    this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, this.update.bind(this));
    this.addManagedPropertyListeners(["chartThemeOverrides", "chartThemes"], this.reactivePropertyUpdate.bind(this));
    this.update();
    this.raiseChartCreatedEvent();
  }
  createChart() {
    var _a;
    let chartInstance = void 0;
    if (this.chartProxy) {
      chartInstance = this.chartProxy.destroy({ keepChartInstance: true });
    }
    const crossFilterCallback = (event, reset) => {
      const ctx = this.params.crossFilteringContext;
      ctx.lastSelectedChartId = reset ? "" : this.chartController.getChartId();
      if (reset) {
        this.params.crossFilteringResetCallback();
      }
      this.crossFilterService.filter(event, reset);
    };
    const chartType = this.chartController.getChartType();
    const chartProxyParams = {
      chartType,
      chartInstance,
      getChartThemeName: this.getChartThemeName.bind(this),
      getChartThemes: this.getChartThemes.bind(this),
      customChartThemes: this.gos.get("customChartThemes"),
      getGridOptionsChartThemeOverrides: () => this.getGridOptionsChartThemeOverrides(),
      getExtraPaddingDirections: () => {
        var _a2, _b;
        return (_b = (_a2 = this.chartMenu) == null ? void 0 : _a2.getExtraPaddingDirections()) != null ? _b : [];
      },
      apiChartThemeOverrides: this.params.chartThemeOverrides,
      crossFiltering: (_a = this.params.crossFiltering) != null ? _a : false,
      crossFilterCallback,
      parentElement: this.eChart,
      grouping: this.chartController.isGrouping(),
      chartThemeToRestore: this.params.chartThemeName,
      chartOptionsToRestore: this.params.chartOptionsToRestore,
      chartPaletteToRestore: this.params.chartPaletteToRestore,
      seriesChartTypes: this.chartController.getSeriesChartTypes(),
      translate: (toTranslate) => this.chartTranslationService.translate(toTranslate)
    };
    this.params.chartOptionsToRestore = void 0;
    this.chartType = chartType;
    this.chartProxy = _GridChartComp.createChartProxy(chartProxyParams);
    if (!this.chartProxy) {
      console.warn("AG Grid: invalid chart type supplied: ", chartProxyParams.chartType);
      return;
    }
    const canvas = this.eChart.querySelector("canvas");
    if (canvas) {
      canvas.classList.add("ag-charts-canvas");
    }
    this.chartController.setChartProxy(this.chartProxy);
    this.createMenuContext();
    this.titleEdit && this.titleEdit.refreshTitle(this.chartMenuContext);
  }
  createMenuContext() {
    if (this.chartMenuContext) {
      return;
    }
    const chartMenuParamsFactory = this.createManagedBean(new ChartMenuParamsFactory(this.chartOptionsService.getChartThemeOverridesProxy()));
    const chartAxisMenuParamsFactory = this.createManagedBean(new ChartMenuParamsFactory(this.chartOptionsService.getAxisThemeOverridesProxy()));
    this.chartMenuContext = {
      chartController: this.chartController,
      chartOptionsService: this.chartOptionsService,
      chartMenuParamsFactory,
      chartAxisMenuParamsFactory
    };
  }
  getChartThemeName() {
    return this.chartController.getChartThemeName();
  }
  getChartThemes() {
    return this.chartController.getThemeNames();
  }
  getGridOptionsChartThemeOverrides() {
    return this.gos.get("chartThemeOverrides");
  }
  static createChartProxy(chartProxyParams) {
    switch (chartProxyParams.chartType) {
      case "column":
      case "bar":
      case "groupedColumn":
      case "stackedColumn":
      case "normalizedColumn":
      case "groupedBar":
      case "stackedBar":
      case "normalizedBar":
        return new BarChartProxy(chartProxyParams);
      case "pie":
      case "donut":
      case "doughnut":
        return new PieChartProxy(chartProxyParams);
      case "area":
      case "stackedArea":
      case "normalizedArea":
        return new AreaChartProxy(chartProxyParams);
      case "line":
        return new LineChartProxy(chartProxyParams);
      case "scatter":
      case "bubble":
        return new ScatterChartProxy(chartProxyParams);
      case "histogram":
        return new HistogramChartProxy(chartProxyParams);
      case "radarLine":
      case "radarArea":
      case "nightingale":
      case "radialColumn":
      case "radialBar":
        return new PolarChartProxy(chartProxyParams);
      case "rangeBar":
      case "rangeArea":
        return new RangeChartProxy(chartProxyParams);
      case "boxPlot":
        return new BoxPlotChartProxy(chartProxyParams);
      case "treemap":
      case "sunburst":
        return new HierarchicalChartProxy(chartProxyParams);
      case "heatmap":
        return new HeatmapChartProxy(chartProxyParams);
      case "waterfall":
        return new WaterfallChartProxy(chartProxyParams);
      case "columnLineCombo":
      case "areaColumnCombo":
      case "customCombo":
        return new ComboChartProxy(chartProxyParams);
      default:
        throw `AG Grid: Unable to create chart as an invalid chartType = '${chartProxyParams.chartType}' was supplied.`;
    }
  }
  addDialog() {
    const title = this.chartTranslationService.translate(this.params.pivotChart ? "pivotChartTitle" : "rangeChartTitle");
    const { width, height } = this.getBestDialogSize();
    this.chartDialog = new import_core56.AgDialog({
      resizable: true,
      movable: true,
      maximizable: true,
      title,
      width,
      height,
      component: this,
      centered: true,
      closable: true
    });
    this.getContext().createBean(this.chartDialog);
    this.chartDialog.addEventListener(import_core56.AgDialog.EVENT_DESTROYED, () => {
      this.destroy();
      this.chartMenuService.hideAdvancedSettings();
    });
  }
  getBestDialogSize() {
    const popupParent = this.popupService.getPopupParent();
    const maxWidth = import_core56._.getAbsoluteWidth(popupParent) * 0.75;
    const maxHeight = import_core56._.getAbsoluteHeight(popupParent) * 0.75;
    const ratio = 0.553;
    const chart = this.chartProxy.getChart();
    let width = this.params.insideDialog ? 850 : chart.width;
    let height = this.params.insideDialog ? 470 : chart.height;
    if (width > maxWidth || height > maxHeight) {
      width = Math.min(width, maxWidth);
      height = Math.round(width * ratio);
      if (height > maxHeight) {
        height = maxHeight;
        width = Math.min(width, Math.round(height / ratio));
      }
    }
    return { width, height };
  }
  addMenu() {
    if (!this.params.crossFiltering) {
      this.chartMenu = this.createBean(new ChartMenu(
        this.eChartContainer,
        this.eMenuContainer,
        this.chartMenuContext
      ));
      this.eChartContainer.appendChild(this.chartMenu.getGui());
    }
  }
  addTitleEditComp() {
    this.titleEdit = this.createBean(new TitleEdit(this.chartMenu));
    this.eTitleEditContainer.appendChild(this.titleEdit.getGui());
    if (this.chartProxy) {
      this.titleEdit.refreshTitle(this.chartMenuContext);
    }
  }
  update(params) {
    if (params == null ? void 0 : params.chartId) {
      const validUpdate = this.chartController.update(params);
      if (!validUpdate) {
        return;
      }
    }
    const updatedChartType = this.chartTypeChanged(params);
    const persistedThemeOverrides = updatedChartType || this.chartEmpty ? ((updatedChartType2) => {
      const currentChartType = this.chartType;
      const targetChartType = updatedChartType2;
      const existingChartInstance = this.chartProxy.getChart();
      const existingChartOptions = existingChartInstance == null ? void 0 : existingChartInstance.getOptions();
      const existingAxes = existingChartInstance == null ? void 0 : existingChartInstance.axes;
      return this.chartOptionsService.getPersistedChartThemeOverrides(
        existingChartOptions,
        existingAxes,
        currentChartType,
        targetChartType != null ? targetChartType : currentChartType
      );
    })(updatedChartType) : void 0;
    if (updatedChartType)
      this.createChart();
    const updatedThemeOverrides = persistedThemeOverrides && (params == null ? void 0 : params.chartThemeOverrides) ? deepMerge(persistedThemeOverrides, params.chartThemeOverrides) : persistedThemeOverrides || (params == null ? void 0 : params.chartThemeOverrides);
    this.updateChart(updatedThemeOverrides);
    if (params == null ? void 0 : params.chartId) {
      this.chartProxy.getChart().waitForUpdate().then(() => {
        this.chartController.raiseChartApiUpdateEvent();
      });
    }
  }
  updateChart(updatedOverrides) {
    const { chartProxy } = this;
    const selectedCols = this.chartController.getSelectedValueColState();
    const data = this.chartController.getChartData();
    const chartEmpty = this.handleEmptyChart(data, selectedCols.length);
    this.chartEmpty = chartEmpty;
    if (chartEmpty) {
      if (updatedOverrides)
        this.chartController.updateThemeOverrides(updatedOverrides);
      return;
    }
    let chartUpdateParams = this.chartController.getChartUpdateParams(updatedOverrides);
    chartProxy.update(chartUpdateParams);
    this.chartProxy.getChart().waitForUpdate().then(() => {
      this.chartController.raiseChartUpdatedEvent();
    });
    this.titleEdit.refreshTitle(this.chartMenuContext);
  }
  chartTypeChanged(updateParams) {
    const [currentType, updatedChartType] = [this.chartController.getChartType(), updateParams == null ? void 0 : updateParams.chartType];
    const targetChartType = updatedChartType ? getCanonicalChartType(updatedChartType) : void 0;
    if (this.chartType !== currentType)
      return targetChartType != null ? targetChartType : currentType;
    if (targetChartType && currentType !== targetChartType)
      return targetChartType;
    return null;
  }
  getChartModel() {
    return this.chartController.getChartModel();
  }
  getChartImageDataURL(fileFormat) {
    return this.chartProxy.getChartImageDataURL(fileFormat);
  }
  handleEmptyChart(data, numFields) {
    const pivotModeDisabled = this.chartController.isPivotChart() && !this.chartController.isPivotMode();
    const chartType = this.chartController.getChartType();
    let minFieldsRequired = 1;
    if (this.chartController.isActiveXYChart()) {
      minFieldsRequired = chartType === "bubble" ? 3 : 2;
    } else if (isHierarchical(getSeriesType(chartType))) {
      minFieldsRequired = 0;
    }
    const isEmptyChart = numFields < minFieldsRequired || data.length === 0;
    if (this.eChart) {
      const isEmpty = pivotModeDisabled || isEmptyChart;
      import_core56._.setDisplayed(this.eChart, !isEmpty);
      import_core56._.setDisplayed(this.eEmpty, isEmpty);
    }
    if (pivotModeDisabled) {
      this.eEmpty.innerText = this.chartTranslationService.translate("pivotChartRequiresPivotMode");
      return true;
    }
    if (isEmptyChart) {
      this.eEmpty.innerText = this.chartTranslationService.translate("noDataToChart");
      return true;
    }
    return false;
  }
  downloadChart(dimensions, fileName, fileFormat) {
    this.chartProxy.downloadChart(dimensions, fileName, fileFormat);
  }
  openChartToolPanel(panel) {
    const menuPanel = panel ? CHART_TOOL_PANEL_MENU_OPTIONS[panel] : panel;
    this.chartMenu.showMenu({ panel: menuPanel });
  }
  closeChartToolPanel() {
    this.chartMenu.hideMenu();
  }
  getChartId() {
    return this.chartController.getChartId();
  }
  getUnderlyingChart() {
    return this.chartProxy.getChartRef();
  }
  crossFilteringReset() {
    this.chartProxy.crossFilteringReset();
  }
  setActiveChartCellRange(focusEvent) {
    if (this.getGui().contains(focusEvent.relatedTarget)) {
      return;
    }
    this.chartController.setChartRange(true);
    this.focusService.clearFocusedCell();
  }
  getThemeName() {
    const availableChartThemes = this.gos.get("chartThemes") || DEFAULT_THEMES;
    if (availableChartThemes.length === 0) {
      throw new Error("Cannot create chart: no chart themes available.");
    }
    const { chartThemeName } = this.params;
    return import_core56._.includes(availableChartThemes, chartThemeName) ? chartThemeName : availableChartThemes[0];
  }
  getAllKeysInObjects(objects) {
    const allValues = {};
    objects.filter((obj) => obj != null).forEach((obj) => {
      Object.keys(obj).forEach((key) => allValues[key] = null);
    });
    return Object.keys(allValues);
  }
  validateCustomThemes() {
    const suppliedThemes = this.getChartThemes();
    const customChartThemes = this.gos.get("customChartThemes");
    if (customChartThemes) {
      this.getAllKeysInObjects([customChartThemes]).forEach((customThemeName) => {
        if (!import_core56._.includes(suppliedThemes, customThemeName)) {
          console.warn("AG Grid: a custom chart theme with the name '" + customThemeName + "' has been supplied but not added to the 'chartThemes' list");
        }
      });
    }
  }
  reactivePropertyUpdate() {
    this.chartController.setChartThemeName(this.getThemeName(), true);
    const chartId = this.getChartId();
    const modelType = this.chartController.isCrossFilterChart() ? "crossFilter" : this.getChartModel().modelType;
    const chartThemeOverrides = this.gos.get("chartThemeOverrides") || {};
    this.update({
      type: `${modelType}ChartUpdate`,
      chartId,
      chartThemeOverrides
    });
  }
  raiseChartCreatedEvent() {
    const event = {
      type: import_core56.Events.EVENT_CHART_CREATED,
      chartId: this.chartController.getChartId()
    };
    this.chartProxy.getChart().waitForUpdate().then(() => {
      this.eventService.dispatchEvent(event);
    });
  }
  raiseChartDestroyedEvent() {
    const event = {
      type: import_core56.Events.EVENT_CHART_DESTROYED,
      chartId: this.chartController.getChartId()
    };
    this.eventService.dispatchEvent(event);
  }
  destroy() {
    var _a;
    super.destroy();
    if (this.chartProxy) {
      this.chartProxy.destroy();
    }
    this.destroyBean(this.chartMenu);
    this.destroyBean(this.titleEdit);
    if (this.chartDialog && this.chartDialog.isAlive()) {
      this.destroyBean(this.chartDialog);
    }
    (_a = this.onDestroyColorSchemeChangeListener) == null ? void 0 : _a.call(this);
    const eGui = this.getGui();
    import_core56._.clearElement(eGui);
    import_core56._.removeFromParent(eGui);
    this.raiseChartDestroyedEvent();
  }
};
_GridChartComp.TEMPLATE = /* html */
`<div class="ag-chart" tabindex="-1">
            <div ref="eChartContainer" tabindex="-1" class="ag-chart-components-wrapper">
                <div ref="eChart" class="ag-chart-canvas-wrapper"></div>
                <div ref="eEmpty" class="ag-chart-empty-text ag-unselectable"></div>
            </div>
            <div ref="eTitleEditContainer"></div>
            <div ref="eMenuContainer" class="ag-chart-docked-container" style="min-width: 0px;"></div>
        </div>`;
__decorateClass([
  (0, import_core56.RefSelector)("eChart")
], _GridChartComp.prototype, "eChart", 2);
__decorateClass([
  (0, import_core56.RefSelector)("eChartContainer")
], _GridChartComp.prototype, "eChartContainer", 2);
__decorateClass([
  (0, import_core56.RefSelector)("eMenuContainer")
], _GridChartComp.prototype, "eMenuContainer", 2);
__decorateClass([
  (0, import_core56.RefSelector)("eEmpty")
], _GridChartComp.prototype, "eEmpty", 2);
__decorateClass([
  (0, import_core56.RefSelector)("eTitleEditContainer")
], _GridChartComp.prototype, "eTitleEditContainer", 2);
__decorateClass([
  (0, import_core56.Autowired)("chartCrossFilterService")
], _GridChartComp.prototype, "crossFilterService", 2);
__decorateClass([
  (0, import_core56.Autowired)("chartTranslationService")
], _GridChartComp.prototype, "chartTranslationService", 2);
__decorateClass([
  (0, import_core56.Autowired)("chartMenuService")
], _GridChartComp.prototype, "chartMenuService", 2);
__decorateClass([
  (0, import_core56.Autowired)("focusService")
], _GridChartComp.prototype, "focusService", 2);
__decorateClass([
  (0, import_core56.Autowired)("popupService")
], _GridChartComp.prototype, "popupService", 2);
__decorateClass([
  import_core56.PostConstruct
], _GridChartComp.prototype, "init", 1);
var GridChartComp = _GridChartComp;

// enterprise-modules/charts/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/charts/src/charts/chartModelMigration.ts
var DEBUG = false;
function upgradeChartModel(model) {
  const originalVersion = model.version;
  if (model.version == null) {
    model.version = heuristicVersionDetection(model);
  }
  model = migrateIfBefore("23.0.0", model, migrateV23);
  model = migrateIfBefore("24.0.0", model, migrateV24);
  model = migrateIfBefore("25.1.0", model, migrateV25_1);
  model = migrateIfBefore("26.0.0", model, migrateV26);
  model = migrateIfBefore("26.1.0", model, migrateV26_1);
  model = migrateIfBefore("26.2.0", model, migrateV26_2);
  model = migrateIfBefore("28.0.0", model, migrateV28);
  model = migrateIfBefore("28.2.0", model, migrateV28_2);
  model = migrateIfBefore("29.0.0", model, migrateV29);
  model = migrateIfBefore("29.1.0", model, migrateV29_1);
  model = migrateIfBefore("29.2.0", model, migrateV29_2);
  model = migrateIfBefore("30.0.0", model, migrateV30);
  model = migrateIfBefore("31.0.0", model, migrateV31);
  model = cleanup(model);
  model = migrateIfBefore(VERSION, model, (m) => m);
  if (DEBUG && originalVersion !== model.version) {
    console.log("AG Grid: ChartModel migration complete", { model });
  }
  return model;
}
function migrateV23(model) {
  model = jsonRename("chartOptions.legend.item.marker.type", "shape", model);
  model = jsonRename("chartOptions.seriesDefaults.marker.type", "shape", model);
  model = jsonRename("chartOptions.legend.padding", "spacing", model);
  return model;
}
function migrateV24(model) {
  var _d;
  model = jsonDelete("chartOptions.seriesDefaults.marker.minSize", model);
  const _a = model, {
    chartType,
    chartPalette,
    chartOptions: _b
  } = _a, _c = _b, { xAxis, yAxis } = _c, chartOptions = __objRest(_c, ["xAxis", "yAxis"]), chartModel = __objRest(_a, [
    "chartType",
    "chartPalette",
    // Migrate.
    "chartOptions"
  ]);
  const axesTypes = getLegacyAxisType(chartType);
  const axes = axesTypes == null ? void 0 : axesTypes.map((type, i) => __spreadValues({
    type
  }, i === 0 ? xAxis : yAxis));
  const LEGACY_PALETTES = {
    borneo: "ag-default",
    material: "ag-material",
    bright: "ag-vivid"
  };
  return __spreadValues({
    chartType,
    chartThemeName: (_d = LEGACY_PALETTES[chartPalette]) != null ? _d : "ag-default",
    chartOptions: __spreadProps(__spreadValues({}, chartOptions), {
      axes,
      xAxis,
      yAxis
    })
  }, chartModel);
}
function migrateV25_1(model) {
  model = jsonRename("chartOptions.seriesDefaults.label.minRequiredAngle", "minAngle", model);
  return model;
}
function migrateV26(model) {
  const highlightOptUpdate = (_a) => {
    var _b = _a, { dimOpacity } = _b, opts = __objRest(_b, ["dimOpacity"]);
    return __spreadValues(__spreadValues({}, opts), dimOpacity != null ? { series: { dimOpacity } } : {});
  };
  model = jsonMutate("chartOptions.seriesDefaults.highlightStyle", model, highlightOptUpdate);
  model = jsonDelete("chart", model);
  model = jsonDelete("chartOptions.seriesDefaults.tooltipClass", model);
  model = jsonDelete("chartOptions.seriesDefaults.tooltipTracking", model);
  model = jsonDeleteDefault("chartOptions.axes[].label.rotation", 0, model);
  model = jsonDeleteDefault("chartOptions.axes[].label.rotation", 335, model);
  return model;
}
function migrateV26_1(model) {
  const highlightOptUpdate = (_a) => {
    var _b = _a, { item, series } = _b, opts = __objRest(_b, ["item", "series"]);
    return __spreadValues({
      item: __spreadValues(__spreadValues({}, opts), item)
    }, series ? { series } : {});
  };
  model = jsonMutate("chartOptions.seriesDefaults.highlightStyle", model, highlightOptUpdate);
  model = jsonMutate("chartOptions.series[].highlightStyle", model, highlightOptUpdate);
  return model;
}
function migrateV26_2(model) {
  model = jsonMove("chartOptions.seriesDefaults.fill.opacity", "chartOptions.seriesDefaults.fillOpacity", model);
  model = jsonMove("chartOptions.seriesDefaults.stroke.opacity", "chartOptions.seriesDefaults.strokeOpacity", model);
  model = jsonMove("chartOptions.seriesDefaults.stroke.width", "chartOptions.seriesDefaults.strokeWidth", model);
  model = jsonDelete("chartOptions.seriesDefaults.fill", model);
  model = jsonDelete("chartOptions.seriesDefaults.stroke", model);
  model = jsonDelete("chartOptions.seriesDefaults.callout.colors", model);
  model = jsonDelete("chartOptions.xAxis", model);
  model = jsonDelete("chartOptions.yAxis", model);
  const _a = model, {
    chartType: providedChartType,
    chartOptions: _b
  } = _a, _c = _b, { axes, series, seriesDefaults } = _c, otherChartOptions = __objRest(_c, ["axes", "series", "seriesDefaults"]), otherModelProps = __objRest(_a, [
    "chartType",
    "chartOptions"
  ]);
  const chartType = getCanonicalChartType(providedChartType);
  const seriesType = getSeriesType(chartType);
  const seriesTypes = [seriesType];
  const chartTypeMixin = {};
  if (!isPieChartSeries(seriesType)) {
    const minimalAxis = { top: {}, bottom: {}, left: {}, right: {} };
    const updatedAxes = axes.map((_d) => {
      var _e = _d, { type } = _e, axisProps = __objRest(_e, ["type"]);
      return {
        [type]: __spreadValues(__spreadValues({}, minimalAxis), axisProps)
      };
    }).reduce(merge, {});
    ALL_AXIS_TYPES.filter((v) => updatedAxes[v] == null).forEach((v) => {
      updatedAxes[v] = __spreadValues({}, minimalAxis);
    });
    chartTypeMixin.axes = updatedAxes;
  }
  const updatedChartOptions = seriesTypes.map((t) => ({
    [t]: __spreadValues(__spreadProps(__spreadValues({}, chartTypeMixin), {
      series: seriesDefaults
    }), otherChartOptions)
  })).reduce(merge, {});
  model = __spreadProps(__spreadValues({}, otherModelProps), {
    chartType,
    chartOptions: updatedChartOptions
  });
  return model;
}
function migrateV28(model) {
  model = jsonDelete("chartOptions.*.title.padding", model);
  model = jsonDelete("chartOptions.*.subtitle.padding", model);
  model = jsonDelete("chartOptions.*.axes.*.title.padding", model);
  model = jsonBackfill("chartOptions.*.axes.*.title.enabled", false, model);
  return model;
}
function migrateV28_2(model) {
  model = jsonRename("chartOptions.pie.series.callout", "calloutLine", model);
  model = jsonRename("chartOptions.pie.series.label", "calloutLabel", model);
  model = jsonRename("chartOptions.pie.series.labelKey", "sectorLabelKey", model);
  model = jsonRename("chartOptions.pie.series.labelName", "sectorLabelName", model);
  model = jsonRename("chartOptions.donut.series.callout", "calloutLine", model);
  model = jsonRename("chartOptions.donut.series.label", "calloutLabel", model);
  model = jsonRename("chartOptions.donut.series.labelKey", "sectorLabelKey", model);
  model = jsonRename("chartOptions.donut.series.labelName", "sectorLabelName", model);
  return model;
}
function migrateV29(model) {
  model = jsonMoveIfMissing("chartOptions.scatter.series.fill", "chartOptions.scatter.series.marker.fill", model);
  model = jsonMoveIfMissing(
    "chartOptions.scatter.series.fillOpacity",
    "chartOptions.scatter.series.marker.fillOpacity",
    model
  );
  model = jsonMoveIfMissing("chartOptions.scatter.series.stroke", "chartOptions.scatter.series.marker.stroke", model);
  model = jsonMoveIfMissing(
    "chartOptions.scatter.series.strokeOpacity",
    "chartOptions.scatter.series.marker.strokeOpacity",
    model
  );
  model = jsonMoveIfMissing(
    "chartOptions.scatter.series.strokeWidth",
    "chartOptions.scatter.series.marker.strokeWidth",
    model
  );
  model = jsonMove("chartOptions.scatter.series.paired", "chartOptions.scatter.paired", model);
  return model;
}
function migrateV29_1(model) {
  model = jsonDelete("chartOptions.axes[].tick.count", model);
  return model;
}
function migrateV29_2(model) {
  const tooltipOptUpdate = (_a) => {
    var _b = _a, { tracking } = _b, opts = __objRest(_b, ["tracking"]);
    var _a2, _b2, _c, _d;
    const output = __spreadValues({}, opts);
    if (tracking === false) {
      (_a2 = output.position) != null ? _a2 : output.position = { type: "pointer" };
      (_b2 = output.range) != null ? _b2 : output.range = "nearest";
    } else if (tracking === true) {
      (_c = output.position) != null ? _c : output.position = { type: "node" };
      (_d = output.range) != null ? _d : output.range = "nearest";
    }
    return output;
  };
  model = jsonMutate("chartOptions.*.tooltip", model, tooltipOptUpdate);
  return model;
}
function migrateV30(model) {
  model = jsonRename("chartOptions.pie.series.labelKey", "sectorLabelKey", model);
  model = jsonRename("chartOptions.pie.series.labelName", "sectorLabelName", model);
  model = migrateV29_1(model);
  model = migrateV29_2(model);
  model = jsonDelete("chartOptions.*.series.flipXY", model);
  model = jsonAdd("chartOptions.common.legend.enabled", true, model);
  model = jsonBackfill("chartOptions.common.legend.position", "right", model);
  return model;
}
function migrateV31(model) {
  const V30_LEGACY_PALETTES = {
    "ag-pastel": "ag-sheets",
    "ag-solar": "ag-polychroma"
  };
  const updatedModel = jsonRename("chartOptions.column", "bar", model);
  const chartThemeName = V30_LEGACY_PALETTES[updatedModel.chartThemeName] || updatedModel.chartThemeName;
  return __spreadProps(__spreadValues({}, updatedModel), {
    chartThemeName
  });
}
function cleanup(model) {
  model = jsonDelete("chartOptions.*.width", model);
  model = jsonDelete("chartOptions.*.height", model);
  model = jsonBackfill("chartOptions.*.axes.category.label.autoRotate", true, model);
  return model;
}
function heuristicVersionDetection(model) {
  var _a, _b;
  const modelAny = model;
  if (model.version != null) {
    return model.version;
  }
  const hasKey = (obj, ...keys) => {
    return Object.keys(obj || {}).some((k) => keys.includes(k));
  };
  const chartOptions = modelAny.chartOptions;
  const seriesOptions = hasKey(chartOptions, "seriesDefaults") ? chartOptions == null ? void 0 : chartOptions.seriesDefaults : chartOptions == null ? void 0 : chartOptions[Object.keys(chartOptions)[0]];
  const hints = {
    "27.0.0": hasKey(modelAny, "seriesChartTypes"),
    "26.2.0": !hasKey(chartOptions, "seriesDefaults"),
    "26.1.0": hasKey(seriesOptions == null ? void 0 : seriesOptions.highlightStyle, "item"),
    "26.0.0": hasKey(seriesOptions == null ? void 0 : seriesOptions.highlightStyle, "series"),
    // '26.0.0': modelAny.chart === undefined,
    "25.1.0": hasKey(seriesOptions == null ? void 0 : seriesOptions.label, "minAngle"),
    "25.0.0": hasKey(modelAny, "modelType", "aggFunc", "unlinkChart", "suppressChartRanges") || hasKey(seriesOptions, "lineDash", "lineDashOffset"),
    "24.0.0": hasKey(modelAny, "chartThemeName", "chart") || hasKey(chartOptions, "series"),
    "23.2.0": hasKey(chartOptions, "navigator"),
    "23.0.0": hasKey((_b = (_a = chartOptions == null ? void 0 : chartOptions.legend) == null ? void 0 : _a.item) == null ? void 0 : _b.marker, "shape"),
    "22.1.0": hasKey(modelAny, "chartPalette", "chartType")
  };
  const defaultVersion = "27.1.0";
  const matchingHints = Object.entries(hints).filter(([_38, match]) => match);
  if (DEBUG)
    console.log("AG Grid: ChartModel migration", { heuristicVersionCandidates: matchingHints });
  const [heuristicVersion = defaultVersion] = matchingHints[0];
  if (DEBUG)
    console.log("AG Grid: ChartModel migration", { heuristicVersion });
  return heuristicVersion;
}
function migrateIfBefore(maxVersion, model, migration) {
  if (versionNumber(maxVersion) > versionNumber(model.version)) {
    if (DEBUG)
      console.log("AG Grid: ChartModel migration", { migratingTo: maxVersion });
    const result = migration(model);
    result.version = maxVersion;
    if (DEBUG)
      console.log("AG Grid: ChartModel migration", { migratedTo: maxVersion, result });
    return result;
  }
  return model;
}
function versionParts(version) {
  const split = typeof version === "string" ? version.split(".").map((v) => Number(v)) : [];
  if (split.length !== 3 || split.some((v) => isNaN(v))) {
    throw new Error("AG Grid - Illegal version string: " + version);
  }
  return {
    major: split[0],
    minor: split[1],
    patch: split[2]
  };
}
function versionNumber(version) {
  const { major, minor, patch } = versionParts(version);
  return major * 1e4 + minor * 100 + patch;
}
function jsonDeleteDefault(path, defaultValue, json) {
  return jsonMutateProperty(path, true, json, (parent, prop) => {
    if (parent[prop] === defaultValue) {
      delete parent[prop];
    }
  });
}
function jsonBackfill(path, defaultValue, json) {
  return jsonMutateProperty(path, false, json, (parent, prop) => {
    if (parent[prop] == null) {
      parent[prop] = defaultValue;
    }
  });
}
function jsonAdd(path, value, json) {
  var _a;
  if (typeof path === "string") {
    path = path.split(".");
  }
  const nextPath = path[0];
  if (path.length > 1) {
    json[nextPath] = jsonAdd(path.slice(1), value, (_a = json[nextPath]) != null ? _a : {});
  }
  const hasProperty = Object.keys(json).includes(nextPath);
  if (!hasProperty) {
    json[nextPath] = value;
  }
  return json;
}
function jsonMove(from, to, json) {
  let valueToMove = void 0;
  let valueFound = false;
  json = jsonMutateProperty(from, true, json, (parent, prop) => {
    valueFound = true;
    valueToMove = parent[prop];
    delete parent[prop];
  });
  if (!valueFound) {
    return json;
  }
  return jsonMutateProperty(to, false, json, (parent, prop) => {
    parent[prop] = valueToMove;
  });
}
function jsonMoveIfMissing(from, to, json) {
  let valueToMove = void 0;
  let valueFound = false;
  json = jsonMutateProperty(from, true, json, (parent, prop) => {
    valueFound = true;
    valueToMove = parent[prop];
    delete parent[prop];
  });
  if (!valueFound) {
    return json;
  }
  return jsonMutateProperty(to, false, json, (parent, prop) => {
    if (parent[prop] === void 0) {
      parent[prop] = valueToMove;
    }
  });
}
function jsonRename(path, renameTo, json) {
  return jsonMutateProperty(path, true, json, (parent, prop) => {
    parent[renameTo] = parent[prop];
    delete parent[prop];
  });
}
function jsonDelete(path, json) {
  return jsonMutateProperty(path, true, json, (parent, prop) => delete parent[prop]);
}
function jsonMutateProperty(path, skipMissing, json, mutator) {
  const pathElements = path instanceof Array ? path : path.split(".");
  const parentPathElements = pathElements.slice(0, pathElements.length - 1);
  const targetName = pathElements[pathElements.length - 1];
  return jsonMutate(parentPathElements, json, (parent) => {
    const hasProperty = Object.keys(parent).includes(targetName);
    if (skipMissing && !hasProperty) {
      return parent;
    }
    const result = __spreadValues({}, parent);
    mutator(result, targetName);
    return result;
  });
}
function jsonMutate(path, json, mutator) {
  const pathElements = path instanceof Array ? path : path.split(".");
  json = __spreadValues({}, json);
  if (pathElements.length === 0) {
    return mutator(json);
  } else if (pathElements[0].startsWith("{")) {
    const pathOptions = pathElements[0].substring(1, pathElements[0].lastIndexOf("}")).split(",");
    for (const pathOption of pathOptions) {
      if (json[pathOption] != null) {
        json[pathOption] = jsonMutate(pathElements.slice(1), json[pathOption], mutator);
      }
    }
  } else if (pathElements[0].endsWith("[]")) {
    const arrayName = pathElements[0].substring(0, path[0].indexOf("["));
    if (json[arrayName] instanceof Array) {
      json[arrayName] = json[arrayName].map((v) => jsonMutate(pathElements.slice(1), v, mutator));
    }
  } else if (pathElements[0] === "*") {
    for (const jsonProp in json) {
      json[jsonProp] = jsonMutate(pathElements.slice(1), json[jsonProp], mutator);
    }
  } else if (json[pathElements[0]] != null) {
    json[pathElements[0]] = jsonMutate(pathElements.slice(1), json[pathElements[0]], mutator);
  }
  return json;
}
var merge = (r, n) => __spreadValues(__spreadValues({}, r), n);

// enterprise-modules/charts/src/charts/chartService.ts
var ChartService = class extends import_core57.BeanStub {
  constructor() {
    super(...arguments);
    // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
    // those in developer provided containers.
    this.activeCharts = /* @__PURE__ */ new Set();
    this.activeChartComps = /* @__PURE__ */ new Set();
    // this shared (singleton) context is used by cross filtering in line and area charts
    this.crossFilteringContext = {
      lastSelectedChartId: ""
    };
    this.isEnterprise = () => import_ag_charts_community32._ModuleSupport.enterpriseModule.isEnterprise;
  }
  updateChart(params) {
    if (this.activeChartComps.size === 0) {
      console.warn(`AG Grid - No active charts to update.`);
      return;
    }
    const chartComp = [...this.activeChartComps].find((chartComp2) => chartComp2.getChartId() === params.chartId);
    if (!chartComp) {
      console.warn(`AG Grid - Unable to update chart. No active chart found with ID: ${params.chartId}.`);
      return;
    }
    chartComp.update(params);
  }
  getChartModels() {
    const models = [];
    const versionedModel = (c) => {
      return __spreadProps(__spreadValues({}, c), { version: VERSION });
    };
    this.activeChartComps.forEach((c) => models.push(versionedModel(c.getChartModel())));
    return models;
  }
  getChartRef(chartId) {
    let chartRef;
    this.activeCharts.forEach((cr) => {
      if (cr.chartId === chartId) {
        chartRef = cr;
      }
    });
    return chartRef;
  }
  getChartComp(chartId) {
    let chartComp;
    this.activeChartComps.forEach((comp) => {
      if (comp.getChartId() === chartId) {
        chartComp = comp;
      }
    });
    return chartComp;
  }
  getChartImageDataURL(params) {
    let url;
    this.activeChartComps.forEach((c) => {
      if (c.getChartId() === params.chartId) {
        url = c.getChartImageDataURL(params.fileFormat);
      }
    });
    return url;
  }
  downloadChart(params) {
    const chartComp = Array.from(this.activeChartComps).find((c) => c.getChartId() === params.chartId);
    chartComp == null ? void 0 : chartComp.downloadChart(params.dimensions, params.fileName, params.fileFormat);
  }
  openChartToolPanel(params) {
    const chartComp = Array.from(this.activeChartComps).find((c) => c.getChartId() === params.chartId);
    chartComp == null ? void 0 : chartComp.openChartToolPanel(params.panel);
  }
  closeChartToolPanel(chartId) {
    const chartComp = Array.from(this.activeChartComps).find((c) => c.getChartId() === chartId);
    chartComp == null ? void 0 : chartComp.closeChartToolPanel();
  }
  createChartFromCurrentRange(chartType = "groupedColumn") {
    const cellRange = this.getSelectedRange();
    return this.createChart({ cellRange, chartType });
  }
  restoreChart(model, chartContainer) {
    if (!model) {
      console.warn("AG Grid - unable to restore chart as no chart model is provided");
      return;
    }
    if (model.version !== VERSION) {
      model = upgradeChartModel(model);
    }
    let cellRange;
    let pivotChart;
    let suppressChartRanges;
    let chartPaletteToRestore;
    if (model.modelType === "pivot") {
      this.gos.updateGridOptions({ options: { pivotMode: true }, source: "pivotChart" });
      cellRange = this.createCellRange(void 0, true);
      pivotChart = true;
      suppressChartRanges = true;
    } else {
      cellRange = this.createCellRange(model.cellRange);
      chartPaletteToRestore = model.chartPalette;
    }
    if (!cellRange) {
      return;
    }
    return this.createChart(__spreadProps(__spreadValues({}, model), {
      cellRange,
      pivotChart,
      suppressChartRanges,
      chartContainer,
      chartOptionsToRestore: model.chartOptions,
      chartPaletteToRestore
    }));
  }
  createRangeChart(params) {
    const cellRange = this.createCellRange(params.cellRange);
    if (!cellRange) {
      return;
    }
    return this.createChart(__spreadProps(__spreadValues({}, params), {
      cellRange
    }));
  }
  createPivotChart(params) {
    this.gos.updateGridOptions({ options: { pivotMode: true }, source: "pivotChart" });
    const cellRange = this.createCellRange(void 0, true);
    if (!cellRange) {
      return;
    }
    return this.createChart(__spreadProps(__spreadValues({}, params), {
      cellRange,
      pivotChart: true,
      suppressChartRanges: true
    }));
  }
  createCrossFilterChart(params) {
    const cellRange = this.createCellRange(params.cellRange);
    if (!cellRange) {
      return;
    }
    const suppressChartRangesSupplied = typeof params.suppressChartRanges !== "undefined" && params.suppressChartRanges !== null;
    const suppressChartRanges = suppressChartRangesSupplied ? params.suppressChartRanges : true;
    return this.createChart(__spreadProps(__spreadValues({}, params), {
      cellRange,
      suppressChartRanges,
      crossFiltering: true
    }));
  }
  createChart(params) {
    const validationResult = ChartParamsValidator.validateCreateParams(params);
    if (!validationResult) {
      return void 0;
    }
    params = validationResult === true ? params : validationResult;
    const { chartType, chartContainer } = params;
    const createChartContainerFunc = this.gos.getCallback("createChartContainer");
    const gridChartParams = __spreadProps(__spreadValues({}, params), {
      chartId: this.generateId(),
      chartType: getCanonicalChartType(chartType),
      insideDialog: !(chartContainer || createChartContainerFunc),
      crossFilteringContext: this.crossFilteringContext,
      crossFilteringResetCallback: () => this.activeChartComps.forEach((c) => c.crossFilteringReset())
    });
    const chartComp = new GridChartComp(gridChartParams);
    this.context.createBean(chartComp);
    const chartRef = this.createChartRef(chartComp);
    if (chartContainer) {
      chartContainer.appendChild(chartComp.getGui());
      const theme = this.environment.getTheme();
      if (theme.el && !theme.el.contains(chartContainer)) {
        chartContainer.classList.add(theme.theme);
      }
    } else if (createChartContainerFunc) {
      createChartContainerFunc(chartRef);
    } else {
      chartComp.addEventListener(
        GridChartComp.EVENT_DESTROYED,
        () => {
          this.activeChartComps.delete(chartComp);
          this.activeCharts.delete(chartRef);
        }
      );
    }
    return chartRef;
  }
  createChartRef(chartComp) {
    const chartRef = {
      destroyChart: () => {
        if (this.activeCharts.has(chartRef)) {
          this.context.destroyBean(chartComp);
          this.activeChartComps.delete(chartComp);
          this.activeCharts.delete(chartRef);
        }
      },
      chartElement: chartComp.getGui(),
      chart: chartComp.getUnderlyingChart(),
      chartId: chartComp.getChartModel().chartId
    };
    this.activeCharts.add(chartRef);
    this.activeChartComps.add(chartComp);
    return chartRef;
  }
  getSelectedRange() {
    var _a, _b;
    const ranges = (_b = (_a = this.rangeService) == null ? void 0 : _a.getCellRanges()) != null ? _b : [];
    return ranges.length > 0 ? ranges[0] : { columns: [] };
  }
  generateId() {
    return `id-${Math.random().toString(36).substring(2, 18)}`;
  }
  createCellRange(cellRangeParams, allRange) {
    var _a;
    const rangeParams = allRange ? {
      rowStartIndex: null,
      rowStartPinned: void 0,
      rowEndIndex: null,
      rowEndPinned: void 0,
      columns: this.columnModel.getAllDisplayedColumns().map((col) => col.getColId())
    } : cellRangeParams;
    const cellRange = rangeParams && ((_a = this.rangeService) == null ? void 0 : _a.createPartialCellRangeFromRangeParams(rangeParams, true));
    if (!cellRange) {
      console.warn(`AG Grid - unable to create chart as ${allRange ? "there are no columns in the grid" : "no range is selected"}.`);
    }
    return cellRange;
  }
  destroyAllActiveCharts() {
    this.activeCharts.forEach((chart) => chart.destroyChart());
  }
};
ChartService.CHARTS_VERSION = import_ag_charts_community32.VERSION;
__decorateClass([
  (0, import_core57.Autowired)("columnModel")
], ChartService.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core57.Optional)("rangeService")
], ChartService.prototype, "rangeService", 2);
__decorateClass([
  import_core57.PreDestroy
], ChartService.prototype, "destroyAllActiveCharts", 1);
ChartService = __decorateClass([
  (0, import_core57.Bean)("chartService")
], ChartService);

// enterprise-modules/charts/src/charts/chartComp/services/chartTranslationService.ts
var import_core58 = require("@ag-grid-community/core");
var ChartTranslationService = class extends import_core58.BeanStub {
  translate(toTranslate) {
    const translate = this.localeService.getLocaleTextFunc();
    const defaultTranslation = ChartTranslationService.DEFAULT_TRANSLATIONS[toTranslate];
    return translate(toTranslate, defaultTranslation);
  }
};
ChartTranslationService.DEFAULT_TRANSLATIONS = {
  pivotChartTitle: "Pivot Chart",
  rangeChartTitle: "Range Chart",
  settings: "Chart",
  data: "Data",
  format: "Format",
  categories: "Categories",
  defaultCategory: "(None)",
  series: "Series",
  switchCategorySeries: "Switch Category / Series",
  categoryValues: "Category Values",
  seriesLabels: "Series Labels",
  aggregate: "Aggregate",
  xyValues: "X Y Values",
  paired: "Paired Mode",
  axis: "Axis",
  xAxis: "Horizontal Axis",
  yAxis: "Vertical Axis",
  polarAxis: "Polar Axis",
  radiusAxis: "Radius Axis",
  navigator: "Navigator",
  zoom: "Zoom",
  animation: "Animation",
  crosshair: "Crosshair",
  color: "Color",
  thickness: "Thickness",
  preferredLength: "Preferred Length",
  xType: "X Type",
  axisType: "Axis Type",
  automatic: "Automatic",
  category: "Category",
  number: "Number",
  time: "Time",
  timeFormat: "Time Format",
  autoRotate: "Auto Rotate",
  labelRotation: "Rotation",
  circle: "Circle",
  orientation: "Orientation",
  polygon: "Polygon",
  fixed: "Fixed",
  parallel: "Parallel",
  perpendicular: "Perpendicular",
  radiusAxisPosition: "Position",
  ticks: "Ticks",
  gridLines: "Grid Lines",
  width: "Width",
  height: "Height",
  length: "Length",
  padding: "Padding",
  spacing: "Spacing",
  chart: "Chart",
  title: "Title",
  titlePlaceholder: "Chart title - double click to edit",
  background: "Background",
  font: "Font",
  top: "Top",
  right: "Right",
  bottom: "Bottom",
  left: "Left",
  labels: "Labels",
  calloutLabels: "Callout Labels",
  sectorLabels: "Sector Labels",
  positionRatio: "Position Ratio",
  size: "Size",
  shape: "Shape",
  minSize: "Minimum Size",
  maxSize: "Maximum Size",
  legend: "Legend",
  position: "Position",
  markerSize: "Marker Size",
  markerStroke: "Marker Stroke",
  markerPadding: "Marker Padding",
  itemSpacing: "Item Spacing",
  itemPaddingX: "Item Padding X",
  itemPaddingY: "Item Padding Y",
  layoutHorizontalSpacing: "Horizontal Spacing",
  layoutVerticalSpacing: "Vertical Spacing",
  strokeWidth: "Stroke Width",
  offset: "Offset",
  offsets: "Offsets",
  tooltips: "Tooltips",
  callout: "Callout",
  markers: "Markers",
  shadow: "Shadow",
  blur: "Blur",
  xOffset: "X Offset",
  yOffset: "Y Offset",
  lineWidth: "Line Width",
  lineDash: "Line Dash",
  lineDashOffset: "Dash Offset",
  scrollingZoom: "Scrolling",
  scrollingStep: "Scrolling Step",
  selectingZoom: "Selecting",
  durationMillis: "Duration (ms)",
  crosshairLabel: "Label",
  crosshairSnap: "Snap to Node",
  normal: "Normal",
  bold: "Bold",
  italic: "Italic",
  boldItalic: "Bold Italic",
  predefined: "Predefined",
  fillOpacity: "Fill Opacity",
  strokeColor: "Line Color",
  strokeOpacity: "Line Opacity",
  miniChart: "Mini-Chart",
  histogramBinCount: "Bin count",
  connectorLine: "Connector Line",
  seriesItems: "Series Items",
  seriesItemType: "Item Type",
  seriesItemPositive: "Positive",
  seriesItemNegative: "Negative",
  seriesItemLabels: "Item Labels",
  columnGroup: "Column",
  barGroup: "Bar",
  pieGroup: "Pie",
  lineGroup: "Line",
  scatterGroup: "X Y (Scatter)",
  areaGroup: "Area",
  polarGroup: "Polar",
  statisticalGroup: "Statistical",
  hierarchicalGroup: "Hierarchical",
  specializedGroup: "Specialized",
  combinationGroup: "Combination",
  groupedColumnTooltip: "Grouped",
  stackedColumnTooltip: "Stacked",
  normalizedColumnTooltip: "100% Stacked",
  groupedBarTooltip: "Grouped",
  stackedBarTooltip: "Stacked",
  normalizedBarTooltip: "100% Stacked",
  pieTooltip: "Pie",
  donutTooltip: "Donut",
  lineTooltip: "Line",
  groupedAreaTooltip: "Area",
  stackedAreaTooltip: "Stacked",
  normalizedAreaTooltip: "100% Stacked",
  scatterTooltip: "Scatter",
  bubbleTooltip: "Bubble",
  histogramTooltip: "Histogram",
  radialColumnTooltip: "Radial Column",
  radialBarTooltip: "Radial Bar",
  radarLineTooltip: "Radar Line",
  radarAreaTooltip: "Radar Area",
  nightingaleTooltip: "Nightingale",
  rangeBarTooltip: "Range Bar",
  rangeAreaTooltip: "Range Area",
  boxPlotTooltip: "Box Plot",
  treemapTooltip: "Treemap",
  sunburstTooltip: "Sunburst",
  heatmapTooltip: "Heatmap",
  waterfallTooltip: "Waterfall",
  columnLineComboTooltip: "Column & Line",
  areaColumnComboTooltip: "Area & Column",
  customComboTooltip: "Custom Combination",
  innerRadius: "Inner Radius",
  startAngle: "Start Angle",
  endAngle: "End Angle",
  reverseDirection: "Reverse Direction",
  groupPadding: "Group Padding",
  seriesPadding: "Series Padding",
  group: "Group",
  tile: "Tile",
  whisker: "Whisker",
  cap: "Cap",
  capLengthRatio: "Length Ratio",
  labelPlacement: "Placement",
  inside: "Inside",
  outside: "Outside",
  noDataToChart: "No data available to be charted.",
  pivotChartRequiresPivotMode: "Pivot Chart requires Pivot Mode enabled.",
  chartSettingsToolbarTooltip: "Menu",
  chartLinkToolbarTooltip: "Linked to Grid",
  chartUnlinkToolbarTooltip: "Unlinked from Grid",
  chartDownloadToolbarTooltip: "Download Chart",
  chartMenuToolbarTooltip: "Menu",
  chartEdit: "Edit Chart",
  chartAdvancedSettings: "Advanced Settings",
  chartLink: "Link to Grid",
  chartUnlink: "Unlink from Grid",
  chartDownload: "Download Chart",
  histogramFrequency: "Frequency",
  seriesChartType: "Series Chart Type",
  seriesType: "Series Type",
  secondaryAxis: "Secondary Axis",
  seriesAdd: "Add a series",
  categoryAdd: "Add a category",
  area: "Area",
  bar: "Bar",
  column: "Column",
  line: "Line",
  scatter: "Scatter",
  histogram: "Histogram",
  radialColumn: "Radial Column",
  radialBar: "Radial Bar",
  radarLine: "Radar Line",
  radarArea: "Radar Area",
  nightingale: "Nightingale",
  rangeBar: "Range Bar",
  rangeArea: "Range Area",
  treemap: "Treemap",
  sunburst: "Sunburst",
  waterfall: "Waterfall",
  boxPlot: "Box Plot",
  pie: "Pie",
  donut: "Donut",
  stackedArea: "StackedArea",
  groupedColumn: "Grouped Column",
  stackedColumn: "Stacked Column",
  advancedSettings: "Advanced Settings",
  ariaChartMenuClose: "Close Chart Edit Menu",
  timeFormatSlashesDDMMYYYY: "DD/MM/YYYY",
  timeFormatSlashesMMDDYYYY: "MM/DD/YYYY",
  timeFormatSlashesDDMMYY: "DD/MM/YY",
  timeFormatSlashesMMDDYY: "MM/DD/YY",
  timeFormatDotsDDMYY: "DD.M.YY",
  timeFormatDotsMDDYY: "M.DD.YY",
  timeFormatDashesYYYYMMDD: "YYYY-MM-DD",
  timeFormatSpacesDDMMMMYYYY: "DD MMMM YYYY",
  timeFormatHHMMSS: "HH:MM:SS",
  timeFormatHHMMSSAmPm: "HH:MM:SS AM/PM",
  sum: "Sum",
  first: "First",
  last: "Last",
  min: "Min",
  max: "Max",
  count: "Count",
  avg: "Average",
  direction: "Direction",
  horizontal: "Horizontal",
  vertical: "Vertical",
  seriesGroupType: "Group Type",
  groupedSeriesGroupType: "Grouped",
  stackedSeriesGroupType: "Stacked",
  normalizedSeriesGroupType: "100% Stacked"
};
ChartTranslationService = __decorateClass([
  (0, import_core58.Bean)("chartTranslationService")
], ChartTranslationService);

// enterprise-modules/charts/src/charts/chartComp/services/chartCrossFilterService.ts
var import_core59 = require("@ag-grid-community/core");
var ChartCrossFilterService = class extends import_core59.BeanStub {
  filter(event, reset = false) {
    const filterModel = this.gridApi.getFilterModel();
    if (reset) {
      this.resetFilters(filterModel);
      return;
    }
    let colId = ChartCrossFilterService.extractFilterColId(event);
    if (this.isValidColumnFilter(colId)) {
      this.updateFilters(filterModel, event, colId);
    } else {
      console.warn("AG Grid: cross filtering requires a 'agSetColumnFilter' or 'agMultiColumnFilter' to be defined on the column with id: '" + colId + "'");
    }
  }
  resetFilters(filterModel) {
    const filtersExist = Object.keys(filterModel).length > 0;
    if (filtersExist) {
      this.gridApi.setFilterModel(null);
      this.gridApi.onFilterChanged();
    }
  }
  updateFilters(filterModel, event, colId) {
    let dataKey = ChartCrossFilterService.extractFilterColId(event);
    let rawValue = event.datum[dataKey];
    if (rawValue === void 0) {
      return;
    }
    let selectedValue = rawValue.toString();
    if (event.event.metaKey || event.event.ctrlKey) {
      const existingGridValues = this.getCurrentGridValuesForCategory(colId);
      const valueAlreadyExists = import_core59._.includes(existingGridValues, selectedValue);
      let updatedValues;
      if (valueAlreadyExists) {
        updatedValues = existingGridValues.filter((v) => v !== selectedValue);
      } else {
        updatedValues = existingGridValues;
        updatedValues.push(selectedValue);
      }
      filterModel[colId] = this.getUpdatedFilterModel(colId, updatedValues);
    } else {
      const updatedValues = [selectedValue];
      filterModel = { [colId]: this.getUpdatedFilterModel(colId, updatedValues) };
    }
    this.gridApi.setFilterModel(filterModel);
  }
  getUpdatedFilterModel(colId, updatedValues) {
    let columnFilterType = this.getColumnFilterType(colId);
    if (columnFilterType === "agMultiColumnFilter") {
      return { filterType: "multi", filterModels: [null, { filterType: "set", values: updatedValues }] };
    }
    return { filterType: "set", values: updatedValues };
  }
  getCurrentGridValuesForCategory(colId) {
    let filteredValues = [];
    const column = this.getColumnById(colId);
    this.gridApi.forEachNodeAfterFilter((rowNode) => {
      if (column && !rowNode.group) {
        const value = this.valueService.getValue(column, rowNode) + "";
        if (!filteredValues.includes(value)) {
          filteredValues.push(value);
        }
      }
    });
    return filteredValues;
  }
  static extractFilterColId(event) {
    return event.xKey || event.calloutLabelKey;
  }
  isValidColumnFilter(colId) {
    if (colId.indexOf("-filtered-out")) {
      colId = colId.replace("-filtered-out", "");
    }
    let filterType = this.getColumnFilterType(colId);
    if (typeof filterType === "boolean") {
      return filterType;
    }
    return import_core59._.includes(["agSetColumnFilter", "agMultiColumnFilter"], filterType);
  }
  getColumnFilterType(colId) {
    let gridColumn = this.getColumnById(colId);
    if (gridColumn) {
      const colDef = gridColumn.getColDef();
      return colDef.filter;
    }
  }
  getColumnById(colId) {
    return this.columnModel.getGridColumn(colId);
  }
};
__decorateClass([
  (0, import_core59.Autowired)("gridApi")
], ChartCrossFilterService.prototype, "gridApi", 2);
__decorateClass([
  (0, import_core59.Autowired)("columnModel")
], ChartCrossFilterService.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core59.Autowired)("valueService")
], ChartCrossFilterService.prototype, "valueService", 2);
ChartCrossFilterService = __decorateClass([
  (0, import_core59.Bean)("chartCrossFilterService")
], ChartCrossFilterService);

// enterprise-modules/charts/src/utils/validGridChartsVersion.ts
var VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION = 28;
var VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION = 6;
function isValidVersion(version) {
  return version && version.match(/\d+\.\d+\.\d+/);
}
function isValidMajorVersion({ gridMajorVersion, chartsMajorVersion }) {
  const gridMajor = parseInt(gridMajorVersion, 10);
  const chartsMajor = parseInt(chartsMajorVersion, 10);
  const gridMajorDifference = gridMajor - VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION;
  const chartsMajorDifference = chartsMajor - VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION;
  const isFirstOrAfterVersion = gridMajorDifference >= 0;
  return gridMajorDifference === chartsMajorDifference && isFirstOrAfterVersion;
}
function gridChartVersion(gridVersion) {
  if (!gridVersion || !isValidVersion(gridVersion)) {
    return void 0;
  }
  const [gridMajor, gridMinor] = gridVersion.split(".") || [];
  const gridMajorMinor = `${gridMajor}.${gridMinor}.x`;
  const gridMajorNumber = parseInt(gridMajor, 10);
  const chartsMajor = gridMajorNumber - VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION + VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION;
  if (chartsMajor < 0) {
    return void 0;
  }
  const chartsMinor = gridMinor;
  const chartsMajorMinor = `${chartsMajor}.${chartsMinor}.x`;
  return {
    gridMajorMinor,
    chartsMajorMinor
  };
}
function validGridChartsVersionErrorMessage({ type, gridVersion, chartsVersion }) {
  const invalidMessage = "AG Grid: AG Grid version is incompatible. Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.";
  if (!gridVersion) {
    return invalidMessage;
  }
  const version = gridChartVersion(gridVersion);
  if (!version) {
    return invalidMessage;
  }
  const { gridMajorMinor, chartsMajorMinor } = version;
  if (type === "incompatible") {
    return `AG Grid version ${gridVersion} and AG Charts version ${chartsVersion} is not supported. AG Grid version ${gridMajorMinor} should be used with AG Chart ${chartsMajorMinor}. Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.`;
  } else if (type === "invalidCharts") {
    return `AG Grid version ${gridMajorMinor} should be used with AG Chart ${chartsMajorMinor}. Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.`;
  }
  return invalidMessage;
}
function validGridChartsVersion({ gridVersion, chartsVersion }) {
  if (!isValidVersion(chartsVersion)) {
    return {
      isValid: false,
      message: validGridChartsVersionErrorMessage({ type: "invalidCharts", gridVersion, chartsVersion })
    };
  }
  if (!isValidVersion(gridVersion)) {
    return {
      isValid: false,
      message: validGridChartsVersionErrorMessage({ type: "invalidGrid", gridVersion, chartsVersion })
    };
  }
  const [gridMajor, gridMinor] = gridVersion.split(".") || [];
  const [chartsMajor, chartsMinor, chartsPatch] = chartsVersion.split(".") || [];
  const isValidMajor = isValidMajorVersion({
    gridMajorVersion: gridMajor,
    chartsMajorVersion: chartsMajor
  });
  if (isValidMajor && gridMinor === chartsMinor || chartsPatch.includes("beta")) {
    return {
      isValid: true
    };
  } else if (!isValidMajor || gridMinor !== chartsMinor) {
    return {
      isValid: false,
      message: validGridChartsVersionErrorMessage({ type: "incompatible", gridVersion, chartsVersion })
    };
  }
  return {
    isValid: false,
    message: validGridChartsVersionErrorMessage({ type: "invalid", gridVersion, chartsVersion })
  };
}

// enterprise-modules/charts/src/charts/chartComp/menu/chartMenuList.ts
var import_core60 = require("@ag-grid-community/core");
var ChartMenuListFactory = class extends import_core60.BeanStub {
  showMenuList(params) {
    const { eventSource, showMenu, chartMenuContext } = params;
    const areChartToolPanelsEnabled = this.chartMenuService.doChartToolPanelsExist(chartMenuContext.chartController);
    const menuItems = this.mapWithStockItems(
      this.getMenuItems(chartMenuContext.chartController, areChartToolPanelsEnabled),
      chartMenuContext,
      showMenu,
      eventSource,
      areChartToolPanelsEnabled
    );
    if (!menuItems.length) {
      return;
    }
    const chartMenuList = this.createBean(new ChartMenuList(menuItems));
    this.activeChartMenuList = chartMenuList;
    let multiplier = -1;
    let alignSide = "left";
    if (this.gos.get("enableRtl")) {
      multiplier = 1;
      alignSide = "right";
    }
    const eGui = chartMenuList.getGui();
    this.popupService.addPopup({
      modal: true,
      eChild: eGui,
      closeOnEsc: true,
      closedCallback: () => {
        this.destroyBean(chartMenuList);
        this.activeChartMenuList = void 0;
        const eDocument = this.gos.getDocument();
        const activeEl = this.gos.getActiveDomElement();
        if (!activeEl || activeEl === eDocument.body) {
          eventSource.focus({ preventScroll: true });
        }
      },
      afterGuiAttached: (params2) => chartMenuList.afterGuiAttached(params2),
      positionCallback: () => {
        {
          this.popupService.positionPopupByComponent({
            type: "chartMenu",
            eventSource,
            ePopup: eGui,
            alignSide,
            nudgeX: 4 * multiplier,
            nudgeY: 4,
            position: "under",
            keepWithinBounds: true
          });
        }
      },
      ariaLabel: "Chart Menu"
    });
  }
  getMenuItems(chartController, areChartToolPanelsEnabled) {
    const defaultItems = [
      ...areChartToolPanelsEnabled ? ["chartEdit"] : [],
      ...chartController.isEnterprise() ? ["chartAdvancedSettings"] : [],
      chartController.isChartLinked() ? "chartUnlink" : "chartLink",
      "chartDownload"
    ];
    const chartMenuItems = this.gos.get("chartMenuItems");
    if (!chartMenuItems) {
      return defaultItems;
    } else if (Array.isArray(chartMenuItems)) {
      return chartMenuItems;
    } else {
      return chartMenuItems(this.gos.addGridCommonParams({
        defaultItems
      }));
    }
  }
  mapWithStockItems(originalList, chartMenuContext, showMenu, eventSource, areChartToolPanelsEnabled) {
    if (!originalList) {
      return [];
    }
    const resultList = [];
    originalList.forEach((menuItemOrString) => {
      let result;
      if (typeof menuItemOrString === "string") {
        result = this.getStockMenuItem(menuItemOrString, chartMenuContext, showMenu, eventSource, areChartToolPanelsEnabled);
      } else {
        result = __spreadValues({}, menuItemOrString);
      }
      if (!result) {
        return;
      }
      const { subMenu } = result;
      if (Array.isArray(subMenu)) {
        result.subMenu = this.mapWithStockItems(subMenu, chartMenuContext, showMenu, eventSource, areChartToolPanelsEnabled);
      }
      resultList.push(result);
    });
    return resultList;
  }
  getStockMenuItem(key, chartMenuContext, showMenu, eventSource, areChartToolPanelsEnabled) {
    switch (key) {
      case "chartEdit":
        return areChartToolPanelsEnabled ? this.createMenuItem(this.chartTranslationService.translate("chartEdit"), "chartsMenuEdit", showMenu) : null;
      case "chartAdvancedSettings":
        return this.createMenuItem(
          this.chartTranslationService.translate("chartAdvancedSettings"),
          "chartsMenuAdvancedSettings",
          () => this.chartMenuService.openAdvancedSettings(chartMenuContext, eventSource)
        );
      case "chartUnlink":
        return chartMenuContext.chartController.isChartLinked() ? this.createMenuItem(
          this.chartTranslationService.translate("chartUnlink"),
          "unlinked",
          () => this.chartMenuService.toggleLinked(chartMenuContext)
        ) : null;
      case "chartLink":
        return !chartMenuContext.chartController.isChartLinked() ? this.createMenuItem(
          this.chartTranslationService.translate("chartLink"),
          "linked",
          () => this.chartMenuService.toggleLinked(chartMenuContext)
        ) : null;
      case "chartDownload":
        return this.createMenuItem(
          this.chartTranslationService.translate("chartDownload"),
          "save",
          () => this.chartMenuService.downloadChart(chartMenuContext)
        );
    }
    return null;
  }
  createMenuItem(name, iconName, action) {
    return {
      name,
      icon: import_core60._.createIconNoSpan(iconName, this.gos, null),
      action
    };
  }
  destroy() {
    this.destroyBean(this.activeChartMenuList);
    super.destroy();
  }
};
__decorateClass([
  (0, import_core60.Autowired)("popupService")
], ChartMenuListFactory.prototype, "popupService", 2);
__decorateClass([
  (0, import_core60.Autowired)("chartMenuService")
], ChartMenuListFactory.prototype, "chartMenuService", 2);
__decorateClass([
  (0, import_core60.Autowired)("chartTranslationService")
], ChartMenuListFactory.prototype, "chartTranslationService", 2);
ChartMenuListFactory = __decorateClass([
  (0, import_core60.Bean)("chartMenuListFactory")
], ChartMenuListFactory);
var ChartMenuList = class extends import_core60.Component {
  constructor(menuItems) {
    super(
      /* html */
      `
            <div ref="eChartsMenu" role="presentation" class="ag-menu ag-chart-menu-popup"></div>
        `
    );
    this.menuItems = menuItems;
  }
  init() {
    this.mainMenuList = this.createManagedBean(new import_core60.AgMenuList(0));
    this.mainMenuList.addMenuItems(this.menuItems);
    this.mainMenuList.addEventListener(import_core60.AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
    this.eChartsMenu.appendChild(this.mainMenuList.getGui());
  }
  onHidePopup() {
    var _a;
    (_a = this.hidePopupFunc) == null ? void 0 : _a.call(this);
  }
  afterGuiAttached({ hidePopup }) {
    if (hidePopup) {
      this.hidePopupFunc = hidePopup;
      this.addDestroyFunc(hidePopup);
    }
    this.focusService.focusInto(this.mainMenuList.getGui());
  }
};
__decorateClass([
  (0, import_core60.Autowired)("focusService")
], ChartMenuList.prototype, "focusService", 2);
__decorateClass([
  (0, import_core60.RefSelector)("eChartsMenu")
], ChartMenuList.prototype, "eChartsMenu", 2);
__decorateClass([
  import_core60.PostConstruct
], ChartMenuList.prototype, "init", 1);

// enterprise-modules/charts/src/charts/chartComp/menu/advancedSettings/advancedSettingsMenuFactory.ts
var import_core66 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/advancedSettings/advancedSettingsPanel.ts
var import_core65 = require("@ag-grid-community/core");

// enterprise-modules/charts/src/charts/chartComp/menu/advancedSettings/interactivity/animationPanel.ts
var import_core61 = require("@ag-grid-community/core");
var _AnimationPanel = class _AnimationPanel extends import_core61.Component {
  constructor(chartMenuParamsFactory) {
    super();
    this.chartMenuParamsFactory = chartMenuParamsFactory;
  }
  init() {
    const animationGroupParams = this.chartMenuParamsFactory.addEnableParams(
      "animation.enabled",
      {
        cssIdentifier: "charts-advanced-settings-top-level",
        direction: "vertical",
        suppressOpenCloseIcons: true,
        title: this.chartTranslationService.translate("animation"),
        suppressEnabledCheckbox: true,
        useToggle: true
      }
    );
    const animationHeightInputParams = this.chartMenuParamsFactory.getDefaultNumberInputParams("animation.duration", "durationMillis", {
      min: 0
    });
    this.setTemplate(_AnimationPanel.TEMPLATE, {
      animationGroup: animationGroupParams,
      animationHeightInput: animationHeightInputParams
    });
  }
};
_AnimationPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="animationGroup">
                <ag-input-number-field ref="animationHeightInput"></ag-input>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core61.Autowired)("chartTranslationService")
], _AnimationPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core61.PostConstruct
], _AnimationPanel.prototype, "init", 1);
var AnimationPanel = _AnimationPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/advancedSettings/interactivity/crosshairPanel.ts
var import_core62 = require("@ag-grid-community/core");
var _CrosshairPanel = class _CrosshairPanel extends import_core62.Component {
  constructor(chartMenuParamsFactory) {
    super();
    this.chartMenuParamsFactory = chartMenuParamsFactory;
  }
  init() {
    const crosshairGroupParams = this.chartMenuParamsFactory.addEnableParams("crosshair.enabled", {
      cssIdentifier: "charts-advanced-settings-top-level",
      direction: "vertical",
      suppressOpenCloseIcons: true,
      title: this.chartTranslationService.translate("crosshair"),
      suppressEnabledCheckbox: true,
      useToggle: true
    });
    const crosshairLabelCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
      "crosshair.label.enabled",
      "crosshairLabel"
    );
    const crosshairSnapCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
      "crosshair.snap",
      "crosshairSnap"
    );
    const crosshairStrokeColorPickerParams = this.chartMenuParamsFactory.getDefaultColorPickerParams(
      "crosshair.stroke",
      "color"
    );
    this.setTemplate(_CrosshairPanel.TEMPLATE, {
      crosshairGroup: crosshairGroupParams,
      crosshairLabelCheckbox: crosshairLabelCheckboxParams,
      crosshairSnapCheckbox: crosshairSnapCheckboxParams,
      crosshairStrokeColorPicker: crosshairStrokeColorPickerParams
    });
  }
};
_CrosshairPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="crosshairGroup">
                <ag-checkbox ref="crosshairLabelCheckbox"></ag-checkbox>
                <ag-checkbox ref="crosshairSnapCheckbox"></ag-checkbox>
                <ag-color-picker ref="crosshairStrokeColorPicker"></ag-color-picker>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core62.Autowired)("chartTranslationService")
], _CrosshairPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core62.PostConstruct
], _CrosshairPanel.prototype, "init", 1);
var CrosshairPanel = _CrosshairPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/advancedSettings/interactivity/navigatorPanel.ts
var import_core63 = require("@ag-grid-community/core");
var _NavigatorPanel = class _NavigatorPanel extends import_core63.Component {
  constructor(chartMenuParamsFactory) {
    super();
    this.chartMenuParamsFactory = chartMenuParamsFactory;
  }
  init() {
    const navigatorGroupParams = this.chartMenuParamsFactory.addEnableParams(
      "navigator.enabled",
      {
        cssIdentifier: "charts-advanced-settings-top-level",
        direction: "vertical",
        suppressOpenCloseIcons: true,
        title: this.chartTranslationService.translate("navigator"),
        suppressEnabledCheckbox: true,
        useToggle: true
      }
    );
    const navigatorHeightSliderParams = this.chartMenuParamsFactory.getDefaultSliderParams("navigator.height", "height", 60);
    navigatorHeightSliderParams.minValue = 10;
    const navigatorMiniChartCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams("navigator.miniChart.enabled", "miniChart");
    this.setTemplate(_NavigatorPanel.TEMPLATE, {
      navigatorGroup: navigatorGroupParams,
      navigatorHeightSlider: navigatorHeightSliderParams,
      navigatorMiniChartCheckbox: navigatorMiniChartCheckboxParams
    });
  }
};
_NavigatorPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="navigatorGroup">
                <ag-slider ref="navigatorHeightSlider"></ag-slider>
                <ag-checkbox ref="navigatorMiniChartCheckbox"></ag-checkbox>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core63.Autowired)("chartTranslationService")
], _NavigatorPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  import_core63.PostConstruct
], _NavigatorPanel.prototype, "init", 1);
var NavigatorPanel = _NavigatorPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/advancedSettings/interactivity/zoomPanel.ts
var import_core64 = require("@ag-grid-community/core");
var _ZoomPanel = class _ZoomPanel extends import_core64.Component {
  constructor(chartMenuParamsFactory) {
    super();
    this.chartMenuParamsFactory = chartMenuParamsFactory;
  }
  init() {
    const zoomGroupParams = this.chartMenuParamsFactory.addEnableParams("zoom.enabled", {
      cssIdentifier: "charts-advanced-settings-top-level",
      direction: "vertical",
      suppressOpenCloseIcons: true,
      title: this.chartTranslationService.translate("zoom"),
      suppressEnabledCheckbox: true,
      useToggle: true
    });
    const zoomScrollingCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
      "zoom.enableScrolling",
      "scrollingZoom"
    );
    const zoomScrollingStepSliderParams = this.chartMenuParamsFactory.getDefaultSliderParams(
      "zoom.scrollingStep",
      "scrollingStep",
      1
    );
    zoomScrollingStepSliderParams.step = 0.01;
    zoomScrollingStepSliderParams.minValue = zoomScrollingStepSliderParams.step;
    const zoomSelectingCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
      "zoom.enableSelecting",
      "selectingZoom"
    );
    zoomScrollingCheckboxParams.onValueChange = /* @__PURE__ */ ((onValueChange) => (value) => {
      if (!onValueChange)
        return;
      onValueChange(value);
      this.zoomScrollingStepInput.setDisabled(!value);
    })(zoomScrollingCheckboxParams.onValueChange);
    this.setTemplate(_ZoomPanel.TEMPLATE, {
      zoomGroup: zoomGroupParams,
      zoomScrollingCheckbox: zoomScrollingCheckboxParams,
      zoomScrollingStepInput: zoomScrollingStepSliderParams,
      zoomSelectingCheckbox: zoomSelectingCheckboxParams
    });
    this.zoomScrollingStepInput.setDisabled(!zoomScrollingCheckboxParams.value);
  }
};
_ZoomPanel.TEMPLATE = /* html */
`<div>
            <ag-group-component ref="zoomGroup">
                <ag-checkbox ref="zoomSelectingCheckbox"></ag-checkbox>
                <ag-checkbox ref="zoomScrollingCheckbox"></ag-checkbox>
                <ag-slider ref="zoomScrollingStepInput"></ag-slider>
            </ag-group-component>
        </div>`;
__decorateClass([
  (0, import_core64.Autowired)("chartTranslationService")
], _ZoomPanel.prototype, "chartTranslationService", 2);
__decorateClass([
  (0, import_core64.RefSelector)("zoomScrollingStepInput")
], _ZoomPanel.prototype, "zoomScrollingStepInput", 2);
__decorateClass([
  import_core64.PostConstruct
], _ZoomPanel.prototype, "init", 1);
var ZoomPanel = _ZoomPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/advancedSettings/advancedSettingsPanel.ts
var INTERACTIVITY_GROUPS = ["navigator", "zoom", "animation", "crosshair"];
var _AdvancedSettingsPanel = class _AdvancedSettingsPanel extends import_core65.Component {
  constructor(chartMenuContext) {
    super(_AdvancedSettingsPanel.TEMPLATE);
    this.chartMenuContext = chartMenuContext;
  }
  postConstruct() {
    this.chartPanelFeature = this.createManagedBean(new ChartPanelFeature(
      this.chartMenuContext.chartController,
      this.getGui(),
      "ag-chart-advanced-settings-section",
      (chartType, seriesType) => this.createPanels(chartType, seriesType)
    ));
    this.chartPanelFeature.refreshPanels();
  }
  createPanels(chartType, seriesType) {
    INTERACTIVITY_GROUPS.forEach((group) => {
      if (!this.isGroupPanelShownForSeries(group, seriesType)) {
        return;
      }
      const comp = this.createPanel(group);
      this.chartPanelFeature.addComponent(comp);
    });
  }
  isGroupPanelShownForSeries(group, seriesType) {
    return group === "animation" || isCartesian(seriesType);
  }
  createPanel(group) {
    const { chartMenuParamsFactory, chartAxisMenuParamsFactory } = this.chartMenuContext;
    switch (group) {
      case "navigator":
        return new NavigatorPanel(chartMenuParamsFactory);
      case "zoom":
        return new ZoomPanel(chartMenuParamsFactory);
      case "animation":
        return new AnimationPanel(chartMenuParamsFactory);
      case "crosshair":
        return new CrosshairPanel(chartAxisMenuParamsFactory);
    }
  }
};
_AdvancedSettingsPanel.TEMPLATE = /* html */
`<div class="ag-chart-advanced-settings-wrapper"></div>`;
__decorateClass([
  import_core65.PostConstruct
], _AdvancedSettingsPanel.prototype, "postConstruct", 1);
var AdvancedSettingsPanel = _AdvancedSettingsPanel;

// enterprise-modules/charts/src/charts/chartComp/menu/advancedSettings/advancedSettingsMenuFactory.ts
var AdvancedSettingsMenuFactory = class extends import_core66.BeanStub {
  showMenu(chartMenuContext, eventSource) {
    this.hideMenu();
    const menu = this.createBean(new AdvancedSettingsMenu(chartMenuContext));
    this.activeDialog = this.createBean(new import_core66.AgDialog({
      title: this.chartTranslationService.translate("advancedSettings"),
      component: menu,
      width: 300,
      height: 400,
      resizable: true,
      movable: true,
      centered: true,
      closable: true,
      afterGuiAttached: () => {
        var _a;
        (_a = this.focusService.findFocusableElements(menu.getGui())[0]) == null ? void 0 : _a.focus();
      },
      closedCallback: () => {
        this.activeMenu = this.destroyBean(this.activeMenu);
        this.activeDialog = void 0;
        eventSource == null ? void 0 : eventSource.focus({ preventScroll: true });
      }
    }));
    this.activeMenu = menu;
  }
  hideMenu() {
    if (this.activeDialog) {
      this.destroyBean(this.activeDialog);
    }
  }
  destroy() {
    this.activeMenu = this.destroyBean(this.activeMenu);
    this.activeDialog = this.destroyBean(this.activeDialog);
    super.destroy();
  }
};
__decorateClass([
  (0, import_core66.Autowired)("focusService")
], AdvancedSettingsMenuFactory.prototype, "focusService", 2);
__decorateClass([
  (0, import_core66.Autowired)("chartTranslationService")
], AdvancedSettingsMenuFactory.prototype, "chartTranslationService", 2);
AdvancedSettingsMenuFactory = __decorateClass([
  (0, import_core66.Bean)("advancedSettingsMenuFactory")
], AdvancedSettingsMenuFactory);
var _AdvancedSettingsMenu = class _AdvancedSettingsMenu extends import_core66.TabGuardComp {
  constructor(chartMenuContext) {
    super(_AdvancedSettingsMenu.TEMPLATE);
    this.chartMenuContext = chartMenuContext;
  }
  postConstruct() {
    this.advancedSettingsPanel = this.createManagedBean(new AdvancedSettingsPanel(this.chartMenuContext));
    this.getGui().appendChild(this.advancedSettingsPanel.getGui());
    this.initialiseTabGuard({
      onTabKeyDown: this.onTabKeyDown.bind(this),
      focusTrapActive: true
    });
  }
  onTabKeyDown(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const backwards = e.shiftKey;
    const panelGui = this.advancedSettingsPanel.getGui();
    const nextEl = this.focusService.findNextFocusableElement(panelGui, false, backwards);
    if (nextEl) {
      nextEl.focus();
    } else {
      const focusableElements = this.focusService.findFocusableElements(panelGui);
      if (focusableElements.length) {
        focusableElements[backwards ? focusableElements.length - 1 : 0].focus();
      }
    }
  }
};
_AdvancedSettingsMenu.TEMPLATE = /* html */
`<div class="ag-chart-advanced-settings"></div>`;
__decorateClass([
  (0, import_core66.Autowired)("focusService")
], _AdvancedSettingsMenu.prototype, "focusService", 2);
__decorateClass([
  import_core66.PostConstruct
], _AdvancedSettingsMenu.prototype, "postConstruct", 1);
var AdvancedSettingsMenu = _AdvancedSettingsMenu;

// enterprise-modules/charts/src/gridChartsModule.ts
var GridChartsModule = {
  version: VERSION,
  validate: () => {
    return validGridChartsVersion({
      gridVersion: VERSION,
      chartsVersion: ChartService.CHARTS_VERSION
    });
  },
  moduleName: import_core67.ModuleNames.GridChartsModule,
  beans: [
    ChartService,
    ChartTranslationService,
    ChartCrossFilterService,
    ChartMenuListFactory,
    ChartMenuService,
    AdvancedSettingsMenuFactory
  ],
  agStackComponents: [
    { componentName: "AgColorPicker", componentClass: AgColorPicker },
    { componentName: "AgAngleSelect", componentClass: AgAngleSelect },
    { componentName: "AgPillSelect", componentClass: AgPillSelect }
  ],
  dependantModules: [
    import_range_selection.RangeSelectionModule,
    import_core68.EnterpriseCoreModule
  ]
};

// enterprise-modules/charts/src/agGridCoreExtension.ts
var __FORCE_MODULE_DETECTION_AG_GRID_CORE_EXT = 0;

// enterprise-modules/charts/src/main.ts
var import_ag_charts_community33 = require("ag-charts-community");
__reExport(main_exports, require("ag-charts-community"), module.exports);
var agCharts = {
  time: import_ag_charts_community33.time,
  AgChart: import_ag_charts_community33.AgChart
};
