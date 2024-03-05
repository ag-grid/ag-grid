import {
    AgCheckbox,
    AgGroupComponent,
    AgSelect,
    Autowired,
    ChartType,
    Component,
    PostConstruct,
    SeriesChartType,
    _
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartTranslationKey, ChartTranslationService } from "../../services/chartTranslationService";

export class SeriesChartTypePanel extends Component {
    private static TEMPLATE = /* html */`<div id="seriesChartTypeGroup"></div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    private seriesChartTypeGroupComp: AgGroupComponent;
    private selectedColIds: string[] = [];

    constructor(
        private readonly chartController: ChartController,
        private columns: ColState[],
        private isOpen?: boolean
    ) {
        super(SeriesChartTypePanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.createSeriesChartTypeGroup(this.columns);
    }

    public refresh(columns: ColState[]): void {
        if (!_.areEqual(this.getValidColIds(columns), this.selectedColIds)) {
            this.recreate(columns);
        }
    }

    private recreate(columns: ColState[]): void {
        this.isOpen = this.seriesChartTypeGroupComp.isExpanded();
        _.clearElement(this.getGui());
        this.destroyBean(this.seriesChartTypeGroupComp);
        this.columns = columns;
        this.selectedColIds = [];
        this.init();
    }

    private getValidColIds(columns: ColState[]): string[] {
        const seriesChartTypes = this.chartController.getSeriesChartTypes();

        return columns.filter(col => col.selected && !!seriesChartTypes.filter(s => s.colId === col.colId)[0])
            .map(({ colId }) => colId);
    }

    private createSeriesChartTypeGroup(columns: ColState[]): void {
        this.seriesChartTypeGroupComp = this.createBean(new AgGroupComponent({
            title: this.chartTranslationService.translate('seriesChartType'),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data',
            expanded: this.isOpen
        }));

        const seriesChartTypes = this.chartController.getSeriesChartTypes();

        columns.forEach(col => {
            if (!col.selected) { return; }

            const seriesChartType: SeriesChartType = seriesChartTypes.filter(s => s.colId === col.colId)[0];
            if (!seriesChartType) { return; }

            this.selectedColIds.push(col.colId);

            const seriesItemGroup = this.seriesChartTypeGroupComp.createManagedBean(new AgGroupComponent({
                title: col.displayName!,
                enabled: true,
                suppressEnabledCheckbox: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-format-sub-level'
            }));

            const secondaryAxisComp = this.seriesChartTypeGroupComp
                .createManagedBean(new AgCheckbox({
                    label: this.chartTranslationService.translate('secondaryAxis'),
                    labelWidth: "flex",
                    disabled: ['groupedColumn', 'stackedColumn', 'stackedArea'].includes(seriesChartType.chartType),
                    value: !!seriesChartType.secondaryAxis,
                    onValueChange: (enabled: boolean) => this.chartController.updateSeriesChartType(col.colId, undefined, enabled)
                }));

            seriesItemGroup.addItem(secondaryAxisComp);

            const translate = (key: ChartTranslationKey) => {
                return this.chartTranslationService.translate(key);
            }

            const availableChartTypes = [
                { value: 'line', text: translate('line') },
                { value: 'area', text: translate('area') },
                { value: 'stackedArea', text: translate('stackedArea') },
                { value: 'groupedColumn', text: translate('groupedColumn') },
                { value: 'stackedColumn', text: translate('stackedColumn') },
            ];

            const chartTypeComp = seriesItemGroup.createManagedBean(new AgSelect({
                labelAlignment: 'left',
                labelWidth: "flex",
                options: availableChartTypes,
                value: seriesChartType.chartType,
                onValueChange: (chartType: ChartType) => this.chartController.updateSeriesChartType(col.colId, chartType)
            }));

            seriesItemGroup.addItem(chartTypeComp);

            this.seriesChartTypeGroupComp.addItem(seriesItemGroup);
        });

        this.getGui().appendChild(this.seriesChartTypeGroupComp.getGui());
    }

    protected destroy(): void {
        this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp)!;
        super.destroy();
    }
}
