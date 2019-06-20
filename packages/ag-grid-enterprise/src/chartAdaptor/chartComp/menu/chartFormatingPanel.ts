import {_, ChartType, Component, PostConstruct} from "ag-grid-community";
import {ChartController} from "../chartController";
import {ChartPaddingPanel} from "./format/chartPaddingPanel";
import {ChartLegendPanel} from "./format/chartLegendPanel";
import {ChartSeriesPanel} from "./format/chartSeriesPanel";
import {ChartAxisPanel} from "./format/chartAxisPanel";

export class ChartFormattingPanel extends Component {

    public static TEMPLATE =
        `<div class="ag-chart-format-wrapper"></div>`;

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
            console.warn(`ag-Grid: ChartFormattingPanel - unexpected chart type: ${chartType} supplied`);
        }
    }

    private createBarChartPanel(): void {
        this.addComponent(new ChartPaddingPanel(this.chartController));
        this.addComponent(new ChartLegendPanel(this.chartController));
        this.addComponent(new ChartSeriesPanel(this.chartController));
        this.addComponent(new ChartAxisPanel(this.chartController));
    }

    private createLineChartPanel(): void {
        this.addComponent(new ChartPaddingPanel(this.chartController));
        this.addComponent(new ChartLegendPanel(this.chartController));
    }

    private createPieChartPanel(): void {
        this.addComponent(new ChartPaddingPanel(this.chartController));
        this.addComponent(new ChartLegendPanel(this.chartController));
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