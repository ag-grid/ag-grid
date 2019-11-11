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
import { _, Autowired, BeanStub, CellRangeType, ChartType, PostConstruct } from "@ag-grid-community/core";
import { ChartDatasource } from "./chartDatasource";
var ChartModel = /** @class */ (function (_super) {
    __extends(ChartModel, _super);
    function ChartModel(params) {
        var _this = _super.call(this) || this;
        _this.dimensionColState = [];
        _this.valueColState = [];
        _this.initialising = true;
        _this.detached = false;
        _this.columnNames = {};
        _this.isPivotActive = function () { return _this.columnController.isPivotActive(); };
        _this.isPivotMode = function () { return _this.columnController.isPivotMode(); };
        _this.isPivotChart = function () { return _this.pivotChart; };
        _this.getChartProxy = function () { return _this.chartProxy; };
        _this.getChartId = function () { return _this.chartId; };
        _this.getValueColState = function () { return _this.valueColState.map(_this.displayNameMapper.bind(_this)); };
        _this.getDimensionColState = function () { return _this.dimensionColState; };
        _this.getCellRanges = function () { return _this.cellRanges; };
        _this.getChartType = function () { return _this.chartType; };
        _this.getActivePalette = function () { return _this.activePalette; };
        _this.getPalettes = function () { return _this.palettes; };
        _this.isSuppressChartRanges = function () { return _this.suppressChartRanges; };
        _this.isDetached = function () { return _this.detached; };
        _this.getSelectedValueColState = function () { return _this.getValueColState().filter(function (cs) { return cs.selected; }); };
        _this.getSelectedValueCols = function () { return _this.valueColState.filter(function (cs) { return cs.selected; }).map(function (cs) { return cs.column; }); };
        _this.getSelectedDimension = function () { return _this.dimensionColState.filter(function (cs) { return cs.selected; })[0]; };
        _this.getAllColumnsFromRanges = function () { return _.flatten(_this.cellRanges.map(function (range) { return range.columns; })); };
        _this.getColDisplayName = function (col) { return _this.columnController.getDisplayNameForColumn(col, 'chart'); };
        _this.isMultiCategoryChart = function () { return !_.includes([ChartType.Pie, ChartType.Doughnut, ChartType.Scatter, ChartType.Bubble], _this.chartType); };
        _this.generateId = function () { return 'id-' + Math.random().toString(36).substr(2, 16); };
        _this.pivotChart = params.pivotChart;
        _this.chartType = params.chartType;
        _this.aggFunc = params.aggFunc;
        _this.cellRanges = params.cellRanges;
        _this.palettes = params.palettes;
        _this.activePalette = params.activePalette;
        _this.suppressChartRanges = params.suppressChartRanges;
        // this is used to associate chart ranges with charts
        _this.chartId = _this.generateId();
        return _this;
    }
    ChartModel.prototype.init = function () {
        this.datasource = this.wireBean(new ChartDatasource());
        // use first range as a reference range to be used after removing all cols (via menu) so we can re-add later
        this.referenceCellRange = this.cellRanges[0];
    };
    ChartModel.prototype.updateData = function () {
        var _a = this.getRowIndexes(), startRow = _a.startRow, endRow = _a.endRow;
        var selectedDimension = this.getSelectedDimension();
        var selectedValueCols = this.getSelectedValueCols();
        this.grouping = this.isGrouping();
        var params = {
            aggFunc: this.aggFunc,
            dimensionCols: [selectedDimension],
            grouping: this.grouping,
            pivoting: this.isPivotActive(),
            multiCategories: this.isMultiCategoryChart(),
            valueCols: selectedValueCols,
            startRow: startRow,
            endRow: endRow
        };
        var result = this.datasource.getData(params);
        this.chartData = result.data;
        this.columnNames = result.columnNames;
    };
    ChartModel.prototype.resetColumnState = function () {
        var _this = this;
        var _a = this.getAllChartColumns(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
        var allCols = this.pivotChart ? this.columnController.getAllDisplayedColumns() : this.getAllColumnsFromRanges();
        this.valueColState = valueCols.map(function (column) {
            return {
                column: column,
                colId: column.getColId(),
                displayName: _this.getColDisplayName(column),
                selected: allCols.indexOf(column) > -1
            };
        });
        this.dimensionColState = dimensionCols.map(function (column) {
            return {
                column: column,
                colId: column.getColId(),
                displayName: _this.getColDisplayName(column),
                selected: false
            };
        });
        var dimensionsInCellRange = dimensionCols.filter(function (col) { return allCols.indexOf(col) > -1; });
        if (dimensionsInCellRange.length > 0) {
            // select the first dimension from the range
            var selectedDimensionId_1 = dimensionsInCellRange[0].getColId();
            this.dimensionColState.forEach(function (cs) { return cs.selected = cs.colId === selectedDimensionId_1; });
        }
        // if no dimensions in range select the default
        var defaultCategory = {
            colId: ChartModel.DEFAULT_CATEGORY,
            displayName: '(None)',
            selected: dimensionsInCellRange.length === 0
        };
        this.dimensionColState.unshift(defaultCategory);
    };
    ChartModel.prototype.updateColumnState = function (updatedCol) {
        var idsMatch = function (cs) { return cs.colId === updatedCol.colId; };
        var isDimensionCol = this.dimensionColState.filter(idsMatch).length > 0;
        var isValueCol = this.valueColState.filter(idsMatch).length > 0;
        if (isDimensionCol) {
            // only one dimension should be selected
            this.dimensionColState.forEach(function (cs) { return cs.selected = idsMatch(cs); });
        }
        else if (isValueCol) {
            // just update the selected value on the supplied value column
            this.valueColState.forEach(function (cs) { return cs.selected = idsMatch(cs) ? updatedCol.selected : cs.selected; });
        }
    };
    ChartModel.prototype.updateCellRanges = function (updatedCol) {
        var _a = this.getAllChartColumns(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
        var lastRange = _.last(this.cellRanges);
        if (lastRange) {
            // update the reference range
            this.referenceCellRange = lastRange;
            if (updatedCol) {
                var updatingStartCol = lastRange.columns[0] === updatedCol.column;
                this.referenceCellRange.startColumn = updatingStartCol ? lastRange.columns[1] : lastRange.columns[0];
            }
        }
        var allColsFromRanges = this.getAllColumnsFromRanges();
        // clear ranges
        this.cellRanges = [];
        var dimensionColsInRange = dimensionCols.filter(function (col) { return allColsFromRanges.indexOf(col) > -1; });
        if (this.initialising) {
            // first time in just take the first dimension from the range as the column state hasn't been updated yet
            if (dimensionColsInRange.length > 0) {
                this.addRange(CellRangeType.DIMENSION, [dimensionColsInRange[0]]);
            }
            this.initialising = false;
        }
        if (updatedCol && dimensionCols.indexOf(updatedCol.column) > -1) {
            // if updated col is dimension col and is not the default category
            if (updatedCol.colId !== ChartModel.DEFAULT_CATEGORY) {
                this.addRange(CellRangeType.DIMENSION, [updatedCol.column]);
            }
        }
        else {
            // otherwise use current selected dimension
            var selectedDimension = this.dimensionColState.filter(function (cs) { return cs.selected; })[0];
            if (selectedDimension && selectedDimension.colId !== ChartModel.DEFAULT_CATEGORY) {
                this.addRange(CellRangeType.DIMENSION, [selectedDimension.column]);
            }
        }
        var valueColsInRange = valueCols.filter(function (col) { return _.includes(allColsFromRanges, col); });
        if (updatedCol && _.includes(valueCols, updatedCol.column)) {
            if (updatedCol.selected) {
                valueColsInRange.push(updatedCol.column);
                valueColsInRange = this.getColumnInDisplayOrder(valueCols, valueColsInRange);
            }
            else {
                valueColsInRange = valueColsInRange.filter(function (col) { return col.getColId() !== updatedCol.colId; });
            }
        }
        if (valueColsInRange.length > 0) {
            this.addRange(CellRangeType.VALUE, valueColsInRange);
        }
    };
    ChartModel.prototype.getData = function () {
        // grouped data contains label fields rather than objects with toString
        if (this.grouping && this.isMultiCategoryChart()) {
            return this.chartData;
        }
        var colId = this.getSelectedDimension().colId;
        // replacing the selected dimension with a complex object to facilitate duplicated categories
        return this.chartData.map(function (d, index) {
            var value = d[colId];
            var valueString = value && value.toString ? value.toString() : '';
            d[colId] = { id: index, value: d[colId], toString: function () { return valueString; } };
            return d;
        });
    };
    ChartModel.prototype.setChartType = function (chartType) {
        var isCurrentMultiCategory = this.isMultiCategoryChart();
        this.chartType = chartType;
        // switching between single and multi-category charts requires data to be reformatted
        if (isCurrentMultiCategory !== this.isMultiCategoryChart()) {
            this.updateData();
        }
    };
    ChartModel.prototype.isGrouping = function () {
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
    ChartModel.prototype.setChartProxy = function (chartProxy) {
        this.chartProxy = chartProxy;
    };
    ChartModel.prototype.setActivePalette = function (palette) {
        this.activePalette = palette;
    };
    ChartModel.prototype.toggleDetached = function () {
        this.detached = !this.detached;
    };
    ChartModel.prototype.getColumnInDisplayOrder = function (allDisplayedColumns, listToSort) {
        return allDisplayedColumns.filter(function (col) { return _.includes(listToSort, col); });
    };
    ChartModel.prototype.addRange = function (cellRangeType, columns) {
        var newRange = {
            id: this.chartId,
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns: columns,
            startColumn: this.referenceCellRange.startColumn,
            type: cellRangeType
        };
        cellRangeType === CellRangeType.DIMENSION ? this.cellRanges.unshift(newRange) : this.cellRanges.push(newRange);
    };
    ChartModel.prototype.getRowIndexes = function () {
        var startRow = 0, endRow = 0;
        var range = _.last(this.cellRanges);
        if (this.rangeController && range) {
            startRow = this.rangeController.getRangeStartRow(range).rowIndex;
            endRow = this.rangeController.getRangeEndRow(range).rowIndex;
        }
        return { startRow: startRow, endRow: endRow };
    };
    ChartModel.prototype.getAllChartColumns = function () {
        var _this = this;
        var displayedCols = this.columnController.getAllDisplayedColumns();
        var dimensionCols = [];
        var valueCols = [];
        displayedCols.forEach(function (col) {
            var colDef = col.getColDef();
            var chartDataType = colDef.chartDataType;
            if (chartDataType) {
                // chart data type was specified explicitly
                switch (chartDataType) {
                    case 'category':
                        dimensionCols.push(col);
                        return;
                    case 'series':
                        valueCols.push(col);
                        return;
                    case 'excluded':
                        return;
                    default:
                        console.warn("ag-Grid: unexpected chartDataType value '" + chartDataType + "' supplied, instead use 'category', 'series' or 'excluded'");
                        break;
                }
            }
            if (colDef.colId === 'ag-Grid-AutoColumn') {
                dimensionCols.push(col);
                return;
            }
            if (!col.isPrimary()) {
                valueCols.push(col);
                return;
            }
            // if 'chartDataType' is not provided then infer type based data contained in first row
            _this.isNumberCol(col.getColId()) ? valueCols.push(col) : dimensionCols.push(col);
        });
        return { dimensionCols: dimensionCols, valueCols: valueCols };
    };
    ChartModel.prototype.isNumberCol = function (colId) {
        if (colId === 'ag-Grid-AutoColumn') {
            return false;
        }
        var row = this.rowRenderer.getRowNode({ rowIndex: 0, rowPinned: undefined });
        if (!row) {
            return false;
        }
        var cellData;
        if (row.group) {
            cellData = this.extractAggregateValue(row, colId) || this.extractLeafData(row, colId);
        }
        else {
            var rowData = row.data;
            cellData = rowData ? rowData[colId] : null;
        }
        return typeof cellData === 'number';
    };
    ChartModel.prototype.extractAggregateValue = function (row, colId) {
        if (!row.aggData) {
            return null;
        }
        var aggDatum = row.aggData[colId];
        if (!aggDatum) {
            return null;
        }
        return typeof aggDatum.toNumber === 'function' ? aggDatum.toNumber() : aggDatum;
    };
    ChartModel.prototype.extractLeafData = function (row, colId) {
        var cellData = row.allLeafChildren.map(function (child) { return child.data; }).map(function (data) { return data[colId]; });
        for (var i = 0; i < cellData.length; i++) {
            if (cellData[i] !== null) {
                return cellData[i];
            }
        }
        return null;
    };
    ChartModel.prototype.displayNameMapper = function (col) {
        if (this.columnNames[col.colId]) {
            col.displayName = this.columnNames[col.colId].join(' - ');
        }
        else {
            col.displayName = this.getColDisplayName(col.column);
        }
        return col;
    };
    ChartModel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.datasource) {
            this.datasource.destroy();
        }
    };
    ChartModel.DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';
    __decorate([
        Autowired('columnController')
    ], ChartModel.prototype, "columnController", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ChartModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('rangeController')
    ], ChartModel.prototype, "rangeController", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], ChartModel.prototype, "rowRenderer", void 0);
    __decorate([
        PostConstruct
    ], ChartModel.prototype, "init", null);
    return ChartModel;
}(BeanStub));
export { ChartModel };
