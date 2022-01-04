import { AgChart, CartesianChart, ChartAxisPosition, HistogramSeries } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";

export class HistogramChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = 'number';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(),
            series: [{ ...this.chartOptions[this.standaloneChartType].series, type: 'histogram' }]
        });
    }

    public update(params: UpdateChartParams): void {
        const [xField] = params.fields;

        const chart = this.chart;
        const series = chart.series[0] as HistogramSeries;

        series.data = params.data;
        series.xKey = xField.colId;
        series.xName = xField.displayName!;

        // for now, only constant width is supported via integrated charts
        series.areaPlot = false;

        series.fill = this.chartTheme.palette.fills[0];
        series.stroke = this.chartTheme.palette.strokes[0];
    }

    private getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom,
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: ChartAxisPosition.Left,
            },
        ];
    }
}