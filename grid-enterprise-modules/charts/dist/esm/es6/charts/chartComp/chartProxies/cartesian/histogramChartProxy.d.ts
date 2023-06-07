import { AgCartesianAxisOptions, AgHistogramSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class HistogramChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getSeries(params: UpdateParams): AgHistogramSeriesOptions[];
    getAxes(_params: UpdateParams): AgCartesianAxisOptions[];
}
