import { AgCartesianChartOptions, AgChartOptions, AgPolarChartOptions, AgHierarchyChartOptions } from "../agChartOptions";
export declare type SeriesOptionsTypes = NonNullable<AgChartOptions['series']>[number];
export declare const DEFAULT_CARTESIAN_CHART_OPTIONS: AgCartesianChartOptions;
export declare const DEFAULT_BAR_CHART_OVERRIDES: AgCartesianChartOptions;
export declare const DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES: AgCartesianChartOptions;
export declare const DEFAULT_POLAR_CHART_OPTIONS: AgPolarChartOptions;
export declare const DEFAULT_HIERARCHY_CHART_OPTIONS: AgHierarchyChartOptions;
export declare const DEFAULT_SERIES_OPTIONS: {
    [K in NonNullable<SeriesOptionsTypes['type']>]: SeriesOptionsTypes & {
        type?: K;
    };
};
export declare type AxesOptionsTypes = NonNullable<AgCartesianChartOptions['axes']>[number];
export declare const DEFAULT_AXES_OPTIONS: {
    [K in NonNullable<AxesOptionsTypes['type']>]: AxesOptionsTypes & {
        type?: K;
    };
};
