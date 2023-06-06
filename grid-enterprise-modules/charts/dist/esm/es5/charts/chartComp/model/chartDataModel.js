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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { _, Autowired, BeanStub, CellRangeType, PostConstruct, } from "@ag-grid-community/core";
import { ChartDatasource } from "../datasource/chartDatasource";
import { ChartColumnService } from "../services/chartColumnService";
import { ComboChartModel } from "./comboChartModel";
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
        this.updateCellRanges();
        this.comboChartModel.update(seriesChartTypes);
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
            dimensionCols: [this.getSelectedDimension()],
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
        var usingTreeData = this.gridOptionsService.isTreeData();
        var groupedCols = usingTreeData ? null : this.chartColumnService.getRowGroupColumns();
        var isGroupActive = usingTreeData || (groupedCols && groupedCols.length > 0);
        // charts only group when the selected category is a group column
        var colId = this.getSelectedDimension().colId;
        var displayedGroupCols = this.chartColumnService.getGroupDisplayColumns();
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
            columns.push.apply(columns, __spreadArray([], __read(this.dimensionCellRange.columns)));
        }
        if (this.valueCellRange) {
            columns.push.apply(columns, __spreadArray([], __read(this.valueCellRange.columns)));
        }
        return _.convertToSet(columns);
    };
    ChartDataModel.prototype.getRowIndexes = function () {
        var startRow = 0, endRow = 0;
        var _a = this, rangeService = _a.rangeService, valueCellRange = _a.valueCellRange;
        if (rangeService && valueCellRange) {
            startRow = rangeService.getRangeStartRow(valueCellRange).rowIndex;
            // when the last row the cell range is a pinned 'bottom' row, the `endRow` index is set to -1 which results
            // in the ChartDatasource processing all non pinned rows from the `startRow` index.
            var endRowPosition = rangeService.getRangeEndRow(valueCellRange);
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
        if (dimensionColState.filter(idsMatch).length > 0) {
            // only one dimension should be selected
            dimensionColState.forEach(function (cs) { return cs.selected = idsMatch(cs); });
        }
        else {
            // just update the selected value on the supplied value column
            valueColState.filter(idsMatch).forEach(function (cs) { return cs.selected = updatedCol.selected; });
        }
        var allColumns = __spreadArray(__spreadArray([], __read(dimensionColState)), __read(valueColState));
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
                _this.dimensionCellRange = _this.createCellRange(CellRangeType.DIMENSION, col);
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
            this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, selectedDimensionColState.column);
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
            this.valueCellRange = this.createCellRange.apply(this, __spreadArray([CellRangeType.VALUE], __read(selectedValueCols)));
        }
    };
    ChartDataModel.prototype.syncDimensionCellRange = function () {
        var selectedDimension = this.getSelectedDimension();
        if (selectedDimension && selectedDimension.column) {
            this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, selectedDimension.column);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnREYXRhTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tb2RlbC9jaGFydERhdGFNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFDVCxRQUFRLEVBRVIsYUFBYSxFQUtiLGFBQWEsR0FFaEIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsZUFBZSxFQUF5QixNQUFNLCtCQUErQixDQUFDO0FBRXZGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQXVCcEQ7SUFBb0Msa0NBQVE7SUF1Q3hDLHdCQUFtQixNQUF3QjtRQUEzQyxZQUNJLGlCQUFPLFNBYVY7UUFsQ00sY0FBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixlQUFTLEdBQVUsRUFBRSxDQUFDO1FBQ3RCLG1CQUFhLEdBQWUsRUFBRSxDQUFDO1FBQy9CLHVCQUFpQixHQUFlLEVBQUUsQ0FBQztRQUNuQyxpQkFBVyxHQUErQixFQUFFLENBQUM7UUFZN0Msb0JBQWMsR0FBRyxLQUFLLENBQUM7UUFFdEIsY0FBUSxHQUFHLEtBQUssQ0FBQztRQUtyQixLQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixLQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDOUIsS0FBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ2xDLEtBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQyxLQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7UUFDNUMsS0FBSSxDQUFDLE9B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