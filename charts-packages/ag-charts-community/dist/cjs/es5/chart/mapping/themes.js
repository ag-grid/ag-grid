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
var lightTheme = new chartTheme_1.ChartTheme();
var darkTheme = new darkTheme_1.DarkTheme();
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
exports.themes = __assign(__assign({}, exports.darkThemes), exports.lightThemes);
function getChartTheme(value) {
    if (value instanceof chartTheme_1.ChartTheme) {
        return value;
    }
    var stockTheme = exports.themes[value];
    if (stockTheme) {
        return stockTheme;
    }
    value = value;
    if (value.baseTheme || value.overrides || value.palette) {
        var baseTheme = getChartTheme(value.baseTheme);
        return new baseTheme.constructor(value);
    }
    return lightTheme;
}
exports.getChartTheme = getChartTheme;
function getIntegratedChartTheme(value) {
    var theme = getChartTheme(value);
    var themeConfig = theme.config;
    for (var chartType in themeConfig) {
        var axes = themeConfig[chartType].axes;
        for (var axis in axes) {
            delete axes[axis].crossLines;
        }
    }
    return theme;
}
exports.getIntegratedChartTheme = getIntegratedChartTheme;
