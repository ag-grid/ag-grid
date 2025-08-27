import type {
    CommunityModuleName,
    EnterpriseModuleName,
    ModuleName,
} from '../../packages/ag-grid-community/src/interfaces/iModule';

export const AllGridCommunityModules: Record<`${CommunityModuleName}Module`, number> = {
    AlignedGridsModule: 6.88,
    AllCommunityModule: 481.68,
    CellApiModule: 0.28,
    CellStyleModule: 2.24,
    CheckboxEditorModule: 64.61,
    ClientSideRowModelApiModule: 1.88,
    ClientSideRowModelModule: 29.1,
    ColumnApiModule: 3.6,
    ColumnAutoSizeModule: 6.34,
    ColumnHoverModule: 1.58,
    CsvExportModule: 11.3,
    CustomEditorModule: 63.38,
    CustomFilterModule: 72,
    DateEditorModule: 69.67,
    DateFilterModule: 130,
    DragAndDropModule: 1,
    EventApiModule: 2.64,
    ExternalFilterModule: 12.67,
    GridStateModule: 14.7,
    HighlightChangesModule: 5.09,
    InfiniteRowModelModule: 18,
    LargeTextEditorModule: 65.52,
    LocaleModule: 0.43,
    NumberEditorModule: 68.84,
    NumberFilterModule: 128.72,
    PaginationModule: 42.74,
    PinnedRowModule: 18.27,
    QuickFilterModule: 17.3,
    RenderApiModule: 1.48,
    RowApiModule: 0.88,
    RowAutoHeightModule: 1.84,
    RowDragModule: 20.71,
    RowSelectionModule: 34.59,
    RowStyleModule: 1.24,
    ScrollApiModule: 0.7,
    SelectEditorModule: 78.75,
    TextEditorModule: 66.67,
    TextFilterModule: 124,
    TooltipModule: 23.68,
    UndoRedoEditModule: 69.34,
    ValidationModule: 72.17,
    ValueCacheModule: 0.65,
    CellSpanModule: 8.08,
};
export const AllEnterpriseModules: Record<`${EnterpriseModuleName}Module`, number> = {
    AdvancedFilterModule: 217.72,
    AllEnterpriseModule: 1488.51,
    BatchEditModule: 78.76,
    CellSelectionModule: 55,
    ClipboardModule: 46.04,
    ColumnMenuModule: 153.19,
    ColumnsToolPanelModule: 146,
    ContextMenuModule: 72,
    ExcelExportModule: 84,
    FiltersToolPanelModule: 133.66,
    FindModule: 14.51,
    GridChartsModule: 69.02,
    IntegratedChartsModule: 397.78,
    GroupFilterModule: 115.18,
    MasterDetailModule: 82,
    MenuModule: 159.93,
    MultiFilterModule: 145.8,
    NewFiltersToolPanelModule: 169.77,
    PivotModule: 99.56,
    RangeSelectionModule: 55,
    RichSelectModule: 120.23,
    RowNumbersModule: 30,
    RowGroupingModule: 85.49,
    RowGroupingPanelModule: 71,
    ServerSideRowModelApiModule: 19,
    ServerSideRowModelModule: 155.08,
    SetFilterModule: 152.16,
    SideBarModule: 33.16,
    SparklinesModule: 20,
    StatusBarModule: 27,
    TreeDataModule: 88.17,
    ViewportRowModelModule: 27,
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
        expectedSize: 257.95,
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

export const baseModule = { modules: [], expectedSize: 495.72 };

export const moduleCombinations: ModuleTest[] = [
    ...commonFeatureSets,
    // ...chartModules,
    ...allGridCommunityModules, //.slice(0, 3),
    ...allEnterpriseModules, //.slice(0, 3),
];
