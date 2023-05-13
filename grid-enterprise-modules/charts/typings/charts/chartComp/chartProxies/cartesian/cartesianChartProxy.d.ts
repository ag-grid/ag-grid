import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { AgAreaSeriesOptions, AgBaseSeriesOptions, AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
export declare abstract class CartesianChartProxy extends ChartProxy {
    protected crossFilteringAllPoints: Set<string>;
    protected crossFilteringSelectedPoints: string[];
    protected constructor(params: ChartProxyParams);
    abstract getAxes(params: UpdateChartParams): AgCartesianAxisOptions[];
    abstract getSeries(params: UpdateChartParams): AgBaseSeriesOptions<any>[];
    update(params: UpdateChartParams): void;
    private getData;
    private getDataTransformedData;
    protected getXAxisType(params: UpdateChartParams): "time" | "category" | "groupedCategory";
    private static isTimeAxis;
    crossFilteringReset(): void;
    protected crossFilteringPointSelected(point: string): boolean;
    protected crossFilteringDeselectedPoints(): boolean;
    protected extractLineAreaCrossFilterSeries(series: (AgLineSeriesOptions | AgAreaSeriesOptions)[], params: UpdateChartParams): (AgLineSeriesOptions<any> | AgAreaSeriesOptions<any>)[];
    private getCrossFilterData;
    private crossFilteringAddSelectedPoint;
}
