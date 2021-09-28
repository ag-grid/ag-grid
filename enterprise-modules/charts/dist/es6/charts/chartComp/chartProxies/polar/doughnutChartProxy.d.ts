import { ChartTheme, PolarChart } from "ag-charts-community";
import { PieSeriesOptions, PolarChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
export declare class DoughnutChartProxy extends PolarChartProxy {
    constructor(params: ChartProxyParams);
    protected createChart(): PolarChart;
    update(params: UpdateChartParams): void;
    private updateSeries;
    protected extractIChartOptionsFromTheme(theme: ChartTheme): PolarChartOptions<PieSeriesOptions>;
    protected getDefaultOptions(): PolarChartOptions<PieSeriesOptions>;
}
