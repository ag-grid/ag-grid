import { LineSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
export declare class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(options: CartesianChartOptions<LineSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    private updateAxes;
    protected getDefaultOptions(): CartesianChartOptions<LineSeriesOptions>;
}
