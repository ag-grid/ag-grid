import {
    _,
    ChartFormatPanel,
    ChartFormatPanelGroup,
    ChartPanelGroupDef,
    ChartType,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { CartesianAxisPanel } from "./axis/cartesianAxisPanel";
import { PolarAxisPanel } from "./axis/polarAxisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { ChartPanel } from "./chart/chartPanel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { SeriesPanel } from "./series/seriesPanel";
import { ChartSeriesType, getSeriesType, hasGradientLegend, isPolar } from "../../utils/seriesTypeMapper";
import { GradientLegendPanel } from './legend/gradientLegendPanel';

export interface FormatPanelOptions {
    chartController: ChartController,
    chartOptionsService: ChartOptionsService,
    isExpandedOnInit?: boolean,
    seriesType?: ChartSeriesType,
}

export function getMaxValue(currentValue: number, defaultMaxValue: number) {
    return Math.max(currentValue, defaultMaxValue);
}

const DefaultFormatPanelDef: ChartFormatPanel = {
    groups: [
        { type: 'chart' },
        { type: 'legend' },
        { type: 'series' },
        { type: 'axis' },
        { type: 'navigator' },
    ]
};

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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, () => this.createPanels(true));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, () => this.createPanels(false));
    }

    private createPanels(reuse?: boolean) {
        const chartType = this.chartController.getChartType();
        const isGrouping = this.chartController.isGrouping();
        const seriesType = getSeriesType(chartType);

        if (reuse && chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }

        this.destroyPanels();

        this.getFormatPanelDef().groups?.forEach((groupDef: ChartPanelGroupDef<ChartFormatPanelGroup>) => {
            const group = groupDef.type;

            // ensure the group should be displayed for the current series type
            if (!this.isGroupPanelShownInSeries(group, seriesType)) {
                return;
            }

            const opts: FormatPanelOptions = {
                chartController: this.chartController,
                chartOptionsService: this.chartOptionsService,
                isExpandedOnInit: groupDef.isOpen,
                seriesType
            };

            if (group === 'chart') {
                this.addComponent(new ChartPanel(opts));
            } else if (group === 'legend') {
                // Some chart types require non-standard legend options, so choose the appropriate panel
                const panel = hasGradientLegend(chartType) ? new GradientLegendPanel(opts) : new LegendPanel(opts);
                this.addComponent(panel);
            } else if (group === 'axis') {
                // Polar charts have different axis options from cartesian charts, so choose the appropriate panel
                const panel = isPolar(chartType) ? new PolarAxisPanel(opts) : new CartesianAxisPanel(opts);
                this.addComponent(panel);
            } else if (group === 'series') {
                this.addComponent(new SeriesPanel(opts));
            } else if (group === 'navigator') {
                this.addComponent(new NavigatorPanel(opts));
            } else {
                console.warn(`AG Grid: invalid charts format panel group name supplied: '${groupDef.type}'`);
            }
        });

        this.chartType = chartType;
        this.isGrouping = isGrouping;
    }

    private getFormatPanelDef() {
        const userProvidedFormatPanelDef = this.gridOptionsService.get('chartToolPanelsDef')?.formatPanel;
        return userProvidedFormatPanelDef ? userProvidedFormatPanelDef : DefaultFormatPanelDef;
    }

    private isGroupPanelShownInSeries = (group: ChartFormatPanelGroup, seriesType: ChartSeriesType): boolean => {
        // Determine whether the given panel group is shown depending on the active series type

        // These panel groups are always shown regardless of series type
        const commonGroupPanels = ['chart', 'legend', 'series'];
        if (commonGroupPanels.includes(group)) {
            return true;
        }

        // These panel groups depend on the selected series type
        const extendedGroupPanels: { [T in ChartSeriesType]?: Array<ChartFormatPanelGroup> } = {
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
        return extendedGroupPanels[seriesType]?.includes(group) ?? false;
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
        this.panels = [];
    }

    protected destroy(): void {
        this.destroyPanels();
        super.destroy();
    }
}
