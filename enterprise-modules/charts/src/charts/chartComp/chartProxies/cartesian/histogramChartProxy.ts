import {
    AgHistogramSeriesOptions,
    BarSeriesLabelOptions,
    CartesianChartOptions,
    HighlightOptions,
    HistogramSeriesOptions
} from "@ag-grid-community/core";
import { AgCartesianChartOptions, AgChart, CartesianChart, ChartTheme, HistogramSeries } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class HistogramChartProxy extends CartesianChartProxy<HistogramSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<HistogramSeriesOptions> {
        const options = super.getDefaultOptionsFromTheme(theme);

        const seriesDefaults = theme.getConfig<AgHistogramSeriesOptions>('histogram.series.histogram');
        options.seriesDefaults = {
            shadow: this.getDefaultDropShadowOptions(),
            label: seriesDefaults.label as BarSeriesLabelOptions,
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            fill: {
                colors: theme.palette.fills,
                opacity: seriesDefaults.fillOpacity
            },
            stroke: {
                colors: theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            lineDash: seriesDefaults.lineDash ? seriesDefaults.lineDash : [0],
            lineDashOffset: seriesDefaults.lineDashOffset,
            highlightStyle: seriesDefaults.highlightStyle as HighlightOptions,
            listeners: seriesDefaults.listeners
        } as HistogramSeriesOptions;

        return options;
    }

    protected createChart(options?: CartesianChartOptions<HistogramSeriesOptions>): CartesianChart {
        const { parentElement } = this.chartProxyParams;
        const seriesDefaults = this.getSeriesDefaults();

        options = options || this.chartOptions;
        const agChartOptions = options as AgCartesianChartOptions;
        agChartOptions.autoSize = true;
        agChartOptions.axes = [{
            type: 'number',
            position: 'bottom',
            ...options.xAxis
        }, {
            type: 'number',
            position: 'left',
            ...options.yAxis
        }];
        agChartOptions.series = [{
            ...seriesDefaults,
            fill: seriesDefaults.fill.colors[0],
            fillOpacity: seriesDefaults.fill.opacity,
            stroke: seriesDefaults.stroke.colors[0],
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width,
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: (seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer) || undefined,
            },
            type: 'histogram'
        }];

        return AgChart.create(agChartOptions, parentElement);
    }

    public update(params: UpdateChartParams): void {
        const [xField] = params.fields;

        const chart = this.chart;
        const series = chart.series[0] as HistogramSeries;

        series.data = params.data;
        series.xKey = xField.colId;
        series.xName = xField.displayName!;

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

    private getSeriesDefaults(): HistogramSeriesOptions {
        return {
            ...this.chartOptions.seriesDefaults
        };
    }
}