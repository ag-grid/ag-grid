export enum ModuleNames {

    // when using modules, user references this
    CommunityCoreModule = "@ag-grid-community/grid-core", // should this be grid-community-core?
    // when not using modules, user references this
    CommunityAllModules = "@ag-grid-community/grid-all", // should this be grid-community-all

    // community modules
    InfiniteRowModelModule = "@ag-grid-community/grid-infinite-row-model",
    ClientSideRowModelModule = "@ag-grid-community/grid-client-side-row-model",
    CsvExportModule = "@ag-grid-community/grid-csv-export",
    RowNodeCache = "@ag-grid-community/grid-row-node-cache",

    // enterprise core - users never import on this, but other enterprise modules do
    EnterpriseCoreModule = "@ag-grid-enterprise/grid-core", // should this be grid-enterprise-core?
    // when not using modules, user references this
    EnterpriseAllModules = "@ag-grid-enterprise/grid-all", // should this be grid-enterprise-all

    // enterprise modules
    RowGroupingModule = "@ag-grid-enterprise/grid-row-grouping",
    ColumnToolPanelModule = "@ag-grid-enterprise/grid-column-tool-panel",
    FiltersToolPanelModule = "@ag-grid-enterprise/grid-filters-tool-panel",
    MenuModule = "@ag-grid-enterprise/grid-menu",
    SetFilterModule = "@ag-grid-enterprise/grid-set-filter",
    StatusBarModule = "@ag-grid-enterprise/grid-status-bar",
    SideBarModule = "@ag-grid-enterprise/grid-side-bar",
    RangeSelectionModule = "@ag-grid-enterprise/grid-range-selection",
    MasterDetailModule = "@ag-grid-enterprise/grid-master-detail",
    RichSelectModule = "@ag-grid-enterprise/grid-rich-select",
    GridChartsModule = "@ag-grid-enterprise/grid-charts",
    ViewportRowModelModule = "@ag-grid-enterprise/grid-viewport-row-model",
    ServerSideRowModelModule = "@ag-grid-enterprise/grid-server-side-row-model", // or
    ExcelExportModule = "@ag-grid-enterprise/grid-excel-export",
    ClipboardModule = "@ag-grid-enterprise/grid-clipboard",

    // framework wrappers currently don't provide beans, comps etc, so no need to be modules,
    // however i argue they should be as in theory they 'could' provide beans etc
    AngularModule = "@ag-grid-community/grid-angular",
    ReactModule = "@ag-grid-community/grid-react",
    VueModule = "@ag-grid-community/grid-vue",
    PolymerModule = "@ag-grid-community/grid-polymer",

    // and then this, which is definitely not a grid module, as it should not have any dependency
    // on the grid (ie shouldn't even reference the Module interface)
    // ChartsModule = "@ag-grid-community/charts-core",
}
