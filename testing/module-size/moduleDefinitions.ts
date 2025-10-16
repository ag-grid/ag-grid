import type {
    CommunityModuleName,
    EnterpriseModuleName,
    ModuleName,
} from '../../packages/ag-grid-community/src/interfaces/iModule';

export const AllGridCommunityModules: Record<`${CommunityModuleName}Module`, number> = {
    AlignedGridsModule: 6.88,
    AllCommunityModule: 486.87,
    CellApiModule: 0.28,
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
    SelectEditorModule: 81.29,
    TextEditorModule: 68.96,
    TextFilterModule: 124,
    TooltipModule: 24.69,
    UndoRedoEditModule: 71.8,
    ValidationModule: 74.37,
    ValueCacheModule: 0.65,
    CellSpanModule: 8.08,
};
export const AllEnterpriseModules: Record<`${EnterpriseModuleName}Module`, number> = {
    AdvancedFilterModule: 217.72,
    AllEnterpriseModule: 1529.62,
    BatchEditModule: 84.56,
    CellSelectionModule: 56.66,
    ClipboardModule: 47.54,
    ColumnMenuModule: 158.26,
    ColumnsToolPanelModule: 151.46,
    ContextMenuModule: 74.91,
    ExcelExportModule: 84,
    FiltersToolPanelModule: 133.66,
    FindModule: 14.51,
    GridChartsModule: 71.68,
    IntegratedChartsModule: 402.79,
    GroupFilterModule: 115.18,
    MasterDetailModule: 85.07,
    MenuModule: 164.97,
    MultiFilterModule: 145.8,
    NewFiltersToolPanelModule: 175.34,
    PivotModule: 99.56,
    RangeSelectionModule: 56.72,
    RichSelectModule: 124.09,
    RowNumbersModule: 32.05,
    RowGroupingModule: 88.23,
    RowGroupingPanelModule: 73.59,
    ServerSideRowModelApiModule: 20.55,
    ServerSideRowModelModule: 160.53,
    SetFilterModule: 152.16,
    SideBarModule: 33.16,
    SparklinesModule: 20.5,
    StatusBarModule: 28,
    TreeDataModule: 83.97,
    ViewportRowModelModule: 28,
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

export const baseModule = { modules: [], expectedSize: 501.06 };

export const moduleCombinations: ModuleTest[] = [
    ...commonFeatureSets,
    // ...chartModules,
    ...allGridCommunityModules, //.slice(0, 3),
    ...allEnterpriseModules, //.slice(0, 3),
];
