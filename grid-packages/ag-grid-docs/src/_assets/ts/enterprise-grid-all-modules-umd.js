// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../community-modules/core/dist/cjs/es5/main");
export * from "../../../../../community-modules/core/dist/cjs/es5/main";
export * from "../../../../../enterprise-modules/core/dist/cjs/es5/main";

/* MODULES - Don't delete this line */
require("../../../../../enterprise-modules/charts/dist/cjs/es5/gridChartsModule");
const GridChartsModule = require("../../../../../enterprise-modules/charts/dist/cjs/es5/gridChartsModule").GridChartsModule;

require("../../../../../enterprise-modules/clipboard/dist/cjs/es5/clipboardModule");
const ClipboardModule = require("../../../../../enterprise-modules/clipboard/dist/cjs/es5/clipboardModule").ClipboardModule;

require("../../../../../enterprise-modules/column-tool-panel/dist/cjs/es5/columnsToolPanelModule");
const ColumnsToolPanelModule = require("../../../../../enterprise-modules/column-tool-panel/dist/cjs/es5/columnsToolPanelModule").ColumnsToolPanelModule;

require("../../../../../enterprise-modules/excel-export/dist/cjs/es5/excelExportModule");
const ExcelExportModule = require("../../../../../enterprise-modules/excel-export/dist/cjs/es5/excelExportModule").ExcelExportModule;

require("../../../../../enterprise-modules/filter-tool-panel/dist/cjs/es5/filtersToolPanelModule");
const FiltersToolPanelModule = require("../../../../../enterprise-modules/filter-tool-panel/dist/cjs/es5/filtersToolPanelModule").FiltersToolPanelModule;

require("../../../../../enterprise-modules/master-detail/dist/cjs/es5/masterDetailModule");
const MasterDetailModule = require("../../../../../enterprise-modules/master-detail/dist/cjs/es5/masterDetailModule").MasterDetailModule;

require("../../../../../enterprise-modules/menu/dist/cjs/es5/menuModule");
const MenuModule = require("../../../../../enterprise-modules/menu/dist/cjs/es5/menuModule").MenuModule;

require("../../../../../enterprise-modules/multi-filter/dist/cjs/es5/multiFilterModule");
const MultiFilterModule = require("../../../../../enterprise-modules/multi-filter/dist/cjs/es5/multiFilterModule").MultiFilterModule;

require("../../../../../enterprise-modules/range-selection/dist/cjs/es5/rangeSelectionModule");
const RangeSelectionModule = require("../../../../../enterprise-modules/range-selection/dist/cjs/es5/rangeSelectionModule").RangeSelectionModule;

require("../../../../../enterprise-modules/rich-select/dist/cjs/es5/richSelectModule");
const RichSelectModule = require("../../../../../enterprise-modules/rich-select/dist/cjs/es5/richSelectModule").RichSelectModule;

require("../../../../../enterprise-modules/row-grouping/dist/cjs/es5/rowGroupingModule");
const RowGroupingModule = require("../../../../../enterprise-modules/row-grouping/dist/cjs/es5/rowGroupingModule").RowGroupingModule;

require("../../../../../enterprise-modules/server-side-row-model/dist/cjs/es5/serverSideRowModelModule");
const ServerSideRowModelModule = require("../../../../../enterprise-modules/server-side-row-model/dist/cjs/es5/serverSideRowModelModule").ServerSideRowModelModule;

require("../../../../../enterprise-modules/set-filter/dist/cjs/es5/setFilterModule");
const SetFilterModule = require("../../../../../enterprise-modules/set-filter/dist/cjs/es5/setFilterModule").SetFilterModule;

require("../../../../../enterprise-modules/side-bar/dist/cjs/es5/sideBarModule");
const SideBarModule = require("../../../../../enterprise-modules/side-bar/dist/cjs/es5/sideBarModule").SideBarModule;

require("../../../../../enterprise-modules/sparklines/dist/cjs/es5/sparklinesModule");
const SparklinesModule = require("../../../../../enterprise-modules/sparklines/dist/cjs/es5/sparklinesModule").SparklinesModule;

require("../../../../../enterprise-modules/status-bar/dist/cjs/es5/statusBarModule");
const StatusBarModule = require("../../../../../enterprise-modules/status-bar/dist/cjs/es5/statusBarModule").StatusBarModule;

require("../../../../../enterprise-modules/viewport-row-model/dist/cjs/es5/viewportRowModelModule");
const ViewportRowModelModule = require("../../../../../enterprise-modules/viewport-row-model/dist/cjs/es5/viewportRowModelModule").ViewportRowModelModule;

require("../../../../../community-modules/client-side-row-model/dist/cjs/es5/clientSideRowModelModule");
const ClientSideRowModelModule = require("../../../../../community-modules/client-side-row-model/dist/cjs/es5/clientSideRowModelModule").ClientSideRowModelModule;

require("../../../../../community-modules/csv-export/dist/cjs/es5/csvExportModule");
const CsvExportModule = require("../../../../../community-modules/csv-export/dist/cjs/es5/csvExportModule").CsvExportModule;

require("../../../../../community-modules/infinite-row-model/dist/cjs/es5/infiniteRowModelModule");
const InfiniteRowModelModule = require("../../../../../community-modules/infinite-row-model/dist/cjs/es5/infiniteRowModelModule").InfiniteRowModelModule;

ModuleRegistry.ModuleRegistry.register(GridChartsModule, false);
ModuleRegistry.ModuleRegistry.register(ClipboardModule, false);
ModuleRegistry.ModuleRegistry.register(ColumnsToolPanelModule, false);
ModuleRegistry.ModuleRegistry.register(ExcelExportModule, false);
ModuleRegistry.ModuleRegistry.register(FiltersToolPanelModule, false);
ModuleRegistry.ModuleRegistry.register(MasterDetailModule, false);
ModuleRegistry.ModuleRegistry.register(MenuModule, false);
ModuleRegistry.ModuleRegistry.register(MultiFilterModule, false);
ModuleRegistry.ModuleRegistry.register(RangeSelectionModule, false);
ModuleRegistry.ModuleRegistry.register(RichSelectModule, false);
ModuleRegistry.ModuleRegistry.register(RowGroupingModule, false);
ModuleRegistry.ModuleRegistry.register(ServerSideRowModelModule, false);
ModuleRegistry.ModuleRegistry.register(SetFilterModule, false);
ModuleRegistry.ModuleRegistry.register(SideBarModule, false);
ModuleRegistry.ModuleRegistry.register(SparklinesModule, false);
ModuleRegistry.ModuleRegistry.register(StatusBarModule, false);
ModuleRegistry.ModuleRegistry.register(ViewportRowModelModule, false);
ModuleRegistry.ModuleRegistry.register(ClientSideRowModelModule, false);
ModuleRegistry.ModuleRegistry.register(CsvExportModule, false);
ModuleRegistry.ModuleRegistry.register(InfiniteRowModelModule, false);