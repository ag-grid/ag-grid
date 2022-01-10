import { _, ChartType, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { AxisPanel } from "./axis/axisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { ChartPanel } from "./chart/chartPanel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { SeriesPanel } from "./series/seriesPanel";
import { ChartSeriesType } from "../../utils/seriesTypeMapper";

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
            case 'groupedColumn':
            case 'stackedColumn':
            case 'normalizedColumn':
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
