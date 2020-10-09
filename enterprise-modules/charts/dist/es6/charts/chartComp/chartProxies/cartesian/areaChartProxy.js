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
import { ChartType } from "@ag-grid-community/core";
import { AgChart } from "ag-charts-community";
import { CartesianChartProxy } from "./cartesianChartProxy";
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
        var seriesDefaults = this.getSeriesDefaults();
        var marker = __assign({}, seriesDefaults.marker);
        if (marker.type) { // deprecated
            marker.shape = marker.type;
            delete marker.type;
        }
        options = options || this.chartOptions;
        var agChartOptions = options;
        var xAxisType = options.xAxis.type ? options.xAxis.type : 'category';
        if (grouping) {
            agChartOptions.type = 'groupedCategory';
        }
        agChartOptions.autoSize = true;
        agChartOptions.axes = [__assign({ type: grouping ? 'groupedCategory' : xAxisType, position: 'bottom', paddingInner: 1, paddingOuter: 0 }, this.getXAxisDefaults(xAxisType, options)), __assign({ type: 'number', position: 'left' }, options.yAxis)];
        agChartOptions.series = [__assign(__assign({}, seriesDefaults), { type: 'area', fills: seriesDefaults.fill.colors, fillOpacity: seriesDefaults.fill.opacity, strokes: seriesDefaults.stroke.colors, strokeOpacity: seriesDefaults.stroke.opacity, strokeWidth: seriesDefaults.stroke.width, tooltipRenderer: seriesDefaults.tooltip && seriesDefaults.tooltip.renderer, marker: marker })];
        return AgChart.create(agChartOptions, parentElement);
    };
    AreaChartProxy.prototype.update = function (params) {
        this.chartProxyParams.grouping = params.grouping;
        var axisType = this.isTimeAxis(params) ? 'time' : 'category';
        this.updateAxes(axisType);
        if (this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        }
        else {
            // stacked and normalized has a single series
            var areaSeries = this.chart.series[0];
            if (!areaSeries) {
                var seriesDefaults = this.getSeriesDefaults();
                var marker = __assign({}, seriesDefaults.marker);
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }
                areaSeries = AgChart.createComponent(__assign(__assign({}, seriesDefaults), { fills: seriesDefaults.fill.colors, fillOpacity: seriesDefaults.fill.opacity, strokes: seriesDefaults.stroke.colors, strokeOpacity: seriesDefaults.stroke.opacity, strokeWidth: seriesDefaults.stroke.width, marker: marker }), 'area.series');
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
        this.updateLabelRotation(params.category.id, false, axisType);
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
                var marker = __assign({}, seriesDefaults.marker);
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }
                var options = __assign(__assign({}, seriesDefaults), { data: data, xKey: params.category.id, xName: params.category.name, yKeys: [f.colId], yNames: [f.displayName], fills: [fill], strokes: [stroke], fillOpacity: seriesDefaults.fill.opacity, strokeOpacity: seriesDefaults.stroke.opacity, strokeWidth: seriesDefaults.stroke.width, marker: marker });
                areaSeries = AgChart.createComponent(options, 'area.series');
                chart.addSeriesAfter(areaSeries, previousSeries);
            }
            previousSeries = areaSeries;
        });
    };
    AreaChartProxy.prototype.getDefaultOptionsFromTheme = function (theme) {
        var options = _super.prototype.getDefaultOptionsFromTheme.call(this, theme);
        var seriesDefaults = theme.getConfig('area.series.area');
        options.seriesDefaults = {
            shadow: seriesDefaults.shadow,
            tooltip: {
                enabled: seriesDefaults.tooltipEnabled,
                renderer: seriesDefaults.tooltipRenderer
            },
            fill: {
                colors: theme.palette.fills,
                opacity: seriesDefaults.fillOpacity
            },
            stroke: {
                colors: theme.palette.strokes,
                opacity: seriesDefaults.strokeOpacity,
                width: seriesDefaults.strokeWidth
            },
            marker: {
                enabled: seriesDefaults.marker.enabled,
                shape: seriesDefaults.marker.shape,
                size: seriesDefaults.marker.size,
                strokeWidth: seriesDefaults.marker.strokeWidth
            },
            highlightStyle: seriesDefaults.highlightStyle
        };
        return options;
    };
    AreaChartProxy.prototype.getDefaultOptions = function () {
        var options = this.getDefaultCartesianChartOptions();
        options.xAxis.label.rotation = 335;
        options.seriesDefaults = __assign(__assign({}, options.seriesDefaults), { fill: __assign(__assign({}, options.seriesDefaults.fill), { opacity: this.chartType === ChartType.Area ? 0.7 : 1 }), stroke: __assign(__assign({}, options.seriesDefaults.stroke), { width: 3 }), marker: {
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
        return __assign(__assign({}, this.chartOptions.seriesDefaults), { type: 'area', normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined });
    };
    return AreaChartProxy;
}(CartesianChartProxy));
export { AreaChartProxy };
