// ag-grid-enterprise v21.1.1
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";
export declare class BarChartProxy extends ChartProxy {
    private readonly chartOptions;
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    private static isBarChart;
    private defaultOptions;
}
