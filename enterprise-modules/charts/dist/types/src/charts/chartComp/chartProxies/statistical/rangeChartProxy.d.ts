import type { AgRangeAreaSeriesOptions } from 'ag-charts-community';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { StatisticalChartProxy } from './statisticalChartProxy';
export declare class RangeChartProxy extends StatisticalChartProxy<'range-bar' | 'range-area'> {
    constructor(params: ChartProxyParams);
    getSeries(params: UpdateParams): AgRangeAreaSeriesOptions<any>[];
    protected getData(params: UpdateParams): any[];
}
