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

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.series = this.chart.series as PieSeries[] | BarSeries[];
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartShadowPanel.TEMPLATE);

        this.initSeriesShadow();
    }

    private initSeriesShadow() {

        const updateShadow = () => {
            this.series.forEach((series: BarSeries | PieSeries) => {
                // TODO remove this check when shadowEnabled instead when it's available in chart api
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
            // TODO: why is this necessary???
            this.chart.performLayout();
        };

        this.shadowColorPicker
            .setLabel('Color')
            .setLabelWidth(85)
            .setWidth(125)
            .onColorChange(updateShadow);

        // TODO use shadowEnabled instead when it's available in chart api
        const enabled = this.series.some((series: BarSeries | PieSeries) => series.shadow != undefined);

        // Add defaults to chart as shadow is undefined by default
        if (!this.shadowBlurInput.getValue()) { this.shadowBlurInput.setValue('10'); }
        if (!this.shadowXOffsetInput.getValue()) { this.shadowXOffsetInput.setValue('10'); }
        if (!this.shadowYOffsetInput.getValue()) { this.shadowYOffsetInput.setValue('10'); }
        if (!this.shadowColorPicker.getValue()) { this.shadowColorPicker.setValue('rgba(0,0,0,0.5)'); }

        this.shadowGroup
            .setTitle('Shadow')
            .setEnabled(enabled)
            .onEnableChange(enabled => {
                this.series.forEach((series: BarSeries | PieSeries) => {
                    // TODO remove this check when shadowEnabled instead when it's available in chart api
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

        // BLUR
        this.shadowBlurInput
            .setLabel('Blur')
            .setLabelWidth(80)
            .setWidth(115);

        if (this.series.length > 0) {
            if (this.series[0].shadow) {
                this.shadowBlurInput.setValue(this.series[0].shadow.blur + '');
            }
        }
        this.addDestroyableEventListener(this.shadowBlurInput.getInputElement(), 'input', updateShadow);

        // X Offset
        this.shadowXOffsetInput
            .setLabel('X Offset')
            .setLabelWidth(80)
            .setWidth(115);

        if (this.series.length > 0) {
            if (this.series[0].shadow) {
                this.shadowXOffsetInput.setValue(this.series[0].shadow.offset.x + '');
            }
        }
        this.addDestroyableEventListener(this.shadowXOffsetInput.getInputElement(), 'input', updateShadow);

        // Y Offset
        this.shadowYOffsetInput
            .setLabel('Y Offset')
            .setLabelWidth(80)
            .setWidth(115);

        if (this.series.length > 0) {
            if (this.series[0].shadow) {
                this.shadowYOffsetInput.setValue(this.series[0].shadow.offset.y + '');
            }
        }
        this.addDestroyableEventListener(this.shadowYOffsetInput.getInputElement(), 'input', updateShadow);

        if (this.series.length > 0) {
            if (this.series[0].shadow) {
                this.shadowColorPicker.setValue(this.series[0].shadow.color + '');
            }
        }
    }
}