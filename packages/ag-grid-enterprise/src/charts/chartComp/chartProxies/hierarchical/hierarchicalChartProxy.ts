import type { AgChartThemeOverrides, AgHierarchyChartOptions, AgHierarchySeriesOptions } from 'ag-charts-types';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

import type { FieldDefinition, UpdateParams } from '../chartProxy';
import { ChartProxy } from '../chartProxy';
import { CATEGORY_LABEL_KEY, createAutoGroupHierarchy, createCategoryHierarchy } from './hierarchicalChartUtils';

export class HierarchicalChartProxy<TSeries extends 'sunburst' | 'treemap'> extends ChartProxy<
    AgHierarchyChartOptions,
    TSeries
> {
    protected override getUpdateOptions(
        params: UpdateParams,
        commonChartOptions: AgHierarchyChartOptions
    ): AgHierarchyChartOptions {
        const { fields } = params;
        // Hierarchical charts support up to two input series, corresponding to size and color respectively
        const [sizeField, colorField] = fields as [FieldDefinition | undefined, FieldDefinition | undefined];
        return {
            ...commonChartOptions,
            series: this.getSeries(sizeField, colorField),
            data: this.getData(params, sizeField, colorField),
        };
    }

    protected override getSeriesChartThemeDefaults(): AgChartThemeOverrides['treemap' | 'sunburst'] {
        return {
            gradientLegend: {
                gradient: {
                    preferredLength: 200,
                },
                position: 'right',
            },
        };
    }

    private getSeries(sizeField?: FieldDefinition, colorField?: FieldDefinition): AgHierarchySeriesOptions[] {
        return [
            {
                type: this.standaloneChartType as AgHierarchySeriesOptions['type'],
                labelKey: CATEGORY_LABEL_KEY,
                // Size and color fields are inferred from the range data
                sizeKey: sizeField?.colId,
                sizeName: sizeField?.displayName ?? undefined,
                colorKey: colorField?.colId,
                colorName: colorField?.displayName ?? undefined,
            },
        ];
    }

    private getData(params: UpdateParams, sizeField?: FieldDefinition, colorField?: FieldDefinition): any[] {
        const { categories, data, groupData, grouping: isGrouped } = params;
        if (isGrouped) {
            const processedData = colorField
                ? data.concat(
                      groupData?.map((groupDatum) => {
                          const newDatum = { ...groupDatum };
                          delete newDatum[sizeField!.colId];
                          return newDatum;
                      }) ?? []
                  )
                : data;
            return createAutoGroupHierarchy(processedData, (item) => item[GROUP_AUTO_COLUMN_ID]?.labels ?? null);
        } else {
            const categoryKeys = categories.map(({ id }) => id);
            return createCategoryHierarchy(data, categoryKeys);
        }
    }
}
