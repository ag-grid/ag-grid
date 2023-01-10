import { AgCartesianAxisOptions, AgScatterSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getAxes(_params: UpdateChartParams): AgCartesianAxisOptions[];
    getSeries(params: UpdateChartParams): AgScatterSeriesOptions[];
    private extractCrossFilterSeries;
    private getSeriesDefinitions;
}
