import {
    AgColorPicker,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartOptionsService } from "../../../chartOptionsService";
import { getMaxValue } from "../formatPanel";

export class ShadowPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="shadowGroup">
                <ag-color-picker ref="shadowColorPicker"></ag-color-picker>
                <ag-slider ref="shadowBlurSlider"></ag-slider>
                <ag-slider ref="shadowXOffsetSlider"></ag-slider>
                <ag-slider ref="shadowYOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('shadowGroup') private shadowGroup: AgGroupComponent;
    @RefSelector('shadowColorPicker') private shadowColorPicker: AgColorPicker;
    @RefSelector('shadowBlurSlider') private shadowBlurSlider: AgSlider;
    @RefSelector('shadowXOffsetSlider') private shadowXOffsetSlider: AgSlider;
    @RefSelector('shadowYOffsetSlider') private shadowYOffsetSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(ShadowPanel.TEMPLATE, {shadowGroup: groupParams});

        this.shadowBlurSlider.setTextFieldWidth(45);
        this.shadowXOffsetSlider.setTextFieldWidth(45);
        this.shadowYOffsetSlider.setTextFieldWidth(45);

        this.initSeriesShadow();
    }

    private initSeriesShadow() {
        this.shadowGroup
            .setTitle(this.chartTranslator.translate("shadow"))
            .setEnabled(this.chartOptionsService.getSeriesOption("shadow.enabled"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(newValue => this.chartOptionsService.setSeriesOption("shadow.enabled", newValue));

        this.shadowColorPicker
            .setLabel(this.chartTranslator.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("shadow.color"))
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("shadow.color", newValue));

        const initInput = (input: AgSlider, property: string, minValue: number, defaultMaxValue: number) => {
            const currentValue = this.chartOptionsService.getSeriesOption<number>(`shadow.${property}`);
            input.setLabel(this.chartTranslator.translate(property))
                .setMinValue(minValue)
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`shadow.${property}`, newValue));
        };

        initInput(this.shadowBlurSlider, "blur", 0, 20);
        initInput(this.shadowXOffsetSlider, "xOffset", -10, 10);
        initInput(this.shadowYOffsetSlider, "yOffset", -10, 10);
    }
}
