"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeries = exports.seriesDefaults = exports.initialiseSeriesModules = void 0;
var areaSeries_1 = require("./cartesian/areaSeries");
var barSeries_1 = require("./cartesian/barSeries");
var histogramSeries_1 = require("./cartesian/histogramSeries");
var lineSeries_1 = require("./cartesian/lineSeries");
var scatterSeries_1 = require("./cartesian/scatterSeries");
var pieSeries_1 = require("./polar/pieSeries");
var treemapSeries_1 = require("./hierarchy/treemapSeries");
var chartTypes_1 = require("../chartTypes");
var chartTheme_1 = require("../themes/chartTheme");
var darkTheme_1 = require("../themes/darkTheme");
var module_support_1 = require("../../module-support");
var builtinSeriesTypes = {
    area: areaSeries_1.AreaSeries,
    bar: barSeries_1.BarSeries,
    column: barSeries_1.BarSeries,
    histogram: histogramSeries_1.HistogramSeries,
    line: lineSeries_1.LineSeries,
    pie: pieSeries_1.PieSeries,
    scatter: scatterSeries_1.ScatterSeries,
    treemap: treemapSeries_1.TreemapSeries,
};
var extraSeriesFactories = {};
var initialisedSeriesModules = new Map();
function initialiseSeriesModules() {
    module_support_1.REGISTERED_MODULES.filter(function (m) { return m.type === 'series'; })
        .filter(function (m) { return !initialisedSeriesModules.has(m); })
        .forEach(function (m) { return initialiseSeriesModule(m); });
}
exports.initialiseSeriesModules = initialiseSeriesModules;
exports.seriesDefaults = {};
function initialiseSeriesModule(mod) {
    var seriesType = mod.optionsKey;
    var instance = mod.initialiseModule({
        seriesFactory: {
            add: function (factory) {
                extraSeriesFactories[seriesType] = factory;
            },
            delete: function () {
                delete extraSeriesFactories[seriesType];
            },
        },
        defaults: {
            add: function (defaultOptions) {
                exports.seriesDefaults[seriesType] = defaultOptions;
            },
            delete: function () {
                delete exports.seriesDefaults[seriesType];
            },
        },
        themes: {
            chartTheme: {
                add: function (fn) {
                    chartTheme_1.ChartTheme.seriesThemeOverrides[seriesType] = fn;
                },
                delete: function () {
                    delete chartTheme_1.ChartTheme.seriesThemeOverrides[seriesType];
                },
            },
            darkTheme: {
                add: function (fn) {
                    darkTheme_1.DarkTheme.seriesDarkThemeOverrides[seriesType] = fn;
                },
                delete: function () {
                    delete darkTheme_1.DarkTheme.seriesDarkThemeOverrides[seriesType];
                },
            },
        },
    });
    initialisedSeriesModules.set(mod, instance);
    var chartType = mod.chartTypes[0];
    chartTypes_1.CHART_TYPES.add(seriesType, chartType);
}
function getSeries(chartType) {
    if (Object.prototype.hasOwnProperty.call(extraSeriesFactories, chartType)) {
        var factory = extraSeriesFactories[chartType];
        return factory();
    }
    if (Object.prototype.hasOwnProperty.call(builtinSeriesTypes, chartType)) {
        var SeriesConstructor = builtinSeriesTypes[chartType];
        return new SeriesConstructor();
    }
    throw new Error("AG Charts - unknown series type: " + chartType);
}
exports.getSeries = getSeries;
//# sourceMappingURL=seriesTypes.js.map