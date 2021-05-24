/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
export var ModuleNames;
(function (ModuleNames) {
    // when using modules, user references this
    ModuleNames["CommunityCoreModule"] = "@ag-grid-community/core";
    // when not using modules, user references this
    ModuleNames["CommunityAllModules"] = "@ag-grid-community/all";
    // community modules
    ModuleNames["InfiniteRowModelModule"] = "@ag-grid-community/infinite-row-model";
    ModuleNames["ClientSideRowModelModule"] = "@ag-grid-community/client-side-row-model";
    ModuleNames["CsvExportModule"] = "@ag-grid-community/csv-export";
    // enterprise core - users never import on this, but other enterprise modules do
    ModuleNames["EnterpriseCoreModule"] = "@ag-grid-enterprise/core";
    // when not using modules, user references this
    ModuleNames["EnterpriseAllModules"] = "@ag-grid-enterprise/all";
    // enterprise modules
    ModuleNames["RowGroupingModule"] = "@ag-grid-enterprise/row-grouping";
    ModuleNames["ColumnToolPanelModule"] = "@ag-grid-enterprise/column-tool-panel";
    ModuleNames["FiltersToolPanelModule"] = "@ag-grid-enterprise/filter-tool-panel";
    ModuleNames["MenuModule"] = "@ag-grid-enterprise/menu";
    ModuleNames["SetFilterModule"] = "@ag-grid-enterprise/set-filter";
    ModuleNames["MultiFilterModule"] = "@ag-grid-enterprise/multi-filter";
    ModuleNames["StatusBarModule"] = "@ag-grid-enterprise/status-bar";
    ModuleNames["SideBarModule"] = "@ag-grid-enterprise/side-bar";
    ModuleNames["RangeSelectionModule"] = "@ag-grid-enterprise/range-selection";
    ModuleNames["MasterDetailModule"] = "@ag-grid-enterprise/master-detail";
    ModuleNames["RichSelectModule"] = "@ag-grid-enterprise/rich-select";
    ModuleNames["GridChartsModule"] = "@ag-grid-enterprise/charts";
    ModuleNames["ViewportRowModelModule"] = "@ag-grid-enterprise/viewport-row-model";
    ModuleNames["ServerSideRowModelModule"] = "@ag-grid-enterprise/server-side-row-model";
    ModuleNames["ExcelExportModule"] = "@ag-grid-enterprise/excel-export";
    ModuleNames["ClipboardModule"] = "@ag-grid-enterprise/clipboard";
    ModuleNames["DateTimeCellEditorModule"] = "@ag-grid-enterprise/date-time-cell-editor";
    // framework wrappers currently don't provide beans, comps etc, so no need to be modules,
    // however i argue they should be as in theory they 'could' provide beans etc
    ModuleNames["AngularModule"] = "@ag-grid-community/angular";
    ModuleNames["ReactModule"] = "@ag-grid-community/react";
    ModuleNames["VueModule"] = "@ag-grid-community/vue";
    ModuleNames["PolymerModule"] = "@ag-grid-community/polymer";
    // and then this, which is definitely not a grid module, as it should not have any dependency
    // on the grid (ie shouldn't even reference the Module interface)
    // ChartsModule = "@ag-grid-community/charts-core",
})(ModuleNames || (ModuleNames = {}));
