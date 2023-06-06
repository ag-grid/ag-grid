// for js examples that just require enterprise functionality (landing pages, vanilla community examples etc)

const  ModuleRegistry = require("../../../../../grid-community-modules/core/dist/esm/es6/main");
export * from "../../../../../grid-community-modules/core/dist/esm/es6/main";
export * from "../../../../../grid-enterprise-modules/core/dist/esm/es6/main";

/* MODULES - Don't delete this line */
require("../../../../../grid-enterprise-modules/charts/dist/esm/es6/gridChartsModule");
const GridChartsModule = require("../../../../../grid-enterprise-modules/charts/dist/esm/es6/gridChartsModule").GridChartsModule;

require("../../../../../grid-enterprise-modules/clipboard/dist/esm/es6/clipboardModule");
const ClipboardModule = require("../../../../../grid-enterprise-modules/clipboard/dist/esm/es6/clipboardModule").ClipboardModule;

require("../../../../../grid-enterprise-modules/column-tool-panel/dist/esm/es6/columnsToolPanelModule");
const ColumnsToolPanelModule = require("../../../../../grid-enterprise-modules/column-tool-panel/dist/esm/es6/columnsToolPanelModule").ColumnsToolPanelModule;

require("../../../../../grid-enterprise-modules/excel-export/dist/esm/es6/excelExportModule");
const ExcelExportModule = require("../../../../../grid-enterprise-modules/excel-export/dist/esm/es6/excelExportModule").ExcelExportModule;

require("../../../../../grid-enterprise-modules/filter-tool-panel/dist/esm/es6/filtersToolPanelModule");
const FiltersToolPanelModule = require("../../../../../grid-enterprise-modules/filter-tool-panel/dist/esm/es6/filtersToolPanelModule").FiltersToolPanelModule;

require("../../../../../grid-enterprise-modules/master-detail/dist/esm/es6/masterDetailModule");
const MasterDetailModule = require("../../../../../grid-enterprise-modules/master-detail/dist/esm/es6/masterDetailModule").MasterDetailModule;

require("../../../../../grid-enterprise-modules/menu/dist/esm/es6/menuModule");
const MenuModule = require("../../../../../grid-enterprise-modules/menu/dist/esm/es6/menuModule").MenuModule;

require("../../../../../grid-enterprise-modules/multi-filter/dist/esm/es6/multiFilterModule");
const MultiFilterModule = require("../../../../../grid-enterprise-modules/multi-filter/dist/esm/es6/multiFilterModule").MultiFilterModule;

require("../../../../../grid-enterprise-modules/range-selection/dist/esm/es6/rangeSelectionModule");
const RangeSelectionModule = require("../../../../../grid-enterprise-modules/range-selection/dist/esm/es6/rangeSelectionModule").RangeSelectionModule;

require("../../../../../grid-enterprise-modules/rich-select/dist/esm/es6/richSelectModule");
const RichSelectModule = require("../../../../../grid-enterprise-modules/rich-select/dist/esm/es6/richSelectModule").RichSelectModule;

require("../../../../../grid-enterprise-modules/row-grouping/dist/esm/es6/rowGroupingModule");
const RowGroupingModule = require("../../../../../grid-enterprise-modules/row-grouping/dist/esm/es6/rowGroupingModule").RowGroupingModule;

require("../../../../../grid-enterprise-modules/server-side-row-model/dist/esm/es6/serverSideRowModelModule");
const ServerSideRowModelModule = require("../../../../../grid-enterprise-modules/server-side-row-model/dist/esm/es6/serverSideRowModelModule").ServerSideRowModelModule;

require("../../../../../grid-enterprise-modules/set-filter/dist/esm/es6/setFilterModule");
const SetFilterModule = require("../../../../../grid-enterprise-modules/set-filter/dist/esm/es6/setFilterModule").SetFilterModule;

require("../../../../../grid-enterprise-modules/side-bar/dist/esm/es6/sideBarModule");
const SideBarModule = require("../../../../../grid-enterprise-modules/side-bar/dist/esm/es6/sideBarModule").SideBarModule;

require("../../../../../grid-enterprise-modules/sparklines/dist/esm/es6/sparklinesModule");
const SparklinesModule = require("../../../../../grid-enterprise-modules/sparklines/dist/esm/es6/sparklinesModule").SparklinesModule;

require("../../../../../grid-enterprise-modules/status-bar/dist/esm/es6/statusBarModule");
const StatusBarModule = require("../../../../../grid-enterprise-modules/status-bar/dist/esm/es6/statusBarModule").StatusBarModule;

require("../../../../../grid-enterprise-modules/viewport-row-model/dist/esm/es6/viewportRowModelModule");
const ViewportRowModelModule = require("../../../../../grid-enterprise-modules/viewport-row-model/dist/esm/es6/viewportRowModelModule").ViewportRowModelModule;

require("../../../../../grid-community-modules/client-side-row-model/dist/esm/es6/clientSideRowModelModule");
const ClientSideRowModelModule = require("../../../../../grid-community-modules/client-side-row-model/dist/esm/es6/clientSideRowModelModule").ClientSideRowModelModule;

require("../../../../../grid-community-modules/csv-export/dist/esm/es6/csvExportModule");
const CsvExportModule = require("../../../../../grid-community-modules/csv-export/dist/esm/es6/csvExportModule").CsvExportModule;

require("../../../../../grid-community-modules/infinite-row-model/dist/esm/es6/infiniteRowModelModule");
const InfiniteRowModelModule = require("../../../../../grid-community-modules/infinite-row-model/dist/esm/es6/infiniteRowModelModule").InfiniteRowModelModule;

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