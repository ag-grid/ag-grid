import {
    CommunityModuleName,
    EnterpriseModuleName,
    ModuleName,
} from '../../packages/ag-grid-community/src/interfaces/iModule';

export const AllGridCommunityModules: Record<`${CommunityModuleName}Module`, number> = {
    AlignedGridsModule: 3.06,
    AllCommunityModule: 426.39,
    CellApiModule: 0.28,
    CellStyleModule: 2.24,
    CheckboxEditorModule: 18.81,
    ClientSideRowModelApiModule: 1.88,
    ClientSideRowModelModule: 29.1,
    ColumnApiModule: 3.6,
    ColumnAutoSizeModule: 6.34,
    ColumnHoverModule: 1.58,
    CsvExportModule: 11.3,
    CustomEditorModule: 17.36,
    CustomFilterModule: 67.45,
    DateEditorModule: 22.02,
    DateFilterModule: 122.23,
    DragAndDropModule: 1,
    EventApiModule: 2.64,
    ExternalFilterModule: 12.67,
    GridStateModule: 14.7,
    HighlightChangesModule: 5.09,
    InfiniteRowModelModule: 18,
    LargeTextEditorModule: 18.6,
    LocaleModule: 0.43,
    NumberEditorModule: 22.82,
    NumberFilterModule: 120.56,
    PaginationModule: 42.74,
    PinnedRowModule: 18.27,
    QuickFilterModule: 17.3,
    RenderApiModule: 1.48,
    RowApiModule: 0.88,
    RowAutoHeightModule: 1.84,
    RowDragModule: 15.49,
    RowSelectionModule: 33.5,
    RowStyleModule: 1.24,
    ScrollApiModule: 0.7,
    SelectEditorModule: 31.89,
    TextEditorModule: 19.95,
    TextFilterModule: 116.55,
    TooltipModule: 22.24,
    UndoRedoEditModule: 23.5,
    ValidationModule: 69.88,
    ValueCacheModule: 0.65,
    CellSpanModule: 8.08,
};
export const AllEnterpriseModules: Record<`${EnterpriseModuleName}Module`, number> = {
    AdvancedFilterModule: 200,
    AllEnterpriseModule: 1401.82,
    CellSelectionModule: 53,
    ClipboardModule: 44.6,
    ColumnMenuModule: 153.19,
    ColumnsToolPanelModule: 146,
    ContextMenuModule: 72,
    ExcelExportModule: 84,
    FiltersToolPanelModule: 129.24,
    FindModule: 14.51,
    GridChartsModule: 67,
    IntegratedChartsModule: 392,
    GroupFilterModule: 107.83,
    MasterDetailModule: 82,
    MenuModule: 159.93,
    MultiFilterModule: 141.31,
    PivotModule: 93.6,
    RangeSelectionModule: 53,
    RichSelectModule: 77,
    RowNumbersModule: 29,
    RowGroupingModule: 79.85,
    RowGroupingPanelModule: 71,
    ServerSideRowModelApiModule: 19,
    ServerSideRowModelModule: 147,
    SetFilterModule: 147.31,
    SideBarModule: 32,
    SparklinesModule: 20,
    StatusBarModule: 27,
    TreeDataModule: 94.81,
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
    { modules: ['ClientSideRowModelModule', 'TextFilterModule'], expectedSize: 145.47 },
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
        expectedSize: 247.09,
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

export const baseModule = { modules: [], expectedSize: 470 };

export const moduleCombinations: ModuleTest[] = [
    ...commonFeatureSets,
    // ...chartModules,
    ...allGridCommunityModules, //.slice(0, 3),
    ...allEnterpriseModules, //.slice(0, 3),
];
