import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { AgColorPicker } from "../../../../../widgets/agColorPicker";

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

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
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
            .setTitle(this.chartTranslationService.translate("shadow"))
            .setEnabled(this.chartOptionsService.getSeriesOption("shadow.enabled", this.getSelectedSeries()))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(newValue => this.chartOptionsService.setSeriesOption("shadow.enabled", newValue, this.getSelectedSeries()));

        this.shadowColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("shadow.color", this.getSelectedSeries()))
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("shadow.color", newValue, this.getSelectedSeries()));

        const initInput = (input: AgSlider, property: string, minValue: number, defaultMaxValue: number) => {
            const currentValue = this.chartOptionsService.getSeriesOption<number>(`shadow.${property}`, this.getSelectedSeries());
            input.setLabel(this.chartTranslationService.translate(property))
                .setMinValue(minValue)
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption(`shadow.${property}`, newValue, this.getSelectedSeries()));
        };

        initInput(this.shadowBlurSlider, "blur", 0, 20);
        initInput(this.shadowXOffsetSlider, "xOffset", -10, 10);
        initInput(this.shadowYOffsetSlider, "yOffset", -10, 10);
    }
}
