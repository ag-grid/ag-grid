import { CartesianChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class ScatterChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    protected createChart(): CartesianChart;
    update(params: UpdateChartParams): void;
    private getSeriesDefinitions;
    private getCrossFilteringDataDomain;
    private getAxes;
}
