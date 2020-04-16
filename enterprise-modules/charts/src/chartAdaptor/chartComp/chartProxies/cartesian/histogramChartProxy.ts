import {_, HistogramSeriesOptions, CartesianChartOptions} from "@ag-grid-community/core";
import {
    HistogramSeriesOptions as InternalHistogramSeriesOptions,
    CartesianChart,
    ChartBuilder,
    HistogramSeries
} from "ag-charts-community";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import {CartesianChartProxy} from "./cartesianChartProxy";

export class HistogramChartProxy extends CartesianChartProxy<HistogramSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: CartesianChartOptions<HistogramSeriesOptions>): CartesianChart {
        const { parentElement } = this.chartProxyParams;

        const chart = ChartBuilder.createHistogramChart(parentElement, options || this.chartOptions);
        const barSeries = ChartBuilder.createSeries(this.getSeriesDefaults());

        if (barSeries) {
            chart.addSeries(barSeries);
        }

        return chart;
    }

    public update(params: UpdateChartParams): void {

        const [xField] = params.fields;

        const chart = this.chart;
        const series = chart.series[0] as HistogramSeries;

        series.data = params.data;
        series.xKey = xField.colId;
        series.xName = xField.displayName;

        // for now, only constant width is supported via integrated charts
        series.areaPlot = false;

        const { fills, strokes } = this.getPalette();
        series.fill = fills[0];
        series.stroke = strokes[0];
    }

    protected getDefaultOptions(): CartesianChartOptions<HistogramSeriesOptions> {

        const fontOptions = this.getDefaultFontOptions();
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<HistogramSeriesOptions>;

        options.xAxis.label.rotation = 0;
        options.yAxis.label.rotation = 0;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            tooltip: {
                enabled: true,
            },
            label: {
                ...fontOptions,
                enabled: false,
            },
            shadow: this.getDefaultDropShadowOptions(),
            binCount: 10
        };

        return options;
    }

    private getSeriesDefaults(): InternalHistogramSeriesOptions {

        return {
            ...this.chartOptions.seriesDefaults,
            type: 'histogram'
        };
    }
}
