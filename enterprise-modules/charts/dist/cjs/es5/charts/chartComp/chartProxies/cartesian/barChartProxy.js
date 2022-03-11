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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
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
    BarChartProxy.prototype.createChart = function () {
        var _a = __read([this.standaloneChartType === 'bar', this.isNormalised()], 2), isBar = _a[0], isNormalised = _a[1];
        return ag_charts_community_1.AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(isBar, isNormalised),
            series: this.getSeries(isNormalised),
        });
    };
    BarChartProxy.prototype.update = function (params) {
        this.updateAxes(params);
        var barSeries = this.chart.series[0];
        if (this.crossFiltering) {
            this.updateCrossFilteringSeries(barSeries, params);
        }
        else {
            barSeries.fills = this.chartTheme.palette.fills;
            barSeries.strokes = this.chartTheme.palette.strokes;
        }
        barSeries.data = this.transformData(params.data, params.category.id);
        barSeries.xKey = params.category.id;
        barSeries.xName = params.category.name;
        barSeries.yKeys = params.fields.map(function (f) { return f.colId; });
        barSeries.yNames = params.fields.map(function (f) { return f.displayName; });
        this.updateLabelRotation(params.category.id);
    };
    BarChartProxy.prototype.updateCrossFilteringSeries = function (barSeries, params) {
        // add additional filtered out field
        var fields = params.fields;
        fields.forEach(function (field) {
            var crossFilteringField = __assign({}, field);
            crossFilteringField.colId = field.colId + '-filtered-out';
            fields.push(crossFilteringField);
        });
        var palette = this.chartTheme.palette;
        // introduce cross filtering transparent fills
        var fills = [];
        palette.fills.forEach(function (fill) {
            fills.push(fill);
            fills.push(color_1.hexToRGBA(fill, '0.3'));
        });
        barSeries.fills = fills;
        // introduce cross filtering transparent strokes
        var strokes = [];
        palette.strokes.forEach(function (stroke) {
            fills.push(stroke);
            fills.push(color_1.hexToRGBA(stroke, '0.3'));
        });
        barSeries.strokes = strokes;
        // disable series highlighting by default
        barSeries.highlightStyle.fill = undefined;
        // hide 'filtered out' legend items
        var colIds = params.fields.map(function (f) { return f.colId; });
        barSeries.hideInLegend = colIds.filter(function (colId) { return colId.indexOf('-filtered-out') !== -1; });
        // sync toggling of legend item with hidden 'filtered out' item
        this.chart.legend.addEventListener('click', function (event) {
            barSeries.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
        });
        this.chart.tooltip.delay = 500;
        // add node click cross filtering callback to series
        barSeries.addEventListener('nodeClick', this.crossFilterCallback);
    };
    BarChartProxy.prototype.getAxes = function (isBar, normalised) {
        var axisOptions = this.getAxesOptions();
        var axes = [
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: isBar ? ag_charts_community_1.ChartAxisPosition.Left : ag_charts_community_1.ChartAxisPosition.Bottom }),
            __assign(__assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: isBar ? ag_charts_community_1.ChartAxisPosition.Bottom : ag_charts_community_1.ChartAxisPosition.Left }),
        ];
        // special handling to add a default label formatter to show '%' for normalized charts if none is provided
        if (normalised) {
            var numberAxis = axes[1];
            numberAxis.label = __assign(__assign({}, numberAxis.label), { formatter: function (params) { return Math.round(params.value) + '%'; } });
        }
        return axes;
    };
    BarChartProxy.prototype.getSeries = function (normalised) {
        var groupedCharts = ['groupedColumn', 'groupedBar'];
        var isGrouped = !this.crossFiltering && core_1._.includes(groupedCharts, this.chartType);
        return [__assign(__assign({}, this.chartOptions[this.standaloneChartType].series), { type: this.standaloneChartType, grouped: isGrouped, normalizedTo: normalised ? 100 : undefined })];
    };
    BarChartProxy.prototype.isNormalised = function () {
        var normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && core_1._.includes(normalisedCharts, this.chartType);
    };
    return BarChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.BarChartProxy = BarChartProxy;
//# sourceMappingURL=barChartProxy.js.map