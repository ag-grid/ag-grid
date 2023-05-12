// ag-grid-react v29.3.5
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
var client_side_row_model_1 = require("@ag-grid-community/client-side-row-model");
var agGridReactUi_1 = require("./reactUi/agGridReactUi");
require("@ag-grid-community/styles/ag-grid.css");
require("@ag-grid-community/styles/ag-theme-alpine.css");
var App = function () {
    var _a = react_1.useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ]), rowData = _a[0], setRowData = _a[1];
    var _b = react_1.useState([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
    ]), colDefs = _b[0], setColDefs = _b[1];
    var onGridReady = function (params) {
        setTimeout(function () { return setRowData(__spreadArrays(rowData, rowData)); }, 2000);
    };
    return (react_1.default.createElement("div", { style: { display: 'flex' } },
        react_1.default.createElement("div", { className: "ag-theme-alpine", style: { height: 400, width: 600, margin: 10 } },
            react_1.default.createElement(agGridReactUi_1.AgGridReactUi, { defaultColDef: {
                    resizable: true,
                    filter: true,
                    flex: 1,
                    sortable: true
                }, rowSelection: "multiple", animateRows: true, onGridReady: onGridReady, rowData: rowData, columnDefs: colDefs, modules: [client_side_row_model_1.ClientSideRowModelModule] }))));
};
react_dom_1.default.render(react_1.default.createElement(App, null), document.getElementById('root'));
