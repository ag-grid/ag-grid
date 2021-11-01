import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartOptionsService } from "../../../chartOptionsService";
import { getMaxValue } from "../formatPanel";

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

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
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
            .setTitle(this.chartTranslator.translate("callout"))
            .setEnabled(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);

        const initInput = (expression: string, input: AgSlider, labelKey: string, defaultMaxValue: number) => {
            const currentValue = this.chartOptionsService.getSeriesOption<number>(expression);
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(expression, newValue));
        };

        initInput("callout.length", this.calloutLengthSlider, "length", 40);
        initInput("callout.strokeWidth", this.calloutStrokeWidthSlider, "strokeWidth", 10);
        initInput("label.offset", this.labelOffsetSlider, "offset", 30);
    }
}
