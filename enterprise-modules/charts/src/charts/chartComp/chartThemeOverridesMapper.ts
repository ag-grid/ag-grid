import { ChartType } from "@ag-grid-community/core";

// these values correspond to top level object names in `AgChartThemeOverrides`
export type ChartThemeOverrideObjectName =
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
    'common';

export function getChartThemeOverridesObjectName(chartType: ChartType): ChartThemeOverrideObjectName {
    switch (chartType) {
        case ChartType.Bar:
        case ChartType.GroupedBar:
        case ChartType.StackedBar:
        case ChartType.NormalizedBar:
            return 'bar';
        case ChartType.Column:
        case ChartType.GroupedColumn:
        case ChartType.StackedColumn:
        case ChartType.NormalizedColumn:
            return 'column';
        case ChartType.Line:
            return 'line';
        case ChartType.Area:
        case ChartType.StackedArea:
        case ChartType.NormalizedArea:
            return 'area';
        case ChartType.Scatter:
        case ChartType.Bubble:
            return 'scatter';
        case ChartType.Histogram:
            return 'histogram';
        case ChartType.Pie:
        case ChartType.Doughnut:
            return 'pie';
        default:
            return 'cartesian';
    }
}