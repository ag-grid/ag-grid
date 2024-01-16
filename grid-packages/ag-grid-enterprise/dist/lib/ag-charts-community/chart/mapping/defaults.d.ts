import type { AgChartOptions } from '../../options/agChartOptions';
import type { DeepPartial } from '../../util/types';
export declare const DEFAULT_CARTESIAN_CHART_OVERRIDES: {
    axes: ({
        type: "number";
        position: "left";
    } | {
        type: "category";
        position: "bottom";
    })[];
};
export declare function swapAxes<T extends AgChartOptions>(opts: T): T;
export declare function resolveModuleConflicts<T extends AgChartOptions>(opts: T): DeepPartial<T>;
