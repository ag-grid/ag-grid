import { AgChartThemeOverrides, AgTreemapSeriesOptions } from 'ag-charts-community';
import { HierarchicalChartProxy } from './hierarchicalChartProxy';
import { ChartProxyParams, UpdateParams } from '../chartProxy';
export declare class TreemapChartProxy extends HierarchicalChartProxy {
    constructor(params: ChartProxyParams);
    protected getSeries(params: UpdateParams, labelKey: string): AgTreemapSeriesOptions[];
    protected getChartThemeDefaults(): AgChartThemeOverrides | undefined;
    protected transformData(data: any[], categoryKey: string, categoryAxis?: boolean): any[];
    crossFilteringReset(): void;
}
