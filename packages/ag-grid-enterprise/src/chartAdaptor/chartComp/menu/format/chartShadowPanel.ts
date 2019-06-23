import {
    AgColorPicker,
    AgGroupComponent,
    AgInputTextField,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import { Chart } from "../../../../charts/chart/chart";
import { PieSeries } from "../../../../charts/chart/series/pieSeries";
import { ChartController } from "../../chartController";
import { BarSeries } from "../../../../charts/chart/series/barSeries";

export class ChartShadowPanel extends Component {

    public static TEMPLATE =
        `<div>                              
            <ag-group-component ref="shadowGroup">
                <ag-color-picker ref="shadowColorPicker"></ag-color-picker>
                <ag-input-text-field ref="shadowBlurInput"></ag-input-text-field>
                <ag-input-text-field ref="shadowXOffsetInput"></ag-input-text-field>
                <ag-input-text-field ref="shadowYOffsetInput"></ag-input-text-field>
            </ag-group-component>
        </div>`;

    @RefSelector('shadowGroup') private shadowGroup: AgGroupComponent;
    @RefSelector('shadowColorPicker') private shadowColorPicker: AgColorPicker;
    @RefSelector('shadowBlurInput') private shadowBlurInput: AgInputTextField;
    @RefSelector('shadowXOffsetInput') private shadowXOffsetInput: AgInputTextField;
    @RefSelector('shadowYOffsetInput') private shadowYOffsetInput: AgInputTextField;

    private chartController: ChartController;
    private chart: Chart;
    private series: PieSeries[] | BarSeries[];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartShadowPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();
        this.series = this.chart.series as PieSeries[] | BarSeries[];

        this.initSeriesShadow();
    }

    private initSeriesShadow() {
        const updateShadow = () => {
            this.series.forEach((series: BarSeries | PieSeries) => {
                if (this.shadowGroup.isEnabled()) {
                    const blur = this.shadowBlurInput.getValue() ? Number.parseInt(this.shadowBlurInput.getValue()) : 0;
                    const xOffset = this.shadowXOffsetInput.getValue() ? Number.parseInt(this.shadowXOffsetInput.getValue()) : 0;
                    const yOffset = this.shadowYOffsetInput.getValue() ? Number.parseInt(this.shadowYOffsetInput.getValue()) : 0;
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
                                x: Number.parseInt(this.shadowXOffsetInput.getValue()),
                                y: Number.parseInt(this.shadowYOffsetInput.getValue())
                            },
                            blur: Number.parseInt(this.shadowBlurInput.getValue())
                        };
                    } else {
                        series.shadow = undefined;
                    }
                });
            });

        this.shadowColorPicker
            .setLabel('Color')
            .setLabelWidth('flex')
            .setWidth(100)
            .setValue('rgba(0,0,0,0.5)')
            .onColorChange(updateShadow);

        const initInput = (input: AgInputTextField, label: string, initialValue: string) => {
            input.setLabel(label)
                .setLabelWidth(80)
                .setWidth(115)
                .setValue(initialValue)
                .onInputChange(updateShadow);
        };

        initInput(this.shadowBlurInput,'Blur', '10');
        initInput(this.shadowXOffsetInput,'X Offset', '10');
        initInput(this.shadowYOffsetInput,'Y Offset', '10');
    }
}
