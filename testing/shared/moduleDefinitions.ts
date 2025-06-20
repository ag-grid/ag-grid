import type {
    CommunityModuleName,
    EnterpriseModuleName,
    ModuleName,
} from '../../packages/ag-grid-community/src/interfaces/iModule';

export const AllGridCommunityModules: Record<`${CommunityModuleName}Module`, number> = {
    AlignedGridsModule: 3.06,
    AllCommunityModule: 465.78,
    CellApiModule: 0.28,
    CellStyleModule: 2.24,
    CheckboxEditorModule: 61.55,
    ClientSideRowModelApiModule: 1.88,
    ClientSideRowModelModule: 29.1,
    ColumnApiModule: 3.6,
    ColumnAutoSizeModule: 6.34,
    ColumnHoverModule: 1.58,
    CsvExportModule: 11.3,
    CustomEditorModule: 53.51,
    CustomFilterModule: 70.29,
    DateEditorModule: 66.63,
    DateFilterModule: 126.13,
    DragAndDropModule: 1,
    EventApiModule: 2.64,
    ExternalFilterModule: 12.67,
    GridStateModule: 14.7,
    HighlightChangesModule: 5.09,
    InfiniteRowModelModule: 18,
    LargeTextEditorModule: 62.16,
    LocaleModule: 0.43,
    NumberEditorModule: 65.81,
    NumberFilterModule: 124.22,
    PaginationModule: 42.74,
    PinnedRowModule: 18.27,
    QuickFilterModule: 17.3,
    RenderApiModule: 1.48,
    RowApiModule: 0.88,
    RowAutoHeightModule: 1.84,
    RowDragModule: 16.66,
    RowSelectionModule: 34.59,
    RowStyleModule: 1.24,
    ScrollApiModule: 0.7,
    SelectEditorModule: 75.08,
    TextEditorModule: 63.57,
    TextFilterModule: 120.09,
    TooltipModule: 23.68,
    UndoRedoEditModule: 65.83,
    ValidationModule: 69.88,
    ValueCacheModule: 0.65,
    CellSpanModule: 8.08,
};
export const AllEnterpriseModules: Record<`${EnterpriseModuleName}Module`, number> = {
    AdvancedFilterModule: 200,
    AllEnterpriseModule: 1454.22,
    BatchEditModule: 72.89,
    CellSelectionModule: 53,
    ClipboardModule: 46.04,
    ColumnMenuModule: 153.19,
    ColumnsToolPanelModule: 146,
    ContextMenuModule: 72,
    ExcelExportModule: 84,
    FiltersToolPanelModule: 129.24,
    FindModule: 14.51,
    GridChartsModule: 67,
    IntegratedChartsModule: 392,
    GroupFilterModule: 111.24,
    MasterDetailModule: 82,
    MenuModule: 159.93,
    MultiFilterModule: 141.31,
    NewFiltersToolPanelModule: 164.51,
    PivotModule: 93.6,
    RangeSelectionModule: 53,
    RichSelectModule: 113.16,
    RowNumbersModule: 29,
    RowGroupingModule: 79.85,
    RowGroupingPanelModule: 71,
    ServerSideRowModelApiModule: 19,
    ServerSideRowModelModule: 147,
    SetFilterModule: 147.31,
    SideBarModule: 32,
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
    { modules: ['ClientSideRowModelModule', 'TextFilterModule'], expectedSize: 133.67 },
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
        expectedSize: 230,
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

export const baseModule = { modules: [], expectedSize: 483 };

export const moduleCombinations: ModuleTest[] = [
    ...commonFeatureSets,
    ...chartModules,
    ...allGridCommunityModules,
    ...allEnterpriseModules,
];
