import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    Events,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";
import { AgChartPaddingOptions } from "ag-charts-community";
import { getSeriesType } from "../../../utils/seriesTypeMapper";
import { ChartController } from "../../../chartController";
import { AgChartOptions } from "ag-charts-community";

export class PaddingPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="chartPaddingGroup">
                <ag-slider ref="paddingTopSlider"></ag-slider>
                <ag-slider ref="paddingRightSlider"></ag-slider>
                <ag-slider ref="paddingBottomSlider"></ag-slider>
                <ag-slider ref="paddingLeftSlider"></ag-slider>
            </ag-group-component>
        <div>`;

    @RefSelector('chartPaddingGroup') private chartPaddingGroup: AgGroupComponent;
    @RefSelector('paddingTopSlider') private paddingTopSlider: AgSlider;
    @RefSelector('paddingRightSlider') private paddingRightSlider: AgSlider;
    @RefSelector('paddingBottomSlider') private paddingBottomSlider: AgSlider;
    @RefSelector('paddingLeftSlider') private paddingLeftSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(private readonly chartOptionsService: ChartOptionsService, private readonly chartController: ChartController) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(PaddingPanel.TEMPLATE, { chartPaddingGroup: groupParams });

        this.addManagedListener(this.eventService, Events.EVENT_CHART_OPTIONS_CHANGED, (e) => {
            this.updateTopPadding(e.chartOptions);
        });

        this.initGroup();
        this.initChartPaddingItems();
    }

    private initGroup(): void {
        this.chartPaddingGroup
            .setTitle(this.chartTranslationService.translate("padding"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
    }

    private initChartPaddingItems(): void {
        const initInput = (property: keyof AgChartPaddingOptions, input: AgSlider) => {
            const currentValue = this.chartOptionsService.getChartOption<number>('padding.' + property);
            input.setLabel(this.chartTranslationService.translate(property))
                .setMaxValue(getMaxValue(currentValue, 200))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setChartOption('padding.' + property, newValue));
        };

        initInput('top', this.paddingTopSlider);
        initInput('right', this.paddingRightSlider);
        initInput('bottom', this.paddingBottomSlider);
        initInput('left', this.paddingLeftSlider);
    }

    private updateTopPadding(chartOptions: any) {
        // keep 'top' padding in sync with chart as toggling chart title on / off change the 'top' padding
        const seriesType = this.chartController.getChartSeriesTypes()[0];
        const topPadding = chartOptions[seriesType]?.padding?.top;
        if (topPadding != null) {
            this.paddingTopSlider.setValue(topPadding);
        }
    }
}
