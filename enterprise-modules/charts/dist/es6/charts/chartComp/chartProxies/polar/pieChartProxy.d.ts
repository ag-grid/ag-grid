import { ChartTheme, PolarChart } from "ag-charts-community";
import { PieSeriesOptions, PolarChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
export declare class PieChartProxy extends PolarChartProxy {
    constructor(params: ChartProxyParams);
    protected createChart(options: PolarChartOptions<PieSeriesOptions>): PolarChart;
    protected getDefaultOptionsFromTheme(theme: ChartTheme): PolarChartOptions<PieSeriesOptions>;
    update(params: UpdateChartParams): void;
    private updateSeries;
    protected getDefaultOptions(): PolarChartOptions<PieSeriesOptions>;
}
