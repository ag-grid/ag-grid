import { AgCartesianAxisOptions, AgCartesianChartOptions, AgWaterfallSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class WaterfallChartProxy extends CartesianChartProxy<'waterfall'> {
    constructor(params: ChartProxyParams);
    protected getAxes(params: UpdateParams, commonChartOptions: AgCartesianChartOptions): AgCartesianAxisOptions[];
    protected getSeries(params: UpdateParams): AgWaterfallSeriesOptions[];
}
