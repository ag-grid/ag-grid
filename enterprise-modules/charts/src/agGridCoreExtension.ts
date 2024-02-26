import * as agCharts from 'ag-charts-community';

/*
* grid-packages/ag-grid-enterprise is dependant on this file - if changes are made here (esp to it's path)
* then be sure to check if grid-packages/ag-grid-enterprise/gulpfile.js#copyAndConcatMainTypings needs to be updated too
*/
declare module '@ag-grid-community/core' {
    export interface AgChartThemeOverrides extends agCharts.AgChartThemeOverrides {}
    export interface AgChartThemePalette extends agCharts.AgChartThemePalette {}
    export interface AgChartThemeDefinition extends agCharts.AgChartTheme {}
}

/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
 export const __FORCE_MODULE_DETECTION_AG_GRID_CORE_EXT = 0;
