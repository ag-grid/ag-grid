import { ScatterSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy<ScatterSeriesOptions> {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    getTooltipsEnabled(): boolean;
    getMarkersEnabled: () => boolean;
    protected getDefaultOptions(): CartesianChartOptions<ScatterSeriesOptions>;
    private getSeriesDefinitions;
}
