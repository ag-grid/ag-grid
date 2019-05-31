// ag-grid-enterprise v21.0.0
import { ChartProxy, UpdateChartParams, ChartProxyParams } from "./chartProxy";
export declare class PieChartProxy extends ChartProxy {
    private readonly chartOptions;
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    private defaultOptions;
}
