// ag-grid-enterprise v21.0.1
"use strict";
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
var rangeController_1 = require("../rangeController");
var gridChartComp_1 = require("./chartComp/gridChartComp");
var RangeChartService = /** @class */ (function () {
    function RangeChartService() {
        // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
        // those in developer provided containers.
        this.activeCharts = [];
    }
    RangeChartService.prototype.chartCurrentRange = function (chartType) {
        if (chartType === void 0) { chartType = ag_grid_community_1.ChartType.GroupedBar; }
        var selectedRange = this.getSelectedRange();
        return this.chartRange(selectedRange, chartType);
    };
    RangeChartService.prototype.chartCellRange = function (params) {
        var cellRange = this.rangeController.createCellRangeFromCellRangeParams(params.cellRange);
        if (!cellRange) {
            console.warn("ag-Grid - unable to chart as no range is selected");
            return;
        }
        var chartType;
        switch (params.chartType) {
            case 'groupedBar':
                chartType = ag_grid_community_1.ChartType.GroupedBar;
                break;
            case 'stackedBar':
                chartType = ag_grid_community_1.ChartType.StackedBar;
                break;
            case 'pie':
                chartType = ag_grid_community_1.ChartType.Pie;
                break;
            case 'doughnut':
                chartType = ag_grid_community_1.ChartType.Doughnut;
                break;
            case 'line':
                chartType = ag_grid_community_1.ChartType.Line;
                break;
            default:
                chartType = ag_grid_community_1.ChartType.GroupedBar;
        }
        if (cellRange) {
            return this.chartRange(cellRange, chartType, params.chartContainer, params.suppressChartRanges, params.aggregate, params.processChartOptions);
        }
    };
    RangeChartService.prototype.chartRange = function (cellRange, chartType, container, suppressChartRanges, aggregate, processChartOptions) {
        var _this = this;
        if (suppressChartRanges === void 0) { suppressChartRanges = false; }
        if (aggregate === void 0) { aggregate = false; }
        var createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();
        var params = {
            cellRange: cellRange,
            chartType: chartType,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges: suppressChartRanges,
            aggregate: aggregate,
            processChartOptions: processChartOptions,
            height: 400,
            width: 800 //TODO
        };
        var chartComp = new gridChartComp_1.GridChartComp(params);
        this.context.wireBean(chartComp);
        var chartRef = this.createChartRef(chartComp);
        if (container) {
            // if container exists, means developer initiated chart create via API, so place in provided container
            container.appendChild(chartComp.getGui());
        }
        else if (createChartContainerFunc) {
            // otherwise user created chart via grid UI, check if developer provides containers (eg if the application
            // is using it's own dialog's rather than the grid provided dialogs)
            createChartContainerFunc(chartRef);
        }
        else {
            // add listener to remove from active charts list when charts are destroyed, e.g. closing chart dialog
            chartComp.addEventListener(gridChartComp_1.GridChartComp.EVENT_DESTROYED, function () {
                ag_grid_community_1._.removeFromArray(_this.activeCharts, chartRef);
            });
        }
        return chartRef;
    };
    RangeChartService.prototype.createChartRef = function (chartComp) {
        var _this = this;
        var chartRef = {
            destroyChart: function () {
                if (_this.activeCharts.indexOf(chartRef) >= 0) {
                    chartComp.destroy();
                    ag_grid_community_1._.removeFromArray(_this.activeCharts, chartRef);
                }
            },
            chartElement: chartComp.getGui()
        };
        this.activeCharts.push(chartRef);
        return chartRef;
    };
    RangeChartService.prototype.getSelectedRange = function () {
        var ranges = this.rangeController.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {};
    };
    RangeChartService.prototype.destroyAllActiveCharts = function () {
        // we take copy as the forEach is removing from the array as we process
        var activeCharts = this.activeCharts.slice();
        activeCharts.forEach(function (chart) { return chart.destroyChart(); });
    };
    __decorate([
        ag_grid_community_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], RangeChartService.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('context'),
        __metadata("design:type", ag_grid_community_1.Context)
    ], RangeChartService.prototype, "context", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], RangeChartService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RangeChartService.prototype, "destroyAllActiveCharts", null);
    RangeChartService = __decorate([
        ag_grid_community_1.Bean('rangeChartService')
    ], RangeChartService);
    return RangeChartService;
}());
exports.RangeChartService = RangeChartService;
