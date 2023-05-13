"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeries = exports.seriesDefaults = exports.initialiseSeriesModules = void 0;
const areaSeries_1 = require("./cartesian/areaSeries");
const barSeries_1 = require("./cartesian/barSeries");
const histogramSeries_1 = require("./cartesian/histogramSeries");
const lineSeries_1 = require("./cartesian/lineSeries");
const scatterSeries_1 = require("./cartesian/scatterSeries");
const pieSeries_1 = require("./polar/pieSeries");
const treemapSeries_1 = require("./hierarchy/treemapSeries");
const chartTypes_1 = require("../chartTypes");
const chartTheme_1 = require("../themes/chartTheme");
const darkTheme_1 = require("../themes/darkTheme");
const module_support_1 = require("../../module-support");
const builtinSeriesTypes = {
    area: areaSeries_1.AreaSeries,
    bar: barSeries_1.BarSeries,
    column: barSeries_1.BarSeries,
    histogram: histogramSeries_1.HistogramSeries,
    line: lineSeries_1.LineSeries,
    pie: pieSeries_1.PieSeries,
    scatter: scatterSeries_1.ScatterSeries,
    treemap: treemapSeries_1.TreemapSeries,
};
const extraSeriesFactories = {};
const initialisedSeriesModules = new Map();
function initialiseSeriesModules() {
    module_support_1.REGISTERED_MODULES.filter((m) => m.type === 'series')
        .filter((m) => !initialisedSeriesModules.has(m))
        .forEach((m) => initialiseSeriesModule(m));
}
exports.initialiseSeriesModules = initialiseSeriesModules;
exports.seriesDefaults = {};
function initialiseSeriesModule(mod) {
    const seriesType = mod.optionsKey;
    const instance = mod.initialiseModule({
        seriesFactory: {
            add(factory) {
                extraSeriesFactories[seriesType] = factory;
            },
            delete() {
                delete extraSeriesFactories[seriesType];
            },
        },
        defaults: {
            add(defaultOptions) {
                exports.seriesDefaults[seriesType] = defaultOptions;
            },
            delete() {
                delete exports.seriesDefaults[seriesType];
            },
        },
        themes: {
            chartTheme: {
                add(fn) {
                    chartTheme_1.ChartTheme.seriesThemeOverrides[seriesType] = fn;
                },
                delete() {
                    delete chartTheme_1.ChartTheme.seriesThemeOverrides[seriesType];
                },
            },
            darkTheme: {
                add(fn) {
                    darkTheme_1.DarkTheme.seriesDarkThemeOverrides[seriesType] = fn;
                },
                delete() {
                    delete darkTheme_1.DarkTheme.seriesDarkThemeOverrides[seriesType];
                },
            },
        },
    });
    initialisedSeriesModules.set(mod, instance);
    const chartType = mod.chartTypes[0];
    chartTypes_1.CHART_TYPES.add(seriesType, chartType);
}
function getSeries(chartType) {
    if (Object.prototype.hasOwnProperty.call(extraSeriesFactories, chartType)) {
        const factory = extraSeriesFactories[chartType];
        return factory();
    }
    if (Object.prototype.hasOwnProperty.call(builtinSeriesTypes, chartType)) {
        const SeriesConstructor = builtinSeriesTypes[chartType];
        return new SeriesConstructor();
    }
    throw new Error(`AG Charts - unknown series type: ${chartType}`);
}
exports.getSeries = getSeries;
