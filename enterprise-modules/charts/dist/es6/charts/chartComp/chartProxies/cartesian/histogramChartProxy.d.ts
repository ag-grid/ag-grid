import { CartesianChartOptions, HistogramSeriesOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class HistogramChartProxy extends CartesianChartProxy<HistogramSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(): CartesianChart;
    update(params: UpdateChartParams): void;
    protected extractIChartOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<HistogramSeriesOptions>;
    private getSeriesDefaults;
    protected getDefaultOptions(): CartesianChartOptions<HistogramSeriesOptions>;
}
