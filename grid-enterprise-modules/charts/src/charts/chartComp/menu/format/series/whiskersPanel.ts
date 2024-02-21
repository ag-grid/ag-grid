import {
    AgGroupComponentParams,
    AgSliderParams,
    Autowired,
    Component,
    PostConstruct,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { ChartMenuUtils } from "../../chartMenuUtils";

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

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsService: ChartOptionsService,
                private getSelectedSeries: () => ChartSeriesType) {
        super();
    }

    @PostConstruct
    private init() {
        const whiskersGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("whisker"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        const color = this.chartOptionsService.getSeriesOption<string | undefined | null>("whisker.stroke", this.getSelectedSeries());
        const whiskerColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams({
            value: color == null ? 'transparent' : `${color}`,
            onValueChange: newValue => this.chartOptionsService.setSeriesOption("whisker.stroke", newValue, this.getSelectedSeries())
        });
        const whiskerLineDashSliderParams = this.chartMenuUtils.getDefaultSliderParams({
            labelKey: "lineDash",
            defaultMaxValue: 30,
            value: this.chartOptionsService.getSeriesOption<number[]>("whisker.lineDash", this.getSelectedSeries())?.[0] ?? 0,
            onValueChange: newValue => this.chartOptionsService.setSeriesOption("whisker.lineDash", [newValue], this.getSelectedSeries())
        });
        this.setTemplate(WhiskersPanel.TEMPLATE, {
            whiskersGroup: whiskersGroupParams,
            whiskerColorPicker: whiskerColorPickerParams,
            whiskerThicknessSlider: this.getSliderParams('strokeWidth', 'whisker.strokeWidth', 10),
            whiskerOpacitySlider: this.getSliderParams('strokeOpacity', 'whisker.strokeOpacity', 1),
            whiskerLineDashSlider: whiskerLineDashSliderParams,
            whiskerLineDashOffsetSlider: this.getSliderParams('lineDashOffset', 'whisker.lineDashOffset', 30)
        });
    }

    private getSliderParams(labelKey: string, key: string, defaultMaxValue: number): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams({
            labelKey,
            defaultMaxValue,
            value: this.chartOptionsService.getSeriesOption(key, this.getSelectedSeries()),
            onValueChange: newValue => this.chartOptionsService.setSeriesOption(key, newValue, this.getSelectedSeries())
        });
    }
}
