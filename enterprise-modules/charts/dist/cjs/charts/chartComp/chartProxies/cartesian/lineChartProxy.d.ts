import { CartesianChartOptions, LineSeriesOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(): CartesianChart;
    update(params: UpdateChartParams): void;
    protected extractIChartOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<LineSeriesOptions>;
    protected getDefaultOptions(): CartesianChartOptions<LineSeriesOptions>;
}
