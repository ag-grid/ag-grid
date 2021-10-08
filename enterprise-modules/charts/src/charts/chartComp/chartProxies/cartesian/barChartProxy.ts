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
import {
    AgCartesianChartOptions,
    AgChart,
    BarSeries,
    CartesianChart,
    ChartTheme,
    LegendClickEvent
} from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        const {grouping} = this.chartProxyParams;
        const isColumn = this.isColumnChart();

        const options = this.iChartOptions;
        const agChartOptions = options as AgCartesianChartOptions;

        if (grouping) {
            agChartOptions.type = 'groupedCategory';
        }
        agChartOptions.autoSize = true;
        agChartOptions.axes = [
            {
                ...(isColumn ? options.xAxis : options.yAxis),
                position: isColumn ? 'bottom' : 'left',
                type: grouping ? 'groupedCategory' : 'category'
            },
            {
                ...(isColumn ? options.yAxis : options.xAxis),
                position: isColumn ? 'left' : 'bottom',
                type: 'number'
            }
        ];

        // special handling to add a default label formatter to show '%' for normalized charts if none is provided
        const normalised = _.includes([ChartType.NormalizedColumn, ChartType.NormalizedBar], this.chartType);
        if (normalised) {
            const numberAxis = agChartOptions.axes[1];
            if (numberAxis.label && !numberAxis.label.formatter) {
                numberAxis.label = {...numberAxis.label, formatter: params => Math.round(params.value) + '%'};
            }
        }

        const {chartType} = this;
        const isGrouped = !this.crossFiltering && (chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar);
        const isNormalized = !this.crossFiltering && (chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar);

        const {seriesDefaults} = this.iChartOptions;
        agChartOptions.series = [{
            type: isColumn ? 'column' : 'bar',
            grouped: isGrouped,
            normalizedTo: isNormalized ? 100 : undefined,
            ...seriesDefaults,
            // mapping for ag chart options
            fills: seriesDefaults.fill.colors,
            fillOpacity: seriesDefaults.fill.opacity,
            strokes: seriesDefaults.stroke.colors,
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width,
        }];

        agChartOptions.container = this.chartProxyParams.parentElement;
        return AgChart.create(agChartOptions);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        this.updateAxes('category', !this.isColumnChart());

        const chart = this.chart;
        const barSeries = chart.series[0] as BarSeries;
        const palette = this.getPalette();

        let fields = params.fields;
        if (this.crossFiltering) {
            // add additional filtered out field
            fields.forEach(field => {
                const crossFilteringField = {...field};
                crossFilteringField.colId = field.colId + '-filtered-out';
                fields.push(crossFilteringField);
            });

            // introduce cross filtering transparent fills
            const fills: string[] = [];
            palette.fills.forEach(fill => {
                fills.push(fill);
                fills.push(this.hexToRGBA(fill, '0.3'));
            });
            barSeries.fills = fills;

            // introduce cross filtering transparent strokes
            const strokes: string[] = [];
            palette.strokes.forEach(stroke => {
                fills.push(stroke);
                fills.push(this.hexToRGBA(stroke, '0.3'));
            });
            barSeries.strokes = strokes;

            // disable series highlighting by default
            barSeries.highlightStyle.fill = undefined;

            // hide 'filtered out' legend items
            const colIds = params.fields.map(f => f.colId);
            barSeries.hideInLegend = colIds.filter(colId => colId.indexOf('-filtered-out') !== -1);

            // sync toggling of legend item with hidden 'filtered out' item
            chart.legend.addEventListener('click', (event: LegendClickEvent) => {
                barSeries.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
            });

            chart.tooltip.delay = 500;

            // add node click cross filtering callback to series
            barSeries.addEventListener('nodeClick', this.crossFilterCallback);

        } else {
            barSeries.fills = palette.fills;
            barSeries.strokes = palette.strokes;
        }

        barSeries.data = this.transformData(params.data, params.category.id);
        barSeries.xKey = params.category.id;
        barSeries.xName = params.category.name;
        barSeries.yKeys = params.fields.map(f => f.colId) as any;
        barSeries.yNames = params.fields.map(f => f.displayName!) as any;

        this.updateLabelRotation(params.category.id, !this.isColumnChart());
    }

    protected extractIChartOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<BarSeriesOptions> {
        const iChartOptions = super.extractIChartOptionsFromTheme(theme);

        const {chartType: integratedChartType} = this;
        const standaloneChartType = this.getStandaloneChartType();

        const seriesType = integratedChartType === ChartType.GroupedBar
            || integratedChartType === ChartType.StackedBar
            || integratedChartType === ChartType.NormalizedBar ? 'bar' : 'column';

        const themeSeriesDefaults = theme.getConfig<AgBarSeriesOptions>(standaloneChartType + '.series.' + seriesType);

        iChartOptions.seriesDefaults = {
            shadow: themeSeriesDefaults.shadow as DropShadowOptions,
            label: themeSeriesDefaults.label as BarSeriesLabelOptions,
            tooltip: {
                enabled: themeSeriesDefaults.tooltip && themeSeriesDefaults.tooltip.enabled,
                renderer: themeSeriesDefaults.tooltip && themeSeriesDefaults.tooltip.renderer
            },
            fill: {
                colors: themeSeriesDefaults.fills || theme.palette.fills,
                opacity: themeSeriesDefaults.fillOpacity
            },
            stroke: {
                colors: themeSeriesDefaults.strokes || theme.palette.strokes,
                opacity: themeSeriesDefaults.strokeOpacity,
                width: themeSeriesDefaults.strokeWidth
            },
            formatter: themeSeriesDefaults.formatter,
            lineDash: themeSeriesDefaults.lineDash ? themeSeriesDefaults.lineDash : [0],
            lineDashOffset: themeSeriesDefaults.lineDashOffset,
            highlightStyle: themeSeriesDefaults.highlightStyle as HighlightOptions,
            listeners: themeSeriesDefaults.listeners
        } as BarSeriesOptions;

        return iChartOptions;
    }

    private isColumnChart(): boolean {
        return _.includes([ChartType.Column, ChartType.GroupedColumn, ChartType.StackedColumn, ChartType.NormalizedColumn], this.chartType);
    }
}