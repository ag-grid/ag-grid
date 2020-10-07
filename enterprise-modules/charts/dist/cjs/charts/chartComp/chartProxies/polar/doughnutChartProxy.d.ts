import { ChartTheme, PolarChart } from "ag-charts-community";
import { PieSeriesOptions, PolarChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
export declare class DoughnutChartProxy extends PolarChartProxy {
    constructor(params: ChartProxyParams);
    protected getDefaultOptionsFromTheme(theme: ChartTheme): PolarChartOptions<PieSeriesOptions>;
    protected createChart(options?: PolarChartOptions<PieSeriesOptions>): PolarChart;
    update(params: UpdateChartParams): void;
    protected getDefaultOptions(): PolarChartOptions<PieSeriesOptions>;
}
