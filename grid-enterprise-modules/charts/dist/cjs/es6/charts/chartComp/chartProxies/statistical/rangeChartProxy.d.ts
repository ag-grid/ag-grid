import { ChartProxyParams, UpdateParams } from '../chartProxy';
import { AgRangeAreaSeriesOptions } from 'ag-charts-community';
import { StatisticalChartProxy } from "./statisticalChartProxy";
export declare class RangeChartProxy extends StatisticalChartProxy {
    constructor(params: ChartProxyParams);
    getSeries(params: UpdateParams): AgRangeAreaSeriesOptions<any>[];
    protected getData(params: UpdateParams): any[];
}
