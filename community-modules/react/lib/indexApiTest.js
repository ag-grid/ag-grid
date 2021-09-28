// @ag-grid-community/react v26.1.0
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
var react_1 = __importStar(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
var client_side_row_model_1 = require("@ag-grid-community/client-side-row-model");
var agGridReact_1 = require("./agGridReact");
var agGridColumn_1 = require("./agGridColumn");
var useGridApi_1 = __importDefault(require("./useGridApi"));
require("@ag-grid-community/core/dist/styles/ag-grid.css");
require("@ag-grid-community/core/dist/styles/ag-theme-alpine.css");
var App = function () {
    var gridRef = react_1.useRef(null);
    var _a = useGridApi_1.default(gridRef), gridApi = _a[0], columnApi = _a[1];
    var rowData = react_1.useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 }
    ])[0];
    react_1.useEffect(function () {
        console.log(gridApi);
        console.log(columnApi);
    }, [gridApi, columnApi]);
    return (react_1.default.createElement("div", { className: "ag-theme-alpine", style: { height: 400, width: 600 } },
        react_1.default.createElement(agGridReact_1.AgGridReact, { ref: gridRef, rowData: rowData, modules: [client_side_row_model_1.ClientSideRowModelModule] },
            react_1.default.createElement(agGridColumn_1.AgGridColumn, { field: "make" }),
            react_1.default.createElement(agGridColumn_1.AgGridColumn, { field: "model" }),
            react_1.default.createElement(agGridColumn_1.AgGridColumn, { field: "price" }))));
};
react_dom_1.default.render(react_1.default.createElement(App, null), document.getElementById('root'));

//# sourceMappingURL=indexApiTest.js.map
