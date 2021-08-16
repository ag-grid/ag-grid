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
        this.getChartPaddingOption = function (property) { return _this.iChartOptions.padding ? "" + _this.iChartOptions.padding[property] : ''; };
        this.getShadowEnabled = function () { return !!_this.getShadowProperty('enabled'); };
        this.chartId = chartProxyParams.chartId;
        this.chartType = chartProxyParams.chartType;
        this.eventService = chartProxyParams.eventService;
        this.gridApi = chartProxyParams.gridApi;
        this.columnApi = chartProxyParams.columnApi;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
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
    ChartProxy.prototype.downloadChart = function () {
        var chart = this.chart;
        var fileName = chart.title ? chart.title.text : 'chart';
        chart.scene.download(fileName);
    };
    ChartProxy.prototype.getChartImageDataURL = function (type) {
        return this.chart.scene.getDataURL(type);
    };
    ChartProxy.prototype.initChartOptions = function () {
        // the theme object is used later to determine cartesian label rotation
        this.mergedThemeOverrides = this.getMergedThemeOverrides();
        // create the theme instance from the theme object
        this.chartTheme = ag_charts_community_1.getChartTheme(this.mergedThemeOverrides);
        // extract the iChartOptions from the theme instance - this is the backing model for integrated charts
        this.iChartOptions = this.extractIChartOptionsFromTheme(this.chartTheme);
        // allow users to override options before they are applied
        var _a = this.chartProxyParams, processChartOptions = _a.processChartOptions, allowProcessChartOptions = _a.allowProcessChartOptions;
        if (processChartOptions) {
            if (!allowProcessChartOptions && !this.chartProxyParams.restoringChart) {
                console.warn("AG Grid: since v26.0, 'processChartOptions()' has been removed (deprecated in v24.0), see https://www.ag-grid.com/javascript-grid/integrated-charts-customisation/");
                return;
            }
            var originalOptions = object_1.deepMerge({}, this.iChartOptions);
            var params = { type: this.chartType, options: this.iChartOptions };
            var overriddenOptions = processChartOptions(params);
            // ensure we have everything we need, in case the processing removed necessary options
            var safeOptions = this.getDefaultOptions();
            core_1._.mergeDeep(safeOptions, overriddenOptions, false);
            this.overridePalette(originalOptions, safeOptions);
            this.iChartOptions = safeOptions;
        }
    };
    ChartProxy.prototype.paletteOverridden = function (originalOptions, overriddenOptions) {
        return !core_1._.areEqual(originalOptions.seriesDefaults.fill.colors, overriddenOptions.seriesDefaults.fill.colors) ||
            !core_1._.areEqual(originalOptions.seriesDefaults.stroke.colors, overriddenOptions.seriesDefaults.stroke.colors);
    };
    ChartProxy.prototype.getMergedThemeOverrides = function () {
        var _this = this;
        var themeName = this.getSelectedTheme();
        var gridOptionsThemeOverrides = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        var apiThemeOverrides = this.chartProxyParams.apiChartThemeOverrides;
        var mergedThemeOverrides;
        if (gridOptionsThemeOverrides || apiThemeOverrides) {
            var themeOverrides_1 = {
                overrides: this.mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides)
            };
            var getCustomTheme = function () { return object_1.deepMerge(_this.lookupCustomChartTheme(themeName), themeOverrides_1); };
            mergedThemeOverrides = this.isStockTheme(themeName) ? __assign({ baseTheme: themeName }, themeOverrides_1) : getCustomTheme();
        }
        else {
            mergedThemeOverrides = this.isStockTheme(themeName) ? themeName : this.lookupCustomChartTheme(themeName);
        }
        return mergedThemeOverrides;
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
    ChartProxy.prototype.isStockTheme = function (themeName) {
        return core_1._.includes(Object.keys(ag_charts_community_1.themes), themeName);
    };
    ChartProxy.prototype.mergeThemeOverrides = function (gridOptionsThemeOverrides, apiThemeOverrides) {
        if (!gridOptionsThemeOverrides) {
            return apiThemeOverrides;
        }
        if (!apiThemeOverrides) {
            return gridOptionsThemeOverrides;
        }
        return object_1.deepMerge(gridOptionsThemeOverrides, apiThemeOverrides);
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
            if (invalidFills || invalidStrokes) {
                return;
            }
            // both fills and strokes will need to be overridden
            this.customPalette = {
                fills: fillsOverridden,
                strokes: strokesOverridden
            };
        }
    };
    ChartProxy.prototype.getStandaloneChartType = function () {
        switch (this.chartType) {
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
    // Merges theme defaults into default options. To be overridden in subclasses.
    ChartProxy.prototype.extractIChartOptionsFromTheme = function (theme) {
        var options = {};
        var standaloneChartType = this.getStandaloneChartType();
        options.title = theme.getConfig(standaloneChartType + '.title');
        options.subtitle = theme.getConfig(standaloneChartType + '.subtitle');
        options.background = theme.getConfig(standaloneChartType + '.background');
        options.legend = theme.getConfig(standaloneChartType + '.legend');
        options.navigator = theme.getConfig(standaloneChartType + '.navigator');
        options.tooltip = {
            enabled: theme.getConfig(standaloneChartType + '.tooltip.enabled'),
            tracking: theme.getConfig(standaloneChartType + '.tooltip.tracking'),
            class: theme.getConfig(standaloneChartType + '.tooltip.class'),
            delay: theme.getConfig(standaloneChartType + '.tooltip.delay')
        };
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
        return this.iChartOptions;
    };
    ChartProxy.prototype.getCustomPalette = function () {
        return this.customPalette;
    };
    ChartProxy.prototype.getChartOption = function (expression) {
        return core_1._.get(this.iChartOptions, expression, undefined);
    };
    ChartProxy.prototype.setChartOption = function (expression, value) {
        if (core_1._.get(this.iChartOptions, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        core_1._.set(this.iChartOptions, expression, value);
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
        return core_1._.get(this.iChartOptions.seriesDefaults, expression, undefined);
    };
    ChartProxy.prototype.setSeriesOption = function (expression, value) {
        if (core_1._.get(this.iChartOptions.seriesDefaults, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        core_1._.set(this.iChartOptions.seriesDefaults, expression, value);
        var mappings = {
            'stroke.width': 'strokeWidth',
            'stroke.opacity': 'strokeOpacity',
            'fill.opacity': 'fillOpacity',
            'callout.colors': 'calloutColors'
        };
        var series = this.chart.series;
        series.forEach(function (s) { return core_1._.set(s, mappings[expression] || expression, value); });
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.setTitleOption = function (property, value) {
        if (core_1._.get(this.iChartOptions.title, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        this.iChartOptions.title[property] = value;
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
        return this.iChartOptions.title[property];
    };
    ChartProxy.prototype.setChartPaddingOption = function (property, value) {
        var padding = this.iChartOptions.padding;
        if (core_1._.get(padding, property, undefined) === value) {
            // option is already set to the specified value
            return;
        }
        if (!padding) {
            padding = this.iChartOptions.padding = { top: 0, right: 0, bottom: 0, left: 0 };
            this.chart.padding = new ag_charts_community_1.Padding(0);
        }
        padding[property] = value;
        this.chart.padding[property] = value;
        this.chart.performLayout();
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getShadowProperty = function (property) {
        var seriesDefaults = this.iChartOptions.seriesDefaults;
        return seriesDefaults.shadow ? seriesDefaults.shadow[property] : '';
    };
    ChartProxy.prototype.setShadowProperty = function (property, value) {
        var seriesDefaults = this.iChartOptions.seriesDefaults;
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
            chartOptions: this.iChartOptions,
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
    // TODO move to standalone
    ChartProxy.prototype.hexToRGBA = function (hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return alpha ? "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")" : "rgba(" + r + ", " + g + ", " + b + ")";
    };
    // TODO move to standalone
    ChartProxy.prototype.changeOpacity = function (fills, alpha) {
        return fills.map(function (fill) {
            var c = core_1.Color.fromString(fill);
            return new core_1.Color(c.r, c.g, c.b, alpha).toHexString();
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