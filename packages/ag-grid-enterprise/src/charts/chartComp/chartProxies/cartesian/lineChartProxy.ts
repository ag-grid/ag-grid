import type { AgCartesianAxisOptions, AgLineSeriesOptions } from 'ag-charts-types';

import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

export class LineChartProxy extends CartesianChartProxy<'line'> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected override getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        const axes: AgCartesianAxisOptions[] = [
            {
                type: this.getXAxisType(params),
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];

        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            const numberAxis = axes[1];
            numberAxis.label = { ...numberAxis.label, formatter: (params) => Math.round(params.value) + '%' };
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
