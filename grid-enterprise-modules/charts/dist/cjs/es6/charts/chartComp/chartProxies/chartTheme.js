"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupCustomChartTheme = exports.isStockTheme = exports.createAgChartTheme = void 0;
const core_1 = require("@ag-grid-community/core");
const ag_charts_community_1 = require("ag-charts-community");
const axisTypeMapper_1 = require("../utils/axisTypeMapper");
const seriesTypeMapper_1 = require("../utils/seriesTypeMapper");
function createAgChartTheme(chartProxyParams, proxy) {
    var _a;
    const { chartOptionsToRestore, chartPaletteToRestore, chartThemeToRestore } = chartProxyParams;
    const themeName = getSelectedTheme(chartProxyParams);
    const stockTheme = isStockTheme(themeName);
    const rootTheme = stockTheme
        ? { baseTheme: themeName }
        : (_a = lookupCustomChartTheme(chartProxyParams, themeName)) !== null && _a !== void 0 ? _a : {};
    const gridOptionsThemeOverrides = chartProxyParams.getGridOptionsChartThemeOverrides();
    const apiThemeOverrides = chartProxyParams.apiChartThemeOverrides;
    const standaloneChartType = seriesTypeMapper_1.getSeriesType(chartProxyParams.chartType);
    const crossFilterThemeOverridePoint = standaloneChartType === 'pie' ? 'polar' : 'cartesian';
    const crossFilteringOverrides = chartProxyParams.crossFiltering
        ? createCrossFilterThemeOverrides(proxy, chartProxyParams, crossFilterThemeOverridePoint)
        : undefined;
    const formattingPanelOverrides = Object.assign({}, (chartOptionsToRestore !== null && chartOptionsToRestore !== void 0 ? chartOptionsToRestore : {}));
    const isTitleEnabled = () => {
        const isTitleEnabled = (obj) => {
            if (!obj) {
                return false;
            }
            return Object.keys(obj).some(key => core_1._.get(obj[key], 'title.enabled', false));
        };
        return isTitleEnabled(gridOptionsThemeOverrides) || isTitleEnabled(apiThemeOverrides);
    };
    // Overrides in ascending precedence ordering.
    const overrides = [
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
    const theme = overrides
        .filter((v) => !!v)
        .reduce((r, n) => ({
        baseTheme: r,
        overrides: n,
    }), rootTheme);
    // Avoid explicitly setting the `theme.palette` property unless we're using the restored theme
    // AND the palette is actually different.
    if (chartPaletteToRestore && themeName === chartThemeToRestore) {
        const rootThemePalette = ag_charts_community_1._Theme.getChartTheme(rootTheme).palette;
        if (!isIdenticalPalette(chartPaletteToRestore, rootThemePalette)) {
            theme.palette = chartPaletteToRestore;
        }
    }
    return theme;
}
exports.createAgChartTheme = createAgChartTheme;
function isIdenticalPalette(paletteA, paletteB) {
    const arrayCompare = (arrA, arrB) => {
        if (arrA.length !== arrB.length)
            return false;
        return arrA.every((v, i) => v === arrB[i]);
    };
    return arrayCompare(paletteA.fills, paletteB.fills) &&
        arrayCompare(paletteA.strokes, paletteB.strokes);
}
function isStockTheme(themeName) {
    return core_1._.includes(Object.keys(ag_charts_community_1._Theme.themes), themeName);
}
exports.isStockTheme = isStockTheme;
function createCrossFilterThemeOverrides(proxy, chartProxyParams, overrideType) {
    const legend = {
        listeners: {
            legendItemClick: (e) => {
                const chart = proxy.getChart();
                chart.series.forEach((s) => {
                    s.toggleSeriesItem(e.itemId, e.enabled);
                    s.toggleSeriesItem(`${e.itemId}-filtered-out`, e.enabled);
                });
            },
        },
    };
    const series = {};
    if (overrideType === 'polar') {
        series.pie = {
            tooltip: {
                renderer: ({ angleName, datum, calloutLabelKey, radiusKey, angleValue, }) => {
                    const title = angleName;
                    const label = datum[calloutLabelKey];
                    const ratio = datum[radiusKey];
                    const totalValue = angleValue;
                    return { title, content: `${label}: ${totalValue * ratio}` };
                },
            },
        };
    }
    return {
        [overrideType]: {
            tooltip: {
                delay: 500,
            },
            legend,
            listeners: {
                click: (e) => chartProxyParams.crossFilterCallback(e, true),
            },
            series,
        },
    };
}
const STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES = axisTypeMapper_1.ALL_AXIS_TYPES.reduce((r, n) => (Object.assign(Object.assign({}, r), { [n]: { title: { _enabledFromTheme: true } } })), {});
function inbuiltStockThemeOverrides(params, titleEnabled) {
    const extraPadding = params.getExtraPaddingDirections();
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
    let chartThemeName = chartProxyParams.getChartThemeName();
    const availableThemes = chartProxyParams.getChartThemes();
    if (!core_1._.includes(availableThemes, chartThemeName)) {
        chartThemeName = availableThemes[0];
    }
    return chartThemeName;
}
function lookupCustomChartTheme(chartProxyParams, name) {
    const { customChartThemes } = chartProxyParams;
    const customChartTheme = customChartThemes && customChartThemes[name];
    if (!customChartTheme) {
        console.warn(`AG Grid: no stock theme exists with the name '${name}' and no ` +
            "custom chart theme with that name was supplied to 'customChartThemes'");
    }
    return customChartTheme;
}
exports.lookupCustomChartTheme = lookupCustomChartTheme;
