import type {
    CommunityModuleName,
    EnterpriseModuleName,
    ModuleName,
} from '../../packages/ag-grid-community/src/interfaces/iModule';

export const AllGridCommunityModules: Record<`${CommunityModuleName}Module`, number> = {
    AlignedGridsModule: 6.88,
    AllCommunityModule: 490.14,
    CellApiModule: 0.28,
    CellSpanModule: 8.08,
    CellStyleModule: 2.24,
    CheckboxEditorModule: 66.89,
    ClientSideRowModelApiModule: 1.88,
    ClientSideRowModelModule: 29.1,
    ColumnApiModule: 3.6,
    ColumnAutoSizeModule: 7.6,
    ColumnHoverModule: 1.58,
    CsvExportModule: 11.3,
    CustomEditorModule: 65.66,
    CustomFilterModule: 72,
    DateEditorModule: 71.96,
    DateFilterModule: 130,
    DragAndDropModule: 1,
    EventApiModule: 2.64,
    ExternalFilterModule: 12.67,
    GridStateModule: 14.7,
    HighlightChangesModule: 5.09,
    InfiniteRowModelModule: 18,
    LargeTextEditorModule: 67.8,
    LocaleModule: 0.43,
    NumberEditorModule: 71.15,
    NumberFilterModule: 128.72,
    PaginationModule: 42.74,
    PinnedRowModule: 19.31,
    QuickFilterModule: 17.3,
    RenderApiModule: 1.48,
    RowApiModule: 0.88,
    RowAutoHeightModule: 1.84,
    RowDragModule: 20.71,
    RowSelectionModule: 34.59,
    RowStyleModule: 1.24,
    ScrollApiModule: 0.7,
    SelectEditorModule: 81.4,
    TextEditorModule: 68.96,
    TextFilterModule: 124,
    TooltipModule: 25.06,
    UndoRedoEditModule: 71.8,
    ValidationModule: 74.37,
    ValueCacheModule: 0.65,
};
export const AllEnterpriseModules: Record<`${EnterpriseModuleName}Module`, number> = {
    AdvancedFilterModule: 223.75,
    AllEnterpriseModule: 1551,
    AiToolkitModule: 19.41,
    BatchEditModule: 84.54,
    CellSelectionModule: 58,
    ClipboardModule: 47.54,
    ColumnMenuModule: 159.04,
    ColumnsToolPanelModule: 150.64,
    ContextMenuModule: 75.36,
    ExcelExportModule: 84,
    FiltersToolPanelModule: 137.67,
    FindModule: 14.51,
    FormulaModule: 59.13,
    GridChartsModule: 71.71,
    GroupFilterModule: 115.18,
    IntegratedChartsModule: 405.32,
    MasterDetailModule: 85.8,
    MenuModule: 166.7,
    MultiFilterModule: 150.56,
    NewFiltersToolPanelModule: 175.32,
    PivotModule: 102.59,
    RangeSelectionModule: 58,
    RichSelectModule: 127.92,
    RowNumbersModule: 32.03,
    RowGroupingModule: 88.46,
    RowGroupingPanelModule: 73.57,
    ServerSideRowModelApiModule: 20.53,
    ServerSideRowModelModule: 160.58,
    SetFilterModule: 152.16,
    SideBarModule: 35.16,
    SparklinesModule: 22.06,
    StatusBarModule: 29.09,
    TreeDataModule: 83.97,
    ViewportRowModelModule: 29.19,
};

export interface ModuleTest {
    modules: `${ModuleName}Module`[];
    expectedSize: number;
}

const allGridCommunityModules: ModuleTest[] = Object.entries(AllGridCommunityModules).map(([m, s]) => ({
    modules: [m as `${ModuleName}Module`],
    expectedSize: s,
}));
const allEnterpriseModules: ModuleTest[] = Object.entries(AllEnterpriseModules).map(([m, s]) => ({
    modules: [m as `${ModuleName}Module`],
    expectedSize: s,
}));

const commonFeatureSets: ModuleTest[] = [
    { modules: ['ClientSideRowModelModule', 'TextFilterModule'], expectedSize: 150.22 },
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
        expectedSize: 263.25,
    },
];

const chartModules: ModuleTest[] = [
    {
        modules: ['AgChartsCommunityModule' as any, 'IntegratedChartsModule'],
        expectedSize: 1209.02,
    },
    {
        modules: ['AgChartsEnterpriseModule' as any, 'IntegratedChartsModule'],
        expectedSize: 1917.52,
    },
    {
        modules: ['AgChartsCommunityModule' as any, 'SparklinesModule'],
        expectedSize: 834.4,
    },
    {
        modules: ['AgChartsEnterpriseModule' as any, 'SparklinesModule'],
        expectedSize: 1549.16,
    },
];

export const baseModule = { modules: [], expectedSize: 501.06 };

export const moduleCombinations: ModuleTest[] = [
    ...commonFeatureSets,
    // ...chartModules,
    ...allGridCommunityModules, //.slice(0, 3),
    ...allEnterpriseModules, //.slice(0, 3),
];
