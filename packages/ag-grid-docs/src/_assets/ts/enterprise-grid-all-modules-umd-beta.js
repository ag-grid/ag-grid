// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/grid-core/src/ts/main").ModuleRegistry;
export * from "../../../../../community-modules/grid-core/src/ts/main";
export * from "../../../../../enterprise-modules/grid-core/src/main";

/* MODULES - Don't delete this line */
const GridChartsModule = require("../../../../../enterprise-modules/grid-charts/dist/cjs/gridChartsModule").GridChartsModule; 
const ClipboardModule = require("../../../../../enterprise-modules/grid-clipboard/dist/cjs/clipboardModule").ClipboardModule; 
const ColumnsToolPanelModule = require("../../../../../enterprise-modules/grid-column-tool-panel/dist/cjs/columnsToolPanelModule").ColumnsToolPanelModule; 
const ExcelExportModule = require("../../../../../enterprise-modules/grid-excel-export/dist/cjs/excelExportModule").ExcelExportModule; 
const FiltersToolPanelModule = require("../../../../../enterprise-modules/grid-filter-tool-panel/dist/cjs/filtersToolPanelModule").FiltersToolPanelModule; 
const MasterDetailModule = require("../../../../../enterprise-modules/grid-master-detail/dist/cjs/masterDetailModule").MasterDetailModule; 
const MenuModule = require("../../../../../enterprise-modules/grid-menu/dist/cjs/menuModule").MenuModule; 
const RangeSelectionModule = require("../../../../../enterprise-modules/grid-range-selection/dist/cjs/rangeSelectionModule").RangeSelectionModule; 
const RichSelectModule = require("../../../../../enterprise-modules/grid-rich-select/dist/cjs/richSelectModule").RichSelectModule; 
const RowGroupingModule = require("../../../../../enterprise-modules/grid-row-grouping/dist/cjs/rowGroupingModule").RowGroupingModule; 
const ServerSideRowModelModule = require("../../../../../enterprise-modules/grid-server-side-row-model/dist/cjs/serverSideRowModelModule").ServerSideRowModelModule; 
const SetFilterModule = require("../../../../../enterprise-modules/grid-set-filter/dist/cjs/setFilterModule").SetFilterModule; 
const SideBarModule = require("../../../../../enterprise-modules/grid-side-bar/dist/cjs/sideBarModule").SideBarModule; 
const StatusBarModule = require("../../../../../enterprise-modules/grid-status-bar/dist/cjs/statusBarModule").StatusBarModule; 
const ViewportRowModelModule = require("../../../../../enterprise-modules/grid-viewport-row-model/dist/cjs/viewportRowModelModule").ViewportRowModelModule; 
const ClientSideRowModelModule = require("../../../../../community-modules/grid-client-side-row-model/dist/cjs/clientSideRowModelModule").ClientSideRowModelModule; 
const CsvExportModule = require("../../../../../community-modules/grid-csv-export/dist/cjs/csvExportModule").CsvExportModule; 
const InfiniteRowModelModule = require("../../../../../community-modules/grid-infinite-row-model/dist/cjs/infiniteRowModelModule").InfiniteRowModelModule; 
        
ModuleRegistry.register(GridChartsModule);
ModuleRegistry.register(ClipboardModule);
ModuleRegistry.register(ColumnsToolPanelModule);
ModuleRegistry.register(ExcelExportModule);
ModuleRegistry.register(FiltersToolPanelModule);
ModuleRegistry.register(MasterDetailModule);
ModuleRegistry.register(MenuModule);
ModuleRegistry.register(RangeSelectionModule);
ModuleRegistry.register(RichSelectModule);
ModuleRegistry.register(RowGroupingModule);
ModuleRegistry.register(ServerSideRowModelModule);
ModuleRegistry.register(SetFilterModule);
ModuleRegistry.register(SideBarModule);
ModuleRegistry.register(StatusBarModule);
ModuleRegistry.register(ViewportRowModelModule);
ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.register(CsvExportModule);
ModuleRegistry.register(InfiniteRowModelModule);
