import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";

export class CalloutPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="calloutGroup">
                <ag-slider ref="calloutLengthSlider"></ag-slider>
                <ag-slider ref="calloutStrokeWidthSlider"></ag-slider>
                <ag-slider ref="labelOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('calloutGroup') private calloutGroup: AgGroupComponent;
    @RefSelector('calloutLengthSlider') private calloutLengthSlider: AgSlider;
    @RefSelector('calloutStrokeWidthSlider') private calloutStrokeWidthSlider: AgSlider;
    @RefSelector('labelOffsetSlider') private labelOffsetSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical'
        };
        this.setTemplate(CalloutPanel.TEMPLATE, {calloutGroup: groupParams});
        this.initCalloutOptions();
    }

    private initCalloutOptions() {
        this.calloutGroup
            .setTitle(this.chartTranslationService.translate("callout"))
            .setEnabled(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);

        const initInput = (expression: string, input: AgSlider, labelKey: string, defaultMaxValue: number) => {
            const currentValue = this.chartOptionsService.getSeriesOption<number>(expression, this.getSelectedSeries());
            input.setLabel(this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(expression, newValue, this.getSelectedSeries()));
        };

        initInput('calloutLine.length', this.calloutLengthSlider, 'length', 40);
        initInput('calloutLine.strokeWidth', this.calloutStrokeWidthSlider, 'strokeWidth', 10);
        initInput('calloutLabel.offset', this.labelOffsetSlider, 'offset', 30);
    }
}
