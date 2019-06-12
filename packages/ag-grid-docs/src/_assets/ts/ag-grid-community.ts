declare var HMR: boolean;

if (!(<any>global).hot && HMR) {
    require("webpack-hot-middleware/client?path=/dev/ag-grid-community/__webpack_hmr&reload=true");
}

import "../../../../ag-grid-community/src/styles/ag-grid.scss";

import "../../../../ag-grid-community/src/styles/ag-theme-material/sass/ag-theme-material.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-fresh/sass/ag-theme-fresh.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-dark/sass/ag-theme-dark.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-blue/sass/ag-theme-blue.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-bootstrap/sass/ag-theme-bootstrap.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-finance/sass/ag-theme-finance.scss";
import "../../../../ag-grid-community/src/styles/ag-theme-finance-dark/sass/ag-theme-finance-dark.scss";

export * from "../../../../ag-grid-community/src/ts/main";
