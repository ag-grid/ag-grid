import {
    AgAreaSeriesOptions,
    AgCartesianChartOptions,
    AreaSeriesOptions,
    CartesianChartOptions,
    ChartType,
    DropShadowOptions,
    HighlightOptions
} from "@ag-grid-community/core";
import { AgChart, AreaSeries, CartesianChart, ChartTheme, LegendClickEvent } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class AreaChartProxy extends CartesianChartProxy<AreaSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: CartesianChartOptions<AreaSeriesOptions>): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;
        const seriesDefaults = this.getSeriesDefaults();
        const marker = { ...seriesDefaults.marker };
        if (marker.type) { // deprecated
            marker.shape = marker.type;
            delete marker.type;
        }

        options = options || this.chartOptions;
        const agChartOptions = options as AgCartesianChartOptions;

        const xAxisType = options.xAxis.type ? options.xAxis.type : 'category';

        if (grouping) {
            agChartOptions.type = 'groupedCategory';
        }
        agChartOptions.autoSize = true;
        agChartOptions.axes = [{
            type: grouping ? 'groupedCategory' : xAxisType,
            position: 'bottom',
            paddingInner: 1,
            paddingOuter: 0,
            ...this.getXAxisDefaults(xAxisType, options)
        }, {
            type: 'number',
            position: 'left',
            ...options.yAxis
        }];
        agChartOptions.series = [{
            ...seriesDefaults,
            type: 'area',
            fills: seriesDefaults.fill.colors,
            fillOpacity: seriesDefaults.fill.opacity,
            strokes: seriesDefaults.stroke.colors,
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width,
            tooltip: {
                renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
            },
            marker
        }];

        return AgChart.create(agChartOptions, parentElement);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        const axisType = this.isTimeAxis(params) ? 'time' : 'category';
        this.updateAxes(axisType);

        if (this.crossFiltering || this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        } else {
            // stacked and normalized has a single series
            let areaSeries = this.chart.series[0] as AreaSeries;

            if (!areaSeries) {
                const seriesDefaults = this.getSeriesDefaults();
                const marker = { ...seriesDefaults.marker };
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }
                areaSeries = AgChart.createComponent({
                    ...seriesDefaults,
                    fills: seriesDefaults.fill.colors,
                    fillOpacity: seriesDefaults.fill.opacity,
                    strokes: seriesDefaults.stroke.colors,
                    strokeOpacity: seriesDefaults.stroke.opacity,
                    strokeWidth: seriesDefaults.stroke.width,
                    marker
                }, 'area.series');

                if (areaSeries) {
                    this.chart.addSeries(areaSeries);
                } else {
                    return;
                }
            }

            const { fills, strokes } = this.getPalette();

            areaSeries.data = this.transformData(params.data, params.category.id);
            areaSeries.xKey = params.category.id;
            areaSeries.xName = params.category.name;
            areaSeries.yKeys = params.fields.map(f => f.colId);
            areaSeries.yNames = params.fields.map(f => f.displayName!);
            areaSeries.fills = fills;
            areaSeries.strokes = strokes;
        }

        this.updateLabelRotation(params.category.id, false, axisType);
    }

    private updateAreaChart(params: UpdateChartParams): void {
        const { chart } = this;

        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }

        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesById = (chart.series as AreaSeries[])
            .reduceRight((map, series, i) => {
                const id = series.yKeys[0];
                if (fieldIds.indexOf(id) === i) {
                    map.set(id, series);
                } else {
                    chart.removeSeries(series);
                }
                return map;
            }, new Map<string, AreaSeries>());

        const data = this.transformData(params.data, params.category.id);
        let previousSeries: AreaSeries | undefined;

        let { fills, strokes } = this.getPalette();

        if (this.crossFiltering) {
            // introduce cross filtering transparent fills
            let fillsMod: string[] = [];
            fills.forEach(fill => {
                fillsMod.push(fill);
                fillsMod.push(this.hexToRGB(fill, '0.3'));
            });
            fills = fillsMod;

            // introduce cross filtering transparent strokes
            let strokesMod: string[] = [];
            strokes.forEach(stroke => {
                strokesMod.push(stroke);
                strokesMod.push(this.hexToRGB(stroke, '0.3'));
            });
            strokes = strokesMod;
        }

        params.fields.forEach((f, index) => {
            let areaSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            let yKey = f.colId;
            const isFilteredOutYKey = yKey.indexOf('-filtered-out') > 0;
            if (this.crossFiltering && isFilteredOutYKey) {
                yKey = f.colId.replace("-filtered-out", "-total");
                const nonFilteredOutKey = f.colId.replace("-filtered-out", "");
                data.forEach(d => d[yKey] = d[nonFilteredOutKey] + d[f.colId]);
            }

            if (areaSeries) {
                areaSeries.data = data;
                areaSeries.xKey = params.category.id;
                areaSeries.xName = params.category.name;
                areaSeries.yKeys = [yKey];
                areaSeries.yNames = [f.displayName!];
                areaSeries.fills = [fill];
                areaSeries.strokes = [stroke];
            } else {
                const seriesDefaults = this.getSeriesDefaults();
                const marker = { ...seriesDefaults.marker };
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }

                const options: any /*InternalAreaSeriesOptions */ = {
                    ...seriesDefaults,
                    data,
                    xKey: params.category.id,
                    xName: params.category.name,
                    yKeys: [yKey],
                    yNames: [f.displayName],
                    fills: [fill],
                    strokes: [stroke],
                    fillOpacity: seriesDefaults.fill.opacity,
                    strokeOpacity: seriesDefaults.stroke.opacity,
                    strokeWidth: seriesDefaults.stroke.width,
                    marker
                };

                areaSeries = AgChart.createComponent(options, 'area.series');

                if (this.crossFiltering && areaSeries) {
                    // disable series highlighting by default
                    areaSeries.highlightStyle.fill = undefined;

                    // sync toggling of legend item with hidden 'filtered out' item
                    chart.legend.addEventListener('click', (event: LegendClickEvent) => {
                        areaSeries!.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
                    });

                    // special handling for cross filtering markers
                    areaSeries.marker.enabled = true;
                    areaSeries.marker.size = 0;
                    areaSeries.marker.formatter =  (params) => {
                        return {
                            fill: 'yellow',
                            size: params.highlighted ? 12 : params.size
                        };
                    }

                    // add node click cross filtering callback to series
                    areaSeries.addEventListener('nodeClick', this.crossFilterCallback);
                }

                chart.addSeriesAfter(areaSeries!, previousSeries);
            }

            previousSeries = areaSeries;
        });
    }

    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<AreaSeriesOptions> {
        const options = super.getDefaultOptionsFromTheme(theme);

        const seriesDefaults = theme.getConfig<AgAreaSeriesOptions>('area.series.area');
        options.seriesDefaults = {
            shadow: seriesDefaults.shadow as DropShadowOptions,
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
        } as AreaSeriesOptions;

        return options;
    }

    protected getDefaultOptions(): CartesianChartOptions<AreaSeriesOptions> {
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<AreaSeriesOptions>;

        options.xAxis.label.rotation = 335;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            fill: {
                ...options.seriesDefaults.fill,
                opacity: this.chartType === ChartType.Area ? 0.7 : 1,
            },
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                shape: 'circle',
                enabled: true,
                size: 6,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            },
            shadow: this.getDefaultDropShadowOptions(),
        };

        return options;
    }

    private getSeriesDefaults(): any /*InternalAreaSeriesOptions*/ {
        return {
            ...this.chartOptions.seriesDefaults,
            type: 'area',
            normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined,
        };
    }
}