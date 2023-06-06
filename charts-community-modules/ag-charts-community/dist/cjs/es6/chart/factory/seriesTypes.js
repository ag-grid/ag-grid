"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeriesThemeTemplate = exports.getSeriesDefaults = exports.getSeries = exports.registerSeries = void 0;
const areaSeries_1 = require("../series/cartesian/areaSeries");
const barSeries_1 = require("../series/cartesian/barSeries");
const histogramSeries_1 = require("../series/cartesian/histogramSeries");
const lineSeries_1 = require("../series/cartesian/lineSeries");
const scatterSeries_1 = require("../series/cartesian/scatterSeries");
const pieSeries_1 = require("../series/polar/pieSeries");
const treemapSeries_1 = require("../series/hierarchy/treemapSeries");
const chartTypes_1 = require("./chartTypes");
const BUILT_IN_SERIES_FACTORIES = {
    area: areaSeries_1.AreaSeries,
    bar: barSeries_1.BarSeries,
    column: barSeries_1.ColumnSeries,
    histogram: histogramSeries_1.HistogramSeries,
    line: lineSeries_1.LineSeries,
    pie: pieSeries_1.PieSeries,
    scatter: scatterSeries_1.ScatterSeries,
    treemap: treemapSeries_1.TreemapSeries,
};
const SERIES_FACTORIES = {};
const SERIES_DEFAULTS = {};
const SERIES_THEME_TEMPLATES = {};
function registerSeries(seriesType, chartType, cstr, defaults, theme) {
    SERIES_FACTORIES[seriesType] = cstr;
    SERIES_DEFAULTS[seriesType] = defaults;
    SERIES_THEME_TEMPLATES[seriesType] = theme;
    chartTypes_1.registerChartSeriesType(seriesType, chartType);
}
exports.registerSeries = registerSeries;
function getSeries(chartType, moduleCtx) {
    var _a;
    const seriesConstructor = (_a = SERIES_FACTORIES[chartType]) !== null && _a !== void 0 ? _a : BUILT_IN_SERIES_FACTORIES[chartType];
    if (seriesConstructor) {
        return new seriesConstructor(moduleCtx);
    }
    throw new Error(`AG Charts - unknown series type: ${chartType}`);
}
exports.getSeries = getSeries;
function getSeriesDefaults(chartType) {
    return SERIES_DEFAULTS[chartType];
}
exports.getSeriesDefaults = getSeriesDefaults;
function getSeriesThemeTemplate(chartType) {
    return SERIES_THEME_TEMPLATES[chartType];
}
exports.getSeriesThemeTemplate = getSeriesThemeTemplate;
