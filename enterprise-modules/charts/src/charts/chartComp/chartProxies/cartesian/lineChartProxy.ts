import { AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class LineChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    public getData(params: UpdateChartParams): any[] {
        return this.crossFiltering ? this.getLineAreaCrossFilterData(params) : this.getDataTransformedData(params);
    }

    public getAxes(): AgCartesianAxisOptions[] {
        return [
            {
                type: this.xAxisType,
                position: 'bottom'
            },
            {
                type: this.yAxisType,
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