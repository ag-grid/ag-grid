/*
 * Used for umd bundles without styles
 */
import {
    ClientSideRowModelModule,
    CommunityFeaturesModule,
    CsvExportModule,
    InfiniteRowModelModule,
    ModuleRegistry,
} from 'ag-grid-community';

import {
    AdvancedFilterModule,
    ClipboardModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    MasterDetailModule,
    MenuModule,
    MultiFilterModule,
    RangeSelectionModule,
    RichSelectModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    SetFilterModule,
    SideBarModule,
    SparklinesModule,
    StatusBarModule,
    ViewportRowModelModule,
} from './main';

import { GridChartsModule } from './charts/main'

ModuleRegistry.__registerModules(
    [
        CommunityFeaturesModule,
        ClientSideRowModelModule,
        InfiniteRowModelModule,
        CsvExportModule,
        AdvancedFilterModule,
        GridChartsModule,
        ClipboardModule,
        ColumnsToolPanelModule,
        ExcelExportModule,
        FiltersToolPanelModule,
        MasterDetailModule,
        MenuModule,
        MultiFilterModule,
        RangeSelectionModule,
        RichSelectModule,
        RowGroupingModule,
        ServerSideRowModelModule,
        SetFilterModule,
        SideBarModule,
        SparklinesModule,
        StatusBarModule,
        ViewportRowModelModule,
    ],
    false,
    undefined
);

export * from 'ag-grid-community';
export * from './main';
