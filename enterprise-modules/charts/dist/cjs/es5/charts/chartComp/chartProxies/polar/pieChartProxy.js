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
var chartProxy_1 = require("../chartProxy");
var ag_charts_community_1 = require("ag-charts-community");
var color_1 = require("../../utils/color");
var object_1 = require("../../utils/object");
var PieChartProxy = /** @class */ (function (_super) {
    __extends(PieChartProxy, _super);
    function PieChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.recreateChart();
        return _this;
    }
    PieChartProxy.prototype.createChart = function () {
        return ag_charts_community_1.AgChart.create({
            type: 'pie',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    };
    PieChartProxy.prototype.update = function (params) {
        var data = params.data, category = params.category;
        var options = __assign(__assign({}, this.getCommonChartOptions()), { data: this.crossFiltering ? this.getCrossFilterData(params) : this.transformData(data, category.id), series: this.getSeries(params) });
        if (this.crossFiltering) {
            options = this.getCrossFilterChartOptions(options);
        }
        ag_charts_community_1.AgChart.update(this.chart, options);
    };
    PieChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var numFields = params.fields.length;
        var offset = {
            currentOffset: 0,
            offsetAmount: numFields > 1 ? 20 : 40
        };
        var series = this.getFields(params).map(function (f) {
            var seriesDefaults = _this.extractSeriesOverrides();
            // options shared by 'pie' and 'doughnut' charts
            var options = __assign(__assign({}, seriesDefaults), { type: _this.standaloneChartType, angleKey: f.colId, angleName: f.displayName, labelKey: params.category.id, labelName: params.category.name });
            if (_this.chartType === 'doughnut') {
                var _a = PieChartProxy.calculateOffsets(offset), outerRadiusOffset = _a.outerRadiusOffset, innerRadiusOffset = _a.innerRadiusOffset;
                // augment shared options with 'doughnut' specific options
                return __assign(__assign({}, options), { outerRadiusOffset: outerRadiusOffset,
                    innerRadiusOffset: innerRadiusOffset, title: __assign(__assign({}, seriesDefaults.title), { text: seriesDefaults.title.text || f.displayName, showInLegend: numFields > 1 }), callout: __assign(__assign({}, seriesDefaults.callout), { colors: _this.chartTheme.palette.strokes }) });
            }
            return options;
        });
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    };
    PieChartProxy.prototype.getCrossFilterChartOptions = function (options) {
        var _this = this;
        var seriesOverrides = this.extractSeriesOverrides();
        return __assign(__assign({}, options), { tooltip: __assign(__assign({}, seriesOverrides.tooltip), { delay: 500 }), legend: __assign(__assign({}, seriesOverrides.legend), { listeners: {
                    legendItemClick: function (e) {
                        _this.chart.series.forEach(function (s) { return s.toggleSeriesItem(e.itemId, e.enabled); });
                    }
                } }) });
    };
    PieChartProxy.prototype.getCrossFilterData = function (params) {
        var colId = params.fields[0].colId;
        var filteredOutColId = colId + "-filtered-out";
        return params.data.map(function (d) {
            var total = d[colId] + d[filteredOutColId];
            d[colId + "-total"] = total;
            d[filteredOutColId] = 1; // normalise to 1
            d[colId] = d[colId] / total; // fraction of 1
            return d;
        });
    };
    PieChartProxy.prototype.extractCrossFilterSeries = function (series) {
        var _this = this;
        var palette = this.chartTheme.palette;
        var seriesOverrides = this.extractSeriesOverrides();
        var primaryOptions = function (seriesOptions) {
            return __assign(__assign({}, seriesOptions), { label: { enabled: false }, highlightStyle: { item: { fill: undefined } }, radiusKey: seriesOptions.angleKey, angleKey: seriesOptions.angleKey + '-total', radiusMin: 0, radiusMax: 1, listeners: __assign(__assign({}, seriesOverrides.listeners), { nodeClick: _this.crossFilterCallback }), tooltip: __assign(__assign({}, seriesOverrides.tooltip), { renderer: _this.getCrossFilterTooltipRenderer("" + seriesOptions.angleName) }) });
        };
        var filteredOutOptions = function (seriesOptions, angleKey) {
            var _a, _b, _c;
            return __assign(__assign({}, object_1.deepMerge({}, primaryOpts)), { radiusKey: angleKey + '-filtered-out', label: seriesOverrides.label, callout: __assign(__assign({}, seriesOverrides.callout), { colors: (_a = seriesOverrides.callout.colors, (_a !== null && _a !== void 0 ? _a : palette.strokes)) }), fills: color_1.changeOpacity((_b = seriesOptions.fills, (_b !== null && _b !== void 0 ? _b : palette.fills)), 0.3), strokes: color_1.changeOpacity((_c = seriesOptions.strokes, (_c !== null && _c !== void 0 ? _c : palette.strokes)), 0.3), showInLegend: false });
        };
        // currently, only single 'doughnut' cross-filter series are supported
        var primarySeries = series[0];
        // update primary series
        var angleKey = primarySeries.angleKey;
        var primaryOpts = primaryOptions(primarySeries);
        return [
            filteredOutOptions(primarySeries, angleKey),
            primaryOpts,
        ];
    };
    PieChartProxy.calculateOffsets = function (offset) {
        var outerRadiusOffset = offset.currentOffset;
        offset.currentOffset -= offset.offsetAmount;
        var innerRadiusOffset = offset.currentOffset;
        offset.currentOffset -= offset.offsetAmount;
        return { outerRadiusOffset: outerRadiusOffset, innerRadiusOffset: innerRadiusOffset };
    };
    PieChartProxy.prototype.getFields = function (params) {
        return this.chartType === 'pie' ? params.fields.slice(0, 1) : params.fields;
    };
    PieChartProxy.prototype.getCrossFilterTooltipRenderer = function (title) {
        return function (params) {
            var label = params.datum[params.labelKey];
            var ratio = params.datum[params.radiusKey];
            var totalValue = params.angleValue;
            return { title: title, content: label + ": " + totalValue * ratio };
        };
    };
    PieChartProxy.prototype.extractSeriesOverrides = function () {
        return this.chartOptions[this.standaloneChartType].series;
    };
    PieChartProxy.prototype.crossFilteringReset = function () {
        // not required in pie charts
    };
    return PieChartProxy;
}(chartProxy_1.ChartProxy));
exports.PieChartProxy = PieChartProxy;
