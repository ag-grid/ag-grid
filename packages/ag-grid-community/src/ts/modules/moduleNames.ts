export enum ModuleNames {

    // when using modules, user references this
    CommunityCoreModule = "@ag-community/grid-core", // should this be grid-community-core?
    // when not using modules, user references this
    CommunityAllModules = "@ag-community/grid-all", // should this be grid-community-all

    // community modules
    InfiniteRowModelModule = "@ag-community/grid-infinite-row-model",
    ClientSideRowModelModule = "@ag-community/grid-client-side-row-model",
    CsvExportModule = "@ag-community/csv-export",
    RowNodeCache = "@ag-community/row-node-cache",

    // enterprise core - users never import on this, but other enterprise modules do
    EnterpriseCoreModule = "@ag-enterprise/grid-core", // should this be grid-enterprise-core?
    // when not using modules, user references this
    EnterpriseAllModules = "@ag-enterprise/grid-all", // should this be grid-enterprise-all

    // enterprise modules
    RowGroupingModule = "@ag-enterprise/grid-row-grouping",
    ColumnToolPanelModule = "@ag-enterprise/grid-column-tool-panel",
    FiltersToolPanelModule = "@ag-enterprise/grid-filters-tool-panel",
    MenuModule = "@ag-enterprise/grid-menu",
    SetFilterModule = "@ag-enterprise/grid-set-filter",
    StatusBarModule = "@ag-enterprise/grid-status-bar",
    SideBarModule = "@ag-enterprise/grid-side-bar",
    RangeSelectionModule = "@ag-enterprise/grid-range-selection",
    MasterDetailModule = "@ag-enterprise/grid-master-detail",
    RichSelectModule = "@ag-enterprise/grid-rich-select",
    ChartsModule = "@ag-enterprise/grid-charts-integration",
    ViewportRowModelModule = "@ag-enterprise/grid-viewport-row-model",
    ServerSideRowModelModule = "@ag-enterprise/grid-server-side-row-model", // or
    ExcelExportModule = "@ag-enterprise/grid-excel-export",
    ClipboardModule = "@ag-enterprise/grid-clipboard",

    // framework wrappers currently don't provide beans, comps etc, so no need to be modules,
    // however i argue they should be as in theory they 'could' provide beans etc
    AngularModule = "@ag-community/grid-angular",
    ReactModule = "@ag-community/grid-react",
    VueModule = "@ag-community/grid-vue",
    PolymerModule = "@ag-community/grid-polymer",

    // and then this, which is definitely not a grid module, as it should not have any dependency
    // on the grid (ie shouldn't even reference the Module interface)
    // ChartsModule = "@ag-community/charts-core",
}
