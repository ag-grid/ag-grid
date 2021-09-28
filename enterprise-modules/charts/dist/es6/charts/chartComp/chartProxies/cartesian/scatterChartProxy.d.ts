import { CartesianChartOptions, ScatterSeriesOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartTheme } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy<ScatterSeriesOptions> {
    constructor(params: ChartProxyParams);
    protected createChart(): CartesianChart;
    update(params: UpdateChartParams): void;
    protected extractIChartOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<ScatterSeriesOptions>;
    getTooltipsEnabled(): boolean;
    getMarkersEnabled: () => boolean;
    protected getDefaultOptions(): CartesianChartOptions<ScatterSeriesOptions>;
    private getSeriesDefinitions;
    private getCrossFilteringDataDomain;
}
