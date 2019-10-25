// @ag-community/grid-react v22.0.0-beta.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// effectively Object.assign - here for IE compatibility
exports.assignProperties = function (to, from) {
    var styleKeys = Object.keys(from);
    styleKeys.forEach(function (key) {
        to[key] = from[key];
    });
};
