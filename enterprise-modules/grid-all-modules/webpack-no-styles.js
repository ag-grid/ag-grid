var ClientSideRowModelModule = require('../../community-modules/grid-client-side-row-model');
var GridCoreModule = require('../../community-modules/grid-core');
var CsvExportModule = require('../../community-modules/grid-csv-export');
var InfiniteRowModelModule = require('../../community-modules/grid-infinite-row-model');
var GridChartsModule = require('../../enterprise-modules/grid-charts');
var ClipboardModule = require('../../enterprise-modules/grid-clipboard');
var ColumnsToolPanelModule = require('../../enterprise-modules/grid-column-tool-panel');
var AgGridEnterpriseModule = require('../../enterprise-modules/grid-core');
var ExcelExportModule = require('../../enterprise-modules/grid-excel-export');
var FiltersToolPanelModule = require('../../enterprise-modules/grid-filter-tool-panel');
var MasterDetailModule = require('../../enterprise-modules/grid-master-detail');
var MenuModule = require('../../enterprise-modules/grid-menu');
var RangeSelectionModule = require('../../enterprise-modules/grid-range-selection');
var RichSelectModule = require('../../enterprise-modules/grid-rich-select');
var RowGroupingModule = require('../../enterprise-modules/grid-row-grouping');
var ServerSideRowModelModule = require('../../enterprise-modules/grid-server-side-row-model');
var SetFilterModule = require('../../enterprise-modules/grid-set-filter');
var SideBarModule = require('../../enterprise-modules/grid-side-bar');
var StatusBarModule = require('../../enterprise-modules/grid-status-bar');
var ViewportRowModelModule = require('../../enterprise-modules/grid-viewport-row-model');
require('./dist/es6/main');

// add in exports for ag-Grid-Enterprise
var agGridEnterprise = require('./dist/es6/main');
Object.keys(agGridEnterprise).forEach(function(key) {
    exports[key] = agGridEnterprise[key];
});

// also add in in exports for ag-Grid-Standard, as it's webpack, we want both packed up
var agGrid = require('@ag-grid-community/grid-all-modules');
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
agGrid.ModuleRegistry.register(RangeSelectionModule.RangeSelectionModule);
agGrid.ModuleRegistry.register(RichSelectModule.RichSelectModule);
agGrid.ModuleRegistry.register(RowGroupingModule.RowGroupingModule);
agGrid.ModuleRegistry.register(ServerSideRowModelModule.ServerSideRowModelModule);
agGrid.ModuleRegistry.register(SetFilterModule.SetFilterModule);
agGrid.ModuleRegistry.register(SideBarModule.SideBarModule);
agGrid.ModuleRegistry.register(StatusBarModule.StatusBarModule);
agGrid.ModuleRegistry.register(ViewportRowModelModule.ViewportRowModelModule);
