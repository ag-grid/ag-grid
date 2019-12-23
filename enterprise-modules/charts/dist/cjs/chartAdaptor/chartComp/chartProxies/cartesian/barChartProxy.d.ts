import { BarSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
export declare class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(options: CartesianChartOptions<BarSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    protected getDefaultOptions(): CartesianChartOptions<BarSeriesOptions>;
    private isColumnChart;
    private getSeriesDefaults;
}
