import { _, ChartType, Component, PostConstruct } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { BarSeriesPanel } from "./series/barSeriesPanel";
import { AxisPanel } from "./axis/axisPanel";
import { LineSeriesPanel } from "./series/lineSeriesPanel";
import { PieSeriesPanel } from "./series/pieSeriesPanel";
import { ChartPanel } from "./chart/chartPanel";
import { AreaSeriesPanel } from "./series/areaSeriesPanel";
import { ScatterSeriesPanel } from "./series/scatterSeriesPanel";

export class ChartFormattingPanel extends Component {
    public static TEMPLATE = `<div class="ag-chart-format-wrapper"></div>`;

    private chartType: ChartType;
    private panels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartFormattingPanel.TEMPLATE);
        this.createPanels();
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.createPanels.bind(this));
    }

    private createPanels() {
        const chartType = this.chartController.getChartType();

        if (chartType === this.chartType) {
            // same chart type, so keep existing panels
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
                this.addComponent(new BarSeriesPanel(this.chartController));
                break;
            case ChartType.Pie:
            case ChartType.Doughnut:
                this.addComponent(new PieSeriesPanel(this.chartController));
                break;
            case ChartType.Line:
                this.addComponent(new AxisPanel(this.chartController));
                this.addComponent(new LineSeriesPanel(this.chartController));
                break;
            case ChartType.Scatter:
            case ChartType.Bubble:
                this.addComponent(new AxisPanel(this.chartController));
                this.addComponent(new ScatterSeriesPanel(this.chartController));
                break;
            case ChartType.Area:
            case ChartType.StackedArea:
            case ChartType.NormalizedArea:
                this.addComponent(new AxisPanel(this.chartController));
                this.addComponent(new AreaSeriesPanel(this.chartController));
                break;
            default:
                console.warn(`ag-Grid: ChartFormattingPanel - unexpected chart type index: ${chartType} supplied`);
        }

        this.chartType = chartType;
    }

    private addComponent(component: Component): void {
        this.wireBean(component);
        this.panels.push(component);
        this.getGui().appendChild(component.getGui());
    }

    private destroyPanels(): void {
        this.panels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    }

    public destroy(): void {
        this.destroyPanels();
        super.destroy();
    }
}
