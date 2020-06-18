// ag-grid-react v23.2.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// effectively Object.assign - here for IE compatibility
exports.assignProperties = function (to, from) {
    var styleKeys = Object.keys(from);
    styleKeys.forEach(function (key) {
        to[key] = from[key];
    });
};
/*
 * http://stackoverflow.com/a/13719799/2393347
 */
exports.assign = function (obj, prop, value) {
    if (typeof prop === "string")
        prop = prop.split(".");
    if (prop.length > 1) {
        var e = prop.shift();
        exports.assign(obj[e] = Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {}, prop, value);
    }
    else
        obj[prop[0]] = value;
};
