import type { AgCartesianAxisOptions, AgLineSeriesOptions } from 'ag-charts-types';

import type { UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

export class LineChartProxy extends CartesianChartProxy<'line'> {
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

        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            axes.y.label = { ...axes.y.label, formatter: (params) => Math.round(params.value) + '%' };
        }

        return axes;
    }

    protected override getSeries(params: UpdateParams) {
        const [category] = params.categories;
        const stacked = ['normalizedLine', 'stackedLine'].includes(this.chartType);

        const series: AgLineSeriesOptions[] = params.fields.map(
            (f) =>
                ({
                    type: this.standaloneChartType,
                    xKey: category.id,
                    xName: category.name,
                    yKey: f.colId,
                    yName: f.displayName,
                    normalizedTo: stacked && this.isNormalised() ? 100 : undefined,
                    stacked,
                }) as AgLineSeriesOptions
        );

        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }

    private isNormalised() {
        const normalisedCharts = ['normalizedLine'];
        return !this.crossFiltering && normalisedCharts.includes(this.chartType);
    }
}
