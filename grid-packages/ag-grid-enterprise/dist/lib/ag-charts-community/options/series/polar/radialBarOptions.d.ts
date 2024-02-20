import type { AgBaseSeriesOptions } from '../seriesOptions';
import type { AgBaseRadialSeriesThemeableOptions, AgRadialSeriesOptionsKeys, AgRadialSeriesOptionsNames } from './radialOptions';
export type AgRadialBarSeriesThemeableOptions<TDatum = any> = AgBaseRadialSeriesThemeableOptions<TDatum>;
export interface AgRadialBarSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgRadialSeriesOptionsKeys, AgRadialSeriesOptionsNames, AgBaseRadialSeriesThemeableOptions<TDatum> {
    /** Configuration for Radial Bar Series. */
    type: 'radial-bar';
    /** The number to normalise the bar stacks to. Has no effect unless series are stacked. */
    normalizedTo?: number;
    /** Whether to group together (adjacently) separate sectors. */
    grouped?: boolean;
    /** An option indicating if the sectors should be stacked. */
    stacked?: boolean;
    /** An ID to be used to group stacked items. */
    stackGroup?: string;
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
