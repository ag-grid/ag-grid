import type { AgChartThemeOverrides, AgHierarchyChartOptions } from 'ag-charts-community';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { ChartProxy } from '../chartProxy';
export declare class HierarchicalChartProxy<TSeries extends 'sunburst' | 'treemap'> extends ChartProxy<AgHierarchyChartOptions, TSeries> {
    constructor(chartProxyParams: ChartProxyParams);
    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgHierarchyChartOptions): AgHierarchyChartOptions;
    protected getSeriesChartThemeDefaults(): AgChartThemeOverrides['treemap' | 'sunburst'];
    private getSeries;
    private getData;
}
