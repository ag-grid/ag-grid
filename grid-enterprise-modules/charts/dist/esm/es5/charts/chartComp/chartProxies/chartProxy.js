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
import { _Theme, AgChart } from "ag-charts-community";
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
    ChartProxy.prototype.getCommonChartOptions = function (updatedOverrides) {
        var _a, _b;
        // Only apply active overrides if chart is initialised.
        var existingOptions = this.clearThemeOverrides ? {} : (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.getOptions()) !== null && _b !== void 0 ? _b : {};
        var formattingPanelOverrides = this.chart != null ?
            { overrides: this.getActiveFormattingPanelOverrides() } : {};
        this.clearThemeOverrides = false;
        return __assign(__assign({}, existingOptions), { theme: __assign(__assign({}, createAgChartTheme(this.chartProxyParams, this)), (updatedOverrides ? { overrides: updatedOverrides } : formattingPanelOverrides)), container: this.chartProxyParams.parentElement, mode: 'integrated' });
    };
    ChartProxy.prototype.getActiveFormattingPanelOverrides = function () {
        var _a, _b;
        if (this.clearThemeOverrides) {
            return {};
        }
        var inUseTheme = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.getOptions().theme;
        return (_b = inUseTheme === null || inUseTheme === void 0 ? void 0 : inUseTheme.overrides) !== null && _b !== void 0 ? _b : {};
    };
    ChartProxy.prototype.destroy = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.keepChartInstance, keepChartInstance = _c === void 0 ? false : _c;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLENBQUMsRUFBZ0UsTUFBTSx5QkFBeUIsQ0FBQztBQUMxRyxPQUFPLEVBQ0gsTUFBTSxFQUNOLE9BQU8sRUFNVixNQUFNLHFCQUFxQixDQUFDO0FBRTdCLE9BQU8sRUFBbUIsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDM0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQTRDMUU7SUFVSSxvQkFBeUMsZ0JBQWtDO1FBQWxDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFGakUsd0JBQW1CLEdBQUcsS0FBSyxDQUFDO1FBR2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsYUFBYyxDQUFDO1FBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxDQUFDO1FBQ3RELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQztRQUNoRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV6RCxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1NBQzdEO2FBQU07WUFDSCxtREFBbUQ7WUFDbkQsSUFB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