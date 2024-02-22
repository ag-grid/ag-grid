import {
    AgGroupComponentParams,
    AgSliderParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
import { AgColorPickerParams } from "../../../../../widgets/agColorPicker";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class ConnectorLinePanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="lineGroup">
                <ag-color-picker ref="lineColorPicker"></ag-color-picker>
                <ag-slider ref="lineStrokeWidthSlider"></ag-slider>
                <ag-slider ref="lineOpacitySlider"></ag-slider>
                <ag-slider ref="lineDashSlider"></ag-slider>                
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
        const lineGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("connectorLine"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(ConnectorLinePanel.TEMPLATE, {
            lineGroup: lineGroupParams,
            lineColorPicker: this.getColorPickerParams("line.stroke"),
            lineStrokeWidthSlider: this.getSliderParams("strokeWidth", 0, 10, 45, "line.strokeWidth"),
            lineDashSlider: this.getSliderParams("lineDash", 0, 30, 45, "line.lineDash", 1, true),
            lineOpacitySlider: this.getSliderParams("strokeOpacity", 0, 1, 45, "line.strokeOpacity", 0.05, false)
        });
    }

    private getColorPickerParams(seriesOptionKey: string): AgColorPickerParams {
        const color = this.chartOptionsService.getSeriesOption<string | undefined | null>(seriesOptionKey, this.getSelectedSeries());
        return this.chartMenuUtils.getDefaultColorPickerParams(
            color == null ? 'transparent' : `${color}`,
            newValue => this.chartOptionsService.setSeriesOption(seriesOptionKey, newValue, this.getSelectedSeries())
        );
    }

    private getSliderParams(
        labelKey: string, minValue: number, maxValue: number, textFieldWidth: number, seriesOptionKey: string, step: number = 1, isArray: boolean = false
    ): AgSliderParams {
        const value = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());
        return {
            label: this.chartTranslationService.translate(labelKey),
            minValue: minValue,
            maxValue: maxValue,
            textFieldWidth: textFieldWidth,
            value: `${value}`,
            step: step,
            onValueChange: newValue => {
                const value = isArray ? [newValue] : newValue;
                this.chartOptionsService.setSeriesOption(seriesOptionKey, value, this.getSelectedSeries());
            }
        };
    }
}
