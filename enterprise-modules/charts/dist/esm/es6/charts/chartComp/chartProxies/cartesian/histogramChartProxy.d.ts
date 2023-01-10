import { AgCartesianAxisOptions, AgHistogramSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class HistogramChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getSeries(params: UpdateChartParams): AgHistogramSeriesOptions[];
    getAxes(_params: UpdateChartParams): AgCartesianAxisOptions[];
}
