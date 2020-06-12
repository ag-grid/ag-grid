import { _, BarSeriesOptions, CartesianChartOptions, ChartType } from "@ag-grid-community/core";
import {
    BarSeriesOptions as InternalBarSeriesOptions,
    CartesianChart,
    BarSeries,
    AgChart
} from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options: any): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;
        const isColumn = this.isColumnChart();

        options = options || this.chartOptions;
        const { seriesDefaults } = options;
        options.axes = [{
            ...options.xAxis,
            position: isColumn ? 'bottom' : 'left',
            type: grouping ? 'groupedCategory' : 'category'
        }, {
            ...options.yAxis,
            position: isColumn ? 'left' : 'bottom',
            type: 'number'
        }];
        options.series = [{
            ...this.getSeriesDefaults(),
            fills: seriesDefaults.fills || seriesDefaults.fill.colors,
            fillOpacity: seriesDefaults.fill.opacity,
            strokes: seriesDefaults.strokes || seriesDefaults.stroke.colors,
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width
        }];

        return AgChart.create(options, parentElement);
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

    private getSeriesDefaults(): any {
        debugger;
        const { chartType } = this;
        const isColumn = this.isColumnChart();
        const isGrouped = chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar;
        const isNormalized = chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar;

        return {
            ...this.chartOptions.seriesDefaults,
            type: isColumn ? 'column' : 'bar',
            grouped: isGrouped,
            normalizedTo: isNormalized ? 100 : undefined,
        };
    }
}
