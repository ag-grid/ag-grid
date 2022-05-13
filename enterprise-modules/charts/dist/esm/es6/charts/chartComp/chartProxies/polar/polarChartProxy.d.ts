import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { PieSeries } from "ag-charts-community";
export declare abstract class PolarChartProxy extends ChartProxy {
    protected constructor(params: ChartProxyParams);
    protected addCrossFilteringTooltipRenderer(pieSeries: PieSeries): void;
}
