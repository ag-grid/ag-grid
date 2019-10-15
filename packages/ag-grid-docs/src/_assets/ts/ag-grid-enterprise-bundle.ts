/* mostly used by landing pages */

import "../../../../ag-grid-community/src/styles/ag-grid.scss";

import "../../../../ag-grid-community/src/styles/ag-theme-material/sass/ag-theme-material.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-fresh/sass/ag-theme-fresh.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-dark/sass/ag-theme-dark.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-blue/sass/ag-theme-blue.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-bootstrap/sass/ag-theme-bootstrap.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-balham-dark/sass/ag-theme-balham-dark.scss";

declare var HMR: boolean;

if (HMR) {
    (<any>global).hot = true;
    require("webpack-hot-middleware/client?path=/dev/ag-grid-enterprise-bundle/__webpack_hmr&reload=true");
}

export * from "../../../../ag-grid-community/src/ts/main";

// spl modules
/* MODULES - Don't delete this line */
import "../../../../ag-grid-enterprise/src/modules/chartsModule.ts";
import "../../../../../enterprise-modules/charts/src/chartsModule.ts";
import "../../../../../enterprise-modules/clipboard/src/clipboardModule.ts";
import "../../../../../enterprise-modules/column-tool-panel/src/columnsToolPanelModule.ts";
import "../../../../../enterprise-modules/excel-export/src/excelExportModule.ts";
import "../../../../../enterprise-modules/filter-tool-panel/src/filtersToolPanelModule.ts";
import "../../../../../enterprise-modules/grid-charts/src/gridChartsModule.ts";
import "../../../../../enterprise-modules/master-detail/src/masterDetailModule.ts";
import "../../../../../enterprise-modules/menu/src/menuModule.ts";
import "../../../../../enterprise-modules/range-selection/src/rangeSelectionModule.ts";
import "../../../../../enterprise-modules/rich-select/src/richSelectModule.ts";
import "../../../../../enterprise-modules/row-grouping/src/rowGroupingModule.ts";
import "../../../../../enterprise-modules/server-side-row-model/src/serverSideRowModelModule.ts";
import "../../../../../enterprise-modules/set-filter/src/setFilterModule.ts";
import "../../../../../enterprise-modules/side-bar/src/sideBarModule.ts";
import "../../../../../enterprise-modules/status-bar/src/statusBarModule.ts";
import "../../../../../enterprise-modules/viewport-row-model/src/viewportRowModelModule.ts";
import "../../../../ag-grid-enterprise/src/main.ts";