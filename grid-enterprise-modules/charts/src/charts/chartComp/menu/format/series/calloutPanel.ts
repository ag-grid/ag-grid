import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { AgSliderParams } from "@ag-grid-community/core";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class CalloutPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="calloutGroup">
                <ag-slider ref="calloutLengthSlider"></ag-slider>
                <ag-slider ref="calloutStrokeWidthSlider"></ag-slider>
                <ag-slider ref="labelOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
        super();
    }

    @PostConstruct
    private init() {
        const calloutGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("callout"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true
        };
        this.setTemplate(CalloutPanel.TEMPLATE, {
            calloutGroup: calloutGroupParams,
            calloutLengthSlider: this.getSliderParams('calloutLine.length', 'length', 40),
            calloutStrokeWidthSlider: this.getSliderParams('calloutLine.strokeWidth', 'strokeWidth', 10),
            labelOffsetSlider: this.getSliderParams('calloutLabel.offset', 'offset', 30)
        });
    }

    private getSliderParams(expression: string, labelKey: string, defaultMaxValue: number): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams({
            labelKey,
            defaultMaxValue,
            value: this.chartOptionsService.getSeriesOption<number>(expression, this.getSelectedSeries()),
            onValueChange: newValue => this.chartOptionsService.setSeriesOption(expression, newValue, this.getSelectedSeries())
        });
    }
}
