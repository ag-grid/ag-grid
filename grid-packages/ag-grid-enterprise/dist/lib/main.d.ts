export { EnterpriseCoreModule } from "./agGridEnterpriseModule";
export { LicenseManager } from "./licenseManager";

export { ExcelExportModule } from "./excelExportModule";
export { getMultipleSheetsAsExcel, exportMultipleSheetsAsExcel } from './excelExport/excelCreator';

export { SetFilterModule } from './setFilterModule';
export { SetFilter } from './setFilter/setFilter';

import * as agCharts from "./chart/agChartOptions";
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
