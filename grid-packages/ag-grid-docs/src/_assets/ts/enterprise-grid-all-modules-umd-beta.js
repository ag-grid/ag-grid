// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/core/src/ts/main").ModuleRegistry;
export * from "../../../../../community-modules/core/src/ts/main";
export * from "../../../../../enterprise-modules/core/src/main";
export * from "../../../../../charts-packages/ag-charts-community/src/main";

/* MODULES - Don't delete this line */
const GridChartsModule = require("../../../../../enterprise-modules/charts/dist/cjs/gridChartsModule").GridChartsModule;
const ClipboardModule = require("../../../../../enterprise-modules/clipboard/dist/cjs/clipboardModule").ClipboardModule;
const ColumnsToolPanelModule = require("../../../../../enterprise-modules/column-tool-panel/dist/cjs/columnsToolPanelModule").ColumnsToolPanelModule;
const DateTimeCellEditorModule = require("../../../../../enterprise-modules/date-time-cell-editor/dist/cjs/dateTimeCellEditorModule").DateTimeCellEditorModule;
const ExcelExportModule = require("../../../../../enterprise-modules/excel-export/dist/cjs/excelExportModule").ExcelExportModule;
const FiltersToolPanelModule = require("../../../../../enterprise-modules/filter-tool-panel/dist/cjs/filtersToolPanelModule").FiltersToolPanelModule;
const MasterDetailModule = require("../../../../../enterprise-modules/master-detail/dist/cjs/masterDetailModule").MasterDetailModule;
const MenuModule = require("../../../../../enterprise-modules/menu/dist/cjs/menuModule").MenuModule;
const RangeSelectionModule = require("../../../../../enterprise-modules/range-selection/dist/cjs/rangeSelectionModule").RangeSelectionModule;
const RichSelectModule = require("../../../../../enterprise-modules/rich-select/dist/cjs/richSelectModule").RichSelectModule;
const RowGroupingModule = require("../../../../../enterprise-modules/row-grouping/dist/cjs/rowGroupingModule").RowGroupingModule;
const ServerSideRowModelModule = require("../../../../../enterprise-modules/server-side-row-model/dist/cjs/serverSideRowModelModule").ServerSideRowModelModule;
const SetFilterModule = require("../../../../../enterprise-modules/set-filter/dist/cjs/setFilterModule").SetFilterModule;
const SideBarModule = require("../../../../../enterprise-modules/side-bar/dist/cjs/sideBarModule").SideBarModule;
const StatusBarModule = require("../../../../../enterprise-modules/status-bar/dist/cjs/statusBarModule").StatusBarModule;
const ViewportRowModelModule = require("../../../../../enterprise-modules/viewport-row-model/dist/cjs/viewportRowModelModule").ViewportRowModelModule;
const ClientSideRowModelModule = require("../../../../../community-modules/client-side-row-model/dist/cjs/clientSideRowModelModule").ClientSideRowModelModule;
const CsvExportModule = require("../../../../../community-modules/csv-export/dist/cjs/csvExportModule").CsvExportModule;
const InfiniteRowModelModule = require("../../../../../community-modules/infinite-row-model/dist/cjs/infiniteRowModelModule").InfiniteRowModelModule;
ModuleRegistry.register(GridChartsModule);
ModuleRegistry.register(ClipboardModule);
ModuleRegistry.register(ColumnsToolPanelModule);
ModuleRegistry.register(DateTimeCellEditorModule);
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