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
var chartController_1 = require("../../chartController");
var legendPanel_1 = require("./legend/legendPanel");
var barSeriesPanel_1 = require("./series/barSeriesPanel");
var axisPanel_1 = require("./axis/axisPanel");
var navigatorPanel_1 = require("./navigator/navigatorPanel");
var lineSeriesPanel_1 = require("./series/lineSeriesPanel");
var pieSeriesPanel_1 = require("./series/pieSeriesPanel");
var chartPanel_1 = require("./chart/chartPanel");
var areaSeriesPanel_1 = require("./series/areaSeriesPanel");
var scatterSeriesPanel_1 = require("./series/scatterSeriesPanel");
var histogramSeriesPanel_1 = require("./series/histogramSeriesPanel");
var ChartFormattingPanel = /** @class */ (function (_super) {
    __extends(ChartFormattingPanel, _super);
    function ChartFormattingPanel(chartController) {
        var _this = _super.call(this, ChartFormattingPanel.TEMPLATE) || this;
        _this.panels = [];
        _this.chartController = chartController;
        return _this;
    }
    ChartFormattingPanel.prototype.init = function () {
        this.createPanels();
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    };
    ChartFormattingPanel.prototype.createPanels = function () {
        var chartType = this.chartController.getChartType();
        var isGrouping = this.chartController.isGrouping();
        if (chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }
        this.destroyPanels();
        this.addComponent(new chartPanel_1.ChartPanel(this.chartController));
        this.addComponent(new legendPanel_1.LegendPanel(this.chartController));
        switch (chartType) {
            case core_1.ChartType.GroupedColumn:
            case core_1.ChartType.StackedColumn:
            case core_1.ChartType.NormalizedColumn:
            case core_1.ChartType.GroupedBar:
            case core_1.ChartType.StackedBar:
            case core_1.ChartType.NormalizedBar:
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartController));
                this.addComponent(new barSeriesPanel_1.BarSeriesPanel(this.chartController));
                break;
            case core_1.ChartType.Pie:
            case core_1.ChartType.Doughnut:
                this.addComponent(new pieSeriesPanel_1.PieSeriesPanel(this.chartController));
                break;
            case core_1.ChartType.Line:
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartController));
                this.addComponent(new lineSeriesPanel_1.LineSeriesPanel(this.chartController));
                break;
            case core_1.ChartType.Scatter:
            case core_1.ChartType.Bubble:
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartController));
                this.addComponent(new scatterSeriesPanel_1.ScatterSeriesPanel(this.chartController));
                break;
            case core_1.ChartType.Area:
            case core_1.ChartType.StackedArea:
            case core_1.ChartType.NormalizedArea:
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartController));
                this.addComponent(new areaSeriesPanel_1.AreaSeriesPanel(this.chartController));
                break;
            case core_1.ChartType.Histogram:
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartController));
                this.addComponent(new histogramSeriesPanel_1.HistogramSeriesPanel(this.chartController));
                break;
            default:
                console.warn("ag-Grid: ChartFormattingPanel - unexpected chart type index: " + chartType + " supplied");
        }
        this.chartType = chartType;
        this.isGrouping = isGrouping;
    };
    ChartFormattingPanel.prototype.addComponent = function (component) {
        this.createBean(component);
        this.panels.push(component);
        core_1._.addCssClass(component.getGui(), 'ag-chart-format-section');
        this.getGui().appendChild(component.getGui());
    };
    ChartFormattingPanel.prototype.destroyPanels = function () {
        var _this = this;
        this.panels.forEach(function (panel) {
            core_1._.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    ChartFormattingPanel.prototype.destroy = function () {
        this.destroyPanels();
        _super.prototype.destroy.call(this);
    };
    ChartFormattingPanel.TEMPLATE = "<div class=\"ag-chart-format-wrapper\"></div>";
    __decorate([
        core_1.PostConstruct
    ], ChartFormattingPanel.prototype, "init", null);
    return ChartFormattingPanel;
}(core_1.Component));
exports.ChartFormattingPanel = ChartFormattingPanel;
//# sourceMappingURL=chartFormattingPanel.js.map