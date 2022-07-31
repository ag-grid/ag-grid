"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const chartController_1 = require("../../chartController");
const legendPanel_1 = require("./legend/legendPanel");
const axisPanel_1 = require("./axis/axisPanel");
const navigatorPanel_1 = require("./navigator/navigatorPanel");
const chartPanel_1 = require("./chart/chartPanel");
const seriesPanel_1 = require("./series/seriesPanel");
function getMaxValue(currentValue, defaultMaxValue) {
    return Math.max(currentValue, defaultMaxValue);
}
exports.getMaxValue = getMaxValue;
class FormatPanel extends core_1.Component {
    constructor(chartController, chartOptionsService) {
        super(FormatPanel.TEMPLATE);
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.panels = [];
    }
    init() {
        this.createPanels();
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    }
    createPanels() {
        const chartType = this.chartController.getChartType();
        const isGrouping = this.chartController.isGrouping();
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
                console.warn(`AG Grid: ChartFormattingPanel - unexpected chart type index: ${chartType} supplied`);
        }
        this.chartType = chartType;
        this.isGrouping = isGrouping;
    }
    addComponent(component) {
        this.createBean(component);
        this.panels.push(component);
        component.addCssClass('ag-chart-format-section');
        this.getGui().appendChild(component.getGui());
    }
    destroyPanels() {
        this.panels.forEach(panel => {
            core_1._.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyPanels();
        super.destroy();
    }
}
FormatPanel.TEMPLATE = `<div class="ag-chart-format-wrapper"></div>`;
__decorate([
    core_1.PostConstruct
], FormatPanel.prototype, "init", null);
exports.FormatPanel = FormatPanel;
