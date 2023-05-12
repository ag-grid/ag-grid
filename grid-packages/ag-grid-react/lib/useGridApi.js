// ag-grid-react v29.3.5
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useGridApis = function (gridRef) {
    var _a = react_1.useState(null), gridApi = _a[0], setGridApi = _a[1];
    var _b = react_1.useState(null), columnApi = _b[0], setColumnApi = _b[1];
    react_1.useEffect(function () {
        if (gridRef && gridRef.current) {
            setGridApi(gridRef.current.api);
            setColumnApi(gridRef.current.columnApi);
        }
    }, [gridRef]);
    return [gridApi, columnApi];
};
exports.default = useGridApis;
