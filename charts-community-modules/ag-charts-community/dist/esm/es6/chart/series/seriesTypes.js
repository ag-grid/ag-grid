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
const builtinSeriesTypes = {
    area: AreaSeries,
    bar: BarSeries,
    column: BarSeries,
    histogram: HistogramSeries,
    line: LineSeries,
    pie: PieSeries,
    scatter: ScatterSeries,
    treemap: TreemapSeries,
};
const extraSeriesFactories = {};
const initialisedSeriesModules = new Map();
export function initialiseSeriesModules() {
    REGISTERED_MODULES.filter((m) => m.type === 'series')
        .filter((m) => !initialisedSeriesModules.has(m))
        .forEach((m) => initialiseSeriesModule(m));
}
export const seriesDefaults = {};
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
                seriesDefaults[seriesType] = defaultOptions;
            },
            delete() {
                delete seriesDefaults[seriesType];
            },
        },
        themes: {
            chartTheme: {
                add(fn) {
                    ChartTheme.seriesThemeOverrides[seriesType] = fn;
                },
                delete() {
                    delete ChartTheme.seriesThemeOverrides[seriesType];
                },
            },
            darkTheme: {
                add(fn) {
                    DarkTheme.seriesDarkThemeOverrides[seriesType] = fn;
                },
                delete() {
                    delete DarkTheme.seriesDarkThemeOverrides[seriesType];
                },
            },
        },
    });
    initialisedSeriesModules.set(mod, instance);
    const chartType = mod.chartTypes[0];
    CHART_TYPES.add(seriesType, chartType);
}
export function getSeries(chartType) {
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
