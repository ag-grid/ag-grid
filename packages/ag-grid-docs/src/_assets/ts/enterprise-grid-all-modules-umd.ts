// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

import "../../../../../community-modules/grid-core/src/styles/ag-grid.scss";

import "../../../../../community-modules/grid-core/src/styles/ag-theme-material/sass/ag-theme-material.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-fresh/sass/ag-theme-fresh.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-dark/sass/ag-theme-dark.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-blue/sass/ag-theme-blue.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-bootstrap/sass/ag-theme-bootstrap.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-balham-dark/sass/ag-theme-balham-dark.scss";


import { ModuleRegistry } from "../../../../../community-modules/grid-core/src/ts/main";
export * from "../../../../../community-modules/grid-core/src/ts/main";

// spl modules
/* MODULES - Don't delete this line */
import "../../../../../enterprise-modules/charts/src/chartsModule.ts";
import {ChartsModule} from "../../../../../enterprise-modules/charts/src/chartsModule"; 
        
import "../../../../../enterprise-modules/clipboard/src/clipboardModule.ts";
import {ClipboardModule} from "../../../../../enterprise-modules/clipboard/src/clipboardModule"; 
        
import "../../../../../enterprise-modules/column-tool-panel/src/columnsToolPanelModule.ts";
import {ColumnsToolPanelModule} from "../../../../../enterprise-modules/column-tool-panel/src/columnsToolPanelModule"; 
        
import "../../../../../enterprise-modules/excel-export/src/excelExportModule.ts";
import {ExcelExportModule} from "../../../../../enterprise-modules/excel-export/src/excelExportModule"; 
        
import "../../../../../enterprise-modules/filter-tool-panel/src/filtersToolPanelModule.ts";
import {FiltersToolPanelModule} from "../../../../../enterprise-modules/filter-tool-panel/src/filtersToolPanelModule"; 
        
import "../../../../../enterprise-modules/grid-charts/src/gridChartsModule.ts";
import {GridChartsModule} from "../../../../../enterprise-modules/grid-charts/src/gridChartsModule"; 
        
import "../../../../../enterprise-modules/master-detail/src/masterDetailModule.ts";
import {MasterDetailModule} from "../../../../../enterprise-modules/master-detail/src/masterDetailModule"; 
        
import "../../../../../enterprise-modules/menu/src/menuModule.ts";
import {MenuModule} from "../../../../../enterprise-modules/menu/src/menuModule"; 
        
import "../../../../../enterprise-modules/range-selection/src/rangeSelectionModule.ts";
import {RangeSelectionModule} from "../../../../../enterprise-modules/range-selection/src/rangeSelectionModule"; 
        
import "../../../../../enterprise-modules/rich-select/src/richSelectModule.ts";
import {RichSelectModule} from "../../../../../enterprise-modules/rich-select/src/richSelectModule"; 
        
import "../../../../../enterprise-modules/row-grouping/src/rowGroupingModule.ts";
import {RowGroupingModule} from "../../../../../enterprise-modules/row-grouping/src/rowGroupingModule"; 
        
import "../../../../../enterprise-modules/server-side-row-model/src/serverSideRowModelModule.ts";
import {ServerSideRowModelModule} from "../../../../../enterprise-modules/server-side-row-model/src/serverSideRowModelModule"; 
        
import "../../../../../enterprise-modules/set-filter/src/setFilterModule.ts";
import {SetFilterModule} from "../../../../../enterprise-modules/set-filter/src/setFilterModule"; 
        
import "../../../../../enterprise-modules/side-bar/src/sideBarModule.ts";
import {SideBarModule} from "../../../../../enterprise-modules/side-bar/src/sideBarModule"; 
        
import "../../../../../enterprise-modules/status-bar/src/statusBarModule.ts";
import {StatusBarModule} from "../../../../../enterprise-modules/status-bar/src/statusBarModule"; 
        
import "../../../../../enterprise-modules/viewport-row-model/src/viewportRowModelModule.ts";
import {ViewportRowModelModule} from "../../../../../enterprise-modules/viewport-row-model/src/viewportRowModelModule"; 
        
import "../../../../../community-modules/client-side-row-model/src/clientSideRowModelModule.ts";
import {ClientSideRowModelModule} from "../../../../../community-modules/client-side-row-model/src/clientSideRowModelModule"; 
        
import "../../../../../community-modules/csv-export/src/csvExportModule.ts";
import {CsvExportModule} from "../../../../../community-modules/csv-export/src/csvExportModule"; 
        
import "../../../../../community-modules/infinite-row-model/src/infiniteRowModelModule.ts";
import {InfiniteRowModelModule} from "../../../../../community-modules/infinite-row-model/src/infiniteRowModelModule"; 
        
ModuleRegistry.register(ChartsModule as any);
ModuleRegistry.register(ClipboardModule as any);
ModuleRegistry.register(ColumnsToolPanelModule as any);
ModuleRegistry.register(ExcelExportModule as any);
ModuleRegistry.register(FiltersToolPanelModule as any);
ModuleRegistry.register(GridChartsModule as any);
ModuleRegistry.register(MasterDetailModule as any);
ModuleRegistry.register(MenuModule as any);
ModuleRegistry.register(RangeSelectionModule as any);
ModuleRegistry.register(RichSelectModule as any);
ModuleRegistry.register(RowGroupingModule as any);
ModuleRegistry.register(ServerSideRowModelModule as any);
ModuleRegistry.register(SetFilterModule as any);
ModuleRegistry.register(SideBarModule as any);
ModuleRegistry.register(StatusBarModule as any);
ModuleRegistry.register(ViewportRowModelModule as any);
ModuleRegistry.register(ClientSideRowModelModule as any);
ModuleRegistry.register(CsvExportModule as any);
ModuleRegistry.register(InfiniteRowModelModule as any);