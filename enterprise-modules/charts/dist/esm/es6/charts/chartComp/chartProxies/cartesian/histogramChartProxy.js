import { AgChart, ChartAxisPosition } from "ag-charts-community";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
export class HistogramChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
        this.xAxisType = 'number';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    createChart() {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(),
            series: [Object.assign(Object.assign({}, this.chartOptions[this.standaloneChartType].series), { type: 'histogram' })]
        });
    }
    update(params) {
        const [xField] = params.fields;
        const chart = this.chart;
        const series = chart.series[0];
        series.data = params.data;
        series.xKey = xField.colId;
        series.xName = xField.displayName;
        // for now, only constant width is supported via integrated charts
        series.areaPlot = false;
        series.fill = this.chartTheme.palette.fills[0];
        series.stroke = this.chartTheme.palette.strokes[0];
    }
    getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            Object.assign(Object.assign({}, deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ChartAxisPosition.Bottom }),
            Object.assign(Object.assign({}, deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ChartAxisPosition.Left }),
        ];
    }
}
//# sourceMappingURL=histogramChartProxy.js.map