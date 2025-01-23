import type { AgCartesianAxisOptions, AgCartesianChartOptions, AgWaterfallSeriesOptions } from 'ag-charts-types';

import type { UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

export class WaterfallChartProxy extends CartesianChartProxy<'waterfall'> {
    protected override getAxes(
        params: UpdateParams,
        commonChartOptions: AgCartesianChartOptions
    ): AgCartesianAxisOptions[] {
        return [
            {
                type: this.getXAxisType(params),
                position: this.isHorizontal(commonChartOptions) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: this.isHorizontal(commonChartOptions) ? 'bottom' : 'left',
            },
        ];
    }

    protected override getSeries(params: UpdateParams): AgWaterfallSeriesOptions[] {
        const [category] = params.categories;
        const [firstField] = params.fields;
        const firstSeries: AgWaterfallSeriesOptions = {
            type: this.standaloneChartType as 'waterfall',
            xKey: category.id,
            xName: category.name,
            yKey: firstField.colId,
            yName: firstField.displayName ?? undefined,
        };

        return [firstSeries]; // waterfall only supports a single series!
    }
}
