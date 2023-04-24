"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themes = exports.ChartTheme = exports.getChartTheme = void 0;
const themes_1 = require("./chart/mapping/themes");
var themes_2 = require("./chart/mapping/themes");
Object.defineProperty(exports, "getChartTheme", { enumerable: true, get: function () { return themes_2.getChartTheme; } });
var chartTheme_1 = require("./chart/themes/chartTheme");
Object.defineProperty(exports, "ChartTheme", { enumerable: true, get: function () { return chartTheme_1.ChartTheme; } });
exports.themes = Object.entries(themes_1.themes).reduce((obj, [name, factory]) => {
    obj[name] = factory();
    return obj;
}, {});
