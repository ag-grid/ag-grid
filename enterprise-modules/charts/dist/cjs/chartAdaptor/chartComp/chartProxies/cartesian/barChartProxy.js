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
var core_1 = require("@ag-grid-community/core");
var ag_charts_community_1 = require("ag-charts-community");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var BarChartProxy = /** @class */ (function (_super) {
    __extends(BarChartProxy, _super);
    function BarChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    BarChartProxy.prototype.createChart = function (options) {
        var _a = this.chartProxyParams, grouping = _a.grouping, parentElement = _a.parentElement;
        var builderFunction;
        if (this.isColumnChart()) {
            builderFunction = grouping ? 'createGroupedColumnChart' : 'createColumnChart';
        }
        else {
            builderFunction = grouping ? 'createGroupedBarChart' : 'createBarChart';
        }
        var chart = ag_charts_community_1.ChartBuilder[builderFunction](parentElement, options || this.chartOptions);
        var barSeries = ag_charts_community_1.ChartBuilder.createSeries(this.getSeriesDefaults());
        if (barSeries) {
            barSeries.flipXY = !this.isColumnChart();
            chart.addSeries(barSeries);
        }
        return chart;
    };
    BarChartProxy.prototype.update = function (params) {
        this.chartProxyParams.grouping = params.grouping;
        this.updateAxes('category', !this.isColumnChart());
        var chart = this.chart;
        var barSeries = chart.series[0];
        var _a = this.getPalette(), fills = _a.fills, strokes = _a.strokes;
        barSeries.data = this.transformData(params.data, params.category.id);
        barSeries.xKey = params.category.id;
        barSeries.xName = params.category.name;
        barSeries.yKeys = params.fields.map(function (f) { return f.colId; });
        barSeries.yNames = params.fields.map(function (f) { return f.displayName; });
        barSeries.fills = fills;
        barSeries.strokes = strokes;
        this.updateLabelRotation(params.category.id, !this.isColumnChart());
    };
    BarChartProxy.prototype.getDefaultOptions = function () {
        var isColumnChart = this.isColumnChart();
        var fontOptions = this.getDefaultFontOptions();
        var options = this.getDefaultCartesianChartOptions();
        options.xAxis.label.rotation = isColumnChart ? 335 : 0;
        options.yAxis.label.rotation = isColumnChart ? 0 : 335;
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { tooltip: {
                enabled: true,
            }, label: __assign(__assign({}, fontOptions), { enabled: false }), shadow: this.getDefaultDropShadowOptions() });
        return options;
    };
    BarChartProxy.prototype.isColumnChart = function () {
        return core_1._.includes([core_1.ChartType.GroupedColumn, core_1.ChartType.StackedColumn, core_1.ChartType.NormalizedColumn], this.chartType);
    };
    BarChartProxy.prototype.getSeriesDefaults = function () {
        var chartType = this.chartType;
        var isGrouped = chartType === core_1.ChartType.GroupedColumn || chartType === core_1.ChartType.GroupedBar;
        var isNormalized = chartType === core_1.ChartType.NormalizedColumn || chartType === core_1.ChartType.NormalizedBar;
        return __assign(__assign({}, this.chartOptions.seriesDefaults), { type: 'bar', grouped: isGrouped, normalizedTo: isNormalized ? 100 : undefined });
    };
    return BarChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.BarChartProxy = BarChartProxy;
//# sourceMappingURL=barChartProxy.js.map