import { AgChartThemeOverrides, ChartType } from "@ag-grid-community/core";

export type ChartSeriesType = keyof AgChartThemeOverrides & (
    'bar' |
    'line' |
    'area' |
    'scatter' |
    'histogram' |
    'pie' |
    'donut' |
    'bubble' |
    'radial-column' |
    'radial-bar' |
    'radar-line' |
    'radar-area' |
    'nightingale' |
    'range-bar' |
    'range-area' |
    'box-plot' |
    'treemap' |
    'sunburst' |
    'heatmap' |
    'waterfall'
);

// these values correspond to top level object names in `AgChartThemeOverrides`
export type ChartThemeOverridesSeriesType = keyof AgChartThemeOverrides & (ChartSeriesType | 'common');

export const VALID_SERIES_TYPES: ChartSeriesType[] = [
    'area',
    'bar',
    'histogram',
    'line',
    'pie',
    'donut',
    'scatter',
    'bubble',
    'radial-column',
    'radial-bar',
    'radar-line',
    'radar-area',
    'nightingale',
    'range-bar',
    'range-area',
    'box-plot',
    'treemap',
    'sunburst',
    'heatmap',
    'waterfall',
];

export function isEnterpriseChartType(chartType: ChartType): boolean {
    switch (chartType) {
        case 'rangeBar':
        case 'rangeArea':
        case 'waterfall':
        case 'boxPlot':
        case 'radarLine':
        case 'radarArea':
        case 'nightingale':
        case 'radialColumn':
        case 'radialBar':
        case 'sunburst':
        case 'treemap':
        case 'heatmap':
            return true;
        default:
            return false;
    }
}

const horizontalChartTypes = new Set(['bar', 'groupedBar', 'stackedBar', 'normalizedBar']);
export function isHorizontal(chartType: ChartType): boolean {
    return horizontalChartTypes.has(chartType);
}

const stackedChartTypes = new Set(['stackedColumn', 'normalizedColumn', 'stackedBar', 'normalizedBar']);
export function isStacked(chartType: ChartType): boolean {
    return stackedChartTypes.has(chartType);
}

export function isCartesian(chartType: ChartType): boolean {
    switch (chartType) {
        case 'area':
        case 'areaColumnCombo':
        case 'bar':
        case 'boxPlot':
        case 'bubble':
        case 'column':
        case 'columnLineCombo':
        case 'customCombo':
        case 'groupedBar':
        case 'groupedColumn':
        case 'heatmap':
        case 'histogram':
        case 'line':
        case 'normalizedArea':
        case 'normalizedBar':
        case 'normalizedColumn':
        case 'rangeArea':
        case 'rangeBar':
        case 'scatter':
        case 'stackedArea':
        case 'stackedBar':
        case 'stackedColumn':
        case 'waterfall':
            return true;
        case 'donut':
        case 'doughnut':
        case 'nightingale':
        case 'pie':
        case 'radarArea':
        case 'radarLine':
        case 'radialColumn':
        case 'radialBar':
        case 'sunburst':
        case 'treemap':
        default:
            return false;
    }
}

export function isPolar(chartType: ChartType): boolean {
    switch (chartType) {
        case 'donut':
        case 'doughnut':
        case 'pie':
        case 'radialColumn':
        case 'radialBar':
        case 'radarLine':
        case 'radarArea':
        case 'nightingale':
            return true;
        default:
            return false;
    }
}

export function isRadial(chartType: ChartType): boolean {
    switch (chartType) {
        case 'radialColumn':
        case 'radialBar':
            return true;
        default:
            return false;
    }
}

export function isHierarchical(chartType: ChartType): boolean {
    switch (chartType) {
        case 'treemap':
        case 'sunburst':
            return true;
        default:
            return false;
    }
}

export function hasGradientLegend(chartType: ChartType): boolean {
    switch (chartType) {
        case 'treemap':
        case 'sunburst':
        case 'heatmap':
            return true;
        default:
            return false;
    }
}

export function getCanonicalChartType(chartType: ChartType): Exclude<ChartType, 'doughnut'> {
    switch (chartType) {
        case 'doughnut':
            return 'donut';
        default:
            return chartType;
    }
}

export function getSeriesType(chartType: ChartType): ChartSeriesType {
    switch (chartType) {
        case 'bar':
        case 'groupedBar':
        case 'stackedBar':
        case 'normalizedBar':
            return 'bar';
        case 'column':
        case 'groupedColumn':
        case 'stackedColumn':
        case 'normalizedColumn':
            return 'bar';
        case 'line':
            return 'line';
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
            return 'area';
        case 'bubble':
            return 'bubble';
        case 'scatter':
            return 'scatter';
        case 'histogram':
            return 'histogram';
        case 'radialColumn':
            return 'radial-column';
        case 'radialBar':
            return 'radial-bar';
        case 'radarLine':
            return 'radar-line';
        case 'radarArea':
            return 'radar-area';
        case 'nightingale':
            return 'nightingale';
        case 'rangeBar':
            return 'range-bar';
        case 'rangeArea':
            return 'range-area';
        case 'boxPlot':
            return 'box-plot';
        case 'treemap':
            return 'treemap';
        case 'sunburst':
            return 'sunburst';
        case 'pie':
            return 'pie';
        case 'donut':
        case 'doughnut':
            return 'donut';
        case 'heatmap':
            return 'heatmap';
        case 'waterfall':
            return 'waterfall';
        default:
            return 'line';
    }
}

export type PieChartSeriesType = Extract<ChartSeriesType, 'pie' | 'donut'>;

export function isPieChartSeries(seriesType: ChartSeriesType): seriesType is PieChartSeriesType {
    switch (seriesType) {
        case 'pie':
        case 'donut':
            return true;
        default:
            return false;
    }
}

function canOnlyHaveSingleSeries(chartType: ChartType): boolean {
    return chartType === 'pie' || chartType === 'waterfall' || chartType === 'histogram';
}

export function getMaxNumCategories(chartType: ChartType): number | undefined {
    return isHierarchical(chartType) ? undefined : 1;
}

export function getMaxNumSeries(chartType: ChartType): number | undefined {
    if (isHierarchical(chartType)) {
        return 2;
    } else if (canOnlyHaveSingleSeries(chartType)) {
        return 1;
    } else {
        return undefined;
    }
}

export function supportsInvertedCategorySeries(chartType: ChartType): boolean {
    switch (chartType) {
        case 'column':
        case 'groupedColumn':
        case 'stackedColumn':
        case 'normalizedColumn':
        case 'bar':
        case 'groupedBar':
        case 'stackedBar':
        case 'normalizedBar':
        case 'line':
        case 'donut':
        case 'doughnut':
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
        case 'radarLine':
        case 'radarArea':
        case 'nightingale':
        case 'radialColumn':
        case 'radialBar':
            return true;
        case 'pie':
        case 'scatter':
        case 'bubble':
        case 'sunburst':
        case 'rangeBar':
        case 'rangeArea':
        case 'boxPlot':
        case 'histogram':
        case 'treemap':
        case 'heatmap':
        case 'waterfall':
        case 'columnLineCombo':
        case 'areaColumnCombo':
        case 'customCombo':
            return false;
    }
}