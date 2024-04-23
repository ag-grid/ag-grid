import { AgBubbleSeriesOptions, AgCartesianAxisOptions, AgScatterSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy<'scatter' | 'bubble'> {
    constructor(params: ChartProxyParams);
    protected getAxes(_params: UpdateParams): AgCartesianAxisOptions[];
    protected getSeries(params: UpdateParams): (AgScatterSeriesOptions | AgBubbleSeriesOptions)[];
    private extractCrossFilterSeries;
    private getSeriesDefinitions;
}
