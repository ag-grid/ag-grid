// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/core/src/ts/main").ModuleRegistry;
export * from "../../../../../community-modules/core/src/ts/main";
export * from "../../../../../enterprise-modules/core/src/main";
export * from "../../../../../charts-packages/ag-charts-community/src/main";

/* MODULES - Don't delete this line */
const GridChartsModule = require("../../../../../enterprise-modules/charts/dist/cjs/es5/gridChartsModule").GridChartsModule;
const ClipboardModule = require("../../../../../enterprise-modules/clipboard/dist/cjs/es5/clipboardModule").ClipboardModule;
const ColumnsToolPanelModule = require("../../../../../enterprise-modules/column-tool-panel/dist/cjs/es5/columnsToolPanelModule").ColumnsToolPanelModule;
const ExcelExportModule = require("../../../../../enterprise-modules/excel-export/dist/cjs/es5/excelExportModule").ExcelExportModule;
const FiltersToolPanelModule = require("../../../../../enterprise-modules/filter-tool-panel/dist/cjs/es5/filtersToolPanelModule").FiltersToolPanelModule;
const MasterDetailModule = require("../../../../../enterprise-modules/master-detail/dist/cjs/es5/masterDetailModule").MasterDetailModule;
const MenuModule = require("../../../../../enterprise-modules/menu/dist/cjs/es5/menuModule").MenuModule;
const MultiFilterModule = require("../../../../../enterprise-modules/multi-filter/dist/cjs/es5/multiFilterModule").MultiFilterModule;
const RangeSelectionModule = require("../../../../../enterprise-modules/range-selection/dist/cjs/es5/rangeSelectionModule").RangeSelectionModule;
const RichSelectModule = require("../../../../../enterprise-modules/rich-select/dist/cjs/es5/richSelectModule").RichSelectModule;
const RowGroupingModule = require("../../../../../enterprise-modules/row-grouping/dist/cjs/es5/rowGroupingModule").RowGroupingModule;
const ServerSideRowModelModule = require("../../../../../enterprise-modules/server-side-row-model/dist/cjs/es5/serverSideRowModelModule").ServerSideRowModelModule;
const SetFilterModule = require("../../../../../enterprise-modules/set-filter/dist/cjs/es5/setFilterModule").SetFilterModule;
const SideBarModule = require("../../../../../enterprise-modules/side-bar/dist/cjs/es5/sideBarModule").SideBarModule;
const SparklinesModule = require("../../../../../enterprise-modules/sparklines/dist/cjs/es5/sparklinesModule").SparklinesModule;
const StatusBarModule = require("../../../../../enterprise-modules/status-bar/dist/cjs/es5/statusBarModule").StatusBarModule;
const ViewportRowModelModule = require("../../../../../enterprise-modules/viewport-row-model/dist/cjs/es5/viewportRowModelModule").ViewportRowModelModule;
const ClientSideRowModelModule = require("../../../../../community-modules/client-side-row-model/dist/cjs/es5/clientSideRowModelModule").ClientSideRowModelModule;
const CsvExportModule = require("../../../../../community-modules/csv-export/dist/cjs/es5/csvExportModule").CsvExportModule;
const InfiniteRowModelModule = require("../../../../../community-modules/infinite-row-model/dist/cjs/es5/infiniteRowModelModule").InfiniteRowModelModule;
ModuleRegistry.register(GridChartsModule);
ModuleRegistry.register(ClipboardModule);
ModuleRegistry.register(ColumnsToolPanelModule);
ModuleRegistry.register(ExcelExportModule);
ModuleRegistry.register(FiltersToolPanelModule);
ModuleRegistry.register(MasterDetailModule);
ModuleRegistry.register(MenuModule);
ModuleRegistry.register(MultiFilterModule);
ModuleRegistry.register(RangeSelectionModule);
ModuleRegistry.register(RichSelectModule);
ModuleRegistry.register(RowGroupingModule);
ModuleRegistry.register(ServerSideRowModelModule);
ModuleRegistry.register(SetFilterModule);
ModuleRegistry.register(SideBarModule);
ModuleRegistry.register(SparklinesModule);
ModuleRegistry.register(StatusBarModule);
ModuleRegistry.register(ViewportRowModelModule);
ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.register(CsvExportModule);
ModuleRegistry.register(InfiniteRowModelModule);
ModuleRegistry.setIsBundled();