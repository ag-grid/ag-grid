import {
    AgColorPicker,
    AgGroupComponent,
    AgSlider, Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { Chart } from "../../../../../charts/chart/chart";
import { PieSeries } from "../../../../../charts/chart/series/pieSeries";
import { BarSeries } from "../../../../../charts/chart/series/barSeries";
import { ChartTranslator } from "../../../chartTranslator";

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

    private chartController: ChartController;
    private chart: Chart;
    private series: PieSeries[] | BarSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ShadowPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();
        this.series = this.chart.series as PieSeries[] | BarSeries[];

        this.shadowBlurSlider.setTextFieldWidth(45);
        this.shadowXOffsetSlider.setTextFieldWidth(45);
        this.shadowYOffsetSlider.setTextFieldWidth(45);

        this.initSeriesShadow();
    }

    private initSeriesShadow() {
        const updateShadow = () => {
            this.series.forEach((series: BarSeries | PieSeries) => {
                if (this.shadowGroup.isEnabled()) {
                    const blur = this.shadowBlurSlider.getValue() ? Number.parseInt(this.shadowBlurSlider.getValue()) : 0;
                    const xOffset = this.shadowXOffsetSlider.getValue() ? Number.parseInt(this.shadowXOffsetSlider.getValue()) : 0;
                    const yOffset = this.shadowYOffsetSlider.getValue() ? Number.parseInt(this.shadowYOffsetSlider.getValue()) : 0;
                    const color = this.shadowColorPicker.getValue() ? this.shadowColorPicker.getValue() : 'rgba(0,0,0,0.5)';
                    series.shadow = {
                        color: color,
                        offset: {x: xOffset, y: yOffset},
                        blur: blur
                    }
                }
            });
        };

        const enabled = this.series.some((series: BarSeries | PieSeries) => series.shadow != undefined);

        this.shadowGroup
            .setTitle(this.chartTranslator.translate('shadow'))
            .setEnabled(enabled)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(enabled => {
                this.series.forEach((series: BarSeries | PieSeries) => {
                    if (enabled) {
                        series.shadow = {
                            color: this.shadowColorPicker.getValue(),
                            offset: {
                                x: Number.parseInt(this.shadowXOffsetSlider.getValue()),
                                y: Number.parseInt(this.shadowYOffsetSlider.getValue())
                            },
                            blur: Number.parseInt(this.shadowBlurSlider.getValue())
                        };
                    } else {
                        series.shadow = undefined;
                    }
                });
            });

        this.shadowColorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue('rgba(0,0,0,0.5)')
            .onValueChange(updateShadow);

        const initInput = (input: AgSlider, labelKey: string, initialValue: string, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(labelKey))
                .setValue(initialValue)
                .setMaxValue(maxValue)
                .onValueChange(updateShadow);
        };

        initInput(this.shadowBlurSlider, 'blur', '5', 20);
        initInput(this.shadowXOffsetSlider, 'xOffset', '3', 20);
        initInput(this.shadowYOffsetSlider, 'yOffset', '3', 20);
    }
}
