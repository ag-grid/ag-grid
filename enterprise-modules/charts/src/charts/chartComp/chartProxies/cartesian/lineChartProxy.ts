import type { AgCartesianAxisOptions, AgLineSeriesOptions } from 'ag-charts-community';

import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

export class LineChartProxy extends CartesianChartProxy<'line'> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected override getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        return [
            {
                type: this.getXAxisType(params),
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
    }

    protected override getSeries(params: UpdateParams) {
        const [category] = params.categories;
        const series: AgLineSeriesOptions[] = params.fields.map(
            (f) =>
                ({
                    type: this.standaloneChartType,
                    xKey: category.id,
                    xName: category.name,
                    yKey: f.colId,
                    ...(this.crossFiltering && { yFilterKey: `${f.colId}Filter` }),
                    yName: f.displayName,
                }) as AgLineSeriesOptions
        );

        return series;
    }
}
