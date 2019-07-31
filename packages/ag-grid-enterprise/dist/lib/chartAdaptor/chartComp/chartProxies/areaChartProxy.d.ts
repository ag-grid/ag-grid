// ag-grid-enterprise v21.1.1
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";
export declare class AreaChartProxy extends ChartProxy {
    private readonly chartType;
    private readonly chartOptions;
    constructor(params: ChartProxyParams);
    private setAxisPadding;
    update(params: UpdateChartParams): void;
    private updateAreaChart;
    private defaultOptions;
}
