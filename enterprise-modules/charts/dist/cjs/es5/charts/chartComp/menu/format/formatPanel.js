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
var axisPanel_1 = require("./axis/axisPanel");
var navigatorPanel_1 = require("./navigator/navigatorPanel");
var chartPanel_1 = require("./chart/chartPanel");
var seriesPanel_1 = require("./series/seriesPanel");
function getMaxValue(currentValue, defaultMaxValue) {
    return Math.max(currentValue, defaultMaxValue);
}
exports.getMaxValue = getMaxValue;
var FormatPanel = /** @class */ (function (_super) {
    __extends(FormatPanel, _super);
    function FormatPanel(chartController, chartOptionsService) {
        var _this = _super.call(this, FormatPanel.TEMPLATE) || this;
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.panels = [];
        return _this;
    }
    FormatPanel.prototype.init = function () {
        this.createPanels();
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    };
    FormatPanel.prototype.createPanels = function () {
        var chartType = this.chartController.getChartType();
        var isGrouping = this.chartController.isGrouping();
        if (chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }
        this.destroyPanels();
        this.addComponent(new chartPanel_1.ChartPanel(this.chartOptionsService));
        this.addComponent(new legendPanel_1.LegendPanel(this.chartOptionsService));
        switch (chartType) {
            case 'groupedColumn':
            case 'stackedColumn':
            case 'normalizedColumn':
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new seriesPanel_1.SeriesPanel(this.chartController, this.chartOptionsService, 'column'));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartOptionsService));
                break;
            case 'groupedBar':
            case 'stackedBar':
            case 'normalizedBar':
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new seriesPanel_1.SeriesPanel(this.chartController, this.chartOptionsService, 'bar'));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartOptionsService));
                break;
            case 'pie':
            case 'doughnut':
                this.addComponent(new seriesPanel_1.SeriesPanel(this.chartController, this.chartOptionsService, 'pie'));
                break;
            case 'line':
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new seriesPanel_1.SeriesPanel(this.chartController, this.chartOptionsService, 'line'));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartOptionsService));
                break;
            case 'scatter':
            case 'bubble':
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new seriesPanel_1.SeriesPanel(this.chartController, this.chartOptionsService, 'scatter'));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartOptionsService));
                break;
            case 'area':
            case 'stackedArea':
            case 'normalizedArea':
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new seriesPanel_1.SeriesPanel(this.chartController, this.chartOptionsService, 'area'));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartOptionsService));
                break;
            case 'histogram':
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new seriesPanel_1.SeriesPanel(this.chartController, this.chartOptionsService, 'histogram'));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartOptionsService));
                break;
            case 'columnLineCombo':
            case 'areaColumnCombo':
            case 'customCombo':
                this.addComponent(new axisPanel_1.AxisPanel(this.chartController, this.chartOptionsService));
                // there is no single series type supplied for combo charts, it is inferred by the Series Panel
                this.addComponent(new seriesPanel_1.SeriesPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new navigatorPanel_1.NavigatorPanel(this.chartOptionsService));
                break;
            default:
                // warn vanilla javascript users when they supply invalid chart type
                console.warn("AG Grid: ChartFormattingPanel - unexpected chart type index: " + chartType + " supplied");
        }
        this.chartType = chartType;
        this.isGrouping = isGrouping;
    };
    FormatPanel.prototype.addComponent = function (component) {
        this.createBean(component);
        this.panels.push(component);
        component.addCssClass('ag-chart-format-section');
        this.getGui().appendChild(component.getGui());
    };
    FormatPanel.prototype.destroyPanels = function () {
        var _this = this;
        this.panels.forEach(function (panel) {
            core_1._.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    FormatPanel.prototype.destroy = function () {
        this.destroyPanels();
        _super.prototype.destroy.call(this);
    };
    FormatPanel.TEMPLATE = "<div class=\"ag-chart-format-wrapper\"></div>";
    __decorate([
        core_1.PostConstruct
    ], FormatPanel.prototype, "init", null);
    return FormatPanel;
}(core_1.Component));
exports.FormatPanel = FormatPanel;
