import { CartesianChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class AreaChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    protected create(): CartesianChart;
    update(params: UpdateChartParams): void;
    private updateAreaChart;
    private getAxes;
}
