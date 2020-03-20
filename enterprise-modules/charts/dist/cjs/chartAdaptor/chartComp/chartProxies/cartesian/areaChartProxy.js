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
var AreaChartProxy = /** @class */ (function (_super) {
    __extends(AreaChartProxy, _super);
    function AreaChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.initChartOptions();
        _this.recreateChart();
        return _this;
    }
    AreaChartProxy.prototype.createChart = function (options) {
        var _a = this.chartProxyParams, grouping = _a.grouping, parentElement = _a.parentElement;
        var chart = ag_charts_community_1.ChartBuilder[grouping ? "createGroupedAreaChart" : "createAreaChart"](parentElement, options || this.chartOptions);
        chart.axes
            .filter(function (axis) { return axis.position === ag_charts_community_1.ChartAxisPosition.Bottom && axis instanceof ag_charts_community_1.CategoryAxis; })
            .forEach(function (axis) {
            axis.scale.paddingInner = 1;
            axis.scale.paddingOuter = 0;
        });
        return chart;
    };
    AreaChartProxy.prototype.update = function (params) {
        this.chartProxyParams.grouping = params.grouping;
        this.updateAxes();
        if (this.chartType === core_1.ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        }
        else {
            // stacked and normalized has a single series
            var areaSeries = this.chart.series[0];
            if (!areaSeries) {
                areaSeries = ag_charts_community_1.ChartBuilder.createSeries(this.getSeriesDefaults());
                if (areaSeries) {
                    this.chart.addSeries(areaSeries);
                }
                else {
                    return;
                }
            }
            var _a = this.getPalette(), fills = _a.fills, strokes = _a.strokes;
            areaSeries.data = this.transformData(params.data, params.category.id);
            areaSeries.xKey = params.category.id;
            areaSeries.xName = params.category.name;
            areaSeries.yKeys = params.fields.map(function (f) { return f.colId; });
            areaSeries.yNames = params.fields.map(function (f) { return f.displayName; });
            areaSeries.fills = fills;
            areaSeries.strokes = strokes;
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
        var _a = this.getPalette(), fills = _a.fills, strokes = _a.strokes;
        var existingSeriesById = chart.series.reduceRight(function (map, series, i) {
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
        var previousSeries = undefined;
        params.fields.forEach(function (f, index) {
            var areaSeries = existingSeriesById.get(f.colId);
            var fill = fills[index % fills.length];
            var stroke = strokes[index % strokes.length];
            if (areaSeries) {
                areaSeries.data = data;
                areaSeries.xKey = params.category.id;
                areaSeries.xName = params.category.name;
                areaSeries.yKeys = [f.colId];
                areaSeries.yNames = [f.displayName];
                areaSeries.fills = [fill];
                areaSeries.strokes = [stroke];
            }
            else {
                var seriesDefaults = _this.getSeriesDefaults();
                var options = __assign(__assign({}, seriesDefaults), { data: data, field: {
                        xKey: params.category.id,
                        xName: params.category.name,
                        yKeys: [f.colId],
                        yNames: [f.displayName],
                    }, fill: __assign(__assign({}, seriesDefaults.fill), { colors: [fill] }), stroke: __assign(__assign({}, seriesDefaults.stroke), { colors: [stroke] }) });
                areaSeries = ag_charts_community_1.ChartBuilder.createSeries(options);
                chart.addSeriesAfter(areaSeries, previousSeries);
            }
            previousSeries = areaSeries;
        });
    };
    AreaChartProxy.prototype.getDefaultOptions = function () {
        var options = this.getDefaultCartesianChartOptions();
        options.xAxis.label.rotation = 335;
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { fill: __assign(__assign({}, options.seriesDefaults.fill), { opacity: this.chartType === core_1.ChartType.Area ? 0.7 : 1 }), stroke: __assign(__assign({}, options.seriesDefaults.stroke), { width: 3 }), marker: {
                shape: 'circle',
                enabled: true,
                size: 6,
                strokeWidth: 1,
            }, tooltip: {
                enabled: true,
            }, shadow: this.getDefaultDropShadowOptions() });
        return options;
    };
    AreaChartProxy.prototype.getSeriesDefaults = function () {
        return __assign(__assign({}, this.chartOptions.seriesDefaults), { type: 'area', normalizedTo: this.chartType === core_1.ChartType.NormalizedArea ? 100 : undefined });
    };
    return AreaChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.AreaChartProxy = AreaChartProxy;
//# sourceMappingURL=areaChartProxy.js.map