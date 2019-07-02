import {_, ChartType, Component, PostConstruct, RefSelector} from "ag-grid-community";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { BarSeriesPanel } from "./series/barSeriesPanel";
import { AxisPanel } from "./axis/axisPanel";
import { LineSeriesPanel } from "./series/lineSeriesPanel";
import { PieSeriesPanel } from "./series/pieSeriesPanel";
import {ChartPanel} from "./chart/chartPanel";

export interface ExpandablePanel {
    expandPanel(expanded: boolean): void;
    setExpandedCallback(expandedCallback: () => void): void;
}

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
        const chartPanel = new ChartPanel(this.chartController);
        this.addComponent(chartPanel);

        const legendPanel = new LegendPanel(this.chartController);
        this.addComponent(legendPanel);

        const barSeriesPanel = new BarSeriesPanel(this.chartController);
        this.addComponent(barSeriesPanel);

        const axisPanel = new AxisPanel(this.chartController);
        this.addComponent(axisPanel);

        this.addExpandedCallback(chartPanel, [legendPanel, barSeriesPanel, axisPanel]);
        this.addExpandedCallback(legendPanel, [barSeriesPanel, axisPanel, chartPanel]);
        this.addExpandedCallback(barSeriesPanel, [legendPanel, axisPanel, chartPanel]);
        this.addExpandedCallback(axisPanel, [legendPanel, barSeriesPanel, chartPanel]);
    }

    private createLineChartPanel(): void {
        const chartPanel = new ChartPanel(this.chartController);
        this.addComponent(chartPanel);

        const legendPanel = new LegendPanel(this.chartController);
        this.addComponent(legendPanel);

        const lineSeriesPanel = new LineSeriesPanel(this.chartController);
        this.addComponent(lineSeriesPanel);

        const axisPanel = new AxisPanel(this.chartController);
        this.addComponent(axisPanel);

        this.addExpandedCallback(chartPanel, [legendPanel, lineSeriesPanel, axisPanel]);
        this.addExpandedCallback(legendPanel, [lineSeriesPanel, axisPanel, chartPanel]);
        this.addExpandedCallback(lineSeriesPanel, [legendPanel, axisPanel, chartPanel]);
        this.addExpandedCallback(axisPanel, [legendPanel, lineSeriesPanel, chartPanel]);
    }

    private createPieChartPanel(): void {
        const chartPanel = new ChartPanel(this.chartController);
        this.addComponent(chartPanel);

        const legendPanel = new LegendPanel(this.chartController);
        this.addComponent(legendPanel);

        const pieSeriesPanel = new PieSeriesPanel(this.chartController);
        this.addComponent(pieSeriesPanel);

        this.addExpandedCallback(chartPanel, [legendPanel, pieSeriesPanel]);
        this.addExpandedCallback(legendPanel, [pieSeriesPanel, chartPanel]);
        this.addExpandedCallback(pieSeriesPanel, [legendPanel, chartPanel]);
    }

    private addComponent(component: Component): void {
        this.getContext().wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.activePanels.push(component);
    }

    private addExpandedCallback<T extends Component & ExpandablePanel>(groupPanel: T, subPanels: ExpandablePanel[]) {
        groupPanel.setExpandedCallback(() => {
            subPanels.forEach(subPanel => subPanel.expandPanel(false));
            groupPanel.getGui().scrollIntoView({ behavior: 'smooth'});
        });
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