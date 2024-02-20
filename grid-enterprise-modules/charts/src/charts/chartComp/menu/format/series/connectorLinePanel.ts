import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import {ChartTranslationService} from "../../../services/chartTranslationService";
import {ChartOptionsService} from "../../../services/chartOptionsService";
import {ChartSeriesType} from "../../../utils/seriesTypeMapper";
import {AgColorPicker} from "../../../../../widgets/agColorPicker";

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

    @RefSelector('lineColorPicker') private lineColorPicker: AgColorPicker;
    @RefSelector('lineStrokeWidthSlider') private lineStrokeWidthSlider: AgSlider;
    @RefSelector('lineOpacitySlider') private lineOpacitySlider: AgSlider;
    @RefSelector('lineDashSlider') private lineDashSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

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
        this.setTemplate(ConnectorLinePanel.TEMPLATE, {lineGroup: lineGroupParams});

        this.initConnectorLineControls();
    }

    private initConnectorLineControls() {
        this.initColorPicker(this.lineColorPicker, "color", "line.stroke");
        this.initSlider(this.lineStrokeWidthSlider, "strokeWidth", 0, 10, 45, "line.strokeWidth");
        this.initSlider(this.lineDashSlider, "lineDash", 0, 30, 45, "line.lineDash", 1, true);
        this.initSlider(this.lineOpacitySlider, "strokeOpacity", 0, 1, 45, "line.strokeOpacity", 0.05, false);
    }

    private initColorPicker(colorPicker: AgColorPicker, labelKey: string, seriesOptionKey: string) {
        const color = this.chartOptionsService.getSeriesOption<string | undefined | null>(seriesOptionKey, this.getSelectedSeries());
        colorPicker
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setLabelWidth("flex")
            .setValue(color == null ? 'transparent' : `${color}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(seriesOptionKey, newValue, this.getSelectedSeries()));
    }

    private initSlider(slider: AgSlider, labelKey: string, minValue: number, maxValue: number, textFieldWidth: number, seriesOptionKey: string, step: number = 1, isArray: boolean = false) {
        const value = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());
        slider
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setTextFieldWidth(textFieldWidth)
            .setValue(`${value}`)
            .setStep(step)
            .onValueChange(newValue => {
                const value = isArray ? [newValue] : newValue;
                this.chartOptionsService.setSeriesOption(seriesOptionKey, value, this.getSelectedSeries());
            });
    }
}
