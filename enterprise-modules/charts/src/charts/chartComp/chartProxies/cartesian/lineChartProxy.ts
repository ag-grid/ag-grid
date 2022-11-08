import { AgCartesianAxisOptions, AgLineSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";

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
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...(axisOptions ? deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom) : {}),
                type: this.xAxisType,
                position: 'bottom'
            },
            {
                ...(axisOptions ? deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left) : {}),
                type: this.yAxisType,
                position: 'left'
            },
        ];
    }

    public getSeries(params: UpdateChartParams) {
        const series: AgLineSeriesOptions[] = params.fields.map(f => (
            {
                ...this.extractSeriesOverrides(),
                type: this.standaloneChartType,
                xKey: params.category.id,
                xName: params.category.name,
                yKey: f.colId,
                yName: f.displayName
            }
        ));

        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }
}