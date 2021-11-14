var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { AgChart, ChartAxisPosition } from "ag-charts-community";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../object";
var HistogramChartProxy = /** @class */ (function (_super) {
    __extends(HistogramChartProxy, _super);
    function HistogramChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.xAxisType = 'number';
        _this.yAxisType = 'number';
        return _this;
    }
    HistogramChartProxy.prototype.create = function () {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(),
            series: [__assign(__assign({}, this.chartOptions[this.standaloneChartType].series), { type: 'histogram' })]
        });
    };
    HistogramChartProxy.prototype.update = function (params) {
        var xField = params.fields[0];
        var chart = this.chart;
        var series = chart.series[0];
        series.data = params.data;
        series.xKey = xField.colId;
        series.xName = xField.displayName;
        // for now, only constant width is supported via integrated charts
        series.areaPlot = false;
        series.fill = this.chartTheme.palette.fills[0];
        series.stroke = this.chartTheme.palette.strokes[0];
    };
    HistogramChartProxy.prototype.getAxes = function () {
        var axisOptions = this.getAxesOptions();
        return [
            __assign(__assign({}, deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ChartAxisPosition.Bottom }),
            __assign(__assign({}, deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ChartAxisPosition.Left }),
        ];
    };
    return HistogramChartProxy;
}(CartesianChartProxy));
export { HistogramChartProxy };
