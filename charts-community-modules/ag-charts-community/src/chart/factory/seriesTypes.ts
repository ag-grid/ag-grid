import { Series } from '../series/series';
import { AreaSeries } from '../series/cartesian/areaSeries';
import { BarSeries, ColumnSeries } from '../series/cartesian/barSeries';
import { HistogramSeries } from '../series/cartesian/histogramSeries';
import { LineSeries } from '../series/cartesian/lineSeries';
import { ScatterSeries } from '../series/cartesian/scatterSeries';
import { PieSeries } from '../series/polar/pieSeries';
import { RadarLineSeries } from '../series/polar/radarLineSeries';
import { TreemapSeries } from '../series/hierarchy/treemapSeries';
import { ChartType, registerChartSeriesType } from './chartTypes';
import { ModuleContext, SeriesConstructor } from '../../util/module';

const BUILT_IN_SERIES_FACTORIES: Record<string, SeriesConstructor> = {
    area: AreaSeries,
    bar: BarSeries,
    column: ColumnSeries,
    histogram: HistogramSeries,
    line: LineSeries,
    pie: PieSeries,
    scatter: ScatterSeries,
    treemap: TreemapSeries,
    'radar-line': RadarLineSeries,
};

const SERIES_FACTORIES: Record<string, SeriesConstructor> = {};
const SERIES_DEFAULTS: Record<string, any> = {};
const SERIES_THEME_TEMPLATES: Record<string, {}> = {};

export function registerSeries(
    seriesType: string,
    chartType: ChartType,
    cstr: SeriesConstructor,
    defaults: {},
    theme: {}
) {
    SERIES_FACTORIES[seriesType] = cstr;
    SERIES_DEFAULTS[seriesType] = defaults;
    SERIES_THEME_TEMPLATES[seriesType] = theme;

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
