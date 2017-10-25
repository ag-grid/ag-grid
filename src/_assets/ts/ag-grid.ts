declare var HMR: boolean;

if (!(<any> global).hot && HMR) {
    require('webpack-hot-middleware/client?path=/dev/ag-grid/__webpack_hmr&reload=true');
}

import "../../../../ag-grid/src/styles/ag-grid.scss";
import "../../../../ag-grid/src/styles/theme-fresh.scss";
import "../../../../ag-grid/src/styles/theme-blue.scss";
import "../../../../ag-grid/src/styles/theme-dark.scss";
import "../../../../ag-grid/src/styles/theme-bootstrap.scss";
import "../../../../ag-grid/src/styles/theme-material.scss";
import "../../../../ag-grid/src/styles/ag-theme-material.scss";

export * from "../../../../ag-grid/exports";
