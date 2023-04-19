"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.themes = exports.ChartTheme = exports.getChartTheme = void 0;
var themes_1 = require("./chart/mapping/themes");
var themes_2 = require("./chart/mapping/themes");
Object.defineProperty(exports, "getChartTheme", { enumerable: true, get: function () { return themes_2.getChartTheme; } });
var chartTheme_1 = require("./chart/themes/chartTheme");
Object.defineProperty(exports, "ChartTheme", { enumerable: true, get: function () { return chartTheme_1.ChartTheme; } });
exports.themes = Object.entries(themes_1.themes).reduce(function (obj, _a) {
    var _b = __read(_a, 2), name = _b[0], factory = _b[1];
    obj[name] = factory();
    return obj;
}, {});
//# sourceMappingURL=integrated-charts-theme.js.map