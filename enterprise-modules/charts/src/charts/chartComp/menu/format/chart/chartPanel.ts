import {
    AgGroupComponentParams,
    AgSelect,
    Autowired,
    Component,
    Events,
    PostConstruct
} from "@ag-grid-community/core";
import { PaddingPanel } from "./paddingPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { BackgroundPanel } from "./backgroundPanel";
import TitlePanel from "./titlePanel";
import { FormatPanelOptions } from "../formatPanel";
import { ChartController } from "../../../chartController";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
import { ChartMenuService } from "../../../services/chartMenuService";
import { canSwitchDirection } from "../../../utils/seriesTypeMapper";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";

export class ChartPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="chartGroup"></ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuService') private chartMenuService: ChartMenuService;

    private readonly chartMenuParamsFactory: ChartMenuParamsFactory;
    private readonly chartController: ChartController;
    private readonly isExpandedOnInit: boolean;
    private readonly chartOptionsSeriesProxy: ChartOptionsProxy;
    private chartSeriesMenuParamsFactory: ChartMenuParamsFactory;
    private directionSelect?: AgSelect;

    constructor({
        chartController,
        chartMenuParamsFactory,
        isExpandedOnInit = false,
        chartOptionsService,
        seriesType
    }: FormatPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartMenuParamsFactory = chartMenuParamsFactory;
        this.chartOptionsSeriesProxy = chartOptionsService.getSeriesOptionsProxy(() => seriesType ?? this.chartController.getChartSeriesType());
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        this.chartSeriesMenuParamsFactory = this.createManagedBean(new ChartMenuParamsFactory(this.chartOptionsSeriesProxy));
        const chartGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('chart'),
            expanded: this.isExpandedOnInit,
            suppressEnabledCheckbox: true,
            items: [
                this.createManagedBean(new TitlePanel(this.chartMenuParamsFactory, this.chartController)),
                this.createManagedBean(new PaddingPanel(this.chartMenuParamsFactory, this.chartController)),
                this.createManagedBean(new BackgroundPanel(this.chartMenuParamsFactory)),
                ...this.createDirectionSelect()
            ]
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: chartGroupParams });
        this.addManagedListener(this.eventService, Events.EVENT_CHART_OPTIONS_CHANGED, () => this.refresh());
    }

    private refresh(): void {
        this.updateDirectionSelect();
    }

    private createDirectionSelect(): AgSelect[] {
        const enabled = !this.chartMenuService.isLegacyFormat();
        if (!enabled) { return []; }
        const options = ['horizontal', 'vertical'].map((value: 'horizontal' | 'vertical') => ({
            value,
            text: this.chartTranslationService.translate(value)
        }));
        const params = this.chartSeriesMenuParamsFactory.getDefaultSelectParams('direction', 'direction', options);
        params.labelWidth = 'flex';
        params.inputWidth = 'flex';
        const onValueChange = params.onValueChange;
        params.onValueChange = value => {
            onValueChange!(value);
            // series and axes configuration are based on direction
            this.chartController.raiseChartModelUpdateEvent();
        }
        this.directionSelect = this.createManagedBean(new AgSelect(params));
        this.updateDirectionSelect();
        return [this.directionSelect];
    }

    private updateDirectionSelect(): void {
        this.directionSelect?.setDisplayed(canSwitchDirection(this.chartController.getChartType()));
    }
}
