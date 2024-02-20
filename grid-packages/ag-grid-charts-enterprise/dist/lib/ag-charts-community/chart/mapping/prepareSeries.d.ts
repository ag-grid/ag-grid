import type { AgChartOptions } from '../../options/agChartOptions';
import type { ISeries } from '../series/seriesTypes';
export declare function matchSeriesOptions<S extends ISeries<any>>(series: S[], optSeries: NonNullable<AgChartOptions['series']>, oldOptsSeries?: AgChartOptions['series']): {
    status: "no-overlap";
    oldKeys: IterableIterator<string>;
    newKeys: IterableIterator<string>;
    changes?: undefined;
} | {
    status: "overlap";
    changes: ({
        opts: import("../../options/agChartOptions").AgCartesianSeriesOptions | import("../../options/agChartOptions").AgHierarchySeriesOptions | import("../../options/agChartOptions").AgPolarSeriesOptions;
        idx: number;
        status: "add";
        series?: undefined;
        diff?: undefined;
    } | {
        opts: import("../../options/agChartOptions").AgCartesianSeriesOptions | import("../../options/agChartOptions").AgHierarchySeriesOptions | import("../../options/agChartOptions").AgPolarSeriesOptions;
        series: S;
        diff: any;
        idx: number;
        status: "update";
    } | {
        opts: import("../../options/agChartOptions").AgCartesianSeriesOptions | import("../../options/agChartOptions").AgHierarchySeriesOptions | import("../../options/agChartOptions").AgPolarSeriesOptions;
        series: S;
        idx: number;
        status: "no-op";
        diff?: undefined;
    } | {
        series: S;
        idx: number;
        status: "remove";
        opts?: undefined;
        diff?: undefined;
    })[];
    oldKeys?: undefined;
    newKeys?: undefined;
};
