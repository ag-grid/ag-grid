import {
    AgGroupComponentParams,
    AgSliderParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class AxisTicksPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
    }

    @PostConstruct
    private init() {
        const axisTicksGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: this.chartTranslationService.translate("ticks"),
            enabled: this.chartOptionsService.getAxisProperty("tick.enabled"),
            suppressEnabledCheckbox: false,
            onEnableChange: newValue => this.chartOptionsService.setAxisProperty("tick.enabled", newValue)
        };
        const axisTicksColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams({
            value: this.chartOptionsService.getAxisProperty("tick.color"),
            onValueChange: newColor => this.chartOptionsService.setAxisProperty("tick.color", newColor)
        });
        const getSliderParams = (expression: string, labelKey: string, defaultMaxValue: number): AgSliderParams => {
            return this.chartMenuUtils.getDefaultSliderParams({
                labelKey,
                defaultMaxValue,
                value: this.chartOptionsService.getAxisProperty<number>(expression),
                onValueChange: newValue => this.chartOptionsService.setAxisProperty(expression, newValue)
            });
        };
        const axisTicksWidthSliderParams = getSliderParams("tick.width", "width", 10);
        const axisTicksSizeSliderParams = getSliderParams("tick.size", "length", 30);
        this.setTemplate(AxisTicksPanel.TEMPLATE, {
            axisTicksGroup: axisTicksGroupParams,
            axisTicksColorPicker: axisTicksColorPickerParams,
            axisTicksWidthSlider: axisTicksWidthSliderParams,
            axisTicksSizeSlider: axisTicksSizeSliderParams
        });
    }
}
