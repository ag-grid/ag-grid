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
import { _ } from "@ag-grid-community/core";
import { AgChart, _Theme } from "ag-charts-community";
import { getSeriesType } from "../utils/seriesTypeMapper";
import { deproxy } from "../utils/integration";
import { createAgChartTheme, lookupCustomChartTheme } from './chartTheme';
var ChartProxy = /** @class */ (function () {
    function ChartProxy(chartProxyParams) {
        this.chartProxyParams = chartProxyParams;
        this.clearThemeOverrides = false;
        this.chart = chartProxyParams.chartInstance;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getSeriesType(this.chartType);
        if (this.chart == null) {
            this.chart = AgChart.create(this.getCommonChartOptions());
        }
        else {
            // On chart change, reset formatting panel changes.
            this.clearThemeOverrides = true;
        }
    }
    ChartProxy.prototype.getChart = function () {
        return deproxy(this.chart);
    };
    ChartProxy.prototype.getChartRef = function () {
        return this.chart;
    };
    ChartProxy.prototype.downloadChart = function (dimensions, fileName, fileFormat) {
        var chart = this.chart;
        var rawChart = deproxy(chart);
        var imageFileName = fileName || (rawChart.title ? rawChart.title.text : 'chart');
        var _a = dimensions || {}, width = _a.width, height = _a.height;
        AgChart.download(chart, { width: width, height: height, fileName: imageFileName, fileFormat: fileFormat });
    };
    ChartProxy.prototype.getChartImageDataURL = function (type) {
        return this.getChart().scene.getDataURL(type);
    };
    ChartProxy.prototype.getChartOptions = function () {
        return this.chart.getOptions();
    };
    ChartProxy.prototype.getChartThemeOverrides = function () {
        var _a;
        var chartOptionsTheme = this.getChartOptions().theme;
        return (_a = chartOptionsTheme.overrides) !== null && _a !== void 0 ? _a : {};
    };
    ChartProxy.prototype.getChartPalette = function () {
        return _Theme.getChartTheme(this.getChartOptions().theme).palette;
    };
    ChartProxy.prototype.setPaired = function (paired) {
        var _a;
        // Special handling to make scatter charts operate in paired mode by default, where 
        // columns alternate between being X and Y (and size for bubble). In standard mode,
        // the first column is used for X and every other column is treated as Y
        // (or alternates between Y and size for bubble)
        var seriesType = getSeriesType(this.chartProxyParams.chartType);
        AgChart.updateDelta(this.chart, { theme: { overrides: (_a = {}, _a[seriesType] = { paired: paired }, _a) } });
    };
    ChartProxy.prototype.isPaired = function () {
        var seriesType = getSeriesType(this.chartProxyParams.chartType);
        return _.get(this.getChartThemeOverrides(), seriesType + ".paired", true);
    };
    ChartProxy.prototype.lookupCustomChartTheme = function (themeName) {
        return lookupCustomChartTheme(this.chartProxyParams, themeName);
    };
    ChartProxy.prototype.transformData = function (data, categoryKey, categoryAxis) {
        if (categoryAxis) {
            // replace the values for the selected category with a complex object to allow for duplicated categories
            return data.map(function (d, index) {
                var value = d[categoryKey];
                var valueString = value && value.toString ? value.toString() : '';
                var datum = __assign({}, d);
                datum[categoryKey] = { id: index, value: value, toString: function () { return valueString; } };
                return datum;
            });
        }
        return data;
    };
    ChartProxy.prototype.getCommonChartOptions = function () {
        var _a, _b;
        // Only apply active overrides if chart is initialised.
        var existingOptions = this.clearThemeOverrides ? {} : (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.getOptions()) !== null && _b !== void 0 ? _b : {};
        var formattingPanelOverrides = this.chart != null ?
            { overrides: this.getActiveFormattingPanelOverrides() } : {};
        this.clearThemeOverrides = false;
        return __assign(__assign({}, existingOptions), { theme: __assign(__assign({}, createAgChartTheme(this.chartProxyParams, this)), formattingPanelOverrides), container: this.chartProxyParams.parentElement, mode: 'integrated' });
    };
    ChartProxy.prototype.getActiveFormattingPanelOverrides = function () {
        var _a, _b;
        if (this.clearThemeOverrides) {
            return {};
        }
        var inUseTheme = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.getOptions().theme;
        var overrides = (_b = inUseTheme === null || inUseTheme === void 0 ? void 0 : inUseTheme.overrides) !== null && _b !== void 0 ? _b : {};
        return overrides;
    };
    ChartProxy.prototype.destroy = function (_a) {
        var _b = (_a === void 0 ? {} : _a).keepChartInstance, keepChartInstance = _b === void 0 ? false : _b;
        if (keepChartInstance) {
            return this.chart;
        }
        this.destroyChart();
    };
    ChartProxy.prototype.destroyChart = function () {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
    };
    return ChartProxy;
}());
export { ChartProxy };
