// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/core/dist/cjs/main");
export * from "../../../../../community-modules/core/dist/cjs/main";
export * from "../../../../../enterprise-modules/core/dist/cjs/main";

/* MODULES - Don't delete this line */
require("../../../../../enterprise-modules/charts/dist/cjs/gridChartsModule");
const GridChartsModule = require("../../../../../enterprise-modules/charts/dist/cjs/gridChartsModule").GridChartsModule;
        
require("../../../../../enterprise-modules/clipboard/dist/cjs/clipboardModule");
const ClipboardModule = require("../../../../../enterprise-modules/clipboard/dist/cjs/clipboardModule").ClipboardModule;
        
require("../../../../../enterprise-modules/column-tool-panel/dist/cjs/columnsToolPanelModule");
const ColumnsToolPanelModule = require("../../../../../enterprise-modules/column-tool-panel/dist/cjs/columnsToolPanelModule").ColumnsToolPanelModule;
        
require("../../../../../enterprise-modules/date-time-cell-editor/dist/cjs/dateTimeCellEditorModule");
const DateTimeCellEditorModule = require("../../../../../enterprise-modules/date-time-cell-editor/dist/cjs/dateTimeCellEditorModule").DateTimeCellEditorModule;
        
require("../../../../../enterprise-modules/excel-export/dist/cjs/excelExportModule");
const ExcelExportModule = require("../../../../../enterprise-modules/excel-export/dist/cjs/excelExportModule").ExcelExportModule;
        
require("../../../../../enterprise-modules/filter-tool-panel/dist/cjs/filtersToolPanelModule");
const FiltersToolPanelModule = require("../../../../../enterprise-modules/filter-tool-panel/dist/cjs/filtersToolPanelModule").FiltersToolPanelModule;
        
require("../../../../../enterprise-modules/master-detail/dist/cjs/masterDetailModule");
const MasterDetailModule = require("../../../../../enterprise-modules/master-detail/dist/cjs/masterDetailModule").MasterDetailModule;
        
require("../../../../../enterprise-modules/menu/dist/cjs/menuModule");
const MenuModule = require("../../../../../enterprise-modules/menu/dist/cjs/menuModule").MenuModule;
        
require("../../../../../enterprise-modules/range-selection/dist/cjs/rangeSelectionModule");
const RangeSelectionModule = require("../../../../../enterprise-modules/range-selection/dist/cjs/rangeSelectionModule").RangeSelectionModule;
        
require("../../../../../enterprise-modules/rich-select/dist/cjs/richSelectModule");
const RichSelectModule = require("../../../../../enterprise-modules/rich-select/dist/cjs/richSelectModule").RichSelectModule;
        
require("../../../../../enterprise-modules/row-grouping/dist/cjs/rowGroupingModule");
const RowGroupingModule = require("../../../../../enterprise-modules/row-grouping/dist/cjs/rowGroupingModule").RowGroupingModule;
        
require("../../../../../enterprise-modules/server-side-row-model/dist/cjs/serverSideRowModelModule");
const ServerSideRowModelModule = require("../../../../../enterprise-modules/server-side-row-model/dist/cjs/serverSideRowModelModule").ServerSideRowModelModule;
        
require("../../../../../enterprise-modules/set-filter/dist/cjs/setFilterModule");
const SetFilterModule = require("../../../../../enterprise-modules/set-filter/dist/cjs/setFilterModule").SetFilterModule;
        
require("../../../../../enterprise-modules/side-bar/dist/cjs/sideBarModule");
const SideBarModule = require("../../../../../enterprise-modules/side-bar/dist/cjs/sideBarModule").SideBarModule;
        
require("../../../../../enterprise-modules/status-bar/dist/cjs/statusBarModule");
const StatusBarModule = require("../../../../../enterprise-modules/status-bar/dist/cjs/statusBarModule").StatusBarModule;
        
require("../../../../../enterprise-modules/viewport-row-model/dist/cjs/viewportRowModelModule");
const ViewportRowModelModule = require("../../../../../enterprise-modules/viewport-row-model/dist/cjs/viewportRowModelModule").ViewportRowModelModule;
        
require("../../../../../community-modules/client-side-row-model/dist/cjs/clientSideRowModelModule");
const ClientSideRowModelModule = require("../../../../../community-modules/client-side-row-model/dist/cjs/clientSideRowModelModule").ClientSideRowModelModule;
        
require("../../../../../community-modules/csv-export/dist/cjs/csvExportModule");
const CsvExportModule = require("../../../../../community-modules/csv-export/dist/cjs/csvExportModule").CsvExportModule;
        
require("../../../../../community-modules/infinite-row-model/dist/cjs/infiniteRowModelModule");
const InfiniteRowModelModule = require("../../../../../community-modules/infinite-row-model/dist/cjs/infiniteRowModelModule").InfiniteRowModelModule;
        
ModuleRegistry.ModuleRegistry.register(GridChartsModule);
ModuleRegistry.ModuleRegistry.register(ClipboardModule);
ModuleRegistry.ModuleRegistry.register(ColumnsToolPanelModule);
ModuleRegistry.ModuleRegistry.register(DateTimeCellEditorModule);
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