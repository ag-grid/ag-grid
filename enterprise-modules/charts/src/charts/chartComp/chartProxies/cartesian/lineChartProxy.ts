import {
    AgLineSeriesOptions,
    LineSeriesLabelOptions,
    CartesianChartOptions,
    HighlightOptions,
    LineSeriesOptions
} from "@ag-grid-community/core";
import { AgCartesianChartOptions, AgChart, CartesianChart, ChartTheme, LineSeries, } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;

        const options = this.iChartOptions;
        const agChartOptions = options as AgCartesianChartOptions;
        agChartOptions.autoSize = true;

        const xAxisType = options.xAxis.type ? options.xAxis.type : 'category';

        if (grouping) {
            agChartOptions.type = 'groupedCategory';
        }
        agChartOptions.axes = [{
            type: grouping ? 'groupedCategory' : xAxisType,
            position: 'bottom',
            ...this.getXAxisDefaults(xAxisType, options)
        }, {
            type: 'number',
            position: 'left',
            ...options.yAxis
        }];

        return AgChart.create(agChartOptions, parentElement);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const axisType = this.isTimeAxis(params) ? 'time' : 'category';
        this.updateAxes(axisType);

        const { chart } = this;

        const { fields } = params;
        const fieldIds = fields.map(f => f.colId);
        const data = this.transformData(params.data, params.category.id);

        const existingSeriesById = (chart.series as LineSeries[]).reduceRight((map, series, i) => {
            const id = series.yKey;

            if (fieldIds.indexOf(id) === i) {
                map.set(id, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, LineSeries>());

        let previousSeries: LineSeries | undefined;

        let { fills, strokes } = this.getPalette();
        fields.forEach((f, index) => {
            let {yKey, atLeastOneSelectedPoint} = this.processDataForCrossFiltering(data, f.colId, params);

            let lineSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (lineSeries) {
                lineSeries.title = f.displayName!;
                lineSeries.data = data;
                lineSeries.xKey = params.category.id;
                lineSeries.xName = params.category.name;
                lineSeries.yKey = yKey;
                lineSeries.yName = f.displayName!;
                lineSeries.marker.fill = fill;
                lineSeries.marker.stroke = stroke;
                lineSeries.stroke = fill; // this is deliberate, so that the line colours match the fills of other series
            } else {
                const { seriesDefaults } = this.iChartOptions;
                const marker = {
                    ...seriesDefaults.marker,
                    fill,
                    stroke
                } as any;
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }
                const options: any /*InternalLineSeriesOptions*/ = {
                    ...seriesDefaults,
                    type: 'line',
                    title: f.displayName,
                    data,
                    xKey: params.category.id,
                    xName: params.category.name,
                    yKey: yKey,
                    yName: f.displayName,
                    fill,
                    stroke: fill, // this is deliberate, so that the line colours match the fills of other series
                    fillOpacity: seriesDefaults.fill.opacity,
                    strokeOpacity: seriesDefaults.stroke.opacity,
                    strokeWidth: seriesDefaults.stroke.width,
                    tooltip: {
                        enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                        renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer,
                    },
                    marker
                };

                lineSeries = AgChart.createComponent(options, 'line.series');
                chart.addSeriesAfter(lineSeries!, previousSeries);
            }

            this.updateSeriesForCrossFiltering(lineSeries!, f.colId, chart, params, atLeastOneSelectedPoint);

            previousSeries = lineSeries;
        });

        this.updateLabelRotation(params.category.id, false, axisType);
    }

    protected extractIChartOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<LineSeriesOptions> {
        const options = super.extractIChartOptionsFromTheme(theme);

        const seriesDefaults = theme.getConfig<AgLineSeriesOptions>('line.series.line');
        options.seriesDefaults = {
            tooltip: {
                enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            fill: {
                colors: [],
                opacity: 1
            },
            stroke: {
                colors: (seriesDefaults.stroke && [seriesDefaults.stroke]) || theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            label: seriesDefaults.label as LineSeriesLabelOptions,
            marker: {
                enabled: seriesDefaults.marker!.enabled,
                shape: seriesDefaults.marker!.shape,
                size: seriesDefaults.marker!.size,
                strokeWidth: seriesDefaults.marker!.strokeWidth,
                formatter: seriesDefaults.marker!.formatter
            },
            lineDash: seriesDefaults.lineDash ? seriesDefaults.lineDash : [0],
            lineDashOffset: seriesDefaults.lineDashOffset,
            highlightStyle: seriesDefaults.highlightStyle as HighlightOptions,
            listeners: seriesDefaults.listeners
        } as LineSeriesOptions;

        return options;
    }
}