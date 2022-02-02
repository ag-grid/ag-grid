"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ag_charts_community_1 = require("ag-charts-community");
const cartesianChartProxy_1 = require("./cartesianChartProxy");
const object_1 = require("../../utils/object");
class HistogramChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
        this.xAxisType = 'number';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    createChart() {
        return ag_charts_community_1.AgChart.create({
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
            Object.assign(Object.assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ag_charts_community_1.ChartAxisPosition.Bottom }),
            Object.assign(Object.assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ag_charts_community_1.ChartAxisPosition.Left }),
        ];
    }
}
exports.HistogramChartProxy = HistogramChartProxy;
//# sourceMappingURL=histogramChartProxy.js.map