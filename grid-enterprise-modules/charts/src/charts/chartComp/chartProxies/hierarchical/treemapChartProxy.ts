import { ChartProxy, ChartProxyParams, FieldDefinition, UpdateParams } from '../chartProxy';
import { AgCharts, AgTreemapSeriesOptions, AgHierarchyChartOptions } from 'ag-charts-community';
import { CATEGORY_LABEL_KEY, createCategoryHierarchy } from './hierarchicalChartUtils';

export class TreemapChartProxy extends ChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public override update(params: UpdateParams): void {
        const options: AgHierarchyChartOptions = {
            ...this.getCommonChartOptions(params.updatedOverrides),
            series: this.getSeries(params),
            data: this.getData(params),
        };

        AgCharts.update(this.getChartRef(), options);
    }

    private getSeries(params: UpdateParams): AgTreemapSeriesOptions[] {
        const { fields } = params;
        // Treemap charts support up to two input series, corresponding to size and color respectively
        const [sizeField, colorField] = fields as [FieldDefinition | undefined, FieldDefinition | undefined];
        if (!sizeField) return [];
        // Combine the size and color series into a single composite series
        return [
            {
                type: this.standaloneChartType as AgTreemapSeriesOptions['type'],
                // The label key is generated internally by the hierarchy processing and is not user-configurable
                labelKey: CATEGORY_LABEL_KEY,
                // Size and color fields are inferred from the range data
                sizeKey: sizeField.colId,
                sizeName: sizeField.displayName ?? undefined,
                colorKey: colorField?.colId,
                colorName: colorField?.displayName ?? undefined,
            },
        ];
    }

    private getData(params: UpdateParams): any[] {
        const categoryKeys = params.categories.map(({ id }) => id);
        return createCategoryHierarchy(params.data, categoryKeys);
    }

    protected override transformData(data: any[], categoryKey: string, categoryAxis?: boolean): any[] {
        // Ignore the base implementation as it assumes only a single category axis
        // (this method is never actually invoked)
        return data;
    }

    public override crossFilteringReset(): void {
        // cross filtering is not currently supported in treemap charts
    }
}
