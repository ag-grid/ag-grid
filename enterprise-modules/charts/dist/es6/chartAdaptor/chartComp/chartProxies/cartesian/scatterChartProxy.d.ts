import { CartesianChartOptions, ScatterSeriesOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy<ScatterSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<ScatterSeriesOptions>;
    protected createChart(options?: CartesianChartOptions<ScatterSeriesOptions>): CartesianChart;
    update(params: UpdateChartParams): void;
    getTooltipsEnabled(): boolean;
    getMarkersEnabled: () => boolean;
    protected getDefaultOptions(): CartesianChartOptions<ScatterSeriesOptions>;
    private getSeriesDefinitions;
}
