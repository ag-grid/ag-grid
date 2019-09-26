// ag-grid-enterprise v21.2.2
import { LineChartOptions } from "ag-grid-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy, LineMarkerProperty, LineSeriesProperty } from "./cartesianChartProxy";
export declare class LineChartProxy extends CartesianChartProxy<LineChartOptions> {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    setSeriesProperty(property: LineSeriesProperty | LineMarkerProperty, value: any): void;
    getSeriesProperty(property: LineSeriesProperty | LineMarkerProperty): string;
    getTooltipsEnabled(): boolean;
    getMarkersEnabled(): boolean;
    private defaultOptions;
}
