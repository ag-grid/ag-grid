export enum ModuleNames {
    ChartsModule = "chartsModule",
    ViewportRowModelModule = "viewportRowModelModule",
    InfiniteRowModelModule = "infiniteRowModelModule",
    ClientSideRowModelModule = "clientSideRowModelModule",
    ServerSideRowModelModule = "serverSideRowModelModule",
    RowGroupingModule = "rowGroupingModule",
    CsvExportModule = "csvExportModule",
    ExcelExportModule = "excelExportModule",
    ClipboardModule = "clipboardModule",
    ColumnToolPanelModule = "columnToolPanelModule",
    FiltersToolPanelModule = "filtersToolPanelModule",
    MenuModule = "menuModule",
    SetFilterModule = "setFilterModule",
    StatusBarModule = "statusBarModule",
    SideBarModule = "sideBarModule",
    RangeSelectionModule = "rangeSelectionModule",
    MasterDetailModule = "masterDetailModule",
    RichSelectModule = "richSelectModule",
    EnterpriseCoreModule = "enterpriseCoreModule",

    // we have React module, but not the other frameworks, as React adds the bean ReactFrameworkComponentWrapper,
    // whereas the other frameworks provide such been as a seed bean
    ReactSupport = "reactSupport"
}
