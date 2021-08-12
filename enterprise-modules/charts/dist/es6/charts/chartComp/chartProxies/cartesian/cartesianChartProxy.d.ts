import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { AxisOptions, AxisType, CartesianChartOptions, SeriesOptions } from "@ag-grid-community/core";
import { AreaSeries, LineSeries, CartesianChart, ChartAxis, ChartTheme, GroupedCategoryChart } from "ag-charts-community";
export declare abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {
    private prevCategory;
    private prevAxisLabelRotation;
    protected constructor(params: ChartProxyParams);
    protected extractIChartOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<T>;
    getAxisProperty<T = string>(expression: string): T;
    setAxisProperty(expression: string, value: any): void;
    protected updateLabelRotation(categoryId: string, isHorizontalChart?: boolean, axisType?: 'time' | 'category'): void;
    private getUserThemeOverrideRotation;
    protected getDefaultAxisOptions(): AxisOptions;
    protected getDefaultCartesianChartOptions(): CartesianChartOptions<SeriesOptions>;
    protected axisTypeToClassMap: {
        [key in string]: any;
    };
    protected updateAxes(baseAxisType?: AxisType, isHorizontalChart?: boolean): void;
    protected isTimeAxis(params: UpdateChartParams): boolean;
    protected getXAxisDefaults(xAxisType: AxisType, options: CartesianChartOptions<T>): any;
    protected getXAxis(): ChartAxis | undefined;
    protected getYAxis(): ChartAxis | undefined;
    protected processDataForCrossFiltering(data: any[], colId: string, params: UpdateChartParams): {
        yKey: string;
        atLeastOneSelectedPoint: boolean;
    };
    protected updateSeriesForCrossFiltering(series: AreaSeries | LineSeries, colId: string, chart: CartesianChart, params: UpdateChartParams, atLeastOneSelectedPoint: boolean): void;
}
