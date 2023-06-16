import { AgBarSeriesOptions, AgCartesianAxisOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class BarChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    getSeries(params: UpdateParams): AgBarSeriesOptions[];
    private extractCrossFilterSeries;
    private isNormalised;
}
