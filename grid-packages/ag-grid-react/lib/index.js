// ag-grid-react v28.2.1
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
var react_1 = __importStar(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
var client_side_row_model_1 = require("@ag-grid-community/client-side-row-model");
var agGridColumn_1 = require("./shared/agGridColumn");
var agGridReactUi_1 = require("./reactUi/agGridReactUi");
require("@ag-grid-community/styles/ag-grid.css");
require("@ag-grid-community/styles/ag-theme-alpine.css");
var App = function () {
    var _a = react_1.useState(null), gridApi = _a[0], setGridApi = _a[1];
    var _b = react_1.useState(null), gridColumnApi = _b[0], setGridColumnApi = _b[1];
    var _c = react_1.useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ]), rowData = _c[0], setRowData = _c[1];
    var onGridReady = function (params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        setTimeout(function () { return setRowData(__spreadArrays(rowData, rowData)); }, 2000);
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
