/**
 * AUTOMATICALLY GENERATED FILE, DO NOT EDIT MANUALLY!
 * Update this file by running `lerna run webpack-updater` in the monorepo root folder.
 */
var ClientSideRowModelModule = require('../../grid-community-modules/client-side-row-model');
var GridCoreModule = require('../../grid-community-modules/core');
var CsvExportModule = require('../../grid-community-modules/csv-export');
var InfiniteRowModelModule = require('../../grid-community-modules/infinite-row-model');
var GridChartsModule = require('../../grid-enterprise-modules/charts');
var ClipboardModule = require('../../grid-enterprise-modules/clipboard');
var ColumnsToolPanelModule = require('../../grid-enterprise-modules/column-tool-panel');
var AgGridEnterpriseModule = require('../../grid-enterprise-modules/core');
var ExcelExportModule = require('../../grid-enterprise-modules/excel-export');
var FiltersToolPanelModule = require('../../grid-enterprise-modules/filter-tool-panel');
var MasterDetailModule = require('../../grid-enterprise-modules/master-detail');
var MenuModule = require('../../grid-enterprise-modules/menu');
var MultiFilterModule = require('../../grid-enterprise-modules/multi-filter');
var RangeSelectionModule = require('../../grid-enterprise-modules/range-selection');
var RichSelectModule = require('../../grid-enterprise-modules/rich-select');
var RowGroupingModule = require('../../grid-enterprise-modules/row-grouping');
var ServerSideRowModelModule = require('../../grid-enterprise-modules/server-side-row-model');
var SetFilterModule = require('../../grid-enterprise-modules/set-filter');
var SideBarModule = require('../../grid-enterprise-modules/side-bar');
var SparklinesModule = require('../../grid-enterprise-modules/sparklines');
var StatusBarModule = require('../../grid-enterprise-modules/status-bar');
var ViewportRowModelModule = require('../../grid-enterprise-modules/viewport-row-model');
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
agGrid.ModuleRegistry.register(ClientSideRowModelModule.ClientSideRowModelModule);
agGrid.ModuleRegistry.register(CsvExportModule.CsvExportModule);
agGrid.ModuleRegistry.register(InfiniteRowModelModule.InfiniteRowModelModule);
agGrid.ModuleRegistry.register(GridChartsModule.GridChartsModule);
agGrid.ModuleRegistry.register(ClipboardModule.ClipboardModule);
agGrid.ModuleRegistry.register(ColumnsToolPanelModule.ColumnsToolPanelModule);
agGrid.ModuleRegistry.register(ExcelExportModule.ExcelExportModule);
agGrid.ModuleRegistry.register(FiltersToolPanelModule.FiltersToolPanelModule);
agGrid.ModuleRegistry.register(MasterDetailModule.MasterDetailModule);
agGrid.ModuleRegistry.register(MenuModule.MenuModule);
agGrid.ModuleRegistry.register(MultiFilterModule.MultiFilterModule);
agGrid.ModuleRegistry.register(RangeSelectionModule.RangeSelectionModule);
agGrid.ModuleRegistry.register(RichSelectModule.RichSelectModule);
agGrid.ModuleRegistry.register(RowGroupingModule.RowGroupingModule);
agGrid.ModuleRegistry.register(ServerSideRowModelModule.ServerSideRowModelModule);
agGrid.ModuleRegistry.register(SetFilterModule.SetFilterModule);
agGrid.ModuleRegistry.register(SideBarModule.SideBarModule);
agGrid.ModuleRegistry.register(SparklinesModule.SparklinesModule);
agGrid.ModuleRegistry.register(StatusBarModule.StatusBarModule);
agGrid.ModuleRegistry.register(ViewportRowModelModule.ViewportRowModelModule);
