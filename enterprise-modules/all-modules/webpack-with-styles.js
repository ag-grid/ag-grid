/**
 * AUTOMATICALLY GENERATED FILE, DO NOT EDIT MANUALLY!
 * Update this file by running `lerna run webpack-updater` in the monorepo root folder.
 */
var ClientSideRowModelModule = require('../../community-modules/client-side-row-model');
var GridCoreModule = require('../../community-modules/core');
var CsvExportModule = require('../../community-modules/csv-export');
var InfiniteRowModelModule = require('../../community-modules/infinite-row-model');
var GridChartsModule = require('../../enterprise-modules/charts');
var ClipboardModule = require('../../enterprise-modules/clipboard');
var ColumnsToolPanelModule = require('../../enterprise-modules/column-tool-panel');
var AgGridEnterpriseModule = require('../../enterprise-modules/core');
var ExcelExportModule = require('../../enterprise-modules/excel-export');
var FiltersToolPanelModule = require('../../enterprise-modules/filter-tool-panel');
var MasterDetailModule = require('../../enterprise-modules/master-detail');
var MenuModule = require('../../enterprise-modules/menu');
var MultiFilterModule = require('../../enterprise-modules/multi-filter');
var RangeSelectionModule = require('../../enterprise-modules/range-selection');
var RichSelectModule = require('../../enterprise-modules/rich-select');
var RowGroupingModule = require('../../enterprise-modules/row-grouping');
var ServerSideRowModelModule = require('../../enterprise-modules/server-side-row-model');
var SetFilterModule = require('../../enterprise-modules/set-filter');
var SideBarModule = require('../../enterprise-modules/side-bar');
var SparklinesModule = require('../../enterprise-modules/sparklines');
var StatusBarModule = require('../../enterprise-modules/status-bar');
var ViewportRowModelModule = require('../../enterprise-modules/viewport-row-model');
require('./dist/esm/es5/main');

// add in exports for AG Grid Enterprise
var agGridEnterprise = require('./dist/esm/es5/main');
Object.keys(agGridEnterprise).forEach(function(key) {
    exports[key] = agGridEnterprise[key];
});

// also add in in exports for AG Grid Community, as it's webpack, we want both packed up
var agGrid = require('@ag-grid-community/all-modules');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});
agGrid.ModuleRegistry.register(ClientSideRowModelModule.ClientSideRowModelModule, false);
agGrid.ModuleRegistry.register(CsvExportModule.CsvExportModule, false);
agGrid.ModuleRegistry.register(InfiniteRowModelModule.InfiniteRowModelModule, false);
agGrid.ModuleRegistry.register(GridChartsModule.GridChartsModule, false);
agGrid.ModuleRegistry.register(ClipboardModule.ClipboardModule, false);
agGrid.ModuleRegistry.register(ColumnsToolPanelModule.ColumnsToolPanelModule, false);
agGrid.ModuleRegistry.register(ExcelExportModule.ExcelExportModule, false);
agGrid.ModuleRegistry.register(FiltersToolPanelModule.FiltersToolPanelModule, false);
agGrid.ModuleRegistry.register(MasterDetailModule.MasterDetailModule, false);
agGrid.ModuleRegistry.register(MenuModule.MenuModule, false);
agGrid.ModuleRegistry.register(MultiFilterModule.MultiFilterModule, false);
agGrid.ModuleRegistry.register(RangeSelectionModule.RangeSelectionModule, false);
agGrid.ModuleRegistry.register(RichSelectModule.RichSelectModule, false);
agGrid.ModuleRegistry.register(RowGroupingModule.RowGroupingModule, false);
agGrid.ModuleRegistry.register(ServerSideRowModelModule.ServerSideRowModelModule, false);
agGrid.ModuleRegistry.register(SetFilterModule.SetFilterModule, false);
agGrid.ModuleRegistry.register(SideBarModule.SideBarModule, false);
agGrid.ModuleRegistry.register(SparklinesModule.SparklinesModule, false);
agGrid.ModuleRegistry.register(StatusBarModule.StatusBarModule, false);
agGrid.ModuleRegistry.register(ViewportRowModelModule.ViewportRowModelModule, false);
require('./styles/ag-grid-no-native-widgets.css');
require('./styles/ag-grid.css');
require('./styles/ag-theme-alpine-no-font.css');
require('./styles/ag-theme-alpine.css');
require('./styles/ag-theme-balham-no-font.css');
require('./styles/ag-theme-balham.css');
require('./styles/ag-theme-material-no-font.css');
require('./styles/ag-theme-material.css');
require('./styles/agGridAlpineFont.css');
require('./styles/agGridBalhamFont.css');
require('./styles/agGridClassicFont.css');
require('./styles/agGridMaterialFont.css');