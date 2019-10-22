import {AllCommunityModules, Module} from "@ag-community/grid-all-modules";
import {ClipboardModule} from "@ag-enterprise/clipboard";
import {ColumnsToolPanelModule} from "@ag-enterprise/column-tool-panel";
import {ExcelExportModule} from "@ag-enterprise/excel-export";
import {FiltersToolPanelModule} from "@ag-enterprise/filter-tool-panel";
import {GridChartsModule} from "@ag-enterprise/grid-charts";
import {MasterDetailModule} from "@ag-enterprise/master-detail";
import {MenuModule} from "@ag-enterprise/menu";
import {RangeSelectionModule} from "@ag-enterprise/range-selection";
import {RichSelectModule} from "@ag-enterprise/rich-select";
import {RowGroupingModule} from "@ag-enterprise/row-grouping";
import {ServerSideRowModelModule} from "@ag-enterprise/server-side-row-model";
import {SetFilterModule} from "@ag-enterprise/set-filter";
import {SideBarModule} from "@ag-enterprise/side-bar";
import {StatusBarModule} from "@ag-enterprise/status-bar";
import {ViewportRowModelModule} from "@ag-enterprise/viewport-row-model";

export * from "@ag-community/grid-all-modules";
export * from "@ag-enterprise/clipboard";
export * from "@ag-enterprise/column-tool-panel";
export * from "@ag-enterprise/excel-export";
export * from "@ag-enterprise/filter-tool-panel";
export * from "@ag-enterprise/grid-charts";
export * from "@ag-enterprise/master-detail";
export * from "@ag-enterprise/menu";
export * from "@ag-enterprise/range-selection";
export * from "@ag-enterprise/rich-select";
export * from "@ag-enterprise/row-grouping";
export * from "@ag-enterprise/server-side-row-model";
export * from "@ag-enterprise/set-filter";
export * from "@ag-enterprise/side-bar";
export * from "@ag-enterprise/status-bar";
export * from "@ag-enterprise/viewport-row-model";
export * from "@ag-enterprise/grid-core";

export const AllEnterpriseModules: Module[] = [
    ClipboardModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    GridChartsModule,
    MasterDetailModule,
    MenuModule,
    RangeSelectionModule,
    RichSelectModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    SetFilterModule,
    SideBarModule,
    StatusBarModule,
    ViewportRowModelModule
];

export const AllModules: Module[] = AllCommunityModules.concat(AllEnterpriseModules);
