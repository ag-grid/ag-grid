import { AgAreaSeriesOptions, AgCartesianAxisOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

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

        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            const numberAxis = axes[1];
            numberAxis.label = { ...numberAxis.label, formatter: (params: any) => Math.round(params.value) + '%' };
        }

        return axes;
    }

    protected override getSeries(params: UpdateParams) {
        const [category] = params.categories;
        const series: AgAreaSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType,
                xKey: category.id,
                xName: category.name,
                yKey: f.colId,
                yName: f.displayName,
                normalizedTo: this.chartType === 'normalizedArea' ? 100 : undefined,
                stacked: ['normalizedArea', 'stackedArea'].includes(this.chartType)
            } as AgAreaSeriesOptions
        ));

        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }

    private isNormalised() {
        return !this.crossFiltering && this.chartType === 'normalizedArea';
    }
}
