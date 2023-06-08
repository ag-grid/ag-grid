import { AreaSeries } from '../series/cartesian/areaSeries';
import { BarSeries, ColumnSeries } from '../series/cartesian/barSeries';
import { HistogramSeries } from '../series/cartesian/histogramSeries';
import { LineSeries } from '../series/cartesian/lineSeries';
import { ScatterSeries } from '../series/cartesian/scatterSeries';
import { PieSeries } from '../series/polar/pieSeries';
import { TreemapSeries } from '../series/hierarchy/treemapSeries';
import { registerChartSeriesType } from './chartTypes';
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
export function registerSeries(seriesType, chartType, cstr, defaults, theme) {
    SERIES_FACTORIES[seriesType] = cstr;
    SERIES_DEFAULTS[seriesType] = defaults;
    SERIES_THEME_TEMPLATES[seriesType] = theme;
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
