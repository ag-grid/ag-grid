var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { _, Autowired, BeanStub, CellRangeType, PostConstruct } from "@ag-grid-community/core";
import { ChartDatasource } from "./chartDatasource";
var ChartDataModel = /** @class */ (function (_super) {
    __extends(ChartDataModel, _super);
    function ChartDataModel(params) {
        var _this = _super.call(this) || this;
        _this.dimensionColState = [];
        _this.valueColState = [];
        _this.detached = false;
        _this.columnNames = {};
        _this.pivotChart = params.pivotChart;
        _this.chartType = params.chartType;
        _this.aggFunc = params.aggFunc;
        _this.referenceCellRange = params.cellRange;
        _this.suppressChartRanges = params.suppressChartRanges;
        // this is used to associate chart ranges with charts
        _this.chartId = _this.generateId();
        return _this;
    }
    ChartDataModel.prototype.init = function () {
        this.datasource = this.createManagedBean(new ChartDatasource());
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
        }
        this.updateData();
    };
    ChartDataModel.prototype.getData = function () {
        return this.chartData;
    };
    ChartDataModel.prototype.setChartType = function (chartType) {
        this.chartType = chartType;
    };
    ChartDataModel.prototype.isGrouping = function () {
        var usingTreeData = this.gridOptionsWrapper.isTreeData();
        var groupedCols = usingTreeData ? null : this.columnController.getRowGroupColumns();
        var groupActive = usingTreeData || (groupedCols && groupedCols.length > 0);
        // charts only group when the selected category is a group column
        var groupCols = this.columnController.getGroupDisplayColumns();
        var colId = this.getSelectedDimension().colId;
        var groupDimensionSelected = groupCols
            .map(function (col) { return col.getColId(); })
            .some(function (id) { return id === colId; });
        return groupActive && groupDimensionSelected;
    };
    ChartDataModel.prototype.isPivotActive = function () {
        return this.columnController.isPivotActive();
    };
    ChartDataModel.prototype.isPivotMode = function () {
        return this.columnController.isPivotMode();
    };
    ChartDataModel.prototype.isPivotChart = function () {
        return this.pivotChart;
    };
    ;
    ChartDataModel.prototype.getChartId = function () {
        return this.chartId;
    };
    ;
    ChartDataModel.prototype.getValueColState = function () {
        return this.valueColState.map(this.displayNameMapper.bind(this));
    };
    ;
    ChartDataModel.prototype.getDimensionColState = function () {
        return this.dimensionColState;
    };
    ;
    ChartDataModel.prototype.getCellRanges = function () {
        return [this.dimensionCellRange, this.valueCellRange].filter(function (r) { return r; });
    };
    ;
    ChartDataModel.prototype.getCellRangeParams = function () {
        var cellRanges = this.getCellRanges();
        var firstCellRange = cellRanges[0];
        var startRow = firstCellRange && firstCellRange.startRow;
        var endRow = firstCellRange && firstCellRange.endRow;
        return {
            rowStartIndex: startRow && startRow.rowIndex,
            rowStartPinned: startRow && startRow.rowPinned,
            rowEndIndex: endRow && endRow.rowIndex,
            rowEndPinned: endRow && endRow.rowPinned,
            columns: cellRanges.reduce(function (columns, value) { return columns.concat(value.columns.map(function (c) { return c.getId(); })); }, [])
        };
    };
    ChartDataModel.prototype.getChartType = function () {
        return this.chartType;
    };
    ;
    ChartDataModel.prototype.isSuppressChartRanges = function () {
        return this.suppressChartRanges;
    };
    ;
    ChartDataModel.prototype.isDetached = function () {
        return this.detached;
    };
    ;
    ChartDataModel.prototype.toggleDetached = function () {
        this.detached = !this.detached;
    };
    ChartDataModel.prototype.getSelectedValueColState = function () {
        return this.getValueColState().filter(function (cs) { return cs.selected; });
    };
    ;
    ChartDataModel.prototype.getSelectedValueCols = function () {
        return this.valueColState.filter(function (cs) { return cs.selected; }).map(function (cs) { return cs.column; });
    };
    ;
    ChartDataModel.prototype.getSelectedDimension = function () {
        return this.dimensionColState.filter(function (cs) { return cs.selected; })[0];
    };
    ;
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
            return _.convertToSet(this.columnController.getAllDisplayedColumns());
        }
        ;
        var columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;
        if (this.dimensionCellRange) {
            columns.push.apply(columns, this.dimensionCellRange.columns);
        }
        if (this.valueCellRange) {
            columns.push.apply(columns, this.valueCellRange.columns);
        }
        return _.convertToSet(columns);
    };
    ChartDataModel.prototype.getColDisplayName = function (col) {
        return this.columnController.getDisplayNameForColumn(col, 'chart');
    };
    ChartDataModel.prototype.getRowIndexes = function () {
        var startRow = 0, endRow = 0;
        var rangeController = this.rangeController;
        var range = this.valueCellRange;
        if (rangeController && range) {
            startRow = rangeController.getRangeStartRow(range).rowIndex;
            endRow = rangeController.getRangeEndRow(range).rowIndex;
        }
        return { startRow: startRow, endRow: endRow };
    };
    ChartDataModel.prototype.getAllChartColumns = function () {
        var _this = this;
        var displayedCols = this.columnController.getAllDisplayedColumns();
        var dimensionCols = new Set();
        var valueCols = new Set();
        displayedCols.forEach(function (col) {
            var colDef = col.getColDef();
            var chartDataType = colDef.chartDataType;
            if (chartDataType) {
                // chart data type was specified explicitly
                switch (chartDataType) {
                    case 'category':
                        dimensionCols.add(col);
                        return;
                    case 'series':
                        valueCols.add(col);
                        return;
                    case 'excluded':
                        return;
                    default:
                        console.warn("ag-Grid: unexpected chartDataType value '" + chartDataType + "' supplied, instead use 'category', 'series' or 'excluded'");
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
        var row = this.rowRenderer.getRowNode({ rowIndex: 0, rowPinned: undefined });
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
    ChartDataModel.prototype.displayNameMapper = function (col) {
        var columnNames = this.columnNames[col.colId];
        col.displayName = columnNames ? columnNames.join(' - ') : this.getColDisplayName(col.column);
        return col;
    };
    ChartDataModel.prototype.generateId = function () {
        return 'id-' + Math.random().toString(36).substr(2, 16);
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
            valueCols: this.getSelectedValueCols(),
            startRow: startRow,
            endRow: endRow
        };
        var result = this.datasource.getData(params);
        this.chartData = result.data;
        this.columnNames = result.columnNames;
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
        dimensionCols.forEach(function (column) {
            var selected = !hasSelectedDimension && allCols.has(column);
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
            displayName: this.chartTranslator.translate('defaultCategory'),
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
        var allColumns = __spreadArrays(dimensionColState, valueColState);
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
        var _a = this, dimensionColState = _a.dimensionColState, valueColState = _a.valueColState;
        dimensionColState.sort(function (a, b) { return a.order - b.order; });
        valueColState.sort(function (a, b) { return a.order - b.order; });
    };
    ChartDataModel.prototype.setDimensionCellRange = function (dimensionCols, colsInRange, updatedColState) {
        var _this = this;
        this.dimensionCellRange = undefined;
        var dimensionColState = this.dimensionColState;
        if (!updatedColState && !dimensionColState.length) {
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
        if (!selectedDimensionColState || !dimensionCols.has(selectedDimensionColState.column)) {
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
            this.valueCellRange = this.createCellRange.apply(this, __spreadArrays([CellRangeType.VALUE], selectedValueCols));
        }
    };
    ChartDataModel.DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';
    __decorate([
        Autowired('columnController')
    ], ChartDataModel.prototype, "columnController", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ChartDataModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('valueService')
    ], ChartDataModel.prototype, "valueService", void 0);
    __decorate([
        Autowired('rangeController')
    ], ChartDataModel.prototype, "rangeController", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], ChartDataModel.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], ChartDataModel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], ChartDataModel.prototype, "init", null);
    return ChartDataModel;
}(BeanStub));
export { ChartDataModel };
