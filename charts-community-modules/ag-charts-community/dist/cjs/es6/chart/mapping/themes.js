"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartTheme = exports.themes = void 0;
const chartTheme_1 = require("../themes/chartTheme");
const darkTheme_1 = require("../themes/darkTheme");
const materialLight_1 = require("../themes/materialLight");
const materialDark_1 = require("../themes/materialDark");
const pastelLight_1 = require("../themes/pastelLight");
const pastelDark_1 = require("../themes/pastelDark");
const solarLight_1 = require("../themes/solarLight");
const solarDark_1 = require("../themes/solarDark");
const vividLight_1 = require("../themes/vividLight");
const vividDark_1 = require("../themes/vividDark");
const json_1 = require("../../util/json");
const lightTheme = new chartTheme_1.ChartTheme();
const darkTheme = new darkTheme_1.DarkTheme();
const lightThemes = {
    undefined: lightTheme,
    null: lightTheme,
    'ag-default': lightTheme,
    'ag-material': new materialLight_1.MaterialLight(),
    'ag-pastel': new pastelLight_1.PastelLight(),
    'ag-solar': new solarLight_1.SolarLight(),
    'ag-vivid': new vividLight_1.VividLight(),
};
const darkThemes = {
    undefined: darkTheme,
    null: darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': new materialDark_1.MaterialDark(),
    'ag-pastel-dark': new pastelDark_1.PastelDark(),
    'ag-solar-dark': new solarDark_1.SolarDark(),
    'ag-vivid-dark': new vividDark_1.VividDark(),
};
exports.themes = Object.assign(Object.assign({}, darkThemes), lightThemes);
function getChartTheme(value) {
    var _a;
    if (value instanceof chartTheme_1.ChartTheme) {
        return value;
    }
    const stockTheme = exports.themes[value];
    if (stockTheme) {
        return stockTheme;
    }
    value = value;
    // Flatten recursive themes.
    const overrides = [];
    let palette;
    while (typeof value === 'object') {
        overrides.push((_a = value.overrides) !== null && _a !== void 0 ? _a : {});
        // Use first palette found, they can't be merged.
        if (value.palette && palette == null) {
            palette = value.palette;
        }
        value = value.baseTheme;
    }
    overrides.reverse();
    const flattenedTheme = Object.assign({ baseTheme: value, overrides: json_1.jsonMerge(overrides) }, (palette ? { palette } : {}));
    if (flattenedTheme.baseTheme || flattenedTheme.overrides) {
        const baseTheme = getChartTheme(flattenedTheme.baseTheme);
        return new baseTheme.constructor(flattenedTheme);
    }
    return lightTheme;
}
exports.getChartTheme = getChartTheme;
