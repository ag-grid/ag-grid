var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { _, Autowired, BeanStub, CellRangeType, PostConstruct, } from "@ag-grid-community/core";
import { ChartDatasource } from "../datasource/chartDatasource";
import { ChartColumnService } from "../services/chartColumnService";
import { ComboChartModel } from "./comboChartModel";
import { isHierarchical } from "../utils/seriesTypeMapper";
var ChartDataModel = /** @class */ (function (_super) {
    __extends(ChartDataModel, _super);
    function ChartDataModel(params) {
        var _this = _super.call(this) || this;
        _this.unlinked = false;
        _this.chartData = [];
        _this.valueColState = [];
        _this.dimensionColState = [];
        _this.columnNames = {};
        _this.crossFiltering = false;
        _this.grouping = false;
        _this.params = params;
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
        return _this;
    }
    ChartDataModel.prototype.init = function () {
        this.datasource = this.createManagedBean(new ChartDatasource());
        this.chartColumnService = this.createManagedBean(new ChartColumnService());
        this.comboChartModel = this.createManagedBean(new ComboChartModel(this));
        this.updateCellRanges();
        this.updateData();
    };
    ChartDataModel.prototype.updateModel = function (params) {
        var cellRange = params.cellRange, chartType = params.chartType, pivotChart = params.pivotChart, chartThemeName = params.chartThemeName, aggFunc = params.aggFunc, suppressChartRanges = params.suppressChartRanges, unlinkChart = params.unlinkChart, crossFiltering = params.crossFiltering, seriesChartTypes = params.seriesChartTypes;
        if (cellRange !== this.suppliedCellRange) {
            this.dimensionCellRange = undefined;
            this.valueCellRange = undefined;
        }
        this.chartType = chartType;
        this.pivotChart = pivotChart;
        this.chartThemeName = chartThemeName;
        this.aggFunc = aggFunc;
        this.referenceCellRange = cellRange;
        this.suppliedCellRange = cellRange;
        this.suppressChartRanges = suppressChartRanges;
        this.unlinked = !!unlinkChart;
        this.crossFiltering = !!crossFiltering;
        this.updateSelectedDimensions(cellRange === null || cellRange === void 0 ? void 0 : cellRange.columns);
        this.updateCellRanges();
        var shouldUpdateComboModel = this.isComboChart() || seriesChartTypes;
        if (shouldUpdateComboModel) {
            this.comboChartModel.update(seriesChartTypes);
        }
        if (!this.unlinked) {
            this.updateData();
        }
    };
    ChartDataModel.prototype.updateCellRanges = function (updatedColState) {
        if (this.valueCellRange) {
            this.referenceCellRange = this.valueCellRange;
        }
        var _a = this.chartColumnService.getChartColumns(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
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
        this.comboChartModel.updateSeriesChartTypes();
    };
    ChartDataModel.prototype.updateData = function () {
        var _a = this.getRowIndexes(), startRow = _a.startRow, endRow = _a.endRow;
        if (this.pivotChart) {
            this.resetColumnState();
        }
        this.grouping = this.isGrouping();
        var params = {
            aggFunc: this.aggFunc,
            dimensionCols: this.getSelectedDimensions(),
            grouping: this.grouping,
            pivoting: this.isPivotActive(),
            crossFiltering: this.crossFiltering,
            valueCols: this.getSelectedValueCols(),
            startRow: startRow,
            endRow: endRow,
            isScatter: _.includes(['scatter', 'bubble'], this.chartType)
        };
        var _b = this.datasource.getData(params), chartData = _b.chartData, columnNames = _b.columnNames;
        this.chartData = chartData;
        this.columnNames = columnNames;
    };
    ChartDataModel.prototype.isGrouping = function () {
        var usingTreeData = this.gridOptionsService.get('treeData');
        var groupedCols = usingTreeData ? null : this.chartColumnService.getRowGroupColumns();
        var isGroupActive = usingTreeData || (groupedCols && groupedCols.length > 0);
        // charts only group when the selected category is a group column
        var colIds = this.getSelectedDimensions().map(function (_a) {
            var colId = _a.colId;
            return colId;
        });
        var displayedGroupCols = this.chartColumnService.getGroupDisplayColumns();
        var groupDimensionSelected = displayedGroupCols.map(function (col) { return col.getColId(); }).some(function (id) { return colIds.includes(id); });
        return !!isGroupActive && groupDimensionSelected;
    };
    ChartDataModel.prototype.getSelectedValueCols = function () {
        return this.valueColState.filter(function (cs) { return cs.selected; }).map(function (cs) { return cs.column; });
    };
    ChartDataModel.prototype.getSelectedDimensions = function () {
        return this.dimensionColState.filter(function (cs) { return cs.selected; });
    };
    ChartDataModel.prototype.getColDisplayName = function (col) {
        return this.chartColumnService.getColDisplayName(col);
    };
    ChartDataModel.prototype.isPivotMode = function () {
        return this.chartColumnService.isPivotMode();
    };
    ChartDataModel.prototype.getChartDataType = function (colId) {
        var column = this.chartColumnService.getColumn(colId);
        return column ? column.getColDef().chartDataType : undefined;
    };
    ChartDataModel.prototype.isPivotActive = function () {
        return this.chartColumnService.isPivotActive();
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
            startColumn: type === CellRangeType.DIMENSION ? columns[0] : this.referenceCellRange.startColumn,
            type: type
        };
    };
    ChartDataModel.prototype.getAllColumnsFromRanges = function () {
        if (this.pivotChart) {
            return _.convertToSet(this.chartColumnService.getAllDisplayedColumns());
        }
        var columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;
        if (this.dimensionCellRange) {
            columns.push.apply(columns, __spreadArray([], __read(this.dimensionCellRange.columns), false));
        }
        if (this.valueCellRange) {
            columns.push.apply(columns, __spreadArray([], __read(this.valueCellRange.columns), false));
        }
        return _.convertToSet(columns);
    };
    ChartDataModel.prototype.getRowIndexes = function () {
        var startRow = 0, endRow = 0;
        var _a = this, rangeService = _a.rangeService, valueCellRange = _a.valueCellRange, dimensionCellRange = _a.dimensionCellRange;
        // Not all chart types require a value series (e.g. hierarchical charts),
        // so fall back to using the dimension cell range for inferring row indices
        var cellRange = valueCellRange || dimensionCellRange;
        if (rangeService && cellRange) {
            startRow = rangeService.getRangeStartRow(cellRange).rowIndex;
            // when the last row the cell range is a pinned 'bottom' row, the `endRow` index is set to -1 which results
            // in the ChartDatasource processing all non pinned rows from the `startRow` index.
            var endRowPosition = rangeService.getRangeEndRow(cellRange);
            endRow = endRowPosition.rowPinned === 'bottom' ? -1 : endRowPosition.rowIndex;
        }
        return { startRow: startRow, endRow: endRow };
    };
    ChartDataModel.prototype.resetColumnState = function () {
        var _this = this;
        var _a = this.chartColumnService.getChartColumns(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
        var allCols = this.getAllColumnsFromRanges();
        var isInitialising = this.valueColState.length < 1;
        this.dimensionColState = [];
        this.valueColState = [];
        var supportsMultipleDimensions = isHierarchical(this.chartType);
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
                selected = isAutoGroupCol ? true : (!hasSelectedDimension || supportsMultipleDimensions) && allCols.has(column);
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
            if (isInitialising && _.includes(_this.referenceCellRange.columns, column)) {
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
        // Determine whether the specified column is a dimension or value column
        var matchedDimensionColState = dimensionColState.find(idsMatch);
        var matchedValueColState = valueColState.find(idsMatch);
        if (matchedDimensionColState) {
            // For non-hierarchical chart types, only one dimension can be selected
            var supportsMultipleDimensions = isHierarchical(this.chartType);
            if (!supportsMultipleDimensions) {
                // Determine which column should end up selected, if any
                var selectedColumnState_1 = updatedCol.selected
                    ? matchedDimensionColState
                    : dimensionColState
                        .filter(function (cs) { return cs !== matchedDimensionColState; })
                        .find(function (_a) {
                        var selected = _a.selected;
                        return selected;
                    });
                // Update the selection state of all dimension columns
                dimensionColState.forEach(function (cs) { return cs.selected = (cs === selectedColumnState_1); });
            }
            else {
                // Update the selection state of the specified dimension column
                matchedDimensionColState.selected = updatedCol.selected;
            }
        }
        else if (matchedValueColState) {
            // Update the selection state of the specified value column
            matchedValueColState.selected = updatedCol.selected;
        }
        var allColumns = __spreadArray(__spreadArray([], __read(dimensionColState), false), __read(valueColState), false);
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
        this.dimensionCellRange = undefined;
        if (!updatedColState && !this.dimensionColState.length) {
            var supportsMultipleDimensions_1 = isHierarchical(this.chartType);
            var selectedCols_1 = new Array();
            // use first dimension column in range by default, or all dimension columns for hierarchical charts
            dimensionCols.forEach(function (col) {
                if ((selectedCols_1.length > 0 && !supportsMultipleDimensions_1) || !colsInRange.has(col)) {
                    return;
                }
                selectedCols_1.push(col);
            });
            if (selectedCols_1.length > 0) {
                this.dimensionCellRange = this.createCellRange.apply(this, __spreadArray([CellRangeType.DIMENSION], __read(selectedCols_1), false));
            }
            return;
        }
        var selectedDimensionColStates = updatedColState ? [updatedColState] : [];
        if (this.crossFiltering && this.aggFunc) {
            var aggFuncDimension_1 = this.suppliedCellRange.columns[0]; //TODO
            selectedDimensionColStates = this.dimensionColState.filter(function (cs) { return cs.colId === aggFuncDimension_1.getColId(); });
        }
        else if (selectedDimensionColStates.length === 0 || selectedDimensionColStates.some(function (_a) {
            var column = _a.column;
            return !column || !dimensionCols.has(column);
        })) {
            selectedDimensionColStates = this.dimensionColState.filter(function (cs) { return cs.selected; });
        }
        var isDefaultCategory = selectedDimensionColStates.length === 1
            ? selectedDimensionColStates[0].colId === ChartDataModel.DEFAULT_CATEGORY
            : false;
        var selectedColumns = selectedDimensionColStates.map(function (_a) {
            var column = _a.column;
            return column;
        })
            .filter(function (value) { return value != null; });
        if (selectedColumns.length > 0 && !isDefaultCategory) {
            this.dimensionCellRange = this.createCellRange.apply(this, __spreadArray([CellRangeType.DIMENSION], __read(selectedColumns), false));
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
            this.valueCellRange = this.createCellRange.apply(this, __spreadArray([CellRangeType.VALUE], __read(selectedValueCols), false));
        }
    };
    ChartDataModel.prototype.updateSelectedDimensions = function (columns) {
        var colIdSet = new Set(columns.map(function (column) { return column.getColId(); }));
        // For non-hierarchical chart types, only one dimension can be selected
        var supportsMultipleDimensions = isHierarchical(this.chartType);
        if (!supportsMultipleDimensions) {
            // Determine which column should end up selected, if any
            // if no dimension found in supplied columns use the default category (always index = 0)
            var foundColState = this.dimensionColState.find(function (colState) { return colIdSet.has(colState.colId); }) || this.dimensionColState[0];
            var selectedColumnId_1 = foundColState.colId;
            // Update the selection state of all dimension columns
            this.dimensionColState = this.dimensionColState.map(function (colState) { return (__assign(__assign({}, colState), { selected: colState.colId === selectedColumnId_1 })); });
        }
        else {
            // Update the selection state of all dimension columns, selecting only the provided columns from the chart model
            var foundColStates = this.dimensionColState.filter(function (colState) { return colIdSet.has(colState.colId); });
            var selectedColumnIds_1 = new Set(foundColStates.map(function (colState) { return colState.colId; }));
            this.dimensionColState = this.dimensionColState.map(function (colState) { return (__assign(__assign({}, colState), { selected: selectedColumnIds_1.has(colState.colId) })); });
        }
    };
    ChartDataModel.prototype.syncDimensionCellRange = function () {
        var selectedDimensions = this.getSelectedDimensions();
        if (selectedDimensions.length === 0)
            return;
        var selectedCols = selectedDimensions.map(function (_a) {
            var column = _a.column;
            return column;
        })
            .filter(function (value) { return value != null; });
        if (selectedCols.length > 0) {
            this.dimensionCellRange = this.createCellRange.apply(this, __spreadArray([CellRangeType.DIMENSION], __read(selectedCols), false));
        }
    };
    ChartDataModel.prototype.isComboChart = function () {
        return ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(this.chartType);
    };
    ChartDataModel.DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';
    __decorate([
        Autowired('rangeService')
    ], ChartDataModel.prototype, "rangeService", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], ChartDataModel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], ChartDataModel.prototype, "init", null);
    return ChartDataModel;
}(BeanStub));
export { ChartDataModel };
