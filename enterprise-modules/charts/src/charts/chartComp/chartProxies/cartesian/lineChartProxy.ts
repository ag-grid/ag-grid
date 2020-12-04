import { AgLineSeriesOptions, CartesianChartOptions, HighlightOptions, LineSeriesOptions } from "@ag-grid-community/core";
import {
    AgCartesianChartOptions,
    AgChart,
    CartesianChart,
    ChartTheme,
    LegendClickEvent,
    LineSeries
} from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: CartesianChartOptions<LineSeriesOptions>): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;

        options = options || this.chartOptions;
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

        const fields = this.crossFiltering ?
            params.fields.filter(f => f.colId.indexOf('-filtered-out') < 0) : params.fields;

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
        if (this.crossFiltering) {
            // introduce cross filtering transparent fills
            const fillsMod: string[] = [];
            fills.forEach(fill => {
                fillsMod.push(fill);
                fillsMod.push(this.hexToRGBA(fill, '0.3'));
            });
            fills = fillsMod;

            // introduce cross filtering transparent strokes
            const strokesMod: string[] = [];
            strokes.forEach(stroke => {
                strokesMod.push(stroke);
                strokesMod.push(this.hexToRGBA(stroke, '0.3'));
            });
            strokes = strokesMod;
        }

        fields.forEach((f, index) => {
            let lineSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (lineSeries) {
                lineSeries.title = f.displayName!;
                lineSeries.data = data;
                lineSeries.xKey = params.category.id;
                lineSeries.xName = params.category.name;
                lineSeries.yKey = f.colId;
                lineSeries.yName = f.displayName!;
                lineSeries.marker.fill = fill;
                lineSeries.marker.stroke = stroke;
                lineSeries.stroke = fill; // this is deliberate, so that the line colours match the fills of other series
            } else {
                const { seriesDefaults } = this.chartOptions;
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
                    yKey: f.colId,
                    yName: f.displayName,
                    fill,
                    stroke: fill, // this is deliberate, so that the line colours match the fills of other series
                    fillOpacity: seriesDefaults.fill.opacity,
                    strokeOpacity: seriesDefaults.stroke.opacity,
                    strokeWidth: seriesDefaults.stroke.width,
                    tooltip: {
                        renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer,
                    },
                    marker
                };

                lineSeries = AgChart.createComponent(options, 'line.series');

                if (this.crossFiltering && lineSeries) {
                    // disable series highlighting by default
                    lineSeries.highlightStyle.fill = undefined;

                    // sync toggling of legend item with hidden 'filtered out' item
                    chart.legend.addEventListener('click', (event: LegendClickEvent) => {
                        lineSeries!.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
                    });

                    // special handling for cross filtering markers
                    lineSeries.marker.enabled = true;
                    lineSeries.marker.size = 10;
                    lineSeries.marker.formatter =  p => {
                        return {
                            fill: p.highlighted ? 'yellow' : p.fill,
                            size: p.highlighted ? 12 : p.size
                        };
                    }

                    chart.tooltip.delay = 500;
                    lineSeries.tooltip.renderer = (params) => {
                        return {
                            content: params.yValue.toFixed(0),
                            title: params.xValue, // optional, same as default
                            color: 'black'
                        };
                    }

                    // add node click cross filtering callback to series
                    lineSeries.addEventListener('nodeClick', this.crossFilterCallback);
                }

                chart.addSeriesAfter(lineSeries!, previousSeries);
            }

            previousSeries = lineSeries;
        });

        this.updateLabelRotation(params.category.id, false, axisType);
    }

    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<LineSeriesOptions> {
        const options = super.getDefaultOptionsFromTheme(theme);

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
                colors: theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
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

    protected getDefaultOptions(): CartesianChartOptions<LineSeriesOptions> {
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<LineSeriesOptions>;

        options.xAxis.label.rotation = 335;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                enabled: true,
                shape: 'circle',
                size: 6,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            }
        };

        return options;
    }
}