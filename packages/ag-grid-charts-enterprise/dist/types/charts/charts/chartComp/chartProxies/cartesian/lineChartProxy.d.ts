import type { AgCartesianAxisOptions, AgLineSeriesOptions } from 'ag-charts-community';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';
export declare class LineChartProxy extends CartesianChartProxy<'line'> {
    constructor(params: ChartProxyParams);
    protected getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    protected getSeries(params: UpdateParams): (AgLineSeriesOptions<any> | import("ag-charts-community").AgAreaSeriesOptions<any>)[];
}
