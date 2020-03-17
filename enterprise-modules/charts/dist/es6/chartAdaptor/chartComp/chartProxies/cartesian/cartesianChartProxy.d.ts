import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { AxisOptions, AxisType, CartesianChartOptions, SeriesOptions } from "@ag-grid-community/core";
import { CartesianChart, ChartAxis, GroupedCategoryChart } from "ag-charts-community";
export declare abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {
    protected constructor(params: ChartProxyParams);
    getAxisProperty<T = string>(expression: string): T;
    setAxisProperty(expression: string, value: any): void;
    protected updateLabelRotation(categoryId: string, isHorizontalChart?: boolean): void;
    protected getDefaultAxisOptions(): AxisOptions;
    protected getDefaultCartesianChartOptions(): CartesianChartOptions<SeriesOptions>;
    protected updateAxes(baseAxisType?: AxisType, isHorizontalChart?: boolean): void;
    protected getXAxis(): ChartAxis;
    protected getYAxis(): ChartAxis;
}
