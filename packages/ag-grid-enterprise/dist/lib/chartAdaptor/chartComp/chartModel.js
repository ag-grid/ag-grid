// ag-grid-enterprise v21.2.2
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var chartDatasource_1 = require("./chartDatasource");
var rangeController_1 = require("../../rangeController");
var ChartModel = /** @class */ (function (_super) {
    __extends(ChartModel, _super);
    function ChartModel(params) {
        var _this = _super.call(this) || this;
        _this.dimensionColState = [];
        _this.valueColState = [];
        _this.initialising = true;
        _this.detached = false;
        _this.columnNames = {};
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
        this.datasource = new chartDatasource_1.ChartDatasource();
        this.getContext().wireBean(this.datasource);
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
        var lastRange = ag_grid_community_1._.last(this.cellRanges);
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
                this.addRange(ag_grid_community_1.CellRangeType.DIMENSION, [dimensionColsInRange[0]]);
            }
            this.initialising = false;
        }
        if (updatedCol && dimensionCols.indexOf(updatedCol.column) > -1) {
            // if updated col is dimension col and is not the default category
            if (updatedCol.colId !== ChartModel.DEFAULT_CATEGORY) {
                this.addRange(ag_grid_community_1.CellRangeType.DIMENSION, [updatedCol.column]);
            }
        }
        else {
            // otherwise use current selected dimension
            var selectedDimension = this.dimensionColState.filter(function (cs) { return cs.selected; })[0];
            if (selectedDimension && selectedDimension.colId !== ChartModel.DEFAULT_CATEGORY) {
                this.addRange(ag_grid_community_1.CellRangeType.DIMENSION, [selectedDimension.column]);
            }
        }
        var valueColsInRange = valueCols.filter(function (col) { return allColsFromRanges.indexOf(col) > -1; });
        if (updatedCol && valueCols.indexOf(updatedCol.column) > -1) {
            if (updatedCol.selected) {
                valueColsInRange.push(updatedCol.column);
                valueColsInRange = this.getColumnInDisplayOrder(valueCols, valueColsInRange);
            }
            else {
                valueColsInRange = valueColsInRange.filter(function (col) { return col.getColId() !== updatedCol.colId; });
            }
        }
        if (valueColsInRange.length > 0) {
            this.addRange(ag_grid_community_1.CellRangeType.VALUE, valueColsInRange);
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
            var dimensionValue = d[colId] ? d[colId].toString() : '';
            d[colId] = { toString: function () { return dimensionValue; }, id: index };
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
    ChartModel.prototype.isPivotActive = function () {
        return this.columnController.isPivotActive();
    };
    ChartModel.prototype.isPivotMode = function () {
        return this.columnController.isPivotMode();
    };
    ChartModel.prototype.isPivotChart = function () {
        return this.pivotChart;
    };
    ChartModel.prototype.setChartProxy = function (chartProxy) {
        this.chartProxy = chartProxy;
    };
    ChartModel.prototype.getChartProxy = function () {
        return this.chartProxy;
    };
    ChartModel.prototype.getChartId = function () {
        return this.chartId;
    };
    ChartModel.prototype.getValueColState = function () {
        return this.valueColState.map(this.displayNameMapper.bind(this));
    };
    ChartModel.prototype.getDimensionColState = function () {
        return this.dimensionColState;
    };
    ChartModel.prototype.getCellRanges = function () {
        return this.cellRanges;
    };
    ChartModel.prototype.getChartType = function () {
        return this.chartType;
    };
    ChartModel.prototype.setActivePalette = function (palette) {
        this.activePalette = palette;
    };
    ChartModel.prototype.getActivePalette = function () {
        return this.activePalette;
    };
    ChartModel.prototype.getPalettes = function () {
        return this.palettes;
    };
    ChartModel.prototype.isSuppressChartRanges = function () {
        return this.suppressChartRanges;
    };
    ChartModel.prototype.isDetached = function () {
        return this.detached;
    };
    ChartModel.prototype.toggleDetached = function () {
        this.detached = !this.detached;
    };
    ChartModel.prototype.getSelectedValueColState = function () {
        return this.getValueColState().filter(function (cs) { return cs.selected; });
    };
    ChartModel.prototype.getSelectedValueCols = function () {
        return this.valueColState.filter(function (cs) { return cs.selected; }).map(function (cs) { return cs.column; });
    };
    ChartModel.prototype.getSelectedDimension = function () {
        return this.dimensionColState.filter(function (cs) { return cs.selected; })[0];
    };
    ChartModel.prototype.getColumnInDisplayOrder = function (allDisplayedColumns, listToSort) {
        var sortedList = [];
        allDisplayedColumns.forEach(function (col) {
            if (listToSort.indexOf(col) > -1) {
                sortedList.push(col);
            }
        });
        return sortedList;
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
        cellRangeType === ag_grid_community_1.CellRangeType.DIMENSION ? this.cellRanges.unshift(newRange) : this.cellRanges.push(newRange);
    };
    ChartModel.prototype.getAllColumnsFromRanges = function () {
        return ag_grid_community_1._.flatten(this.cellRanges.map(function (range) { return range.columns; }));
    };
    ChartModel.prototype.getColDisplayName = function (col) {
        return this.columnController.getDisplayNameForColumn(col, 'chart');
    };
    ChartModel.prototype.getRowIndexes = function () {
        var startRow = 0, endRow = 0;
        var range = ag_grid_community_1._.last(this.cellRanges);
        if (range) {
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
            // first check column for 'chartDataType'
            var chartDataType = colDef.chartDataType;
            if (chartDataType) {
                var validChartType = true;
                if (chartDataType === 'category') {
                    dimensionCols.push(col);
                }
                else if (chartDataType === 'series') {
                    valueCols.push(col);
                }
                else if (chartDataType === 'excluded') {
                    // ignore
                }
                else {
                    console.warn("ag-Grid: unexpected chartDataType value '" + chartDataType + "' supplied, instead use 'category', 'series' or 'excluded'");
                    validChartType = false;
                }
                if (validChartType) {
                    return;
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
        var rowData = row ? row.data : null;
        var cellData;
        if (row && row.group) {
            cellData = this.extractLeafData(row, colId);
        }
        else {
            cellData = rowData ? rowData[colId] : null;
        }
        return typeof cellData === 'number';
    };
    ChartModel.prototype.extractLeafData = function (row, colId) {
        var leafRowData = row.allLeafChildren.map(function (row) { return row.data; });
        var leafCellData = leafRowData.map(function (rowData) { return rowData[colId]; });
        for (var i = 0; i < leafCellData.length; i++) {
            if (leafCellData[i] !== null) {
                return leafCellData[i];
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
    ChartModel.prototype.isMultiCategoryChart = function () {
        return [
            ag_grid_community_1.ChartType.Pie,
            ag_grid_community_1.ChartType.Doughnut,
            ag_grid_community_1.ChartType.Scatter,
            ag_grid_community_1.ChartType.Bubble
        ].indexOf(this.chartType) < 0;
    };
    ChartModel.prototype.generateId = function () {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    };
    ChartModel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.datasource) {
            this.datasource.destroy();
        }
    };
    ChartModel.DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], ChartModel.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ChartModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], ChartModel.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowRenderer'),
        __metadata("design:type", ag_grid_community_1.RowRenderer)
    ], ChartModel.prototype, "rowRenderer", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartModel.prototype, "init", null);
    return ChartModel;
}(ag_grid_community_1.BeanStub));
exports.ChartModel = ChartModel;
