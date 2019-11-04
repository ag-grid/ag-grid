/**
 * @ag-grid-community/grid-core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.0.0-beta.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
export var ModuleNames;
(function (ModuleNames) {
    // when using modules, user references this
    ModuleNames["CommunityCoreModule"] = "@ag-grid-community/grid-core";
    // when not using modules, user references this
    ModuleNames["CommunityAllModules"] = "@ag-grid-community/grid-all";
    // community modules
    ModuleNames["InfiniteRowModelModule"] = "@ag-grid-community/grid-infinite-row-model";
    ModuleNames["ClientSideRowModelModule"] = "@ag-grid-community/grid-client-side-row-model";
    ModuleNames["CsvExportModule"] = "@ag-grid-community/grid-csv-export";
    ModuleNames["RowNodeCache"] = "@ag-grid-community/grid-row-node-cache";
    // enterprise core - users never import on this, but other enterprise modules do
    ModuleNames["EnterpriseCoreModule"] = "@ag-grid-enterprise/grid-core";
    // when not using modules, user references this
    ModuleNames["EnterpriseAllModules"] = "@ag-grid-enterprise/grid-all";
    // enterprise modules
    ModuleNames["RowGroupingModule"] = "@ag-grid-enterprise/grid-row-grouping";
    ModuleNames["ColumnToolPanelModule"] = "@ag-grid-enterprise/grid-column-tool-panel";
    ModuleNames["FiltersToolPanelModule"] = "@ag-grid-enterprise/grid-filters-tool-panel";
    ModuleNames["MenuModule"] = "@ag-grid-enterprise/grid-menu";
    ModuleNames["SetFilterModule"] = "@ag-grid-enterprise/grid-set-filter";
    ModuleNames["StatusBarModule"] = "@ag-grid-enterprise/grid-status-bar";
    ModuleNames["SideBarModule"] = "@ag-grid-enterprise/grid-side-bar";
    ModuleNames["RangeSelectionModule"] = "@ag-grid-enterprise/grid-range-selection";
    ModuleNames["MasterDetailModule"] = "@ag-grid-enterprise/grid-master-detail";
    ModuleNames["RichSelectModule"] = "@ag-grid-enterprise/grid-rich-select";
    ModuleNames["GridChartsModule"] = "@ag-grid-enterprise/grid-charts";
    ModuleNames["ViewportRowModelModule"] = "@ag-grid-enterprise/grid-viewport-row-model";
    ModuleNames["ServerSideRowModelModule"] = "@ag-grid-enterprise/grid-server-side-row-model";
    ModuleNames["ExcelExportModule"] = "@ag-grid-enterprise/grid-excel-export";
    ModuleNames["ClipboardModule"] = "@ag-grid-enterprise/grid-clipboard";
    // framework wrappers currently don't provide beans, comps etc, so no need to be modules,
    // however i argue they should be as in theory they 'could' provide beans etc
    ModuleNames["AngularModule"] = "@ag-grid-community/grid-angular";
    ModuleNames["ReactModule"] = "@ag-grid-community/grid-react";
    ModuleNames["VueModule"] = "@ag-grid-community/grid-vue";
    ModuleNames["PolymerModule"] = "@ag-grid-community/grid-polymer";
    // and then this, which is definitely not a grid module, as it should not have any dependency
    // on the grid (ie shouldn't even reference the Module interface)
    // ChartsModule = "@ag-grid-community/charts-core",
})(ModuleNames || (ModuleNames = {}));
