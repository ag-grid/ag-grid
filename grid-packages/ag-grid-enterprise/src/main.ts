import {ModuleRegistry} from "ag-grid-community";

import {ColumnsToolPanelModule} from "@ag-grid-enterprise/column-tool-panel";
import {ExcelExportModule} from "@ag-grid-enterprise/excel-export";
import {FiltersToolPanelModule} from "@ag-grid-enterprise/filter-tool-panel";
import {GridChartsModule} from "@ag-grid-enterprise/charts";
import {MasterDetailModule} from "@ag-grid-enterprise/master-detail";
import {MenuModule} from "@ag-grid-enterprise/menu";
import {RangeSelectionModule} from "@ag-grid-enterprise/range-selection";
import {RichSelectModule} from "@ag-grid-enterprise/rich-select";
import {RowGroupingModule} from "@ag-grid-enterprise/row-grouping";
import {ServerSideRowModelModule} from "@ag-grid-enterprise/server-side-row-model";
import {SetFilterModule} from "@ag-grid-enterprise/set-filter";
import {SideBarModule} from "@ag-grid-enterprise/side-bar";
import {StatusBarModule} from "@ag-grid-enterprise/status-bar";
import {ViewportRowModelModule} from "@ag-grid-enterprise/viewport-row-model";
import {ClipboardModule} from "@ag-grid-enterprise/clipboard";

ModuleRegistry.register(ColumnsToolPanelModule as any, false);
ModuleRegistry.register(ExcelExportModule as any, false);
ModuleRegistry.register(FiltersToolPanelModule as any, false);
ModuleRegistry.register(GridChartsModule as any, false);
ModuleRegistry.register(MasterDetailModule as any, false);
ModuleRegistry.register(MenuModule as any, false);
ModuleRegistry.register(RangeSelectionModule as any, false);
ModuleRegistry.register(RichSelectModule as any, false);
ModuleRegistry.register(RowGroupingModule as any, false);
ModuleRegistry.register(ServerSideRowModelModule as any, false);
ModuleRegistry.register(SetFilterModule as any, false);
ModuleRegistry.register(SideBarModule as any, false);
ModuleRegistry.register(StatusBarModule as any, false);
ModuleRegistry.register(ViewportRowModelModule as any, false);
ModuleRegistry.register(ClipboardModule as any, false);

export {VirtualList} from "ag-grid-community";
export {LicenseManager} from "@ag-grid-enterprise/core";
export {SetFilter} from "@ag-grid-enterprise/set-filter";
