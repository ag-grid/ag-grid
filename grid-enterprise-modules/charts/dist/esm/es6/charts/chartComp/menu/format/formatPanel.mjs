var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController.mjs";
import { LegendPanel } from "./legend/legendPanel.mjs";
import { CartesianAxisPanel } from "./axis/cartesianAxisPanel.mjs";
import { PolarAxisPanel } from "./axis/polarAxisPanel.mjs";
import { NavigatorPanel } from "./navigator/navigatorPanel.mjs";
import { ChartPanel } from "./chart/chartPanel.mjs";
import { SeriesPanel } from "./series/seriesPanel.mjs";
import { getSeriesType, hasGradientLegend, isPolar } from "../../utils/seriesTypeMapper.mjs";
import { GradientLegendPanel } from './legend/gradientLegendPanel.mjs';
export function getMaxValue(currentValue, defaultMaxValue) {
    return Math.max(currentValue, defaultMaxValue);
}
const DefaultFormatPanelDef = {
    groups: [
        { type: 'chart' },
        { type: 'legend' },
        { type: 'series' },
        { type: 'axis' },
        { type: 'navigator' },
    ]
};
export class FormatPanel extends Component {
    constructor(chartController, chartOptionsService) {
        super(FormatPanel.TEMPLATE);
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.panels = [];
        this.isGroupPanelShownInSeries = (group, seriesType) => {
            // Determine whether the given panel group is shown depending on the active series type
            var _a, _b;
            // These panel groups are always shown regardless of series type
            const commonGroupPanels = ['chart', 'legend', 'series'];
            if (commonGroupPanels.includes(group)) {
                return true;
            }
            // These panel groups depend on the selected series type
            const extendedGroupPanels = {
                'bar': ['axis', 'navigator'],
                'column': ['axis', 'navigator'],
                'line': ['axis', 'navigator'],
                'area': ['axis', 'navigator'],
                'scatter': ['axis', 'navigator'],
                'bubble': ['axis', 'navigator'],
                'histogram': ['axis', 'navigator'],
                'cartesian': ['axis', 'navigator'],
                'radial-column': ['axis'],
                'radial-bar': ['axis'],
                'radar-line': ['axis'],
                'radar-area': ['axis'],
                'nightingale': ['axis'],
                'range-bar': ['axis', 'navigator'],
                'range-area': ['axis', 'navigator'],
                'treemap': [],
                'sunburst': [],
                'heatmap': ['axis'],
                'waterfall': ['axis', 'navigator'],
                'box-plot': ['axis', 'navigator'],
            };
            return (_b = (_a = extendedGroupPanels[seriesType]) === null || _a === void 0 ? void 0 : _a.includes(group)) !== null && _b !== void 0 ? _b : false;
        };
    }
    init() {
        this.createPanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, () => this.createPanels(true));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, () => this.createPanels(false));
    }
    createPanels(reuse) {
        var _a;
        const chartType = this.chartController.getChartType();
        const isGrouping = this.chartController.isGrouping();
        const seriesType = getSeriesType(chartType);
        if (reuse && chartType === this.chartType && isGrouping === this.isGrouping) {
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
                this.addComponent(new ChartPanel(opts));
            }
            else if (group === 'legend') {
                // Some chart types require non-standard legend options, so choose the appropriate panel
                const panel = hasGradientLegend(chartType) ? new GradientLegendPanel(opts) : new LegendPanel(opts);
                this.addComponent(panel);
            }
            else if (group === 'axis') {
                // Polar charts have different axis options from cartesian charts, so choose the appropriate panel
                const panel = isPolar(chartType) ? new PolarAxisPanel(opts) : new CartesianAxisPanel(opts);
                this.addComponent(panel);
            }
            else if (group === 'series') {
                this.addComponent(new SeriesPanel(opts));
            }
            else if (group === 'navigator') {
                this.addComponent(new NavigatorPanel(opts));
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
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
        this.panels = [];
    }
    destroy() {
        this.destroyPanels();
        super.destroy();
    }
}
FormatPanel.TEMPLATE = `<div class="ag-chart-format-wrapper"></div>`;
__decorate([
    PostConstruct
], FormatPanel.prototype, "init", null);
