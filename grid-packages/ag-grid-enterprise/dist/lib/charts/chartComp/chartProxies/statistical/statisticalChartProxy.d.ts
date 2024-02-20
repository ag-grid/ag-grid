import { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { AgCartesianAxisOptions } from 'ag-charts-community';
export declare abstract class StatisticalChartProxy extends CartesianChartProxy {
    protected constructor(params: ChartProxyParams);
    getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    protected computeSeriesStatistics(params: UpdateParams, computeStatsFn: (values: number[]) => any): any[];
    protected groupDataByCategory(categoryKey: string, data: any[]): Map<any, any[]>;
}
