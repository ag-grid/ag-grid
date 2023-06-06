import * as agCharts from 'ag-charts-community';
declare module 'ag-grid-community' {
    interface AgChartThemeOverrides extends agCharts.AgChartThemeOverrides {
    }
    interface AgChartThemePalette extends agCharts.AgChartThemePalette {
    }
    interface AgChartThemeDefinition extends agCharts.AgChartTheme {
    }
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION_AG_GRID_CORE_EXT = 0;
