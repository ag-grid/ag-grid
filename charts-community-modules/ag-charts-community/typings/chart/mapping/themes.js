"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartTheme = exports.themes = void 0;
var chartTheme_1 = require("../themes/chartTheme");
var darkTheme_1 = require("../themes/darkTheme");
var materialLight_1 = require("../themes/materialLight");
var materialDark_1 = require("../themes/materialDark");
var pastelLight_1 = require("../themes/pastelLight");
var pastelDark_1 = require("../themes/pastelDark");
var solarLight_1 = require("../themes/solarLight");
var solarDark_1 = require("../themes/solarDark");
var vividLight_1 = require("../themes/vividLight");
var vividDark_1 = require("../themes/vividDark");
var json_1 = require("../../util/json");
var lightTheme = function () { return new chartTheme_1.ChartTheme(); };
var darkTheme = function () { return new darkTheme_1.DarkTheme(); };
var lightThemes = {
    undefined: lightTheme,
    null: lightTheme,
    'ag-default': lightTheme,
    'ag-material': function () { return new materialLight_1.MaterialLight(); },
    'ag-pastel': function () { return new pastelLight_1.PastelLight(); },
    'ag-solar': function () { return new solarLight_1.SolarLight(); },
    'ag-vivid': function () { return new vividLight_1.VividLight(); },
};
var darkThemes = {
    undefined: darkTheme,
    null: darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': function () { return new materialDark_1.MaterialDark(); },
    'ag-pastel-dark': function () { return new pastelDark_1.PastelDark(); },
    'ag-solar-dark': function () { return new solarDark_1.SolarDark(); },
    'ag-vivid-dark': function () { return new vividDark_1.VividDark(); },
};
exports.themes = __assign(__assign({}, darkThemes), lightThemes);
function getChartTheme(value) {
    var _a;
    if (value instanceof chartTheme_1.ChartTheme) {
        return value;
    }
    var stockTheme = exports.themes[value];
    if (stockTheme) {
        return stockTheme();
    }
    value = value;
    // Flatten recursive themes.
    var overrides = [];
    var palette;
    while (typeof value === 'object') {
        overrides.push((_a = value.overrides) !== null && _a !== void 0 ? _a : {});
        // Use first palette found, they can't be merged.
        if (value.palette && palette == null) {
            palette = value.palette;
        }
        value = value.baseTheme;
    }
    overrides.reverse();
    var flattenedTheme = __assign({ baseTheme: value, overrides: json_1.jsonMerge(overrides) }, (palette ? { palette: palette } : {}));
    if (flattenedTheme.baseTheme || flattenedTheme.overrides) {
        var baseTheme = getChartTheme(flattenedTheme.baseTheme);
        return new baseTheme.constructor(flattenedTheme);
    }
    return lightTheme();
}
exports.getChartTheme = getChartTheme;
//# sourceMappingURL=themes.js.map