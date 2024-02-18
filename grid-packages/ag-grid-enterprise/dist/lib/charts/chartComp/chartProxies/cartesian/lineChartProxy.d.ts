import { AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class LineChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    getSeries(params: UpdateParams): (AgLineSeriesOptions<any> | import("ag-charts-community").AgAreaSeriesOptions<any>)[];
}
