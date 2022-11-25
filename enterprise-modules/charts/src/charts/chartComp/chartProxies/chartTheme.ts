import { AgChartThemePalette, _ } from '@ag-grid-community/core';
import {
    AgChartLegendClickEvent,
    AgChartTheme,
    AgChartThemeName,
    AgChartThemeOverrides,
    AgPieSeriesTooltipRendererParams,
    AgPolarSeriesTheme,
    _Theme,
} from 'ag-charts-community';
import { getSeriesType } from '../utils/seriesTypeMapper';
import { ChartProxy, ChartProxyParams } from './chartProxy';

export function createAgChartTheme(chartProxyParams: ChartProxyParams, proxy: ChartProxy): AgChartTheme {
    const { chartOptionsToRestore, chartPaletteToRestore, chartThemeToRestore } = chartProxyParams;
    const themeName = getSelectedTheme(chartProxyParams);
    const stockTheme = isStockTheme(themeName);

    const rootTheme: AgChartTheme = stockTheme
        ? { baseTheme: themeName as AgChartThemeName }
        : lookupCustomChartTheme(chartProxyParams, themeName) ?? {};

    const gridOptionsThemeOverrides = chartProxyParams.getGridOptionsChartThemeOverrides();
    const apiThemeOverrides = chartProxyParams.apiChartThemeOverrides;

    const standaloneChartType = getSeriesType(chartProxyParams.chartType);
    const crossFilterThemeOverridePoint = standaloneChartType === 'pie' ? 'polar' : 'cartesian';
    const crossFilteringOverrides = chartProxyParams.crossFiltering
        ? createCrossFilterThemeOverrides(proxy, chartProxyParams, crossFilterThemeOverridePoint)
        : undefined;
    const formattingPanelOverrides: AgChartThemeOverrides = {
        ...(chartOptionsToRestore ?? {}),
    };

    // Overrides in ascending precedence ordering.
    const overrides: (AgChartThemeOverrides | undefined)[] = [
        stockTheme ? INBUILT_STOCK_THEME_OVERRIDES : undefined,
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
    const arrayCompare = (arrA: any[], arrB: any[]) => {
        if (arrA.length !== arrB.length) return false;

        return arrA.every((v: any, i) => v === arrB[i]);
    };

    return arrayCompare(paletteA.fills, paletteB.fills) &&
        arrayCompare(paletteA.strokes, paletteB.strokes);
}

export function isStockTheme(themeName: string): boolean {
    return _.includes(Object.keys(_Theme.themes), themeName);
}

const INBUILT_STOCK_THEME_OVERRIDES: AgChartThemeOverrides = {
    common: {
        padding: {
            top: 25,
            right: 20,
            bottom: 20,
            left: 20,
        },
    },
    pie: {
        series: {
            sectorLabel: {
                enabled: false,
            },
        },
    },
};

function createCrossFilterThemeOverrides(
    proxy: ChartProxy,
    chartProxyParams: ChartProxyParams,
    overrideType: 'cartesian' | 'polar'
): AgChartThemeOverrides {
    const legend = {
        listeners: {
            legendItemClick: (e: AgChartLegendClickEvent) => {
                const chart = proxy.getChart();
                chart.series.forEach((s) => {
                    s.toggleSeriesItem(e.itemId, e.enabled);
                    s.toggleSeriesItem(`${e.itemId}-filtered-out`, e.enabled);
                });
            },
        },
    };

    const series: AgPolarSeriesTheme = {};
    if (overrideType === 'polar') {
        series.pie = {
            tooltip: {
                renderer: ({
                    angleName,
                    datum,
                    calloutLabelKey,
                    radiusKey,
                    angleValue,
                }: AgPieSeriesTooltipRendererParams) => {
                    const title = angleName;
                    const label = datum[calloutLabelKey as string];
                    const ratio = datum[radiusKey as string];
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
                click: (e: any) => chartProxyParams.crossFilterCallback(e, true),
            },
            series,
        },
    };
}

function getSelectedTheme(chartProxyParams: ChartProxyParams): string {
    let chartThemeName = chartProxyParams.getChartThemeName();
    const availableThemes = chartProxyParams.getChartThemes();

    if (!_.includes(availableThemes, chartThemeName)) {
        chartThemeName = availableThemes[0];
    }

    return chartThemeName;
}

export function lookupCustomChartTheme(chartProxyParams: ChartProxyParams, name: string) {
    const { customChartThemes } = chartProxyParams;
    const customChartTheme = customChartThemes && customChartThemes[name];

    if (!customChartTheme) {
        console.warn(
            `AG Grid: no stock theme exists with the name '${name}' and no ` +
                "custom chart theme with that name was supplied to 'customChartThemes'"
        );
    }

    return customChartTheme;
}
