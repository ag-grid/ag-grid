import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { AgAreaSeriesOptions, AgBaseSeriesOptions, AgCartesianAxisOptions, AgCartesianAxisType, AgLineSeriesOptions, CartesianChart } from "ag-charts-community";
import { ChartSeriesType } from "../../utils/seriesTypeMapper";
export declare abstract class CartesianChartProxy extends ChartProxy {
    protected supportsAxesUpdates: boolean;
    protected xAxisType: AgCartesianAxisType;
    protected yAxisType: AgCartesianAxisType;
    protected axisTypeToClassMap: {
        [key in string]: any;
    };
    protected crossFilteringAllPoints: Set<string>;
    protected crossFilteringSelectedPoints: string[];
    protected constructor(params: ChartProxyParams);
    abstract getData(params: UpdateChartParams): any[];
    abstract getAxes(params: UpdateChartParams): AgCartesianAxisOptions[];
    abstract getSeries(params: UpdateChartParams): AgBaseSeriesOptions<any>[];
    protected createChart(): CartesianChart;
    update(params: UpdateChartParams): void;
    protected getDataTransformedData(params: UpdateChartParams): any[];
    private addCrossFilterOptions;
    protected extractSeriesOverrides(chartSeriesType?: ChartSeriesType): any;
    protected updateAxes(params: UpdateChartParams): void;
    protected getAxesOptions(chartSeriesType?: ChartSeriesType): any;
    private static isTimeAxis;
    crossFilteringReset(): void;
    protected crossFilteringPointSelected(point: string): boolean;
    protected crossFilteringDeselectedPoints(): boolean;
    protected extractLineAreaCrossFilterSeries(series: (AgLineSeriesOptions | AgAreaSeriesOptions)[], params: UpdateChartParams): (AgLineSeriesOptions<any> | AgAreaSeriesOptions<any>)[];
    protected getLineAreaCrossFilterData(params: UpdateChartParams): any[];
    private crossFilteringAddSelectedPoint;
}
