import type { AgPolarAxisOptions, AgPolarChartOptions, AgPolarSeriesOptions } from 'ag-charts-types';

import type { SeriesGroupType } from 'ag-grid-community';

import type { UpdateParams } from '../chartProxy';
import { ChartProxy } from '../chartProxy';

export class PolarChartProxy extends ChartProxy<
    AgPolarChartOptions,
    'radar-line' | 'radar-area' | 'nightingale' | 'radial-column' | 'radial-bar'
> {
    public getAxes(_: UpdateParams): Record<string, AgPolarAxisOptions> {
        const radialBar = this.standaloneChartType === 'radial-bar';
        return {
            angle: { type: radialBar ? 'angle-number' : 'angle-category' },
            radius: { type: radialBar ? 'radius-category' : 'radius-number' },
        };
    }

    public getSeries(params: UpdateParams): AgPolarSeriesOptions[] {
        const { fields, categories, seriesGroupType } = params;
        const [category] = categories;
        const radialBar = this.standaloneChartType === 'radial-bar';
        const seriesGroupTypeOptions = this.getSeriesGroupTypeOptions(seriesGroupType);

        // The (f) => {} function returns a type that looks something like:
        //   { type: 'a' | 'b' | 'c' }
        //
        // But the desired type looks like:
        //   { type: 'a' } | { type: 'b' } | { type: 'c' }
        //
        // The `as` converts to the desired type, but other type-requirements are verified with  `satisfies`.
        //
        return fields.map((f): AgPolarSeriesOptions => {
            return {
                type: this.standaloneChartType satisfies AgPolarSeriesOptions['type'],
                angleKey: radialBar ? f.colId : category.id,
                angleName: radialBar ? f.displayName ?? undefined : category.name,
                radiusKey: radialBar ? category.id : f.colId,
                radiusName: radialBar ? category.name : f.displayName ?? undefined,
                ...seriesGroupTypeOptions,
            } satisfies Omit<AgPolarSeriesOptions, 'type'> as AgPolarSeriesOptions;
        });
    }

    public override getSeriesGroupType(): SeriesGroupType | undefined {
        const standaloneChartType = this.standaloneChartType;
        if (!['nightingale', 'radial-bar', 'radial-column'].includes(standaloneChartType)) {
            return undefined;
        }
        const firstSeriesProperties = this.getChart().series?.[0]?.properties.toJson();
        const getStackedValue = () => (firstSeriesProperties.normalizedTo ? 'normalized' : 'stacked');
        if (standaloneChartType === 'nightingale') {
            return firstSeriesProperties.grouped ? 'grouped' : getStackedValue();
        } else {
            return firstSeriesProperties.stacked ? getStackedValue() : 'grouped';
        }
    }

    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgPolarChartOptions): AgPolarChartOptions {
        const axes = this.getAxes(params);

        return {
            ...commonChartOptions,
            data: this.getData(params, axes),
            axes,
            series: this.getSeries(params),
        };
    }

    private getData(params: UpdateParams, axes: Record<string, AgPolarAxisOptions>): any[] {
        const isCategoryAxis = axes.angle.type === 'angle-category' || axes.radius.type === 'radius-category';
        if (isCategoryAxis) {
            const [category] = params.categories;
            return this.transformCategoryData(params.data, category.id);
        } else {
            return params.data;
        }
    }

    private getSeriesGroupTypeOptions(seriesGroupType?: SeriesGroupType): Partial<AgPolarSeriesOptions> {
        if (!seriesGroupType) {
            return {};
        }
        return {
            grouped: seriesGroupType === 'grouped' || undefined,
            stacked: seriesGroupType !== 'grouped' || undefined,
            normalizedTo: seriesGroupType === 'normalized' ? 100 : undefined,
        };
    }
}
