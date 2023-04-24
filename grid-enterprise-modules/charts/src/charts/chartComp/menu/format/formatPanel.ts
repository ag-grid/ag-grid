import {
    _,
    ChartFormatPanel,
    ChartFormatPanelGroup,
    ChartType,
    Component,
    PostConstruct,
    ChartPanelGroupDef
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { LegendPanel } from "./legend/legendPanel";
import { AxisPanel } from "./axis/axisPanel";
import { NavigatorPanel } from "./navigator/navigatorPanel";
import { ChartPanel } from "./chart/chartPanel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { SeriesPanel } from "./series/seriesPanel";
import { ChartSeriesType, getSeriesType } from "../../utils/seriesTypeMapper";

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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.createPanels.bind(this));
    }

    private createPanels() {
        const chartType = this.chartController.getChartType();
        const isGrouping = this.chartController.isGrouping();
        const seriesType = getSeriesType(chartType);

        if (chartType === this.chartType && isGrouping === this.isGrouping) {
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
                this.addComponent(new LegendPanel(opts));

            } else if (group === 'axis') {
                this.addComponent(new AxisPanel(opts));

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

    private isGroupPanelShownInSeries = (group: ChartFormatPanelGroup, seriesType: ChartSeriesType) => {
        const commonGroupPanels = ['chart', 'legend', 'series'];
        if (commonGroupPanels.includes(group)) {
            return true;
        }

        const cartesianOnlyGroupPanels = ['axis', 'navigator'];
        const cartesianSeries = ['bar', 'column', 'line', 'area', 'scatter', 'histogram', 'cartesian'];
        return !!(cartesianOnlyGroupPanels.includes(group) && cartesianSeries.includes(seriesType));
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
