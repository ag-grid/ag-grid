import {_, ChartType, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {LegendPanel} from "./legend/legendPanel";
import {BarSeriesPanel} from "./series/barSeriesPanel";
import {AxisPanel} from "./axis/axisPanel";
import {LineSeriesPanel} from "./series/lineSeriesPanel";
import {PieSeriesPanel} from "./series/pieSeriesPanel";
import {ChartPanel} from "./chart/chartPanel";
import {AreaSeriesPanel} from "./series/areaSeriesPanel";
import {ScatterSeriesPanel} from "./series/scatterSeriesPanel";

export class ChartFormattingPanel extends Component {

    public static TEMPLATE = `<div class="ag-chart-format-wrapper"></div>`;

    @RefSelector('formatPanelWrapper') private formatPanelWrapper: HTMLElement;

    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

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

        this.addComponent(new ChartPanel(this.chartController));
        this.addComponent(new LegendPanel(this.chartController));

        const chartType = this.chartController.getChartType();

        if (this.isBarChart(chartType)) {
            this.addComponent(new AxisPanel(this.chartController));
            this.addComponent(new BarSeriesPanel(this.chartController));

        } else if (chartType === ChartType.Pie || chartType === ChartType.Doughnut) {
            this.addComponent(new PieSeriesPanel(this.chartController));

        } else if (chartType === ChartType.Line) {
            this.addComponent(new AxisPanel(this.chartController));
            this.addComponent(new LineSeriesPanel(this.chartController));

        } else if (chartType === ChartType.Scatter || chartType === ChartType.Bubble) {
            this.addComponent(new AxisPanel(this.chartController));
            this.addComponent(new ScatterSeriesPanel(this.chartController));

        } else if (chartType === ChartType.Area || chartType === ChartType.StackedArea || chartType === ChartType.NormalizedArea) {
            this.addComponent(new AxisPanel(this.chartController));
            this.addComponent(new AreaSeriesPanel(this.chartController));

        } else {
            console.warn(`ag-Grid: ChartFormattingPanel - unexpected chart type index: ${chartType} supplied`);
        }
    }

    private isBarChart(chartType: ChartType) {
        return [
            ChartType.GroupedColumn,
            ChartType.StackedColumn,
            ChartType.NormalizedColumn,
            ChartType.GroupedBar,
            ChartType.StackedBar,
            ChartType.NormalizedBar
        ].indexOf(chartType) > -1;
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
