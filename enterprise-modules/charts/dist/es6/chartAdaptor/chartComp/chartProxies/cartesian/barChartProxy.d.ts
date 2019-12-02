import { BarSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    protected getDefaultOptions(): CartesianChartOptions<BarSeriesOptions>;
    private isColumnChart;
    private getSeriesDefaults;
}
