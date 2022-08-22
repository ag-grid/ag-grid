import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChart } from "ag-charts-community";
export declare class PieChartProxy extends ChartProxy {
    constructor(params: ChartProxyParams);
    protected createChart(): PolarChart;
    update(params: UpdateChartParams): void;
    private getSeries;
    private getCrossFilterChartOptions;
    private getCrossFilterData;
    private extractCrossFilterSeries;
    private static calculateOffsets;
    private getFields;
    private getCrossFilterTooltipRenderer;
    protected extractSeriesOverrides(): any;
    crossFilteringReset(): void;
}
