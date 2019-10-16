/* mostly used by landing pages */

import "../../../../../community-modules/grid-core/src/styles/ag-grid.scss";

import "../../../../../community-modules/grid-core/src/styles/ag-theme-material/sass/ag-theme-material.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-fresh/sass/ag-theme-fresh.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-dark/sass/ag-theme-dark.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-blue/sass/ag-theme-blue.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-bootstrap/sass/ag-theme-bootstrap.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";
import "../../../../../community-modules/grid-core/src/styles/ag-theme-balham-dark/sass/ag-theme-balham-dark.scss";

declare var HMR: boolean;

if (HMR) {
    (<any>global).hot = true;
    require("webpack-hot-middleware/client?path=/dev/ag-grid-enterprise-bundle/__webpack_hmr&reload=true");
}

export * from "../../../../../community-modules/grid-core/src/ts/main";

// spl modules
/* MODULES - Don't delete this line */
import "../../../../../enterprise-modules/charts/src/chartsModule.ts";
import "../../../../../enterprise-modules/clipboard/src/clipboardModule.ts";
import "../../../../../enterprise-modules/column-tool-panel/src/columnsToolPanelModule.ts";
import "../../../../../enterprise-modules/excel-export/src/excelExportModule.ts";
import "../../../../../enterprise-modules/filter-tool-panel/src/filtersToolPanelModule.ts";
import "../../../../../enterprise-modules/grid-charts/src/gridChartsModule.ts";
import "../../../../../enterprise-modules/grid-core/src/agGridEnterpriseModule.ts";
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