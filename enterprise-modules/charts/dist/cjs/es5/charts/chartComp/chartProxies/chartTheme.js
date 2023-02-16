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
exports.lookupCustomChartTheme = exports.isStockTheme = exports.createAgChartTheme = void 0;
var core_1 = require("@ag-grid-community/core");
var ag_charts_community_1 = require("ag-charts-community");
var axisTypeMapper_1 = require("../utils/axisTypeMapper");
var seriesTypeMapper_1 = require("../utils/seriesTypeMapper");
function createAgChartTheme(chartProxyParams, proxy) {
    var _a;
    var chartOptionsToRestore = chartProxyParams.chartOptionsToRestore, chartPaletteToRestore = chartProxyParams.chartPaletteToRestore, chartThemeToRestore = chartProxyParams.chartThemeToRestore;
    var themeName = getSelectedTheme(chartProxyParams);
    var stockTheme = isStockTheme(themeName);
    var rootTheme = stockTheme
        ? { baseTheme: themeName }
        : (_a = lookupCustomChartTheme(chartProxyParams, themeName)) !== null && _a !== void 0 ? _a : {};
    var gridOptionsThemeOverrides = chartProxyParams.getGridOptionsChartThemeOverrides();
    var apiThemeOverrides = chartProxyParams.apiChartThemeOverrides;
    var standaloneChartType = seriesTypeMapper_1.getSeriesType(chartProxyParams.chartType);
    var crossFilterThemeOverridePoint = standaloneChartType === 'pie' ? 'polar' : 'cartesian';
    var crossFilteringOverrides = chartProxyParams.crossFiltering
        ? createCrossFilterThemeOverrides(proxy, chartProxyParams, crossFilterThemeOverridePoint)
        : undefined;
    var formattingPanelOverrides = __assign({}, (chartOptionsToRestore !== null && chartOptionsToRestore !== void 0 ? chartOptionsToRestore : {}));
    var isTitleEnabled = function () {
        var isTitleEnabled = function (obj) {
            if (!obj) {
                return false;
            }
            return Object.keys(obj).some(function (key) { return core_1._.get(obj[key], 'title.enabled', false); });
        };
        return isTitleEnabled(gridOptionsThemeOverrides) || isTitleEnabled(apiThemeOverrides);
    };
    // Overrides in ascending precedence ordering.
    var overrides = [
        stockTheme ? inbuiltStockThemeOverrides(chartProxyParams, isTitleEnabled()) : undefined,
        crossFilteringOverrides,
        gridOptionsThemeOverrides,
        apiThemeOverrides,
        formattingPanelOverrides,
    ];
    // Recursively nest theme overrides so they are applied with correct precedence in
    // Standalone Charts - this is an undocumented feature.
    // Outermost theme overrides will be the formatting panel configured values, so they are
    // differentiated from grid-config and inbuilt overrides.
    var theme = overrides
        .filter(function (v) { return !!v; })
        .reduce(function (r, n) { return ({
        baseTheme: r,
        overrides: n,
    }); }, rootTheme);
    // Avoid explicitly setting the `theme.palette` property unless we're using the restored theme
    // AND the palette is actually different.
    if (chartPaletteToRestore && themeName === chartThemeToRestore) {
        var rootThemePalette = ag_charts_community_1._Theme.getChartTheme(rootTheme).palette;
        if (!isIdenticalPalette(chartPaletteToRestore, rootThemePalette)) {
            theme.palette = chartPaletteToRestore;
        }
    }
    return theme;
}
exports.createAgChartTheme = createAgChartTheme;
function isIdenticalPalette(paletteA, paletteB) {
    var arrayCompare = function (arrA, arrB) {
        if (arrA.length !== arrB.length)
            return false;
        return arrA.every(function (v, i) { return v === arrB[i]; });
    };
    return arrayCompare(paletteA.fills, paletteB.fills) &&
        arrayCompare(paletteA.strokes, paletteB.strokes);
}
function isStockTheme(themeName) {
    return core_1._.includes(Object.keys(ag_charts_community_1._Theme.themes), themeName);
}
exports.isStockTheme = isStockTheme;
function createCrossFilterThemeOverrides(proxy, chartProxyParams, overrideType) {
    var _a;
    var legend = {
        listeners: {
            legendItemClick: function (e) {
                var chart = proxy.getChart();
                chart.series.forEach(function (s) {
                    s.toggleSeriesItem(e.itemId, e.enabled);
                    s.toggleSeriesItem(e.itemId + "-filtered-out", e.enabled);
                });
            },
        },
    };
    var series = {};
    if (overrideType === 'polar') {
        series.pie = {
            tooltip: {
                renderer: function (_a) {
                    var angleName = _a.angleName, datum = _a.datum, calloutLabelKey = _a.calloutLabelKey, radiusKey = _a.radiusKey, angleValue = _a.angleValue;
                    var title = angleName;
                    var label = datum[calloutLabelKey];
                    var ratio = datum[radiusKey];
                    var totalValue = angleValue;
                    return { title: title, content: label + ": " + totalValue * ratio };
                },
            },
        };
    }
    return _a = {},
        _a[overrideType] = {
            tooltip: {
                delay: 500,
            },
            legend: legend,
            listeners: {
                click: function (e) { return chartProxyParams.crossFilterCallback(e, true); },
            },
            series: series,
        },
        _a;
}
var STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES = axisTypeMapper_1.ALL_AXIS_TYPES.reduce(function (r, n) {
    var _a;
    return (__assign(__assign({}, r), (_a = {}, _a[n] = { title: { _enabledFromTheme: true } }, _a)));
}, {});
function inbuiltStockThemeOverrides(params, titleEnabled) {
    var extraPadding = params.getExtraPaddingDirections();
    return {
        common: {
            axes: STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES,
            padding: {
                // don't add extra padding when a title is present!
                top: !titleEnabled && extraPadding.includes('top') ? 40 : 20,
                right: extraPadding.includes('right') ? 30 : 20,
                bottom: extraPadding.includes('bottom') ? 40 : 20,
                left: extraPadding.includes('left') ? 30 : 20,
            },
        },
        pie: {
            series: {
                title: { _enabledFromTheme: true },
                calloutLabel: { _enabledFromTheme: true },
                sectorLabel: {
                    enabled: false,
                    _enabledFromTheme: true,
                },
            },
        },
    };
}
function getSelectedTheme(chartProxyParams) {
    var chartThemeName = chartProxyParams.getChartThemeName();
    var availableThemes = chartProxyParams.getChartThemes();
    if (!core_1._.includes(availableThemes, chartThemeName)) {
        chartThemeName = availableThemes[0];
    }
    return chartThemeName;
}
function lookupCustomChartTheme(chartProxyParams, name) {
    var customChartThemes = chartProxyParams.customChartThemes;
    var customChartTheme = customChartThemes && customChartThemes[name];
    if (!customChartTheme) {
        console.warn("AG Grid: no stock theme exists with the name '" + name + "' and no " +
            "custom chart theme with that name was supplied to 'customChartThemes'");
    }
    return customChartTheme;
}
exports.lookupCustomChartTheme = lookupCustomChartTheme;
