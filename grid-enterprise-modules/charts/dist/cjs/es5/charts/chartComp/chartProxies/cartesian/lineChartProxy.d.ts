import { AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class LineChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getAxes(params: UpdateChartParams): AgCartesianAxisOptions[];
    getSeries(params: UpdateChartParams): (AgLineSeriesOptions<any> | import("ag-charts-community").AgAreaSeriesOptions<any>)[];
}
