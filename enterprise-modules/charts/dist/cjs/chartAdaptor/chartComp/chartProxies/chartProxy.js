"use strict";
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
var object_1 = require("../object");
var ChartProxy = /** @class */ (function () {
    function ChartProxy(chartProxyParams) {
        var _this = this;
        this.chartProxyParams = chartProxyParams;
        this.isDarkTheme = function () { return _this.chartProxyParams.isDarkTheme(); };
        this.getFontColor = function () { return _this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'rgb(87, 87, 87)'; };
        this.getAxisGridColor = function () { return _this.isDarkTheme() ? 'rgb(100, 100, 100)' : 'rgb(219, 219, 219)'; };
        this.getBackgroundColor = function () { return _this.isDarkTheme() ? '#2d3436' : 'white'; };
        this.getChartPaddingOption = function (property) { return _this.chartOptions.padding ? "" + _this.chartOptions.padding[property] : ''; };
        this.getShadowEnabled = function () { return !!_this.getShadowProperty('enabled'); };
        this.chartId = chartProxyParams.chartId;
        this.chartType = chartProxyParams.chartType;
        this.eventService = chartProxyParams.eventService;
        this.gridApi = chartProxyParams.gridApi;
        this.columnApi = chartProxyParams.columnApi;
    }
    ChartProxy.prototype.recreateChart = function (options) {
        if (this.chart) {
            this.destroyChart();
        }
        this.chart = this.createChart(options);
    };
    ChartProxy.prototype.getChart = function () {
        return this.chart;
    };
    ChartProxy.prototype.downloadChart = function () {
        var chart = this.chart;
        var fileName = chart.title ? chart.title.text : 'chart';
        chart.scene.download(fileName);
    };
    ChartProxy.prototype.getChartImageDataURL = function (type) {
        return this.chart.scene.getDataURL(type);
    };
    ChartProxy.prototype.initChartOptions = function () {
        this.initChartTheme();
        this.chartOptions = this.getDefaultOptionsFromTheme(this.chartTheme);
        // allow users to override options before they are applied
        var processChartOptions = this.chartProxyParams.processChartOptions;
        if (processChartOptions) {
            var originalOptions = object_1.deepMerge({}, this.chartOptions);
            var params = { type: this.chartType, options: this.chartOptions };
            var overriddenOptions = processChartOptions(params);
            // ensure we have everything we need, in case the processing removed necessary options
            var safeOptions = this.getDefaultOptions();
            core_1._.mergeDeep(safeOptions, overriddenOptions, false);
            this.overridePalette(originalOptions, safeOptions);
            this.chartOptions = safeOptions;
        }
    };
    ChartProxy.prototype.paletteOverridden = function (originalOptions, overriddenOptions) {
        return !core_1._.areEqual(originalOptions.seriesDefaults.fill.colors, overriddenOptions.seriesDefaults.fill.colors) ||
            !core_1._.areEqual(originalOptions.seriesDefaults.stroke.colors, overriddenOptions.seriesDefaults.stroke.colors);
    };
    ChartProxy.prototype.initChartTheme = function () {
        var _this = this;
        var themeName = this.getSelectedTheme();
        var stockTheme = this.isStockTheme(themeName);
        var gridOptionsThemeOverrides = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        var apiThemeOverrides = this.chartProxyParams.apiChartThemeOverrides;
        if (gridOptionsThemeOverrides || apiThemeOverrides) {
            var themeOverrides_1 = {
                overrides: this.mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides)
            };
            var getCustomTheme = function () { return object_1.deepMerge(_this.lookupCustomChartTheme(themeName), themeOverrides_1); };
            var theme = stockTheme ? __assign({ baseTheme: themeName }, themeOverrides_1) : getCustomTheme();
            this.chartTheme = ag_charts_community_1.getChartTheme(theme);
        }
        else {
            this.chartTheme = ag_charts_community_1.getChartTheme(stockTheme ? themeName : this.lookupCustomChartTheme(themeName));
        }
    };
    ChartProxy.prototype.lookupCustomChartTheme = function (name) {
        var customChartThemes = this.chartProxyParams.customChartThemes;
        var customChartTheme = customChartThemes && customChartThemes[name];
        if (!customChartTheme) {
            console.warn("ag-Grid: no stock theme exists with the name '" + name + "' and no " +
                "custom chart theme with that name was supplied to 'customChartThemes'");
        }
        return customChartTheme;
    };
    ChartProxy.prototype.isStockTheme = function (themeName) {
        return core_1._.includes(Object.keys(ag_charts_community_1.themes), themeName);
    };
    ChartProxy.prototype.mergeThemeOverrides = function (gridOptionsThemeOverrides, apiThemeOverrides) {
        if (!gridOptionsThemeOverrides)
            return apiThemeOverrides;
        if (!apiThemeOverrides)
            return gridOptionsThemeOverrides;
        return object_1.deepMerge(gridOptionsThemeOverrides, apiThemeOverrides);
    };
    ChartProxy.prototype.integratedToStandaloneChartType = function (integratedChartType) {
        switch (integratedChartType) {
            case core_1.ChartType.GroupedBar:
            case core_1.ChartType.StackedBar:
            case core_1.ChartType.NormalizedBar:
                return 'bar';
            case core_1.ChartType.GroupedColumn:
            case core_1.ChartType.StackedColumn:
            case core_1.ChartType.NormalizedColumn:
                return 'column';
            case core_1.ChartType.Line:
                return 'line';
            case core_1.ChartType.Area:
            case core_1.ChartType.StackedArea:
            case core_1.ChartType.NormalizedArea:
                return 'area';
            case core_1.ChartType.Scatter:
            case core_1.ChartType.Bubble:
                return 'scatter';
            case core_1.ChartType.Histogram:
                return 'histogram';
            case core_1.ChartType.Pie:
            case core_1.ChartType.Doughnut:
                return 'pie';
            default:
                return 'cartesian';
        }
    };
    ChartProxy.prototype.overridePalette = function (originalOptions, chartOptions) {
        if (!this.chartProxyParams.allowPaletteOverride) {
            return;
        }
        if (!this.paletteOverridden(originalOptions, chartOptions)) {
            return;
        }
        var seriesDefaults = chartOptions.seriesDefaults;
        var fillsOverridden = seriesDefaults.fill.colors;
        var strokesOverridden = seriesDefaults.stroke.colors;
        if (fillsOverridden || strokesOverridden) {
            // due to series default refactoring it's possible for fills and strokes to have undefined values
            var invalidFills = core_1._.includes(fillsOverridden, undefined);
            var invalidStrokes = core_1._.includes(strokesOverridden, undefined);
            if (invalidFills || invalidStrokes)
                return;
            // both fills and strokes will need to be overridden
            this.customPalette = {
                fills: fillsOverridden,
                strokes: strokesOverridden
            };
        }
    };
    ChartProxy.prototype.getStandaloneChartType = function () {
        return this.integratedToStandaloneChartType(this.chartType);
    };
    // Merges theme defaults into default options. To be overridden in subclasses.
    ChartProxy.prototype.getDefaultOptionsFromTheme = function (theme) {
        var options = {};
        var standaloneChartType = this.getStandaloneChartType();
        options.title = theme.getConfig(standaloneChartType + '.title');
        options.subtitle = theme.getConfig(standaloneChartType + '.subtitle');
        options.background = theme.getConfig(standaloneChartType + '.background');
        options.legend = theme.getConfig(standaloneChartType + '.legend');
        options.navigator = theme.getConfig(standaloneChartType + '.navigator');
        options.tooltipClass = theme.getConfig(standaloneChartType + '.tooltipClass');
        options.tooltipTracking = theme.getConfig(standaloneChartType + '.tooltipTracking');
        options.listeners = theme.getConfig(standaloneChartType + '.listeners');
        options.padding = theme.getConfig(standaloneChartType + '.padding');
        return options;
    };
    ChartProxy.prototype.getSelectedTheme = function () {
        var chartThemeName = this.chartProxyParams.getChartThemeName();
        var availableThemes = this.chartProxyParams.getChartThemes();
        if (!core_1._.includes(availableThemes, chartThemeName)) {
            chartThemeName = availableThemes[0];
        }
        return chartThemeName;
    };
    ChartProxy.prototype.getChartOptions = function () {
        return this.chartOptions;
    };
    ChartProxy.prototype.getCustomPalette = function () {
        return this.customPalette;
    };
    ChartProxy.prototype.getChartOption = function (expression) {
        return core_1._.get(this.chartOptions, expression, undefined);
    };
    ChartProxy.prototype.setChartOption = function (expression, value) {
        if (core_1._.get(this.chartOptions, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        core_1._.set(this.chartOptions, expression, value);
        var mappings = {
            'legend.item.marker.strokeWidth': 'legend.strokeWidth',
            'legend.item.marker.size': 'legend.markerSize',
            'legend.item.marker.padding': 'legend.itemSpacing',
            'legend.item.label.fontFamily': 'legend.fontFamily',
            'legend.item.label.fontStyle': 'legend.fontStyle',
            'legend.item.label.fontWeight': 'legend.fontWeight',
            'legend.item.label.fontSize': 'legend.fontSize',
            'legend.item.label.color': 'legend.color',
            'legend.item.paddingX': 'legend.layoutHorizontalSpacing',
            'legend.item.paddingY': 'legend.layoutVerticalSpacing',
        };
        core_1._.set(this.chart, mappings[expression] || expression, value);
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getSeriesOption = function (expression) {
        return core_1._.get(this.chartOptions.seriesDefaults, expression, undefined);
    };
    ChartProxy.prototype.setSeriesOption = function (expression, value) {
        if (core_1._.get(this.chartOptions.seriesDefaults, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        core_1._.set(this.chartOptions.seriesDefaults, expression, value);
        var mappings = {
            'stroke.width': 'strokeWidth',
            'stroke.opacity': 'strokeOpacity',
            'fill.opacity': 'fillOpacity',
            'tooltip.enabled': 'tooltipEnabled',
            'callout.colors': 'calloutColors'
        };
        var series = this.chart.series;
        series.forEach(function (s) { return core_1._.set(s, mappings[expression] || expression, value); });
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.setTitleOption = function (property, value) {
        if (core_1._.get(this.chartOptions.title, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        this.chartOptions.title[property] = value;
        if (!this.chart.title) {
            this.chart.title = {};
        }
        this.chart.title[property] = value;
        if (property === 'text') {
            this.setTitleOption('enabled', core_1._.exists(value));
        }
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getTitleOption = function (property) {
        return this.chartOptions.title[property];
    };
    ChartProxy.prototype.setChartPaddingOption = function (property, value) {
        var padding = this.chartOptions.padding;
        if (core_1._.get(padding, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        if (!padding) {
            padding = this.chartOptions.padding = { top: 0, right: 0, bottom: 0, left: 0 };
            this.chart.padding = new ag_charts_community_1.Padding(0);
        }
        padding[property] = value;
        this.chart.padding[property] = value;
        this.chart.performLayout();
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getShadowProperty = function (property) {
        var seriesDefaults = this.chartOptions.seriesDefaults;
        return seriesDefaults.shadow ? seriesDefaults.shadow[property] : '';
    };
    ChartProxy.prototype.setShadowProperty = function (property, value) {
        var seriesDefaults = this.chartOptions.seriesDefaults;
        if (core_1._.get(seriesDefaults.shadow, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        if (!seriesDefaults.shadow) {
            seriesDefaults.shadow = {
                enabled: false,
                blur: 0,
                xOffset: 0,
                yOffset: 0,
                color: 'rgba(0,0,0,0.5)'
            };
        }
        seriesDefaults.shadow[property] = value;
        var series = this.getChart().series;
        series.forEach(function (s) {
            if (!s.shadow) {
                var shadow = new ag_charts_community_1.DropShadow();
                shadow.enabled = false;
                shadow.blur = 0;
                shadow.xOffset = 0;
                shadow.yOffset = 0;
                shadow.color = 'rgba(0,0,0,0.5)';
                s.shadow = shadow;
            }
            s.shadow[property] = value;
        });
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.raiseChartOptionsChangedEvent = function () {
        var event = Object.freeze({
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: this.chartId,
            chartType: this.chartType,
            chartThemeName: this.chartProxyParams.getChartThemeName(),
            chartOptions: this.chartOptions,
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    };
    ChartProxy.prototype.getDefaultFontOptions = function () {
        return {
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: 12,
            fontFamily: 'Verdana, sans-serif',
            color: this.getFontColor()
        };
    };
    ChartProxy.prototype.getDefaultDropShadowOptions = function () {
        return {
            enabled: false,
            blur: 5,
            xOffset: 3,
            yOffset: 3,
            color: 'rgba(0, 0, 0, 0.5)',
        };
    };
    ChartProxy.prototype.getPredefinedPalette = function () {
        return this.chartTheme.palette;
    };
    ChartProxy.prototype.getPalette = function () {
        return this.customPalette || this.chartTheme.palette;
    };
    //TODO remove all 'integrated' default chart options
    ChartProxy.prototype.getDefaultChartOptions = function () {
        return {
            background: {},
            padding: {},
            title: {},
            subtitle: {},
            legend: {},
            navigator: {},
            seriesDefaults: {},
            listeners: {}
        };
    };
    ChartProxy.prototype.transformData = function (data, categoryKey) {
        if (this.chart.axes.filter(function (a) { return a instanceof ag_charts_community_1.CategoryAxis; }).length < 1) {
            return data;
        }
        // replace the values for the selected category with a complex object to allow for duplicated categories
        return data.map(function (d, index) {
            var value = d[categoryKey];
            var valueString = value && value.toString ? value.toString() : '';
            var datum = __assign({}, d);
            datum[categoryKey] = { id: index, value: value, toString: function () { return valueString; } };
            return datum;
        });
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
exports.ChartProxy = ChartProxy;
//# sourceMappingURL=chartProxy.js.map