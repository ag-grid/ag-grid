import {
    AgColorPicker,
    AgGroupComponent,
    AgSlider,
    Autowired,
    Component,
    DropShadowOptions,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import {ChartTranslator} from "../../../chartTranslator";
import {ChartController} from "../../../chartController";

export class ShadowPanel extends Component {

    public static TEMPLATE =
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

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ShadowPanel.TEMPLATE);

        this.shadowBlurSlider.setTextFieldWidth(45);
        this.shadowXOffsetSlider.setTextFieldWidth(45);
        this.shadowYOffsetSlider.setTextFieldWidth(45);

        this.initSeriesShadow();
    }

    private initSeriesShadow() {
        this.shadowGroup
            .setTitle(this.chartTranslator.translate("shadow"))
            .setEnabled(this.chartController.getChartProxy().getShadowEnabled())
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(newValue => this.chartController.getChartProxy().setShadowProperty("enabled", newValue));

        this.shadowColorPicker
            .setLabel(this.chartTranslator.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue("rgba(0,0,0,0.5)")
            .onValueChange(newValue => this.chartController.getChartProxy().setShadowProperty("color", newValue));

        const initInput = (input: AgSlider, property: keyof DropShadowOptions, minValue: number, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(property))
                .setValue(this.chartController.getChartProxy().getShadowProperty(property))
                .setMinValue(minValue)
                .setMaxValue(maxValue)
                .onValueChange(newValue => this.chartController.getChartProxy().setShadowProperty(property, newValue));
        };

        initInput(this.shadowBlurSlider, "blur", 0, 20);
        initInput(this.shadowXOffsetSlider, "xOffset", -10, 10);
        initInput(this.shadowYOffsetSlider, "yOffset", -10, 10);
    }
}
