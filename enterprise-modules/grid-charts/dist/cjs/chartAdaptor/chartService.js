"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-grid-community/grid-core");
var gridChartComp_1 = require("./chartComp/gridChartComp");
var ChartService = /** @class */ (function () {
    function ChartService() {
        // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
        // those in developer provided containers.
        this.activeCharts = [];
    }
    ChartService.prototype.createChartFromCurrentRange = function (chartType) {
        if (chartType === void 0) { chartType = grid_core_1.ChartType.GroupedColumn; }
        var selectedRange = this.getSelectedRange();
        return this.createChart(selectedRange, chartType);
    };
    ChartService.prototype.createRangeChart = function (params) {
        var cellRange = this.rangeController
            ? this.rangeController.createCellRangeFromCellRangeParams(params.cellRange)
            : undefined;
        if (!cellRange) {
            console.warn("ag-Grid - unable to create chart as no range is selected");
            return;
        }
        return this.createChart(cellRange, params.chartType, false, params.suppressChartRanges, params.chartContainer, params.aggFunc, params.processChartOptions);
    };
    ChartService.prototype.createPivotChart = function (params) {
        // if required enter pivot mode
        if (!this.columnController.isPivotMode()) {
            this.columnController.setPivotMode(true, "pivotChart");
        }
        // pivot chart range contains all visible column without a row range to include all rows
        var chartAllRangeParams = {
            columns: this.columnController.getAllDisplayedColumns().map(function (col) { return col.getColId(); })
        };
        var cellRange = this.rangeController
            ? this.rangeController.createCellRangeFromCellRangeParams(chartAllRangeParams)
            : undefined;
        if (!cellRange) {
            console.warn("ag-Grid - unable to create chart as there are no columns in the grid.");
            return;
        }
        return this.createChart(cellRange, params.chartType, true, true, params.chartContainer, undefined, params.processChartOptions);
    };
    ChartService.prototype.createChart = function (cellRange, chartType, pivotChart, suppressChartRanges, container, aggFunc, processChartOptions) {
        var _this = this;
        if (pivotChart === void 0) { pivotChart = false; }
        if (suppressChartRanges === void 0) { suppressChartRanges = false; }
        var createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();
        var params = {
            pivotChart: pivotChart,
            cellRange: cellRange,
            chartType: chartType,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges: suppressChartRanges,
            aggFunc: aggFunc,
            processChartOptions: processChartOptions,
        };
        var chartComp = new gridChartComp_1.GridChartComp(params);
        this.context.wireBean(chartComp);
        var chartRef = this.createChartRef(chartComp);
        if (container) {
            // if container exists, means developer initiated chart create via API, so place in provided container
            container.appendChild(chartComp.getGui());
            // if the chart container was placed outside of an element that
            // has the grid's theme, we manually add the current theme to
            // make sure all styles for the chartMenu are rendered correctly
            var theme = this.environment.getTheme();
            if (theme.el && !theme.el.contains(container)) {
                grid_core_1._.addCssClass(container, theme.theme);
            }
        }
        else if (createChartContainerFunc) {
            // otherwise user created chart via grid UI, check if developer provides containers (eg if the application
            // is using its own dialogs rather than the grid provided dialogs)
            createChartContainerFunc(chartRef);
        }
        else {
            // add listener to remove from active charts list when charts are destroyed, e.g. closing chart dialog
            chartComp.addEventListener(gridChartComp_1.GridChartComp.EVENT_DESTROYED, function () {
                grid_core_1._.removeFromArray(_this.activeCharts, chartRef);
            });
        }
        return chartRef;
    };
    ChartService.prototype.createChartRef = function (chartComp) {
        var _this = this;
        var chartRef = {
            destroyChart: function () {
                if (_this.activeCharts.indexOf(chartRef) >= 0) {
                    chartComp.destroy();
                    grid_core_1._.removeFromArray(_this.activeCharts, chartRef);
                }
            },
            chartElement: chartComp.getGui()
        };
        this.activeCharts.push(chartRef);
        return chartRef;
    };
    ChartService.prototype.getSelectedRange = function () {
        var ranges = this.rangeController.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {};
    };
    ChartService.prototype.destroyAllActiveCharts = function () {
        // we take copy as the forEach is removing from the array as we process
        var activeCharts = this.activeCharts.slice();
        activeCharts.forEach(function (chart) { return chart.destroyChart(); });
    };
    __decorate([
        grid_core_1.Optional('rangeController')
    ], ChartService.prototype, "rangeController", void 0);
    __decorate([
        grid_core_1.Autowired('columnController')
    ], ChartService.prototype, "columnController", void 0);
    __decorate([
        grid_core_1.Autowired('environment')
    ], ChartService.prototype, "environment", void 0);
    __decorate([
        grid_core_1.Autowired('context')
    ], ChartService.prototype, "context", void 0);
    __decorate([
        grid_core_1.Autowired('gridOptionsWrapper')
    ], ChartService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        grid_core_1.PreDestroy
    ], ChartService.prototype, "destroyAllActiveCharts", null);
    ChartService = __decorate([
        grid_core_1.Bean('chartService')
    ], ChartService);
    return ChartService;
}());
exports.ChartService = ChartService;
