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
exports.ChartDataModel = void 0;
var core_1 = require("@ag-grid-community/core");
var chartDatasource_1 = require("./chartDatasource");
var ChartDataModel = /** @class */ (function (_super) {
    __extends(ChartDataModel, _super);
    function ChartDataModel(params) {
        var _this = _super.call(this) || this;
        _this.unlinked = false;
        _this.chartData = [];
        _this.valueColState = [];
        _this.dimensionColState = [];
        _this.columnNames = {};
        _this.grouping = false;
        _this.crossFiltering = false;
        // this control flag is used to only log warning for the initial user config
        _this.suppressComboChartWarnings = false;
        _this.chartId = params.chartId;
        _this.chartType = params.chartType;
        _this.pivotChart = params.pivotChart;
        _this.chartThemeName = params.chartThemeName;
        _this.aggFunc = params.aggFunc;
        _this.referenceCellRange = params.cellRange;
        _this.suppliedCellRange = params.cellRange;
        _this.suppressChartRanges = params.suppressChartRanges;
        _this.unlinked = !!params.unlinkChart;
        _this.crossFiltering = !!params.crossFiltering;
        _this.seriesChartTypes = params.seriesChartTypes || [];
        _this.initComboCharts(params);
        return _this;
    }
    ChartDataModel.prototype.initComboCharts = function (params) {
        var seriesChartTypesExist = this.seriesChartTypes && this.seriesChartTypes.length > 0;
        var customCombo = params.chartType === 'customCombo' || seriesChartTypesExist;
        if (customCombo) {
            // it is not necessary to supply a chart type for combo charts when `seriesChartTypes` is supplied
            this.chartType = 'customCombo';
            // cache supplied `seriesChartTypes` to allow switching between different chart types in the settings panel
            this.savedCustomSeriesChartTypes = this.seriesChartTypes || [];
        }
    };
    ChartDataModel.prototype.init = function () {
        this.datasource = this.createManagedBean(new chartDatasource_1.ChartDatasource());
        this.updateCellRanges();
    };
    ChartDataModel.prototype.updateCellRanges = function (updatedColState) {
        if (this.valueCellRange) {
            this.referenceCellRange = this.valueCellRange;
        }
        var _a = this.getAllChartColumns(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
        var allColsFromRanges = this.getAllColumnsFromRanges();
        if (updatedColState) {
            this.updateColumnState(updatedColState);
        }
        this.setDimensionCellRange(dimensionCols, allColsFromRanges, updatedColState);
        this.setValueCellRange(valueCols, allColsFromRanges, updatedColState);
        if (!updatedColState) {
            this.resetColumnState();
            // dimension / category cell range could be out of sync after resetting column state when row grouping
            this.syncDimensionCellRange();
        }
        this.updateSeriesChartTypes();
        this.updateData();
    };
    ChartDataModel.prototype.updateSeriesChartTypes = function () {
        if (!this.isComboChart()) {
            return;
        }
        // ensure primary only chart types are not placed on secondary axis
        this.seriesChartTypes = this.seriesChartTypes.map(function (seriesChartType) {
            var primaryOnly = ['groupedColumn', 'stackedColumn', 'stackedArea'].includes(seriesChartType.chartType);
            seriesChartType.secondaryAxis = primaryOnly ? false : seriesChartType.secondaryAxis;
            return seriesChartType;
        });
        // note that when seriesChartTypes are supplied the chart type is also changed to 'customCombo'
        if (this.chartType === 'customCombo') {
            this.updateSeriesChartTypesForCustomCombo();
            return;
        }
        this.updateChartSeriesTypesForBuiltInCombos();
    };
    ChartDataModel.prototype.updateSeriesChartTypesForCustomCombo = function () {
        var _this = this;
        var seriesChartTypesSupplied = this.seriesChartTypes && this.seriesChartTypes.length > 0;
        if (!seriesChartTypesSupplied && !this.suppressComboChartWarnings) {
            console.warn("AG Grid: 'seriesChartTypes' are required when the 'customCombo' chart type is specified.");
        }
        // ensure correct chartTypes are supplied
        this.seriesChartTypes = this.seriesChartTypes.map(function (s) {
            if (!ChartDataModel.SUPPORTED_COMBO_CHART_TYPES.includes(s.chartType)) {
                console.warn("AG Grid: invalid chartType '" + s.chartType + "' supplied in 'seriesChartTypes', converting to 'line' instead.");
                s.chartType = 'line';
            }
            return s;
        });
        var getSeriesChartType = function (valueCol) {
            if (!_this.savedCustomSeriesChartTypes || _this.savedCustomSeriesChartTypes.length === 0) {
                _this.savedCustomSeriesChartTypes = _this.seriesChartTypes;
            }
            var providedSeriesChartType = _this.savedCustomSeriesChartTypes.find(function (s) { return s.colId === valueCol.colId; });
            if (!providedSeriesChartType) {
                if (valueCol.selected && !_this.suppressComboChartWarnings) {
                    console.warn("AG Grid: no 'seriesChartType' found for colId = '" + valueCol.colId + "', defaulting to 'line'.");
                }
                return {
                    colId: valueCol.colId,
                    chartType: 'line',
                    secondaryAxis: false
                };
            }
            return providedSeriesChartType;
        };
        var updatedSeriesChartTypes = this.valueColState.map(getSeriesChartType);
        this.seriesChartTypes = updatedSeriesChartTypes;
        // also cache custom `seriesChartTypes` to allow for switching between different chart types
        this.savedCustomSeriesChartTypes = updatedSeriesChartTypes;
        // turn off warnings as first combo chart attempt has completed
        this.suppressComboChartWarnings = true;
    };
    ChartDataModel.prototype.updateChartSeriesTypesForBuiltInCombos = function () {
        var primaryChartType = this.chartType === 'columnLineCombo' ? 'groupedColumn' : 'stackedArea';
        var secondaryChartType = this.chartType === 'columnLineCombo' ? 'line' : 'groupedColumn';
        var selectedCols = this.valueColState.filter(function (cs) { return cs.selected; });
        var lineIndex = Math.ceil(selectedCols.length / 2);
        this.seriesChartTypes = selectedCols.map(function (valueCol, i) {
            var seriesType = (i >= lineIndex) ? secondaryChartType : primaryChartType;
            return { colId: valueCol.colId, chartType: seriesType, secondaryAxis: false };
        });
    };
    ChartDataModel.prototype.updateData = function () {
        var _a = this.getRowIndexes(), startRow = _a.startRow, endRow = _a.endRow;
        if (this.pivotChart) {
            this.resetColumnState();
        }
        this.grouping = this.isGrouping();
        var params = {
            aggFunc: this.aggFunc,
            dimensionCols: [this.getSelectedDimension()],
            grouping: this.grouping,
            pivoting: this.isPivotActive(),
            crossFiltering: this.crossFiltering,
            valueCols: this.getSelectedValueCols(),
            startRow: startRow,
            endRow: endRow,
            isScatter: core_1._.includes(['scatter', 'bubble'], this.chartType)
        };
        var _b = this.datasource.getData(params), chartData = _b.chartData, columnNames = _b.columnNames;
        this.chartData = chartData;
        this.columnNames = columnNames;
    };
    ChartDataModel.prototype.isGrouping = function () {
        var usingTreeData = this.gridOptionsService.isTreeData();
        var groupedCols = usingTreeData ? null : this.columnModel.getRowGroupColumns();
        var isGroupActive = usingTreeData || (groupedCols && groupedCols.length > 0);
        // charts only group when the selected category is a group column
        var colId = this.getSelectedDimension().colId;
        var displayedGroupCols = this.columnModel.getGroupDisplayColumns();
        var groupDimensionSelected = displayedGroupCols.map(function (col) { return col.getColId(); }).some(function (id) { return id === colId; });
        return !!isGroupActive && groupDimensionSelected;
    };
    ChartDataModel.prototype.getSelectedValueCols = function () {
        return this.valueColState.filter(function (cs) { return cs.selected; }).map(function (cs) { return cs.column; });
    };
    ChartDataModel.prototype.getSelectedDimension = function () {
        return this.dimensionColState.filter(function (cs) { return cs.selected; })[0];
    };
    ChartDataModel.prototype.getColDisplayName = function (col) {
        return this.columnModel.getDisplayNameForColumn(col, 'chart');
    };
    ChartDataModel.prototype.isPivotMode = function () {
        return this.columnModel.isPivotMode();
    };
    ChartDataModel.prototype.getChartDataType = function (colId) {
        var column = this.columnModel.getPrimaryColumn(colId);
        return column ? column.getColDef().chartDataType : undefined;
    };
    ChartDataModel.prototype.isPivotActive = function () {
        return this.columnModel.isPivotActive();
    };
    ChartDataModel.prototype.createCellRange = function (type) {
        var columns = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            columns[_i - 1] = arguments[_i];
        }
        return {
            id: this.chartId,
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns: columns,
            startColumn: type === core_1.CellRangeType.DIMENSION ? columns[0] : this.referenceCellRange.startColumn,
            type: type
        };
    };
    ChartDataModel.prototype.getAllColumnsFromRanges = function () {
        if (this.pivotChart) {
            return core_1._.convertToSet(this.columnModel.getAllDisplayedColumns());
        }
        var columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;
        if (this.dimensionCellRange) {
            columns.push.apply(columns, __spread(this.dimensionCellRange.columns));
        }
        if (this.valueCellRange) {
            columns.push.apply(columns, __spread(this.valueCellRange.columns));
        }
        return core_1._.convertToSet(columns);
    };
    ChartDataModel.prototype.getRowIndexes = function () {
        var startRow = 0, endRow = 0;
        var rangeService = this.rangeService;
        var range = this.valueCellRange;
        if (rangeService && range) {
            startRow = rangeService.getRangeStartRow(range).rowIndex;
            // when the last row the cell range is a pinned 'bottom' row, the `endRow` index is set to -1 which results
            // in the ChartDatasource processing all non pinned rows from the `startRow` index.
            var endRowPosition = rangeService.getRangeEndRow(range);
            endRow = endRowPosition.rowPinned === 'bottom' ? -1 : endRowPosition.rowIndex;
        }
        return { startRow: startRow, endRow: endRow };
    };
    ChartDataModel.prototype.getAllChartColumns = function () {
        var _this = this;
        var displayedCols = this.columnModel.getAllDisplayedColumns();
        var dimensionCols = new Set();
        var valueCols = new Set();
        displayedCols.forEach(function (col) {
            var colDef = col.getColDef();
            var chartDataType = colDef.chartDataType;
            if (chartDataType) {
                // chart data type was specified explicitly
                switch (chartDataType) {
                    case 'category':
                    case 'time':
                        dimensionCols.add(col);
                        return;
                    case 'series':
                        valueCols.add(col);
                        return;
                    case 'excluded':
                        return;
                    default:
                        console.warn("AG Grid: unexpected chartDataType value '" + chartDataType + "' supplied, instead use 'category', 'series' or 'excluded'");
                        break;
                }
            }
            if (colDef.colId === 'ag-Grid-AutoColumn') {
                dimensionCols.add(col);
                return;
            }
            if (!col.isPrimary()) {
                valueCols.add(col);
                return;
            }
            // if 'chartDataType' is not provided then infer type based data contained in first row
            (_this.isNumberCol(col) ? valueCols : dimensionCols).add(col);
        });
        return { dimensionCols: dimensionCols, valueCols: valueCols };
    };
    ChartDataModel.prototype.isNumberCol = function (col) {
        if (col.getColId() === 'ag-Grid-AutoColumn') {
            return false;
        }
        var row = this.rowRenderer.getRowNode({ rowIndex: 0, rowPinned: null });
        if (!row) {
            return false;
        }
        var cellValue = this.valueService.getValue(col, row);
        if (cellValue == null) {
            cellValue = this.extractLeafData(row, col);
        }
        if (cellValue != null && typeof cellValue.toNumber === 'function') {
            cellValue = cellValue.toNumber();
        }
        return typeof cellValue === 'number';
    };
    ChartDataModel.prototype.extractLeafData = function (row, col) {
        if (!row.allLeafChildren) {
            return null;
        }
        for (var i = 0; i < row.allLeafChildren.length; i++) {
            var childRow = row.allLeafChildren[i];
            var value = this.valueService.getValue(col, childRow);
            if (value != null) {
                return value;
            }
        }
        return null;
    };
    ChartDataModel.prototype.resetColumnState = function () {
        var _this = this;
        var _a = this.getAllChartColumns(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
        var allCols = this.getAllColumnsFromRanges();
        var isInitialising = this.valueColState.length < 1;
        this.dimensionColState = [];
        this.valueColState = [];
        var hasSelectedDimension = false;
        var order = 1;
        var aggFuncDimension = this.suppliedCellRange.columns[0]; //TODO
        dimensionCols.forEach(function (column) {
            var isAutoGroupCol = column.getColId() === 'ag-Grid-AutoColumn';
            var selected = false;
            if (_this.crossFiltering && _this.aggFunc) {
                if (aggFuncDimension.getColId() === column.getColId()) {
                    selected = true;
                }
            }
            else {
                selected = isAutoGroupCol ? true : !hasSelectedDimension && allCols.has(column);
            }
            _this.dimensionColState.push({
                column: column,
                colId: column.getColId(),
                displayName: _this.getColDisplayName(column),
                selected: selected,
                order: order++
            });
            if (selected) {
                hasSelectedDimension = true;
            }
        });
        var defaultCategory = {
            colId: ChartDataModel.DEFAULT_CATEGORY,
            displayName: this.chartTranslationService.translate('defaultCategory'),
            selected: !hasSelectedDimension,
            order: 0
        };
        this.dimensionColState.unshift(defaultCategory);
        var valueColumnsFromReferenceRange = this.referenceCellRange.columns.filter(function (c) { return valueCols.has(c); });
        valueCols.forEach(function (column) {
            // first time the value cell range is set, preserve the column order from the supplied range
            if (isInitialising && core_1._.includes(_this.referenceCellRange.columns, column)) {
                column = valueColumnsFromReferenceRange.shift();
            }
            _this.valueColState.push({
                column: column,
                colId: column.getColId(),
                displayName: _this.getColDisplayName(column),
                selected: allCols.has(column),
                order: order++
            });
        });
    };
    ChartDataModel.prototype.updateColumnState = function (updatedCol) {
        var idsMatch = function (cs) { return cs.colId === updatedCol.colId; };
        var _a = this, dimensionColState = _a.dimensionColState, valueColState = _a.valueColState;
        if (dimensionColState.filter(idsMatch).length > 0) {
            // only one dimension should be selected
            dimensionColState.forEach(function (cs) { return cs.selected = idsMatch(cs); });
        }
        else {
            // just update the selected value on the supplied value column
            valueColState.filter(idsMatch).forEach(function (cs) { return cs.selected = updatedCol.selected; });
        }
        var allColumns = __spread(dimensionColState, valueColState);
        var orderedColIds = [];
        // calculate new order
        allColumns.forEach(function (col, i) {
            if (i === updatedCol.order) {
                orderedColIds.push(updatedCol.colId);
            }
            if (col.colId !== updatedCol.colId) {
                orderedColIds.push(col.colId);
            }
        });
        // update col state with new order
        allColumns.forEach(function (col) {
            var order = orderedColIds.indexOf(col.colId);
            col.order = order >= 0 ? orderedColIds.indexOf(col.colId) : allColumns.length - 1;
        });
        this.reorderColState();
    };
    ChartDataModel.prototype.reorderColState = function () {
        var ascColStateOrder = function (a, b) { return a.order - b.order; };
        this.dimensionColState.sort(ascColStateOrder);
        this.valueColState.sort(ascColStateOrder);
    };
    ChartDataModel.prototype.setDimensionCellRange = function (dimensionCols, colsInRange, updatedColState) {
        var _this = this;
        this.dimensionCellRange = undefined;
        if (!updatedColState && !this.dimensionColState.length) {
            // use first dimension column in range by default
            dimensionCols.forEach(function (col) {
                if (_this.dimensionCellRange || !colsInRange.has(col)) {
                    return;
                }
                _this.dimensionCellRange = _this.createCellRange(core_1.CellRangeType.DIMENSION, col);
            });
            return;
        }
        var selectedDimensionColState = updatedColState;
        if (this.crossFiltering && this.aggFunc) {
            var aggFuncDimension_1 = this.suppliedCellRange.columns[0]; //TODO
            selectedDimensionColState = this.dimensionColState.filter(function (cs) { return cs.colId === aggFuncDimension_1.getColId(); })[0];
        }
        else if (!selectedDimensionColState || !dimensionCols.has(selectedDimensionColState.column)) {
            selectedDimensionColState = this.dimensionColState.filter(function (cs) { return cs.selected; })[0];
        }
        if (selectedDimensionColState && selectedDimensionColState.colId !== ChartDataModel.DEFAULT_CATEGORY) {
            this.dimensionCellRange = this.createCellRange(core_1.CellRangeType.DIMENSION, selectedDimensionColState.column);
        }
    };
    ChartDataModel.prototype.setValueCellRange = function (valueCols, colsInRange, updatedColState) {
        this.valueCellRange = undefined;
        var selectedValueCols = [];
        valueCols.forEach(function (col) {
            if (updatedColState && updatedColState.colId === col.getColId()) {
                if (updatedColState.selected) {
                    selectedValueCols.push(updatedColState.column);
                }
            }
            else if (colsInRange.has(col)) {
                selectedValueCols.push(col);
            }
        });
        if (selectedValueCols.length > 0) {
            var orderedColIds_1 = [];
            if (this.valueColState.length > 0) {
                orderedColIds_1 = this.valueColState.map(function (c) { return c.colId; });
            }
            else {
                colsInRange.forEach(function (c) { return orderedColIds_1.push(c.getColId()); });
            }
            selectedValueCols.sort(function (a, b) { return orderedColIds_1.indexOf(a.getColId()) - orderedColIds_1.indexOf(b.getColId()); });
            this.valueCellRange = this.createCellRange.apply(this, __spread([core_1.CellRangeType.VALUE], selectedValueCols));
        }
    };
    ChartDataModel.prototype.syncDimensionCellRange = function () {
        var selectedDimension = this.getSelectedDimension();
        if (selectedDimension && selectedDimension.column) {
            this.dimensionCellRange = this.createCellRange(core_1.CellRangeType.DIMENSION, selectedDimension.column);
        }
    };
    ChartDataModel.prototype.isComboChart = function () {
        return ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(this.chartType);
    };
    ChartDataModel.DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';
    ChartDataModel.SUPPORTED_COMBO_CHART_TYPES = ['line', 'groupedColumn', 'stackedColumn', 'area', 'stackedArea'];
    __decorate([
        core_1.Autowired('columnModel')
    ], ChartDataModel.prototype, "columnModel", void 0);
    __decorate([
        core_1.Autowired('valueService')
    ], ChartDataModel.prototype, "valueService", void 0);
    __decorate([
        core_1.Autowired('rangeService')
    ], ChartDataModel.prototype, "rangeService", void 0);
    __decorate([
        core_1.Autowired('rowRenderer')
    ], ChartDataModel.prototype, "rowRenderer", void 0);
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], ChartDataModel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], ChartDataModel.prototype, "init", null);
    return ChartDataModel;
}(core_1.BeanStub));
exports.ChartDataModel = ChartDataModel;
