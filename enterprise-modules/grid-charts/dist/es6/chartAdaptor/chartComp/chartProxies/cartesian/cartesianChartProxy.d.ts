import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { CartesianChartOptions, SeriesOptions, AxisOptions } from "@ag-grid-community/core";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { GroupedCategoryChart } from "../../../../charts/chart/groupedCategoryChart";
export declare abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {
    protected constructor(params: ChartProxyParams);
    getAxisProperty<T = string>(expression: string): T;
    setAxisProperty(expression: string, value: any): void;
    protected updateLabelRotation(categoryId: string, isHorizontalChart?: boolean): void;
    protected getDefaultAxisOptions(): AxisOptions;
    protected getDefaultCartesianChartOptions(): CartesianChartOptions<SeriesOptions>;
}
