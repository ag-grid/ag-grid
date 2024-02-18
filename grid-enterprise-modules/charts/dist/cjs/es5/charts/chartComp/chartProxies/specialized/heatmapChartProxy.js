"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.HeatmapChartProxy = exports.HEATMAP_VALUE_KEY = exports.HEATMAP_SERIES_KEY = exports.HEATMAP_CATEGORY_KEY = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var chartProxy_1 = require("../chartProxy");
var array_1 = require("../../utils/array");
exports.HEATMAP_CATEGORY_KEY = 'AG-GRID-DEFAULT-HEATMAP-CATEGORY-KEY';
exports.HEATMAP_SERIES_KEY = 'AG-GRID-DEFAULT-HEATMAP-SERIES-KEY';
exports.HEATMAP_VALUE_KEY = 'AG-GRID-DEFAULT-HEATMAP-VALUE-KEY';
var HeatmapChartProxy = /** @class */ (function (_super) {
    __extends(HeatmapChartProxy, _super);
    function HeatmapChartProxy(params) {
        return _super.call(this, params) || this;
    }
    HeatmapChartProxy.prototype.update = function (params) {
        var xSeriesKey = exports.HEATMAP_SERIES_KEY;
        var xValueKey = exports.HEATMAP_VALUE_KEY;
        var yKey = exports.HEATMAP_CATEGORY_KEY;
        var options = __assign(__assign({}, this.getCommonChartOptions(params.updatedOverrides)), { series: this.getSeries(params, xSeriesKey, xValueKey, yKey), data: this.getData(params, xSeriesKey, xValueKey, yKey) });
        ag_charts_community_1.AgCharts.update(this.getChartRef(), options);
    };
    HeatmapChartProxy.prototype.getSeries = function (params, xSeriesKey, xValueKey, yKey) {
        var _a = __read(params.categories, 1), category = _a[0];
        return [
            {
                type: this.standaloneChartType,
                // The axis keys reference synthetic fields based on the category values and series column names
                yKey: yKey,
                xKey: xSeriesKey,
                // The color key references a synthetic field based on the series column value for a specific cell
                colorKey: xValueKey,
                yName: category.name,
                // We don't know how to label the 'x' series, as it is a synthetic series created from the set of all input columns
                // In future releases we may want to consider inferring the series label from column groupings etc
                xName: undefined,
                colorName: undefined,
            },
        ];
    };
    HeatmapChartProxy.prototype.getData = function (params, xSeriesKey, xValueKey, yKey) {
        var _a = __read(params.categories, 1), category = _a[0];
        // Heatmap chart expects a flat array of data, with each row representing a single cell in the heatmap
        // This means we need to explode the list of input rows into their individual cells
        return (0, array_1.flatMap)(params.data, function (datum, index) {
            // We need to create a unique y value object for each row to prevent unintended category grouping
            // when there are multiple rows with the same category value
            var value = datum[category.id];
            var valueString = value == null ? '' : String(value);
            var yValue = { id: index, value: value, toString: function () { return valueString; } };
            // Return a flat list of output data items corresponding to each cell,
            // appending the synthetic series and category fields to the cell data
            return params.fields.map(function (_a) {
                var _b;
                var colId = _a.colId, displayName = _a.displayName;
                return (__assign(__assign({}, datum), (_b = {}, _b[xSeriesKey] = displayName, _b[xValueKey] = datum[colId], _b[yKey] = yValue, _b)));
            });
        });
    };
    HeatmapChartProxy.prototype.getChartThemeDefaults = function () {
        return {
            heatmap: {
                gradientLegend: {
                    gradient: {
                        preferredLength: 200,
                    },
                },
                series: {
                    tooltip: {
                        renderer: renderHeatmapTooltip,
                    },
                },
            },
        };
    };
    HeatmapChartProxy.prototype.transformData = function (data, categoryKey, categoryAxis) {
        // Ignore the base implementation as it assumes only a single category axis
        // (this method is never actually invoked)
        return data;
    };
    HeatmapChartProxy.prototype.crossFilteringReset = function () {
        // cross filtering is not currently supported in heatmap charts
    };
    return HeatmapChartProxy;
}(chartProxy_1.ChartProxy));
exports.HeatmapChartProxy = HeatmapChartProxy;
function renderHeatmapTooltip(params) {
    var xKey = params.xKey, yKey = params.yKey, colorKey = params.colorKey, yName = params.yName, seriesId = params.seriesId, datum = params.datum;
    var item = datum[seriesId];
    var table = [
        { label: yName, value: item[yKey] },
        { label: item[xKey], value: colorKey && item[colorKey] },
    ];
    var html = table
        .map(function (_a) {
        var label = _a.label, value = _a.value;
        return "<b>".concat(sanitizeHtml(String(label)), ":</b> ").concat(sanitizeHtml(String(value)));
    })
        .join('<br>');
    return {
        title: '',
        content: html,
    };
}
function sanitizeHtml(input) {
    var ESCAPED_CHARS = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
    };
    var characterClass = "[".concat(Object.keys(ESCAPED_CHARS).join(''), "]");
    var pattern = new RegExp(characterClass, 'g');
    return input.replace(pattern, function (char) { return ESCAPED_CHARS[char]; });
}
