import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { PolarChartOptions, PieSeriesOptions } from "@ag-grid-community/core";
import { PolarChart } from "../../../../charts/chart/polarChart";
export declare abstract class PolarChartProxy extends ChartProxy<PolarChart, PolarChartOptions<PieSeriesOptions>> {
    protected constructor(params: ChartProxyParams);
}
