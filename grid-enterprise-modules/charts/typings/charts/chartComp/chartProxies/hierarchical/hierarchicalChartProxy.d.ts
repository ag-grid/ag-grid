import { AgHierarchySeriesOptions } from 'ag-charts-community';
import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
export declare abstract class HierarchicalChartProxy extends ChartProxy {
    protected readonly chartProxyParams: ChartProxyParams;
    protected constructor(chartProxyParams: ChartProxyParams);
    update(params: UpdateParams): void;
    protected abstract getSeries(params: UpdateParams, labelKey: string): AgHierarchySeriesOptions[];
    protected getData(params: UpdateParams): any[];
}
