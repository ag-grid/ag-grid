"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeriesPaletteFactory = exports.addSeriesPaletteFactory = exports.getSeriesThemeTemplate = exports.getSeriesDefaults = exports.getSeries = exports.registerSeries = void 0;
var areaSeries_1 = require("../series/cartesian/areaSeries");
var barSeries_1 = require("../series/cartesian/barSeries");
var histogramSeries_1 = require("../series/cartesian/histogramSeries");
var lineSeries_1 = require("../series/cartesian/lineSeries");
var scatterSeries_1 = require("../series/cartesian/scatterSeries");
var pieSeries_1 = require("../series/polar/pieSeries");
var treemapSeries_1 = require("../series/hierarchy/treemapSeries");
var chartTypes_1 = require("./chartTypes");
var BUILT_IN_SERIES_FACTORIES = {
    area: areaSeries_1.AreaSeries,
    bar: barSeries_1.BarSeries,
    column: barSeries_1.ColumnSeries,
    histogram: histogramSeries_1.HistogramSeries,
    line: lineSeries_1.LineSeries,
    pie: pieSeries_1.PieSeries,
    scatter: scatterSeries_1.ScatterSeries,
    treemap: treemapSeries_1.TreemapSeries,
};
var SERIES_FACTORIES = {};
var SERIES_DEFAULTS = {};
var SERIES_THEME_TEMPLATES = {};
var SERIES_PALETTE_FACTORIES = {};
function registerSeries(seriesType, chartType, cstr, defaults, theme, paletteFactory) {
    SERIES_FACTORIES[seriesType] = cstr;
    SERIES_DEFAULTS[seriesType] = defaults;
    SERIES_THEME_TEMPLATES[seriesType] = theme;
    if (paletteFactory) {
        addSeriesPaletteFactory(seriesType, paletteFactory);
    }
    chartTypes_1.registerChartSeriesType(seriesType, chartType);
}
exports.registerSeries = registerSeries;
function getSeries(chartType, moduleCtx) {
    var _a;
    var seriesConstructor = (_a = SERIES_FACTORIES[chartType]) !== null && _a !== void 0 ? _a : BUILT_IN_SERIES_FACTORIES[chartType];
    if (seriesConstructor) {
        return new seriesConstructor(moduleCtx);
    }
    throw new Error("AG Charts - unknown series type: " + chartType);
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
function addSeriesPaletteFactory(seriesType, factory) {
    SERIES_PALETTE_FACTORIES[seriesType] = factory;
}
exports.addSeriesPaletteFactory = addSeriesPaletteFactory;
function getSeriesPaletteFactory(seriesType) {
    return SERIES_PALETTE_FACTORIES[seriesType];
}
exports.getSeriesPaletteFactory = getSeriesPaletteFactory;
//# sourceMappingURL=seriesTypes.js.map