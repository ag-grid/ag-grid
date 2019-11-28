import { ChartType, _, BarSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { ColumnSeries as BarSeries } from "../../../../charts/chart/series/cartesian/columnSeries";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { BarSeriesOptions as InternalBarSeriesOptions } from "../../../../charts/chartOptions";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";

export class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();

        const barSeries = ChartBuilder.createSeries(this.getSeriesDefaults());

        if (barSeries) {
            (barSeries as BarSeries).flipXY = !this.isColumnChart();
            this.chart.addSeries(barSeries);
        }
    }

    protected createChart(options: CartesianChartOptions<BarSeriesOptions>): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;
        let builderFunction: keyof typeof ChartBuilder;

        if (this.isColumnChart()) {
            builderFunction = grouping ? 'createGroupedColumnChart' : 'createColumnChart';
        } else {
            builderFunction = grouping ? 'createGroupedBarChart' : 'createBarChart';
        }

        return ChartBuilder[builderFunction](parentElement, options);
    }

    public update(params: UpdateChartParams): void {
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
