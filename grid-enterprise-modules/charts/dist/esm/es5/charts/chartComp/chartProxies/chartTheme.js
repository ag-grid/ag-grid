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
import { _ } from '@ag-grid-community/core';
import { _Theme, } from 'ag-charts-community';
import { ALL_AXIS_TYPES } from '../utils/axisTypeMapper';
import { getSeriesType } from '../utils/seriesTypeMapper';
export function createAgChartTheme(chartProxyParams, proxy) {
    var _a;
    var chartOptionsToRestore = chartProxyParams.chartOptionsToRestore, chartPaletteToRestore = chartProxyParams.chartPaletteToRestore, chartThemeToRestore = chartProxyParams.chartThemeToRestore;
    var themeName = getSelectedTheme(chartProxyParams);
    var stockTheme = isStockTheme(themeName);
    var rootTheme = stockTheme
        ? { baseTheme: themeName }
        : (_a = lookupCustomChartTheme(chartProxyParams, themeName)) !== null && _a !== void 0 ? _a : {};
    var gridOptionsThemeOverrides = chartProxyParams.getGridOptionsChartThemeOverrides();
    var apiThemeOverrides = chartProxyParams.apiChartThemeOverrides;
    var standaloneChartType = getSeriesType(chartProxyParams.chartType);
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
            return Object.keys(obj).some(function (key) { return _.get(obj[key], 'title.enabled', false); });
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
        var rootThemePalette = _Theme.getChartTheme(rootTheme).palette;
        if (!isIdenticalPalette(chartPaletteToRestore, rootThemePalette)) {
            theme.palette = chartPaletteToRestore;
        }
    }
    return theme;
}
function isIdenticalPalette(paletteA, paletteB) {
    var arrayCompare = function (arrA, arrB) {
        if (arrA.length !== arrB.length)
            return false;
        return arrA.every(function (v, i) { return v === arrB[i]; });
    };
    return arrayCompare(paletteA.fills, paletteB.fills) &&
        arrayCompare(paletteA.strokes, paletteB.strokes);
}
export function isStockTheme(themeName) {
    return _.includes(Object.keys(_Theme.themes), themeName);
}
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
var STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES = ALL_AXIS_TYPES.reduce(function (r, n) {
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
    if (!_.includes(availableThemes, chartThemeName)) {
        chartThemeName = availableThemes[0];
    }
    return chartThemeName;
}
export function lookupCustomChartTheme(chartProxyParams, name) {
    var customChartThemes = chartProxyParams.customChartThemes;
    var customChartTheme = customChartThemes && customChartThemes[name];
    if (!customChartTheme) {
        console.warn("AG Grid: no stock theme exists with the name '" + name + "' and no " +
            "custom chart theme with that name was supplied to 'customChartThemes'");
    }
    return customChartTheme;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRUaGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jaGFydFRoZW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzVDLE9BQU8sRUFDSCxNQUFNLEdBUVQsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDekQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRzFELE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxnQkFBa0MsRUFBRSxLQUFpQjs7SUFDNUUsSUFBQSxxQkFBcUIsR0FBaUQsZ0JBQWdCLHNCQUFqRSxFQUFFLHFCQUFxQixHQUEwQixnQkFBZ0Isc0JBQTFDLEVBQUUsbUJBQW1CLEdBQUssZ0JBQWdCLG9CQUFyQixDQUFzQjtJQUMvRixJQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3JELElBQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUzQyxJQUFNLFNBQVMsR0FBRyxVQUFVO1FBQ3hCLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUE2QixFQUFFO1FBQzlDLENBQUMsQ0FBQyxNQUFBLHNCQUFzQixDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxtQ0FBSSxFQUFFLENBQUM7SUFFaEUsSUFBTSx5QkFBeUIsR0FBRyxnQkFBZ0IsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDO0lBQ3ZGLElBQU0saUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUM7SUFFbEUsSUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEUsSUFBTSw2QkFB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