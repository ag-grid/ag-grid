import { AgBubbleSeriesOptions, AgCartesianAxisOptions, AgScatterSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    getAxes(_params: UpdateParams): AgCartesianAxisOptions[];
    getSeries(params: UpdateParams): (AgScatterSeriesOptions | AgBubbleSeriesOptions)[];
    private extractCrossFilterSeries;
    private getSeriesDefinitions;
}
