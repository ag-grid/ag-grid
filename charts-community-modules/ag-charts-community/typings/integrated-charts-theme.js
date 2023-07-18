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
exports.themes = exports.DEFAULT_FONT_FAMILY = exports.OVERRIDE_SERIES_LABEL_DEFAULTS = exports.EXTENDS_SERIES_DEFAULTS = exports.EXTENDS_AXES_LINE_DEFAULTS = exports.EXTENDS_AXES_LABEL_DEFAULTS = exports.EXTENDS_AXES_DEFAULTS = exports.ChartTheme = exports.getChartTheme = void 0;
var themes_1 = require("./chart/mapping/themes");
var themes_2 = require("./chart/mapping/themes");
Object.defineProperty(exports, "getChartTheme", { enumerable: true, get: function () { return themes_2.getChartTheme; } });
var chartTheme_1 = require("./chart/themes/chartTheme");
Object.defineProperty(exports, "ChartTheme", { enumerable: true, get: function () { return chartTheme_1.ChartTheme; } });
Object.defineProperty(exports, "EXTENDS_AXES_DEFAULTS", { enumerable: true, get: function () { return chartTheme_1.EXTENDS_AXES_DEFAULTS; } });
Object.defineProperty(exports, "EXTENDS_AXES_LABEL_DEFAULTS", { enumerable: true, get: function () { return chartTheme_1.EXTENDS_AXES_LABEL_DEFAULTS; } });
Object.defineProperty(exports, "EXTENDS_AXES_LINE_DEFAULTS", { enumerable: true, get: function () { return chartTheme_1.EXTENDS_AXES_LINE_DEFAULTS; } });
Object.defineProperty(exports, "EXTENDS_SERIES_DEFAULTS", { enumerable: true, get: function () { return chartTheme_1.EXTENDS_SERIES_DEFAULTS; } });
Object.defineProperty(exports, "OVERRIDE_SERIES_LABEL_DEFAULTS", { enumerable: true, get: function () { return chartTheme_1.OVERRIDE_SERIES_LABEL_DEFAULTS; } });
Object.defineProperty(exports, "DEFAULT_FONT_FAMILY", { enumerable: true, get: function () { return chartTheme_1.DEFAULT_FONT_FAMILY; } });
exports.themes = Object.entries(themes_1.themes).reduce(function (obj, _a) {
    var _b = __read(_a, 2), name = _b[0], factory = _b[1];
    obj[name] = factory();
    return obj;
}, {});
//# sourceMappingURL=integrated-charts-theme.js.map