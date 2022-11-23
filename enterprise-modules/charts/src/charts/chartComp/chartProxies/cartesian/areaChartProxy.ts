import { AgAreaSeriesOptions, AgCartesianAxisOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class AreaChartProxy extends CartesianChartProxy {

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
        const axes: AgCartesianAxisOptions[] = [
            {
                type: this.xAxisType,
                position: 'bottom',
            },
            {
                type: this.yAxisType,
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
