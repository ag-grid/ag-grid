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
import { AgChart, getIntegratedChartTheme, themes } from "ag-charts-community";
import { deepMerge } from "../utils/object";
import { getSeriesType } from "../utils/seriesTypeMapper";
var ChartProxy = /** @class */ (function () {
    function ChartProxy(chartProxyParams) {
        this.chartProxyParams = chartProxyParams;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getSeriesType(this.chartType);
        if (this.chartProxyParams.chartOptionsToRestore) {
            this.chartOptions = this.chartProxyParams.chartOptionsToRestore;
            this.chartPalette = this.chartProxyParams.chartPaletteToRestore;
            var themeOverrides = { overrides: this.chartOptions, palette: this.chartPalette };
            this.chartTheme = getIntegratedChartTheme(__assign({ baseTheme: this.getSelectedTheme() }, themeOverrides));
            return;
        }
        this.chartTheme = this.createChartTheme();
        this.chartOptions = this.convertConfigToOverrides(this.chartTheme.config);
        this.chartPalette = this.chartTheme.palette;
    }
    ChartProxy.prototype.recreateChart = function () {
        var _this = this;
        if (this.chart) {
            this.destroyChart();
        }
        this.chart = this.createChart();
        if (this.crossFiltering) {
            // add event listener to chart canvas to detect when user wishes to reset filters
            var resetFilters_1 = true;
            this.chart.addEventListener('click', function (e) { return _this.crossFilterCallback(e, resetFilters_1); });
        }
    };
    ChartProxy.prototype.getChart = function () {
        return this.chart;
    };
    ChartProxy.prototype.createChartTheme = function () {
        var _this = this;
        var themeName = this.getSelectedTheme();
        var stockTheme = this.isStockTheme(themeName);
        var gridOptionsThemeOverrides = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        var apiThemeOverrides = this.chartProxyParams.apiChartThemeOverrides;
        if (gridOptionsThemeOverrides || apiThemeOverrides) {
            var themeOverrides_1 = {
                overrides: ChartProxy.mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides)
            };
            var getCustomTheme = function () { return deepMerge(_this.lookupCustomChartTheme(themeName), themeOverrides_1); };
            return getIntegratedChartTheme(stockTheme ? __assign({ baseTheme: themeName }, themeOverrides_1) : getCustomTheme());
        }
        return getIntegratedChartTheme(stockTheme ? themeName : this.lookupCustomChartTheme(themeName));
    };
    ChartProxy.prototype.isStockTheme = function (themeName) {
        return _.includes(Object.keys(themes), themeName);
    };
    ChartProxy.prototype.getSelectedTheme = function () {
        var chartThemeName = this.chartProxyParams.getChartThemeName();
        var availableThemes = this.chartProxyParams.getChartThemes();
        if (!_.includes(availableThemes, chartThemeName)) {
            chartThemeName = availableThemes[0];
        }
        return chartThemeName;
    };
    ChartProxy.prototype.lookupCustomChartTheme = function (name) {
        var customChartThemes = this.chartProxyParams.customChartThemes;
        var customChartTheme = customChartThemes && customChartThemes[name];
        if (!customChartTheme) {
            console.warn("AG Grid: no stock theme exists with the name '" + name + "' and no " +
                "custom chart theme with that name was supplied to 'customChartThemes'");
        }
        return customChartTheme;
    };
    ChartProxy.mergeThemeOverrides = function (gridOptionsThemeOverrides, apiThemeOverrides) {
        if (!gridOptionsThemeOverrides) {
            return apiThemeOverrides;
        }
        if (!apiThemeOverrides) {
            return gridOptionsThemeOverrides;
        }
        return deepMerge(gridOptionsThemeOverrides, apiThemeOverrides);
    };
    ChartProxy.prototype.downloadChart = function (dimensions, fileName, fileFormat) {
        var chart = this.chart;
        var imageFileName = fileName || (chart.title ? chart.title.text : 'chart');
        var _a = dimensions || {}, width = _a.width, height = _a.height;
        AgChart.download(chart, { width: width, height: height, fileName: imageFileName, fileFormat: fileFormat });
    };
    ChartProxy.prototype.getChartImageDataURL = function (type) {
        return this.chart.scene.getDataURL(type);
    };
    ChartProxy.prototype.getChartOptions = function () {
        return this.chartOptions;
    };
    ChartProxy.prototype.getChartPalette = function () {
        return this.chartPalette;
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
        var _this = this;
        var getChartOption = function (propertyKey) {
            return _.get(_this.chartOptions, _this.standaloneChartType + "." + propertyKey, undefined);
        };
        return {
            padding: getChartOption('padding'),
            background: getChartOption('background'),
            title: getChartOption('title'),
            subtitle: getChartOption('subtitle'),
            tooltip: getChartOption('tooltip'),
            legend: getChartOption('legend'),
            navigator: getChartOption('navigator'),
        };
    };
    ChartProxy.prototype.convertConfigToOverrides = function (config) {
        var isComboChart = ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(this.chartType);
        var overrideObjs = isComboChart ? ['line', 'area', 'column', 'cartesian'] : [this.standaloneChartType];
        var overrides = {};
        overrideObjs.forEach(function (overrideObj) {
            var chartOverrides = deepMerge({}, config[overrideObj]);
            chartOverrides.series = chartOverrides.series[overrideObj];
            // special handing to add the scatter paired mode to the chart options
            if (overrideObj === 'scatter') {
                chartOverrides.paired = true;
            }
            overrides[overrideObj] = chartOverrides;
        });
        return overrides;
    };
    ChartProxy.prototype.destroy = function () {
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
