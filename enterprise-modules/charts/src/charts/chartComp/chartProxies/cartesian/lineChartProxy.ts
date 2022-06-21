import { AgLineSeriesOptions, ChartAxisPosition } from "ag-charts-community";
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

    public update(params: UpdateChartParams): void {
        this.updateChart({
            data: this.transformData(params.data, params.category.id),
            axes: this.getAxes(),
            series: this.getSeries(params)
        });
    }

    private getSeries(params: UpdateChartParams): AgLineSeriesOptions[] {
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

        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }

    private extractCrossFilterSeries(series: AgLineSeriesOptions[]): AgLineSeriesOptions[] {
       return []; //TODO
    }

    private getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: ChartAxisPosition.Left
            },
        ];
    }

}