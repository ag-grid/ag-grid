import { _includes, _warnOnce } from '@ag-grid-community/core';
import type {
    AgChartLegendClickEvent,
    AgChartTheme,
    AgChartThemeName,
    AgChartThemeOverrides,
    AgChartThemePalette,
} from 'ag-charts-community';
import { _Theme } from 'ag-charts-community';

import { ALL_AXIS_TYPES } from '../utils/axisTypeMapper';
import { get } from '../utils/object';
import type { ChartSeriesType } from '../utils/seriesTypeMapper';
import { getSeriesType } from '../utils/seriesTypeMapper';
import type { ChartProxy, ChartProxyParams } from './chartProxy';

export function createAgChartTheme(
    chartProxyParams: ChartProxyParams,
    proxy: ChartProxy,
    isEnterprise: boolean,
    chartThemeDefaults?: AgChartThemeOverrides,
    updatedOverrides?: AgChartThemeOverrides
): AgChartTheme {
    const { chartOptionsToRestore, chartPaletteToRestore, chartThemeToRestore } = chartProxyParams;
    const themeName = getSelectedTheme(chartProxyParams);
    const stockTheme = isStockTheme(themeName);

    const rootTheme = stockTheme
        ? { baseTheme: themeName as AgChartThemeName }
        : lookupCustomChartTheme(chartProxyParams, themeName) ?? {};

    const gridOptionsThemeOverrides = chartProxyParams.getGridOptionsChartThemeOverrides();
    const apiThemeOverrides = chartProxyParams.apiChartThemeOverrides;

    const standaloneChartType = getSeriesType(chartProxyParams.chartType);
    const crossFilteringOverrides = chartProxyParams.crossFiltering
        ? createCrossFilterThemeOverrides(proxy, chartProxyParams, standaloneChartType)
        : undefined;

    const isTitleEnabled = () => {
        const isTitleEnabled = (obj: any) => {
            if (!obj) {
                return false;
            }
            return Object.keys(obj).some((key) => get(obj[key], 'title.enabled', false));
        };
        return isTitleEnabled(gridOptionsThemeOverrides) || isTitleEnabled(apiThemeOverrides);
    };

    // Overrides in ascending precedence ordering.
    const overrides: (AgChartThemeOverrides | undefined)[] = [
        stockTheme ? inbuiltStockThemeOverrides(chartProxyParams, isEnterprise, isTitleEnabled()) : undefined,
        pieAndDonutOverrides(),
        chartThemeDefaults,
        crossFilteringOverrides,
        gridOptionsThemeOverrides,
        apiThemeOverrides,
        { ...(chartOptionsToRestore ?? {}) },
        updatedOverrides,
    ];

    // Recursively nest theme overrides so they are applied with correct precedence in
    // Standalone Charts - this is an undocumented feature.
    // Outermost theme overrides will be the formatting panel configured values, so they are
    // differentiated from grid-config and inbuilt overrides.
    const theme = overrides
        .filter((v): v is AgChartThemeOverrides => !!v)
        .reduce(
            (r, n): AgChartTheme => ({
                baseTheme: r as any,
                overrides: n,
            }),
            rootTheme
        );

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

function isIdenticalPalette(paletteA: AgChartThemePalette, paletteB: AgChartThemePalette) {
    const arrayCompare = (arrA?: any[], arrB?: any[]) => {
        if (arrA === arrB) return true;
        if (arrA?.length !== arrB?.length) return false;

        return arrA?.every((v: any, i) => v === arrB?.[i]) ?? false;
    };

    return arrayCompare(paletteA.fills, paletteB.fills) && arrayCompare(paletteA.strokes, paletteB.strokes);
}

export function isStockTheme(themeName: string): boolean {
    return _includes(Object.keys(_Theme.themes), themeName);
}

function createCrossFilterThemeOverrides(
    proxy: ChartProxy,
    chartProxyParams: ChartProxyParams,
    seriesType: ChartSeriesType
): AgChartThemeOverrides {
    const legend = {
        listeners: {
            legendItemClick: (e: AgChartLegendClickEvent) => {
                const chart = proxy.getChart();
                chart.series.forEach((s) => {
                    s.toggleSeriesItem(e.itemId, e.enabled);
                });
            },
        },
    };

    return {
        [seriesType]: {
            tooltip: {
                delay: 500,
            },
            legend,
            listeners: {
                click: (e: any) => chartProxyParams.crossFilteringContext.clearAllSelections(),
            },
        },
    };
}

const STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES = ALL_AXIS_TYPES.reduce(
    (r, n) => ({ ...r, [n]: { title: { _enabledFromTheme: true } } }),
    {}
);

function inbuiltStockThemeOverrides(params: ChartProxyParams, isEnterprise: boolean, titleEnabled: boolean) {
    const extraPadding = params.getExtraPaddingDirections();
    return {
        common: {
            ...(isEnterprise ? { animation: { duration: 500 } } : undefined),
            axes: STATIC_INBUILT_STOCK_THEME_AXES_OVERRIDES,
            padding: {
                // don't add extra padding when a title is present!
                top: !titleEnabled && extraPadding.includes('top') ? 40 : 20,
                right: extraPadding.includes('right') ? 30 : 20,
                bottom: extraPadding.includes('bottom') ? 40 : 20,
                left: extraPadding.includes('left') ? 30 : 20,
            },
        },
    };
}

function pieAndDonutOverrides() {
    return {
        pie: {
            series: {
                title: { _enabledFromTheme: true },
                calloutLabel: { _enabledFromTheme: true },
                sectorLabel: {
                    enabled: false,
                    _enabledFromTheme: true,
                },
            } as any,
        },
        donut: {
            series: {
                title: { _enabledFromTheme: true },
                calloutLabel: { _enabledFromTheme: true },
                sectorLabel: {
                    enabled: false,
                    _enabledFromTheme: true,
                },
            } as any,
        },
    };
}

function getSelectedTheme(chartProxyParams: ChartProxyParams): string {
    let chartThemeName = chartProxyParams.getChartThemeName();
    const availableThemes = chartProxyParams.getChartThemes();

    if (!_includes(availableThemes, chartThemeName)) {
        chartThemeName = availableThemes[0];
    }

    return chartThemeName;
}

export function lookupCustomChartTheme(chartProxyParams: ChartProxyParams, name: string): AgChartTheme {
    const { customChartThemes } = chartProxyParams;
    const customChartTheme = customChartThemes && customChartThemes[name];

    if (!customChartTheme) {
        _warnOnce(
            `no stock theme exists with the name '${name}' and no ` +
                "custom chart theme with that name was supplied to 'customChartThemes'"
        );
    }

    return customChartTheme as AgChartTheme;
}
