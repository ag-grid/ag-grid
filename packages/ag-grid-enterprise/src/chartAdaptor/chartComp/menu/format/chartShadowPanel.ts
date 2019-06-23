import {
    _,
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
            <ag-group-component ref="labelShadowGroup">
                <ag-input-text-field ref="inputSeriesShadowBlur"></ag-input-text-field>
                <ag-input-text-field ref="inputSeriesShadowXOffset"></ag-input-text-field>
                <ag-input-text-field ref="inputSeriesShadowYOffset"></ag-input-text-field>
                <ag-input-text-field ref="inputSeriesShadowColor"></ag-input-text-field>
            </ag-group-component>
        </div>`;

    @RefSelector('labelShadowGroup') private labelShadowGroup: AgGroupComponent;
    @RefSelector('inputSeriesShadowBlur') private inputSeriesShadowBlur: AgInputTextField;
    @RefSelector('inputSeriesShadowXOffset') private inputSeriesShadowXOffset: AgInputTextField;
    @RefSelector('inputSeriesShadowYOffset') private inputSeriesShadowYOffset: AgInputTextField;
    @RefSelector('inputSeriesShadowColor') private inputSeriesShadowColor: AgInputTextField;

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
        // TODO use shadowEnabled instead when it's available in chart api
        const enabled = this.series.some((series: BarSeries | PieSeries) => series.shadow != undefined);

        // Add defaults to chart as shadow is undefined by default
        if (!this.inputSeriesShadowBlur.getValue()) { this.inputSeriesShadowBlur.setValue('10'); }
        if (!this.inputSeriesShadowXOffset.getValue()) { this.inputSeriesShadowXOffset.setValue('10'); }
        if (!this.inputSeriesShadowYOffset.getValue()) { this.inputSeriesShadowYOffset.setValue('10'); }
        if (!this.inputSeriesShadowColor.getValue()) { this.inputSeriesShadowColor.setValue('rgba(0,0,0,0.5)'); }

        this.labelShadowGroup
            .setTitle('Shadow')
            .setEnabled(enabled)
            .onEnableChange(enabled => {
                this.series.forEach((series: BarSeries | PieSeries) => {
                    // TODO remove this check when shadowEnabled instead when it's available in chart api
                    if (enabled) {
                        series.shadow = {
                            color: this.inputSeriesShadowColor.getValue(),
                            offset: {
                                x: Number.parseInt(this.inputSeriesShadowXOffset.getValue()),
                                y: Number.parseInt(this.inputSeriesShadowYOffset.getValue())
                            },
                            blur: Number.parseInt(this.inputSeriesShadowBlur.getValue())
                        };
                    } else {
                        series.shadow = undefined;
                    }
                });
            });

        const updateShadow = () => {
            this.series.forEach((series: BarSeries | PieSeries) => {
                // TODO remove this check when shadowEnabled instead when it's available in chart api
                if (this.labelShadowGroup.isEnabled()) {
                    const blur = this.inputSeriesShadowBlur.getValue() ? Number.parseInt(this.inputSeriesShadowBlur.getValue()) : 0;
                    const xOffset = this.inputSeriesShadowXOffset.getValue() ? Number.parseInt(this.inputSeriesShadowXOffset.getValue()) : 0;
                    const yOffset = this.inputSeriesShadowYOffset.getValue() ? Number.parseInt(this.inputSeriesShadowYOffset.getValue()) : 0;
                    const color = this.inputSeriesShadowColor.getValue() ? this.inputSeriesShadowColor.getValue() : 'rgba(0,0,0,0.5)';
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

        // BLUR
        this.inputSeriesShadowBlur
            .setLabel('Blur')
            .setLabelWidth(80)
            .setWidth(115);

        if (this.series.length > 0) {
            if (this.series[0].shadow) {
                this.inputSeriesShadowBlur.setValue(this.series[0].shadow.blur + '');
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowBlur.getInputElement(), 'input', updateShadow);

        // X Offset
        this.inputSeriesShadowXOffset
            .setLabel('X Offset')
            .setLabelWidth(80)
            .setWidth(115);

        if (this.series.length > 0) {
            if (this.series[0].shadow) {
                this.inputSeriesShadowXOffset.setValue(this.series[0].shadow.offset.x + '');
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowXOffset.getInputElement(), 'input', updateShadow);

        // Y Offset
        this.inputSeriesShadowYOffset
            .setLabel('Y Offset')
            .setLabelWidth(80)
            .setWidth(115);

        if (this.series.length > 0) {
            if (this.series[0].shadow) {
                this.inputSeriesShadowYOffset.setValue(this.series[0].shadow.offset.y + '');
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowYOffset.getInputElement(), 'input', updateShadow);

        // TODO replace with Color Picker
        this.inputSeriesShadowColor.setLabel('Color');
        if (this.series.length > 0) {
            if (this.series[0].shadow) {
                this.inputSeriesShadowColor.setValue(this.series[0].shadow.color + '');
            }
        }
        this.addDestroyableEventListener(this.inputSeriesShadowColor.getInputElement(), 'input', updateShadow);
    }
}