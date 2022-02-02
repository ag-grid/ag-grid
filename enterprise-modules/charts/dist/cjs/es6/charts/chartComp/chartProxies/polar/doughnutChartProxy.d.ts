import { PolarChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
export declare class DoughnutChartProxy extends PolarChartProxy {
    constructor(params: ChartProxyParams);
    protected createChart(): PolarChart;
    update(params: UpdateChartParams): void;
    private updateSeries;
}
