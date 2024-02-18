
export { GridLicenseManager as LicenseManager } from "./license/gridLicenseManager";
export { ILicenseManager } from "./license/shared/licenseManager";


export { getMultipleSheetsAsExcel, exportMultipleSheetsAsExcel } from './excelExport/excelCreator';


export { SetFilter } from './setFilter/setFilter';



import * as AgCharts from "./ag-charts-community/main"
export * from "./ag-charts-community/main";
export declare const agCharts: {
    time: typeof AgCharts.time;
    AgChart: typeof AgCharts.AgChart;
};


declare module 'ag-grid-community' {
    interface AgChartThemeOverrides extends AgCharts.AgChartThemeOverrides {
    }
    interface AgChartThemePalette extends AgCharts.AgChartThemePalette {
    }
    interface AgChartThemeDefinition extends AgCharts.AgChartTheme {
    }
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION_AG_GRID_CORE_EXT = 0;
