import type { AgCartesianAxisOptions, AgHistogramSeriesOptions } from 'ag-charts-community';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';
export declare class HistogramChartProxy extends CartesianChartProxy<'histogram'> {
    constructor(params: ChartProxyParams);
    protected getSeries(params: UpdateParams): AgHistogramSeriesOptions[];
    protected getAxes(_params: UpdateParams): AgCartesianAxisOptions[];
}
