/*
 * Used for umd bundles without styles, as well as cjs/esm packaging
 */
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { AdvancedFilterModule } from '@ag-grid-enterprise/advanced-filter';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { MultiFilterModule } from '@ag-grid-enterprise/multi-filter';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import { SparklinesModule } from '@ag-grid-enterprise/sparklines';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { ViewportRowModelModule } from '@ag-grid-enterprise/viewport-row-model';

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

export * from '@ag-grid-community/core';
export * from '@ag-grid-community/theming';
export * from '@ag-grid-enterprise/core';
export * from '@ag-grid-enterprise/advanced-filter';
export * from '@ag-grid-enterprise/charts';
export * from '@ag-grid-enterprise/clipboard';
export * from '@ag-grid-enterprise/column-tool-panel';
export * from '@ag-grid-enterprise/excel-export';
export * from '@ag-grid-enterprise/filter-tool-panel';
export * from '@ag-grid-enterprise/master-detail';
export * from '@ag-grid-enterprise/menu';
export * from '@ag-grid-enterprise/multi-filter';
export * from '@ag-grid-enterprise/range-selection';
export * from '@ag-grid-enterprise/rich-select';
export * from '@ag-grid-enterprise/row-grouping';
export * from '@ag-grid-enterprise/server-side-row-model';
export * from '@ag-grid-enterprise/set-filter';
export * from '@ag-grid-enterprise/side-bar';
export * from '@ag-grid-enterprise/sparklines';
export * from '@ag-grid-enterprise/status-bar';
export * from '@ag-grid-enterprise/viewport-row-model';
