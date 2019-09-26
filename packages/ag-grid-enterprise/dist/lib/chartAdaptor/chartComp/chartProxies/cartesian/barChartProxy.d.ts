// ag-grid-enterprise v21.2.2
import { BarChartOptions } from "ag-grid-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare type BarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export declare type BarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export declare class BarChartProxy extends CartesianChartProxy<BarChartOptions> {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    setSeriesProperty(property: BarSeriesProperty | BarSeriesFontProperty, value: any): void;
    getSeriesProperty(property: BarSeriesProperty | BarSeriesFontProperty): string;
    getTooltipsEnabled(): boolean;
    getLabelEnabled(): boolean;
    private static isBarChart;
    private defaultOptions;
}
