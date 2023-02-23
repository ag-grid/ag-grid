import { AgAreaSeriesOptions, AgCartesianAxisOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class AreaChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateChartParams): AgCartesianAxisOptions[] {
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

    public getSeries(params: UpdateChartParams) {
        const series: AgAreaSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType,
                xKey: params.category.id,
                xName: params.category.name,
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
