import type { AgChartOptions, AgHierarchyChartOptions, AgPolarChartOptions, AgCartesianChartOptions } from '../agChartOptions';
import type { SeriesOptionsTypes } from './defaults';
import type { JsonMergeOptions } from '../../util/json';
export declare function optionsType(input: {
    type?: AgChartOptions['type'];
    series?: {
        type?: SeriesOptionsTypes['type'];
    }[];
}): NonNullable<AgChartOptions['type']>;
export declare function isAgCartesianChartOptions(input: AgChartOptions): input is AgCartesianChartOptions;
export declare function isAgHierarchyChartOptions(input: AgChartOptions): input is AgHierarchyChartOptions;
export declare function isAgPolarChartOptions(input: AgChartOptions): input is AgPolarChartOptions;
export declare const noDataCloneMergeOptions: JsonMergeOptions;
export declare function prepareOptions<T extends AgChartOptions>(newOptions: T, fallbackOptions?: T): T;
//# sourceMappingURL=prepare.d.ts.map