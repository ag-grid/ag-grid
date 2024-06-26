import type { AgCartesianAxisOptions } from 'ag-charts-community';
import { CartesianChartProxy } from '../cartesian/cartesianChartProxy';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
export declare class ComboChartProxy extends CartesianChartProxy<'line' | 'bar' | 'area'> {
    constructor(params: ChartProxyParams);
    getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    getSeries(params: UpdateParams): any;
    private getYKeys;
}
