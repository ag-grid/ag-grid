import { _ } from "@ag-grid-community/core";
import { AgCartesianChartOptions, AgChart, CartesianChart, ChartAxisPosition } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";

export class BarChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        // when the standalone chart type is 'bar' - xAxis is positioned to the 'left'
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
        const [isBar, isNormalised] = [this.standaloneChartType === 'bar', this.isNormalised()];

        let options: AgCartesianChartOptions = {
            data: this.transformData(data, category.id),
            axes: this.getAxes(isBar, isNormalised),
            series: this.getSeries(params, isNormalised)
        };

        AgChart.update(this.chart as CartesianChart, options);
    }

    private getAxes(isBar: boolean, normalised: boolean) {
        const axisOptions = this.getAxesOptions();
        let axes = [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: isBar ? ChartAxisPosition.Left : ChartAxisPosition.Bottom,
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: isBar ? ChartAxisPosition.Bottom : ChartAxisPosition.Left,
            },
        ];
        // special handling to add a default label formatter to show '%' for normalized charts if none is provided
        if (normalised) {
            const numberAxis = axes[1];
            numberAxis.label = { ...numberAxis.label, formatter: (params: any) => Math.round(params.value) + '%' };
        }
        return axes;
    }

    private getSeries(params: UpdateChartParams, normalised: boolean) {
        const groupedCharts = ['groupedColumn', 'groupedBar'];
        const isGrouped = !this.crossFiltering && _.includes(groupedCharts, this.chartType);
        return params.fields.map(f => ({
                ...this.extractSeriesOverrides(),
                type: this.standaloneChartType,
                grouped: isGrouped,
                normalizedTo: normalised ? 100 : undefined,
                xKey: params.category.id,
                xName: params.category.name,
                yKey: f.colId,
                yName: f.displayName
            }
        ));
    }

    private extractSeriesOverrides() {
        const seriesOverrides = this.chartOptions[this.standaloneChartType].series;

        // TODO: remove once `yKeys` and `yNames` have been removed from the options
        delete seriesOverrides.yKeys;
        delete seriesOverrides.yNames;

        return seriesOverrides;
    }

    private isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && _.includes(normalisedCharts, this.chartType);
    }
}