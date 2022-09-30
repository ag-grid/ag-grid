import { AgAreaSeriesOptions, AgCartesianAxisOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class AreaChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getData(params: UpdateChartParams): any[];
    getAxes(): AgCartesianAxisOptions[];
    getSeries(params: UpdateChartParams): (import("ag-charts-community").AgLineSeriesOptions<any> | AgAreaSeriesOptions<any>)[];
}
