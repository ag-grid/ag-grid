"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var ag_charts_community_1 = require("ag-charts-community");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var HistogramChartProxy = /** @class */ (function (_super) {
    __extends(HistogramChartProxy, _super);
    function HistogramChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    HistogramChartProxy.prototype.createChart = function (options) {
        var parentElement = this.chartProxyParams.parentElement;
        var chart = ag_charts_community_1.ChartBuilder.createHistogramChart(parentElement, options || this.chartOptions);
        var histogramSeries = ag_charts_community_1.ChartBuilder.createSeries(this.getSeriesDefaults());
        if (histogramSeries) {
            chart.addSeries(histogramSeries);
        }
        return chart;
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
        var _a = this.getPalette(), fills = _a.fills, strokes = _a.strokes;
        series.fill = fills[0];
        series.stroke = strokes[0];
    };
    HistogramChartProxy.prototype.getDefaultOptions = function () {
        var fontOptions = this.getDefaultFontOptions();
        var options = this.getDefaultCartesianChartOptions();
        options.xAxis.label.rotation = 0;
        options.yAxis.label.rotation = 0;
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { tooltip: {
                enabled: true,
            }, label: __assign(__assign({}, fontOptions), { enabled: false }), shadow: this.getDefaultDropShadowOptions(), binCount: 10 });
        return options;
    };
    HistogramChartProxy.prototype.getSeriesDefaults = function () {
        return __assign(__assign({}, this.chartOptions.seriesDefaults), { type: 'histogram' });
    };
    return HistogramChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.HistogramChartProxy = HistogramChartProxy;
//# sourceMappingURL=histogramChartProxy.js.map