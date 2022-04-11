import { CartesianChart } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
export declare class ComboChartProxy extends CartesianChartProxy {
    private prevFields;
    private prevCategoryId;
    private prevSeriesChartTypes;
    constructor(params: ChartProxyParams);
    protected createChart(): CartesianChart;
    update(params: UpdateChartParams): void;
    private seriesChanged;
    private getSeriesOptions;
    private getAxes;
    private getAxisOptions;
    private getYKeys;
    private extractSeriesOverrides;
}
