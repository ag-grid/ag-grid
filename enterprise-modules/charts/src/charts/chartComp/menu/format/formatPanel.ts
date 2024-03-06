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
import { ChartMenuUtils } from '../chartMenuUtils';
import { LegendPanel } from "./legend/legendPanel";
import { AnimationPanel } from './animation/animationPanel';
import { CartesianAxisPanel } from "./axis/cartesianAxisPanel";
import { PolarAxisPanel } from "./axis/polarAxisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { ChartPanel } from "./chart/chartPanel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { CrosshairPanel } from './crosshair/crosshairPanel';
import { SeriesPanel } from "./series/seriesPanel";
import { ChartSeriesType, getSeriesType, hasGradientLegend, isPolar } from "../../utils/seriesTypeMapper";
import { GradientLegendPanel } from './legend/gradientLegendPanel';
import { ZoomPanel } from './zoom/zoomPanel';

export interface FormatPanelOptions {
    chartController: ChartController,
    chartOptionsService: ChartOptionsService,
    chartMenuUtils: ChartMenuUtils,
    chartAxisMenuUtils: ChartMenuUtils,
    isExpandedOnInit?: boolean,
    seriesType?: ChartSeriesType,
}

const DefaultFormatPanelDef: ChartFormatPanel = {
    groups: [
        { type: 'chart' },
        { type: 'legend' },
        { type: 'series' },
        { type: 'axis' },
        { type: 'navigator' },
        { type: 'zoom' },
        { type: 'animation' },
        { type: 'crosshair' },
    ]
};

export class FormatPanel extends Component {
    public static TEMPLATE = /* html */ `<div class="ag-chart-format-wrapper"></div>`;

    private readonly chartController: ChartController;
    private readonly chartOptionsService: ChartOptionsService;
    private readonly chartMenuUtils: ChartMenuUtils;
    private readonly chartAxisMenuUtils: ChartMenuUtils;

    private chartType: ChartType;
    private isGrouping: boolean;
    private panels: Component[] = [];

    constructor(options: {
        chartController: ChartController,
        chartOptionsService: ChartOptionsService,
        chartMenuUtils: ChartMenuUtils,
        chartAxisMenuUtils: ChartMenuUtils,
    }) {
        super(FormatPanel.TEMPLATE);
        this.chartController = options.chartController;
        this.chartOptionsService = options.chartOptionsService;
        this.chartMenuUtils = options.chartMenuUtils;
        this.chartAxisMenuUtils = options.chartAxisMenuUtils;
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
                chartMenuUtils: this.chartMenuUtils,
                chartAxisMenuUtils: this.chartAxisMenuUtils,
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
                // Polar charts have different axis options from cartesian charts, so choose the appropriate panels
                if (isPolar(chartType)) {
                    this.addComponent(new PolarAxisPanel(opts));
                } else {
                    this.addComponent(new CartesianAxisPanel('xAxis', opts));
                    this.addComponent(new CartesianAxisPanel('yAxis', opts));
                }
            } else if (group === 'series') {
                this.addComponent(new SeriesPanel(opts));
            } else if (group === 'navigator') {
                this.addComponent(new NavigatorPanel(opts));
            } else if (group === 'zoom') {
                this.addComponent(new ZoomPanel(opts));
            } else if (group === 'animation') {
                this.addComponent(new AnimationPanel(opts));
            } else if (group === 'crosshair') {
                this.addComponent(new CrosshairPanel(opts));
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
        const commonGroupPanels = ['chart', 'legend', 'series', 'zoom', 'animation'];
        if (commonGroupPanels.includes(group)) {
            return true;
        }

        // These panel groups depend on the selected series type
        const extendedGroupPanels: { [T in ChartSeriesType]?: Array<ChartFormatPanelGroup> } = {
            'bar': ['axis', 'navigator', 'crosshair'],
            'column': ['axis', 'navigator', 'crosshair'],
            'line': ['axis', 'navigator', 'crosshair'],
            'area': ['axis', 'navigator', 'crosshair'],
            'scatter': ['axis', 'navigator', 'crosshair'],
            'bubble': ['axis', 'navigator', 'crosshair'],
            'histogram': ['axis', 'navigator', 'crosshair'],
            'cartesian': ['axis', 'navigator', 'crosshair'],
            'radial-column': ['axis'],
            'radial-bar': ['axis'],
            'radar-line': ['axis'],
            'radar-area': ['axis'],
            'nightingale': ['axis'],
            'range-bar': ['axis', 'navigator', 'crosshair'],
            'range-area': ['axis', 'navigator', 'crosshair'],
            'treemap': [],
            'sunburst': [],
            'heatmap': ['axis'],
            'waterfall': ['axis', 'navigator', 'crosshair'],
            'box-plot': ['axis', 'navigator', 'crosshair'],
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
