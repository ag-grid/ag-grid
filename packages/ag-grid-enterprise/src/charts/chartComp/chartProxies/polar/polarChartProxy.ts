import type {
    AgPolarAxisOptions,
    AgPolarChartOptions,
    AgPolarSeriesOptions,
    AgRadarAreaSeriesOptions,
} from 'ag-charts-types';

import type { SeriesGroupType } from 'ag-grid-community';

import type { UpdateParams } from '../chartProxy';
import { ChartProxy } from '../chartProxy';

export class PolarChartProxy extends ChartProxy<
    AgPolarChartOptions,
    'radar-line' | 'radar-area' | 'nightingale' | 'radial-column' | 'radial-bar'
> {
    public getAxes(_: UpdateParams): AgPolarAxisOptions[] {
        const radialBar = this.standaloneChartType === 'radial-bar';
        return [
            { type: radialBar ? 'angle-number' : 'angle-category' },
            { type: radialBar ? 'radius-category' : 'radius-number' },
        ];
    }

    public getSeries(params: UpdateParams): AgPolarSeriesOptions[] {
        const { fields, categories, seriesGroupType } = params;
        const [category] = categories;
        const radialBar = this.standaloneChartType === 'radial-bar';
        const seriesGroupTypeOptions = this.getSeriesGroupTypeOptions(seriesGroupType);

        return fields.map((f) => ({
            type: this.standaloneChartType as AgRadarAreaSeriesOptions['type'],
            angleKey: radialBar ? f.colId : category.id,
            angleName: radialBar ? f.displayName ?? undefined : category.name,
            radiusKey: radialBar ? category.id : f.colId,
            radiusName: radialBar ? category.name : f.displayName ?? undefined,
            ...seriesGroupTypeOptions,
        }));
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

    private getData(params: UpdateParams, axes: AgPolarAxisOptions[]): any[] {
        const isCategoryAxis = axes.some((axis) => axis.type === 'angle-category' || axis.type === 'radius-category');
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
