import { ChartProxy, ChartProxyParams, UpdateParams } from "../chartProxy";
import { AgAreaSeriesOptions, AgCartesianAxisOptions, AgCartesianChartOptions, AgCartesianSeriesOptions, AgLineSeriesOptions } from "ag-charts-community";
export declare abstract class CartesianChartProxy<TSeries extends 'area' | 'bar' | 'histogram' | 'line' | 'scatter' | 'bubble' | 'waterfall' | 'box-plot' | 'range-area' | 'range-bar'> extends ChartProxy<AgCartesianChartOptions, TSeries> {
    protected crossFilteringAllPoints: Set<string>;
    protected crossFilteringSelectedPoints: string[];
    protected constructor(params: ChartProxyParams);
    protected abstract getAxes(params: UpdateParams, commonChartOptions: AgCartesianChartOptions): AgCartesianAxisOptions[];
    protected abstract getSeries(params: UpdateParams): AgCartesianSeriesOptions[];
    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgCartesianChartOptions): AgCartesianChartOptions;
    protected getData(params: UpdateParams, axes: AgCartesianAxisOptions[]): any[];
    private getDataTransformedData;
    protected getXAxisType(params: UpdateParams): "number" | "category" | "time" | "grouped-category";
    private isXAxisOfType;
    private transformTimeData;
    crossFilteringReset(): void;
    protected crossFilteringPointSelected(point: string): boolean;
    protected crossFilteringDeselectedPoints(): boolean;
    protected extractLineAreaCrossFilterSeries(series: (AgLineSeriesOptions | AgAreaSeriesOptions)[], params: UpdateParams): (AgLineSeriesOptions<any> | AgAreaSeriesOptions<any>)[];
    private getCrossFilterData;
    private crossFilteringAddSelectedPoint;
    protected isHorizontal(commonChartOptions: AgCartesianChartOptions): boolean;
}
