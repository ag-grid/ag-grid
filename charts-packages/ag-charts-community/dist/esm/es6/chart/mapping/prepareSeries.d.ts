import { AgCartesianSeriesOptions, AgPolarSeriesOptions, AgHierarchySeriesOptions } from '../agChartOptions';
declare type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export declare function groupSeriesByType(seriesOptions: SeriesOptions[]): (import("../agChartOptions").AgBarSeriesOptions | import("../agChartOptions").AgLineSeriesOptions | import("../agChartOptions").AgAreaSeriesOptions | import("../agChartOptions").AgScatterSeriesOptions | import("../agChartOptions").AgHistogramSeriesOptions | import("../agChartOptions").AgPieSeriesOptions | import("../agChartOptions").AgTreemapSeriesOptions)[][];
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
export declare function reduceSeries(series: any[], enableBarSeriesSpecialCases: boolean): any;
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export declare function processSeriesOptions(seriesOptions: SeriesOptions[]): (import("../agChartOptions").AgBarSeriesOptions | import("../agChartOptions").AgLineSeriesOptions | import("../agChartOptions").AgAreaSeriesOptions | import("../agChartOptions").AgScatterSeriesOptions | import("../agChartOptions").AgHistogramSeriesOptions | import("../agChartOptions").AgPieSeriesOptions | import("../agChartOptions").AgTreemapSeriesOptions)[];
export {};
