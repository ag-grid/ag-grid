import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    Autowired,
    Component,
    Events,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { PaddingPanel } from "./paddingPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { BackgroundPanel } from "./backgroundPanel";
import { FormatPanelOptions } from "../formatPanel";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
import { canSwitchDirection } from "../../../utils/seriesTypeMapper";
import { ChartService } from "../../../../chartService";

export class ChartPanel extends Component {
    private static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="chartGroup"></ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly  chartTranslationService: ChartTranslationService;
    @Autowired('chartService') private readonly chartService: ChartService;
    @RefSelector('chartGroup') private readonly chartGroup: AgGroupComponent;

    private directionSelect?: AgSelect;

    constructor(private readonly options: FormatPanelOptions) {
        super();
    }

    @PostConstruct
    private init() {
        const { chartController, chartMenuParamsFactory, isExpandedOnInit: expanded, registerGroupComponent } = this.options;

        const chartGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('chartStyle'),
            expanded,
            suppressEnabledCheckbox: true,
            items: [
                this.createManagedBean(new PaddingPanel(chartMenuParamsFactory, chartController)),
                this.createManagedBean(new BackgroundPanel(chartMenuParamsFactory)),
                ...this.createDirectionSelect()
            ]
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: chartGroupParams });
        registerGroupComponent(this.chartGroup);
        this.addManagedListener(this.eventService, Events.EVENT_CHART_OPTIONS_CHANGED, () => this.refresh());
    }

    private refresh(): void {
        this.updateDirectionSelect();
    }

    private createDirectionSelect(): AgSelect[] {
        if (!this.chartService.isEnterprise()) { return []; }
        const { chartOptionsService, chartController, seriesType } = this.options;
        const chartOptionsSeriesProxy = chartOptionsService.getSeriesOptionsProxy(() => seriesType);
        const chartSeriesMenuParamsFactory = this.createManagedBean(new ChartMenuParamsFactory(chartOptionsSeriesProxy));
        const options = ['horizontal', 'vertical'].map((value: 'horizontal' | 'vertical') => ({
            value,
            text: this.chartTranslationService.translate(value)
        }));
        const params = chartSeriesMenuParamsFactory.getDefaultSelectParams('direction', 'direction', options);
        params.labelWidth = 'flex';
        params.inputWidth = 'flex';
        const onValueChange = params.onValueChange;
        params.onValueChange = value => {
            onValueChange!(value);
            // series and axes configuration are based on direction
            chartController.raiseChartModelUpdateEvent();
        }
        this.directionSelect = this.createManagedBean(new AgSelect(params));
        this.updateDirectionSelect();
        return [this.directionSelect];
    }

    private updateDirectionSelect(): void {
        this.directionSelect?.setDisplayed(canSwitchDirection(this.options.chartController.getChartType()));
    }
}
