import { AreaSeries } from '../series/cartesian/areaSeries.mjs';
import { BarSeries, ColumnSeries } from '../series/cartesian/barSeries.mjs';
import { HistogramSeries } from '../series/cartesian/histogramSeries.mjs';
import { LineSeries } from '../series/cartesian/lineSeries.mjs';
import { ScatterSeries } from '../series/cartesian/scatterSeries.mjs';
import { PieSeries } from '../series/polar/pieSeries.mjs';
import { TreemapSeries } from '../series/hierarchy/treemapSeries.mjs';
import { registerChartSeriesType } from './chartTypes.mjs';
const BUILT_IN_SERIES_FACTORIES = {
    area: AreaSeries,
    bar: BarSeries,
    column: ColumnSeries,
    histogram: HistogramSeries,
    line: LineSeries,
    pie: PieSeries,
    scatter: ScatterSeries,
    treemap: TreemapSeries,
};
const SERIES_FACTORIES = {};
const SERIES_DEFAULTS = {};
const SERIES_THEME_TEMPLATES = {};
const SERIES_PALETTE_FACTORIES = {};
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
    const seriesConstructor = (_a = SERIES_FACTORIES[chartType]) !== null && _a !== void 0 ? _a : BUILT_IN_SERIES_FACTORIES[chartType];
    if (seriesConstructor) {
        return new seriesConstructor(moduleCtx);
    }
    throw new Error(`AG Charts - unknown series type: ${chartType}`);
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
