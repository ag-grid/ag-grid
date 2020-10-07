import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { AxisOptions, AxisType, CartesianChartOptions, SeriesOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartAxis, ChartTheme, GroupedCategoryChart } from "ag-charts-community";
export declare abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {
    protected constructor(params: ChartProxyParams);
    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<T>;
    getAxisProperty<T = string>(expression: string): T;
    setAxisProperty(expression: string, value: any): void;
    protected updateLabelRotation(categoryId: string, isHorizontalChart?: boolean, axisType?: 'time' | 'category'): void;
    protected getDefaultAxisOptions(): AxisOptions;
    protected getDefaultCartesianChartOptions(): CartesianChartOptions<SeriesOptions>;
    protected axisTypeToClassMap: {
        [key in string]: typeof ChartAxis;
    };
    protected getAxisClass(axisType: string): typeof ChartAxis;
    protected updateAxes(baseAxisType?: AxisType, isHorizontalChart?: boolean): void;
    protected isTimeAxis(params: UpdateChartParams): boolean;
    protected getXAxisDefaults(xAxisType: AxisType, options: CartesianChartOptions<T>): any;
    protected getXAxis(): ChartAxis;
    protected getYAxis(): ChartAxis;
}
