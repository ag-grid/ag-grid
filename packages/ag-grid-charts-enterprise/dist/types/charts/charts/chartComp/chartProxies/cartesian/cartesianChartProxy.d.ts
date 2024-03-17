import { ChartProxy, ChartProxyParams, UpdateParams } from "../chartProxy";
import { AgAreaSeriesOptions, AgBaseSeriesOptions, AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
export declare abstract class CartesianChartProxy extends ChartProxy {
    protected crossFilteringAllPoints: Set<string>;
    protected crossFilteringSelectedPoints: string[];
    protected constructor(params: ChartProxyParams);
    protected abstract getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    protected abstract getSeries(params: UpdateParams): AgBaseSeriesOptions<any>[];
    update(params: UpdateParams): void;
    protected getData(params: UpdateParams, axes: AgCartesianAxisOptions[]): any[];
    private getDataTransformedData;
    protected getXAxisType(params: UpdateParams): "category" | "time" | "grouped-category";
    private static isTimeAxis;
    crossFilteringReset(): void;
    protected crossFilteringPointSelected(point: string): boolean;
    protected crossFilteringDeselectedPoints(): boolean;
    protected extractLineAreaCrossFilterSeries(series: (AgLineSeriesOptions | AgAreaSeriesOptions)[], params: UpdateParams): (AgLineSeriesOptions<any> | AgAreaSeriesOptions<any>)[];
    private getCrossFilterData;
    private crossFilteringAddSelectedPoint;
}
