import type { AgAreaSeriesOptions, AgCartesianAxisOptions } from 'ag-charts-community';

import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

export class AreaChartProxy extends CartesianChartProxy<'area'> {
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

        return axes;
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
                    stacked: ['normalizedArea', 'stackedArea'].includes(this.chartType),
                }) as AgAreaSeriesOptions
        );

        return series;
    }

    protected override isNormalized() {
        return this.chartType === 'normalizedArea';
    }
}
