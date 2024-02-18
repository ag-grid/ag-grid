import { AgChartThemeOverrides, AgSunburstSeriesOptions } from 'ag-charts-community';
import { HierarchicalChartProxy } from './hierarchicalChartProxy';
import { ChartProxyParams, UpdateParams } from '../chartProxy';
export declare class SunburstChartProxy extends HierarchicalChartProxy {
    constructor(params: ChartProxyParams);
    protected getSeries(params: UpdateParams, labelKey: string): AgSunburstSeriesOptions[];
    protected getChartThemeDefaults(): AgChartThemeOverrides | undefined;
    protected transformData(data: any[], categoryKey: string, categoryAxis?: boolean): any[];
    crossFilteringReset(): void;
}
