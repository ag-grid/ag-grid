import { AgAreaSeriesOptions, ChartAxisPosition } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";

export class AreaChartProxy extends CartesianChartProxy {

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

    private getSeries(params: UpdateChartParams): AgAreaSeriesOptions[] {
        const series: AgAreaSeriesOptions[] = params.fields.map(f => (
            {
                ...this.extractSeriesOverrides(),
                type: this.standaloneChartType,
                xKey: params.category.id,
                xName: params.category.name,
                yKey: f.colId,
                yName: f.displayName,
                normalizedTo: this.chartType === 'normalizedArea' ? 100 : undefined,
                stacked: ['normalizedArea', 'stackedArea'].includes(this.chartType)
            }
        ));

        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }

    private extractCrossFilterSeries(series: AgAreaSeriesOptions[]): AgAreaSeriesOptions[] {
        return []; //TODO
    }

    private getAxes() {
        const axisOptions = this.getAxesOptions();
        const options = [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom,
                paddingInner: 1,
                paddingOuter: 0,
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: ChartAxisPosition.Left
            },
        ];

        if (this.xAxisType === 'time') {
            delete options[0].paddingInner;
            delete options[0].paddingOuter;
        }

        return options;
    }
}
