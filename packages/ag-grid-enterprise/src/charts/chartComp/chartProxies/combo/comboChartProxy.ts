import type { AgCartesianAxisOptions, AgChartThemeOverrides } from 'ag-charts-types';

import type { ChartType, SeriesChartType } from 'ag-grid-community';

import { getSeriesType } from '../../utils/seriesTypeMapper';
import { CartesianChartProxy } from '../cartesian/cartesianChartProxy';
import type { FieldDefinition, UpdateParams } from '../chartProxy';

export class ComboChartProxy extends CartesianChartProxy<'line' | 'bar' | 'area'> {
    public getAxes(params: UpdateParams): Record<string, AgCartesianAxisOptions> {
        const fields = params ? params.fields : [];
        const fieldsMap = new Map(fields.map((f) => [f.colId, f]));

        const { primaryYKeys, secondaryYKeys } = this.getYKeys(fields, params.seriesChartTypes);

        const axes: Record<string, AgCartesianAxisOptions> = {
            x: {
                type: this.getXAxisType(params),
                position: 'bottom',
            },
        };

        if (primaryYKeys.length > 0) {
            axes.y = {
                type: 'number',
                position: 'left',
            };
        }

        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach((secondaryYKey: string) => {
                const field = fieldsMap.get(secondaryYKey);
                const secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }

                const secondaryAxisOptions: AgCartesianAxisOptions = {
                    type: 'number',
                    position: 'right',
                };

                axes[`y_${secondaryYKey}`] = secondaryAxisOptions;
            });
        }

        return axes;
    }

    protected override getSeries(params: UpdateParams): any {
        const { fields, seriesChartTypes } = params;
        const [category] = params.categories;

        return fields.map((field) => {
            const seriesChartType = seriesChartTypes.find((s) => s.colId === field.colId);
            if (seriesChartType) {
                const chartType: ChartType = seriesChartType.chartType;
                const grouped = ['groupedColumn', 'groupedBar'].includes(chartType);
                const groupedOpts = grouped ? { grouped: true } : {};
                const yKeyAxis = seriesChartType.secondaryAxis ? `y_${field.colId}` : 'y';
                return {
                    type: getSeriesType(chartType),
                    xKey: category.id,
                    yKey: field.colId,
                    yName: field.displayName,
                    yKeyAxis,
                    stacked: ['stackedArea', 'stackedColumn'].includes(chartType),
                    ...groupedOpts,
                };
            }
        });
    }

    private getYKeys(fields: FieldDefinition[], seriesChartTypes: SeriesChartType[]) {
        const primaryYKeys: string[] = [];
        const secondaryYKeys: string[] = [];

        for (const field of fields) {
            const colId = field.colId;
            const seriesChartType = seriesChartTypes.find((s) => s.colId === colId);
            if (seriesChartType) {
                seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            }
        }

        return { primaryYKeys, secondaryYKeys };
    }

    protected override setSeriesChartThemeDefaults(overrides: AgChartThemeOverrides): void {
        const seriesOverrides = this.getSeriesChartThemeDefaults();
        if (!seriesOverrides) {
            return;
        }
        const chartTypes = new Set<ChartType>();
        for (const seriesChartType of this.chartProxyParams.seriesChartTypes) {
            chartTypes.add(seriesChartType.chartType);
        }
        for (const chartType of chartTypes) {
            overrides[getSeriesType(chartType) as 'line' | 'bar' | 'area'] = seriesOverrides;
        }
    }
}
