// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/grid-core/dist/cjs/main");
export * from "../../../../../community-modules/grid-core/dist/cjs/main";
export * from "../../../../../enterprise-modules/grid-core/dist/cjs/main";

/* MODULES - Don't delete this line */
require("../../../../../enterprise-modules/grid-charts/dist/cjs/gridChartsModule");
const GridChartsModule = require("../../../../../enterprise-modules/grid-charts/dist/cjs/gridChartsModule").GridChartsModule;
        
require("../../../../../enterprise-modules/grid-clipboard/dist/cjs/clipboardModule");
const ClipboardModule = require("../../../../../enterprise-modules/grid-clipboard/dist/cjs/clipboardModule").ClipboardModule;
        
require("../../../../../enterprise-modules/grid-column-tool-panel/dist/cjs/columnsToolPanelModule");
const ColumnsToolPanelModule = require("../../../../../enterprise-modules/grid-column-tool-panel/dist/cjs/columnsToolPanelModule").ColumnsToolPanelModule;
        
require("../../../../../enterprise-modules/grid-excel-export/dist/cjs/excelExportModule");
const ExcelExportModule = require("../../../../../enterprise-modules/grid-excel-export/dist/cjs/excelExportModule").ExcelExportModule;
        
require("../../../../../enterprise-modules/grid-filter-tool-panel/dist/cjs/filtersToolPanelModule");
const FiltersToolPanelModule = require("../../../../../enterprise-modules/grid-filter-tool-panel/dist/cjs/filtersToolPanelModule").FiltersToolPanelModule;
        
require("../../../../../enterprise-modules/grid-master-detail/dist/cjs/masterDetailModule");
const MasterDetailModule = require("../../../../../enterprise-modules/grid-master-detail/dist/cjs/masterDetailModule").MasterDetailModule;
        
require("../../../../../enterprise-modules/grid-menu/dist/cjs/menuModule");
const MenuModule = require("../../../../../enterprise-modules/grid-menu/dist/cjs/menuModule").MenuModule;
        
require("../../../../../enterprise-modules/grid-range-selection/dist/cjs/rangeSelectionModule");
const RangeSelectionModule = require("../../../../../enterprise-modules/grid-range-selection/dist/cjs/rangeSelectionModule").RangeSelectionModule;
        
require("../../../../../enterprise-modules/grid-rich-select/dist/cjs/richSelectModule");
const RichSelectModule = require("../../../../../enterprise-modules/grid-rich-select/dist/cjs/richSelectModule").RichSelectModule;
        
require("../../../../../enterprise-modules/grid-row-grouping/dist/cjs/rowGroupingModule");
const RowGroupingModule = require("../../../../../enterprise-modules/grid-row-grouping/dist/cjs/rowGroupingModule").RowGroupingModule;
        
require("../../../../../enterprise-modules/grid-server-side-row-model/dist/cjs/serverSideRowModelModule");
const ServerSideRowModelModule = require("../../../../../enterprise-modules/grid-server-side-row-model/dist/cjs/serverSideRowModelModule").ServerSideRowModelModule;
        
require("../../../../../enterprise-modules/grid-set-filter/dist/cjs/setFilterModule");
const SetFilterModule = require("../../../../../enterprise-modules/grid-set-filter/dist/cjs/setFilterModule").SetFilterModule;
        
require("../../../../../enterprise-modules/grid-side-bar/dist/cjs/sideBarModule");
const SideBarModule = require("../../../../../enterprise-modules/grid-side-bar/dist/cjs/sideBarModule").SideBarModule;
        
require("../../../../../enterprise-modules/grid-status-bar/dist/cjs/statusBarModule");
const StatusBarModule = require("../../../../../enterprise-modules/grid-status-bar/dist/cjs/statusBarModule").StatusBarModule;
        
require("../../../../../enterprise-modules/grid-viewport-row-model/dist/cjs/viewportRowModelModule");
const ViewportRowModelModule = require("../../../../../enterprise-modules/grid-viewport-row-model/dist/cjs/viewportRowModelModule").ViewportRowModelModule;
        
require("../../../../../community-modules/grid-client-side-row-model/dist/cjs/clientSideRowModelModule");
const ClientSideRowModelModule = require("../../../../../community-modules/grid-client-side-row-model/dist/cjs/clientSideRowModelModule").ClientSideRowModelModule;
        
require("../../../../../community-modules/grid-csv-export/dist/cjs/csvExportModule");
const CsvExportModule = require("../../../../../community-modules/grid-csv-export/dist/cjs/csvExportModule").CsvExportModule;
        
require("../../../../../community-modules/grid-infinite-row-model/dist/cjs/infiniteRowModelModule");
const InfiniteRowModelModule = require("../../../../../community-modules/grid-infinite-row-model/dist/cjs/infiniteRowModelModule").InfiniteRowModelModule;
        
ModuleRegistry.ModuleRegistry.register(GridChartsModule);
ModuleRegistry.ModuleRegistry.register(ClipboardModule);
ModuleRegistry.ModuleRegistry.register(ColumnsToolPanelModule);
ModuleRegistry.ModuleRegistry.register(ExcelExportModule);
ModuleRegistry.ModuleRegistry.register(FiltersToolPanelModule);
ModuleRegistry.ModuleRegistry.register(MasterDetailModule);
ModuleRegistry.ModuleRegistry.register(MenuModule);
ModuleRegistry.ModuleRegistry.register(RangeSelectionModule);
ModuleRegistry.ModuleRegistry.register(RichSelectModule);
ModuleRegistry.ModuleRegistry.register(RowGroupingModule);
ModuleRegistry.ModuleRegistry.register(ServerSideRowModelModule);
ModuleRegistry.ModuleRegistry.register(SetFilterModule);
ModuleRegistry.ModuleRegistry.register(SideBarModule);
ModuleRegistry.ModuleRegistry.register(StatusBarModule);
ModuleRegistry.ModuleRegistry.register(ViewportRowModelModule);
ModuleRegistry.ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.ModuleRegistry.register(CsvExportModule);
ModuleRegistry.ModuleRegistry.register(InfiniteRowModelModule);