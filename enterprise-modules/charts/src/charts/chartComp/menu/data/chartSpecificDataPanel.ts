import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    Autowired,
    ChartMappings,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartService } from "../../../chartService";
import { ChartTranslationKey, ChartTranslationService } from "../../services/chartTranslationService";
import { canSwitchDirection, getSeriesType } from "../../utils/seriesTypeMapper";
import { ChartMenuContext } from "../chartMenuContext";
import { ChartMenuParamsFactory } from "../chartMenuParamsFactory";

export class ChartSpecificDataPanel extends Component {
    private static TEMPLATE = /* html */`
        <div id="chartSpecificGroup">
            <ag-group-component ref="chartSpecificGroup"></ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartService') private readonly chartService: ChartService;
    @RefSelector('chartSpecificGroup') private readonly chartSpecificGroup: AgGroupComponent;

    private directionSelect?: AgSelect;
    private groupTypeSelect?: AgSelect;
    private hasContent = false;

    constructor(
        private readonly chartMenuContext: ChartMenuContext,
        private isOpen?: boolean
    ) {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        const title = this.getTitle();
        const chartSpecificGroupParams: AgGroupComponentParams = {
            title,
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data',
            expanded: this.isOpen,
            items: [
                ...this.createDirectionSelect(),
                this.createGroupTypeSelect()
            ]
        }
        this.setTemplate(ChartSpecificDataPanel.TEMPLATE, {
            chartSpecificGroup: chartSpecificGroupParams
        });
        this.setDisplayed(this.hasContent);
    }

    public refresh(): void {
        this.hasContent = false;
        this.chartSpecificGroup.setTitle(this.getTitle());
        this.updateDirectionSelect();
        this.updateGroupTypeSelect();
        this.setDisplayed(this.hasContent);
    }

    private getTitle(): string {
        const chartType = this.chartMenuContext.chartController.getChartType();
        let key: ChartTranslationKey;
        switch (chartType) {
            case 'groupedColumn':
            case 'stackedColumn':
            case 'normalizedColumn':
            case 'groupedBar':
            case 'stackedBar':
            case 'normalizedBar':
            case 'stackedArea':
            case 'normalizedArea':
                key = `${chartType}Full`;
                break;
            case 'doughnut':
                key = 'donut';
                break;
            case 'areaColumnCombo':
                key = 'AreaColumnCombo';
                break;
            default:
                key = chartType;
        }
        return this.chartTranslationService.translate(key);
    }

    private createDirectionSelect(): AgSelect[] {
        if (!this.chartService.isEnterprise()) { return []; }
        const { chartOptionsService, chartController } = this.chartMenuContext;
        const chartOptionsSeriesProxy = chartOptionsService.getSeriesOptionsProxy(() => getSeriesType(chartController.getChartType()));
        const chartSeriesMenuParamsFactory = this.createManagedBean(new ChartMenuParamsFactory(chartOptionsSeriesProxy));
        const options = (['horizontal', 'vertical'] as const).map(value => ({
            value,
            text: this.chartTranslationService.translate(value)
        }));
        const params = chartSeriesMenuParamsFactory.getDefaultSelectParams('direction', 'direction', options);
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
        const isDisplayed = canSwitchDirection(this.chartMenuContext.chartController.getChartType());
        this.updateDisplayed(this.directionSelect, isDisplayed);
    }

    private createGroupTypeSelect(): AgSelect {
        const { chartController, chartMenuParamsFactory } = this.chartMenuContext;
        this.groupTypeSelect = this.createManagedBean(new AgSelect(
            chartMenuParamsFactory.getDefaultSelectParamsWithoutValueParams(
                'seriesGroupType',
                ChartMappings.SERIES_GROUP_TYPES.map(value => ({
                    value,
                    text: this.chartTranslationService.translate(`${value}SeriesGroupType`)
                })),
                chartController.getSeriesGroupType(),
                value => chartController.setSeriesGroupType(value)
            )
        ));
        this.updateGroupTypeSelect();
        return this.groupTypeSelect;
    }

    private updateGroupTypeSelect(): void {
        const isDisplayed = [
            'radialColumn', 'radialBar', 'nightingale'
        ].includes(this.chartMenuContext.chartController.getChartType());
        this.updateDisplayed(this.groupTypeSelect, isDisplayed);
    }

    private updateDisplayed(select: AgSelect | undefined, isDisplayed: boolean): void {
        select?.setDisplayed(isDisplayed);
        if (select) {
            this.hasContent = this.hasContent || isDisplayed;
        }
    }
}