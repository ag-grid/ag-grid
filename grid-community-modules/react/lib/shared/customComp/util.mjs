// @ag-grid-community/react v31.0.2
import { AgPromise } from "@ag-grid-community/core";
/**
 * Function to retrieve the React component from an instance returned by the grid.
 * @param wrapperComponent Instance component from the grid
 * @param callback Callback which is provided the underlying React custom component
 */
export function getInstance(wrapperComponent, callback) {
    var _a, _b;
    const promise = (_b = (_a = wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.getInstance) === null || _a === void 0 ? void 0 : _a.call(wrapperComponent)) !== null && _b !== void 0 ? _b : AgPromise.resolve(undefined);
    promise.then((comp) => callback(comp));
}
