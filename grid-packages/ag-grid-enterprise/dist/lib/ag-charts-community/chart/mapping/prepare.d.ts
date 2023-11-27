import type { AgChartOptions } from '../../options/agChartOptions';
import type { JsonMergeOptions } from '../../util/json';
export declare const noDataCloneMergeOptions: JsonMergeOptions;
export declare function prepareOptions<T extends AgChartOptions>(options: T): T;
