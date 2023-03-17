// @ag-grid-community/react v29.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useGridApis = (gridRef) => {
    const [gridApi, setGridApi] = react_1.useState(null);
    const [columnApi, setColumnApi] = react_1.useState(null);
    react_1.useEffect(() => {
        if (gridRef && gridRef.current) {
            setGridApi(gridRef.current.api);
            setColumnApi(gridRef.current.columnApi);
        }
    }, [gridRef]);
    return [gridApi, columnApi];
};
exports.default = useGridApis;

//# sourceMappingURL=useGridApi.js.map
