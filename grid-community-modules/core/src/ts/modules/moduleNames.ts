export enum ModuleNames {

    CommunityCoreModule = "@ag-grid-community/core",

    // community modules
    InfiniteRowModelModule = "@ag-grid-community/infinite-row-model",
    ClientSideRowModelModule = "@ag-grid-community/client-side-row-model",
    CsvExportModule = "@ag-grid-community/csv-export",

    // enterprise core - users don't need to import on this, but other enterprise modules do
    EnterpriseCoreModule = "@ag-grid-enterprise/core",

    // enterprise modules
    RowGroupingModule = "@ag-grid-enterprise/row-grouping",
    ColumnsToolPanelModule = "@ag-grid-enterprise/column-tool-panel",
    FiltersToolPanelModule = "@ag-grid-enterprise/filter-tool-panel",
    MenuModule = "@ag-grid-enterprise/menu",
    SetFilterModule = "@ag-grid-enterprise/set-filter",
    MultiFilterModule = "@ag-grid-enterprise/multi-filter",
    StatusBarModule = "@ag-grid-enterprise/status-bar",
    SideBarModule = "@ag-grid-enterprise/side-bar",
    RangeSelectionModule = "@ag-grid-enterprise/range-selection",
    MasterDetailModule = "@ag-grid-enterprise/master-detail",
    RichSelectModule = "@ag-grid-enterprise/rich-select",
    GridChartsModule = "@ag-grid-enterprise/charts",
    ViewportRowModelModule = "@ag-grid-enterprise/viewport-row-model",
    ServerSideRowModelModule = "@ag-grid-enterprise/server-side-row-model",
    ExcelExportModule = "@ag-grid-enterprise/excel-export",
    ClipboardModule = "@ag-grid-enterprise/clipboard",
    SparklinesModule = "@ag-grid-enterprise/sparklines",

    // framework wrappers currently don't provide beans, comps etc, so no need to be modules,
    // however i argue they should be as in theory they 'could' provide beans etc
    AngularModule = "@ag-grid-community/angular",
    ReactModule = "@ag-grid-community/react",
    VueModule = "@ag-grid-community/vue",

    // and then this, which is definitely not a grid module, as it should not have any dependency
    // on the grid (ie shouldn't even reference the Module interface)
    // ChartsModule = "@ag-grid-community/charts-core",
}
