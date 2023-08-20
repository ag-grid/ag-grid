import type { Series } from '../series/series';
import type { ChartType } from './chartTypes';
import type { SeriesConstructor, SeriesPaletteFactory } from '../../util/module';
import type { ModuleContext } from '../../util/moduleContext';
export declare function registerSeries(seriesType: string, chartType: ChartType, cstr: SeriesConstructor, defaults: {}, theme: {}, paletteFactory: SeriesPaletteFactory | undefined): void;
export declare function getSeries(chartType: string, moduleCtx: ModuleContext): Series<any>;
export declare function getSeriesDefaults(chartType: string): {};
export declare function getSeriesThemeTemplate(chartType: string): {};
export declare function addSeriesPaletteFactory(seriesType: string, factory: SeriesPaletteFactory): void;
export declare function getSeriesPaletteFactory(seriesType: string): SeriesPaletteFactory;
//# sourceMappingURL=seriesTypes.d.ts.map