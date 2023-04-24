"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.PieChartProxy = void 0;
var chartProxy_1 = require("../chartProxy");
var ag_charts_community_1 = require("ag-charts-community");
var color_1 = require("../../utils/color");
var object_1 = require("../../utils/object");
var PieChartProxy = /** @class */ (function (_super) {
    __extends(PieChartProxy, _super);
    function PieChartProxy(params) {
        return _super.call(this, params) || this;
    }
    PieChartProxy.prototype.update = function (params) {
        var data = params.data, category = params.category;
        var options = __assign(__assign({}, this.getCommonChartOptions()), { data: this.crossFiltering ? this.getCrossFilterData(params) : this.transformData(data, category.id), series: this.getSeries(params) });
        ag_charts_community_1.AgChart.update(this.getChartRef(), options);
    };
    PieChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var numFields = params.fields.length;
        var offset = {
            currentOffset: 0,
            offsetAmount: numFields > 1 ? 20 : 40
        };
        var series = this.getFields(params).map(function (f) {
            var _a;
            // options shared by 'pie' and 'doughnut' charts
            var options = {
                type: _this.standaloneChartType,
                angleKey: f.colId,
                angleName: f.displayName,
                sectorLabelKey: f.colId,
                calloutLabelKey: params.category.id,
                calloutLabelName: params.category.name,
            };
            if (_this.chartType === 'doughnut') {
                var _b = PieChartProxy.calculateOffsets(offset), outerRadiusOffset = _b.outerRadiusOffset, innerRadiusOffset = _b.innerRadiusOffset;
                var title = f.displayName ? {
                    title: { text: f.displayName, showInLegend: numFields > 1 },
                } : undefined;
                // augment shared options with 'doughnut' specific options
                return __assign(__assign(__assign(__assign({}, options), { outerRadiusOffset: outerRadiusOffset,
                    innerRadiusOffset: innerRadiusOffset }), title), { calloutLine: {
                        colors: (_a = _this.getChartPalette()) === null || _a === void 0 ? void 0 : _a.strokes,
                    } });
            }
            return options;
        });
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
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
        var palette = this.getChartPalette();
        var primaryOptions = function (seriesOptions) {
            return __assign(__assign({}, seriesOptions), { calloutLabel: { enabled: false }, highlightStyle: { item: { fill: undefined } }, radiusKey: seriesOptions.angleKey, angleKey: seriesOptions.angleKey + '-total', radiusMin: 0, radiusMax: 1, listeners: {
                    nodeClick: _this.crossFilterCallback,
                } });
        };
        var filteredOutOptions = function (seriesOptions, angleKey) {
            var _a, _b;
            return __assign(__assign({}, object_1.deepMerge({}, primaryOpts)), { radiusKey: angleKey + '-filtered-out', fills: color_1.changeOpacity((_a = seriesOptions.fills) !== null && _a !== void 0 ? _a : palette.fills, 0.3), strokes: color_1.changeOpacity((_b = seriesOptions.strokes) !== null && _b !== void 0 ? _b : palette.strokes, 0.3), showInLegend: false });
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
    PieChartProxy.prototype.crossFilteringReset = function () {
        // not required in pie charts
    };
    return PieChartProxy;
}(chartProxy_1.ChartProxy));
exports.PieChartProxy = PieChartProxy;
