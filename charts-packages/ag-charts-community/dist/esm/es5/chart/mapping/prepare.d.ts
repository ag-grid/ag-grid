import { AgChartOptions, AgHierarchyChartOptions, AgPolarChartOptions, AgCartesianChartOptions } from '../agChartOptions';
import { CartesianChart } from '../cartesianChart';
import { PolarChart } from '../polarChart';
import { HierarchyChart } from '../hierarchyChart';
import { SeriesOptionsTypes } from './defaults';
import { JsonMergeOptions } from '../../util/json';
export declare type ChartType = CartesianChart | PolarChart | HierarchyChart;
export declare type AxesOptionsTypes = NonNullable<AgCartesianChartOptions['axes']>[number];
export declare function optionsType(input: {
    type?: AgChartOptions['type'];
    series?: {
        type?: SeriesOptionsTypes['type'];
    }[];
}): NonNullable<AgChartOptions['type']>;
export declare function isAgCartesianChartOptions(input: AgChartOptions): input is AgCartesianChartOptions;
export declare function isAgHierarchyChartOptions(input: AgChartOptions): input is AgHierarchyChartOptions;
export declare function isAgPolarChartOptions(input: AgChartOptions): input is AgPolarChartOptions;
export declare function isSeriesOptionType(input?: string): input is NonNullable<SeriesOptionsTypes['type']>;
export declare const noDataCloneMergeOptions: JsonMergeOptions;
export declare function prepareOptions<T extends AgChartOptions>(newOptions: T, ...fallbackOptions: T[]): T;
