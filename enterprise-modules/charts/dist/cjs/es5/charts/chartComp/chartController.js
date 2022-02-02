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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var chartDataModel_1 = require("./chartDataModel");
var ag_charts_community_1 = require("ag-charts-community");
var ChartController = /** @class */ (function (_super) {
    __extends(ChartController, _super);
    function ChartController(model) {
        var _this = _super.call(this) || this;
        _this.model = model;
        return _this;
    }
    ChartController.prototype.init = function () {
        var _this = this;
        this.setChartRange();
        this.addManagedListener(this.eventService, core_1.Events.EVENT_RANGE_SELECTION_CHANGED, function (event) {
            if (event.id && event.id === _this.model.chartId) {
                _this.updateForRangeChange();
            }
        });
        if (this.model.unlinked) {
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    };
    ChartController.prototype.updateForGridChange = function () {
        if (this.model.unlinked) {
            return;
        }
        this.model.updateCellRanges();
        this.setChartRange();
    };
    ChartController.prototype.updateForDataChange = function () {
        if (this.model.unlinked) {
            return;
        }
        this.model.updateData();
        this.raiseChartUpdatedEvent();
    };
    ChartController.prototype.updateForRangeChange = function () {
        this.updateForGridChange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.updateForPanelChange = function (updatedCol) {
        this.model.updateCellRanges(updatedCol);
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.getChartModel = function () {
        var modelType = this.model.pivotChart ? 'pivot' : 'range';
        return {
            modelType: modelType,
            chartId: this.model.chartId,
            chartType: this.model.chartType,
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions(),
            cellRange: this.getCellRangeParams(),
            suppressChartRanges: this.model.suppressChartRanges,
            aggFunc: this.model.aggFunc,
            unlinkChart: this.model.unlinked,
        };
    };
    ChartController.prototype.getChartId = function () {
        return this.model.chartId;
    };
    ChartController.prototype.getChartData = function () {
        return this.model.chartData;
    };
    ChartController.prototype.getChartType = function () {
        return this.model.chartType;
    };
    ChartController.prototype.setChartType = function (chartType) {
        this.model.chartType = chartType;
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.setChartThemeName = function (chartThemeName) {
        this.model.chartThemeName = chartThemeName;
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.getChartThemeName = function () {
        return this.model.chartThemeName;
    };
    ChartController.prototype.isPivotChart = function () {
        return this.model.pivotChart;
    };
    ChartController.prototype.isPivotMode = function () {
        return this.model.isPivotMode();
    };
    ChartController.prototype.isGrouping = function () {
        return this.model.isGrouping();
    };
    ChartController.prototype.getThemes = function () {
        return this.gridOptionsWrapper.getChartThemes();
    };
    ChartController.prototype.getPalettes = function () {
        var _this = this;
        var themeNames = this.gridOptionsWrapper.getChartThemes();
        return themeNames.map(function (themeName) {
            var stockTheme = _this.chartProxy.isStockTheme(themeName);
            var theme = stockTheme ? themeName : _this.chartProxy.lookupCustomChartTheme(themeName);
            return ag_charts_community_1.getChartTheme(theme).palette;
        });
    };
    ChartController.prototype.getValueColState = function () {
        return this.model.valueColState.map(this.displayNameMapper.bind(this));
    };
    ChartController.prototype.getSelectedValueColState = function () {
        return this.getValueColState().filter(function (cs) { return cs.selected; });
    };
    ChartController.prototype.getDimensionColState = function () {
        return this.model.dimensionColState;
    };
    ChartController.prototype.getSelectedDimension = function () {
        return this.model.getSelectedDimension();
    };
    ChartController.prototype.displayNameMapper = function (col) {
        var columnNames = this.model.columnNames[col.colId];
        col.displayName = columnNames ? columnNames.join(' - ') : this.model.getColDisplayName(col.column);
        return col;
    };
    ChartController.prototype.getColStateForMenu = function () {
        return { dimensionCols: this.model.dimensionColState, valueCols: this.getValueColState() };
    };
    ChartController.prototype.isDefaultCategorySelected = function () {
        return this.model.getSelectedDimension().colId === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY;
    };
    ChartController.prototype.setChartRange = function (silent) {
        if (silent === void 0) { silent = false; }
        if (this.rangeService && !this.model.suppressChartRanges && !this.model.unlinked) {
            this.rangeService.setCellRanges(this.getCellRanges());
        }
        if (!silent) {
            this.raiseChartUpdatedEvent();
        }
    };
    ChartController.prototype.detachChartRange = function () {
        // when chart is detached it won't listen to changes from the grid
        this.model.unlinked = !this.model.unlinked;
        if (this.model.unlinked) {
            // remove range from grid
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }
        else {
            // update chart data may have changed
            this.updateForGridChange();
        }
    };
    ChartController.prototype.setChartProxy = function (chartProxy) {
        this.chartProxy = chartProxy;
    };
    ChartController.prototype.getChartProxy = function () {
        return this.chartProxy;
    };
    ChartController.prototype.isActiveXYChart = function () {
        return core_1._.includes(['scatter', 'bubble'], this.getChartType());
    };
    ChartController.prototype.isChartLinked = function () {
        return !this.model.unlinked;
    };
    ChartController.prototype.getCellRanges = function () {
        return [this.model.dimensionCellRange, this.model.valueCellRange].filter(function (r) { return r; });
    };
    ChartController.prototype.getCellRangeParams = function () {
        var cellRanges = this.getCellRanges();
        var firstCellRange = cellRanges[0];
        var startRow = (firstCellRange && firstCellRange.startRow) || null;
        var endRow = (firstCellRange && firstCellRange.endRow) || null;
        return {
            rowStartIndex: startRow && startRow.rowIndex,
            rowStartPinned: startRow && startRow.rowPinned,
            rowEndIndex: endRow && endRow.rowIndex,
            rowEndPinned: endRow && endRow.rowPinned,
            columns: cellRanges.reduce(function (columns, value) { return columns.concat(value.columns.map(function (c) { return c.getId(); })); }, [])
        };
    };
    ChartController.prototype.raiseChartUpdatedEvent = function () {
        var event = Object.freeze({
            type: ChartController.EVENT_CHART_UPDATED
        });
        this.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartOptionsChangedEvent = function () {
        var _a = this.getChartModel(), chartId = _a.chartId, chartType = _a.chartType;
        var event = Object.freeze({
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartId,
            chartType: chartType,
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartRangeSelectionChangedEvent = function () {
        var event = Object.freeze({
            type: core_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.chartId,
            chartId: this.model.chartId,
            cellRange: this.getCellRangeParams(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    };
    ChartController.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.rangeService) {
            this.rangeService.setCellRanges([]);
        }
    };
    ChartController.EVENT_CHART_UPDATED = 'chartUpdated';
    ChartController.EVENT_CHART_TYPE_CHANGED = 'chartTypeChanged';
    __decorate([
        core_1.Autowired('rangeService')
    ], ChartController.prototype, "rangeService", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], ChartController.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], ChartController.prototype, "columnApi", void 0);
    __decorate([
        core_1.PostConstruct
    ], ChartController.prototype, "init", null);
    return ChartController;
}(core_1.BeanStub));
exports.ChartController = ChartController;
//# sourceMappingURL=chartController.js.map