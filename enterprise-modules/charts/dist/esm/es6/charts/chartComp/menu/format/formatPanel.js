var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { AxisPanel } from "./axis/axisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { ChartPanel } from "./chart/chartPanel";
import { SeriesPanel } from "./series/seriesPanel";
export function getMaxValue(currentValue, defaultMaxValue) {
    return Math.max(currentValue, defaultMaxValue);
}
export class FormatPanel extends Component {
    constructor(chartController, chartOptionsService) {
        super(FormatPanel.TEMPLATE);
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.panels = [];
    }
    init() {
        this.createPanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    }
    createPanels() {
        const chartType = this.chartController.getChartType();
        const isGrouping = this.chartController.isGrouping();
        if (chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }
        this.destroyPanels();
        this.addComponent(new ChartPanel(this.chartOptionsService));
        this.addComponent(new LegendPanel(this.chartOptionsService));
        switch (chartType) {
            case 'groupedColumn':
            case 'stackedColumn':
            case 'normalizedColumn':
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new SeriesPanel(this.chartController, this.chartOptionsService, 'column'));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case 'groupedBar':
            case 'stackedBar':
            case 'normalizedBar':
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new SeriesPanel(this.chartController, this.chartOptionsService, 'bar'));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case 'pie':
            case 'doughnut':
                this.addComponent(new SeriesPanel(this.chartController, this.chartOptionsService, 'pie'));
                break;
            case 'line':
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new SeriesPanel(this.chartController, this.chartOptionsService, 'line'));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case 'scatter':
            case 'bubble':
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new SeriesPanel(this.chartController, this.chartOptionsService, 'scatter'));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case 'area':
            case 'stackedArea':
            case 'normalizedArea':
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new SeriesPanel(this.chartController, this.chartOptionsService, 'area'));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case 'histogram':
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new SeriesPanel(this.chartController, this.chartOptionsService, 'histogram'));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case 'columnLineCombo':
            case 'areaColumnCombo':
            case 'customCombo':
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                // there is no single series type supplied for combo charts, it is inferred by the Series Panel
                this.addComponent(new SeriesPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
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
            _.removeFromParent(panel.getGui());
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
    PostConstruct
], FormatPanel.prototype, "init", null);
