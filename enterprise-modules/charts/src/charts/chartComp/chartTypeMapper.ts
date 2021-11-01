import { ChartType } from "@ag-grid-community/core";

export function getStandaloneChartType(chartType: ChartType): string {
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