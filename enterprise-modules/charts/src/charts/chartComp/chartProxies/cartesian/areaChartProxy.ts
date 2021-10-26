import {
    AgAreaSeriesOptions,
    AgCartesianChartOptions,
    ChartType,
} from "@ag-grid-community/core";
import { AgChart, AreaSeries, CartesianChart, ChartTheme, AgChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class AreaChartProxy extends CartesianChartProxy<any> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    // normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined,

    protected createChart(): CartesianChart {
        const agChartOptions = { theme: this.chartOptions } as AgCartesianChartOptions;
        const { grouping, parentElement } = this.chartProxyParams;

        const [xAxis, yAxis] = this.getAxes();
        const xAxisType = xAxis.type ? xAxis.type : 'category';
        if (grouping) { agChartOptions.type = 'groupedCategory'; }

        agChartOptions.axes = [
            {
                type: grouping ? 'groupedCategory' : xAxisType,
                position: 'bottom',
                paddingInner: 1,
                paddingOuter: 0,
                ...this.getXAxisDefaults(xAxisType, agChartOptions)
            }, {
                type: 'number',
                position: 'left',
                ...yAxis
            }
        ];

        // agChartOptions.series = [{
        //     ...seriesDefaults,
        //     type: 'area',
        //     fills: seriesDefaults.fill.colors,
        //     fillOpacity: seriesDefaults.fill.opacity,
        //     strokes: seriesDefaults.stroke.colors,
        //     strokeOpacity: seriesDefaults.stroke.opacity,
        //     strokeWidth: seriesDefaults.stroke.width,
        //     tooltip: {
        //         renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer
        //     },
        //     marker
        // }];


        return AgChart.create(agChartOptions, parentElement);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        const axisType = this.isTimeAxis(params) ? 'time' : 'category';
        this.updateAxes(axisType);

        if (this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        } else {
            // stacked and normalized has a single series
            let areaSeries = this.chart.series[0] as AreaSeries;

            if (!areaSeries) {
                const seriesDefaults = {
                    ...this.chartOptions.overrides.area.series.area,
                    type: 'area',
                    normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined,
                };

                areaSeries = AgChart.createComponent({ ...seriesDefaults }, 'area.series');
                if (!areaSeries) { return; }
                this.chart.addSeries(areaSeries);
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

        params.fields.forEach((f, index) => {
            let {yKey, atLeastOneSelectedPoint} = this.processDataForCrossFiltering(data, f.colId, params);

            let areaSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (areaSeries) {
                areaSeries.data = data;
                areaSeries.xKey = params.category.id;
                areaSeries.xName = params.category.name;
                areaSeries.yKeys = [yKey];
                areaSeries.yNames = [f.displayName!];
                areaSeries.fills = [fill];
                areaSeries.strokes = [stroke];

            } else {

                const seriesOverrides = this.chartOptions.overrides.area.series.area;
                const seriesDefaults = {
                    ...seriesOverrides,
                    type: 'area',
                    normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined,
                };

                const options: any = {
                    ...seriesDefaults,
                    data,
                    xKey: params.category.id,
                    xName: params.category.name,
                    yKeys: [yKey],
                    yNames: [f.displayName],
                    fills: [fill],
                    strokes: [stroke],
                    marker: {
                        ...seriesDefaults!.marker,
                        fill,
                        stroke
                    },
                };

                areaSeries = AgChart.createComponent(options, 'area.series');
                chart.addSeriesAfter(areaSeries!, previousSeries);
            }

            this.updateSeriesForCrossFiltering(areaSeries!, f.colId, chart, params, atLeastOneSelectedPoint);

            previousSeries = areaSeries;
        });
    }
}