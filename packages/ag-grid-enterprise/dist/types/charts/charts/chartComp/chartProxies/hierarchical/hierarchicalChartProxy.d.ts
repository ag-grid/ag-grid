import { AgChartThemeOverrides, AgHierarchyChartOptions } from 'ag-charts-community';
import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
export declare class HierarchicalChartProxy<TSeries extends 'sunburst' | 'treemap'> extends ChartProxy<AgHierarchyChartOptions, TSeries> {
    constructor(chartProxyParams: ChartProxyParams);
    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgHierarchyChartOptions): AgHierarchyChartOptions;
    protected getSeriesChartThemeDefaults(): AgChartThemeOverrides['treemap' | 'sunburst'];
    private getSeries;
    private getData;
}
