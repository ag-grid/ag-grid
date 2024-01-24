import { ChartType } from "@ag-grid-community/core";

// these values correspond to top level object names in `AgChartThemeOverrides`
export type ChartSeriesType =
    'cartesian' |
    'column' |
    'bar' |
    'line' |
    'area' |
    'scatter' |
    'histogram' |
    'polar' |
    'pie' |
    'hierarchy' |
    'treemap' |
    'bubble' |
    'radar-line' |
    'radar-area' |
    'nightingale' |
    'range-bar' |
    'box-plot' |
    'waterfall' |
    'common';

type PolarChartSeriesType = Extract<ChartSeriesType,
    'radar-line' |
    'radar-area' |
    'nightingale'
>;

export const VALID_SERIES_TYPES: ChartSeriesType[] = [
    'area',
    'bar',
    'column',
    'histogram',
    'line',
    'pie',
    'scatter',
    'bubble',
    'radar-line',
    'radar-area',
    'nightingale',
    'range-bar',
    'box-plot',
    'waterfall',
];

const horizontalChartTypes = new Set(['bar', 'groupedBar', 'stackedBar', 'normalizedBar']);
export function isHorizontal(chartType: ChartType): boolean {
    return horizontalChartTypes.has(chartType);
}

const stackedChartTypes = new Set(['stackedColumn', 'normalizedColumn', 'stackedBar', 'normalizedBar']);
export function isStacked(chartType: ChartType): boolean {
    return stackedChartTypes.has(chartType);
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
        case 'radarLine':
            return 'radar-line';
        case 'radarArea':
            return 'radar-area';
        case 'nightingale':
            return 'nightingale';
        case 'rangeBar':
            return 'range-bar';
        case 'boxPlot':
            return 'box-plot';
        case 'pie':
        case 'doughnut':
            return 'pie';
        case 'waterfall':
            return 'waterfall';
        default:
            return 'cartesian';
    }
}

export function isPolarChartSeriesType(seriesType: ChartSeriesType): seriesType is PolarChartSeriesType {
    switch (seriesType) {
        case 'radar-line':
        case 'radar-area':
        case 'nightingale':
            return true;
        default:
            return false;
    }
}
