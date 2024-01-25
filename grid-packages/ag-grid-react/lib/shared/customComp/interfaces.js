// ag-grid-react v31.0.3
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGridFloatingFilter = exports.useGridFilter = exports.useGridDate = exports.useGridCellEditor = void 0;
var react_1 = require("react");
var customContext_1 = require("./customContext");
// *** Hooks ***
function useGridCustomComponent(methods) {
    var setMethods = react_1.useContext(customContext_1.CustomContext).setMethods;
    setMethods(methods);
}
/** Hook to allow custom cell editor component callbacks to be provided to the grid */
function useGridCellEditor(methods) {
    useGridCustomComponent(methods);
}
exports.useGridCellEditor = useGridCellEditor;
/** Hook to allow custom date component callbacks to be provided to the grid */
function useGridDate(methods) {
    return useGridCustomComponent(methods);
}
exports.useGridDate = useGridDate;
/** Hook to allow custom filter component callbacks to be provided to the grid */
function useGridFilter(methods) {
    return useGridCustomComponent(methods);
}
exports.useGridFilter = useGridFilter;
/** Hook to allow custom floating filter component callbacks to be provided to the grid */
function useGridFloatingFilter(methods) {
    useGridCustomComponent(methods);
}
exports.useGridFloatingFilter = useGridFloatingFilter;
