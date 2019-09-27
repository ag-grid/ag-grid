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
var chartController_1 = require("../../chartController");
var legendPanel_1 = require("./legend/legendPanel");
var barSeriesPanel_1 = require("./series/barSeriesPanel");
var axisPanel_1 = require("./axis/axisPanel");
var lineSeriesPanel_1 = require("./series/lineSeriesPanel");
var pieSeriesPanel_1 = require("./series/pieSeriesPanel");
var chartPanel_1 = require("./chart/chartPanel");
var areaSeriesPanel_1 = require("./series/areaSeriesPanel");
var scatterSeriesPanel_1 = require("./series/scatterSeriesPanel");
var ChartFormattingPanel = /** @class */ (function (_super) {
    __extends(ChartFormattingPanel, _super);
    function ChartFormattingPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        return _this;
    }
    ChartFormattingPanel.prototype.init = function () {
        this.setTemplate(ChartFormattingPanel.TEMPLATE);
        this.createFormatPanel();
        this.addDestroyableEventListener(this.chartController, chartController_1.ChartController.EVENT_CHART_MODEL_UPDATED, this.createFormatPanel.bind(this));
    };
    ChartFormattingPanel.prototype.createFormatPanel = function () {
        this.destroyActivePanels();
        this.addComponent(new chartPanel_1.ChartPanel(this.chartController));
        this.addComponent(new legendPanel_1.LegendPanel(this.chartController));
        var chartType = this.chartController.getChartType();
        if (this.isBarChart(chartType)) {
            this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
            this.addComponent(new barSeriesPanel_1.BarSeriesPanel(this.chartController));
        }
        else if (chartType === ag_grid_community_1.ChartType.Pie || chartType === ag_grid_community_1.ChartType.Doughnut) {
            this.addComponent(new pieSeriesPanel_1.PieSeriesPanel(this.chartController));
        }
        else if (chartType === ag_grid_community_1.ChartType.Line) {
            this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
            this.addComponent(new lineSeriesPanel_1.LineSeriesPanel(this.chartController));
        }
        else if (chartType === ag_grid_community_1.ChartType.Scatter || chartType === ag_grid_community_1.ChartType.Bubble) {
            this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
            this.addComponent(new scatterSeriesPanel_1.ScatterSeriesPanel(this.chartController));
        }
        else if (chartType === ag_grid_community_1.ChartType.Area || chartType === ag_grid_community_1.ChartType.StackedArea || chartType === ag_grid_community_1.ChartType.NormalizedArea) {
            this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
            this.addComponent(new areaSeriesPanel_1.AreaSeriesPanel(this.chartController));
        }
        else {
            console.warn("ag-Grid: ChartFormattingPanel - unexpected chart type index: " + chartType + " supplied");
        }
    };
    ChartFormattingPanel.prototype.isBarChart = function (chartType) {
        return [
            ag_grid_community_1.ChartType.GroupedColumn,
            ag_grid_community_1.ChartType.StackedColumn,
            ag_grid_community_1.ChartType.NormalizedColumn,
            ag_grid_community_1.ChartType.GroupedBar,
            ag_grid_community_1.ChartType.StackedBar,
            ag_grid_community_1.ChartType.NormalizedBar
        ].indexOf(chartType) > -1;
    };
    ChartFormattingPanel.prototype.addComponent = function (component) {
        this.getContext().wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.activePanels.push(component);
    };
    ChartFormattingPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            ag_grid_community_1._.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    ChartFormattingPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    ChartFormattingPanel.TEMPLATE = "<div class=\"ag-chart-format-wrapper\"></div>";
    __decorate([
        ag_grid_community_1.RefSelector('formatPanelWrapper'),
        __metadata("design:type", HTMLElement)
    ], ChartFormattingPanel.prototype, "formatPanelWrapper", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartFormattingPanel.prototype, "init", null);
    return ChartFormattingPanel;
}(ag_grid_community_1.Component));
exports.ChartFormattingPanel = ChartFormattingPanel;
