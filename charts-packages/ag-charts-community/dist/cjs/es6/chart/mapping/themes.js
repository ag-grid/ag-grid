"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const lightTheme = new chartTheme_1.ChartTheme();
const darkTheme = new darkTheme_1.DarkTheme();
exports.lightThemes = {
    undefined: lightTheme,
    null: lightTheme,
    'ag-default': lightTheme,
    'ag-material': new materialLight_1.MaterialLight(),
    'ag-pastel': new pastelLight_1.PastelLight(),
    'ag-solar': new solarLight_1.SolarLight(),
    'ag-vivid': new vividLight_1.VividLight(),
};
exports.darkThemes = {
    undefined: darkTheme,
    null: darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': new materialDark_1.MaterialDark(),
    'ag-pastel-dark': new pastelDark_1.PastelDark(),
    'ag-solar-dark': new solarDark_1.SolarDark(),
    'ag-vivid-dark': new vividDark_1.VividDark(),
};
exports.themes = Object.assign(Object.assign({}, exports.darkThemes), exports.lightThemes);
function getChartTheme(value) {
    if (value instanceof chartTheme_1.ChartTheme) {
        return value;
    }
    const stockTheme = exports.themes[value];
    if (stockTheme) {
        return stockTheme;
    }
    value = value;
    if (value.baseTheme || value.overrides || value.palette) {
        const baseTheme = getChartTheme(value.baseTheme);
        return new baseTheme.constructor(value);
    }
    return lightTheme;
}
exports.getChartTheme = getChartTheme;
function getIntegratedChartTheme(value) {
    const theme = getChartTheme(value);
    const themeConfig = theme.config;
    for (const chartType in themeConfig) {
        const axes = themeConfig[chartType].axes;
        for (const axis in axes) {
            delete axes[axis].crossLines;
        }
    }
    return theme;
}
exports.getIntegratedChartTheme = getIntegratedChartTheme;
