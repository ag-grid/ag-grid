// ag-grid-enterprise v21.2.2
import { DoughnutChartOptions } from "ag-grid-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
export declare class DoughnutChartProxy extends PolarChartProxy<DoughnutChartOptions> {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    private defaultOptions;
}
