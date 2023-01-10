"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatPanel = exports.getMaxValue = void 0;
const core_1 = require("@ag-grid-community/core");
const chartController_1 = require("../../chartController");
const legendPanel_1 = require("./legend/legendPanel");
const axisPanel_1 = require("./axis/axisPanel");
const navigatorPanel_1 = require("./navigator/navigatorPanel");
const chartPanel_1 = require("./chart/chartPanel");
const seriesPanel_1 = require("./series/seriesPanel");
const seriesTypeMapper_1 = require("../../utils/seriesTypeMapper");
function getMaxValue(currentValue, defaultMaxValue) {
    return Math.max(currentValue, defaultMaxValue);
}
exports.getMaxValue = getMaxValue;
const DefaultFormatPanelDef = {
    groups: [
        { type: 'chart' },
        { type: 'legend' },
        { type: 'series' },
        { type: 'axis' },
        { type: 'navigator' },
    ]
};
class FormatPanel extends core_1.Component {
    constructor(chartController, chartOptionsService) {
        super(FormatPanel.TEMPLATE);
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.panels = [];
        this.isGroupPanelShownInSeries = (group, seriesType) => {
            const commonGroupPanels = ['chart', 'legend', 'series'];
            if (commonGroupPanels.includes(group)) {
                return true;
            }
            const cartesianOnlyGroupPanels = ['axis', 'navigator'];
            const cartesianSeries = ['bar', 'column', 'line', 'area', 'scatter', 'histogram', 'cartesian'];
            return !!(cartesianOnlyGroupPanels.includes(group) && cartesianSeries.includes(seriesType));
        };
    }
    init() {
        this.createPanels();
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    }
    createPanels() {
        var _a;
        const chartType = this.chartController.getChartType();
        const isGrouping = this.chartController.isGrouping();
        const seriesType = seriesTypeMapper_1.getSeriesType(chartType);
        if (chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }
        this.destroyPanels();
        (_a = this.getFormatPanelDef().groups) === null || _a === void 0 ? void 0 : _a.forEach((groupDef) => {
            const group = groupDef.type;
            // ensure the group should be displayed for the current series type
            if (!this.isGroupPanelShownInSeries(group, seriesType)) {
                return;
            }
            const opts = {
                chartController: this.chartController,
                chartOptionsService: this.chartOptionsService,
                isExpandedOnInit: groupDef.isOpen,
                seriesType
            };
            if (group === 'chart') {
                this.addComponent(new chartPanel_1.ChartPanel(opts));
            }
            else if (group === 'legend') {
                this.addComponent(new legendPanel_1.LegendPanel(opts));
            }
            else if (group === 'axis') {
                this.addComponent(new axisPanel_1.AxisPanel(opts));
            }
            else if (group === 'series') {
                this.addComponent(new seriesPanel_1.SeriesPanel(opts));
            }
            else if (group === 'navigator') {
                this.addComponent(new navigatorPanel_1.NavigatorPanel(opts));
            }
            else {
                console.warn(`AG Grid: invalid charts format panel group name supplied: '${groupDef.type}'`);
            }
        });
        this.chartType = chartType;
        this.isGrouping = isGrouping;
    }
    getFormatPanelDef() {
        var _a;
        const userProvidedFormatPanelDef = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.formatPanel;
        return userProvidedFormatPanelDef ? userProvidedFormatPanelDef : DefaultFormatPanelDef;
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
