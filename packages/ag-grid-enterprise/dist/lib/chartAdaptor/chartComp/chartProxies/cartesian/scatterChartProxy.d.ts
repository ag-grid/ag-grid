// ag-grid-enterprise v21.2.2
import { ScatterChartOptions } from "ag-grid-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy, LineMarkerProperty, ScatterSeriesProperty } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy<ScatterChartOptions> {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    setSeriesProperty(property: ScatterSeriesProperty | LineMarkerProperty, value: any): void;
    getSeriesProperty(property: ScatterSeriesProperty | LineMarkerProperty): string;
    getTooltipsEnabled(): boolean;
    getMarkersEnabled(): boolean;
    private defaultOptions;
}
