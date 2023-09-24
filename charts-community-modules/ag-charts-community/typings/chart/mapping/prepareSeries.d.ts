import type { AgCartesianSeriesOptions, AgPolarSeriesOptions, AgHierarchySeriesOptions, AgChartOptions } from '../agChartOptions';
export declare type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export declare function groupSeriesByType(seriesOptions: SeriesOptions[]): ({
    type: 'group';
    opts: SeriesOptions[];
} | {
    type: 'stack';
    opts: SeriesOptions[];
} | {
    type: "ungrouped";
    opts: SeriesOptions[];
})[];
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export declare function processSeriesOptions(_opts: AgChartOptions, seriesOptions: SeriesOptions[]): SeriesOptions[];
//# sourceMappingURL=prepareSeries.d.ts.map