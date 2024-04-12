import {
    _,
    ChartFormatPanel,
    ChartFormatPanelGroup,
    ChartPanelGroupDef,
    Component,
    PostConstruct,
    ChartType
} from "@ag-grid-community/core";
import { LegendPanel } from "./legend/legendPanel";
import { CartesianAxisPanel } from "./axis/cartesianAxisPanel";
import { PolarAxisPanel } from "./axis/polarAxisPanel";
import { ChartPanel } from "./chart/chartPanel";
import { SeriesPanel } from "./series/seriesPanel";
import { ChartSeriesType, isCartesian, isPolar } from "../../utils/seriesTypeMapper";
import { GradientLegendPanel } from './legend/gradientLegendPanel';
import { ChartPanelFeature } from "../chartPanelFeature";
import { ChartMenuContext } from "../chartMenuContext";

export interface FormatPanelOptions extends ChartMenuContext {
    isExpandedOnInit?: boolean,
    seriesType?: ChartSeriesType,
}

const DefaultFormatPanelDef: ChartFormatPanel = {
    groups: [
        { type: 'chart' },
        { type: 'legend' },
        { type: 'series' },
        { type: 'axis' },
    ]
};

export class FormatPanel extends Component {
    public static TEMPLATE = /* html */ `<div class="ag-chart-format-wrapper"></div>`;

    private chartPanelFeature: ChartPanelFeature;

    constructor(
        private readonly chartMenuContext: ChartMenuContext
    ) {
        super(FormatPanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.chartPanelFeature = this.createManagedBean(new ChartPanelFeature(
            this.chartMenuContext.chartController,
            this.getGui(),
            'ag-chart-format-section',
            (chartType, seriesType) => this.createPanels(chartType, seriesType)
        ));
        this.chartPanelFeature.refreshPanels();
    }

    private createPanels(chartType: ChartType, seriesType: ChartSeriesType) {
        this.getFormatPanelDef().groups?.forEach((groupDef: ChartPanelGroupDef<ChartFormatPanelGroup>) => {
            const group = groupDef.type;

            // ensure the group should be displayed for the current series type
            if (!this.isGroupPanelShownInSeries(group, seriesType)) {
                return;
            }

            const opts: FormatPanelOptions = {
                ...this.chartMenuContext,
                isExpandedOnInit: groupDef.isOpen,
                seriesType
            };

            switch (group) {
                case 'chart':
                    this.chartPanelFeature.addComponent(new ChartPanel(opts));
                    break;
                case 'legend':
                    // Some chart types require non-standard legend options, so choose the appropriate panel
                    const panel = ['treemap', 'sunburst', 'heatmap'].includes(chartType)
                        ? new GradientLegendPanel(opts)
                        : new LegendPanel(opts);
                    this.chartPanelFeature.addComponent(panel);
                    break;
                case 'axis':
                    // Polar charts have different axis options from cartesian charts, so choose the appropriate panels
                    if (isPolar(seriesType)) {
                        this.chartPanelFeature.addComponent(new PolarAxisPanel(opts));
                    } else if (isCartesian(seriesType)) {
                        this.chartPanelFeature.addComponent(new CartesianAxisPanel('xAxis', opts));
                        this.chartPanelFeature.addComponent(new CartesianAxisPanel('yAxis', opts));
                    }
                    break;
                case 'horizontalAxis':
                    this.chartPanelFeature.addComponent(new CartesianAxisPanel('xAxis', opts));
                    break;
                case 'verticalAxis':
                    this.chartPanelFeature.addComponent(new CartesianAxisPanel('yAxis', opts));
                    break;
                case 'series':
                    this.chartPanelFeature.addComponent(new SeriesPanel(opts));
                    break;
                case 'navigator':
                    _.warnOnce(`'navigator' is now displayed in the charts advanced settings instead of the format panel, and this setting will be ignored.`);
                default:
                    _.warnOnce(`Invalid charts format panel group name supplied: '${groupDef.type}'`);
            }
        });
    }

    private getFormatPanelDef() {
        const userProvidedFormatPanelDef = this.gos.get('chartToolPanelsDef')?.formatPanel;
        return userProvidedFormatPanelDef ? userProvidedFormatPanelDef : DefaultFormatPanelDef;
    }

    private isGroupPanelShownInSeries(group: ChartFormatPanelGroup, seriesType: ChartSeriesType): boolean {
        return ['chart', 'legend', 'series'].includes(group) ||
            (isCartesian(seriesType) && ['axis', 'horizontalAxis', 'verticalAxis'].includes(group)) ||
            (isPolar(seriesType) && group === 'axis');
    }
}
