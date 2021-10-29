import {
    AgHistogramSeriesOptions,
} from "@ag-grid-community/core";
import { AgCartesianChartOptions, AgChart, CartesianChart, ChartTheme, HistogramSeries, AgChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class HistogramChartProxy extends CartesianChartProxy<any> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        const agChartOptions = { theme: this.chartTheme } as AgCartesianChartOptions;
        const { parentElement } = this.chartProxyParams;

        const [xAxis, yAxis] = this.getAxes();
        agChartOptions.axes = [{
            type: 'number',
            position: 'bottom',
            ...xAxis
        }, {
            type: 'number',
            position: 'left',
            ...yAxis
        }];

        agChartOptions.series = [{
            ...this.chartOptions[this.standaloneChartType].series,
            type: 'histogram'
        }];

        return AgChart.create(agChartOptions, parentElement);
    }

    public update(params: UpdateChartParams): void {
        const [xField] = params.fields;

        const chart = this.chart;
        const series = chart.series[0] as HistogramSeries;

        series.data = params.data;
        series.xKey = xField.colId;
        series.xName = xField.displayName!;

        // for now, only constant width is supported via integrated charts
        series.areaPlot = false;

        const { fills, strokes } = this.getPalette();
        series.fill = fills[0];
        series.stroke = strokes[0];
    }
}