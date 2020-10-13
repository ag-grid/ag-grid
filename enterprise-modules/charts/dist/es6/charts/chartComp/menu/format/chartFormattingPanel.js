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
import { _, ChartType, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { BarSeriesPanel } from "./series/barSeriesPanel";
import { AxisPanel } from "./axis/axisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { LineSeriesPanel } from "./series/lineSeriesPanel";
import { PieSeriesPanel } from "./series/pieSeriesPanel";
import { ChartPanel } from "./chart/chartPanel";
import { AreaSeriesPanel } from "./series/areaSeriesPanel";
import { ScatterSeriesPanel } from "./series/scatterSeriesPanel";
import { HistogramSeriesPanel } from "./series/histogramSeriesPanel";
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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    };
    ChartFormattingPanel.prototype.createPanels = function () {
        var chartType = this.chartController.getChartType();
        var isGrouping = this.chartController.isGrouping();
        if (chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }
        this.destroyPanels();
        this.addComponent(new ChartPanel(this.chartController));
        this.addComponent(new LegendPanel(this.chartController));
        switch (chartType) {
            case ChartType.GroupedColumn:
            case ChartType.StackedColumn:
            case ChartType.NormalizedColumn:
            case ChartType.GroupedBar:
            case ChartType.StackedBar:
            case ChartType.NormalizedBar:
                this.addComponent(new AxisPanel(this.chartController));
                this.addComponent(new NavigatorPanel(this.chartController));
                this.addComponent(new BarSeriesPanel(this.chartController));
                break;
            case ChartType.Pie:
            case ChartType.Doughnut:
                this.addComponent(new PieSeriesPanel(this.chartController));
                break;
            case ChartType.Line:
                this.addComponent(new AxisPanel(this.chartController));
                this.addComponent(new NavigatorPanel(this.chartController));
                this.addComponent(new LineSeriesPanel(this.chartController));
                break;
            case ChartType.Scatter:
            case ChartType.Bubble:
                this.addComponent(new AxisPanel(this.chartController));
                this.addComponent(new NavigatorPanel(this.chartController));
                this.addComponent(new ScatterSeriesPanel(this.chartController));
                break;
            case ChartType.Area:
            case ChartType.StackedArea:
            case ChartType.NormalizedArea:
                this.addComponent(new AxisPanel(this.chartController));
                this.addComponent(new NavigatorPanel(this.chartController));
                this.addComponent(new AreaSeriesPanel(this.chartController));
                break;
            case ChartType.Histogram:
                this.addComponent(new AxisPanel(this.chartController));
                this.addComponent(new NavigatorPanel(this.chartController));
                this.addComponent(new HistogramSeriesPanel(this.chartController));
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
        _.addCssClass(component.getGui(), 'ag-chart-format-section');
        this.getGui().appendChild(component.getGui());
    };
    ChartFormattingPanel.prototype.destroyPanels = function () {
        var _this = this;
        this.panels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    ChartFormattingPanel.prototype.destroy = function () {
        this.destroyPanels();
        _super.prototype.destroy.call(this);
    };
    ChartFormattingPanel.TEMPLATE = "<div class=\"ag-chart-format-wrapper\"></div>";
    __decorate([
        PostConstruct
    ], ChartFormattingPanel.prototype, "init", null);
    return ChartFormattingPanel;
}(Component));
export { ChartFormattingPanel };
