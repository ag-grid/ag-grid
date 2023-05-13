import { AreaSeries } from './cartesian/areaSeries';
import { BarSeries } from './cartesian/barSeries';
import { HistogramSeries } from './cartesian/histogramSeries';
import { LineSeries } from './cartesian/lineSeries';
import { ScatterSeries } from './cartesian/scatterSeries';
import { PieSeries } from './polar/pieSeries';
import { TreemapSeries } from './hierarchy/treemapSeries';
import { CHART_TYPES } from '../chartTypes';
import { ChartTheme } from '../themes/chartTheme';
import { DarkTheme } from '../themes/darkTheme';
import { REGISTERED_MODULES } from '../../module-support';
var builtinSeriesTypes = {
    area: AreaSeries,
    bar: BarSeries,
    column: BarSeries,
    histogram: HistogramSeries,
    line: LineSeries,
    pie: PieSeries,
    scatter: ScatterSeries,
    treemap: TreemapSeries,
};
var extraSeriesFactories = {};
var initialisedSeriesModules = new Map();
export function initialiseSeriesModules() {
    REGISTERED_MODULES.filter(function (m) { return m.type === 'series'; })
        .filter(function (m) { return !initialisedSeriesModules.has(m); })
        .forEach(function (m) { return initialiseSeriesModule(m); });
}
export var seriesDefaults = {};
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
                seriesDefaults[seriesType] = defaultOptions;
            },
            delete: function () {
                delete seriesDefaults[seriesType];
            },
        },
        themes: {
            chartTheme: {
                add: function (fn) {
                    ChartTheme.seriesThemeOverrides[seriesType] = fn;
                },
                delete: function () {
                    delete ChartTheme.seriesThemeOverrides[seriesType];
                },
            },
            darkTheme: {
                add: function (fn) {
                    DarkTheme.seriesDarkThemeOverrides[seriesType] = fn;
                },
                delete: function () {
                    delete DarkTheme.seriesDarkThemeOverrides[seriesType];
                },
            },
        },
    });
    initialisedSeriesModules.set(mod, instance);
    var chartType = mod.chartTypes[0];
    CHART_TYPES.add(seriesType, chartType);
}
export function getSeries(chartType) {
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
