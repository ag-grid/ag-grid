import { ChartType, CHART_TYPE_TO_SERIES_TYPE, COMBO_CHART_TYPES } from "@ag-grid-community/core";
import { AgChartThemeOverrides } from "ag-charts-community";

export type ChartSeriesType = typeof CHART_TYPE_TO_SERIES_TYPE[keyof typeof CHART_TYPE_TO_SERIES_TYPE] & keyof AgChartThemeOverrides;

// these values correspond to top level object names in `AgChartThemeOverrides`
export type ChartThemeOverridesSeriesType = keyof AgChartThemeOverrides & (ChartSeriesType | 'common');

interface SeriesParams {
    isCartesian?: boolean;
    isPolar?: boolean;
    isEnterprise?: boolean;
    isRadial?: boolean;
    isHierarchical?: boolean;
    isPie?: boolean;
    canInvert?: boolean;
    canSwitchDirection?: boolean;
}

const SERIES_TYPES: { [key in ChartSeriesType]: SeriesParams } = {
    'area': {
        isCartesian: true,
        canInvert: true
    },
    'bar': {
        isCartesian: true,
        canInvert: true
    },
    'histogram': {
        isCartesian: true
    },
    'line': {
        isCartesian: true,
        canInvert: true
    },
    'pie': {
        isPie: true
    },
    'donut': {
        isPie: true,
        canInvert: true
    },
    'scatter': {
        isCartesian: true
    },
    'bubble': {
        isCartesian: true
    },
    'radial-column': {
        isPolar: true,
        isEnterprise: true,
        isRadial: true,
        canInvert: true
    },
    'radial-bar': {
        isPolar: true,
        isEnterprise: true,
        isRadial: true,
        canInvert: true
    },
    'radar-line': {
        isPolar: true,
        isEnterprise: true,
        canInvert: true
    },
    'radar-area': {
        isPolar: true,
        isEnterprise: true,
        canInvert: true
    },
    'nightingale': {
        isPolar: true,
        isEnterprise: true,
        canInvert: true
    },
    'range-bar': {
        isCartesian: true,
        isEnterprise: true,
        canSwitchDirection: true
    },
    'range-area': {
        isCartesian: true,
        isEnterprise: true
    },
    'box-plot': {
        isCartesian: true,
        isEnterprise: true,
        canSwitchDirection: true
    },
    'treemap': {
        isEnterprise: true,
        isHierarchical: true
    },
    'sunburst': {
        isEnterprise: true,
        isHierarchical: true
    },
    'heatmap': {
        isCartesian: true,
        isEnterprise: true
    },
    'waterfall': {
        isCartesian: true,
        isEnterprise: true,
        canSwitchDirection: true
    },
};

export function isSeriesType(seriesType: ChartSeriesType): boolean {
    return !!SERIES_TYPES[seriesType];
}

export function isComboChart(chartType: ChartType): boolean {
    return COMBO_CHART_TYPES.includes(chartType as typeof COMBO_CHART_TYPES[number]);
}

function doesSeriesHaveProperty(seriesType: ChartSeriesType, prop: keyof SeriesParams): boolean {
    return !!SERIES_TYPES[seriesType]?.[prop];
}

export function isEnterpriseChartType(chartType: ChartType): boolean {
    return doesSeriesHaveProperty(getSeriesType(chartType), 'isEnterprise');
}

const stackedChartTypes = new Set(['stackedColumn', 'normalizedColumn', 'stackedBar', 'normalizedBar']);
export function isStacked(chartType: ChartType): boolean {
    return stackedChartTypes.has(chartType);
}

export function isCartesian(seriesType: ChartSeriesType): boolean {
    return doesSeriesHaveProperty(seriesType, 'isCartesian');
}

export function isPolar(seriesType: ChartSeriesType): boolean {
    return doesSeriesHaveProperty(seriesType, 'isPolar');
}

export function isRadial(seriesType: ChartSeriesType): boolean {
    return doesSeriesHaveProperty(seriesType, 'isRadial');
}

export function isHierarchical(seriesType: ChartSeriesType): boolean {
    return doesSeriesHaveProperty(seriesType, 'isHierarchical');
}

export function getCanonicalChartType(chartType: ChartType): Exclude<ChartType, 'doughnut'> {
    return chartType === 'doughnut' ? 'donut' : chartType;
}

export function getSeriesTypeIfExists(chartType: ChartType): ChartSeriesType | undefined {
    return CHART_TYPE_TO_SERIES_TYPE[chartType as keyof typeof CHART_TYPE_TO_SERIES_TYPE];
}

export function getSeriesType(chartType: ChartType): ChartSeriesType {
    return getSeriesTypeIfExists(chartType) ?? 'line';
}

export function isPieChartSeries(seriesType: ChartSeriesType): boolean {
    return doesSeriesHaveProperty(seriesType, 'isPie');
}

function canOnlyHaveSingleSeries(chartType: ChartType): boolean {
    return chartType === 'pie' || chartType === 'waterfall' || chartType === 'histogram';
}

export function getMaxNumCategories(chartType: ChartType): number | undefined {
    return isHierarchical(getSeriesType(chartType)) ? undefined : 1;
}

export function getMaxNumSeries(chartType: ChartType): number | undefined {
    if (isHierarchical(getSeriesType(chartType))) {
        return 2;
    } else if (canOnlyHaveSingleSeries(chartType)) {
        return 1;
    } else {
        return undefined;
    }
}

export function supportsInvertedCategorySeries(chartType: ChartType): boolean {
    return doesSeriesHaveProperty(getSeriesType(chartType), 'canInvert');
}

export function canSwitchDirection(chartType: ChartType): boolean {
    return doesSeriesHaveProperty(getSeriesType(chartType), 'canSwitchDirection');
}
