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
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { AgColorPicker } from "../../../../../widgets/agColorPicker";

export class WhiskersPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="whiskersGroup">
                <ag-color-picker ref="whiskerColorPicker"></ag-color-picker>
                <ag-slider ref="whiskerThicknessSlider"></ag-slider>
                <ag-slider ref="whiskerOpacitySlider"></ag-slider>
                <ag-slider ref="whiskerLineDashSlider"></ag-slider>
                <ag-slider ref="whiskerLineDashOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('whiskersGroup') private whiskersGroup: AgGroupComponent;
    @RefSelector('whiskerColorPicker') private whiskerColorPicker: AgColorPicker;
    @RefSelector('whiskerThicknessSlider') private whiskerThicknessSlider: AgSlider;
    @RefSelector('whiskerOpacitySlider') private whiskerOpacitySlider: AgSlider;
    @RefSelector('whiskerLineDashSlider') private whiskerLineDashSlider: AgSlider;
    @RefSelector('whiskerLineDashOffsetSlider') private whiskerLineDashOffsetSlider: AgSlider;

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
            title: this.chartTranslationService.translate("whisker"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(WhiskersPanel.TEMPLATE, {whiskersGroup: groupParams});

        this.initControls();
    }

    private initControls() {
        const color = this.chartOptionsService.getSeriesOption<string | undefined | null>("whisker.stroke", this.getSelectedSeries());
        this.whiskerColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex") 
            .setValue(color == null ? 'transparent' : `${color}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.stroke", newValue, this.getSelectedSeries()));

        const strokeWidth = this.chartOptionsService.getSeriesOption<number>("whisker.strokeWidth", this.getSelectedSeries());
        this.whiskerThicknessSlider
            .setLabel(this.chartTranslationService.translate("strokeWidth"))
            .setMinValue(0)
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(`${strokeWidth}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.strokeWidth", newValue, this.getSelectedSeries()));

        const strokeOpacity = this.chartOptionsService.getSeriesOption<number>("whisker.strokeOpacity", this.getSelectedSeries());
        this.whiskerOpacitySlider
            .setLabel(this.chartTranslationService.translate("strokeOpacity"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(`${strokeOpacity}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.strokeOpacity", newValue, this.getSelectedSeries()));

        const lineDash = this.chartOptionsService.getSeriesOption<number[]>("whisker.lineDash", this.getSelectedSeries());
        this.whiskerLineDashSlider
            .setLabel(this.chartTranslationService.translate("lineDash"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${lineDash}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.lineDash", [newValue], this.getSelectedSeries()));

        const lineDashOffset = this.chartOptionsService.getSeriesOption<number>("whisker.lineDashOffset", this.getSelectedSeries());
        this.whiskerLineDashOffsetSlider
            .setLabel(this.chartTranslationService.translate("lineDashOffset"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue(`${lineDashOffset}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("whisker.lineDashOffset", newValue, this.getSelectedSeries()));
    }
}
