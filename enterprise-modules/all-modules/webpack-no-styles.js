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

var gridExports = {};

// add in exports for AG Grid Enterprise
var agGridEnterprise = require('./dist/esm/es5/main');
Object.keys(agGridEnterprise).forEach(function(key) {
    gridExports[key] = agGridEnterprise[key];
});


// also add in in exports for AG Grid Community, as it's webpack, we want both packed up
var agGrid = require('@ag-grid-community/all-modules');
Object.keys(agGrid).forEach(function(key) {
    gridExports[key] = agGrid[key];
});

exports['agGrid'] = gridExports;
exports['agCharts'] = agGridEnterprise['agCharts'];
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
agGrid.ModuleRegistry.setIsBundled();
