import type {
    CommunityModuleName,
    EnterpriseModuleName,
    ModuleName,
} from '../../packages/ag-grid-community/src/interfaces/iModule';

// Use satisfies for type safety (catches typos) while allowing extra modules not in release types
export const AllGridCommunityModules: Record<`${CommunityModuleName}Module` | 'FileInputOverlayModule', true> = {
    AlignedGridsModule: true,
    AllCommunityModule: true,
    AutoGenerateColumnsModule: true,
    CellApiModule: true,
    CellSpanModule: true,
    CellStyleModule: true,
    CheckboxEditorModule: true,
    BigIntFilterModule: true,
    ClientSideRowModelApiModule: true,
    ClientSideRowModelModule: true,
    ColumnApiModule: true,
    ColumnAutoSizeModule: true,
    ColumnHoverModule: true,
    CsvExportModule: true,
    CustomEditorModule: true,
    CustomFilterModule: true,
    DateEditorModule: true,
    DateFilterModule: true,
    DragAndDropModule: true,
    EventApiModule: true,
    ExternalFilterModule: true,
    GridStateModule: true,
    HighlightChangesModule: true,
    InfiniteRowModelModule: true,
    LargeTextEditorModule: true,
    LocaleModule: true,
    NumberEditorModule: true,
    NumberFilterModule: true,
    PaginationPageNumbersModule: true,
    PaginationModule: true,
    PinnedRowModule: true,
    QuickFilterModule: true,
    RenderApiModule: true,
    RowApiModule: true,
    RowAutoHeightModule: true,
    RowDragModule: true,
    RowSelectionModule: true,
    RowStyleModule: true,
    ScrollApiModule: true,
    SelectEditorModule: true,
    TextEditorModule: true,
    TextFilterModule: true,
    TooltipModule: true,
    UndoRedoEditModule: true,
    ValidationModule: true,
    ValueCacheModule: true,
    FileInputOverlayModule: true,
};
export const AllEnterpriseModules: Record<`${EnterpriseModuleName}Module`, true> = {
    AdvancedFilterModule: true,
    AllEnterpriseModule: true,
    AiToolkitModule: true,
    BatchEditModule: true,
    CalculatedColumnsModule: true,
    CellSelectionModule: true,
    ClipboardModule: true,
    ColumnMenuModule: true,
    ColumnsToolPanelModule: true,
    ContextMenuModule: true,
    ExcelExportModule: true,
    FiltersToolPanelModule: true,
    FindModule: true,
    FormulaModule: true,
    GridChartsModule: true,
    GroupFilterModule: true,
    IntegratedChartsModule: true,
    MasterDetailModule: true,
    MenuModule: true,
    MultiFilterModule: true,
    NewFiltersToolPanelModule: true,
    PivotModule: true,
    RangeSelectionModule: true,
    RichSelectModule: true,
    RowNumbersModule: true,
    NotesModule: true,
    PdfExportModule: true,
    RowGroupingEditModule: true,
    RowGroupingModule: true,
    RowGroupingPanelModule: true,
    ServerSideRowModelApiModule: true,
    ServerSideRowModelModule: true,
    SetFilterModule: true,
    ShowValuesAsModule: true,
    SideBarModule: true,
    SparklinesModule: true,
    StatusBarModule: true,
    ToolbarModule: true,
    TreeDataModule: true,
    ViewportRowModelModule: true,
};

interface ModuleTest {
    modules: `${ModuleName}Module`[];
}

const allGridCommunityModules: ModuleTest[] = Object.keys(AllGridCommunityModules).map((m) => ({
    modules: [m as `${ModuleName}Module`],
}));
const allEnterpriseModules: ModuleTest[] = Object.keys(AllEnterpriseModules).map((m) => ({
    modules: [m as `${ModuleName}Module`],
}));

const commonFeatureSets: ModuleTest[] = [
    { modules: ['ClientSideRowModelModule', 'TextFilterModule'] },
    {
        modules: [
            'TextFilterModule',
            'NumberFilterModule',
            'DateFilterModule',
            'SetFilterModule',
            'MultiFilterModule',
            'CustomFilterModule',
            'ExternalFilterModule',
            'QuickFilterModule',
        ],
    },
];

// const chartModules: ModuleTest[] = [
//     {
//         modules: ['AgChartsCommunityModule' as any, 'IntegratedChartsModule'],
//     },
//     {
//         modules: ['AgChartsEnterpriseModule' as any, 'IntegratedChartsModule'],
//     },
//     {
//         modules: ['AgChartsCommunityModule' as any, 'SparklinesModule'],
//     },
//     {
//         modules: ['AgChartsEnterpriseModule' as any, 'SparklinesModule'],
//     },
// ];

export const baseModule = { modules: [] };

export const moduleCombinations: ModuleTest[] = [
    ...commonFeatureSets,
    // ...chartModules,
    ...allGridCommunityModules, //.slice(0, 3),
    ...allEnterpriseModules, //.slice(0, 3),
];
