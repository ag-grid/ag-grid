// @ag-grid-community/react v28.2.0
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const client_side_row_model_1 = require("@ag-grid-community/client-side-row-model");
const agGridColumn_1 = require("./shared/agGridColumn");
const agGridReactUi_1 = require("./reactUi/agGridReactUi");
require("@ag-grid-community/styles/ag-grid.css");
require("@ag-grid-community/styles/ag-theme-alpine.css");
const App = () => {
    const [gridApi, setGridApi] = react_1.useState(null);
    const [gridColumnApi, setGridColumnApi] = react_1.useState(null);
    const [rowData, setRowData] = react_1.useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ]);
    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        setTimeout(() => setRowData([...rowData, ...rowData]), 2000);
    };
    return (react_1.default.createElement("div", { style: { display: 'flex' } },
        react_1.default.createElement("div", { className: "ag-theme-alpine", style: { height: 400, width: 600, margin: 10 } },
            react_1.default.createElement(agGridReactUi_1.AgGridReactUi, { defaultColDef: {
                    resizable: true,
                    filter: true,
                    flex: 1,
                    sortable: true
                }, rowSelection: "multiple", animateRows: true, onGridReady: onGridReady, rowData: rowData, modules: [client_side_row_model_1.ClientSideRowModelModule] },
                react_1.default.createElement(agGridColumn_1.AgGridColumn, { field: "make" }),
                react_1.default.createElement(agGridColumn_1.AgGridColumn, { field: "model" }),
                react_1.default.createElement(agGridColumn_1.AgGridColumn, { field: "price" })))));
};
react_dom_1.default.render(react_1.default.createElement(App, null), document.getElementById('root'));

//# sourceMappingURL=index.js.map
