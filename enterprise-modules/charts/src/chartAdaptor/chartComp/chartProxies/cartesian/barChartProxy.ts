import {
    _,
    AgBarSeriesOptions,
    BarSeriesLabelOptions,
    BarSeriesOptions,
    CartesianChartOptions,
    ChartType,
    DropShadowOptions,
    HighlightOptions
} from "@ag-grid-community/core";
import {AgCartesianChartOptions, AgChart, BarSeries, CartesianChart, ChartTheme} from "ag-charts-community";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import {CartesianChartProxy} from "./cartesianChartProxy";

export class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<BarSeriesOptions> {
        const options = super.getDefaultOptionsFromTheme(theme);

        const { chartType: integratedChartType } = this;
        const standaloneChartType = this.getStandaloneChartType();

        const seriesType = integratedChartType === ChartType.GroupedBar
            || integratedChartType === ChartType.StackedBar
            || integratedChartType === ChartType.NormalizedBar ? 'bar' : 'column';
            
        const seriesDefaults = theme.getConfig<AgBarSeriesOptions>(standaloneChartType + '.series.' + seriesType);

        options.seriesDefaults = {
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
        } as BarSeriesOptions;

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
            tooltipRenderer: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer,
        }];

        agChartOptions.container = parentElement;
        return AgChart.create(agChartOptions);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        this.updateAxes('category', !this.isColumnChart());

        const chart = this.chart;
        const barSeries = chart.series[0] as BarSeries;
        const palette = this.getPalette();

        barSeries.data = this.transformData(params.data, params.category.id);
        barSeries.xKey = params.category.id;
        barSeries.xName = params.category.name;
        barSeries.yKeys = params.fields.map(f => f.colId);
        barSeries.yNames = params.fields.map(f => f.displayName);
        barSeries.fills = palette.fills;
        barSeries.strokes = palette.strokes;

        this.updateLabelRotation(params.category.id, !this.isColumnChart());
    }

    protected getDefaultOptions(): CartesianChartOptions<BarSeriesOptions> {
        const fontOptions = this.getDefaultFontOptions();
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<BarSeriesOptions>;

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