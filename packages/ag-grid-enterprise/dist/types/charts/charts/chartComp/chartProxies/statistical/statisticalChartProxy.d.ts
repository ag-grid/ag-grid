import { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { AgCartesianAxisOptions, AgCartesianChartOptions } from 'ag-charts-community';
export declare abstract class StatisticalChartProxy<TSeries extends 'box-plot' | 'range-area' | 'range-bar'> extends CartesianChartProxy<TSeries> {
    protected constructor(params: ChartProxyParams);
    getAxes(params: UpdateParams, commonChartOptions: AgCartesianChartOptions): AgCartesianAxisOptions[];
    protected computeSeriesStatistics(params: UpdateParams, computeStatsFn: (values: number[]) => any): any[];
    protected groupDataByCategory(categoryKey: string, data: any[]): Map<any, any[]>;
}
