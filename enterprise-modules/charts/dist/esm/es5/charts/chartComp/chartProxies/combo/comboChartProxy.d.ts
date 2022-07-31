import { AgCartesianAxisOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
export declare class ComboChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getData(params: UpdateChartParams): any[];
    getAxes(params: UpdateChartParams): AgCartesianAxisOptions[];
    getSeries(params: UpdateChartParams): any;
    private getAxisOptions;
    private getYKeys;
}
