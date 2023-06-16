import { Series } from '../series/series';
import { ChartType } from './chartTypes';
import { ModuleContext, SeriesConstructor } from '../../util/module';
export declare function registerSeries(seriesType: string, chartType: ChartType, cstr: SeriesConstructor, defaults: {}, theme: {}): void;
export declare function getSeries(chartType: string, moduleCtx: ModuleContext): Series<any>;
export declare function getSeriesDefaults(chartType: string): {};
export declare function getSeriesThemeTemplate(chartType: string): {};
//# sourceMappingURL=seriesTypes.d.ts.map