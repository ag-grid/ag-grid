// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../grid-community-modules/core/dist/cjs/es5/main");
export * from "../../../../../grid-community-modules/core/dist/cjs/es5/main";
export * from "../../../../../grid-enterprise-modules/core/dist/cjs/es5/main";

/* MODULES - Don't delete this line */
require("../../../../../grid-enterprise-modules/charts/dist/cjs/es5/gridChartsModule");
const GridChartsModule = require("../../../../../grid-enterprise-modules/charts/dist/cjs/es5/gridChartsModule").GridChartsModule;

require("../../../../../grid-enterprise-modules/clipboard/dist/cjs/es5/clipboardModule");
const ClipboardModule = require("../../../../../grid-enterprise-modules/clipboard/dist/cjs/es5/clipboardModule").ClipboardModule;

require("../../../../../grid-enterprise-modules/column-tool-panel/dist/cjs/es5/columnsToolPanelModule");
const ColumnsToolPanelModule = require("../../../../../grid-enterprise-modules/column-tool-panel/dist/cjs/es5/columnsToolPanelModule").ColumnsToolPanelModule;

require("../../../../../grid-enterprise-modules/excel-export/dist/cjs/es5/excelExportModule");
const ExcelExportModule = require("../../../../../grid-enterprise-modules/excel-export/dist/cjs/es5/excelExportModule").ExcelExportModule;

require("../../../../../grid-enterprise-modules/filter-tool-panel/dist/cjs/es5/filtersToolPanelModule");
const FiltersToolPanelModule = require("../../../../../grid-enterprise-modules/filter-tool-panel/dist/cjs/es5/filtersToolPanelModule").FiltersToolPanelModule;

require("../../../../../grid-enterprise-modules/master-detail/dist/cjs/es5/masterDetailModule");
const MasterDetailModule = require("../../../../../grid-enterprise-modules/master-detail/dist/cjs/es5/masterDetailModule").MasterDetailModule;

require("../../../../../grid-enterprise-modules/menu/dist/cjs/es5/menuModule");
const MenuModule = require("../../../../../grid-enterprise-modules/menu/dist/cjs/es5/menuModule").MenuModule;

require("../../../../../grid-enterprise-modules/multi-filter/dist/cjs/es5/multiFilterModule");
const MultiFilterModule = require("../../../../../grid-enterprise-modules/multi-filter/dist/cjs/es5/multiFilterModule").MultiFilterModule;

require("../../../../../grid-enterprise-modules/range-selection/dist/cjs/es5/rangeSelectionModule");
const RangeSelectionModule = require("../../../../../grid-enterprise-modules/range-selection/dist/cjs/es5/rangeSelectionModule").RangeSelectionModule;

require("../../../../../grid-enterprise-modules/rich-select/dist/cjs/es5/richSelectModule");
const RichSelectModule = require("../../../../../grid-enterprise-modules/rich-select/dist/cjs/es5/richSelectModule").RichSelectModule;

require("../../../../../grid-enterprise-modules/row-grouping/dist/cjs/es5/rowGroupingModule");
const RowGroupingModule = require("../../../../../grid-enterprise-modules/row-grouping/dist/cjs/es5/rowGroupingModule").RowGroupingModule;

require("../../../../../grid-enterprise-modules/server-side-row-model/dist/cjs/es5/serverSideRowModelModule");
const ServerSideRowModelModule = require("../../../../../grid-enterprise-modules/server-side-row-model/dist/cjs/es5/serverSideRowModelModule").ServerSideRowModelModule;

require("../../../../../grid-enterprise-modules/set-filter/dist/cjs/es5/setFilterModule");
const SetFilterModule = require("../../../../../grid-enterprise-modules/set-filter/dist/cjs/es5/setFilterModule").SetFilterModule;

require("../../../../../grid-enterprise-modules/side-bar/dist/cjs/es5/sideBarModule");
const SideBarModule = require("../../../../../grid-enterprise-modules/side-bar/dist/cjs/es5/sideBarModule").SideBarModule;

require("../../../../../grid-enterprise-modules/sparklines/dist/cjs/es5/sparklinesModule");
const SparklinesModule = require("../../../../../grid-enterprise-modules/sparklines/dist/cjs/es5/sparklinesModule").SparklinesModule;

require("../../../../../grid-enterprise-modules/status-bar/dist/cjs/es5/statusBarModule");
const StatusBarModule = require("../../../../../grid-enterprise-modules/status-bar/dist/cjs/es5/statusBarModule").StatusBarModule;

require("../../../../../grid-enterprise-modules/viewport-row-model/dist/cjs/es5/viewportRowModelModule");
const ViewportRowModelModule = require("../../../../../grid-enterprise-modules/viewport-row-model/dist/cjs/es5/viewportRowModelModule").ViewportRowModelModule;

require("../../../../../grid-community-modules/client-side-row-model/dist/cjs/es5/clientSideRowModelModule");
const ClientSideRowModelModule = require("../../../../../grid-community-modules/client-side-row-model/dist/cjs/es5/clientSideRowModelModule").ClientSideRowModelModule;

require("../../../../../grid-community-modules/csv-export/dist/cjs/es5/csvExportModule");
const CsvExportModule = require("../../../../../grid-community-modules/csv-export/dist/cjs/es5/csvExportModule").CsvExportModule;

require("../../../../../grid-community-modules/infinite-row-model/dist/cjs/es5/infiniteRowModelModule");
const InfiniteRowModelModule = require("../../../../../grid-community-modules/infinite-row-model/dist/cjs/es5/infiniteRowModelModule").InfiniteRowModelModule;

ModuleRegistry.ModuleRegistry.register(GridChartsModule);
ModuleRegistry.ModuleRegistry.register(ClipboardModule);
ModuleRegistry.ModuleRegistry.register(ColumnsToolPanelModule);
ModuleRegistry.ModuleRegistry.register(ExcelExportModule);
ModuleRegistry.ModuleRegistry.register(FiltersToolPanelModule);
ModuleRegistry.ModuleRegistry.register(MasterDetailModule);
ModuleRegistry.ModuleRegistry.register(MenuModule);
ModuleRegistry.ModuleRegistry.register(MultiFilterModule);
ModuleRegistry.ModuleRegistry.register(RangeSelectionModule);
ModuleRegistry.ModuleRegistry.register(RichSelectModule);
ModuleRegistry.ModuleRegistry.register(RowGroupingModule);
ModuleRegistry.ModuleRegistry.register(ServerSideRowModelModule);
ModuleRegistry.ModuleRegistry.register(SetFilterModule);
ModuleRegistry.ModuleRegistry.register(SideBarModule);
ModuleRegistry.ModuleRegistry.register(SparklinesModule);
ModuleRegistry.ModuleRegistry.register(StatusBarModule);
ModuleRegistry.ModuleRegistry.register(ViewportRowModelModule);
ModuleRegistry.ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.ModuleRegistry.register(CsvExportModule);
ModuleRegistry.ModuleRegistry.register(InfiniteRowModelModule);
ModuleRegistry.ModuleRegistry.setIsBundled();