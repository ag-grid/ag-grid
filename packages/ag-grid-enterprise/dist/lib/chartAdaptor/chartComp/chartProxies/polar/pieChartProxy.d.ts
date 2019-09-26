// ag-grid-enterprise v21.2.2
import { PieChartOptions } from "ag-grid-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
export declare class PieChartProxy extends PolarChartProxy<PieChartOptions> {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    private defaultOptions;
}
