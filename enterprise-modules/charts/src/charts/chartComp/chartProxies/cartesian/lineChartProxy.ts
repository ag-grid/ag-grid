import { AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class LineChartProxy extends CartesianChartProxy<'line'> {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected override getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        return [
            {
                type: this.getXAxisType(params),
                position: 'bottom'
            },
            {
                type: 'number',
                position: 'left'
            },
        ];
    }

    protected override getSeries(params: UpdateParams) {
        const [category] = params.categories;
        const series: AgLineSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType,
                xKey: category.id,
                xName: category.name,
                yKey: f.colId,
                yName: f.displayName
            } as AgLineSeriesOptions
        ));

        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }
}
