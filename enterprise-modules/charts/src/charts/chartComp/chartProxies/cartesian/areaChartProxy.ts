import {
    AgAreaSeriesOptions,
    AgCartesianChartOptions,
    AgChart,
    CartesianChart,
    ChartAxisPosition
} from "ag-charts-community";
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

    protected createChart(): CartesianChart {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme
        });
    }

    public update(params: UpdateChartParams): void {
        const { category, data } = params;

        let options: AgCartesianChartOptions = {
            data: this.transformData(data, category.id),
            axes: this.getAxes(),
            series: this.getSeries(params)
        };

        if (this.crossFiltering) {
            options.tooltip = { delay: 500 };
        }

        AgChart.update(this.chart as CartesianChart, options);
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

    private extractSeriesOverrides() {
        const seriesOverrides = this.chartOptions[this.standaloneChartType].series;

        // TODO: remove once `yKeys` and `yNames` have been removed from the options
        delete seriesOverrides.yKeys;
        delete seriesOverrides.yNames;

        return seriesOverrides;
    }
}
