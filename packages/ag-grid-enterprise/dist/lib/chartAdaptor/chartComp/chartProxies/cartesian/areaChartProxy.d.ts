// ag-grid-enterprise v21.2.2
import { AreaChartOptions } from "ag-grid-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy, LineMarkerProperty } from "./cartesianChartProxy";
export declare type AreaSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export declare class AreaChartProxy extends CartesianChartProxy<AreaChartOptions> {
    private readonly chartType;
    constructor(params: ChartProxyParams);
    private setAxisPadding;
    update(params: UpdateChartParams): void;
    private updateAreaChart;
    setSeriesProperty(property: AreaSeriesProperty | LineMarkerProperty, value: any): void;
    getSeriesProperty(property: AreaSeriesProperty | LineMarkerProperty): string;
    getTooltipsEnabled(): boolean;
    getMarkersEnabled(): boolean;
    private defaultOptions;
}
