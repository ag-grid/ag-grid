import { HistogramSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { CartesianChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class HistogramChartProxy extends CartesianChartProxy<HistogramSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(options?: CartesianChartOptions<HistogramSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    protected getDefaultOptions(): CartesianChartOptions<HistogramSeriesOptions>;
    private getSeriesDefaults;
}
