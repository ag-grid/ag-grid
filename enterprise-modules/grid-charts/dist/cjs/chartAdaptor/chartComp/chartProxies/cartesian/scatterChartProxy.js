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
var chartBuilder_1 = require("../../../../charts/chartBuilder");
var chartModel_1 = require("../../chartModel");
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var ScatterChartProxy = /** @class */ (function (_super) {
    __extends(ScatterChartProxy, _super);
    function ScatterChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.getMarkersEnabled = function () { return true; }; // markers are always enabled on scatter charts
        _this.initChartOptions();
        _this.chart = chartBuilder_1.ChartBuilder.createScatterChart(params.parentElement, _this.chartOptions);
        return _this;
    }
    ScatterChartProxy.prototype.update = function (params) {
        var chart = this.chart;
        if (params.fields.length < 2) {
            chart.removeAllSeries();
            return;
        }
        var isBubbleChart = this.chartType === core_1.ChartType.Bubble;
        var yFields = params.fields.slice(1, params.fields.length).filter(function (_, i) { return !isBubbleChart || i % 2 === 0; });
        var fieldIds = yFields.map(function (f) { return f.colId; });
        var defaultCategorySelected = params.category.id === chartModel_1.ChartModel.DEFAULT_CATEGORY;
        var _a = this.overriddenPalette || this.chartProxyParams.getSelectedPalette(), fills = _a.fills, strokes = _a.strokes;
        var seriesOptions = __assign({ type: "scatter" }, this.chartOptions.seriesDefaults);
        var xFieldDefinition = params.fields[0];
        var labelFieldDefinition = defaultCategorySelected ? undefined : params.category;
        var existingSeriesById = chart.series.reduceRight(function (map, series) {
            var id = series.yKey;
            if (series.xKey === xFieldDefinition.colId && core_1._.includes(fieldIds, id)) {
                map.set(id, series);
            }
            else {
                chart.removeSeries(series);
            }
            return map;
        }, new Map());
        yFields.forEach(function (yFieldDefinition, index) {
            var existingSeries = existingSeriesById.get(yFieldDefinition.colId);
            var series = existingSeries || chartBuilder_1.ChartBuilder.createSeries(seriesOptions);
            if (!series) {
                return;
            }
            series.title = xFieldDefinition.displayName + " vs " + yFieldDefinition.displayName;
            series.xKey = xFieldDefinition.colId;
            series.xName = xFieldDefinition.displayName;
            series.yKey = yFieldDefinition.colId;
            series.yName = yFieldDefinition.displayName;
            series.data = params.data;
            series.marker.fill = fills[index % fills.length];
            series.marker.stroke = strokes[index % strokes.length];
            if (isBubbleChart) {
                var radiusFieldDefinition = params.fields[index * 2 + 2];
                if (radiusFieldDefinition) {
                    series.sizeKey = radiusFieldDefinition.colId;
                    series.sizeName = radiusFieldDefinition.displayName;
                }
                else {
                    // not enough information to render this series, so ensure it is removed
                    if (existingSeries) {
                        chart.removeSeries(series);
                    }
                    return;
                }
            }
            else {
                series.sizeKey = series.sizeName = undefined;
            }
            if (labelFieldDefinition) {
                series.labelKey = labelFieldDefinition.id;
                series.labelName = labelFieldDefinition.name;
            }
            else {
                series.labelKey = series.labelName = undefined;
            }
            if (!existingSeries) {
                chart.addSeries(series);
            }
        });
    };
    ScatterChartProxy.prototype.getTooltipsEnabled = function () {
        return this.chartOptions.seriesDefaults.tooltip != null && !!this.chartOptions.seriesDefaults.tooltip.enabled;
    };
    ScatterChartProxy.prototype.getDefaultOptions = function () {
        var isBubble = this.chartType === core_1.ChartType.Bubble;
        var options = this.getDefaultCartesianChartOptions();
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { fill: __assign(__assign({}, options.seriesDefaults.fill), { opacity: isBubble ? 0.7 : 1 }), stroke: __assign(__assign({}, options.seriesDefaults.stroke), { width: 3 }), marker: {
                enabled: true,
                size: isBubble ? 15 : 3,
                minSize: isBubble ? 3 : undefined,
                strokeWidth: 1,
            }, tooltip: {
                enabled: true,
            } });
        return options;
    };
    return ScatterChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.ScatterChartProxy = ScatterChartProxy;
