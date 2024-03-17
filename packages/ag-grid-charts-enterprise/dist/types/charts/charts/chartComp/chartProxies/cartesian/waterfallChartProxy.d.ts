import { AgCartesianAxisOptions, AgWaterfallSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class WaterfallChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    protected getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    protected getSeries(params: UpdateParams): AgWaterfallSeriesOptions[];
}
