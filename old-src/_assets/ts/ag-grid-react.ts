declare var HMR: boolean;

if (HMR) {
    require('webpack-hot-middleware/client?path=/dev/ag-grid-react/__webpack_hmr');
}

export * from "../../../../ag-grid-react/src/agGridReact";
