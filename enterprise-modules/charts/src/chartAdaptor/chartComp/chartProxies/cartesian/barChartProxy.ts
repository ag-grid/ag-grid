import {
    _,
    BarSeriesOptions,
    CartesianChartOptions,
    ChartType,
    AgBarSeriesOptions,
    DropShadowOptions,
    BarSeriesLabelOptions,
    HighlightOptions,
    AgChartOptions
} from "@ag-grid-community/core";
import {
    CartesianChart,
    BarSeries,
    AgChart, AgCartesianChartOptions, ChartTheme
} from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { mergeDeep, deepMerge } from "../../object";

export class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected getDefaultOptionsWithTheme(theme: ChartTheme): CartesianChartOptions<BarSeriesOptions> {
        const options = super.getDefaultOptionsWithTheme(theme);
        const { chartType: integratedChartType } = this;
        const standaloneChartType = this.getStandaloneChartType();
        const seriesType = integratedChartType === ChartType.GroupedBar
            || integratedChartType === ChartType.StackedBar
            || integratedChartType === ChartType.NormalizedBar ? 'bar' : 'column';
        const seriesDefaults = theme.getConfig<AgBarSeriesOptions>(standaloneChartType + '.series.' + seriesType);
        const iSeriesDefaults: BarSeriesOptions = {
            shadow: seriesDefaults.shadow as DropShadowOptions,
            label: seriesDefaults.label as BarSeriesLabelOptions,
            tooltip: {
                enabled: seriesDefaults.tooltipEnabled,
                renderer: seriesDefaults.tooltipRenderer
            },
            fill: {
                colors: seriesDefaults.fills,
                opacity: seriesDefaults.fillOpacity
            },
            stroke: {
                colors: seriesDefaults.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            highlightStyle: seriesDefaults.highlightStyle as HighlightOptions
        };
        options.seriesDefaults = deepMerge(iSeriesDefaults, options.seriesDefaults);
        return options;
    }

    protected createChart(options?: CartesianChartOptions<BarSeriesOptions>): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;
        const isColumn = this.isColumnChart();

        options = options || this.chartOptions;
        const { seriesDefaults } = options;

        const agChartOptions = options as AgCartesianChartOptions;

        agChartOptions.autoSize = true;
        agChartOptions.axes = [{
            ...(isColumn ? options.xAxis : options.yAxis),
            position: isColumn ? 'bottom' : 'left',
            type: grouping ? 'groupedCategory' : 'category'
        }, {
            ...(isColumn ? options.yAxis : options.xAxis),
            position: isColumn ? 'left' : 'bottom',
            type: 'number'
        }];
        agChartOptions.series = [{
            ...this.getSeriesDefaults(),
            fills: seriesDefaults.fill.colors,
            fillOpacity: seriesDefaults.fill.opacity,
            strokes: seriesDefaults.stroke.colors,
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width,
            tooltipRenderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
        }];

        const params = {
            type: this.chartType,
            options: agChartOptions
        };

        // let opts = this.chartProxyParams.processAgChartOptions(params) as AgCartesianChartOptions;
        // return AgChart.create(opts, parentElement);
        return AgChart.create(agChartOptions, parentElement);
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