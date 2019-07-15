// ag-grid-enterprise v21.1.0
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";
export declare class PieChartProxy extends ChartProxy {
    private readonly chartOptions;
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    private defaultOptions;
}
