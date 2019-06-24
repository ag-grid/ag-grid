import {
    AgColorPicker,
    AgGroupComponent,
    AgSlider,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../../chartController";
import {Chart} from "../../../../../charts/chart/chart";
import {PieSeries} from "../../../../../charts/chart/series/pieSeries";
import {BarSeries} from "../../../../../charts/chart/series/barSeries";

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
            this.chart.performLayout();
        };

        const enabled = this.series.some((series: BarSeries | PieSeries) => series.shadow != undefined);

        this.shadowGroup
            .setTitle('Shadow')
            .setEnabled(enabled)
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
            .setLabel('Color')
            .setLabelWidth('flex')
            .setWidth(115)
            .setValue('rgba(0,0,0,0.5)')
            .onColorChange(updateShadow);

        const initInput = (input: AgSlider, label: string, initialValue: string) => {
            input.setLabel(label)
                .setValue(initialValue)
                .onInputChange(updateShadow);
        };

        initInput(this.shadowBlurSlider,'Blur', '5');
        initInput(this.shadowXOffsetSlider,'X Offset', '3');
        initInput(this.shadowYOffsetSlider,'Y Offset', '3');
    }
}
