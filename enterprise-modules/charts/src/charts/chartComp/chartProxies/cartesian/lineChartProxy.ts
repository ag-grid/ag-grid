import {
    AgLineSeriesOptions,
} from "@ag-grid-community/core";
import { AgCartesianChartOptions, AgChart, CartesianChart, ChartTheme, LineSeries, AgChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class LineChartProxy extends CartesianChartProxy<any> {

    public constructor(params: ChartProxyParams) {
        super(params);
        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        const agChartOptions = { theme: this.chartTheme } as AgCartesianChartOptions;
        const { grouping, parentElement } = this.chartProxyParams;

        agChartOptions.type = grouping ? 'groupedCategory' : 'line';

        const [xAxis, yAxis] = this.getAxes();
        const xAxisType = xAxis.type ? xAxis.type : 'category';
        agChartOptions.axes = [{
            type: grouping ? 'groupedCategory' : xAxisType,
            position: 'bottom',
            ...this.getXAxisDefaults(xAxisType, agChartOptions)
        }, {
            type: 'number',
            position: 'left',
            ...yAxis
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
            (fieldIds.indexOf(id) === i) ?  map.set(id, series) : chart.removeSeries(series);
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
                const seriesOverrides = this.chartOptions[this.standaloneChartType].series;
                const seriesOptions = {
                    ...seriesOverrides,
                    type: 'line',
                    title: f.displayName,
                    data,
                    xKey: params.category.id,
                    xName: params.category.name,
                    yKey: yKey,
                    yName: f.displayName,
                    fill,
                    stroke: fill, // this is deliberate, so that the line colours match the fills of other series
                    marker: {
                        ...seriesOverrides!.marker,
                        fill,
                        stroke
                    }
                }

                lineSeries = AgChart.createComponent(seriesOptions, 'line.series');
                chart.addSeriesAfter(lineSeries!, previousSeries);
            }

            this.updateSeriesForCrossFiltering(lineSeries!, f.colId, chart, params, atLeastOneSelectedPoint);

            previousSeries = lineSeries;
        });

        this.updateLabelRotation(params.category.id, false, axisType);
    }
}