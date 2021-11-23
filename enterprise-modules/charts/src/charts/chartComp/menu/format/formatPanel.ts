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
import { ChartOptionsService } from "../../chartOptionsService";

export function getMaxValue(currentValue: number, defaultMaxValue: number) {
    return Math.max(currentValue, defaultMaxValue);
}

export class FormatPanel extends Component {
    public static TEMPLATE = /* html */ `<div class="ag-chart-format-wrapper"></div>`;

    private chartType: ChartType;
    private isGrouping: boolean;
    private panels: Component[] = [];

    constructor(
        private readonly chartController: ChartController,
        private readonly chartOptionsService: ChartOptionsService) {
            super(FormatPanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.createPanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    }

    private createPanels() {
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
            case ChartType.GroupedColumn:
            case ChartType.StackedColumn:
            case ChartType.NormalizedColumn:
            case ChartType.GroupedBar:
            case ChartType.StackedBar:
            case ChartType.NormalizedBar:
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new BarSeriesPanel(this.chartOptionsService));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case ChartType.Pie:
            case ChartType.Doughnut:
                this.addComponent(new PieSeriesPanel(this.chartOptionsService));
                break;
            case ChartType.Line:
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new LineSeriesPanel(this.chartOptionsService));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case ChartType.Scatter:
            case ChartType.Bubble:
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new ScatterSeriesPanel(this.chartOptionsService));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case ChartType.Area:
            case ChartType.StackedArea:
            case ChartType.NormalizedArea:
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new AreaSeriesPanel(this.chartOptionsService));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            case ChartType.Histogram:
                this.addComponent(new AxisPanel(this.chartController, this.chartOptionsService));
                this.addComponent(new HistogramSeriesPanel(this.chartOptionsService));
                this.addComponent(new NavigatorPanel(this.chartOptionsService));
                break;
            default:
                console.warn(`AG Grid: ChartFormattingPanel - unexpected chart type index: ${chartType} supplied`);
        }

        this.chartType = chartType;
        this.isGrouping = isGrouping;
    }

    private addComponent(component: Component): void {
        this.createBean(component);
        this.panels.push(component);
        component.addCssClass('ag-chart-format-section');
        this.getGui().appendChild(component.getGui());
    }

    private destroyPanels(): void {
        this.panels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyPanels();
        super.destroy();
    }
}
