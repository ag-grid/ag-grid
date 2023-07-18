import { AreaSeries } from '../series/cartesian/areaSeries';
import { BarSeries, ColumnSeries } from '../series/cartesian/barSeries';
import { HistogramSeries } from '../series/cartesian/histogramSeries';
import { LineSeries } from '../series/cartesian/lineSeries';
import { ScatterSeries } from '../series/cartesian/scatterSeries';
import { PieSeries } from '../series/polar/pieSeries';
import { TreemapSeries } from '../series/hierarchy/treemapSeries';
import { registerChartSeriesType } from './chartTypes';
var BUILT_IN_SERIES_FACTORIES = {
    area: AreaSeries,
    bar: BarSeries,
    column: ColumnSeries,
    histogram: HistogramSeries,
    line: LineSeries,
    pie: PieSeries,
    scatter: ScatterSeries,
    treemap: TreemapSeries,
};
var SERIES_FACTORIES = {};
var SERIES_DEFAULTS = {};
var SERIES_THEME_TEMPLATES = {};
var SERIES_PALETTE_FACTORIES = {};
export function registerSeries(seriesType, chartType, cstr, defaults, theme, paletteFactory) {
    SERIES_FACTORIES[seriesType] = cstr;
    SERIES_DEFAULTS[seriesType] = defaults;
    SERIES_THEME_TEMPLATES[seriesType] = theme;
    if (paletteFactory) {
        addSeriesPaletteFactory(seriesType, paletteFactory);
    }
    registerChartSeriesType(seriesType, chartType);
}
export function getSeries(chartType, moduleCtx) {
    var _a;
    var seriesConstructor = (_a = SERIES_FACTORIES[chartType]) !== null && _a !== void 0 ? _a : BUILT_IN_SERIES_FACTORIES[chartType];
    if (seriesConstructor) {
        return new seriesConstructor(moduleCtx);
    }
    throw new Error("AG Charts - unknown series type: " + chartType);
}
export function getSeriesDefaults(chartType) {
    return SERIES_DEFAULTS[chartType];
}
export function getSeriesThemeTemplate(chartType) {
    return SERIES_THEME_TEMPLATES[chartType];
}
export function addSeriesPaletteFactory(seriesType, factory) {
    SERIES_PALETTE_FACTORIES[seriesType] = factory;
}
export function getSeriesPaletteFactory(seriesType) {
    return SERIES_PALETTE_FACTORIES[seriesType];
}
