import { LineSeriesOptions, CartesianChartOptions } from "@ag-grid-community/grid-core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    protected getDefaultOptions(): CartesianChartOptions<LineSeriesOptions>;
}
