import type { AgBaseRadarSeriesOptions } from './radarOptions';
export interface AgRadarLineSeriesOptions<TDatum = any> extends AgBaseRadarSeriesOptions<TDatum> {
    /** Configuration for the Radar Line Series. */
    type: 'radar-line';
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
