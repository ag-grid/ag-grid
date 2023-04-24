import { AgCartesianSeriesOptions, AgPolarSeriesOptions, AgHierarchySeriesOptions } from '../agChartOptions';
export declare type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export declare function groupSeriesByType(seriesOptions: SeriesOptions[]): (AgHierarchySeriesOptions | import("../agChartOptions").AgLineSeriesOptions<any> | import("../agChartOptions").AgScatterSeriesOptions<any> | import("../agChartOptions").AgAreaSeriesOptions<any> | import("../agChartOptions").AgBarSeriesOptions<any> | import("../agChartOptions").AgHistogramSeriesOptions<any> | AgPolarSeriesOptions)[][];
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
export declare function reduceSeries(series: any[]): any;
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export declare function processSeriesOptions(seriesOptions: SeriesOptions[]): (AgHierarchySeriesOptions | import("../agChartOptions").AgLineSeriesOptions<any> | import("../agChartOptions").AgScatterSeriesOptions<any> | import("../agChartOptions").AgAreaSeriesOptions<any> | import("../agChartOptions").AgBarSeriesOptions<any> | import("../agChartOptions").AgHistogramSeriesOptions<any> | AgPolarSeriesOptions)[];
