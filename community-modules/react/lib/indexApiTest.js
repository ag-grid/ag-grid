// @ag-grid-community/react v28.2.1
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
const agGridReact_1 = require("./agGridReact");
const agGridColumn_1 = require("./shared/agGridColumn");
const useGridApi_1 = __importDefault(require("./useGridApi"));
require("@ag-grid-community/styles/ag-grid.css");
require("@ag-grid-community/styles/ag-theme-alpine.css");
const App = () => {
    const gridRef = react_1.useRef(null);
    const [gridApi, columnApi] = useGridApi_1.default(gridRef);
    const [rowData] = react_1.useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ]);
    react_1.useEffect(() => {
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
