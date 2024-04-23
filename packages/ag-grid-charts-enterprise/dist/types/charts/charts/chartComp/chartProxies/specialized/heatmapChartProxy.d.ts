import { AgCartesianChartOptions, AgHeatmapSeriesOptions, AgChartThemeOverrides } from 'ag-charts-community';
import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
export declare const HEATMAP_CATEGORY_KEY = "AG-GRID-DEFAULT-HEATMAP-CATEGORY-KEY";
export declare const HEATMAP_SERIES_KEY = "AG-GRID-DEFAULT-HEATMAP-SERIES-KEY";
export declare const HEATMAP_VALUE_KEY = "AG-GRID-DEFAULT-HEATMAP-VALUE-KEY";
export declare class HeatmapChartProxy extends ChartProxy<AgCartesianChartOptions, 'heatmap'> {
    constructor(params: ChartProxyParams);
    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgCartesianChartOptions): AgCartesianChartOptions;
    protected getSeries(params: UpdateParams, xSeriesKey: string, xValueKey: string, yKey: string): AgHeatmapSeriesOptions[];
    protected getData(params: UpdateParams, xSeriesKey: string, xValueKey: string, yKey: string): any[];
    protected getSeriesChartThemeDefaults(): AgChartThemeOverrides['heatmap'];
}
