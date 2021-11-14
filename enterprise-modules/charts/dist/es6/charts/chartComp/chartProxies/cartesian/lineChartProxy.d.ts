import { CartesianChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class LineChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    protected create(): CartesianChart;
    update(params: UpdateChartParams): void;
    private getAxes;
}
