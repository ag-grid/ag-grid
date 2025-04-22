import {
    CommunityModuleName,
    EnterpriseModuleName,
    ModuleName,
} from '../../packages/ag-grid-community/src/interfaces/iModule';

export const AllGridCommunityModules: Record<`${CommunityModuleName}Module`, number> = {
    AlignedGridsModule: 3.06,
    AllCommunityModule: 405,
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
    CustomFilterModule: 54.48,
    DateEditorModule: 22.02,
    DateFilterModule: 110,
    DragAndDropModule: 1,
    EventApiModule: 2.64,
    ExternalFilterModule: 13.69,
    GridStateModule: 13.24,
    HighlightChangesModule: 3.92,
    InfiniteRowModelModule: 17,
    LargeTextEditorModule: 18.6,
    LocaleModule: 0.43,
    NumberEditorModule: 22.82,
    NumberFilterModule: 107,
    PaginationModule: 42.74,
    PinnedRowModule: 18.27,
    QuickFilterModule: 17.3,
    RenderApiModule: 1.48,
    RowApiModule: 0.88,
    RowAutoHeightModule: 1.84,
    RowDragModule: 13,
    RowSelectionModule: 33.5,
    RowStyleModule: 1.24,
    ScrollApiModule: 0.7,
    SelectEditorModule: 31.89,
    TextEditorModule: 19.95,
    TextFilterModule: 104,
    TooltipModule: 22.24,
    UndoRedoEditModule: 23.5,
    ValidationModule: 70,
    ValueCacheModule: 0.65,
    CellSpanModule: 8.08,
};
export const AllEnterpriseModules: Record<`${EnterpriseModuleName}Module`, number> = {
    AdvancedFilterModule: 200,
    AllEnterpriseModule: 1368,
    CellSelectionModule: 53,
    ClipboardModule: 44.6,
    ColumnMenuModule: 147,
    ColumnsToolPanelModule: 146,
    ContextMenuModule: 72,
    ExcelExportModule: 84,
    FiltersToolPanelModule: 116,
    FindModule: 14.51,
    GridChartsModule: 67,
    IntegratedChartsModule: 392,
    GroupFilterModule: 93,
    MasterDetailModule: 82,
    MenuModule: 153,
    MultiFilterModule: 121,
    PivotModule: 90.61,
    RangeSelectionModule: 53,
    RichSelectModule: 77,
    RowNumbersModule: 26,
    RowGroupingModule: 77.52,
    RowGroupingPanelModule: 71,
    ServerSideRowModelApiModule: 19,
    ServerSideRowModelModule: 147,
    SetFilterModule: 140,
    SideBarModule: 32,
    SparklinesModule: 20,
    StatusBarModule: 27,
    TreeDataModule: 94.81,
    ViewportRowModelModule: 26,
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

export const baseModule = { modules: [], expectedSize: 465 };

export const moduleCombinations: ModuleTest[] = [
    ...commonFeatureSets,
    // ...chartModules,
    ...allGridCommunityModules, //.slice(0, 3),
    ...allEnterpriseModules, //.slice(0, 3),
];
