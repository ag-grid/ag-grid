import { CartesianChartOptions, AreaSeriesOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class AreaChartProxy extends CartesianChartProxy<AreaSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(options: CartesianChartOptions<AreaSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    private updateAreaChart;
    protected getDefaultOptions(): CartesianChartOptions<AreaSeriesOptions>;
    private getSeriesDefaults;
}
