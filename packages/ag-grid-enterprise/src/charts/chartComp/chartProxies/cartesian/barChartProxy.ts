import type { AgBarSeriesOptions, AgCartesianAxisOptions } from 'ag-charts-types';

import { isStacked } from '../../utils/seriesTypeMapper';
import type { UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

const HORIZONTAL_CHART_TYPES = new Set(['bar', 'groupedBar', 'stackedBar', 'normalizedBar']);

export class BarChartProxy extends CartesianChartProxy<'bar'> {
    protected override getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        const axes: AgCartesianAxisOptions[] = [
            {
                type: this.getXAxisType(params),
                position: this.isHorizontal() ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: this.isHorizontal() ? 'bottom' : 'left',
            },
        ];
        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            const numberAxis = axes[1];
            numberAxis.label = { ...numberAxis.label, formatter: (params) => Math.round(params.value) + '%' };
        }

        return axes;
    }

    protected override getSeries(params: UpdateParams): AgBarSeriesOptions[] {
        const [category] = params.categories;
        const series: AgBarSeriesOptions[] = params.fields.map(
            (f) =>
                ({
                    type: this.standaloneChartType,
                    direction: this.isHorizontal() ? 'horizontal' : 'vertical',
                    stacked: this.crossFiltering || isStacked(this.chartType),
                    normalizedTo: this.isNormalised() ? 100 : undefined,
                    xKey: category.id,
                    xName: category.name,
                    yKey: f.colId,
                    yName: f.displayName,
                }) as AgBarSeriesOptions
        );

        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }

    private extractCrossFilterSeries(series: AgBarSeriesOptions[]): AgBarSeriesOptions[] {
        const allSeries: AgBarSeriesOptions[] = [];
        for (let i = 0; i < series.length; i++) {
            const commonSeries = series[i];

            const primarySeries = {
                ...commonSeries,
                listeners: {
                    seriesNodeClick: this.crossFilterCallback,
                },
            };

            const filteredOutSeries = {
                ...primarySeries,
                yKey: `${primarySeries.yKey}-filtered-out`,
                showInLegend: false,
            };

            // for bar/column charts, proportion of whole is achieved as a stacked bar/column
            allSeries.push(primarySeries);
            allSeries.push(filteredOutSeries as unknown as AgBarSeriesOptions);
        }
        return allSeries;
    }

    private isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && normalisedCharts.includes(this.chartType);
    }

    protected override isHorizontal(): boolean {
        return HORIZONTAL_CHART_TYPES.has(this.chartType);
    }
}
