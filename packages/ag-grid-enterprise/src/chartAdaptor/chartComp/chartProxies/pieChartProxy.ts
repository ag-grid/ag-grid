import { ChartBuilder } from "../../builder/chartBuilder";
import { PieChartOptions, PieSeriesOptions } from "ag-grid-community";
import { ChartProxy, UpdateChartParams, ChartProxyParams } from "./chartProxy";
import { PolarChart } from "../../../charts/chart/polarChart";
import { PieSeries } from "../../../charts/chart/series/pieSeries";
import { CaptionOptions } from "ag-grid-community/src/ts/interfaces/iChartOptions";

export class PieChartProxy extends ChartProxy {
    private readonly chartOptions: PieChartOptions;

    public constructor(params: ChartProxyParams) {
        super(params);

        this.chartOptions = this.getChartOptions('pie', this.defaultOptions()) as PieChartOptions;
        this.chart = ChartBuilder.createPolarChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const pieChart = this.chart as PolarChart;

        const existingSeries = pieChart.series[0] as PieSeries;
        const existingSeriesId = existingSeries && existingSeries.angleField as string;

        const pieSeriesId = params.fields[0].colId;
        const pieSeriesName = params.fields[0].displayName;

        let pieSeries = existingSeries;
        let calloutColors: string[] | undefined = undefined;
        if (existingSeriesId !== pieSeriesId) {
            pieChart.removeSeries(existingSeries);

            const seriesOptions = this.chartOptions.seriesDefaults as PieSeriesOptions;
            // Use `Object.create` to prevent mutating the original user config that is possibly reused.
            const title = (seriesOptions.title ? Object.create(seriesOptions.title) : {}) as CaptionOptions;
            title.text = pieSeriesName;
            seriesOptions.title = title;

            seriesOptions.angleField = pieSeriesId;
            calloutColors = seriesOptions.calloutColors;

            pieSeries = ChartBuilder.createSeries(seriesOptions) as PieSeries;
        }

        pieSeries.labelField = params.categoryId;
        pieSeries.data = params.data;

        const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

        pieSeries.fills = palette.fills;
        pieSeries.strokes = palette.strokes;
        if (calloutColors) {
            pieSeries.calloutColors = calloutColors;
        }

        if (!existingSeries) {
            pieChart.addSeries(pieSeries)
        }
    }

    private defaultOptions() {
        const palette = this.chartProxyParams.getSelectedPalette();

        return {
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            legend: {
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerLineWidth: 1
            },
            seriesDefaults: {
                type: 'pie',
                fills: palette.fills,
                strokes: palette.strokes,
                lineWidth: 1,
                calloutColors: palette.strokes,
                calloutWidth: 2,
                calloutLength: 10,
                calloutPadding: 3,
                labelEnabled: false,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelMinAngle: 20,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: undefined,
                title: {
                    enabled: false,
                    font: 'bold 12px Verdana, sans-serif',
                    color: 'black'
                }
            }
        };
    }
}
