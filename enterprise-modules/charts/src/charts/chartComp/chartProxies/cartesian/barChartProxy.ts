import { _includes } from '@ag-grid-community/core';
import type { AgBarSeriesOptions, AgCartesianAxisOptions } from 'ag-charts-community';

import { hexToRGBA } from '../../utils/color';
import { isStacked } from '../../utils/seriesTypeMapper';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

const HORIZONTAL_CHART_TYPES = new Set(['bar', 'groupedBar', 'stackedBar', 'normalizedBar']);

export class BarChartProxy extends CartesianChartProxy<'bar'> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

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
        const palette = this.getChartPalette();

        const updatePrimarySeries = (seriesOptions: AgBarSeriesOptions, index: number) => {
            return {
                ...seriesOptions,
                highlightStyle: { item: { fill: undefined } },
                fill: palette?.fills?.[index],
                stroke: palette?.strokes?.[index],
                listeners: {
                    nodeClick: this.crossFilterCallback,
                },
            };
        };

        const updateFilteredOutSeries = (seriesOptions: AgBarSeriesOptions): AgBarSeriesOptions => {
            const yKey = seriesOptions.yKey + '-filtered-out';
            return {
                ...seriesOptions,
                yKey,
                fill: hexToRGBA(seriesOptions.fill!, '0.3'),
                stroke: hexToRGBA(seriesOptions.stroke!, '0.3'),
                showInLegend: false,
            };
        };

        const allSeries: AgBarSeriesOptions[] = [];
        for (let i = 0; i < series.length; i++) {
            const originalSeries = series[i];
            // update primary series
            allSeries.push(updatePrimarySeries(originalSeries, i));

            // add 'filtered-out' series
            allSeries.push(updateFilteredOutSeries(updatePrimarySeries(originalSeries, i)));
        }
        return allSeries;
    }

    private isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && _includes(normalisedCharts, this.chartType);
    }

    protected override isHorizontal(): boolean {
        return HORIZONTAL_CHART_TYPES.has(this.chartType);
    }
}
