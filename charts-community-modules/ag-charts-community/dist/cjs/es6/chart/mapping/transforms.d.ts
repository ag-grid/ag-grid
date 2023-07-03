import { AgChartOptions } from '../agChartOptions';
declare type SeriesTypes = NonNullable<AgChartOptions['series']>[number];
export declare function applySeriesTransform<S extends SeriesTypes>(options: S): S;
export {};
