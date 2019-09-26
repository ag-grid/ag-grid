// ag-grid-enterprise v21.2.2
import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { DoughnutChartOptions, PieChartOptions } from "ag-grid-community";
export declare type PolarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export declare type PolarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';
export declare type CalloutProperty = 'calloutLength' | 'calloutStrokeWidth' | 'labelOffset';
export declare abstract class PolarChartProxy<T extends PieChartOptions | DoughnutChartOptions> extends ChartProxy<T> {
    protected constructor(params: ChartProxyParams);
    setSeriesProperty(property: PolarSeriesProperty | PolarSeriesFontProperty | CalloutProperty, value: any): void;
    getSeriesProperty(property: PolarSeriesProperty | PolarSeriesFontProperty | CalloutProperty): string;
    getTooltipsEnabled(): boolean;
    getLabelEnabled(): boolean;
}
