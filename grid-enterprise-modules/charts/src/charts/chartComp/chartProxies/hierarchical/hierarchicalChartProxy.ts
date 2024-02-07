import { AgCharts, AgHierarchyChartOptions, AgHierarchySeriesOptions } from 'ag-charts-community';
import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
import { CATEGORY_LABEL_KEY, createCategoryHierarchy } from './hierarchicalChartUtils';

export abstract class HierarchicalChartProxy extends ChartProxy {
    protected constructor(protected readonly chartProxyParams: ChartProxyParams) {
        super(chartProxyParams);
    }
    
    public override update(params: UpdateParams): void {
        const options: AgHierarchyChartOptions = {
            ...this.getCommonChartOptions(params.updatedOverrides),
            series: this.getSeries(params, CATEGORY_LABEL_KEY),
            data: this.getData(params),
        };

        AgCharts.update(this.getChartRef(), options);
    }

    protected abstract getSeries(params: UpdateParams, labelKey: string): AgHierarchySeriesOptions[];

    protected getData(params: UpdateParams): any[] {
        const categoryKeys = params.categories.map(({ id }) => id);
        return createCategoryHierarchy(params.data, categoryKeys);
    }
}
