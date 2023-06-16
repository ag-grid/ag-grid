import { AgCartesianAxisOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
export declare class ComboChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    getSeries(params: UpdateParams): any;
    private getYKeys;
}
