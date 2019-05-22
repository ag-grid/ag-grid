import { ChartBuilder } from "../../builder/chartBuilder";
import { PieChartOptions, PieSeriesOptions } from "ag-grid-community";
import { ChartProxy, UpdateChartParams, ChartProxyOptions } from "./chartProxy";
import { PolarChart } from "../../../charts/chart/polarChart";
import { PieSeries } from "../../../charts/chart/series/pieSeries";
import borneo, { palettes } from "../../../charts/chart/palettes";

export class PieChartProxy extends ChartProxy {
    private readonly chartOptions: PieChartOptions;

    public constructor(options: ChartProxyOptions) {
        super(options);
        this.chartOptions = this.getChartOptions(this.defaultOptions()) as PieChartOptions;
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
        if (existingSeriesId !== pieSeriesId) {
            pieChart.removeSeries(existingSeries);

            const seriesOptions = this.chartOptions.seriesDefaults as PieSeriesOptions;

            seriesOptions.title = pieSeriesName;
            seriesOptions.angleField = pieSeriesId;

            pieSeries = ChartBuilder.createSeries(seriesOptions) as PieSeries;
        }

        pieSeries.labelField = params.categoryId;
        pieSeries.data = params.data;

        pieSeries.fills = palettes[this.options.getPalette()].fills;

        if (!existingSeries) {
            pieChart.addSeries(pieSeries)
        }
    }

    private defaultOptions() {
        return {
            type: 'pie',
            parent: this.options.parentElement,
            width: this.options.width,
            height: this.options.height,
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
                fills: borneo.fills,
                strokes: borneo.strokes,
                lineWidth: 1,
                calloutColors: borneo.strokes,
                calloutWidth: 2,
                calloutLength: 10,
                calloutPadding: 3,
                labelEnabled: false,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelMinAngle: 20,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true
            }
        };
    }
}
