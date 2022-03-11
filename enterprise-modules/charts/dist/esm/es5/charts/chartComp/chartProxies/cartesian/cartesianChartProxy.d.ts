import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { AgCartesianAxisType, AreaSeries, CartesianChart, LineSeries } from "ag-charts-community";
import { ChartSeriesType } from "../../utils/seriesTypeMapper";
export declare abstract class CartesianChartProxy extends ChartProxy {
    protected xAxisType: AgCartesianAxisType;
    protected yAxisType: AgCartesianAxisType;
    protected axisTypeToClassMap: {
        [key in string]: any;
    };
    protected constructor(params: ChartProxyParams);
    protected updateAxes(params: UpdateChartParams): void;
    protected updateLabelRotation(categoryId: string): void;
    protected getAxesOptions(chartSeriesType?: ChartSeriesType): any;
    protected processDataForCrossFiltering(data: any[], colId: string, params: UpdateChartParams): {
        yKey: string;
        atLeastOneSelectedPoint: boolean;
    };
    protected updateSeriesForCrossFiltering(series: AreaSeries | LineSeries, colId: string, chart: CartesianChart, params: UpdateChartParams, atLeastOneSelectedPoint: boolean): void;
    private static isTimeAxis;
}
