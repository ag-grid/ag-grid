import { ScatterSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
export declare class ScatterChartProxy extends CartesianChartProxy<ScatterSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(options: CartesianChartOptions<ScatterSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    private updateAxes;
    getTooltipsEnabled(): boolean;
    getMarkersEnabled: () => boolean;
    protected getDefaultOptions(): CartesianChartOptions<ScatterSeriesOptions>;
    private getSeriesDefinitions;
}
