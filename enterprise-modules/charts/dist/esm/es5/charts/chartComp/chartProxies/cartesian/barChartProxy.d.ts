import { AgBarSeriesOptions, AgCartesianAxisOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class BarChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getData(params: UpdateChartParams): any[];
    getAxes(): AgCartesianAxisOptions[];
    getSeries(params: UpdateChartParams): AgBarSeriesOptions[];
    private extractCrossFilterSeries;
    private isNormalised;
}
