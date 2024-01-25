// ag-grid-react v31.0.3
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = void 0;
var ag_grid_community_1 = require("ag-grid-community");
/**
 * Function to retrieve the React component from an instance returned by the grid.
 * @param wrapperComponent Instance component from the grid
 * @param callback Callback which is provided the underlying React custom component
 */
function getInstance(wrapperComponent, callback) {
    var _a, _b, _c;
    var promise = (_c = (_b = (_a = wrapperComponent) === null || _a === void 0 ? void 0 : _a.getInstance) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : ag_grid_community_1.AgPromise.resolve(undefined);
    promise.then(function (comp) { return callback(comp); });
}
exports.getInstance = getInstance;
