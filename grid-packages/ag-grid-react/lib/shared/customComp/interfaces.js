// ag-grid-react v31.1.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGridMenuItem = exports.useGridFloatingFilter = exports.useGridFilter = exports.useGridDate = exports.useGridCellEditor = void 0;
var react_1 = require("react");
var customContext_1 = require("./customContext");
// *** Hooks ***
function useGridCustomComponent(methods) {
    var setMethods = react_1.useContext(customContext_1.CustomContext).setMethods;
    setMethods(methods);
}
/** Hook to allow custom cell editor component callbacks to be provided to the grid */
function useGridCellEditor(callbacks) {
    useGridCustomComponent(callbacks);
}
exports.useGridCellEditor = useGridCellEditor;
/** Hook to allow custom date component callbacks to be provided to the grid */
function useGridDate(callbacks) {
    return useGridCustomComponent(callbacks);
}
exports.useGridDate = useGridDate;
/** Hook to allow custom filter component callbacks to be provided to the grid */
function useGridFilter(callbacks) {
    return useGridCustomComponent(callbacks);
}
exports.useGridFilter = useGridFilter;
/** Hook to allow custom floating filter component callbacks to be provided to the grid */
function useGridFloatingFilter(callbacks) {
    useGridCustomComponent(callbacks);
}
exports.useGridFloatingFilter = useGridFloatingFilter;
/** Hook to allow custom menu item component callbacks to be provided to the grid */
function useGridMenuItem(callbacks) {
    useGridCustomComponent(callbacks);
}
exports.useGridMenuItem = useGridMenuItem;
