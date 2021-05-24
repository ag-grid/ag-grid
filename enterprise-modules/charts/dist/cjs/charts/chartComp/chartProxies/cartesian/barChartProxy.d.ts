import { BarSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(): CartesianChart;
    update(params: UpdateChartParams): void;
    protected extractIChartOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<BarSeriesOptions>;
    private isColumnChart;
    protected getDefaultOptions(): CartesianChartOptions<BarSeriesOptions>;
}
