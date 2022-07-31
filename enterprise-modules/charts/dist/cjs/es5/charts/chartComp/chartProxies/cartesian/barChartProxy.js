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
var object_1 = require("../../utils/object");
var color_1 = require("../../utils/color");
var BarChartProxy = /** @class */ (function (_super) {
    __extends(BarChartProxy, _super);
    function BarChartProxy(params) {
        var _this = _super.call(this, params) || this;
        // when the standalone chart type is 'bar' - xAxis is positioned to the 'left'
        _this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        _this.yAxisType = 'number';
        _this.recreateChart();
        return _this;
    }
    BarChartProxy.prototype.getData = function (params) {
        return this.getDataTransformedData(params);
    };
    BarChartProxy.prototype.getAxes = function () {
        var isBar = this.standaloneChartType === 'bar';
        var axisOptions = this.getAxesOptions();
        var axes = [
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: isBar ? ag_charts_community_1.ChartAxisPosition.Left : ag_charts_community_1.ChartAxisPosition.Bottom }),
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: isBar ? ag_charts_community_1.ChartAxisPosition.Bottom : ag_charts_community_1.ChartAxisPosition.Left }),
        ];
        // special handling to add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            var numberAxis = axes[1];
            numberAxis.label = __assign(__assign({}, numberAxis.label), { formatter: function (params) { return Math.round(params.value) + '%'; } });
        }
        return axes;
    };
    BarChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var groupedCharts = ['groupedColumn', 'groupedBar'];
        var isGrouped = !this.crossFiltering && core_1._.includes(groupedCharts, this.chartType);
        var series = params.fields.map(function (f) { return (__assign(__assign({}, _this.extractSeriesOverrides()), { type: _this.standaloneChartType, grouped: isGrouped, normalizedTo: _this.isNormalised() ? 100 : undefined, xKey: params.category.id, xName: params.category.name, yKey: f.colId, yName: f.displayName })); });
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    };
    BarChartProxy.prototype.extractCrossFilterSeries = function (series) {
        var _this = this;
        var palette = this.chartTheme.palette;
        var updatePrimarySeries = function (seriesOptions, index) {
            return __assign(__assign({}, seriesOptions), { highlightStyle: { item: { fill: undefined } }, fill: palette.fills[index], stroke: palette.strokes[index], listeners: __assign(__assign({}, _this.extractSeriesOverrides().listeners), { nodeClick: _this.crossFilterCallback }) });
        };
        var updateFilteredOutSeries = function (seriesOptions) {
            var yKey = seriesOptions.yKey + '-filtered-out';
            return __assign(__assign({}, object_1.deepMerge({}, seriesOptions)), { yKey: yKey, fill: color_1.hexToRGBA(seriesOptions.fill, '0.3'), stroke: color_1.hexToRGBA(seriesOptions.stroke, '0.3'), hideInLegend: [yKey] });
        };
        var allSeries = [];
        for (var i = 0; i < series.length; i++) {
            // update primary series
            var primarySeries = updatePrimarySeries(series[i], i);
            allSeries.push(primarySeries);
            // add 'filtered-out' series
            allSeries.push(updateFilteredOutSeries(primarySeries));
        }
        return allSeries;
    };
    BarChartProxy.prototype.isNormalised = function () {
        var normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && core_1._.includes(normalisedCharts, this.chartType);
    };
    return BarChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.BarChartProxy = BarChartProxy;
