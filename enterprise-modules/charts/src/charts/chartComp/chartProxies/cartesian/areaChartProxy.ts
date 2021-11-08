import { ChartType, } from "@ag-grid-community/core";
import { AgChart, AreaSeries, CartesianChart, ChartAxisPosition } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../object";

export class AreaChartProxy extends CartesianChartProxy<any> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        return AgChart.create({
            type: 'area',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes()
        });
    }

    public update(params: UpdateChartParams): void {
        this.updateAxes(params);

        if (this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        } else {
            // stacked and normalized has a single series
            let areaSeries = this.chart.series[0] as AreaSeries;

            if (!areaSeries) {
                const seriesDefaults = {
                    ...this.chartOptions[this.standaloneChartType].series,
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

        this.updateLabelRotation(params.category.id);
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
                const seriesOverrides = this.chartOptions[this.standaloneChartType].series;
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

    private getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom,
                paddingInner: 1,
                paddingOuter: 0,
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: ChartAxisPosition.Left
            },
        ];
    }
}