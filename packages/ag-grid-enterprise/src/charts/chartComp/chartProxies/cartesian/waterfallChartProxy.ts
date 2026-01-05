import type { AgCartesianAxisOptions, AgCartesianChartOptions, AgWaterfallSeriesOptions } from 'ag-charts-types';

import type { UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';

export class WaterfallChartProxy extends CartesianChartProxy<'waterfall'> {
    protected override getAxes(
        params: UpdateParams,
        commonChartOptions: AgCartesianChartOptions
    ): Record<string, AgCartesianAxisOptions> {
        const isHorizontal = this.isHorizontal(commonChartOptions);
        const crossAxis = isHorizontal ? 'y' : 'x';
        const valueAxis = isHorizontal ? 'x' : 'y';
        return {
            [crossAxis]: { type: this.getXAxisType(params), position: isHorizontal ? 'left' : 'bottom' },
            [valueAxis]: { type: 'number', position: isHorizontal ? 'bottom' : 'left' },
        };
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
