import { AgCartesianAxisOptions, AgScatterSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getData(params: UpdateChartParams): any[];
    getAxes(): AgCartesianAxisOptions[];
    getSeries(params: UpdateChartParams): AgScatterSeriesOptions[];
    private extractCrossFilterSeries;
    private getSeriesDefinitions;
}
