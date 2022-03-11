import { CartesianChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
export declare class BarChartProxy extends CartesianChartProxy {
    constructor(params: ChartProxyParams);
    protected createChart(): CartesianChart;
    update(params: UpdateChartParams): void;
    private updateCrossFilteringSeries;
    private getAxes;
    private getSeries;
    private isNormalised;
}
