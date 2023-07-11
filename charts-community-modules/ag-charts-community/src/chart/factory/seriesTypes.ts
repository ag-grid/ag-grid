import type { Series } from '../series/series';
import { AreaSeries } from '../series/cartesian/areaSeries';
import { BarSeries, ColumnSeries } from '../series/cartesian/barSeries';
import { HistogramSeries } from '../series/cartesian/histogramSeries';
import { LineSeries } from '../series/cartesian/lineSeries';
import { ScatterSeries } from '../series/cartesian/scatterSeries';
import { PieSeries } from '../series/polar/pieSeries';
import { TreemapSeries } from '../series/hierarchy/treemapSeries';
import type { ChartType } from './chartTypes';
import { registerChartSeriesType } from './chartTypes';
import type { SeriesConstructor, SeriesPaletteFactory } from '../../util/module';
import type { ModuleContext } from '../../util/moduleContext';

const BUILT_IN_SERIES_FACTORIES: Record<string, SeriesConstructor> = {
    area: AreaSeries,
    bar: BarSeries,
    column: ColumnSeries,
    histogram: HistogramSeries,
    line: LineSeries,
    pie: PieSeries,
    scatter: ScatterSeries,
    treemap: TreemapSeries,
};

const SERIES_FACTORIES: Record<string, SeriesConstructor> = {};
const SERIES_DEFAULTS: Record<string, any> = {};
const SERIES_THEME_TEMPLATES: Record<string, {}> = {};
const SERIES_PALETTE_FACTORIES: Record<string, SeriesPaletteFactory> = {};

export function registerSeries(
    seriesType: string,
    chartType: ChartType,
    cstr: SeriesConstructor,
    defaults: {},
    theme: {},
    paletteFactory: SeriesPaletteFactory | undefined
) {
    SERIES_FACTORIES[seriesType] = cstr;
    SERIES_DEFAULTS[seriesType] = defaults;
    SERIES_THEME_TEMPLATES[seriesType] = theme;
    if (paletteFactory) {
        addSeriesPaletteFactory(seriesType, paletteFactory);
    }

    registerChartSeriesType(seriesType, chartType);
}

export function getSeries(chartType: string, moduleCtx: ModuleContext): Series<any> {
    const seriesConstructor = SERIES_FACTORIES[chartType] ?? BUILT_IN_SERIES_FACTORIES[chartType];
    if (seriesConstructor) {
        return new seriesConstructor(moduleCtx);
    }

    throw new Error(`AG Charts - unknown series type: ${chartType}`);
}

export function getSeriesDefaults(chartType: string): {} {
    return SERIES_DEFAULTS[chartType];
}

export function getSeriesThemeTemplate(chartType: string): {} {
    return SERIES_THEME_TEMPLATES[chartType];
}

export function addSeriesPaletteFactory(seriesType: string, factory: SeriesPaletteFactory) {
    SERIES_PALETTE_FACTORIES[seriesType] = factory;
}

export function getSeriesPaletteFactory(seriesType: string) {
    return SERIES_PALETTE_FACTORIES[seriesType];
}
