// ag-grid-enterprise v21.2.2
import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { CartesianChartOptions } from "ag-grid-community";
export declare type CommonAxisProperty = 'lineColor' | 'lineWidth' | 'tickColor' | 'tickWidth' | 'tickSize' | 'tickPadding';
export declare type LegendFontProperty = 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export declare type LineMarkerProperty = 'marker' | 'markerSize' | 'markerStrokeWidth';
export declare type LineSeriesProperty = 'strokeWidth' | 'tooltipEnabled' | 'markerSize' | 'markerStrokeWidth';
export declare type ScatterSeriesProperty = 'tooltipEnabled' | 'markerSize' | 'markerStrokeWidth';
export declare abstract class CartesianChartProxy<T extends CartesianChartOptions> extends ChartProxy<T> {
    protected constructor(params: ChartProxyParams);
    protected overrideLabelRotation(categoryId: string): boolean;
    setCommonAxisProperty(property: CommonAxisProperty | LegendFontProperty, value: any): void;
    getCommonAxisProperty(property: CommonAxisProperty | LegendFontProperty): string;
    getXRotation(): number;
    setXRotation(rotation: number): void;
    getYRotation(): number;
    setYRotation(rotation: number): void;
}
