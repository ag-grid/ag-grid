import type { AgAreaSeriesOptions, AgCartesianAxisOptions, AgCartesianChartOptions } from 'ag-charts-types';

import type { UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';
import { createNormalisedFormatter } from './normalisedFormatter';

export class AreaChartProxy extends CartesianChartProxy<'area'> {
    protected override getAxes(params: UpdateParams): Record<string, AgCartesianAxisOptions> {
        const axes: Record<string, AgCartesianAxisOptions> = {
            x: {
                type: this.getXAxisType(params),
                position: 'bottom',
            },
            y: {
                type: 'number',
                position: 'left',
            },
        };

        return axes;
    }

    protected override getUpdateOptions(
        params: UpdateParams,
        commonChartOptions: AgCartesianChartOptions
    ): AgCartesianChartOptions {
        const options = super.getUpdateOptions(params, commonChartOptions);
        return this.isNormalised()
            ? { ...options, formatter: createNormalisedFormatter(this.getThemeFormatter(commonChartOptions)) }
            : options;
    }

    protected override getSeries(params: UpdateParams) {
        const [category] = params.categories;
        const series: AgAreaSeriesOptions[] = params.fields.map(
            (f) =>
                ({
                    type: this.standaloneChartType,
                    xKey: category.id,
                    xName: category.name,
                    yKey: f.colId,
                    yName: f.displayName,
                    normalizedTo: this.chartType === 'normalizedArea' ? 100 : undefined,
                    stacked: ['normalizedArea', 'stackedArea'].includes(this.chartType),
                }) as AgAreaSeriesOptions
        );

        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }

    private isNormalised() {
        return !this.crossFiltering && this.chartType === 'normalizedArea';
    }
}
