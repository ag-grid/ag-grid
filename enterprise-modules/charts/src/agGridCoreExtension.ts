import * as agCharts from 'ag-charts-community';

/*
* grid-packages/ag-grid-enterprise is dependant on this file - if changes are made here (esp to it's path)
* then be sure to check if grid-packages/ag-grid-enterprise/gulpfile.js#copyGridCoreTypings needs to be updated too
*/
declare module '@ag-grid-community/core' {
    export interface AgChartThemeOverrides extends agCharts.AgChartThemeOverrides {}
    export interface AgChartThemePalette extends agCharts.AgChartThemePalette {}
    export interface AgChartThemeDefinition extends agCharts.AgChartTheme {}
}
