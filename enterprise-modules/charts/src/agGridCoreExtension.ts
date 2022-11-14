import * as agCharts from 'ag-charts-community';

declare module '@ag-grid-community/core' {
    export interface AgChartThemeOverrides extends agCharts.AgChartThemeOverrides {}
    export interface AgChartThemePalette extends agCharts.AgChartThemePalette {}
    export interface AgChartThemeDefinition extends agCharts.AgChartTheme {}
}
