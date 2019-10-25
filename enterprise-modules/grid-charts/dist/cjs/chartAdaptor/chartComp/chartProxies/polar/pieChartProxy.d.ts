import { PieSeriesOptions, PolarChartOptions } from "@ag-community/grid-core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
export declare class PieChartProxy extends PolarChartProxy {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    protected getDefaultOptions(): PolarChartOptions<PieSeriesOptions>;
}
