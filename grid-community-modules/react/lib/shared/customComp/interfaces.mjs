// @ag-grid-community/react v31.1.1
import { useContext } from "react";
import { CustomContext } from "./customContext.mjs";
// *** Hooks ***
function useGridCustomComponent(methods) {
    const { setMethods } = useContext(CustomContext);
    setMethods(methods);
}
/** Hook to allow custom cell editor component callbacks to be provided to the grid */
export function useGridCellEditor(callbacks) {
    useGridCustomComponent(callbacks);
}
/** Hook to allow custom date component callbacks to be provided to the grid */
export function useGridDate(callbacks) {
    return useGridCustomComponent(callbacks);
}
/** Hook to allow custom filter component callbacks to be provided to the grid */
export function useGridFilter(callbacks) {
    return useGridCustomComponent(callbacks);
}
/** Hook to allow custom floating filter component callbacks to be provided to the grid */
export function useGridFloatingFilter(callbacks) {
    useGridCustomComponent(callbacks);
}
/** Hook to allow custom menu item component callbacks to be provided to the grid */
export function useGridMenuItem(callbacks) {
    useGridCustomComponent(callbacks);
}
