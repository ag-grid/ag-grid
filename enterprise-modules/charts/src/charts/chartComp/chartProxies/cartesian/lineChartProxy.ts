import { AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class LineChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateChartParams): AgCartesianAxisOptions[] {
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

    public getSeries(params: UpdateChartParams) {
        const series: AgLineSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType,
                xKey: params.category.id,
                xName: params.category.name,
                yKey: f.colId,
                yName: f.displayName
            } as AgLineSeriesOptions
        ));

        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }
}