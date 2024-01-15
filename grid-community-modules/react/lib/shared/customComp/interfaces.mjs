// @ag-grid-community/react v31.0.2
import { useContext } from "react";
import { CustomContext } from "./customContext.mjs";
// *** Hooks ***
function useGridCustomComponent(methods) {
    const { setMethods } = useContext(CustomContext);
    setMethods(methods);
}
/** Hook to allow custom cell editor component callbacks to be provided to the grid */
export function useGridCellEditor(methods) {
    useGridCustomComponent(methods);
}
/** Hook to allow custom date component callbacks to be provided to the grid */
export function useGridDate(methods) {
    return useGridCustomComponent(methods);
}
/** Hook to allow custom filter component callbacks to be provided to the grid */
export function useGridFilter(methods) {
    return useGridCustomComponent(methods);
}
/** Hook to allow custom floating filter component callbacks to be provided to the grid */
export function useGridFloatingFilter(methods) {
    useGridCustomComponent(methods);
}
