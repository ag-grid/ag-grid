import { AreaSeriesOptions, CartesianChartOptions, ChartType } from "@ag-grid-community/core";
import { AreaSeries, CartesianChart, AgChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class AreaChartProxy extends CartesianChartProxy<AreaSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options: any): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;
        const seriesDefaults = this.getSeriesDefaults();
        const marker = { ...seriesDefaults.marker } as any;
        if (marker.type) { // deprecated
            marker.shape = marker.type;
            delete marker.type;
        }

        options = options || this.chartOptions;
        options.autoSize = true;
        options.axes = [{
            ...options.xAxis,
            position: 'bottom',
            type: grouping ? 'groupedCategory' : 'category',
            paddingInner: 1,
            paddingOuter: 0
        }, {
            ...options.yAxis,
            position: 'left',
            type: 'number'
        }];
        options.series = [{
            ...seriesDefaults,
            type: 'area',
            fills: seriesDefaults.fill.colors,
            fillOpacity: seriesDefaults.fill.opacity,
            strokes: seriesDefaults.stroke.colors,
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width,
            marker
        }];

        return AgChart.create(options, parentElement);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        this.updateAxes();

        if (this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        } else {
            // stacked and normalized has a single series
            let areaSeries = this.chart.series[0] as AreaSeries;

            if (!areaSeries) {
                const seriesDefaults = this.getSeriesDefaults();
                const marker = { ...seriesDefaults.marker } as any;
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
            areaSeries.yNames = params.fields.map(f => f.displayName);
            areaSeries.fills = fills;
            areaSeries.strokes = strokes;
        }

        this.updateLabelRotation(params.category.id);
    }

    private updateAreaChart(params: UpdateChartParams): void {
        const { chart } = this;

        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }

        const fieldIds = params.fields.map(f => f.colId);
        const { fills, strokes } = this.getPalette();

        const existingSeriesById = (chart.series as AreaSeries[]).reduceRight((map, series, i) => {
            const id = series.yKeys[0];

            if (fieldIds.indexOf(id) === i) {
                map.set(id, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, AreaSeries>());

        const data = this.transformData(params.data, params.category.id);
        let previousSeries: AreaSeries | undefined = undefined;

        params.fields.forEach((f, index) => {
            let areaSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (areaSeries) {
                areaSeries.data = data;
                areaSeries.xKey = params.category.id;
                areaSeries.xName = params.category.name;
                areaSeries.yKeys = [f.colId];
                areaSeries.yNames = [f.displayName];
                areaSeries.fills = [fill];
                areaSeries.strokes = [stroke];
            } else {
                const seriesDefaults = this.getSeriesDefaults();
                const marker = { ...seriesDefaults.marker } as any;
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }
                const options: any /*InternalAreaSeriesOptions */ = {
                    ...seriesDefaults,
                    data,
                    xKey: params.category.id,
                    xName: params.category.name,
                    yKeys: [f.colId],
                    yNames: [f.displayName],
                    fills: [fill],
                    strokes: [stroke],
                    fillOpacity: seriesDefaults.fill.opacity,
                    strokeOpacity: seriesDefaults.stroke.opacity,
                    strokeWidth: seriesDefaults.stroke.width,
                    marker
                };

                areaSeries = AgChart.createComponent(options, 'area.series');

                chart.addSeriesAfter(areaSeries, previousSeries);
            }

            previousSeries = areaSeries;
        });
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
