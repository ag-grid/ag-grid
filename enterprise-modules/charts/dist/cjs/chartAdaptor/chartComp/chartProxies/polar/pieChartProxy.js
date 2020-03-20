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
var polarChartProxy_1 = require("./polarChartProxy");
var PieChartProxy = /** @class */ (function (_super) {
    __extends(PieChartProxy, _super);
    function PieChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    PieChartProxy.prototype.createChart = function (options) {
        return ag_charts_community_1.ChartBuilder.createPieChart(this.chartProxyParams.parentElement, options || this.chartOptions);
    };
    PieChartProxy.prototype.update = function (params) {
        var chart = this.chart;
        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }
        var existingSeries = chart.series[0];
        var existingSeriesId = existingSeries && existingSeries.angleKey;
        var pieSeriesField = params.fields[0];
        var _a = this.getPalette(), fills = _a.fills, strokes = _a.strokes;
        var seriesDefaults = this.chartOptions.seriesDefaults;
        var pieSeries = existingSeries;
        var calloutColors = seriesDefaults.callout && seriesDefaults.callout.colors;
        if (existingSeriesId !== pieSeriesField.colId) {
            chart.removeSeries(existingSeries);
            var seriesOptions = __assign(__assign({}, seriesDefaults), { type: "pie", field: {
                    angleKey: pieSeriesField.colId,
                }, title: __assign(__assign({}, seriesDefaults.title), { text: seriesDefaults.title.text || params.fields[0].displayName }) });
            pieSeries = ag_charts_community_1.ChartBuilder.createSeries(seriesOptions);
        }
        pieSeries.angleName = pieSeriesField.displayName;
        pieSeries.labelKey = params.category.id;
        pieSeries.labelName = params.category.name;
        pieSeries.data = params.data;
        pieSeries.fills = fills;
        pieSeries.strokes = strokes;
        if (calloutColors) {
            pieSeries.callout.colors = calloutColors;
        }
        chart.addSeries(pieSeries);
    };
    PieChartProxy.prototype.getDefaultOptions = function () {
        var strokes = this.getPredefinedPalette().strokes;
        var options = this.getDefaultChartOptions();
        var fontOptions = this.getDefaultFontOptions();
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { title: __assign(__assign({}, fontOptions), { enabled: false, fontSize: 12, fontWeight: 'bold' }), callout: {
                colors: strokes,
                length: 10,
                strokeWidth: 2,
            }, label: __assign(__assign({}, fontOptions), { enabled: false, offset: 3, minRequiredAngle: 0 }), tooltip: {
                enabled: true,
            }, shadow: this.getDefaultDropShadowOptions() });
        return options;
    };
    return PieChartProxy;
}(polarChartProxy_1.PolarChartProxy));
exports.PieChartProxy = PieChartProxy;
//# sourceMappingURL=pieChartProxy.js.map