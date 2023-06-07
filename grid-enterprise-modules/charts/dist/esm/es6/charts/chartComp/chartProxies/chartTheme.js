import { _ } from '@ag-grid-community/core';
import { _Theme, } from 'ag-charts-community';
import { ALL_AXIS_TYPES } from '../utils/axisTypeMapper';
import { getSeriesType } from '../utils/seriesTypeMapper';
export function createAgChartTheme(chartProxyParams, proxy) {
    var _a;
    const { chartOptionsToRestore, chartPaletteToRestore, chartThemeToRestore } = chartProxyParams;
    const themeName = getSelectedTheme(chartProxyParams);
    const stockTheme = isStockTheme(themeName);
    const rootTheme = stockTheme
        ? { baseTheme: themeName }
        : (_a = lookupCustomChartTheme(chartProxyParams, themeName)) !== null && _a !== void 0 ? _a : {};
    const gridOptionsThemeOverrides = chartProxyParams.getGridOptionsChartThemeOverrides();
    const apiThemeOverrides = chartProxyParams.apiChartThemeOverrides;
    const standaloneChartType = getSeriesType(chartProxyParams.chartType);
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
            return Object.keys(obj).some(key => _.get(obj[key], 'title.enabled', false));
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
        const rootThemePalette = _Theme.getChartTheme(rootTheme).palette;
        if (!isIdenticalPalette(chartPaletteToRestore, rootThemePalette)) {
            theme.palette = chartPaletteToRestore;
        }
    }
    return theme;
}
function isIdenticalPalette(paletteA, paletteB) {
    const arrayCompare = (arrA, arrB) => {
        if (arrA.length !== arrB.length)
            return false;
        return arrA.every((v, i) => v === arrB[i]);
    };
    return arrayCompare(paletteA.fills, paletteB.fills) &&
        arrayCompare(paletteA.strokes, paletteB.strokes);
}
export function isStockTheme(themeName) {
    return _.includes(Object.keys(_Theme.themes), themeName);
}
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
const STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES = ALL_AXIS_TYPES.reduce((r, n) => (Object.assign(Object.assign({}, r), { [n]: { title: { _enabledFromTheme: true } } })), {});
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
    if (!_.includes(availableThemes, chartThemeName)) {
        chartThemeName = availableThemes[0];
    }
    return chartThemeName;
}
export function lookupCustomChartTheme(chartProxyParams, name) {
    const { customChartThemes } = chartProxyParams;
    const customChartTheme = customChartThemes && customChartThemes[name];
    if (!customChartTheme) {
        console.warn(`AG Grid: no stock theme exists with the name '${name}' and no ` +
            "custom chart theme with that name was supplied to 'customChartThemes'");
    }
    return customChartTheme;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRUaGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jaGFydFRoZW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM1QyxPQUFPLEVBQ0gsTUFBTSxHQVFULE1BQU0scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUcxRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsZ0JBQWtDLEVBQUUsS0FBaUI7O0lBQ3BGLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBRSxHQUFHLGdCQUFnQixDQUFDO0lBQy9GLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDckQsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTNDLE1BQU0sU0FBUyxHQUFHLFVBQVU7UUFDeEIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQTZCLEVBQUU7UUFDOUMsQ0FBQyxDQUFDLE1BQUEsc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLG1DQUFJLEVBQUUsQ0FBQztJQUVoRSxNQUFNLHlCQUF5QixHQUFHLGdCQUFnQixDQUFDLGlDQUFpQyxFQUFFLENBQUM7SUFDdkYsTUFBTSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztJQUVsRSxNQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0RSxNQUFNLDZCQUE2QixHQUFHLG1CQUFtQixLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFD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