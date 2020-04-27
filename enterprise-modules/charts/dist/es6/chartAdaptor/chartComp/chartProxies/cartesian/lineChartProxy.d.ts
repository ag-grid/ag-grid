import { CartesianChartOptions, LineSeriesOptions } from "@ag-grid-community/core";
import { CartesianChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(options?: CartesianChartOptions<LineSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    protected getDefaultOptions(): CartesianChartOptions<LineSeriesOptions>;
}
