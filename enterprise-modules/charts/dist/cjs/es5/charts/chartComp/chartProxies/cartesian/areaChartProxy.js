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
var object_1 = require("../../utils/object");
var AreaChartProxy = /** @class */ (function (_super) {
    __extends(AreaChartProxy, _super);
    function AreaChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        _this.yAxisType = 'number';
        _this.recreateChart();
        return _this;
    }
    AreaChartProxy.prototype.createChart = function () {
        return ag_charts_community_1.AgChart.create({
            type: 'area',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes()
        });
    };
    AreaChartProxy.prototype.update = function (params) {
        this.updateAxes(params);
        if (this.chartType === 'area') {
            // area charts have multiple series
            this.updateAreaChart(params);
        }
        else {
            // stacked and normalized has a single series
            var areaSeries = this.chart.series[0];
            if (!areaSeries) {
                var seriesDefaults = __assign(__assign({}, this.chartOptions[this.standaloneChartType].series), { type: 'area', normalizedTo: this.chartType === 'normalizedArea' ? 100 : undefined });
                areaSeries = ag_charts_community_1.AgChart.createComponent(__assign({}, seriesDefaults), 'area.series');
                if (!areaSeries) {
                    return;
                }
                this.chart.addSeries(areaSeries);
            }
            areaSeries.data = this.transformData(params.data, params.category.id);
            areaSeries.xKey = params.category.id;
            areaSeries.xName = params.category.name;
            areaSeries.yKeys = params.fields.map(function (f) { return f.colId; });
            areaSeries.yNames = params.fields.map(function (f) { return f.displayName; });
            areaSeries.fills = this.chartTheme.palette.fills;
            areaSeries.strokes = this.chartTheme.palette.strokes;
        }
        this.updateLabelRotation(params.category.id);
    };
    AreaChartProxy.prototype.updateAreaChart = function (params) {
        var _this = this;
        var chart = this.chart;
        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }
        var fieldIds = params.fields.map(function (f) { return f.colId; });
        var existingSeriesById = chart.series
            .reduceRight(function (map, series, i) {
            var id = series.yKeys[0];
            if (fieldIds.indexOf(id) === i) {
                map.set(id, series);
            }
            else {
                chart.removeSeries(series);
            }
            return map;
        }, new Map());
        var data = this.transformData(params.data, params.category.id);
        var previousSeries;
        var _a = this.chartTheme.palette, fills = _a.fills, strokes = _a.strokes;
        params.fields.forEach(function (f, index) {
            var _a = _this.processDataForCrossFiltering(data, f.colId, params), yKey = _a.yKey, atLeastOneSelectedPoint = _a.atLeastOneSelectedPoint;
            var areaSeries = existingSeriesById.get(f.colId);
            var fill = fills[index % fills.length];
            var stroke = strokes[index % strokes.length];
            if (areaSeries) {
                areaSeries.data = data;
                areaSeries.xKey = params.category.id;
                areaSeries.xName = params.category.name;
                areaSeries.yKeys = [yKey];
                areaSeries.yNames = [f.displayName];
                areaSeries.fills = [fill];
                areaSeries.strokes = [stroke];
            }
            else {
                var seriesOverrides = _this.chartOptions[_this.standaloneChartType].series;
                var seriesDefaults = __assign(__assign({}, seriesOverrides), { type: 'area', normalizedTo: _this.chartType === 'normalizedArea' ? 100 : undefined });
                var options = __assign(__assign({}, seriesDefaults), { data: data, xKey: params.category.id, xName: params.category.name, yKeys: [yKey], yNames: [f.displayName], fills: [fill], strokes: [stroke], marker: __assign(__assign({}, seriesDefaults.marker), { fill: fill,
                        stroke: stroke }) });
                areaSeries = ag_charts_community_1.AgChart.createComponent(options, 'area.series');
                chart.addSeriesAfter(areaSeries, previousSeries);
            }
            _this.updateSeriesForCrossFiltering(areaSeries, f.colId, chart, params, atLeastOneSelectedPoint);
            previousSeries = areaSeries;
        });
    };
    AreaChartProxy.prototype.getAxes = function () {
        var axisOptions = this.getAxesOptions();
        return [
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ag_charts_community_1.ChartAxisPosition.Bottom, paddingInner: 1, paddingOuter: 0 }),
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ag_charts_community_1.ChartAxisPosition.Left }),
        ];
    };
    return AreaChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.AreaChartProxy = AreaChartProxy;
//# sourceMappingURL=areaChartProxy.js.map