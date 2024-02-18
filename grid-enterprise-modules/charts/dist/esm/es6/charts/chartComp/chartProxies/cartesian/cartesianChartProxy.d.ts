import { ChartProxy, ChartProxyParams, UpdateParams } from "../chartProxy";
import { AgAreaSeriesOptions, AgBaseSeriesOptions, AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
export declare abstract class CartesianChartProxy extends ChartProxy {
    protected crossFilteringAllPoints: Set<string>;
    protected crossFilteringSelectedPoints: string[];
    protected constructor(params: ChartProxyParams);
    abstract getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    abstract getSeries(params: UpdateParams): AgBaseSeriesOptions<any>[];
    update(params: UpdateParams): void;
    protected getData(params: UpdateParams, axes: AgCartesianAxisOptions[]): any[];
    private getDataTransformedData;
    protected getXAxisType(params: UpdateParams): "time" | "category" | "grouped-category";
    private static isTimeAxis;
    crossFilteringReset(): void;
    protected crossFilteringPointSelected(point: string): boolean;
    protected crossFilteringDeselectedPoints(): boolean;
    protected extractLineAreaCrossFilterSeries(series: (AgLineSeriesOptions | AgAreaSeriesOptions)[], params: UpdateParams): (AgLineSeriesOptions<any> | AgAreaSeriesOptions<any>)[];
    private getCrossFilterData;
    private crossFilteringAddSelectedPoint;
}
