// ag-grid-enterprise v20.2.0
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
var chart_1 = require("./chart");
var chartEverythingDatasource_1 = require("./chartEverythingDatasource");
var chartRangeDatasource_1 = require("./chartRangeDatasource");
var ChartingService = /** @class */ (function () {
    function ChartingService() {
    }
    ChartingService.prototype.showChartFromDatasource = function (ds) {
        var errors = ds.getErrors();
        if (errors && errors.length > 0) {
            var errorMessage = errors.join(' ');
            var popupMessageBox = new ag_grid_community_1.PopupMessageBox('Can Not Chart', errorMessage);
            this.context.wireBean(popupMessageBox);
            return;
        }
        var chart = new chart_1.Chart({
            height: 400,
            width: 800,
            datasource: ds
        });
        var popupWindow = new ag_grid_community_1.PopupWindow();
        this.context.wireBean(popupWindow);
        popupWindow.setBody(chart.getGui());
        popupWindow.setTitle('Chart');
        popupWindow.addEventListener(ag_grid_community_1.PopupWindow.EVENT_DESTROYED, function () {
            chart.destroy();
        });
    };
    ChartingService.prototype.chartEverything = function () {
        var ds = new chartEverythingDatasource_1.ChartEverythingDatasource();
        this.context.wireBean(ds);
        this.showChartFromDatasource(ds);
    };
    ChartingService.prototype.chartRange = function () {
        var ranges = this.rangeController.getCellRanges();
        if (!ranges) {
            return;
        }
        var range = ranges[0];
        if (!range) {
            return;
        }
        if (!range.columns) {
            return;
        }
        var ds = new chartRangeDatasource_1.ChartRangeDatasource(range);
        this.context.wireBean(ds);
        this.showChartFromDatasource(ds);
    };
    __decorate([
        ag_grid_community_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], ChartingService.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('popupService'),
        __metadata("design:type", ag_grid_community_1.PopupService)
    ], ChartingService.prototype, "popupService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ChartingService.prototype, "rowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('context'),
        __metadata("design:type", ag_grid_community_1.Context)
    ], ChartingService.prototype, "context", void 0);
    ChartingService = __decorate([
        ag_grid_community_1.Bean('chartingService')
    ], ChartingService);
    return ChartingService;
}());
exports.ChartingService = ChartingService;
