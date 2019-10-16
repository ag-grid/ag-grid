import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { _, PolarChartOptions, PieSeriesOptions } from "@ag-community/grid-core";
import { PolarChart } from "../../../../charts/chart/polarChart";

export abstract class PolarChartProxy extends ChartProxy<PolarChart, PolarChartOptions<PieSeriesOptions>> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }
}
