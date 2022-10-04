import { _, ChartType, Component, PostConstruct, ChartFormatPanelGroup, DEFAULT_FORMAT_PANEL_GROUPS_ORDER } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { AxisPanel } from "./axis/axisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { ChartPanel } from "./chart/chartPanel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { SeriesPanel } from "./series/seriesPanel";

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

        const groupsConfig: Record<string, {
            isOpen: boolean,
            index: number,
            panel: Component | undefined
        }> = {
            chart: {
                isOpen: this.groupIsOpen('chart'),
                index: this.groupIndex('chart'),
                panel: undefined
            },
            legend: {
                isOpen: this.groupIsOpen('legend'),
                index: this.groupIndex('legend'),
                panel: undefined
            },
            axis: {
                isOpen: this.groupIsOpen('axis'),
                index: this.groupIndex('axis'),
                panel: undefined
            },
            series: {
                isOpen: this.groupIsOpen('series'),
                index: this.groupIndex('series'),
                panel: undefined
            },
            navigator: {
                isOpen: this.groupIsOpen('navigator'),
                index: this.groupIndex('navigator'),
                panel: undefined
            }
        };

        groupsConfig.chart.panel = new ChartPanel({ chartOptionsService: this.chartOptionsService, isExpandedOnInit: groupsConfig.chart.isOpen });
        groupsConfig.legend.panel = new LegendPanel({ chartOptionsService: this.chartOptionsService, isExpandedOnInit: groupsConfig.legend.isOpen });

        switch (chartType) {
            case 'groupedColumn':
            case 'stackedColumn':
            case 'normalizedColumn':
                groupsConfig.axis.panel = new AxisPanel({
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.axis.isOpen
                });
                groupsConfig.series.panel = new SeriesPanel({ 
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    seriesType: 'column',
                    isExpandedOnInit: groupsConfig.series.isOpen
                });
                groupsConfig.navigator.panel = new NavigatorPanel({
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.navigator.isOpen
                });
                break;
            case 'groupedBar':
            case 'stackedBar':
            case 'normalizedBar':
                groupsConfig.axis.panel = new AxisPanel({
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.axis.isOpen
                });
                groupsConfig.series.panel = new SeriesPanel({ 
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    seriesType: 'bar',
                    isExpandedOnInit: groupsConfig.series.isOpen
                });
                groupsConfig.navigator.panel = new NavigatorPanel({
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.navigator.isOpen
                });
                break;
            case 'pie':
            case 'doughnut':
                groupsConfig.series.panel = new SeriesPanel({ 
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    seriesType: 'pie',
                    isExpandedOnInit: groupsConfig.series.isOpen
                });
                break;
            case 'line':
                groupsConfig.axis.panel = new AxisPanel({
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.axis.isOpen
                });
                groupsConfig.series.panel = new SeriesPanel({ 
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    seriesType: 'line',
                    isExpandedOnInit: groupsConfig.series.isOpen
                });
                groupsConfig.navigator.panel = new NavigatorPanel({
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.navigator.isOpen
                });
                break;
            case 'scatter':
            case 'bubble':
                groupsConfig.axis.panel = new AxisPanel({
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.axis.isOpen
                });
                groupsConfig.series.panel = new SeriesPanel({ 
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    seriesType: 'scatter',
                    isExpandedOnInit: groupsConfig.series.isOpen
                });
                groupsConfig.navigator.panel = new NavigatorPanel({
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.navigator.isOpen
                });
                break;
            case 'area':
            case 'stackedArea':
            case 'normalizedArea':
                groupsConfig.axis.panel = new AxisPanel({
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.axis.isOpen
                });
                groupsConfig.series.panel = new SeriesPanel({ 
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    seriesType: 'area',
                    isExpandedOnInit: groupsConfig.series.isOpen
                });
                groupsConfig.navigator.panel = new NavigatorPanel({
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.navigator.isOpen
                });
                break;
            case 'histogram':
                groupsConfig.axis.panel = new AxisPanel({
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.axis.isOpen
                });
                groupsConfig.series.panel = new SeriesPanel({ 
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    seriesType: 'histogram',
                    isExpandedOnInit: groupsConfig.series.isOpen
                });
                groupsConfig.navigator.panel = new NavigatorPanel({
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.navigator.isOpen
                });
                break;
            case 'columnLineCombo':
            case 'areaColumnCombo':
            case 'customCombo':
                groupsConfig.axis.panel = new AxisPanel({
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.axis.isOpen
                });
                // there is no single series type supplied for combo charts, it is inferred by the Series Panel
                groupsConfig.series.panel = new SeriesPanel({ 
                    chartController: this.chartController,
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.series.isOpen
                });
                groupsConfig.navigator.panel = new NavigatorPanel({
                    chartOptionsService: this.chartOptionsService,
                    isExpandedOnInit: groupsConfig.navigator.isOpen
                });
                break;
            default:
                // warn vanilla javascript users when they supply invalid chart type
                console.warn(`AG Grid: ChartFormattingPanel - unexpected chart type index: ${chartType} supplied`);
        }

        Object.values(groupsConfig)
            .filter(({ index }) => index >= 0) // Ignore groups not in grid options or default
            .filter(({ panel }) => panel !== undefined) // Ignore groups not part of chart type
            .sort((a, b) => a.index - b.index) // Sort by index
            .forEach(({ panel }) => this.addComponent(panel as Component)); // Add panel to components
        
        this.chartType = chartType;
        this.isGrouping = isGrouping;
    }

    private groupIsOpen(name: ChartFormatPanelGroup): boolean {
        const groups = this.gridOptionsWrapper.getChartToolPanelsDef()?.formatPanel?.groups || [];
        return groups.some(({ type, isOpen }) => type === name && isOpen);
    }

    /**
     * Get the group index from grid options `chartToolPanelsDef.formatPanel.groups`.
     * If it doesn't exist use the default groups order
     */
    private groupIndex(name: ChartFormatPanelGroup): number {
        const groups = this.gridOptionsWrapper.getChartToolPanelsDef()?.formatPanel?.groups;
        return groups
            ? groups.findIndex(({ type }) => type === name)
            : DEFAULT_FORMAT_PANEL_GROUPS_ORDER.findIndex(type => type === name);
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
