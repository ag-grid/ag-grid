import { _, ChartType, Component, PostConstruct } from "ag-grid-community";
import { ChartController } from "../../chartController";
import {LegendPanel} from "./legend/legendPanel";
import {BarSeriesPanel} from "./series/barSeriesPanel";
import {AxisPanel} from "./axis/axisPanel";
import {LineSeriesPanel} from "./series/lineSeriesPanel";
import {PieSeriesPanel} from "./series/pieSeriesPanel";
import {PaddingPanel} from "./padding/paddingPanel";

export class ChartFormattingPanel extends Component {

    public static TEMPLATE = `<div class="ag-chart-format-wrapper"></div>`;

    private readonly chartController: ChartController;

    private activePanels: Component[] = [];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartFormattingPanel.TEMPLATE);

        this.createFormatPanel();

        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.createFormatPanel.bind(this));
    }

    private createFormatPanel() {
        this.destroyActivePanels();

        const chartType = this.chartController.getChartType();

        if (chartType === ChartType.GroupedBar || chartType === ChartType.StackedBar) {
            this.createBarChartPanel();

        } else if (chartType === ChartType.Pie || chartType === ChartType.Doughnut) {
            this.createPieChartPanel();

        } else if (chartType === ChartType.Line) {
            this.createLineChartPanel();

        } else {
            console.warn(`ag-Grid: ChartFormattingPanel - unexpected chart type index: ${chartType} supplied`);
        }
    }

    private createBarChartPanel(): void {
        this.addComponent(new PaddingPanel(this.chartController));
        this.addComponent(new LegendPanel(this.chartController));
        this.addComponent(new BarSeriesPanel(this.chartController));
        this.addComponent(new AxisPanel(this.chartController));
    }

    private createLineChartPanel(): void {
        this.addComponent(new PaddingPanel(this.chartController));
        this.addComponent(new LegendPanel(this.chartController));
        this.addComponent(new LineSeriesPanel(this.chartController));
        this.addComponent(new AxisPanel(this.chartController));
    }

    private createPieChartPanel(): void {
        this.addComponent(new PaddingPanel(this.chartController));
        this.addComponent(new LegendPanel(this.chartController));
        this.addComponent(new PieSeriesPanel(this.chartController));
    }

    private addComponent(component: Component): void {
        this.getContext().wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.activePanels.push(component);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    }

    public destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}