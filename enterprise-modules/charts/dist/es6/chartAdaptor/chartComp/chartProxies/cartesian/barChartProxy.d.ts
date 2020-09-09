import { BarSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<BarSeriesOptions>;
    protected createChart(options?: CartesianChartOptions<BarSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    protected getDefaultOptions(): CartesianChartOptions<BarSeriesOptions>;
    private isColumnChart;
    private getSeriesDefaults;
}
