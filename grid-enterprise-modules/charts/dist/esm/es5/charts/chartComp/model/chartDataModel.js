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
        this.updateSelectedDimension(cellRange === null || cellRange === void 0 ? void 0 : cellRange.columns);
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
    ChartDataModel.prototype.updateSelectedDimension = function (columns) {
        var colIdSet = new Set(columns.map(function (column) { return column.getColId(); }));
        // if no dimension found in supplied columns use the default category (always index = 0)
        var foundColState = this.dimensionColState.find(function (colState) { return colIdSet.has(colState.colId); }) || this.dimensionColState[0];
        this.dimensionColState = this.dimensionColState.map(function (colState) { return (__assign(__assign({}, colState), { selected: colState.colId === foundColState.colId })); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnREYXRhTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tb2RlbC9jaGFydERhdGFNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULFFBQVEsRUFFUixhQUFhLEVBS2IsYUFBYSxHQUVoQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxlQUFlLEVBQXlCLE1BQU0sK0JBQStCLENBQUM7QUFFdkYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBdUJwRDtJQUFvQyxrQ0FBUTtJQXVDeEMsd0JBQW1CLE1BQXdCO1FBQTNDLFlBQ0ksaUJBQU8sU0FhVjtRQWxDTSxjQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGVBQVMsR0FBVSxFQUFFLENBQUM7UUFDdEIsbUJBQWEsR0FBZSxFQUFFLENBQUM7UUFDL0IsdUJBQWlCLEdBQWUsRUFBRSxDQUFDO1FBQ25DLGlCQUFXLEdBQStCLEVBQUUsQ0FBQztRQVk3QyxvQkFBYyxHQUFHLEtBQUssQ0FBQztRQUV0QixjQUFRLEdBQUcsS0FBSyxDQUFDO1FBS3JCLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLEtBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM5QixLQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbEMsS0FBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BDLEtBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUM1QyxLQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDOUIsS0FBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDM0MsS0FBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDMUMsS0FBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztRQUN0RCxLQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3JDLEtBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7O0lBQ2xELENBQUM7SUFHTyw2QkFBSSxHQUFaO1FBQ0ksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxrQkFBa0IsRUFBRSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVNLG9DQUFXLEdBQWxCLFVBQW1CLE1BQXdCO1FBRW5DLElBQUEsU0FBUyxHQVNULE1BQU0sVUFURyxFQUNULFNBQVMsR0FRVCxNQUFNLFVBUkcsRUFDVCxVQUFVLEdBT1YsTUFBTSxXQVBJLEVBQ1YsY0FBYyxHQU1kLE1BQU0sZUFOUSxFQUNkLE9BQU8sR0FLUCxNQUFNLFFBTEMsRUFDUCxtQkFBbUIsR0FJbkIsTUFBTSxvQkFKYSxFQUNuQixXQUFXLEdBR1gsTUFBTSxZQUhLLEVBQ1gsY0FBYyxHQUVkLE1BQU0sZUFGUSxFQUNkLGdCQUFnQixHQUNoQixNQUFNLGlCQURVLENBQ1Q7UUFFWCxJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDdEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztZQUNwQyxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztTQUNuQztRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLENBQUM7UUFDcEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztRQUNuQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7UUFDL0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQzlCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUV2QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXhCLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLGdCQUFnQixDQUFDO1FBQ3ZFLElBQUksc0JBQXNCLEVBQUU7WUFDeEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUNqRDtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNyQjtJQUNMLENBQUM7SUFFTSx5Q0FBZ0IsR0FBdkIsVUFBd0IsZUFBMEI7UUFDOUMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1NBQ2pEO1FBRUssSUFBQSxLQUErQixJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLEVBQXRFLGFBQWEsbUJBQUEsRUFBRSxTQUFTLGVBQThDLENBQUM7UUFDL0UsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUV6RCxJQUFJLGVBQWUsRUFBRTtZQUNqQixJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDM0M7UUFFRCxJQUFJLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFdEUsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNsQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixzR0FBc0c7WUFDdEcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7U0FDakM7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDbEQsQ0FBQztJQUVNLG1DQUFVLEdBQWpCO1FBQ1UsSUFBQSxLQUF1QixJQUFJLENBQUMsYUFBYSxFQUFFLEVBQXpDLFFBQVEsY0FBQSxFQUFFLE1BQU0sWUFBeUIsQ0FBQztRQUVsRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDM0I7UUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVsQyxJQUFNLE1BQU0sR0FBMEI7WUFDbEMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ3JCLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzVDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUM5QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsU0FBUyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUN0QyxRQUFRLFVBQUE7WUFDUixNQUFNLFFBQUE7WUFDTixTQUFTLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQy9ELENBQUM7UUFFSSxJQUFBLEtBQTZCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUExRCxTQUFTLGVBQUEsRUFBRSxXQUFXLGlCQUFvQyxDQUFDO1FBRW5FLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ25DLENBQUM7SUFFTSxtQ0FBVSxHQUFqQjtRQUNJLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzRCxJQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDeEYsSUFBTSxhQUFhLEdBQUcsYUFBYSxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFL0UsaUVBQWlFO1FBQ2pFLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNoRCxJQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQzVFLElBQU0sc0JBQXNCLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFkLENBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsS0FBSyxLQUFLLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDdEcsT0FBTyxDQUFDLENBQUMsYUFBYSxJQUFJLHNCQUFzQixDQUFDO0lBQ3JELENBQUM7SUFFTSw2Q0FBb0IsR0FBM0I7UUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLFFBQVEsRUFBWCxDQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsTUFBTyxFQUFWLENBQVUsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFTSw2Q0FBb0IsR0FBM0I7UUFDSSxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsUUFBUSxFQUFYLENBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFTSwwQ0FBaUIsR0FBeEIsVUFBeUIsR0FBVztRQUNoQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRU0sb0NBQVcsR0FBbEI7UUFDSSxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBRU0seUNBQWdCLEdBQXZCLFVBQXdCLEtBQWE7UUFDakMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4RCxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ2pFLENBQUM7SUFFTyxzQ0FBYSxHQUFyQjtRQUNJLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFTyx3Q0FBZSxHQUF2QixVQUF3QixJQUFtQjtRQUFFLGlCQUFvQjthQUFwQixVQUFvQixFQUFwQixxQkFBb0IsRUFBcEIsSUFBb0I7WUFBcEIsZ0NBQW9COztRQUM3RCxPQUFPO1lBQ0gsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ2hCLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUTtZQUMxQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU07WUFDdEMsT0FBTyxTQUFBO1lBQ1AsV0FBVyxFQUFFLElBQUksS0FBSyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXO1lBQ2hHLElBQUksTUFBQTtTQUNQLENBQUM7SUFDTixDQUFDO0lBRU8sZ0RBQXVCLEdBQS9CO1FBQ0ksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLE9BQU8sQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1NBQzNFO1FBRUQsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztRQUV0RyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUN6QixPQUFPLENBQUMsSUFBSSxPQUFaLE9BQU8sMkJBQVMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sSUFBRTtTQUNwRDtRQUVELElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQixPQUFPLENBQUMsSUFBSSxPQUFaLE9BQU8sMkJBQVMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLElBQUU7U0FDaEQ7UUFFRCxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVPLHNDQUFhLEdBQXJCO1FBQ0ksSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBQSxLQUFtQyxJQUFJLEVBQXJDLFlBQVksa0JBQUEsRUFBRSxjQUFjLG9CQUFTLENBQUM7UUFFOUMsSUFBSSxZQUFZLElBQUksY0FBYyxFQUFFO1lBQ2hDLFFBQVEsR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBRWxFLDJHQUEyRztZQUMzRyxtRkFBbUY7WUFDbkYsSUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNuRSxNQUFNLEdBQUcsY0FBYyxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxFQUFFLFFBQVEsVUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVPLHlDQUFnQixHQUF4QjtRQUFBLGlCQStEQztRQTlEUyxJQUFBLEtBQStCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsRUFBdEUsYUFBYSxtQkFBQSxFQUFFLFNBQVMsZUFBOEMsQ0FBQztRQUMvRSxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvQyxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFckQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUV4QixJQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQztRQUNqQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBRWxFLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO1lBQ3hCLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxvQkFBb0IsQ0FBQztZQUVsRSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxLQUFJLENBQUMsY0FBYyxJQUFJLEtBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JDLElBQUksZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUNuRCxRQUFRLEdBQUcsSUFBSSxDQUFDO2lCQUNuQjthQUNKO2lCQUFNO2dCQUNILFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ25GO1lBRUQsS0FBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztnQkFDeEIsTUFBTSxRQUFBO2dCQUNOLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUN4QixXQUFXLEVBQUUsS0FBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztnQkFDM0MsUUFBUSxVQUFBO2dCQUNSLEtBQUssRUFBRSxLQUFLLEVBQUU7YUFDakIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxRQUFRLEVBQUU7Z0JBQ1Ysb0JBQW9CLEdBQUcsSUFBSSxDQUFDO2FBQy9CO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFNLGVBQWUsR0FBRztZQUNwQixLQUFLLEVBQUUsY0FBYyxDQUFDLGdCQUFnQjtZQUN0QyxXQUFXLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztZQUN0RSxRQUFRLEVBQUUsQ0FBQyxvQkFBb0I7WUFDL0IsS0FBSyxFQUFFLENBQUM7U0FDWCxDQUFDO1FBRUYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUVoRCxJQUFNLDhCQUE4QixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBRXJHLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO1lBQ3BCLDRGQUE0RjtZQUM1RixJQUFJLGNBQWMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZFLE1BQU0sR0FBRyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUcsQ0FBQzthQUNwRDtZQUVELEtBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2dCQUNwQixNQUFNLFFBQUE7Z0JBQ04sS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3hCLFdBQVcsRUFBRSxLQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDO2dCQUMzQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQzdCLEtBQUssRUFBRSxLQUFLLEVBQUU7YUFDakIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sMENBQWlCLEdBQXpCLFVBQTBCLFVBQW9CO1FBQzFDLElBQU0sUUFBUSxHQUFHLFVBQUMsRUFBWSxJQUFLLE9BQUEsRUFBRSxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsS0FBSyxFQUE3QixDQUE2QixDQUFDO1FBQzNELElBQUEsS0FBdUMsSUFBSSxFQUF6QyxpQkFBaUIsdUJBQUEsRUFBRSxhQUFhLG1CQUFTLENBQUM7UUFFbEQsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvQyx3Q0FBd0M7WUFDeEMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztTQUMvRDthQUFNO1lBQ0gsOERBQThEO1lBQzlELGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFqQyxDQUFpQyxDQUFDLENBQUM7U0FDbkY7UUFFRCxJQUFNLFVBQVUsMENBQU8saUJBQWlCLFdBQUssYUFBYSxFQUFDLENBQUM7UUFDNUQsSUFBTSxhQUFhLEdBQWEsRUFBRSxDQUFDO1FBRW5DLHNCQUFzQjtRQUN0QixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBYSxFQUFFLENBQVM7WUFDeEMsSUFBSSxDQUFDLEtBQUssVUFBVSxDQUFDLEtBQUssRUFBRTtnQkFDeEIsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDeEM7WUFFRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLEtBQUssRUFBRTtnQkFDaEMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILGtDQUFrQztRQUNsQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztZQUNsQixJQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN0RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRU8sd0NBQWUsR0FBdkI7UUFDSSxJQUFNLGdCQUFnQixHQUFHLFVBQUMsQ0FBVyxFQUFFLENBQVcsSUFBSyxPQUFBLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBakIsQ0FBaUIsQ0FBQztRQUN6RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU8sOENBQXFCLEdBQTdCLFVBQThCLGFBQTBCLEVBQUUsV0FBd0IsRUFBRSxlQUEwQjtRQUE5RyxpQkF1QkM7UUF0QkcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztRQUVwQyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUNwRCxpREFBaUQ7WUFDakQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7Z0JBQ3JCLElBQUksS0FBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFBRSxPQUFPO2lCQUFFO2dCQUNqRSxLQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2pGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSx5QkFBeUIsR0FBRyxlQUFlLENBQUM7UUFDaEQsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDckMsSUFBTSxrQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtZQUNsRSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLEtBQUssS0FBSyxrQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFBeEMsQ0FBd0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hIO2FBQU0sSUFBSSxDQUFDLHlCQUF5QixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFPLENBQUMsRUFBRTtZQUM1Rix5QkFBeUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLFFBQVEsRUFBWCxDQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuRjtRQUVELElBQUkseUJBQXlCLElBQUkseUJBQXlCLENBQUMsS0FBSyxLQUFLLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNsRyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLHlCQUF5QixDQUFDLE1BQU8sQ0FBQyxDQUFDO1NBQzlHO0lBQ0wsQ0FBQztJQUVPLDBDQUFpQixHQUF6QixVQUEwQixTQUFzQixFQUFFLFdBQXdCLEVBQUUsZUFBMEI7UUFDbEcsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7UUFFaEMsSUFBTSxpQkFBaUIsR0FBYSxFQUFFLENBQUM7UUFFdkMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7WUFDakIsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLEtBQUssS0FBSyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzdELElBQUksZUFBZSxDQUFDLFFBQVEsRUFBRTtvQkFDMUIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFPLENBQUMsQ0FBQztpQkFDbkQ7YUFDSjtpQkFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMvQjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLElBQUksZUFBYSxHQUFhLEVBQUUsQ0FBQztZQUVqQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDL0IsZUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEtBQUssRUFBUCxDQUFPLENBQUMsQ0FBQzthQUN4RDtpQkFBTTtnQkFDSCxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsZUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDO2FBQzlEO1lBRUQsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLGVBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsZUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBekUsQ0FBeUUsQ0FBQyxDQUFDO1lBRTVHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsT0FBcEIsSUFBSSxpQkFBaUIsYUFBYSxDQUFDLEtBQUssVUFBSyxpQkFBaUIsR0FBQyxDQUFDO1NBQ3pGO0lBQ0wsQ0FBQztJQUVPLGdEQUF1QixHQUEvQixVQUFnQyxPQUFpQjtRQUM3QyxJQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFqQixDQUFpQixDQUFDLENBQUMsQ0FBQztRQUVyRSx3RkFBd0Y7UUFDeEYsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVEsSUFBSyxPQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUE1QixDQUE0QixDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNILElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQUMsUUFBUSxJQUFLLE9BQUEsdUJBQzNELFFBQVEsS0FDWCxRQUFRLEVBQUUsUUFBUSxDQUFDLEtBQUssS0FBSyxhQUFhLENBQUMsS0FBSyxJQUNsRCxFQUhnRSxDQUdoRSxDQUFDLENBQUM7SUFDUixDQUFDO0lBRU8sK0NBQXNCLEdBQTlCO1FBQ0ksSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUN0RCxJQUFJLGlCQUFpQixJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUMvQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3JHO0lBQ0wsQ0FBQztJQUVNLHFDQUFZLEdBQW5CO1FBQ0ksT0FBTyxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQWxhYSwrQkFBZ0IsR0FBRywwQkFBMEIsQ0FBQztJQUVqQztRQUExQixTQUFTLENBQUMsY0FBYyxDQUFDO3dEQUE4QztJQUVsQztRQUFyQyxTQUFTLENBQUMseUJBQXlCLENBQUM7bUVBQW1FO0lBa0R4RztRQURDLGFBQWE7OENBT2I7SUF1V0wscUJBQUM7Q0FBQSxBQXJhRCxDQUFvQyxRQUFRLEdBcWEzQztTQXJhWSxjQUFjIn0=