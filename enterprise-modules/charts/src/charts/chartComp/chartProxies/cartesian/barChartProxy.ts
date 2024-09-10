import { _includes } from '@ag-grid-community/core';
import type { AgBarSeriesOptions, AgCartesianAxisOptions } from 'ag-charts-community';

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
                    xKey: category.id,
                    xName: category.name,
                    yKey: f.colId,
                    ...(this.crossFiltering && { yFilterKey: `${f.colId}Filter` }),
                    yName: f.displayName,
                }) as AgBarSeriesOptions
        );

        return series;
    }

    protected override isNormalized() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return _includes(normalisedCharts, this.chartType);
    }

    protected override isHorizontal(): boolean {
        return HORIZONTAL_CHART_TYPES.has(this.chartType);
    }
}
