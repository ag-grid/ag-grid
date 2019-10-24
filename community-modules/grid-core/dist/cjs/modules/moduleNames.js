/**
 * @ag-community/grid-core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModuleNames;
(function (ModuleNames) {
    // when using modules, user references this
    ModuleNames["CommunityCoreModule"] = "@ag-community/grid-core";
    // when not using modules, user references this
    ModuleNames["CommunityAllModules"] = "@ag-community/grid-all";
    // community modules
    ModuleNames["InfiniteRowModelModule"] = "@ag-community/grid-infinite-row-model";
    ModuleNames["ClientSideRowModelModule"] = "@ag-community/grid-client-side-row-model";
    ModuleNames["CsvExportModule"] = "@ag-community/grid-csv-export";
    ModuleNames["RowNodeCache"] = "@ag-community/grid-row-node-cache";
    // enterprise core - users never import on this, but other enterprise modules do
    ModuleNames["EnterpriseCoreModule"] = "@ag-enterprise/grid-core";
    // when not using modules, user references this
    ModuleNames["EnterpriseAllModules"] = "@ag-enterprise/grid-all";
    // enterprise modules
    ModuleNames["RowGroupingModule"] = "@ag-enterprise/grid-row-grouping";
    ModuleNames["ColumnToolPanelModule"] = "@ag-enterprise/grid-column-tool-panel";
    ModuleNames["FiltersToolPanelModule"] = "@ag-enterprise/grid-filters-tool-panel";
    ModuleNames["MenuModule"] = "@ag-enterprise/grid-menu";
    ModuleNames["SetFilterModule"] = "@ag-enterprise/grid-set-filter";
    ModuleNames["StatusBarModule"] = "@ag-enterprise/grid-status-bar";
    ModuleNames["SideBarModule"] = "@ag-enterprise/grid-side-bar";
    ModuleNames["RangeSelectionModule"] = "@ag-enterprise/grid-range-selection";
    ModuleNames["MasterDetailModule"] = "@ag-enterprise/grid-master-detail";
    ModuleNames["RichSelectModule"] = "@ag-enterprise/grid-rich-select";
    ModuleNames["GridChartsModule"] = "@ag-enterprise/grid-charts";
    ModuleNames["ViewportRowModelModule"] = "@ag-enterprise/grid-viewport-row-model";
    ModuleNames["ServerSideRowModelModule"] = "@ag-enterprise/grid-server-side-row-model";
    ModuleNames["ExcelExportModule"] = "@ag-enterprise/grid-excel-export";
    ModuleNames["ClipboardModule"] = "@ag-enterprise/grid-clipboard";
    // framework wrappers currently don't provide beans, comps etc, so no need to be modules,
    // however i argue they should be as in theory they 'could' provide beans etc
    ModuleNames["AngularModule"] = "@ag-community/grid-angular";
    ModuleNames["ReactModule"] = "@ag-community/grid-react";
    ModuleNames["VueModule"] = "@ag-community/grid-vue";
    ModuleNames["PolymerModule"] = "@ag-community/grid-polymer";
    // and then this, which is definitely not a grid module, as it should not have any dependency
    // on the grid (ie shouldn't even reference the Module interface)
    // ChartsModule = "@ag-community/charts-core",
})(ModuleNames = exports.ModuleNames || (exports.ModuleNames = {}));
