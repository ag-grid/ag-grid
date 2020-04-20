import {_, BarSeriesOptions, CartesianChartOptions, ChartType} from "@ag-grid-community/core";
import {
    BarSeriesOptions as InternalBarSeriesOptions,
    CartesianChart,
    ChartBuilder,
    BarSeries
} from "ag-charts-community";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import {CartesianChartProxy} from "./cartesianChartProxy";

export class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: CartesianChartOptions<BarSeriesOptions>): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;
        let builderFunction: keyof typeof ChartBuilder;

        if (this.isColumnChart()) {
            builderFunction = grouping ? 'createGroupedColumnChart' : 'createColumnChart';
        } else {
            builderFunction = grouping ? 'createGroupedBarChart' : 'createBarChart';
        }

        const chart = ChartBuilder[builderFunction](parentElement, options || this.chartOptions);
        const barSeries = ChartBuilder.createSeries(this.getSeriesDefaults());

        if (barSeries) {
            (barSeries as BarSeries).flipXY = !this.isColumnChart();
            chart.addSeries(barSeries);
        }

        return chart;
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        this.updateAxes('category', !this.isColumnChart());

        const chart = this.chart;
        const barSeries = chart.series[0] as BarSeries;
        const { fills, strokes } = this.getPalette();

        barSeries.data = this.transformData(params.data, params.category.id);
        barSeries.xKey = params.category.id;
        barSeries.xName = params.category.name;
        barSeries.yKeys = params.fields.map(f => f.colId);
        barSeries.yNames = params.fields.map(f => f.displayName);
        barSeries.fills = fills;
        barSeries.strokes = strokes;

        this.updateLabelRotation(params.category.id, !this.isColumnChart());
    }

    protected getDefaultOptions(): CartesianChartOptions<BarSeriesOptions> {
        const isColumnChart = this.isColumnChart();
        const fontOptions = this.getDefaultFontOptions();
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<BarSeriesOptions>;

        options.xAxis.label.rotation = isColumnChart ? 335 : 0;
        options.yAxis.label.rotation = isColumnChart ? 0 : 335;

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
        };

        return options;
    }

    private isColumnChart(): boolean {
        return _.includes([ChartType.GroupedColumn, ChartType.StackedColumn, ChartType.NormalizedColumn], this.chartType);
    }

    private getSeriesDefaults(): InternalBarSeriesOptions {
        const { chartType } = this;
        const isGrouped = chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar;
        const isNormalized = chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar;

        return {
            ...this.chartOptions.seriesDefaults,
            type: 'bar',
            grouped: isGrouped,
            normalizedTo: isNormalized ? 100 : undefined,
        };
    }
}
